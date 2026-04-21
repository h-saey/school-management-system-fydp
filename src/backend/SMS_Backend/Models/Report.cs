using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SMS_Backend.Models
{
    public class Report
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ReportId { get; set; }

        // ── Foreign Key ────────────────────────────────────────────────────
        [Required]
        public int AdminId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Type { get; set; } = string.Empty; // "Attendance" | "Marks" | "Portfolio" | "Risk"

        public DateTime GeneratedOn { get; set; } = DateTime.UtcNow;

        // Path to generated PDF/CSV file on server
        [MaxLength(500)]
        public string? FilePath { get; set; }

        // ── Navigation Properties ──────────────────────────────────────────

        [ForeignKey("AdminId")]
        public Admin Admin { get; set; } = null!;
    }
}
