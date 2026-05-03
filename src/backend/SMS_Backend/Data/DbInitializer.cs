using SMS_Backend.Models;

namespace SMS_Backend.Data
{
    public static class DbInitializer
    {
        public static void Seed(ApplicationDbContext context)
        {
            // Guard — never seed twice
            if (context.Users.Any()) return;

            // ══════════════════════════════════════════════════
            // 1. USERS
            // ══════════════════════════════════════════════════

            var now = DateTime.UtcNow;

            // ── Admin ──────────────────────────────────────────
            var adminUser = new User
            {
                Username = "admin1",
                Email = "admin@school.edu.pk",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                Role = UserRole.Admin,
                IsActive = true,
                CreatedAt = now.AddMonths(-12)
            };

            // ── Teachers (8) ───────────────────────────────────
            var teacherData = new[]
            {
                ("Mr.",  "Bilal",    "Hussain",   "Math, Statistics",          "bilal.hussain"),
                ("Ms.",  "Ayesha",   "Siddiqui",  "Physics, Chemistry",        "ayesha.siddiqui"),
                ("Mr.",  "Zubair",   "Ahmed",     "English, Urdu",             "zubair.ahmed"),
                ("Ms.",  "Nadia",    "Khan",      "Biology, General Science",  "nadia.khan"),
                ("Mr.",  "Tariq",    "Mahmood",   "Computer Science, IT",      "tariq.mahmood"),
                ("Ms.",  "Sana",     "Fatima",    "Islamic Studies, Pakistan Studies", "sana.fatima"),
                ("Mr.",  "Imran",    "Qureshi",   "History, Geography",        "imran.qureshi"),
                ("Ms.",  "Rabia",    "Malik",     "Art, Physical Education",   "rabia.malik"),
            };

            var teacherUsers = teacherData.Select((t, i) => new User
            {
                Username = t.Item5,
                Email = $"{t.Item5}@school.edu.pk",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("teacher123"),
                Role = UserRole.Teacher,
                IsActive = true,
                CreatedAt = now.AddMonths(-10 + i)
            }).ToList();

            // ── Students (25) ──────────────────────────────────
            var studentData = new[]
            {
                // (FirstName, LastName, Class, Section, Roll, username)
                ("Ali",      "Hassan",    "9",  "A", "2024-001", "ali.hassan"),
                ("Sara",     "Ahmed",     "9",  "A", "2024-002", "sara.ahmed"),
                ("Usman",    "Khan",      "9",  "A", "2024-003", "usman.khan"),
                ("Fatima",   "Malik",     "9",  "A", "2024-004", "fatima.malik"),
                ("Hamza",    "Raza",      "9",  "B", "2024-005", "hamza.raza"),
                ("Ayesha",   "Siddiq",    "9",  "B", "2024-006", "ayesha.siddiq"),
                ("Zaid",     "Farooq",    "9",  "B", "2024-007", "zaid.farooq"),
                ("Hina",     "Baig",      "9",  "B", "2024-008", "hina.baig"),
                ("Bilal",    "Chaudhry",  "10", "A", "2024-009", "bilal.chaudhry"),
                ("Maryam",   "Iqbal",     "10", "A", "2024-010", "maryam.iqbal"),
                ("Asad",     "Mirza",     "10", "A", "2024-011", "asad.mirza"),
                ("Zara",     "Nawaz",     "10", "A", "2024-012", "zara.nawaz"),
                ("Faisal",   "Javed",     "10", "B", "2024-013", "faisal.javed"),
                ("Amna",     "Shaikh",    "10", "B", "2024-014", "amna.shaikh"),
                ("Tariq",    "Butt",      "10", "B", "2024-015", "tariq.butt"),
                ("Sobia",    "Rehman",    "10", "B", "2024-016", "sobia.rehman"),
                ("Kamran",   "Ansari",    "8",  "A", "2024-017", "kamran.ansari"),
                ("Nimra",    "Aslam",     "8",  "A", "2024-018", "nimra.aslam"),
                ("Shahzaib", "Gul",       "8",  "A", "2024-019", "shahzaib.gul"),
                ("Mahnoor",  "Waqar",     "8",  "B", "2024-020", "mahnoor.waqar"),
                ("Junaid",   "Abbasi",    "8",  "B", "2024-021", "junaid.abbasi"),
                ("Kiran",    "Zaheer",    "8",  "B", "2024-022", "kiran.zaheer"),
                ("Omer",     "Latif",     "7",  "A", "2024-023", "omer.latif"),
                ("Aliya",    "Pervez",    "7",  "A", "2024-024", "aliya.pervez"),
                ("Hassan",   "Gillani",   "7",  "B", "2024-025", "hassan.gillani"),
            };

            var studentUsers = studentData.Select((s, i) => new User
            {
                Username = s.Item6,
                Email = $"{s.Item6}@student.school.edu.pk",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("student123"),
                Role = UserRole.Student,
                IsActive = true,
                CreatedAt = now.AddMonths(-6).AddDays(i)
            }).ToList();

            // ── Parents (12) ───────────────────────────────────
            var parentUserData = new[]
            {
                ("Muhammad", "Hassan",   "m.hassan",   "parent1@mail.com"),
                ("Zainab",   "Ahmed",    "zainab.a",   "parent2@mail.com"),
                ("Khalid",   "Khan",     "khalid.k",   "parent3@mail.com"),
                ("Samina",   "Malik",    "samina.m",   "parent4@mail.com"),
                ("Tariq",    "Raza",     "tariq.r",    "parent5@mail.com"),
                ("Nusrat",   "Siddiq",   "nusrat.s",   "parent6@mail.com"),
                ("Farhan",   "Farooq",   "farhan.f",   "parent7@mail.com"),
                ("Robina",   "Baig",     "robina.b",   "parent8@mail.com"),
                ("Shahid",   "Chaudhry", "shahid.c",   "parent9@mail.com"),
                ("Bushra",   "Iqbal",    "bushra.i",   "parent10@mail.com"),
                ("Naveed",   "Mirza",    "naveed.m",   "parent11@mail.com"),
                ("Tahira",   "Nawaz",    "tahira.n",   "parent12@mail.com"),
            };

            var parentUsers = parentUserData.Select((p, i) => new User
            {
                Username = p.Item3,
                Email = p.Item4,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("parent123"),
                Role = UserRole.Parent,
                IsActive = true,
                CreatedAt = now.AddMonths(-5).AddDays(i * 3)
            }).ToList();

            // Save all users
            context.Users.Add(adminUser);
            context.Users.AddRange(teacherUsers);
            context.Users.AddRange(studentUsers);
            context.Users.AddRange(parentUsers);
            context.SaveChanges();

            // ══════════════════════════════════════════════════
            // 2. ADMIN PROFILE
            // ══════════════════════════════════════════════════

            var admin = new Admin
            {
                UserId = adminUser.UserId,
                FirstName = "System",
                LastName = "Admin"
            };
            context.Admins.Add(admin);
            context.SaveChanges();

            // ══════════════════════════════════════════════════
            // 3. TEACHER PROFILES
            // ══════════════════════════════════════════════════

            var teachers = teacherData.Select((t, i) => new Teacher
            {
                UserId = teacherUsers[i].UserId,
                FirstName = t.Item1 + " " + t.Item2,   // "Mr. Bilal"
                LastName = t.Item3,
                AssignedSubjects = t.Item4
            }).ToList();

            context.Teachers.AddRange(teachers);
            context.SaveChanges();

            // ══════════════════════════════════════════════════
            // 4. STUDENT PROFILES
            // ══════════════════════════════════════════════════

            var students = studentData.Select((s, i) => new Student
            {
                UserId = studentUsers[i].UserId,
                FirstName = s.Item1,
                LastName = s.Item2,
                Class = s.Item3,
                Section = s.Item4,
                RollNumber = s.Item5
            }).ToList();

            context.Students.AddRange(students);
            context.SaveChanges();

            // ══════════════════════════════════════════════════
            // 5. PARENT PROFILES — link to first 12 students
            // ══════════════════════════════════════════════════

            var relations = new[] { "Father", "Mother", "Father", "Mother", "Father", "Guardian", "Father", "Mother", "Father", "Mother", "Father", "Mother" };

            var parents = parentUserData.Select((p, i) => new Parent
            {
                UserId = parentUsers[i].UserId,
                StudentId = students[i].StudentId,
                Relation = relations[i]
            }).ToList();

            context.Parents.AddRange(parents);
            context.SaveChanges();

            // ══════════════════════════════════════════════════
            // 6. ATTENDANCE — 30 days, realistic rates per student
            // ══════════════════════════════════════════════════

            // Attendance % per student (matches risk levels for AI demo)
            var attendanceRates = new double[]
            {
                45, 92, 88, 52, 74, 96, 85, 60,   // students 0-7
                91, 78, 47, 95, 68, 87, 55, 93,   // students 8-15
                82, 70, 97, 64, 89, 76, 93, 85, 72 // students 16-24
            };

            var mathTeacher = teachers[0];  // Bilal — Math
            var physicsTeacher = teachers[1];  // Ayesha — Physics
            var engTeacher = teachers[2];  // Zubair — English
            var rng = new Random(42);

            for (int si = 0; si < students.Count; si++)
            {
                double rate = attendanceRates[si];
                var student = students[si];
                var teacher = teachers[si % teachers.Count];  // rotate teachers

                for (int day = 29; day >= 0; day--)
                {
                    var date = now.AddDays(-day).Date;
                    bool weeknd = date.DayOfWeek == DayOfWeek.Saturday ||
                                  date.DayOfWeek == DayOfWeek.Sunday;
                    if (weeknd) continue;

                    bool present = rng.NextDouble() * 100 < rate;
                    bool late = !present && rng.NextDouble() < 0.25; // 25% of absences are late

                    context.Attendances.Add(new Attendance
                    {
                        StudentId = student.StudentId,
                        TeacherId = teacher.TeacherId,
                        Date = date,
                        Status = present ? AttendanceStatus.Present
                                  : late ? AttendanceStatus.Late
                                            : AttendanceStatus.Absent,
                        IsLocked = day > 7   // lock records older than 7 days
                    });
                }
            }

            context.SaveChanges();

            // ══════════════════════════════════════════════════
            // 7. MARKS — 3 subjects × 3 exams per student
            // ══════════════════════════════════════════════════

            // Average marks % per student (reflects risk levels)
            var marksRates = new double[]
            {
                38, 85, 79, 42, 56, 91, 74, 48,   // students 0-7
                83, 67, 36, 90, 53, 80, 44, 88,   // students 8-15
                72, 61, 94, 50, 77, 65, 89, 71, 58 // students 16-24
            };

            var subjects = new[] { "Math", "Physics", "English" };
            var exams = new[] { "Quiz 1", "Midterm", "Final" };
            var totals = new decimal[] { 25, 50, 100 };

            for (int si = 0; si < students.Count; si++)
            {
                double baseRate = marksRates[si];
                var student = students[si];

                for (int subIdx = 0; subIdx < subjects.Length; subIdx++)
                {
                    var teacher = teachers[subIdx]; // Math → teacher[0], Physics → [1], English → [2]

                    for (int exIdx = 0; exIdx < exams.Length; exIdx++)
                    {
                        decimal total = totals[exIdx];
                        double variance = (rng.NextDouble() * 12) - 6;  // ±6%
                        double pct = Math.Clamp(baseRate + variance, 0, 100);
                        decimal obtained = Math.Round((decimal)(pct / 100) * total, 1);

                        context.Marks.Add(new Mark
                        {
                            StudentId = student.StudentId,
                            TeacherId = teacher.TeacherId,
                            Subject = subjects[subIdx],
                            Exam = exams[exIdx],
                            TotalMarks = total,
                            MarksObtained = obtained
                        });
                    }
                }
            }

            context.SaveChanges();

            // ══════════════════════════════════════════════════
            // 8. BEHAVIOR REMARKS
            // ══════════════════════════════════════════════════

            // negativeRemarks, positiveRemarks per student
            var behaviorData = new (int neg, int pos)[]
            {
                (5,0),(0,3),(0,2),(4,0),(2,1),(0,4),(0,2),(3,0),
                (0,3),(1,1),(6,0),(0,4),(2,0),(0,3),(4,0),(0,3),
                (0,2),(1,1),(0,3),(3,0),(0,2),(1,1),(0,3),(0,2),(2,1)
            };

            var negRemarks = new[]
            {
                "Frequently absent without valid reason.",
                "Disruptive behavior during class.",
                "Homework not submitted repeatedly.",
                "Inattentive and disturbing other students.",
                "Mobile phone usage during class hours.",
                "Rude behavior towards teacher.",
            };

            var posRemarks = new[]
            {
                "Excellent class participation and attentiveness.",
                "Consistently submits quality homework on time.",
                "Helps peers and shows great teamwork.",
                "Outstanding performance in class activities.",
                "Very respectful and punctual student.",
            };

            for (int si = 0; si < students.Count; si++)
            {
                var student = students[si];
                var teacher = teachers[si % teachers.Count];
                var (neg, pos) = behaviorData[si];

                for (int n = 0; n < neg; n++)
                {
                    context.BehaviorRemarks.Add(new BehaviorRemark
                    {
                        StudentId = student.StudentId,
                        TeacherId = teacher.TeacherId,
                        RemarkType = "Negative",
                        RemarkText = negRemarks[n % negRemarks.Length],
                        Date = now.AddDays(-rng.Next(1, 25))
                    });
                }

                for (int p = 0; p < pos; p++)
                {
                    context.BehaviorRemarks.Add(new BehaviorRemark
                    {
                        StudentId = student.StudentId,
                        TeacherId = teacher.TeacherId,
                        RemarkType = "Positive",
                        RemarkText = posRemarks[p % posRemarks.Length],
                        Date = now.AddDays(-rng.Next(1, 20))
                    });
                }
            }

            context.SaveChanges();

            // ══════════════════════════════════════════════════
            // 9. FEES — one fee record per student, varied status
            // ══════════════════════════════════════════════════

            var feeStatuses = new FeeStatus[]
            {
                FeeStatus.Paid, FeeStatus.Unpaid, FeeStatus.Paid,    FeeStatus.Overdue, FeeStatus.Partial,
                FeeStatus.Paid, FeeStatus.Paid,   FeeStatus.Overdue, FeeStatus.Paid,    FeeStatus.Unpaid,
                FeeStatus.Paid, FeeStatus.Partial, FeeStatus.Paid,   FeeStatus.Paid,    FeeStatus.Overdue,
                FeeStatus.Paid, FeeStatus.Paid,   FeeStatus.Unpaid,  FeeStatus.Paid,    FeeStatus.Partial,
                FeeStatus.Paid, FeeStatus.Paid,   FeeStatus.Paid,    FeeStatus.Overdue, FeeStatus.Paid,
            };

            for (int si = 0; si < students.Count; si++)
            {
                var status = feeStatuses[si];
                decimal total = 15000;
                decimal paid = status == FeeStatus.Paid ? total
                                 : status == FeeStatus.Partial ? 8000
                                 : status == FeeStatus.Overdue ? 0
                                 : 0;

                context.Fees.Add(new Fee
                {
                    StudentId = students[si].StudentId,
                    Term = "Spring 2025",
                    TotalAmount = total,
                    PaidAmount = paid,
                    DueDate = status == FeeStatus.Overdue
                                    ? now.AddDays(-30)
                                    : now.AddDays(15),
                    Status = status
                });
            }

            context.SaveChanges();

            // ══════════════════════════════════════════════════
            // 10. ACHIEVEMENTS
            // ══════════════════════════════════════════════════

            var achievementData = new[]
            {
                (0,  "First Position — Annual Exam",    "Academic",      -90),
                (2,  "Best All-Rounder Award",          "General",       -60),
                (5,  "Gold Medal — Science Competition","Academic",      -45),
                (8,  "Football Team Captain",           "Sports",        -30),
                (11, "Art Exhibition Winner",           "Arts",          -20),
                (14, "Debating Competition — 2nd Place","Extra Curricular", -15),
                (18, "100% Attendance Award",           "Academic",      -10),
                (22, "Chess Tournament Winner",         "Sports",         -5),
            };

            foreach (var (idx, title, cat, daysAgo) in achievementData)
            {
                if (idx < students.Count)
                {
                    context.Achievements.Add(new Achievement
                    {
                        StudentId = students[idx].StudentId,
                        Title = title,
                        Category = cat,
                        Date = now.AddDays(daysAgo)
                    });
                }
            }

            context.SaveChanges();

            // ══════════════════════════════════════════════════
            // 11. COMPLAINTS
            // ══════════════════════════════════════════════════

            var complaintsData = new[]
            {
                (0,  "Academic",   "Marks deducted without explanation in Math quiz.",          ComplaintStatus.Resolved,    teachers[0].TeacherId),
                (1,  "Behavior",   "Another student bullying in the classroom.",                 ComplaintStatus.UnderReview, teachers[2].TeacherId),
                (4,  "Facilities", "Classroom AC is not working for two weeks.",                 ComplaintStatus.Submitted,   (int?)null),
                (7,  "Academic",   "Physics notes not provided before the exam.",                ComplaintStatus.Submitted,   (int?)null),
                (9,  "Fee",        "Fee challan not received for Spring semester.",              ComplaintStatus.Resolved,    (int?)null),
                (12, "Timetable",  "Lab sessions clashing with Math class repeatedly.",          ComplaintStatus.UnderReview, teachers[4].TeacherId),
            };

            foreach (var (stuIdx, cat, desc, status, assignedTeacherId) in complaintsData)
            {
                int submitterId = stuIdx < 12
                    ? parentUsers[stuIdx % 12].UserId   // parent submits
                    : studentUsers[stuIdx].UserId;       // student submits

                int? assignedUserId = assignedTeacherId.HasValue
                    ? teacherUsers.FirstOrDefault(tu =>
                          teachers.Any(t => t.TeacherId == assignedTeacherId && t.UserId == tu.UserId))?.UserId
                    : null;

                context.Complaints.Add(new Complaint
                {
                    SubmittedByUserId = submitterId,
                    AssignedToUserId = assignedUserId,
                    Category = cat,
                    Description = desc,
                    Status = status,
                    DateSubmitted = now.AddDays(-rng.Next(5, 45)),
                    DateClosed = status == ComplaintStatus.Resolved ? now.AddDays(-rng.Next(1, 4)) : null,
                    Remarks = status == ComplaintStatus.Resolved ? "Issue reviewed and resolved." : null
                });
            }

            context.SaveChanges();

            // ══════════════════════════════════════════════════
            // 12. NOTICES
            // ══════════════════════════════════════════════════

            var noticesData = new[]
            {
                ("Final Exam Schedule Released",
                 "Final examinations will commence from the 3rd of next month. Students are advised to check the detailed timetable on the notice board.",
                 NoticeType.Exam,      NoticePriority.High,   NoticeAudience.SchoolWide,   null,       -3),

                ("Winter Vacation Announcement",
                 "School will remain closed from December 20th to January 5th for winter holidays. Best wishes to all students.",
                 NoticeType.Holiday,   NoticePriority.Medium, NoticeAudience.SchoolWide,   null,       -7),

                ("Fee Submission Reminder",
                 "This is a reminder that Spring 2025 semester fees are due by the 28th of this month. Late submissions will incur a fine.",
                 NoticeType.Fee,       NoticePriority.High,   NoticeAudience.ParentsOnly,  null,       -2),

                ("Annual Sports Day",
                 "The Annual Sports Day will be held on campus next Friday. All students are encouraged to participate. Parents are welcome.",
                 NoticeType.Event,     NoticePriority.Low,    NoticeAudience.SchoolWide,   null,       -5),

                ("Class 10 Extra Classes",
                 "Extra preparation classes for Class 10 students will be held every Saturday from 9 AM to 12 PM starting this week.",
                 NoticeType.Academic,  NoticePriority.Medium, NoticeAudience.ClassSpecific,"10",       -1),

                ("Parent-Teacher Meeting",
                 "A Parent-Teacher meeting is scheduled for Saturday. Parents are requested to collect progress reports and meet teachers.",
                 NoticeType.Event,     NoticePriority.High,   NoticeAudience.ParentsOnly,  null,       -10),

                ("Science Fair Registration Open",
                 "Students interested in participating in the Inter-School Science Fair should register with the Science department by Friday.",
                 NoticeType.Academic,  NoticePriority.Medium, NoticeAudience.StudentsOnly, null,       -4),

                ("Library New Arrivals",
                 "The school library has received new books in Mathematics, Physics, and Literature. Students are encouraged to make use of them.",
                 NoticeType.Academic,  NoticePriority.Low,    NoticeAudience.SchoolWide,   null,       -14),
            };

            foreach (var (title, content, type, priority, audience, targetClass, daysAgo) in noticesData)
            {
                context.Notices.Add(new Notice
                {
                    PostedByUserId = adminUser.UserId,
                    Title = title,
                    Content = content,
                    Type = type,
                    Priority = priority,
                    Audience = audience,
                    TargetClass = targetClass,
                    PostedAt = now.AddDays(daysAgo),
                    IsActive = true
                });
            }

            context.SaveChanges();

            // ══════════════════════════════════════════════════
            // 13. NOTIFICATIONS
            // ══════════════════════════════════════════════════

            // Welcome notification for every user
            var allUsers = new List<User> { adminUser };
            allUsers.AddRange(teacherUsers);
            allUsers.AddRange(studentUsers);
            allUsers.AddRange(parentUsers);

            foreach (var u in allUsers)
            {
                context.Notifications.Add(new Notification
                {
                    UserId = u.UserId,
                    Type = "General",
                    Content = $"Welcome to the School Management System, {u.Username}! Your account is active.",
                    DateSent = u.CreatedAt.AddMinutes(5),
                    Status = NotificationStatus.Read
                });
            }

            // Risk alerts for high-risk students (index 0=Ali, 3=Fatima, 10=Asad, 14=Tariq)
            var highRiskIndices = new[] { 0, 3, 10, 14 };
            foreach (var idx in highRiskIndices)
            {
                // Notify student
                context.Notifications.Add(new Notification
                {
                    UserId = studentUsers[idx].UserId,
                    Type = "RiskAlert",
                    Content = $"🔴 AI Risk Alert: Your risk level is High due to low attendance and academic performance. Please speak to your teacher immediately.",
                    DateSent = now.AddDays(-2),
                    Status = NotificationStatus.Unread
                });

                // Notify parent if linked
                if (idx < parentUsers.Count)
                {
                    context.Notifications.Add(new Notification
                    {
                        UserId = parentUsers[idx].UserId,
                        Type = "RiskAlert",
                        Content = $"🔴 Risk Alert for your child {studentData[idx].Item1} {studentData[idx].Item2}: Risk level is High. Please contact the school.",
                        DateSent = now.AddDays(-2),
                        Status = NotificationStatus.Unread
                    });
                }
            }

            // Fee overdue notifications
            var overdueIndices = new[] { 3, 7, 14, 23 };
            foreach (var idx in overdueIndices)
            {
                if (idx < studentUsers.Count)
                {
                    context.Notifications.Add(new Notification
                    {
                        UserId = studentUsers[idx].UserId,
                        Type = "Fee",
                        Content = $"⚠️ Your fee for Spring 2025 is overdue. Please submit PKR 15,000 immediately to avoid penalty.",
                        DateSent = now.AddDays(-5),
                        Status = NotificationStatus.Unread
                    });
                }
            }

            // Notice broadcast to all students
            foreach (var su in studentUsers.Take(10))
            {
                context.Notifications.Add(new Notification
                {
                    UserId = su.UserId,
                    Type = "Notice",
                    Content = "📢 Final Exam Schedule has been released. Check the noticeboard for details.",
                    DateSent = now.AddDays(-3),
                    Status = NotificationStatus.Unread
                });
            }

            context.SaveChanges();

            // ══════════════════════════════════════════════════
            // 14. STUDENT PORTFOLIOS
            // ══════════════════════════════════════════════════

            for (int si = 0; si < students.Count; si++)
            {
                double attRate = attendanceRates[si];
                double marksAvg = marksRates[si];
                var (neg, pos) = behaviorData[si];

                string riskLabel = attRate < 55 || marksAvg < 40 || neg >= 5 ? "High"
                                 : attRate < 75 || marksAvg < 55 || neg >= 3 ? "Medium"
                                 : "Low";

                context.StudentPortfolios.Add(new StudentPortfolio
                {
                    StudentId = students[si].StudentId,
                    AttendanceSummary = $"Attendance Rate: {attRate:F1}% over last 30 school days.",
                    MarksSummary = $"Overall Average: {marksAvg:F1}% across Math, Physics, English.",
                    AchievementsSummary = achievementData.Any(a => a.Item1 == si)
                        ? $"Achievement: {achievementData.First(a => a.Item1 == si).Item2}"
                        : "No formal achievements recorded yet.",
                    BehaviorSummary = $"Positive remarks: {pos} | Negative remarks: {neg}.",
                    GeneratedOn = now.AddDays(-1),
                    LastUpdated = now.AddDays(-1)
                });
            }

            context.SaveChanges();

            // ══════════════════════════════════════════════════
            // 15. RISK MONITORING
            // ══════════════════════════════════════════════════

            for (int si = 0; si < students.Count; si++)
            {
                double attRate = attendanceRates[si];
                double marksAvg = marksRates[si];
                var (neg, _) = behaviorData[si];

                var factors = new List<string>();
                if (attRate < 75) factors.Add($"Low attendance ({attRate:F1}%)");
                if (marksAvg < 55) factors.Add($"Below average marks ({marksAvg:F1}%)");
                if (neg >= 3) factors.Add($"Multiple negative remarks ({neg})");

                RiskLevel level = attRate < 55 || marksAvg < 40 || neg >= 5 ? RiskLevel.High
                                : attRate < 75 || marksAvg < 55 || neg >= 3 ? RiskLevel.Medium
                                : RiskLevel.Low;

                context.RiskMonitorings.Add(new RiskMonitoring
                {
                    StudentId = students[si].StudentId,
                    RiskLevel = level,
                    MonitoredOn = now.AddDays(-1),
                    Notes = factors.Any()
                        ? string.Join(" | ", factors)
                        : "No significant risk factors detected."
                });
            }

            context.SaveChanges();

            // ══════════════════════════════════════════════════
            // 16. AUDIT LOGS
            // ══════════════════════════════════════════════════

            var auditEntries = new[]
            {
                (adminUser.UserId,    "LOGIN",            "admin1 logged in",                    -30),
                (adminUser.UserId,    "CREATE_USER",      "Created teacher user: bilal.hussain",  -29),
                (adminUser.UserId,    "CREATE_USER",      "Created teacher user: ayesha.siddiqui",-28),
                (adminUser.UserId,    "POST_NOTICE",      "Posted: Final Exam Schedule Released",  -3),
                (adminUser.UserId,    "GENERATE_REPORT",  "Generated Attendance Report",           -5),
                (teacherUsers[0].UserId, "LOGIN",         "bilal.hussain logged in",              -2),
                (teacherUsers[0].UserId, "MARK_ATTENDANCE","Marked attendance for Class 9A",      -2),
                (teacherUsers[0].UserId, "ADD_MARKS",     "Added Math Quiz 1 marks for Class 9A", -2),
                (teacherUsers[1].UserId, "LOGIN",         "ayesha.siddiqui logged in",            -1),
                (teacherUsers[1].UserId, "MARK_ATTENDANCE","Marked attendance for Class 10A",     -1),
                (studentUsers[0].UserId, "LOGIN",         "ali.hassan logged in",                 -1),
                (studentUsers[2].UserId, "LOGIN",         "usman.khan logged in",                 -1),
                (adminUser.UserId,    "AI_TRAIN_MODEL",   "ML.NET model trained on seed data",    -1),
                (adminUser.UserId,    "LOGIN",            "admin1 logged in",                      0),
            };

            foreach (var (userId, action, details, daysAgo) in auditEntries)
            {
                context.AuditLogs.Add(new AuditLog
                {
                    UserId = userId,
                    Action = action,
                    Details = details,
                    Timestamp = now.AddDays(daysAgo).AddHours(rng.Next(8, 17))
                });
            }

            context.SaveChanges();
        }
    }
}
//using System;
//using System.Linq;
//using SMS_Backend.Models;

