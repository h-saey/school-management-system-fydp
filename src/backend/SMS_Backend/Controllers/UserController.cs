using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SMS_Backend.Data;
using SMS_Backend.Models;
using System.ComponentModel.DataAnnotations;

namespace SMS_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UserController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/user
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users
                .Select(u => new
                {
                    u.UserId,
                    u.Username,
                    u.Email,
                    u.Role,
                    u.IsActive,
                    u.CreatedAt
                })
                .ToListAsync();

            return Ok(users);
        }

        // GET: api/user/{id}
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await _context.Users
                .Where(u => u.UserId == id)
                .Select(u => new
                {
                    u.UserId,
                    u.Username,
                    u.Email,
                    u.Role,
                    u.IsActive,
                    u.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (user == null)
                return NotFound(new { message = "User not found." });

            return Ok(user);
        }

        // PUT: api/user/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found." });

            if (!string.IsNullOrWhiteSpace(dto.Username))
                user.Username = dto.Username;

            if (!string.IsNullOrWhiteSpace(dto.Email))
                user.Email = dto.Email;

            await _context.SaveChangesAsync();
            return Ok(new { message = "User updated successfully." });
        }

        // PATCH: api/user/{id}/toggle-status
        [HttpPatch("{id}/toggle-status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ToggleUserStatus(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found." });

            user.IsActive = !user.IsActive;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"User {(user.IsActive ? "activated" : "deactivated")} successfully.", isActive = user.IsActive });
        }

        // DELETE: api/user/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found." });

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return Ok(new { message = "User deleted successfully." });
        }

        // GET: api/user/by-role/{role}
        [HttpGet("by-role/{role}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUsersByRole(string role)
        {
            if (!Enum.TryParse<UserRole>(role, true, out var parsedRole))
                return BadRequest(new { message = "Invalid role. Valid roles: Admin, Teacher, Student, Parent." });

            var users = await _context.Users
                .Where(u => u.Role == parsedRole)
                .Select(u => new { u.UserId, u.Username, u.Email, u.IsActive, u.CreatedAt })
                .ToListAsync();

            return Ok(users);
        }

        // POST: api/user
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var emailExists = await _context.Users
                .AnyAsync(u => u.Email == dto.Email);

            if (emailExists)
                return Conflict(new { message = "Email already exists." });

            var user = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                PasswordHash = dto.Password, // assuming plain text for now
                Role = dto.Role,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "User created successfully",
                userId = user.UserId
            });
        }

    }

    public class UpdateUserDto
    {
        public string? Username { get; set; }
        public string? Email { get; set; }
    }

    public class CreateUserDto
    {
        [Required]
        public string Username { get; set; }

        [Required]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }

        [Required]
        public UserRole Role { get; set; }
    }

}
