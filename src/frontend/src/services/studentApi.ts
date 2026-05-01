// ============================================================
//  studentApi.ts — All API calls for Student features
//  Uses Bearer JWT from localStorage
// ============================================================

export const API_BASE = "http://localhost:5036/api";

const getToken = (): string => localStorage.getItem("token") ?? "";

const authHeaders = (): HeadersInit => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// Generic request helper — throws on non-ok responses
async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers ?? {}) },
  });

  if (res.status === 401) throw new Error("Unauthorized. Please log in again.");
  if (res.status === 403)
    throw new Error("Forbidden. You do not have permission.");
  if (res.status === 404) throw new Error("Resource not found.");

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    const msg = data?.message ?? data?.title ?? `Server error (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}

// ── Types ────────────────────────────────────────────────────────────────

export interface StudentProfile {
  studentId: number;
  firstName: string;
  lastName: string;
  class: string;
  section: string;
  rollNumber: string;
  email: string;
  isActive: boolean;
}

export interface AttendanceRecord {
  attendanceId: number;
  date: string; // "YYYY-MM-DD"
  status: "Present" | "Absent" | "Late";
  isLocked: boolean;
}

export interface MarkRecord {
  marksId: number;
  subject: string;
  exam: string; // e.g. "Midterm", "Final"
  marksObtained: number;
  totalMarks: number;
  percentage: number;
}

export interface AchievementRecord {
  achievementId: number;
  title: string;
  category: string; // "Academic" | "Sports" | "Arts"
  date: string;
  filePath?: string;
}

export interface BehaviorRemarkRecord {
  remarkId: number;
  remarkType: "Positive" | "Negative" | "Neutral";
  remarkText: string;
  date: string;
}

export interface FeeRecord {
  feeId: number;
  term: string;
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  status: "Unpaid" | "Partial" | "Paid" | "Overdue";
}

export interface NoticeRecord {
  noticeId: number;
  title: string;
  content: string;
  audience: number;
  type: string;
  priority: string;
  postedAt: string;
  isActive: boolean;
}

export interface ComplaintRecord {
  complaintId: number;
  category: string;
  description: string;
  status: string;
  remarks?: string;
  dateSubmitted: string;
  dateClosed?: string;
}

export interface PortfolioRecord {
  portfolioId: number;
  studentId: number;
  attendanceSummary?: string;
  marksSummary?: string;
  achievementsSummary?: string;
  behaviorSummary?: string;
  generatedOn: string;
  lastUpdated: string;
}

export interface NotificationRecord {
  notificationId: number;
  type: string;
  content: string;
  dateSent: string;
  status: "Unread" | "Read" | "Archived";
}

// ── Student Profile ───────────────────────────────────────────────────────

export const getMyProfile = () =>
  request<StudentProfile>(`${API_BASE}/student/me`);

// ── Attendance ────────────────────────────────────────────────────────────

export const getMyAttendance = (month?: string) => {
  const params = new URLSearchParams();
  if (month) params.append("month", month);
  return request<AttendanceRecord[]>(
    `${API_BASE}/attendance/my?${params.toString()}`,
  );
};

// ── Marks ─────────────────────────────────────────────────────────────────

export const getMyMarks = (subject?: string, exam?: string) => {
  const params = new URLSearchParams();
  if (subject) params.append("subject", subject);
  if (exam) params.append("exam", exam);
  return request<MarkRecord[]>(`${API_BASE}/mark/my?${params.toString()}`);
};

// ── Achievements ──────────────────────────────────────────────────────────

export const getMyAchievements = (category?: string) => {
  const params = new URLSearchParams();
  if (category) params.append("category", category);
  return request<AchievementRecord[]>(
    `${API_BASE}/achievement/my?${params.toString()}`,
  );
};

// ── Behavior Remarks ──────────────────────────────────────────────────────

export const getMyBehaviorRemarks = () =>
  request<BehaviorRemarkRecord[]>(`${API_BASE}/behaviorremark/my`);

// ── Fees ──────────────────────────────────────────────────────────────────

export const getMyFees = () => request<FeeRecord[]>(`${API_BASE}/fee/my`);

// ── Portfolio ─────────────────────────────────────────────────────────────

export const getMyPortfolio = () =>
  request<PortfolioRecord>(`${API_BASE}/studentportfolio/my`);

// ── Notices ───────────────────────────────────────────────────────────────

export const getNoticesForStudent = () =>
  request<NoticeRecord[]>(`${API_BASE}/notice`);

// ── Complaints ────────────────────────────────────────────────────────────

export const getMyComplaints = () =>
  request<ComplaintRecord[]>(`${API_BASE}/complaint`);

export const submitComplaint = (body: {
  category: string;
  description: string;
}) =>
  request<any>(`${API_BASE}/complaint`, {
    method: "POST",
    body: JSON.stringify(body),
  });

// ── Notifications ─────────────────────────────────────────────────────────

export const getMyNotifications = () =>
  request<NotificationRecord[]>(`${API_BASE}/notification/my`);

export const markNotificationRead = (id: number) =>
  request<any>(`${API_BASE}/notification/${id}/read`, { method: "PATCH" });
