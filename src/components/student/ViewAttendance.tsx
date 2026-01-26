import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { dataService } from '../../services/dataService';
import { useApp } from '../../contexts/AppContext';
import { SEO } from '../SEO';
import { formatDate } from '../../utils/helpers';

export function ViewAttendance() {
  const { currentUser } = useApp();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));
  const [attendance, setAttendance] = useState<any[]>([]);
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, percentage: 0 });
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const student = dataService.getStudentByUserId(currentUser.id);
    if (!student) return;

    // Get all attendance records
    const allAttendance = dataService.getAttendanceByStudent(student.id);
    setAttendance(allAttendance);

    // Calculate overall stats
    const present = allAttendance.filter(a => a.status === 'Present').length;
    const absent = allAttendance.filter(a => a.status === 'Absent').length;
    const late = allAttendance.filter(a => a.status === 'Late').length;
    const total = allAttendance.length;
    const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    setStats({ present, absent, late, percentage });

    // Calculate monthly trends
    const monthlyMap = new Map();
    allAttendance.forEach(a => {
      const month = a.date.substring(0, 7); // YYYY-MM
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, { present: 0, absent: 0, late: 0 });
      }
      const monthData = monthlyMap.get(month);
      if (a.status === 'Present') monthData.present++;
      else if (a.status === 'Absent') monthData.absent++;
      else if (a.status === 'Late') monthData.late++;
    });

    const monthlyArray = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
        ...data
      }))
      .slice(-6); // Last 6 months

    setMonthlyData(monthlyArray);
    setLoading(false);
  }, [currentUser]);

  const getCalendarDays = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay() || 7; // Monday = 1

    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 1; i < startingDayOfWeek; i++) {
      days.push({ date: null, status: 'empty' });
    }

    // Add days of the month
    for (let date = 1; date <= daysInMonth; date++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
      const dayOfWeek = new Date(year, month - 1, date).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isUpcoming = new Date(dateStr) > new Date();
      
      const attendanceRecord = attendance.find(a => a.date === dateStr);
      
      let status = 'empty';
      if (isUpcoming) status = 'upcoming';
      else if (isWeekend) status = 'weekend';
      else if (attendanceRecord) {
        status = attendanceRecord.status.toLowerCase();
      }

      days.push({ date, status, dateStr });
    }

    return days;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-500 text-white';
      case 'absent':
        return 'bg-red-500 text-white';
      case 'late':
        return 'bg-yellow-500 text-white';
      case 'weekend':
        return 'bg-gray-300 text-gray-600';
      case 'upcoming':
        return 'bg-blue-50 text-blue-600';
      default:
        return 'bg-gray-50';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-gray-600">Loading attendance...</div></div>;
  }

  return (
    <>
      <SEO 
        title="View Attendance" 
        description="Track your attendance record, view monthly calendar, and analyze attendance trends"
        keywords="student attendance, attendance calendar, attendance tracking"
      />
      <div className="space-y-6">
        <div>
          <h1 className="text-gray-900 mb-2">Attendance Overview</h1>
          <p className="text-gray-600">Track your attendance record and trends</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-blue-500" aria-hidden="true" />
              <h3 className="text-gray-900">Attendance Rate</h3>
            </div>
            <p className="text-gray-900">{stats.percentage}%</p>
            <p className={`text-sm ${stats.percentage >= 75 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.percentage >= 75 ? 'Good standing' : 'Below minimum'}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-6 h-6 text-green-500" aria-hidden="true" />
              <h3 className="text-gray-900">Total Present</h3>
            </div>
            <p className="text-gray-900">{stats.present} days</p>
            <p className="text-sm text-green-600">Including on-time arrivals</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <XCircle className="w-6 h-6 text-red-500" aria-hidden="true" />
              <h3 className="text-gray-900">Total Absent</h3>
            </div>
            <p className="text-gray-900">{stats.absent} days</p>
            <p className="text-sm text-red-600">Unauthorized absences</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-6 h-6 text-yellow-500" aria-hidden="true" />
              <h3 className="text-gray-900">Late Arrivals</h3>
            </div>
            <p className="text-gray-900">{stats.late} days</p>
            <p className="text-sm text-yellow-600">Arrived late</p>
          </div>
        </div>

        {/* Monthly Calendar */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-blue-600" aria-hidden="true" />
              <h2 className="text-gray-900">Monthly Attendance Calendar</h2>
            </div>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              max={new Date().toISOString().substring(0, 7)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Select month"
            />
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="text-center text-gray-600 py-2 font-medium">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {getCalendarDays().map((day, index) => (
              <div
                key={index}
                className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium ${
                  day.date ? getStatusColor(day.status) : ''
                }`}
                title={day.dateStr ? `${formatDate(day.dateStr)}: ${day.status}` : ''}
              >
                {day.date || ''}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 mt-6 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded" aria-hidden="true"></div>
              <span className="text-gray-600">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded" aria-hidden="true"></div>
              <span className="text-gray-600">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded" aria-hidden="true"></div>
              <span className="text-gray-600">Late</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-300 rounded" aria-hidden="true"></div>
              <span className="text-gray-600">Weekend</span>
            </div>
          </div>
        </div>

        {/* Attendance Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-purple-600" aria-hidden="true" />
            <h2 className="text-gray-900">Attendance Trends (Last 6 Months)</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" fill="#10b981" name="Present" />
              <Bar dataKey="absent" fill="#ef4444" name="Absent" />
              <Bar dataKey="late" fill="#f59e0b" name="Late" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
