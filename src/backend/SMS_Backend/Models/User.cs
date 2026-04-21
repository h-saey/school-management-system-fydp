using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SMS_Backend.Models
{
    public enum UserRole
    {
        Admin,
        Teacher,
        Student,
        Parent
    }

    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int UserId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        public UserRole Role { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // ── Navigation Properties ──────────────────────────────────────────

        // One User can have one role-specific profile
        public Student?   Student   { get; set; }
        public Teacher?   Teacher   { get; set; }
        public Parent?    Parent    { get; set; }
        public Admin?     Admin     { get; set; }

        // One User can have many of these
        public ICollection<Notification>  Notifications            { get; set; } = new List<Notification>();
        public ICollection<Message>       SentMessages             { get; set; } = new List<Message>();
        public ICollection<Message>       ReceivedMessages         { get; set; } = new List<Message>();
        public ICollection<Complaint>     SubmittedComplaints      { get; set; } = new List<Complaint>();
        public ICollection<Complaint>     AssignedComplaints       { get; set; } = new List<Complaint>();
        public ICollection<AuditLog>      AuditLogs                { get; set; } = new List<AuditLog>();
    }
}
