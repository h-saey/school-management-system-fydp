using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SMS_Backend.ML;
using SMS_Backend.Services;

namespace SMS_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AIController : ControllerBase
    {
        private readonly RiskService           _riskService;
        private readonly RecommendationService _recommendService;
        private readonly SimulationService     _simulationService;
        private readonly ModelTrainer          _modelTrainer;

        public AIController(
            RiskService           riskService,
            RecommendationService recommendService,
            SimulationService     simulationService,
            ModelTrainer          modelTrainer)
        {
            _riskService       = riskService;
            _recommendService  = recommendService;
            _simulationService = simulationService;
            _modelTrainer      = modelTrainer;
        }

        // ══════════════════════════════════════════════════════
        // POST: api/ai/predict-risk
        // Body: { "studentId": 1 }
        // Returns risk level, factors, ML prediction if available
        // ══════════════════════════════════════════════════════
        [HttpPost("predict-risk")]
        public async Task<IActionResult> PredictRisk([FromBody] PredictRiskRequest req)
        {
            if (req.StudentId <= 0)
                return BadRequest(new { message = "Invalid studentId." });

            try
            {
                // Rule-based result (always computed)
                var riskResult = await _riskService.ComputeAsync(req.StudentId);

                // ML.NET prediction (optional — uses rule-based if model not loaded)
                string mlPrediction = riskResult.RiskLevel; // default to rule-based
                if (_modelTrainer.IsModelLoaded)
                {
                    var ml = _modelTrainer.Predict(
                        (float)riskResult.AttendanceRate,
                        (float)riskResult.AverageMarks,
                        (float)riskResult.BehaviorScore);
                    if (ml != null) mlPrediction = ml;
                }

                return Ok(new
                {
                    riskResult.StudentId,
                    riskResult.StudentName,
                    riskResult.Class,
                    riskResult.RollNumber,
                    RuleBasedRisk  = riskResult.RiskLevel,
                    MLRisk         = mlPrediction,
                    FinalRisk      = mlPrediction,   // ML takes precedence if loaded
                    riskResult.AttendanceRate,
                    riskResult.AverageMarks,
                    riskResult.NegativeRemarks,
                    riskResult.BehaviorScore,
                    riskResult.Factors,
                    MLModelUsed    = _modelTrainer.IsModelLoaded
                });
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // ══════════════════════════════════════════════════════
        // POST: api/ai/recommendations
        // Body: { "studentId": 1 }
        // Returns priority-sorted action list
        // ══════════════════════════════════════════════════════
        [HttpPost("recommendations")]
        public async Task<IActionResult> GetRecommendations([FromBody] PredictRiskRequest req)
        {
            if (req.StudentId <= 0)
                return BadRequest(new { message = "Invalid studentId." });

            try
            {
                var riskResult      = await _riskService.ComputeAsync(req.StudentId);
                var recommendations = _recommendService.Generate(riskResult);

                return Ok(new
                {
                    riskResult.StudentId,
                    riskResult.StudentName,
                    riskResult.RiskLevel,
                    Recommendations = recommendations
                });
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // ══════════════════════════════════════════════════════
        // POST: api/ai/simulate
        // Body: { "studentId": 1, "attendanceIncrease": 10, "marksIncrease": 15 }
        // Returns new risk level after simulated improvement
        // ══════════════════════════════════════════════════════
        [HttpPost("simulate")]
        public async Task<IActionResult> Simulate([FromBody] SimulationInput input)
        {
            if (input.StudentId <= 0)
                return BadRequest(new { message = "Invalid studentId." });

            try
            {
                var riskResult = await _riskService.ComputeAsync(input.StudentId);
                var simulation = _simulationService.Simulate(riskResult, input);

                return Ok(new
                {
                    riskResult.StudentId,
                    riskResult.StudentName,
                    Simulation = simulation
                });
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // ══════════════════════════════════════════════════════
        // GET: api/ai/all-risks
        // Returns risk results for ALL students + aggregated insights
        // ══════════════════════════════════════════════════════
        [HttpGet("all-risks")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> GetAllRisks(
            [FromQuery] string? riskLevel,
            [FromQuery] double? minMarks,
            [FromQuery] double? maxMarks)
        {
            var results = await _riskService.ComputeAllAsync();

            // Apply filters
            if (!string.IsNullOrEmpty(riskLevel))
                results = results.Where(r => r.RiskLevel.Equals(riskLevel, StringComparison.OrdinalIgnoreCase)).ToList();

            if (minMarks.HasValue)
                results = results.Where(r => r.AverageMarks >= minMarks.Value).ToList();

            if (maxMarks.HasValue)
                results = results.Where(r => r.AverageMarks <= maxMarks.Value).ToList();

            var insights = RiskService.GetInsights(results);

            return Ok(new
            {
                Insights = insights,
                Students = results
            });
        }

        // ══════════════════════════════════════════════════════
        // POST: api/ai/train
        // Trains ML.NET model using current database data
        // Falls back to seed data if no students in DB yet
        // ══════════════════════════════════════════════════════
        [HttpPost("train")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> TrainModel()
        {
            var results = await _riskService.ComputeAllAsync();

            List<ML.RiskModelInput> trainingData;

            if (results.Count >= 10)
            {
                // Use real data from database
                trainingData = ModelTrainer.FromRiskResults(results);
            }
            else
            {
                // Not enough real data — use seed data
                trainingData = ModelTrainer.GenerateSeedData();
            }

            try
            {
                _modelTrainer.Train(trainingData);
                return Ok(new
                {
                    message      = "ML.NET model trained and saved successfully.",
                    trainedOn    = trainingData.Count + " records",
                    usedRealData = results.Count >= 10
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Training failed: " + ex.Message });
            }
        }
    }

    public class PredictRiskRequest
    {
        public int StudentId { get; set; }
    }
}
