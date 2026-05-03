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
//    public class AttendanceController : ControllerBase
//    {
//        private readonly ApplicationDbContext _context;

//        public AttendanceController(ApplicationDbContext context)
//        {
//            _context = context;
//        }

//        private int GetCurrentUserId() =>
//            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

//        private string GetCurrentUserRole() =>
//            User.FindFirstValue(ClaimTypes.Role)!;

//        // GET: api/attendance
//        [HttpGet]
//        [Authorize(Roles = "Admin,Teacher")]
//        public async Task<IActionResult> GetAllAttendance([FromQuery] int? studentId, [FromQuery] DateTime? date)
//        {
//            var query = _context.Attendances
//                .Include(a => a.Student)
//                .Include(a => a.Teacher)
//                .AsQueryable();

//            if (studentId.HasValue) query = query.Where(a => a.StudentId == studentId.Value);
//            if (date.HasValue)      query = query.Where(a => a.Date.Date == date.Value.Date);

//            var result = await query.Select(a => new
//            {
//                a.AttendanceId,
//                a.Date,
//                a.Status,
//                a.IsLocked,
//                Student = new { a.Student.FirstName, a.Student.LastName, a.Student.RollNumber },
//                MarkedBy = new { a.Teacher.FirstName, a.Teacher.LastName }
//            }).ToListAsync();

//            return Ok(result);
//        }

//        // GET: api/attendance/my — Student sees own attendance
//        [HttpGet("my")]
//        [Authorize(Roles = "Student")]
//        public async Task<IActionResult> GetMyAttendance([FromQuery] DateTime? from, [FromQuery] DateTime? to)
//        {
//            var currentUserId = GetCurrentUserId();
//            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == currentUserId);
//            if (student == null)
//                return NotFound(new { message = "Student profile not found." });

//            var query = _context.Attendances.Where(a => a.StudentId == student.StudentId);
//            if (from.HasValue) query = query.Where(a => a.Date >= from.Value);
//            if (to.HasValue)   query = query.Where(a => a.Date <= to.Value);

//            var result = await query
//                .OrderByDescending(a => a.Date)
//                .Select(a => new { a.AttendanceId, a.Date, a.Status })
//                .ToListAsync();

//            return Ok(result);
//        }

//        // GET: api/attendance/student/{studentId} — Parent views linked student attendance
//        [HttpGet("student/{studentId}")]
//        [Authorize(Roles = "Admin,Teacher,Parent")]
//        public async Task<IActionResult> GetStudentAttendance(int studentId)
//        {
//            var role = GetCurrentUserRole();
//            if (role == "Parent")
//            {
//                var currentUserId = GetCurrentUserId();
//                var isLinked = await _context.Parents
//                    .AnyAsync(p => p.UserId == currentUserId && p.StudentId == studentId);
//                if (!isLinked) return Forbid();
//            }

//            var records = await _context.Attendances
//                .Where(a => a.StudentId == studentId)
//                .OrderByDescending(a => a.Date)
//                .Select(a => new { a.AttendanceId, a.Date, a.Status, a.IsLocked })
//                .ToListAsync();

//            return Ok(records);
//        }

//        // POST: api/attendance — Teacher marks attendance
//        [HttpPost]
//        [Authorize(Roles = "Admin,Teacher")]
//        public async Task<IActionResult> MarkAttendance([FromBody] MarkAttendanceDto dto)
//        {
//            if (!ModelState.IsValid)
//                return BadRequest(ModelState);

//            var studentExists = await _context.Students.AnyAsync(s => s.StudentId == dto.StudentId);
//            if (!studentExists)
//                return BadRequest(new { message = "Student not found." });

//            var duplicate = await _context.Attendances
//                .AnyAsync(a => a.StudentId == dto.StudentId && a.Date.Date == dto.Date.Date);
//            if (duplicate)
//                return Conflict(new { message = "Attendance already marked for this student on this date." });

//            var currentUserId = GetCurrentUserId();
//            var teacher = await _context.Teachers.FirstOrDefaultAsync(t => t.UserId == currentUserId);

//            var attendance = new Attendance
//            {
//                StudentId = dto.StudentId,
//                TeacherId = teacher?.TeacherId ?? dto.TeacherId,
//                Date      = dto.Date,
//                Status    = dto.Status
//            };

//            _context.Attendances.Add(attendance);
//            await _context.SaveChangesAsync();

//            return CreatedAtAction(nameof(GetAllAttendance), new { },
//                new { message = "Attendance marked.", attendance.AttendanceId });
//        }

