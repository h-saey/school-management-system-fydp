import React, { useState, useEffect } from "react";
import { Users, Plus, Edit, Trash2, Search } from "lucide-react";

type Student = {
  studentId: number;
  userId: number;
  firstName: string;
  lastName: string;
  class: string;
  section: string;
  rollNumber: string;
};

export function ManageStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const [newStudent, setNewStudent] = useState({
    userId: "",
    firstName: "",
    lastName: "",
    class: "",
    section: "",
    rollNumber: "",
  });

  // ================================
  // FETCH STUDENTS
  // ================================

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5036/api/Student", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      console.log("Students:", data);

      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // ================================
  // ADD STUDENT
  // ================================

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5036/api/Student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: Number(newStudent.userId), // ⭐ IMPORTANT FIX
          firstName: newStudent.firstName,
          lastName: newStudent.lastName,
          class: newStudent.class,
          section: newStudent.section,
          rollNumber: newStudent.rollNumber,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Student added successfully ✅");

        setNewStudent({
          userId: "",
          firstName: "",
          lastName: "",
          class: "",
          section: "",
          rollNumber: "",
        });

        setShowAddForm(false);

        fetchStudents(); // ⭐ reload list
      } else {
        alert(JSON.stringify(data)); // ⭐ show real backend error
      }
    } catch (error) {
      console.error(error);
      alert("Server error");
    }

    setLoading(false);
  };

  // ================================
  // DELETE STUDENT
  // ================================

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this student?")) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:5036/api/Student/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert("Student deleted");

        fetchStudents();
      } else {
        alert("Delete failed");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ================================
  // SEARCH
  // ================================

  const filteredStudents = students.filter(
    (student) =>
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber.includes(searchTerm) ||
      student.class.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // ================================
  // UI
  // ================================

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex justify-between">
        <div>
          <h1 className="text-xl font-semibold">Manage Students</h1>

          <p className="text-gray-600">Add and manage students</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Add Student
        </button>
      </div>

      {/* ADD FORM */}

      {showAddForm && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="mb-4 font-medium">Add Student</h2>

          <form
            onSubmit={handleAddStudent}
            className="grid md:grid-cols-2 gap-4"
          >
            <input
              type="number"
              placeholder="User ID"
              value={newStudent.userId}
              onChange={(e) =>
                setNewStudent({
                  ...newStudent,
                  userId: e.target.value,
                })
              }
              className="border p-2 rounded"
              required
            />

            <input
              type="text"
              placeholder="First Name"
              value={newStudent.firstName}
              onChange={(e) =>
                setNewStudent({
                  ...newStudent,
                  firstName: e.target.value,
                })
              }
              className="border p-2 rounded"
              required
            />

            <input
              type="text"
              placeholder="Last Name"
              value={newStudent.lastName}
              onChange={(e) =>
                setNewStudent({
                  ...newStudent,
                  lastName: e.target.value,
                })
              }
              className="border p-2 rounded"
              required
            />

            <input
              type="text"
              placeholder="Class"
              value={newStudent.class}
              onChange={(e) =>
                setNewStudent({
                  ...newStudent,
                  class: e.target.value,
                })
              }
              className="border p-2 rounded"
              required
            />

            <input
              type="text"
              placeholder="Section"
              value={newStudent.section}
              onChange={(e) =>
                setNewStudent({
                  ...newStudent,
                  section: e.target.value,
                })
              }
              className="border p-2 rounded"
              required
            />

            <input
              type="text"
              placeholder="Roll Number"
              value={newStudent.rollNumber}
              onChange={(e) =>
                setNewStudent({
                  ...newStudent,
                  rollNumber: e.target.value,
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
                {loading ? "Adding..." : "Add Student"}
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
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border p-2 w-full rounded"
          />
        </div>
      </div>

      {/* TABLE */}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-4 border-b flex items-center gap-2">
          <Users className="w-5 h-5 text-red-600" />

          <h2>Student List ({filteredStudents.length})</h2>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Roll</th>

              <th className="p-3 text-left">Name</th>

              <th className="p-3 text-left">Class</th>

              <th className="p-3 text-left">Section</th>

              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.studentId} className="border-t">
                <td className="p-3">{student.rollNumber}</td>

                <td className="p-3">
                  {student.firstName} {student.lastName}
                </td>

                <td className="p-3">{student.class}</td>

                <td className="p-3">{student.section}</td>

                <td className="p-3 flex gap-2">
                  <button className="p-2 text-blue-600">
                    <Edit size={16} />
                  </button>

                  <button
                    onClick={() => handleDelete(student.studentId)}
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