//namespace SMS_Backend.Data
//{
//    public static class DbInitializer
//    {
//        public static void Seed(ApplicationDbContext context)
//        {
//            // If data already exists → stop
//            if (context.Users.Any())
//                return;


//            // -------------------------
//            // USERS
//            // -------------------------

//            var adminUser = new User
//            {
//                Username = "admin1",
//                Email = "admin@gmail.com",
//                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
//                Role = UserRole.Admin,
//                IsActive = true,
//                CreatedAt = DateTime.Now
//            };

//            var teacherUser1 = new User
//            {
//                Username = "teacher1",
//                Email = "teacher1@gmail.com",
//                PasswordHash = BCrypt.Net.BCrypt.HashPassword("teacher123"),
//                Role = UserRole.Teacher,
//                IsActive = true,
//                CreatedAt = DateTime.Now
//            };

//            var teacherUser2 = new User
//            {
//                Username = "teacher2",
//                Email = "teacher2@gmail.com",
//                PasswordHash = BCrypt.Net.BCrypt.HashPassword("teacher123"),
//                Role = UserRole.Teacher,
//                IsActive = true,
//                CreatedAt = DateTime.Now
//            };

//            var studentUser1 = new User
//            {
//                Username = "student1",
//                Email = "student1@gmail.com",
//                PasswordHash = BCrypt.Net.BCrypt.HashPassword("student123"),
//                Role = UserRole.Student,
//                IsActive = true,
//                CreatedAt = DateTime.Now
//            };

