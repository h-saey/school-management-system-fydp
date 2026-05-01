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
    public class BehaviorRemarkController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BehaviorRemarkController(ApplicationDbContext context)
        {
            _context = context;
        }

        private int GetCurrentUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        private string GetCurrentUserRole() =>
            User.FindFirstValue(ClaimTypes.Role)!;

        // GET: api/behaviorremark
        [HttpGet]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> GetAllRemarks([FromQuery] int? studentId, [FromQuery] string? type)
        {
            var query = _context.BehaviorRemarks
                .Include(r => r.Student)
                .Include(r => r.Teacher)
                .AsQueryable();

            if (studentId.HasValue)             query = query.Where(r => r.StudentId == studentId.Value);
            if (!string.IsNullOrEmpty(type))    query = query.Where(r => r.RemarkType == type);

            var result = await query
                .OrderByDescending(r => r.Date)
                .Select(r => new
                {
                    r.RemarkId,
                    r.RemarkType,
                    r.RemarkText,
                    r.Date,
                    Student = new { r.Student.FirstName, r.Student.LastName },
                    AddedBy = new { r.Teacher.FirstName, r.Teacher.LastName }
                }).ToListAsync();

            return Ok(result);
        }

        // GET: api/behaviorremark/my — Student views own remarks
        [HttpGet("my")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetMyRemarks()
        {
            var currentUserId = GetCurrentUserId();
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == currentUserId);
            if (student == null)
                return NotFound(new { message = "Student profile not found." });

            var remarks = await _context.BehaviorRemarks
                .Where(r => r.StudentId == student.StudentId)
                .OrderByDescending(r => r.Date)
                .Select(r => new { r.RemarkId, r.RemarkType, r.RemarkText, r.Date })
                .ToListAsync();

            return Ok(remarks);
        }

        // GET: api/behaviorremark/student/{studentId} — Parent views linked student
        [HttpGet("student/{studentId}")]
        [Authorize(Roles = "Admin,Teacher,Parent")]
        public async Task<IActionResult> GetStudentRemarks(int studentId)
        {
            var role = GetCurrentUserRole();
            if (role == "Parent")
            {
                var currentUserId = GetCurrentUserId();
                var isLinked = await _context.Parents
                    .AnyAsync(p => p.UserId == currentUserId && p.StudentId == studentId);
                if (!isLinked) return Forbid();
            }

            var remarks = await _context.BehaviorRemarks
                .Where(r => r.StudentId == studentId)
                .OrderByDescending(r => r.Date)
                .Select(r => new { r.RemarkId, r.RemarkType, r.RemarkText, r.Date })
                .ToListAsync();

            return Ok(remarks);
        }

        // POST: api/behaviorremark — Teacher adds remark
        [HttpPost]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> AddRemark([FromBody] AddRemarkDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var validTypes = new[] { "Positive", "Negative", "Neutral" };
            if (!validTypes.Contains(dto.RemarkType))
                return BadRequest(new { message = "RemarkType must be Positive, Negative, or Neutral." });

            var studentExists = await _context.Students.AnyAsync(s => s.StudentId == dto.StudentId);
            if (!studentExists)
                return BadRequest(new { message = "Student not found." });

            var currentUserId = GetCurrentUserId();
            var teacher = await _context.Teachers.FirstOrDefaultAsync(t => t.UserId == currentUserId);

            var remark = new BehaviorRemark
            {
                StudentId  = dto.StudentId,
                TeacherId  = teacher?.TeacherId ?? dto.TeacherId,
                RemarkType = dto.RemarkType,
                RemarkText = dto.RemarkText,
                Date       = DateTime.UtcNow
            };

            _context.BehaviorRemarks.Add(remark);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAllRemarks), new { },
                new { message = "Behavior remark added.", remark.RemarkId });
        }

        // PUT: api/behaviorremark/{id} — Teacher updates own remark
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> UpdateRemark(int id, [FromBody] UpdateRemarkDto dto)
        {
            var remark = await _context.BehaviorRemarks.FindAsync(id);
            if (remark == null)
                return NotFound(new { message = "Remark not found." });

            if (!string.IsNullOrWhiteSpace(dto.RemarkText)) remark.RemarkText = dto.RemarkText;
            if (!string.IsNullOrWhiteSpace(dto.RemarkType)) remark.RemarkType = dto.RemarkType;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Remark updated." });
        }

        // DELETE: api/behaviorremark/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteRemark(int id)
        {
            var remark = await _context.BehaviorRemarks.FindAsync(id);
            if (remark == null)
                return NotFound(new { message = "Remark not found." });

            _context.BehaviorRemarks.Remove(remark);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Remark deleted." });
        }
    }

    public class AddRemarkDto
    {
        public int StudentId { get; set; }
        public int TeacherId { get; set; }
        public string RemarkType { get; set; } = string.Empty;
        public string RemarkText { get; set; } = string.Empty;
    }

    public class UpdateRemarkDto
    {
        public string? RemarkType { get; set; }
        public string? RemarkText { get; set; }
    }
}
