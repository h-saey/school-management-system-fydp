import React, { useState, useEffect } from "react";
import { Users, Plus, Edit, Trash2, Search, X } from "lucide-react";
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getUsersByRole,
  UserRecord,
} from "../../services/api";
import { useToast, ToastContainer } from "../../utils/useToast";

type Student = {
  studentId: number;
  userId: number;
  firstName: string;
  lastName: string;
  class: string;
  section: string;
  rollNumber: string;
  email?: string;
  isActive?: boolean;
};

const emptyForm = {
  userId: "",
  firstName: "",
  lastName: "",
  class: "",
  section: "",
  rollNumber: "",
};

const CLASSES = ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10"];
const SECTIONS = ["A", "B", "C", "D"];

export function ManageStudents() {
  const { toasts, success, error } = useToast();

  const [students, setStudents] = useState<Student[]>([]);
  const [studentUsers, setStudentUsers] = useState<UserRecord[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [newStudent, setNewStudent] = useState(emptyForm);

  const fetchAll = async () => {
    try {
      setFetching(true);
      // Fetch students and available Student-role users in parallel
      const [studs, users] = await Promise.all([
        getStudents(),
        getUsersByRole("Student"),
      ]);
      setStudents(studs);
      setStudentUsers(users);
    } catch (err: any) {
      error(err.message ?? "Failed to load data");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ── Create ───────────────────────────────────────────────
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createStudent({
        userId: Number(newStudent.userId),
        firstName: newStudent.firstName,
        lastName: newStudent.lastName,
        class: newStudent.class,
        section: newStudent.section,
        rollNumber: newStudent.rollNumber,
      });
      success("Student added successfully");
      setNewStudent(emptyForm);
      setShowAddForm(false);
      fetchAll();
    } catch (err: any) {
      error(err.message ?? "Failed to add student");
    } finally {
      setLoading(false);
    }
  };

  // ── Update ───────────────────────────────────────────────
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStudent) return;
    setLoading(true);
    try {
      await updateStudent(editStudent.studentId, {
        firstName: editStudent.firstName,
        lastName: editStudent.lastName,
        class: editStudent.class,
        section: editStudent.section,
        rollNumber: editStudent.rollNumber,
      });
      success("Student updated");
      setEditStudent(null);
      fetchAll();
    } catch (err: any) {
      error(err.message ?? "Failed to update student");
    } finally {
      setLoading(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this student?")) return;
    try {
      await deleteStudent(id);
      success("Student deleted");
      setStudents((prev) => prev.filter((s) => s.studentId !== id));
    } catch (err: any) {
      error(err.message ?? "Failed to delete student");
    }
  };

  // Filter out users who already have a student profile
  const existingUserIds = new Set(students.map((s) => s.userId));
  const availableUsers = studentUsers.filter(
    (u) => !existingUserIds.has(u.userId),
  );

  const filtered = students.filter(
    (s) =>
      `${s.firstName} ${s.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.class.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} />

      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-gray-900 mb-2">Manage Students</h1>
          <p className="text-gray-600">Add and manage student profiles</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Student
        </button>
      </div>

      {/* ADD FORM */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-gray-900">Add New Student</h2>
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
            {/* User dropdown — no manual ID entry needed */}
            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-1 text-sm">
                Select User Account <span className="text-red-500">*</span>
                <span className="text-gray-400 ml-2 font-normal">
                  (only Student-role accounts without a profile)
                </span>
              </label>
              {availableUsers.length === 0 ? (
                <div className="px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
                  No available Student accounts. Go to{" "}
                  <strong>Manage Users</strong> → create a user with Student
                  role first.
                </div>
              ) : (
                <select
                  required
                  value={newStudent.userId}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, userId: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select user account</option>
                  {availableUsers.map((u) => (
                    <option key={u.userId} value={u.userId}>
                      [ID: {u.userId}] {u.username} — {u.email}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-gray-700 mb-1 text-sm">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newStudent.firstName}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, firstName: e.target.value })
                }
                placeholder="First name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 text-sm">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newStudent.lastName}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, lastName: e.target.value })
                }
                placeholder="Last name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 text-sm">
                Class <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={newStudent.class}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, class: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select Class</option>
                {CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-1 text-sm">
                Section <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={newStudent.section}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, section: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select Section</option>
                {SECTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-1 text-sm">
                Roll Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newStudent.rollNumber}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, rollNumber: e.target.value })
                }
                placeholder="e.g. 2024-001"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={loading || availableUsers.length === 0}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Student"}
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

      {/* EDIT MODAL */}
      {editStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-gray-900">Edit Student</h2>
              <button
                onClick={() => setEditStudent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={handleUpdate}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-gray-700 mb-1 text-sm">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={editStudent.firstName}
                  onChange={(e) =>
                    setEditStudent({
                      ...editStudent,
                      firstName: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 text-sm">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={editStudent.lastName}
                  onChange={(e) =>
                    setEditStudent({ ...editStudent, lastName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 text-sm">
                  Class
                </label>
                <select
                  required
                  value={editStudent.class}
                  onChange={(e) =>
                    setEditStudent({ ...editStudent, class: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {CLASSES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-1 text-sm">
                  Section
                </label>
                <select
                  required
                  value={editStudent.section}
                  onChange={(e) =>
                    setEditStudent({ ...editStudent, section: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {SECTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-1 text-sm">
                  Roll Number
                </label>
                <input
                  type="text"
                  required
                  value={editStudent.rollNumber}
                  onChange={(e) =>
                    setEditStudent({
                      ...editStudent,
                      rollNumber: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
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
                  onClick={() => setEditStudent(null)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SEARCH */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, roll number or class..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b flex items-center gap-3">
          <Users className="w-6 h-6 text-red-600" />
          <h2 className="text-gray-900">Students ({filtered.length})</h2>
        </div>
        {fetching ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            {searchTerm
              ? "No students match your search."
              : "No students yet. Add one above."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-gray-700">Roll No</th>
                  <th className="px-6 py-4 text-left text-gray-700">Name</th>
                  <th className="px-6 py-4 text-left text-gray-700">Class</th>
                  <th className="px-6 py-4 text-left text-gray-700">Section</th>
                  <th className="px-6 py-4 text-left text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((s) => (
                  <tr key={s.studentId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-700 font-mono">
                      {s.rollNumber}
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {s.firstName} {s.lastName}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{s.class}</td>
                    <td className="px-6 py-4 text-gray-700">{s.section}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditStudent(s)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.studentId)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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

// import React, { useState, useEffect } from "react";
// import { Users, Plus, Edit, Trash2, Search } from "lucide-react";

// export function ManageStudents() {
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");

//   // const students = [
//   //   {
//   //     id: 1,
//   //     rollNo: "001",
//   //     name: "Aarav Patel",
//   //     class: "Class 10-A",
//   //     section: "A",
//   //     dob: "2010-05-15",
//   //     parent: "Mr. Patel",
//   //     phone: "9876543210",
//   //   },
//   //   {
//   //     id: 2,
//   //     rollNo: "002",
//   //     name: "Aadhya Sharma",
//   //     class: "Class 10-A",
//   //     section: "A",
//   //     dob: "2010-06-20",
//   //     parent: "Mrs. Sharma",
//   //     phone: "9876543211",
//   //   },
//   //   {
//   //     id: 3,
//   //     rollNo: "003",
//   //     name: "Advait Kumar",
//   //     class: "Class 10-A",
//   //     section: "A",
//   //     dob: "2010-04-10",
//   //     parent: "Mr. Kumar",
//   //     phone: "9876543212",
//   //   },
//   //   {
//   //     id: 4,
//   //     rollNo: "004",
//   //     name: "Ananya Singh",
//   //     class: "Class 9-B",
//   //     section: "B",
//   //     dob: "2011-07-25",
//   //     parent: "Mrs. Singh",
//   //     phone: "9876543213",
//   //   },
//   //   {
//   //     id: 5,
//   //     rollNo: "005",
//   //     name: "Arjun Reddy",
//   //     class: "Class 9-B",
//   //     section: "B",
//   //     dob: "2011-03-12",
//   //     parent: "Mr. Reddy",
//   //     phone: "9876543214",
//   //   },
//   // ];

//   type Student = {
//     studentId: number;
//     userId: number;
//     firstName: string;
//     lastName: string;
//     class: string;
//     section: string;
//     rollNumber: string;
//   };

//   const [students, setStudents] = useState<Student[]>([]);

//   const [newStudent, setNewStudent] = useState({
//     userId: "",
//     firstName: "",
//     lastName: "",
//     class: "",
//     section: "",
//     rollNumber: "",
//   });

//   useEffect(() => {
//     const token = localStorage.getItem("token");

//     fetch("http://localhost:5036/api/Student", {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     })
//       .then((res) => res.json())
//       .then((data) => {
//         console.log("Students:", data);
//         setStudents(data);
//       })
//       .catch((err) => {
//         console.error("Error fetching students:", err);
//       });
//   }, []);

//   const handleAddStudent = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const token = localStorage.getItem("token");

//     try {
//       const response = await fetch("http://localhost:5036/api/Student", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(newStudent),
//       });

//       if (response.ok) {
//         const addedStudent = await response.json();

//         // add new student to list
//         setStudents([...students, addedStudent]);

//         // clear form
//         setNewStudent({
//           userId: "",
//           firstName: "",
//           lastName: "",
//           class: "",
//           section: "",
//           rollNumber: "",
//         });

//         setShowAddForm(false);

//         alert("Student added successfully ✅");
//       } else {
//         alert("Failed to add student ❌");
//       }
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const filteredStudents = students.filter(
//     (student) =>
//       student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       student.rollNumber.includes(searchTerm) ||
//       student.class.toLowerCase().includes(searchTerm.toLowerCase()),
//   );

//   return (
//     <div className="space-y-6">
//       <div className="flex items-start justify-between">
//         <div>
//           <h1 className="text-gray-900 mb-2">Manage Students</h1>
//           <p className="text-gray-600">
//             Add, update, and manage student profiles
//           </p>
//         </div>
//         <button
//           onClick={() => setShowAddForm(!showAddForm)}
//           className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//         >
//           <Plus className="w-4 h-4 sm:block md:block" />
//           Add New Student
//         </button>
//       </div>

//       {/* Add Student Form */}
//       {/* {showAddForm && (
//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <h2 className="text-gray-900 mb-6">Add New Student</h2>
//           <form
//             onSubmit={handleAddStudent}
//             className="grid grid-cols-1 md:grid-cols-2 gap-4"
//           >
//             <div>
//               <label className="block text-gray-700 mb-2">User ID</label>
//               <input
//                 type="number"
//                 value={newStudent.userId}
//                 onChange={(e) =>
//                   setNewStudent({
//                     ...newStudent,
//                     userId: e.target.value,
//                   })
//                 }
//                 placeholder="Enter student ID"
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
//               />
//             </div>

//             <div>
//               <label className="block text-gray-700 mb-2">Date of Birth</label>
//               <input
//                 type="date"
//                 value={newStudent.dob}
//                 onChange={(e) =>
//                   setNewStudent({
//                     ...newStudent,
//                     dob: e.target.value,
//                   })
//                 }
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
//               />
//             </div>
//             <div>
//               <label className="block text-gray-700 mb-2">Class</label>
//               <select
//                 value={newStudent.class}
//                 onChange={(e) =>
//                   setNewStudent({
//                     ...newStudent,
//                     class: e.target.value,
//                   })
//                 }
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
//               >
//                 <option>Class 6</option>
//                 <option>Class 7</option>
//                 <option>Class 8</option>
//                 <option>Class 9</option>
//                 <option>Class 10</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-gray-700 mb-2">Section</label>
//               <select
//                 value={newStudent.section}
//                 onChange={(e) =>
//                   setNewStudent({
//                     ...newStudent,
//                     section: e.target.value,
//                   })
//                 }
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
//               >
//                 <option>A</option>
//                 <option>B</option>
//                 <option>C</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-gray-700 mb-2">Roll Number</label>
//               <input
//                 type="text"
//                 value={newStudent.rollNo}
//                 onChange={(e) =>
//                   setNewStudent({
//                     ...newStudent,
//                     rollNo: e.target.value,
//                   })
//                 }
//                 placeholder="Auto-generated"
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
//               />
//             </div>
//             <div>
//               <label className="block text-gray-700 mb-2">
//                 Parent/Guardian Name
//               </label>
//               <input
//                 type="text"
//                 value={newStudent.parent}
//                 onChange={(e) =>
//                   setNewStudent({
//                     ...newStudent,
//                     parent: e.target.value,
//                   })
//                 }
//                 placeholder="Enter parent name"
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
//               />
//             </div>
//             <div>
//               <label className="block text-gray-700 mb-2">Contact Number</label>
//               <input
//                 type="tel"
//                 value={newStudent.phone}
//                 onChange={(e) =>
//                   setNewStudent({
//                     ...newStudent,
//                     phone: e.target.value,
//                   })
//                 }
//                 placeholder="Enter phone number"
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
//               />
//             </div>
//             <div>
//               <label className="block text-gray-700 mb-2">Email</label>
//               <input
//                 type="email"
//                 value={newStudent.email}
//                 onChange={(e) =>
//                   setNewStudent({
//                     ...newStudent,
//                     email: e.target.value,
//                   })
//                 }
//                 placeholder="Enter email address"
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
//               />
//             </div>
//             <div className="md:col-span-2 flex gap-3">
//               <button
//                 type="submit"
//                 className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//               >
//                 Add Student
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setShowAddForm(false)}
//                 className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       )} */}
//       {showAddForm && (
//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <h2 className="text-gray-900 mb-6">Add New Student</h2>

//           <form
//             onSubmit={handleAddStudent}
//             className="grid grid-cols-1 md:grid-cols-2 gap-4"
//           >
//             {/* User ID */}
//             <div>
//               <label className="block text-gray-700 mb-2">User ID</label>
//               <input
//                 type="number"
//                 value={newStudent.userId}
//                 onChange={(e) =>
//                   setNewStudent({
//                     ...newStudent,
//                     userId: e.target.value,
//                   })
//                 }
//                 placeholder="Enter User ID"
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
//               />
//             </div>

//             {/* First Name */}
//             <div>
//               <label className="block text-gray-700 mb-2">First Name</label>
//               <input
//                 type="text"
//                 value={newStudent.firstName}
//                 onChange={(e) =>
//                   setNewStudent({
//                     ...newStudent,
//                     firstName: e.target.value,
//                   })
//                 }
//                 placeholder="Enter first name"
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
//               />
//             </div>

//             {/* Last Name */}
//             <div>
//               <label className="block text-gray-700 mb-2">Last Name</label>
//               <input
//                 type="text"
//                 value={newStudent.lastName}
//                 onChange={(e) =>
//                   setNewStudent({
//                     ...newStudent,
//                     lastName: e.target.value,
//                   })
//                 }
//                 placeholder="Enter last name"
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
//               />
//             </div>

//             {/* Class */}
//             <div>
//               <label className="block text-gray-700 mb-2">Class</label>
//               <select
//                 value={newStudent.class}
//                 onChange={(e) =>
//                   setNewStudent({
//                     ...newStudent,
//                     class: e.target.value,
//                   })
//                 }
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
//               >
//                 <option value="">Select Class</option>
//                 <option value="Class 6">Class 6</option>
//                 <option value="Class 7">Class 7</option>
//                 <option value="Class 8">Class 8</option>
//                 <option value="Class 9">Class 9</option>
//                 <option value="Class 10">Class 10</option>
//               </select>
//             </div>

//             {/* Section */}
//             <div>
//               <label className="block text-gray-700 mb-2">Section</label>
//               <select
//                 value={newStudent.section}
//                 onChange={(e) =>
//                   setNewStudent({
//                     ...newStudent,
//                     section: e.target.value,
//                   })
//                 }
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
//               >
//                 <option value="">Select Section</option>
//                 <option value="A">A</option>
//                 <option value="B">B</option>
//                 <option value="C">C</option>
//               </select>
//             </div>

//             {/* Roll Number */}
//             <div>
//               <label className="block text-gray-700 mb-2">Roll Number</label>
//               <input
//                 type="text"
//                 value={newStudent.rollNumber}
//                 onChange={(e) =>
//                   setNewStudent({
//                     ...newStudent,
//                     rollNumber: e.target.value,
//                   })
//                 }
//                 placeholder="Enter roll number"
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
//               />
//             </div>

//             {/* Buttons */}
//             <div className="md:col-span-2 flex gap-3">
//               <button
//                 type="submit"
//                 className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//               >
//                 Add Student
//               </button>

//               <button
//                 type="button"
//                 onClick={() => setShowAddForm(false)}
//                 className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {/* Search */}
//       <div className="bg-white rounded-xl shadow-sm p-6">
//         <div className="relative">
//           <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
//           <input
//             type="text"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             placeholder="Search by name, roll number, or class..."
//             className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
//           />
//         </div>
//       </div>

//       {/* Students Table */}
//       <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//         <div className="p-6 border-b">
//           <div className="flex items-center gap-3">
//             <Users className="w-6 h-6 text-red-600" />
//             <h2 className="text-gray-900">
//               Student List ({filteredStudents.length})
//             </h2>
//           </div>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full min-w-[800px]">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-4 text-left text-gray-700 whitespace-nowrap">
//                   Roll No
//                 </th>
//                 <th className="px-6 py-4 text-left text-gray-700 whitespace-nowrap">
//                   Name
//                 </th>
//                 <th className="px-6 py-4 text-left text-gray-700 whitespace-nowrap">
//                   Class
//                 </th>
//                 <th className="px-6 py-4 text-left text-gray-700 whitespace-nowrap">
//                   Section
//                 </th>
//                 <th className="px-6 py-4 text-left text-gray-700 whitespace-nowrap">
//                   DOB
//                 </th>
//                 <th className="px-6 py-4 text-left text-gray-700 whitespace-nowrap">
//                   Parent
//                 </th>
//                 <th className="px-6 py-4 text-left text-gray-700 whitespace-nowrap">
//                   Contact
//                 </th>
//                 <th className="px-6 py-4 text-left text-gray-700 whitespace-nowrap">
//                   Actions
//                 </th>
//               </tr>
//             </thead>

//             <tbody className="divide-y divide-gray-200">
//               {filteredStudents.map((student) => (
//                 <tr key={student.studentId} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
//                     {student.rollNumber}
//                   </td>
//                   <td className="px-6 py-4 text-gray-900 whitespace-nowrap">
//                     {student.firstName} {student.lastName}
//                   </td>
//                   <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
//                     {student.class}
//                   </td>
//                   <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
//                     {student.section}
//                   </td>

//                   <td className="px-6 py-4">
//                     <div className="flex gap-2">
//                       <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
//                         <Edit className="w-4 h-4" />
//                       </button>

//                       <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
