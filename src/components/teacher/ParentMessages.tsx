import React, { useState } from 'react';
import { MessageSquare, Send, User, Clock, CheckCircle } from 'lucide-react';

export function ParentMessages() {
  const [selectedParent, setSelectedParent] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const parents = [
    { id: '1', name: 'Mrs. Sharma', student: 'Rahul Sharma', lastMessage: '2 hours ago', unread: 1 },
    { id: '2', name: 'Mr. Patel', student: 'Aarav Patel', lastMessage: '1 day ago', unread: 0 },
    { id: '3', name: 'Mrs. Gupta', student: 'Diya Gupta', lastMessage: '2 days ago', unread: 2 }
  ];

  const conversations: Record<string, Array<{ sender: 'parent' | 'teacher', message: string, time: string }>> = {
    '1': [
      { sender: 'parent', message: 'Hello Dr. Singh, I wanted to discuss Rahul\'s performance in mathematics.', time: '10:00 AM' },
      { sender: 'teacher', message: 'Hello Mrs. Sharma! Rahul is doing quite well. He scored 88% in the mid-term exam.', time: '10:15 AM' },
      { sender: 'parent', message: 'That\'s great to hear! Are there any areas where he needs improvement?', time: '10:20 AM' },
      { sender: 'teacher', message: 'He should focus more on geometry. I\'ll provide some extra practice problems.', time: '10:25 AM' },
      { sender: 'parent', message: 'Thank you for the guidance. We will work on it at home.', time: '2 hours ago' }
    ],
    '2': [
      { sender: 'parent', message: 'Dr. Singh, I noticed Aarav has been very interested in advanced mathematics. Can you suggest some resources?', time: 'Yesterday 2:30 PM' },
      { sender: 'teacher', message: 'That\'s wonderful! I can recommend some olympiad-level books and online resources. I\'ll send you a list.', time: 'Yesterday 3:00 PM' }
    ],
    '3': [
      { sender: 'parent', message: 'Hello, can we schedule a meeting to discuss Diya\'s progress?', time: 'Dec 9, 4:00 PM' }
    ]
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && selectedParent) {
      // Handle sending message
      setMessage('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Parent Messages</h1>
        <p className="text-gray-600">Respond to parent inquiries and maintain communication</p>
      </div>

      {/* Unread Messages Alert */}
      {parents.some(p => p.unread > 0) && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-yellow-600" />
            <p className="text-gray-700">
              You have {parents.reduce((sum, p) => sum + p.unread, 0)} unread message(s) from parents.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 h-[600px]">
          {/* Parent List */}
          <div className="border-r border-gray-200 overflow-y-auto">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="text-gray-900">Parent Messages</h3>
              <p className="text-sm text-gray-600 mt-1">
                {parents.reduce((sum, p) => sum + p.unread, 0)} unread
              </p>
            </div>
            <div className="divide-y divide-gray-200">
              {parents.map((parent) => (
                <button
                  key={parent.id}
                  onClick={() => setSelectedParent(parent.id)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    selectedParent === parent.id ? 'bg-purple-50' : ''
                  } ${parent.unread > 0 ? 'bg-yellow-50' : ''}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white">
                      {parent.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-gray-900">{parent.name}</h4>
                        {parent.unread > 0 && (
                          <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
                            {parent.unread}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">Parent of {parent.student}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {parent.lastMessage}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="md:col-span-2 flex flex-col">
            {selectedParent ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white">
                      {parents.find(p => p.id === selectedParent)?.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-gray-900">{parents.find(p => p.id === selectedParent)?.name}</h3>
                      <p className="text-sm text-gray-600">
                        Parent of {parents.find(p => p.id === selectedParent)?.student}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {conversations[selectedParent]?.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.sender === 'teacher' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-4 ${
                          msg.sender === 'teacher'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p>{msg.message}</p>
                        <p className={`text-xs mt-2 ${
                          msg.sender === 'teacher' ? 'text-purple-100' : 'text-gray-600'
                        }`}>
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
                      placeholder="Type your reply..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
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
                  <p>Select a parent to view conversation</p>
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
          <p>• Respond to parent messages within 24 hours during working days.</p>
          <p>• Maintain professional and respectful communication at all times.</p>
          <p>• Use the messaging system for academic discussions only.</p>
          <p>• All conversations are private and auditable for accountability.</p>
        </div>
      </div>
    </div>
  );
}