//        // PUT: api/attendance/{id} — Update if not locked
//        [HttpPut("{id}")]
//        [Authorize(Roles = "Admin,Teacher")]
//        public async Task<IActionResult> UpdateAttendance(int id, [FromBody] UpdateAttendanceDto dto)
//        {
//            var attendance = await _context.Attendances.FindAsync(id);
//            if (attendance == null)
//                return NotFound(new { message = "Attendance record not found." });

//            if (attendance.IsLocked)
//                return BadRequest(new { message = "Attendance is locked and cannot be edited." });

//            attendance.Status = dto.Status;
//            await _context.SaveChangesAsync();

//            return Ok(new { message = "Attendance updated successfully." });
//        }

//        // PATCH: api/attendance/{id}/lock — Lock a record
//        [HttpPatch("{id}/lock")]
//        [Authorize(Roles = "Admin,Teacher")]
//        public async Task<IActionResult> LockAttendance(int id)
//        {
//            var attendance = await _context.Attendances.FindAsync(id);
//            if (attendance == null)
//                return NotFound(new { message = "Attendance record not found." });

//            attendance.IsLocked = true;
//            await _context.SaveChangesAsync();

//            return Ok(new { message = "Attendance locked successfully." });
//        }

//        // DELETE: api/attendance/{id}
//        [HttpDelete("{id}")]
//        [Authorize(Roles = "Admin")]
//        public async Task<IActionResult> DeleteAttendance(int id)
//        {
//            var attendance = await _context.Attendances.FindAsync(id);
//            if (attendance == null)
//                return NotFound(new { message = "Attendance record not found." });

//            if (attendance.IsLocked)
//                return BadRequest(new { message = "Cannot delete a locked attendance record." });

//            _context.Attendances.Remove(attendance);
//            await _context.SaveChangesAsync();
//            return Ok(new { message = "Attendance deleted." });
//        }

//        [HttpGet("percentage/{studentId}")]
//        [Authorize(Roles = "Admin,Teacher,Parent,Student")]
//        public async Task<IActionResult> GetAttendancePercentage(int studentId, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
//        {
//            var role = GetCurrentUserRole();
//            var currentUserId = GetCurrentUserId();

//            if (role == "Student")
//            {
//                var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == currentUserId);
//                if (student == null || student.StudentId != studentId)
//                    return Forbid();
//            }

//            if (role == "Parent")
//            {
//                var isLinked = await _context.Parents
//                    .AnyAsync(p => p.UserId == currentUserId && p.StudentId == studentId);

//                if (!isLinked)
//                    return Forbid();
//            }

//            var query = _context.Attendances
//                .Where(a => a.StudentId == studentId);

//            if (from.HasValue)
//                query = query.Where(a => a.Date >= from.Value);

//            if (to.HasValue)
//                query = query.Where(a => a.Date <= to.Value);

//            var records = await query.ToListAsync();

//            if (!records.Any())
//                return Ok(new { message = "No attendance records found." });

//            var total = records.Count;
//            var present = records.Count(r => r.Status == AttendanceStatus.Present);
//            var absent = records.Count(r => r.Status == AttendanceStatus.Absent);

//            var percentage = (double)present / total * 100;

//            return Ok(new
//            {
//                StudentId = studentId,
//                TotalDays = total,
//                PresentDays = present,
//                AbsentDays = absent,
//                AttendancePercentage = Math.Round(percentage, 2)
//            });
//        }

//    }


//    public class MarkAttendanceDto
//    {
//        public int StudentId { get; set; }
//        public int TeacherId { get; set; }
//        public DateTime Date { get; set; }
//        public AttendanceStatus Status { get; set; }
//    }

