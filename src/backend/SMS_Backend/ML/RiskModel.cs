using Microsoft.ML.Data;

namespace SMS_Backend.ML
{
    // ── Training input row ───────────────────────────────────
    // Each student becomes one row with 3 features + 1 label
    public class RiskModelInput
    {
        [LoadColumn(0)]
        public float AttendanceRate  { get; set; }  // 0–100

        [LoadColumn(1)]
        public float AverageMarks    { get; set; }  // 0–100

        [LoadColumn(2)]
        public float BehaviorScore   { get; set; }  // 0–100

        [LoadColumn(3), ColumnName("Label")]
        public string RiskLabel      { get; set; } = string.Empty;  // "Low" / "Medium" / "High"
    }

    // ── Prediction output ────────────────────────────────────
    public class RiskModelOutput
    {
        [ColumnName("PredictedLabel")]
        public string PredictedRisk  { get; set; } = string.Empty;

        [ColumnName("Score")]
        public float[] Scores        { get; set; } = Array.Empty<float>();
    }
}
