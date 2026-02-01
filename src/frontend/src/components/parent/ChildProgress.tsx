import React, { useState } from 'react';
import { TrendingUp, Award, FileText, MessageSquare } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function ChildProgress() {
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');

  const subjects = ['All Subjects', 'Mathematics', 'Science', 'English', 'History', 'Geography'];

  const subjectMarks = [
    { 
      subject: 'Mathematics', 
      marks: 88, 
      total: 100, 
      grade: 'A',
      improvement: '+5%',
      teacherRemarks: 'Excellent performance. Shows strong analytical skills.',
      suggestions: 'Continue practicing advanced problem-solving.'
    },
    { 
      subject: 'Science', 
      marks: 92, 
      total: 100, 
      grade: 'A+',
      improvement: '+8%',
      teacherRemarks: 'Outstanding work in practicals. Very curious and engaged.',
      suggestions: 'Encourage participation in science olympiad.'
    },
    { 
      subject: 'English', 
      marks: 78, 
      total: 100, 
      grade: 'B+',
      improvement: '+2%',
      teacherRemarks: 'Good effort. Needs improvement in grammar.',
      suggestions: 'More reading and writing practice recommended.'
    },
    { 
      subject: 'History', 
      marks: 85, 
      total: 100, 
      grade: 'A',
      improvement: '+6%',
      teacherRemarks: 'Very good analytical and presentation skills.',
      suggestions: 'Explore documentaries and historical literature.'
    },
    { 
      subject: 'Geography', 
      marks: 81, 
      total: 100, 
      grade: 'A-',
      improvement: '+4%',
      teacherRemarks: 'Strong map work skills. Good understanding of concepts.',
      suggestions: 'Focus on case studies and practical applications.'
    }
  ];

  const progressData = [
    { month: 'Aug', percentage: 78 },
    { month: 'Sep', percentage: 80 },
    { month: 'Oct', percentage: 82 },
    { month: 'Nov', percentage: 84 },
    { month: 'Dec', percentage: 85 }
  ];

  const filteredMarks = selectedSubject === 'All Subjects' 
    ? subjectMarks 
    : subjectMarks.filter(m => m.subject === selectedSubject);

  const totalMarks = subjectMarks.reduce((sum, m) => sum + m.marks, 0);
  const totalPossible = subjectMarks.reduce((sum, m) => sum + m.total, 0);
  const overallPercentage = ((totalMarks / totalPossible) * 100).toFixed(2);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Child's Academic Progress</h1>
        <p className="text-gray-600">Detailed performance analysis and teacher feedback</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h3 className="text-gray-900">Overall Performance</h3>
          </div>
          <p className="text-gray-900">{overallPercentage}%</p>
          <p className="text-sm text-blue-600">Consistent improvement</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-6 h-6 text-green-600" />
            <h3 className="text-gray-900">Class Rank</h3>
          </div>
          <p className="text-gray-900">3rd out of 45</p>
          <p className="text-sm text-green-600">Top 10% of class</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-6 h-6 text-purple-600" />
            <h3 className="text-gray-900">Subjects Evaluated</h3>
          </div>
          <p className="text-gray-900">5 Subjects</p>
          <p className="text-sm text-purple-600">Mid-term results</p>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-gray-900 mb-6">Performance Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={progressData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="percentage" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Overall Percentage"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Subject Filter */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <label className="block text-gray-700 mb-2">Filter by Subject</label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {subjects.map((subject) => (
            <option key={subject}>{subject}</option>
          ))}
        </select>
      </div>

      {/* Subject-wise Details */}
      <div className="space-y-4">
        {filteredMarks.map((mark, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-gray-900 mb-2">{mark.subject}</h3>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-600">Marks: {mark.marks}/{mark.total}</span>
                  <span className={`px-3 py-1 rounded-full ${
                    mark.grade.includes('A') ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    Grade: {mark.grade}
                  </span>
                  <span className="text-green-600">{mark.improvement} improvement</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-blue-600 mt-1" />
                  <p className="text-sm text-gray-700">
                    <strong>Teacher's Remarks:</strong>
                  </p>
                </div>
                <p className="text-sm text-gray-700">{mark.teacherRemarks}</p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-start gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-600 mt-1" />
                  <p className="text-sm text-gray-700">
                    <strong>Improvement Suggestions:</strong>
                  </p>
                </div>
                <p className="text-sm text-gray-700">{mark.suggestions}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
