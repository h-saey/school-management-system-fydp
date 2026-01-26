import React from 'react';
import { Users, BookOpen, Calendar, DollarSign, AlertCircle, Bell, TrendingUp } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function AdminDashboardOverview() {
  const stats = [
    { label: 'Total Students', value: '1,245', icon: Users, color: 'bg-blue-500', change: '+45 this month' },
    { label: 'Total Teachers', value: '87', icon: BookOpen, color: 'bg-green-500', change: '+3 this month' },
    { label: 'Avg Attendance', value: '91.5%', icon: Calendar, color: 'bg-purple-500', change: '+2.5%' },
    { label: 'Fee Collection', value: '₹45.2L', icon: DollarSign, color: 'bg-yellow-500', change: '89% collected' },
    { label: 'Active Complaints', value: '12', icon: AlertCircle, color: 'bg-red-500', change: '-3 from last week' },
    { label: 'Recent Notices', value: '8', icon: Bell, color: 'bg-indigo-500', change: 'This week' }
  ];

  const attendanceData = [
    { month: 'Aug', attendance: 89 },
    { month: 'Sep', attendance: 90 },
    { month: 'Oct', attendance: 88 },
    { month: 'Nov', attendance: 92 },
    { month: 'Dec', attendance: 91.5 }
  ];

  const feeData = [
    { name: 'Paid', value: 89, color: '#10b981' },
    { name: 'Pending', value: 8, color: '#f59e0b' },
    { name: 'Overdue', value: 3, color: '#ef4444' }
  ];

  const classPerformance = [
    { class: 'Class 6', average: 78 },
    { class: 'Class 7', average: 80 },
    { class: 'Class 8', average: 82 },
    { class: 'Class 9', average: 79 },
    { class: 'Class 10', average: 85 }
  ];

  const recentActivities = [
    { activity: 'New student admission - Class 8-B', time: '1 hour ago' },
    { activity: 'Teacher marked attendance for Class 10-A', time: '2 hours ago' },
    { activity: 'Fee payment received from 15 students', time: '3 hours ago' },
    { activity: 'New notice posted - Winter Vacation', time: '5 hours ago' },
    { activity: 'Complaint resolved - Library facility', time: '1 day ago' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Complete school management overview and analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600 mb-2">{stat.label}</p>
              <p className="text-sm text-gray-500">{stat.change}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h2 className="text-gray-900">School-wide Attendance Trend</h2>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="attendance" stroke="#3b82f6" strokeWidth={2} name="Attendance %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Fee Collection Status */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-6 h-6 text-green-600" />
            <h2 className="text-gray-900">Fee Collection Status</h2>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={feeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {feeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Class Performance */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart className="w-6 h-6 text-purple-600" />
          <h2 className="text-gray-900">Class-wise Performance</h2>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={classPerformance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="class" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="average" fill="#8b5cf6" name="Average %" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-6 h-6 text-orange-600" />
          <h2 className="text-gray-900">Recent Activities</h2>
        </div>
        <div className="space-y-3">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-900">{activity.activity}</p>
              <span className="text-sm text-gray-600">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
