using Microsoft.EntityFrameworkCore;
using SMS_Backend.Data;
using SMS_Backend.Models;

namespace SMS_Backend.Services
{
    // ── Risk result returned to controller ──────────────────
    public class RiskResult
    {
        public int    StudentId      { get; set; }
        public string StudentName    { get; set; } = string.Empty;
        public string Class          { get; set; } = string.Empty;
        public string RollNumber     { get; set; } = string.Empty;
        public string RiskLevel      { get; set; } = "Low";   // Low / Medium / High
        public double AttendanceRate { get; set; }
        public double AverageMarks   { get; set; }
        public int    NegativeRemarks{ get; set; }
        public double BehaviorScore  { get; set; }  // 0–100, higher = better
        public List<string> Factors  { get; set; } = new();  // human-readable reasons
    }

    public class RiskService
    {
        private readonly ApplicationDbContext _context;

        public RiskService(ApplicationDbContext context)
        {
            _context = context;
        }

        // ── Compute risk for ONE student ────────────────────
        public async Task<RiskResult> ComputeAsync(int studentId)
        {
            var student = await _context.Students
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.StudentId == studentId)
                ?? throw new Exception("Student not found");

            // ── Attendance ──────────────────────────────────
            var attendances = await _context.Attendances
                .Where(a => a.StudentId == studentId)
                .ToListAsync();

            double attendanceRate = attendances.Any()
                ? Math.Round((double)attendances.Count(a => a.Status == AttendanceStatus.Present)
                    / attendances.Count * 100, 1)
                : 100.0;

            // ── Marks ───────────────────────────────────────
            var marks = await _context.Marks
                .Where(m => m.StudentId == studentId)
                .ToListAsync();

            double avgMarks = marks.Any()
                ? Math.Round(marks.Average(m =>
                    m.TotalMarks > 0
                        ? (double)(m.MarksObtained / m.TotalMarks * 100)
                        : 0), 1)
                : 100.0;

            // ── Behavior ────────────────────────────────────
            var remarks = await _context.BehaviorRemarks
                .Where(b => b.StudentId == studentId)
                .ToListAsync();

            int positiveRemarks = remarks.Count(r => r.RemarkType == "Positive");
            int negativeRemarks = remarks.Count(r => r.RemarkType == "Negative");
            int totalRemarks    = remarks.Count;

            // Behavior score: starts at 70, +5 per positive, -10 per negative, clamped 0-100
            double behaviorScore = Math.Clamp(70 + positiveRemarks * 5 - negativeRemarks * 10, 0, 100);

            // ── Risk Classification ─────────────────────────
            var factors = new List<string>();

            if (attendanceRate < 60)
                factors.Add($"Critically low attendance ({attendanceRate:F1}%)");
            else if (attendanceRate < 75)
                factors.Add($"Below-average attendance ({attendanceRate:F1}%)");

            if (avgMarks < 40)
                factors.Add($"Very low academic performance ({avgMarks:F1}%)");
            else if (avgMarks < 55)
                factors.Add($"Below-average marks ({avgMarks:F1}%)");

            if (negativeRemarks >= 5)
                factors.Add($"High negative behavior remarks ({negativeRemarks})");
            else if (negativeRemarks >= 3)
                factors.Add($"Multiple negative behavior remarks ({negativeRemarks})");

            // Determine level
            string riskLevel;
            if (attendanceRate < 50 || avgMarks < 35 || negativeRemarks >= 5
                || factors.Count(f => f.Contains("Critically") || f.Contains("Very low")) >= 2)
                riskLevel = "High";
            else if (attendanceRate < 75 || avgMarks < 55 || negativeRemarks >= 3
                || factors.Count >= 2)
                riskLevel = "Medium";
            else
                riskLevel = "Low";

            if (!factors.Any())
                factors.Add("No significant risk factors detected");

            return new RiskResult
            {
                StudentId       = studentId,
                StudentName     = $"{student.FirstName} {student.LastName}",
                Class           = student.Class,
                RollNumber      = student.RollNumber,
                RiskLevel       = riskLevel,
                AttendanceRate  = attendanceRate,
                AverageMarks    = avgMarks,
                NegativeRemarks = negativeRemarks,
                BehaviorScore   = behaviorScore,
                Factors         = factors
            };
        }

        // ── Compute risk for ALL students ───────────────────
        public async Task<List<RiskResult>> ComputeAllAsync()
        {
            var studentIds = await _context.Students
                .Select(s => s.StudentId)
                .ToListAsync();

            var results = new List<RiskResult>();
            foreach (var id in studentIds)
            {
                try { results.Add(await ComputeAsync(id)); }
                catch { /* skip problematic students */ }
            }
            return results;
        }

        // ── Aggregated insights from a list of results ──────
        public static AggregatedInsights GetInsights(List<RiskResult> results)
        {
            if (!results.Any())
                return new AggregatedInsights();

            int total  = results.Count;
            int high   = results.Count(r => r.RiskLevel == "High");
            int medium = results.Count(r => r.RiskLevel == "Medium");
            int low    = results.Count(r => r.RiskLevel == "Low");

            double avgAtt   = Math.Round(results.Average(r => r.AttendanceRate), 1);
            double avgMarks = Math.Round(results.Average(r => r.AverageMarks), 1);

            // Build AI summary text
            var summaryParts = new List<string>();

            double highPct = Math.Round((double)high / total * 100, 1);
            if (highPct > 0)
                summaryParts.Add($"{highPct}% of students are at high risk.");

            if (avgAtt < 75)
                summaryParts.Add($"School-wide attendance is concerning at {avgAtt}%.");
            else
                summaryParts.Add($"Average school attendance is {avgAtt}%.");

            if (avgMarks < 55)
                summaryParts.Add($"Academic performance needs improvement — average is {avgMarks}%.");
            else
                summaryParts.Add($"Average academic performance is {avgMarks}%.");

            // Subject-wise declining classes
            var lowMarkStudents = results.Where(r => r.AverageMarks < 50).ToList();
            if (lowMarkStudents.Any())
            {
                var classes = lowMarkStudents
                    .GroupBy(r => r.Class)
                    .OrderByDescending(g => g.Count())
                    .FirstOrDefault();
                if (classes != null)
                    summaryParts.Add($"Class {classes.Key} has the most students with low marks ({classes.Count()} students).");
            }

            return new AggregatedInsights
            {
                TotalStudents     = total,
                HighRiskCount     = high,
                MediumRiskCount   = medium,
                LowRiskCount      = low,
                HighRiskPercent   = highPct,
                AvgAttendance     = avgAtt,
                AvgMarks          = avgMarks,
                AiSummary         = string.Join(" ", summaryParts)
            };
        }
    }

    public class AggregatedInsights
    {
        public int    TotalStudents   { get; set; }
        public int    HighRiskCount   { get; set; }
        public int    MediumRiskCount { get; set; }
        public int    LowRiskCount    { get; set; }
        public double HighRiskPercent { get; set; }
        public double AvgAttendance   { get; set; }
        public double AvgMarks        { get; set; }
        public string AiSummary       { get; set; } = string.Empty;
    }
}
