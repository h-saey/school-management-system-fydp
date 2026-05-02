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
    public class ComplaintController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ComplaintController(ApplicationDbContext context)
        {
            _context = context;
        }

        private int GetCurrentUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        private string GetCurrentUserRole() =>
            User.FindFirstValue(ClaimTypes.Role)!;

        // GET: api/complaint — Admin/Teacher see all; Students/Parents see own
        [HttpGet]
        public async Task<IActionResult> GetComplaints()
        {
            var role = GetCurrentUserRole();
            var currentUserId = GetCurrentUserId();

            IQueryable<Complaint> query = _context.Complaints
                .Include(c => c.SubmittedBy)
                .Include(c => c.AssignedTo);

            // if (role == "Student" || role == "Parent")
            //query = query.Where(c => c.SubmittedByUserId == currentUserId);

            if (role == "Student")
            {
                query = query.Where(c => c.SubmittedByUserId == currentUserId);
            }
            else if (role == "Parent")
            {
                // Get linked student IDs
                var studentIds = await _context.Parents
                    .Where(p => p.UserId == currentUserId)
                    .Select(p => p.StudentId)
                    .ToListAsync();

                // Get student userIds
                var studentUserIds = await _context.Students
                    .Where(s => studentIds.Contains(s.StudentId))
                    .Select(s => s.UserId)
                    .ToListAsync();

                query = query.Where(c =>
                    c.SubmittedByUserId == currentUserId // parent's own complaints
                    || studentUserIds.Contains(c.SubmittedByUserId) // student's complaints
                );
            }


            var result = await query.Select(c => new
            {
                c.ComplaintId,
                c.Category,
                c.Description,
                c.Status,
                c.Remarks,
                c.DateSubmitted,
                c.DateClosed,
                SubmittedBy = new { c.SubmittedBy.Username, c.SubmittedBy.Role },
                AssignedTo  = c.AssignedTo == null ? null : new { c.AssignedTo.Username, c.AssignedTo.Role }
            }).ToListAsync();

            return Ok(result);
        }

        // GET: api/complaint/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetComplaint(int id)
        {
            var complaint = await _context.Complaints
                .Include(c => c.SubmittedBy)
                .Include(c => c.AssignedTo)
                .FirstOrDefaultAsync(c => c.ComplaintId == id);

            if (complaint == null)
                return NotFound(new { message = "Complaint not found." });

            var role = GetCurrentUserRole();
            var currentUserId = GetCurrentUserId();

            if ((role == "Student" || role == "Parent") && complaint.SubmittedByUserId != currentUserId)
                return Forbid();

            return Ok(complaint);
        }

        // POST: api/complaint — Student or Parent submits
        [HttpPost]
        [Authorize(Roles = "Student,Parent")]
        public async Task<IActionResult> SubmitComplaint([FromBody] SubmitComplaintDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var currentUserId = GetCurrentUserId();

            var complaint = new Complaint
            {
                SubmittedByUserId = currentUserId,
                Category          = dto.Category,
                Description       = dto.Description,
                AssignedToUserId  = dto.AssignedToUserId,
                Status            = ComplaintStatus.Submitted,
                DateSubmitted     = DateTime.UtcNow
            };

            _context.Complaints.Add(complaint);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetComplaint), new { id = complaint.ComplaintId },
                new { message = "Complaint submitted successfully.", complaint.ComplaintId });
        }

        // PATCH: api/complaint/{id}/status — Teacher/Admin updates status
        [HttpPatch("{id}/status")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateComplaintStatusDto dto)
        {
            var complaint = await _context.Complaints.FindAsync(id);
            if (complaint == null)
                return NotFound(new { message = "Complaint not found." });

            if (complaint.Status == ComplaintStatus.Closed)
                return BadRequest(new { message = "Cannot update a closed complaint." });

            complaint.Status = dto.Status;
            if (!string.IsNullOrWhiteSpace(dto.Remarks))
                complaint.Remarks = dto.Remarks;

            if (dto.Status == ComplaintStatus.Closed || dto.Status == ComplaintStatus.Resolved)
                complaint.DateClosed = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Complaint status updated.", complaint.Status });
        }

        // PATCH: api/complaint/{id}/assign — Admin assigns to a staff member
        [HttpPatch("{id}/assign")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AssignComplaint(int id, [FromBody] AssignComplaintDto dto)
        {
            var complaint = await _context.Complaints.FindAsync(id);
            if (complaint == null)
                return NotFound(new { message = "Complaint not found." });

            var assigneeExists = await _context.Users
                .AnyAsync(u => u.UserId == dto.AssignedToUserId &&
                               (u.Role == UserRole.Teacher || u.Role == UserRole.Admin));
            if (!assigneeExists)
                return BadRequest(new { message = "Assignee must be a Teacher or Admin." });

            complaint.AssignedToUserId = dto.AssignedToUserId;
            complaint.Status = ComplaintStatus.UnderReview;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Complaint assigned successfully." });
        }

        // DELETE: api/complaint/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteComplaint(int id)
        {
            var complaint = await _context.Complaints.FindAsync(id);
            if (complaint == null)
                return NotFound(new { message = "Complaint not found." });

            _context.Complaints.Remove(complaint);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Complaint deleted." });
        }
    }

    public class SubmitComplaintDto
    {
        public string Category { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int? AssignedToUserId { get; set; }
    }

    public class UpdateComplaintStatusDto
    {
        public ComplaintStatus Status { get; set; }
        public string? Remarks { get; set; }
    }

    public class AssignComplaintDto
    {
        public int AssignedToUserId { get; set; }
    }
}
