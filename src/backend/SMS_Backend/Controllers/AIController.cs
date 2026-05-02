
//using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.Mvc;
//using SMS_Backend.ML;
//using SMS_Backend.Services;

//namespace SMS_Backend.Controllers
//{
//    [ApiController]
//    [Route("api/[controller]")]
//    [Authorize]
//    public class AIController : ControllerBase
//    {
//        private readonly RiskService _riskService;
//        private readonly RecommendationService _recommendService;
//        private readonly SimulationService _simulationService;
//        private readonly ModelTrainer _modelTrainer;

//        public AIController(
//            RiskService riskService,
//            RecommendationService recommendService,
//            SimulationService simulationService,
//            ModelTrainer modelTrainer)
//        {
//            _riskService = riskService;
//            _recommendService = recommendService;
//            _simulationService = simulationService;
//            _modelTrainer = modelTrainer;
//        }

//        // ══════════════════════════════════════════════════════
//        // POST: api/ai/predict-risk
//        // Body: { "studentId": 1 }
//        // Returns risk level, factors, ML prediction if available
//        // ══════════════════════════════════════════════════════
//        [HttpPost("predict-risk")]
//        public async Task<IActionResult> PredictRisk([FromBody] PredictRiskRequest req)
//        {
//            if (req.StudentId <= 0)
//                return BadRequest(new { message = "Invalid studentId." });

//            try
//            {
//                // Rule-based result (always computed)
//                var riskResult = await _riskService.ComputeAsync(req.StudentId);

//                // ML.NET prediction (optional — uses rule-based if model not loaded)
//                string mlPrediction = riskResult.RiskLevel; // default to rule-based
//                if (_modelTrainer.IsModelLoaded)
//                {
//                    var ml = _modelTrainer.Predict(
//                        (float)riskResult.AttendanceRate,
//                        (float)riskResult.AverageMarks,
//                        (float)riskResult.BehaviorScore);
//                    if (ml != null) mlPrediction = ml;
//                }

//                return Ok(new
//                {
//                    riskResult.StudentId,
//                    riskResult.StudentName,
//                    riskResult.Class,
//                    riskResult.RollNumber,
//                    RuleBasedRisk = riskResult.RiskLevel,
//                    MLRisk = mlPrediction,
//                    FinalRisk = mlPrediction,   // ML takes precedence if loaded
//                    riskResult.AttendanceRate,
//                    riskResult.AverageMarks,
//                    riskResult.NegativeRemarks,
//                    riskResult.BehaviorScore,
//                    riskResult.Factors,
//                    MLModelUsed = _modelTrainer.IsModelLoaded
//                });
//            }
//            catch (Exception ex)
//            {
//                return NotFound(new { message = ex.Message });
//            }
//        }

//        // ══════════════════════════════════════════════════════
//        // POST: api/ai/recommendations
//        // Body: { "studentId": 1 }
//        // Returns priority-sorted action list
//        // ══════════════════════════════════════════════════════
//        [HttpPost("recommendations")]
//        public async Task<IActionResult> GetRecommendations([FromBody] PredictRiskRequest req)
//        {
//            if (req.StudentId <= 0)
//                return BadRequest(new { message = "Invalid studentId." });

//            try
//            {
//                var riskResult = await _riskService.ComputeAsync(req.StudentId);
//                var recommendations = _recommendService.Generate(riskResult);

//                return Ok(new
//                {
//                    riskResult.StudentId,
//                    riskResult.StudentName,
//                    riskResult.RiskLevel,
//                    Recommendations = recommendations
//                });
//            }
//            catch (Exception ex)
//            {
//                return NotFound(new { message = ex.Message });
//            }
//        }

//        // ══════════════════════════════════════════════════════
//        // POST: api/ai/simulate
//        // Body: { "studentId": 1, "attendanceIncrease": 10, "marksIncrease": 15 }
//        // Returns new risk level after simulated improvement
//        // ══════════════════════════════════════════════════════
//        [HttpPost("simulate")]
//        public async Task<IActionResult> Simulate([FromBody] SimulationInput input)
//        {
//            if (input.StudentId <= 0)
//                return BadRequest(new { message = "Invalid studentId." });

//            try
//            {
//                var riskResult = await _riskService.ComputeAsync(input.StudentId);
//                var simulation = _simulationService.Simulate(riskResult, input);

//                return Ok(new
//                {
//                    riskResult.StudentId,
//                    riskResult.StudentName,
//                    Simulation = simulation
//                });
//            }
//            catch (Exception ex)
//            {
//                return NotFound(new { message = ex.Message });
//            }
//        }

