using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SMS_Backend.Models
{
    public enum ComplaintStatus
    {
        Submitted,
        UnderReview,
        Resolved,
        Rejected,
        Closed
    }

    public class Complaint
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ComplaintId { get; set; }

        // ── Foreign Keys ───────────────────────────────────────────────────
        [Required]
        public int SubmittedByUserId { get; set; }   // Student or Parent

        public int? AssignedToUserId { get; set; }   // Teacher or Admin (nullable until assigned)

        [Required]
        [MaxLength(100)]
        public string Category { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public ComplaintStatus Status { get; set; } = ComplaintStatus.Submitted;

        public string? Remarks { get; set; }         // Staff remarks on resolution

        [Required]
        public DateTime DateSubmitted { get; set; } = DateTime.UtcNow;

        public DateTime? DateClosed { get; set; }

        // ── Navigation Properties ──────────────────────────────────────────

        [ForeignKey("SubmittedByUserId")]
        public User SubmittedBy { get; set; } = null!;

        [ForeignKey("AssignedToUserId")]
        public User? AssignedTo { get; set; }
    }
}
