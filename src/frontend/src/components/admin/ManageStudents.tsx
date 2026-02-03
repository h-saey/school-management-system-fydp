import React, { useState } from "react";
import { Users, Plus, Edit, Trash2, Search } from "lucide-react";

export function ManageStudents() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const students = [
    {
      id: 1,
      rollNo: "001",
      name: "Aarav Patel",
      class: "Class 10-A",
      section: "A",
      dob: "2010-05-15",
      parent: "Mr. Patel",
      phone: "9876543210",
    },
    {
      id: 2,
      rollNo: "002",
      name: "Aadhya Sharma",
      class: "Class 10-A",
      section: "A",
      dob: "2010-06-20",
      parent: "Mrs. Sharma",
      phone: "9876543211",
    },
    {
      id: 3,
      rollNo: "003",
      name: "Advait Kumar",
      class: "Class 10-A",
      section: "A",
      dob: "2010-04-10",
      parent: "Mr. Kumar",
      phone: "9876543212",
    },
    {
      id: 4,
      rollNo: "004",
      name: "Ananya Singh",
      class: "Class 9-B",
      section: "B",
      dob: "2011-07-25",
      parent: "Mrs. Singh",
      phone: "9876543213",
    },
    {
      id: 5,
      rollNo: "005",
      name: "Arjun Reddy",
      class: "Class 9-B",
      section: "B",
      dob: "2011-03-12",
      parent: "Mr. Reddy",
      phone: "9876543214",
    },
  ];

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.includes(searchTerm) ||
      student.class.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Manage Students</h1>
          <p className="text-gray-600">
            Add, update, and manage student profiles
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="w-4 h-4 sm:block md:block" />
          Add New Student
        </button>
      </div>

      {/* Add Student Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-gray-900 mb-6">Add New Student</h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Student Name</label>
              <input
                type="text"
                placeholder="Enter full name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Date of Birth</label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Class</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                <option>Class 6</option>
                <option>Class 7</option>
                <option>Class 8</option>
                <option>Class 9</option>
                <option>Class 10</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Section</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                <option>A</option>
                <option>B</option>
                <option>C</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Roll Number</label>
              <input
                type="text"
                placeholder="Auto-generated"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">
                Parent/Guardian Name
              </label>
              <input
                type="text"
                placeholder="Enter parent name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Contact Number</label>
              <input
                type="tel"
                placeholder="Enter phone number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                placeholder="Enter email address"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Add Student
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, roll number, or class..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-red-600" />
            <h2 className="text-gray-900">
              Student List ({filteredStudents.length})
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-gray-700 whitespace-nowrap">
                  Roll No
                </th>
                <th className="px-6 py-4 text-left text-gray-700 whitespace-nowrap">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-gray-700 whitespace-nowrap">
                  Class
                </th>
                <th className="px-6 py-4 text-left text-gray-700 whitespace-nowrap">
                  Section
                </th>
                <th className="px-6 py-4 text-left text-gray-700 whitespace-nowrap">
                  DOB
                </th>
                <th className="px-6 py-4 text-left text-gray-700 whitespace-nowrap">
                  Parent
                </th>
                <th className="px-6 py-4 text-left text-gray-700 whitespace-nowrap">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-gray-700 whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                    {student.rollNo}
                  </td>
                  <td className="px-6 py-4 text-gray-900 whitespace-nowrap">
                    {student.name}
                  </td>
                  <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                    {student.class}
                  </td>
                  <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                    {student.section}
                  </td>
                  <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                    {student.dob}
                  </td>
                  <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                    {student.parent}
                  </td>
                  <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                    {student.phone}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>

                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-gray-700">Roll No</th>
                <th className="px-6 py-4 text-left text-gray-700">Name</th>
                <th className="px-6 py-4 text-left text-gray-700">Class</th>
                <th className="px-6 py-4 text-left text-gray-700">Section</th>
                <th className="px-6 py-4 text-left text-gray-700">DOB</th>
                <th className="px-6 py-4 text-left text-gray-700">Parent</th>
                <th className="px-6 py-4 text-left text-gray-700">Contact</th>
                <th className="px-6 py-4 text-left text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-700">{student.rollNo}</td>
                  <td className="px-6 py-4 text-gray-900">{student.name}</td>
                  <td className="px-6 py-4 text-gray-700">{student.class}</td>
                  <td className="px-6 py-4 text-gray-700">{student.section}</td>
                  <td className="px-6 py-4 text-gray-700">{student.dob}</td>
                  <td className="px-6 py-4 text-gray-700">{student.parent}</td>
                  <td className="px-6 py-4 text-gray-700">{student.phone}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div> */}
      </div>
    </div>
  );
}