//        // ══════════════════════════════════════════════════════
//        // GET: api/ai/all-risks
//        // Returns risk results for ALL students + aggregated insights
//        // ══════════════════════════════════════════════════════
//        [HttpGet("all-risks")]
//        [Authorize(Roles = "Admin,Teacher")]
//        public async Task<IActionResult> GetAllRisks(
//            [FromQuery] string? riskLevel,
//            [FromQuery] double? minMarks,
//            [FromQuery] double? maxMarks)
//        {
//            var results = await _riskService.ComputeAllAsync();

//            // Apply filters
//            if (!string.IsNullOrEmpty(riskLevel))
//                results = results.Where(r => r.RiskLevel.Equals(riskLevel, StringComparison.OrdinalIgnoreCase)).ToList();

//            if (minMarks.HasValue)
//                results = results.Where(r => r.AverageMarks >= minMarks.Value).ToList();

//            if (maxMarks.HasValue)
//                results = results.Where(r => r.AverageMarks <= maxMarks.Value).ToList();

//            var insights = RiskService.GetInsights(results);

//            return Ok(new
//            {
//                Insights = insights,
//                Students = results
//            });
//        }

//        // ══════════════════════════════════════════════════════
//        // POST: api/ai/train
//        // Trains ML.NET model using current database data
//        // Falls back to seed data if no students in DB yet
//        // ══════════════════════════════════════════════════════
//        [HttpPost("train")]
//        [Authorize(Roles = "Admin")]
//        public async Task<IActionResult> TrainModel()
//        {
//            var results = await _riskService.ComputeAllAsync();

//            List<ML.RiskModelInput> trainingData;

//            if (results.Count >= 10)
//            {
//                // Use real data from database
//                trainingData = ModelTrainer.FromRiskResults(results);
//            }
//            else
//            {
//                // Not enough real data — use seed data
//                trainingData = ModelTrainer.GenerateSeedData();
//            }

//            try
//            {
//                _modelTrainer.Train(trainingData);
//                return Ok(new
//                {
//                    message = "ML.NET model trained and saved successfully.",
//                    trainedOn = trainingData.Count + " records",
//                    usedRealData = results.Count >= 10
//                });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { message = "Training failed: " + ex.Message });
//            }
//        }
//    }

//    public class PredictRiskRequest
//    {
//        public int StudentId { get; set; }
//    }
//}
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SMS_Backend.Data;
using SMS_Backend.ML;
using SMS_Backend.Models;
using SMS_Backend.Services;
using System.Security.Claims;

