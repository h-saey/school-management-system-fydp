import React, { useState, useEffect } from "react";
import { MessageSquare, Plus, AlertCircle, Send, X } from "lucide-react";
import {
  getMyComplaints,
  submitComplaint,
  type ComplaintRecord,
} from "../../services/parentApi";

function statusBadge(status: string) {
  switch (status) {
    case "Submitted":
      return "bg-blue-100 text-blue-700";
    case "UnderReview":
      return "bg-yellow-100 text-yellow-700";
    case "Resolved":
      return "bg-green-100 text-green-700";
    case "Rejected":
      return "bg-red-100 text-red-700";
    case "Closed":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

const CATEGORIES = [
  "Academic",
  "Facility",
  "Teacher",
  "Harassment",
  "Fee",
  "Other",
];

export function ComplaintSubmission() {
  const [complaints, setComplaints] = useState<ComplaintRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    category: CATEGORIES[0],
    description: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await getMyComplaints();
      setComplaints(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!form.description.trim()) {
      setFormError("Please enter a description.");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await submitComplaint({
        category: form.category,
        description: form.description,
      });
      setShowForm(false);
      setForm({ category: CATEGORIES[0], description: "" });
      await load();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading)
    return (
      <div className="flex min-h-[256px] items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="text-sm font-medium text-gray-500">Loading complaints…</div>
      </div>
    );

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
              Complaint & Feedback
            </h1>
            <p className="text-sm leading-6 text-gray-600 sm:text-base">
              Submit issues and track their resolution status
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setFormError(null);
            }}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.99] sm:w-auto"
          >
            {showForm ? (
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
            {showForm ? "Cancel" : "New Complaint"}
          </button>
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
          <span>{error}</span>
        </div>
      )}

      {showForm && (
        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-6 flex items-center gap-2">
            <Send className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />
            <h2 className="text-lg font-semibold tracking-tight text-gray-900 sm:text-xl">
              Submit a Complaint
            </h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
                className="min-h-11 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Describe Your Issue
              </label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Please provide detailed information about your concern..."
                className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            {formError && (
              <p className="flex items-center gap-1.5 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {formError}
              </p>
            )}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {submitting ? "Submitting…" : "Submit Complaint"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-gray-900 sm:text-xl">
            My Complaints
          </h2>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 sm:text-sm">
            {complaints.length}
          </span>
        </div>

        {complaints.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-12 text-center sm:py-16">
            <MessageSquare className="mx-auto mb-3 h-10 w-10 text-gray-300 sm:h-12 sm:w-12" />
            <p className="text-sm text-gray-500 sm:text-base">
              No complaints submitted yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((c) => (
              <article
                key={c.complaintId}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-gray-300 sm:p-5"
              >
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-gray-100 p-2">
                        <MessageSquare className="h-4 w-4 text-gray-600 sm:h-5 sm:w-5" />
                      </div>
                      <h3 className="text-sm font-medium leading-6 text-gray-900 sm:text-base">
                        {c.description}
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pl-11 text-xs text-gray-500 sm:text-sm">
                      <span>ID: {c.complaintId}</span>
                      <span className="text-gray-300">•</span>
                      <span>{c.category}</span>
                      <span className="text-gray-300">•</span>
                      <span>{new Date(c.dateSubmitted).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span
                    className={`self-start rounded-full px-3 py-1 text-xs font-medium sm:text-sm ${statusBadge(c.status)}`}
                  >
                    {c.status === "UnderReview" ? "In Progress" : c.status}
                  </span>
                </div>

                {c.remarks ? (
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 sm:p-4">
                    <p className="text-sm text-gray-700">
                      <strong className="font-semibold">Response:</strong>{" "}
                      {c.remarks}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-yellow-100 bg-yellow-50 p-3 sm:p-4">
                    <p className="text-sm text-gray-700">
                      Your complaint is being reviewed. You will be notified once
                      there's an update.
                    </p>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
