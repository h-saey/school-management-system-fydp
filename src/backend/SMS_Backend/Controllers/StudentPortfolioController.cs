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
    [Authorize]
    public class StudentPortfolioController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public StudentPortfolioController(ApplicationDbContext context)
        {
            _context = context;
        }

        private int GetCurrentUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        private string GetCurrentUserRole() =>
            User.FindFirstValue(ClaimTypes.Role)!;

        // ── GET api/studentportfolio ─────────────────────────────────────
        [HttpGet]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> GetAllPortfolios()
        {
            var portfolios = await _context.StudentPortfolios
                .Include(p => p.Student)
                .Select(p => new
                {
                    p.PortfolioId,
                    p.GeneratedOn,
                    p.LastUpdated,
                    Student = new
                    {
                        p.Student.FirstName,
                        p.Student.LastName,
                        p.Student.RollNumber,
                        p.Student.Class
                    }
                })
                .ToListAsync();

            return Ok(portfolios);
        }

        // ── GET api/studentportfolio/my ─────────────────────────────────
        [HttpGet("my")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetMyPortfolio()
        {
            var currentUserId = GetCurrentUserId();
            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.UserId == currentUserId);

            if (student == null)
                return NotFound(new { message = "Student profile not found." });

            var portfolio = await _context.StudentPortfolios
                .FirstOrDefaultAsync(p => p.StudentId == student.StudentId);

            //if (portfolio == null)
            //    return NotFound(new { message = "Portfolio not yet generated. Please ask your teacher or admin." });
            if (portfolio == null)
            {
                portfolio = await GeneratePortfolio(student.StudentId);
                _context.StudentPortfolios.Add(portfolio);
            }
            else
            {
                portfolio = await GeneratePortfolio(student.StudentId, portfolio);
            }

            await _context.SaveChangesAsync();



            return Ok(portfolio);
        }
        private async Task<StudentPortfolio> GeneratePortfolio(int studentId, StudentPortfolio? existing = null)
        {
            var attendances = await _context.Attendances
                .Where(a => a.StudentId == studentId)
                .ToListAsync();

            int total = attendances.Count;
            int present = attendances.Count(a => a.Status == AttendanceStatus.Present);
            int absent = attendances.Count(a => a.Status == AttendanceStatus.Absent);
            int late = attendances.Count(a => a.Status == AttendanceStatus.Late);

            double attPct = total > 0
                ? Math.Round((double)(present + late) / total * 100, 1)
                : 0;

            var marks = await _context.Marks
                .Where(m => m.StudentId == studentId)
                .ToListAsync();

            double avgMarks = marks.Count > 0
                ? Math.Round(marks.Average(m => (double)m.MarksObtained / (double)m.TotalMarks * 100), 1)
                : 0;

            var achievements = await _context.Achievements
                .Where(a => a.StudentId == studentId)
                .ToListAsync();

            var remarks = await _context.BehaviorRemarks
                .Where(r => r.StudentId == studentId)
                .ToListAsync();

            var portfolio = existing ?? new StudentPortfolio
            {
                StudentId = studentId,
                GeneratedOn = DateTime.UtcNow
            };

            portfolio.AttendanceSummary =
                $"Total: {total}, Present: {present}, Absent: {absent}, Late: {late}, Rate: {attPct}%";

            portfolio.MarksSummary =
                $"Exams: {marks.Count}, Avg: {avgMarks}%";

            portfolio.AchievementsSummary =
                $"Achievements: {achievements.Count}";

            portfolio.BehaviorSummary =
                $"Remarks: {remarks.Count}";

            portfolio.LastUpdated = DateTime.UtcNow;

            return portfolio;
        }


        // ── GET api/studentportfolio/student/{studentId} ─────────────────
        [HttpGet("student/{studentId}")]
        [Authorize(Roles = "Admin,Teacher,Parent")]
        public async Task<IActionResult> GetStudentPortfolio(int studentId)
        {
            var role = GetCurrentUserRole();
            if (role == "Parent")
            {
                var currentUserId = GetCurrentUserId();
                var isLinked = await _context.Parents
                    .AnyAsync(p => p.UserId == currentUserId && p.StudentId == studentId);
                if (!isLinked) return Forbid();
            }

            var portfolio = await _context.StudentPortfolios
                .Include(p => p.Student)
                .FirstOrDefaultAsync(p => p.StudentId == studentId);

            if (portfolio == null)
                return NotFound(new { message = "Portfolio not found. Run compile first." });

            return Ok(portfolio);
        }

        // ── POST api/studentportfolio/compile/{studentId} ────────────────
        // Aggregates Attendance, Marks, Achievements, BehaviorRemarks into summaries
        [HttpPost("compile/{studentId}")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> CompilePortfolio(int studentId)
        {
            var student = await _context.Students.FindAsync(studentId);
            if (student == null)
                return NotFound(new { message = "Student not found." });

            // ── Attendance Summary ─────────────────────────────────────
            var attendances = await _context.Attendances
                .Where(a => a.StudentId == studentId)
                .ToListAsync();

            int total = attendances.Count;
            int present = attendances.Count(a => a.Status == AttendanceStatus.Present);
            int absent = attendances.Count(a => a.Status == AttendanceStatus.Absent);
            int late = attendances.Count(a => a.Status == AttendanceStatus.Late);
            double attPct = total > 0 ? Math.Round((double)(present + late) / total * 100, 1) : 0;

            var attendanceSummary =
                $"Total Days: {total} | Present: {present} | Absent: {absent} | Late: {late} | Rate: {attPct}%";

            // ── Marks Summary ──────────────────────────────────────────
            var marks = await _context.Marks
                .Where(m => m.StudentId == studentId)
                .ToListAsync();

            var marksSb = new StringBuilder();
            if (marks.Count == 0)
            {
                marksSb.Append("No marks recorded yet.");
            }
            else
            {
                double avgPct = marks.Average(m => (double)m.MarksObtained / (double)m.TotalMarks * 100);
                marksSb.Append($"Total Exams: {marks.Count} | Overall Average: {Math.Round(avgPct, 1)}%\n");

                // Subject breakdown
                var bySubject = marks
                    .GroupBy(m => m.Subject)
                    .Select(g => new
                    {
                        Subject = g.Key,
                        Avg = Math.Round(g.Average(m => (double)m.MarksObtained / (double)m.TotalMarks * 100), 1)
                    });
                foreach (var s in bySubject)
                    marksSb.Append($"  {s.Subject}: {s.Avg}%\n");
            }

            // ── Achievements Summary ───────────────────────────────────
            var achievements = await _context.Achievements
                .Where(a => a.StudentId == studentId)
                .ToListAsync();

            var achievSb = new StringBuilder();
            if (achievements.Count == 0)
            {
                achievSb.Append("No achievements recorded yet.");
            }
            else
            {
                achievSb.Append($"Total Achievements: {achievements.Count}\n");
                foreach (var a in achievements)
                    achievSb.Append($"  [{a.Category}] {a.Title} — {a.Date:yyyy-MM-dd}\n");
            }

            // ── Behavior Summary ───────────────────────────────────────
            var remarks = await _context.BehaviorRemarks
                .Where(r => r.StudentId == studentId)
                .ToListAsync();

            var behavSb = new StringBuilder();
            if (remarks.Count == 0)
            {
                behavSb.Append("No behavior remarks recorded yet.");
            }
            else
            {
                int positive = remarks.Count(r => r.RemarkType == "Positive");
                int negative = remarks.Count(r => r.RemarkType == "Negative");
                int neutral = remarks.Count(r => r.RemarkType == "Neutral");
                behavSb.Append($"Total Remarks: {remarks.Count} | Positive: {positive} | Negative: {negative} | Neutral: {neutral}");
            }

            // ── Upsert portfolio ──────────────────────────────────────
            var portfolio = await _context.StudentPortfolios
                .FirstOrDefaultAsync(p => p.StudentId == studentId);

            if (portfolio == null)
            {
                portfolio = new StudentPortfolio
                {
                    StudentId = studentId,
                    AttendanceSummary = attendanceSummary,
                    MarksSummary = marksSb.ToString(),
                    AchievementsSummary = achievSb.ToString(),
                    BehaviorSummary = behavSb.ToString(),
                    GeneratedOn = DateTime.UtcNow,
                    LastUpdated = DateTime.UtcNow
                };
                _context.StudentPortfolios.Add(portfolio);
            }
            else
            {
                portfolio.AttendanceSummary = attendanceSummary;
                portfolio.MarksSummary = marksSb.ToString();
                portfolio.AchievementsSummary = achievSb.ToString();
                portfolio.BehaviorSummary = behavSb.ToString();
                portfolio.LastUpdated = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Portfolio compiled successfully.", portfolio });
        }
    }
}
//using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.Mvc;
//using Microsoft.EntityFrameworkCore;
//using SMS_Backend.Data;
//using SMS_Backend.Models;
//using System.Security.Claims;
//using System.Text;

