// FILE: src/components/teacher/PostAnnouncements.tsx
// ACTION: REPLACE existing file entirely

import React, { useEffect, useState } from "react";
import {
  Bell,
  Plus,
  X,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Megaphone,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  fetchNotices,
  postNotice,
  deactivateNotice,
  Notice,
  PostNoticePayload,
} from "../../services/teacherApi";

// ── Backend Enum Maps ─────────────────────────────────────────────────────

const AUDIENCE_OPTIONS = [
  { label: "School-Wide", value: 0 },
  { label: "Students Only", value: 1 },
  { label: "Parents Only", value: 2 },
  { label: "Class Specific", value: 3 },
];

const TYPE_OPTIONS = [
  { label: "Academic", value: 0 },
  { label: "Event", value: 1 },
  { label: "Holiday", value: 2 },
  { label: "Exam", value: 3 },
  { label: "General", value: 4 },
];

const PRIORITY_OPTIONS = [
  { label: "Low", value: 0 },
  { label: "Medium", value: 1 },
  { label: "High", value: 2 },
  { label: "Urgent", value: 3 },
];

const PRIORITY_COLORS: Record<string, string> = {
  Low: "bg-gray-100 text-gray-600",
  Medium: "bg-blue-100 text-blue-700",
  High: "bg-orange-100 text-orange-700",
  Urgent: "bg-red-100 text-red-700",
};

const TYPE_COLORS: Record<string, string> = {
  Academic: "bg-purple-100 text-purple-700",
  Event: "bg-pink-100 text-pink-700",
  Holiday: "bg-green-100 text-green-700",
  Exam: "bg-yellow-100 text-yellow-700",
  General: "bg-gray-100 text-gray-700",
};

function labelFor<T extends { label: string; value: number }>(
  options: T[],
  value: number | string,
): string {
  return options.find((o) => o.value === Number(value))?.label ?? String(value);
}

const EMPTY_FORM: PostNoticePayload = {
  title: "",
  content: "",
  audience: 0,
  type: 4,
  priority: 1,
  targetClass: "",
};

