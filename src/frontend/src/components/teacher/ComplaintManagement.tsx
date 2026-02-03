import React, { useState } from "react";
import {
  AlertCircle,
  MessageSquare,
  Clock,
  CheckCircle,
  Send,
} from "lucide-react";

export function ComplaintManagement() {
  const [selectedComplaint, setSelectedComplaint] = useState<number | null>(
    null,
  );
  const [response, setResponse] = useState("");

  const complaints = [
    {
      id: 1,
      student: "Rahul Sharma",
      class: "Class 10-A",
      issue: "Unclear explanation in Chemistry class",
      category: "Academic",
      status: "Pending",
      date: "2025-12-11",
      description:
        "The concept of chemical bonding explained in yesterday's class was not clear to me. Could you please explain it again?",
      response: null,
    },
    {
      id: 2,
      student: "Ananya Singh",
      class: "Class 10-A",
      issue: "Request for extra doubt session",
      category: "Academic",
      status: "In Progress",
      date: "2025-12-10",
      description:
        "I am having difficulty with calculus problems. Can we have an extra doubt clearing session?",
      response:
        "I will schedule a doubt session this Friday at 4 PM. Please bring your questions.",
    },
    {
      id: 3,
      student: "Krish Mehta",
      class: "Class 9-B",
      issue: "Homework submission extension request",
      category: "Academic",
      status: "Resolved",
      date: "2025-12-08",
      description:
        "I was sick last week and couldn't complete the homework. Can I get an extension?",
      response:
        "Extension granted until Dec 12. Please submit the work by then. Take care of your health.",
    },
  ];

  const handleAddResponse = () => {
    if (response.trim() && selectedComplaint !== null) {
      alert(
        "Response added successfully! Student and parents will be notified.",
      );
      setResponse("");
      setSelectedComplaint(null);
    }
  };

  const updateStatus = (complaintId: number, newStatus: string) => {
    alert(`Complaint status updated to: ${newStatus}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Resolved":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "In Progress":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved":
        return "bg-green-100 text-green-700";
      case "In Progress":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-red-100 text-red-700";
    }
  };

  const pendingCount = complaints.filter((c) => c.status === "Pending").length;
  const inProgressCount = complaints.filter(
    (c) => c.status === "In Progress",
  ).length;
  const resolvedCount = complaints.filter(
    (c) => c.status === "Resolved",
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Complaint Management</h1>
        <p className="text-gray-600">View and respond to student complaints</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h3 className="text-gray-900">Pending</h3>
          </div>
          <p className="text-gray-900">{pendingCount}</p>
          <p className="text-sm text-red-600">Needs immediate attention</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 text-yellow-600" />
            <h3 className="text-gray-900">In Progress</h3>
          </div>
          <p className="text-gray-900">{inProgressCount}</p>
          <p className="text-sm text-yellow-600">Being addressed</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h3 className="text-gray-900">Resolved</h3>
          </div>
          <p className="text-gray-900">{resolvedCount}</p>
          <p className="text-sm text-green-600">This month</p>
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {complaints.map((complaint) => (
          <div key={complaint.id} className="bg-white rounded-xl shadow-sm p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <MessageSquare className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  <h3 className="text-gray-900">{complaint.issue}</h3>
                </div>

                {/* Complaint Meta Info */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-600 mb-3">
                  <span>Student: {complaint.student}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>{complaint.class}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>{complaint.category}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>{complaint.date}</span>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 self-start">
                {getStatusIcon(complaint.status)}
                <span
                  className={`px-3 py-1 rounded-full text-sm ${getStatusColor(complaint.status)}`}
                >
                  {complaint.status}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="p-4 bg-gray-50 rounded-lg mb-4">
              <p className="text-sm text-gray-700">
                <strong>Description:</strong> {complaint.description}
              </p>
            </div>

            {/* Response */}
            {complaint.response && (
              <div className="p-4 bg-blue-50 rounded-lg mb-4">
                <p className="text-sm text-gray-700">
                  <strong>Your Response:</strong> {complaint.response}
                </p>
              </div>
            )}

            {selectedComplaint === complaint.id ? (
              <div className="space-y-3">
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Type your response..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                {/* Response Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAddResponse}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Send Response
                  </button>

                  <button
                    onClick={() => setSelectedComplaint(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* Action Buttons */
              <div className="flex flex-wrap gap-3">
                {!complaint.response && (
                  <button
                    onClick={() => setSelectedComplaint(complaint.id)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap"
                  >
                    Add Response
                  </button>
                )}

                {complaint.status !== "Resolved" && (
                  <>
                    {complaint.status === "Pending" && (
                      <button
                        onClick={() =>
                          updateStatus(complaint.id, "In Progress")
                        }
                        className="px-4 py-2 border border-yellow-500 text-yellow-700 rounded-lg hover:bg-yellow-50 transition-colors whitespace-nowrap"
                      >
                        Mark In Progress
                      </button>
                    )}

                    <button
                      onClick={() => updateStatus(complaint.id, "Resolved")}
                      className="px-4 py-2 border border-green-500 text-green-700 rounded-lg hover:bg-green-50 transition-colors whitespace-nowrap"
                    >
                      Mark Resolved
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}

        {/* {complaints.map((complaint) => (
          <div key={complaint.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <MessageSquare className="w-5 h-5 text-gray-600" />
                  <h3 className="text-gray-900">{complaint.issue}</h3>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <span>Student: {complaint.student}</span>
                  <span>•</span>
                  <span>{complaint.class}</span>
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

            <div className="p-4 bg-gray-50 rounded-lg mb-4">
              <p className="text-sm text-gray-700">
                <strong>Description:</strong> {complaint.description}
              </p>
            </div>

            {complaint.response && (
              <div className="p-4 bg-blue-50 rounded-lg mb-4">
                <p className="text-sm text-gray-700">
                  <strong>Your Response:</strong> {complaint.response}
                </p>
              </div>
            )}

            {selectedComplaint === complaint.id ? (
              <div className="space-y-3">
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Type your response..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleAddResponse}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Send Response
                  </button>
                  <button
                    onClick={() => setSelectedComplaint(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                {!complaint.response && (
                  <button
                    onClick={() => setSelectedComplaint(complaint.id)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Add Response
                  </button>
                )}
                {complaint.status !== 'Resolved' && (
                  <>
                    {complaint.status === 'Pending' && (
                      <button
                        onClick={() => updateStatus(complaint.id, 'In Progress')}
                        className="px-4 py-2 border border-yellow-500 text-yellow-700 rounded-lg hover:bg-yellow-50 transition-colors"
                      >
                        Mark In Progress
                      </button>
                    )}
                    <button
                      onClick={() => updateStatus(complaint.id, 'Resolved')}
                      className="px-4 py-2 border border-green-500 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
                    >
                      Mark Resolved
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ))} */}
      </div>

      {/* Guidelines */}
      <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-lg">
        <h3 className="text-gray-900 mb-3">Complaint Handling Guidelines</h3>
        <div className="space-y-2 text-gray-700 text-sm">
          <p>• Respond to student complaints within 24 hours.</p>
          <p>• Provide constructive and helpful responses.</p>
          <p>
            • Update status regularly to keep students and parents informed.
          </p>
          <p>• Escalate serious issues to the administration if needed.</p>
        </div>
      </div>
    </div>
  );
}
