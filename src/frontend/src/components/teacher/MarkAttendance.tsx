import React, { useState } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, Save } from 'lucide-react';

export function MarkAttendance() {
  const [selectedClass, setSelectedClass] = useState('Class 10-A');
  const [selectedDate, setSelectedDate] = useState('2025-12-11');

  const classes = ['Class 10-A', 'Class 9-B', 'Class 8-C'];

  const [students, setStudents] = useState([
    { id: 1, rollNo: '01', name: 'Aarav Patel', status: 'present' },
    { id: 2, rollNo: '02', name: 'Aadhya Sharma', status: 'present' },
    { id: 3, rollNo: '03', name: 'Advait Kumar', status: 'present' },
    { id: 4, rollNo: '04', name: 'Ananya Singh', status: 'absent' },
    { id: 5, rollNo: '05', name: 'Arjun Reddy', status: 'present' },
    { id: 6, rollNo: '06', name: 'Diya Gupta', status: 'present' },
    { id: 7, rollNo: '07', name: 'Ishaan Verma', status: 'leave' },
    { id: 8, rollNo: '08', name: 'Kavya Nair', status: 'present' },
    { id: 9, rollNo: '09', name: 'Krish Mehta', status: 'present' },
    { id: 10, rollNo: '10', name: 'Myra Joshi', status: 'present' }
  ]);

  const updateAttendance = (studentId: number, status: 'present' | 'absent' | 'leave') => {
    setStudents(students.map(student => 
      student.id === studentId ? { ...student, status } : student
    ));
  };

  const markAll = (status: 'present' | 'absent') => {
    setStudents(students.map(student => ({ ...student, status })));
  };

  const handleSubmit = () => {
    // Handle attendance submission
    alert('Attendance submitted successfully! Students and parents will be notified.');
  };

  const presentCount = students.filter(s => s.status === 'present').length;
  const absentCount = students.filter(s => s.status === 'absent').length;
  const leaveCount = students.filter(s => s.status === 'leave').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Mark Attendance</h1>
        <p className="text-gray-600">Record daily attendance for your classes</p>
      </div>

      {/* Selection Controls */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {classes.map((cls) => (
                <option key={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={() => markAll('present')}
              className="flex-1 px-4 py-2 border border-green-500 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
            >
              Mark All Present
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h3 className="text-gray-900">Total Students</h3>
          </div>
          <p className="text-gray-900">{students.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h3 className="text-gray-900">Present</h3>
          </div>
          <p className="text-gray-900">{presentCount}</p>
          <p className="text-sm text-green-600">{((presentCount/students.length)*100).toFixed(1)}%</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="w-6 h-6 text-red-600" />
            <h3 className="text-gray-900">Absent</h3>
          </div>
          <p className="text-gray-900">{absentCount}</p>
          <p className="text-sm text-red-600">{((absentCount/students.length)*100).toFixed(1)}%</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 text-yellow-600" />
            <h3 className="text-gray-900">On Leave</h3>
          </div>
          <p className="text-gray-900">{leaveCount}</p>
          <p className="text-sm text-yellow-600">{((leaveCount/students.length)*100).toFixed(1)}%</p>
        </div>
      </div>

      {/* Attendance Grid */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-gray-900">Student Attendance List</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-gray-700">Roll No</th>
                <th className="px-6 py-4 text-left text-gray-700">Student Name</th>
                <th className="px-6 py-4 text-center text-gray-700">Present</th>
                <th className="px-6 py-4 text-center text-gray-700">Absent</th>
                <th className="px-6 py-4 text-center text-gray-700">Leave</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-700">{student.rollNo}</td>
                  <td className="px-6 py-4 text-gray-900">{student.name}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => updateAttendance(student.id, 'present')}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto transition-colors ${
                        student.status === 'present' 
                          ? 'bg-green-500 text-white' 
                          : 'border border-gray-300 text-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      P
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => updateAttendance(student.id, 'absent')}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto transition-colors ${
                        student.status === 'absent' 
                          ? 'bg-red-500 text-white' 
                          : 'border border-gray-300 text-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      A
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => updateAttendance(student.id, 'leave')}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto transition-colors ${
                        student.status === 'leave' 
                          ? 'bg-yellow-500 text-white' 
                          : 'border border-gray-300 text-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      L
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t bg-gray-50">
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            Submit Attendance
          </button>
        </div>
      </div>
    </div>
  );
}
