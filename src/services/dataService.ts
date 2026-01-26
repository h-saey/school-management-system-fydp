// Simulated Backend Data Service with LocalStorage Persistence
import { UserRole } from '../App';

// ============= ENTITY INTERFACES =============

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // In prototype only - would be hashed in production
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface Student {
  id: string;
  userId: string;
  name: string;
  email: string;
  class: string;
  section: string;
  rollNumber: string;
  dateOfBirth: string;
  parentId: string;
  isActive: boolean;
}

export interface Parent {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  childrenIds: string[]; // Array of student IDs
}

export interface Teacher {
  id: string;
  userId: string;
  name: string;
  email: string;
  subject: string;
  assignedClasses: string[];
  phone: string;
}

export interface Admin {
  id: string;
  userId: string;
  name: string;
  email: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late';
  markedBy: string; // teacher ID
  markedAt: string;
  remarks?: string;
}

export interface Marks {
  id: string;
  studentId: string;
  subject: string;
  examType: string; // "Monthly Test", "Mid-Term", "Final"
  term: string; // "Term 1", "Term 2"
  marksObtained: number;
  totalMarks: number;
  grade: string;
  enteredBy: string; // teacher ID
  enteredAt: string;
}

export interface Fee {
  id: string;
  studentId: string;
  term: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  lastUpdated: string;
  updatedBy: string; // admin ID
}

export interface Complaint {
  id: string;
  submittedBy: string; // student or parent ID
  submitterRole: 'student' | 'parent';
  studentId: string; // Related student
  subject: string;
  description: string;
  category: string;
  status: 'Pending' | 'In Review' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High';
  submittedAt: string;
  assignedTo?: string; // teacher or admin ID
  resolvedAt?: string;
  resolution?: string;
}

export interface BehaviorRemark {
  id: string;
  studentId: string;
  teacherId: string;
  date: string;
  type: 'Positive' | 'Negative' | 'Neutral';
  category: string; // "Discipline", "Participation", "Attitude"
  remark: string;
  createdAt: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: string; // "Exam", "Holiday", "Event", "General"
  priority: 'Low' | 'Medium' | 'High';
  targetAudience: ('student' | 'parent' | 'teacher')[];
  postedBy: string; // teacher or admin ID
  postedAt: string;
  expiresAt?: string;
  classes?: string[]; // If class-specific
}

export interface Certificate {
  id: string;
  studentId: string;
  title: string;
  description: string;
  category: string; // "Academic", "Sports", "Cultural", "Other"
  dateAwarded: string;
  uploadedBy: string; // teacher or admin ID
  uploadedAt: string;
  fileUrl: string; // Simulated file path
}

export interface Message {
  id: string;
  fromId: string;
  fromRole: UserRole;
  toId: string;
  toRole: UserRole;
  studentId: string; // Context - which student is this about
  subject: string;
  content: string;
  sentAt: string;
  readAt?: string;
  isRead: boolean;
}

export interface Portfolio {
  studentId: string;
  academicSummary: {
    averageMarks: number;
    overallGrade: string;
    rank?: number;
  };
  attendanceSummary: {
    totalDays: number;
    present: number;
    absent: number;
    late: number;
    percentage: number;
  };
  certificates: Certificate[];
  achievements: string[];
  behaviorRemarks: BehaviorRemark[];
}

export interface AuditLog {
  id: string;
  userId: string;
  userRole: UserRole;
  action: string; // "login", "attendance_marked", "marks_entered", etc.
  entityType: string; // "User", "Attendance", "Marks", etc.
  entityId?: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: string; // "exam", "fee", "holiday", "pta", "complaint", "message"
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  link?: string;
}

// ============= INITIAL MOCK DATA =============

