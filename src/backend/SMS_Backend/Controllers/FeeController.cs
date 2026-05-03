//using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.Mvc;
//using Microsoft.EntityFrameworkCore;
//using SMS_Backend.Data;
//using SMS_Backend.Models;
//using System.Security.Claims;

//namespace SMS_Backend.Controllers
//{
//    [ApiController]
//    [Route("api/[controller]")]
//    [Authorize]
//    public class FeeController : ControllerBase
//    {
//        private readonly ApplicationDbContext _context;

//        public FeeController(ApplicationDbContext context)
//        {
//            _context = context;
//        }

//        private int GetCurrentUserId() =>
//            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

//        private string GetCurrentUserRole() =>
//            User.FindFirstValue(ClaimTypes.Role)!;

//        // GET: api/fee
//        [HttpGet]
//        [Authorize(Roles = "Admin")]
//        public async Task<IActionResult> GetAllFees([FromQuery] FeeStatus? status)
//        {
//            var query = _context.Fees.Include(f => f.Student).AsQueryable();
//            if (status.HasValue) query = query.Where(f => f.Status == status.Value);

//            var result = await query.Select(f => new
//            {
//                f.FeeId,
//                f.Term,
//                f.TotalAmount,
//                f.PaidAmount,
//                f.RemainingAmount,
//                f.DueDate,
//                f.Status,
//                Student = new { f.Student.FirstName, f.Student.LastName, f.Student.RollNumber }
//            }).ToListAsync();

//            return Ok(result);
//        }

//        // GET: api/fee/my — Student views own fees
//        [HttpGet("my")]
//        [Authorize(Roles = "Student")]
//        public async Task<IActionResult> GetMyFees()
//        {
//            var currentUserId = GetCurrentUserId();
//            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == currentUserId);
//            if (student == null)
//                return NotFound(new { message = "Student profile not found." });

//            var fees = await _context.Fees
//                .Where(f => f.StudentId == student.StudentId)
//                .Select(f => new { f.FeeId, f.Term, f.TotalAmount, f.PaidAmount, f.RemainingAmount, f.DueDate, f.Status })
//                .ToListAsync();

//            return Ok(fees);
//        }

//        // GET: api/fee/student/{studentId} — Parent views linked student fees
//        [HttpGet("student/{studentId}")]
//        [Authorize(Roles = "Admin,Parent")]
//        public async Task<IActionResult> GetStudentFees(int studentId)
//        {
//            var role = GetCurrentUserRole();
//            if (role == "Parent")
//            {
//                var currentUserId = GetCurrentUserId();
//                var isLinked = await _context.Parents
//                    .AnyAsync(p => p.UserId == currentUserId && p.StudentId == studentId);
//                if (!isLinked) return Forbid();
//            }

//            var fees = await _context.Fees
//                .Where(f => f.StudentId == studentId)
//                .Select(f => new { f.FeeId, f.Term, f.TotalAmount, f.PaidAmount, f.RemainingAmount, f.DueDate, f.Status })
//                .ToListAsync();

//            return Ok(fees);
//        }

//        // GET: api/fee/{id}
//        [HttpGet("{id}")]
//        [Authorize(Roles = "Admin")]
//        public async Task<IActionResult> GetFee(int id)
//        {
//            var fee = await _context.Fees.Include(f => f.Student).FirstOrDefaultAsync(f => f.FeeId == id);
//            if (fee == null)
//                return NotFound(new { message = "Fee record not found." });

//            return Ok(new
//            {
//                fee.FeeId, fee.Term, fee.TotalAmount, fee.PaidAmount,
//                fee.RemainingAmount, fee.DueDate, fee.Status,
//                Student = new { fee.Student.FirstName, fee.Student.LastName }
//            });
//        }

//        // POST: api/fee — Admin creates fee record
//        [HttpPost]
//        [Authorize(Roles = "Admin")]
//        public async Task<IActionResult> CreateFee([FromBody] CreateFeeDto dto)
//        {
//            if (!ModelState.IsValid)
//                return BadRequest(ModelState);

