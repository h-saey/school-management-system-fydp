import React, { useState, useEffect } from "react";
import {
  Users,
  GraduationCap,
  BookOpen,
  Activity,
  MessageSquare,
  DollarSign,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { getDashboardStats } from "../../services/api";
import { ToastContainer } from "../../utils/useToast";
import { useToast } from "../../utils/useToast";

type DashboardData = {
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  activeUsers: number;
  openComplaints: number;
  overdueFees: number;

  studentGrowth: { month: string; count: number }[];
  complaintTrend: { month: string; totalComplaints: number }[];
  feeCollectionTrend: { month: string; totalPaidFees: number }[];
  classPerformance: { class: string; average: number }[];
  lowAttendance: { class: string; attendanceRate: number }[];
  attendanceTrend: { month: string; attendance: number }[];
  feeBreakdown: { paid: number; pending: number; overdue: number };
  recentActivities: { activity: string; time: string }[];
};

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6"];

export function AdminDashboardOverview() {
  const { toasts, error } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((d) => setData(d))
      .catch((err) => error(err.message ?? "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 text-center">
          <Activity className="w-10 h-10 mx-auto mb-3 animate-pulse text-red-500" />
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">
          Failed to load dashboard. Please refresh.
        </p>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Students",
      value: data.totalStudents,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Total Teachers",
      value: data.totalTeachers,
      icon: GraduationCap,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Total Parents",
      value: data.totalParents,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Active Users",
      value: data.activeUsers,
      icon: Activity,
      color: "text-cyan-600",
      bg: "bg-cyan-50",
    },
    {
      label: "Open Complaints",
      value: data.openComplaints,
      icon: MessageSquare,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "Overdue Fees",
      value: data.overdueFees,
      icon: DollarSign,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} />

      {/* HEADER */}
      <div>
        <h1 className="text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">
          Live overview of your school management system
        </p>
      </div>

      {/* ── STAT CARDS ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4"
          >
            <div className={`p-3 rounded-xl ${card.bg}`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">{card.label}</p>
              <p className="text-gray-900 text-2xl font-bold">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── ROW 1: Student Growth + Complaint Trend ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Monthly Student Growth */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-red-600" />
            <h2 className="text-gray-900">Monthly Student Growth</h2>
          </div>
          {data.studentGrowth.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              No data for last 6 months
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.studentGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  allowDecimals={false}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="New Students"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: "#ef4444", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 2. Complaint Trend */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-orange-600" />
            <h2 className="text-gray-900">Complaint Trend</h2>
          </div>
          {data.complaintTrend.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              No complaint data
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.complaintTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  allowDecimals={false}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="totalComplaints"
                  name="Complaints"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ fill: "#f97316", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── ROW 2: Fee Collection + Attendance Trend ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3. Fee Collection Trend */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h2 className="text-gray-900">Fee Collection Trend</h2>
          </div>
          {data.feeCollectionTrend.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              No fee collection data
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.feeCollectionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                />
                <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                <Tooltip
                  formatter={(v: number) => [
                    `PKR ${v.toLocaleString()}`,
                    "Collected",
                  ]}
                />
                <Bar
                  dataKey="totalPaidFees"
                  name="Fees Collected"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Attendance Trend */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h2 className="text-gray-900">Attendance Trend (%)</h2>
          </div>
          {data.attendanceTrend.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              No attendance trend data
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                />
                <Tooltip formatter={(v: number) => [`${v}%`, "Attendance"]} />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  name="Attendance %"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── ROW 3: Top Classes + Low Attendance Warning ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 4. Top Performing Classes */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-5 h-5 text-purple-600" />
            <h2 className="text-gray-900">Top Performing Classes</h2>
          </div>
          {data.classPerformance.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              No marks data available
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.classPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                />
                <YAxis
                  dataKey="class"
                  type="category"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  width={70}
                />
                <Tooltip formatter={(v: number) => [`${v}%`, "Average"]} />
                <Bar dataKey="average" name="Avg %" radius={[0, 4, 4, 0]}>
                  {data.classPerformance.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 5. Low Attendance Warning */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <h2 className="text-gray-900">Low Attendance Warning</h2>
            <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full ml-auto">
              Below 75%
            </span>
          </div>
          {data.lowAttendance.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-green-600">
              <Activity className="w-8 h-8" />
              <p className="text-sm font-medium">
                All classes above 75% — Great!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.lowAttendance.map((item) => (
                <div
                  key={item.class}
                  className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                >
                  <span className="text-gray-900 font-medium">
                    {item.class}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${item.attendanceRate}%` }}
                      />
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        item.attendanceRate < 50
                          ? "text-red-600"
                          : "text-yellow-700"
                      }`}
                    >
                      {item.attendanceRate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── ROW 4: Fee Breakdown + Recent Activities ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fee Breakdown */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-red-600" />
            <h2 className="text-gray-900">Fee Breakdown</h2>
          </div>
          <div className="space-y-4">
            {[
              {
                label: "Paid",
                value: data.feeBreakdown.paid,
                color: "bg-green-500",
                text: "text-green-700",
              },
              {
                label: "Pending",
                value: data.feeBreakdown.pending,
                color: "bg-yellow-500",
                text: "text-yellow-700",
              },
              {
                label: "Overdue",
                value: data.feeBreakdown.overdue,
                color: "bg-red-500",
                text: "text-red-700",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-gray-700">{item.label}</span>
                </div>
                <span className={`font-semibold ${item.text}`}>
                  PKR{" "}
                  {item.value.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-gray-600" />
            <h2 className="text-gray-900">Recent Activities</h2>
          </div>
          {data.recentActivities.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              No recent activities
            </p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {data.recentActivities.map((a, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                    <p className="text-gray-700 text-sm">{a.activity}</p>
                  </div>
                  <span className="text-gray-400 text-xs flex-shrink-0">
                    {a.time}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
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
