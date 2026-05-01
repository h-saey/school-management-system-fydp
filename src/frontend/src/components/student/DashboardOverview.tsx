import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  Calendar,
  FileText,
  DollarSign,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import {
  getMyProfile,
  getMyAttendance,
  getMyMarks,
  getMyFees,
  getMyAchievements,
  getNoticesForStudent,
  type StudentProfile,
  type FeeRecord,
  type NoticeRecord,
} from "../../services/studentApi";

export function DashboardOverview() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [attPct, setAttPct] = useState<number>(0);
  const [avgMark, setAvgMark] = useState<number>(0);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [achCount, setAchCount] = useState<number>(0);
  const [notices, setNotices] = useState<NoticeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [prof, att, mrks, feeList, ach, ntc] = await Promise.all([
          getMyProfile(),
          getMyAttendance(),
          getMyMarks(),
          getMyFees(),
          getMyAchievements(),
          getNoticesForStudent(),
        ]);

        setProfile(prof);

        // Attendance %
        const total = att.length;
        const present = att.filter((a) => a.status === "Present").length;
        const late = att.filter((a) => a.status === "Late").length;
        setAttPct(total > 0 ? Math.round(((present + late) / total) * 100) : 0);

        // Average marks
        if (mrks.length > 0) {
          const avg = mrks.reduce((s, m) => s + m.percentage, 0) / mrks.length;
          setAvgMark(Math.round(avg * 10) / 10);
        }

        setFees(feeList);
        setAchCount(ach.length);
        // Show active notices only, latest 3
        setNotices(ntc.filter((n) => n.isActive).slice(0, 3));
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const pendingFees = fees.filter(
    (f) => f.status === "Unpaid" || f.status === "Overdue",
  );
  const totalDue = pendingFees.reduce(
    (s, f) => s + (f.totalAmount - f.paidAmount),
    0,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-xl border border-red-200 text-red-700">
        <AlertCircle className="w-5 h-5 inline mr-2" />
        {error}
      </div>
    );
  }

  const stats = [
    {
      label: "Attendance Rate",
      value: `${attPct}%`,
      sub: attPct >= 75 ? "Good standing" : "Below minimum",
      icon: Calendar,
      color: "text-blue-500",
      subColor: attPct >= 75 ? "text-green-600" : "text-red-600",
    },
    {
      label: "Average Score",
      value: `${avgMark}%`,
      sub: "Overall performance",
      icon: TrendingUp,
      color: "text-green-500",
      subColor: "text-green-600",
    },
    {
      label: "Pending Fees",
      value:
        pendingFees.length > 0 ? `PKR ${totalDue.toLocaleString()}` : "Paid",
      sub:
        pendingFees.length > 0 ? `${pendingFees.length} pending` : "All clear",
      icon: DollarSign,
      color: pendingFees.length > 0 ? "text-red-500" : "text-green-500",
      subColor: pendingFees.length > 0 ? "text-red-600" : "text-green-600",
    },
    {
      label: "Achievements",
      value: String(achCount),
      sub: "Total earned",
      icon: Award,
      color: "text-yellow-500",
      subColor: "text-yellow-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-6 text-white">
        <h1 className="text-xl font-semibold mb-1">
          Welcome back, {profile?.firstName} {profile?.lastName} 👋
        </h1>
        <p className="text-blue-100 text-sm">
          Class {profile?.class}-{profile?.section} &nbsp;|&nbsp; Roll No:{" "}
          {profile?.rollNumber}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center gap-3 mb-2">
                <Icon className={`w-6 h-6 ${s.color}`} />
                <span className="text-sm text-gray-600">{s.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{s.value}</p>
              <p className={`text-xs ${s.subColor}`}>{s.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Fee alerts */}
      {pendingFees.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-red-800 font-medium">Fee Payment Pending</p>
            <p className="text-red-700 text-sm">
              You have {pendingFees.length} unpaid fee(s) totalling PKR{" "}
              {totalDue.toLocaleString()}. Please visit the Fees section.
            </p>
          </div>
        </div>
      )}

      {/* Attendance warning */}
      {attPct > 0 && attPct < 75 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-yellow-800 font-medium">
              Low Attendance Warning
            </p>
            <p className="text-yellow-700 text-sm">
              Your attendance is {attPct}%. Minimum 75% required for
              examinations.
            </p>
          </div>
        </div>
      )}

      {/* Latest notices */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-blue-600" />
          <h2 className="text-gray-900 font-medium">Latest Notices</h2>
        </div>
        {notices.length === 0 ? (
          <p className="text-gray-500 text-sm">No active notices.</p>
        ) : (
          <ul className="space-y-3">
            {notices.map((n) => (
              <li
                key={n.noticeId}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-gray-900 text-sm font-medium">{n.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {new Date(n.postedAt).toLocaleDateString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
// import React, { useEffect, useState } from 'react';
// import { TrendingUp, Calendar, FileText, Bell, DollarSign, Award } from 'lucide-react';
// import { dataService } from '../../services/dataService';
// import { useApp } from '../../contexts/AppContext';
// import { SEO } from '../SEO';

// export function DashboardOverview() {
//   const { currentUser } = useApp();
//   const [stats, setStats] = useState({
//     attendance: 0,
//     averageMarks: 0,
//     pendingFees: 0,
//     achievements: 0
//   });
//   const [recentMarks, setRecentMarks] = useState<any[]>([]);
//   const [notifications, setNotifications] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!currentUser) return;

//     const loadData = async () => {
//       try {
//         const student = dataService.getStudentByUserId(currentUser.id);
//         if (!student) return;

//         // Get attendance data
//         const attendance = dataService.getAttendanceByStudent(student.id);
//         const totalDays = attendance.length;
//         const present = attendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
//         const attendancePercentage = totalDays > 0 ? Math.round((present / totalDays) * 100) : 0;

//         // Get marks data
//         const marks = dataService.getMarksByStudent(student.id);
//         const totalMarksObtained = marks.reduce((sum, m) => sum + m.marksObtained, 0);
//         const totalMarksPossible = marks.reduce((sum, m) => sum + m.totalMarks, 0);
//         const averagePercentage = totalMarksPossible > 0 ? Math.round((totalMarksObtained / totalMarksPossible) * 100) : 0;

//         // Get recent marks (latest 4)
//         const sortedMarks = marks
//           .sort((a, b) => new Date(b.enteredAt).getTime() - new Date(a.enteredAt).getTime())
//           .slice(0, 4);

//         // Get fee data
//         const fees = dataService.getFeesByStudent(student.id);
//         const pendingFee = fees
//           .filter(f => f.status !== 'Paid')
//           .reduce((sum, f) => sum + (f.amount - f.paidAmount), 0);

//         // Get certificates/achievements
//         const certificates = dataService.getCertificatesByStudent(student.id);

//         // Get notifications
//         const userNotifications = dataService.getNotifications(currentUser.id).slice(0, 3);

//         setStats({
//           attendance: attendancePercentage,
//           averageMarks: averagePercentage,
//           pendingFees: pendingFee,
//           achievements: certificates.length
//         });

//         setRecentMarks(sortedMarks);
//         setNotifications(userNotifications);
//       } catch (error) {
//         console.error('Error loading dashboard data:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadData();
//   }, [currentUser]);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-gray-600">Loading dashboard...</div>
//       </div>
//     );
//   }

//   const statCards = [
//     { label: 'Attendance', value: `${stats.attendance}%`, icon: Calendar, color: 'bg-green-500', trend: stats.attendance >= 75 ? 'Good' : 'Low' },
//     { label: 'Average Marks', value: `${stats.averageMarks}%`, icon: TrendingUp, color: 'bg-blue-500', trend: stats.averageMarks >= 75 ? 'Good' : 'Improve' },
//     { label: 'Pending Fees', value: `₹${stats.pendingFees}`, icon: DollarSign, color: 'bg-yellow-500', status: stats.pendingFees === 0 ? 'Paid' : 'Pending' },
//     { label: 'Achievements', value: `${stats.achievements}`, icon: Award, color: 'bg-purple-500' }
//   ];

//   const upcomingExams = [
//     { subject: 'Mathematics', date: '2026-02-15', time: '10:00 AM' },
//     { subject: 'Science', date: '2026-02-17', time: '10:00 AM' },
//     { subject: 'English', date: '2026-02-19', time: '10:00 AM' }
//   ];

//   const formatTimeAgo = (timestamp: string) => {
//     const now = new Date();
//     const then = new Date(timestamp);
//     const diffMs = now.getTime() - then.getTime();
//     const diffMins = Math.floor(diffMs / 60000);
//     const diffHours = Math.floor(diffMins / 60);
//     const diffDays = Math.floor(diffHours / 24);

//     if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
//     if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
//     return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
//   };

//   return (
//     <>
//       <SEO
//         title="Student Dashboard"
//         description="View your academic performance, attendance, upcoming exams, and notifications"
//         keywords="student dashboard, academic performance, attendance, marks, exams"
//       />
//       <div className="space-y-6">
//         <div>
//           <h1 className="text-gray-900 mb-2">Student Dashboard</h1>
//           <p className="text-gray-600">Welcome back! Here's your academic overview</p>
//         </div>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           {statCards.map((stat) => {
//             const Icon = stat.icon;
//             return (
//               <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6">
//                 <div className="flex items-start justify-between mb-4">
//                   <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
//                     <Icon className="w-6 h-6 text-white" aria-hidden="true" />
//                   </div>
//                   {stat.trend && (
//                     <span className={`text-sm ${stat.trend === 'Good' ? 'text-green-600' : 'text-orange-600'}`}>
//                       {stat.trend}
//                     </span>
//                   )}
//                   {stat.status && (
//                     <span className={`text-sm ${stat.status === 'Paid' ? 'text-green-600' : 'text-orange-600'}`}>
//                       {stat.status}
//                     </span>
//                   )}
//                 </div>
//                 <h3 className="text-gray-900">{stat.value}</h3>
//                 <p className="text-gray-600">{stat.label}</p>
//               </div>
//             );
//           })}
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Upcoming Exams */}
//           <div className="bg-white rounded-xl shadow-sm p-6">
//             <div className="flex items-center gap-3 mb-4">
//               <FileText className="w-6 h-6 text-blue-600" aria-hidden="true" />
//               <h2 className="text-gray-900">Upcoming Exams</h2>
//             </div>
//             <div className="space-y-3">
//               {upcomingExams.map((exam, index) => (
//                 <div key={index} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
//                   <div>
//                     <p className="text-gray-900">{exam.subject}</p>
//                     <p className="text-sm text-gray-600">{exam.time}</p>
//                   </div>
//                   <p className="text-sm text-blue-600">{exam.date}</p>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Recent Marks */}
//           <div className="bg-white rounded-xl shadow-sm p-6">
//             <div className="flex items-center gap-3 mb-4">
//               <TrendingUp className="w-6 h-6 text-green-600" aria-hidden="true" />
//               <h2 className="text-gray-900">Latest Marks</h2>
//             </div>
//             <div className="space-y-3">
//               {recentMarks.length > 0 ? (
//                 recentMarks.map((mark, index) => (
//                   <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//                     <div>
//                       <p className="text-gray-900">{mark.subject}</p>
//                       <p className="text-sm text-gray-600">{mark.marksObtained}/{mark.totalMarks}</p>
//                     </div>
//                     <span className={`px-3 py-1 rounded-full text-sm ${
//                       mark.grade.includes('A') ? 'bg-green-100 text-green-700' :
//                       mark.grade.includes('B') ? 'bg-blue-100 text-blue-700' :
//                       'bg-yellow-100 text-yellow-700'
//                     }`}>
//                       {mark.grade}
//                     </span>
//                   </div>
//                 ))
//               ) : (
//                 <p className="text-gray-500 text-center py-4">No marks available yet</p>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Notifications */}
//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <div className="flex items-center gap-3 mb-4">
//             <Bell className="w-6 h-6 text-purple-600" aria-hidden="true" />
//             <h2 className="text-gray-900">Recent Notifications</h2>
//           </div>
//           <div className="space-y-3">
//             {notifications.length > 0 ? (
//               notifications.map((notif) => (
//                 <div key={notif.id} className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
//                   <Bell className="w-5 h-5 text-purple-600 mt-1" aria-hidden="true" />
//                   <div className="flex-1">
//                     <p className="text-gray-900">{notif.message}</p>
//                     <p className="text-sm text-gray-600">{formatTimeAgo(notif.timestamp)}</p>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <p className="text-gray-500 text-center py-4">No new notifications</p>
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }
