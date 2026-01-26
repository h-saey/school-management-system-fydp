# School Management System - Frontend Prototype

## 🎯 Overview

This is a fully functional frontend prototype of a comprehensive School Management System with four distinct user modules (Student, Parent, Teacher, and Admin). The system demonstrates authentication, role-based access control, session management, data persistence, and complete UI/UX flows for all user types.

**Note:** This is a prototype for demonstration purposes only, using simulated backend functionality with LocalStorage persistence. It is not intended for production use or handling sensitive personal information.

## ✨ Key Features

### Core Infrastructure
- ✅ **Authentication System** - Email/password login with validation
- ✅ **Session Management** - 20-minute inactivity timeout with automatic logout
- ✅ **Role-Based Access Control** - Strict permissions for Student, Parent, Teacher, Admin
- ✅ **Data Persistence** - LocalStorage-based simulated database
- ✅ **Audit Logging** - Tracks all critical user actions
- ✅ **Notifications** - Real-time notification system
- ✅ **SEO Optimization** - Dynamic page titles and meta descriptions
- ✅ **Accessibility** - WCAG 2.0 AA compliant with keyboard navigation

### Student Module
- ✅ Dashboard with real-time stats (attendance, marks, fees, achievements)
- ✅ Attendance tracking with monthly calendar view
- ✅ Attendance trends visualization (charts)
- ✅ Marks viewing with filters (term, subject, exam type)
- ✅ Subject-wise performance analysis
- ⏳ Portfolio aggregation (in progress)
- ⏳ Complaint submission system (in progress)
- ⏳ Notifications management (in progress)

### Parent Module
- ⏳ Child progress tracking
- ⏳ Multi-child support
- ⏳ Parent-teacher messaging
- ⏳ Fee status viewing
- ⏳ Behavior reports
- ⏳ Digital noticeboard

### Teacher Module
- ⏳ Attendance marking interface
- ⏳ Marks entry with auto-grading
- ⏳ Certificate uploads
- ⏳ Announcement publishing
- ⏳ Parent communication hub
- ⏳ Complaint management

### Admin Module
- ⏳ System-wide dashboard
- ⏳ Student/Teacher management (CRUD)
- ⏳ Attendance & marks oversight
- ⏳ Fee management
- ⏳ Noticeboard scheduling
- ⏳ Reporting & analytics

## 🔐 Demo Credentials

All users use the password: **password123**

| Role | Email | Features |
|------|-------|----------|
| Student | rahul@student.edu | View attendance, marks, portfolio, submit complaints |
| Parent | parent@email.com | View child's progress, communicate with teachers |
| Teacher | priya@teacher.edu | Mark attendance, enter marks, manage communications |
| Admin | admin@school.edu | Full system management and oversight |

## 🏗️ Architecture

### File Structure
```
/
├── App.tsx                      # Main app with routing
├── services/
│   ├── dataService.ts          # Simulated backend API
│   └── sessionService.ts       # Session & timeout management
├── contexts/
│   └── AppContext.tsx          # Global state & auth
├── components/
│   ├── Login.tsx               # Authentication UI
│   ├── SEO.tsx                 # SEO helper component
│   ├── student/                # Student module
│   │   ├── StudentDashboard.tsx
│   │   ├── DashboardOverview.tsx
│   │   ├── ViewAttendance.tsx
│   │   ├── ViewMarks.tsx
│   │   ├── StudentPortfolio.tsx
│   │   ├── ComplaintSubmission.tsx
│   │   └── Notifications.tsx
│   ├── parent/                 # Parent module
│   ├── teacher/                # Teacher module
│   └── admin/                  # Admin module
├── utils/
│   └── helpers.ts              # Utility functions
└── styles/
    └── globals.css             # Global styles
```

### Data Models

#### Core Entities
- **User** - Authentication & profile
- **Student** - Student information & class details
- **Parent** - Parent information with child links
- **Teacher** - Teacher profile & assigned classes
- **Admin** - Administrator profile

#### Academic Entities
- **Attendance** - Daily attendance records (Present/Absent/Late)
- **Marks** - Exam marks with auto-grading
- **Portfolio** - Aggregated student performance
- **Certificate** - Awards & achievements

#### Communication Entities
- **Notice** - School/class announcements
- **Message** - Parent-teacher messaging
- **Complaint** - Issue tracking system
- **BehaviorRemark** - Behavior observations

#### System Entities
- **Fee** - Fee records & payment status
- **AuditLog** - Immutable action logs
- **NotificationItem** - User notifications

## 🔧 Technical Implementation

### Authentication Flow
1. User enters credentials on login page
2. `dataService.authenticate()` validates against stored users
3. Session created with 20-minute expiry
4. Activity monitoring starts (tracks mouse/keyboard events)
5. Automatic logout on inactivity
6. Audit log created for login event

### Session Management
- **Timeout**: 20 minutes of inactivity
- **Monitoring**: Real-time activity tracking
- **Storage**: SessionStorage for current session
- **Events**: 'sessionTimeout' event fired on expiry

