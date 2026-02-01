import React from 'react';
import { DollarSign, Send, Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export function ManageFees() {
  const feeRecords = [
    { student: 'Aarav Patel', class: 'Class 10-A', monthlyFee: 5000, paid: 25000, pending: 5000, status: 'Pending' },
    { student: 'Aadhya Sharma', class: 'Class 10-A', monthlyFee: 5000, paid: 30000, pending: 0, status: 'Paid' },
    { student: 'Advait Kumar', class: 'Class 10-A', monthlyFee: 5000, paid: 30000, pending: 0, status: 'Paid' },
    { student: 'Ananya Singh', class: 'Class 9-B', monthlyFee: 4500, paid: 22500, pending: 4500, status: 'Pending' }
  ];

  const totalCollected = feeRecords.reduce((sum, r) => sum + r.paid, 0);
  const totalPending = feeRecords.reduce((sum, r) => sum + r.pending, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Manage Fees</h1>
        <p className="text-gray-600">Update fee status, send reminders, and generate reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h3 className="text-gray-900">Total Collected</h3>
          </div>
          <p className="text-gray-900">₹{totalCollected.toLocaleString()}</p>
          <p className="text-sm text-green-600">This academic year</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h3 className="text-gray-900">Total Pending</h3>
          </div>
          <p className="text-gray-900">₹{totalPending.toLocaleString()}</p>
          <p className="text-sm text-red-600">From {feeRecords.filter(r => r.pending > 0).length} students</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 text-yellow-600" />
            <h3 className="text-gray-900">Collection Rate</h3>
          </div>
          <p className="text-gray-900">{((totalCollected / (totalCollected + totalPending)) * 100).toFixed(1)}%</p>
          <p className="text-sm text-yellow-600">Current month</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex gap-3 mb-6">
          <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            <Send className="w-4 h-4" />
            Send Fee Reminders
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Generate Monthly Report
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-red-600" />
            <h2 className="text-gray-900">Fee Status</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-gray-700">Student Name</th>
                <th className="px-6 py-4 text-left text-gray-700">Class</th>
                <th className="px-6 py-4 text-left text-gray-700">Monthly Fee</th>
                <th className="px-6 py-4 text-left text-gray-700">Total Paid</th>
                <th className="px-6 py-4 text-left text-gray-700">Pending</th>
                <th className="px-6 py-4 text-left text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {feeRecords.map((record, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900">{record.student}</td>
                  <td className="px-6 py-4 text-gray-700">{record.class}</td>
                  <td className="px-6 py-4 text-gray-700">₹{record.monthlyFee.toLocaleString()}</td>
                  <td className="px-6 py-4 text-green-600">₹{record.paid.toLocaleString()}</td>
                  <td className="px-6 py-4 text-red-600">₹{record.pending.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      record.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                      Update Status
                    </button>
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
