import React, { useState } from 'react';
import { BarChart, Download, FileText, TrendingUp, Calendar } from 'lucide-react';

export function DataReporting() {
  const [reportType, setReportType] = useState('attendance');

  const reports = [
    { name: 'Monthly Attendance Report', type: 'attendance', description: 'Class-wise attendance summary for the month', lastGenerated: '2025-12-01' },
    { name: 'Result Summary Report', type: 'results', description: 'Exam-wise performance analysis and grades', lastGenerated: '2025-11-25' },
    { name: 'Fee Collection Report', type: 'fees', description: 'Payment status and collection summary', lastGenerated: '2025-12-05' },
    { name: 'Student Performance Report', type: 'performance', description: 'Individual student academic progress tracking', lastGenerated: '2025-11-20' },
    { name: 'Teacher Activity Report', type: 'teacher', description: 'Teacher attendance marking and marks entry log', lastGenerated: '2025-12-08' },
    { name: 'Risk Indicators Report', type: 'risk', description: 'Students with low attendance or poor performance', lastGenerated: '2025-12-10' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Data Reporting & Analytics</h1>
        <p className="text-gray-600">Generate comprehensive reports and download data</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h3 className="text-gray-900">Avg Attendance</h3>
          </div>
          <p className="text-gray-900">91.5%</p>
          <p className="text-sm text-blue-600">This month</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <h3 className="text-gray-900">Avg Performance</h3>
          </div>
          <p className="text-gray-900">82.3%</p>
          <p className="text-sm text-green-600">Mid-term exams</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-6 h-6 text-purple-600" />
            <h3 className="text-gray-900">Total Students</h3>
          </div>
          <p className="text-gray-900">1,245</p>
          <p className="text-sm text-purple-600">Active enrollment</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <BarChart className="w-6 h-6 text-orange-600" />
            <h3 className="text-gray-900">Reports Generated</h3>
          </div>
          <p className="text-gray-900">24</p>
          <p className="text-sm text-orange-600">This month</p>
        </div>
      </div>

      {/* Report Generator */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-gray-900 mb-6">Generate Custom Report</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 mb-2">Report Type</label>
            <select 
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="attendance">Attendance Report</option>
              <option value="results">Results Report</option>
              <option value="fees">Fee Collection Report</option>
              <option value="performance">Performance Report</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Date Range</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Quarter</option>
              <option>This Year</option>
              <option>Custom Range</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Class Filter</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
              <option>All Classes</option>
              <option>Class 10</option>
              <option>Class 9</option>
              <option>Class 8</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            <BarChart className="w-4 h-4" />
            Generate Report
          </button>
          <button className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export to Excel
          </button>
        </div>
      </div>

      {/* Available Reports */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-gray-900 mb-6">Available Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((report, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6 hover:border-red-300 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-gray-900 mb-2">{report.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                  <p className="text-xs text-gray-500">Last generated: {report.lastGenerated}</p>
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full justify-center">
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Indicators */}
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
        <h3 className="text-gray-900 mb-3">Performance Risk Indicators</h3>
        <div className="space-y-2 text-gray-700">
          <p>• 12 students with attendance below 75%</p>
          <p>• 8 students with failing grades in 2+ subjects</p>
          <p>• 5 students with no fee payment for 2+ months</p>
          <p>• 3 unresolved complaints pending for over 7 days</p>
        </div>
        <button className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
          View Detailed Risk Report
        </button>
      </div>
    </div>
  );
}
