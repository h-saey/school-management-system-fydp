using Microsoft.ML;
using Microsoft.ML.Data;
using SMS_Backend.Services;

namespace SMS_Backend.ML
{
    public class RiskModelInput
    {
        // ✅ No [LoadColumn] needed when loading from IEnumerable
        // ✅ Label column MUST be named "Label" for ML.NET pipeline
        [ColumnName("Label")]
        public string Label { get; set; } = string.Empty;  // "Low" / "Medium" / "High"

        public float AttendanceRate { get; set; }
        public float AverageMarks { get; set; }
        public float BehaviorScore { get; set; }
    }

    public class RiskModelOutput
    {
        [ColumnName("PredictedLabel")]
        public string PredictedRisk { get; set; } = string.Empty;

        [ColumnName("Score")]
        public float[] Scores { get; set; } = Array.Empty<float>();
    }
}

//using Microsoft.ML.Data;

//namespace SMS_Backend.ML
//{
//    // ── Training input row ───────────────────────────────────
//    // Each student becomes one row with 3 features + 1 label
//    public class RiskModelInput
//    {
//        [LoadColumn(0)]
//        public float AttendanceRate  { get; set; }  // 0–100

//        [LoadColumn(1)]
//        public float AverageMarks    { get; set; }  // 0–100

//        [LoadColumn(2)]
//        public float BehaviorScore   { get; set; }  // 0–100

//        [LoadColumn(3), ColumnName("Label")]
//        public string RiskLabel      { get; set; } = string.Empty;  // "Low" / "Medium" / "High"
//    }

//    // ── Prediction output ────────────────────────────────────
//    public class RiskModelOutput
//    {
//        [ColumnName("PredictedLabel")]
//        public string PredictedRisk  { get; set; } = string.Empty;

//        [ColumnName("Score")]
//        public float[] Scores        { get; set; } = Array.Empty<float>();
//    }
//}
