using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SMS_Backend.Models
{
    public class Teacher
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TeacherId { get; set; }

        // ── Foreign Key to User ────────────────────────────────────────────
        [Required]
        public int UserId { get; set; }

        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        // Comma-separated or JSON list of subjects (e.g. "Math, Physics")
        [MaxLength(500)]
        public string AssignedSubjects { get; set; } = string.Empty;

        // ── Navigation Properties ──────────────────────────────────────────

        [ForeignKey("UserId")]
        public User User { get; set; } = null!;

        // A Teacher records many attendance entries and marks
        public ICollection<Attendance>     Attendances     { get; set; } = new List<Attendance>();
        public ICollection<Mark>           Marks           { get; set; } = new List<Mark>();
        public ICollection<BehaviorRemark> BehaviorRemarks { get; set; } = new List<BehaviorRemark>();
    }
}
