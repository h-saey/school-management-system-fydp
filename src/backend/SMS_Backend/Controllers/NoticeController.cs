using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SMS_Backend.Data;
using SMS_Backend.Models;
using System.Security.Claims;

namespace SMS_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NoticeController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public NoticeController(ApplicationDbContext context)
        {
            _context = context;
        }

        private int GetCurrentUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        private string GetCurrentUserRole() =>
            User.FindFirstValue(ClaimTypes.Role)!;

        // GET: api/notice — All active notices (role-filtered)
        [HttpGet]
        public async Task<IActionResult> GetNotices([FromQuery] NoticeAudience? audience)
        {
            var role = GetCurrentUserRole();

            var query = _context.Notices
                .Include(n => n.PostedBy)
                .Where(n => n.IsActive)
                .AsQueryable();

            // Students only see notices relevant to them
            if (role == "Student")
            {
                query = query.Where(n =>
                    n.Audience == NoticeAudience.SchoolWide ||
                    n.Audience == NoticeAudience.StudentsOnly ||
                    n.Audience == NoticeAudience.ClassSpecific);
            }

            // Parents only see notices relevant to them
            if (role == "Parent")
            {
                query = query.Where(n =>
                    n.Audience == NoticeAudience.SchoolWide ||
                    n.Audience == NoticeAudience.ParentsOnly);
            }

            // Filter additionally by audience if requested (Admin/Teacher use)
            if (audience.HasValue) query = query.Where(n => n.Audience == audience.Value);

            var result = await query
                .OrderByDescending(n => n.PostedAt)
                .Select(n => new
                {
                    noticeId = n.NoticeId,
                    title = n.Title,
                    content = n.Content,
                    type = n.Type,
                    priority = n.Priority,
                    audience = n.Audience,
                    targetClass = n.TargetClass,
                    postedAt = n.PostedAt,
                    isActive = n.IsActive,
                    PostedBy = new { n.PostedBy.Username, n.PostedBy.Role }
                })
                .ToListAsync();

            return Ok(result);
        }

        // GET: api/notice/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetNotice(int id)
        {
            var notice = await _context.Notices
                .Include(n => n.PostedBy)
                .FirstOrDefaultAsync(n => n.NoticeId == id);

            if (notice == null)
                return NotFound(new { message = "Notice not found." });

            return Ok(new
            {
                notice.NoticeId,
                notice.Title,
                notice.Content,
                notice.Audience,
                notice.TargetClass,
                notice.PostedAt,
                notice.IsActive,
                PostedBy = new { notice.PostedBy.Username, notice.PostedBy.Role }
            });
        }

        // POST: api/notice — Teacher or Admin posts a notice
        [HttpPost]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> PostNotice([FromBody] PostNoticeDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (string.IsNullOrWhiteSpace(dto.Title) || string.IsNullOrWhiteSpace(dto.Content))
                return BadRequest(new { message = "Title and content are required." });

            if (dto.Audience == NoticeAudience.ClassSpecific && string.IsNullOrWhiteSpace(dto.TargetClass))
                return BadRequest(new { message = "TargetClass is required for ClassSpecific notices." });

            var currentUserId = GetCurrentUserId();

            var notice = new Notice
            {
                PostedByUserId = currentUserId,
                Title          = dto.Title,
                Content        = dto.Content,
                Type = dto.Type,          
                Priority = dto.Priority,
                Audience       = dto.Audience,
                TargetClass    = dto.TargetClass,
                PostedAt       = DateTime.UtcNow,
                IsActive       = true
            };

            _context.Notices.Add(notice);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetNotice), new { id = notice.NoticeId },
                new { message = "Notice posted successfully.", notice.NoticeId });
        }

        // PUT: api/notice/{id} — Edit notice (only poster or Admin)
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> UpdateNotice(int id, [FromBody] UpdateNoticeDto dto)
        {
            var notice = await _context.Notices.FindAsync(id);
            if (notice == null)
                return NotFound(new { message = "Notice not found." });

            var currentUserId = GetCurrentUserId();
            var role = GetCurrentUserRole();

            // Teachers can only edit their own notices
            if (role == "Teacher" && notice.PostedByUserId != currentUserId)
                return Forbid();

            if (!string.IsNullOrWhiteSpace(dto.Title))   notice.Title       = dto.Title;
            if (!string.IsNullOrWhiteSpace(dto.Content)) notice.Content     = dto.Content;
            if (dto.Audience.HasValue)                   notice.Audience    = dto.Audience.Value;
            if (dto.TargetClass != null)                 notice.TargetClass = dto.TargetClass;
            notice.Type = dto.Type;
            notice.Priority = dto.Priority;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Notice updated successfully." });
        }

        // PATCH: api/notice/{id}/deactivate — Soft-delete / archive a notice
        [HttpPatch("{id}/deactivate")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> DeactivateNotice(int id)
        {
            var notice = await _context.Notices.FindAsync(id);
            if (notice == null)
                return NotFound(new { message = "Notice not found." });

            var currentUserId = GetCurrentUserId();
            var role = GetCurrentUserRole();

            if (role == "Teacher" && notice.PostedByUserId != currentUserId)
                return Forbid();

            notice.IsActive = false;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Notice deactivated." });
        }

        // DELETE: api/notice/{id} — Hard delete (Admin only)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteNotice(int id)
        {
            var notice = await _context.Notices.FindAsync(id);
            if (notice == null)
                return NotFound(new { message = "Notice not found." });

            _context.Notices.Remove(notice);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Notice deleted permanently." });
        }

        // GET: api/notice/my-class — Student sees notices for their class
        [HttpGet("my-class")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetMyClassNotices()
        {
            var currentUserId = GetCurrentUserId();
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == currentUserId);
            if (student == null)
                return NotFound(new { message = "Student profile not found." });

            var notices = await _context.Notices
                .Where(n => n.IsActive &&
                            (n.Audience == NoticeAudience.SchoolWide ||
                             n.Audience == NoticeAudience.StudentsOnly ||
                             (n.Audience == NoticeAudience.ClassSpecific && n.TargetClass == student.Class)))
                .OrderByDescending(n => n.PostedAt)
                .Select(n => new { n.NoticeId, n.Title, n.Content, n.Audience, n.PostedAt })
                .ToListAsync();

            return Ok(notices);
        }
    }

    public class PostNoticeDto
    {
        public string Title { get; set; } = string.Empty;

        public string Content { get; set; } = string.Empty;

        public NoticeType Type { get; set; }

        public NoticePriority Priority { get; set; }

        public NoticeAudience Audience { get; set; }

        public string? TargetClass { get; set; }
    }

    public class UpdateNoticeDto
    {
        public string? Title { get; set; }
        public string? Content { get; set; }
        public NoticeAudience? Audience { get; set; }
        public NoticeType Type { get; set; }
        public NoticePriority Priority { get; set; }
        public string? TargetClass { get; set; }
    }
}
