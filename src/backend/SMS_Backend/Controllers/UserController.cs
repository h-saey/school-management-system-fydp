//using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.Mvc;
//using Microsoft.EntityFrameworkCore;
//using SMS_Backend.Data;
//using SMS_Backend.Models;
//using SMS_Backend.Services;
//using System.Security.Claims;

//namespace SMS_Backend.Controllers
//{
//    [ApiController]
//    [Route("api/[controller]")]
//    [Authorize]
//    public class UserController : ControllerBase
//    {
//        private readonly ApplicationDbContext _context;
//        private readonly AuditLogService _audit;

//        public UserController(ApplicationDbContext context, AuditLogService audit)
//        {
//            _context = context;
//            _audit = audit;
//        }

//        private int GetCurrentUserId() =>
//            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

//        // ══════════════════════════════════════════════════════
//        // GET: api/user
//        // Returns ALL users with their IDs, roles, linked profile IDs
//        // so Admin can see exact IDs before creating Student/Parent/Teacher
//        // ══════════════════════════════════════════════════════
//        [HttpGet]
//        [Authorize(Roles = "Admin")]
//        public async Task<IActionResult> GetAllUsers()
//        {
//            // Join with profile tables to show linked profile ID
//            var users = await _context.Users
//                .GroupJoin(_context.Students,
//                    u => u.UserId, s => s.UserId,
//                    (u, students) => new { u, students })
//                .SelectMany(x => x.students.DefaultIfEmpty(),
//                    (x, student) => new { x.u, student })
//                .GroupJoin(_context.Teachers,
//                    x => x.u.UserId, t => t.UserId,
//                    (x, teachers) => new { x.u, x.student, teachers })
//                .SelectMany(x => x.teachers.DefaultIfEmpty(),
//                    (x, teacher) => new { x.u, x.student, teacher })
//                .GroupJoin(_context.Parents,
//                    x => x.u.UserId, p => p.UserId,
//                    (x, parents) => new { x.u, x.student, x.teacher, parents })
//                .SelectMany(x => x.parents.DefaultIfEmpty(),
//                    (x, parent) => new
//                    {
//                        // ── Core user fields ────────────────
//                        UserId = x.u.UserId,
//                        Username = x.u.Username,
//                        Email = x.u.Email,
//                        Role = x.u.Role.ToString(),
//                        IsActive = x.u.IsActive,
//                        CreatedAt = x.u.CreatedAt,

//                        // ── Profile IDs (null if not created yet) ──
//                        StudentId = x.student != null ? (int?)x.student.StudentId : null,
//                        TeacherId = x.teacher != null ? (int?)x.teacher.TeacherId : null,
//                        ParentId = parent != null ? (int?)parent.ParentId : null,

//                        // ── Profile summary ──────────────────
//                        ProfileName = x.student != null
//                            ? x.student.FirstName + " " + x.student.LastName
//                            : x.teacher != null
//                                ? x.teacher.FirstName + " " + x.teacher.LastName
//                                : parent != null
//                                    ? parent.Relation
//                                    : "—",

//                        HasProfile = x.student != null || x.teacher != null || parent != null
//                    })
//                .ToListAsync();

//            return Ok(users);
//        }

//        // GET: api/user/{id}
//        [HttpGet("{id}")]
//        [Authorize(Roles = "Admin")]
//        public async Task<IActionResult> GetUser(int id)
//        {
//            var user = await _context.Users
//                .Where(u => u.UserId == id)
//                .Select(u => new
//                {
//                    u.UserId,
//                    u.Username,
//                    u.Email,
//                    Role = u.Role.ToString(),
//                    u.IsActive,
//                    u.CreatedAt
//                })
//                .FirstOrDefaultAsync();

//            if (user == null)
//                return NotFound(new { message = "User not found." });

//            return Ok(user);
//        }