//            var studentExists = await _context.Students.AnyAsync(s => s.StudentId == dto.StudentId);
//            if (!studentExists)
//                return BadRequest(new { message = "Student not found." });

//            var fee = new Fee
//            {
//                StudentId   = dto.StudentId,
//                Term        = dto.Term,
//                TotalAmount = dto.TotalAmount,
//                PaidAmount  = 0,
//                DueDate     = dto.DueDate,
//                Status      = FeeStatus.Unpaid
//            };

//            _context.Fees.Add(fee);
//            await _context.SaveChangesAsync();

//            return CreatedAtAction(nameof(GetFee), new { id = fee.FeeId },
//                new { message = "Fee record created.", fee.FeeId });
//        }

//        // PATCH: api/fee/{id}/payment — Admin updates payment
//        [HttpPatch("{id}/payment")]
//        [Authorize(Roles = "Admin")]
//        public async Task<IActionResult> UpdatePayment(int id, [FromBody] UpdateFeePaymentDto dto)
//        {
//            var fee = await _context.Fees.FindAsync(id);
//            if (fee == null)
//                return NotFound(new { message = "Fee record not found." });

//            if (dto.PaidAmount < 0 || dto.PaidAmount > fee.TotalAmount)
//                return BadRequest(new { message = "Invalid payment amount." });

//            fee.PaidAmount = dto.PaidAmount;
//            fee.Status = fee.PaidAmount == 0 ? FeeStatus.Unpaid
//                       : fee.PaidAmount >= fee.TotalAmount ? FeeStatus.Paid
//                       : FeeStatus.Partial;

//            if (DateTime.UtcNow > fee.DueDate && fee.Status != FeeStatus.Paid)
//                fee.Status = FeeStatus.Overdue;

//            await _context.SaveChangesAsync();
//            return Ok(new { message = "Payment updated.", fee.Status, fee.RemainingAmount });
//        }

//        // DELETE: api/fee/{id}
//        [HttpDelete("{id}")]
//        [Authorize(Roles = "Admin")]
//        public async Task<IActionResult> DeleteFee(int id)
//        {
//            var fee = await _context.Fees.FindAsync(id);
//            if (fee == null)
//                return NotFound(new { message = "Fee record not found." });

//            _context.Fees.Remove(fee);
//            await _context.SaveChangesAsync();
//            return Ok(new { message = "Fee record deleted." });
//        }
//    }

//    public class CreateFeeDto
//    {
//        public int StudentId { get; set; }
//        public string Term { get; set; } = string.Empty;
//        public decimal TotalAmount { get; set; }
//        public DateTime DueDate { get; set; }
//    }

//    public class UpdateFeePaymentDto
//    {
//        public decimal PaidAmount { get; set; }
//    }
//}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SMS_Backend.Data;
using SMS_Backend.Models;
using SMS_Backend.Services;
using System.Security.Claims;

