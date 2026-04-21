using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SMS_Backend.Models
{
    public class Achievement
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int AchievementId { get; set; }

        // ── Foreign Key ────────────────────────────────────────────────────
        [Required]
        public int StudentId { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Category { get; set; } = string.Empty; // e.g. "Sports", "Academic", "Arts"

        [Required]
        public DateTime Date { get; set; }

        // Path/URL to uploaded certificate or document
        [MaxLength(500)]
        public string? FilePath { get; set; }

        // ── Navigation Properties ──────────────────────────────────────────

        [ForeignKey("StudentId")]
        public Student Student { get; set; } = null!;
    }
}