//        // GET: api/user/by-role/{role}
//        // Returns users of a specific role with their IDs
//        // Useful for dropdowns when creating Student/Parent profiles
//        [HttpGet("by-role/{role}")]
//        [Authorize(Roles = "Admin")]
//        public async Task<IActionResult> GetUsersByRole(string role)
//        {
//            if (!Enum.TryParse<UserRole>(role, true, out var parsedRole))
//                return BadRequest(new { message = "Invalid role. Use: Admin, Teacher, Student, Parent" });

//            var users = await _context.Users
//                .Where(u => u.Role == parsedRole && u.IsActive)
//                .Select(u => new
//                {
//                    u.UserId,
//                    u.Username,
//                    u.Email,
//                    u.IsActive,
//                    u.CreatedAt,
//                    Label = $"[ID: {u.UserId}] {u.Username} ({u.Email})"  // for dropdowns
//                })
//                .OrderBy(u => u.Username)
//                .ToListAsync();

//            return Ok(users);
//        }

//        // GET: api/user/without-profile
//        // Returns users who don't have a linked profile yet
//        // Helps admin know which users still need a profile created
//        [HttpGet("without-profile")]
//        [Authorize(Roles = "Admin")]
//        public async Task<IActionResult> GetUsersWithoutProfile()
//        {
//            var studentUserIds = await _context.Students.Select(s => s.UserId).ToListAsync();
//            var teacherUserIds = await _context.Teachers.Select(t => t.UserId).ToListAsync();
//            var parentUserIds = await _context.Parents.Select(p => p.UserId).ToListAsync();
//            var adminUserIds = await _context.Admins.Select(a => a.UserId).ToListAsync();

//            var allLinked = studentUserIds
//                .Union(teacherUserIds)
//                .Union(parentUserIds)
//                .Union(adminUserIds)
//                .ToHashSet();

//            var unlinked = await _context.Users
//                .Where(u => !allLinked.Contains(u.UserId))
//                .Select(u => new
//                {
//                    u.UserId,
//                    u.Username,
//                    u.Email,
//                    Role = u.Role.ToString(),
//                    u.IsActive,
//                    Label = $"[ID: {u.UserId}] {u.Username} — needs profile"
//                })
//                .ToListAsync();

//            return Ok(unlinked);
//        }

//        // POST: api/user
//        // Admin creates a new user account (FR-2)
//        [HttpPost]
//        [Authorize(Roles = "Admin")]
//        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
//        {
//            if (!ModelState.IsValid) return BadRequest(ModelState);

//            // FR-2: duplicate checks
//            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
//                return Conflict(new { message = "Email already exists." });

//            if (await _context.Users.AnyAsync(u => u.Username == dto.Username))
//                return Conflict(new { message = "Username already taken." });

//            if (!Enum.TryParse<UserRole>(dto.Role, true, out var role))
//                return BadRequest(new { message = "Invalid role. Use: Admin, Teacher, Student, Parent" });

//            var user = new User
//            {
//                Username = dto.Username,
//                Email = dto.Email,
//                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
//                Role = role,
//                IsActive = true,
//                CreatedAt = DateTime.UtcNow
//            };

//            _context.Users.Add(user);
//            await _context.SaveChangesAsync();

//            await _audit.LogAsync(GetCurrentUserId(), AuditLogService.Actions.CreateUser,
//                $"Created user '{user.Username}' (ID: {user.UserId}) with role '{role}'");

//            return CreatedAtAction(nameof(GetUser), new { id = user.UserId },
//                new
//                {
//                    message = "User created successfully.",
//                    user.UserId,
//                    user.Username,
//                    user.Email,
//                    Role = role.ToString(),
//                    Note = $"Use UserId = {user.UserId} when creating {role} profile"
//                });
//        }

//        // PUT: api/user/{id}
//        [HttpPut("{id}")]
//        [Authorize(Roles = "Admin")]
//        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto dto)
//        {
//            var user = await _context.Users.FindAsync(id);
//            if (user == null) return NotFound(new { message = "User not found." });

//            // Check duplicate email/username if changing
//            if (!string.IsNullOrWhiteSpace(dto.Email) && dto.Email != user.Email)
//            {
//                if (await _context.Users.AnyAsync(u => u.Email == dto.Email && u.UserId != id))
//                    return Conflict(new { message = "Email already in use by another user." });
//                user.Email = dto.Email;
//            }

