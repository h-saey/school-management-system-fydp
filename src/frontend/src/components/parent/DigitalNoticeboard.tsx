import React, { useState } from 'react';
import { Bell, Calendar, AlertCircle, Info, PartyPopper, FileText } from 'lucide-react';

export function DigitalNoticeboard() {
  const [filter, setFilter] = useState('All');

  const notices = [
    {
      id: 1,
      type: 'Exam',
      icon: FileText,
      color: 'bg-blue-500',
      title: 'Final Examination Schedule Released',
      message: 'Final term examinations will begin from January 15, 2026. The exam schedule has been uploaded to the portal. Students should start their preparation. Exam hall tickets will be issued by January 10, 2026.',
      postedBy: 'Principal',
      date: '2025-12-11',
      priority: 'High'
    },
    {
      id: 2,
      type: 'Fee',
      icon: AlertCircle,
      color: 'bg-yellow-500',
      title: 'January Term Fee Payment Reminder',
      message: 'Parents are requested to clear the January term fees by December 20, 2025. Late fee of ₹500 will be applicable after the due date. Online payment facility is available through the parent portal.',
      postedBy: 'Accounts Department',
      date: '2025-12-10',
      priority: 'High'
    },
    {
      id: 3,
      type: 'Holiday',
      icon: PartyPopper,
      color: 'bg-green-500',
      title: 'Winter Vacation Notice',
      message: 'School will remain closed from December 25, 2025 to January 5, 2026 for winter vacation. School will reopen on January 6, 2026. We wish all students and parents a happy holiday season!',
      postedBy: 'Administration',
      date: '2025-12-09',
      priority: 'Medium'
    },
    {
      id: 4,
      type: 'Event',
      icon: Calendar,
      color: 'bg-purple-500',
      title: 'Parent-Teacher Meeting - December 20, 2025',
      message: 'PTA meeting is scheduled for December 20, 2025 at 10:00 AM in the school auditorium. All parents are requested to attend to discuss their child\'s academic progress and upcoming activities. Class teachers will be available for individual consultations.',
      postedBy: 'PTA Coordinator',
      date: '2025-12-08',
      priority: 'High'
    },
    {
      id: 5,
      type: 'Event',
      icon: Calendar,
      color: 'bg-red-500',
      title: 'Annual Sports Day - December 22, 2025',
      message: 'Annual sports day will be held on December 22, 2025 from 9:00 AM onwards. Students will participate in various sports events and competitions. Parents are invited to attend and cheer for their children. Sports uniform is mandatory.',
      postedBy: 'Sports Department',
      date: '2025-12-07',
      priority: 'Medium'
    },
    {
      id: 6,
      type: 'Academic',
      icon: Info,
      color: 'bg-indigo-500',
      title: 'Science Project Deadline Extended',
      message: 'Due to multiple requests, the deadline for science project submission has been extended to December 18, 2025. All students of Class 9 and 10 must submit their projects to their respective science teachers by the new deadline.',
      postedBy: 'Science Department',
      date: '2025-12-06',
      priority: 'Medium'
    }
  ];

  const filterOptions = ['All', 'Exam', 'Fee', 'Holiday', 'Event', 'Academic'];

  const filteredNotices = filter === 'All' 
    ? notices 
    : notices.filter(n => n.type === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Digital Noticeboard</h1>
        <p className="text-gray-600">Official school announcements and important notices</p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option}
              onClick={() => setFilter(option)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === option
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        {filteredNotices.map((notice) => {
          const Icon = notice.icon;
          return (
            <div
              key={notice.id}
              className={`bg-white rounded-xl shadow-sm overflow-hidden border-l-4 ${
                notice.priority === 'High' ? 'border-red-500' : 'border-blue-500'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`${notice.color} w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-gray-900 mb-2">{notice.title}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                            {notice.type}
                          </span>
                          <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                            notice.priority === 'High' 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {notice.priority} Priority
                          </span>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        <p>{notice.date}</p>
                        <p className="text-xs text-gray-500 mt-1">By: {notice.postedBy}</p>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{notice.message}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredNotices.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No notices in this category</p>
        </div>
      )}

      {/* Important Notice */}
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 mt-1" />
          <div>
            <h3 className="text-gray-900 mb-2">Stay Updated</h3>
            <p className="text-gray-700 text-sm">
              Check the digital noticeboard regularly for important updates. High priority notices require immediate attention. 
              You can also enable notifications in your account settings to receive alerts for new notices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
