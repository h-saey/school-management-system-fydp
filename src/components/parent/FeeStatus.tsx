import React from 'react';
import { DollarSign, Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export function FeeStatus() {
  const feeRecords = [
    { month: 'August 2025', amount: 5000, status: 'Paid', paidDate: '2025-08-05', receiptNo: 'RCP001' },
    { month: 'September 2025', amount: 5000, status: 'Paid', paidDate: '2025-09-03', receiptNo: 'RCP002' },
    { month: 'October 2025', amount: 5000, status: 'Paid', paidDate: '2025-10-07', receiptNo: 'RCP003' },
    { month: 'November 2025', amount: 5000, status: 'Paid', paidDate: '2025-11-04', receiptNo: 'RCP004' },
    { month: 'December 2025', amount: 5000, status: 'Paid', paidDate: '2025-12-02', receiptNo: 'RCP005' },
    { month: 'January 2026', amount: 5000, status: 'Pending', dueDate: '2025-12-20' },
    { month: 'February 2026', amount: 5000, status: 'Upcoming', dueDate: '2026-01-20' },
    { month: 'March 2026', amount: 5000, status: 'Upcoming', dueDate: '2026-02-20' }
  ];

  const totalPaid = feeRecords.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0);
  const totalPending = feeRecords.filter(f => f.status === 'Pending').reduce((sum, f) => sum + f.amount, 0);
  const totalUpcoming = feeRecords.filter(f => f.status === 'Upcoming').reduce((sum, f) => sum + f.amount, 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Pending':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-700';
      case 'Pending':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Fee Status</h1>
        <p className="text-gray-600">Track fee payments and download receipts</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h3 className="text-gray-900">Total Paid</h3>
          </div>
          <p className="text-gray-900">₹{totalPaid.toLocaleString()}</p>
          <p className="text-sm text-green-600">5 months cleared</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h3 className="text-gray-900">Pending Payment</h3>
          </div>
          <p className="text-gray-900">₹{totalPending.toLocaleString()}</p>
          <p className="text-sm text-red-600">Due by Dec 20, 2025</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 text-gray-600" />
            <h3 className="text-gray-900">Upcoming Fees</h3>
          </div>
          <p className="text-gray-900">₹{totalUpcoming.toLocaleString()}</p>
          <p className="text-sm text-gray-600">3 months scheduled</p>
        </div>
      </div>

      {/* Pending Payment Alert */}
      {totalPending > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 mt-1" />
            <div className="flex-1">
              <h3 className="text-gray-900 mb-2">Payment Reminder</h3>
              <p className="text-gray-700 mb-4">
                Fee payment of ₹{totalPending.toLocaleString()} is pending for January 2026. 
                Please clear the dues by December 20, 2025 to avoid late fees.
              </p>
              <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Pay Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fee Records Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-green-600" />
            <h2 className="text-gray-900">Fee Payment History</h2>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-gray-700">Period</th>
                <th className="px-6 py-4 text-left text-gray-700">Amount</th>
                <th className="px-6 py-4 text-left text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-gray-700">Date</th>
                <th className="px-6 py-4 text-left text-gray-700">Receipt/Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {feeRecords.map((record, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900">{record.month}</td>
                  <td className="px-6 py-4 text-gray-700">₹{record.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(record.status)}
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {record.status === 'Paid' ? record.paidDate : 
                     record.status === 'Pending' ? `Due: ${record.dueDate}` : 
                     `Due: ${record.dueDate}`}
                  </td>
                  <td className="px-6 py-4">
                    {record.status === 'Paid' ? (
                      <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Download className="w-4 h-4" />
                        Download Receipt
                      </button>
                    ) : record.status === 'Pending' ? (
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        Pay Now
                      </button>
                    ) : (
                      <span className="text-sm text-gray-500">Not due yet</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Instructions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-gray-900 mb-4">Payment Instructions</h2>
        <div className="space-y-3 text-gray-700">
          <p>• Fees can be paid online through the school portal or offline at the school office.</p>
          <p>• Late fee of ₹500 will be charged after the due date.</p>
          <p>• Download receipt immediately after payment for your records.</p>
          <p>• For any fee-related queries, contact the accounts department.</p>
        </div>
      </div>
    </div>
  );
}