//            if (!string.IsNullOrWhiteSpace(dto.Username) && dto.Username != user.Username)
//            {
//                if (await _context.Users.AnyAsync(u => u.Username == dto.Username && u.UserId != id))
//                    return Conflict(new { message = "Username already taken." });
//                user.Username = dto.Username;
//            }

//            await _context.SaveChangesAsync();

//            await _audit.LogAsync(GetCurrentUserId(), AuditLogService.Actions.UpdateUser,
//                $"Updated user ID {id} — username/email changed");

//            return Ok(new { message = "User updated successfully." });
//        }

//        // PATCH: api/user/{id}/toggle-status
//        [HttpPatch("{id}/toggle-status")]
//        [Authorize(Roles = "Admin")]
//        public async Task<IActionResult> ToggleUserStatus(int id)
//        {
//            var user = await _context.Users.FindAsync(id);
//            if (user == null) return NotFound(new { message = "User not found." });

//            user.IsActive = !user.IsActive;
//            await _context.SaveChangesAsync();

//            await _audit.LogAsync(GetCurrentUserId(), AuditLogService.Actions.ToggleUserStatus,
//                $"User ID {id} '{user.Username}' {(user.IsActive ? "activated" : "deactivated")}");

//            return Ok(new
//            {
//                message = $"User {(user.IsActive ? "activated" : "deactivated")} successfully.",
//                isActive = user.IsActive
//            });
//        }

//        // DELETE: api/user/{id}
//        // FR-2: prevent deletion if linked records exist
//        [HttpDelete("{id}")]
//        [Authorize(Roles = "Admin")]
//        public async Task<IActionResult> DeleteUser(int id)
//        {
//            var user = await _context.Users.FindAsync(id);
//            if (user == null) return NotFound(new { message = "User not found." });

//            // FR-2: check for linked records before deletion
//            bool hasStudent = await _context.Students.AnyAsync(s => s.UserId == id);
//            bool hasTeacher = await _context.Teachers.AnyAsync(t => t.UserId == id);
//            bool hasParent = await _context.Parents.AnyAsync(p => p.UserId == id);
//            bool hasAdmin = await _context.Admins.AnyAsync(a => a.UserId == id);

//            if (hasStudent || hasTeacher || hasParent || hasAdmin)
//            {
//                var linked = new List<string>();
//                if (hasStudent) linked.Add("Student profile");
//                if (hasTeacher) linked.Add("Teacher profile");
//                if (hasParent) linked.Add("Parent profile");
//                if (hasAdmin) linked.Add("Admin profile");

//                return BadRequest(new
//                {
//                    message = $"Cannot delete user. Linked records exist: {string.Join(", ", linked)}. Delete the profile first."
//                });
//            }

//            await _audit.LogAsync(GetCurrentUserId(), AuditLogService.Actions.DeleteUser,
//                $"Deleted user '{user.Username}' (ID: {id}, Role: {user.Role})");

//            _context.Users.Remove(user);
//            await _context.SaveChangesAsync();

//            return Ok(new { message = "User deleted successfully." });
//        }
//    }

//    public class CreateUserDto
//    {
//        public string Username { get; set; } = string.Empty;
//        public string Email { get; set; } = string.Empty;
//        public string Password { get; set; } = string.Empty;
//        public string Role { get; set; } = string.Empty;
//    }

//    public class UpdateUserDto
//    {
//        public string? Username { get; set; }
//        public string? Email { get; set; }
//    }
//}
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SMS_Backend.Data;
using SMS_Backend.Models;
using SMS_Backend.Services;
using System.Security.Claims;

