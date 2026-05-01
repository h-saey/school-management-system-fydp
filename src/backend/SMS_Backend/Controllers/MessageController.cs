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
    public class MessageController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MessageController(ApplicationDbContext context)
        {
            _context = context;
        }

        private int GetCurrentUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // GET: api/message/inbox — All messages received by current user
        [HttpGet("inbox")]
        public async Task<IActionResult> GetInbox()
        {
            var currentUserId = GetCurrentUserId();
            var messages = await _context.Messages
                .Include(m => m.Sender)
                .Where(m => m.ReceiverUserId == currentUserId)
                .OrderByDescending(m => m.SentAt)
                .Select(m => new
                {
                    m.MessageId,
                    m.Content,
                    m.SentAt,
                    m.IsRead,
                    From = new { m.Sender.Username, m.Sender.Role }
                })
                .ToListAsync();

            return Ok(messages);
        }

        // GET: api/message/sent — All messages sent by current user
        [HttpGet("sent")]
        public async Task<IActionResult> GetSent()
        {
            var currentUserId = GetCurrentUserId();
            var messages = await _context.Messages
                .Include(m => m.Receiver)
                .Where(m => m.SenderUserId == currentUserId)
                .OrderByDescending(m => m.SentAt)
                .Select(m => new
                {
                    m.MessageId,
                    m.Content,
                    m.SentAt,
                    m.IsRead,
                    To = new { m.Receiver.Username, m.Receiver.Role }
                })
                .ToListAsync();

            return Ok(messages);
        }

        // GET: api/message/conversation/{otherUserId} — Full thread between two users
        [HttpGet("conversation/{otherUserId}")]
        public async Task<IActionResult> GetConversation(int otherUserId)
        {
            var currentUserId = GetCurrentUserId();

            // Enforce: only Parent↔Teacher messaging allowed per doc
            var role = User.FindFirstValue(ClaimTypes.Role);
            var otherUser = await _context.Users.FindAsync(otherUserId);
            if (otherUser == null)
                return NotFound(new { message = "Other user not found." });

            bool isValidPair = (role == "Parent" && otherUser.Role == UserRole.Teacher) ||
                               (role == "Teacher" && otherUser.Role == UserRole.Parent) ||
                               role == "Admin";
            if (!isValidPair)
                return Forbid();

            var messages = await _context.Messages
                .Where(m => (m.SenderUserId == currentUserId && m.ReceiverUserId == otherUserId) ||
                            (m.SenderUserId == otherUserId && m.ReceiverUserId == currentUserId))
                .OrderBy(m => m.SentAt)
                .Select(m => new
                {
                    m.MessageId,
                    m.Content,
                    m.SentAt,
                    m.IsRead,
                    Direction = m.SenderUserId == currentUserId ? "sent" : "received"
                })
                .ToListAsync();

            return Ok(messages);
        }

        // POST: api/message — Send a message
        [HttpPost]
        [Authorize(Roles = "Admin,Teacher,Parent")]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (string.IsNullOrWhiteSpace(dto.Content))
                return BadRequest(new { message = "Message content cannot be empty." });

            var currentUserId = GetCurrentUserId();
            if (dto.ReceiverUserId == currentUserId)
                return BadRequest(new { message = "Cannot send a message to yourself." });

            var receiverExists = await _context.Users.AnyAsync(u => u.UserId == dto.ReceiverUserId && u.IsActive);
            if (!receiverExists)
                return BadRequest(new { message = "Recipient user not found or inactive." });

            var message = new Message
            {
                SenderUserId   = currentUserId,
                ReceiverUserId = dto.ReceiverUserId,
                Content        = dto.Content,
                SentAt         = DateTime.UtcNow,
                IsRead         = false
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetInbox), new { },
                new { message = "Message sent.", message.MessageId });
        }

        // PATCH: api/message/{id}/read — Recipient marks as read
        [HttpPatch("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var currentUserId = GetCurrentUserId();
            var msg = await _context.Messages
                .FirstOrDefaultAsync(m => m.MessageId == id && m.ReceiverUserId == currentUserId);

            if (msg == null)
                return NotFound(new { message = "Message not found." });

            msg.IsRead = true;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Marked as read." });
        }

        // DELETE: api/message/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteMessage(int id)
        {
            var msg = await _context.Messages.FindAsync(id);
            if (msg == null)
                return NotFound(new { message = "Message not found." });

            _context.Messages.Remove(msg);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Message deleted." });
        }
    }

    public class SendMessageDto
    {
        public int ReceiverUserId { get; set; }
        public string Content { get; set; } = string.Empty;
    }
}
