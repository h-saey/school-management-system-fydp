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
    public class AchievementController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AchievementController(ApplicationDbContext context)
        {
            _context = context;
        }

        private int GetCurrentUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        private string GetCurrentUserRole() =>
            User.FindFirstValue(ClaimTypes.Role)!;

        // GET: api/achievement
        [HttpGet]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> GetAllAchievements([FromQuery] int? studentId, [FromQuery] string? category)
        {
            var query = _context.Achievements.Include(a => a.Student).AsQueryable();
            if (studentId.HasValue)              query = query.Where(a => a.StudentId == studentId.Value);
            if (!string.IsNullOrEmpty(category)) query = query.Where(a => a.Category == category);

            var result = await query
                .OrderByDescending(a => a.Date)
                .Select(a => new
                {
                    a.AchievementId,
                    a.Title,
                    a.Category,
                    a.Date,
                    a.FilePath,
                    Student = new { a.Student.FirstName, a.Student.LastName, a.Student.RollNumber }
                })
                .ToListAsync();

            return Ok(result);
        }

        // GET: api/achievement/my — Student views own achievements
        [HttpGet("my")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetMyAchievements()
        {
            var currentUserId = GetCurrentUserId();
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == currentUserId);
            if (student == null)
                return NotFound(new { message = "Student profile not found." });

            var result = await _context.Achievements
                .Where(a => a.StudentId == student.StudentId)
                .OrderByDescending(a => a.Date)
                .Select(a => new { a.AchievementId, a.Title, a.Category, a.Date, a.FilePath })
                .ToListAsync();

            return Ok(result);
        }

        // GET: api/achievement/student/{studentId} — Parent views linked student
        [HttpGet("student/{studentId}")]
        [Authorize(Roles = "Admin,Teacher,Parent")]
        public async Task<IActionResult> GetStudentAchievements(int studentId)
        {
            var role = GetCurrentUserRole();
            if (role == "Parent")
            {
                var currentUserId = GetCurrentUserId();
                var isLinked = await _context.Parents
                    .AnyAsync(p => p.UserId == currentUserId && p.StudentId == studentId);
                if (!isLinked) return Forbid();
            }

            var result = await _context.Achievements
                .Where(a => a.StudentId == studentId)
                .OrderByDescending(a => a.Date)
                .Select(a => new { a.AchievementId, a.Title, a.Category, a.Date, a.FilePath })
                .ToListAsync();

            return Ok(result);
        }

        // GET: api/achievement/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetAchievement(int id)
        {
            var achievement = await _context.Achievements.Include(a => a.Student).FirstOrDefaultAsync(a => a.AchievementId == id);
            if (achievement == null)
                return NotFound(new { message = "Achievement not found." });

            return Ok(achievement);
        }

        // POST: api/achievement — Teacher adds achievement
        [HttpPost]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> AddAchievement([FromBody] AddAchievementDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var studentExists = await _context.Students.AnyAsync(s => s.StudentId == dto.StudentId);
            if (!studentExists)
                return BadRequest(new { message = "Student not found." });

            var achievement = new Achievement
            {
                StudentId = dto.StudentId,
                Title     = dto.Title,
                Category  = dto.Category,
                Date      = dto.Date,
                FilePath  = dto.FilePath
            };

            _context.Achievements.Add(achievement);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAchievement), new { id = achievement.AchievementId },
                new { message = "Achievement added.", achievement.AchievementId });
        }

        // PUT: api/achievement/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> UpdateAchievement(int id, [FromBody] UpdateAchievementDto dto)
        {
            var achievement = await _context.Achievements.FindAsync(id);
            if (achievement == null)
                return NotFound(new { message = "Achievement not found." });

            if (!string.IsNullOrWhiteSpace(dto.Title))    achievement.Title    = dto.Title;
            if (!string.IsNullOrWhiteSpace(dto.Category)) achievement.Category = dto.Category;
            if (dto.Date.HasValue)                        achievement.Date     = dto.Date.Value;
            if (dto.FilePath != null)                     achievement.FilePath = dto.FilePath;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Achievement updated." });
        }

        // DELETE: api/achievement/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> DeleteAchievement(int id)
        {
            var achievement = await _context.Achievements.FindAsync(id);
            if (achievement == null)
                return NotFound(new { message = "Achievement not found." });

            _context.Achievements.Remove(achievement);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Achievement deleted." });
        }
    }

    public class AddAchievementDto
    {
        public int StudentId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public string? FilePath { get; set; }
    }

    public class UpdateAchievementDto
    {
        public string? Title { get; set; }
        public string? Category { get; set; }
        public DateTime? Date { get; set; }
        public string? FilePath { get; set; }
    }
}
