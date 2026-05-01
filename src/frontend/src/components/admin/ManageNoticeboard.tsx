import React, { useState, useEffect } from "react";
import { Bell, Plus } from "lucide-react";
import { API_BASE } from "../../services/api";
import { Edit, Trash2 } from "lucide-react";

export function ManageNoticeboard() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [notices, setNotices] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    audience: "SchoolWide",
    type: "Exam",
    priority: "High",
    targetClass: "",
  });

  // ✅ FETCH NOTICES
  useEffect(() => {
    fetchNotices();
  }, []);

  const handleEdit = (notice: any) => {
    setFormData({
      title: notice.title,
      content: notice.content,
      audience: notice.audience,
      type: notice.type,
      priority: notice.priority,
      targetClass: notice.targetClass || "",
    });

    setEditingId(notice.noticeId);
    setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_BASE}/notice/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setNotices((prev) => prev.filter((n) => n.noticeId !== id));
      } else {
        alert("Delete failed ❌");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotices = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE}/notice`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch notices");
      }

      const data = await response.json();
      setNotices(data);
    } catch (error) {
      console.error("Error fetching notices:", error);
    }
  };

  // ✅ HANDLE INPUT CHANGE
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ HANDLE SUBMIT
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    try {
      const url =
        editingId !== null
          ? `${API_BASE}/notice/${editingId}`
          : `${API_BASE}/notice`;

      const method = editingId !== null ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert(editingId ? "Notice Updated 🎉" : "Notice Posted 🎉");

        setShowAddForm(false);
        setEditingId(null);

        setFormData({
          title: "",
          content: "",
          audience: "SchoolWide",
          type: "Exam",
          priority: "High",
          targetClass: "",
        });

        fetchNotices();
      } else {
        alert("Operation failed ❌");
      }
    } catch (err) {
      console.error(err);
    }
  };

  //Cancel form and reset state
  const resetForm = () => {
    setShowAddForm(false);
    setEditingId(null);
    setFormData({
      title: "",
      content: "",
      audience: "SchoolWide",
      type: "Exam",
      priority: "High",
      targetClass: "",
    });
  };

  // const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();

  //   try {
  //     const token = localStorage.getItem("token");

  //     const response = await fetch(`${API_BASE}/notice`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({
  //         ...formData,
  //       }),
  //     });

  //     if (response.ok) {
  //       alert("Notice Posted 🎉");

  //       setShowAddForm(false);

  //       fetchNotices(); // refresh table
  //     } else {
  //       alert("Error posting notice ❌");
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Manage Digital Noticeboard</h1>

          <p className="text-gray-600">Upload and manage school notices</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Post New Notice
        </button>
      </div>

      {/* ADD FORM */}

      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="mb-6">Create New Notice</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* TYPE */}

            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="Exam">Exam</option>

              <option value="Holiday">Holiday</option>

              <option value="Event">Event</option>

              <option value="Fee">Fee</option>

              <option value="Academic">Academic</option>
            </select>

            {/* PRIORITY */}

            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="High">High</option>

              <option value="Medium">Medium</option>

              <option value="Low">Low</option>
            </select>

            {/* TITLE */}

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Notice Title"
              className="w-full px-4 py-2 border rounded-lg"
            />

            {/* CONTENT */}

            <textarea
              rows={5}
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Notice Message"
              className="w-full px-4 py-2 border rounded-lg"
            />

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-red-600 text-white rounded-lg"
              >
                Post Notice
              </button>

              <button
                type="button"
                onClick={() => resetForm()}
                className="px-6 py-2 border rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* NOTICE TABLE */}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b flex items-center gap-3">
          <Bell className="w-6 h-6 text-red-600" />
          <h2>Posted Notices</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-gray-700">Title</th>
                <th className="px-6 py-4 text-left text-gray-700">Type</th>
                <th className="px-6 py-4 text-left text-gray-700">Priority</th>
                <th className="px-6 py-4 text-left text-gray-700">Date</th>
                <th className="px-6 py-4 text-left text-gray-700">Posted By</th>
                <th className="px-6 py-4 text-left text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-gray-700">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {notices.map((notice: any) => (
                <tr key={notice.noticeId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900">{notice.title}</td>

                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {notice.type}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        notice.priority === "High"
                          ? "bg-red-100 text-red-700"
                          : notice.priority === "Medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {notice.priority}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-gray-700">
                    {new Date(notice.postedAt).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4 text-gray-700">
                    {notice.postedBy?.username}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        notice.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {notice.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(notice)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(notice.noticeId)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
      </div>
    </div>
  );
}

// import React, { useState } from 'react';
// import { Bell, Plus, Edit, Trash2, Calendar } from 'lucide-react';

// export function ManageNoticeboard() {
//   const [showAddForm, setShowAddForm] = useState(false);

//   const notices = [
//     { id: 1, title: 'Final Exam Schedule Released', type: 'Exam', priority: 'High', date: '2025-12-11', postedBy: 'Admin', status: 'Active' },
//     { id: 2, title: 'Winter Vacation Notice', type: 'Holiday', priority: 'Medium', date: '2025-12-09', postedBy: 'Admin', status: 'Active' },
//     { id: 3, title: 'Parent-Teacher Meeting', type: 'Event', priority: 'High', date: '2025-12-08', postedBy: 'Admin', status: 'Active' }
//   ];

//   return (
//     <div className="space-y-6">
//       <div className="flex items-start justify-between">
//         <div>
//           <h1 className="text-gray-900 mb-2">Manage Digital Noticeboard</h1>
//           <p className="text-gray-600">Upload and schedule school-wide notices</p>
//         </div>
//         <button
//           onClick={() => setShowAddForm(!showAddForm)}
//           className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//         >
//           <Plus className="w-4 h-4" />
//           Post New Notice
//         </button>
//       </div>

//       {showAddForm && (
//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <h2 className="text-gray-900 mb-6">Create New Notice</h2>
//           <form className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-gray-700 mb-2">Notice Type</label>
//                 <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
//                   <option>Exam</option>
//                   <option>Holiday</option>
//                   <option>Event</option>
//                   <option>Fee</option>
//                   <option>Academic</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-gray-700 mb-2">Priority</label>
//                 <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
//                   <option>High</option>
//                   <option>Medium</option>
//                   <option>Low</option>
//                 </select>
//               </div>
//             </div>
//             <div>
//               <label className="block text-gray-700 mb-2">Title</label>
//               <input type="text" placeholder="Enter notice title" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
//             </div>
//             <div>
//               <label className="block text-gray-700 mb-2">Message</label>
//               <textarea rows={6} placeholder="Enter notice message..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
//             </div>
//             <div className="flex gap-3">
//               <button type="submit" className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Post Notice</button>
//               <button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
//             </div>
//           </form>
//         </div>
//       )}

//       <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//         <div className="p-6 border-b">
//           <div className="flex items-center gap-3">
//             <Bell className="w-6 h-6 text-red-600" />
//             <h2 className="text-gray-900">Posted Notices</h2>
//           </div>
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
//               {notices.map((notice) => (
//                 <tr key={notice.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 text-gray-900">{notice.title}</td>
//                   <td className="px-6 py-4"><span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{notice.type}</span></td>
//                   <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-sm ${notice.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{notice.priority}</span></td>
//                   <td className="px-6 py-4 text-gray-700">{notice.date}</td>
//                   <td className="px-6 py-4 text-gray-700">{notice.postedBy}</td>
//                   <td className="px-6 py-4"><span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">{notice.status}</span></td>
//                   <td className="px-6 py-4">
//                     <div className="flex gap-2">
//                       <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
//                       <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
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
