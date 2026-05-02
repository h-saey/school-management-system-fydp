// FILE: src/components/teacher/ComplaintManagement.tsx
// ACTION: REPLACE existing file entirely

import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  ChevronDown,
  AlertTriangle,
  RefreshCw,
  X,
  MessageSquare,
} from "lucide-react";
import {
  fetchComplaints,
  updateComplaintStatus,
  Complaint,
} from "../../services/teacherApi";

// Backend enum: 0=Submitted, 1=UnderReview, 2=Resolved, 3=Closed
const STATUS_OPTIONS = [
  { label: "Submitted", value: 0 },
  { label: "Under Review", value: 1 },
  { label: "Resolved", value: 2 },
  { label: "Closed", value: 3 },
];

const STATUS_COLORS: Record<string, string> = {
  Submitted: "bg-gray-100 text-gray-700",
  "Under Review": "bg-blue-100 text-blue-700",
  UnderReview: "bg-blue-100 text-blue-700",
  Resolved: "bg-green-100 text-green-700",
  Closed: "bg-purple-100 text-purple-700",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  Submitted: <Clock className="w-4 h-4" />,
  "Under Review": <RefreshCw className="w-4 h-4" />,
  UnderReview: <RefreshCw className="w-4 h-4" />,
  Resolved: <CheckCircle className="w-4 h-4" />,
  Closed: <CheckCircle className="w-4 h-4 text-purple-600" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  Bullying: "bg-red-100 text-red-700",
  Harassment: "bg-orange-100 text-orange-700",
  Academic: "bg-yellow-100 text-yellow-700",
  Behavioral: "bg-pink-100 text-pink-700",
  Facility: "bg-teal-100 text-teal-700",
  Other: "bg-gray-100 text-gray-700",
};