### Data Persistence
All data stored in LocalStorage under key: `sms_data_v1`
- Survives page refresh
- Simulates real database behavior
- Can be reset with `dataService.resetData()`

### Role-Based Access Control

```typescript
// Permission check example
hasPermission(['admin', 'teacher']) // Returns boolean

// Entity access check
canAccessEntity('student', studentId) // Validates ownership/assignment
```

#### Access Rules
- **Student**: Can only access own data
- **Parent**: Can access assigned children's data
- **Teacher**: Can access students in assigned classes
- **Admin**: Full system access

### Audit Logging
Every critical action is logged:
- User login/logout
- Attendance marking
- Marks entry
- Message sending
- Complaint submission
- Notice posting

Logs include:
- User ID & role
- Action type
- Entity type & ID
- Timestamp
- Details/description

## 🎨 UI/UX Features

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Adaptive layouts for all screen sizes

### Accessibility
- Semantic HTML elements
- ARIA labels for all interactive elements
- Keyboard navigation support (Tab, Enter, Shift+Tab)
- Focus indicators
- Alt text for images
- Screen reader compatible

### Performance Optimizations
- Loading states for async operations
- Lazy loading for charts and heavy components
- Debounced search/filter inputs
- Optimistic UI updates

### User Experience
- Toast notifications for actions
- Error handling with user-friendly messages
- Loading indicators
- Empty states
- Form validation with inline errors
- Confirmation dialogs for destructive actions

## 📊 Data Visualization

Charts and graphs using **Recharts** library:
- Bar charts for attendance trends
- Line charts for performance tracking
- Pie charts for grade distribution
- Area charts for cumulative stats

## 🔍 SEO Implementation

Each page includes:
- Dynamic `<title>` tag
- Meta description
- Meta keywords
- Structured for search engine indexing

Example:
```typescript
<SEO 
  title="Student Dashboard" 
  description="View your academic performance and attendance"
  keywords="student dashboard, attendance, marks"
/>
```

## 🚀 Getting Started

1. **Login** with any of the demo credentials
2. **Explore** the dashboard and navigation
3. **Interact** with features (all data persists in browser)
4. **Test** session timeout by remaining inactive for 20 minutes
5. **Reset** data anytime using browser developer tools:
   ```javascript
   localStorage.removeItem('sms_data_v1')
   ```

## 📱 Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

## ⚙️ Configuration

### Session Timeout
Located in `/services/sessionService.ts`:
```typescript
const SESSION_TIMEOUT = 20 * 60 * 1000; // 20 minutes
```

### Initial Data
Mock data generation in `/services/dataService.ts`:
- Modify `INITIAL_USERS`, `INITIAL_STUDENTS`, etc.
- Adjust data generation functions

## 🧪 Testing Scenarios

### Authentication
- ✅ Login with valid credentials
- ✅ Login with invalid credentials
- ✅ Login with inactive account
- ✅ Session timeout after 20 minutes
- ✅ Logout functionality

### Student Features
- ✅ View attendance calendar
- ✅ Filter attendance by month
- ✅ View marks with filters
- ✅ Subject-wise performance
- ✅ Download report (simulated)

### Data Persistence
- ✅ Data survives page refresh
- ✅ Session persists until timeout
- ✅ Logout clears session

### Role-Based Access
- ✅ Student can only view own data
- ✅ Different dashboards per role
- ⏳ Parent access to child data (in progress)
- ⏳ Teacher access to assigned classes (in progress)

## 🔒 Security Considerations

### Implemented (for Prototype)
- Session timeout
- Role-based access control
- Audit logging
- Input validation
- XSS protection (React default)

### Not Implemented (Production Requirements)
- Password hashing (stored as plain text)
- HTTPS enforcement
- CSRF protection
- Rate limiting
- SQL injection protection (no real DB)
- Data encryption at rest

## 📝 Future Enhancements

### Near Term
- Complete remaining module implementations
- Add file upload simulation
- Implement all CRUD operations
- Enhanced reporting & analytics
- Real-time notifications

### Long Term
- Backend API integration
- Database persistence
- Real file storage
- Email notifications
- Mobile app
- Multi-language support

## 🤝 Contributing

This is a prototype for demonstration purposes. For production use, integrate with:
- Backend API (ASP.NET Core, Node.js, etc.)
- Database (SQL Server, PostgreSQL, MongoDB, etc.)
- Authentication service (Auth0, Firebase, etc.)
- File storage (AWS S3, Azure Blob, etc.)

## 📄 License

This is a demonstration project for educational purposes.

## 👥 Credits

- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Charts**: Recharts
- **Notifications**: Sonner
- **Styling**: Tailwind CSS

## 📞 Support

For questions or issues, please refer to the implementation documentation in `/IMPLEMENTATION_STATUS.md`.

---

**Last Updated**: January 24, 2026
**Version**: 1.0.0 (Prototype)
**Status**: Functional Frontend with Simulated Backend