//namespace SMS_Backend.Controllers
//{
//    [ApiController]
//    [Route("api/[controller]")]
//    [Authorize]
//    public class StudentPortfolioController : ControllerBase
//    {
//        private readonly ApplicationDbContext _context;

//        public StudentPortfolioController(ApplicationDbContext context)
//        {
//            _context = context;
//        }

//        private int GetCurrentUserId() =>
//            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

//        private string GetCurrentUserRole() =>
//            User.FindFirstValue(ClaimTypes.Role)!;

//        // GET: api/studentportfolio
//        [HttpGet]
//        [Authorize(Roles = "Admin,Teacher")]
//        public async Task<IActionResult> GetAllPortfolios()
//        {
//            var portfolios = await _context.StudentPortfolios
//                .Include(p => p.Student)
//                .Select(p => new
//                {
//                    p.PortfolioId,
//                    p.GeneratedOn,
//                    p.LastUpdated,
//                    Student = new { p.Student.FirstName, p.Student.LastName, p.Student.RollNumber, p.Student.Class }
//                })
//                .ToListAsync();

//            return Ok(portfolios);
//        }

//        // GET: api/studentportfolio/my — Student views own portfolio
//        [HttpGet("my")]
//        [Authorize(Roles = "Student")]
//        public async Task<IActionResult> GetMyPortfolio()
//        {
//            var currentUserId = GetCurrentUserId();
//            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == currentUserId);
//            if (student == null)
//                return NotFound(new { message = "Student profile not found." });