namespace SMS_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly AuditLogService _audit;

        public UserController(ApplicationDbContext context, AuditLogService audit)
        {
            _context = context;
            _audit = audit;
        }

        private int GetCurrentUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // ══════════════════════════════════════════════════════
        // GET: api/user
        // Returns ALL users with their IDs, roles, linked profile IDs
        // so Admin can see exact IDs before creating Student/Parent/Teacher
        // ══════════════════════════════════════════════════════
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllUsers()
        {
            // Join with profile tables to show linked profile ID
            var users = await _context.Users
                .GroupJoin(_context.Students,
                    u => u.UserId, s => s.UserId,
                    (u, students) => new { u, students })
                .SelectMany(x => x.students.DefaultIfEmpty(),
                    (x, student) => new { x.u, student })
                .GroupJoin(_context.Teachers,
                    x => x.u.UserId, t => t.UserId,
                    (x, teachers) => new { x.u, x.student, teachers })
                .SelectMany(x => x.teachers.DefaultIfEmpty(),
                    (x, teacher) => new { x.u, x.student, teacher })
                .GroupJoin(_context.Parents,
                    x => x.u.UserId, p => p.UserId,
                    (x, parents) => new { x.u, x.student, x.teacher, parents })
                .SelectMany(x => x.parents.DefaultIfEmpty(),
                    (x, parent) => new
                    {
                        // ── Core user fields ────────────────
                        UserId = x.u.UserId,
                        Username = x.u.Username,
                        Email = x.u.Email,
                        Role = x.u.Role.ToString(),
                        IsActive = x.u.IsActive,
                        CreatedAt = x.u.CreatedAt,

                        // ── Profile IDs (null if not created yet) ──
                        StudentId = x.student != null ? (int?)x.student.StudentId : null,
                        TeacherId = x.teacher != null ? (int?)x.teacher.TeacherId : null,
                        ParentId = parent != null ? (int?)parent.ParentId : null,

                        // ── Profile summary ──────────────────
                        ProfileName = x.student != null
                            ? x.student.FirstName + " " + x.student.LastName
                            : x.teacher != null
                                ? x.teacher.FirstName + " " + x.teacher.LastName
                                : parent != null
                                    ? parent.Relation
                                    : "—",

                        HasProfile = x.student != null || x.teacher != null || parent != null
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
                    Role = u.Role.ToString(),
                    u.IsActive,
                    u.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (user == null)
                return NotFound(new { message = "User not found." });

            return Ok(user);
        }

        // GET: api/user/by-role/{role}
        // Returns users of a specific role with their IDs
        // Useful for dropdowns when creating Student/Parent profiles
        [HttpGet("by-role/{role}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUsersByRole(string role)
        {
            if (!Enum.TryParse<UserRole>(role, true, out var parsedRole))
                return BadRequest(new { message = "Invalid role. Use: Admin, Teacher, Student, Parent" });

            var users = await _context.Users
                .Where(u => u.Role == parsedRole && u.IsActive)
                .Select(u => new
                {
                    u.UserId,
                    u.Username,
                    u.Email,
                    u.IsActive,
                    u.CreatedAt,
                    Label = $"[ID: {u.UserId}] {u.Username} ({u.Email})"  // for dropdowns
                })
                .OrderBy(u => u.Username)
                .ToListAsync();

            return Ok(users);
        }

        // GET: api/user/without-profile
        // Returns users who don't have a linked profile yet
        // Helps admin know which users still need a profile created
        [HttpGet("without-profile")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUsersWithoutProfile()
        {
            var studentUserIds = await _context.Students.Select(s => s.UserId).ToListAsync();
            var teacherUserIds = await _context.Teachers.Select(t => t.UserId).ToListAsync();
            var parentUserIds = await _context.Parents.Select(p => p.UserId).ToListAsync();
            var adminUserIds = await _context.Admins.Select(a => a.UserId).ToListAsync();

            var allLinked = studentUserIds
                .Union(teacherUserIds)
                .Union(parentUserIds)
                .Union(adminUserIds)
                .ToHashSet();

            var unlinked = await _context.Users
                .Where(u => !allLinked.Contains(u.UserId))
                .Select(u => new
                {
                    u.UserId,
                    u.Username,
                    u.Email,
                    Role = u.Role.ToString(),
                    u.IsActive,
                    Label = $"[ID: {u.UserId}] {u.Username} — needs profile"
                })
                .ToListAsync();

            return Ok(unlinked);
        }

        // POST: api/user
        // Admin creates a new user account (FR-2)
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // FR-2: duplicate checks
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                return Conflict(new { message = "Email already exists." });

            if (await _context.Users.AnyAsync(u => u.Username == dto.Username))
                return Conflict(new { message = "Username already taken." });

            if (!Enum.TryParse<UserRole>(dto.Role, true, out var role))
                return BadRequest(new { message = "Invalid role. Use: Admin, Teacher, Student, Parent" });

            var user = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = role,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            await _audit.LogAsync(GetCurrentUserId(), AuditLogService.Actions.CreateUser,
                $"Created user '{user.Username}' (ID: {user.UserId}) with role '{role}'");

            return CreatedAtAction(nameof(GetUser), new { id = user.UserId },
                new
                {
                    message = "User created successfully.",
                    user.UserId,
                    user.Username,
                    user.Email,
                    Role = role.ToString(),
                    Note = $"Use UserId = {user.UserId} when creating {role} profile"
                });
        }

        // PUT: api/user/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "User not found." });

            // Check duplicate email/username if changing
            if (!string.IsNullOrWhiteSpace(dto.Email) && dto.Email != user.Email)
            {
                if (await _context.Users.AnyAsync(u => u.Email == dto.Email && u.UserId != id))
                    return Conflict(new { message = "Email already in use by another user." });
                user.Email = dto.Email;
            }

            if (!string.IsNullOrWhiteSpace(dto.Username) && dto.Username != user.Username)
            {
                if (await _context.Users.AnyAsync(u => u.Username == dto.Username && u.UserId != id))
                    return Conflict(new { message = "Username already taken." });
                user.Username = dto.Username;
            }

            await _context.SaveChangesAsync();

            await _audit.LogAsync(GetCurrentUserId(), AuditLogService.Actions.UpdateUser,
                $"Updated user ID {id} — username/email changed");

            return Ok(new { message = "User updated successfully." });
        }

        // PATCH: api/user/{id}/toggle-status
        [HttpPatch("{id}/toggle-status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ToggleUserStatus(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "User not found." });

            user.IsActive = !user.IsActive;
            await _context.SaveChangesAsync();

            await _audit.LogAsync(GetCurrentUserId(), AuditLogService.Actions.ToggleUserStatus,
                $"User ID {id} '{user.Username}' {(user.IsActive ? "activated" : "deactivated")}");

            return Ok(new
            {
                message = $"User {(user.IsActive ? "activated" : "deactivated")} successfully.",
                isActive = user.IsActive
            });
        }

        // DELETE: api/user/{id}
        // FR-2: prevent deletion if linked records exist
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "User not found." });

            // FR-2: check for linked records before deletion
            bool hasStudent = await _context.Students.AnyAsync(s => s.UserId == id);
            bool hasTeacher = await _context.Teachers.AnyAsync(t => t.UserId == id);
            bool hasParent = await _context.Parents.AnyAsync(p => p.UserId == id);
            bool hasAdmin = await _context.Admins.AnyAsync(a => a.UserId == id);

            if (hasStudent || hasTeacher || hasParent || hasAdmin)
            {
                var linked = new List<string>();
                if (hasStudent) linked.Add("Student profile");
                if (hasTeacher) linked.Add("Teacher profile");
                if (hasParent) linked.Add("Parent profile");
                if (hasAdmin) linked.Add("Admin profile");

                return BadRequest(new
                {
                    message = $"Cannot delete user. Linked records exist: {string.Join(", ", linked)}. Delete the profile first."
                });
            }

            await _audit.LogAsync(GetCurrentUserId(), AuditLogService.Actions.DeleteUser,
                $"Deleted user '{user.Username}' (ID: {id}, Role: {user.Role})");

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "User deleted successfully." });
        }
    }

    public class CreateUserDto
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }

    public class UpdateUserDto
    {
        public string? Username { get; set; }
        public string? Email { get; set; }
    }
}