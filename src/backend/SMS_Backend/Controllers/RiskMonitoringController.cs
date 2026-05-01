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
    public class RiskMonitoringController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RiskMonitoringController(ApplicationDbContext context)
        {
            _context = context;
        }

        private int GetCurrentUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        private string GetCurrentUserRole() =>
            User.FindFirstValue(ClaimTypes.Role)!;

        // GET: api/riskmonitoring
        [HttpGet]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> GetAllRiskRecords([FromQuery] RiskLevel? level)
        {
            var query = _context.RiskMonitorings
                .Include(r => r.Student)
                .AsQueryable();

            if (level.HasValue) query = query.Where(r => r.RiskLevel == level.Value);

            var result = await query
                .OrderByDescending(r => r.MonitoredOn)
                .Select(r => new
                {
                    r.RiskId,
                    r.RiskLevel,
                    r.MonitoredOn,
                    r.Notes,
                    Student = new
                    {
                        r.Student.StudentId,
                        r.Student.FirstName,
                        r.Student.LastName,
                        r.Student.Class,
                        r.Student.RollNumber
                    }
                })
                .ToListAsync();

            return Ok(result);
        }

        // GET: api/riskmonitoring/student/{studentId}
        [HttpGet("student/{studentId}")]
        [Authorize(Roles = "Admin,Teacher,Parent")]
        public async Task<IActionResult> GetStudentRiskHistory(int studentId)
        {
            var role = GetCurrentUserRole();
            if (role == "Parent")
            {
                var currentUserId = GetCurrentUserId();
                var isLinked = await _context.Parents
                    .AnyAsync(p => p.UserId == currentUserId && p.StudentId == studentId);
                if (!isLinked) return Forbid();
            }

            var records = await _context.RiskMonitorings
                .Where(r => r.StudentId == studentId)
                .OrderByDescending(r => r.MonitoredOn)
                .Select(r => new { r.RiskId, r.RiskLevel, r.MonitoredOn, r.Notes })
                .ToListAsync();

            return Ok(records);
        }

        // GET: api/riskmonitoring/student/{studentId}/latest
        [HttpGet("student/{studentId}/latest")]
        [Authorize(Roles = "Admin,Teacher,Parent")]
        public async Task<IActionResult> GetLatestRisk(int studentId)
        {
            var role = GetCurrentUserRole();
            if (role == "Parent")
            {
                var currentUserId = GetCurrentUserId();
                var isLinked = await _context.Parents
                    .AnyAsync(p => p.UserId == currentUserId && p.StudentId == studentId);
                if (!isLinked) return Forbid();
            }

            var latest = await _context.RiskMonitorings
                .Where(r => r.StudentId == studentId)
                .OrderByDescending(r => r.MonitoredOn)
                .FirstOrDefaultAsync();

            if (latest == null)
                return NotFound(new { message = "No risk record found for this student." });

            return Ok(new { latest.RiskId, latest.RiskLevel, latest.MonitoredOn, latest.Notes });
        }

        // POST: api/riskmonitoring/assess/{studentId}
        // Auto-calculates risk from attendance, marks, and behavior data
        [HttpPost("assess/{studentId}")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> AssessRisk(int studentId)
        {
            var student = await _context.Students.FindAsync(studentId);
            if (student == null)
                return NotFound(new { message = "Student not found." });

            // ── Attendance Score ───────────────────────────────────────────
            var totalDays = await _context.Attendances.CountAsync(a => a.StudentId == studentId);
            var presentDays = await _context.Attendances
                .CountAsync(a => a.StudentId == studentId && a.Status == AttendanceStatus.Present);
            double attendanceRate = totalDays > 0 ? (double)presentDays / totalDays * 100 : 100;

            // ── Marks Score ────────────────────────────────────────────────
            var marks = await _context.Marks
                .Where(m => m.StudentId == studentId)
                .ToListAsync();
            double avgPercentage = marks.Any()
                ? marks.Average(m => (double)(m.TotalMarks > 0 ? m.MarksObtained / m.TotalMarks * 100 : 0))
                : 100;

            // ── Behavior Score ─────────────────────────────────────────────
            var negativeRemarks = await _context.BehaviorRemarks
                .CountAsync(b => b.StudentId == studentId && b.RemarkType == "Negative");

            // ── Risk Calculation Logic ─────────────────────────────────────
            RiskLevel calculatedRisk;
            var notes = new List<string>();

            if (attendanceRate < 60)  notes.Add($"Attendance critically low ({attendanceRate:F1}%).");
            if (avgPercentage < 40)   notes.Add($"Academic performance critically low ({avgPercentage:F1}%).");
            if (negativeRemarks >= 5) notes.Add($"High number of negative behavior remarks ({negativeRemarks}).");

            if (notes.Count >= 2 || attendanceRate < 50 || avgPercentage < 35)
                calculatedRisk = RiskLevel.High;
            else if (attendanceRate < 75 || avgPercentage < 55 || negativeRemarks >= 3)
                calculatedRisk = RiskLevel.Medium;
            else
                calculatedRisk = RiskLevel.Low;

            var riskRecord = new RiskMonitoring
            {
                StudentId   = studentId,
                RiskLevel   = calculatedRisk,
                MonitoredOn = DateTime.UtcNow,
                Notes       = notes.Any() ? string.Join(" ", notes) : "No significant risk factors detected."
            };

            _context.RiskMonitorings.Add(riskRecord);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message       = "Risk assessment completed.",
                riskRecord.RiskId,
                riskRecord.RiskLevel,
                riskRecord.Notes,
                Metrics = new
                {
                    AttendanceRate    = $"{attendanceRate:F1}%",
                    AveragePercentage = $"{avgPercentage:F1}%",
                    NegativeRemarks   = negativeRemarks
                }
            });
        }

        // POST: api/riskmonitoring/manual — Teacher adds manual override
        [HttpPost("manual")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> AddManualRisk([FromBody] ManualRiskDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var studentExists = await _context.Students.AnyAsync(s => s.StudentId == dto.StudentId);
            if (!studentExists)
                return BadRequest(new { message = "Student not found." });

            var riskRecord = new RiskMonitoring
            {
                StudentId   = dto.StudentId,
                RiskLevel   = dto.RiskLevel,
                MonitoredOn = DateTime.UtcNow,
                Notes       = dto.Notes
            };

            _context.RiskMonitorings.Add(riskRecord);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetStudentRiskHistory),
                new { studentId = dto.StudentId },
                new { message = "Manual risk record added.", riskRecord.RiskId });
        }

        // PUT: api/riskmonitoring/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> UpdateRisk(int id, [FromBody] UpdateRiskDto dto)
        {
            var record = await _context.RiskMonitorings.FindAsync(id);
            if (record == null)
                return NotFound(new { message = "Risk record not found." });

            record.RiskLevel = dto.RiskLevel;
            if (!string.IsNullOrWhiteSpace(dto.Notes)) record.Notes = dto.Notes;
            record.MonitoredOn = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Risk record updated." });
        }

        // DELETE: api/riskmonitoring/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteRisk(int id)
        {
            var record = await _context.RiskMonitorings.FindAsync(id);
            if (record == null)
                return NotFound(new { message = "Risk record not found." });

            _context.RiskMonitorings.Remove(record);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Risk record deleted." });
        }

        // POST: api/riskmonitoring/assess-all — Admin runs bulk assessment for all students
        [HttpPost("assess-all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AssessAllStudents()
        {
            var students = await _context.Students.Select(s => s.StudentId).ToListAsync();
            var processed = 0;

            foreach (var studentId in students)
            {
                var totalDays = await _context.Attendances.CountAsync(a => a.StudentId == studentId);
                var presentDays = await _context.Attendances
                    .CountAsync(a => a.StudentId == studentId && a.Status == AttendanceStatus.Present);
                double attendanceRate = totalDays > 0 ? (double)presentDays / totalDays * 100 : 100;

                var marks = await _context.Marks.Where(m => m.StudentId == studentId).ToListAsync();
                double avgPct = marks.Any()
                    ? marks.Average(m => (double)(m.TotalMarks > 0 ? m.MarksObtained / m.TotalMarks * 100 : 0))
                    : 100;

                var negRemarks = await _context.BehaviorRemarks
                    .CountAsync(b => b.StudentId == studentId && b.RemarkType == "Negative");

                RiskLevel level;
                if (attendanceRate < 50 || avgPct < 35 || negRemarks >= 5) level = RiskLevel.High;
                else if (attendanceRate < 75 || avgPct < 55 || negRemarks >= 3) level = RiskLevel.Medium;
                else level = RiskLevel.Low;

                _context.RiskMonitorings.Add(new RiskMonitoring
                {
                    StudentId   = studentId,
                    RiskLevel   = level,
                    MonitoredOn = DateTime.UtcNow,
                    Notes       = "Bulk auto-assessment."
                });
                processed++;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = $"Risk assessment completed for {processed} student(s)." });
        }
    }

    public class ManualRiskDto
    {
        public int StudentId { get; set; }
        public RiskLevel RiskLevel { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateRiskDto
    {
        public RiskLevel RiskLevel { get; set; }
        public string? Notes { get; set; }
    }
}
