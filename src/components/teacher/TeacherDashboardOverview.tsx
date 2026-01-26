import React from 'react';
import { Users, Calendar, FileText, MessageSquare, TrendingUp, AlertCircle } from 'lucide-react';

export function TeacherDashboardOverview() {
  const myClasses = [
    { class: 'Class 10-A', subject: 'Mathematics', students: 45, schedule: 'Mon, Wed, Fri - 9:00 AM' },
    { class: 'Class 9-B', subject: 'Mathematics', students: 42, schedule: 'Tue, Thu - 10:00 AM' },
    { class: 'Class 8-C', subject: 'Mathematics', students: 40, schedule: 'Mon, Wed - 11:00 AM' }
  ];

  const todaySchedule = [
    { time: '9:00 AM', class: 'Class 10-A', subject: 'Mathematics', room: 'Room 201' },
    { time: '11:00 AM', class: 'Class 8-C', subject: 'Mathematics', room: 'Room 205' },
    { time: '2:00 PM', class: 'Class 10-A', subject: 'Mathematics Lab', room: 'Lab 1' }
  ];

  const pendingTasks = [
    { task: 'Mark attendance for Class 10-A', priority: 'High', due: 'Today' },
    { task: 'Enter mid-term marks for Class 9-B', priority: 'High', due: 'Dec 15' },
    { task: 'Upload certificates for Science Fair winners', priority: 'Medium', due: 'Dec 18' },
    { task: 'Respond to 3 parent messages', priority: 'Medium', due: 'Today' }
  ];

  const recentActivity = [
    { activity: 'Marked attendance for Class 10-A', time: '2 hours ago' },
    { activity: 'Posted homework for Class 9-B', time: '5 hours ago' },
    { activity: 'Replied to parent message from Mrs. Sharma', time: '1 day ago' }
  ];

  const stats = [
    { label: 'Total Students', value: '127', icon: Users, color: 'bg-blue-500' },
    { label: 'Classes Today', value: '3', icon: Calendar, color: 'bg-green-500' },
    { label: 'Pending Tasks', value: '4', icon: AlertCircle, color: 'bg-yellow-500' },
    { label: 'Unread Messages', value: '3', icon: MessageSquare, color: 'bg-purple-500' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Teacher Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your teaching overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6">
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-gray-900">{stat.value}</h3>
              <p className="text-gray-600">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Classes */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-blue-600" />
            <h2 className="text-gray-900">My Classes</h2>
          </div>
          <div className="space-y-3">
            {myClasses.map((cls, index) => (
              <div key={index} className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-900">{cls.class}</h3>
                  <span className="text-sm text-blue-600">{cls.students} students</span>
                </div>
                <p className="text-sm text-gray-600">{cls.subject}</p>
                <p className="text-sm text-gray-500">{cls.schedule}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-6 h-6 text-green-600" />
            <h2 className="text-gray-900">Today's Schedule</h2>
          </div>
          <div className="space-y-3">
            {todaySchedule.map((schedule, index) => (
              <div key={index} className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-900">{schedule.time}</h3>
                  <span className="text-sm text-green-600">{schedule.room}</span>
                </div>
                <p className="text-sm text-gray-700">{schedule.class}</p>
                <p className="text-sm text-gray-600">{schedule.subject}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Tasks */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-6 h-6 text-purple-600" />
          <h2 className="text-gray-900">Pending Tasks</h2>
        </div>
        <div className="space-y-3">
          {pendingTasks.map((task, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
              <div className="flex items-center gap-3">
                <input type="checkbox" className="w-5 h-5 rounded border-gray-300" />
                <div>
                  <p className="text-gray-900">{task.task}</p>
                  <p className="text-sm text-gray-600">Due: {task.due}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                task.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {task.priority}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-orange-600" />
          <h2 className="text-gray-900">Recent Activity</h2>
        </div>
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
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
