import React, { useState } from 'react';
import { BookOpen, Plus, Edit, Trash2, Search } from 'lucide-react';

export function ManageTeachers() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const teachers = [
    { id: 1, name: 'Dr. Priya Singh', subject: 'Mathematics', classes: 'Class 10-A, 9-B', email: 'priya@school.edu', phone: '9876543220' },
    { id: 2, name: 'Mr. Rajesh Kumar', subject: 'Science', classes: 'Class 10-A, 9-B', email: 'rajesh@school.edu', phone: '9876543221' },
    { id: 3, name: 'Mrs. Anita Sharma', subject: 'English', classes: 'Class 10-A, 8-C', email: 'anita@school.edu', phone: '9876543222' },
    { id: 4, name: 'Mr. Vikram Patel', subject: 'History', classes: 'Class 9-B, 8-C', email: 'vikram@school.edu', phone: '9876543223' }
  ];

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Manage Teachers</h1>
          <p className="text-gray-600">Add teachers, assign subjects, and map classes</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New Teacher
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-gray-900 mb-6">Add New Teacher</h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Teacher Name</label>
              <input type="text" placeholder="Enter full name" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Subject</label>
              <input type="text" placeholder="e.g., Mathematics" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Email</label>
              <input type="email" placeholder="Enter email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Phone</label>
              <input type="tel" placeholder="Enter phone" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2">Assign Classes (Multiple)</label>
              <select multiple className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" size={4}>
                <option>Class 10-A</option>
                <option>Class 9-B</option>
                <option>Class 8-C</option>
              </select>
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Add Teacher</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or subject..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-red-600" />
            <h2 className="text-gray-900">Teacher List ({filteredTeachers.length})</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-gray-700">Name</th>
                <th className="px-6 py-4 text-left text-gray-700">Subject</th>
                <th className="px-6 py-4 text-left text-gray-700">Assigned Classes</th>
                <th className="px-6 py-4 text-left text-gray-700">Email</th>
                <th className="px-6 py-4 text-left text-gray-700">Phone</th>
                <th className="px-6 py-4 text-left text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900">{teacher.name}</td>
                  <td className="px-6 py-4 text-gray-700">{teacher.subject}</td>
                  <td className="px-6 py-4 text-gray-700">{teacher.classes}</td>
                  <td className="px-6 py-4 text-gray-700">{teacher.email}</td>
                  <td className="px-6 py-4 text-gray-700">{teacher.phone}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
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
