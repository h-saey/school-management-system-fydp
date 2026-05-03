//using Microsoft.EntityFrameworkCore;
//using SMS_Backend.Models;

//namespace SMS_Backend.Data
//{
//    public class ApplicationDbContext : DbContext
//    {
//        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
//            : base(options)
//        {
//        }

//        // USERS & ROLES
//        public DbSet<User> Users { get; set; }
//        public DbSet<Student> Students { get; set; }
//        public DbSet<Teacher> Teachers { get; set; }
//        public DbSet<Parent> Parents { get; set; }
//        public DbSet<Admin> Admins { get; set; }

//        // ACADEMICS
//        public DbSet<Attendance> Attendances { get; set; }
//        public DbSet<Mark> Marks { get; set; }
//        public DbSet<Achievement> Achievements { get; set; }
//        public DbSet<BehaviorRemark> BehaviorRemarks { get; set; }
//        public DbSet<StudentPortfolio> StudentPortfolios { get; set; }

//        // COMMUNICATION
//        public DbSet<Message> Messages { get; set; }
//        public DbSet<Notification> Notifications { get; set; }
//        public DbSet<Notice> Notices { get; set; }


//        // SYSTEM
//        public DbSet<Complaint> Complaints { get; set; }
//        public DbSet<Fee> Fees { get; set; }
//        public DbSet<RiskMonitoring> RiskMonitorings { get; set; }
//        public DbSet<AuditLog> AuditLogs { get; set; }
//        public DbSet<Report> Reports { get; set; }

//        protected override void OnModelCreating(ModelBuilder modelBuilder)
//        {
//            base.OnModelCreating(modelBuilder);

//            // =============================
//            // USER ↔ PARENT (NO CASCADE)
//            // =============================
//            modelBuilder.Entity<Parent>()
//     .HasOne(p => p.User)
//     .WithOne(u => u.Parent)
//     .HasForeignKey<Parent>(p => p.UserId)
//     .OnDelete(DeleteBehavior.NoAction);

//            modelBuilder.Entity<Parent>()
//                .HasOne(p => p.Student)
//                .WithMany(s => s.Parents)
//                .HasForeignKey(p => p.StudentId)
//                .OnDelete(DeleteBehavior.NoAction);

//            // =============================
//            // COMPLAINT RELATIONS
//            // =============================
//            modelBuilder.Entity<Complaint>()
//                .HasOne(c => c.SubmittedBy)
//                .WithMany(u => u.SubmittedComplaints)
//                .HasForeignKey(c => c.SubmittedByUserId)
//                .OnDelete(DeleteBehavior.NoAction);

//            modelBuilder.Entity<Complaint>()
//                .HasOne(c => c.AssignedTo)
//                .WithMany(u => u.AssignedComplaints)
//                .HasForeignKey(c => c.AssignedToUserId)
//                .OnDelete(DeleteBehavior.NoAction);

//            // =============================
//            // MESSAGE RELATIONS
//            // =============================
//            modelBuilder.Entity<Message>()
//                .HasOne(m => m.Sender)
//                .WithMany(u => u.SentMessages)
//                .HasForeignKey(m => m.SenderUserId)
//                .OnDelete(DeleteBehavior.NoAction);

//            modelBuilder.Entity<Message>()
//                .HasOne(m => m.Receiver)
//                .WithMany(u => u.ReceivedMessages)
//                .HasForeignKey(m => m.ReceiverUserId)
//                .OnDelete(DeleteBehavior.NoAction);

//            // =============================
//            // OPTIONAL SAFETY FIX (IMPORTANT)
//            // Prevent cascade loops globally
//            // =============================
//            foreach (var relationship in modelBuilder.Model.GetEntityTypes()
//                         .SelectMany(e => e.GetForeignKeys()))
//            {
//                relationship.DeleteBehavior = DeleteBehavior.NoAction;
//            }
//        }


//    }
//}
using Microsoft.EntityFrameworkCore;
using SMS_Backend.Models;

