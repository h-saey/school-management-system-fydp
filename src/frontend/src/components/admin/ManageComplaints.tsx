import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Clock, UserCheck } from "lucide-react";

import { API_BASE } from "../../services/api";

export function ManageComplaints() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // LOAD COMPLAINTS
  // =========================

  const loadComplaints = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/complaint`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error("Failed to fetch complaints");
        return;
      }

      const data = await res.json();

      console.log("Complaints:", data);

      setComplaints(data);
    } catch (err) {
      console.error("Complaint fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  // =========================
  // UPDATE STATUS
  // =========================

  const updateStatus = async (id: number) => {
    const newStatus = prompt(
      "Enter status (Submitted / UnderReview / Resolved / Closed)",
    );

    if (!newStatus) return;

    const remarks = prompt("Enter remarks (optional)");

    try {
      const token = localStorage.getItem("token");

      await fetch(`${API_BASE}/complaint/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          remarks: remarks,
        }),
      });

      loadComplaints();
    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // ASSIGN COMPLAINT
  // =========================

  const assignComplaint = async (id: number) => {
    const userId = prompt("Enter Teacher/Admin User ID");

    if (!userId) return;

    try {
      const token = localStorage.getItem("token");

      await fetch(`${API_BASE}/complaint/${id}/assign`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          assignedToUserId: parseInt(userId),
        }),
      });

      loadComplaints();
    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // COUNTS
  // =========================

  const pendingCount = complaints.filter(
    (c) => c.status === "Submitted",
  ).length;

  const inProgressCount = complaints.filter(
    (c) => c.status === "UnderReview",
  ).length;

  const resolvedCount = complaints.filter(
    (c) => c.status === "Resolved" || c.status === "Closed",
  ).length;

  // =========================
  // STATUS COLOR
  // =========================

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved":
      case "Closed":
        return "bg-green-100 text-green-700";

      case "UnderReview":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-red-100 text-red-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div>
        <h1 className="text-gray-900 mb-2">Complaint Overview</h1>

        <p className="text-gray-600">Track and manage complaints</p>
      </div>

      {/* SUMMARY CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending */}

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-6 h-6 text-red-600" />

            <h3 className="text-gray-900">Pending</h3>
          </div>

          <p className="text-gray-900">{pendingCount}</p>
        </div>

        {/* In Progress */}

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 text-yellow-600" />

            <h3 className="text-gray-900">In Progress</h3>
          </div>

          <p className="text-gray-900">{inProgressCount}</p>
        </div>

        {/* Resolved */}

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-6 h-6 text-green-600" />

            <h3 className="text-gray-900">Resolved</h3>
          </div>

          <p className="text-gray-900">{resolvedCount}</p>
        </div>
      </div>

      {/* TABLE */}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-gray-900">All Complaints</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4">ID</th>

                <th className="px-6 py-4">Submitted By</th>

                <th className="px-6 py-4">Issue</th>

                <th className="px-6 py-4">Category</th>

                <th className="px-6 py-4">Date</th>

                <th className="px-6 py-4">Assigned To</th>

                <th className="px-6 py-4">Status</th>

                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {complaints.map((c: any) => (
                <tr key={c.complaintId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{c.complaintId}</td>

                  <td className="px-6 py-4">{c.submittedBy?.username}</td>

                  <td className="px-6 py-4">{c.description}</td>

                  <td className="px-6 py-4">{c.category}</td>

                  <td className="px-6 py-4">
                    {new Date(c.dateSubmitted).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4">
                    {c.assignedTo ? c.assignedTo.username : "Unassigned"}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                        c.status,
                      )}`}
                    >
                      {c.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => updateStatus(c.complaintId)}
                      className="px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm"
                    >
                      Update
                    </button>

                    {!c.assignedTo && (
                      <button
                        onClick={() => assignComplaint(c.complaintId)}
                        className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm"
                      >
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
