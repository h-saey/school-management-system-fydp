import React, { useState, useEffect } from "react";
import {
  ClipboardList,
  BookOpen,
  Edit,
  Trash2,
  Search,
  X,
  Lock,
} from "lucide-react";
import {
  getAttendance,
  updateAttendance,
  lockAttendance,
  deleteAttendance,
  getMarks,
  updateMarks,
  deleteMarks,
} from "../../services/api";
import { useToast, ToastContainer } from "../../utils/useToast";

type AttendanceRecord = {
  attendanceId: number;
  date: string;
  status: string;
  isLocked: boolean;
  student: { firstName: string; lastName: string; rollNumber: string };
  markedBy: { firstName: string; lastName: string };
};

type MarkRecord = {
  marksId: number;
  subject: string;
  exam: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  student: { firstName: string; lastName: string; rollNumber: string };
  enteredBy: { firstName: string; lastName: string };
};

export function ManageAttendanceMarks() {
  const { toasts, success, error } = useToast();

  const [tab, setTab] = useState<"attendance" | "marks">("attendance");
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [fetching, setFetching] = useState(false);
  const [loading, setLoading] = useState(false);

  // Edit modals
  const [editAttendance, setEditAttendance] = useState<AttendanceRecord | null>(
    null,
  );
  const [editMark, setEditMark] = useState<MarkRecord | null>(null);
  const [attStatus, setAttStatus] = useState("");
  const [markObtained, setMarkObtained] = useState("");
  const [markTotal, setMarkTotal] = useState("");

  // ── Fetchers ─────────────────────────────────────────────
  const fetchAttendance = async () => {
    try {
      setFetching(true);
      setAttendance(await getAttendance());
    } catch (err: any) {
      error(err.message ?? "Failed to load attendance");
    } finally {
      setFetching(false);
    }
  };

  const fetchMarks = async () => {
    try {
      setFetching(true);
      setMarks(await getMarks());
    } catch (err: any) {
      error(err.message ?? "Failed to load marks");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (tab === "attendance") fetchAttendance();
    else fetchMarks();
  }, [tab]);

  // ── Open edit modals (pre-fill values) ───────────────────
  const openEditAttendance = (rec: AttendanceRecord) => {
    setEditAttendance(rec);
    setAttStatus(rec.status);
  };

  const openEditMark = (rec: MarkRecord) => {
    setEditMark(rec);
    setMarkObtained(String(rec.marksObtained));
    setMarkTotal(String(rec.totalMarks));
  };

  // ── Update Attendance ────────────────────────────────────
  const handleUpdateAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAttendance) return;
    setLoading(true);
    try {
      await updateAttendance(editAttendance.attendanceId, attStatus);
      success("Attendance updated");
      setEditAttendance(null);
      fetchAttendance();
    } catch (err: any) {
      error(err.message ?? "Failed to update attendance");
    } finally {
      setLoading(false);
    }
  };

  // ── Lock Attendance ──────────────────────────────────────
  const handleLock = async (id: number) => {
    if (
      !window.confirm(
        "Lock this attendance record? It cannot be edited after locking.",
      )
    )
      return;
    try {
      await lockAttendance(id);
      success("Attendance locked");
      fetchAttendance();
    } catch (err: any) {
      error(err.message ?? "Failed to lock attendance");
    }
  };

  // ── Delete Attendance ────────────────────────────────────
  const handleDeleteAttendance = async (id: number) => {
    if (!window.confirm("Delete this attendance record?")) return;
    try {
      await deleteAttendance(id);
      success("Attendance record deleted");
      setAttendance((prev) => prev.filter((a) => a.attendanceId !== id));
    } catch (err: any) {
      error(err.message ?? "Failed to delete attendance");
    }
  };

  // ── Update Marks ─────────────────────────────────────────
  const handleUpdateMark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMark) return;
    const obtained = parseFloat(markObtained);
    const total = parseFloat(markTotal);
    if (isNaN(obtained) || isNaN(total)) {
      error("Please enter valid numbers for marks");
      return;
    }
    if (obtained > total) {
      error("Marks obtained cannot exceed total marks");
      return;
    }
    setLoading(true);
    try {
      await updateMarks(editMark.marksId, obtained, total);
      success("Marks updated");
      setEditMark(null);
      fetchMarks();
    } catch (err: any) {
      error(err.message ?? "Failed to update marks");
    } finally {
      setLoading(false);
    }
  };

  // ── Delete Marks ─────────────────────────────────────────
  const handleDeleteMark = async (id: number) => {
    if (!window.confirm("Delete this mark record?")) return;
    try {
      await deleteMarks(id);
      success("Mark record deleted");
      setMarks((prev) => prev.filter((m) => m.marksId !== id));
    } catch (err: any) {
      error(err.message ?? "Failed to delete mark");
    }
  };

  // ── Status badge color ───────────────────────────────────
  const statusColor = (s: string) =>
    s === "Present"
      ? "border border-emerald-200/80 bg-emerald-50 text-emerald-800"
      : s === "Absent"
        ? "border border-red-200/80 bg-red-50 text-red-800"
        : "border border-amber-200/80 bg-amber-50 text-amber-900";

  // ── Filtered rows ────────────────────────────────────────
  const filteredAtt = attendance.filter(
    (a) =>
      `${a.student.firstName} ${a.student.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      a.student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredMarks = marks.filter(
    (m) =>
      `${m.student.firstName} ${m.student.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-w-0 space-y-8 sm:space-y-10">
      <ToastContainer toasts={toasts} />

      {/* HEADER */}
      <div className="space-y-2">
        <h1 className="text-balance text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Attendance & Marks
        </h1>
        <p className="max-w-2xl text-pretty text-sm leading-relaxed text-slate-600 sm:text-base">
          View and manage attendance records and exam marks
        </p>
      </div>

      {/* TAB SWITCHER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-4">
        <button
          type="button"
          onClick={() => {
            setTab("attendance");
            setSearchTerm("");
          }}
          className={`inline-flex items-center justify-center gap-2.5 rounded-xl px-6 py-3.5 text-sm font-semibold shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 sm:flex-1 sm:justify-center md:flex-none md:px-8 ${
            tab === "attendance"
              ? "bg-red-600 text-white shadow-red-600/20 hover:bg-red-700 active:bg-red-800"
              : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 active:bg-slate-100"
          }`}
        >
          <ClipboardList className="h-4 w-4 shrink-0" aria-hidden />{" "}
          Attendance
        </button>
        <button
          type="button"
          onClick={() => {
            setTab("marks");
            setSearchTerm("");
          }}
          className={`inline-flex items-center justify-center gap-2.5 rounded-xl px-6 py-3.5 text-sm font-semibold shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 sm:flex-1 sm:justify-center md:flex-none md:px-8 ${
            tab === "marks"
              ? "bg-red-600 text-white shadow-red-600/20 hover:bg-red-700 active:bg-red-800"
              : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 active:bg-slate-100"
          }`}
        >
          <BookOpen className="h-4 w-4 shrink-0" aria-hidden /> Marks
        </button>
      </div>

      {/* SEARCH */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              tab === "attendance"
                ? "Search by student name or roll number..."
                : "Search by student name or subject..."
            }
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-12 pr-4 text-sm text-slate-900 shadow-inner shadow-slate-900/5 placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/25 sm:py-3.5"
          />
        </div>
      </div>

      {/* ── EDIT ATTENDANCE MODAL ─────────────────────────── */}
      {editAttendance && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-6">
          <div className="max-h-[min(100dvh,640px)] w-full max-w-md overflow-y-auto rounded-t-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/15 sm:max-h-[90vh] sm:rounded-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 sm:px-8 sm:py-6">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                Edit Attendance
              </h2>
              <button
                type="button"
                onClick={() => setEditAttendance(null)}
                className="shrink-0 rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
              <p className="space-y-2 text-sm leading-relaxed text-slate-600">
                <span className="block">
                  Student:{" "}
                  <span className="font-semibold text-slate-900">
                    {editAttendance.student.firstName}{" "}
                    {editAttendance.student.lastName}
                  </span>
                </span>
                <span className="block">
                  Date:{" "}
                  <span className="font-semibold text-slate-900">
                    {new Date(editAttendance.date).toLocaleDateString()}
                  </span>
                </span>
              </p>
              <form onSubmit={handleUpdateAttendance} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Status <span className="font-normal text-red-600">*</span>
                  </label>
                  <select
                    value={attStatus}
                    onChange={(e) => setAttStatus(e.target.value)}
                    required
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Late">Late</option>
                  </select>
                </div>
                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex flex-1 items-center justify-center rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-red-600/25 transition-colors hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 active:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditAttendance(null)}
                    className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 active:bg-slate-100"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MARKS MODAL ──────────────────────────────── */}
      {editMark && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-6">
          <div className="max-h-[min(100dvh,720px)] w-full max-w-md overflow-y-auto rounded-t-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/15 sm:max-h-[90vh] sm:rounded-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 sm:px-8 sm:py-6">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                Edit Marks
              </h2>
              <button
                type="button"
                onClick={() => setEditMark(null)}
                className="shrink-0 rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
              <p className="space-y-2 text-sm leading-relaxed text-slate-600">
                <span className="block">
                  Student:{" "}
                  <span className="font-semibold text-slate-900">
                    {editMark.student.firstName} {editMark.student.lastName}
                  </span>
                </span>
                <span className="block">
                  Subject:{" "}
                  <span className="font-semibold text-slate-900">
                    {editMark.subject}
                  </span>{" "}
                  <span className="text-slate-400">|</span> Exam:{" "}
                  <span className="font-semibold text-slate-900">
                    {editMark.exam}
                  </span>
                </span>
              </p>
              <form onSubmit={handleUpdateMark} className="space-y-6">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Marks Obtained{" "}
                      <span className="font-normal text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.5"
                      value={markObtained}
                      onChange={(e) => setMarkObtained(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Total Marks{" "}
                      <span className="font-normal text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="0.5"
                      value={markTotal}
                      onChange={(e) => setMarkTotal(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex flex-1 items-center justify-center rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-red-600/25 transition-colors hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 active:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMark(null)}
                    className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 active:bg-slate-100"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── ATTENDANCE TABLE ───────────────────────────────── */}
      {tab === "attendance" && (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:gap-4 sm:px-8 sm:py-6">
            <ClipboardList
              className="h-6 w-6 shrink-0 text-red-600 sm:h-7 sm:w-7"
              aria-hidden
            />
            <h2 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
              Attendance Records ({filteredAtt.length})
            </h2>
          </div>
          {fetching ? (
            <div className="px-5 py-14 text-center text-sm font-medium text-slate-500 sm:px-8 sm:py-16">
              Loading attendance...
            </div>
          ) : filteredAtt.length === 0 ? (
            <div className="px-5 py-14 text-center text-sm text-slate-500 sm:px-8 sm:py-16">
              No attendance records found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead className="bg-slate-50/90">
                  <tr>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600 lg:px-8 lg:py-5">
                      Student
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600 lg:px-8 lg:py-5">
                      Roll No
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600 lg:px-8 lg:py-5">
                      Date
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600 lg:px-8 lg:py-5">
                      Status
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600 lg:px-8 lg:py-5">
                      Marked By
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600 lg:px-8 lg:py-5">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAtt.map((a) => (
                    <tr
                      key={a.attendanceId}
                      className="transition-colors hover:bg-slate-50/80"
                    >
                      <td className="px-5 py-4 text-sm font-semibold text-slate-900 lg:px-8 lg:py-5">
                        {a.student.firstName} {a.student.lastName}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-700 lg:px-8 lg:py-5">
                        {a.student.rollNumber}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-700 lg:px-8 lg:py-5">
                        {new Date(a.date).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 lg:px-8 lg:py-5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusColor(a.status)}`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-700 lg:px-8 lg:py-5">
                        {a.markedBy.firstName} {a.markedBy.lastName}
                      </td>
                      <td className="px-5 py-4 lg:px-8 lg:py-5">
                        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                          {!a.isLocked && (
                            <>
                              <button
                                type="button"
                                onClick={() => openEditAttendance(a)}
                                className="rounded-xl p-2.5 text-blue-700 transition-colors hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:bg-blue-100/60"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleLock(a.attendanceId)}
                                className="rounded-xl p-2.5 text-amber-700 transition-colors hover:bg-amber-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 active:bg-amber-100/60"
                                title="Lock"
                              >
                                <Lock className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          {a.isLocked && (
                            <span className="inline-flex rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500">
                              Locked
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteAttendance(a.attendanceId)
                            }
                            className="rounded-xl p-2.5 text-red-700 transition-colors hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 active:bg-red-100/60"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── MARKS TABLE ───────────────────────────────────── */}
      {tab === "marks" && (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:gap-4 sm:px-8 sm:py-6">
            <BookOpen
              className="h-6 w-6 shrink-0 text-red-600 sm:h-7 sm:w-7"
              aria-hidden
            />
            <h2 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
              Marks Records ({filteredMarks.length})
            </h2>
          </div>
          {fetching ? (
            <div className="px-5 py-14 text-center text-sm font-medium text-slate-500 sm:px-8 sm:py-16">
              Loading marks...
            </div>
          ) : filteredMarks.length === 0 ? (
            <div className="px-5 py-14 text-center text-sm text-slate-500 sm:px-8 sm:py-16">
              No marks records found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-slate-50/90">
                  <tr>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600 lg:px-8 lg:py-5">
                      Student
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600 lg:px-8 lg:py-5">
                      Subject
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600 lg:px-8 lg:py-5">
                      Exam
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600 lg:px-8 lg:py-5">
                      Marks
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600 lg:px-8 lg:py-5">
                      %
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600 lg:px-8 lg:py-5">
                      Entered By
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600 lg:px-8 lg:py-5">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMarks.map((m) => (
                    <tr
                      key={m.marksId}
                      className="transition-colors hover:bg-slate-50/80"
                    >
                      <td className="px-5 py-4 text-sm font-semibold text-slate-900 lg:px-8 lg:py-5">
                        {m.student.firstName} {m.student.lastName}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-700 lg:px-8 lg:py-5">
                        {m.subject}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-700 lg:px-8 lg:py-5">
                        {m.exam}
                      </td>
                      <td className="px-5 py-4 text-sm tabular-nums text-slate-700 lg:px-8 lg:py-5">
                        {m.marksObtained}/{m.totalMarks}
                      </td>
                      <td className="px-5 py-4 lg:px-8 lg:py-5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            m.percentage >= 75
                              ? "border border-emerald-200/80 bg-emerald-50 text-emerald-800"
                              : m.percentage >= 50
                                ? "border border-amber-200/80 bg-amber-50 text-amber-900"
                                : "border border-red-200/80 bg-red-50 text-red-800"
                          }`}
                        >
                          {m.percentage.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-700 lg:px-8 lg:py-5">
                        {m.enteredBy.firstName} {m.enteredBy.lastName}
                      </td>
                      <td className="px-5 py-4 lg:px-8 lg:py-5">
                        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                          <button
                            type="button"
                            onClick={() => openEditMark(m)}
                            className="rounded-xl p-2.5 text-blue-700 transition-colors hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:bg-blue-100/60"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMark(m.marksId)}
                            className="rounded-xl p-2.5 text-red-700 transition-colors hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 active:bg-red-100/60"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// import React, { useState } from 'react';
// import { Calendar, FileText, Edit, Download } from 'lucide-react';

// export function ManageAttendanceMarks() {
//   const [activeTab, setActiveTab] = useState<'attendance' | 'marks'>('attendance');

//   const attendanceRecords = [
//     { class: 'Class 10-A', date: '2025-12-11', present: 42, absent: 3, percentage: '93.3%', teacher: 'Dr. Singh' },
//     { class: 'Class 9-B', date: '2025-12-11', present: 39, absent: 3, percentage: '92.9%', teacher: 'Mr. Kumar' },
//     { class: 'Class 8-C', date: '2025-12-11', present: 38, absent: 2, percentage: '95.0%', teacher: 'Mrs. Sharma' }
//   ];

//   const marksRecords = [
//     { class: 'Class 10-A', exam: 'Mid-Term', subject: 'Mathematics', avgMarks: 85, teacher: 'Dr. Singh', status: 'Completed' },
//     { class: 'Class 9-B', exam: 'Mid-Term', subject: 'Science', avgMarks: 82, teacher: 'Mr. Kumar', status: 'Completed' },
//     { class: 'Class 10-A', exam: 'Unit Test 2', subject: 'English', avgMarks: 78, teacher: 'Mrs. Sharma', status: 'Pending' }
//   ];

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-gray-900 mb-2">Manage Attendance & Marks</h1>
//         <p className="text-gray-600">Override entries and generate school-wide reports</p>
//       </div>

//       <div className="bg-white rounded-xl shadow-sm p-2">
//         <div className="flex gap-2">
//           <button
//             onClick={() => setActiveTab('attendance')}
//             className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
//               activeTab === 'attendance' ? 'bg-red-600 text-white' : 'text-gray-700 hover:bg-gray-100'
//             }`}
//           >
//             <Calendar className="w-4 h-4" />
//             Attendance Records
//           </button>
//           <button
//             onClick={() => setActiveTab('marks')}
//             className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
//               activeTab === 'marks' ? 'bg-red-600 text-white' : 'text-gray-700 hover:bg-gray-100'
//             }`}
//           >
//             <FileText className="w-4 h-4" />
//             Marks Records
//           </button>
//         </div>
//       </div>

//       {activeTab === 'attendance' && (
//         <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//           <div className="p-6 border-b flex items-center justify-between">
//             <h2 className="text-gray-900">Attendance Records</h2>
//             <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
//               <Download className="w-4 h-4" />
//               Export Report
//             </button>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-4 text-left text-gray-700">Class</th>
//                   <th className="px-6 py-4 text-left text-gray-700">Date</th>
//                   <th className="px-6 py-4 text-left text-gray-700">Present</th>
//                   <th className="px-6 py-4 text-left text-gray-700">Absent</th>
//                   <th className="px-6 py-4 text-left text-gray-700">Percentage</th>
//                   <th className="px-6 py-4 text-left text-gray-700">Teacher</th>
//                   <th className="px-6 py-4 text-left text-gray-700">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {attendanceRecords.map((record, index) => (
//                   <tr key={index} className="hover:bg-gray-50">
//                     <td className="px-6 py-4 text-gray-900">{record.class}</td>
//                     <td className="px-6 py-4 text-gray-700">{record.date}</td>
//                     <td className="px-6 py-4 text-green-600">{record.present}</td>
//                     <td className="px-6 py-4 text-red-600">{record.absent}</td>
//                     <td className="px-6 py-4 text-gray-700">{record.percentage}</td>
//                     <td className="px-6 py-4 text-gray-700">{record.teacher}</td>
//                     <td className="px-6 py-4">
//                       <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
//                         <Edit className="w-4 h-4" />
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {activeTab === 'marks' && (
//         <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//           <div className="p-6 border-b flex items-center justify-between">
//             <h2 className="text-gray-900">Marks Records</h2>
//             <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
//               <Download className="w-4 h-4" />
//               Export Report
//             </button>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-4 text-left text-gray-700">Class</th>
//                   <th className="px-6 py-4 text-left text-gray-700">Exam</th>
//                   <th className="px-6 py-4 text-left text-gray-700">Subject</th>
//                   <th className="px-6 py-4 text-left text-gray-700">Avg Marks</th>
//                   <th className="px-6 py-4 text-left text-gray-700">Teacher</th>
//                   <th className="px-6 py-4 text-left text-gray-700">Status</th>
//                   <th className="px-6 py-4 text-left text-gray-700">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {marksRecords.map((record, index) => (
//                   <tr key={index} className="hover:bg-gray-50">
//                     <td className="px-6 py-4 text-gray-900">{record.class}</td>
//                     <td className="px-6 py-4 text-gray-700">{record.exam}</td>
//                     <td className="px-6 py-4 text-gray-700">{record.subject}</td>
//                     <td className="px-6 py-4 text-gray-700">{record.avgMarks}%</td>
//                     <td className="px-6 py-4 text-gray-700">{record.teacher}</td>
//                     <td className="px-6 py-4">
//                       <span className={`px-3 py-1 rounded-full text-sm ${
//                         record.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
//                       }`}>
//                         {record.status}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4">
//                       <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
//                         <Edit className="w-4 h-4" />
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