namespace SMS_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FeeController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly AuditLogService _audit;

        public FeeController(ApplicationDbContext context, AuditLogService audit)
        {
            _context = context;
            _audit = audit;
        }

        private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        private string GetUserRole() => User.FindFirstValue(ClaimTypes.Role)!;

        // GET: api/fee
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllFees([FromQuery] FeeStatus? status)
        {
            var query = _context.Fees.Include(f => f.Student).AsQueryable();
            if (status.HasValue) query = query.Where(f => f.Status == status.Value);

            return Ok(await query.Select(f => new
            {
                f.FeeId,
                f.Term,
                f.TotalAmount,
                f.PaidAmount,
                f.RemainingAmount,
                f.DueDate,
                f.Status,
                Student = new { f.Student.FirstName, f.Student.LastName, f.Student.RollNumber }
            }).ToListAsync());
        }

        // GET: api/fee/my
        [HttpGet("my")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetMyFees()
        {
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == GetUserId());
            if (student == null) return NotFound(new { message = "Student profile not found." });

            return Ok(await _context.Fees.Where(f => f.StudentId == student.StudentId)
                .Select(f => new { f.FeeId, f.Term, f.TotalAmount, f.PaidAmount, f.RemainingAmount, f.DueDate, f.Status })
                .ToListAsync());
        }

        // GET: api/fee/student/{studentId}
        [HttpGet("student/{studentId}")]
        [Authorize(Roles = "Admin,Parent")]
        public async Task<IActionResult> GetStudentFees(int studentId)
        {
            if (GetUserRole() == "Parent")
            {
                var linked = await _context.Parents
                    .AnyAsync(p => p.UserId == GetUserId() && p.StudentId == studentId);
                if (!linked) return Forbid();
            }

            return Ok(await _context.Fees.Where(f => f.StudentId == studentId)
                .Select(f => new { f.FeeId, f.Term, f.TotalAmount, f.PaidAmount, f.RemainingAmount, f.DueDate, f.Status })
                .ToListAsync());
        }

        // GET: api/fee/{id}
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetFee(int id)
        {
            var fee = await _context.Fees.Include(f => f.Student).FirstOrDefaultAsync(f => f.FeeId == id);
            if (fee == null) return NotFound(new { message = "Fee not found." });

            return Ok(new
            {
                fee.FeeId,
                fee.Term,
                fee.TotalAmount,
                fee.PaidAmount,
                fee.RemainingAmount,
                fee.DueDate,
                fee.Status,
                Student = new { fee.Student.FirstName, fee.Student.LastName }
            });
        }

        // POST: api/fee
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateFee([FromBody] CreateFeeDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (!await _context.Students.AnyAsync(s => s.StudentId == dto.StudentId))
                return BadRequest(new { message = "Student not found." });

            var fee = new Fee
            {
                StudentId = dto.StudentId,
                Term = dto.Term,
                TotalAmount = dto.TotalAmount,
                PaidAmount = 0,
                DueDate = dto.DueDate,
                Status = FeeStatus.Unpaid
            };

            _context.Fees.Add(fee);
            await _context.SaveChangesAsync();

            await _audit.LogAsync(GetUserId(), AuditLogService.Actions.CreateFee,
                $"Created fee for StudentId={dto.StudentId} Term={dto.Term} Amount={dto.TotalAmount}");

            return CreatedAtAction(nameof(GetFee), new { id = fee.FeeId },
                new { message = "Fee record created.", fee.FeeId });
        }

        // PATCH: api/fee/{id}/payment
        [HttpPatch("{id}/payment")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdatePayment(int id, [FromBody] UpdateFeePaymentDto dto)
        {
            var fee = await _context.Fees.FindAsync(id);
            if (fee == null) return NotFound(new { message = "Fee not found." });

            if (dto.PaidAmount < 0 || dto.PaidAmount > fee.TotalAmount)
                return BadRequest(new { message = "Invalid payment amount." });

            var oldPaid = fee.PaidAmount;
            fee.PaidAmount = dto.PaidAmount;

            fee.Status = fee.PaidAmount == 0 ? FeeStatus.Unpaid
                       : fee.PaidAmount >= fee.TotalAmount ? FeeStatus.Paid
                       : FeeStatus.Partial;

            if (DateTime.UtcNow > fee.DueDate && fee.Status != FeeStatus.Paid)
                fee.Status = FeeStatus.Overdue;

            await _context.SaveChangesAsync();

            await _audit.LogAsync(GetUserId(), AuditLogService.Actions.UpdateFeePayment,
                $"FeeId={id} payment updated {oldPaid} → {dto.PaidAmount} Status={fee.Status}");

            return Ok(new { message = "Payment updated.", fee.Status, fee.RemainingAmount });
        }

        // DELETE: api/fee/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteFee(int id)
        {
            var fee = await _context.Fees.FindAsync(id);
            if (fee == null) return NotFound(new { message = "Fee not found." });

            _context.Fees.Remove(fee);
            await _context.SaveChangesAsync();

            await _audit.LogAsync(GetUserId(), AuditLogService.Actions.CreateFee,
                $"Deleted FeeId={id}");

            return Ok(new { message = "Fee deleted." });
        }
    }

    public class CreateFeeDto
    {
        public int StudentId { get; set; }
        public string Term { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public DateTime DueDate { get; set; }
    }

    public class UpdateFeePaymentDto
    {
        public decimal PaidAmount { get; set; }
    }
}