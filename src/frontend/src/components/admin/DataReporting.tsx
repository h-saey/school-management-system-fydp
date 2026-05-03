import React, { useState, useEffect } from "react";
import {
  BarChart2,
  Download,
  RefreshCw,
  Brain,
  AlertTriangle,
  TrendingUp,
  Users,
  BookOpen,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { generateReport, downloadReport } from "../../services/api";
import { getAllRisks, AllRisksResponse } from "../../services/AIService";
import { useToast, ToastContainer } from "../../utils/useToast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type ReportType = "attendance" | "marks" | "portfolio" | "risk-analysis";

const REPORT_TYPES: {
  id: ReportType;
  label: string;
  description: string;
  icon: any;
}[] = [
  {
    id: "attendance",
    label: "Attendance Report",
    description: "Student attendance records",
    icon: Users,
  },
  {
    id: "marks",
    label: "Marks Report",
    description: "Exam results by class/subject",
    icon: BookOpen,
  },
  {
    id: "portfolio",
    label: "Portfolio Report",
    description: "Full student portfolios",
    icon: BarChart2,
  },
  {
    id: "risk-analysis",
    label: "AI Risk Analysis",
    description: "AI-powered student risk breakdown",
    icon: Brain,
  },
];

const RISK_COLORS: Record<string, string> = {
  High: "#ef4444",
  Medium: "#f97316",
  Low: "#22c55e",
};

export function DataReporting() {
  const { toasts, success, error } = useToast();

  const [reportType, setReportType] = useState<ReportType>("attendance");
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [minMarks, setMinMarks] = useState("");
  const [maxMarks, setMaxMarks] = useState("");
  const [generating, setGenerating] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiData, setAiData] = useState<AllRisksResponse | null>(null);

  const CLASSES = ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10"];

  // ── Load AI data whenever risk-analysis is selected ──────
  useEffect(() => {
    if (reportType === "risk-analysis") loadAIData();
  }, [reportType]);

  const loadAIData = async () => {
    setLoadingAI(true);
    try {
      const data = await getAllRisks({
        riskLevel: riskFilter || undefined,
        minMarks: minMarks ? Number(minMarks) : undefined,
        maxMarks: maxMarks ? Number(maxMarks) : undefined,
      });
      setAiData(data);
    } catch (err: any) {
      error(err.message ?? "Failed to load AI risk data");
    } finally {
      setLoadingAI(false);
    }
  };

  // ── Apply filters for AI report ──────────────────────────
  const handleApplyFilters = () => {
    if (reportType === "risk-analysis") loadAIData();
  };

  // ── Generate standard report (download) ─────────────────
  const handleGenerate = async () => {
    if (reportType === "risk-analysis") {
      loadAIData();
      return;
    }
    setGenerating(true);
    try {
      const params: Record<string, string> = {};
      if (className) params.className = className;
      if (subject) params.subject = subject;
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;

      const blob = await generateReport(reportType, params);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportType}_report_${new Date().toISOString().slice(0, 10)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      success("Report downloaded successfully");
    } catch (err: any) {
      error(err.message ?? "Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  // ── Risk distribution for chart ──────────────────────────
  const riskChartData = aiData
    ? [
        { name: "High", count: aiData.insights.highRiskCount, fill: "#ef4444" },
        {
          name: "Medium",
          count: aiData.insights.mediumRiskCount,
          fill: "#f97316",
        },
        { name: "Low", count: aiData.insights.lowRiskCount, fill: "#22c55e" },
      ]
    : [];

  return (
    <div className="min-w-0 space-y-6 sm:space-y-8">
      <ToastContainer toasts={toasts} />

      {/* HEADER */}
      <div className="space-y-1">
        <h1 className="text-balance text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Data Reporting
        </h1>
        <p className="max-w-2xl text-pretty text-sm leading-relaxed text-slate-600 sm:text-base">
          Generate reports and AI-powered analytics insights
        </p>
      </div>

      {/* REPORT TYPE SELECTOR */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {REPORT_TYPES.map((rt) => (
          <button
            type="button"
            key={rt.id}
            onClick={() => setReportType(rt.id)}
            className={`rounded-2xl border p-3 text-left shadow-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 sm:p-4 ${
              reportType === rt.id
                ? "border-red-500 bg-red-50/90 ring-1 ring-red-200/80"
                : "border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/80 active:bg-slate-100/80"
            }`}
          >
            <rt.icon
              className={`mb-2 h-5 w-5 ${reportType === rt.id ? "text-red-600" : "text-slate-500"}`}
              aria-hidden
            />
            <p
              className={`text-sm font-semibold ${reportType === rt.id ? "text-red-800" : "text-slate-900"}`}
            >
              {rt.label}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
              {rt.description}
            </p>
          </button>
        ))}
      </div>

      {/* FILTERS */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
          <ChevronDown className="h-5 w-5 shrink-0 text-slate-400" aria-hidden />{" "}
          Smart Filters
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-5">
          {/* Class */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">
              Class
            </label>
            <select
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
            >
              <option value="">All Classes</option>
              {CLASSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">
              Date From
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
            />
          </div>

          {/* Date To */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">
              Date To
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
            />
          </div>

          {/* Subject (marks only) */}
          {reportType === "marks" && (
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Math"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
              />
            </div>
          )}

          {/* Risk Level (AI report only) */}
          {reportType === "risk-analysis" && (
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Risk Level ✨
              </label>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
              >
                <option value="">All Levels</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          )}

          {/* Performance Range (AI report only) */}
          {reportType === "risk-analysis" && (
            <>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">
                  Min Marks % ✨
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={minMarks}
                  onChange={(e) => setMinMarks(e.target.value)}
                  placeholder="e.g. 0"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">
                  Max Marks % ✨
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                />
              </div>
            </>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:mt-6 sm:flex-row sm:flex-wrap sm:gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating || loadingAI}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-red-600/25 transition-colors hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 active:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generating || loadingAI ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : reportType === "risk-analysis" ? (
              <Brain className="h-4 w-4" aria-hidden />
            ) : (
              <Download className="h-4 w-4" aria-hidden />
            )}
            {reportType === "risk-analysis"
              ? "Run AI Analysis"
              : "Generate & Download"}
          </button>

          {reportType === "risk-analysis" && (
            <button
              type="button"
              onClick={handleApplyFilters}
              disabled={loadingAI}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loadingAI ? "animate-spin" : ""}`}
                aria-hidden
              />
              Apply Filters
            </button>
          )}
        </div>
      </div>

      {/* ── AI RISK ANALYSIS RESULTS ───────────────────────── */}
      {reportType === "risk-analysis" && (
        <>
          {loadingAI && (
            <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-10 text-center shadow-sm sm:py-12">
              <Loader2
                className="mx-auto mb-3 h-8 w-8 animate-spin text-red-600"
                aria-hidden
              />
              <p className="text-sm font-medium text-slate-600">
                Running AI analysis on all students...
              </p>
            </div>
          )}

          {aiData && !loadingAI && (
            <>
              {/* Analytics Insights */}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                {[
                  {
                    label: "Total Students",
                    value: aiData.insights.totalStudents,
                    color: "text-slate-900",
                    ring: "ring-slate-200/80",
                    bg: "bg-slate-50/90",
                  },
                  {
                    label: "High Risk %",
                    value: `${aiData.insights.highRiskPercent.toFixed(1)}%`,
                    color: "text-red-700",
                    ring: "ring-red-100/80",
                    bg: "bg-red-50/90",
                  },
                  {
                    label: "Avg Attendance",
                    value: `${aiData.insights.avgAttendance.toFixed(1)}%`,
                    color: "text-blue-700",
                    ring: "ring-blue-100/80",
                    bg: "bg-blue-50/90",
                  },
                  {
                    label: "Avg Marks",
                    value: `${aiData.insights.avgMarks.toFixed(1)}%`,
                    color: "text-emerald-700",
                    ring: "ring-emerald-100/80",
                    bg: "bg-emerald-50/90",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className={`rounded-2xl border border-slate-100/80 p-4 shadow-sm ring-1 sm:p-5 ${stat.ring} ${stat.bg}`}
                  >
                    <p className="text-xs font-medium text-slate-600 sm:text-sm">
                      {stat.label}
                    </p>
                    <p
                      className={`mt-1 text-xl font-bold tabular-nums tracking-tight sm:text-2xl ${stat.color}`}
                    >
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* AI Summary */}
              <div className="rounded-2xl border border-red-200/80 bg-gradient-to-r from-red-50/95 to-orange-50/95 p-5 shadow-sm sm:p-6">
                <div className="mb-3 flex items-center gap-2">
                  <Brain className="h-5 w-5 shrink-0 text-red-600" aria-hidden />
                  <h2 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
                    AI Summary
                  </h2>
                </div>
                <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
                  {aiData.insights.aiSummary}
                </p>
              </div>

              {/* Risk Distribution Chart */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="mb-4 flex items-center gap-2 text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
                  <AlertTriangle
                    className="h-5 w-5 shrink-0 text-orange-500"
                    aria-hidden
                  />
                  Risk Distribution
                </h2>
                <div className="min-h-[200px] w-full">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={riskChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12, fill: "#64748b" }}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: "#64748b" }}
                        allowDecimals={false}
                      />
                      <Tooltip />
                      <Bar dataKey="count" name="Students" radius={[8, 8, 0, 0]}>
                        {riskChartData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Student Risk Table */}
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
                  <TrendingUp
                    className="h-6 w-6 shrink-0 text-red-600"
                    aria-hidden
                  />
                  <h2 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
                    Student Risk Details ({aiData.students.length})
                  </h2>
                </div>
                {aiData.students.length === 0 ? (
                  <div className="px-4 py-10 text-center text-sm text-slate-500 sm:py-12">
                    No students match the selected filters.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px]">
                      <thead className="bg-slate-50/90">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600 sm:px-5">
                            Student
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600 sm:px-5">
                            Class
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600 sm:px-5">
                            Attendance
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600 sm:px-5">
                            Marks
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600 sm:px-5">
                            Behavior
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600 sm:px-5">
                            Risk
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600 sm:px-5">
                            Key Factors
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {aiData.students.map((s) => (
                          <tr
                            key={s.studentId}
                            className="transition-colors hover:bg-slate-50/80"
                          >
                            <td className="px-4 py-3 text-sm font-semibold text-slate-900 sm:px-5">
                              {s.studentName}
                              <span className="ml-1 text-xs font-normal text-slate-500">
                                ({s.rollNumber})
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-700 sm:px-5">
                              {s.class}
                            </td>
                            <td className="px-4 py-3 text-sm sm:px-5">
                              <span
                                className={`font-semibold tabular-nums ${s.attendanceRate < 75 ? "text-red-600" : "text-emerald-600"}`}
                              >
                                {s.attendanceRate.toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm sm:px-5">
                              <span
                                className={`font-semibold tabular-nums ${s.averageMarks < 55 ? "text-red-600" : "text-emerald-600"}`}
                              >
                                {s.averageMarks.toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-700 sm:px-5">
                              {s.behaviorScore.toFixed(0)}/100
                            </td>
                            <td className="px-4 py-3 sm:px-5">
                              <span
                                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                  s.finalRisk === "High"
                                    ? "border border-red-200/80 bg-red-50 text-red-800"
                                    : s.finalRisk === "Medium"
                                      ? "border border-amber-200/80 bg-amber-50 text-amber-900"
                                      : "border border-emerald-200/80 bg-emerald-50 text-emerald-800"
                                }`}
                              >
                                {s.finalRisk}
                              </span>
                            </td>
                            <td className="max-w-xs px-4 py-3 text-xs leading-relaxed text-slate-600 sm:px-5">
                              {s.factors[0]}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
// import React, { useEffect, useState } from "react";
// import {
//   BarChart,
//   Download,
//   FileText,
//   TrendingUp,
//   Calendar,
// } from "lucide-react";
// import { API_BASE } from "../../services/api";

// export function DataReporting() {
//   const [reportType, setReportType] = useState("attendance");
//   const [reports, setReports] = useState<any[]>([]);

//   const [filters, setFilters] = useState({
//     className: "",
//     from: "",
//     to: "",
//   });

//   // ---------------- FETCH REPORTS ----------------
//   const fetchReports = async () => {
//     try {
//       const token = localStorage.getItem("token");

//       const res = await fetch(`${API_BASE}/report`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const data = await res.json();
//       setReports(data);
//     } catch (err) {
//       console.error("Fetch reports error:", err);
//     }
//   };

//   useEffect(() => {
//     fetchReports();
//   }, []);

//   // ---------------- GENERATE REPORT ----------------
//   const generateReport = async () => {
//     try {
//       const token = localStorage.getItem("token");

//       const params = new URLSearchParams();

//       if (filters.className.trim() !== "")
//         params.append("className", filters.className);

//       // ✅ SAFE DATE HANDLING (FIXED CRASH)
//       if (filters.from !== "") params.append("from", filters.from); // send raw date (NOT ISO)

//       if (filters.to !== "") params.append("to", filters.to);

//       const res = await fetch(
//         `${API_BASE}/report/${reportType}?${params.toString()}`,
//         {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         },
//       );

//       if (!res.ok) {
//         const msg = await res.text();
//         console.error("Backend error:", msg);
//         throw new Error(msg);
//       }

//       const blob = await res.blob();
//       const url = window.URL.createObjectURL(blob);

//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `${reportType}_report.pdf`;
//       a.click();

//       fetchReports();
//     } catch (err) {
//       console.error("Generate error:", err);
//       alert("Report generation failed. Check backend logs.");
//     }
//   };

//   // ---------------- DOWNLOAD OLD REPORT ----------------
//   const downloadReport = async (filePath: string) => {
//     try {
//       const token = localStorage.getItem("token");

//       const res = await fetch(
//         `${API_BASE}/report/download?path=${encodeURIComponent(filePath)}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         },
//       );

//       if (!res.ok) throw new Error("Download failed");

//       const blob = await res.blob();
//       const url = window.URL.createObjectURL(blob);

//       const a = document.createElement("a");
//       a.href = url;
//       a.download = filePath.split("/").pop() || "report.pdf";
//       a.click();
//     } catch (err) {
//       console.error(err);
//       alert("Download failed");
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* HEADER */}
//       <div>
//         <h1 className="text-gray-900 mb-2">Data Reporting & Analytics</h1>
//         <p className="text-gray-600">Generate and manage academic reports</p>
//       </div>

//       {/* STATS */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <Calendar className="w-6 h-6 text-blue-600" />
//           <p className="text-gray-900">91.5%</p>
//           <p className="text-sm text-blue-600">Attendance</p>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <TrendingUp className="w-6 h-6 text-green-600" />
//           <p className="text-gray-900">82.3%</p>
//           <p className="text-sm text-green-600">Performance</p>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <FileText className="w-6 h-6 text-purple-600" />
//           <p className="text-gray-900">1245</p>
//           <p className="text-sm text-purple-600">Students</p>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <BarChart className="w-6 h-6 text-orange-600" />
//           <p className="text-gray-900">{reports.length}</p>
//           <p className="text-sm text-orange-600">Reports</p>
//         </div>
//       </div>

//       {/* GENERATE SECTION */}
//       <div className="bg-white rounded-xl shadow-sm p-6">
//         <h2 className="mb-4">Generate Report</h2>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//           <select
//             value={reportType}
//             onChange={(e) => setReportType(e.target.value)}
//             className="px-4 py-2 border rounded-lg"
//           >
//             <option value="attendance">Attendance</option>
//             <option value="marks">Marks</option>
//             <option value="risk">Risk</option>
//             <option value="portfolio">Portfolio</option>
//           </select>

//           <input
//             type="date"
//             className="px-4 py-2 border rounded-lg"
//             onChange={(e) => setFilters({ ...filters, from: e.target.value })}
//           />

//           <input
//             type="date"
//             className="px-4 py-2 border rounded-lg"
//             onChange={(e) => setFilters({ ...filters, to: e.target.value })}
//           />
//         </div>

//         <button
//           onClick={generateReport}
//           className="bg-red-600 text-white px-6 py-2 rounded"
//         >
//           Generate PDF Report
//         </button>
//       </div>

//       {/* HISTORY */}
//       <div className="bg-white rounded-xl shadow-sm p-6">
//         <h2 className="mb-4">Report History</h2>

//         <table className="w-full">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left">Type</th>
//               <th className="px-6 py-3 text-left">Date</th>
//               <th className="px-6 py-3 text-left">Generated By</th>
//               <th className="px-6 py-3 text-left">Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             {reports.map((r) => (
//               <tr key={r.reportId} className="border-t">
//                 <td className="px-6 py-3">{r.type}</td>

//                 <td className="px-6 py-3">
//                   {new Date(r.generatedOn).toLocaleDateString()}
//                 </td>

//                 <td className="px-6 py-3">
//                   {r.generatedBy?.firstName} {r.generatedBy?.lastName}
//                 </td>

//                 <td className="px-6 py-3">
//                   <button
//                     onClick={() => downloadReport(r.filePath)}
//                     className="text-blue-600"
//                   >
//                     <Download className="w-5 h-5" />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
//==================================================OLD CODE (FOR REFERENCE)==================================================

// import React, { useState } from 'react';
// import { API_BASE } from "../../services/api";

// import { BarChart, Download, FileText, TrendingUp, Calendar } from 'lucide-react';

// export function DataReporting() {
//   const [reportType, setReportType] = useState('attendance');

//   const reports = [
//     { name: 'Monthly Attendance Report', type: 'attendance', description: 'Class-wise attendance summary for the month', lastGenerated: '2025-12-01' },
//     { name: 'Result Summary Report', type: 'results', description: 'Exam-wise performance analysis and grades', lastGenerated: '2025-11-25' },
//     { name: 'Fee Collection Report', type: 'fees', description: 'Payment status and collection summary', lastGenerated: '2025-12-05' },
//     { name: 'Student Performance Report', type: 'performance', description: 'Individual student academic progress tracking', lastGenerated: '2025-11-20' },
//     { name: 'Teacher Activity Report', type: 'teacher', description: 'Teacher attendance marking and marks entry log', lastGenerated: '2025-12-08' },
//     { name: 'Risk Indicators Report', type: 'risk', description: 'Students with low attendance or poor performance', lastGenerated: '2025-12-10' }
//   ];

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-gray-900 mb-2">Data Reporting & Analytics</h1>
//         <p className="text-gray-600">Generate comprehensive reports and download data</p>
//       </div>

//       {/* Quick Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <div className="flex items-center gap-3 mb-2">
//             <Calendar className="w-6 h-6 text-blue-600" />
//             <h3 className="text-gray-900">Avg Attendance</h3>
//           </div>
//           <p className="text-gray-900">91.5%</p>
//           <p className="text-sm text-blue-600">This month</p>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <div className="flex items-center gap-3 mb-2">
//             <TrendingUp className="w-6 h-6 text-green-600" />
//             <h3 className="text-gray-900">Avg Performance</h3>
//           </div>
//           <p className="text-gray-900">82.3%</p>
//           <p className="text-sm text-green-600">Mid-term exams</p>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <div className="flex items-center gap-3 mb-2">
//             <FileText className="w-6 h-6 text-purple-600" />
//             <h3 className="text-gray-900">Total Students</h3>
//           </div>
//           <p className="text-gray-900">1,245</p>
//           <p className="text-sm text-purple-600">Active enrollment</p>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <div className="flex items-center gap-3 mb-2">
//             <BarChart className="w-6 h-6 text-orange-600" />
//             <h3 className="text-gray-900">Reports Generated</h3>
//           </div>
//           <p className="text-gray-900">24</p>
//           <p className="text-sm text-orange-600">This month</p>
//         </div>
//       </div>

//       {/* Report Generator */}
//       <div className="bg-white rounded-xl shadow-sm p-6">
//         <h2 className="text-gray-900 mb-6">Generate Custom Report</h2>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//           <div>
//             <label className="block text-gray-700 mb-2">Report Type</label>
//             <select
//               value={reportType}
//               onChange={(e) => setReportType(e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
//             >
//               <option value="attendance">Attendance Report</option>
//               <option value="results">Results Report</option>
//               <option value="fees">Fee Collection Report</option>
//               <option value="performance">Performance Report</option>
//             </select>
//           </div>
//           <div>
//             <label className="block text-gray-700 mb-2">Date Range</label>
//             <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
//               <option>This Month</option>
//               <option>Last Month</option>
//               <option>This Quarter</option>
//               <option>This Year</option>
//               <option>Custom Range</option>
//             </select>
//           </div>
//           <div>
//             <label className="block text-gray-700 mb-2">Class Filter</label>
//             <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
//               <option>All Classes</option>
//               <option>Class 10</option>
//               <option>Class 9</option>
//               <option>Class 8</option>
//             </select>
//           </div>
//         </div>
//         <div className="flex gap-3">
//           <button className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
//             <BarChart className="w-4 h-4" />
//             Generate Report
//           </button>
//           <button className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
//             <Download className="w-4 h-4" />
//             Export to Excel
//           </button>
//         </div>
//       </div>

//       {/* Available Reports */}
//       <div className="bg-white rounded-xl shadow-sm p-6">
//         <h2 className="text-gray-900 mb-6">Available Reports</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {reports.map((report, index) => (
//             <div key={index} className="border border-gray-200 rounded-lg p-6 hover:border-red-300 transition-colors">
//               <div className="flex items-start justify-between mb-3">
//                 <div>
//                   <h3 className="text-gray-900 mb-2">{report.name}</h3>
//                   <p className="text-sm text-gray-600 mb-2">{report.description}</p>
//                   <p className="text-xs text-gray-500">Last generated: {report.lastGenerated}</p>
//                 </div>
//               </div>
//               <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full justify-center">
//                 <Download className="w-4 h-4" />
//                 Download
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Risk Indicators */}
//       <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
//         <h3 className="text-gray-900 mb-3">Performance Risk Indicators</h3>
//         <div className="space-y-2 text-gray-700">
//           <p>• 12 students with attendance below 75%</p>
//           <p>• 8 students with failing grades in 2+ subjects</p>
//           <p>• 5 students with no fee payment for 2+ months</p>
//           <p>• 3 unresolved complaints pending for over 7 days</p>
//         </div>
//         <button className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
//           View Detailed Risk Report
//         </button>
//       </div>
//     </div>
//   );
// }
