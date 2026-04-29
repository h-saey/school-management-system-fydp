using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SMS_Backend.Data;
using SMS_Backend.Models;
using System.Security.Claims;

namespace SMS_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public AdminController(ApplicationDbContext context) => _context = context;

        [HttpGet]
        public async Task<IActionResult> GetAllAdmins()
        {
            var admins = await _context.Admins.Include(a => a.User)
                .Select(a => new { a.AdminId, a.FirstName, a.LastName, a.User.Email, a.User.IsActive })
                .ToListAsync();
            return Ok(admins);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAdmin(int id)
        {
            var admin = await _context.Admins.Include(a => a.User).FirstOrDefaultAsync(a => a.AdminId == id);
            if (admin == null) return NotFound(new { message = "Admin not found." });
            return Ok(new { admin.AdminId, admin.FirstName, admin.LastName, admin.User.Email, admin.User.IsActive });
        }

        [HttpPost]
        public async Task<IActionResult> CreateAdmin([FromBody] CreateAdminDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            if (!await _context.Users.AnyAsync(u => u.UserId == dto.UserId && u.Role == UserRole.Admin))
                return BadRequest(new { message = "Linked user not found or is not Admin role." });
            if (await _context.Admins.AnyAsync(a => a.UserId == dto.UserId))
                return Conflict(new { message = "Admin profile already exists." });
            var admin = new Admin { UserId = dto.UserId, FirstName = dto.FirstName, LastName = dto.LastName };
            _context.Admins.Add(admin);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAdmin), new { id = admin.AdminId }, new { message = "Admin created.", admin.AdminId });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAdmin(int id, [FromBody] UpdateAdminDto dto)
        {
            var admin = await _context.Admins.FindAsync(id);
            if (admin == null) return NotFound(new { message = "Admin not found." });
            if (!string.IsNullOrWhiteSpace(dto.FirstName)) admin.FirstName = dto.FirstName;
            if (!string.IsNullOrWhiteSpace(dto.LastName)) admin.LastName = dto.LastName;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Admin updated." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAdmin(int id)
        {
            var admin = await _context.Admins.FindAsync(id);
            if (admin == null) return NotFound(new { message = "Admin not found." });
            _context.Admins.Remove(admin);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Admin deleted." });
        }

        // ══════════════════════════════════════════════════
        // GET: api/admin/dashboard-stats  — Full Analytics
        // ══════════════════════════════════════════════════
        [AllowAnonymous]
        [HttpGet("dashboard-stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            // ── Basic Counts ───────────────────────────────
            var totalStudents = await _context.Students.CountAsync();
            var totalTeachers = await _context.Teachers.CountAsync();
            var totalParents = await _context.Parents.CountAsync();
            var activeUsers = await _context.Users.CountAsync(u => u.IsActive);
            var openComplaints = await _context.Complaints
                .CountAsync(c => c.Status == ComplaintStatus.Submitted || c.Status == ComplaintStatus.UnderReview);
            var overdueFees = await _context.Fees.CountAsync(f => f.Status == FeeStatus.Overdue);

            var sixMonthsAgo = DateTime.UtcNow.AddMonths(-6);

            // ── 1. Monthly Student Growth ──────────────────
            var studentGrowth = await _context.Users
                .Where(u => u.Role == UserRole.Student && u.CreatedAt >= sixMonthsAgo)
                .GroupBy(u => new { u.CreatedAt.Year, u.CreatedAt.Month })
                .Select(g => new
                {
                    Month = g.Key.Year.ToString() + "-" + g.Key.Month.ToString()
,
                    Count = g.Count()
                })
                .OrderBy(g => g.Month)
                .ToListAsync();

            // ── 2. Complaint Trend ─────────────────────────
            var complaintTrend = await _context.Complaints
                .Where(c => c.DateSubmitted >= sixMonthsAgo)
                .GroupBy(c => new { c.DateSubmitted.Year, c.DateSubmitted.Month })
                .Select(g => new
                {
                    Month = g.Key.Year.ToString() + "-" + g.Key.Month.ToString()
,
                    TotalComplaints = g.Count()
                })
                .OrderBy(g => g.Month)
                .ToListAsync();

            // ── 3. Fee Collection Trend (paid per month) ───
            var feeCollectionTrend = await _context.Fees
                .Where(f => f.Status == FeeStatus.Paid && f.DueDate >= sixMonthsAgo)
                .GroupBy(f => new { f.DueDate.Year, f.DueDate.Month })
                .Select(g => new
                {
                    Month = g.Key.Year.ToString() + "-" + g.Key.Month.ToString()
,
                    TotalPaidFees = g.Sum(f => (double)f.PaidAmount)
                })
                .OrderBy(g => g.Month)
                .ToListAsync();

            // ── 4. Top 5 Performing Classes ────────────────
            var classPerformance = await _context.Marks
                .Include(m => m.Student)
                .GroupBy(m => m.Student.Class)
                .Select(g => new
                {
                    Class = g.Key,
                    Average = Math.Round(
                        g.Average(m => m.TotalMarks > 0
                            ? (double)(m.MarksObtained / m.TotalMarks * 100) : 0), 1)
                })
                .OrderByDescending(g => g.Average)
                .Take(5)
                .ToListAsync();

            // ── 5. Low Attendance Warning (<75%) ───────────
            var attendanceByClass = await _context.Attendances
                .Include(a => a.Student)
                .GroupBy(a => a.Student.Class)
                .Select(g => new
                {
                    Class = g.Key,
                    AttendanceRate = Math.Round(
                        (double)g.Count(a => a.Status == AttendanceStatus.Present) / g.Count() * 100, 1)
                })
                .ToListAsync();

            var lowAttendance = attendanceByClass
                .Where(a => a.AttendanceRate < 75)
                .OrderBy(a => a.AttendanceRate)
                .ToList();

            // ── Attendance Trend (monthly avg %) ───────────
            var attendanceTrend = await _context.Attendances
                .Where(a => a.Date >= sixMonthsAgo)
                .GroupBy(a => new { a.Date.Year, a.Date.Month })
                .Select(g => new
                {
                    Month = g.Key.Year.ToString() + "-" + g.Key.Month.ToString()
,
                    Attendance = Math.Round(
                        (double)g.Count(a => a.Status == AttendanceStatus.Present) / g.Count() * 100, 1)
                })
                .OrderBy(g => g.Month)
                .ToListAsync();

            // ── Fee Breakdown by Status ────────────────────
            var feeBreakdown = new
            {
                Paid = await _context.Fees.Where(f => f.Status == FeeStatus.Paid)
                              .SumAsync(f => (double)f.PaidAmount),
                Pending = await _context.Fees.Where(f => f.Status == FeeStatus.Partial || f.Status == FeeStatus.Unpaid)
                              .SumAsync(f => (double)(f.TotalAmount - f.PaidAmount)),
                Overdue = await _context.Fees.Where(f => f.Status == FeeStatus.Overdue)
                              .SumAsync(f => (double)(f.TotalAmount - f.PaidAmount))
            };

            // ── Recent Activities from Audit Log ───────────
            var recentActivities = await _context.AuditLogs
                .Include(l => l.User)
                .OrderByDescending(l => l.Timestamp)
                .Take(10)
                .Select(l => new
                {
                    Activity = l.User.Username + " — " + l.Action,
                    Time = l.Timestamp.ToString("MMM dd, HH:mm")
                })
                .ToListAsync();

            return Ok(new
            {
                // Counts
                TotalStudents = totalStudents,
                TotalTeachers = totalTeachers,
                TotalParents = totalParents,
                ActiveUsers = activeUsers,
                OpenComplaints = openComplaints,
                OverdueFees = overdueFees,

                // Charts
                StudentGrowth = studentGrowth,
                ComplaintTrend = complaintTrend,
                FeeCollectionTrend = feeCollectionTrend,
                ClassPerformance = classPerformance,
                LowAttendance = lowAttendance,
                AttendanceTrend = attendanceTrend,
                FeeBreakdown = feeBreakdown,
                RecentActivities = recentActivities
            });
        }
    }

    public class CreateAdminDto
    {
        public int UserId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
    }

    public class UpdateAdminDto
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
    }
}
//using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.Mvc;
//using Microsoft.EntityFrameworkCore;
//using SMS_Backend.Data;
//using SMS_Backend.Models;
//using System.ComponentModel.DataAnnotations;

