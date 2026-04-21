using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SMS_Backend.Models
{
    public class Mark
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int MarksId { get; set; }

        // ── Foreign Keys ───────────────────────────────────────────────────
        [Required]
        public int StudentId { get; set; }

        [Required]
        public int TeacherId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Subject { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Exam { get; set; } = string.Empty; // e.g. "Midterm", "Final", "Quiz 1"

        [Required]
        [Column(TypeName = "decimal(5,2)")]
        [Range(0, 10000)]
        public decimal MarksObtained { get; set; }

        [Required]
        [Column(TypeName = "decimal(5,2)")]
        [Range(1, 10000)]
        public decimal TotalMarks { get; set; }

        // Computed property — not stored in DB
        [NotMapped]
        public decimal Percentage => TotalMarks > 0
            ? Math.Round((MarksObtained / TotalMarks) * 100, 2)
            : 0;

        // ── Navigation Properties ──────────────────────────────────────────

        [ForeignKey("StudentId")]
        public Student Student { get; set; } = null!;

        [ForeignKey("TeacherId")]
        public Teacher Teacher { get; set; } = null!;
    }
}
