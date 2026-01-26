import React, { useState } from 'react';
import { Bell, Send, Calendar } from 'lucide-react';

export function PostAnnouncements() {
  const [announcementType, setAnnouncementType] = useState('Homework');
  const [targetClass, setTargetClass] = useState('Class 10-A');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const classes = ['All Classes', 'Class 10-A', 'Class 9-B', 'Class 8-C'];

  const recentAnnouncements = [
    {
      id: 1,
      type: 'Homework',
      class: 'Class 10-A',
      title: 'Mathematics Homework - Chapter 5',
      message: 'Complete exercises 5.1 to 5.3 from the textbook. Submission deadline: December 15, 2025.',
      date: '2025-12-11',
      time: '2 hours ago'
    },
    {
      id: 2,
      type: 'Notice',
      class: 'Class 9-B',
      title: 'Science Lab Session Rescheduled',
      message: 'Tomorrow\'s lab session has been rescheduled to Friday at 2:00 PM. Please bring your lab manuals.',
      date: '2025-12-10',
      time: '1 day ago'
    },
    {
      id: 3,
      type: 'Important',
      class: 'All Classes',
      title: 'Project Submission Reminder',
      message: 'All pending science projects must be submitted by December 18, 2025. Late submissions will not be accepted.',
      date: '2025-12-09',
      time: '2 days ago'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Announcement posted successfully! Notification sent to students and parents.');
    // Reset form
    setTitle('');
    setMessage('');
    setAnnouncementType('Homework');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Homework':
        return 'bg-blue-100 text-blue-700';
      case 'Notice':
        return 'bg-green-100 text-green-700';
      case 'Important':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Post Announcements</h1>
        <p className="text-gray-600">Create announcements for your classes</p>
      </div>

      {/* Announcement Form */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-gray-900 mb-6">Create New Announcement</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Announcement Type</label>
              <select
                value={announcementType}
                onChange={(e) => setAnnouncementType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option>Homework</option>
                <option>Notice</option>
                <option>Important</option>
                <option>Reminder</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Target Class</label>
              <select
                value={targetClass}
                onChange={(e) => setTargetClass(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {classes.map((cls) => (
                  <option key={cls}>{cls}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter announcement title..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your announcement message..."
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Send className="w-4 h-4" />
              Post Announcement
            </button>
            <button
              type="button"
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Save as Draft
            </button>
          </div>
        </form>
      </div>

      {/* Recent Announcements */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-6 h-6 text-purple-600" />
          <h2 className="text-gray-900">Recent Announcements</h2>
        </div>
        
        <div className="space-y-4">
          {recentAnnouncements.map((announcement) => (
            <div key={announcement.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-gray-900">{announcement.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm ${getTypeColor(announcement.type)}`}>
                      {announcement.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                    <span>To: {announcement.class}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {announcement.date}
                    </span>
                    <span>•</span>
                    <span>{announcement.time}</span>
                  </div>
                  <p className="text-gray-700">{announcement.message}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  Edit
                </button>
                <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-lg">
        <h3 className="text-gray-900 mb-3">Announcement Tips</h3>
        <div className="space-y-2 text-gray-700 text-sm">
          <p>• Announcements are instantly visible to students and parents in their dashboard.</p>
          <p>• Use clear and concise language for better understanding.</p>
          <p>• Mark important announcements with high priority for immediate attention.</p>
          <p>• Include deadlines and specific dates when applicable.</p>
        </div>
      </div>
    </div>
  );
}