//    public class UpdateAttendanceDto
//    {
//        public AttendanceStatus Status { get; set; }
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
    public class AttendanceController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly AuditLogService _audit;

        public AttendanceController(ApplicationDbContext context, AuditLogService audit)
        {
            _context = context;
            _audit = audit;
        }

        private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        private string GetUserRole() => User.FindFirstValue(ClaimTypes.Role)!;

        // GET: api/attendance
        [HttpGet]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> GetAllAttendance(
            [FromQuery] int? studentId, [FromQuery] DateTime? date)
        {
            var query = _context.Attendances
                .Include(a => a.Student).Include(a => a.Teacher).AsQueryable();
            if (studentId.HasValue) query = query.Where(a => a.StudentId == studentId.Value);
            if (date.HasValue) query = query.Where(a => a.Date.Date == date.Value.Date);

            var result = await query.Select(a => new
            {
                a.AttendanceId,
                a.Date,
                a.Status,
                a.IsLocked,
                Student = new { a.Student.FirstName, a.Student.LastName, a.Student.RollNumber },
                MarkedBy = new { a.Teacher.FirstName, a.Teacher.LastName }
            }).ToListAsync();

            return Ok(result);
        }

        // GET: api/attendance/my  — Student sees own
        [HttpGet("my")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetMyAttendance(
            [FromQuery] DateTime? from, [FromQuery] DateTime? to)
        {
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == GetUserId());
            if (student == null) return NotFound(new { message = "Student profile not found." });

            var query = _context.Attendances.Where(a => a.StudentId == student.StudentId);
            if (from.HasValue) query = query.Where(a => a.Date >= from.Value);
            if (to.HasValue) query = query.Where(a => a.Date <= to.Value);

            return Ok(await query.OrderByDescending(a => a.Date)
                .Select(a => new { a.AttendanceId, a.Date, a.Status }).ToListAsync());
        }

        // GET: api/attendance/student/{studentId}  — Parent or Teacher views a student
        [HttpGet("student/{studentId}")]
        [Authorize(Roles = "Admin,Teacher,Parent")]
        public async Task<IActionResult> GetStudentAttendance(int studentId)
        {
            if (GetUserRole() == "Parent")
            {
                var linked = await _context.Parents
                    .AnyAsync(p => p.UserId == GetUserId() && p.StudentId == studentId);
                if (!linked) return Forbid();
            }

            var records = await _context.Attendances
                .Where(a => a.StudentId == studentId)
                .OrderByDescending(a => a.Date)
                .Select(a => new { a.AttendanceId, a.Date, a.Status, a.IsLocked })
                .ToListAsync();

            return Ok(records);
        }

        // POST: api/attendance
        [HttpPost]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> MarkAttendance([FromBody] MarkAttendanceDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (!await _context.Students.AnyAsync(s => s.StudentId == dto.StudentId))
                return BadRequest(new { message = "Student not found." });

            if (await _context.Attendances.AnyAsync(a =>
                a.StudentId == dto.StudentId && a.Date.Date == dto.Date.Date))
                return Conflict(new { message = "Attendance already marked for this date." });

            var teacher = await _context.Teachers.FirstOrDefaultAsync(t => t.UserId == GetUserId());

            var attendance = new Attendance
            {
                StudentId = dto.StudentId,
                TeacherId = teacher?.TeacherId ?? dto.TeacherId,
                Date = dto.Date,
                Status = dto.Status
            };

            _context.Attendances.Add(attendance);
            await _context.SaveChangesAsync();

            // FR-15: audit log
            await _audit.LogAsync(GetUserId(), AuditLogService.Actions.MarkAttendance,
                $"Marked attendance for StudentId={dto.StudentId} Date={dto.Date:yyyy-MM-dd} Status={dto.Status}");

            return CreatedAtAction(nameof(GetAllAttendance), new { },
                new { message = "Attendance marked.", attendance.AttendanceId });
        }

        // PUT: api/attendance/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> UpdateAttendance(int id, [FromBody] UpdateAttendanceDto dto)
        {
            var attendance = await _context.Attendances.FindAsync(id);
            if (attendance == null) return NotFound(new { message = "Record not found." });
            if (attendance.IsLocked) return BadRequest(new { message = "Attendance is locked." });

            var oldStatus = attendance.Status;
            attendance.Status = dto.Status;
            await _context.SaveChangesAsync();

            await _audit.LogAsync(GetUserId(), AuditLogService.Actions.UpdateAttendance,
                $"AttendanceId={id} changed {oldStatus} → {dto.Status}");

            return Ok(new { message = "Attendance updated." });
        }

        // PATCH: api/attendance/{id}/lock
        [HttpPatch("{id}/lock")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> LockAttendance(int id)
        {
            var attendance = await _context.Attendances.FindAsync(id);
            if (attendance == null) return NotFound(new { message = "Record not found." });

            attendance.IsLocked = true;
            await _context.SaveChangesAsync();

            await _audit.LogAsync(GetUserId(), AuditLogService.Actions.LockAttendance,
                $"AttendanceId={id} locked");

            return Ok(new { message = "Attendance locked." });
        }

        // DELETE: api/attendance/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAttendance(int id)
        {
            var attendance = await _context.Attendances.FindAsync(id);
            if (attendance == null) return NotFound(new { message = "Record not found." });
            if (attendance.IsLocked) return BadRequest(new { message = "Cannot delete locked record." });

            _context.Attendances.Remove(attendance);
            await _context.SaveChangesAsync();

            await _audit.LogAsync(GetUserId(), AuditLogService.Actions.MarkAttendance,
                $"Deleted AttendanceId={id}");

            return Ok(new { message = "Attendance deleted." });
        }
    }

    public class MarkAttendanceDto
    {
        public int StudentId { get; set; }
        public int TeacherId { get; set; }
        public DateTime Date { get; set; }
        public AttendanceStatus Status { get; set; }
    }

    public class UpdateAttendanceDto
    {
        public AttendanceStatus Status { get; set; }
    }
}