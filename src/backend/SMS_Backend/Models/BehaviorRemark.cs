using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SMS_Backend.Models
{
    public class BehaviorRemark
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RemarkId { get; set; }

        // ── Foreign Keys ───────────────────────────────────────────────────
        [Required]
        public int StudentId { get; set; }

        [Required]
        public int TeacherId { get; set; }

        [Required]
        [MaxLength(50)]
        public string RemarkType { get; set; } = string.Empty; // Positive / Negative / Neutral

        [Required]
        public string RemarkText { get; set; } = string.Empty;

        [Required]
        public DateTime Date { get; set; } = DateTime.UtcNow;

        // ── Navigation Properties ──────────────────────────────────────────

        [ForeignKey("StudentId")]
        public Student Student { get; set; } = null!;

        [ForeignKey("TeacherId")]
        public Teacher Teacher { get; set; } = null!;
    }
}