export function PostAnnouncements() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<PostNoticePayload>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [deactivatingId, setDeactivatingId] = useState<number | null>(null);

  const loadNotices = () => {
    setLoading(true);
    fetchNotices()
      .then(setNotices)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNotices();
  }, []);

  const validate = (): string | null => {
    if (!form.title.trim()) return "Title is required.";
    if (form.title.trim().length < 5)
      return "Title must be at least 5 characters.";
    if (!form.content.trim()) return "Content is required.";
    if (form.content.trim().length < 10)
      return "Content must be at least 10 characters.";
    if (form.audience === 3 && !form.targetClass?.trim())
      return "Please specify a target class for 'Class Specific' audience.";
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await postNotice({
        ...form,
        targetClass: form.audience === 3 ? form.targetClass : undefined,
      });
      setSuccessMsg(`Announcement "${form.title}" posted successfully!`);
      setForm(EMPTY_FORM);
      setShowForm(false);
      loadNotices();
    } catch (e: any) {
      setError(e.message || "Failed to post announcement.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id: number, title: string) => {
    if (
      !window.confirm(
        `Deactivate notice "${title}"? It will no longer be visible.`,
      )
    )
      return;
    setDeactivatingId(id);
    try {
      await deactivateNotice(id);
      setNotices((prev) =>
        prev.map((n) => (n.noticeId === id ? { ...n, isActive: false } : n)),
      );
    } catch (e: any) {
      setError(e.message || "Failed to deactivate notice.");
    } finally {
      setDeactivatingId(null);
    }
  };

  const activeNotices = notices.filter((n) => n.isActive);
  const inactiveNotices = notices.filter((n) => !n.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-gray-900 font-bold text-2xl mb-1">
            Post Announcements
          </h1>
          <p className="text-gray-600">
            Publish notices and announcements for students or parents
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setError(null);
            setSuccessMsg(null);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          New Announcement
        </button>
      </div>

      {/* Feedback */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm flex-1">{error}</p>
          <button onClick={() => setError(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 text-green-700">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm flex-1">{successMsg}</p>
          <button onClick={() => setSuccessMsg(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Notices",
            value: notices.length,
            bg: "bg-purple-50",
            color: "text-purple-600",
          },
          {
            label: "Active",
            value: activeNotices.length,
            bg: "bg-green-50",
            color: "text-green-600",
          },
          {
            label: "Inactive",
            value: inactiveNotices.length,
            bg: "bg-gray-50",
            color: "text-gray-600",
          },
          {
            label: "Urgent",
            value: notices.filter(
              (n) => labelFor(PRIORITY_OPTIONS, n.priority) === "Urgent",
            ).length,
            bg: "bg-red-50",
            color: "text-red-600",
          },
        ].map(({ label, value, bg, color }) => (
          <div key={label} className={`${bg} rounded-xl p-4`}>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-gray-600 text-sm">{label}</p>
          </div>
        ))}
      </div>

      {/* Post Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-gray-900 font-semibold text-lg flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-purple-600" />
                New Announcement
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setForm(EMPTY_FORM);
                  setError(null);
                }}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="e.g., School Annual Day – Save the Date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  maxLength={200}
                />
                <p className="text-xs text-gray-400 mt-0.5 text-right">
                  {form.title.length}/200
                </p>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={5}
                  value={form.content}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, content: e.target.value }))
                  }
                  placeholder="Write the full announcement here…"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Audience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Audience
                  </label>
                  <select
                    value={form.audience}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        audience: Number(e.target.value),
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {AUDIENCE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, type: Number(e.target.value) }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        priority: Number(e.target.value),
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {PRIORITY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Target Class (conditional) */}
                {form.audience === 3 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Class <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.targetClass}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, targetClass: e.target.value }))
                      }
                      placeholder="e.g., Grade 10-A"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}
              </div>

              {/* Preview */}
              <div className="bg-gray-50 rounded-lg p-4 text-sm">
                <p className="font-medium text-gray-700 mb-2">Preview:</p>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${TYPE_COLORS[labelFor(TYPE_OPTIONS, form.type)] ?? ""}`}
                  >
                    {labelFor(TYPE_OPTIONS, form.type)}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${PRIORITY_COLORS[labelFor(PRIORITY_OPTIONS, form.priority)] ?? ""}`}
                  >
                    {labelFor(PRIORITY_OPTIONS, form.priority)}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                    {labelFor(AUDIENCE_OPTIONS, form.audience)}
                  </span>
                  {form.audience === 3 && form.targetClass && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-700">
                      {form.targetClass}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => {
                  setShowForm(false);
                  setForm(EMPTY_FORM);
                  setError(null);
                }}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed font-medium"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Posting…
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4" />
                    Post Announcement
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notices List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm p-6 h-28 animate-pulse"
            />
          ))}
        </div>
      ) : notices.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-16 text-center text-gray-400">
          <Bell className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium">No announcements yet</p>
          <p className="text-sm mt-1">Click 'New Announcement' to post one.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Active */}
          {activeNotices.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4" /> Active Notices (
                {activeNotices.length})
              </h2>
              <div className="space-y-3">
                {activeNotices.map((n) => (
                  <NoticeCard
                    key={n.noticeId}
                    notice={n}
                    onDeactivate={handleDeactivate}
                    deactivatingId={deactivatingId}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Inactive */}
          {inactiveNotices.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <EyeOff className="w-4 h-4" /> Inactive Notices (
                {inactiveNotices.length})
              </h2>
              <div className="space-y-3 opacity-60">
                {inactiveNotices.map((n) => (
                  <NoticeCard
                    key={n.noticeId}
                    notice={n}
                    onDeactivate={handleDeactivate}
                    deactivatingId={deactivatingId}
                    isInactive
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

// ── Sub-component: Notice Card ────────────────────────────────────────────

interface NoticeCardProps {
  notice: Notice;
  onDeactivate: (id: number, title: string) => void;
  deactivatingId: number | null;
  isInactive?: boolean;
}

function NoticeCard({
  notice,
  onDeactivate,
  deactivatingId,
  isInactive,
}: NoticeCardProps) {
  const typeLabel = PRIORITY_OPTIONS.find(
    (o) => o.value === Number(notice.type),
  )
    ? (TYPE_OPTIONS.find((o) => o.value === Number(notice.type))?.label ??
      String(notice.type))
    : String(notice.type);

  const priorityLabel =
    PRIORITY_OPTIONS.find((o) => o.value === Number(notice.priority))?.label ??
    String(notice.priority);

  const audienceLabel =
    AUDIENCE_OPTIONS.find((o) => o.value === Number(notice.audience))?.label ??
    String(notice.audience);

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col sm:flex-row gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap gap-2 mb-2">
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${TYPE_COLORS[typeLabel] ?? "bg-gray-100 text-gray-700"}`}
          >
            {typeLabel}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${PRIORITY_COLORS[priorityLabel] ?? "bg-gray-100 text-gray-700"}`}
          >
            {priorityLabel}
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
            {audienceLabel}
          </span>
          {notice.targetClass && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-700">
              {notice.targetClass}
            </span>
          )}
        </div>

        <h3 className="font-semibold text-gray-900 mb-1">{notice.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{notice.content}</p>

        <div className="mt-2 flex gap-4 text-xs text-gray-400">
          <span>
            📅{" "}
            {new Date(notice.postedAt).toLocaleDateString("en-PK", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
          <span>
            👤 {notice.postedBy?.username ?? "—"} ({notice.postedBy?.role ?? ""}
            )
          </span>
        </div>
      </div>

      {!isInactive && (
        <div className="flex items-start">
          <button
            onClick={() => onDeactivate(notice.noticeId, notice.title)}
            disabled={deactivatingId === notice.noticeId}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 hover:border-gray-400 text-sm transition-colors disabled:opacity-40"
            title="Deactivate notice"
          >
            {deactivatingId === notice.noticeId ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
            Deactivate
          </button>
        </div>
      )}
    </div>
  );
}

// import React, { useState } from "react";
// import { Bell, Send, Calendar } from "lucide-react";

// export function PostAnnouncements() {
//   const [announcementType, setAnnouncementType] = useState("Homework");
//   const [targetClass, setTargetClass] = useState("Class 10-A");
//   const [title, setTitle] = useState("");
//   const [message, setMessage] = useState("");

//   const classes = ["All Classes", "Class 10-A", "Class 9-B", "Class 8-C"];

//   const recentAnnouncements = [
//     {
//       id: 1,
//       type: "Homework",
//       class: "Class 10-A",
//       title: "Mathematics Homework - Chapter 5",
//       message:
//         "Complete exercises 5.1 to 5.3 from the textbook. Submission deadline: December 15, 2025.",
//       date: "2025-12-11",
//       time: "2 hours ago",
//     },
//     {
//       id: 2,
//       type: "Notice",
//       class: "Class 9-B",
//       title: "Science Lab Session Rescheduled",
//       message:
//         "Tomorrow's lab session has been rescheduled to Friday at 2:00 PM. Please bring your lab manuals.",
//       date: "2025-12-10",
//       time: "1 day ago",
//     },
//     {
//       id: 3,
//       type: "Important",
//       class: "All Classes",
//       title: "Project Submission Reminder",
//       message:
//         "All pending science projects must be submitted by December 18, 2025. Late submissions will not be accepted.",
//       date: "2025-12-09",
//       time: "2 days ago",
//     },
//   ];

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     alert(
//       "Announcement posted successfully! Notification sent to students and parents.",
//     );
//     // Reset form
//     setTitle("");
//     setMessage("");
//     setAnnouncementType("Homework");
//   };

//   const getTypeColor = (type: string) => {
//     switch (type) {
//       case "Homework":
//         return "bg-blue-100 text-blue-700";
//       case "Notice":
//         return "bg-green-100 text-green-700";
//       case "Important":
//         return "bg-red-100 text-red-700";
//       default:
//         return "bg-gray-100 text-gray-700";
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-gray-900 mb-2">Post Announcements</h1>
//         <p className="text-gray-600">Create announcements for your classes</p>
//       </div>

//       {/* Announcement Form */}
//       <div className="bg-white rounded-xl shadow-sm p-6">
//         <h2 className="text-gray-900 mb-6">Create New Announcement</h2>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-gray-700 mb-2">
//                 Announcement Type
//               </label>
//               <select
//                 value={announcementType}
//                 onChange={(e) => setAnnouncementType(e.target.value)}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//               >
//                 <option>Homework</option>
//                 <option>Notice</option>
//                 <option>Important</option>
//                 <option>Reminder</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-gray-700 mb-2">Target Class</label>
//               <select
//                 value={targetClass}
//                 onChange={(e) => setTargetClass(e.target.value)}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//               >
//                 {classes.map((cls) => (
//                   <option key={cls}>{cls}</option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           <div>
//             <label className="block text-gray-700 mb-2">Title</label>
//             <input
//               type="text"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               placeholder="Enter announcement title..."
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-gray-700 mb-2">Message</label>
//             <textarea
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//               placeholder="Enter your announcement message..."
//               rows={6}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//               required
//             />
//           </div>

//           {/* <div className="flex gap-3">
//             <button
//               type="submit"
//               className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
//             >
//               <Send className="w-4 h-4" />
//               Post Announcement
//             </button>
//             <button
//               type="button"
//               className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//             >
//               Save as Draft
//             </button>
//           </div> */}
//           <div className="flex flex-col sm:flex-row gap-3">
//             <button
//               type="submit"
//               className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
//             >
//               <Send className="w-4 h-4" />
//               Post Announcement
//             </button>

//             <button
//               type="button"
//               className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//             >
//               Save as Draft
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* Recent Announcements */}
//       <div className="bg-white rounded-xl shadow-sm p-6">
//         <div className="flex items-center gap-3 mb-6">
//           <Bell className="w-6 h-6 text-purple-600" />
//           <h2 className="text-gray-900">Recent Announcements</h2>
//         </div>

//         <div className="space-y-4">
//           {recentAnnouncements.map((announcement) => (
//             <div
//               key={announcement.id}
//               className="border border-gray-200 rounded-lg p-6"
//             >
//               <div className="flex items-start justify-between mb-3">
//                 <div className="flex-1">
//                   {/* Title + Type */}
//                   <div className="flex items-center gap-3 mb-2 flex-wrap">
//                     <h3 className="text-gray-900">{announcement.title}</h3>

//                     <span
//                       className={`px-3 py-1 rounded-full text-sm ${getTypeColor(
//                         announcement.type,
//                       )}`}
//                     >
//                       {announcement.type}
//                     </span>
//                   </div>

//                   {/* Info Row */}
//                   <div className="flex items-center gap-3 text-sm text-gray-600 mb-3 flex-wrap">
//                     <span>To: {announcement.class}</span>

//                     <span className="hidden sm:inline">•</span>

//                     <span className="flex items-center gap-1">
//                       <Calendar className="w-4 h-4" />
//                       {announcement.date}
//                     </span>

//                     <span className="hidden sm:inline">•</span>

//                     <span>{announcement.time}</span>
//                   </div>

//                   <p className="text-gray-700">{announcement.message}</p>
//                 </div>
//               </div>

//               {/* Buttons */}
//               {/* <div className="flex gap-2 mt-4 flex-col sm:flex-row">
//                 <button className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
//                   Edit
//                 </button>

//                 <button className="w-full sm:w-auto px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm">
//                   Delete
//                 </button>
//               </div> */}
//               <div className="flex gap-2 mt-4 flex-wrap">
//                 <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm whitespace-nowrap">
//                   Edit
//                 </button>

//                 <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm whitespace-nowrap">
//                   Delete
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Info Box */}
//       <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-lg">
//         <h3 className="text-gray-900 mb-3">Announcement Tips</h3>
//         <div className="space-y-2 text-gray-700 text-sm">
//           <p>
//             • Announcements are instantly visible to students and parents in
//             their dashboard.
//           </p>
//           <p>• Use clear and concise language for better understanding.</p>
//           <p>
//             • Mark important announcements with high priority for immediate
//             attention.
//           </p>
//           <p>• Include deadlines and specific dates when applicable.</p>
//         </div>
//       </div>
//     </div>
//   );
// }