namespace SMS_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AIController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly RiskService _riskService;
        private readonly RecommendationService _recommendService;
        private readonly SimulationService _simulationService;
        private readonly ModelTrainer _modelTrainer;
        private readonly RiskNotificationService _notifyService;

        public AIController(
            ApplicationDbContext context,
            RiskService riskService,
            RecommendationService recommendService,
            SimulationService simulationService,
            ModelTrainer modelTrainer,
            RiskNotificationService notifyService)
        {
            _context = context;
            _riskService = riskService;
            _recommendService = recommendService;
            _simulationService = simulationService;
            _modelTrainer = modelTrainer;
            _notifyService = notifyService;
        }

        private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        private string GetUserRole() => User.FindFirstValue(ClaimTypes.Role)!;

        // ══════════════════════════════════════════════════════
        // POST: api/ai/predict-risk
        // Role-aware: Student → own only | Parent → their child
        //             Teacher → their students | Admin → any
        // ══════════════════════════════════════════════════════
        [HttpPost("predict-risk")]
        public async Task<IActionResult> PredictRisk([FromBody] PredictRiskRequest req)
        {
            var role = GetUserRole();
            var userId = GetUserId();
            int studentId = req.StudentId;

            // ── Role-based override ──────────────────────────
            if (role == "Student")
            {
                var s = await _context.Students.FirstOrDefaultAsync(x => x.UserId == userId);
                if (s == null) return NotFound(new { message = "Student profile not found." });
                studentId = s.StudentId;  // always use own ID
            }
            else if (role == "Parent")
            {
                var p = await _context.Parents
                    .FirstOrDefaultAsync(x => x.UserId == userId);
                if (p == null) return NotFound(new { message = "No linked student found." });
                studentId = p.StudentId;  // parent always sees their child
            }
            else if (role == "Teacher")
            {
                // Teacher can only predict for students they teach
                var teaches = await _context.Attendances
                    .Include(a => a.Teacher)
                    .AnyAsync(a => a.Teacher.UserId == userId && a.StudentId == studentId);
                if (!teaches)
                    return Forbid();
            }
            // Admin can pass any studentId — no restriction

            if (studentId <= 0)
                return BadRequest(new { message = "Invalid studentId." });

            try
            {
                var riskResult = await _riskService.ComputeAsync(studentId);

                string mlPrediction = riskResult.RiskLevel;
                if (_modelTrainer.IsModelLoaded)
                {
                    var ml = _modelTrainer.Predict(
                        (float)riskResult.AttendanceRate,
                        (float)riskResult.AverageMarks,
                        (float)riskResult.BehaviorScore);
                    if (ml != null) mlPrediction = ml;
                }

                // Send notification if risky
                await _notifyService.NotifyIfRiskyAsync(riskResult);

                return Ok(new
                {
                    riskResult.StudentId,
                    riskResult.StudentName,
                    riskResult.Class,
                    riskResult.RollNumber,
                    RuleBasedRisk = riskResult.RiskLevel,
                    MLRisk = mlPrediction,
                    FinalRisk = mlPrediction,
                    riskResult.AttendanceRate,
                    riskResult.AverageMarks,
                    riskResult.NegativeRemarks,
                    riskResult.BehaviorScore,
                    riskResult.Factors,
                    MLModelUsed = _modelTrainer.IsModelLoaded
                });
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // ══════════════════════════════════════════════════════
        // GET: api/ai/my-risk
        // Students call this — no ID needed, uses JWT identity
        // ══════════════════════════════════════════════════════
        [HttpGet("my-risk")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetMyRisk()
        {
            var userId = GetUserId();
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
            if (student == null) return NotFound(new { message = "Student profile not found." });

            var risk = await _riskService.ComputeAsync(student.StudentId);

            string mlPrediction = risk.RiskLevel;
            if (_modelTrainer.IsModelLoaded)
            {
                var ml = _modelTrainer.Predict(
                    (float)risk.AttendanceRate,
                    (float)risk.AverageMarks,
                    (float)risk.BehaviorScore);
                if (ml != null) mlPrediction = ml;
            }

            return Ok(new
            {
                risk.StudentId,
                risk.StudentName,
                risk.Class,
                risk.RollNumber,
                FinalRisk = mlPrediction,
                risk.AttendanceRate,
                risk.AverageMarks,
                risk.NegativeRemarks,
                risk.BehaviorScore,
                risk.Factors,
                MLModelUsed = _modelTrainer.IsModelLoaded
            });
        }

        // ══════════════════════════════════════════════════════
        // GET: api/ai/child-risk
        // Parent calls this — sees their linked child only
        // ══════════════════════════════════════════════════════
        [HttpGet("child-risk")]
        [Authorize(Roles = "Parent")]
        public async Task<IActionResult> GetChildRisk()
        {
            var userId = GetUserId();
            var parent = await _context.Parents
                .Include(p => p.Student)
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (parent == null) return NotFound(new { message = "No linked child found." });

            var risk = await _riskService.ComputeAsync(parent.StudentId);

            string mlPrediction = risk.RiskLevel;
            if (_modelTrainer.IsModelLoaded)
            {
                var ml = _modelTrainer.Predict(
                    (float)risk.AttendanceRate,
                    (float)risk.AverageMarks,
                    (float)risk.BehaviorScore);
                if (ml != null) mlPrediction = ml;
            }

            return Ok(new
            {
                risk.StudentId,
                risk.StudentName,
                risk.Class,
                risk.RollNumber,
                FinalRisk = mlPrediction,
                risk.AttendanceRate,
                risk.AverageMarks,
                risk.NegativeRemarks,
                risk.BehaviorScore,
                risk.Factors,
                MLModelUsed = _modelTrainer.IsModelLoaded,
                ChildName = $"{parent.Student.FirstName} {parent.Student.LastName}"
            });
        }

        // ══════════════════════════════════════════════════════
        // GET: api/ai/my-students-risks
        // Teacher calls this — sees only students they teach
        // ══════════════════════════════════════════════════════
        [HttpGet("my-students-risks")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> GetMyStudentsRisks()
        {
            var userId = GetUserId();

            var studentIds = await _context.Attendances
                .Include(a => a.Teacher)
                .Where(a => a.Teacher.UserId == userId)
                .Select(a => a.StudentId)
                .Distinct()
                .ToListAsync();

            var results = new List<object>();
            foreach (var sid in studentIds)
            {
                try
                {
                    var r = await _riskService.ComputeAsync(sid);
                    string ml = r.RiskLevel;
                    if (_modelTrainer.IsModelLoaded)
                    {
                        var pred = _modelTrainer.Predict((float)r.AttendanceRate, (float)r.AverageMarks, (float)r.BehaviorScore);
                        if (pred != null) ml = pred;
                    }
                    results.Add(new
                    {
                        r.StudentId,
                        r.StudentName,
                        r.Class,
                        r.RollNumber,
                        FinalRisk = ml,
                        r.AttendanceRate,
                        r.AverageMarks,
                        r.Factors
                    });
                }
                catch { }
            }

            var insights = RiskService.GetInsights(
                results.Cast<dynamic>().Select(r => new RiskResult
                {
                    StudentId = r.StudentId,
                    StudentName = r.StudentName,
                    Class = r.Class,
                    RollNumber = r.RollNumber,
                    RiskLevel = r.FinalRisk,
                    AttendanceRate = r.AttendanceRate,
                    AverageMarks = r.AverageMarks,
                }).ToList());

            return Ok(new { Insights = insights, Students = results });
        }

        // ══════════════════════════════════════════════════════
        // POST: api/ai/recommendations
        // Role-aware same as predict-risk
        // ══════════════════════════════════════════════════════
        [HttpPost("recommendations")]
        public async Task<IActionResult> GetRecommendations([FromBody] PredictRiskRequest req)
        {
            var role = GetUserRole();
            var userId = GetUserId();
            int sid = req.StudentId;

            if (role == "Student")
            {
                var s = await _context.Students.FirstOrDefaultAsync(x => x.UserId == userId);
                if (s == null) return NotFound(new { message = "Student profile not found." });
                sid = s.StudentId;
            }
            else if (role == "Parent")
            {
                var p = await _context.Parents.FirstOrDefaultAsync(x => x.UserId == userId);
                if (p == null) return NotFound(new { message = "No linked child." });
                sid = p.StudentId;
            }

            try
            {
                var riskResult = await _riskService.ComputeAsync(sid);
                var recs = _recommendService.Generate(riskResult);
                return Ok(new
                {
                    riskResult.StudentId,
                    riskResult.StudentName,
                    riskResult.RiskLevel,
                    Recommendations = recs
                });
            }
            catch (Exception ex) { return NotFound(new { message = ex.Message }); }
        }

        // ══════════════════════════════════════════════════════
        // POST: api/ai/simulate
        // ══════════════════════════════════════════════════════
        [HttpPost("simulate")]
        public async Task<IActionResult> Simulate([FromBody] SimulationInput input)
        {
            var role = GetUserRole();
            var userId = GetUserId();

            if (role == "Student")
            {
                var s = await _context.Students.FirstOrDefaultAsync(x => x.UserId == userId);
                if (s == null) return NotFound(new { message = "Student profile not found." });
                input.StudentId = s.StudentId;
            }
            else if (role == "Parent")
            {
                var p = await _context.Parents.FirstOrDefaultAsync(x => x.UserId == userId);
                if (p == null) return NotFound(new { message = "No linked child." });
                input.StudentId = p.StudentId;
            }

            if (input.StudentId <= 0)
                return BadRequest(new { message = "Invalid studentId." });

            try
            {
                var riskResult = await _riskService.ComputeAsync(input.StudentId);
                var simulation = _simulationService.Simulate(riskResult, input);
                return Ok(new { riskResult.StudentId, riskResult.StudentName, Simulation = simulation });
            }
            catch (Exception ex) { return NotFound(new { message = ex.Message }); }
        }

        // ══════════════════════════════════════════════════════
        // GET: api/ai/all-risks  — Admin only
        // ══════════════════════════════════════════════════════
        [HttpGet("all-risks")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> GetAllRisks(
            [FromQuery] string? riskLevel,
            [FromQuery] double? minMarks,
            [FromQuery] double? maxMarks)
        {
            var results = await _riskService.ComputeAllAsync();

            if (!string.IsNullOrEmpty(riskLevel))
                results = results.Where(r => r.RiskLevel.Equals(riskLevel, StringComparison.OrdinalIgnoreCase)).ToList();
            if (minMarks.HasValue) results = results.Where(r => r.AverageMarks >= minMarks.Value).ToList();
            if (maxMarks.HasValue) results = results.Where(r => r.AverageMarks <= maxMarks.Value).ToList();

            var insights = RiskService.GetInsights(results);
            return Ok(new { Insights = insights, Students = results });
        }

        // ══════════════════════════════════════════════════════
        // POST: api/ai/train  — Admin only
        // Trains on real data + sends bulk notifications
        // ══════════════════════════════════════════════════════
        [HttpPost("train")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> TrainModel()
        {
            var results = await _riskService.ComputeAllAsync();

            List<ML.RiskModelInput> trainingData = results.Count >= 10
                ? ModelTrainer.FromRiskResults(results)
                : ModelTrainer.GenerateSeedData();

            try
            {
                _modelTrainer.Train(trainingData);

                // After training, send notifications for all risky students
                await _notifyService.NotifyBulkAsync(results);

                return Ok(new
                {
                    message = "ML.NET model trained successfully. Risk notifications sent.",
                    trainedOn = trainingData.Count + " records",
                    usedRealData = results.Count >= 10,
                    notified = results.Count(r => r.RiskLevel != "Low") + " students at risk notified"
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
