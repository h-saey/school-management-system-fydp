import React, { useEffect, useState } from "react";
import {
  Award,
  Plus,
  Trash2,
  Search,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  X,
} from "lucide-react";
import {
  fetchAllStudents,
  fetchAchievements,
  addAchievement,
  deleteAchievement,
  fetchMyProfile,
  StudentBasic,
  Achievement,
} from "../../services/teacherApi";

const CATEGORIES = [
  "Academic",
  "Sports",
  "Arts",
  "Science",
  "Technology",
  "Cultural",
  "Leadership",
  "Other",
];

const CATEGORY_COLORS: Record<string, string> = {
  Academic: "border border-blue-200/80 bg-blue-50 text-blue-800",
  Sports: "border border-emerald-200/80 bg-emerald-50 text-emerald-800",
  Arts: "border border-pink-200/80 bg-pink-50 text-pink-800",
  Science: "border border-violet-200/80 bg-violet-50 text-violet-800",
  Technology: "border border-indigo-200/80 bg-indigo-50 text-indigo-800",
  Cultural: "border border-orange-200/80 bg-orange-50 text-orange-800",
  Leadership: "border border-amber-200/80 bg-amber-50 text-amber-900",
  Other: "border border-slate-200/80 bg-slate-100 text-slate-800",
};

interface FormState {
  studentId: number | "";
  title: string;
  category: string;
  date: string;
  filePath: string;
}

const EMPTY_FORM: FormState = {
  studentId: "",
  title: "",
  category: "Academic",
  date: new Date().toISOString().split("T")[0],
  filePath: "",
};

