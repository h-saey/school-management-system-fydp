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
        public NoticeAudience Audience { get; set; } = NoticeAudience.SchoolWide;

        // Optional: if Audience = ClassSpecific
        [MaxLength(50)]
        public string? TargetClass { get; set; }

        public DateTime PostedAt { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;

        // Navigation
        [ForeignKey("PostedByUserId")]
        public User PostedBy { get; set; } = null!;
    }
}
