import React, { useState, useEffect } from "react";
import { BookOpen, Plus, Edit, Trash2, Search } from "lucide-react";

type Teacher = {
  teacherId: number;
  firstName: string;
  lastName: string;
  assignedSubjects: string;
  email: string;
  isActive: boolean;
};

export function ManageTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const [newTeacher, setNewTeacher] = useState({
    userId: "",
    firstName: "",
    lastName: "",
    assignedSubjects: "",
  });

  // ============================
  // FETCH TEACHERS
  // ============================

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5036/api/Teacher", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      console.log("Teachers:", data);

      setTeachers(data);
    } catch (error) {
      console.error("Fetch teachers error:", error);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // ============================
  // ADD TEACHER
  // ============================

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5036/api/Teacher", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: Number(newTeacher.userId),
          firstName: newTeacher.firstName,
          lastName: newTeacher.lastName,
          assignedSubjects: newTeacher.assignedSubjects,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Teacher created successfully ✅");

        setNewTeacher({
          userId: "",
          firstName: "",
          lastName: "",
          assignedSubjects: "",
        });

        setShowAddForm(false);

        fetchTeachers();
      } else {
        alert(JSON.stringify(data));
      }
    } catch (error) {
      console.error(error);

      alert("Server error");
    }

    setLoading(false);
  };

  // ============================
  // DELETE TEACHER
  // ============================

  const handleDelete = async (id: number) => {
    if (!confirm("Delete teacher?")) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:5036/api/Teacher/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert("Teacher deleted");

        fetchTeachers();
      } else {
        alert("Delete failed");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ============================
  // SEARCH
  // ============================

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.assignedSubjects.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // ============================
  // UI
  // ============================

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex justify-between">
        <div>
          <h1 className="text-xl font-semibold">Manage Teachers</h1>

          <p className="text-gray-600">Add and manage teachers</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Add Teacher
        </button>
      </div>

      {/* ADD FORM */}

      {showAddForm && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="mb-4 font-medium">Add Teacher</h2>

          <form
            onSubmit={handleAddTeacher}
            className="grid md:grid-cols-2 gap-4"
          >
            <input
              type="number"
              placeholder="User ID"
              value={newTeacher.userId}
              onChange={(e) =>
                setNewTeacher({
                  ...newTeacher,
                  userId: e.target.value,
                })
              }
              className="border p-2 rounded"
              required
            />

            <input
              type="text"
              placeholder="First Name"
              value={newTeacher.firstName}
              onChange={(e) =>
                setNewTeacher({
                  ...newTeacher,
                  firstName: e.target.value,
                })
              }
              className="border p-2 rounded"
              required
            />

            <input
              type="text"
              placeholder="Last Name"
              value={newTeacher.lastName}
              onChange={(e) =>
                setNewTeacher({
                  ...newTeacher,
                  lastName: e.target.value,
                })
              }
              className="border p-2 rounded"
              required
            />

            <input
              type="text"
              placeholder="Subjects (comma separated)"
              value={newTeacher.assignedSubjects}
              onChange={(e) =>
                setNewTeacher({
                  ...newTeacher,
                  assignedSubjects: e.target.value,
                })
              }
              className="border p-2 rounded"
              required
            />

            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-red-600 text-white rounded"
              >
                {loading ? "Adding..." : "Add Teacher"}
              </button>

              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 border rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SEARCH */}

      <div className="bg-white p-4 rounded-xl shadow">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />

          <input
            type="text"
            placeholder="Search teachers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border p-2 w-full rounded"
          />
        </div>
      </div>

      {/* TABLE */}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-4 border-b flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-red-600" />

          <h2>Teacher List ({filteredTeachers.length})</h2>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Name</th>

              <th className="p-3 text-left">Subjects</th>

              <th className="p-3 text-left">Email</th>

              <th className="p-3 text-left">Status</th>

              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredTeachers.map((teacher) => (
              <tr key={teacher.teacherId} className="border-t">
                <td className="p-3">
                  {teacher.firstName} {teacher.lastName}
                </td>

                <td className="p-3">{teacher.assignedSubjects}</td>

                <td className="p-3">{teacher.email}</td>

                <td className="p-3">
                  {teacher.isActive ? "Active" : "Inactive"}
                </td>

                <td className="p-3 flex gap-2">
                  <button className="p-2 text-blue-600">
                    <Edit size={16} />
                  </button>

                  <button
                    onClick={() => handleDelete(teacher.teacherId)}
                    className="p-2 text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// import React, { useState } from 'react';
// import { BookOpen, Plus, Edit, Trash2, Search } from 'lucide-react';

// export function ManageTeachers() {
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');

//   const teachers = [
//     { id: 1, name: 'Dr. Priya Singh', subject: 'Mathematics', classes: 'Class 10-A, 9-B', email: 'priya@school.edu', phone: '9876543220' },
//     { id: 2, name: 'Mr. Rajesh Kumar', subject: 'Science', classes: 'Class 10-A, 9-B', email: 'rajesh@school.edu', phone: '9876543221' },
//     { id: 3, name: 'Mrs. Anita Sharma', subject: 'English', classes: 'Class 10-A, 8-C', email: 'anita@school.edu', phone: '9876543222' },
//     { id: 4, name: 'Mr. Vikram Patel', subject: 'History', classes: 'Class 9-B, 8-C', email: 'vikram@school.edu', phone: '9876543223' }
//   ];

//   const filteredTeachers = teachers.filter(teacher =>
//     teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     teacher.subject.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div className="space-y-6">
//       <div className="flex items-start justify-between">
//         <div>
//           <h1 className="text-gray-900 mb-2">Manage Teachers</h1>
//           <p className="text-gray-600">Add teachers, assign subjects, and map classes</p>
//         </div>
//         <button
//           onClick={() => setShowAddForm(!showAddForm)}
//           className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//         >
//           <Plus className="w-4 h-4" />
//           Add New Teacher
//         </button>
//       </div>

//       {showAddForm && (
//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <h2 className="text-gray-900 mb-6">Add New Teacher</h2>
//           <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-gray-700 mb-2">Teacher Name</label>
//               <input type="text" placeholder="Enter full name" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
//             </div>
//             <div>
//               <label className="block text-gray-700 mb-2">Subject</label>
//               <input type="text" placeholder="e.g., Mathematics" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
//             </div>
//             <div>
//               <label className="block text-gray-700 mb-2">Email</label>
//               <input type="email" placeholder="Enter email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
//             </div>
//             <div>
//               <label className="block text-gray-700 mb-2">Phone</label>
//               <input type="tel" placeholder="Enter phone" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
//             </div>
//             <div className="md:col-span-2">
//               <label className="block text-gray-700 mb-2">Assign Classes (Multiple)</label>
//               <select multiple className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" size={4}>
//                 <option>Class 10-A</option>
//                 <option>Class 9-B</option>
//                 <option>Class 8-C</option>
//               </select>
//             </div>
//             <div className="md:col-span-2 flex gap-3">
//               <button type="submit" className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Add Teacher</button>
//               <button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
//             </div>
//           </form>
//         </div>
//       )}

//       <div className="bg-white rounded-xl shadow-sm p-6">
//         <div className="relative">
//           <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
//           <input
//             type="text"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             placeholder="Search by name or subject..."
//             className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
//           />
//         </div>
//       </div>

//       <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//         <div className="p-6 border-b">
//           <div className="flex items-center gap-3">
//             <BookOpen className="w-6 h-6 text-red-600" />
//             <h2 className="text-gray-900">Teacher List ({filteredTeachers.length})</h2>
//           </div>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-4 text-left text-gray-700">Name</th>
//                 <th className="px-6 py-4 text-left text-gray-700">Subject</th>
//                 <th className="px-6 py-4 text-left text-gray-700">Assigned Classes</th>
//                 <th className="px-6 py-4 text-left text-gray-700">Email</th>
//                 <th className="px-6 py-4 text-left text-gray-700">Phone</th>
//                 <th className="px-6 py-4 text-left text-gray-700">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {filteredTeachers.map((teacher) => (
//                 <tr key={teacher.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 text-gray-900">{teacher.name}</td>
//                   <td className="px-6 py-4 text-gray-700">{teacher.subject}</td>
//                   <td className="px-6 py-4 text-gray-700">{teacher.classes}</td>
//                   <td className="px-6 py-4 text-gray-700">{teacher.email}</td>
//                   <td className="px-6 py-4 text-gray-700">{teacher.phone}</td>
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