//namespace SMS_Backend.Controllers
//{
//    [ApiController]
//    [Route("api/[controller]")]
//    [Authorize(Roles = "Admin")]
//    public class AdminController : ControllerBase
//    {
//        private readonly ApplicationDbContext _context;

//        public AdminController(ApplicationDbContext context)
//        {
//            _context = context;
//        }

//        // GET: api/admin
//        [HttpGet]
//        public async Task<IActionResult> GetAllAdmins()
//        {
//            var admins = await _context.Admins
//                .Include(a => a.User)
//                .Select(a => new
//                {
//                    a.AdminId,
//                    a.FirstName,
//                    a.LastName,
//                    a.User.Email,
//                    a.User.IsActive
//                })
//                .ToListAsync();

//            return Ok(admins);
//        }

//        // GET: api/admin/{id}
//        [HttpGet("{id}")]
//        public async Task<IActionResult> GetAdmin(int id)
//        {
//            var admin = await _context.Admins
//                .Include(a => a.User)
//                .FirstOrDefaultAsync(a => a.AdminId == id);

//            if (admin == null)
//                return NotFound(new { message = "Admin not found." });

//            return Ok(new
//            {
//                admin.AdminId,
//                admin.FirstName,
//                admin.LastName,
//                admin.User.Email,
//                admin.User.IsActive
//            });
//        }

