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
    public class StudentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public StudentController(ApplicationDbContext context)
        {
            _context = context;
        }

        private int GetCurrentUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        private string GetCurrentUserRole() =>
            User.FindFirstValue(ClaimTypes.Role)!;

        // GET: api/student
        [HttpGet]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> GetAllStudents()
        {
            var students = await _context.Students
                .Include(s => s.User)
                .Select(s => new
                {
                    s.StudentId,
                    s.FirstName,
                    s.LastName,
                    s.Class,
                    s.Section,
                    s.RollNumber,
                    s.User.Email,
                    s.User.IsActive
                })
                .ToListAsync();

            return Ok(students);
        }

        // GET: api/student/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetStudent(int id)
        {
            var student = await _context.Students
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.StudentId == id);

            if (student == null)
                return NotFound(new { message = "Student not found." });

            var role = GetCurrentUserRole();
            var currentUserId = GetCurrentUserId();

            // Students can only view their own profile
            if (role == "Student" && student.UserId != currentUserId)
                return Forbid();

            // Parents can only view their linked student
            if (role == "Parent")
            {
                var isLinked = await _context.Parents
                    .AnyAsync(p => p.UserId == currentUserId && p.StudentId == id);
                if (!isLinked) return Forbid();
            }

            return Ok(new
            {
                student.StudentId,
                student.FirstName,
                student.LastName,
                student.Class,
                student.Section,
                student.RollNumber,
                student.User.Email,
                student.User.IsActive
            });
        }

        // POST: api/student
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateStudent([FromBody] CreateStudentDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userExists = await _context.Users.AnyAsync(u => u.UserId == dto.UserId);
            if (!userExists)
                return BadRequest(new { message = "Linked user not found." });

            var duplicate = await _context.Students
                .AnyAsync(s => s.RollNumber == dto.RollNumber);
            if (duplicate)
                return Conflict(new { message = "A student with this roll number already exists." });

            var student = new Student
            {
                UserId     = dto.UserId,
                FirstName  = dto.FirstName,
                LastName   = dto.LastName,
                Class      = dto.Class,
                Section    = dto.Section,
                RollNumber = dto.RollNumber
            };

            _context.Students.Add(student);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetStudent), new { id = student.StudentId },
                new { message = "Student created successfully.", student.StudentId });
        }

        // PUT: api/student/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStudent(int id, [FromBody] UpdateStudentDto dto)
        {
            var student = await _context.Students.FindAsync(id);
            if (student == null)
                return NotFound(new { message = "Student not found." });

            if (!string.IsNullOrWhiteSpace(dto.FirstName))  student.FirstName  = dto.FirstName;
            if (!string.IsNullOrWhiteSpace(dto.LastName))   student.LastName   = dto.LastName;
            if (!string.IsNullOrWhiteSpace(dto.Class))      student.Class      = dto.Class;
            if (!string.IsNullOrWhiteSpace(dto.Section))    student.Section    = dto.Section;
            if (!string.IsNullOrWhiteSpace(dto.RollNumber)) student.RollNumber = dto.RollNumber;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Student updated successfully." });
        }

        // DELETE: api/student/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteStudent(int id)
        {
            var student = await _context.Students.FindAsync(id);
            if (student == null)
                return NotFound(new { message = "Student not found." });

            _context.Students.Remove(student);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Student deleted successfully." });
        }

        // GET: api/student/by-class/{class}
        [HttpGet("by-class/{className}")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> GetStudentsByClass(string className)
        {
            var students = await _context.Students
                .Where(s => s.Class == className)
                .Select(s => new { s.StudentId, s.FirstName, s.LastName, s.Section, s.RollNumber })
                .ToListAsync();

            return Ok(students);
        }
    }

    public class CreateStudentDto
    {
        public int UserId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Class { get; set; } = string.Empty;
        public string Section { get; set; } = string.Empty;
        public string RollNumber { get; set; } = string.Empty;
    }

    public class UpdateStudentDto
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Class { get; set; }
        public string? Section { get; set; }
        public string? RollNumber { get; set; }
    }
}
