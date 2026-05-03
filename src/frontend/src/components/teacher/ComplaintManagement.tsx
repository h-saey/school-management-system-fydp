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
  Submitted: "border border-slate-200/90 bg-slate-100 text-slate-800",
  "Under Review": "border border-blue-200/80 bg-blue-50 text-blue-800",
  UnderReview: "border border-blue-200/80 bg-blue-50 text-blue-800",
  Resolved: "border border-emerald-200/80 bg-emerald-50 text-emerald-800",
  Closed: "border border-purple-200/80 bg-purple-50 text-purple-800",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  Submitted: <Clock className="h-4 w-4 shrink-0" aria-hidden />,
  "Under Review": <RefreshCw className="h-4 w-4 shrink-0" aria-hidden />,
  UnderReview: <RefreshCw className="h-4 w-4 shrink-0" aria-hidden />,
  Resolved: <CheckCircle className="h-4 w-4 shrink-0" aria-hidden />,
  Closed: (
    <CheckCircle className="h-4 w-4 shrink-0 text-purple-600" aria-hidden />
  ),
};

const CATEGORY_COLORS: Record<string, string> = {
  Bullying: "border border-red-200/80 bg-red-50 text-red-800",
  Harassment: "border border-orange-200/80 bg-orange-50 text-orange-800",
  Academic: "border border-amber-200/80 bg-amber-50 text-amber-900",
  Behavioral: "border border-pink-200/80 bg-pink-50 text-pink-800",
  Facility: "border border-teal-200/80 bg-teal-50 text-teal-800",
  Other: "border border-slate-200/80 bg-slate-100 text-slate-800",
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
    <div className="min-w-0 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-balance text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Complaint Management
        </h1>
        <p className="max-w-2xl text-pretty text-sm leading-relaxed text-slate-600 sm:text-base">
          View and update the status of student complaints assigned to you
        </p>
      </div>

      {/* Feedback */}
      {error && (
        <div
          className="flex items-start gap-3 rounded-2xl border border-red-200/90 bg-red-50/90 p-4 text-red-800 shadow-sm sm:items-center sm:p-4"
          role="alert"
        >
          <AlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0 text-red-600 sm:mt-0"
            aria-hidden
          />
          <p className="min-w-0 flex-1 text-sm font-medium leading-relaxed">
            {error}
          </p>
          <button
            type="button"
            onClick={() => setError(null)}
            className="rounded-lg p-1.5 text-red-600 transition-colors hover:bg-red-100/80 hover:text-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {successMsg && (
        <div
          className="flex items-start gap-3 rounded-2xl border border-emerald-200/90 bg-emerald-50/90 p-4 text-emerald-900 shadow-sm sm:items-center sm:p-4"
          role="status"
        >
          <CheckCircle
            className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 sm:mt-0"
            aria-hidden
          />
          <p className="min-w-0 flex-1 text-sm font-medium leading-relaxed">
            {successMsg}
          </p>
          <button
            type="button"
            onClick={() => setSuccessMsg(null)}
            className="rounded-lg p-1.5 text-emerald-700 transition-colors hover:bg-emerald-100/80 hover:text-emerald-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            aria-label="Dismiss message"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[
          {
            label: "Total",
            value: complaints.length,
            bg: "bg-slate-50/90",
            color: "text-slate-800",
            ring: "ring-slate-200/80",
          },
          {
            label: "Submitted",
            value: countByStatus("Submitted"),
            bg: "bg-amber-50/90",
            color: "text-amber-800",
            ring: "ring-amber-100/80",
          },
          {
            label: "Under Review",
            value:
              countByStatus("Under Review") || countByStatus("UnderReview"),
            bg: "bg-blue-50/90",
            color: "text-blue-800",
            ring: "ring-blue-100/80",
          },
          {
            label: "Resolved",
            value: countByStatus("Resolved"),
            bg: "bg-emerald-50/90",
            color: "text-emerald-800",
            ring: "ring-emerald-100/80",
          },
        ].map(({ label, value, bg, color, ring }) => (
          <div
            key={label}
            className={`rounded-2xl border border-slate-100/80 p-4 shadow-sm ring-1 ${ring} ${bg} sm:p-5`}
          >
            <p
              className={`text-2xl font-bold tabular-nums tracking-tight sm:text-3xl ${color}`}
            >
              {value}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-600 sm:text-sm">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-4">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              type="text"
              placeholder="Search complaints…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-inner shadow-slate-900/5 placeholder:text-slate-400 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/25"
            />
          </div>
          <div className="flex min-w-0 flex-wrap gap-2 lg:max-w-[55%] lg:justify-end xl:max-w-none">
            {["All", "Submitted", "Under Review", "Resolved", "Closed"].map(
              (s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 sm:px-3.5 sm:text-sm ${
                    filterStatus === s
                      ? "border-purple-600 bg-purple-600 text-white shadow-sm shadow-purple-600/20 hover:bg-purple-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-purple-300 hover:bg-slate-50 active:bg-slate-100"
                  }`}
                >
                  {s}
                </button>
              ),
            )}
          </div>
          <button
            type="button"
            onClick={loadComplaints}
            className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 active:bg-slate-100 lg:w-auto"
          >
            <RefreshCw className="h-4 w-4 shrink-0" aria-hidden />
            Refresh
          </button>
        </div>
      </div>

      {/* Complaints List */}
      {loading ? (
        <div className="space-y-3 sm:space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl border border-slate-100 bg-slate-100/80 p-6 sm:h-32"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm sm:px-10 sm:py-20">
          <AlertCircle
            className="mx-auto mb-4 h-12 w-12 text-slate-300"
            aria-hidden
          />
          <p className="text-base font-semibold text-slate-700 sm:text-lg">
            No complaints found
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            {complaints.length === 0
              ? "No complaints have been assigned to you yet."
              : "Try adjusting your filters."}
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
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
                className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Complaint Header Row */}
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-5 sm:p-6">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap gap-2 sm:mb-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                          CATEGORY_COLORS[complaint.category] ??
                          "border border-slate-200 bg-slate-100 text-slate-800"
                        }`}
                      >
                        {complaint.category}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          STATUS_COLORS[statusColorKey] ??
                          "border border-slate-200 bg-slate-100 text-slate-800"
                        }`}
                      >
                        {STATUS_ICONS[statusColorKey]}
                        {complaint.status}
                      </span>
                    </div>

                    <p className="line-clamp-2 text-sm font-medium leading-snug text-slate-900 sm:text-base">
                      {complaint.description}
                    </p>

                    <div className="mt-3 flex flex-col gap-1.5 text-xs text-slate-500 sm:flex-row sm:flex-wrap sm:gap-x-4 sm:gap-y-1">
                      <span className="font-medium">
                        👤 Submitted by:{" "}
                        <strong className="font-semibold text-slate-700">
                          {complaint.submittedBy?.username ?? "Unknown"}
                        </strong>{" "}
                        ({complaint.submittedBy?.role ?? ""})
                      </span>
                      <span className="font-medium">
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
                        <span className="font-medium">
                          🎯 Assigned to:{" "}
                          <strong className="font-semibold text-slate-700">
                            {complaint.assignedTo.username}
                          </strong>
                        </span>
                      )}
                    </div>

                    {complaint.remarks && !isExpanded && (
                      <p className="mt-2 line-clamp-1 text-xs italic leading-relaxed text-slate-500">
                        💬 Remarks: {complaint.remarks}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId(isExpanded ? null : complaint.complaintId)
                    }
                    className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-purple-200 bg-white px-4 py-2.5 text-sm font-semibold text-purple-700 shadow-sm transition-colors hover:border-purple-300 hover:bg-purple-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 active:bg-purple-100/60 sm:w-auto sm:whitespace-nowrap"
                  >
                    <MessageSquare className="h-4 w-4 shrink-0" aria-hidden />
                    Update Status
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      aria-hidden
                    />
                  </button>
                </div>

                {/* Expanded Update Form */}
                {isExpanded && (
                  <div className="space-y-4 border-t border-slate-100 bg-slate-50/80 p-5 sm:p-6">
                    <h3 className="text-sm font-semibold tracking-tight text-slate-800">
                      Update Complaint #{complaint.complaintId}
                    </h3>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                      {/* Status Selector */}
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-slate-600">
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
                          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Remarks */}
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-slate-600">
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
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateStatus(complaint.complaintId)
                        }
                        disabled={updatingId === complaint.complaintId}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-purple-600/25 transition-colors hover:bg-purple-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 active:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-5"
                      >
                        {updatingId === complaint.complaintId ? (
                          <>
                            <RefreshCw className="h-4 w-4 shrink-0 animate-spin" />
                            Saving…
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 shrink-0" />
                            Save Update
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpandedId(null)}
                        className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 active:bg-slate-100 sm:w-auto sm:px-5"
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
