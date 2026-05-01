import React, { useState, useEffect } from "react";
import {
  Award,
  FileText,
  Calendar,
  Download,
  Trophy,
  Star,
  Medal,
  AlertCircle,
} from "lucide-react";
import {
  getMyPortfolio,
  getMyMarks,
  getMyAttendance,
  getMyAchievements,
  type PortfolioRecord,
  type MarkRecord,
  type AttendanceRecord,
  type AchievementRecord,
} from "../../services/studentApi";

type Tab = "academics" | "attendance" | "achievements" | "portfolio";

export function StudentPortfolio() {
  const [activeTab, setActiveTab] = useState<Tab>("academics");
  const [portfolio, setPortfolio] = useState<PortfolioRecord | null>(null);
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [att, setAtt] = useState<AttendanceRecord[]>([]);
  const [ach, setAch] = useState<AchievementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [m, a, ac, pf] = await Promise.all([
          getMyMarks(),
          getMyAttendance(),
          getMyAchievements(),
          getMyPortfolio().catch(() => null), // portfolio may not exist yet
        ]);
        setMarks(m);
        setAtt(a);
        setAch(ac);
        setPortfolio(pf);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Derived: attendance summary
  const total = att.length;
  const present = att.filter((a) => a.status === "Present").length;
  const absent = att.filter((a) => a.status === "Absent").length;
  const late = att.filter((a) => a.status === "Late").length;
  const attPct = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

  // Derived: subject averages
  const subjectMap = marks.reduce<Record<string, number[]>>((acc, m) => {
    if (!acc[m.subject]) acc[m.subject] = [];
    acc[m.subject].push(m.percentage);
    return acc;
  }, {});

  const tabs = [
    { id: "academics" as Tab, label: "Academic Records", icon: FileText },
    { id: "attendance" as Tab, label: "Attendance Report", icon: Calendar },
    { id: "achievements" as Tab, label: "Achievements", icon: Trophy },
    { id: "portfolio" as Tab, label: "Full Portfolio", icon: Award },
  ];

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading portfolio…</div>
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
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-gray-900 text-xl font-semibold mb-1">
            Student Portfolio
          </h1>
          <p className="text-gray-500 text-sm">
            Comprehensive record of your academic journey
          </p>
        </div>
        <button
          onClick={() => alert("PDF export will be implemented here")}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all active:scale-95 text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          Export Portfolio PDF
        </button>
      </div>

      {/* Tab navigation */}
      <div className="bg-white rounded-xl shadow-sm p-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  activeTab === t.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Academic Records ── */}
      {activeTab === "academics" && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-gray-900 font-medium mb-5">
            Subject-wise Performance
          </h2>
          {Object.keys(subjectMap).length === 0 ? (
            <p className="text-gray-400 text-sm">No marks recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(subjectMap).map(([sub, pcts]) => {
                const avg =
                  Math.round(
                    (pcts.reduce((a, b) => a + b, 0) / pcts.length) * 10,
                  ) / 10;
                return (
                  <div
                    key={sub}
                    className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <p className="text-gray-900 font-medium">{sub}</p>
                        <p className="text-gray-500 text-xs">
                          {pcts.length} exam(s)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-900 font-semibold text-lg">
                          {avg}%
                        </p>
                        <p className="text-gray-500 text-xs">Average</p>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-3 h-2 bg-white rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${avg}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Attendance Report ── */}
      {activeTab === "attendance" && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-gray-900 font-medium mb-5">Attendance Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <div className="p-5 bg-green-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-700">{present}</p>
              <p className="text-sm text-gray-600">Days Present</p>
            </div>
            <div className="p-5 bg-red-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-red-700">{absent}</p>
              <p className="text-sm text-gray-600">Days Absent</p>
            </div>
            <div className="p-5 bg-blue-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-700">{attPct}%</p>
              <p className="text-sm text-gray-600">Attendance Rate</p>
            </div>
          </div>
          {/* Progress ring-style bar */}
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${attPct >= 75 ? "bg-green-500" : "bg-red-500"}`}
              style={{ width: `${attPct}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">Minimum required: 75%</p>
          {attPct < 75 && (
            <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded text-yellow-800 text-sm">
              Your attendance is below the required 75%. Please improve to
              remain eligible for exams.
            </div>
          )}
        </div>
      )}

      {/* ── Achievements ── */}
      {activeTab === "achievements" && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-gray-900 font-medium mb-5">
            Achievements & Certificates
          </h2>
          {ach.length === 0 ? (
            <p className="text-gray-400 text-sm">
              No achievements recorded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {ach.map((a) => (
                <div
                  key={a.achievementId}
                  className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium text-sm">
                        {a.title}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {new Date(a.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs shrink-0">
                    {a.category}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Full Portfolio ── */}
      {activeTab === "portfolio" && (
        <div className="space-y-4">
          {!portfolio ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-xl p-5 text-yellow-800 text-sm">
              Portfolio has not been compiled yet. Please ask your teacher or
              admin to compile it.
            </div>
          ) : (
            <>
              {[
                {
                  label: "Attendance Summary",
                  value: portfolio.attendanceSummary,
                },
                { label: "Marks Summary", value: portfolio.marksSummary },
                {
                  label: "Achievements Summary",
                  value: portfolio.achievementsSummary,
                },
                { label: "Behavior Summary", value: portfolio.behaviorSummary },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-white rounded-xl shadow-sm p-5"
                >
                  <h3 className="text-gray-700 font-medium text-sm mb-3">
                    {s.label}
                  </h3>
                  <pre className="text-gray-600 text-sm whitespace-pre-wrap font-sans">
                    {s.value || "No data available."}
                  </pre>
                </div>
              ))}
              <p className="text-xs text-gray-400 text-right">
                Last updated: {new Date(portfolio.lastUpdated).toLocaleString()}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
// import React, { useState } from "react";
// import {
//   Award,
//   FileText,
//   Calendar,
//   Download,
//   Trophy,
//   Star,
//   Medal,
// } from "lucide-react";

// export function StudentPortfolio() {
//   const [activeTab, setActiveTab] = useState<
//     "academics" | "attendance" | "certificates" | "achievements"
//   >("academics");

//   const academicRecords = [
//     { year: "2024-25", class: "Class 10", percentage: "84.8%", rank: "3rd" },
//     { year: "2023-24", class: "Class 9", percentage: "88.2%", rank: "2nd" },
//     { year: "2022-23", class: "Class 8", percentage: "86.5%", rank: "5th" },
//   ];

//   const certificates = [
//     {
//       name: "Science Olympiad Gold Medal",
//       issuedBy: "Dr. Singh",
//       date: "2025-11-15",
//       type: "Academic",
//     },
//     {
//       name: "Inter-School Debate Winner",
//       issuedBy: "Mrs. Sharma",
//       date: "2025-10-20",
//       type: "Co-curricular",
//     },
//     {
//       name: "Perfect Attendance Award",
//       issuedBy: "Principal",
//       date: "2025-09-01",
//       type: "Achievement",
//     },
//   ];

//   const achievements = [
//     {
//       title: "100% Attendance",
//       icon: Calendar,
//       color: "bg-green-500",
//       date: "Aug-Nov 2025",
//     },
//     {
//       title: "Top 3 in Mathematics",
//       icon: Star,
//       color: "bg-yellow-500",
//       date: "Mid-Term 2025",
//     },
//     {
//       title: "Science Fair Winner",
//       icon: Trophy,
//       color: "bg-blue-500",
//       date: "Oct 2025",
//     },
//     {
//       title: "Best Speaker Award",
//       icon: Medal,
//       color: "bg-purple-500",
//       date: "Sep 2025",
//     },
//   ];

//   const activities = [
//     { name: "Science Club Member", duration: "2 years", badge: "Active" },
//     { name: "Debate Team Captain", duration: "1 year", badge: "Leadership" },
//     { name: "Sports Committee", duration: "1.5 years", badge: "Active" },
//   ];

//   return (
//     <div className="space-y-6">
//       <div className="flex items-start justify-between">
//         <div>
//           <h1 className="text-gray-900 mb-2">Student Portfolio</h1>
//           <p className="text-gray-600">
//             Comprehensive record of your academic journey
//           </p>
//         </div>
//         <button
//           className="
//     flex items-center justify-center gap-2
//     w-full sm:w-auto sm:px-4
//     px-5 py-3
//     mt-4
//     sm:mt-0 sm:ml-4 sm:mx-4
//     text-base font-medium
//     bg-blue-600 text-white
//     rounded-xl
//     hover:bg-blue-700
//     active:scale-95
//     transition-all duration-200
//     focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
//   "
//         >
//           <Download className="w-5 h-5" />
//           <span>Export Portfolio PDF</span>
//         </button>

//         {/* <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
//           <Download className="w-4 h-4" />
//           Export Portfolio PDF
//         </button> */}
//       </div>

//       {/* Tab Navigation */}
//       <div className="bg-white rounded-xl shadow-sm p-2">
//         <div className="flex gap-2 overflow-x-auto scrollbar-hide">
//           {[
//             {
//               id: "academics" as const,
//               label: "Academic Records",
//               icon: FileText,
//             },
//             {
//               id: "attendance" as const,
//               label: "Attendance Report",
//               icon: Calendar,
//             },
//             { id: "certificates" as const, label: "Certificates", icon: Award },
//             {
//               id: "achievements" as const,
//               label: "Achievements & Activities",
//               icon: Trophy,
//             },
//           ].map((tab) => {
//             const Icon = tab.icon;

//             return (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`flex items-center justify-center gap-2
//             whitespace-nowrap
//             min-w-fit
//             px-4 py-3
//             text-sm sm:text-base
//             rounded-lg
//             transition-all duration-200
//             ${
//               activeTab === tab.id
//                 ? "bg-blue-600 text-white shadow-sm"
//                 : "text-gray-700 hover:bg-gray-100"
//             }`}
//               >
//                 <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
//                 <span>{tab.label}</span>
//               </button>
//             );
//           })}
//         </div>
//       </div>

//       {/* <div className="bg-white rounded-xl shadow-sm p-2">
//         <div className="flex gap-2">
//           {[
//             {
//               id: "academics" as const,
//               label: "Academic Records",
//               icon: FileText,
//             },
//             {
//               id: "attendance" as const,
//               label: "Attendance Report",
//               icon: Calendar,
//             },
//             { id: "certificates" as const, label: "Certificates", icon: Award },
//             {
//               id: "achievements" as const,
//               label: "Achievements & Activities",
//               icon: Trophy,
//             },
//           ].map((tab) => {
//             const Icon = tab.icon;
//             return (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
//                   activeTab === tab.id
//                     ? "bg-blue-600 text-white"
//                     : "text-gray-700 hover:bg-gray-100"
//                 }`}
//               >
//                 <Icon className="w-4 h-4" />
//                 {tab.label}
//               </button>
//             );
//           })}
//         </div>
//       </div> */}

//       {/* Tab Content */}
//       {activeTab === "academics" && (
//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <h2 className="text-gray-900 mb-6">Academic Performance History</h2>
//           <div className="space-y-4">
//             {academicRecords.map((record, index) => (
//               <div
//                 key={index}
//                 className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg"
//               >
//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                   <div>
//                     <p className="text-sm text-gray-600">Academic Year</p>
//                     <p className="text-gray-900">{record.year}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">Class</p>
//                     <p className="text-gray-900">{record.class}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">Percentage</p>
//                     <p className="text-gray-900">{record.percentage}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">Class Rank</p>
//                     <p className="text-gray-900">{record.rank}</p>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {activeTab === "attendance" && (
//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <h2 className="text-gray-900 mb-6">Attendance Summary</h2>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
//             <div className="p-6 bg-green-50 rounded-lg">
//               <p className="text-sm text-gray-600 mb-2">Total Days Present</p>
//               <p className="text-gray-900">102 days</p>
//             </div>
//             <div className="p-6 bg-red-50 rounded-lg">
//               <p className="text-sm text-gray-600 mb-2">Total Days Absent</p>
//               <p className="text-gray-900">5 days</p>
//             </div>
//             <div className="p-6 bg-blue-50 rounded-lg">
//               <p className="text-sm text-gray-600 mb-2">Attendance Rate</p>
//               <p className="text-gray-900">92%</p>
//             </div>
//           </div>
//           <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
//             <p className="text-gray-700">
//               <strong>Note:</strong> Maintain at least 75% attendance to be
//               eligible for examinations.
//             </p>
//           </div>
//         </div>
//       )}

//       {/* {activeTab === "certificates" && (
//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <h2 className="text-gray-900 mb-6">Certificates & Awards</h2>
//           <div className="space-y-4">
//             {certificates.map((cert, index) => (
//               <div
//                 key={index}
//                 className="flex items-center justify-between p-6 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
//               >
//                 <div className="flex items-start gap-4">
//                   <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
//                     <Award className="w-6 h-6 text-blue-600" />
//                   </div>
//                   <div>
//                     <h3 className="text-gray-900 mb-1">{cert.name}</h3>
//                     <p className="text-sm text-gray-600">
//                       Issued by: {cert.issuedBy}
//                     </p>
//                     <p className="text-sm text-gray-600">Date: {cert.date}</p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
//                     {cert.type}
//                   </span>
//                   <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
//                     View
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )} */}
//       {activeTab === "certificates" && (
//         <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
//           <h2 className="text-gray-900 text-lg sm:text-xl mb-6">
//             Certificates & Awards
//           </h2>

//           <div className="space-y-4">
//             {certificates.map((cert, index) => (
//               <div
//                 key={index}
//                 className="
//             flex flex-col sm:flex-row
//             sm:items-center sm:justify-between
//             gap-4
//             p-4 sm:p-6
//             border border-gray-200
//             rounded-lg
//             hover:border-blue-300
//             transition-colors
//           "
//               >
//                 {/* LEFT CONTENT */}
//                 <div className="flex items-start gap-4">
//                   <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
//                     <Award className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
//                   </div>

//                   <div>
//                     <h3 className="text-gray-900 text-sm sm:text-base mb-1">
//                       {cert.name}
//                     </h3>

//                     <p className="text-xs sm:text-sm text-gray-600">
//                       Issued by: {cert.issuedBy}
//                     </p>

//                     <p className="text-xs sm:text-sm text-gray-600">
//                       Date: {cert.date}
//                     </p>
//                   </div>
//                 </div>

//                 {/* RIGHT ACTIONS */}
//                 <div className="flex items-center justify-between sm:justify-end gap-3">
//                   <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs sm:text-sm">
//                     {cert.type}
//                   </span>

//                   <button className="px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
//                     View
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {activeTab === "achievements" && (
//         <div className="space-y-6">
//           <div className="bg-white rounded-xl shadow-sm p-6">
//             <h2 className="text-gray-900 mb-6">Achievements & Badges</h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//               {achievements.map((achievement, index) => {
//                 const Icon = achievement.icon;
//                 return (
//                   <div
//                     key={index}
//                     className="p-6 border border-gray-200 rounded-lg text-center"
//                   >
//                     <div
//                       className={`${achievement.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}
//                     >
//                       <Icon className="w-8 h-8 text-white" />
//                     </div>
//                     <h3 className="text-gray-900 mb-2">{achievement.title}</h3>
//                     <p className="text-sm text-gray-600">{achievement.date}</p>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>

//           <div className="bg-white rounded-xl shadow-sm p-6">
//             <h2 className="text-gray-900 mb-6">Co-curricular Activities</h2>
//             <div className="space-y-4">
//               {activities.map((activity, index) => (
//                 <div
//                   key={index}
//                   className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
//                 >
//                   <div>
//                     <h3 className="text-gray-900">{activity.name}</h3>
//                     <p className="text-sm text-gray-600">{activity.duration}</p>
//                   </div>
//                   <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
//                     {activity.badge}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
