import React, { useState } from 'react';
import { Bell, Plus, Edit, Trash2, Calendar } from 'lucide-react';

export function ManageNoticeboard() {
  const [showAddForm, setShowAddForm] = useState(false);

  const notices = [
    { id: 1, title: 'Final Exam Schedule Released', type: 'Exam', priority: 'High', date: '2025-12-11', postedBy: 'Admin', status: 'Active' },
    { id: 2, title: 'Winter Vacation Notice', type: 'Holiday', priority: 'Medium', date: '2025-12-09', postedBy: 'Admin', status: 'Active' },
    { id: 3, title: 'Parent-Teacher Meeting', type: 'Event', priority: 'High', date: '2025-12-08', postedBy: 'Admin', status: 'Active' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Manage Digital Noticeboard</h1>
          <p className="text-gray-600">Upload and schedule school-wide notices</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Post New Notice
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-gray-900 mb-6">Create New Notice</h2>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Notice Type</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option>Exam</option>
                  <option>Holiday</option>
                  <option>Event</option>
                  <option>Fee</option>
                  <option>Academic</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Priority</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Title</label>
              <input type="text" placeholder="Enter notice title" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Message</label>
              <textarea rows={6} placeholder="Enter notice message..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Post Notice</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-red-600" />
            <h2 className="text-gray-900">Posted Notices</h2>
          </div>
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
              {notices.map((notice) => (
                <tr key={notice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900">{notice.title}</td>
                  <td className="px-6 py-4"><span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{notice.type}</span></td>
                  <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-sm ${notice.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{notice.priority}</span></td>
                  <td className="px-6 py-4 text-gray-700">{notice.date}</td>
                  <td className="px-6 py-4 text-gray-700">{notice.postedBy}</td>
                  <td className="px-6 py-4"><span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">{notice.status}</span></td>
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
