import React, { useState } from 'react';
import { Calendar, FileText, Edit, Download } from 'lucide-react';

export function ManageAttendanceMarks() {
  const [activeTab, setActiveTab] = useState<'attendance' | 'marks'>('attendance');

  const attendanceRecords = [
    { class: 'Class 10-A', date: '2025-12-11', present: 42, absent: 3, percentage: '93.3%', teacher: 'Dr. Singh' },
    { class: 'Class 9-B', date: '2025-12-11', present: 39, absent: 3, percentage: '92.9%', teacher: 'Mr. Kumar' },
    { class: 'Class 8-C', date: '2025-12-11', present: 38, absent: 2, percentage: '95.0%', teacher: 'Mrs. Sharma' }
  ];

  const marksRecords = [
    { class: 'Class 10-A', exam: 'Mid-Term', subject: 'Mathematics', avgMarks: 85, teacher: 'Dr. Singh', status: 'Completed' },
    { class: 'Class 9-B', exam: 'Mid-Term', subject: 'Science', avgMarks: 82, teacher: 'Mr. Kumar', status: 'Completed' },
    { class: 'Class 10-A', exam: 'Unit Test 2', subject: 'English', avgMarks: 78, teacher: 'Mrs. Sharma', status: 'Pending' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Manage Attendance & Marks</h1>
        <p className="text-gray-600">Override entries and generate school-wide reports</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'attendance' ? 'bg-red-600 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Attendance Records
          </button>
          <button
            onClick={() => setActiveTab('marks')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'marks' ? 'bg-red-600 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            Marks Records
          </button>
        </div>
      </div>

      {activeTab === 'attendance' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-gray-900">Attendance Records</h2>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-gray-700">Class</th>
                  <th className="px-6 py-4 text-left text-gray-700">Date</th>
                  <th className="px-6 py-4 text-left text-gray-700">Present</th>
                  <th className="px-6 py-4 text-left text-gray-700">Absent</th>
                  <th className="px-6 py-4 text-left text-gray-700">Percentage</th>
                  <th className="px-6 py-4 text-left text-gray-700">Teacher</th>
                  <th className="px-6 py-4 text-left text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendanceRecords.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900">{record.class}</td>
                    <td className="px-6 py-4 text-gray-700">{record.date}</td>
                    <td className="px-6 py-4 text-green-600">{record.present}</td>
                    <td className="px-6 py-4 text-red-600">{record.absent}</td>
                    <td className="px-6 py-4 text-gray-700">{record.percentage}</td>
                    <td className="px-6 py-4 text-gray-700">{record.teacher}</td>
                    <td className="px-6 py-4">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'marks' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-gray-900">Marks Records</h2>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-gray-700">Class</th>
                  <th className="px-6 py-4 text-left text-gray-700">Exam</th>
                  <th className="px-6 py-4 text-left text-gray-700">Subject</th>
                  <th className="px-6 py-4 text-left text-gray-700">Avg Marks</th>
                  <th className="px-6 py-4 text-left text-gray-700">Teacher</th>
                  <th className="px-6 py-4 text-left text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {marksRecords.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900">{record.class}</td>
                    <td className="px-6 py-4 text-gray-700">{record.exam}</td>
                    <td className="px-6 py-4 text-gray-700">{record.subject}</td>
                    <td className="px-6 py-4 text-gray-700">{record.avgMarks}%</td>
                    <td className="px-6 py-4 text-gray-700">{record.teacher}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        record.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
