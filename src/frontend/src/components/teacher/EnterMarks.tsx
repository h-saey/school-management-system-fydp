// FILE: src/components/teacher/EnterMarks.tsx
// ACTION: REPLACE existing file entirely

import React, { useEffect, useState } from "react";
import {
  FileText,
  Save,
  Calculator,
  Search,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import {
  fetchAllStudents,
  fetchMarks,
  addMark,
  updateMark,
  fetchMyProfile,
  StudentBasic,
  MarkRecord,
} from "../../services/teacherApi";

interface StudentMarkRow {
  studentId: number;
  rollNumber: string;
  name: string;
  marks: number;
  total: number;
  grade: string;
  existingMarkId?: number;
  isDirty: boolean; // changed since load
}

const GRADE_THRESHOLDS = [
  { min: 90, grade: "A+" },
  { min: 80, grade: "A" },
  { min: 70, grade: "B+" },
  { min: 60, grade: "B" },
  { min: 50, grade: "C" },
  { min: 0, grade: "F" },
];

function calcGrade(marks: number, total: number): string {
  const pct = total > 0 ? (marks / total) * 100 : 0;
  return GRADE_THRESHOLDS.find((t) => pct >= t.min)?.grade ?? "F";
}

const GRADE_COLOR: Record<string, string> = {
  "A+": "bg-emerald-100 text-emerald-700",
  A: "bg-green-100 text-green-700",
  "B+": "bg-blue-100 text-blue-700",
  B: "bg-cyan-100 text-cyan-700",
  C: "bg-yellow-100 text-yellow-700",
  F: "bg-red-100 text-red-700",
};

export function EnterMarks() {
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [students, setStudents] = useState<StudentMarkRow[]>([]);
  const [selectedExam, setSelectedExam] = useState("Mid-Term");
  const [selectedSubject, setSelectedSubject] = useState("Mathematics");
  const [customSubject, setCustomSubject] = useState("");
  const [defaultTotal, setDefaultTotal] = useState(100);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const exams = ["Unit Test 1", "Unit Test 2", "Mid-Term", "Final Term"];
  const subjects = [
    "Mathematics",
    "Science",
    "English",
    "History",
    "Physics",
    "Chemistry",
    "Other",
  ];
  const activeSubject =
    selectedSubject === "Other" ? customSubject : selectedSubject;

  // Load teacher profile
  useEffect(() => {
    fetchMyProfile().then((p) => setTeacherId(p.teacherId));
  }, []);

  // Load students + existing marks on filter change
  useEffect(() => {
    if (!activeSubject) return;
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    Promise.all([fetchAllStudents(), fetchMarks(undefined, activeSubject)])
      .then(([allStudents, existingMarks]) => {
        const rows: StudentMarkRow[] = allStudents.map((s) => {
          const existing = existingMarks.find(
            (m) =>
              m.student.firstName + " " + m.student.lastName ===
                s.firstName + " " + s.lastName && m.exam === selectedExam,
          );
          return {
            studentId: s.studentId,
            rollNumber: s.rollNumber,
            name: `${s.firstName} ${s.lastName}`,
            marks: existing ? Number(existing.marksObtained) : 0,
            total: existing ? Number(existing.totalMarks) : defaultTotal,
            grade: existing
              ? calcGrade(
                  Number(existing.marksObtained),
                  Number(existing.totalMarks),
                )
              : "",
            existingMarkId: existing?.marksId,
            isDirty: false,
          };
        });
        setStudents(rows);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedExam, activeSubject]);

  const updateStudentMarks = (studentId: number, marks: number) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.studentId === studentId
          ? { ...s, marks, grade: calcGrade(marks, s.total), isDirty: true }
          : s,
      ),
    );
  };

  const updateStudentTotal = (studentId: number, total: number) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.studentId === studentId
          ? { ...s, total, grade: calcGrade(s.marks, total), isDirty: true }
          : s,
      ),
    );
  };

  const autoCalculateAll = () => {
    setStudents((prev) =>
      prev.map((s) => ({ ...s, grade: calcGrade(s.marks, s.total) })),
    );
  };

  const handleSubmit = async () => {
    if (!teacherId || !activeSubject) return;

    // Validation
    const invalid = students.find((s) => s.marks > s.total);
    if (invalid) {
      setError(
        `${invalid.name}: marks obtained (${invalid.marks}) exceed total marks (${invalid.total}).`,
      );
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    const dirtyStudents = students.filter((s) => s.isDirty);
    if (dirtyStudents.length === 0) {
      setSuccessMsg("No changes to save.");
      setSubmitting(false);
      return;
    }

    try {
      const promises = dirtyStudents.map((s) => {
        if (s.existingMarkId) {
          return updateMark(s.existingMarkId, {
            marksObtained: s.marks,
            totalMarks: s.total,
          });
        } else {
          return addMark({
            studentId: s.studentId,
            teacherId: teacherId!,
            subject: activeSubject,
            exam: selectedExam,
            marksObtained: s.marks,
            totalMarks: s.total,
          });
        }
      });

      await Promise.all(promises);
      setStudents((prev) => prev.map((s) => ({ ...s, isDirty: false })));
      setSuccessMsg(
        `Marks saved for ${dirtyStudents.length} student(s) — ${activeSubject} / ${selectedExam}.`,
      );
    } catch (e: any) {
      setError(e.message || "Failed to save marks.");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNumber.includes(searchQuery),
  );

  const average =
    students.length > 0
      ? students.reduce(
          (sum, s) => sum + (s.total > 0 ? (s.marks / s.total) * 100 : 0),
          0,
        ) / students.length
      : 0;

  const passCount = students.filter(
    (s) => s.total > 0 && (s.marks / s.total) * 100 >= 50,
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 font-bold text-2xl mb-1">Enter Marks</h1>
        <p className="text-gray-600">
          Input student marks and auto-calculate grades
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

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exam
            </label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {exams.map((e) => (
                <option key={e}>{e}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {subjects.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          {selectedSubject === "Other" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Subject
              </label>
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="e.g., Computer Science"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Total Marks
            </label>
            <input
              type="number"
              min={1}
              value={defaultTotal}
              onChange={(e) => setDefaultTotal(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={autoCalculateAll}
              className="flex items-center gap-2 px-4 py-2 border border-purple-500 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium"
            >
              <Calculator className="w-4 h-4" />
              Auto-Calculate Grades
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <span className="font-semibold text-gray-700">Total Students</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{students.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calculator className="w-6 h-6 text-green-600" />
            <span className="font-semibold text-gray-700">Class Average</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {average.toFixed(1)}%
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-6 h-6 text-purple-600" />
            <span className="font-semibold text-gray-700">Pass Rate</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {students.length
              ? ((passCount / students.length) * 100).toFixed(0)
              : 0}
            %
          </p>
          <p className="text-sm text-gray-500">
            {passCount}/{students.length} passed
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search student by name or roll number…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
        />
      </div>

      {/* Marks Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-gray-900 font-semibold">
            Enter Marks — {activeSubject || "Select subject"} / {selectedExam}
          </h2>
          {loading && (
            <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
          )}
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-purple-400" />
            <p>Loading students…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p>No students found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Roll No",
                    "Student Name",
                    "Marks Obtained",
                    "Total Marks",
                    "Percentage",
                    "Grade",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((s) => (
                  <tr
                    key={s.studentId}
                    className={`hover:bg-gray-50 transition-colors ${s.isDirty ? "bg-yellow-50" : ""}`}
                  >
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                      {s.rollNumber}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {s.name}
                      {s.isDirty && (
                        <span className="ml-2 text-xs text-yellow-600 font-normal">
                          (unsaved)
                        </span>
                      )}
                      {s.existingMarkId && !s.isDirty && (
                        <span className="ml-2 text-xs text-gray-400 font-normal">
                          (saved)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={s.marks}
                        min={0}
                        max={s.total}
                        onChange={(e) =>
                          updateStudentMarks(
                            s.studentId,
                            Number(e.target.value) || 0,
                          )
                        }
                        className={`w-24 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm ${
                          s.marks > s.total
                            ? "border-red-400 bg-red-50"
                            : "border-gray-300"
                        }`}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={s.total}
                        min={1}
                        onChange={(e) =>
                          updateStudentTotal(
                            s.studentId,
                            Number(e.target.value) || 1,
                          )
                        }
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {s.total > 0 ? ((s.marks / s.total) * 100).toFixed(1) : 0}
                      %
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${GRADE_COLOR[s.grade] || "bg-gray-100 text-gray-600"}`}
                      >
                        {s.grade || calcGrade(s.marks, s.total)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && students.length > 0 && (
          <div className="p-6 border-t bg-gray-50 flex items-center gap-4">
            <button
              onClick={handleSubmit}
              disabled={submitting || !activeSubject}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <Save className="w-4 h-4" />
              {submitting ? "Saving…" : "Save Marks"}
            </button>
            <p className="text-sm text-gray-500">
              {students.filter((s) => s.isDirty).length} unsaved change(s)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// import React, { useState } from 'react';
// import { FileText, Save, Calculator } from 'lucide-react';

// export function EnterMarks() {
//   const [selectedClass, setSelectedClass] = useState('Class 10-A');
//   const [selectedExam, setSelectedExam] = useState('Mid-Term');
//   const [selectedSubject, setSelectedSubject] = useState('Mathematics');

//   const classes = ['Class 10-A', 'Class 9-B', 'Class 8-C'];
//   const exams = ['Unit Test 1', 'Unit Test 2', 'Mid-Term', 'Final Term'];
//   const subjects = ['Mathematics', 'Science', 'English'];

//   const [students, setStudents] = useState([
//     { id: 1, rollNo: '01', name: 'Aarav Patel', marks: 88, total: 100, grade: '' },
//     { id: 2, rollNo: '02', name: 'Aadhya Sharma', marks: 92, total: 100, grade: '' },
//     { id: 3, rollNo: '03', name: 'Advait Kumar', marks: 75, total: 100, grade: '' },
//     { id: 4, rollNo: '04', name: 'Ananya Singh', marks: 85, total: 100, grade: '' },
//     { id: 5, rollNo: '05', name: 'Arjun Reddy', marks: 78, total: 100, grade: '' },
//     { id: 6, rollNo: '06', name: 'Diya Gupta', marks: 90, total: 100, grade: '' },
//     { id: 7, rollNo: '07', name: 'Ishaan Verma', marks: 82, total: 100, grade: '' },
//     { id: 8, rollNo: '08', name: 'Kavya Nair', marks: 95, total: 100, grade: '' },
//     { id: 9, rollNo: '09', name: 'Krish Mehta', marks: 88, total: 100, grade: '' },
//     { id: 10, rollNo: '10', name: 'Myra Joshi', marks: 91, total: 100, grade: '' }
//   ]);

//   const calculateGrade = (marks: number, total: number) => {
//     const percentage = (marks / total) * 100;
//     if (percentage >= 90) return 'A+';
//     if (percentage >= 80) return 'A';
//     if (percentage >= 70) return 'B+';
//     if (percentage >= 60) return 'B';
//     if (percentage >= 50) return 'C';
//     return 'F';
//   };

//   const updateMarks = (studentId: number, marks: number) => {
//     setStudents(students.map(student => {
//       if (student.id === studentId) {
//         const grade = calculateGrade(marks, student.total);
//         return { ...student, marks, grade };
//       }
//       return student;
//     }));
//   };

//   const autoCalculateGrades = () => {
//     setStudents(students.map(student => ({
//       ...student,
//       grade: calculateGrade(student.marks, student.total)
//     })));
//   };

//   const handleSubmit = () => {
//     alert('Marks submitted successfully! Students and parents will be notified.');
//   };

//   const averageMarks = (students.reduce((sum, s) => sum + s.marks, 0) / students.length).toFixed(2);

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-gray-900 mb-2">Enter Marks</h1>
//         <p className="text-gray-600">Input student marks and auto-calculate grades</p>
//       </div>

//       {/* Selection Controls */}
//       <div className="bg-white rounded-xl shadow-sm p-6">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           <div>
//             <label className="block text-gray-700 mb-2">Select Exam</label>
//             <select
//               value={selectedExam}
//               onChange={(e) => setSelectedExam(e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//             >
//               {exams.map((exam) => (
//                 <option key={exam}>{exam}</option>
//               ))}
//             </select>
//           </div>

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
//             <label className="block text-gray-700 mb-2">Select Subject</label>
//             <select
//               value={selectedSubject}
//               onChange={(e) => setSelectedSubject(e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//             >
//               {subjects.map((subject) => (
//                 <option key={subject}>{subject}</option>
//               ))}
//             </select>
//           </div>

//           <div className="flex items-end">
//             <button
//               onClick={autoCalculateGrades}
//               className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-purple-500 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors"
//             >
//               <Calculator className="w-4 h-4" />
//               Auto-Calculate Grades
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Summary */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <div className="flex items-center gap-3 mb-2">
//             <FileText className="w-6 h-6 text-blue-600" />
//             <h3 className="text-gray-900">Total Students</h3>
//           </div>
//           <p className="text-gray-900">{students.length}</p>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <div className="flex items-center gap-3 mb-2">
//             <Calculator className="w-6 h-6 text-green-600" />
//             <h3 className="text-gray-900">Class Average</h3>
//           </div>
//           <p className="text-gray-900">{averageMarks}%</p>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <div className="flex items-center gap-3 mb-2">
//             <FileText className="w-6 h-6 text-purple-600" />
//             <h3 className="text-gray-900">Exam Details</h3>
//           </div>
//           <p className="text-gray-900">{selectedExam}</p>
//           <p className="text-sm text-gray-600">{selectedSubject}</p>
//         </div>
//       </div>

//       {/* Marks Entry Table */}
//       <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//         <div className="p-6 border-b">
//           <h2 className="text-gray-900">Enter Student Marks</h2>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-4 text-left text-gray-700">Roll No</th>
//                 <th className="px-6 py-4 text-left text-gray-700">Student Name</th>
//                 <th className="px-6 py-4 text-left text-gray-700">Marks Obtained</th>
//                 <th className="px-6 py-4 text-left text-gray-700">Total Marks</th>
//                 <th className="px-6 py-4 text-left text-gray-700">Percentage</th>
//                 <th className="px-6 py-4 text-left text-gray-700">Grade</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {students.map((student) => (
//                 <tr key={student.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 text-gray-700">{student.rollNo}</td>
//                   <td className="px-6 py-4 text-gray-900">{student.name}</td>
//                   <td className="px-6 py-4">
//                     <input
//                       type="number"
//                       value={student.marks}
//                       onChange={(e) => updateMarks(student.id, parseInt(e.target.value) || 0)}
//                       min="0"
//                       max={student.total}
//                       className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//                     />
//                   </td>
//                   <td className="px-6 py-4 text-gray-700">{student.total}</td>
//                   <td className="px-6 py-4 text-gray-700">
//                     {((student.marks / student.total) * 100).toFixed(1)}%
//                   </td>
//                   <td className="px-6 py-4">
//                     <span className={`px-3 py-1 rounded-full text-sm ${
//                       student.grade.includes('A') ? 'bg-green-100 text-green-700' :
//                       student.grade.includes('B') ? 'bg-blue-100 text-blue-700' :
//                       student.grade.includes('C') ? 'bg-yellow-100 text-yellow-700' :
//                       'bg-red-100 text-red-700'
//                     }`}>
//                       {student.grade || calculateGrade(student.marks, student.total)}
//                     </span>
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
//             Submit Marks
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
