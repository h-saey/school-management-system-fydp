using Microsoft.ML;
using Microsoft.ML.Data;
using SMS_Backend.Services;

namespace SMS_Backend.ML
{
    public class ModelTrainer
    {
        private readonly MLContext _mlContext;
        private readonly string _modelPath;
        private ITransformer? _trainedModel;
        private PredictionEngine<RiskModelInput, RiskModelOutput>? _predEngine;

        public bool IsModelLoaded => _trainedModel != null;

        public ModelTrainer()
        {
            _mlContext = new MLContext(seed: 42);
            _modelPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "risk_model.zip");
            TryLoadModel();
        }

        // ── TRAIN ────────────────────────────────────────────
        public void Train(List<RiskModelInput> trainingData)
        {
            if (!trainingData.Any())
                throw new InvalidOperationException("Training data is empty.");

            var dataView = _mlContext.Data.LoadFromEnumerable(trainingData);

            // ✅ Correct Multiclass Pipeline
            var pipeline = _mlContext.Transforms.Conversion
                .MapValueToKey(inputColumnName: nameof(RiskModelInput.RiskLabel), outputColumnName: "Label")

                .Append(_mlContext.Transforms.Concatenate("Features",
                    nameof(RiskModelInput.AttendanceRate),
                    nameof(RiskModelInput.AverageMarks),
                    nameof(RiskModelInput.BehaviorScore)))

                .Append(_mlContext.MulticlassClassification.Trainers
                    .SdcaMaximumEntropy(
                        labelColumnName: "Label",
                        featureColumnName: "Features"))

                .Append(_mlContext.Transforms.Conversion
                    .MapKeyToValue("PredictedLabel"));

            Console.WriteLine("[ML.NET] Training risk model...");

            _trainedModel = pipeline.Fit(dataView);

            Console.WriteLine("[ML.NET] Training complete.");

            // ✅ Evaluate model (IMPORTANT for viva)
            EvaluateModel(dataView);

            SaveModel(dataView.Schema);
            BuildPredictionEngine();
        }

        // ── EVALUATE ─────────────────────────────────────────
        private void EvaluateModel(IDataView dataView)
        {
            var predictions = _trainedModel!.Transform(dataView);

            var metrics = _mlContext.MulticlassClassification.Evaluate(
                predictions,
                labelColumnName: "Label",
                predictedLabelColumnName: "PredictedLabel");

            Console.WriteLine($"[ML.NET] Accuracy: {metrics.MicroAccuracy:P2}");
            Console.WriteLine($"[ML.NET] Macro Accuracy: {metrics.MacroAccuracy:P2}");
            Console.WriteLine($"[ML.NET] Log Loss: {metrics.LogLoss:F4}");
        }

        // ── PREDICT ──────────────────────────────────────────
        public string? Predict(float attendance, float marks, float behavior)
        {
            if (_predEngine == null) return null;

            var input = new RiskModelInput
            {
                AttendanceRate = attendance,
                AverageMarks = marks,
                BehaviorScore = behavior
            };

            var output = _predEngine.Predict(input);
            return output.PredictedRisk;
        }

        // ── SEED DATA ────────────────────────────────────────
        public static List<RiskModelInput> GenerateSeedData()
        {
            return new List<RiskModelInput>
            {
                // HIGH
                new() { AttendanceRate = 40, AverageMarks = 30, BehaviorScore = 30, RiskLabel = "High" },
                new() { AttendanceRate = 45, AverageMarks = 35, BehaviorScore = 20, RiskLabel = "High" },
                new() { AttendanceRate = 35, AverageMarks = 28, BehaviorScore = 10, RiskLabel = "High" },

                // MEDIUM
                new() { AttendanceRate = 65, AverageMarks = 48, BehaviorScore = 55, RiskLabel = "Medium" },
                new() { AttendanceRate = 70, AverageMarks = 52, BehaviorScore = 60, RiskLabel = "Medium" },
                new() { AttendanceRate = 72, AverageMarks = 45, BehaviorScore = 65, RiskLabel = "Medium" },

                // LOW
                new() { AttendanceRate = 90, AverageMarks = 80, BehaviorScore = 85, RiskLabel = "Low" },
                new() { AttendanceRate = 95, AverageMarks = 88, BehaviorScore = 90, RiskLabel = "Low" },
                new() { AttendanceRate = 85, AverageMarks = 75, BehaviorScore = 80, RiskLabel = "Low" },
            };
        }

        // ── FROM REAL DATA ───────────────────────────────────
        public static List<RiskModelInput> FromRiskResults(List<RiskResult> results)
        {
            return results.Select(r => new RiskModelInput
            {
                AttendanceRate = (float)r.AttendanceRate,
                AverageMarks = (float)r.AverageMarks,
                BehaviorScore = (float)r.BehaviorScore,
                RiskLabel = r.RiskLevel
            }).ToList();
        }

        // ── SAVE ─────────────────────────────────────────────
        private void SaveModel(DataViewSchema schema)
        {
            _mlContext.Model.Save(_trainedModel!, schema, _modelPath);
            Console.WriteLine($"[ML.NET] Model saved at: {_modelPath}");
        }

        // ── LOAD ─────────────────────────────────────────────
        private void TryLoadModel()
        {
            if (!File.Exists(_modelPath)) return;

            try
            {
                _trainedModel = _mlContext.Model.Load(_modelPath, out _);
                BuildPredictionEngine();
                Console.WriteLine("[ML.NET] Model loaded successfully.");
            }
            catch
            {
                Console.WriteLine("[ML.NET] Failed to load model.");
                _trainedModel = null;
            }
        }

        private void BuildPredictionEngine()
        {
            if (_trainedModel == null) return;

            _predEngine = _mlContext.Model
                .CreatePredictionEngine<RiskModelInput, RiskModelOutput>(_trainedModel);
        }
    }
}
