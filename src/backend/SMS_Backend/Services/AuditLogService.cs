using SMS_Backend.Data;
using SMS_Backend.Models;

namespace SMS_Backend.Services
{
    /// <summary>
    /// Inject this anywhere to write an immutable audit log entry.
    /// Call: await _audit.LogAsync(userId, "LOGIN", "details here");
    /// All critical actions (FR-15) are covered below as constants.
    /// </summary>
    public class AuditLogService
    {
        private readonly ApplicationDbContext _context;

        public AuditLogService(ApplicationDbContext context)
        {
            _context = context;
        }

        // ── Action constants — use these everywhere ──────────
        public static class Actions
        {
            // Auth
            public const string Login            = "LOGIN";
            public const string Logout           = "LOGOUT";
            public const string RegisterUser     = "REGISTER_USER";

            // User Management (FR-2)
            public const string CreateUser       = "CREATE_USER";
            public const string UpdateUser       = "UPDATE_USER";
            public const string DeleteUser       = "DELETE_USER";
            public const string ToggleUserStatus = "TOGGLE_USER_STATUS";

            // Attendance (FR-3)
            public const string MarkAttendance   = "MARK_ATTENDANCE";
            public const string UpdateAttendance = "UPDATE_ATTENDANCE";
            public const string LockAttendance   = "LOCK_ATTENDANCE";

            // Marks (FR-4)
            public const string AddMarks         = "ADD_MARKS";
            public const string UpdateMarks      = "UPDATE_MARKS";
            public const string DeleteMarks      = "DELETE_MARKS";

            // Fees (FR-14)
            public const string CreateFee        = "CREATE_FEE";
            public const string UpdateFeePayment = "UPDATE_FEE_PAYMENT";

            // Complaints (FR-12/13)
            public const string SubmitComplaint  = "SUBMIT_COMPLAINT";
            public const string UpdateComplaint  = "UPDATE_COMPLAINT";
            public const string AssignComplaint  = "ASSIGN_COMPLAINT";

            // Notices (FR-9)
            public const string PostNotice       = "POST_NOTICE";
            public const string UpdateNotice     = "UPDATE_NOTICE";
            public const string DeleteNotice     = "DELETE_NOTICE";

            // Risk AI
            public const string PredictRisk      = "AI_PREDICT_RISK";
            public const string TrainModel       = "AI_TRAIN_MODEL";

            // Reports
            public const string GenerateReport   = "GENERATE_REPORT";
        }

        // ── Core write method ────────────────────────────────
        public async Task LogAsync(int userId, string action, string? details = null)
        {
            try
            {
                _context.AuditLogs.Add(new AuditLog
                {
                    UserId    = userId,
                    Action    = action,
                    Timestamp = DateTime.UtcNow,
                    Details   = details
                });
                await _context.SaveChangesAsync();
            }
            catch
            {
                // Per FR-15: if logging fails, don't crash the request
                // In production: write to a fallback file-based log
                Console.Error.WriteLine($"[AUDIT LOG FAILED] Action={action} UserId={userId}");
            }
        }

        // ── Convenience: log without awaiting (fire-and-forget) ──
        public void LogFireAndForget(int userId, string action, string? details = null)
        {
            _ = Task.Run(async () =>
            {
                try { await LogAsync(userId, action, details); }
                catch { /* silent */ }
            });
        }
    }
}
