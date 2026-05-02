import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  Plus,
  Search,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  X,
  Smile,
  Frown,
  Minus,
} from "lucide-react";
import {
  fetchAllStudents,
  fetchRemarks,
  addRemark,
  fetchMyProfile,
  StudentBasic,
  BehaviorRemark,
} from "../../services/teacherApi";

type RemarkType = "Positive" | "Negative" | "Neutral";

const REMARK_TYPES: RemarkType[] = ["Positive", "Negative", "Neutral"];

const TYPE_STYLES: Record<
  RemarkType,
  { bg: string; text: string; icon: React.ReactNode; border: string }
> = {
  Positive: {
    bg: "bg-green-100",
    text: "text-green-700",
    icon: <Smile className="w-4 h-4" />,
    border: "border-green-400",
  },
  Negative: {
    bg: "bg-red-100",
    text: "text-red-700",
    icon: <Frown className="w-4 h-4" />,
    border: "border-red-400",
  },
  Neutral: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    icon: <Minus className="w-4 h-4" />,
    border: "border-yellow-400",
  },
};

const SAMPLE_REMARKS: Record<RemarkType, string[]> = {
  Positive: [
    "Excellent class participation today.",
    "Submitted work on time with outstanding quality.",
    "Helped peers during group activity.",
    "Showed great improvement this week.",
  ],
  Negative: [
    "Disruptive behavior during class.",
    "Failed to submit assigned homework.",
    "Arrived late without a valid reason.",
    "Disrespectful attitude toward classmates.",
  ],
  Neutral: [
    "Average performance this week.",
    "Absent for one class, reason provided.",
    "Needs to focus more on coursework.",
    "Completed work but with minor errors.",
  ],
};

interface FormState {
  studentId: number | "";
  remarkType: RemarkType;
  remarkText: string;
}

const EMPTY_FORM: FormState = {
  studentId: "",
  remarkType: "Positive",
  remarkText: "",
};

export function BehaviorRemarks() {
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [students, setStudents] = useState<StudentBasic[]>([]);
  const [remarks, setRemarks] = useState<BehaviorRemark[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [filterType, setFilterType] = useState<"All" | RemarkType>("All");
  const [filterStudent, setFilterStudent] = useState<number | "">("");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetchMyProfile(),
      fetchAllStudents(),
      fetchRemarks(undefined, filterType === "All" ? undefined : filterType),
    ])
      .then(([profile, studentList, remarkList]) => {
        setTeacherId(profile.teacherId);
        setStudents(studentList);
        setRemarks(remarkList);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [filterType]);

  const validate = (): string | null => {
    if (!form.studentId) return "Please select a student.";
    if (!form.remarkText.trim()) return "Remark text is required.";
    if (form.remarkText.trim().length < 10)
      return "Remark must be at least 10 characters.";
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!teacherId) return;

    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await addRemark({
        studentId: Number(form.studentId),
        teacherId,
        remarkType: form.remarkType,
        remarkText: form.remarkText.trim(),
      });

      const studentName = students.find(
        (s) => s.studentId === Number(form.studentId),
      );
      setSuccessMsg(
        `${form.remarkType} remark added for ${studentName?.firstName} ${studentName?.lastName}.`,
      );
      setForm(EMPTY_FORM);
      setShowForm(false);
      loadData();
    } catch (e: any) {
      setError(e.message || "Failed to add remark.");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = remarks.filter((r) => {
    const matchStudent =
      filterStudent === "" ||
      students.find(
        (s) =>
          s.studentId === Number(filterStudent) &&
          `${s.firstName} ${s.lastName}` ===
            `${r.student.firstName} ${r.student.lastName}`,
      );
    const matchSearch =
      searchQuery === "" ||
      r.remarkText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${r.student.firstName} ${r.student.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchStudent && matchSearch;
  });

  const countByType = (type: RemarkType) =>
    remarks.filter((r) => r.remarkType === type).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-gray-900 font-bold text-2xl mb-1">
            Behavior Remarks
          </h1>
          <p className="text-gray-600">
            Record and track student behavior observations
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
          Add Remark
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Remarks",
            value: remarks.length,
            bg: "bg-purple-50",
            color: "text-purple-600",
          },
          {
            label: "Positive",
            value: countByType("Positive"),
            bg: "bg-green-50",
            color: "text-green-600",
          },
          {
            label: "Negative",
            value: countByType("Negative"),
            bg: "bg-red-50",
            color: "text-red-600",
          },
          {
            label: "Neutral",
            value: countByType("Neutral"),
            bg: "bg-yellow-50",
            color: "text-yellow-600",
          },
        ].map(({ label, value, bg, color }) => (
          <div key={label} className={`${bg} rounded-xl p-4`}>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-gray-600 text-sm">{label}</p>
          </div>
        ))}
      </div>

      {/* Add Remark Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-gray-900 font-semibold text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Add Behavior Remark
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

              {/* Remark Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remark Type
                </label>
                <div className="flex gap-3">
                  {REMARK_TYPES.map((type) => {
                    const style = TYPE_STYLES[type];
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            remarkType: type,
                            remarkText: "",
                          }))
                        }
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                          form.remarkType === type
                            ? `${style.bg} ${style.text} ${style.border}`
                            : "border-gray-200 text-gray-500 hover:border-gray-300"
                        }`}
                      >
                        {style.icon}
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Templates */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Templates
                </label>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_REMARKS[form.remarkType].map((sample) => (
                    <button
                      key={sample}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({ ...f, remarkText: sample }))
                      }
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200 transition-colors text-left"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>

              {/* Remark Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remark <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={form.remarkText}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, remarkText: e.target.value }))
                  }
                  placeholder="Describe the student's behavior in detail…"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
                <p className="text-xs text-gray-400 mt-0.5 text-right">
                  {form.remarkText.length} chars (min 10)
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
                    Saving…
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    Save Remark
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by student or remark text…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          />
        </div>

        <select
          value={filterStudent}
          onChange={(e) => setFilterStudent(Number(e.target.value) || "")}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-white"
        >
          <option value="">All Students</option>
          {students.map((s) => (
            <option key={s.studentId} value={s.studentId}>
              {s.firstName} {s.lastName}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          {(["All", "Positive", "Negative", "Neutral"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                filterType === t
                  ? "bg-purple-600 text-white border-purple-600"
                  : "border-gray-300 text-gray-600 hover:border-purple-400"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Remarks List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm p-6 h-24 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-16 text-center text-gray-400">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium">No remarks found</p>
          <p className="text-sm mt-1">
            {remarks.length === 0
              ? "Click 'Add Remark' to record the first behavior observation."
              : "Try adjusting your filters."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const style = TYPE_STYLES[r.remarkType];
            return (
              <div
                key={r.remarkId}
                className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${style.border}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}
                      >
                        {style.icon}
                        {r.remarkType}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {r.student.firstName} {r.student.lastName}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {r.remarkText}
                    </p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-400">
                      <span>
                        📅{" "}
                        {new Date(r.date).toLocaleDateString("en-PK", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span>
                        👤 Added by: {r.addedBy?.firstName}{" "}
                        {r.addedBy?.lastName}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
