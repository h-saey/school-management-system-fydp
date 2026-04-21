using System.ComponentModel.DataAnnotations;

namespace SMS_Backend.Models
{
    public class User
    {
        [Key]
        public int userId { get; set; }

        [Required]
        public string username { get; set; }

        [Required]
        public string email { get; set; }

        [Required]
        public string password { get; set; }

        [Required]
        public string role { get; set; }

        public bool isActive { get; set; }
    }
}