//            var studentUser2 = new User
//            {
//                Username = "student2",
//                Email = "student2@gmail.com",
//                PasswordHash = BCrypt.Net.BCrypt.HashPassword("student123"),
//                Role = UserRole.Student,
//                IsActive = true,
//                CreatedAt = DateTime.Now
//            };

//            var parentUser = new User
//            {
//                Username = "parent1",
//                Email = "parent@gmail.com",
//                PasswordHash = BCrypt.Net.BCrypt.HashPassword("parent123"),
//                Role = UserRole.Parent,
//                IsActive = true,
//                CreatedAt = DateTime.Now
//            };

//            context.Users.AddRange(
//                adminUser,
//                teacherUser1,
//                teacherUser2,
//                studentUser1,
//                studentUser2,
//                parentUser
//            );

//            context.SaveChanges();

//            // -------------------------
//            // ADMIN
//            // -------------------------

//            var admin = new Admin
//            {
//                UserId = adminUser.UserId,
//                FirstName = "System",
//                LastName = "Admin"
//            };

//            context.Admins.Add(admin);

//            // -------------------------
//            // STUDENTS
//            // -------------------------

//            var student1 = new Student
//            {
//                UserId = studentUser1.UserId,
//                FirstName = "Ali",
//                LastName = "Khan",
//                Class = "10",
//                Section = "A",
//                RollNumber = "101"
//            };

