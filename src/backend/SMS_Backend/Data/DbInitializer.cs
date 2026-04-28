using System;
using System.Linq;
using SMS_Backend.Models;

namespace SMS_Backend.Data
{
    public static class DbInitializer
    {
        public static void Seed(ApplicationDbContext context)
        {
            // If data already exists → stop
            if (context.Users.Any())
                return;

            // -------------------------
            // USERS
            // -------------------------

            var adminUser = new User
            {
                Username = "admin1",
                Email = "admin@gmail.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                Role = UserRole.Admin,
                IsActive = true,
                CreatedAt = DateTime.Now
            };

            var teacherUser1 = new User
            {
                Username = "teacher1",
                Email = "teacher1@gmail.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("teacher123"),
                Role = UserRole.Teacher,
                IsActive = true,
                CreatedAt = DateTime.Now
            };

            var teacherUser2 = new User
            {
                Username = "teacher2",
                Email = "teacher2@gmail.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("teacher123"),
                Role = UserRole.Teacher,
                IsActive = true,
                CreatedAt = DateTime.Now
            };

            var studentUser1 = new User
            {
                Username = "student1",
                Email = "student1@gmail.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("student123"),
                Role = UserRole.Student,
                IsActive = true,
                CreatedAt = DateTime.Now
            };

            var studentUser2 = new User
            {
                Username = "student2",
                Email = "student2@gmail.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("student123"),
                Role = UserRole.Student,
                IsActive = true,
                CreatedAt = DateTime.Now
            };

            var parentUser = new User
            {
                Username = "parent1",
                Email = "parent@gmail.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("parent123"),
                Role = UserRole.Parent,
                IsActive = true,
                CreatedAt = DateTime.Now
            };

            context.Users.AddRange(
                adminUser,
                teacherUser1,
                teacherUser2,
                studentUser1,
                studentUser2,
                parentUser
            );

            context.SaveChanges();

            // -------------------------
            // ADMIN
            // -------------------------

            var admin = new Admin
            {
                UserId = adminUser.UserId,
                FirstName = "System",
                LastName = "Admin"
            };

            context.Admins.Add(admin);

            // -------------------------
            // STUDENTS
            // -------------------------

            var student1 = new Student
            {
                UserId = studentUser1.UserId,
                FirstName = "Ali",
                LastName = "Khan",
                Class = "10",
                Section = "A",
                RollNumber = "101"
            };

            var student2 = new Student
            {
                UserId = studentUser2.UserId,
                FirstName = "Sara",
                LastName = "Ahmed",
                Class = "9",
                Section = "B",
                RollNumber = "202"
            };

            context.Students.AddRange(student1, student2);

            context.SaveChanges();

            // -------------------------
            // TEACHERS
            // -------------------------

            var teacher1 = new Teacher
            {
                UserId = teacherUser1.UserId,
                FirstName = "Mr",
                LastName = "Bilal",
                AssignedSubjects = "Math"
            };

            var teacher2 = new Teacher
            {
                UserId = teacherUser2.UserId,
                FirstName = "Ms",
                LastName = "Ayesha",
                AssignedSubjects = "Science"
            };

            context.Teachers.AddRange(teacher1, teacher2);

            // -------------------------
            // PARENT
            // -------------------------

            var parent = new Parent
            {
                UserId = parentUser.UserId,
                StudentId = student1.StudentId,
                Relation = "Father"
            };

            context.Parents.Add(parent);

            context.SaveChanges();

            // -------------------------
            // FEES
            // -------------------------

            var fee = new Fee
            {
                StudentId = student1.StudentId,
                Term = "Spring 2026",
                TotalAmount = 15000,
                PaidAmount = 10000,
                DueDate = DateTime.Now.AddDays(15),
                Status = FeeStatus.Unpaid

            };

            context.Fees.Add(fee);

            // -------------------------
            // COMPLAINT
            // -------------------------

            var complaint = new Complaint
            {
                SubmittedByUserId = studentUser1.UserId,
                AssignedToUserId = teacherUser1.UserId,
                Category = "Academic",
                Description = "Issue with homework grading",
                Status = ComplaintStatus.Submitted,
                DateSubmitted = DateTime.Now
            };

            context.Complaints.Add(complaint);

            // -------------------------
            // NOTIFICATION
            // -------------------------

            var notification = new Notification
            {
                UserId = studentUser1.UserId,
                Type = "General",
                Content = "Welcome to the system!",
                DateSent = DateTime.Now,
                Status = NotificationStatus.Unread
            };

            var notice1 = new Notice
            {
                Title = "Final Exam Schedule Released",
                Content = "Final exams will start from Monday.",
                Type = NoticeType.Exam,
                Priority = NoticePriority.High,
                Audience = NoticeAudience.SchoolWide,
                PostedAt = DateTime.Now,
                IsActive = true,
                PostedByUserId = adminUser.UserId
            };

            var notice2 = new Notice
            {
                Title = "Winter Vacation Notice",
                Content = "School will remain closed from Dec 20.",
                Type = NoticeType.Holiday,
                Priority = NoticePriority.Medium,
                Audience = NoticeAudience.SchoolWide,
                PostedAt = DateTime.Now,
                IsActive = true,
                PostedByUserId = adminUser.UserId
            };

            context.Notices.AddRange(notice1, notice2);


            context.Notifications.Add(notification);

            context.SaveChanges();
        }
    }
}
