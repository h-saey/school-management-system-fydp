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
    public class TeacherController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TeacherController(ApplicationDbContext context)
        {
            _context = context;
        }

        private int GetCurrentUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // GET: api/teacher
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllTeachers()
        {
            var teachers = await _context.Teachers
                .Include(t => t.User)
                .Select(t => new
                {
                    t.TeacherId,
                    t.FirstName,
                    t.LastName,
                    t.AssignedSubjects,
                    t.User.Email,
                    t.User.IsActive
                })
                .ToListAsync();

            return Ok(teachers);
        }

        // GET: api/teacher/{id}
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> GetTeacher(int id)
        {
            var teacher = await _context.Teachers
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.TeacherId == id);

            if (teacher == null)
                return NotFound(new { message = "Teacher not found." });

            var currentUserId = GetCurrentUserId();
            var role = User.FindFirstValue(ClaimTypes.Role);

            // Teacher can only view their own profile
            if (role == "Teacher" && teacher.UserId != currentUserId)
                return Forbid();

            return Ok(new
            {
                teacher.TeacherId,
                teacher.FirstName,
                teacher.LastName,
                teacher.AssignedSubjects,
                teacher.User.Email,
                teacher.User.IsActive
            });
        }

        // POST: api/teacher
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateTeacher([FromBody] CreateTeacherDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userExists = await _context.Users.AnyAsync(u => u.UserId == dto.UserId && u.Role == UserRole.Teacher);
            if (!userExists)
                return BadRequest(new { message = "Linked user not found or is not a Teacher role." });

            var alreadyExists = await _context.Teachers.AnyAsync(t => t.UserId == dto.UserId);
            if (alreadyExists)
                return Conflict(new { message = "A teacher profile already exists for this user." });

            var teacher = new Teacher
            {
                UserId           = dto.UserId,
                FirstName        = dto.FirstName,
                LastName         = dto.LastName,
                AssignedSubjects = dto.AssignedSubjects
            };

            _context.Teachers.Add(teacher);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTeacher), new { id = teacher.TeacherId },
                new { message = "Teacher created successfully.", teacher.TeacherId });
        }

        // PUT: api/teacher/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateTeacher(int id, [FromBody] UpdateTeacherDto dto)
        {
            var teacher = await _context.Teachers.FindAsync(id);
            if (teacher == null)
                return NotFound(new { message = "Teacher not found." });

            if (!string.IsNullOrWhiteSpace(dto.FirstName))        teacher.FirstName        = dto.FirstName;
            if (!string.IsNullOrWhiteSpace(dto.LastName))         teacher.LastName         = dto.LastName;
            if (!string.IsNullOrWhiteSpace(dto.AssignedSubjects)) teacher.AssignedSubjects = dto.AssignedSubjects;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Teacher updated successfully." });
        }

        // DELETE: api/teacher/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteTeacher(int id)
        {
            var teacher = await _context.Teachers.FindAsync(id);
            if (teacher == null)
                return NotFound(new { message = "Teacher not found." });

            _context.Teachers.Remove(teacher);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Teacher deleted successfully." });
        }
    }

    public class CreateTeacherDto
    {
        public int UserId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string AssignedSubjects { get; set; } = string.Empty;
    }

    public class UpdateTeacherDto
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? AssignedSubjects { get; set; }
    }
}
