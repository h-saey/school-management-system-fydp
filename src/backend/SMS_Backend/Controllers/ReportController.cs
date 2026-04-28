using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SMS_Backend.Data;
using SMS_Backend.Models;
using System.Security.Claims;
using System.Text;
using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;

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

        private int GetCurrentUserId()
            => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // ---------------- GET ALL REPORTS ----------------
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
                    GeneratedBy = r.Admin != null
                        ? new { r.Admin.FirstName, r.Admin.LastName }
                        : null
                })
                .OrderByDescending(r => r.GeneratedOn)
                .ToListAsync();

            return Ok(reports);
        }

        // ---------------- GET SINGLE REPORT ----------------
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

        // ---------------- ATTENDANCE REPORT ----------------
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

            if (from.HasValue)
                query = query.Where(a => a.Date >= from.Value);

            if (to.HasValue)
                query = query.Where(a => a.Date <= to.Value);

            var records = await query
                .OrderBy(a => a.Student.RollNumber)
                .ToListAsync();

            var sb = new StringBuilder();
            sb.AppendLine("ATTENDANCE REPORT");
            sb.AppendLine($"Generated: {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC");
            sb.AppendLine(new string('-', 60));

            foreach (var a in records)
            {
                if (a.Student == null) continue;

                sb.AppendLine($"{a.Student.RollNumber} | " +
                              $"{a.Student.FirstName} {a.Student.LastName} | " +
                              $"{a.Date:yyyy-MM-dd} | {a.Status}");
            }

            sb.AppendLine($"Total Records: {records.Count}");

            return await SaveAndReturnReport("Attendance", sb.ToString());
        }

        // ---------------- MARKS REPORT ----------------
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
            sb.AppendLine(new string('-', 70));

            foreach (var m in records)
            {
                if (m.Student == null) continue;

                sb.AppendLine($"{m.Student.RollNumber} | " +
                              $"{m.Student.FirstName} {m.Student.LastName} | " +
                              $"{m.Subject} | {m.Exam} | " +
                              $"{m.MarksObtained}/{m.TotalMarks} | {m.Percentage}%");
            }

            if (records.Any())
            {
                var avg = records.Average(x => (double)x.Percentage);
                sb.AppendLine($"Class Average: {avg:F1}%");
            }
            else
            {
                sb.AppendLine("Class Average: N/A");
            }

            return await SaveAndReturnReport("Marks", sb.ToString());
        }

        // ---------------- RISK REPORT ----------------
        [HttpPost("risk")]
        public async Task<IActionResult> GenerateRiskReport([FromQuery] RiskLevel? level)
        {
            var query = _context.RiskMonitorings
                .Include(r => r.Student)
                .AsQueryable();

            if (level.HasValue)
                query = query.Where(r => r.RiskLevel == level.Value);

            var latest = await query
                .GroupBy(r => r.StudentId)
                .Select(g => g.OrderByDescending(r => r.MonitoredOn).First())
                .ToListAsync();

            var sb = new StringBuilder();
            sb.AppendLine("RISK REPORT");
            sb.AppendLine($"Generated: {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC");
            sb.AppendLine(new string('-', 70));

            foreach (var r in latest)
            {
                if (r.Student == null) continue;

                sb.AppendLine($"{r.Student.RollNumber} | " +
                              $"{r.Student.FirstName} {r.Student.LastName} | " +
                              $"{r.Student.Class} | {r.RiskLevel} | " +
                              $"{r.MonitoredOn:yyyy-MM-dd}");
            }

            sb.AppendLine($"High: {latest.Count(x => x.RiskLevel == RiskLevel.High)}");
            sb.AppendLine($"Medium: {latest.Count(x => x.RiskLevel == RiskLevel.Medium)}");
            sb.AppendLine($"Low: {latest.Count(x => x.RiskLevel == RiskLevel.Low)}");

            return await SaveAndReturnReport("Risk", sb.ToString());
        }

        // ---------------- PORTFOLIO REPORT ----------------
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
            sb.AppendLine("PORTFOLIO REPORT");
            sb.AppendLine($"Generated: {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC");
            sb.AppendLine(new string('-', 60));

            foreach (var p in portfolios)
            {
                if (p.Student == null) continue;

                sb.AppendLine($"{p.Student.FirstName} {p.Student.LastName} | {p.Student.Class}");
                sb.AppendLine($"Attendance: {p.AttendanceSummary ?? "N/A"}");
                sb.AppendLine($"Marks: {p.MarksSummary ?? "N/A"}");
                sb.AppendLine($"Achievements: {p.AchievementsSummary ?? "N/A"}");
                sb.AppendLine($"Behavior: {p.BehaviorSummary ?? "N/A"}");
                sb.AppendLine(new string('-', 40));
            }

            return await SaveAndReturnReport("Portfolio", sb.ToString());
        }

        // ---------------- DELETE REPORT ----------------
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

        // ---------------- DOWNLOAD REPORT ----------------
        [HttpGet("download")]
        public IActionResult Download([FromQuery] string path)
        {
            if (string.IsNullOrEmpty(path))
                return BadRequest("Invalid path");

            var fullPath = Path.Combine(Directory.GetCurrentDirectory(), path);

            if (!System.IO.File.Exists(fullPath))
                return NotFound("File not found");

            var bytes = System.IO.File.ReadAllBytes(fullPath);

            return File(bytes, "application/pdf", Path.GetFileName(fullPath));
        }

        // ---------------- SAVE + GENERATE PDF ----------------
        private async Task<IActionResult> SaveAndReturnReport(string type, string content)
        {
            var currentUserId = GetCurrentUserId();
            var admin = await _context.Admins.FirstOrDefaultAsync(a => a.UserId == currentUserId);

            if (admin == null)
                return BadRequest(new { message = "Admin profile not found." });

            var fileName = $"{type}_Report_{DateTime.UtcNow:yyyyMMdd_HHmmss}.pdf";
            var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "Reports");

            if (!Directory.Exists(folderPath))
                Directory.CreateDirectory(folderPath);

            var filePath = Path.Combine(folderPath, fileName);
            var writer = new PdfWriter(filePath, new WriterProperties());

            using (var pdf = new PdfDocument(writer))
            using (var doc = new Document(pdf))
            {
                doc.Add(new Paragraph($"{type.ToUpper()} REPORT"));
                doc.Add(new Paragraph($"Generated: {DateTime.UtcNow} UTC"));
                doc.Add(new Paragraph("-----------------------------------"));
                doc.Add(new Paragraph(content));
            }

            var report = new Report
            {
                AdminId = admin.AdminId,
                Type = type,
                GeneratedOn = DateTime.UtcNow,
                FilePath = Path.Combine("Reports", fileName)
            };

            _context.Reports.Add(report);
            await _context.SaveChangesAsync();

            var bytes = await System.IO.File.ReadAllBytesAsync(filePath);

            return File(bytes, "application/pdf", fileName);
        }
    }
}
