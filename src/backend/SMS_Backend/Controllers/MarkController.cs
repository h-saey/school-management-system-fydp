using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SMS_Backend.Data;
using SMS_Backend.Models;
using System.Security.Claims;
using System.ComponentModel.DataAnnotations;

namespace SMS_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MarkController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MarkController(ApplicationDbContext context)
        {
            _context = context;
        }

        private int GetCurrentUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        private string GetCurrentUserRole() =>
            User.FindFirstValue(ClaimTypes.Role)!;

        // GET: api/marks
        [HttpGet]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> GetAllMarks([FromQuery] int? studentId, [FromQuery] string? subject)
        {
            var query = _context.Marks
                .Include(m => m.Student)
                .Include(m => m.Teacher)
                .AsQueryable();

            if (studentId.HasValue)              query = query.Where(m => m.StudentId == studentId.Value);
            if (!string.IsNullOrEmpty(subject))  query = query.Where(m => m.Subject == subject);

            var result = await query.Select(m => new
            {
                m.MarksId,
                m.Subject,
                m.Exam,
                m.MarksObtained,
                m.TotalMarks,
                m.Percentage,
                Student = new { m.Student.FirstName, m.Student.LastName, m.Student.RollNumber },
                EnteredBy = new { m.Teacher.FirstName, m.Teacher.LastName }
            }).ToListAsync();

            return Ok(result);
        }

        // GET: api/mark/my — Student views own marks
        [HttpGet("my")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetMyMarks([FromQuery] string? subject)
        {
            var currentUserId = GetCurrentUserId();
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == currentUserId);
            if (student == null)
                return NotFound(new { message = "Student profile not found." });

            var query = _context.Marks.Where(m => m.StudentId == student.StudentId);
            if (!string.IsNullOrEmpty(subject)) query = query.Where(m => m.Subject == subject);

            var result = await query
                .Select(m => new { m.MarksId, m.Subject, m.Exam, m.MarksObtained, m.TotalMarks, m.Percentage })
                .ToListAsync();

            return Ok(result);
        }

        // GET: api/marks/student/{studentId} — Parent views linked student marks
        [HttpGet("student/{studentId}")]
        [Authorize(Roles = "Admin,Teacher,Parent")]
        public async Task<IActionResult> GetStudentMarks(int studentId)
        {
            var role = GetCurrentUserRole();
            if (role == "Parent")
            {
                var currentUserId = GetCurrentUserId();
                var isLinked = await _context.Parents
                    .AnyAsync(p => p.UserId == currentUserId && p.StudentId == studentId);
                if (!isLinked) return Forbid();
            }

            var marks = await _context.Marks
                .Where(m => m.StudentId == studentId)
                .Select(m => new { m.MarksId, m.Subject, m.Exam, m.MarksObtained, m.TotalMarks, m.Percentage })
                .ToListAsync();

            return Ok(marks);
        }

        // POST: api/marks — Teacher enters marks
        [HttpPost]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> AddMarks([FromBody] AddMarksDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto.MarksObtained > dto.TotalMarks)
                return BadRequest(new { message = "Marks obtained cannot exceed total marks." });

            var studentExists = await _context.Students.AnyAsync(s => s.StudentId == dto.StudentId);
            if (!studentExists)
                return BadRequest(new { message = "Student not found." });

            var duplicate = await _context.Marks.AnyAsync(m =>m.StudentId == dto.StudentId && m.Subject == dto.Subject && m.Exam == dto.Exam);

            if (duplicate)
                return Conflict(new { message = "Marks already entered for this subject and exam." });


            var currentUserId = GetCurrentUserId();
            var teacher = await _context.Teachers.FirstOrDefaultAsync(t => t.UserId == currentUserId);

            var mark = new Mark
            {
                StudentId      = dto.StudentId,
                TeacherId      = teacher?.TeacherId ?? dto.TeacherId,
                Subject        = dto.Subject,
                Exam           = dto.Exam,
                MarksObtained  = dto.MarksObtained,
                TotalMarks     = dto.TotalMarks
            };

            _context.Marks.Add(mark);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAllMarks), new { },
                new { message = "Marks added successfully.", mark.MarksId });
        }

        // PUT: api/marks/{id} — Update marks
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> UpdateMarks(int id, [FromBody] UpdateMarksDto dto)
        {
            var mark = await _context.Marks.FindAsync(id);
            if (mark == null)
                return NotFound(new { message = "Mark record not found." });


            // if (dto.TotalMarks.HasValue) mark.TotalMarks = dto.TotalMarks.Value;
            if (dto.TotalMarks.HasValue)
            {
                if (dto.TotalMarks.Value <= 0)
                    return BadRequest(new { message = "Total marks must be greater than zero." });

                mark.TotalMarks = dto.TotalMarks.Value;
            }

            if (dto.MarksObtained > mark.TotalMarks)
                return BadRequest(new { message = "Marks obtained cannot exceed total marks." });

            mark.MarksObtained = dto.MarksObtained;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Marks updated successfully." });
        }

        // DELETE: api/marks/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteMarks(int id)
        {
            var mark = await _context.Marks.FindAsync(id);
            if (mark == null)
                return NotFound(new { message = "Mark record not found." });

            _context.Marks.Remove(mark);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Mark record deleted." });
        }
    }

    public class AddMarksDto
    {
        [Required]
        public int StudentId { get; set; }
        public int TeacherId { get; set; }

        [Required]
        public string Subject { get; set; } = string.Empty;

        [Required]
        public string Exam { get; set; } = string.Empty;

        [Range(0, double.MaxValue)]
        public decimal MarksObtained { get; set; }

        [Range(1, double.MaxValue)]
        public decimal TotalMarks { get; set; }
    }

    public class UpdateMarksDto
    {
        public decimal MarksObtained { get; set; }
        public decimal? TotalMarks { get; set; }
    }
}