//            var portfolio = await _context.StudentPortfolios
//                .FirstOrDefaultAsync(p => p.StudentId == student.StudentId);

//            if (portfolio == null)
//                return NotFound(new { message = "Portfolio not yet generated. Please ask your teacher or admin." });

//            return Ok(portfolio);
//        }

//        // GET: api/studentportfolio/student/{studentId}
//        [HttpGet("student/{studentId}")]
//        [Authorize(Roles = "Admin,Teacher,Parent")]
//        public async Task<IActionResult> GetStudentPortfolio(int studentId)
//        {
//            var role = GetCurrentUserRole();
//            if (role == "Parent")
//            {
//                var currentUserId = GetCurrentUserId();
//                var isLinked = await _context.Parents
//                    .AnyAsync(p => p.UserId == currentUserId && p.StudentId == studentId);
//                if (!isLinked) return Forbid();
//            }

//            var portfolio = await _context.StudentPortfolios
//                .Include(p => p.Student)
//                .FirstOrDefaultAsync(p => p.StudentId == studentId);

//            if (portfolio == null)
//                return NotFound(new { message = "Portfolio not found. Run compile first." });

//            return Ok(portfolio);
//        }

//        // POST: api/studentportfolio/compile/{studentId}
//        // Aggregates data from Attendance, Marks, Achievements, BehaviorRemarks
//        [HttpPost("compile/{studentId}")]
//        [Authorize(Roles = "Admin,Teacher")]
//        public async Task<IActionResult> CompilePortfolio(int studentId)
//        {
//            var student = await _context.Students.FindAsync(studentId);
//            if (student == null)
//                return NotFound(new { message = "Student not found." });

//            // ── Attendance Summary ─────────────────────────────────────────
//            var attendances = await _context.Attendances
//                .Where(a => a.StudentId == studentId)
//                .ToListAsync();

//            int total   = attendances.Count;
//            int present = attendances.Count(a => a.Status == AttendanceStatus.Present);
//            int absent  = attendances.Count(a => a.Status == AttendanceStatus.Absent);
//            int late    = attendances.Count(a => a.Status == AttendanceStatus.Late);
//            double attRate = total > 0 ? Math.Round((double)present / total * 100, 1) : 0;
//            string attendanceSummary = total == 0
//                ? "No attendance data available."
//                : $"Total days: {total} | Present: {present} | Absent: {absent} | Late: {late} | Attendance Rate: {attRate}%";

//            // ── Marks Summary ──────────────────────────────────────────────
//            var marks = await _context.Marks
//                .Where(m => m.StudentId == studentId)
//                .ToListAsync();