export function ComplaintManagement() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Inline update state per complaint
  const [updateForms, setUpdateForms] = useState<
    Record<number, { status: number; remarks: string }>
  >({});

  const loadComplaints = () => {
    setLoading(true);
    fetchComplaints()
      .then((data) => {
        setComplaints(data);
        // Pre-populate update forms
        const forms: typeof updateForms = {};
        data.forEach((c) => {
          const statusNum =
            STATUS_OPTIONS.find((s) => s.label === c.status)?.value ??
            STATUS_OPTIONS.find((s) => s.label.replace(" ", "") === c.status)
              ?.value ??
            0;
          forms[c.complaintId] = {
            status: statusNum,
            remarks: c.remarks ?? "",
          };
        });
        setUpdateForms(forms);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const handleUpdateStatus = async (complaintId: number) => {
    const form = updateForms[complaintId];
    if (!form) return;

    setUpdatingId(complaintId);
    setError(null);
    setSuccessMsg(null);

    try {
      await updateComplaintStatus(complaintId, {
        status: form.status,
        remarks: form.remarks.trim() || undefined,
      });

      const newLabel =
        STATUS_OPTIONS.find((s) => s.value === form.status)?.label ?? "";
      setComplaints((prev) =>
        prev.map((c) =>
          c.complaintId === complaintId
            ? { ...c, status: newLabel, remarks: form.remarks }
            : c,
        ),
      );
      setSuccessMsg(`Complaint #${complaintId} updated to "${newLabel}".`);
      setExpandedId(null);
    } catch (e: any) {
      setError(e.message || "Failed to update complaint.");
    } finally {
      setUpdatingId(null);
    }
  };

  const setFormField = (
    id: number,
    field: "status" | "remarks",
    value: number | string,
  ) => {
    setUpdateForms((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const filtered = complaints.filter((c) => {
    const matchStatus =
      filterStatus === "All" ||
      c.status === filterStatus ||
      c.status.replace(/\s/g, "") === filterStatus.replace(/\s/g, "");
    const matchSearch =
      searchQuery === "" ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.submittedBy?.username
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const countByStatus = (status: string) =>
    complaints.filter(
      (c) =>
        c.status === status ||
        c.status.replace(/\s/g, "") === status.replace(/\s/g, ""),
    ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 font-bold text-2xl mb-1">
          Complaint Management
        </h1>
        <p className="text-gray-600">
          View and update the status of student complaints assigned to you
        </p>
      </div>

      {/* Feedback */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm flex-1">{error}</p>
          <button onClick={() => setError(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 text-green-700">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm flex-1">{successMsg}</p>
          <button onClick={() => setSuccessMsg(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total",
            value: complaints.length,
            bg: "bg-gray-50",
            color: "text-gray-700",
          },
          {
            label: "Submitted",
            value: countByStatus("Submitted"),
            bg: "bg-yellow-50",
            color: "text-yellow-700",
          },
          {
            label: "Under Review",
            value:
              countByStatus("Under Review") || countByStatus("UnderReview"),
            bg: "bg-blue-50",
            color: "text-blue-700",
          },
          {
            label: "Resolved",
            value: countByStatus("Resolved"),
            bg: "bg-green-50",
            color: "text-green-700",
          },
        ].map(({ label, value, bg, color }) => (
          <div key={label} className={`${bg} rounded-xl p-4`}>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-gray-600 text-sm">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search complaints…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {["All", "Submitted", "Under Review", "Resolved", "Closed"].map(
            (s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  filterStatus === s
                    ? "bg-purple-600 text-white border-purple-600"
                    : "border-gray-300 text-gray-600 hover:border-purple-400"
                }`}
              >
                {s}
              </button>
            ),
          )}
        </div>
        <button
          onClick={loadComplaints}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Complaints List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm p-6 h-28 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-16 text-center text-gray-400">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium">No complaints found</p>
          <p className="text-sm mt-1">
            {complaints.length === 0
              ? "No complaints have been assigned to you yet."
              : "Try adjusting your filters."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((complaint) => {
            const form = updateForms[complaint.complaintId] ?? {
              status: 0,
              remarks: "",
            };
            const isExpanded = expandedId === complaint.complaintId;
            const statusColorKey = complaint.status;

            return (
              <div
                key={complaint.complaintId}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                {/* Complaint Header Row */}
                <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          CATEGORY_COLORS[complaint.category] ??
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {complaint.category}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          STATUS_COLORS[statusColorKey] ??
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {STATUS_ICONS[statusColorKey]}
                        {complaint.status}
                      </span>
                    </div>

                    <p className="text-gray-900 font-medium leading-snug line-clamp-2">
                      {complaint.description}
                    </p>

                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-400">
                      <span>
                        👤 Submitted by:{" "}
                        <strong className="text-gray-600">
                          {complaint.submittedBy?.username ?? "Unknown"}
                        </strong>{" "}
                        ({complaint.submittedBy?.role ?? ""})
                      </span>
                      <span>
                        📅{" "}
                        {new Date(complaint.dateSubmitted).toLocaleDateString(
                          "en-PK",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </span>
                      {complaint.assignedTo && (
                        <span>
                          🎯 Assigned to:{" "}
                          <strong className="text-gray-600">
                            {complaint.assignedTo.username}
                          </strong>
                        </span>
                      )}
                    </div>

                    {complaint.remarks && !isExpanded && (
                      <p className="mt-2 text-xs text-gray-500 italic line-clamp-1">
                        💬 Remarks: {complaint.remarks}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      setExpandedId(isExpanded ? null : complaint.complaintId)
                    }
                    className="flex items-center gap-1.5 px-4 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium whitespace-nowrap"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Update Status
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>

                {/* Expanded Update Form */}
                {isExpanded && (
                  <div className="border-t bg-gray-50 p-5 space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700">
                      Update Complaint #{complaint.complaintId}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Status Selector */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          New Status
                        </label>
                        <select
                          value={form.status}
                          onChange={(e) =>
                            setFormField(
                              complaint.complaintId,
                              "status",
                              Number(e.target.value),
                            )
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-white"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Remarks */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Remarks (optional)
                        </label>
                        <input
                          type="text"
                          value={form.remarks}
                          onChange={(e) =>
                            setFormField(
                              complaint.complaintId,
                              "remarks",
                              e.target.value,
                            )
                          }
                          placeholder="Add a note about this update…"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-white"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          handleUpdateStatus(complaint.complaintId)
                        }
                        disabled={updatingId === complaint.complaintId}
                        className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                      >
                        {updatingId === complaint.complaintId ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Saving…
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Save Update
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setExpandedId(null)}
                        className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 text-sm transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// import React, { useState } from "react";
// import {
//   AlertCircle,
//   MessageSquare,
//   Clock,
//   CheckCircle,
//   Send,
// } from "lucide-react";

// export function ComplaintManagement() {
//   const [selectedComplaint, setSelectedComplaint] = useState<number | null>(
//     null,
//   );
//   const [response, setResponse] = useState("");

//   const complaints = [
//     {
//       id: 1,
//       student: "Rahul Sharma",
//       class: "Class 10-A",
//       issue: "Unclear explanation in Chemistry class",
//       category: "Academic",
//       status: "Pending",
//       date: "2025-12-11",
//       description:
//         "The concept of chemical bonding explained in yesterday's class was not clear to me. Could you please explain it again?",
//       response: null,
//     },
//     {
//       id: 2,
//       student: "Ananya Singh",
//       class: "Class 10-A",
//       issue: "Request for extra doubt session",
//       category: "Academic",
//       status: "In Progress",
//       date: "2025-12-10",
//       description:
//         "I am having difficulty with calculus problems. Can we have an extra doubt clearing session?",
//       response:
//         "I will schedule a doubt session this Friday at 4 PM. Please bring your questions.",
//     },
//     {
//       id: 3,
//       student: "Krish Mehta",
//       class: "Class 9-B",
//       issue: "Homework submission extension request",
//       category: "Academic",
//       status: "Resolved",
//       date: "2025-12-08",
//       description:
//         "I was sick last week and couldn't complete the homework. Can I get an extension?",
//       response:
//         "Extension granted until Dec 12. Please submit the work by then. Take care of your health.",
//     },
//   ];

//   const handleAddResponse = () => {
//     if (response.trim() && selectedComplaint !== null) {
//       alert(
//         "Response added successfully! Student and parents will be notified.",
//       );
//       setResponse("");
//       setSelectedComplaint(null);
//     }
//   };

//   const updateStatus = (complaintId: number, newStatus: string) => {
//     alert(`Complaint status updated to: ${newStatus}`);
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case "Resolved":
//         return <CheckCircle className="w-5 h-5 text-green-600" />;
//       case "In Progress":
//         return <Clock className="w-5 h-5 text-yellow-600" />;
//       default:
//         return <AlertCircle className="w-5 h-5 text-red-600" />;
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "Resolved":
//         return "bg-green-100 text-green-700";
//       case "In Progress":
//         return "bg-yellow-100 text-yellow-700";
//       default:
//         return "bg-red-100 text-red-700";
//     }
//   };

//   const pendingCount = complaints.filter((c) => c.status === "Pending").length;
//   const inProgressCount = complaints.filter(
//     (c) => c.status === "In Progress",
//   ).length;
//   const resolvedCount = complaints.filter(
//     (c) => c.status === "Resolved",
//   ).length;

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-gray-900 mb-2">Complaint Management</h1>
//         <p className="text-gray-600">View and respond to student complaints</p>
//       </div>

//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <div className="flex items-center gap-3 mb-2">
//             <AlertCircle className="w-6 h-6 text-red-600" />
//             <h3 className="text-gray-900">Pending</h3>
//           </div>
//           <p className="text-gray-900">{pendingCount}</p>
//           <p className="text-sm text-red-600">Needs immediate attention</p>
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

//       {/* Complaints List */}
//       <div className="space-y-4">
//         {complaints.map((complaint) => (
//           <div key={complaint.id} className="bg-white rounded-xl shadow-sm p-6">
//             {/* Header */}
//             <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
//               <div className="flex-1">
//                 <div className="flex items-center gap-3 mb-2">
//                   <MessageSquare className="w-5 h-5 text-gray-600 flex-shrink-0" />
//                   <h3 className="text-gray-900">{complaint.issue}</h3>
//                 </div>

//                 {/* Complaint Meta Info */}
//                 <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-600 mb-3">
//                   <span>Student: {complaint.student}</span>
//                   <span className="hidden sm:inline">•</span>
//                   <span>{complaint.class}</span>
//                   <span className="hidden sm:inline">•</span>
//                   <span>{complaint.category}</span>
//                   <span className="hidden sm:inline">•</span>
//                   <span>{complaint.date}</span>
//                 </div>
//               </div>

//               {/* Status */}
//               <div className="flex items-center gap-2 self-start">
//                 {getStatusIcon(complaint.status)}
//                 <span
//                   className={`px-3 py-1 rounded-full text-sm ${getStatusColor(complaint.status)}`}
//                 >
//                   {complaint.status}
//                 </span>
//               </div>
//             </div>

//             {/* Description */}
//             <div className="p-4 bg-gray-50 rounded-lg mb-4">
//               <p className="text-sm text-gray-700">
//                 <strong>Description:</strong> {complaint.description}
//               </p>
//             </div>

//             {/* Response */}
//             {complaint.response && (
//               <div className="p-4 bg-blue-50 rounded-lg mb-4">
//                 <p className="text-sm text-gray-700">
//                   <strong>Your Response:</strong> {complaint.response}
//                 </p>
//               </div>
//             )}

//             {selectedComplaint === complaint.id ? (
//               <div className="space-y-3">
//                 <textarea
//                   value={response}
//                   onChange={(e) => setResponse(e.target.value)}
//                   placeholder="Type your response..."
//                   rows={4}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//                 />

//                 {/* Response Buttons */}
//                 <div className="flex flex-col sm:flex-row gap-3">
//                   <button
//                     onClick={handleAddResponse}
//                     className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
//                   >
//                     <Send className="w-4 h-4" />
//                     Send Response
//                   </button>

//                   <button
//                     onClick={() => setSelectedComplaint(null)}
//                     className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               /* Action Buttons */
//               <div className="flex flex-wrap gap-3">
//                 {!complaint.response && (
//                   <button
//                     onClick={() => setSelectedComplaint(complaint.id)}
//                     className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap"
//                   >
//                     Add Response
//                   </button>
//                 )}

//                 {complaint.status !== "Resolved" && (
//                   <>
//                     {complaint.status === "Pending" && (
//                       <button
//                         onClick={() =>
//                           updateStatus(complaint.id, "In Progress")
//                         }
//                         className="px-4 py-2 border border-yellow-500 text-yellow-700 rounded-lg hover:bg-yellow-50 transition-colors whitespace-nowrap"
//                       >
//                         Mark In Progress
//                       </button>
//                     )}

//                     <button
//                       onClick={() => updateStatus(complaint.id, "Resolved")}
//                       className="px-4 py-2 border border-green-500 text-green-700 rounded-lg hover:bg-green-50 transition-colors whitespace-nowrap"
//                     >
//                       Mark Resolved
//                     </button>
//                   </>
//                 )}
//               </div>
//             )}
//           </div>
//         ))}

//         {/* {complaints.map((complaint) => (
//           <div key={complaint.id} className="bg-white rounded-xl shadow-sm p-6">
//             <div className="flex items-start justify-between mb-4">
//               <div className="flex-1">
//                 <div className="flex items-center gap-3 mb-2">
//                   <MessageSquare className="w-5 h-5 text-gray-600" />
//                   <h3 className="text-gray-900">{complaint.issue}</h3>
//                 </div>
//                 <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
//                   <span>Student: {complaint.student}</span>
//                   <span>•</span>
//                   <span>{complaint.class}</span>
//                   <span>•</span>
//                   <span>{complaint.category}</span>
//                   <span>•</span>
//                   <span>{complaint.date}</span>
//                 </div>
//               </div>
//               <div className="flex items-center gap-2">
//                 {getStatusIcon(complaint.status)}
//                 <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(complaint.status)}`}>
//                   {complaint.status}
//                 </span>
//               </div>
//             </div>

//             <div className="p-4 bg-gray-50 rounded-lg mb-4">
//               <p className="text-sm text-gray-700">
//                 <strong>Description:</strong> {complaint.description}
//               </p>
//             </div>

//             {complaint.response && (
//               <div className="p-4 bg-blue-50 rounded-lg mb-4">
//                 <p className="text-sm text-gray-700">
//                   <strong>Your Response:</strong> {complaint.response}
//                 </p>
//               </div>
//             )}

//             {selectedComplaint === complaint.id ? (
//               <div className="space-y-3">
//                 <textarea
//                   value={response}
//                   onChange={(e) => setResponse(e.target.value)}
//                   placeholder="Type your response..."
//                   rows={4}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//                 />
//                 <div className="flex gap-3">
//                   <button
//                     onClick={handleAddResponse}
//                     className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
//                   >
//                     <Send className="w-4 h-4" />
//                     Send Response
//                   </button>
//                   <button
//                     onClick={() => setSelectedComplaint(null)}
//                     className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="flex gap-3">
//                 {!complaint.response && (
//                   <button
//                     onClick={() => setSelectedComplaint(complaint.id)}
//                     className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
//                   >
//                     Add Response
//                   </button>
//                 )}
//                 {complaint.status !== 'Resolved' && (
//                   <>
//                     {complaint.status === 'Pending' && (
//                       <button
//                         onClick={() => updateStatus(complaint.id, 'In Progress')}
//                         className="px-4 py-2 border border-yellow-500 text-yellow-700 rounded-lg hover:bg-yellow-50 transition-colors"
//                       >
//                         Mark In Progress
//                       </button>
//                     )}
//                     <button
//                       onClick={() => updateStatus(complaint.id, 'Resolved')}
//                       className="px-4 py-2 border border-green-500 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
//                     >
//                       Mark Resolved
//                     </button>
//                   </>
//                 )}
//               </div>
//             )}
//           </div>
//         ))} */}
//       </div>

//       {/* Guidelines */}
//       <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-lg">
//         <h3 className="text-gray-900 mb-3">Complaint Handling Guidelines</h3>
//         <div className="space-y-2 text-gray-700 text-sm">
//           <p>• Respond to student complaints within 24 hours.</p>
//           <p>• Provide constructive and helpful responses.</p>
//           <p>
//             • Update status regularly to keep students and parents informed.
//           </p>
//           <p>• Escalate serious issues to the administration if needed.</p>
//         </div>
//       </div>
//     </div>
//   );
// }
