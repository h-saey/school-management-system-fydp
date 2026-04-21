using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SMS_Backend.Models
{
    public enum RiskLevel
    {
        Low,
        Medium,
        High
    }

    public class RiskMonitoring
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RiskId { get; set; }

        // ── Foreign Key ────────────────────────────────────────────────────
        [Required]
        public int StudentId { get; set; }

        [Required]
        public RiskLevel RiskLevel { get; set; } = RiskLevel.Low;

        public DateTime MonitoredOn { get; set; } = DateTime.UtcNow;

        // Notes from teacher override or system analysis explanation
        public string? Notes { get; set; }

        // ── Navigation Properties ──────────────────────────────────────────

        [ForeignKey("StudentId")]
        public Student Student { get; set; } = null!;
    }
}
