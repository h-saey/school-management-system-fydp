//=========================Original code========================
// import React, { useState, useEffect } from "react";
// import { Bell, Plus } from "lucide-react";
// import { API_BASE } from "../../services/api";
// import { Edit, Trash2 } from "lucide-react";

// export function ManageNoticeboard() {
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [editingId, setEditingId] = useState<number | null>(null);

//   const [notices, setNotices] = useState<any[]>([]);

//   const [formData, setFormData] = useState({
//     title: "",
//     content: "",
//     audience: "SchoolWide",
//     type: "Exam",
//     priority: "High",
//     targetClass: "",
//   });

//   // ✅ FETCH NOTICES
//   useEffect(() => {
//     fetchNotices();
//   }, []);

//   const handleEdit = (notice: any) => {
//     setFormData({
//       title: notice.title,
//       content: notice.content,
//       audience: notice.audience,
//       type: notice.type,
//       priority: notice.priority,
//       targetClass: notice.targetClass || "",
//     });

//     setEditingId(notice.noticeId);
//     setShowAddForm(true);
//   };

//   const handleDelete = async (id: number) => {
//     const token = localStorage.getItem("token");

//     try {
//       const res = await fetch(`${API_BASE}/notice/${id}`, {
//         method: "DELETE",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (res.ok) {
//         setNotices((prev) => prev.filter((n) => n.noticeId !== id));
//       } else {
//         alert("Delete failed ❌");
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const fetchNotices = async () => {
//     try {
//       const token = localStorage.getItem("token");

//       const response = await fetch(`${API_BASE}/notice`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!response.ok) {
//         throw new Error("Failed to fetch notices");
//       }

//       const data = await response.json();
//       setNotices(data);
//     } catch (error) {
//       console.error("Error fetching notices:", error);
//     }
//   };

//   // ✅ HANDLE INPUT CHANGE
//   const handleChange = (
//     e: React.ChangeEvent<
//       HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
//     >,
//   ) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   // ✅ HANDLE SUBMIT
//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     const token = localStorage.getItem("token");

//     try {
//       const url =
//         editingId !== null
//           ? `${API_BASE}/notice/${editingId}`
//           : `${API_BASE}/notice`;

//       const method = editingId !== null ? "PUT" : "POST";

//       const response = await fetch(url, {
//         method,
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(formData),
//       });

//       if (response.ok) {
//         alert(editingId ? "Notice Updated 🎉" : "Notice Posted 🎉");

//         setShowAddForm(false);
//         setEditingId(null);

//         setFormData({
//           title: "",
//           content: "",
//           audience: "SchoolWide",
//           type: "Exam",
//           priority: "High",
//           targetClass: "",
//         });

//         fetchNotices();
//       } else {
//         alert("Operation failed ❌");
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   //Cancel form and reset state
//   const resetForm = () => {
//     setShowAddForm(false);
//     setEditingId(null);
//     setFormData({
//       title: "",
//       content: "",
//       audience: "SchoolWide",
//       type: "Exam",
//       priority: "High",
//       targetClass: "",
//     });
//   };

//   // const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//   //   e.preventDefault();

//   //   try {
//   //     const token = localStorage.getItem("token");

//   //     const response = await fetch(`${API_BASE}/notice`, {
//   //       method: "POST",
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //         Authorization: `Bearer ${token}`,
//   //       },
//   //       body: JSON.stringify({
//   //         ...formData,
//   //       }),
//   //     });

//   //     if (response.ok) {
//   //       alert("Notice Posted 🎉");

//   //       setShowAddForm(false);

//   //       fetchNotices(); // refresh table
//   //     } else {
//   //       alert("Error posting notice ❌");
//   //     }
//   //   } catch (error) {
//   //     console.error(error);
//   //   }
//   // };

//   return (
//     <div className="space-y-6">
//       {/* HEADER */}

//       <div className="flex justify-between">
//         <div>
//           <h1 className="text-gray-900 mb-2">Manage Digital Noticeboard</h1>

//           <p className="text-gray-600">Upload and manage school notices</p>
//         </div>

//         <button
//           onClick={() => setShowAddForm(!showAddForm)}
//           className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg"
//         >
//           <Plus className="w-4 h-4" />
//           Post New Notice
//         </button>
//       </div>

//       {/* ADD FORM */}

//       {showAddForm && (
//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <h2 className="mb-6">Create New Notice</h2>

//           <form onSubmit={handleSubmit} className="space-y-4">
//             {/* TYPE */}

//             <select
//               name="type"
//               value={formData.type}
//               onChange={handleChange}
//               className="w-full px-4 py-2 border rounded-lg"
//             >
//               <option value="Exam">Exam</option>

//               <option value="Holiday">Holiday</option>

//               <option value="Event">Event</option>

//               <option value="Fee">Fee</option>

//               <option value="Academic">Academic</option>
//             </select>

//             {/* PRIORITY */}

//             <select
//               name="priority"
//               value={formData.priority}
//               onChange={handleChange}
//               className="w-full px-4 py-2 border rounded-lg"
//             >
//               <option value="High">High</option>

//               <option value="Medium">Medium</option>

//               <option value="Low">Low</option>
//             </select>

//             {/* TITLE */}

//             <input
//               type="text"
//               name="title"
//               value={formData.title}
//               onChange={handleChange}
//               placeholder="Notice Title"
//               className="w-full px-4 py-2 border rounded-lg"
//             />

//             {/* CONTENT */}

//             <textarea
//               rows={5}
//               name="content"
//               value={formData.content}
//               onChange={handleChange}
//               placeholder="Notice Message"
//               className="w-full px-4 py-2 border rounded-lg"
//             />

//             <div className="flex gap-3">
//               <button
//                 type="submit"
//                 className="px-6 py-2 bg-red-600 text-white rounded-lg"
//               >
//                 Post Notice
//               </button>

//               <button
//                 type="button"
//                 onClick={() => resetForm()}
//                 className="px-6 py-2 border rounded-lg"
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {/* NOTICE TABLE */}

//       <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//         <div className="p-6 border-b flex items-center gap-3">
//           <Bell className="w-6 h-6 text-red-600" />
//           <h2>Posted Notices</h2>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-4 text-left text-gray-700">Title</th>
//                 <th className="px-6 py-4 text-left text-gray-700">Type</th>
//                 <th className="px-6 py-4 text-left text-gray-700">Priority</th>
//                 <th className="px-6 py-4 text-left text-gray-700">Date</th>
//                 <th className="px-6 py-4 text-left text-gray-700">Posted By</th>
//                 <th className="px-6 py-4 text-left text-gray-700">Status</th>
//                 <th className="px-6 py-4 text-left text-gray-700">Actions</th>
//               </tr>
//             </thead>

//             <tbody className="divide-y divide-gray-200">
//               {notices.map((notice: any) => (
//                 <tr key={notice.noticeId} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 text-gray-900">{notice.title}</td>

//                   <td className="px-6 py-4">
//                     <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
//                       {notice.type}
//                     </span>
//                   </td>

//                   <td className="px-6 py-4">
//                     <span
//                       className={`px-3 py-1 rounded-full text-sm ${
//                         notice.priority === "High"
//                           ? "bg-red-100 text-red-700"
//                           : notice.priority === "Medium"
//                             ? "bg-yellow-100 text-yellow-700"
//                             : "bg-green-100 text-green-700"
//                       }`}
//                     >
//                       {notice.priority}
//                     </span>
//                   </td>

//                   <td className="px-6 py-4 text-gray-700">
//                     {new Date(notice.postedAt).toLocaleDateString()}
//                   </td>

//                   <td className="px-6 py-4 text-gray-700">
//                     {notice.postedBy?.username}
//                   </td>

//                   <td className="px-6 py-4">
//                     <span
//                       className={`px-3 py-1 rounded-full text-sm ${
//                         notice.isActive
//                           ? "bg-green-100 text-green-700"
//                           : "bg-gray-200 text-gray-700"
//                       }`}
//                     >
//                       {notice.isActive ? "Active" : "Inactive"}
//                     </span>
//                   </td>

//                   {/* ACTIONS */}
//                   <td className="px-6 py-4">
//                     <div className="flex gap-2">
//                       <button
//                         onClick={() => handleEdit(notice)}
//                         className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//                       >
//                         <Edit className="w-4 h-4" />
//                       </button>

//                       <button
//                         onClick={() => handleDelete(notice.noticeId)}
//                         className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//                       >
//                         <Trash2 className="w-4 h-4" />
//                       </button>
//                     </div>
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

//=========================Updated claude with clean UI code========================
// import React, { useState, useEffect } from "react";
// import { Bell, Plus, Edit, Trash2, Search, X } from "lucide-react";
// import {
//   getNotices,
//   createNotice,
//   updateNotice,
//   deleteNotice,
// } from "../../services/api";
// import { useToast, ToastContainer } from "../../utils/useToast";

// type Notice = {
//   noticeId: number;
//   title: string;
//   content: string;
//   audience: string;
//   targetClass: string | null;
//   postedAt: string;
//   isActive: boolean;
//   type: string;
//   priority: string;
//   postedBy: { username: string; role: string };
// };

// const AUDIENCES = [
//   "SchoolWide",
//   "StudentsOnly",
//   "ParentsOnly",
//   "TeachersOnly",
//   "ClassSpecific",
// ];
// const TYPES = ["Academic", "Event", "Holiday", "Exam", "Fee", "General"];
// const PRIORITIES = ["Low", "Medium", "High"];
// const CLASSES = ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10"];

// const emptyForm = {
//   title: "",
//   content: "",
//   audience: "SchoolWide",
//   type: "General",
//   priority: "Medium",
//   targetClass: "",
// };

// export function ManageNoticeboard() {
//   const { toasts, success, error } = useToast();
//   const [notices, setNotices] = useState<Notice[]>([]);
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [editNotice, setEditNotice] = useState<Notice | null>(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [fetching, setFetching] = useState(true);
//   const [newNotice, setNewNotice] = useState(emptyForm);

//   const fetchNotices = async () => {
//     try {
//       setFetching(true);
//       setNotices(await getNotices());
//     } catch (err: any) {
//       error(err.message ?? "Failed to load notices");
//     } finally {
//       setFetching(false);
//     }
//   };

//   useEffect(() => {
//     fetchNotices();
//   }, []);

//   const handleAdd = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       await createNotice({
//         title: newNotice.title,
//         content: newNotice.content,
//         audience: newNotice.audience,
//         type: newNotice.type,
//         priority: newNotice.priority,
//         targetClass:
//           newNotice.audience === "ClassSpecific" ? newNotice.targetClass : null,
//       });
//       success("Notice Posted 🎉");
//       setNewNotice(emptyForm);
//       setShowAddForm(false);
//       fetchNotices();
//     } catch (err: any) {
//       error(err.message ?? "Error posting notice ❌");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUpdate = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!editNotice) return;
//     setLoading(true);
//     try {
//       await updateNotice(editNotice.noticeId, {
//         title: editNotice.title,
//         content: editNotice.content,
//         audience: editNotice.audience,
//         type: editNotice.type,
//         priority: editNotice.priority,
//         targetClass:
//           editNotice.audience === "ClassSpecific"
//             ? editNotice.targetClass
//             : null,
//       });
//       success("Notice Updated 🎉");
//       setEditNotice(null);
//       fetchNotices();
//     } catch (err: any) {
//       error(err.message ?? "Failed to update ❌");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (id: number) => {
//     if (!window.confirm("Delete this notice?")) return;
//     try {
//       await deleteNotice(id);
//       success("Notice deleted");
//       setNotices((prev) => prev.filter((n) => n.noticeId !== id));
//     } catch (err: any) {
//       error(err.message ?? "Failed to delete ❌");
//     }
//   };

//   const resetForm = () => {
//     setShowAddForm(false);
//     setNewNotice(emptyForm);
//   };

//   const filtered = notices.filter(
//     (n) =>
//       n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       n.audience.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       n.type.toLowerCase().includes(searchTerm.toLowerCase()),
//   );

//   return (
//     <div className="space-y-6">
//       <ToastContainer toasts={toasts} />

//       {/* ── HEADER ─────────────────────────────────────────── */}
//       <div className="flex justify-between">
//         <div>
//           <h1 className="text-gray-900 mb-2">Manage Digital Noticeboard</h1>
//           <p className="text-gray-600">Upload and manage school notices</p>
//         </div>
//         <button
//           onClick={() => setShowAddForm(!showAddForm)}
//           className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg"
//         >
//           <Plus className="w-4 h-4" />
//           Post New Notice
//         </button>
//       </div>

//       {/* ── ADD FORM ───────────────────────────────────────── */}
//       {showAddForm && (
//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <h2 className="mb-6">Create New Notice</h2>
//           <form onSubmit={handleAdd} className="space-y-4">
//             <select
//               name="type"
//               value={newNotice.type}
//               onChange={(e) =>
//                 setNewNotice({ ...newNotice, type: e.target.value })
//               }
//               className="w-full px-4 py-2 border rounded-lg"
//             >
//               {TYPES.map((t) => (
//                 <option key={t} value={t}>
//                   {t}
//                 </option>
//               ))}
//             </select>

//             <select
//               name="priority"
//               value={newNotice.priority}
//               onChange={(e) =>
//                 setNewNotice({ ...newNotice, priority: e.target.value })
//               }
//               className="w-full px-4 py-2 border rounded-lg"
//             >
//               {PRIORITIES.map((p) => (
//                 <option key={p} value={p}>
//                   {p}
//                 </option>
//               ))}
//             </select>

//             <select
//               name="audience"
//               value={newNotice.audience}
//               onChange={(e) =>
//                 setNewNotice({ ...newNotice, audience: e.target.value })
//               }
//               className="w-full px-4 py-2 border rounded-lg"
//             >
//               {AUDIENCES.map((a) => (
//                 <option key={a} value={a}>
//                   {a}
//                 </option>
//               ))}
//             </select>

//             {newNotice.audience === "ClassSpecific" && (
//               <select
//                 name="targetClass"
//                 value={newNotice.targetClass}
//                 onChange={(e) =>
//                   setNewNotice({ ...newNotice, targetClass: e.target.value })
//                 }
//                 className="w-full px-4 py-2 border rounded-lg"
//               >
//                 <option value="">Select class</option>
//                 {CLASSES.map((c) => (
//                   <option key={c} value={c}>
//                     {c}
//                   </option>
//                 ))}
//               </select>
//             )}

//             <input
//               type="text"
//               name="title"
//               required
//               value={newNotice.title}
//               onChange={(e) =>
//                 setNewNotice({ ...newNotice, title: e.target.value })
//               }
//               placeholder="Notice Title"
//               className="w-full px-4 py-2 border rounded-lg"
//             />

//             <textarea
//               rows={5}
//               name="content"
//               required
//               value={newNotice.content}
//               onChange={(e) =>
//                 setNewNotice({ ...newNotice, content: e.target.value })
//               }
//               placeholder="Notice Message"
//               className="w-full px-4 py-2 border rounded-lg"
//             />

//             <div className="flex gap-3">
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="px-6 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50"
//               >
//                 {loading ? "Posting..." : "Post Notice"}
//               </button>
//               <button
//                 type="button"
//                 onClick={resetForm}
//                 className="px-6 py-2 border rounded-lg"
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {/* ── EDIT MODAL ─────────────────────────────────────── */}
//       {editNotice && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-40 p-4">
//           <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
//             <h2 className="mb-6">Edit Notice</h2>
//             <form onSubmit={handleUpdate} className="space-y-4">
//               <select
//                 value={editNotice.type}
//                 onChange={(e) =>
//                   setEditNotice({ ...editNotice, type: e.target.value })
//                 }
//                 className="w-full px-4 py-2 border rounded-lg"
//               >
//                 {TYPES.map((t) => (
//                   <option key={t} value={t}>
//                     {t}
//                   </option>
//                 ))}
//               </select>

//               <select
//                 value={editNotice.priority}
//                 onChange={(e) =>
//                   setEditNotice({ ...editNotice, priority: e.target.value })
//                 }
//                 className="w-full px-4 py-2 border rounded-lg"
//               >
//                 {PRIORITIES.map((p) => (
//                   <option key={p} value={p}>
//                     {p}
//                   </option>
//                 ))}
//               </select>

//               <select
//                 value={editNotice.audience}
//                 onChange={(e) =>
//                   setEditNotice({ ...editNotice, audience: e.target.value })
//                 }
//                 className="w-full px-4 py-2 border rounded-lg"
//               >
//                 {AUDIENCES.map((a) => (
//                   <option key={a} value={a}>
//                     {a}
//                   </option>
//                 ))}
//               </select>

//               {editNotice.audience === "ClassSpecific" && (
//                 <select
//                   value={editNotice.targetClass ?? ""}
//                   onChange={(e) =>
//                     setEditNotice({
//                       ...editNotice,
//                       targetClass: e.target.value,
//                     })
//                   }
//                   className="w-full px-4 py-2 border rounded-lg"
//                 >
//                   <option value="">Select class</option>
//                   {CLASSES.map((c) => (
//                     <option key={c} value={c}>
//                       {c}
//                     </option>
//                   ))}
//                 </select>
//               )}

//               <input
//                 type="text"
//                 required
//                 value={editNotice.title}
//                 onChange={(e) =>
//                   setEditNotice({ ...editNotice, title: e.target.value })
//                 }
//                 placeholder="Notice Title"
//                 className="w-full px-4 py-2 border rounded-lg"
//               />

//               <textarea
//                 rows={5}
//                 required
//                 value={editNotice.content}
//                 onChange={(e) =>
//                   setEditNotice({ ...editNotice, content: e.target.value })
//                 }
//                 placeholder="Notice Message"
//                 className="w-full px-4 py-2 border rounded-lg"
//               />

//               <div className="flex gap-3">
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="px-6 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50"
//                 >
//                   {loading ? "Saving..." : "Post Notice"}
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setEditNotice(null)}
//                   className="px-6 py-2 border rounded-lg"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* ── SEARCH ─────────────────────────────────────────── */}
//       <div className="bg-white rounded-xl shadow-sm p-4">
//         <div className="relative">
//           <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
//           <input
//             type="text"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             placeholder="Search by title, audience or type..."
//             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
//           />
//         </div>
//       </div>

//       {/* ── NOTICE TABLE ───────────────────────────────────── */}
//       <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//         <div className="p-6 border-b flex items-center gap-3">
//           <Bell className="w-6 h-6 text-red-600" />
//           <h2>Posted Notices ({filtered.length})</h2>
//         </div>

//         <div className="overflow-x-auto">
//           {fetching ? (
//             <div className="p-8 text-center text-gray-500">Loading...</div>
//           ) : filtered.length === 0 ? (
//             <div className="p-8 text-center text-gray-400">
//               {searchTerm ? "No notices match your search." : "No notices yet."}
//             </div>
//           ) : (
//             <table className="w-full">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-4 text-left text-gray-700">Title</th>
//                   <th className="px-6 py-4 text-left text-gray-700">Type</th>
//                   <th className="px-6 py-4 text-left text-gray-700">
//                     Priority
//                   </th>
//                   <th className="px-6 py-4 text-left text-gray-700">Date</th>
//                   <th className="px-6 py-4 text-left text-gray-700">
//                     Posted By
//                   </th>
//                   <th className="px-6 py-4 text-left text-gray-700">Status</th>
//                   <th className="px-6 py-4 text-left text-gray-700">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {filtered.map((notice) => (
//                   <tr key={notice.noticeId} className="hover:bg-gray-50">
//                     <td className="px-6 py-4 text-gray-900">{notice.title}</td>

//                     <td className="px-6 py-4">
//                       <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
//                         {notice.type}
//                       </span>
//                     </td>

//                     <td className="px-6 py-4">
//                       <span
//                         className={`px-3 py-1 rounded-full text-sm ${
//                           notice.priority === "High"
//                             ? "bg-red-100 text-red-700"
//                             : notice.priority === "Medium"
//                               ? "bg-yellow-100 text-yellow-700"
//                               : "bg-green-100 text-green-700"
//                         }`}
//                       >
//                         {notice.priority}
//                       </span>
//                     </td>

//                     <td className="px-6 py-4 text-gray-700">
//                       {new Date(notice.postedAt).toLocaleDateString()}
//                     </td>

//                     <td className="px-6 py-4 text-gray-700">
//                       {notice.postedBy?.username}
//                     </td>

//                     <td className="px-6 py-4">
//                       <span
//                         className={`px-3 py-1 rounded-full text-sm ${
//                           notice.isActive
//                             ? "bg-green-100 text-green-700"
//                             : "bg-gray-200 text-gray-700"
//                         }`}
//                       >
//                         {notice.isActive ? "Active" : "Inactive"}
//                       </span>
//                     </td>

//                     <td className="px-6 py-4">
//                       <div className="flex gap-2">
//                         <button
//                           onClick={() => setEditNotice(notice)}
//                           className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//                         >
//                           <Edit className="w-4 h-4" />
//                         </button>
//                         <button
//                           onClick={() => handleDelete(notice.noticeId)}
//                           className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

//=========================Updated claude code with ugly UI========================
import React, { useState, useEffect } from "react";
import { Bell, Plus, Edit, Trash2, Search, X } from "lucide-react";
import {
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
} from "../../services/api";
import { useToast, ToastContainer } from "../../utils/useToast";

type Notice = {
  noticeId: number;
  title: string;
  content: string;
  audience: string;
  targetClass: string | null;
  postedAt: string;
  isActive: boolean;
  type: string;
  priority: string;
  postedBy: { username: string; role: string };
};

// ── Enum values must match C# enum names exactly ─────────────
const AUDIENCES = [
  "SchoolWide",
  "StudentsOnly",
  "ParentsOnly",
  "TeachersOnly",
  "ClassSpecific",
];
const TYPES = ["Academic", "Event", "Holiday", "Exam", "Fee", "General"];
const PRIORITIES = ["Low", "Medium", "High"];
const CLASSES = ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10"];

const priorityColor = (p: string) =>
  p === "High"
    ? "bg-red-100 text-red-700"
    : p === "Medium"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-green-100 text-green-700";

const emptyForm = {
  title: "",
  content: "",
  audience: "SchoolWide",
  type: "General",
  priority: "Medium",
  targetClass: "",
};

export function ManageNoticeboard() {
  const { toasts, success, error } = useToast();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editNotice, setEditNotice] = useState<Notice | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [newNotice, setNewNotice] = useState(emptyForm);

  const fetchNotices = async () => {
    try {
      setFetching(true);
      setNotices(await getNotices());
    } catch (err: any) {
      error(err.message ?? "Failed to load notices");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createNotice({
        title: newNotice.title,
        content: newNotice.content,
        audience: newNotice.audience, // ✅ sent as string, backend parses to enum
        type: newNotice.type, // ✅ fixed — was missing before
        priority: newNotice.priority, // ✅ fixed — was missing before
        targetClass:
          newNotice.audience === "ClassSpecific" ? newNotice.targetClass : null,
      });
      success("Notice posted successfully");
      setNewNotice(emptyForm);
      setShowAddForm(false);
      fetchNotices();
    } catch (err: any) {
      error(err.message ?? "Failed to post notice");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editNotice) return;
    setLoading(true);
    try {
      await updateNotice(editNotice.noticeId, {
        title: editNotice.title,
        content: editNotice.content,
        audience: editNotice.audience,
        type: editNotice.type,
        priority: editNotice.priority,
        targetClass:
          editNotice.audience === "ClassSpecific"
            ? editNotice.targetClass
            : null,
      });
      success("Notice updated");
      setEditNotice(null);
      fetchNotices();
    } catch (err: any) {
      error(err.message ?? "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this notice?")) return;
    try {
      await deleteNotice(id);
      success("Notice deleted");
      setNotices((prev) => prev.filter((n) => n.noticeId !== id));
    } catch (err: any) {
      error(err.message ?? "Failed to delete");
    }
  };

  const filtered = notices.filter(
    (n) =>
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.audience.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.type.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Reusable notice form fields
  const NoticeForm = ({
    data,
    onChange,
  }: {
    data: typeof emptyForm;
    onChange: (d: typeof emptyForm) => void;
  }) => (
    <>
      <div className="md:col-span-2">
        <label className="block text-gray-700 mb-1 text-sm">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="Notice title"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>
      <div className="md:col-span-2">
        <label className="block text-gray-700 mb-1 text-sm">
          Content <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          rows={3}
          value={data.content}
          onChange={(e) => onChange({ ...data, content: e.target.value })}
          placeholder="Notice content..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
        />
      </div>
      <div>
        <label className="block text-gray-700 mb-1 text-sm">
          Type <span className="text-red-500">*</span>
        </label>
        <select
          required
          value={data.type}
          onChange={(e) => onChange({ ...data, type: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-gray-700 mb-1 text-sm">
          Priority <span className="text-red-500">*</span>
        </label>
        <select
          required
          value={data.priority}
          onChange={(e) => onChange({ ...data, priority: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-gray-700 mb-1 text-sm">
          Audience <span className="text-red-500">*</span>
        </label>
        <select
          required
          value={data.audience}
          onChange={(e) => onChange({ ...data, audience: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          {AUDIENCES.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>
      {data.audience === "ClassSpecific" && (
        <div>
          <label className="block text-gray-700 mb-1 text-sm">
            Target Class <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={data.targetClass}
            onChange={(e) => onChange({ ...data, targetClass: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Select class</option>
            {CLASSES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      )}
    </>
  );

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} />

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-gray-900 mb-2">Manage Noticeboard</h1>
          <p className="text-gray-600">Post and manage school notices</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Post Notice
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-gray-900">Post New Notice</h2>
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
            <NoticeForm data={newNotice} onChange={setNewNotice} />
            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Posting..." : "Post Notice"}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {editNotice && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-gray-900">Edit Notice</h2>
              <button
                onClick={() => setEditNotice(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={handleUpdate}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <NoticeForm
                data={{
                  title: editNotice.title,
                  content: editNotice.content,
                  audience: editNotice.audience,
                  type: editNotice.type,
                  priority: editNotice.priority,
                  targetClass: editNotice.targetClass ?? "",
                }}
                onChange={(d) => setEditNotice({ ...editNotice, ...d })}
              />
              <div className="md:col-span-2 flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditNotice(null)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, audience or type..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b flex items-center gap-3">
          <Bell className="w-6 h-6 text-red-600" />
          <h2 className="text-gray-900">Notices ({filtered.length})</h2>
        </div>
        {fetching ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            {searchTerm ? "No notices match." : "No notices yet."}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filtered.map((n) => (
              <div
                key={n.noticeId}
                className="p-5 hover:bg-gray-50 flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {n.title}
                    </h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor(n.priority)}`}
                    >
                      {n.priority}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                      {n.type}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                      {n.audience}
                    </span>
                    {!n.isActive && (
                      <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-500 rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {n.content}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Posted by {n.postedBy.username} ·{" "}
                    {new Date(n.postedAt).toLocaleDateString()}
                    {n.targetClass && ` · ${n.targetClass}`}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => setEditNotice(n)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(n.noticeId)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
