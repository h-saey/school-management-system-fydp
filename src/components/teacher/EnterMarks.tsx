import React, { useState } from 'react';
import { FileText, Save, Calculator } from 'lucide-react';

export function EnterMarks() {
  const [selectedClass, setSelectedClass] = useState('Class 10-A');
  const [selectedExam, setSelectedExam] = useState('Mid-Term');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');

  const classes = ['Class 10-A', 'Class 9-B', 'Class 8-C'];
  const exams = ['Unit Test 1', 'Unit Test 2', 'Mid-Term', 'Final Term'];
  const subjects = ['Mathematics', 'Science', 'English'];

  const [students, setStudents] = useState([
    { id: 1, rollNo: '01', name: 'Aarav Patel', marks: 88, total: 100, grade: '' },
    { id: 2, rollNo: '02', name: 'Aadhya Sharma', marks: 92, total: 100, grade: '' },
    { id: 3, rollNo: '03', name: 'Advait Kumar', marks: 75, total: 100, grade: '' },
    { id: 4, rollNo: '04', name: 'Ananya Singh', marks: 85, total: 100, grade: '' },
    { id: 5, rollNo: '05', name: 'Arjun Reddy', marks: 78, total: 100, grade: '' },
    { id: 6, rollNo: '06', name: 'Diya Gupta', marks: 90, total: 100, grade: '' },
    { id: 7, rollNo: '07', name: 'Ishaan Verma', marks: 82, total: 100, grade: '' },
    { id: 8, rollNo: '08', name: 'Kavya Nair', marks: 95, total: 100, grade: '' },
    { id: 9, rollNo: '09', name: 'Krish Mehta', marks: 88, total: 100, grade: '' },
    { id: 10, rollNo: '10', name: 'Myra Joshi', marks: 91, total: 100, grade: '' }
  ]);

  const calculateGrade = (marks: number, total: number) => {
    const percentage = (marks / total) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    return 'F';
  };

  const updateMarks = (studentId: number, marks: number) => {
    setStudents(students.map(student => {
      if (student.id === studentId) {
        const grade = calculateGrade(marks, student.total);
        return { ...student, marks, grade };
      }
      return student;
    }));
  };

  const autoCalculateGrades = () => {
    setStudents(students.map(student => ({
      ...student,
      grade: calculateGrade(student.marks, student.total)
    })));
  };

  const handleSubmit = () => {
    alert('Marks submitted successfully! Students and parents will be notified.');
  };

  const averageMarks = (students.reduce((sum, s) => sum + s.marks, 0) / students.length).toFixed(2);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Enter Marks</h1>
        <p className="text-gray-600">Input student marks and auto-calculate grades</p>
      </div>

      {/* Selection Controls */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Select Exam</label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {exams.map((exam) => (
                <option key={exam}>{exam}</option>
              ))}
            </select>
          </div>

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
            <label className="block text-gray-700 mb-2">Select Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {subjects.map((subject) => (
                <option key={subject}>{subject}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={autoCalculateGrades}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-purple-500 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors"
            >
              <Calculator className="w-4 h-4" />
              Auto-Calculate Grades
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <h3 className="text-gray-900">Total Students</h3>
          </div>
          <p className="text-gray-900">{students.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calculator className="w-6 h-6 text-green-600" />
            <h3 className="text-gray-900">Class Average</h3>
          </div>
          <p className="text-gray-900">{averageMarks}%</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-6 h-6 text-purple-600" />
            <h3 className="text-gray-900">Exam Details</h3>
          </div>
          <p className="text-gray-900">{selectedExam}</p>
          <p className="text-sm text-gray-600">{selectedSubject}</p>
        </div>
      </div>

      {/* Marks Entry Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-gray-900">Enter Student Marks</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-gray-700">Roll No</th>
                <th className="px-6 py-4 text-left text-gray-700">Student Name</th>
                <th className="px-6 py-4 text-left text-gray-700">Marks Obtained</th>
                <th className="px-6 py-4 text-left text-gray-700">Total Marks</th>
                <th className="px-6 py-4 text-left text-gray-700">Percentage</th>
                <th className="px-6 py-4 text-left text-gray-700">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-700">{student.rollNo}</td>
                  <td className="px-6 py-4 text-gray-900">{student.name}</td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      value={student.marks}
                      onChange={(e) => updateMarks(student.id, parseInt(e.target.value) || 0)}
                      min="0"
                      max={student.total}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </td>
                  <td className="px-6 py-4 text-gray-700">{student.total}</td>
                  <td className="px-6 py-4 text-gray-700">
                    {((student.marks / student.total) * 100).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      student.grade.includes('A') ? 'bg-green-100 text-green-700' :
                      student.grade.includes('B') ? 'bg-blue-100 text-blue-700' :
                      student.grade.includes('C') ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {student.grade || calculateGrade(student.marks, student.total)}
                    </span>
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
            Submit Marks
          </button>
        </div>
      </div>
    </div>
  );
}
