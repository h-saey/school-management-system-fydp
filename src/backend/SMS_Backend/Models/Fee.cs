using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SMS_Backend.Models
{
    public enum FeeStatus
    {
        Unpaid,
        Partial,
        Paid,
        Overdue
    }

    public class Fee
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int FeeId { get; set; }

        // ── Foreign Key ────────────────────────────────────────────────────
        [Required]
        public int StudentId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Term { get; set; } = string.Empty; // e.g. "Fall 2024", "Spring 2025"

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal TotalAmount { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal PaidAmount { get; set; } = 0;

        [Required]
        public DateTime DueDate { get; set; }

        [Required]
        public FeeStatus Status { get; set; } = FeeStatus.Unpaid;

        // Computed — not stored in DB
        [NotMapped]
        public decimal RemainingAmount => TotalAmount - PaidAmount;

        // ── Navigation Properties ──────────────────────────────────────────

        [ForeignKey("StudentId")]
        public Student Student { get; set; } = null!;
    }
}
