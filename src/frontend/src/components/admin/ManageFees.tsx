import React, { useState, useEffect } from "react";
import { DollarSign, Plus, Edit, Trash2, Search, X } from "lucide-react";
import {
  getFees,
  createFee,
  updateFeePayment,
  deleteFee,
  getStudents,
} from "../../services/api";
import { useToast, ToastContainer } from "../../utils/useToast";

type Fee = {
  feeId: number;
  term: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string;
  status: string;
  student: { firstName: string; lastName: string; rollNumber: string };
};

type Student = {
  studentId: number;
  firstName: string;
  lastName: string;
  rollNumber: string;
};

const emptyFeeForm = {
  studentId: "",
  term: "",
  totalAmount: "",
  dueDate: "",
};

const statusColor = (s: string) =>
  s === "Paid"
    ? "bg-green-100 text-green-700"
    : s === "Partial"
      ? "bg-yellow-100 text-yellow-700"
      : s === "Overdue"
        ? "bg-red-100 text-red-700"
        : "bg-gray-100 text-gray-600";

export function ManageFees() {
  const { toasts, success, error } = useToast();

  const [fees, setFees] = useState<Fee[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [newFee, setNewFee] = useState(emptyFeeForm);

  // Payment modal
  const [paymentTarget, setPaymentTarget] = useState<Fee | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");

  // ── Fetch ────────────────────────────────────────────────
  const fetchFees = async () => {
    try {
      setFetching(true);
      const [f, s] = await Promise.all([getFees(), getStudents()]);
      setFees(f);
      setStudents(s);
    } catch (err: any) {
      error(err.message ?? "Failed to load fees");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  // ── Create Fee ───────────────────────────────────────────
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = parseFloat(newFee.totalAmount);
    if (isNaN(total) || total <= 0) {
      error("Please enter a valid total amount");
      return;
    }
    setLoading(true);
    try {
      await createFee({
        studentId: Number(newFee.studentId),
        term: newFee.term,
        totalAmount: total,
        dueDate: newFee.dueDate,
      });
      success("Fee record created successfully");
      setNewFee(emptyFeeForm);
      setShowAddForm(false);
      fetchFees();
    } catch (err: any) {
      error(err.message ?? "Failed to create fee record");
    } finally {
      setLoading(false);
    }
  };

  // ── Open Payment Modal ───────────────────────────────────
  const openPayment = (fee: Fee) => {
    setPaymentTarget(fee);
    setPaymentAmount(String(fee.paidAmount));
  };

  // ── Update Payment ───────────────────────────────────────
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentTarget) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount < 0) {
      error("Please enter a valid payment amount");
      return;
    }
    if (amount > paymentTarget.totalAmount) {
      error("Payment cannot exceed total amount");
      return;
    }
    setLoading(true);
    try {
      await updateFeePayment(paymentTarget.feeId, amount);
      success("Payment updated successfully");
      setPaymentTarget(null);
      fetchFees();
    } catch (err: any) {
      error(err.message ?? "Failed to update payment");
    } finally {
      setLoading(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this fee record?")) return;
    try {
      await deleteFee(id);
      success("Fee record deleted");
      setFees((prev) => prev.filter((f) => f.feeId !== id));
    } catch (err: any) {
      error(err.message ?? "Failed to delete fee");
    }
  };

  // ── Filter ───────────────────────────────────────────────
  const filtered = fees.filter((f) => {
    const matchSearch =
      `${f.student.firstName} ${f.student.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      f.student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.term.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !statusFilter || f.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} />

      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-gray-900 mb-2">Manage Fees</h1>
          <p className="text-gray-600">Create and manage student fee records</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Fee Record
        </button>
      </div>

      {/* ADD FEE FORM */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-gray-900">Create Fee Record</h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form
            onSubmit={handleAdd}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-gray-700 mb-1 text-sm">
                Student <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={newFee.studentId}
                onChange={(e) =>
                  setNewFee({ ...newFee, studentId: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select Student</option>
                {students.map((s) => (
                  <option key={s.studentId} value={s.studentId}>
                    {s.firstName} {s.lastName} ({s.rollNumber})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-1 text-sm">
                Term <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newFee.term}
                onChange={(e) => setNewFee({ ...newFee, term: e.target.value })}
                placeholder="e.g. Fall 2024"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 text-sm">
                Total Amount (PKR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                step="0.01"
                value={newFee.totalAmount}
                onChange={(e) =>
                  setNewFee({ ...newFee, totalAmount: e.target.value })
                }
                placeholder="e.g. 15000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 text-sm">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={newFee.dueDate}
                onChange={(e) =>
                  setNewFee({ ...newFee, dueDate: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Fee Record"}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {paymentTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-gray-900">Update Payment</h2>
              <button
                onClick={() => setPaymentTarget(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm space-y-1">
              <p className="text-gray-700">
                Student:{" "}
                <span className="font-medium text-gray-900">
                  {paymentTarget.student.firstName}{" "}
                  {paymentTarget.student.lastName}
                </span>
              </p>
              <p className="text-gray-700">
                Term:{" "}
                <span className="font-medium text-gray-900">
                  {paymentTarget.term}
                </span>
              </p>
              <p className="text-gray-700">
                Total:{" "}
                <span className="font-medium text-gray-900">
                  PKR {paymentTarget.totalAmount.toLocaleString()}
                </span>
              </p>
              <p className="text-gray-700">
                Remaining:{" "}
                <span className="font-medium text-red-600">
                  PKR {paymentTarget.remainingAmount.toLocaleString()}
                </span>
              </p>
            </div>
            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1 text-sm">
                  Total Paid Amount (PKR){" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  max={paymentTarget.totalAmount}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the cumulative total paid so far (not just this
                  instalment)
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Update Payment"}
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentTarget(null)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SEARCH + FILTER */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name, roll number or term..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="">All Statuses</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Partial">Partial</option>
          <option value="Paid">Paid</option>
          <option value="Overdue">Overdue</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b flex items-center gap-3">
          <DollarSign className="w-6 h-6 text-red-600" />
          <h2 className="text-gray-900">Fee Records ({filtered.length})</h2>
        </div>
        {fetching ? (
          <div className="p-8 text-center text-gray-500">
            Loading fee records...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No fee records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-gray-700">Student</th>
                  <th className="px-6 py-4 text-left text-gray-700">Term</th>
                  <th className="px-6 py-4 text-left text-gray-700">Total</th>
                  <th className="px-6 py-4 text-left text-gray-700">Paid</th>
                  <th className="px-6 py-4 text-left text-gray-700">
                    Remaining
                  </th>
                  <th className="px-6 py-4 text-left text-gray-700">
                    Due Date
                  </th>
                  <th className="px-6 py-4 text-left text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((f) => (
                  <tr key={f.feeId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {f.student.firstName} {f.student.lastName}
                      <br />
                      <span className="text-xs text-gray-500">
                        {f.student.rollNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{f.term}</td>
                    <td className="px-6 py-4 text-gray-700">
                      PKR {f.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-green-700">
                      PKR {f.paidAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-red-700">
                      PKR {f.remainingAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {new Date(f.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(f.status)}`}
                      >
                        {f.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openPayment(f)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Update Payment"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(f.feeId)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// import React from 'react';
// import { DollarSign, Send, Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';

// export function ManageFees() {
//   const feeRecords = [
//     { student: 'Aarav Patel', class: 'Class 10-A', monthlyFee: 5000, paid: 25000, pending: 5000, status: 'Pending' },
//     { student: 'Aadhya Sharma', class: 'Class 10-A', monthlyFee: 5000, paid: 30000, pending: 0, status: 'Paid' },
//     { student: 'Advait Kumar', class: 'Class 10-A', monthlyFee: 5000, paid: 30000, pending: 0, status: 'Paid' },
//     { student: 'Ananya Singh', class: 'Class 9-B', monthlyFee: 4500, paid: 22500, pending: 4500, status: 'Pending' }
//   ];

//   const totalCollected = feeRecords.reduce((sum, r) => sum + r.paid, 0);
//   const totalPending = feeRecords.reduce((sum, r) => sum + r.pending, 0);

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-gray-900 mb-2">Manage Fees</h1>
//         <p className="text-gray-600">Update fee status, send reminders, and generate reports</p>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <div className="flex items-center gap-3 mb-2">
//             <CheckCircle className="w-6 h-6 text-green-600" />
//             <h3 className="text-gray-900">Total Collected</h3>
//           </div>
//           <p className="text-gray-900">₹{totalCollected.toLocaleString()}</p>
//           <p className="text-sm text-green-600">This academic year</p>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <div className="flex items-center gap-3 mb-2">
//             <AlertCircle className="w-6 h-6 text-red-600" />
//             <h3 className="text-gray-900">Total Pending</h3>
//           </div>
//           <p className="text-gray-900">₹{totalPending.toLocaleString()}</p>
//           <p className="text-sm text-red-600">From {feeRecords.filter(r => r.pending > 0).length} students</p>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <div className="flex items-center gap-3 mb-2">
//             <Clock className="w-6 h-6 text-yellow-600" />
//             <h3 className="text-gray-900">Collection Rate</h3>
//           </div>
//           <p className="text-gray-900">{((totalCollected / (totalCollected + totalPending)) * 100).toFixed(1)}%</p>
//           <p className="text-sm text-yellow-600">Current month</p>
//         </div>
//       </div>

//       <div className="bg-white rounded-xl shadow-sm p-6">
//         <div className="flex gap-3 mb-6">
//           <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
//             <Send className="w-4 h-4" />
//             Send Fee Reminders
//           </button>
//           <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
//             <Download className="w-4 h-4" />
//             Generate Monthly Report
//           </button>
//         </div>
//       </div>

//       <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//         <div className="p-6 border-b">
//           <div className="flex items-center gap-3">
//             <DollarSign className="w-6 h-6 text-red-600" />
//             <h2 className="text-gray-900">Fee Status</h2>
//           </div>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-4 text-left text-gray-700">Student Name</th>
//                 <th className="px-6 py-4 text-left text-gray-700">Class</th>
//                 <th className="px-6 py-4 text-left text-gray-700">Monthly Fee</th>
//                 <th className="px-6 py-4 text-left text-gray-700">Total Paid</th>
//                 <th className="px-6 py-4 text-left text-gray-700">Pending</th>
//                 <th className="px-6 py-4 text-left text-gray-700">Status</th>
//                 <th className="px-6 py-4 text-left text-gray-700">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {feeRecords.map((record, index) => (
//                 <tr key={index} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 text-gray-900">{record.student}</td>
//                   <td className="px-6 py-4 text-gray-700">{record.class}</td>
//                   <td className="px-6 py-4 text-gray-700">₹{record.monthlyFee.toLocaleString()}</td>
//                   <td className="px-6 py-4 text-green-600">₹{record.paid.toLocaleString()}</td>
//                   <td className="px-6 py-4 text-red-600">₹{record.pending.toLocaleString()}</td>
//                   <td className="px-6 py-4">
//                     <span className={`px-3 py-1 rounded-full text-sm ${
//                       record.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
//                     }`}>
//                       {record.status}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4">
//                     <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
//                       Update Status
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }
