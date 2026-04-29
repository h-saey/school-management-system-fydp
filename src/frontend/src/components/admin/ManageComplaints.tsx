import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Edit,
  Trash2,
  Search,
  X,
  UserCheck,
} from "lucide-react";
import {
  getComplaints,
  updateComplaintStatus,
  assignComplaint,
  deleteComplaint,
  getUsers,
} from "../../services/api";
import { useToast, ToastContainer } from "../../utils/useToast";

type Complaint = {
  complaintId: number;
  category: string;
  description: string;
  status: string;
  remarks: string | null;
  dateSubmitted: string;
  dateClosed: string | null;
  submittedBy: { username: string; role: string };
  assignedTo: { username: string; role: string } | null;
};

type User = { userId: number; username: string; role: string };

const STATUS_OPTIONS = [
  "Submitted",
  "UnderReview",
  "Resolved",
  "Rejected",
  "Closed",
];

const statusColor = (s: string) =>
  s === "Resolved"
    ? "bg-green-100 text-green-700"
    : s === "Submitted"
      ? "bg-blue-100 text-blue-700"
      : s === "UnderReview"
        ? "bg-yellow-100 text-yellow-700"
        : s === "Rejected"
          ? "bg-red-100 text-red-700"
          : "bg-gray-100 text-gray-600";

export function ManageComplaints() {
  const { toasts, success, error } = useToast();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);

  // Edit Status Modal
  const [editComplaint, setEditComplaint] = useState<Complaint | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [remarks, setRemarks] = useState("");

  // Assign Modal
  const [assignTarget, setAssignTarget] = useState<Complaint | null>(null);
  const [assignedUserId, setAssignedUserId] = useState("");

  // ── Fetch ────────────────────────────────────────────────
  const fetchAll = async () => {
    try {
      setFetching(true);
      const [c, u] = await Promise.all([getComplaints(), getUsers()]);
      setComplaints(c);
      setUsers(
        u.filter((usr: User) => usr.role === "Teacher" || usr.role === "Admin"),
      );
    } catch (err: any) {
      error(err.message ?? "Failed to load complaints");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ── Open Edit Status Modal ───────────────────────────────
  const openEditStatus = (c: Complaint) => {
    setEditComplaint(c);
    setNewStatus(c.status);
    setRemarks(c.remarks ?? "");
  };

  // ── Update Status ────────────────────────────────────────
  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editComplaint) return;
    setLoading(true);
    try {
      await updateComplaintStatus(
        editComplaint.complaintId,
        newStatus,
        remarks,
      );
      success("Complaint status updated");
      setEditComplaint(null);
      fetchAll();
    } catch (err: any) {
      error(err.message ?? "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  // ── Assign ───────────────────────────────────────────────
  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTarget || !assignedUserId) return;
    setLoading(true);
    try {
      await assignComplaint(assignTarget.complaintId, Number(assignedUserId));
      success("Complaint assigned successfully");
      setAssignTarget(null);
      setAssignedUserId("");
      fetchAll();
    } catch (err: any) {
      error(err.message ?? "Failed to assign complaint");
    } finally {
      setLoading(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this complaint permanently?")) return;
    try {
      await deleteComplaint(id);
      success("Complaint deleted");
      setComplaints((prev) => prev.filter((c) => c.complaintId !== id));
    } catch (err: any) {
      error(err.message ?? "Failed to delete complaint");
    }
  };

  // ── Filter ───────────────────────────────────────────────
  const filtered = complaints.filter((c) => {
    const matchSearch =
      c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.submittedBy.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !statusFilter || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} />

      {/* HEADER */}
      <div>
        <h1 className="text-gray-900 mb-2">Manage Complaints</h1>
        <p className="text-gray-600">
          Review, assign and resolve submitted complaints
        </p>
      </div>

      {/* SEARCH + FILTER */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by category, user or description..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* EDIT STATUS MODAL */}
      {editComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-gray-900">Update Complaint Status</h2>
              <button
                onClick={() => setEditComplaint(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Category:{" "}
              <span className="font-medium text-gray-900">
                {editComplaint.category}
              </span>
              <br />
              Submitted by:{" "}
              <span className="font-medium text-gray-900">
                {editComplaint.submittedBy.username}
              </span>
            </p>
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1 text-sm">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-1 text-sm">
                  Remarks
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add resolution notes or remarks..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Update Status"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditComplaint(null)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN MODAL */}
      {assignTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-gray-900">Assign Complaint</h2>
              <button
                onClick={() => setAssignTarget(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Assign complaint #{assignTarget.complaintId} to a staff member:
            </p>
            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1 text-sm">
                  Assign To <span className="text-red-500">*</span>
                </label>
                <select
                  value={assignedUserId}
                  onChange={(e) => setAssignedUserId(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select staff member</option>
                  {users.map((u) => (
                    <option key={u.userId} value={u.userId}>
                      {u.username} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading || !assignedUserId}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Assigning..." : "Assign"}
                </button>
                <button
                  type="button"
                  onClick={() => setAssignTarget(null)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-red-600" />
          <h2 className="text-gray-900">Complaints ({filtered.length})</h2>
        </div>
        {fetching ? (
          <div className="p-8 text-center text-gray-500">
            Loading complaints...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No complaints found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-gray-700">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-gray-700">
                    Submitted By
                  </th>
                  <th className="px-6 py-4 text-left text-gray-700">
                    Assigned To
                  </th>
                  <th className="px-6 py-4 text-left text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-gray-700">Date</th>
                  <th className="px-6 py-4 text-left text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((c) => (
                  <tr key={c.complaintId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {c.category}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {c.submittedBy.username}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {c.assignedTo?.username ?? "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(c.status)}`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {new Date(c.dateSubmitted).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditStatus(c)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Update Status"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setAssignTarget(c);
                            setAssignedUserId("");
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Assign"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.complaintId)}
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
// import { AlertCircle, CheckCircle, Clock, UserCheck } from 'lucide-react';

// export function ManageComplaints() {
//   const complaints = [
//     { id: 'CMP001', student: 'Rahul Sharma', class: 'Class 10-A', issue: 'Unclear explanation in Chemistry class', category: 'Academic', status: 'Pending', date: '2025-12-11', assignedTo: null },
//     { id: 'CMP002', student: 'Ananya Singh', class: 'Class 10-A', issue: 'Library book not available', category: 'Facility', status: 'In Progress', date: '2025-12-10', assignedTo: 'Mr. Patel' },
//     { id: 'CMP003', student: 'Krish Mehta', class: 'Class 9-B', issue: 'Canteen food quality concern', category: 'Facility', status: 'Resolved', date: '2025-12-08', assignedTo: 'Admin' }
//   ];

//   const pendingCount = complaints.filter(c => c.status === 'Pending').length;
//   const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
//   const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'Resolved':
//         return 'bg-green-100 text-green-700';
//       case 'In Progress':
//         return 'bg-yellow-100 text-yellow-700';
//       default:
//         return 'bg-red-100 text-red-700';
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-gray-900 mb-2">Complaint Overview</h1>
//         <p className="text-gray-600">View all complaints, track progress, and assign to teachers</p>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <div className="flex items-center gap-3 mb-2">
//             <AlertCircle className="w-6 h-6 text-red-600" />
//             <h3 className="text-gray-900">Pending</h3>
//           </div>
//           <p className="text-gray-900">{pendingCount}</p>
//           <p className="text-sm text-red-600">Needs assignment</p>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <div className="flex items-center gap-3 mb-2">
//             <Clock className="w-6 h-6 text-yellow-600" />
//             <h3 className="text-gray-900">In Progress</h3>
//           </div>
//           <p className="text-gray-900">{inProgressCount}</p>
//           <p className="text-sm text-yellow-600">Being addressed</p>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <div className="flex items-center gap-3 mb-2">
//             <CheckCircle className="w-6 h-6 text-green-600" />
//             <h3 className="text-gray-900">Resolved</h3>
//           </div>
//           <p className="text-gray-900">{resolvedCount}</p>
//           <p className="text-sm text-green-600">This month</p>
//         </div>
//       </div>

//       <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//         <div className="p-6 border-b">
//           <div className="flex items-center gap-3">
//             <AlertCircle className="w-6 h-6 text-red-600" />
//             <h2 className="text-gray-900">All Complaints</h2>
//           </div>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-4 text-left text-gray-700">ID</th>
//                 <th className="px-6 py-4 text-left text-gray-700">Student</th>
//                 <th className="px-6 py-4 text-left text-gray-700">Class</th>
//                 <th className="px-6 py-4 text-left text-gray-700">Issue</th>
//                 <th className="px-6 py-4 text-left text-gray-700">Category</th>
//                 <th className="px-6 py-4 text-left text-gray-700">Date</th>
//                 <th className="px-6 py-4 text-left text-gray-700">Assigned To</th>
//                 <th className="px-6 py-4 text-left text-gray-700">Status</th>
//                 <th className="px-6 py-4 text-left text-gray-700">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {complaints.map((complaint) => (
//                 <tr key={complaint.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 text-gray-700">{complaint.id}</td>
//                   <td className="px-6 py-4 text-gray-900">{complaint.student}</td>
//                   <td className="px-6 py-4 text-gray-700">{complaint.class}</td>
//                   <td className="px-6 py-4 text-gray-700">{complaint.issue}</td>
//                   <td className="px-6 py-4"><span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{complaint.category}</span></td>
//                   <td className="px-6 py-4 text-gray-700">{complaint.date}</td>
//                   <td className="px-6 py-4 text-gray-700">{complaint.assignedTo || 'Unassigned'}</td>
//                   <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(complaint.status)}`}>{complaint.status}</span></td>
//                   <td className="px-6 py-4">
//                     {!complaint.assignedTo && (
//                       <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
//                         <UserCheck className="w-4 h-4" />
//                         Assign
//                       </button>
//                     )}
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
