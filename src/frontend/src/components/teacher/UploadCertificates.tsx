// FILE: src/components/teacher/UploadCertificates.tsx
// ACTION: REPLACE existing file entirely

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
  Academic: "bg-blue-100 text-blue-700",
  Sports: "bg-green-100 text-green-700",
  Arts: "bg-pink-100 text-pink-700",
  Science: "bg-purple-100 text-purple-700",
  Technology: "bg-indigo-100 text-indigo-700",
  Cultural: "bg-orange-100 text-orange-700",
  Leadership: "bg-yellow-100 text-yellow-700",
  Other: "bg-gray-100 text-gray-700",
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-gray-900 font-bold text-2xl mb-1">
            Upload Achievements & Certificates
          </h1>
          <p className="text-gray-600">
            Record student achievements, awards, and certificates
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
          Add Achievement
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

      {/* Add Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-gray-900 font-semibold text-lg">
                Record New Achievement
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
              {/* Student */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.studentId}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      studentId: Number(e.target.value) || "",
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Achievement Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="e.g., First Place in Science Olympiad"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, category: cat }))}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                        form.category === cat
                          ? "bg-purple-600 text-white border-purple-600"
                          : "border-gray-300 text-gray-600 hover:border-purple-400"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.date}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, date: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* File Path / URL (optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Certificate Link / File Path{" "}
                  <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.filePath}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, filePath: e.target.value }))
                  }
                  placeholder="https://drive.google.com/... or /uploads/cert.pdf"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Paste a URL or file path to the certificate document.
                </p>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowForm(false);
                  setForm(EMPTY_FORM);
                  setError(null);
                }}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4" />
                    Save Achievement
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Achievements",
            value: achievements.length,
            color: "text-purple-600",
            bg: "bg-purple-50",
          },
          ...["Academic", "Sports", "Arts"].map((cat) => ({
            label: cat,
            value: achievements.filter((a) => a.category === cat).length,
            color: "text-blue-600",
            bg: "bg-blue-50",
          })),
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl p-4`}>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-gray-600 text-sm">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by student or title…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {["All", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                filterCategory === cat
                  ? "bg-purple-600 text-white border-purple-600"
                  : "border-gray-300 text-gray-600 hover:border-purple-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Achievements Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm p-6 h-36 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-16 text-center text-gray-400">
          <Award className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium">No achievements found</p>
          <p className="text-sm mt-1">
            {achievements.length === 0
              ? "Click 'Add Achievement' to record the first one."
              : "Try adjusting your filters."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((a) => (
            <div
              key={a.achievementId}
              className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow relative"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    CATEGORY_COLORS[a.category] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {a.category}
                </span>
                <button
                  onClick={() => handleDelete(a.achievementId, a.title)}
                  disabled={deletingId === a.achievementId}
                  className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
                  title="Delete achievement"
                >
                  {deletingId === a.achievementId ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>

              <h3 className="font-semibold text-gray-900 mb-1 leading-snug">
                {a.title}
              </h3>
              <p className="text-sm text-gray-600 mb-1">
                👤 {a.student.firstName} {a.student.lastName}
                <span className="text-gray-400 ml-1">
                  ({a.student.rollNumber})
                </span>
              </p>
              <p className="text-xs text-gray-400">
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
                  className="mt-3 inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 underline"
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
