import React from 'react';
import { Calendar, TrendingUp, DollarSign, Bell, User, Award } from 'lucide-react';

export function ParentDashboardOverview() {
  const childInfo = {
    name: 'Rahul Sharma',
    class: 'Class 10-A',
    rollNumber: '15',
    section: 'A'
  };

  const stats = [
    { label: 'Attendance', value: '92%', icon: Calendar, color: 'bg-green-500', status: 'Good' },
    { label: 'Average Marks', value: '85%', icon: TrendingUp, color: 'bg-blue-500', trend: '+5%' },
    { label: 'Fee Status', value: 'Paid', icon: DollarSign, color: 'bg-yellow-500', due: '₹0' },
    { label: 'Class Rank', value: '3rd', icon: Award, color: 'bg-purple-500', total: '/45' }
  ];

  const upcomingEvents = [
    { event: 'Final Examinations', date: '2026-01-15', type: 'Exam' },
    { event: 'Parent-Teacher Meeting', date: '2025-12-20', type: 'Meeting' },
    { event: 'Winter Vacation Starts', date: '2025-12-25', type: 'Holiday' }
  ];

  const recentMarks = [
    { subject: 'Mathematics', marks: 88, total: 100, grade: 'A' },
    { subject: 'Science', marks: 92, total: 100, grade: 'A+' },
    { subject: 'English', marks: 78, total: 100, grade: 'B+' }
  ];

  const alerts = [
    { message: 'Parent-Teacher meeting scheduled for Dec 20', type: 'event', time: '2 hours ago' },
    { message: 'All fees cleared for current term', type: 'success', time: '1 day ago' },
    { message: 'Final exam schedule released', type: 'info', time: '2 days ago' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Parent Dashboard</h1>
        <p className="text-gray-600">Monitor your child's academic progress and school activities</p>
      </div>

      {/* Child Info Card */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="mb-1">{childInfo.name}</h2>
            <p className="text-green-100">
              {childInfo.class} • Roll No: {childInfo.rollNumber} • Section: {childInfo.section}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                {stat.status && (
                  <span className="text-sm text-green-600">{stat.status}</span>
                )}
                {stat.trend && (
                  <span className="text-sm text-blue-600">{stat.trend}</span>
                )}
                {stat.total && (
                  <span className="text-sm text-gray-600">{stat.total}</span>
                )}
              </div>
              <h3 className="text-gray-900">{stat.value}</h3>
              <p className="text-gray-600">{stat.label}</p>
              {stat.due && (
                <p className="text-sm text-gray-500 mt-1">Outstanding: {stat.due}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-6 h-6 text-green-600" />
            <h2 className="text-gray-900">Upcoming Events</h2>
          </div>
          <div className="space-y-3">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-gray-900">{event.event}</p>
                  <p className="text-sm text-green-600">{event.type}</p>
                </div>
                <p className="text-sm text-gray-600">{event.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Marks */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h2 className="text-gray-900">Latest Marks</h2>
          </div>
          <div className="space-y-3">
            {recentMarks.map((mark, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-gray-900">{mark.subject}</p>
                  <p className="text-sm text-gray-600">{mark.marks}/{mark.total}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  mark.grade.includes('A') ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {mark.grade}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts & Notifications */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-6 h-6 text-purple-600" />
          <h2 className="text-gray-900">Recent Alerts</h2>
        </div>
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <div key={index} className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
              <Bell className="w-5 h-5 text-purple-600 mt-1" />
              <div className="flex-1">
                <p className="text-gray-900">{alert.message}</p>
                <p className="text-sm text-gray-600">{alert.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