//            var student2 = new Student
//            {
//                UserId = studentUser2.UserId,
//                FirstName = "Sara",
//                LastName = "Ahmed",
//                Class = "9",
//                Section = "B",
//                RollNumber = "202"
//            };

//            context.Students.AddRange(student1, student2);

//            context.SaveChanges();

//            // -------------------------
//            // TEACHERS
//            // -------------------------

//            var teacher1 = new Teacher
//            {
//                UserId = teacherUser1.UserId,
//                FirstName = "Mr",
//                LastName = "Bilal",
//                AssignedSubjects = "Math"
//            };

//            var teacher2 = new Teacher
//            {
//                UserId = teacherUser2.UserId,
//                FirstName = "Ms",
//                LastName = "Ayesha",
//                AssignedSubjects = "Science"
//            };

//            context.Teachers.AddRange(teacher1, teacher2);

//            // -------------------------
//            // PARENT
//            // -------------------------

//            var parent = new Parent
//            {
//                UserId = parentUser.UserId,
//                StudentId = student1.StudentId,
//                Relation = "Father"
//            };

//            context.Parents.Add(parent);

//            context.SaveChanges();

//            // -------------------------
//            // FEES
//            // -------------------------

//            var fee = new Fee
//            {
//                StudentId = student1.StudentId,
//                Term = "Spring 2026",
//                TotalAmount = 15000,
//                PaidAmount = 10000,
//                DueDate = DateTime.Now.AddDays(15),
//                Status = FeeStatus.Unpaid

