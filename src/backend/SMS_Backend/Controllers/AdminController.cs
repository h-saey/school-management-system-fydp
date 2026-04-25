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
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/admin
        [HttpGet]
        public async Task<IActionResult> GetAllAdmins()
        {
            var admins = await _context.Admins
                .Include(a => a.User)
                .Select(a => new
                {
                    a.AdminId,
                    a.FirstName,
                    a.LastName,
                    a.User.Email,
                    a.User.IsActive
                })
                .ToListAsync();

            return Ok(admins);
        }

        // GET: api/admin/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetAdmin(int id)
        {
            var admin = await _context.Admins
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.AdminId == id);

            if (admin == null)
                return NotFound(new { message = "Admin not found." });

            return Ok(new
            {
                admin.AdminId,
                admin.FirstName,
                admin.LastName,
                admin.User.Email,
                admin.User.IsActive
            });
        }

        // POST: api/admin
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateAdmin([FromBody] CreateAdminDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userExists = await _context.Users
                .AnyAsync(u => u.UserId == dto.UserId && u.Role == UserRole.Admin);
            if (!userExists)
                return BadRequest(new { message = "Linked user not found or is not an Admin role." });

            var already = await _context.Admins.AnyAsync(a => a.UserId == dto.UserId);
            if (already)
                return Conflict(new { message = "Admin profile already exists for this user." });

            var admin = new Admin
            {
                UserId    = dto.UserId,
                FirstName = dto.FirstName,
                LastName  = dto.LastName
            };

            _context.Admins.Add(admin);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAdmin), new { id = admin.AdminId },
                new { message = "Admin profile created.", admin.AdminId });
        }

        // PUT: api/admin/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateAdmin(int id, [FromBody] UpdateAdminDto dto)
        {
            var admin = await _context.Admins.FindAsync(id);
            if (admin == null)
                return NotFound(new { message = "Admin not found." });

            if (!string.IsNullOrWhiteSpace(dto.FirstName)) admin.FirstName = dto.FirstName;
            if (!string.IsNullOrWhiteSpace(dto.LastName))  admin.LastName  = dto.LastName;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Admin updated successfully." });
        }

        // DELETE: api/admin/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAdmin(int id)
        {
            var admin = await _context.Admins.FindAsync(id);
            if (admin == null)
                return NotFound(new { message = "Admin not found." });

            _context.Admins.Remove(admin);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Admin deleted successfully." });
        }

        // GET: api/admin/dashboard-stats — quick summary for admin dashboard
        [HttpGet("dashboard-stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var stats = new
            {
                TotalStudents  = await _context.Students.CountAsync(),
                TotalTeachers  = await _context.Teachers.CountAsync(),
                TotalParents   = await _context.Parents.CountAsync(),
                ActiveUsers    = await _context.Users.CountAsync(u => u.IsActive),
                OpenComplaints = await _context.Complaints
                    .CountAsync(c => c.Status == ComplaintStatus.Submitted || c.Status == ComplaintStatus.UnderReview),
                OverdueFees    = await _context.Fees.CountAsync(f => f.Status == FeeStatus.Overdue)
            };

            return Ok(stats);
        }
    }

    public class CreateAdminDto
    {
        [Required]
        public int UserId { get; set; }
        [Required]
        public string FirstName { get; set; } = string.Empty;
        [Required]
        public string LastName { get; set; } = string.Empty;
    }

    public class UpdateAdminDto
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
    }
}