//        // POST: api/admin
//        [HttpPost]
//        [Authorize(Roles = "Admin")]
//        public async Task<IActionResult> CreateAdmin([FromBody] CreateAdminDto dto)
//        {
//            if (!ModelState.IsValid)
//                return BadRequest(ModelState);

//            var userExists = await _context.Users
//                .AnyAsync(u => u.UserId == dto.UserId && u.Role == UserRole.Admin);
//            if (!userExists)
//                return BadRequest(new { message = "Linked user not found or is not an Admin role." });

//            var already = await _context.Admins.AnyAsync(a => a.UserId == dto.UserId);
//            if (already)
//                return Conflict(new { message = "Admin profile already exists for this user." });

//            var admin = new Admin
//            {
//                UserId    = dto.UserId,
//                FirstName = dto.FirstName,
//                LastName  = dto.LastName
//            };

//            _context.Admins.Add(admin);
//            await _context.SaveChangesAsync();

//            return CreatedAtAction(nameof(GetAdmin), new { id = admin.AdminId },
//                new { message = "Admin profile created.", admin.AdminId });
//        }

//        // PUT: api/admin/{id}
//        [HttpPut("{id}")]
//        [Authorize(Roles = "Admin")]
//        public async Task<IActionResult> UpdateAdmin(int id, [FromBody] UpdateAdminDto dto)
//        {
//            var admin = await _context.Admins.FindAsync(id);
//            if (admin == null)
//                return NotFound(new { message = "Admin not found." });

//            if (!string.IsNullOrWhiteSpace(dto.FirstName)) admin.FirstName = dto.FirstName;
//            if (!string.IsNullOrWhiteSpace(dto.LastName))  admin.LastName  = dto.LastName;

//            await _context.SaveChangesAsync();
//            return Ok(new { message = "Admin updated successfully." });
//        }

//        // DELETE: api/admin/{id}
//        [HttpDelete("{id}")]
//        [Authorize(Roles = "Admin")]
//        public async Task<IActionResult> DeleteAdmin(int id)
//        {
//            var admin = await _context.Admins.FindAsync(id);
//            if (admin == null)
//                return NotFound(new { message = "Admin not found." });

//            _context.Admins.Remove(admin);
//            await _context.SaveChangesAsync();
//            return Ok(new { message = "Admin deleted successfully." });
//        }

//        //// GET: api/admin/dashboard-stats — quick summary for admin dashboard
//        //[HttpGet("dashboard-stats")]
//        //public async Task<IActionResult> GetDashboardStats()
//        //{
//        //    var stats = new
//        //    {
//        //        TotalStudents  = await _context.Students.CountAsync(),
//        //        TotalTeachers  = await _context.Teachers.CountAsync(),
//        //        TotalParents   = await _context.Parents.CountAsync(),
//        //        ActiveUsers    = await _context.Users.CountAsync(u => u.IsActive),
//        //        OpenComplaints = await _context.Complaints
//        //            .CountAsync(c => c.Status == ComplaintStatus.Submitted || c.Status == ComplaintStatus.UnderReview),
//        //        OverdueFees    = await _context.Fees.CountAsync(f => f.Status == FeeStatus.Overdue)
//        //    };

//        //    return Ok(stats);
//        //}
//        [HttpGet("dashboard-stats")]
//        public async Task<IActionResult> GetDashboardStats()
//        {
//            var baseStats = new
//            {
//                TotalStudents = await _context.Students.CountAsync(),
//                TotalTeachers = await _context.Teachers.CountAsync(),
//                TotalParents = await _context.Parents.CountAsync(),
//                ActiveUsers = await _context.Users.CountAsync(u => u.IsActive),
//                OpenComplaints = await _context.Complaints.CountAsync(c =>
//                    c.Status == ComplaintStatus.Submitted ||
//                    c.Status == ComplaintStatus.UnderReview),
//                OverdueFees = await _context.Fees.CountAsync(f => f.Status == FeeStatus.Overdue)
//            };