//            };

//            context.Fees.Add(fee);

//            // -------------------------
//            // COMPLAINT
//            // -------------------------

//            var complaint = new Complaint
//            {
//                SubmittedByUserId = studentUser1.UserId,
//                AssignedToUserId = teacherUser1.UserId,
//                Category = "Academic",
//                Description = "Issue with homework grading",
//                Status = ComplaintStatus.Submitted,
//                DateSubmitted = DateTime.Now
//            };

//            context.Complaints.Add(complaint);

//            // -------------------------
//            // NOTIFICATION
//            // -------------------------

//            var notification = new Notification
//            {
//                UserId = studentUser1.UserId,
//                Type = "General",
//                Content = "Welcome to the system!",
//                DateSent = DateTime.Now,
//                Status = NotificationStatus.Unread
//            };

//            var notice1 = new Notice
//            {
//                Title = "Final Exam Schedule Released",
//                Content = "Final exams will start from Monday.",
//                Type = NoticeType.Exam,
//                Priority = NoticePriority.High,
//                Audience = NoticeAudience.SchoolWide,
//                PostedAt = DateTime.Now,
//                IsActive = true,
//                PostedByUserId = adminUser.UserId
//            };

//            var notice2 = new Notice
//            {
//                Title = "Winter Vacation Notice",
//                Content = "School will remain closed from Dec 20.",
//                Type = NoticeType.Holiday,
//                Priority = NoticePriority.Medium,
//                Audience = NoticeAudience.SchoolWide,
//                PostedAt = DateTime.Now,
//                IsActive = true,
//                PostedByUserId = adminUser.UserId
//            };

//            context.Notices.AddRange(notice1, notice2);


//            context.Notifications.Add(notification);

//            context.SaveChanges();
//        }
//    }
//}
