using SMS_Backend.Services;

namespace SMS_Backend.Services
{
    public class Recommendation
    {
        public string Area           { get; set; } = string.Empty;  // Attendance / Marks / Behavior
        public string Priority       { get; set; } = string.Empty;  // High / Medium / Low
        public string Message        { get; set; } = string.Empty;
        public string ActionRequired { get; set; } = string.Empty;
    }

    public class RecommendationService
    {
        // ── Generate recommendations from a risk result ─────
        public List<Recommendation> Generate(RiskResult risk)
        {
            var recommendations = new List<Recommendation>();

            // ── Attendance Recommendations ──────────────────
            if (risk.AttendanceRate < 50)
            {
                recommendations.Add(new Recommendation
                {
                    Area           = "Attendance",
                    Priority       = "High",
                    Message        = $"Attendance is critically low at {risk.AttendanceRate:F1}%. Immediate intervention required.",
                    ActionRequired = "Contact parents immediately. Schedule a meeting with the student and counselor."
                });
            }
            else if (risk.AttendanceRate < 75)
            {
                recommendations.Add(new Recommendation
                {
                    Area           = "Attendance",
                    Priority       = "Medium",
                    Message        = $"Attendance is below 75% ({risk.AttendanceRate:F1}%). Student needs monitoring.",
                    ActionRequired = "Send weekly attendance reports to parents. Assign a mentor."
                });
            }
            else if (risk.AttendanceRate < 85)
            {
                recommendations.Add(new Recommendation
                {
                    Area           = "Attendance",
                    Priority       = "Low",
                    Message        = $"Attendance is acceptable but could improve ({risk.AttendanceRate:F1}%).",
                    ActionRequired = "Encourage consistent attendance. Send positive reinforcement messages."
                });
            }

            // ── Marks Recommendations ───────────────────────
            if (risk.AverageMarks < 40)
            {
                recommendations.Add(new Recommendation
                {
                    Area           = "Academic Performance",
                    Priority       = "High",
                    Message        = $"Very low academic performance ({risk.AverageMarks:F1}%). Student is at risk of failing.",
                    ActionRequired = "Assign extra tutoring sessions. Provide remedial materials. Alert subject teachers."
                });
            }
            else if (risk.AverageMarks < 55)
            {
                recommendations.Add(new Recommendation
                {
                    Area           = "Academic Performance",
                    Priority       = "Medium",
                    Message        = $"Below-average marks ({risk.AverageMarks:F1}%). Academic support recommended.",
                    ActionRequired = "Assign additional practice exercises. Review weak subjects individually."
                });
            }
            else if (risk.AverageMarks < 70)
            {
                recommendations.Add(new Recommendation
                {
                    Area           = "Academic Performance",
                    Priority       = "Low",
                    Message        = $"Marks are satisfactory but improvement is possible ({risk.AverageMarks:F1}%).",
                    ActionRequired = "Encourage participation in class. Provide optional enrichment materials."
                });
            }

            // ── Behavior Recommendations ────────────────────
            if (risk.NegativeRemarks >= 5)
            {
                recommendations.Add(new Recommendation
                {
                    Area           = "Behavior",
                    Priority       = "High",
                    Message        = $"High number of negative behavior remarks ({risk.NegativeRemarks}). Disciplinary concern.",
                    ActionRequired = "Schedule counseling session. Involve parents and class teacher in behavior plan."
                });
            }
            else if (risk.NegativeRemarks >= 3)
            {
                recommendations.Add(new Recommendation
                {
                    Area           = "Behavior",
                    Priority       = "Medium",
                    Message        = $"Multiple negative remarks recorded ({risk.NegativeRemarks}).",
                    ActionRequired = "Discuss behavior expectations with student. Monitor for further incidents."
                });
            }

            // ── Positive reinforcement if all good ──────────
            if (!recommendations.Any())
            {
                recommendations.Add(new Recommendation
                {
                    Area           = "Overall",
                    Priority       = "Low",
                    Message        = "Student is performing well with no significant risk factors.",
                    ActionRequired = "Continue current engagement. Consider nominating for recognition awards."
                });
            }

            // Sort by priority: High → Medium → Low
            var order = new Dictionary<string, int> { ["High"] = 0, ["Medium"] = 1, ["Low"] = 2 };
            return recommendations.OrderBy(r => order.GetValueOrDefault(r.Priority, 3)).ToList();
        }
    }
}
