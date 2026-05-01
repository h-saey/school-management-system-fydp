using Microsoft.EntityFrameworkCore;
using SMS_Backend.Data;
using SMS_Backend.Models;
using SMS_Backend.Services;

namespace SMS_Backend.Services
{
    /// <summary>
    /// Called after any risk assessment.
    /// Sends notifications to the student, their parent, and their teachers.
    /// Only sends if risk is Medium or High to avoid spam.
    /// </summary>
    public class RiskNotificationService
    {
        private readonly ApplicationDbContext _context;

        public RiskNotificationService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task NotifyIfRiskyAsync(RiskResult risk)
        {
            if (risk.RiskLevel == "Low") return; // no notification for low risk

            var student = await _context.Students
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.StudentId == risk.StudentId);

            if (student == null) return;

            string emoji   = risk.RiskLevel == "High" ? "🔴" : "🟡";
            string summary = string.Join("; ", risk.Factors.Take(2));

            var notifications = new List<Notification>();

            // 1. Notify the student themselves
            notifications.Add(new Notification
            {
                UserId   = student.UserId,
                Type     = "RiskAlert",
                Content  = $"{emoji} AI Risk Alert: Your risk level is {risk.RiskLevel}. Reason: {summary}. Please speak to your teacher.",
                DateSent = DateTime.UtcNow,
                Status   = NotificationStatus.Unread
            });

            // 2. Notify parent(s)
            var parents = await _context.Parents
                .Include(p => p.User)
                .Where(p => p.StudentId == risk.StudentId)
                .ToListAsync();

            foreach (var parent in parents)
            {
                notifications.Add(new Notification
                {
                    UserId   = parent.UserId,
                    Type     = "RiskAlert",
                    Content  = $"{emoji} Risk Alert for {risk.StudentName} (Roll: {risk.RollNumber}): Risk level is {risk.RiskLevel}. {summary}. Please contact school.",
                    DateSent = DateTime.UtcNow,
                    Status   = NotificationStatus.Unread
                });
            }

            // 3. Notify teachers who have marked attendance for this student
            var teacherUserIds = await _context.Attendances
                .Where(a => a.StudentId == risk.StudentId)
                .Include(a => a.Teacher)
                .Select(a => a.Teacher.UserId)
                .Distinct()
                .ToListAsync();

            foreach (var teacherUserId in teacherUserIds)
            {
                notifications.Add(new Notification
                {
                    UserId   = teacherUserId,
                    Type     = "RiskAlert",
                    Content  = $"{emoji} Student {risk.StudentName} (Class {risk.Class}) is at {risk.RiskLevel} risk. {summary}.",
                    DateSent = DateTime.UtcNow,
                    Status   = NotificationStatus.Unread
                });
            }

            // Save all — skip duplicates (same user + same content within 24h)
            foreach (var n in notifications)
            {
                bool alreadySent = await _context.Notifications
                    .AnyAsync(x =>
                        x.UserId == n.UserId &&
                        x.Type   == "RiskAlert" &&
                        x.DateSent >= DateTime.UtcNow.AddHours(-24) &&
                        x.Content.Contains(risk.StudentName));

                if (!alreadySent)
                    _context.Notifications.Add(n);
            }

            await _context.SaveChangesAsync();
        }

        public async Task NotifyBulkAsync(List<RiskResult> results)
        {
            foreach (var r in results.Where(r => r.RiskLevel != "Low"))
            {
                try { await NotifyIfRiskyAsync(r); }
                catch { /* don't let one failure stop the rest */ }
            }
        }
    }
}
