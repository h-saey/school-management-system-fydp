import React from 'react';
import { AlertCircle, CheckCircle, Clock, MessageSquare, ThumbsUp } from 'lucide-react';

export function BehaviourComplaints() {
  const complaints = [
    {
      id: 'CMP001',
      issue: 'Unclear explanation in Chemistry class',
      submittedBy: 'Rahul Sharma (Student)',
      category: 'Academic',
      status: 'Resolved',
      date: '2025-12-05',
      teacherResponse: 'Scheduled extra doubt session. Issue resolved. Student is now clear on the topic.',
      resolution: 'Extra classes conducted on Dec 6 & 7. Student performed well in follow-up quiz.'
    },
    {
      id: 'CMP002',
      issue: 'Library book not available',
      submittedBy: 'Rahul Sharma (Student)',
      category: 'Facility',
      status: 'In Progress',
      date: '2025-12-08',
      teacherResponse: 'Book has been ordered. Expected arrival in 1 week.',
      resolution: null
    }
  ];

  const behaviourRemarks = [
    {
      date: '2025-12-10',
      teacher: 'Mr. Kumar',
      subject: 'Mathematics',
      type: 'Positive',
      remark: 'Excellent participation in class discussions. Helping other students.',
      icon: ThumbsUp,
      color: 'bg-green-50 border-green-200'
    },
    {
      date: '2025-12-08',
      teacher: 'Dr. Singh',
      subject: 'Science',
      type: 'Positive',
      remark: 'Outstanding performance in science fair. Leadership skills demonstrated.',
      icon: CheckCircle,
      color: 'bg-blue-50 border-blue-200'
    },
    {
      date: '2025-12-01',
      teacher: 'Mrs. Sharma',
      subject: 'English',
      type: 'Suggestion',
      remark: 'Good effort. Please encourage more reading at home to improve vocabulary.',
      icon: MessageSquare,
      color: 'bg-yellow-50 border-yellow-200'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Resolved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'In Progress':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved':
        return 'bg-green-100 text-green-700';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-red-100 text-red-700';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Behaviour & Complaints</h1>
        <p className="text-gray-600">Monitor your child's behaviour feedback and complaint status</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <ThumbsUp className="w-6 h-6 text-green-600" />
            <h3 className="text-gray-900">Positive Remarks</h3>
          </div>
          <p className="text-gray-900">2 this month</p>
          <p className="text-sm text-green-600">Excellent behaviour</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            <h3 className="text-gray-900">Active Complaints</h3>
          </div>
          <p className="text-gray-900">1 pending</p>
          <p className="text-sm text-blue-600">Being addressed</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-6 h-6 text-purple-600" />
            <h3 className="text-gray-900">Resolved Issues</h3>
          </div>
          <p className="text-gray-900">1 resolved</p>
          <p className="text-sm text-purple-600">This month</p>
        </div>
      </div>

      {/* Teacher Remarks */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-gray-900 mb-6">Teacher Remarks & Feedback</h2>
        <div className="space-y-4">
          {behaviourRemarks.map((remark, index) => {
            const Icon = remark.icon;
            return (
              <div key={index} className={`border rounded-lg p-6 ${remark.color}`}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Icon className="w-6 h-6 text-gray-700" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-gray-900 mb-1">{remark.teacher} - {remark.subject}</h3>
                        <span className="inline-block px-3 py-1 bg-white rounded-full text-sm">
                          {remark.type}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">{remark.date}</span>
                    </div>
                    <p className="text-gray-700 mt-3">{remark.remark}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Complaints List */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-gray-900 mb-6">Child's Complaints Status</h2>
        <div className="space-y-4">
          {complaints.map((complaint) => (
            <div key={complaint.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <MessageSquare className="w-5 h-5 text-gray-600" />
                    <h3 className="text-gray-900">{complaint.issue}</h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>ID: {complaint.id}</span>
                    <span>•</span>
                    <span>Submitted by: {complaint.submittedBy}</span>
                    <span>•</span>
                    <span>{complaint.category}</span>
                    <span>•</span>
                    <span>{complaint.date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(complaint.status)}
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(complaint.status)}`}>
                    {complaint.status}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Teacher Response:</strong> {complaint.teacherResponse}
                  </p>
                </div>

                {complaint.resolution && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Resolution:</strong> {complaint.resolution}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guidance Note */}
      <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-lg">
        <h3 className="text-gray-900 mb-3">Parent Guidance</h3>
        <div className="space-y-2 text-gray-700 text-sm">
          <p>• All teacher remarks are meant to help your child improve and grow.</p>
          <p>• Positive feedback should be encouraged at home to boost confidence.</p>
          <p>• For suggestions, work together with teachers to implement improvements.</p>
          <p>• Monitor complaint status regularly and discuss resolutions with your child.</p>
        </div>
      </div>
    </div>
  );
}
