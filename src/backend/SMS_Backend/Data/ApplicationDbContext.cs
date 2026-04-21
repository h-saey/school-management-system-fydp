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

        // USERS & ROLES
        public DbSet<User> Users { get; set; }
        public DbSet<Student> Students { get; set; }
        public DbSet<Teacher> Teachers { get; set; }
        public DbSet<Parent> Parents { get; set; }
        public DbSet<Admin> Admins { get; set; }

        // ACADEMICS
        public DbSet<Attendance> Attendances { get; set; }
        public DbSet<Mark> Marks { get; set; }
        public DbSet<Achievement> Achievements { get; set; }
        public DbSet<BehaviorRemark> BehaviorRemarks { get; set; }
        public DbSet<StudentPortfolio> StudentPortfolios { get; set; }

        // COMMUNICATION
        public DbSet<Message> Messages { get; set; }
        public DbSet<Notification> Notifications { get; set; }

        // SYSTEM
        public DbSet<Complaint> Complaints { get; set; }
        public DbSet<Fee> Fees { get; set; }
        public DbSet<RiskMonitoring> RiskMonitorings { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<Report> Reports { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // =============================
            // USER ↔ PARENT (NO CASCADE)
            // =============================
            modelBuilder.Entity<Parent>()
     .HasOne(p => p.User)
     .WithOne(u => u.Parent)
     .HasForeignKey<Parent>(p => p.UserId)
     .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Parent>()
                .HasOne(p => p.Student)
                .WithMany(s => s.Parents)
                .HasForeignKey(p => p.StudentId)
                .OnDelete(DeleteBehavior.NoAction);

            // =============================
            // COMPLAINT RELATIONS
            // =============================
            modelBuilder.Entity<Complaint>()
                .HasOne(c => c.SubmittedBy)
                .WithMany(u => u.SubmittedComplaints)
                .HasForeignKey(c => c.SubmittedByUserId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Complaint>()
                .HasOne(c => c.AssignedTo)
                .WithMany(u => u.AssignedComplaints)
                .HasForeignKey(c => c.AssignedToUserId)
                .OnDelete(DeleteBehavior.NoAction);

            // =============================
            // MESSAGE RELATIONS
            // =============================
            modelBuilder.Entity<Message>()
                .HasOne(m => m.Sender)
                .WithMany(u => u.SentMessages)
                .HasForeignKey(m => m.SenderUserId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Message>()
                .HasOne(m => m.Receiver)
                .WithMany(u => u.ReceivedMessages)
                .HasForeignKey(m => m.ReceiverUserId)
                .OnDelete(DeleteBehavior.NoAction);

            // =============================
            // OPTIONAL SAFETY FIX (IMPORTANT)
            // Prevent cascade loops globally
            // =============================
            foreach (var relationship in modelBuilder.Model.GetEntityTypes()
                         .SelectMany(e => e.GetForeignKeys()))
            {
                relationship.DeleteBehavior = DeleteBehavior.NoAction;
            }
        }


    }
}
