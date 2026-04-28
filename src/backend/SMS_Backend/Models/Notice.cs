using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SMS_Backend.Models
{
    public enum NoticeAudience
    {
        SchoolWide,
        StudentsOnly,
        ParentsOnly,
        TeachersOnly,
        ClassSpecific
    }

    // NEW
    public enum NoticeType
    {
        Exam,
        Holiday,
        Event,
        Fee,
        Academic
    }

    // NEW
    public enum NoticePriority
    {
        High,
        Medium,
        Low
    }

    public class Notice
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int NoticeId { get; set; }

        [Required]
        public int PostedByUserId { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty;

        [Required]
        public NoticeAudience Audience { get; set; } =
            NoticeAudience.SchoolWide;

        // NEW
        [Required]
        public NoticeType Type { get; set; }

        // NEW
        [Required]
        public NoticePriority Priority { get; set; }

        // Optional
        [MaxLength(50)]
        public string? TargetClass { get; set; }

        public DateTime PostedAt { get; set; } =
            DateTime.UtcNow;

        public bool IsActive { get; set; } = true;

        [ForeignKey("PostedByUserId")]
        public User PostedBy { get; set; } = null!;
    }
}
