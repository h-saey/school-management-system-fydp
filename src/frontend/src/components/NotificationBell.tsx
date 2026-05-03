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
      return (
        <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" aria-hidden />
      );
    case "fee":
      return (
        <DollarSign className="h-4 w-4 shrink-0 text-orange-600" aria-hidden />
      );
    case "marks":
      return (
        <BookOpen className="h-4 w-4 shrink-0 text-blue-600" aria-hidden />
      );
    case "attendance":
      return (
        <BookOpen className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
      );
    default:
      return <Info className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />;
  }
};

const typeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case "riskalert":
      return "border-l-red-500 bg-red-50/90";
    case "fee":
      return "border-l-orange-500 bg-orange-50/90";
    case "marks":
      return "border-l-blue-500 bg-blue-50/90";
    default:
      return "border-l-slate-300 bg-slate-50/90";
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
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative rounded-xl p-2.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 active:bg-slate-200/80"
        title="Notifications"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell className="h-5 w-5" aria-hidden />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white shadow-sm ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 flex max-h-[420px] w-[min(20rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-900/15 sm:w-80">
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-100 bg-white px-3 py-3 sm:px-4">
            <div className="flex min-w-0 items-center gap-2">
              <Bell className="h-4 w-4 shrink-0 text-purple-600" aria-hidden />
              <span className="truncate text-sm font-semibold tracking-tight text-slate-900">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  disabled={loading}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-purple-700 transition-colors hover:bg-purple-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  All read
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
                aria-label="Close notifications"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto overscroll-contain">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center sm:py-12">
                <Bell
                  className="mx-auto mb-3 h-9 w-9 text-slate-200"
                  aria-hidden
                />
                <p className="text-sm font-medium text-slate-500">
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.slice(0, 20).map((n) => (
                <div
                  key={n.notificationId}
                  onClick={() =>
                    n.status === "Unread" && handleMarkRead(n.notificationId)
                  }
                  className={`flex cursor-pointer gap-3 border-l-4 px-3 py-3 transition-all hover:brightness-[0.98] active:brightness-95 sm:px-4 ${typeColor(
                    n.type,
                  )} ${n.status === "Unread" ? "opacity-100" : "opacity-60"}`}
                >
                  {/* Type icon */}
                  <div className="mt-0.5 shrink-0">{typeIcon(n.type)}</div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs leading-relaxed ${
                        n.status === "Unread"
                          ? "font-medium text-slate-900"
                          : "text-slate-600"
                      }`}
                    >
                      {n.content}
                    </p>
                    <p className="mt-1 text-[11px] font-medium text-slate-400 sm:text-xs">
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
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500 ring-2 ring-white" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="shrink-0 border-t border-slate-100 bg-slate-50/50 px-3 py-2.5 text-center sm:px-4">
              <p className="text-[11px] font-medium text-slate-500 sm:text-xs">
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