const INITIAL_USERS: User[] = [
  {
    id: 'user-student-1',
    name: 'Rahul Sharma',
    email: 'rahul@student.edu',
    password: 'password123',
    role: 'student',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-student-2',
    name: 'Priya Patel',
    email: 'priya@student.edu',
    password: 'password123',
    role: 'student',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-parent-1',
    name: 'Mrs. Sharma',
    email: 'parent@email.com',
    password: 'password123',
    role: 'parent',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-teacher-1',
    name: 'Dr. Priya Singh',
    email: 'priya@teacher.edu',
    password: 'password123',
    role: 'teacher',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-admin-1',
    name: 'Admin User',
    email: 'admin@school.edu',
    password: 'password123',
    role: 'admin',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

const INITIAL_STUDENTS: Student[] = [
  {
    id: 'student-1',
    userId: 'user-student-1',
    name: 'Rahul Sharma',
    email: 'rahul@student.edu',
    class: '10',
    section: 'A',
    rollNumber: '101',
    dateOfBirth: '2008-05-15',
    parentId: 'parent-1',
    isActive: true
  },
  {
    id: 'student-2',
    userId: 'user-student-2',
    name: 'Priya Patel',
    email: 'priya@student.edu',
    class: '10',
    section: 'A',
    rollNumber: '102',
    dateOfBirth: '2008-07-20',
    parentId: 'parent-2',
    isActive: true
  }
];

const INITIAL_PARENTS: Parent[] = [
  {
    id: 'parent-1',
    userId: 'user-parent-1',
    name: 'Mrs. Sharma',
    email: 'parent@email.com',
    phone: '+91-9876543210',
    childrenIds: ['student-1']
  }
];

const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'teacher-1',
    userId: 'user-teacher-1',
    name: 'Dr. Priya Singh',
    email: 'priya@teacher.edu',
    subject: 'Mathematics',
    assignedClasses: ['10-A', '10-B'],
    phone: '+91-9876543211'
  }
];

const INITIAL_ADMINS: Admin[] = [
  {
    id: 'admin-1',
    userId: 'user-admin-1',
    name: 'Admin User',
    email: 'admin@school.edu'
  }
];

// Generate initial attendance data for the last 30 days
const generateInitialAttendance = (): Attendance[] => {
  const attendance: Attendance[] = [];
  const statuses: ('Present' | 'Absent' | 'Late')[] = ['Present', 'Present', 'Present', 'Present', 'Late', 'Absent'];
  
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    INITIAL_STUDENTS.forEach((student, idx) => {
      attendance.push({
        id: `attendance-${student.id}-${i}`,
        studentId: student.id,
        date: date.toISOString().split('T')[0],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        markedBy: 'teacher-1',
        markedAt: new Date(date.setHours(9, 0, 0, 0)).toISOString()
      });
    });
  }
  
  return attendance;
};

// Generate initial marks data
const generateInitialMarks = (): Marks[] => {
  const marks: Marks[] = [];
  const subjects = ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi'];
  const terms = ['Term 1', 'Term 2'];
  const examTypes = ['Monthly Test', 'Mid-Term', 'Final'];
  
  INITIAL_STUDENTS.forEach(student => {
    subjects.forEach(subject => {
      terms.forEach(term => {
        examTypes.forEach(examType => {
          const marksObtained = Math.floor(Math.random() * 30) + 70; // 70-100
          const totalMarks = 100;
          const percentage = (marksObtained / totalMarks) * 100;
          let grade = 'A+';
          if (percentage < 90) grade = 'A';
          if (percentage < 80) grade = 'B';
          if (percentage < 70) grade = 'C';
          
          marks.push({
            id: `marks-${student.id}-${subject}-${term}-${examType}`,
            studentId: student.id,
            subject,
            examType,
            term,
            marksObtained,
            totalMarks,
            grade,
            enteredBy: 'teacher-1',
            enteredAt: new Date().toISOString()
          });
        });
      });
    });
  });
  
  return marks;
};

