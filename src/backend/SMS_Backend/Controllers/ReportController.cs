using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SMS_Backend.Data;
using SMS_Backend.Models;
using System.Security.Claims;
using System.Text;

namespace SMS_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class ReportController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReportController(ApplicationDbContext context)
        {
            _context = context;
        }

        private int GetCurrentUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // GET: api/report
        [HttpGet]
        public async Task<IActionResult> GetAllReports()
        {
            var reports = await _context.Reports
                .Include(r => r.Admin)
                .Select(r => new
                {
                    r.ReportId,
                    r.Type,
                    r.GeneratedOn,
                    r.FilePath,
                    GeneratedBy = new { r.Admin.FirstName, r.Admin.LastName }
                })
                .OrderByDescending(r => r.GeneratedOn)
                .ToListAsync();

            return Ok(reports);
        }

        // GET: api/report/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetReport(int id)
        {
            var report = await _context.Reports
                .Include(r => r.Admin)
                .FirstOrDefaultAsync(r => r.ReportId == id);

            if (report == null)
                return NotFound(new { message = "Report not found." });

            return Ok(report);
        }

        // POST: api/report/attendance — Generate attendance report
        [HttpPost("attendance")]
        public async Task<IActionResult> GenerateAttendanceReport(
            [FromQuery] string? className,
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to)
        {
            var query = _context.Attendances
                .Include(a => a.Student)
                .AsQueryable();

            if (!string.IsNullOrEmpty(className))
                query = query.Where(a => a.Student.Class == className);
            if (from.HasValue) query = query.Where(a => a.Date >= from.Value);
            if (to.HasValue)   query = query.Where(a => a.Date <= to.Value);

            var records = await query
                .OrderBy(a => a.Student.RollNumber)
                .ThenBy(a => a.Date)
                .ToListAsync();

            var sb = new StringBuilder();
            sb.AppendLine("ATTENDANCE REPORT");
            sb.AppendLine($"Generated: {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC");
            if (!string.IsNullOrEmpty(className)) sb.AppendLine($"Class: {className}");
            if (from.HasValue) sb.AppendLine($"From: {from.Value:yyyy-MM-dd}");
            if (to.HasValue)   sb.AppendLine($"To:   {to.Value:yyyy-MM-dd}");
            sb.AppendLine(new string('-', 60));
            sb.AppendLine($"{"Roll No",-12} {"Name",-25} {"Date",-12} {"Status"}");
            sb.AppendLine(new string('-', 60));

            foreach (var a in records)
            {
                sb.AppendLine($"{a.Student.RollNumber,-12} " +
                              $"{a.Student.FirstName + " " + a.Student.LastName,-25} " +
                              $"{a.Date:yyyy-MM-dd,-12} {a.Status}");
            }

            sb.AppendLine(new string('-', 60));
            sb.AppendLine($"Total Records: {records.Count}");

            return await SaveAndReturnReport("Attendance", sb.ToString());
        }

        // POST: api/report/marks — Generate marks report
        [HttpPost("marks")]
        public async Task<IActionResult> GenerateMarksReport(
            [FromQuery] string? className,
            [FromQuery] string? subject,
            [FromQuery] string? exam)
        {
            var query = _context.Marks
                .Include(m => m.Student)
                .AsQueryable();

            if (!string.IsNullOrEmpty(className))
                query = query.Where(m => m.Student.Class == className);
            if (!string.IsNullOrEmpty(subject))
                query = query.Where(m => m.Subject == subject);
            if (!string.IsNullOrEmpty(exam))
                query = query.Where(m => m.Exam == exam);

            var records = await query
                .OrderBy(m => m.Student.RollNumber)
                .ToListAsync();

            var sb = new StringBuilder();
            sb.AppendLine("MARKS REPORT");
            sb.AppendLine($"Generated: {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC");
            if (!string.IsNullOrEmpty(className)) sb.AppendLine($"Class: {className}");
            if (!string.IsNullOrEmpty(subject))   sb.AppendLine($"Subject: {subject}");
            if (!string.IsNullOrEmpty(exam))      sb.AppendLine($"Exam: {exam}");
            sb.AppendLine(new string('-', 70));
            sb.AppendLine($"{"Roll No",-12} {"Name",-25} {"Subject",-15} {"Exam",-12} {"Marks",-10} {"Pct"}");
            sb.AppendLine(new string('-', 70));

            foreach (var m in records)
            {
                sb.AppendLine($"{m.Student.RollNumber,-12} " +
                              $"{m.Student.FirstName + " " + m.Student.LastName,-25} " +
                              $"{m.Subject,-15} {m.Exam,-12} " +
                              $"{m.MarksObtained}/{m.TotalMarks,-6} {m.Percentage:F1}%");
            }

            sb.AppendLine(new string('-', 70));
            if (records.Any())
            {
                double overallAvg = records.Average(m => (double)m.Percentage);
                sb.AppendLine($"Class Average: {overallAvg:F1}%");
            }
            sb.AppendLine($"Total Records: {records.Count}");

            return await SaveAndReturnReport("Marks", sb.ToString());
        }

        // POST: api/report/risk — Generate student risk report
        [HttpPost("risk")]
        public async Task<IActionResult> GenerateRiskReport([FromQuery] RiskLevel? level)
        {
            var query = _context.RiskMonitorings
                .Include(r => r.Student)
                .AsQueryable();

            if (level.HasValue) query = query.Where(r => r.RiskLevel == level.Value);

            // Get the latest risk record per student
            var latest = await query
                .GroupBy(r => r.StudentId)
                .Select(g => g.OrderByDescending(r => r.MonitoredOn).First())
                .ToListAsync();

            var sb = new StringBuilder();
            sb.AppendLine("STUDENT RISK MONITORING REPORT");
            sb.AppendLine($"Generated: {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC");
            if (level.HasValue) sb.AppendLine($"Filter: {level.Value} risk only");
            sb.AppendLine(new string('-', 70));
            sb.AppendLine($"{"Roll No",-12} {"Name",-25} {"Class",-10} {"Risk Level",-12} {"Assessed On"}");
            sb.AppendLine(new string('-', 70));

            foreach (var r in latest.OrderByDescending(r => r.RiskLevel))
            {
                sb.AppendLine($"{r.Student.RollNumber,-12} " +
                              $"{r.Student.FirstName + " " + r.Student.LastName,-25} " +
                              $"{r.Student.Class,-10} {r.RiskLevel,-12} {r.MonitoredOn:yyyy-MM-dd}");
            }

            sb.AppendLine(new string('-', 70));
            sb.AppendLine($"High Risk:   {latest.Count(r => r.RiskLevel == RiskLevel.High)}");
            sb.AppendLine($"Medium Risk: {latest.Count(r => r.RiskLevel == RiskLevel.Medium)}");
            sb.AppendLine($"Low Risk:    {latest.Count(r => r.RiskLevel == RiskLevel.Low)}");
            sb.AppendLine($"Total: {latest.Count}");

            return await SaveAndReturnReport("Risk", sb.ToString());
        }

        // POST: api/report/portfolio — Generate portfolio summary report
        [HttpPost("portfolio")]
        public async Task<IActionResult> GeneratePortfolioReport([FromQuery] string? className)
        {
            var query = _context.StudentPortfolios
                .Include(p => p.Student)
                .AsQueryable();

            if (!string.IsNullOrEmpty(className))
                query = query.Where(p => p.Student.Class == className);

            var portfolios = await query
                .OrderBy(p => p.Student.RollNumber)
                .ToListAsync();

            var sb = new StringBuilder();
            sb.AppendLine("STUDENT PORTFOLIO SUMMARY REPORT");
            sb.AppendLine($"Generated: {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC");
            if (!string.IsNullOrEmpty(className)) sb.AppendLine($"Class: {className}");
            sb.AppendLine(new string('=', 60));

            foreach (var p in portfolios)
            {
                sb.AppendLine($"Student: {p.Student.FirstName} {p.Student.LastName} | Roll: {p.Student.RollNumber} | Class: {p.Student.Class}");
                sb.AppendLine($"  Attendance  : {p.AttendanceSummary ?? "N/A"}");
                sb.AppendLine($"  Marks       : {p.MarksSummary ?? "N/A"}");
                sb.AppendLine($"  Achievements: {p.AchievementsSummary ?? "N/A"}");
                sb.AppendLine($"  Behavior    : {p.BehaviorSummary ?? "N/A"}");
                sb.AppendLine(new string('-', 60));
            }

            sb.AppendLine($"Total Students: {portfolios.Count}");

            return await SaveAndReturnReport("Portfolio", sb.ToString());
        }

        // DELETE: api/report/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReport(int id)
        {
            var report = await _context.Reports.FindAsync(id);
            if (report == null)
                return NotFound(new { message = "Report not found." });

            _context.Reports.Remove(report);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Report deleted." });
        }

        // ── Private Helper ─────────────────────────────────────────────────
        private async Task<IActionResult> SaveAndReturnReport(string type, string content)
        {
            var currentUserId = GetCurrentUserId();
            var admin = await _context.Admins.FirstOrDefaultAsync(a => a.UserId == currentUserId);
            if (admin == null)
                return BadRequest(new { message = "Admin profile not found." });

            var fileName = $"{type}_Report_{DateTime.UtcNow:yyyyMMdd_HHmmss}.txt";
            var filePath = Path.Combine("Reports", fileName);

            // Persist report metadata to DB
            var report = new Report
            {
                AdminId     = admin.AdminId,
                Type        = type,
                GeneratedOn = DateTime.UtcNow,
                FilePath    = filePath
            };

            _context.Reports.Add(report);
            await _context.SaveChangesAsync();

            // Return as downloadable file
            var bytes = Encoding.UTF8.GetBytes(content);
            return File(bytes, "text/plain", fileName);
        }
    }
}
