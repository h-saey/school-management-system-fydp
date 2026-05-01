using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SMS_Backend.Data;
using SMS_Backend.Models;

namespace SMS_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AuditLogController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AuditLogController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/auditlog
        [HttpGet]
        public async Task<IActionResult> GetAllLogs(
            [FromQuery] int? userId,
            [FromQuery] string? action,
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            if (page < 1)     page     = 1;
            if (pageSize < 1) pageSize = 50;
            if (pageSize > 200) pageSize = 200;

            var query = _context.AuditLogs
                .Include(l => l.User)
                .AsQueryable();

            if (userId.HasValue)             query = query.Where(l => l.UserId == userId.Value);
            if (!string.IsNullOrEmpty(action)) query = query.Where(l => l.Action.Contains(action));
            if (from.HasValue)               query = query.Where(l => l.Timestamp >= from.Value);
            if (to.HasValue)                 query = query.Where(l => l.Timestamp <= to.Value);

            var totalCount = await query.CountAsync();

            var logs = await query
                .OrderByDescending(l => l.Timestamp)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(l => new
                {
                    l.LogId,
                    l.Action,
                    l.Timestamp,
                    l.Details,
                    User = new { l.User.Username, l.User.Role }
                })
                .ToListAsync();

            return Ok(new
            {
                TotalCount  = totalCount,
                Page        = page,
                PageSize    = pageSize,
                TotalPages  = (int)Math.Ceiling((double)totalCount / pageSize),
                Logs        = logs
            });
        }

        // GET: api/auditlog/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetLog(int id)
        {
            var log = await _context.AuditLogs
                .Include(l => l.User)
                .FirstOrDefaultAsync(l => l.LogId == id);

            if (log == null)
                return NotFound(new { message = "Audit log entry not found." });

            return Ok(new
            {
                log.LogId,
                log.Action,
                log.Timestamp,
                log.Details,
                User = new { log.User.Username, log.User.Email, log.User.Role }
            });
        }

        // GET: api/auditlog/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetLogsByUser(int userId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            var userExists = await _context.Users.AnyAsync(u => u.UserId == userId);
            if (!userExists)
                return NotFound(new { message = "User not found." });

            var total = await _context.AuditLogs.CountAsync(l => l.UserId == userId);

            var logs = await _context.AuditLogs
                .Where(l => l.UserId == userId)
                .OrderByDescending(l => l.Timestamp)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(l => new { l.LogId, l.Action, l.Timestamp, l.Details })
                .ToListAsync();

            return Ok(new
            {
                TotalCount = total,
                Page       = page,
                PageSize   = pageSize,
                Logs       = logs
            });
        }

        // GET: api/auditlog/actions — Distinct action types for filtering
        [HttpGet("actions")]
        public async Task<IActionResult> GetDistinctActions()
        {
            var actions = await _context.AuditLogs
                .Select(l => l.Action)
                .Distinct()
                .OrderBy(a => a)
                .ToListAsync();

            return Ok(actions);
        }

        // GET: api/auditlog/summary — Activity summary for admin dashboard
        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary([FromQuery] int days = 7)
        {
            var since = DateTime.UtcNow.AddDays(-days);

            var summary = await _context.AuditLogs
                .Where(l => l.Timestamp >= since)
                .GroupBy(l => l.Action)
                .Select(g => new { Action = g.Key, Count = g.Count() })
                .OrderByDescending(g => g.Count)
                .ToListAsync();

            var totalInPeriod = summary.Sum(s => s.Count);

            return Ok(new
            {
                PeriodDays   = days,
                Since        = since,
                TotalActions = totalInPeriod,
                Breakdown    = summary
            });
        }

        // NOTE: AuditLogs are immutable — no POST, PUT, or DELETE endpoints.
        // Logs are written internally by services, never via API.
    }
}
