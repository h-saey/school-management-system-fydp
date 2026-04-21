using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SMS_Backend.Models
{
    public class Student
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int StudentId { get; set; }

        // ── Foreign Key to User ────────────────────────────────────────────
        [Required]
        public int UserId { get; set; }

        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Class { get; set; } = string.Empty;

        [Required]
        [MaxLength(10)]
        public string Section { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string RollNumber { get; set; } = string.Empty;

        // ── Navigation Properties ──────────────────────────────────────────

        // Parent (User) profile
        [ForeignKey("UserId")]
        public User User { get; set; } = null!;

        // One Student → many of these
        public ICollection<Parent>          Parents          { get; set; } = new List<Parent>();
        public ICollection<Attendance>      Attendances      { get; set; } = new List<Attendance>();
        public ICollection<Mark>            Marks            { get; set; } = new List<Mark>();
        public ICollection<Achievement>     Achievements     { get; set; } = new List<Achievement>();
        public ICollection<BehaviorRemark>  BehaviorRemarks  { get; set; } = new List<BehaviorRemark>();
        public ICollection<Fee>             Fees             { get; set; } = new List<Fee>();
        public ICollection<RiskMonitoring>  RiskMonitorings  { get; set; } = new List<RiskMonitoring>();

        // One Student → one Portfolio
        public StudentPortfolio? Portfolio { get; set; }
    }
}
