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
    public class ParentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ParentController(ApplicationDbContext context)
        {
            _context = context;
        }

        private int GetCurrentUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // GET: api/parent
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllParents()
        {
            var parents = await _context.Parents
                .Include(p => p.User)
                .Include(p => p.Student)
                .Select(p => new
                {
                    p.ParentId,
                    p.Relation,
                    p.User.Email,
                    LinkedStudent = new { p.Student.FirstName, p.Student.LastName, p.Student.RollNumber }
                })
                .ToListAsync();

            return Ok(parents);
        }

        // GET: api/parent/{id}
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Parent")]
        public async Task<IActionResult> GetParent(int id)
        {
            var parent = await _context.Parents
                .Include(p => p.User)
                .Include(p => p.Student)
                .FirstOrDefaultAsync(p => p.ParentId == id);

            if (parent == null)
                return NotFound(new { message = "Parent not found." });

            var role = User.FindFirstValue(ClaimTypes.Role);
            if (role == "Parent" && parent.UserId != GetCurrentUserId())
                return Forbid();

            return Ok(new
            {
                parent.ParentId,
                parent.Relation,
                parent.User.Email,
                LinkedStudent = new
                {
                    parent.Student.StudentId,
                    parent.Student.FirstName,
                    parent.Student.LastName,
                    parent.Student.Class,
                    parent.Student.Section,
                    parent.Student.RollNumber
                }
            });
        }

        // POST: api/parent
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateParent([FromBody] CreateParentDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userExists = await _context.Users
                .AnyAsync(u => u.UserId == dto.UserId && u.Role == UserRole.Parent);
            if (!userExists)
                return BadRequest(new { message = "Linked user not found or is not a Parent role." });

            var studentExists = await _context.Students.AnyAsync(s => s.StudentId == dto.StudentId);
            if (!studentExists)
                return BadRequest(new { message = "Linked student not found." });

            var parent = new Parent
            {
                UserId    = dto.UserId,
                StudentId = dto.StudentId,
                Relation  = dto.Relation
            };

            _context.Parents.Add(parent);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetParent), new { id = parent.ParentId },
                new { message = "Parent profile created successfully.", parent.ParentId });
        }

        // PUT: api/parent/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateParent(int id, [FromBody] UpdateParentDto dto)
        {
            var parent = await _context.Parents.FindAsync(id);
            if (parent == null)
                return NotFound(new { message = "Parent not found." });

            if (!string.IsNullOrWhiteSpace(dto.Relation)) parent.Relation = dto.Relation;
            if (dto.StudentId.HasValue)                   parent.StudentId = dto.StudentId.Value;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Parent updated successfully." });
        }

        // DELETE: api/parent/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteParent(int id)
        {
            var parent = await _context.Parents.FindAsync(id);
            if (parent == null)
                return NotFound(new { message = "Parent not found." });

            _context.Parents.Remove(parent);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Parent deleted successfully." });
        }

        // GET: api/parent/my-student — Parent views their own linked student
        [HttpGet("my-student")]
        [Authorize(Roles = "Parent")]
        public async Task<IActionResult> GetMyStudent()
        {
            var currentUserId = GetCurrentUserId();
            var parent = await _context.Parents
                .Include(p => p.Student)
                .FirstOrDefaultAsync(p => p.UserId == currentUserId);

            if (parent == null)
                return NotFound(new { message = "No linked student found." });

            return Ok(new
            {
                parent.Student.StudentId,
                parent.Student.FirstName,
                parent.Student.LastName,
                parent.Student.Class,
                parent.Student.Section,
                parent.Student.RollNumber
            });
        }
    }

    public class CreateParentDto
    {
        public int UserId { get; set; }
        public int StudentId { get; set; }
        public string Relation { get; set; } = string.Empty;
    }

    public class UpdateParentDto
    {
        public string? Relation { get; set; }
        public int? StudentId { get; set; }
    }
}
