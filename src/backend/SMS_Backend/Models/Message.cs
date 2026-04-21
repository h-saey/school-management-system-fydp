using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SMS_Backend.Models
{
    public class Message
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int MessageId { get; set; }

        // ── Foreign Keys ───────────────────────────────────────────────────
        [Required]
        public int SenderUserId { get; set; }

        [Required]
        public int ReceiverUserId { get; set; }

        [Required]
        public string Content { get; set; } = string.Empty;

        public DateTime SentAt { get; set; } = DateTime.UtcNow;

        public bool IsRead { get; set; } = false;

        // ── Navigation Properties ──────────────────────────────────────────

        [ForeignKey("SenderUserId")]
        public User Sender { get; set; } = null!;

        [ForeignKey("ReceiverUserId")]
        public User Receiver { get; set; } = null!;
    }
}
