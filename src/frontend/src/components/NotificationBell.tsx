import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  X,
  CheckCheck,
  AlertTriangle,
  Info,
  DollarSign,
  BookOpen,
} from "lucide-react";
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  NotificationRecord,
} from "../services/api";

// ── Icon per notification type ───────────────────────────────
const typeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "riskalert":
      return <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />;
    case "fee":
      return <DollarSign className="w-4 h-4 text-orange-500 flex-shrink-0" />;
    case "marks":
      return <BookOpen className="w-4 h-4 text-blue-500 flex-shrink-0" />;
    case "attendance":
      return <BookOpen className="w-4 h-4 text-green-500 flex-shrink-0" />;
    default:
      return <Info className="w-4 h-4 text-gray-400 flex-shrink-0" />;
  }
};

const typeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case "riskalert":
      return "border-l-red-400 bg-red-50";
    case "fee":
      return "border-l-orange-400 bg-orange-50";
    case "marks":
      return "border-l-blue-400 bg-blue-50";
    default:
      return "border-l-gray-300 bg-gray-50";
  }
};

interface NotificationBellProps {
  // Optional: poll interval in ms (default 30 seconds)
  pollIntervalMs?: number;
}

export function NotificationBell({
  pollIntervalMs = 30000,
}: NotificationBellProps) {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.status === "Unread").length;

  // ── Fetch notifications ──────────────────────────────────
  const fetchNotifications = async () => {
    try {
      const data = await getMyNotifications();
      setNotifications(data);
    } catch {
      // silent — don't crash UI if notifications fail
    }
  };

  // ── Poll every N seconds ─────────────────────────────────
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, pollIntervalMs);
    return () => clearInterval(interval);
  }, [pollIntervalMs]);

  // ── Close panel when clicking outside ───────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // ── Mark single as read ──────────────────────────────────
  const handleMarkRead = async (id: number) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationId === id ? { ...n, status: "Read" } : n,
        ),
      );
    } catch {
      /* silent */
    }
  };

  // ── Mark all as read ─────────────────────────────────────
  const handleMarkAllRead = async () => {
    setLoading(true);
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, status: "Read" })));
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 flex flex-col"
          style={{ maxHeight: "420px" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-red-600" />
              <span className="font-semibold text-gray-900 text-sm">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="bg-red-100 text-red-700 text-xs px-1.5 py-0.5 rounded-full font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  disabled={loading}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  All read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                No notifications yet
              </div>
            ) : (
              notifications.slice(0, 20).map((n) => (
                <div
                  key={n.notificationId}
                  onClick={() =>
                    n.status === "Unread" && handleMarkRead(n.notificationId)
                  }
                  className={`flex gap-3 px-4 py-3 border-l-4 cursor-pointer hover:brightness-95 transition-all ${typeColor(
                    n.type,
                  )} ${n.status === "Unread" ? "opacity-100" : "opacity-60"}`}
                >
                  {/* Type icon */}
                  <div className="mt-0.5">{typeIcon(n.type)}</div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs leading-relaxed ${
                        n.status === "Unread"
                          ? "text-gray-900 font-medium"
                          : "text-gray-600"
                      }`}
                    >
                      {n.content}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(n.dateSent).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {n.status === "Unread" && (
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                Showing {Math.min(notifications.length, 20)} of{" "}
                {notifications.length} notifications
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