const INITIAL_FEES: Fee[] = [
  {
    id: 'fee-1',
    studentId: 'student-1',
    term: 'Term 1',
    amount: 25000,
    paidAmount: 25000,
    dueDate: '2024-07-31',
    status: 'Paid',
    lastUpdated: '2024-07-15T00:00:00Z',
    updatedBy: 'admin-1'
  },
  {
    id: 'fee-2',
    studentId: 'student-1',
    term: 'Term 2',
    amount: 25000,
    paidAmount: 15000,
    dueDate: '2025-01-31',
    status: 'Pending',
    lastUpdated: '2024-12-15T00:00:00Z',
    updatedBy: 'admin-1'
  }
];

const INITIAL_NOTICES: Notice[] = [
  {
    id: 'notice-1',
    title: 'Annual Sports Day',
    content: 'Annual Sports Day will be held on 15th February 2025. All students are requested to participate.',
    category: 'Event',
    priority: 'High',
    targetAudience: ['student', 'parent'],
    postedBy: 'admin-1',
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    classes: ['10-A', '10-B']
  },
  {
    id: 'notice-2',
    title: 'Mid-Term Examinations',
    content: 'Mid-term examinations will begin from 1st March 2025. Time table will be shared soon.',
    category: 'Exam',
    priority: 'High',
    targetAudience: ['student', 'parent', 'teacher'],
    postedBy: 'admin-1',
    postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_CERTIFICATES: Certificate[] = [
  {
    id: 'cert-1',
    studentId: 'student-1',
    title: 'Mathematics Olympiad - Gold Medal',
    description: 'Awarded for securing first position in State Mathematics Olympiad',
    category: 'Academic',
    dateAwarded: '2024-12-15',
    uploadedBy: 'teacher-1',
    uploadedAt: '2024-12-16T00:00:00Z',
    fileUrl: '/certificates/math-olympiad-2024.pdf'
  }
];

// ============= DATA SERVICE CLASS =============

class DataService {
  private storageKey = 'sms_data_v1';

  // Initialize data on first load
  private initializeData() {
    const existing = localStorage.getItem(this.storageKey);
    if (!existing) {
      const initialData = {
        users: INITIAL_USERS,
        students: INITIAL_STUDENTS,
        parents: INITIAL_PARENTS,
        teachers: INITIAL_TEACHERS,
        admins: INITIAL_ADMINS,
        attendance: generateInitialAttendance(),
        marks: generateInitialMarks(),
        fees: INITIAL_FEES,
        complaints: [] as Complaint[],
        behaviorRemarks: [] as BehaviorRemark[],
        notices: INITIAL_NOTICES,
        certificates: INITIAL_CERTIFICATES,
        messages: [] as Message[],
        auditLogs: [] as AuditLog[],
        notifications: [] as NotificationItem[]
      };
      localStorage.setItem(this.storageKey, JSON.stringify(initialData));
    }
  }

  private getData() {
    this.initializeData();
    const data = localStorage.getItem(this.storageKey);
    return JSON.parse(data || '{}');
  }

  private saveData(data: any) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  // ============= AUTHENTICATION =============

  authenticate(email: string, password: string): { success: boolean; user?: User; message?: string } {
    const data = this.getData();
    const user = data.users.find((u: User) => u.email === email && u.password === password);
    
    if (!user) {
      this.createAuditLog({
        userId: 'unknown',
        userRole: 'student',
        action: 'login_failed',
        entityType: 'User',
        details: `Failed login attempt for email: ${email}`,
        timestamp: new Date().toISOString()
      });
      return { success: false, message: 'Invalid credentials' };
    }
    
    if (!user.isActive) {
      return { success: false, message: 'Account inactive. Please contact administrator.' };
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    const userIndex = data.users.findIndex((u: User) => u.id === user.id);
    data.users[userIndex] = user;
    this.saveData(data);

    // Log successful login
    this.createAuditLog({
      userId: user.id,
      userRole: user.role,
      action: 'login_success',
      entityType: 'User',
      details: `User logged in successfully`,
      timestamp: new Date().toISOString()
    });

    return { success: true, user };
  }

  // ============= USERS =============

  getUsers(): User[] {
    return this.getData().users;
  }

  getUserById(id: string): User | undefined {
    return this.getData().users.find((u: User) => u.id === id);
  }

  createUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const data = this.getData();
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    data.users.push(newUser);
    this.saveData(data);
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const data = this.getData();
    const index = data.users.findIndex((u: User) => u.id === id);
    if (index === -1) return undefined;
    
    data.users[index] = { ...data.users[index], ...updates };
    this.saveData(data);
    return data.users[index];
  }

  // ============= STUDENTS =============

  getStudents(): Student[] {
    return this.getData().students;
  }

  getStudentById(id: string): Student | undefined {
    return this.getData().students.find((s: Student) => s.id === id);
  }

  getStudentByUserId(userId: string): Student | undefined {
    return this.getData().students.find((s: Student) => s.userId === userId);
  }

  createStudent(student: Omit<Student, 'id'>): Student {
    const data = this.getData();
    const newStudent: Student = {
      ...student,
      id: `student-${Date.now()}`
    };
    data.students.push(newStudent);
    this.saveData(data);
    return newStudent;
  }

  updateStudent(id: string, updates: Partial<Student>): Student | undefined {
    const data = this.getData();
    const index = data.students.findIndex((s: Student) => s.id === id);
    if (index === -1) return undefined;
    
    data.students[index] = { ...data.students[index], ...updates };
    this.saveData(data);
    return data.students[index];
  }

  // ============= PARENTS =============

  getParentByUserId(userId: string): Parent | undefined {
    return this.getData().parents.find((p: Parent) => p.userId === userId);
  }

  getParentById(id: string): Parent | undefined {
    return this.getData().parents.find((p: Parent) => p.id === id);
  }

  // ============= TEACHERS =============

  getTeachers(): Teacher[] {
    return this.getData().teachers;
  }

  getTeacherByUserId(userId: string): Teacher | undefined {
    return this.getData().teachers.find((t: Teacher) => t.userId === userId);
  }

  getTeacherById(id: string): Teacher | undefined {
    return this.getData().teachers.find((t: Teacher) => t.id === id);
  }

  createTeacher(teacher: Omit<Teacher, 'id'>): Teacher {
    const data = this.getData();
    const newTeacher: Teacher = {
      ...teacher,
      id: `teacher-${Date.now()}`
    };
    data.teachers.push(newTeacher);
    this.saveData(data);
    return newTeacher;
  }

  updateTeacher(id: string, updates: Partial<Teacher>): Teacher | undefined {
    const data = this.getData();
    const index = data.teachers.findIndex((t: Teacher) => t.id === id);
    if (index === -1) return undefined;
    
    data.teachers[index] = { ...data.teachers[index], ...updates };
    this.saveData(data);
    return data.teachers[index];
  }

  // ============= ATTENDANCE =============

  getAttendanceByStudent(studentId: string, startDate?: string, endDate?: string): Attendance[] {
    const data = this.getData();
    let attendance = data.attendance.filter((a: Attendance) => a.studentId === studentId);
    
    if (startDate) {
      attendance = attendance.filter((a: Attendance) => a.date >= startDate);
    }
    if (endDate) {
      attendance = attendance.filter((a: Attendance) => a.date <= endDate);
    }
    
    return attendance.sort((a: Attendance, b: Attendance) => b.date.localeCompare(a.date));
  }

  getAttendanceByDate(date: string, classFilter?: string): Attendance[] {
    const data = this.getData();
    let attendance = data.attendance.filter((a: Attendance) => a.date === date);
    
    if (classFilter) {
      const students = data.students.filter((s: Student) => `${s.class}-${s.section}` === classFilter);
      const studentIds = students.map((s: Student) => s.id);
      attendance = attendance.filter((a: Attendance) => studentIds.includes(a.studentId));
    }
    
    return attendance;
  }

  markAttendance(attendance: Omit<Attendance, 'id' | 'markedAt'>): Attendance {
    const data = this.getData();
    
    // Check if already marked for this date
    const existing = data.attendance.findIndex(
      (a: Attendance) => a.studentId === attendance.studentId && a.date === attendance.date
    );
    
    const newAttendance: Attendance = {
      ...attendance,
      id: existing >= 0 ? data.attendance[existing].id : `attendance-${Date.now()}`,
      markedAt: new Date().toISOString()
    };
    
    if (existing >= 0) {
      data.attendance[existing] = newAttendance;
    } else {
      data.attendance.push(newAttendance);
    }
    
    this.saveData(data);
    
    // Log audit
    this.createAuditLog({
      userId: attendance.markedBy,
      userRole: 'teacher',
      action: 'attendance_marked',
      entityType: 'Attendance',
      entityId: newAttendance.id,
      details: `Marked ${attendance.status} for student ${attendance.studentId} on ${attendance.date}`,
      timestamp: new Date().toISOString()
    });
    
    return newAttendance;
  }

  // ============= MARKS =============

  getMarksByStudent(studentId: string): Marks[] {
    return this.getData().marks.filter((m: Marks) => m.studentId === studentId);
  }

  createMarks(marks: Omit<Marks, 'id' | 'enteredAt' | 'grade'>): Marks {
    const data = this.getData();
    
    // Auto-calculate grade
    const percentage = (marks.marksObtained / marks.totalMarks) * 100;
    let grade = 'A+';
    if (percentage < 90) grade = 'A';
    if (percentage < 80) grade = 'B';
    if (percentage < 70) grade = 'C';
    if (percentage < 60) grade = 'D';
    if (percentage < 40) grade = 'F';
    
    const newMarks: Marks = {
      ...marks,
      grade,
      id: `marks-${Date.now()}`,
      enteredAt: new Date().toISOString()
    };
    
    data.marks.push(newMarks);
    this.saveData(data);
    
    // Log audit
    this.createAuditLog({
      userId: marks.enteredBy,
      userRole: 'teacher',
      action: 'marks_entered',
      entityType: 'Marks',
      entityId: newMarks.id,
      details: `Entered marks for student ${marks.studentId}: ${marks.marksObtained}/${marks.totalMarks}`,
      timestamp: new Date().toISOString()
    });
    
    return newMarks;
  }

  updateMarks(id: string, updates: Partial<Marks>): Marks | undefined {
    const data = this.getData();
    const index = data.marks.findIndex((m: Marks) => m.id === id);
    if (index === -1) return undefined;
    
    // Recalculate grade if marks changed
    if (updates.marksObtained !== undefined || updates.totalMarks !== undefined) {
      const marksObtained = updates.marksObtained ?? data.marks[index].marksObtained;
      const totalMarks = updates.totalMarks ?? data.marks[index].totalMarks;
      const percentage = (marksObtained / totalMarks) * 100;
      
      let grade = 'A+';
      if (percentage < 90) grade = 'A';
      if (percentage < 80) grade = 'B';
      if (percentage < 70) grade = 'C';
      if (percentage < 60) grade = 'D';
      if (percentage < 40) grade = 'F';
      
      updates.grade = grade;
    }
    
    data.marks[index] = { ...data.marks[index], ...updates };
    this.saveData(data);
    return data.marks[index];
  }

  // ============= FEES =============

  getFeesByStudent(studentId: string): Fee[] {
    return this.getData().fees.filter((f: Fee) => f.studentId === studentId);
  }

  getAllFees(): Fee[] {
    return this.getData().fees;
  }

  updateFee(id: string, updates: Partial<Fee>): Fee | undefined {
    const data = this.getData();
    const index = data.fees.findIndex((f: Fee) => f.id === id);
    if (index === -1) return undefined;
    
    // Auto-update status
    if (updates.paidAmount !== undefined) {
      const fee = data.fees[index];
      const newPaidAmount = updates.paidAmount;
      
      if (newPaidAmount >= fee.amount) {
        updates.status = 'Paid';
      } else if (new Date() > new Date(fee.dueDate)) {
        updates.status = 'Overdue';
      } else {
        updates.status = 'Pending';
      }
    }
    
    updates.lastUpdated = new Date().toISOString();
    data.fees[index] = { ...data.fees[index], ...updates };
    this.saveData(data);
    return data.fees[index];
  }

  // ============= COMPLAINTS =============

  getComplaints(filters?: { studentId?: string; submittedBy?: string; status?: string }): Complaint[] {
    let complaints = this.getData().complaints;
    
    if (filters?.studentId) {
      complaints = complaints.filter((c: Complaint) => c.studentId === filters.studentId);
    }
    if (filters?.submittedBy) {
      complaints = complaints.filter((c: Complaint) => c.submittedBy === filters.submittedBy);
    }
    if (filters?.status) {
      complaints = complaints.filter((c: Complaint) => c.status === filters.status);
    }
    
    return complaints.sort((a: Complaint, b: Complaint) => b.submittedAt.localeCompare(a.submittedAt));
  }

  createComplaint(complaint: Omit<Complaint, 'id' | 'submittedAt' | 'status'>): Complaint {
    const data = this.getData();
    const newComplaint: Complaint = {
      ...complaint,
      id: `complaint-${Date.now()}`,
      status: 'Pending',
      submittedAt: new Date().toISOString()
    };
    
    data.complaints.push(newComplaint);
    this.saveData(data);
    
    // Log audit
    this.createAuditLog({
      userId: complaint.submittedBy,
      userRole: complaint.submitterRole,
      action: 'complaint_submitted',
      entityType: 'Complaint',
      entityId: newComplaint.id,
      details: `Complaint submitted: ${complaint.subject}`,
      timestamp: new Date().toISOString()
    });
    
    return newComplaint;
  }

  updateComplaint(id: string, updates: Partial<Complaint>): Complaint | undefined {
    const data = this.getData();
    const index = data.complaints.findIndex((c: Complaint) => c.id === id);
    if (index === -1) return undefined;
    
    if (updates.status === 'Resolved' && !updates.resolvedAt) {
      updates.resolvedAt = new Date().toISOString();
    }
    
    data.complaints[index] = { ...data.complaints[index], ...updates };
    this.saveData(data);
    return data.complaints[index];
  }

  // ============= BEHAVIOR REMARKS =============

  getBehaviorRemarksByStudent(studentId: string): BehaviorRemark[] {
    return this.getData().behaviorRemarks
      .filter((b: BehaviorRemark) => b.studentId === studentId)
      .sort((a: BehaviorRemark, b: BehaviorRemark) => b.date.localeCompare(a.date));
  }

  createBehaviorRemark(remark: Omit<BehaviorRemark, 'id' | 'createdAt'>): BehaviorRemark {
    const data = this.getData();
    const newRemark: BehaviorRemark = {
      ...remark,
      id: `behavior-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    data.behaviorRemarks.push(newRemark);
    this.saveData(data);
    return newRemark;
  }

  // ============= NOTICES =============

  getNotices(targetRole?: UserRole): Notice[] {
    let notices = this.getData().notices;
    
    if (targetRole) {
      notices = notices.filter((n: Notice) => n.targetAudience.includes(targetRole));
    }
    
    // Filter out expired notices
    const now = new Date().toISOString();
    notices = notices.filter((n: Notice) => !n.expiresAt || n.expiresAt > now);
    
    return notices.sort((a: Notice, b: Notice) => b.postedAt.localeCompare(a.postedAt));
  }

  createNotice(notice: Omit<Notice, 'id' | 'postedAt'>): Notice {
    const data = this.getData();
    const newNotice: Notice = {
      ...notice,
      id: `notice-${Date.now()}`,
      postedAt: new Date().toISOString()
    };
    
    data.notices.push(newNotice);
    this.saveData(data);
    
    // Create notifications for target audience
    this.createNotificationsForNotice(newNotice);
    
    return newNotice;
  }

  private createNotificationsForNotice(notice: Notice) {
    const data = this.getData();
    const users = data.users.filter((u: User) => 
      notice.targetAudience.includes(u.role) && u.isActive
    );
    
    users.forEach((user: User) => {
      this.createNotification({
        userId: user.id,
        type: notice.category.toLowerCase(),
        title: notice.title,
        message: notice.content.substring(0, 100) + '...',
        timestamp: new Date().toISOString(),
        isRead: false
      });
    });
  }

  // ============= CERTIFICATES =============

  getCertificatesByStudent(studentId: string): Certificate[] {
    return this.getData().certificates
      .filter((c: Certificate) => c.studentId === studentId)
      .sort((a: Certificate, b: Certificate) => b.dateAwarded.localeCompare(a.dateAwarded));
  }

  createCertificate(certificate: Omit<Certificate, 'id' | 'uploadedAt'>): Certificate {
    const data = this.getData();
    const newCertificate: Certificate = {
      ...certificate,
      id: `cert-${Date.now()}`,
      uploadedAt: new Date().toISOString()
    };
    
    data.certificates.push(newCertificate);
    this.saveData(data);
    return newCertificate;
  }

  // ============= MESSAGES =============

  getMessages(userId: string, userRole: UserRole): Message[] {
    return this.getData().messages
      .filter((m: Message) => 
        (m.fromId === userId && m.fromRole === userRole) ||
        (m.toId === userId && m.toRole === userRole)
      )
      .sort((a: Message, b: Message) => b.sentAt.localeCompare(a.sentAt));
  }

  getConversation(userId1: string, role1: UserRole, userId2: string, role2: UserRole): Message[] {
    return this.getData().messages
      .filter((m: Message) =>
        (m.fromId === userId1 && m.fromRole === role1 && m.toId === userId2 && m.toRole === role2) ||
        (m.fromId === userId2 && m.fromRole === role2 && m.toId === userId1 && m.toRole === role1)
      )
      .sort((a: Message, b: Message) => a.sentAt.localeCompare(b.sentAt));
  }

  sendMessage(message: Omit<Message, 'id' | 'sentAt' | 'isRead'>): Message {
    const data = this.getData();
    const newMessage: Message = {
      ...message,
      id: `message-${Date.now()}`,
      sentAt: new Date().toISOString(),
      isRead: false
    };
    
    data.messages.push(newMessage);
    this.saveData(data);
    
    // Create notification for recipient
    this.createNotification({
      userId: message.toId,
      type: 'message',
      title: 'New Message',
      message: `You have a new message from ${message.fromRole}`,
      timestamp: new Date().toISOString(),
      isRead: false
    });
    
    // Log audit
    this.createAuditLog({
      userId: message.fromId,
      userRole: message.fromRole,
      action: 'message_sent',
      entityType: 'Message',
      entityId: newMessage.id,
      details: `Message sent to ${message.toRole}`,
      timestamp: new Date().toISOString()
    });
    
    return newMessage;
  }

  markMessageAsRead(messageId: string): void {
    const data = this.getData();
    const index = data.messages.findIndex((m: Message) => m.id === messageId);
    if (index >= 0) {
      data.messages[index].isRead = true;
      data.messages[index].readAt = new Date().toISOString();
      this.saveData(data);
    }
  }

  // ============= NOTIFICATIONS =============

  getNotifications(userId: string): NotificationItem[] {
    return this.getData().notifications
      .filter((n: NotificationItem) => n.userId === userId)
      .sort((a: NotificationItem, b: NotificationItem) => b.timestamp.localeCompare(a.timestamp));
  }

  createNotification(notification: Omit<NotificationItem, 'id'>): NotificationItem {
    const data = this.getData();
    const newNotification: NotificationItem = {
      ...notification,
      id: `notif-${Date.now()}`
    };
    
    data.notifications.push(newNotification);
    this.saveData(data);
    return newNotification;
  }

  markNotificationAsRead(notificationId: string): void {
    const data = this.getData();
    const index = data.notifications.findIndex((n: NotificationItem) => n.id === notificationId);
    if (index >= 0) {
      data.notifications[index].isRead = true;
      this.saveData(data);
    }
  }

  markAllNotificationsAsRead(userId: string): void {
    const data = this.getData();
    data.notifications = data.notifications.map((n: NotificationItem) =>
      n.userId === userId ? { ...n, isRead: true } : n
    );
    this.saveData(data);
  }

  // ============= PORTFOLIO =============

  getStudentPortfolio(studentId: string): Portfolio {
    const marks = this.getMarksByStudent(studentId);
    const attendance = this.getAttendanceByStudent(studentId);
    const certificates = this.getCertificatesByStudent(studentId);
    const behaviorRemarks = this.getBehaviorRemarksByStudent(studentId);

    // Calculate academic summary
    const totalMarks = marks.reduce((sum, m) => sum + m.marksObtained, 0);
    const totalPossible = marks.reduce((sum, m) => sum + m.totalMarks, 0);
    const averageMarks = totalPossible > 0 ? (totalMarks / totalPossible) * 100 : 0;
    
    let overallGrade = 'A+';
    if (averageMarks < 90) overallGrade = 'A';
    if (averageMarks < 80) overallGrade = 'B';
    if (averageMarks < 70) overallGrade = 'C';
    if (averageMarks < 60) overallGrade = 'D';
    if (averageMarks < 40) overallGrade = 'F';

    // Calculate attendance summary
    const totalDays = attendance.length;
    const present = attendance.filter(a => a.status === 'Present').length;
    const absent = attendance.filter(a => a.status === 'Absent').length;
    const late = attendance.filter(a => a.status === 'Late').length;
    const percentage = totalDays > 0 ? ((present + late) / totalDays) * 100 : 0;

    return {
      studentId,
      academicSummary: {
        averageMarks: Math.round(averageMarks * 10) / 10,
        overallGrade,
      },
      attendanceSummary: {
        totalDays,
        present,
        absent,
        late,
        percentage: Math.round(percentage * 10) / 10
      },
      certificates,
      achievements: certificates.map(c => c.title),
      behaviorRemarks
    };
  }

  // ============= AUDIT LOGS =============

  createAuditLog(log: Omit<AuditLog, 'id'>): AuditLog {
    const data = this.getData();
    const newLog: AuditLog = {
      ...log,
      id: `audit-${Date.now()}`
    };
    
    data.auditLogs.push(newLog);
    this.saveData(data);
    return newLog;
  }

  getAuditLogs(filters?: { userId?: string; action?: string; entityType?: string }): AuditLog[] {
    let logs = this.getData().auditLogs;
    
    if (filters?.userId) {
      logs = logs.filter((l: AuditLog) => l.userId === filters.userId);
    }
    if (filters?.action) {
      logs = logs.filter((l: AuditLog) => l.action === filters.action);
    }
    if (filters?.entityType) {
      logs = logs.filter((l: AuditLog) => l.entityType === filters.entityType);
    }
    
    return logs.sort((a: AuditLog, b: AuditLog) => b.timestamp.localeCompare(a.timestamp));
  }

  // ============= DATA RESET =============

  resetData(): void {
    localStorage.removeItem(this.storageKey);
    this.initializeData();
  }
}

export const dataService = new DataService();
