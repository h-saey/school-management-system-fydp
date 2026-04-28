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
    public class NotificationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public NotificationController(ApplicationDbContext context)
        {
            _context = context;
        }

        private int GetCurrentUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // GET: api/notification/my — Every role sees their own notifications
        [HttpGet("my")]
        public async Task<IActionResult> GetMyNotifications([FromQuery] NotificationStatus? status)
        {
            var currentUserId = GetCurrentUserId();
            var query = _context.Notifications.Where(n => n.UserId == currentUserId);

            if (status.HasValue) query = query.Where(n => n.Status == status.Value);

            var result = await query
                .OrderByDescending(n => n.DateSent)
                .Select(n => new { n.NotificationId, n.Type, n.Content, n.DateSent, n.Status })
                .ToListAsync();

            return Ok(result);
        }

        // GET: api/notification — Admin views all
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllNotifications()
        {
            var result = await _context.Notifications
                .Include(n => n.User)
                .OrderByDescending(n => n.DateSent)
                .Select(n => new
                {
                    n.NotificationId,
                    n.Type,
                    n.Content,
                    n.DateSent,
                    n.Status,
                    Recipient = new { n.User.Username, n.User.Role }
                })
                .ToListAsync();

            return Ok(result);
        }

        // POST: api/notification — Admin sends notification to a user
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SendNotification([FromBody] SendNotificationDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userExists = await _context.Users.AnyAsync(u => u.UserId == dto.UserId);
            if (!userExists)
                return BadRequest(new { message = "Recipient user not found." });

            var notification = new Notification
            {
                UserId   = dto.UserId,
                Type     = dto.Type,
                Content  = dto.Content,
                DateSent = DateTime.UtcNow,
                Status   = NotificationStatus.Unread
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMyNotifications), new { },
                new { message = "Notification sent.", notification.NotificationId });
        }

        // POST: api/notification/broadcast — Admin broadcasts to a role
        [HttpPost("broadcast")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> BroadcastNotification([FromBody] BroadcastNotificationDto dto)
        {
            if (!Enum.TryParse<UserRole>(dto.Role, true, out var targetRole))
                return BadRequest(new { message = "Invalid role." });

            var users = await _context.Users
                .Where(u => u.Role == targetRole && u.IsActive)
                .ToListAsync();

            if (!users.Any())
                return NotFound(new { message = "No active users found for this role." });

            var notifications = users.Select(u => new Notification
            {
                UserId   = u.UserId,
                Type     = dto.Type,
                Content  = dto.Content,
                DateSent = DateTime.UtcNow,
                Status   = NotificationStatus.Unread
            }).ToList();

            _context.Notifications.AddRange(notifications);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Notification broadcast to {notifications.Count} user(s)." });
        }

        // PATCH: api/notification/{id}/read — Mark notification as read
        [HttpPatch("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var currentUserId = GetCurrentUserId();
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.NotificationId == id && n.UserId == currentUserId);

            if (notification == null)
                return NotFound(new { message = "Notification not found." });

            notification.Status = NotificationStatus.Read;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Notification marked as read." });
        }

        // PATCH: api/notification/read-all — Mark all as read
        [HttpPatch("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var currentUserId = GetCurrentUserId();
            var unread = await _context.Notifications
                .Where(n => n.UserId == currentUserId && n.Status == NotificationStatus.Unread)
                .ToListAsync();

            unread.ForEach(n => n.Status = NotificationStatus.Read);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"{unread.Count} notification(s) marked as read." });
        }

        // DELETE: api/notification/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null)
                return NotFound(new { message = "Notification not found." });

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Notification deleted." });
        }
    }

    public class SendNotificationDto
    {
        public int UserId { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
    }

    public class BroadcastNotificationDto
    {
        public string Role { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
    }
}
