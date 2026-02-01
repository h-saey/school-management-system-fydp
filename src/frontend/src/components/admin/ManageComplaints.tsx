import React from 'react';
import { AlertCircle, CheckCircle, Clock, UserCheck } from 'lucide-react';

export function ManageComplaints() {
  const complaints = [
    { id: 'CMP001', student: 'Rahul Sharma', class: 'Class 10-A', issue: 'Unclear explanation in Chemistry class', category: 'Academic', status: 'Pending', date: '2025-12-11', assignedTo: null },
    { id: 'CMP002', student: 'Ananya Singh', class: 'Class 10-A', issue: 'Library book not available', category: 'Facility', status: 'In Progress', date: '2025-12-10', assignedTo: 'Mr. Patel' },
    { id: 'CMP003', student: 'Krish Mehta', class: 'Class 9-B', issue: 'Canteen food quality concern', category: 'Facility', status: 'Resolved', date: '2025-12-08', assignedTo: 'Admin' }
  ];

  const pendingCount = complaints.filter(c => c.status === 'Pending').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved':
        return 'bg-green-100 text-green-700';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-red-100 text-red-700';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Complaint Overview</h1>
        <p className="text-gray-600">View all complaints, track progress, and assign to teachers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h3 className="text-gray-900">Pending</h3>
          </div>
          <p className="text-gray-900">{pendingCount}</p>
          <p className="text-sm text-red-600">Needs assignment</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 text-yellow-600" />
            <h3 className="text-gray-900">In Progress</h3>
          </div>
          <p className="text-gray-900">{inProgressCount}</p>
          <p className="text-sm text-yellow-600">Being addressed</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h3 className="text-gray-900">Resolved</h3>
          </div>
          <p className="text-gray-900">{resolvedCount}</p>
          <p className="text-sm text-green-600">This month</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h2 className="text-gray-900">All Complaints</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-gray-700">ID</th>
                <th className="px-6 py-4 text-left text-gray-700">Student</th>
                <th className="px-6 py-4 text-left text-gray-700">Class</th>
                <th className="px-6 py-4 text-left text-gray-700">Issue</th>
                <th className="px-6 py-4 text-left text-gray-700">Category</th>
                <th className="px-6 py-4 text-left text-gray-700">Date</th>
                <th className="px-6 py-4 text-left text-gray-700">Assigned To</th>
                <th className="px-6 py-4 text-left text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {complaints.map((complaint) => (
                <tr key={complaint.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-700">{complaint.id}</td>
                  <td className="px-6 py-4 text-gray-900">{complaint.student}</td>
                  <td className="px-6 py-4 text-gray-700">{complaint.class}</td>
                  <td className="px-6 py-4 text-gray-700">{complaint.issue}</td>
                  <td className="px-6 py-4"><span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{complaint.category}</span></td>
                  <td className="px-6 py-4 text-gray-700">{complaint.date}</td>
                  <td className="px-6 py-4 text-gray-700">{complaint.assignedTo || 'Unassigned'}</td>
                  <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(complaint.status)}`}>{complaint.status}</span></td>
                  <td className="px-6 py-4">
                    {!complaint.assignedTo && (
                      <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                        <UserCheck className="w-4 h-4" />
                        Assign
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
