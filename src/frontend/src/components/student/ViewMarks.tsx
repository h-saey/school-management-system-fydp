import React, { useState, useEffect } from "react";
import {
  FileText,
  TrendingUp,
  Award,
  Filter,
  Download,
  AlertCircle,
} from "lucide-react";
import { getMyMarks, type MarkRecord } from "../../services/studentApi";

// Grade helper
function getGrade(pct: number): string {
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B";
  if (pct >= 60) return "C";
  if (pct >= 50) return "D";
  return "F";
}

function gradeColor(grade: string): string {
  switch (grade) {
    case "A+":
      return "bg-green-100 text-green-700";
    case "A":
      return "bg-blue-100 text-blue-700";
    case "B":
      return "bg-indigo-100 text-indigo-700";
    case "C":
      return "bg-yellow-100 text-yellow-700";
    case "D":
      return "bg-orange-100 text-orange-700";
    default:
      return "bg-red-100 text-red-700";
  }
}

export function ViewMarks() {
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [filtered, setFiltered] = useState<MarkRecord[]>([]);
  const [selSubject, setSelSubject] = useState("All Subjects");
  const [selExam, setSelExam] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    avg: 0,
    highest: 0,
    lowest: 0,
    total: 0,
  });

  useEffect(() => {
    getMyMarks()
      .then((data) => {
        setMarks(data);
        setFiltered(data);
        calcStats(data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let f = marks;
    if (selSubject !== "All Subjects")
      f = f.filter((m) => m.subject === selSubject);
    if (selExam !== "All") f = f.filter((m) => m.exam === selExam);
    setFiltered(f);
    calcStats(f);
  }, [selSubject, selExam, marks]);

  function calcStats(data: MarkRecord[]) {
    if (!data.length) {
      setStats({ avg: 0, highest: 0, lowest: 0, total: 0 });
      return;
    }
    const pcts = data.map((m) => m.percentage);
    setStats({
      avg:
        Math.round((pcts.reduce((a, b) => a + b, 0) / pcts.length) * 10) / 10,
      highest: Math.round(Math.max(...pcts) * 10) / 10,
      lowest: Math.round(Math.min(...pcts) * 10) / 10,
      total: data.length,
    });
  }

  const subjects = [
    "All Subjects",
    ...Array.from(new Set(marks.map((m) => m.subject))),
  ];
  const examTypes = ["All", ...Array.from(new Set(marks.map((m) => m.exam)))];

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading marks…</div>
      </div>
    );

  if (error)
    return (
      <div className="p-6 bg-red-50 rounded-xl border border-red-200 text-red-700">
        <AlertCircle className="inline w-4 h-4 mr-2" />
        {error}
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-gray-900 text-xl font-semibold mb-1">
            Marks & Results
          </h1>
          <p className="text-gray-500 text-sm">
            View your examination performance
          </p>
        </div>
        <button
          onClick={() => alert("PDF download will be implemented here")}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all active:scale-95 text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          Download Report
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Average",
            value: `${stats.avg}%`,
            sub: "Overall",
            icon: TrendingUp,
            color: "text-blue-500",
          },
          {
            label: "Highest",
            value: `${stats.highest}%`,
            sub: "Best",
            icon: Award,
            color: "text-green-500",
          },
          {
            label: "Lowest",
            value: `${stats.lowest}%`,
            sub: "Needs work",
            icon: FileText,
            color: "text-orange-500",
          },
          {
            label: "Total Exams",
            value: String(stats.total),
            sub: "Completed",
            icon: FileText,
            color: "text-purple-500",
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center gap-3 mb-2">
                <Icon className={`w-5 h-5 ${s.color}`} />
                <span className="text-sm text-gray-600">{s.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{s.value}</p>
              <p className={`text-xs ${s.color}`}>{s.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h2 className="text-gray-900 font-medium text-sm">Filter Results</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Subject</label>
            <select
              value={selSubject}
              onChange={(e) => setSelSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {subjects.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Exam Type
            </label>
            <select
              value={selExam}
              onChange={(e) => setSelExam(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {examTypes.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Marks table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b">
          <h2 className="text-gray-900 font-medium">Detailed Marks</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Showing {filtered.length} of {marks.length} results
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Subject", "Exam", "Marks", "Percentage", "Grade"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-gray-600 font-medium"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length > 0 ? (
                filtered.map((m) => {
                  const grade = getGrade(m.percentage);
                  return (
                    <tr key={m.marksId} className="hover:bg-gray-50">
                      <td className="px-5 py-3 text-gray-900 font-medium">
                        {m.subject}
                      </td>
                      <td className="px-5 py-3 text-gray-600">{m.exam}</td>
                      <td className="px-5 py-3 text-gray-900">
                        {m.marksObtained}/{m.totalMarks}
                      </td>
                      <td className="px-5 py-3 text-gray-900">
                        {m.percentage}%
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${gradeColor(grade)}`}
                        >
                          {grade}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-8 text-center text-gray-400"
                  >
                    No marks found for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subject-wise summary */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="text-gray-900 font-medium mb-4">
          Subject-wise Performance
        </h2>
        <div className="space-y-3">
          {subjects
            .filter((s) => s !== "All Subjects")
            .map((subject) => {
              const sm = marks.filter((m) => m.subject === subject);
              if (!sm.length) return null;
              const avg = sm.reduce((s, m) => s + m.percentage, 0) / sm.length;
              const grade = getGrade(avg);
              return (
                <div
                  key={subject}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="text-gray-900 text-sm font-medium">
                      {subject}
                    </p>
                    <p className="text-gray-500 text-xs">{sm.length} exam(s)</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Average</p>
                      <p className="text-gray-900 text-sm font-medium">
                        {Math.round(avg * 10) / 10}%
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${gradeColor(grade)}`}
                    >
                      {grade}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
// import React, { useState, useEffect } from "react";
// import { FileText, Download, TrendingUp, Award, Filter } from "lucide-react";
// import { dataService } from "../../services/dataService";
// import { useApp } from "../../contexts/AppContext";
// import { SEO } from "../SEO";
// import { getGradeColor, calculatePercentage } from "../../utils/helpers";
// import { toast } from "sonner";

// export function ViewMarks() {
//   const { currentUser } = useApp();
//   const [selectedTerm, setSelectedTerm] = useState("All");
//   const [selectedSubject, setSelectedSubject] = useState("All Subjects");
//   const [selectedExamType, setSelectedExamType] = useState("All");
//   const [marks, setMarks] = useState<any[]>([]);
//   const [filteredMarks, setFilteredMarks] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [stats, setStats] = useState({
//     average: 0,
//     highest: 0,
//     lowest: 0,
//     totalExams: 0,
//   });

//   useEffect(() => {
//     if (!currentUser) return;

//     const student = dataService.getStudentByUserId(currentUser.id);
//     if (!student) return;

//     const allMarks = dataService.getMarksByStudent(student.id);
//     setMarks(allMarks);
//     setFilteredMarks(allMarks);
//     calculateStats(allMarks);
//     setLoading(false);
//   }, [currentUser]);

//   useEffect(() => {
//     // Apply filters
//     let filtered = marks;

//     if (selectedTerm !== "All") {
//       filtered = filtered.filter((m) => m.term === selectedTerm);
//     }

//     if (selectedSubject !== "All Subjects") {
//       filtered = filtered.filter((m) => m.subject === selectedSubject);
//     }

//     if (selectedExamType !== "All") {
//       filtered = filtered.filter((m) => m.examType === selectedExamType);
//     }

//     setFilteredMarks(filtered);
//     calculateStats(filtered);
//   }, [selectedTerm, selectedSubject, selectedExamType, marks]);

//   const calculateStats = (marksData: any[]) => {
//     if (marksData.length === 0) {
//       setStats({ average: 0, highest: 0, lowest: 0, totalExams: 0 });
//       return;
//     }

//     const percentages = marksData.map(
//       (m) => (m.marksObtained / m.totalMarks) * 100,
//     );
//     const average = percentages.reduce((a, b) => a + b, 0) / percentages.length;
//     const highest = Math.max(...percentages);
//     const lowest = Math.min(...percentages);

//     setStats({
//       average: Math.round(average * 10) / 10,
//       highest: Math.round(highest * 10) / 10,
//       lowest: Math.round(lowest * 10) / 10,
//       totalExams: marksData.length,
//     });
//   };

//   const subjects = ["All Subjects", ...new Set(marks.map((m) => m.subject))];
//   const terms = ["All", ...new Set(marks.map((m) => m.term))];
//   const examTypes = ["All", ...new Set(marks.map((m) => m.examType))];

//   const handleDownloadReport = () => {
//     toast.success(
//       "Report card download functionality would be implemented here",
//     );
//     // In real implementation, generate PDF report
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-gray-600">Loading marks...</div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <SEO
//         title="View Marks & Results"
//         description="View your examination marks, grades, and academic performance across all subjects"
//         keywords="student marks, exam results, grades, academic performance"
//       />
//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-gray-900 mb-2">Marks & Results</h1>
//             <p className="text-gray-600">
//               View your examination performance and grades
//             </p>
//           </div>
//           <button
//             onClick={handleDownloadReport}
//             className="
//     flex items-center justify-center gap-2
//     w-full sm:w-auto
//     px-5 py-3
//     text-base font-medium
//     bg-blue-600 text-white
//     rounded-xl
//     hover:bg-blue-700
//     active:scale-95
//     transition-all duration-200
//     focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
//   "
//             aria-label="Download report card"
//           >
//             <Download className="w-5 h-5" aria-hidden="true" />
//             <span>Download Report</span>
//           </button>

//           {/* <button
//             onClick={handleDownloadReport}
//             className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//             aria-label="Download report card"
//           >
//             <Download className="w-4 h-4" aria-hidden="true" />
//             Download Report
//           </button> */}
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//           <div className="bg-white rounded-xl shadow-sm p-6">
//             <div className="flex items-center gap-3 mb-2">
//               <TrendingUp
//                 className="w-6 h-6 text-blue-500"
//                 aria-hidden="true"
//               />
//               <h3 className="text-gray-900">Average</h3>
//             </div>
//             <p className="text-gray-900">{stats.average}%</p>
//             <p className="text-sm text-blue-600">Overall performance</p>
//           </div>

//           <div className="bg-white rounded-xl shadow-sm p-6">
//             <div className="flex items-center gap-3 mb-2">
//               <Award className="w-6 h-6 text-green-500" aria-hidden="true" />
//               <h3 className="text-gray-900">Highest</h3>
//             </div>
//             <p className="text-gray-900">{stats.highest}%</p>
//             <p className="text-sm text-green-600">Best performance</p>
//           </div>

//           <div className="bg-white rounded-xl shadow-sm p-6">
//             <div className="flex items-center gap-3 mb-2">
//               <FileText
//                 className="w-6 h-6 text-orange-500"
//                 aria-hidden="true"
//               />
//               <h3 className="text-gray-900">Lowest</h3>
//             </div>
//             <p className="text-gray-900">{stats.lowest}%</p>
//             <p className="text-sm text-orange-600">Needs improvement</p>
//           </div>

//           <div className="bg-white rounded-xl shadow-sm p-6">
//             <div className="flex items-center gap-3 mb-2">
//               <FileText
//                 className="w-6 h-6 text-purple-500"
//                 aria-hidden="true"
//               />
//               <h3 className="text-gray-900">Total Exams</h3>
//             </div>
//             <p className="text-gray-900">{stats.totalExams}</p>
//             <p className="text-sm text-purple-600">Completed</p>
//           </div>
//         </div>

//         {/* Filters */}
//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <div className="flex items-center gap-3 mb-4">
//             <Filter className="w-5 h-5 text-gray-600" aria-hidden="true" />
//             <h2 className="text-gray-900">Filter Results</h2>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div>
//               <label
//                 htmlFor="term-filter"
//                 className="block text-sm text-gray-700 mb-2"
//               >
//                 Term
//               </label>
//               <select
//                 id="term-filter"
//                 value={selectedTerm}
//                 onChange={(e) => setSelectedTerm(e.target.value)}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 {terms.map((term) => (
//                   <option key={term} value={term}>
//                     {term}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label
//                 htmlFor="subject-filter"
//                 className="block text-sm text-gray-700 mb-2"
//               >
//                 Subject
//               </label>
//               <select
//                 id="subject-filter"
//                 value={selectedSubject}
//                 onChange={(e) => setSelectedSubject(e.target.value)}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 {subjects.map((subject) => (
//                   <option key={subject} value={subject}>
//                     {subject}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label
//                 htmlFor="exam-filter"
//                 className="block text-sm text-gray-700 mb-2"
//               >
//                 Exam Type
//               </label>
//               <select
//                 id="exam-filter"
//                 value={selectedExamType}
//                 onChange={(e) => setSelectedExamType(e.target.value)}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 {examTypes.map((type) => (
//                   <option key={type} value={type}>
//                     {type}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Marks Table */}
//         <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//           <div className="p-6 border-b">
//             <h2 className="text-gray-900">Detailed Marks</h2>
//             <p className="text-sm text-gray-600 mt-1">
//               Showing {filteredMarks.length} of {marks.length} results
//             </p>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-sm text-gray-700">
//                     Subject
//                   </th>
//                   <th className="px-6 py-3 text-left text-sm text-gray-700">
//                     Exam Type
//                   </th>
//                   <th className="px-6 py-3 text-left text-sm text-gray-700">
//                     Term
//                   </th>
//                   <th className="px-6 py-3 text-center text-sm text-gray-700">
//                     Marks
//                   </th>
//                   <th className="px-6 py-3 text-center text-sm text-gray-700">
//                     Percentage
//                   </th>
//                   <th className="px-6 py-3 text-center text-sm text-gray-700">
//                     Grade
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {filteredMarks.length > 0 ? (
//                   filteredMarks.map((mark, index) => {
//                     const percentage = calculatePercentage(
//                       mark.marksObtained,
//                       mark.totalMarks,
//                     );
//                     return (
//                       <tr key={index} className="hover:bg-gray-50">
//                         <td className="px-6 py-4 text-gray-900">
//                           {mark.subject}
//                         </td>
//                         <td className="px-6 py-4 text-gray-600">
//                           {mark.examType}
//                         </td>
//                         <td className="px-6 py-4 text-gray-600">{mark.term}</td>
//                         <td className="px-6 py-4 text-center text-gray-900">
//                           {mark.marksObtained}/{mark.totalMarks}
//                         </td>
//                         <td className="px-6 py-4 text-center text-gray-900">
//                           {percentage}%
//                         </td>
//                         <td className="px-6 py-4 text-center">
//                           <span
//                             className={`px-3 py-1 rounded-full text-sm ${getGradeColor(mark.grade)}`}
//                           >
//                             {mark.grade}
//                           </span>
//                         </td>
//                       </tr>
//                     );
//                   })
//                 ) : (
//                   <tr>
//                     <td
//                       colSpan={6}
//                       className="px-6 py-8 text-center text-gray-500"
//                     >
//                       No marks found for the selected filters
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Subject-wise Summary */}
//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <h2 className="text-gray-900 mb-4">Subject-wise Performance</h2>
//           <div className="space-y-4">
//             {subjects
//               .filter((s) => s !== "All Subjects")
//               .map((subject) => {
//                 const subjectMarks = marks.filter((m) => m.subject === subject);
//                 if (subjectMarks.length === 0) return null;

//                 const avgPercentage =
//                   subjectMarks.reduce(
//                     (sum, m) => sum + (m.marksObtained / m.totalMarks) * 100,
//                     0,
//                   ) / subjectMarks.length;

//                 const avgGrade = subjectMarks[0]?.grade || "N/A";

//                 return (
//                   <div
//                     key={subject}
//                     className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
//                   >
//                     <div className="flex-1">
//                       <p className="text-gray-900 font-medium">{subject}</p>
//                       <p className="text-sm text-gray-600">
//                         {subjectMarks.length} exam(s)
//                       </p>
//                     </div>
//                     <div className="flex items-center gap-6">
//                       <div className="text-right">
//                         <p className="text-sm text-gray-600">Average</p>
//                         <p className="text-gray-900 font-medium">
//                           {Math.round(avgPercentage * 10) / 10}%
//                         </p>
//                       </div>
//                       <span
//                         className={`px-3 py-1 rounded-full text-sm ${getGradeColor(avgGrade)}`}
//                       >
//                         {avgGrade}
//                       </span>
//                     </div>
//                   </div>
//                 );
//               })}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }
