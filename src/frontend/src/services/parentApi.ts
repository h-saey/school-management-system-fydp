// ============================================================
//  parentApi.ts — All API calls for Parent features
//  Uses Bearer JWT from localStorage
// ============================================================

export const API_BASE = "http://localhost:5036/api";

const getToken = (): string => localStorage.getItem("token") ?? "";

const authHeaders = (): HeadersInit => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

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
    throw new Error(
      data?.message ?? data?.title ?? `Server error (${res.status})`,
    );
  }
  return data as T;
}

// ── Types ────────────────────────────────────────────────────────────────

export interface LinkedStudent {
  studentId: number;
  firstName: string;
  lastName: string;
  class: string;
  section: string;
  rollNumber: string;
  email: string;
}

export interface AttendanceRecord {
  attendanceId: number;
  date: string;
  status: "Present" | "Absent" | "Late";
  isLocked: boolean;
}

export interface MarkRecord {
  marksId: number;
  subject: string;
  exam: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
}

export interface FeeRecord {
  feeId: number;
  term: string;
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  status: "Unpaid" | "Partial" | "Paid" | "Overdue";
}

export interface BehaviorRemark {
  remarkId: number;
  remarkType: "Positive" | "Negative" | "Neutral";
  remarkText: string;
  date: string;
  teacher: { firstName: string; lastName: string };
}

export interface ComplaintRecord {
  complaintId: number;
  category: string;
  description: string;
  status: string;
  remarks?: string;
  dateSubmitted: string;
  dateClosed?: string;
  submittedBy: { username: string };
}

export interface NoticeRecord {
  noticeId: number;
  title: string;
  content: string;
  type: string;
  priority: string;
  audience: number;
  postedAt: string;
  isActive: boolean;
  postedBy: { username: string };
}

export interface MessageRecord {
  messageId: number;
  content: string;
  sentAt: string;
  isRead: boolean;
  senderUserId: number;
  receiverUserId: number;
  sender: { username: string; role: string };
  receiver: { username: string; role: string };
}

export interface TeacherBasic {
  teacherId: number;
  firstName: string;
  lastName: string;
  assignedSubjects: string;
  userId: number;
}

// ── Parent's linked student ───────────────────────────────────────────────

export const getLinkedStudent = () =>
  request<LinkedStudent>(`${API_BASE}/parent/my-student`);

// ── Attendance ────────────────────────────────────────────────────────────

export const getStudentAttendance = (studentId: number) =>
  //request<AttendanceRecord[]>(`${API_BASE}/attendance?studentId=${studentId}`);
  request<AttendanceRecord[]>(`${API_BASE}/attendance/student/${studentId}`);

// ── Marks ─────────────────────────────────────────────────────────────────

export const getStudentMarks = (studentId: number) =>
  //request<MarkRecord[]>(`${API_BASE}/mark?studentId=${studentId}`);
  request<MarkRecord[]>(`${API_BASE}/mark/student/${studentId}`);
// ── Fees ──────────────────────────────────────────────────────────────────

export const getStudentFees = (studentId: number) =>
  //request<FeeRecord[]>(`${API_BASE}/fee?studentId=${studentId}`);
  request<FeeRecord[]>(`${API_BASE}/fee/student/${studentId}`);

// ── Behavior ──────────────────────────────────────────────────────────────

export const getStudentBehavior = (studentId: number) =>
  // request<BehaviorRemark[]>(`${API_BASE}/behaviorremark?studentId=${studentId}`);
  request<BehaviorRemark[]>(`${API_BASE}/behaviorremark/student/${studentId}`);
// ── Complaints ────────────────────────────────────────────────────────────

export const getStudentComplaints = (studentId: number) =>
  request<ComplaintRecord[]>(`${API_BASE}/complaint?studentId=${studentId}`);
//request<ComplaintRecord[]>(`${API_BASE}/complaint`);
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
// ── Notices ───────────────────────────────────────────────────────────────

export const getNotices = () => request<NoticeRecord[]>(`${API_BASE}/notice`);

// ── Messages ──────────────────────────────────────────────────────────────

export const getMessages = (withUserId: number) =>
  request<MessageRecord[]>(`${API_BASE}/message/conversation/${withUserId}`);

export const sendMessage = (receiverUserId: number, content: string) =>
  request<MessageRecord>(`${API_BASE}/message`, {
    method: "POST",
    body: JSON.stringify({ receiverUserId, content }),
  });

// ── Teachers (for messaging) ──────────────────────────────────────────────

export const getTeachers = () => request<TeacherBasic[]>(`${API_BASE}/teacher`);
