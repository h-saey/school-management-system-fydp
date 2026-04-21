using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SMS_Backend.Models
{
    public class StudentPortfolio
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int PortfolioId { get; set; }

        // ── Foreign Key ────────────────────────────────────────────────────
        [Required]
        public int StudentId { get; set; }

        // Text summaries compiled by the system from individual tables
        public string? AttendanceSummary    { get; set; }
        public string? MarksSummary         { get; set; }
        public string? AchievementsSummary  { get; set; }
        public string? BehaviorSummary      { get; set; }

        public DateTime GeneratedOn  { get; set; } = DateTime.UtcNow;
        public DateTime LastUpdated  { get; set; } = DateTime.UtcNow;

        // ── Navigation Properties ──────────────────────────────────────────

        [ForeignKey("StudentId")]
        public Student Student { get; set; } = null!;
    }
}
