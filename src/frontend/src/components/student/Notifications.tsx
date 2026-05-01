import React, { useEffect, useState } from "react";
import { Bell, CheckCircle, AlertCircle, Archive } from "lucide-react";
import {
  getMyNotifications,
  markNotificationRead,
  type NotificationRecord,
} from "../../services/studentApi";

function typeIcon(type: string) {
  switch (type.toLowerCase()) {
    case "attendance":
      return "📅";
    case "marks":
      return "📝";
    case "fee":
      return "💰";
    case "complaint":
      return "📣";
    default:
      return "🔔";
  }
}

export function Notifications() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyNotifications()
      .then(setNotifications)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleMarkRead(id: number) {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationId === id ? { ...n, status: "Read" } : n,
        ),
      );
    } catch {
      // silently ignore
    }
  }

  const unread = notifications.filter((n) => n.status === "Unread").length;

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading notifications…</div>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-gray-900 text-xl font-semibold mb-1">
            Notifications
          </h1>
          <p className="text-gray-500 text-sm">
            {unread > 0
              ? `${unread} unread notification(s)`
              : "All notifications read"}
          </p>
        </div>
        {unread > 0 && (
          <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            {unread} New
          </span>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 rounded-xl border border-red-200 text-red-700 text-sm">
          <AlertCircle className="inline w-4 h-4 mr-2" />
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-10 text-center">
            <Bell className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No notifications yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {notifications.map((n) => (
              <li
                key={n.notificationId}
                className={`p-4 flex items-start gap-4 transition-colors ${
                  n.status === "Unread"
                    ? "bg-blue-50 hover:bg-blue-100"
                    : "hover:bg-gray-50"
                }`}
              >
                <span className="text-xl shrink-0 mt-0.5">
                  {typeIcon(n.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-xs font-medium text-blue-600 uppercase">
                      {n.type}
                    </span>
                    {n.status === "Unread" && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                    )}
                  </div>
                  <p className="text-gray-800 text-sm">{n.content}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    {new Date(n.dateSent).toLocaleString()}
                  </p>
                </div>
                {n.status === "Unread" && (
                  <button
                    onClick={() => handleMarkRead(n.notificationId)}
                    className="shrink-0 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    title="Mark as read"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Read</span>
                  </button>
                )}
                {n.status === "Archived" && (
                  <Archive className="w-4 h-4 text-gray-400 shrink-0" />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
// import React, { useState } from "react";
// import {
//   Bell,
//   Calendar,
//   DollarSign,
//   AlertCircle,
//   PartyPopper,
//   Users,
// } from "lucide-react";

// export function Notifications() {
//   const [filter, setFilter] = useState("All");

//   const notifications = [
//     {
//       id: 1,
//       type: "Exam",
//       icon: Calendar,
//       color: "bg-blue-500",
//       title: "Final Examination Schedule Released",
//       message:
//         "Final term examinations will begin from January 15, 2026. Download the detailed schedule from the dashboard.",
//       time: "2 hours ago",
//       priority: "high",
//     },
//     {
//       id: 2,
//       type: "Fee",
//       icon: DollarSign,
//       color: "bg-yellow-500",
//       title: "Fee Payment Reminder",
//       message:
//         "January term fees are due by December 20, 2025. Please clear your dues to avoid late fees.",
//       time: "5 hours ago",
//       priority: "high",
//     },
//     {
//       id: 3,
//       type: "Holiday",
//       icon: PartyPopper,
//       color: "bg-green-500",
//       title: "Winter Vacation Notice",
//       message:
//         "School will remain closed from December 25, 2025 to January 5, 2026 for winter break.",
//       time: "1 day ago",
//       priority: "medium",
//     },
//     {
//       id: 4,
//       type: "Event",
//       icon: Users,
//       color: "bg-purple-500",
//       title: "Parent-Teacher Meeting",
//       message:
//         "PTA meeting scheduled for December 20, 2025 at 10:00 AM. Parents are requested to attend.",
//       time: "2 days ago",
//       priority: "high",
//     },
//     {
//       id: 5,
//       type: "Academic",
//       icon: AlertCircle,
//       color: "bg-red-500",
//       title: "Science Project Deadline Extended",
//       message:
//         "Due to multiple requests, the science project submission deadline has been extended to December 18, 2025.",
//       time: "3 days ago",
//       priority: "medium",
//     },
//     {
//       id: 6,
//       type: "Event",
//       icon: Calendar,
//       color: "bg-blue-500",
//       title: "Annual Sports Day",
//       message:
//         "Annual sports day will be held on December 22, 2025. Participate in various sports events and competitions.",
//       time: "4 days ago",
//       priority: "medium",
//     },
//   ];

//   const filterOptions = ["All", "Exam", "Fee", "Holiday", "Event", "Academic"];

//   const filteredNotifications =
//     filter === "All"
//       ? notifications
//       : notifications.filter((n) => n.type === filter);

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-gray-900 mb-2">Notifications</h1>
//         <p className="text-gray-600">
//           Stay updated with school announcements and important notices
//         </p>
//       </div>

//       {/* Filter Tabs */}
//       <div className="bg-white rounded-xl shadow-sm p-4">
//         <div className="flex flex-wrap gap-2">
//           {filterOptions.map((option) => (
//             <button
//               key={option}
//               onClick={() => setFilter(option)}
//               className={`px-4 py-2 rounded-lg transition-colors ${
//                 filter === option
//                   ? "bg-blue-600 text-white"
//                   : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//               }`}
//             >
//               {option}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Notifications List */}
//       <div className="space-y-4">
//         {filteredNotifications.map((notification) => {
//           const Icon = notification.icon;
//           return (
//             <div
//               key={notification.id}
//               className={`bg-white rounded-xl shadow-sm p-4 sm:p-6 border-l-4 ${
//                 notification.priority === "high"
//                   ? "border-red-500"
//                   : "border-blue-500"
//               }`}
//             >
//               <div className="flex flex-col sm:flex-row sm:items-start gap-4">
//                 {/* ICON */}
//                 <div
//                   className={`${notification.color} w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0`}
//                 >
//                   <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
//                 </div>

//                 {/* CONTENT */}
//                 <div className="flex-1">
//                   {/* HEADER */}
//                   <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mb-2">
//                     <div>
//                       <h3 className="text-gray-900 text-sm sm:text-base mb-1">
//                         {notification.title}
//                       </h3>
//                       <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs sm:text-sm rounded">
//                         {notification.type}
//                       </span>
//                     </div>
//                     <span className="text-xs sm:text-sm text-gray-500 self-start sm:self-auto">
//                       {notification.time}
//                     </span>
//                   </div>

//                   {/* MESSAGE */}
//                   <p className="text-gray-700 text-sm sm:text-base">
//                     {notification.message}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             // <div
//             //   key={notification.id}
//             //   className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${
//             //     notification.priority === "high"
//             //       ? "border-red-500"
//             //       : "border-blue-500"
//             //   }`}
//             // >
//             //   <div className="flex items-start gap-4">
//             //     <div
//             //       className={`${notification.color} w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0`}
//             //     >
//             //       <Icon className="w-6 h-6 text-white" />
//             //     </div>
//             //     <div className="flex-1">
//             //       <div className="flex items-start justify-between mb-2">
//             //         <div>
//             //           <h3 className="text-gray-900 mb-1">
//             //             {notification.title}
//             //           </h3>
//             //           <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
//             //             {notification.type}
//             //           </span>
//             //         </div>
//             //         <span className="text-sm text-gray-500">
//             //           {notification.time}
//             //         </span>
//             //       </div>
//             //       <p className="text-gray-700">{notification.message}</p>
//             //     </div>
//             //   </div>
//             // </div>
//           );
//         })}
//       </div>

//       {filteredNotifications.length === 0 && (
//         <div className="bg-white rounded-xl shadow-sm p-12 text-center">
//           <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//           <p className="text-gray-600">No notifications in this category</p>
//         </div>
//       )}
//     </div>
//   );
// }
