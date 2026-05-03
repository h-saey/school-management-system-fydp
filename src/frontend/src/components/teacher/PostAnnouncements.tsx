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
  Low: "border border-slate-200/90 bg-slate-100 text-slate-800",
  Medium: "border border-blue-200/80 bg-blue-50 text-blue-800",
  High: "border border-orange-200/80 bg-orange-50 text-orange-800",
  Urgent: "border border-red-200/80 bg-red-50 text-red-800",
};

const TYPE_COLORS: Record<string, string> = {
  Academic: "border border-purple-200/80 bg-purple-50 text-purple-800",
  Event: "border border-pink-200/80 bg-pink-50 text-pink-800",
  Holiday: "border border-emerald-200/80 bg-emerald-50 text-emerald-800",
  Exam: "border border-amber-200/80 bg-amber-50 text-amber-900",
  General: "border border-slate-200/80 bg-slate-100 text-slate-800",
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
    <div className="min-w-0 space-y-8 sm:space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div className="min-w-0 space-y-2">
          <h1 className="text-balance text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Post Announcements
          </h1>
          <p className="max-w-2xl text-pretty text-sm leading-relaxed text-slate-600 sm:text-base">
            Publish notices and announcements for students or parents
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowForm(true);
            setError(null);
            setSuccessMsg(null);
          }}
          className="inline-flex shrink-0 items-center justify-center gap-2.5 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-purple-600/25 transition-colors hover:bg-purple-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 active:bg-purple-800 sm:px-6 sm:py-3.5"
        >
          <Plus className="h-4 w-4 shrink-0" aria-hidden />
          New Announcement
        </button>
      </div>

      {/* Feedback */}
      {error && (
        <div
          className="flex items-start gap-4 rounded-2xl border border-red-200/90 bg-red-50/90 p-5 text-red-800 shadow-sm sm:items-center sm:p-5"
          role="alert"
        >
          <AlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0 text-red-600 sm:mt-0"
            aria-hidden
          />
          <p className="min-w-0 flex-1 text-sm font-medium leading-relaxed">
            {error}
          </p>
          <button
            type="button"
            onClick={() => setError(null)}
            className="shrink-0 rounded-lg p-2 text-red-600 transition-colors hover:bg-red-100/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {successMsg && (
        <div
          className="flex items-start gap-4 rounded-2xl border border-emerald-200/90 bg-emerald-50/90 p-5 text-emerald-900 shadow-sm sm:items-center sm:p-5"
          role="status"
        >
          <CheckCircle
            className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 sm:mt-0"
            aria-hidden
          />
          <p className="min-w-0 flex-1 text-sm font-medium leading-relaxed">
            {successMsg}
          </p>
          <button
            type="button"
            onClick={() => setSuccessMsg(null)}
            className="shrink-0 rounded-lg p-2 text-emerald-700 transition-colors hover:bg-emerald-100/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            aria-label="Dismiss message"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
        {[
          {
            label: "Total Notices",
            value: notices.length,
            bg: "bg-purple-50/90",
            color: "text-purple-700",
            ring: "ring-purple-100/80",
          },
          {
            label: "Active",
            value: activeNotices.length,
            bg: "bg-emerald-50/90",
            color: "text-emerald-700",
            ring: "ring-emerald-100/80",
          },
          {
            label: "Inactive",
            value: inactiveNotices.length,
            bg: "bg-slate-50/90",
            color: "text-slate-700",
            ring: "ring-slate-200/80",
          },
          {
            label: "Urgent",
            value: notices.filter(
              (n) => labelFor(PRIORITY_OPTIONS, n.priority) === "Urgent",
            ).length,
            bg: "bg-red-50/90",
            color: "text-red-700",
            ring: "ring-red-100/80",
          },
        ].map(({ label, value, bg, color, ring }) => (
          <div
            key={label}
            className={`rounded-2xl border border-slate-100/80 p-5 shadow-sm ring-1 sm:p-6 ${ring} ${bg}`}
          >
            <p
              className={`text-2xl font-bold tabular-nums tracking-tight sm:text-3xl ${color}`}
            >
              {value}
            </p>
            <p className="mt-2 text-xs font-medium text-slate-600 sm:text-sm">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Post Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-6">
          <div className="flex max-h-[min(100dvh,900px)] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/15 sm:max-h-[90vh] sm:rounded-2xl">
            <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 bg-white/95 px-5 py-5 backdrop-blur-sm sm:px-8 sm:py-6">
              <h2 className="flex items-center gap-3 text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                <Megaphone
                  className="h-5 w-5 shrink-0 text-purple-600 sm:h-6 sm:w-6"
                  aria-hidden
                />
                New Announcement
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setForm(EMPTY_FORM);
                  setError(null);
                }}
                className="shrink-0 rounded-xl p-2.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-7 sm:px-8 sm:py-8">
              {/* Title */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Title <span className="font-normal text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="e.g., School Annual Day – Save the Date"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 sm:px-5 sm:py-3.5"
                  maxLength={200}
                />
                <p className="text-right text-xs text-slate-500">
                  {form.title.length}/200
                </p>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Content <span className="font-normal text-red-600">*</span>
                </label>
                <textarea
                  rows={5}
                  value={form.content}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, content: e.target.value }))
                  }
                  placeholder="Write the full announcement here…"
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 sm:px-5 sm:py-4"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
                {/* Audience */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
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
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 sm:px-5 sm:py-3.5"
                  >
                    {AUDIENCE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, type: Number(e.target.value) }))
                    }
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 sm:px-5 sm:py-3.5"
                  >
                    {TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
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
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 sm:px-5 sm:py-3.5"
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
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Target Class{" "}
                      <span className="font-normal text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.targetClass}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, targetClass: e.target.value }))
                      }
                      placeholder="e.g., Grade 10-A"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 sm:px-5 sm:py-3.5"
                    />
                  </div>
                )}
              </div>

              {/* Preview */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/90 p-5 shadow-inner shadow-slate-900/5 sm:p-6">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Preview
                </p>
                <div className="flex flex-wrap gap-2.5">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${TYPE_COLORS[labelFor(TYPE_OPTIONS, form.type)] ?? ""}`}
                  >
                    {labelFor(TYPE_OPTIONS, form.type)}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${PRIORITY_COLORS[labelFor(PRIORITY_OPTIONS, form.priority)] ?? ""}`}
                  >
                    {labelFor(PRIORITY_OPTIONS, form.priority)}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-blue-200/80 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
                    {labelFor(AUDIENCE_OPTIONS, form.audience)}
                  </span>
                  {form.audience === 3 && form.targetClass && (
                    <span className="inline-flex items-center rounded-full border border-teal-200/80 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
                      {form.targetClass}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-5 sm:flex-row sm:justify-end sm:gap-4 sm:px-8 sm:py-6">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setForm(EMPTY_FORM);
                  setError(null);
                }}
                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 active:bg-slate-100 sm:w-auto sm:px-6 sm:py-3.5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-purple-600/25 transition-colors hover:bg-purple-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 active:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-6 sm:py-3.5"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 shrink-0 animate-spin" />
                    Posting…
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4 shrink-0" />
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
        <div className="space-y-4 sm:space-y-5">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl border border-slate-100 bg-slate-100/80 sm:h-36"
            />
          ))}
        </div>
      ) : notices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm sm:px-10 sm:py-20">
          <Bell
            className="mx-auto mb-5 h-12 w-12 text-slate-300"
            aria-hidden
          />
          <p className="text-base font-semibold text-slate-700 sm:text-lg">
            No announcements yet
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Click 'New Announcement' to post one.
          </p>
        </div>
      ) : (
        <div className="space-y-8 sm:space-y-10">
          {/* Active */}
          {activeNotices.length > 0 && (
            <section className="min-w-0">
              <h2 className="mb-4 flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500 sm:mb-5 sm:text-sm">
                <Eye className="h-4 w-4 shrink-0" aria-hidden /> Active Notices
                ({activeNotices.length})
              </h2>
              <div className="space-y-4 sm:space-y-5">
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
            <section className="min-w-0">
              <h2 className="mb-4 flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500 sm:mb-5 sm:text-sm">
                <EyeOff className="h-4 w-4 shrink-0" aria-hidden /> Inactive
                Notices ({inactiveNotices.length})
              </h2>
              <div className="space-y-4 opacity-60 sm:space-y-5">
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
    <div className="flex flex-col gap-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-shadow hover:border-slate-300 hover:shadow-md sm:flex-row sm:items-start sm:gap-8 sm:p-7 lg:p-8">
      <div className="min-w-0 flex-1">
        <div className="mb-4 flex flex-wrap gap-2.5 sm:mb-5">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${TYPE_COLORS[typeLabel] ?? "border border-slate-200 bg-slate-100 text-slate-800"}`}
          >
            {typeLabel}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${PRIORITY_COLORS[priorityLabel] ?? "border border-slate-200 bg-slate-100 text-slate-800"}`}
          >
            {priorityLabel}
          </span>
          <span className="inline-flex items-center rounded-full border border-blue-200/80 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
            {audienceLabel}
          </span>
          {notice.targetClass && (
            <span className="inline-flex items-center rounded-full border border-teal-200/80 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
              {notice.targetClass}
            </span>
          )}
        </div>

        <h3 className="mb-2 text-base font-semibold leading-snug tracking-tight text-slate-900 sm:text-lg">
          {notice.title}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-slate-600 sm:text-[0.9375rem]">
          {notice.content}
        </p>

        <div className="mt-5 flex flex-col gap-2 text-xs font-medium text-slate-500 sm:mt-6 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-2 sm:text-sm">
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
        <div className="flex shrink-0 items-stretch sm:items-start sm:pt-1">
          <button
            type="button"
            onClick={() => onDeactivate(notice.noticeId, notice.title)}
            disabled={deactivatingId === notice.noticeId}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-5"
            title="Deactivate notice"
          >
            {deactivatingId === notice.noticeId ? (
              <RefreshCw className="h-4 w-4 shrink-0 animate-spin" />
            ) : (
              <EyeOff className="h-4 w-4 shrink-0" />
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
