// FILE: src/api/teacherApi.ts
// ACTION: CREATE this new file at src/api/teacherApi.ts
// This is the central API layer used by ALL teacher components.
// Replace "http://localhost:5000" with your actual backend URL if different.

export const API_BASE = "http://localhost:5036/api";

// ─── Token Helper ──────────────────────────────────────────────────────────

const getToken = (): string => localStorage.getItem("token") ?? "";

const authHeaders = (): HeadersInit => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// ─── Generic request ───────────────────────────────────────────────────────

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      errorBody?.message || `Request failed with status ${res.status}`,
    );
  }

  return res.json() as Promise<T>;
}

// ─── Teacher Profile ───────────────────────────────────────────────────────

export interface TeacherProfile {
  teacherId: number;
  firstName: string;
  lastName: string;
  assignedSubjects: string;
  email: string;
  isActive: boolean;
}

export interface DashboardStats {
  teacherId: number;
  firstName: string;
  lastName: string;
  assignedSubjects: string;
  totalStudents: number;
  pendingComplaints: number;
  activeNotices: number;
  achievementsAdded: number;
  todayAttendance: number;
  behaviorRemarks: number;
}

export const fetchMyProfile = () =>
  request<TeacherProfile>(`${API_BASE}/teacher/me`);

export const fetchDashboardStats = () =>
  request<DashboardStats>(`${API_BASE}/teacher/dashboard-stats`);

// ─── Students ─────────────────────────────────────────────────────────────

export interface StudentBasic {
  studentId: number;
  firstName: string;
  lastName: string;
  rollNumber: string;
  class: string;
}

export const fetchAllStudents = () =>
  request<StudentBasic[]>(`${API_BASE}/student`);

// ─── Attendance ───────────────────────────────────────────────────────────

export type AttendanceStatus = "Present" | "Absent" | "Leave";

export interface AttendanceRecord {
  attendanceId: number;
  date: string;
  status: AttendanceStatus;
  isLocked: boolean;
  student: { firstName: string; lastName: string; rollNumber: string };
}

export interface MarkAttendancePayload {
  studentId: number;
  teacherId: number;
  date: string; // ISO string
  status: number; // 0=Present, 1=Absent, 2=Leave  (matches backend enum)
}

export const fetchAttendance = (studentId?: number, date?: string) => {
  const params = new URLSearchParams();
  if (studentId) params.append("studentId", String(studentId));
  if (date) params.append("date", date);
  return request<AttendanceRecord[]>(
    `${API_BASE}/attendance?${params.toString()}`,
  );
};

export const markAttendance = (payload: MarkAttendancePayload) =>
  request(`${API_BASE}/attendance`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateAttendance = (id: number, status: number) =>
  request(`${API_BASE}/attendance/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });

// ─── Marks ────────────────────────────────────────────────────────────────

export interface MarkRecord {
  marksId: number;
  subject: string;
  exam: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  student: { firstName: string; lastName: string; rollNumber: string };
}

export interface AddMarksPayload {
  studentId: number;
  teacherId: number;
  subject: string;
  exam: string;
  marksObtained: number;
  totalMarks: number;
}

export const fetchMarks = (studentId?: number, subject?: string) => {
  const params = new URLSearchParams();
  if (studentId) params.append("studentId", String(studentId));
  if (subject) params.append("subject", subject);
  return request<MarkRecord[]>(`${API_BASE}/mark?${params.toString()}`);
};

export const addMark = (payload: AddMarksPayload) =>
  request(`${API_BASE}/mark`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateMark = (
  id: number,
  payload: { marksObtained: number; totalMarks?: number },
) =>
  request(`${API_BASE}/mark/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

// ─── Achievements / Certificates ─────────────────────────────────────────

export interface Achievement {
  achievementId: number;
  title: string;
  category: string;
  date: string;
  filePath?: string;
  student: { firstName: string; lastName: string; rollNumber: string };
}

export interface AddAchievementPayload {
  studentId: number;
  title: string;
  category: string;
  date: string;
  filePath?: string;
}

export const fetchAchievements = (studentId?: number, category?: string) => {
  const params = new URLSearchParams();
  if (studentId) params.append("studentId", String(studentId));
  if (category) params.append("category", category);
  return request<Achievement[]>(`${API_BASE}/achievement?${params.toString()}`);
};

export const addAchievement = (payload: AddAchievementPayload) =>
  request(`${API_BASE}/achievement`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const deleteAchievement = (id: number) =>
  request(`${API_BASE}/achievement/${id}`, { method: "DELETE" });

// ─── Behavior Remarks ─────────────────────────────────────────────────────

export interface BehaviorRemark {
  remarkId: number;
  remarkType: "Positive" | "Negative" | "Neutral";
  remarkText: string;
  date: string;
  student: { firstName: string; lastName: string };
  addedBy: { firstName: string; lastName: string };
}

export interface AddRemarkPayload {
  studentId: number;
  teacherId: number;
  remarkType: string;
  remarkText: string;
}

export const fetchRemarks = (studentId?: number, type?: string) => {
  const params = new URLSearchParams();
  if (studentId) params.append("studentId", String(studentId));
  if (type) params.append("type", type);
  return request<BehaviorRemark[]>(
    `${API_BASE}/behaviorremark?${params.toString()}`,
  );
};

export const addRemark = (payload: AddRemarkPayload) =>
  request(`${API_BASE}/behaviorremark`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

// ─── Notices / Announcements ──────────────────────────────────────────────

export interface Notice {
  noticeId: number;
  title: string;
  content: string;
  audience: number;
  targetClass?: string;
  postedAt: string;
  isActive: boolean;
  type: string;
  priority: string;
  postedBy: { username: string; role: string };
}

export interface PostNoticePayload {
  title: string;
  content: string;
  audience: number; // 0=SchoolWide,1=StudentsOnly,2=ParentsOnly,3=ClassSpecific
  type: number; // 0=Academic,1=Event,2=Holiday,3=Exam,4=General
  priority: number; // 0=Low,1=Medium,2=High,3=Urgent
  targetClass?: string;
}

export const fetchNotices = () => request<Notice[]>(`${API_BASE}/notice`);

export const postNotice = (payload: PostNoticePayload) =>
  request(`${API_BASE}/notice`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const deactivateNotice = (id: number) =>
  request(`${API_BASE}/notice/${id}/deactivate`, { method: "PATCH" });

// ─── Complaints ───────────────────────────────────────────────────────────

export interface Complaint {
  complaintId: number;
  category: string;
  description: string;
  status: string;
  remarks?: string;
  dateSubmitted: string;
  dateClosed?: string;
  submittedBy: { username: string; role: string };
  assignedTo?: { username: string; role: string };
}

export interface UpdateComplaintStatusPayload {
  status: number; // 0=Submitted,1=UnderReview,2=Resolved,3=Closed
  remarks?: string;
}

export const fetchComplaints = () =>
  request<Complaint[]>(`${API_BASE}/complaint`);

export const updateComplaintStatus = (
  id: number,
  payload: UpdateComplaintStatusPayload,
) =>
  request(`${API_BASE}/complaint/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
