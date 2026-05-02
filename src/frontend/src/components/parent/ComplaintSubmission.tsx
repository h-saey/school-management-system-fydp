import React, { useState, useEffect } from "react";
import { MessageSquare, Plus, AlertCircle, Send, X } from "lucide-react";
import {
  getMyComplaints,
  submitComplaint,
  type ComplaintRecord,
} from "../../services/parentApi";

function statusBadge(status: string) {
  switch (status) {
    case "Submitted":
      return "bg-blue-100 text-blue-700";
    case "UnderReview":
      return "bg-yellow-100 text-yellow-700";
    case "Resolved":
      return "bg-green-100 text-green-700";
    case "Rejected":
      return "bg-red-100 text-red-700";
    case "Closed":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

const CATEGORIES = [
  "Academic",
  "Facility",
  "Teacher",
  "Harassment",
  "Fee",
  "Other",
];

export function ComplaintSubmission() {
  const [complaints, setComplaints] = useState<ComplaintRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    category: CATEGORIES[0],
    description: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await getMyComplaints();
      setComplaints(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!form.description.trim()) {
      setFormError("Please enter a description.");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await submitComplaint({
        category: form.category,
        description: form.description,
      });
      setShowForm(false);
      setForm({ category: CATEGORIES[0], description: "" });
      await load();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading complaints…</div>
      </div>
    );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section - Updated styling to match old UI */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">
            Complaint & Feedback
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Submit issues and track their resolution status
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setFormError(null);
          }}
          className="
            flex items-center justify-center gap-2
            w-full sm:w-auto
            px-4 py-2.5 sm:px-5 sm:py-2.5
            text-sm sm:text-base font-medium
            bg-blue-600 text-white
            rounded-xl
            hover:bg-blue-700
            active:scale-95
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
          "
        >
          {showForm ? (
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
          {showForm ? "Cancel" : "New Complaint"}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 sm:p-4 bg-red-50 rounded-xl border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Submission form - Updated styling to match old UI */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            Submit a Complaint
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm sm:text-base text-gray-700 mb-1.5 font-medium">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
                className="
                  w-full px-3 py-2 sm:px-4 sm:py-2.5
                  border border-gray-300 rounded-lg
                  text-sm sm:text-base
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  bg-white
                "
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm sm:text-base text-gray-700 mb-1.5 font-medium">
                Describe Your Issue
              </label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Please provide detailed information about your concern..."
                className="
                  w-full px-3 py-2 sm:px-4 sm:py-2.5
                  border border-gray-300 rounded-lg
                  text-sm sm:text-base
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  resize-none
                "
              />
            </div>
            {formError && (
              <p className="text-red-600 text-xs sm:text-sm flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {formError}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="
                  flex items-center justify-center gap-2
                  px-4 py-2.5 sm:px-6 sm:py-2.5
                  bg-blue-600 text-white
                  rounded-lg
                  text-sm sm:text-base font-medium
                  hover:bg-blue-700
                  disabled:opacity-60
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
                "
              >
                <Send className="w-4 h-4" />
                {submitting ? "Submitting…" : "Submit Complaint"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="
                  flex items-center justify-center gap-2
                  px-4 py-2.5 sm:px-6 sm:py-2.5
                  border border-gray-300
                  text-gray-700
                  rounded-lg
                  text-sm sm:text-base font-medium
                  hover:bg-gray-50
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
                "
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complaints list - Updated styling to match old UI */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
          My Complaints ({complaints.length})
        </h2>

        {complaints.length === 0 ? (
          <div className="py-10 sm:py-16 text-center">
            <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm sm:text-base text-gray-400">
              No complaints submitted yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((c) => (
              <div
                key={c.complaintId}
                className="border border-gray-200 rounded-lg p-4 sm:p-6"
              >
                {/* Header Section - Matching old UI layout */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-2 sm:gap-3 mb-2">
                      <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                      <h3 className="text-sm sm:text-base font-medium text-gray-900">
                        {c.description}
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                      <span>ID: {c.complaintId}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{c.category}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>
                        {new Date(c.dateSubmitted).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge(c.status)}`}
                    >
                      {c.status === "UnderReview" ? "In Progress" : c.status}
                    </span>
                  </div>
                </div>

                {/* Response Section - Matching old UI */}
                {c.remarks ? (
                  <div className="mt-3 p-3 sm:p-4 bg-blue-50 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-700">
                      <strong className="font-semibold">Response:</strong>{" "}
                      {c.remarks}
                    </p>
                  </div>
                ) : (
                  <div className="mt-3 p-3 sm:p-4 bg-yellow-50 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-700">
                      Your complaint is being reviewed. You will be notified
                      once there's an update.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
// import React, { useState } from "react";
// import {
//   MessageSquare,
//   Send,
//   Clock,
//   CheckCircle,
//   AlertCircle,
// } from "lucide-react";

// export function ComplaintSubmission() {
//   const [showForm, setShowForm] = useState(false);
//   const [issue, setIssue] = useState("");
//   const [category, setCategory] = useState("Academic");
//   const [department, setDepartment] = useState("");

//   const complaints = [
//     {
//       id: "CMP001",
//       issue: "Unclear explanation in Chemistry class",
//       category: "Academic",
//       department: "Science Department",
//       status: "Resolved",
//       date: "2025-12-05",
//       response: "Teacher scheduled extra doubt session. Issue resolved.",
//     },
//     {
//       id: "CMP002",
//       issue: "Library book not available",
//       category: "Facility",
//       department: "Library",
//       status: "In Progress",
//       date: "2025-12-08",
//       response: "Book has been ordered. Expected arrival in 1 week.",
//     },
//     {
//       id: "CMP003",
//       issue: "Canteen food quality concern",
//       category: "Facility",
//       department: "Administration",
//       status: "Pending",
//       date: "2025-12-10",
//       response: null,
//     },
//   ];

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

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     // Handle complaint submission
//     setShowForm(false);
//     setIssue("");
//     setCategory("Academic");
//     setDepartment("");
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex items-start justify-between">
//         <div>
//           <h1 className="text-gray-900 mb-2">Complaint & Feedback</h1>
//           <p className="text-gray-600">
//             Submit issues and track their resolution status
//           </p>
//         </div>
//         <button
//           onClick={() => setShowForm(!showForm)}
//           className="
//     flex items-center justify-center gap-2
//     w-full sm:w-auto
//     px-5 py-3
//     mt-4 sm:mt-0
//     text-sm sm:text-base font-medium
//     bg-blue-600 text-white
//     rounded-xl
//     hover:bg-blue-700
//     active:scale-95
//     transition-all duration-200
//     focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
//   "
//         >
//           <Send className="w-4 h-4 sm:w-5 sm:h-5" />
//           <span>Submit New Complaint</span>
//         </button>

//         {/* <button
//           onClick={() => setShowForm(!showForm)}
//           className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//         >
//           <Send className="w-4 h-4" />
//           Submit New Complaint
//         </button> */}
//       </div>

//       {/* Complaint Form */}
//       {showForm && (
//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <h2 className="text-gray-900 mb-4">Submit a Complaint</h2>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="block text-gray-700 mb-2">Category</label>
//               <select
//                 value={category}
//                 onChange={(e) => setCategory(e.target.value)}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option>Academic</option>
//                 <option>Facility</option>
//                 <option>Transportation</option>
//                 <option>Bullying/Harassment</option>
//                 <option>Other</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-gray-700 mb-2">
//                 Department / Teacher
//               </label>
//               <input
//                 type="text"
//                 value={department}
//                 onChange={(e) => setDepartment(e.target.value)}
//                 placeholder="e.g., Science Department, Mr. Kumar"
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-gray-700 mb-2">
//                 Describe Your Issue
//               </label>
//               <textarea
//                 value={issue}
//                 onChange={(e) => setIssue(e.target.value)}
//                 placeholder="Please provide detailed information about your concern..."
//                 rows={5}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>

//             <div className="flex gap-3">
//               <button
//                 type="submit"
//                 className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//               >
//                 Submit Complaint
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setShowForm(false)}
//                 className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {/* Complaint List */}
//       <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
//         <h2 className="text-gray-900 text-lg sm:text-xl mb-6">My Complaints</h2>

//         <div className="space-y-4">
//           {complaints.map((complaint) => (
//             <div
//               key={complaint.id}
//               className="border border-gray-200 rounded-lg p-4 sm:p-6"
//             >
//               {/* HEADER */}
//               <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
//                 {/* LEFT SIDE */}
//                 <div className="flex-1">
//                   <div className="flex items-center gap-3 mb-2">
//                     <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
//                     <h3 className="text-gray-900 text-sm sm:text-base">
//                       {complaint.issue}
//                     </h3>
//                   </div>

//                   {/* META DATA */}
//                   <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-600">
//                     <span>ID: {complaint.id}</span>
//                     <span>•</span>
//                     <span>{complaint.category}</span>
//                     <span>•</span>
//                     <span>{complaint.department}</span>
//                     <span>•</span>
//                     <span>{complaint.date}</span>
//                   </div>
//                 </div>

//                 {/* STATUS */}
//                 <div className="flex items-center gap-2 self-start sm:self-auto">
//                   {getStatusIcon(complaint.status)}
//                   <span
//                     className={`px-3 py-1 rounded-full text-xs sm:text-sm ${getStatusColor(
//                       complaint.status,
//                     )}`}
//                   >
//                     {complaint.status}
//                   </span>
//                 </div>
//               </div>

//               {/* RESPONSE / PENDING */}
//               {complaint.response ? (
//                 <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
//                   <p className="text-xs sm:text-sm text-gray-700">
//                     <strong>Response:</strong> {complaint.response}
//                   </p>
//                 </div>
//               ) : (
//                 <div className="p-3 sm:p-4 bg-yellow-50 rounded-lg">
//                   <p className="text-xs sm:text-sm text-gray-700">
//                     Your complaint is being reviewed. You will be notified once
//                     there's an update.
//                   </p>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* <div className="bg-white rounded-xl shadow-sm p-6">
//         <h2 className="text-gray-900 mb-6">My Complaints</h2>
//         <div className="space-y-4">
//           {complaints.map((complaint) => (
//             <div
//               key={complaint.id}
//               className="border border-gray-200 rounded-lg p-6"
//             >
//               <div className="flex items-start justify-between mb-4">
//                 <div className="flex-1">
//                   <div className="flex items-center gap-3 mb-2">
//                     <MessageSquare className="w-5 h-5 text-gray-600" />
//                     <h3 className="text-gray-900">{complaint.issue}</h3>
//                   </div>
//                   <div className="flex items-center gap-4 text-sm text-gray-600">
//                     <span>ID: {complaint.id}</span>
//                     <span>•</span>
//                     <span>{complaint.category}</span>
//                     <span>•</span>
//                     <span>{complaint.department}</span>
//                     <span>•</span>
//                     <span>{complaint.date}</span>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   {getStatusIcon(complaint.status)}
//                   <span
//                     className={`px-3 py-1 rounded-full text-sm ${getStatusColor(complaint.status)}`}
//                   >
//                     {complaint.status}
//                   </span>
//                 </div>
//               </div>

//               {complaint.response && (
//                 <div className="p-4 bg-blue-50 rounded-lg">
//                   <p className="text-sm text-gray-700">
//                     <strong>Response:</strong> {complaint.response}
//                   </p>
//                 </div>
//               )}

//               {!complaint.response && (
//                 <div className="p-4 bg-yellow-50 rounded-lg">
//                   <p className="text-sm text-gray-700">
//                     Your complaint is being reviewed. You will be notified once
//                     there's an update.
//                   </p>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       </div> */}
//     </div>
//   );
// }