namespace SMS_Backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

        // ── DbSets ───────────────────────────────────────────
        public DbSet<User> Users { get; set; }
        public DbSet<Student> Students { get; set; }
        public DbSet<Teacher> Teachers { get; set; }
        public DbSet<Parent> Parents { get; set; }
        public DbSet<Admin> Admins { get; set; }
        public DbSet<Attendance> Attendances { get; set; }
        public DbSet<Mark> Marks { get; set; }
        public DbSet<Achievement> Achievements { get; set; }
        public DbSet<BehaviorRemark> BehaviorRemarks { get; set; }
        public DbSet<Fee> Fees { get; set; }
        public DbSet<Complaint> Complaints { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<Notice> Notices { get; set; }  // ← NEW
        public DbSet<StudentPortfolio> StudentPortfolios { get; set; }
        public DbSet<RiskMonitoring> RiskMonitorings { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<Report> Reports { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ── User → Student / Teacher / Parent / Admin ────
            // One-to-one: restrict delete so profile must be deleted first (FR-2)
            modelBuilder.Entity<Student>()
                .HasOne(s => s.User)
                .WithOne(u => u.Student)
                .HasForeignKey<Student>(s => s.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Teacher>()
                .HasOne(t => t.User)
                .WithOne(u => u.Teacher)
                .HasForeignKey<Teacher>(t => t.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Parent>()
                .HasOne(p => p.User)
                .WithOne(u => u.Parent)
                .HasForeignKey<Parent>(p => p.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Admin>()
                .HasOne(a => a.User)
                .WithOne(u => u.Admin)
                .HasForeignKey<Admin>(a => a.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // ── Complaint: two FKs to User ───────────────────
            // Must restrict both to avoid multiple cascade paths
            modelBuilder.Entity<Complaint>()
                .HasOne(c => c.SubmittedBy)
                .WithMany(u => u.SubmittedComplaints)
                .HasForeignKey(c => c.SubmittedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Complaint>()
                .HasOne(c => c.AssignedTo)
                .WithMany(u => u.AssignedComplaints)
                .HasForeignKey(c => c.AssignedToUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // ── Message: two FKs to User ─────────────────────
            modelBuilder.Entity<Message>()
                .HasOne(m => m.Sender)
                .WithMany(u => u.SentMessages)
                .HasForeignKey(m => m.SenderUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Message>()
                .HasOne(m => m.Receiver)
                .WithMany(u => u.ReceivedMessages)
                .HasForeignKey(m => m.ReceiverUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // ── Notice → User (posted by) ────────────────────
            modelBuilder.Entity<Notice>()
                .HasOne(n => n.PostedBy)
                .WithMany()
                .HasForeignKey(n => n.PostedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // ── Attendance → Student / Teacher ───────────────
            modelBuilder.Entity<Attendance>()
                .HasOne(a => a.Student)
                .WithMany(s => s.Attendances)
                .HasForeignKey(a => a.StudentId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Attendance>()
                .HasOne(a => a.Teacher)
                .WithMany(t => t.Attendances)
                .HasForeignKey(a => a.TeacherId)
                .OnDelete(DeleteBehavior.Restrict);

            // ── Marks → Student / Teacher ────────────────────
            modelBuilder.Entity<Mark>()
                .HasOne(m => m.Student)
                .WithMany(s => s.Marks)
                .HasForeignKey(m => m.StudentId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Mark>()
                .HasOne(m => m.Teacher)
                .WithMany(t => t.Marks)
                .HasForeignKey(m => m.TeacherId)
                .OnDelete(DeleteBehavior.Restrict);

            // ── BehaviorRemark → Student / Teacher ───────────
            modelBuilder.Entity<BehaviorRemark>()
                .HasOne(b => b.Student)
                .WithMany(s => s.BehaviorRemarks)
                .HasForeignKey(b => b.StudentId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<BehaviorRemark>()
                .HasOne(b => b.Teacher)
                .WithMany(t => t.BehaviorRemarks)
                .HasForeignKey(b => b.TeacherId)
                .OnDelete(DeleteBehavior.Restrict);

            // ── Report → Admin ───────────────────────────────
            modelBuilder.Entity<Report>()
                .HasOne(r => r.Admin)
                .WithMany(a => a.Reports)
                .HasForeignKey(r => r.AdminId)
                .OnDelete(DeleteBehavior.Restrict);

            // ── Unique index: one student profile per user ───
            modelBuilder.Entity<Student>()
                .HasIndex(s => s.UserId)
                .IsUnique();

            modelBuilder.Entity<Teacher>()
                .HasIndex(t => t.UserId)
                .IsUnique();

            modelBuilder.Entity<Admin>()
                .HasIndex(a => a.UserId)
                .IsUnique();

            // ── Unique index: roll number ────────────────────
            modelBuilder.Entity<Student>()
                .HasIndex(s => s.RollNumber)
                .IsUnique();

            // ── Unique index: user email ─────────────────────
            //modelBuilder.Entity<User>()
            //    .HasIndex(u => u.Email)
            //    .IsUnique();

            //modelBuilder.Entity<User>()
            //    .HasIndex(u => u.Username)
            //    .IsUnique();

            // ── Decimal precision ────────────────────────────
            modelBuilder.Entity<Mark>()
                .Property(m => m.MarksObtained)
                .HasColumnType("decimal(5,2)");

            modelBuilder.Entity<Mark>()
                .Property(m => m.TotalMarks)
                .HasColumnType("decimal(5,2)");

            modelBuilder.Entity<Fee>()
                .Property(f => f.TotalAmount)
                .HasColumnType("decimal(10,2)");

            modelBuilder.Entity<Fee>()
                .Property(f => f.PaidAmount)
                .HasColumnType("decimal(10,2)");
        }
    }
}