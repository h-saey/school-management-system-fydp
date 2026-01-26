import React, { useEffect, useState } from 'react';
import { TrendingUp, Calendar, FileText, Bell, DollarSign, Award } from 'lucide-react';
import { dataService } from '../../services/dataService';
import { useApp } from '../../contexts/AppContext';
import { SEO } from '../SEO';

export function DashboardOverview() {
  const { currentUser } = useApp();
  const [stats, setStats] = useState({
    attendance: 0,
    averageMarks: 0,
    pendingFees: 0,
    achievements: 0
  });
  const [recentMarks, setRecentMarks] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const loadData = async () => {
      try {
        const student = dataService.getStudentByUserId(currentUser.id);
        if (!student) return;

        // Get attendance data
        const attendance = dataService.getAttendanceByStudent(student.id);
        const totalDays = attendance.length;
        const present = attendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
        const attendancePercentage = totalDays > 0 ? Math.round((present / totalDays) * 100) : 0;

        // Get marks data
        const marks = dataService.getMarksByStudent(student.id);
        const totalMarksObtained = marks.reduce((sum, m) => sum + m.marksObtained, 0);
        const totalMarksPossible = marks.reduce((sum, m) => sum + m.totalMarks, 0);
        const averagePercentage = totalMarksPossible > 0 ? Math.round((totalMarksObtained / totalMarksPossible) * 100) : 0;

        // Get recent marks (latest 4)
        const sortedMarks = marks
          .sort((a, b) => new Date(b.enteredAt).getTime() - new Date(a.enteredAt).getTime())
          .slice(0, 4);

        // Get fee data
        const fees = dataService.getFeesByStudent(student.id);
        const pendingFee = fees
          .filter(f => f.status !== 'Paid')
          .reduce((sum, f) => sum + (f.amount - f.paidAmount), 0);

        // Get certificates/achievements
        const certificates = dataService.getCertificatesByStudent(student.id);

        // Get notifications
        const userNotifications = dataService.getNotifications(currentUser.id).slice(0, 3);

        setStats({
          attendance: attendancePercentage,
          averageMarks: averagePercentage,
          pendingFees: pendingFee,
          achievements: certificates.length
        });

        setRecentMarks(sortedMarks);
        setNotifications(userNotifications);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  const statCards = [
    { label: 'Attendance', value: `${stats.attendance}%`, icon: Calendar, color: 'bg-green-500', trend: stats.attendance >= 75 ? 'Good' : 'Low' },
    { label: 'Average Marks', value: `${stats.averageMarks}%`, icon: TrendingUp, color: 'bg-blue-500', trend: stats.averageMarks >= 75 ? 'Good' : 'Improve' },
    { label: 'Pending Fees', value: `₹${stats.pendingFees}`, icon: DollarSign, color: 'bg-yellow-500', status: stats.pendingFees === 0 ? 'Paid' : 'Pending' },
    { label: 'Achievements', value: `${stats.achievements}`, icon: Award, color: 'bg-purple-500' }
  ];

  const upcomingExams = [
    { subject: 'Mathematics', date: '2026-02-15', time: '10:00 AM' },
    { subject: 'Science', date: '2026-02-17', time: '10:00 AM' },
    { subject: 'English', date: '2026-02-19', time: '10:00 AM' }
  ];

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  return (
    <>
      <SEO 
        title="Student Dashboard" 
        description="View your academic performance, attendance, upcoming exams, and notifications"
        keywords="student dashboard, academic performance, attendance, marks, exams"
      />
      <div className="space-y-6">
        <div>
          <h1 className="text-gray-900 mb-2">Student Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your academic overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" aria-hidden="true" />
                  </div>
                  {stat.trend && (
                    <span className={`text-sm ${stat.trend === 'Good' ? 'text-green-600' : 'text-orange-600'}`}>
                      {stat.trend}
                    </span>
                  )}
                  {stat.status && (
                    <span className={`text-sm ${stat.status === 'Paid' ? 'text-green-600' : 'text-orange-600'}`}>
                      {stat.status}
                    </span>
                  )}
                </div>
                <h3 className="text-gray-900">{stat.value}</h3>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Exams */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-blue-600" aria-hidden="true" />
              <h2 className="text-gray-900">Upcoming Exams</h2>
            </div>
            <div className="space-y-3">
              {upcomingExams.map((exam, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-gray-900">{exam.subject}</p>
                    <p className="text-sm text-gray-600">{exam.time}</p>
                  </div>
                  <p className="text-sm text-blue-600">{exam.date}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Marks */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" aria-hidden="true" />
              <h2 className="text-gray-900">Latest Marks</h2>
            </div>
            <div className="space-y-3">
              {recentMarks.length > 0 ? (
                recentMarks.map((mark, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-gray-900">{mark.subject}</p>
                      <p className="text-sm text-gray-600">{mark.marksObtained}/{mark.totalMarks}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      mark.grade.includes('A') ? 'bg-green-100 text-green-700' : 
                      mark.grade.includes('B') ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {mark.grade}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No marks available yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-6 h-6 text-purple-600" aria-hidden="true" />
            <h2 className="text-gray-900">Recent Notifications</h2>
          </div>
          <div className="space-y-3">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div key={notif.id} className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
                  <Bell className="w-5 h-5 text-purple-600 mt-1" aria-hidden="true" />
                  <div className="flex-1">
                    <p className="text-gray-900">{notif.message}</p>
                    <p className="text-sm text-gray-600">{formatTimeAgo(notif.timestamp)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No new notifications</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}