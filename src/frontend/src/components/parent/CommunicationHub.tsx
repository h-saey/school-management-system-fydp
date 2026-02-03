import React, { useState } from "react";
import { MessageSquare, Send, User, Clock } from "lucide-react";

export function CommunicationHub() {
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const teachers = [
    {
      id: "1",
      name: "Mr. Kumar",
      subject: "Mathematics",
      lastMessage: "2 hours ago",
    },
    {
      id: "2",
      name: "Dr. Singh",
      subject: "Science",
      lastMessage: "1 day ago",
    },
    {
      id: "3",
      name: "Mrs. Sharma",
      subject: "English",
      lastMessage: "3 days ago",
    },
    {
      id: "4",
      name: "Mr. Patel",
      subject: "History",
      lastMessage: "5 days ago",
    },
  ];

  const conversations: Record<
    string,
    Array<{ sender: "parent" | "teacher"; message: string; time: string }>
  > = {
    "1": [
      {
        sender: "parent",
        message:
          "Hello Mr. Kumar, I wanted to discuss Rahul's performance in mathematics.",
        time: "10:00 AM",
      },
      {
        sender: "teacher",
        message:
          "Hello Mrs. Sharma! Rahul is doing quite well. He scored 88% in the mid-term exam.",
        time: "10:15 AM",
      },
      {
        sender: "parent",
        message:
          "That's great to hear! Are there any areas where he needs improvement?",
        time: "10:20 AM",
      },
      {
        sender: "teacher",
        message:
          "He should focus more on geometry. I'll provide some extra practice problems.",
        time: "10:25 AM",
      },
    ],
    "2": [
      {
        sender: "parent",
        message: "Dr. Singh, how is Rahul performing in Science practicals?",
        time: "Yesterday 2:30 PM",
      },
      {
        sender: "teacher",
        message:
          "He is excellent in practicals! Very curious and follows safety protocols well.",
        time: "Yesterday 3:00 PM",
      },
    ],
    "3": [
      {
        sender: "parent",
        message:
          "Mrs. Sharma, I noticed Rahul got B+ in English. Can you provide some guidance?",
        time: "Dec 8, 4:00 PM",
      },
      {
        sender: "teacher",
        message:
          "Yes, he needs to work on grammar. I recommend daily reading and writing practice.",
        time: "Dec 8, 5:00 PM",
      },
    ],
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && selectedTeacher) {
      // Handle sending message
      setMessage("");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Communication Hub</h1>
        <p className="text-gray-600">
          Connect with teachers privately and securely
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 h-[600px]">
          {/* Teacher List */}
          <div className="border-r border-gray-200 overflow-y-auto">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="text-gray-900">Teachers</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {teachers.map((teacher) => (
                <button
                  key={teacher.id}
                  onClick={() => setSelectedTeacher(teacher.id)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    selectedTeacher === teacher.id ? "bg-green-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white">
                      {teacher.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-gray-900">{teacher.name}</h4>
                      <p className="text-sm text-gray-600">{teacher.subject}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {teacher.lastMessage}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="md:col-span-2 flex flex-col">
            {selectedTeacher ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white">
                      {teachers
                        .find((t) => t.id === selectedTeacher)
                        ?.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-gray-900">
                        {teachers.find((t) => t.id === selectedTeacher)?.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {
                          teachers.find((t) => t.id === selectedTeacher)
                            ?.subject
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {conversations[selectedTeacher]?.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.sender === "parent" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-4 ${
                          msg.sender === "parent"
                            ? "bg-green-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p>{msg.message}</p>
                        <p
                          className={`text-xs mt-2 ${
                            msg.sender === "parent"
                              ? "text-green-100"
                              : "text-gray-600"
                          }`}
                        >
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Send
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p>Select a teacher to start conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Communication Guidelines */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
        <h3 className="text-gray-900 mb-3">Communication Guidelines</h3>
        <div className="space-y-2 text-gray-700 text-sm">
          <p>
            • All conversations are private and secure between parent and
            teacher.
          </p>
          <p>
            • Teachers typically respond within 24 hours during working days.
          </p>
          <p>• Please maintain professional and respectful communication.</p>
          <p>
            • For urgent matters, please contact the school office directly.
          </p>
        </div>
      </div>
    </div>
  );
}
