using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SMS_Backend.Models
{
    public class AuditLog
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int LogId { get; set; }

        // ── Foreign Key ────────────────────────────────────────────────────
        [Required]
        public int UserId { get; set; }

        [Required]
        [MaxLength(200)]
        public string Action { get; set; } = string.Empty; // e.g. "LOGIN", "MARK_ATTENDANCE", "UPDATE_MARKS"

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        // Additional context — JSON string or plain text
        public string? Details { get; set; }

        // ── Navigation Properties ──────────────────────────────────────────

        [ForeignKey("UserId")]
        public User User { get; set; } = null!;
    }
}
