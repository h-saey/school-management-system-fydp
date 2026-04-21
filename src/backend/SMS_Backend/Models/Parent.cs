using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SMS_Backend.Models
{
    public class Parent
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ParentId { get; set; }

        // ── Foreign Keys ───────────────────────────────────────────────────
        [Required]
        public int UserId { get; set; }

        [Required]
        public int StudentId { get; set; }

        [Required]
        [MaxLength(50)]
        public string Relation { get; set; } = string.Empty; // Father / Mother / Guardian

        // ── Navigation Properties ──────────────────────────────────────────

        // Navigation Properties
        public User User { get; set; } = null!;

        public Student Student { get; set; } = null!;
    }
}
