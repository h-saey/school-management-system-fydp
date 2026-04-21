using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SMS_Backend.Models
{
    public enum NotificationStatus
    {
        Unread,
        Read,
        Archived
    }

    public class Notification
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int NotificationId { get; set; }

        // ── Foreign Key ────────────────────────────────────────────────────
        [Required]
        public int UserId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Type { get; set; } = string.Empty; // e.g. "Attendance", "Marks", "Fee", "Complaint"

        [Required]
        public string Content { get; set; } = string.Empty;

        public DateTime DateSent { get; set; } = DateTime.UtcNow;

        [Required]
        public NotificationStatus Status { get; set; } = NotificationStatus.Unread;

        // ── Navigation Properties ──────────────────────────────────────────

        [ForeignKey("UserId")]
        public User User { get; set; } = null!;
    }
}
