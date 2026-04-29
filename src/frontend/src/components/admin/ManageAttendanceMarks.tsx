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
      ? "bg-green-100 text-green-700"
      : s === "Absent"
        ? "bg-red-100 text-red-700"
        : "bg-yellow-100 text-yellow-700";

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
    <div className="space-y-6">
      <ToastContainer toasts={toasts} />

      {/* HEADER */}
      <div>
        <h1 className="text-gray-900 mb-2">Attendance & Marks</h1>
        <p className="text-gray-600">
          View and manage attendance records and exam marks
        </p>
      </div>

      {/* TAB SWITCHER */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            setTab("attendance");
            setSearchTerm("");
          }}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium transition-colors ${
            tab === "attendance"
              ? "bg-red-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
          }`}
        >
          <ClipboardList className="w-4 h-4" /> Attendance
        </button>
        <button
          onClick={() => {
            setTab("marks");
            setSearchTerm("");
          }}
          className={`flex items-center gap-2 px-10 py-6 rounded-lg font-medium transition-colors ${
            tab === "marks"
              ? "bg-red-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
          }`}
        >
          <BookOpen className="w-4 h-4" /> Marks
        </button>
      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              tab === "attendance"
                ? "Search by student name or roll number..."
                : "Search by student name or subject..."
            }
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* ── EDIT ATTENDANCE MODAL ─────────────────────────── */}
      {editAttendance && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-gray-900">Edit Attendance</h2>
              <button
                onClick={() => setEditAttendance(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Student:{" "}
              <span className="font-medium text-gray-900">
                {editAttendance.student.firstName}{" "}
                {editAttendance.student.lastName}
              </span>
              <br />
              Date:{" "}
              <span className="font-medium text-gray-900">
                {new Date(editAttendance.date).toLocaleDateString()}
              </span>
            </p>
            <form onSubmit={handleUpdateAttendance} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1 text-sm">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={attStatus}
                  onChange={(e) => setAttStatus(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditAttendance(null)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT MARKS MODAL ──────────────────────────────── */}
      {editMark && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-gray-900">Edit Marks</h2>
              <button
                onClick={() => setEditMark(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Student:{" "}
              <span className="font-medium text-gray-900">
                {editMark.student.firstName} {editMark.student.lastName}
              </span>
              <br />
              Subject:{" "}
              <span className="font-medium text-gray-900">
                {editMark.subject}
              </span>{" "}
              | Exam:{" "}
              <span className="font-medium text-gray-900">{editMark.exam}</span>
            </p>
            <form onSubmit={handleUpdateMark} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1 text-sm">
                    Marks Obtained <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.5"
                    value={markObtained}
                    onChange={(e) => setMarkObtained(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1 text-sm">
                    Total Marks <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.5"
                    value={markTotal}
                    onChange={(e) => setMarkTotal(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditMark(null)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ATTENDANCE TABLE ───────────────────────────────── */}
      {tab === "attendance" && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b flex items-center gap-3">
            <ClipboardList className="w-6 h-6 text-red-600" />
            <h2 className="text-gray-900">
              Attendance Records ({filteredAtt.length})
            </h2>
          </div>
          {fetching ? (
            <div className="p-8 text-center text-gray-500">
              Loading attendance...
            </div>
          ) : filteredAtt.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No attendance records found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-gray-700">
                      Student
                    </th>
                    <th className="px-6 py-4 text-left text-gray-700">
                      Roll No
                    </th>
                    <th className="px-6 py-4 text-left text-gray-700">Date</th>
                    <th className="px-6 py-4 text-left text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-gray-700">
                      Marked By
                    </th>
                    <th className="px-6 py-4 text-left text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAtt.map((a) => (
                    <tr key={a.attendanceId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900 font-medium">
                        {a.student.firstName} {a.student.lastName}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {a.student.rollNumber}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {new Date(a.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(a.status)}`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {a.markedBy.firstName} {a.markedBy.lastName}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {!a.isLocked && (
                            <>
                              <button
                                onClick={() => openEditAttendance(a)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleLock(a.attendanceId)}
                                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                title="Lock"
                              >
                                <Lock className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {a.isLocked && (
                            <span className="px-2 py-1 text-xs text-gray-400 bg-gray-100 rounded-lg">
                              Locked
                            </span>
                          )}
                          <button
                            onClick={() =>
                              handleDeleteAttendance(a.attendanceId)
                            }
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
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
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-red-600" />
            <h2 className="text-gray-900">
              Marks Records ({filteredMarks.length})
            </h2>
          </div>
          {fetching ? (
            <div className="p-8 text-center text-gray-500">
              Loading marks...
            </div>
          ) : filteredMarks.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No marks records found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-gray-700">
                      Student
                    </th>
                    <th className="px-6 py-4 text-left text-gray-700">
                      Subject
                    </th>
                    <th className="px-6 py-4 text-left text-gray-700">Exam</th>
                    <th className="px-6 py-4 text-left text-gray-700">Marks</th>
                    <th className="px-6 py-4 text-left text-gray-700">%</th>
                    <th className="px-6 py-4 text-left text-gray-700">
                      Entered By
                    </th>
                    <th className="px-6 py-4 text-left text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMarks.map((m) => (
                    <tr key={m.marksId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900 font-medium">
                        {m.student.firstName} {m.student.lastName}
                      </td>
                      <td className="px-6 py-4 text-gray-700">{m.subject}</td>
                      <td className="px-6 py-4 text-gray-700">{m.exam}</td>
                      <td className="px-6 py-4 text-gray-700">
                        {m.marksObtained}/{m.totalMarks}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            m.percentage >= 75
                              ? "bg-green-100 text-green-700"
                              : m.percentage >= 50
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {m.percentage.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {m.enteredBy.firstName} {m.enteredBy.lastName}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditMark(m)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMark(m.marksId)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
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
