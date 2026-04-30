using SMS_Backend.Services;

namespace SMS_Backend.Services
{
    public class SimulationInput
    {
        public int    StudentId            { get; set; }
        public double AttendanceIncrease   { get; set; }  // % points to add, e.g. 10
        public double MarksIncrease        { get; set; }  // % points to add, e.g. 15
    }

    public class SimulationResult
    {
        public string OriginalRiskLevel    { get; set; } = string.Empty;
        public string SimulatedRiskLevel   { get; set; } = string.Empty;
        public double OriginalAttendance   { get; set; }
        public double SimulatedAttendance  { get; set; }
        public double OriginalMarks        { get; set; }
        public double SimulatedMarks       { get; set; }
        public bool   RiskImproved         { get; set; }
        public string Message              { get; set; } = string.Empty;
        public List<string> ImprovementSteps { get; set; } = new();
    }

    public class SimulationService
    {
        // ── Run a what-if simulation ────────────────────────
        public SimulationResult Simulate(RiskResult current, SimulationInput input)
        {
            // Clamp simulated values to realistic range
            double simAtt   = Math.Min(100, current.AttendanceRate + input.AttendanceIncrease);
            double simMarks = Math.Min(100, current.AverageMarks   + input.MarksIncrease);

            // Recalculate risk with new values
            string simRisk = CalculateRiskLevel(simAtt, simMarks, current.NegativeRemarks);

            var order = new Dictionary<string, int>
            {
                ["Low"] = 0, ["Medium"] = 1, ["High"] = 2
            };

            bool improved = order[simRisk] < order[current.RiskLevel];

            // Build message
            string message;
            if (simRisk == current.RiskLevel)
                message = $"Risk level remains {simRisk}. Larger improvements needed.";
            else if (improved)
                message = $"Risk improves from {current.RiskLevel} → {simRisk} with these changes. Great progress!";
            else
                message = $"Even with these changes, risk increases to {simRisk}. Other factors need addressing.";

            // Build practical steps
            var steps = new List<string>();

            if (input.AttendanceIncrease > 0)
                steps.Add($"Increase attendance by {input.AttendanceIncrease:F0}% points → from {current.AttendanceRate:F1}% to {simAtt:F1}%");

            if (input.MarksIncrease > 0)
                steps.Add($"Improve marks by {input.MarksIncrease:F0}% points → from {current.AverageMarks:F1}% to {simMarks:F1}%");

            if (simRisk == "High")
                steps.Add("Additional support required beyond attendance and marks improvement");

            if (current.NegativeRemarks >= 3)
                steps.Add("Address behavior issues — negative remarks are also contributing to risk");

            return new SimulationResult
            {
                OriginalRiskLevel   = current.RiskLevel,
                SimulatedRiskLevel  = simRisk,
                OriginalAttendance  = current.AttendanceRate,
                SimulatedAttendance = simAtt,
                OriginalMarks       = current.AverageMarks,
                SimulatedMarks      = simMarks,
                RiskImproved        = improved,
                Message             = message,
                ImprovementSteps    = steps
            };
        }

        // ── Same risk formula as RiskService (kept in sync) ─
        private static string CalculateRiskLevel(double att, double marks, int negRemarks)
        {
            if (att < 50 || marks < 35 || negRemarks >= 5)
                return "High";
            if (att < 75 || marks < 55 || negRemarks >= 3)
                return "Medium";
            return "Low";
        }
    }
}
