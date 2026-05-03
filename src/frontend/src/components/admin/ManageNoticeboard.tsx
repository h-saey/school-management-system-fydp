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
    ? "border border-red-200/80 bg-red-50 text-red-800"
    : p === "Medium"
      ? "border border-amber-200/80 bg-amber-50 text-amber-900"
      : "border border-emerald-200/80 bg-emerald-50 text-emerald-800";

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
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">
          Title <span className="font-normal text-red-600">*</span>
        </label>
        <input
          type="text"
          required
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="Notice title"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
        />
      </div>
      <div className="md:col-span-2">
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">
          Content <span className="font-normal text-red-600">*</span>
        </label>
        <textarea
          required
          rows={3}
          value={data.content}
          onChange={(e) => onChange({ ...data, content: e.target.value })}
          placeholder="Notice content..."
          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
        />
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-slate-700">
          Type <span className="font-normal text-red-600">*</span>
        </label>
        <select
          required
          value={data.type}
          onChange={(e) => onChange({ ...data, type: e.target.value })}
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-slate-700">
          Priority <span className="font-normal text-red-600">*</span>
        </label>
        <select
          required
          value={data.priority}
          onChange={(e) => onChange({ ...data, priority: e.target.value })}
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-slate-700">
          Audience <span className="font-normal text-red-600">*</span>
        </label>
        <select
          required
          value={data.audience}
          onChange={(e) => onChange({ ...data, audience: e.target.value })}
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
        >
          {AUDIENCES.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>
      {data.audience === "ClassSpecific" && (
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-700">
            Target Class <span className="font-normal text-red-600">*</span>
          </label>
          <select
            required
            value={data.targetClass}
            onChange={(e) => onChange({ ...data, targetClass: e.target.value })}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
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
    <div className="min-w-0 space-y-6 sm:space-y-8">
      <ToastContainer toasts={toasts} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0 space-y-1">
          <h1 className="text-balance text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Manage Noticeboard
          </h1>
          <p className="text-pretty text-sm leading-relaxed text-slate-600 sm:text-base">
            Post and manage school notices
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-red-600/25 transition-colors hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 active:bg-red-800 sm:px-5 sm:py-3"
        >
          <Plus className="h-4 w-4 shrink-0" aria-hidden /> Post Notice
        </button>
      </div>

      {showAddForm && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
              Post New Notice
            </h2>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              aria-label="Close form"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <form
            onSubmit={handleAdd}
            className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5"
          >
            <NoticeForm data={newNotice} onChange={setNewNotice} />
            <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:gap-3">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-red-600/25 transition-colors hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 active:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {loading ? "Posting..." : "Post Notice"}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 active:bg-slate-100 sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {editNotice && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-4">
          <div className="flex max-h-[min(100dvh,900px)] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/15 sm:max-h-[90vh] sm:rounded-2xl">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                Edit Notice
              </h2>
              <button
                type="button"
                onClick={() => setEditNotice(null)}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={handleUpdate}
              className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 md:grid md:grid-cols-2 md:gap-5 md:space-y-0 sm:p-6"
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
              <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/50 px-0 pt-4 md:col-span-2 md:flex-row md:gap-3 md:border-0 md:bg-transparent md:px-0 md:pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-red-600/25 transition-colors hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 active:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditNotice(null)}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 active:bg-slate-100 sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, audience or type..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-11 pr-4 text-sm text-slate-900 shadow-inner shadow-slate-900/5 placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/25"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
          <Bell className="h-6 w-6 shrink-0 text-red-600" aria-hidden />
          <h2 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
            Notices ({filtered.length})
          </h2>
        </div>
        {fetching ? (
          <div className="px-4 py-12 text-center text-sm font-medium text-slate-500 sm:py-14">
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-slate-500 sm:py-14">
            {searchTerm ? "No notices match." : "No notices yet."}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((n) => (
              <div
                key={n.noticeId}
                className="flex flex-col gap-4 p-4 transition-colors hover:bg-slate-50/80 sm:flex-row sm:items-start sm:justify-between sm:gap-5 sm:p-5"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold leading-snug text-slate-900 sm:text-base">
                      {n.title}
                    </h3>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${priorityColor(n.priority)}`}
                    >
                      {n.priority}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-blue-200/80 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-800">
                      {n.type}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-slate-200/80 bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                      {n.audience}
                    </span>
                    {!n.isActive && (
                      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-200/80 px-2 py-0.5 text-xs font-semibold text-slate-600">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">
                    {n.content}
                  </p>
                  <p className="mt-2 text-xs font-medium text-slate-500">
                    Posted by {n.postedBy.username} ·{" "}
                    {new Date(n.postedAt).toLocaleDateString()}
                    {n.targetClass && ` · ${n.targetClass}`}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1 sm:flex-col sm:gap-2 md:flex-row">
                  <button
                    type="button"
                    onClick={() => setEditNotice(n)}
                    className="rounded-xl p-2.5 text-blue-700 transition-colors hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:bg-blue-100/60"
                    aria-label="Edit notice"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(n.noticeId)}
                    className="rounded-xl p-2.5 text-red-700 transition-colors hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 active:bg-red-100/60"
                    aria-label="Delete notice"
                  >
                    <Trash2 className="h-4 w-4" />
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
