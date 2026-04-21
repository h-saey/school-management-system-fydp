using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SMS_Backend.Models
{
    public class Admin
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int AdminId { get; set; }

        // ── Foreign Key to User ────────────────────────────────────────────
        [Required]
        public int UserId { get; set; }

        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        // ── Navigation Properties ──────────────────────────────────────────

        [ForeignKey("UserId")]
        public User User { get; set; } = null!;

        // Admin generates many reports
        public ICollection<Report> Reports { get; set; } = new List<Report>();
    }
}
