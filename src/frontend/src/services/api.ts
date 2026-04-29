// ============================================================
//  api.ts — Central API service for SMS-FYP Frontend
//  All endpoints use API_BASE, JWT token, and typed responses
// ============================================================

export const API_BASE = "http://localhost:5036/api";

const getToken = (): string => localStorage.getItem("token") ?? "";

const authHeaders = (): HeadersInit => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// ── Generic helper — throws on non-ok responses ─────────────
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

// ══════════════════════════════════════════════════════════════
// STUDENTS
// ══════════════════════════════════════════════════════════════
export const getStudents = () => request<any[]>(`${API_BASE}/student`);
export const createStudent = (body: object) =>
  request<any>(`${API_BASE}/student`, {
    method: "POST",
    body: JSON.stringify(body),
  });
export const updateStudent = (id: number, body: object) =>
  request<any>(`${API_BASE}/student/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
export const deleteStudent = (id: number) =>
  request<any>(`${API_BASE}/student/${id}`, { method: "DELETE" });

// ══════════════════════════════════════════════════════════════
// TEACHERS
// ══════════════════════════════════════════════════════════════
export const getTeachers = () => request<any[]>(`${API_BASE}/teacher`);
export const createTeacher = (body: object) =>
  request<any>(`${API_BASE}/teacher`, {
    method: "POST",
    body: JSON.stringify(body),
  });
export const updateTeacher = (id: number, body: object) =>
  request<any>(`${API_BASE}/teacher/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
export const deleteTeacher = (id: number) =>
  request<any>(`${API_BASE}/teacher/${id}`, { method: "DELETE" });

// ══════════════════════════════════════════════════════════════
// USERS
// ══════════════════════════════════════════════════════════════
export const getUsers = () => request<any[]>(`${API_BASE}/user`);
export const createUser = (body: object) =>
  request<any>(`${API_BASE}/user`, {
    method: "POST",
    body: JSON.stringify(body),
  });
export const updateUser = (id: number, body: object) =>
  request<any>(`${API_BASE}/user/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
export const deleteUser = (id: number) =>
  request<any>(`${API_BASE}/user/${id}`, { method: "DELETE" });
export const toggleUserStatus = (id: number) =>
  request<any>(`${API_BASE}/user/${id}/toggle-status`, { method: "PATCH" });

// ══════════════════════════════════════════════════════════════
// ATTENDANCE  (fixed: was /mark, now /attendance)
// ══════════════════════════════════════════════════════════════
export const getAttendance = () => request<any[]>(`${API_BASE}/attendance`);
export const updateAttendance = (id: number, status: string) =>
  request<any>(`${API_BASE}/attendance/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
export const lockAttendance = (id: number) =>
  request<any>(`${API_BASE}/attendance/${id}/lock`, { method: "PATCH" });
export const deleteAttendance = (id: number) =>
  request<any>(`${API_BASE}/attendance/${id}`, { method: "DELETE" });

// ══════════════════════════════════════════════════════════════
// MARKS  (fixed: was /mark, now /marks)
// ══════════════════════════════════════════════════════════════
export const getMarks = () => request<any[]>(`${API_BASE}/mark`);
export const updateMarks = (
  id: number,
  marksObtained: number,
  totalMarks?: number,
) =>
  request<any>(`${API_BASE}/mark/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      marksObtained,
      ...(totalMarks !== undefined && { totalMarks }),
    }),
  });
export const deleteMarks = (id: number) =>
  request<any>(`${API_BASE}/mark/${id}`, { method: "DELETE" });

// ══════════════════════════════════════════════════════════════
// FEES
// ═════════════════════════════════════════════════════════════════
export const getFees = () => request<any[]>(`${API_BASE}/fee`);
export const createFee = (body: object) =>
  request<any>(`${API_BASE}/fee`, {
    method: "POST",
    body: JSON.stringify(body),
  });
export const updateFeePayment = (id: number, paidAmount: number) =>
  request<any>(`${API_BASE}/fee/${id}/payment`, {
    method: "PATCH",
    body: JSON.stringify({ paidAmount }),
  });
export const deleteFee = (id: number) =>
  request<any>(`${API_BASE}/fee/${id}`, { method: "DELETE" });

// ══════════════════════════════════════════════════════════════
// COMPLAINTS
// ══════════════════════════════════════════════════════════════
export const getComplaints = () => request<any[]>(`${API_BASE}/complaint`);
export const updateComplaintStatus = (
  id: number,
  status: string,
  remarks?: string,
) =>
  request<any>(`${API_BASE}/complaint/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, remarks }),
  });
export const assignComplaint = (id: number, assignedToUserId: number) =>
  request<any>(`${API_BASE}/complaint/${id}/assign`, {
    method: "PATCH",
    body: JSON.stringify({ assignedToUserId }),
  });
export const deleteComplaint = (id: number) =>
  request<any>(`${API_BASE}/complaint/${id}`, { method: "DELETE" });

// ══════════════════════════════════════════════════════════════
// NOTICES
// ══════════════════════════════════════════════════════════════
export const getNotices = () => request<any[]>(`${API_BASE}/notice`);
export const createNotice = (body: object) =>
  request<any>(`${API_BASE}/notice`, {
    method: "POST",
    body: JSON.stringify(body),
  });
export const updateNotice = (id: number, body: object) =>
  request<any>(`${API_BASE}/notice/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
export const deleteNotice = (id: number) =>
  request<any>(`${API_BASE}/notice/${id}`, { method: "DELETE" });
export const deactivateNotice = (id: number) =>
  request<any>(`${API_BASE}/notice/${id}/deactivate`, { method: "PATCH" });

// ══════════════════════════════════════════════════════════════
// REPORTS
// ══════════════════════════════════════════════════════════════
export const getReports = () => request<any[]>(`${API_BASE}/report`);
export const deleteReport = (id: number) =>
  request<any>(`${API_BASE}/report/${id}`, { method: "DELETE" });

export const generateReport = async (
  type: string,
  params: Record<string, string>,
) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/report/${type}?${query}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `Failed to generate ${type} report`);
  }
  return res.blob();
};

export const downloadReport = async (filePath: string): Promise<Blob> => {
  const res = await fetch(
    `${API_BASE}/report/download?path=${encodeURIComponent(filePath)}`,
    { headers: { Authorization: `Bearer ${getToken()}` } },
  );
  if (!res.ok) throw new Error("Download failed");
  return res.blob();
};

// ══════════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════════
export const getDashboardStats = () =>
  request<any>(`${API_BASE}/admin/dashboard-stats`);

// export const API_BASE = "http://localhost:5036/api";

// const getToken = () => localStorage.getItem("token");

// export const updateAttendance = async (id: number, status: string) => {
//   const res = await fetch(`${API_BASE}/attendance/${id}`, {
//     method: "PUT",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${getToken()}`,
//     },
//     body: JSON.stringify({
//       status,
//     }),
//   });

//   if (!res.ok) {
//     throw new Error("Failed to update attendance");
//   }

//   return await res.json();
// };

// export const updateMarks = async (id: number, marksObtained: number) => {
//   const res = await fetch(`${API_BASE}/mark/${id}`, {
//     method: "PUT",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${getToken()}`,
//     },
//     body: JSON.stringify({
//       marksObtained,
//     }),
//   });

//   if (!res.ok) {
//     throw new Error("Failed to update marks");
//   }

//   return await res.json();
// };