export function UploadCertificates() {
  const [students, setStudents] = useState<StudentBasic[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [filterCategory, setFilterCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([fetchAllStudents(), fetchAchievements()])
      .then(([s, a]) => {
        setStudents(s);
        setAchievements(a);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const validate = (): string | null => {
    if (!form.studentId) return "Please select a student.";
    if (!form.title.trim()) return "Achievement title is required.";
    if (!form.date) return "Date is required.";
    if (new Date(form.date) > new Date())
      return "Date cannot be in the future.";
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
      await addAchievement({
        studentId: Number(form.studentId),
        title: form.title.trim(),
        category: form.category,
        date: new Date(form.date).toISOString(),
        filePath: form.filePath.trim() || undefined,
      });

      setSuccessMsg(`Achievement "${form.title}" recorded successfully!`);
      setForm(EMPTY_FORM);
      setShowForm(false);
      loadData();
    } catch (e: any) {
      setError(e.message || "Failed to save achievement.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (
      !window.confirm(`Delete achievement "${title}"? This cannot be undone.`)
    )
      return;
    setDeletingId(id);
    setError(null);
    try {
      await deleteAchievement(id);
      setAchievements((prev) => prev.filter((a) => a.achievementId !== id));
      setSuccessMsg("Achievement deleted.");
    } catch (e: any) {
      setError(e.message || "Failed to delete achievement.");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = achievements.filter((a) => {
    const matchCategory =
      filterCategory === "All" || a.category === filterCategory;
    const matchSearch =
      searchQuery === "" ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${a.student.firstName} ${a.student.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-w-0 space-y-8 sm:space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div className="min-w-0 space-y-2">
          <h1 className="text-balance text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Upload Achievements & Certificates
          </h1>
          <p className="max-w-2xl text-pretty text-sm leading-relaxed text-slate-600 sm:text-base">
            Record student achievements, awards, and certificates
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
          Add Achievement
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

      {/* Add Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-6">
          <div className="flex max-h-[min(100dvh,900px)] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/15 sm:max-h-[90vh] sm:rounded-2xl">
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-8 sm:py-6">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                Record New Achievement
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
              {/* Student */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Student <span className="font-normal text-red-600">*</span>
                </label>
                <select
                  value={form.studentId}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      studentId: Number(e.target.value) || "",
                    }))
                  }
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 sm:px-5 sm:py-3.5"
                >
                  <option value="">— Select Student —</option>
                  {students.map((s) => (
                    <option key={s.studentId} value={s.studentId}>
                      {s.firstName} {s.lastName} ({s.rollNumber})
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Achievement Title{" "}
                  <span className="font-normal text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="e.g., First Place in Science Olympiad"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 sm:px-5 sm:py-3.5"
                />
              </div>

              {/* Category */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">
                  Category
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, category: cat }))}
                      className={`inline-flex items-center rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 sm:text-sm ${
                        form.category === cat
                          ? "border-purple-600 bg-purple-600 text-white shadow-sm shadow-purple-600/20 hover:bg-purple-700"
                          : "border-slate-200 bg-white text-slate-600 hover:border-purple-300 hover:bg-slate-50 active:bg-slate-100"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Date <span className="font-normal text-red-600">*</span>
                </label>
                <input
                  type="date"
                  value={form.date}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, date: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 sm:px-5 sm:py-3.5"
                />
              </div>

              {/* File Path / URL (optional) */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Certificate Link / File Path{" "}
                  <span className="text-xs font-normal text-slate-500">
                    (optional)
                  </span>
                </label>
                <input
                  type="text"
                  value={form.filePath}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, filePath: e.target.value }))
                  }
                  placeholder="https://drive.google.com/... or /uploads/cert.pdf"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 sm:px-5 sm:py-3.5"
                />
                <p className="text-xs leading-relaxed text-slate-500">
                  Paste a URL or file path to the certificate document.
                </p>
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
                    Saving…
                  </>
                ) : (
                  <>
                    <Award className="h-4 w-4 shrink-0" />
                    Save Achievement
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
        {[
          {
            label: "Total Achievements",
            value: achievements.length,
            color: "text-purple-700",
            bg: "bg-purple-50/90",
            ring: "ring-purple-100/80",
          },
          ...["Academic", "Sports", "Arts"].map((cat) => ({
            label: cat,
            value: achievements.filter((a) => a.category === cat).length,
            ...(cat === "Academic"
              ? {
                  color: "text-blue-700",
                  bg: "bg-blue-50/90",
                  ring: "ring-blue-100/80",
                }
              : cat === "Sports"
                ? {
                    color: "text-emerald-700",
                    bg: "bg-emerald-50/90",
                    ring: "ring-emerald-100/80",
                  }
                : {
                    color: "text-rose-700",
                    bg: "bg-rose-50/90",
                    ring: "ring-rose-100/80",
                  }),
          })),
        ].map(({ label, value, color, bg, ring }) => (
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

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-6">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 sm:h-5 sm:w-5"
              aria-hidden
            />
            <input
              type="text"
              placeholder="Search by student or title…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 text-sm text-slate-900 shadow-inner shadow-slate-900/5 placeholder:text-slate-400 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/25 sm:py-3.5 sm:pl-12"
            />
          </div>
          <div className="flex min-w-0 flex-wrap gap-2.5 lg:max-w-[50%] lg:justify-end xl:max-w-none">
            {["All", ...CATEGORIES].map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`inline-flex items-center rounded-full border px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 sm:px-3.5 sm:text-sm ${
                  filterCategory === cat
                    ? "border-purple-600 bg-purple-600 text-white shadow-sm shadow-purple-600/20 hover:bg-purple-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-purple-300 hover:bg-slate-50 active:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-2xl border border-slate-100 bg-slate-100/80 sm:h-36"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm sm:px-10 sm:py-20">
          <Award
            className="mx-auto mb-5 h-12 w-12 text-slate-300"
            aria-hidden
          />
          <p className="text-base font-semibold text-slate-700 sm:text-lg">
            No achievements found
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            {achievements.length === 0
              ? "Click 'Add Achievement' to record the first one."
              : "Try adjusting your filters."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
          {filtered.map((a) => (
            <div
              key={a.achievementId}
              className="group relative rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-shadow hover:border-slate-300 hover:shadow-md sm:p-7"
            >
              <div className="mb-4 flex items-start justify-between gap-3 sm:mb-5">
                <span
                  className={`inline-flex max-w-[85%] items-center rounded-full px-3 py-1 text-xs font-semibold leading-tight ${
                    CATEGORY_COLORS[a.category] ||
                    "border border-slate-200 bg-slate-100 text-slate-800"
                  }`}
                >
                  {a.category}
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(a.achievementId, a.title)}
                  disabled={deletingId === a.achievementId}
                  className="-m-1 shrink-0 rounded-xl p-2.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                  title="Delete achievement"
                >
                  {deletingId === a.achievementId ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>

              <h3 className="mb-2 text-base font-semibold leading-snug tracking-tight text-slate-900 sm:text-[1.05rem]">
                {a.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-600">
                👤 {a.student.firstName} {a.student.lastName}
                <span className="ml-1 text-slate-400">
                  ({a.student.rollNumber})
                </span>
              </p>
              <p className="mt-2 text-xs font-medium text-slate-500 sm:text-sm">
                📅{" "}
                {new Date(a.date).toLocaleDateString("en-PK", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>

              {a.filePath && (
                <a
                  href={a.filePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-1.5 rounded-lg text-xs font-semibold text-purple-700 underline decoration-purple-300 underline-offset-2 transition-colors hover:text-purple-900 hover:decoration-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 sm:mt-6"
                >
                  📄 View Certificate
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// import React, { useState } from "react";
// import { Award, Upload, FileText, Calendar } from "lucide-react";

// export function UploadCertificates() {
//   const [selectedStudent, setSelectedStudent] = useState("");
//   const [certificateType, setCertificateType] = useState("Academic");
//   const [certificateName, setCertificateName] = useState("");
//   const [remarks, setRemarks] = useState("");

//   const students = [
//     "Aarav Patel",
//     "Aadhya Sharma",
//     "Advait Kumar",
//     "Ananya Singh",
//     "Arjun Reddy",
//     "Diya Gupta",
//     "Ishaan Verma",
//     "Kavya Nair",
//   ];

//   const uploadedCertificates = [
//     {
//       id: 1,
//       student: "Aarav Patel",
//       certificate: "Science Olympiad Gold Medal",
//       type: "Academic",
//       date: "2025-12-10",
//       remarks: "Outstanding performance in state-level competition",
//     },
//     {
//       id: 2,
//       student: "Aadhya Sharma",
//       certificate: "Inter-School Debate Winner",
//       type: "Co-curricular",
//       date: "2025-12-08",
//       remarks: "First position in inter-school debate competition",
//     },
//     {
//       id: 3,
//       student: "Kavya Nair",
//       certificate: "Mathematics Excellence Award",
//       type: "Academic",
//       date: "2025-12-05",
//       remarks: "100% marks in mathematics mid-term exam",
//     },
//   ];

//   const handleUpload = (e: React.FormEvent) => {
//     e.preventDefault();
//     alert(
//       "Certificate uploaded successfully! It will appear in the student's portfolio.",
//     );
//     // Reset form
//     setSelectedStudent("");
//     setCertificateType("Academic");
//     setCertificateName("");
//     setRemarks("");
//   };

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-gray-900 mb-2">
//           Upload Certificates & Achievements
//         </h1>
//         <p className="text-gray-600">Add certificates to student portfolios</p>
//       </div>

//       {/* Upload Form */}
//       <div className="bg-white rounded-xl shadow-sm p-6">
//         <h2 className="text-gray-900 mb-6">Upload New Certificate</h2>
//         <form onSubmit={handleUpload} className="space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-gray-700 mb-2">Select Student</label>
//               <select
//                 value={selectedStudent}
//                 onChange={(e) => setSelectedStudent(e.target.value)}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//                 required
//               >
//                 <option value="">Choose a student...</option>
//                 {students.map((student) => (
//                   <option key={student}>{student}</option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block text-gray-700 mb-2">
//                 Certificate Type
//               </label>
//               <select
//                 value={certificateType}
//                 onChange={(e) => setCertificateType(e.target.value)}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//               >
//                 <option>Academic</option>
//                 <option>Co-curricular</option>
//                 <option>Sports</option>
//                 <option>Achievement</option>
//                 <option>Participation</option>
//               </select>
//             </div>
//           </div>

//           <div>
//             <label className="block text-gray-700 mb-2">Certificate Name</label>
//             <input
//               type="text"
//               value={certificateName}
//               onChange={(e) => setCertificateName(e.target.value)}
//               placeholder="e.g., Science Olympiad Gold Medal"
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-gray-700 mb-2">
//               Upload Certificate File
//             </label>
//             <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 transition-colors cursor-pointer">
//               <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//               <p className="text-gray-600 mb-2">
//                 Click to upload or drag and drop
//               </p>
//               <p className="text-sm text-gray-500">PDF, JPG, PNG (Max 5MB)</p>
//               <input
//                 type="file"
//                 className="hidden"
//                 accept=".pdf,.jpg,.jpeg,.png"
//               />
//             </div>
//           </div>

//           <div>
//             <label className="block text-gray-700 mb-2">
//               Remarks (Optional)
//             </label>
//             <textarea
//               value={remarks}
//               onChange={(e) => setRemarks(e.target.value)}
//               placeholder="Add any additional notes or comments..."
//               rows={4}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//             />
//           </div>

//           <button
//             type="submit"
//             className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
//           >
//             <Upload className="w-4 h-4" />
//             Upload Certificate
//           </button>
//         </form>
//       </div>

//       {/* Recently Uploaded */}
//       <div className="bg-white rounded-xl shadow-sm p-6">
//         <div className="flex items-center gap-3 mb-6">
//           <Award className="w-6 h-6 text-purple-600" />
//           <h2 className="text-gray-900">Recently Uploaded Certificates</h2>
//         </div>

//         <div className="space-y-4">
//           {uploadedCertificates.map((cert) => (
//             <div
//               key={cert.id}
//               className="border border-gray-200 rounded-lg p-6 hover:border-purple-300 transition-colors"
//             >
//               <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-3 sm:gap-0">
//                 {/* Left Section */}
//                 <div className="flex items-start gap-4">
//                   <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
//                     <Award className="w-6 h-6 text-purple-600" />
//                   </div>

//                   <div>
//                     <h3 className="text-gray-900 mb-1">{cert.certificate}</h3>

//                     {/* Info Row */}
//                     <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
//                       <span>Student: {cert.student}</span>
//                       <span className="hidden sm:inline">•</span>

//                       <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
//                         {cert.type}
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Date Section */}
//                 <div className="flex items-center gap-2 text-sm text-gray-600 sm:self-start">
//                   <Calendar className="w-4 h-4 flex-shrink-0" />
//                   {cert.date}
//                 </div>
//               </div>

//               {/* Remarks */}
//               {cert.remarks && (
//                 <div className="p-4 bg-gray-50 rounded-lg">
//                   <p className="text-sm text-gray-700">
//                     <strong>Remarks:</strong> {cert.remarks}
//                   </p>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Instructions */}
//       <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
//         <h3 className="text-gray-900 mb-3">Upload Guidelines</h3>
//         <div className="space-y-2 text-gray-700 text-sm">
//           <p>
//             • Uploaded certificates will be immediately visible in the student's
//             portfolio.
//           </p>
//           <p>
//             • Ensure certificate files are clear and readable before uploading.
//           </p>
//           <p>
//             • Add meaningful remarks to provide context about the achievement.
//           </p>
//           <p>
//             • Parents will be notified when a new certificate is added to their
//             child's portfolio.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