//            //// REAL attendance (example: grouped by month)
//            //var attendance = await _context.Attendances
//            //    .GroupBy(a => new { a.Date.Year, a.Date.Month })
//            //    .Select(g => new MonthlyAttendanceDto
//            //    {
//            //        Month = g.Key.Month.ToString(),
//            //        Attendance = g.Count()
//            //    })
//            //    .ToListAsync();
//            // LAST 12 MONTHS attendance (dynamic)
//            var last12Months = Enumerable.Range(0, 12)
//                .Select(i => DateTime.Now.AddMonths(-i))
//                .OrderBy(d => d)
//                .ToList();

//            var attendanceRaw = await _context.Attendances
//                .GroupBy(a => new { a.Date.Year, a.Date.Month })
//                .Select(g => new
//                {
//                    g.Key.Year,
//                    g.Key.Month,
//                    Count = g.Count()
//                })
//                .ToListAsync();

//            var attendance = last12Months
//                .Select(m =>
//                {
//                    var record = attendanceRaw
//                        .FirstOrDefault(a =>
//                            a.Year == m.Year &&
//                            a.Month == m.Month);

//                    return new MonthlyAttendanceDto
//                    {
//                        Month = m.ToString("MMM"), // Jan Feb Mar
//                        Attendance = record?.Count ?? 0
//                    };
//                })
//                .ToList();


//            //// REAL class performance
//            //var classPerf = await _context.Marks
//            //    .Include(m => m.Student)
//            //    .GroupBy(m => m.Student.Class)
//            //    .Select(g => new ClassPerformanceDto
//            //    {
//            //        Class = g.Key,
//            //        Average = Convert.ToDouble(g.Average(x => x.Percentage))

//            //    })
//            //    .ToListAsync();
//            var classPerf = await _context.Marks
//    .Include(m => m.Student)
//    .GroupBy(m => m.Student.Class)
//    .Select(g => new ClassPerformanceDto
//    {
//        Class = g.Key,
//        Average = Convert.ToDouble(
//            g.Average(x => x.Percentage)
//        )
//    })
//    .OrderBy(c => c.Class)
//    .ToListAsync();


//            // REAL fee breakdown
//            var fees = await _context.Fees.ToListAsync();

//            var feeBreakdown = new FeeBreakdownDto
//            {
//                Paid = await _context.Fees
//        .CountAsync(f => f.Status == FeeStatus.Paid),

//                Unpaid = await _context.Fees
//        .CountAsync(f => f.Status == FeeStatus.Unpaid),

//                Overdue = await _context.Fees
//        .CountAsync(f => f.Status == FeeStatus.Overdue)
//            };

//            return Ok(new AdminDashboardDto
//            {
//                TotalStudents = baseStats.TotalStudents,
//                TotalTeachers = baseStats.TotalTeachers,
//                TotalParents = baseStats.TotalParents,
//                ActiveUsers = baseStats.ActiveUsers,
//                OpenComplaints = baseStats.OpenComplaints,
//                OverdueFees = baseStats.OverdueFees,

//                AttendanceTrend = attendance,
//                ClassPerformance = classPerf,
//                FeeBreakdown = feeBreakdown
//            });
//        }


//    }

//    public class CreateAdminDto
//    {
//        [Required]
//        public int UserId { get; set; }
//        [Required]
//        public string FirstName { get; set; } = string.Empty;
//        [Required]
//        public string LastName { get; set; } = string.Empty;
//    }

//    public class UpdateAdminDto
//    {
//        public string? FirstName { get; set; }
//        public string? LastName { get; set; }
//    }
//    public class AdminDashboardDto
//    {
//        public int TotalStudents { get; set; }
//        public int TotalTeachers { get; set; }
//        public int TotalParents { get; set; }
//        public int ActiveUsers { get; set; }
//        public int OpenComplaints { get; set; }
//        public int OverdueFees { get; set; }

//        // REAL ANALYTICS
//        public List<MonthlyAttendanceDto> AttendanceTrend { get; set; } = new();
//        public List<ClassPerformanceDto> ClassPerformance { get; set; } = new();
//        public FeeBreakdownDto FeeBreakdown { get; set; } = new();
//    }

//    public class MonthlyAttendanceDto
//    {
//        public string Month { get; set; } = "";
//        public double Attendance { get; set; }
//    }

//    public class ClassPerformanceDto
//    {
//        public string Class { get; set; } = "";
//        public double Average { get; set; }
//    }

//    public class FeeBreakdownDto
//    {
//        public double Paid { get; set; }
//        public double Unpaid { get; set; }
//        public double Overdue { get; set; }
//    }

//}
