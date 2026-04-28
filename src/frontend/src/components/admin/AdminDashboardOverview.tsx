import React, { useEffect, useState } from "react";
import {
  Users,
  BookOpen,
  Calendar,
  DollarSign,
  AlertCircle,
  TrendingUp,
  BarChart,
} from "lucide-react";

import {
  BarChart as ReBarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { API_BASE } from "../../services/api";

export function AdminDashboardOverview() {
  // ---------------- STATE ----------------
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ---------------- FETCH BACKEND ----------------
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_BASE}/admin/dashboard-stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        setDashboard(data);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // ---------------- LOADING STATE ----------------
  if (loading || !dashboard) {
    return <div className="p-6 text-gray-600">Loading dashboard...</div>;
  }

  // ---------------- SAFE DATA ----------------
  const stats = [
    {
      label: "Total Students",
      value: dashboard.totalStudents,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      label: "Total Teachers",
      value: dashboard.totalTeachers,
      icon: BookOpen,
      color: "bg-green-500",
    },
    {
      label: "Total Parents",
      value: dashboard.totalParents,
      icon: Users,
      color: "bg-purple-500",
    },
    {
      label: "Active Users",
      value: dashboard.activeUsers,
      icon: TrendingUp,
      color: "bg-indigo-500",
    },
    {
      label: "Open Complaints",
      value: dashboard.openComplaints,
      icon: AlertCircle,
      color: "bg-red-500",
    },
    {
      label: "Overdue Fees",
      value: dashboard.overdueFees,
      icon: DollarSign,
      color: "bg-yellow-500",
    },
  ];

  // ---------------- BACKEND GRAPH DATA ----------------
  const attendanceData = dashboard.attendanceTrend || [];

  const classPerformance = dashboard.classPerformance || [];

  const feeBreakdown = dashboard.feeBreakdown || {
    paid: 0,
    pending: 0,
    overdue: 0,
  };

  const feeData = [
    { name: "Paid", value: feeBreakdown.paid, color: "#10b981" },
    { name: "Pending", value: feeBreakdown.pending, color: "#f59e0b" },
    { name: "Overdue", value: feeBreakdown.overdue, color: "#ef4444" },
  ];

  const recentActivities = dashboard.recentActivities || [];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">
          Real-time school analytics (backend-driven)
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6">
              <div
                className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>

              <h3 className="text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* GRAPHS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ATTENDANCE */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="mb-4">Attendance Trend</h2>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="attendance" stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* FEES */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="mb-4">Fee Breakdown</h2>

          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={feeData}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={80}
              >
                {feeData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CLASS PERFORMANCE */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="mb-4">Class Performance</h2>

        <ResponsiveContainer width="100%" height={250}>
          <ReBarChart data={classPerformance}>
            <CartesianGrid />
            <XAxis dataKey="class" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="average" fill="#8b5cf6" />
          </ReBarChart>
        </ResponsiveContainer>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="mb-4">Recent Activity</h2>

        {recentActivities.length === 0 ? (
          <p className="text-gray-500">No recent activity</p>
        ) : (
          recentActivities.map((a: any, i: number) => (
            <div
              key={i}
              className="flex justify-between p-3 bg-gray-50 rounded mb-2"
            >
              <span>{a.activity}</span>
              <span className="text-sm text-gray-500">{a.time}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// import React from 'react';
// import { Users, BookOpen, Calendar, DollarSign, AlertCircle, Bell, TrendingUp } from 'lucide-react';
// import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// export function AdminDashboardOverview() {
//   const stats = [
//     { label: 'Total Students', value: '1,245', icon: Users, color: 'bg-blue-500', change: '+45 this month' },
//     { label: 'Total Teachers', value: '87', icon: BookOpen, color: 'bg-green-500', change: '+3 this month' },
//     { label: 'Avg Attendance', value: '91.5%', icon: Calendar, color: 'bg-purple-500', change: '+2.5%' },
//     { label: 'Fee Collection', value: '₹45.2L', icon: DollarSign, color: 'bg-yellow-500', change: '89% collected' },
//     { label: 'Active Complaints', value: '12', icon: AlertCircle, color: 'bg-red-500', change: '-3 from last week' },
//     { label: 'Recent Notices', value: '8', icon: Bell, color: 'bg-indigo-500', change: 'This week' }
//   ];

//   const attendanceData = [
//     { month: 'Aug', attendance: 89 },
//     { month: 'Sep', attendance: 90 },
//     { month: 'Oct', attendance: 88 },
//     { month: 'Nov', attendance: 92 },
//     { month: 'Dec', attendance: 91.5 }
//   ];

//   const feeData = [
//     { name: 'Paid', value: 89, color: '#10b981' },
//     { name: 'Pending', value: 8, color: '#f59e0b' },
//     { name: 'Overdue', value: 3, color: '#ef4444' }
//   ];

//   const classPerformance = [
//     { class: 'Class 6', average: 78 },
//     { class: 'Class 7', average: 80 },
//     { class: 'Class 8', average: 82 },
//     { class: 'Class 9', average: 79 },
//     { class: 'Class 10', average: 85 }
//   ];

//   const recentActivities = [
//     { activity: 'New student admission - Class 8-B', time: '1 hour ago' },
//     { activity: 'Teacher marked attendance for Class 10-A', time: '2 hours ago' },
//     { activity: 'Fee payment received from 15 students', time: '3 hours ago' },
//     { activity: 'New notice posted - Winter Vacation', time: '5 hours ago' },
//     { activity: 'Complaint resolved - Library facility', time: '1 day ago' }
//   ];

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-gray-900 mb-2">Admin Dashboard</h1>
//         <p className="text-gray-600">Complete school management overview and analytics</p>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {stats.map((stat) => {
//           const Icon = stat.icon;
//           return (
//             <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6">
//               <div className="flex items-start justify-between mb-4">
//                 <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
//                   <Icon className="w-6 h-6 text-white" />
//                 </div>
//               </div>
//               <h3 className="text-gray-900 mb-1">{stat.value}</h3>
//               <p className="text-gray-600 mb-2">{stat.label}</p>
//               <p className="text-sm text-gray-500">{stat.change}</p>
//             </div>
//           );
//         })}
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Attendance Trend */}
//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <div className="flex items-center gap-3 mb-6">
//             <TrendingUp className="w-6 h-6 text-blue-600" />
//             <h2 className="text-gray-900">School-wide Attendance Trend</h2>
//           </div>
//           <ResponsiveContainer width="100%" height={250}>
//             <LineChart data={attendanceData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="month" />
//               <YAxis domain={[0, 100]} />
//               <Tooltip />
//               <Legend />
//               <Line type="monotone" dataKey="attendance" stroke="#3b82f6" strokeWidth={2} name="Attendance %" />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Fee Collection Status */}
//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <div className="flex items-center gap-3 mb-6">
//             <DollarSign className="w-6 h-6 text-green-600" />
//             <h2 className="text-gray-900">Fee Collection Status</h2>
//           </div>
//           <ResponsiveContainer width="100%" height={250}>
//             <PieChart>
//               <Pie
//                 data={feeData}
//                 cx="50%"
//                 cy="50%"
//                 labelLine={false}
//                 label={({ name, value }) => `${name}: ${value}%`}
//                 outerRadius={80}
//                 fill="#8884d8"
//                 dataKey="value"
//               >
//                 {feeData.map((entry, index) => (
//                   <Cell key={`cell-${index}`} fill={entry.color} />
//                 ))}
//               </Pie>
//               <Tooltip />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       {/* Class Performance */}
//       <div className="bg-white rounded-xl shadow-sm p-6">
//         <div className="flex items-center gap-3 mb-6">
//           <BarChart className="w-6 h-6 text-purple-600" />
//           <h2 className="text-gray-900">Class-wise Performance</h2>
//         </div>
//         <ResponsiveContainer width="100%" height={250}>
//           <BarChart data={classPerformance}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="class" />
//             <YAxis domain={[0, 100]} />
//             <Tooltip />
//             <Legend />
//             <Bar dataKey="average" fill="#8b5cf6" name="Average %" />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>

//       {/* Recent Activities */}
//       <div className="bg-white rounded-xl shadow-sm p-6">
//         <div className="flex items-center gap-3 mb-6">
//           <Bell className="w-6 h-6 text-orange-600" />
//           <h2 className="text-gray-900">Recent Activities</h2>
//         </div>
//         <div className="space-y-3">
//           {recentActivities.map((activity, index) => (
//             <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//               <p className="text-gray-900">{activity.activity}</p>
//               <span className="text-sm text-gray-600">{activity.time}</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