//            string marksSummary;
//            if (!marks.Any())
//            {
//                marksSummary = "No marks data available.";
//            }
//            else
//            {
//                var sb = new StringBuilder();
//                var bySubject = marks.GroupBy(m => m.Subject);
//                foreach (var subjectGroup in bySubject)
//                {
//                    double avg = subjectGroup.Average(m =>
//                        (double)(m.TotalMarks > 0 ? m.MarksObtained / m.TotalMarks * 100 : 0));
//                    sb.Append($"{subjectGroup.Key}: {avg:F1}% avg ({subjectGroup.Count()} exam(s)). ");
//                }
//                double overall = marks.Average(m =>
//                    (double)(m.TotalMarks > 0 ? m.MarksObtained / m.TotalMarks * 100 : 0));
//                sb.Append($"Overall Average: {overall:F1}%");
//                marksSummary = sb.ToString();
//            }

//            // ── Achievements Summary ───────────────────────────────────────
//            var achievements = await _context.Achievements
//                .Where(a => a.StudentId == studentId)
//                .ToListAsync();

//            string achievementsSummary = !achievements.Any()
//                ? "No achievements recorded."
//                : $"{achievements.Count} achievement(s): " +
//                  string.Join(", ", achievements.Select(a => $"{a.Title} ({a.Category})"));

//            // ── Behavior Summary ───────────────────────────────────────────
//            var remarks = await _context.BehaviorRemarks
//                .Where(b => b.StudentId == studentId)
//                .ToListAsync();

//            string behaviorSummary;
//            if (!remarks.Any())
//            {
//                behaviorSummary = "No behavior remarks recorded.";
//            }
//            else
//            {
//                int pos = remarks.Count(r => r.RemarkType == "Positive");
//                int neg = remarks.Count(r => r.RemarkType == "Negative");
//                int neu = remarks.Count(r => r.RemarkType == "Neutral");
//                behaviorSummary = $"Total remarks: {remarks.Count} | Positive: {pos} | Negative: {neg} | Neutral: {neu}";
//            }

//            // ── Save or Update Portfolio ───────────────────────────────────
//            var existing = await _context.StudentPortfolios
//                .FirstOrDefaultAsync(p => p.StudentId == studentId);

//            if (existing != null)
//            {
//                existing.AttendanceSummary   = attendanceSummary;
//                existing.MarksSummary        = marksSummary;
//                existing.AchievementsSummary = achievementsSummary;
//                existing.BehaviorSummary     = behaviorSummary;
//                existing.LastUpdated         = DateTime.UtcNow;
//            }
//            else
//            {
//                var portfolio = new StudentPortfolio
//                {
//                    StudentId            = studentId,
//                    AttendanceSummary    = attendanceSummary,
//                    MarksSummary         = marksSummary,
//                    AchievementsSummary  = achievementsSummary,
//                    BehaviorSummary      = behaviorSummary,
//                    GeneratedOn          = DateTime.UtcNow,
//                    LastUpdated          = DateTime.UtcNow
//                };
//                _context.StudentPortfolios.Add(portfolio);
//            }

//            await _context.SaveChangesAsync();
//            return Ok(new
//            {
//                message              = "Portfolio compiled successfully.",
//                AttendanceSummary    = attendanceSummary,
//                MarksSummary         = marksSummary,
//                AchievementsSummary  = achievementsSummary,
//                BehaviorSummary      = behaviorSummary
//            });
//        }

//        // POST: api/studentportfolio/compile-all — Admin compiles for all students
//        [HttpPost("compile-all")]
//        [Authorize(Roles = "Admin")]
//        public async Task<IActionResult> CompileAllPortfolios()
//        {
//            var studentIds = await _context.Students.Select(s => s.StudentId).ToListAsync();
//            int count = 0;

//            foreach (var studentId in studentIds)
//            {
//                // Reuse same logic inline (simplified for bulk)
//                var attendances = await _context.Attendances.Where(a => a.StudentId == studentId).ToListAsync();
//                int total   = attendances.Count;
//                int present = attendances.Count(a => a.Status == AttendanceStatus.Present);
//                double rate = total > 0 ? Math.Round((double)present / total * 100, 1) : 0;

//                var marks = await _context.Marks.Where(m => m.StudentId == studentId).ToListAsync();
//                double avgPct = marks.Any()
//                    ? Math.Round(marks.Average(m => (double)(m.TotalMarks > 0 ? m.MarksObtained / m.TotalMarks * 100 : 0)), 1)
//                    : 0;

//                var achievements = await _context.Achievements.CountAsync(a => a.StudentId == studentId);
//                var remarks = await _context.BehaviorRemarks.Where(b => b.StudentId == studentId).ToListAsync();
//                int pos = remarks.Count(r => r.RemarkType == "Positive");
//                int neg = remarks.Count(r => r.RemarkType == "Negative");

//                var existing = await _context.StudentPortfolios.FirstOrDefaultAsync(p => p.StudentId == studentId);
//                if (existing != null)
//                {
//                    existing.AttendanceSummary   = $"Rate: {rate}% ({present}/{total} days)";
//                    existing.MarksSummary        = $"Overall Avg: {avgPct}%";
//                    existing.AchievementsSummary = $"{achievements} achievement(s)";
//                    existing.BehaviorSummary     = $"Positive: {pos} | Negative: {neg}";
//                    existing.LastUpdated         = DateTime.UtcNow;
//                }
//                else
//                {
//                    _context.StudentPortfolios.Add(new StudentPortfolio
//                    {
//                        StudentId            = studentId,
//                        AttendanceSummary    = $"Rate: {rate}% ({present}/{total} days)",
//                        MarksSummary        = $"Overall Avg: {avgPct}%",
//                        AchievementsSummary = $"{achievements} achievement(s)",
//                        BehaviorSummary     = $"Positive: {pos} | Negative: {neg}",
//                        GeneratedOn         = DateTime.UtcNow,
//                        LastUpdated         = DateTime.UtcNow
//                    });
//                }
//                count++;
//            }

//            await _context.SaveChangesAsync();
//            return Ok(new { message = $"Portfolios compiled for {count} student(s)." });
//        }

//        // GET: api/studentportfolio/student/{studentId}/export — Plain-text export
//        [HttpGet("student/{studentId}/export")]
//        [Authorize(Roles = "Admin,Teacher,Student,Parent")]
//        public async Task<IActionResult> ExportPortfolio(int studentId)
//        {
//            var role = GetCurrentUserRole();
//            var currentUserId = GetCurrentUserId();

//            if (role == "Student")
//            {
//                var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == currentUserId);
//                if (student == null || student.StudentId != studentId) return Forbid();
//            }

//            if (role == "Parent")
//            {
//                var isLinked = await _context.Parents
//                    .AnyAsync(p => p.UserId == currentUserId && p.StudentId == studentId);
//                if (!isLinked) return Forbid();
//            }

//            var portfolio = await _context.StudentPortfolios
//                .Include(p => p.Student)
//                .FirstOrDefaultAsync(p => p.StudentId == studentId);

//            if (portfolio == null)
//                return NotFound(new { message = "Portfolio not found." });

//            var sb = new StringBuilder();
//            sb.AppendLine("===== STUDENT PORTFOLIO =====");
//            sb.AppendLine($"Name       : {portfolio.Student.FirstName} {portfolio.Student.LastName}");
//            sb.AppendLine($"Class      : {portfolio.Student.Class} - {portfolio.Student.Section}");
//            sb.AppendLine($"Roll No    : {portfolio.Student.RollNumber}");
//            sb.AppendLine($"Generated  : {portfolio.GeneratedOn:yyyy-MM-dd}");
//            sb.AppendLine($"Last Update: {portfolio.LastUpdated:yyyy-MM-dd}");
//            sb.AppendLine();
//            sb.AppendLine("--- ATTENDANCE ---");
//            sb.AppendLine(portfolio.AttendanceSummary ?? "N/A");
//            sb.AppendLine();
//            sb.AppendLine("--- ACADEMIC PERFORMANCE ---");
//            sb.AppendLine(portfolio.MarksSummary ?? "N/A");
//            sb.AppendLine();
//            sb.AppendLine("--- ACHIEVEMENTS ---");
//            sb.AppendLine(portfolio.AchievementsSummary ?? "N/A");
//            sb.AppendLine();
//            sb.AppendLine("--- BEHAVIOR ---");
//            sb.AppendLine(portfolio.BehaviorSummary ?? "N/A");
//            sb.AppendLine("=============================");

//            var bytes = Encoding.UTF8.GetBytes(sb.ToString());
//            var fileName = $"Portfolio_{portfolio.Student.LastName}_{portfolio.Student.RollNumber}.txt";
//            return File(bytes, "text/plain", fileName);
//        }

//        // DELETE: api/studentportfolio/{id}
//        [HttpDelete("{id}")]
//        [Authorize(Roles = "Admin")]
//        public async Task<IActionResult> DeletePortfolio(int id)
//        {
//            var portfolio = await _context.StudentPortfolios.FindAsync(id);
//            if (portfolio == null)
//                return NotFound(new { message = "Portfolio not found." });

//            _context.StudentPortfolios.Remove(portfolio);
//            await _context.SaveChangesAsync();
//            return Ok(new { message = "Portfolio deleted." });
//        }
//    }
//}
