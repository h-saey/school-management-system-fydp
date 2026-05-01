// FILE: src/components/teacher/MarkAttendance.tsx
// ACTION: REPLACE existing file entirely

import React, { useEffect, useState } from "react";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Save,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import {
  fetchAllStudents,
  fetchAttendance,
  markAttendance,
  updateAttendance,
  fetchMyProfile,
  StudentBasic,
  AttendanceRecord,
} from "../../services/teacherApi";

// Backend enum: 0=Present, 1=Absent, 2=Leave
const STATUS_MAP: Record<string, number> = { present: 0, absent: 1, leave: 2 };
const STATUS_LABEL: Record<number, string> = {
  0: "present",
  1: "absent",
  2: "leave",
};

interface StudentRow {
  studentId: number;
  rollNumber: string;
  name: string;
  status: "present" | "absent" | "leave";
  existingAttendanceId?: number; // if already marked for this date
}

export function MarkAttendance() {
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load teacher profile once
  useEffect(() => {
    fetchMyProfile()
      .then((p) => setTeacherId(p.teacherId))
      .catch(() =>
        setError("Could not load teacher profile. Are you logged in?"),
      );
  }, []);

  // Load students + existing attendance whenever date changes
  useEffect(() => {
    if (!teacherId) return;
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    Promise.all([fetchAllStudents(), fetchAttendance(undefined, selectedDate)])
      .then(([allStudents, existingRecords]) => {
        const existingMap: Record<number, AttendanceRecord> = {};
        existingRecords.forEach((r) => {
          // Match by student name since record has nested student object
          // We'll key by attendanceId later; need studentId from allStudents
        });

        // Build rows
        const rows: StudentRow[] = allStudents.map((s) => {
          // Find existing record for this student on this date
          const existing = existingRecords.find(
            (r) =>
              `${r.student.firstName} ${r.student.lastName}`.toLowerCase() ===
              `${s.firstName} ${s.lastName}`.toLowerCase(),
          );
          return {
            studentId: s.studentId,
            rollNumber: s.rollNumber,
            name: `${s.firstName} ${s.lastName}`,
            status: existing
              ? (STATUS_LABEL[existing.status as unknown as number] as
                  | "present"
                  | "absent"
                  | "leave")
              : "present",
            existingAttendanceId: existing?.attendanceId,
          };
        });
        setStudents(rows);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedDate, teacherId]);

  const updateStatus = (
    studentId: number,
    status: "present" | "absent" | "leave",
  ) => {
    setStudents((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, status } : s)),
    );
  };

  const markAll = (status: "present" | "absent") => {
    setStudents((prev) => prev.map((s) => ({ ...s, status })));
  };

  const handleSubmit = async () => {
    if (!teacherId) return;
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const promises = students.map((s) => {
        const statusNum = STATUS_MAP[s.status];
        if (s.existingAttendanceId !== undefined) {
          // Update existing record
          return updateAttendance(s.existingAttendanceId, statusNum);
        } else {
          // Create new record
          return markAttendance({
            studentId: s.studentId,
            teacherId,
            date: new Date(selectedDate).toISOString(),
            status: statusNum,
          });
        }
      });

      await Promise.all(promises);
      setSuccessMsg(
        `Attendance for ${students.length} students saved successfully for ${selectedDate}!`,
      );
      // Refresh to get attendanceIds for newly created records
      const refreshed = await fetchAttendance(undefined, selectedDate);
      setStudents((prev) =>
        prev.map((s) => {
          const found = refreshed.find(
            (r) => r.student.firstName + " " + r.student.lastName === s.name,
          );
          return found ? { ...s, existingAttendanceId: found.attendanceId } : s;
        }),
      );
    } catch (e: any) {
      setError(e.message || "Failed to save attendance.");
    } finally {
      setSubmitting(false);
    }
  };

  const presentCount = students.filter((s) => s.status === "present").length;
  const absentCount = students.filter((s) => s.status === "absent").length;
  const leaveCount = students.filter((s) => s.status === "leave").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 font-bold text-2xl mb-1">
          Mark Attendance
        </h1>
        <p className="text-gray-600">
          Record daily attendance for your students
        </p>
      </div>

      {/* Feedback */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 text-green-700">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{successMsg}</p>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={() => markAll("present")}
              className="flex-1 px-4 py-2 border border-green-500 text-green-700 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium"
            >
              ✓ Mark All Present
            </button>
            <button
              onClick={() => markAll("absent")}
              className="flex-1 px-4 py-2 border border-red-400 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
            >
              ✗ Mark All Absent
            </button>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedDate(selectedDate); // trigger re-fetch
              }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total",
            value: students.length,
            icon: Calendar,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Present",
            value: presentCount,
            icon: CheckCircle,
            color: "text-green-600",
            bg: "bg-green-50",
          },
          {
            label: "Absent",
            value: absentCount,
            icon: XCircle,
            color: "text-red-600",
            bg: "bg-red-50",
          },
          {
            label: "On Leave",
            value: leaveCount,
            icon: Clock,
            color: "text-yellow-600",
            bg: "bg-yellow-50",
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl p-4`}>
            <div className={`flex items-center gap-2 mb-1 ${color}`}>
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {students.length > 0 && (
              <p className={`text-xs ${color}`}>
                {((value / students.length) * 100).toFixed(1)}%
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-gray-900 font-semibold">
            Student Attendance List
          </h2>
          {loading && (
            <span className="text-sm text-gray-500 animate-pulse">
              Loading…
            </span>
          )}
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-purple-400" />
            <p>Fetching student records…</p>
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>
              No students found. Make sure students are registered in the
              system.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Roll No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Present
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Absent
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Leave
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student) => (
                  <tr
                    key={student.studentId}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                      {student.rollNumber}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {student.name}
                    </td>

                    {/* Present button */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() =>
                          updateStatus(student.studentId, "present")
                        }
                        className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto transition-all font-bold text-sm ${
                          student.status === "present"
                            ? "bg-green-500 text-white shadow-md scale-105"
                            : "border border-gray-300 text-gray-400 hover:border-green-400 hover:text-green-500"
                        }`}
                      >
                        P
                      </button>
                    </td>

                    {/* Absent button */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() =>
                          updateStatus(student.studentId, "absent")
                        }
                        className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto transition-all font-bold text-sm ${
                          student.status === "absent"
                            ? "bg-red-500 text-white shadow-md scale-105"
                            : "border border-gray-300 text-gray-400 hover:border-red-400 hover:text-red-500"
                        }`}
                      >
                        A
                      </button>
                    </td>

                    {/* Leave button */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => updateStatus(student.studentId, "leave")}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto transition-all font-bold text-sm ${
                          student.status === "leave"
                            ? "bg-yellow-500 text-white shadow-md scale-105"
                            : "border border-gray-300 text-gray-400 hover:border-yellow-400 hover:text-yellow-500"
                        }`}
                      >
                        L
                      </button>
                    </td>

                    {/* Status badge */}
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          student.status === "present"
                            ? "bg-green-100 text-green-700"
                            : student.status === "absent"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {student.status.charAt(0).toUpperCase() +
                          student.status.slice(1)}
                      </span>
                      {student.existingAttendanceId && (
                        <span className="ml-2 text-xs text-gray-400">
                          (saved)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Submit */}
        {!loading && students.length > 0 && (
          <div className="p-6 border-t bg-gray-50 flex items-center gap-4">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <Save className="w-4 h-4" />
              {submitting ? "Saving…" : "Save Attendance"}
            </button>
            <p className="text-sm text-gray-500">
              {presentCount} present · {absentCount} absent · {leaveCount} on
              leave
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Missing import — add this at the top with other imports
function Users(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

// import React, { useState } from 'react';
// import { Calendar, CheckCircle, XCircle, Clock, Save } from 'lucide-react';

// export function MarkAttendance() {
//   const [selectedClass, setSelectedClass] = useState('Class 10-A');
//   const [selectedDate, setSelectedDate] = useState('2025-12-11');

//   const classes = ['Class 10-A', 'Class 9-B', 'Class 8-C'];

//   const [students, setStudents] = useState([
//     { id: 1, rollNo: '01', name: 'Aarav Patel', status: 'present' },
//     { id: 2, rollNo: '02', name: 'Aadhya Sharma', status: 'present' },
//     { id: 3, rollNo: '03', name: 'Advait Kumar', status: 'present' },
//     { id: 4, rollNo: '04', name: 'Ananya Singh', status: 'absent' },
//     { id: 5, rollNo: '05', name: 'Arjun Reddy', status: 'present' },
//     { id: 6, rollNo: '06', name: 'Diya Gupta', status: 'present' },
//     { id: 7, rollNo: '07', name: 'Ishaan Verma', status: 'leave' },
//     { id: 8, rollNo: '08', name: 'Kavya Nair', status: 'present' },
//     { id: 9, rollNo: '09', name: 'Krish Mehta', status: 'present' },
//     { id: 10, rollNo: '10', name: 'Myra Joshi', status: 'present' }
//   ]);

//   const updateAttendance = (studentId: number, status: 'present' | 'absent' | 'leave') => {
//     setStudents(students.map(student =>
//       student.id === studentId ? { ...student, status } : student
//     ));
//   };

//   const markAll = (status: 'present' | 'absent') => {
//     setStudents(students.map(student => ({ ...student, status })));
//   };

//   const handleSubmit = () => {
//     // Handle attendance submission
//     alert('Attendance submitted successfully! Students and parents will be notified.');
//   };

//   const presentCount = students.filter(s => s.status === 'present').length;
//   const absentCount = students.filter(s => s.status === 'absent').length;
//   const leaveCount = students.filter(s => s.status === 'leave').length;

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-gray-900 mb-2">Mark Attendance</h1>
//         <p className="text-gray-600">Record daily attendance for your classes</p>
//       </div>

//       {/* Selection Controls */}
//       <div className="bg-white rounded-xl shadow-sm p-6">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div>
//             <label className="block text-gray-700 mb-2">Select Class</label>
//             <select
//               value={selectedClass}
//               onChange={(e) => setSelectedClass(e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//             >
//               {classes.map((cls) => (
//                 <option key={cls}>{cls}</option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-gray-700 mb-2">Select Date</label>
//             <input
//               type="date"
//               value={selectedDate}
//               onChange={(e) => setSelectedDate(e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//             />
//           </div>

//           <div className="flex items-end gap-2">
//             <button
//               onClick={() => markAll('present')}
//               className="flex-1 px-4 py-2 border border-green-500 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
//             >
//               Mark All Present
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <div className="flex items-center gap-3 mb-2">
//             <Calendar className="w-6 h-6 text-blue-600" />
//             <h3 className="text-gray-900">Total Students</h3>
//           </div>
//           <p className="text-gray-900">{students.length}</p>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <div className="flex items-center gap-3 mb-2">
//             <CheckCircle className="w-6 h-6 text-green-600" />
//             <h3 className="text-gray-900">Present</h3>
//           </div>
//           <p className="text-gray-900">{presentCount}</p>
//           <p className="text-sm text-green-600">{((presentCount/students.length)*100).toFixed(1)}%</p>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <div className="flex items-center gap-3 mb-2">
//             <XCircle className="w-6 h-6 text-red-600" />
//             <h3 className="text-gray-900">Absent</h3>
//           </div>
//           <p className="text-gray-900">{absentCount}</p>
//           <p className="text-sm text-red-600">{((absentCount/students.length)*100).toFixed(1)}%</p>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <div className="flex items-center gap-3 mb-2">
//             <Clock className="w-6 h-6 text-yellow-600" />
//             <h3 className="text-gray-900">On Leave</h3>
//           </div>
//           <p className="text-gray-900">{leaveCount}</p>
//           <p className="text-sm text-yellow-600">{((leaveCount/students.length)*100).toFixed(1)}%</p>
//         </div>
//       </div>

//       {/* Attendance Grid */}
//       <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//         <div className="p-6 border-b">
//           <h2 className="text-gray-900">Student Attendance List</h2>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-4 text-left text-gray-700">Roll No</th>
//                 <th className="px-6 py-4 text-left text-gray-700">Student Name</th>
//                 <th className="px-6 py-4 text-center text-gray-700">Present</th>
//                 <th className="px-6 py-4 text-center text-gray-700">Absent</th>
//                 <th className="px-6 py-4 text-center text-gray-700">Leave</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {students.map((student) => (
//                 <tr key={student.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 text-gray-700">{student.rollNo}</td>
//                   <td className="px-6 py-4 text-gray-900">{student.name}</td>
//                   <td className="px-6 py-4 text-center">
//                     <button
//                       onClick={() => updateAttendance(student.id, 'present')}
//                       className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto transition-colors ${
//                         student.status === 'present'
//                           ? 'bg-green-500 text-white'
//                           : 'border border-gray-300 text-gray-400 hover:bg-gray-50'
//                       }`}
//                     >
//                       P
//                     </button>
//                   </td>
//                   <td className="px-6 py-4 text-center">
//                     <button
//                       onClick={() => updateAttendance(student.id, 'absent')}
//                       className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto transition-colors ${
//                         student.status === 'absent'
//                           ? 'bg-red-500 text-white'
//                           : 'border border-gray-300 text-gray-400 hover:bg-gray-50'
//                       }`}
//                     >
//                       A
//                     </button>
//                   </td>
//                   <td className="px-6 py-4 text-center">
//                     <button
//                       onClick={() => updateAttendance(student.id, 'leave')}
//                       className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto transition-colors ${
//                         student.status === 'leave'
//                           ? 'bg-yellow-500 text-white'
//                           : 'border border-gray-300 text-gray-400 hover:bg-gray-50'
//                       }`}
//                     >
//                       L
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         <div className="p-6 border-t bg-gray-50">
//           <button
//             onClick={handleSubmit}
//             className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
//           >
//             <Save className="w-4 h-4" />
//             Submit Attendance
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
