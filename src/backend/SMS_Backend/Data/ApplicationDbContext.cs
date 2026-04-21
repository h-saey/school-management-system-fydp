using Microsoft.EntityFrameworkCore;
using SMS_Backend.Models;

namespace SMS_Backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // Tables (DbSets)
        public DbSet<User> Users { get; set; }
    }
}
