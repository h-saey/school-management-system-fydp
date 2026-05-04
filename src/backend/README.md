# 🏫 SMS-FYP Backend

## ASP.NET Core Web API — School Management System with AI Risk Detection

> **Project:** Final Year Design Project (FYDP)
> **University:** University of the Punjab, Gujranwala Campus
> **Supervisor:** Dr. Salman Naseer
> **Team:** Saiha Atiq · Malaika Ashraf · Khadija Mustafa · Zainab Khawaja

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup & Installation](#setup--installation)
- [Database Setup](#database-setup)
- [Environment Configuration](#environment-configuration)
- [Running the Project](#running-the-project)
- [Seed Data](#seed-data)
- [AI Module Setup](#ai-module-setup)
- [API Reference](#api-reference)
- [Authentication](#authentication)
- [Role-Based Access](#role-based-access)
- [Testing](#testing)

---

## Overview

The backend is a **RESTful ASP.NET Core Web API** (.NET 8) that powers all four
role-specific dashboards (Admin, Teacher, Student, Parent). It includes:

- **JWT-based authentication** with role enforcement on every endpoint
- **Entity Framework Core** with code-first migrations on SQL Server
- **ML.NET SDCA multiclass classifier** for AI student risk prediction
- **Rule-based fallback** ensuring 100% risk prediction availability
- **Audit logging** on all critical actions (FR-15)
- **Automatic risk notifications** sent to students, parents, and teachers

---

## Tech Stack

| Technology              | Version | Purpose                         |
| ----------------------- | ------- | ------------------------------- |
| ASP.NET Core Web API    | 8.0     | RESTful backend framework       |
| Entity Framework Core   | 8.0     | ORM + code-first migrations     |
| SQL Server (SQLEXPRESS) | 2019+   | Primary relational database     |
| ML.NET                  | 3.0     | SDCA multiclass risk classifier |
| BCrypt.Net              | 4.0     | Password hashing                |
| JWT Bearer              | 8.0     | Stateless authentication        |
| Swagger/OpenAPI         | —       | API documentation + testing UI  |

---

## Project Structure

```
SMS_Backend/
├── Controllers/
│   ├── AuthController.cs          # Login, Register
│   ├── UserController.cs          # User CRUD + by-role + without-profile
│   ├── StudentController.cs       # Student CRUD
│   ├── TeacherController.cs       # Teacher CRUD
│   ├── ParentController.cs        # Parent CRUD + my-student
│   ├── AdminController.cs         # Admin CRUD + full dashboard analytics
│   ├── AttendanceController.cs    # Mark/Update/Lock attendance
│   ├── MarksController.cs         # Add/Update/Delete marks
│   ├── FeeController.cs           # Fee records + payment updates
│   ├── ComplaintController.cs     # Submit/Assign/Resolve complaints
│   ├── NoticeController.cs        # Post/Edit/Delete notices
│   ├── NotificationController.cs  # Send/Broadcast/MarkRead notifications
│   ├── AuditLogController.cs      # Read-only audit logs (Admin)
│   ├── AIController.cs            # Predict risk / Recommend / Simulate / Train
│   ├── ReportController.cs        # Generate downloadable reports
│   └── SeedController.cs          # Demo data (disable in production)
│
├── Data/
│   ├── ApplicationDbContext.cs    # DbContext with 18 DbSets + relationship config
│   └── DbInitializer.cs           # Realistic seed: 1 admin, 8 teachers, 25 students
│
├── Models/
│   ├── User.cs                    # UserRole enum (Admin/Teacher/Student/Parent)
│   ├── Student.cs, Teacher.cs     # Role profiles with User FK
│   ├── Parent.cs, Admin.cs        # Role profiles
│   ├── Attendance.cs              # AttendanceStatus enum + IsLocked
│   ├── Mark.cs                    # [NotMapped] Percentage property
│   ├── BehaviorRemark.cs          # Positive/Negative/Neutral
│   ├── Fee.cs                     # FeeStatus enum + [NotMapped] RemainingAmount
│   ├── Complaint.cs               # ComplaintStatus lifecycle enum
│   ├── Notice.cs                  # NoticeType + NoticePriority enums
│   ├── Notification.cs            # NotificationStatus enum
│   ├── RiskMonitoring.cs          # RiskLevel enum
│   ├── AuditLog.cs                # Immutable action log
│   └── StudentPortfolio.cs        # Compiled academic summary
│
├── Services/
│   ├── AuditLogService.cs         # Injectable logger with action constants
│   ├── RiskService.cs             # Compute risk from live DB data
│   ├── RecommendationService.cs   # Priority-sorted recommendations
│   ├── SimulationService.cs       # What-if risk simulation
│   └── RiskNotificationService.cs # Auto-notify on High/Medium risk
│
├── ML/
│   ├── RiskModel.cs               # ML input/output classes
│   └── ModelTrainer.cs            # Train/Save/Load ML.NET model
│
├── Program.cs                     # App configuration + DI registration
└── appsettings.json               # Connection strings + JWT config
```

---

## Prerequisites

Before starting, ensure you have installed:

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8)
- [SQL Server Express](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) (free)
- [SQL Server Management Studio](https://aka.ms/ssmsfullsetup) (optional, for DB inspection)
- [Visual Studio 2022](https://visualstudio.microsoft.com/) or [VS Code](https://code.visualstudio.com/) with C# extension

Verify your .NET installation:

```bash
dotnet --version
# Should output: 8.x.x
```

---

## Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/h-saey/school-management-system-fydp.git
cd school-management-system-fydp/src/Backend
```

### 2. Install NuGet Packages

```bash
# Core packages (already in .csproj — this restores them)
dotnet restore

# If ML.NET packages are missing, add manually:
dotnet add package Microsoft.ML --version 3.0.1
dotnet add package Microsoft.ML.FastTree --version 3.0.1
dotnet add package BCrypt.Net-Next --version 4.0.3
```

---

## Database Setup

### 1. Configure Connection String

Open `appsettings.json` and update the connection string:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.\\SQLEXPRESS;Database=SchoolManagementDB;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

> **Note:** Replace `SQLEXPRESS` with your SQL Server instance name if different.
> To find your instance name: open SQL Server Management Studio and check the server name.

### 2. Run Migrations

```bash
# Create the database schema from code-first models
dotnet ef database update

# If migrations folder is missing, create initial migration first:
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### 3. Verify Tables

Open SSMS → connect to your server → expand `SchoolManagementDB` → Tables.
You should see 18 tables: Users, Students, Teachers, Parents, Admins,
Attendances, Marks, BehaviorRemarks, Achievements, Fees, Complaints,
Notifications, Notices, Messages, StudentPortfolios, RiskMonitorings,
AuditLogs, Reports.

---

## Environment Configuration

### `appsettings.json` (full example)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.\\SQLEXPRESS;Database=SchoolManagementDB;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "Jwt": {
    "Key": "YourSuperSecretKeyHereMustBe32CharsMin!!",
    "Issuer": "SMS_Backend",
    "Audience": "SMS_Client"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

> ⚠️ **Security:** Change `Jwt:Key` to a strong random string before deployment.
> Minimum 32 characters. Never commit production keys to Git.

---

## Running the Project

### Development Mode

```bash
dotnet run

# API will be available at:
# http://localhost:5036
# https://localhost:7036 (HTTPS)
# Swagger UI: http://localhost:5036/swagger
```

### With Hot Reload

```bash
dotnet watch run
```

### Seed Initial Data

Data is auto-seeded on first run via `DbInitializer.Seed()` called in `Program.cs`:

```csharp
// In Program.cs (already configured):
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    DbInitializer.Seed(context);
}
```

This seeds **1 admin, 8 teachers, 25 students, 12 parents** with realistic
attendance, marks, behavior, fees, complaints, notices, and risk records.

---

## Seed Data

### Default Login Credentials

| Role    | Username        | Email                            | Password   |
| ------- | --------------- | -------------------------------- | ---------- |
| Admin   | admin1          | admin@school.edu.pk              | admin123   |
| Teacher | bilal.hussain   | bilal.hussain@school.edu.pk      | teacher123 |
| Teacher | ayesha.siddiqui | ayesha.siddiqui@school.edu.pk    | teacher123 |
| Student | ali.hassan      | ali.hassan@student.school.edu.pk | student123 |
| Student | usman.khan      | usman.khan@student.school.edu.pk | student123 |
| Parent  | m.hassan        | parent1@mail.com                 | parent123  |

> **Note:** All teacher usernames follow the pattern `firstname.lastname`.
> All student usernames follow the roll number pattern (e.g., `2024_001`).

### Demo Data (Alternative to Seed)

For AI testing with varied risk profiles, call the demo endpoint after login:

```bash
# Login as admin first to get token, then:
POST http://localhost:5036/api/seed/demo
Authorization: Bearer <your_admin_token>
```

This creates 6 students with carefully calibrated risk profiles
(2 High, 2 Medium, 2 Low) with 30 days of attendance, marks, and behavior data.

---

## AI Module Setup

### Step 1: Ensure Sufficient Data

The ML model requires at least 10 student records with attendance and marks.
If using seed data (DbInitializer), 25 students are available immediately.

### Step 2: Train the Model

```bash
# Via Swagger UI or Postman:
POST http://localhost:5036/api/ai/train
Authorization: Bearer <admin_token>

# Response:
{
  "message": "ML.NET model trained successfully.",
  "trainedOn": "25 records",
  "usedRealData": true
}
```

This saves `risk_model.zip` in the application's output directory.

### Step 3: Verify ML is Active

```bash
POST http://localhost:5036/api/ai/predict-risk
Authorization: Bearer <admin_token>
Content-Type: application/json

{ "studentId": 1 }

# Response includes:
{
  "mlModelUsed": true,      # Confirms ML is active
  "ruleBasedRisk": "High",
  "mlRisk": "High",
  "finalRisk": "High"
}
```

> **Without training:** System uses rule-based fallback automatically.
> `mlModelUsed` will be `false` but predictions will still work.

---

## API Reference

### Authentication

#### Login

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@school.edu.pk",
  "password": "admin123"
}

Response 200:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR...",
  "user": {
    "userId": 1,
    "username": "admin1",
    "email": "admin@school.edu.pk",
    "role": "admin"
  }
}
```

#### Register (Admin only in production)

```
POST /api/auth/register
{
  "username": "newteacher",
  "email": "newteacher@school.edu.pk",
  "password": "Teacher@123",
  "role": "Teacher"
}
```

---

### Users

| Method | Endpoint                       | Role  | Description                              |
| ------ | ------------------------------ | ----- | ---------------------------------------- |
| GET    | `/api/user`                    | Admin | All users with profile IDs               |
| GET    | `/api/user/{id}`               | Admin | Single user                              |
| GET    | `/api/user/by-role/{role}`     | Admin | Users by role (for dropdowns)            |
| GET    | `/api/user/without-profile`    | Admin | Users needing a profile                  |
| POST   | `/api/user`                    | Admin | Create user account                      |
| PUT    | `/api/user/{id}`               | Admin | Update username/email                    |
| PATCH  | `/api/user/{id}/toggle-status` | Admin | Activate/Deactivate                      |
| DELETE | `/api/user/{id}`               | Admin | Delete (blocked if linked records exist) |

---

### Students

| Method | Endpoint                        | Role           | Description                                |
| ------ | ------------------------------- | -------------- | ------------------------------------------ |
| GET    | `/api/student`                  | Admin, Teacher | All students                               |
| GET    | `/api/student/{id}`             | All            | Single student (own only for Student role) |
| GET    | `/api/student/by-class/{class}` | Admin, Teacher | Students in a class                        |
| POST   | `/api/student`                  | Admin          | Create student profile                     |
| PUT    | `/api/student/{id}`             | Admin          | Update student profile                     |
| DELETE | `/api/student/{id}`             | Admin          | Delete student                             |

---

### Attendance

| Method | Endpoint                       | Role                   | Description              |
| ------ | ------------------------------ | ---------------------- | ------------------------ |
| GET    | `/api/attendance`              | Admin, Teacher         | All records (filterable) |
| GET    | `/api/attendance/my`           | Student                | Own attendance           |
| GET    | `/api/attendance/student/{id}` | Admin, Teacher, Parent | Student attendance       |
| POST   | `/api/attendance`              | Admin, Teacher         | Mark attendance          |
| PUT    | `/api/attendance/{id}`         | Admin, Teacher         | Update (if not locked)   |
| PATCH  | `/api/attendance/{id}/lock`    | Admin, Teacher         | Lock record              |
| DELETE | `/api/attendance/{id}`         | Admin                  | Delete (if not locked)   |

**Mark Attendance Body:**

```json
{
  "studentId": 1,
  "teacherId": 2,
  "date": "2025-05-01",
  "status": "Present"
}
```

---

### Marks

| Method | Endpoint                  | Role                   | Description            |
| ------ | ------------------------- | ---------------------- | ---------------------- |
| GET    | `/api/marks`              | Admin, Teacher         | All marks (filterable) |
| GET    | `/api/marks/my`           | Student                | Own marks              |
| GET    | `/api/marks/student/{id}` | Admin, Teacher, Parent | Student marks          |
| POST   | `/api/marks`              | Admin, Teacher         | Add marks              |
| PUT    | `/api/marks/{id}`         | Admin, Teacher         | Update marks           |
| DELETE | `/api/marks/{id}`         | Admin                  | Delete marks           |

**Add Marks Body:**

```json
{
  "studentId": 1,
  "teacherId": 2,
  "subject": "Mathematics",
  "exam": "Midterm",
  "marksObtained": 75.5,
  "totalMarks": 100
}
```

---

### AI Risk Prediction

| Method | Endpoint                    | Role           | Description                 |
| ------ | --------------------------- | -------------- | --------------------------- |
| POST   | `/api/ai/predict-risk`      | All            | Predict risk for a student  |
| POST   | `/api/ai/recommendations`   | All            | Get recommendations         |
| POST   | `/api/ai/simulate`          | All            | Simulate risk improvement   |
| GET    | `/api/ai/my-risk`           | Student        | Own risk (no ID needed)     |
| GET    | `/api/ai/child-risk`        | Parent         | Child's risk (no ID needed) |
| GET    | `/api/ai/my-students-risks` | Teacher        | All taught students' risks  |
| GET    | `/api/ai/all-risks`         | Admin, Teacher | All students' risks         |
| POST   | `/api/ai/train`             | Admin          | Train ML model              |

**Predict Risk Body:**

```json
{ "studentId": 5 }
```

**Predict Risk Response:**

```json
{
  "studentId": 5,
  "studentName": "Ali Hassan",
  "class": "9",
  "rollNumber": "2024-001",
  "ruleBasedRisk": "High",
  "mlRisk": "High",
  "finalRisk": "High",
  "attendanceRate": 45.3,
  "averageMarks": 38.5,
  "negativeRemarks": 5,
  "behaviorScore": 20.0,
  "factors": [
    "Critically low attendance (45.3%)",
    "Very low academic performance (38.5%)"
  ],
  "mlModelUsed": true
}
```

**Simulate Body:**

```json
{
  "studentId": 5,
  "attendanceIncrease": 20,
  "marksIncrease": 15
}
```

---

### Fees

| Method | Endpoint                | Role          | Description                     |
| ------ | ----------------------- | ------------- | ------------------------------- |
| GET    | `/api/fee`              | Admin         | All fees (filterable by status) |
| GET    | `/api/fee/my`           | Student       | Own fees                        |
| GET    | `/api/fee/student/{id}` | Admin, Parent | Student fees                    |
| POST   | `/api/fee`              | Admin         | Create fee record               |
| PATCH  | `/api/fee/{id}/payment` | Admin         | Update paid amount              |
| DELETE | `/api/fee/{id}`         | Admin         | Delete fee record               |

---

### Complaints

| Method | Endpoint                     | Role            | Description                                            |
| ------ | ---------------------------- | --------------- | ------------------------------------------------------ |
| GET    | `/api/complaint`             | All             | Own complaints (Student/Parent) or all (Admin/Teacher) |
| POST   | `/api/complaint`             | Student, Parent | Submit complaint                                       |
| PATCH  | `/api/complaint/{id}/status` | Admin, Teacher  | Update status                                          |
| PATCH  | `/api/complaint/{id}/assign` | Admin           | Assign to staff                                        |
| DELETE | `/api/complaint/{id}`        | Admin           | Delete complaint                                       |

**Complaint Status Values:** `Submitted`, `UnderReview`, `Resolved`, `Rejected`, `Closed`

---

### Notices

| Method | Endpoint                      | Role           | Description                    |
| ------ | ----------------------------- | -------------- | ------------------------------ |
| GET    | `/api/notice`                 | All            | Active notices (role-filtered) |
| POST   | `/api/notice`                 | Admin, Teacher | Post notice                    |
| PUT    | `/api/notice/{id}`            | Admin, Teacher | Edit notice                    |
| PATCH  | `/api/notice/{id}/deactivate` | Admin, Teacher | Deactivate                     |
| DELETE | `/api/notice/{id}`            | Admin          | Delete permanently             |

**Post Notice Body:**

```json
{
  "title": "Final Exam Schedule",
  "content": "Exams begin Monday 10th.",
  "audience": "SchoolWide",
  "type": "Exam",
  "priority": "High",
  "targetClass": null
}
```

**Audience Values:** `SchoolWide`, `StudentsOnly`, `ParentsOnly`, `TeachersOnly`, `ClassSpecific`
**Type Values:** `Academic`, `Event`, `Holiday`, `Exam`, `Fee`, `General`
**Priority Values:** `Low`, `Medium`, `High`

---

### Notifications

| Method | Endpoint                      | Role  | Description           |
| ------ | ----------------------------- | ----- | --------------------- |
| GET    | `/api/notification/my`        | All   | Own notifications     |
| PATCH  | `/api/notification/{id}/read` | All   | Mark as read          |
| PATCH  | `/api/notification/read-all`  | All   | Mark all as read      |
| POST   | `/api/notification`           | Admin | Send to specific user |
| POST   | `/api/notification/broadcast` | Admin | Broadcast to role     |

---

### Admin Dashboard Stats

```
GET /api/admin/dashboard-stats
Authorization: Bearer <admin_token>

Response includes:
- totalStudents, totalTeachers, totalParents, activeUsers
- openComplaints, overdueFees
- studentGrowth (last 6 months)
- complaintTrend (last 6 months)
- feeCollectionTrend (last 6 months)
- classPerformance (top 5 classes by avg marks)
- lowAttendance (classes below 75%)
- attendanceTrend (monthly avg %)
- feeBreakdown (paid/pending/overdue totals)
- recentActivities (last 10 audit log entries)
```

---

### Audit Logs (Admin Only)

```
GET /api/auditlog?page=1&pageSize=20&action=LOGIN&from=2025-01-01
GET /api/auditlog/summary?days=30
GET /api/auditlog/actions        # Distinct action types
GET /api/auditlog/user/{userId}  # Logs for specific user
```

---

### Reports (Admin Only)

```
POST /api/report/attendance?className=10&from=2025-01-01&to=2025-05-01
POST /api/report/marks?className=10&subject=Math
POST /api/report/risk?level=High
POST /api/report/portfolio?className=10
GET  /api/report/download?path=Reports/Attendance_Report_20250501.txt
```

All report endpoints return a downloadable `.txt` file.

---

## Authentication

All endpoints (except `/api/auth/login` and `/api/auth/register`) require:

```
Authorization: Bearer <jwt_token>
```

**JWT Claims:**

- `NameIdentifier` → userId
- `Role` → Admin / Teacher / Student / Parent
- `Name` → username
- `Email` → email

**Token Expiry:** 8 hours from login.

---

## Role-Based Access

| Endpoint Category | Admin       | Teacher           | Student     | Parent        |
| ----------------- | ----------- | ----------------- | ----------- | ------------- |
| User Management   | ✅ Full     | ❌                | ❌          | ❌            |
| Student Profiles  | ✅ CRUD     | ✅ Read           | ✅ Own      | ✅ Child      |
| Attendance        | ✅ CRUD     | ✅ Mark/Edit      | ✅ View Own | ✅ View Child |
| Marks             | ✅ CRUD     | ✅ Add/Edit       | ✅ View Own | ✅ View Child |
| AI Risk           | ✅ All      | ✅ Own students   | ✅ Own      | ✅ Child      |
| Fees              | ✅ CRUD     | ❌                | ✅ View Own | ✅ View Child |
| Complaints        | ✅ Full     | ✅ Assign/Resolve | ✅ Submit   | ✅ Submit     |
| Notices           | ✅ Full     | ✅ Post/Edit Own  | ✅ View     | ✅ View       |
| Audit Logs        | ✅ Read     | ❌                | ❌          | ❌            |
| Reports           | ✅ Generate | ❌                | ❌          | ❌            |

---

## Testing

### Using Swagger UI

1. Run the project: `dotnet run`
2. Open: `http://localhost:5036/swagger`
3. Click **Authorize** → enter: `Bearer <your_token>`
4. Test any endpoint directly from the UI

### Using Postman

Import the base URL: `http://localhost:5036`

Add global header:

```
Authorization: Bearer {{token}}
```

### Running Unit Tests (if test project exists)

```bash
cd SMS_Backend.Tests
dotnet test
```

---

## Common Errors & Fixes

| Error                                     | Cause                   | Fix                                               |
| ----------------------------------------- | ----------------------- | ------------------------------------------------- |
| `Could not find input column 'RiskLabel'` | Old ML model code       | Use `[ColumnName("Label")]` not `RiskLabel`       |
| `Multiple cascade paths`                  | EF migration error      | Use `DeleteBehavior.Restrict` for multi-FK tables |
| `401 Unauthorized`                        | Missing/expired JWT     | Re-login and use fresh token                      |
| `403 Forbidden`                           | Wrong role              | Check user's role matches endpoint requirement    |
| `409 Conflict`                            | Duplicate attendance    | Use PUT to update existing record                 |
| `Database connection failed`              | Wrong connection string | Check SQL Server instance name                    |

---

## Production Checklist

- [ ] Change `Jwt:Key` to a cryptographically strong random string
- [ ] Remove or disable `SeedController.cs`
- [ ] Set `Logging:LogLevel:Default` to `Warning`
- [ ] Configure HTTPS only (remove HTTP redirect exceptions)
- [ ] Run `dotnet publish -c Release`
- [ ] Retrain ML model with real student data after deployment
- [ ] Set up daily SQL Server backup job

---

_Built with ❤️ using ASP.NET Core 8 + ML.NET 3.0 + SQL Server_
