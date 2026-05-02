import React, { useState, useEffect } from "react";
import {
  FileText,
  TrendingUp,
  Award,
  Filter,
  Download,
  AlertCircle,
} from "lucide-react";
import { getMyMarks, type MarkRecord } from "../../services/studentApi";

// Grade helper
function getGrade(pct: number): string {
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B";
  if (pct >= 60) return "C";
  if (pct >= 50) return "D";
  return "F";
}

function gradeColor(grade: string): string {
  switch (grade) {
    case "A+":
      return "border border-green-200 bg-green-100 text-green-700";
    case "A":
      return "border border-blue-200 bg-blue-100 text-blue-700";
    case "B":
      return "border border-indigo-200 bg-indigo-100 text-indigo-700";
    case "C":
      return "border border-yellow-200 bg-yellow-100 text-yellow-700";
    case "D":
      return "border border-orange-200 bg-orange-100 text-orange-700";
    default:
      return "border border-red-200 bg-red-100 text-red-700";
  }
}

export function ViewMarks() {
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [filtered, setFiltered] = useState<MarkRecord[]>([]);
  const [selSubject, setSelSubject] = useState("All Subjects");
  const [selExam, setSelExam] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    avg: 0,
    highest: 0,
    lowest: 0,
    total: 0,
  });

  useEffect(() => {
    getMyMarks()
      .then((data) => {
        setMarks(data);
        setFiltered(data);
        calcStats(data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let f = marks;
    if (selSubject !== "All Subjects")
      f = f.filter((m) => m.subject === selSubject);
    if (selExam !== "All") f = f.filter((m) => m.exam === selExam);
    setFiltered(f);
    calcStats(f);
  }, [selSubject, selExam, marks]);

  function calcStats(data: MarkRecord[]) {
    if (!data.length) {
      setStats({ avg: 0, highest: 0, lowest: 0, total: 0 });
      return;
    }
    const pcts = data.map((m) => m.percentage);
    setStats({
      avg:
        Math.round((pcts.reduce((a, b) => a + b, 0) / pcts.length) * 10) / 10,
      highest: Math.round(Math.max(...pcts) * 10) / 10,
      lowest: Math.round(Math.min(...pcts) * 10) / 10,
      total: data.length,
    });
  }

  const subjects = [
    "All Subjects",
    ...Array.from(new Set(marks.map((m) => m.subject))),
  ];
  const examTypes = ["All", ...Array.from(new Set(marks.map((m) => m.exam)))];

  if (loading)
    return (
      <div className="flex min-h-[256px] items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="text-sm font-medium text-gray-500">Loading marks…</div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm sm:p-6">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
        <span>{error}</span>
      </div>
    );

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
            Marks & Results
            </h1>
            <p className="text-sm leading-6 text-gray-600 sm:text-base">
            View your examination performance
            </p>
          </div>
          <button
            onClick={() => alert("PDF download will be implemented here")}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.99] sm:w-auto"
          >
            <Download className="h-4 w-4" />
            Download Report
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Average",
            value: `${stats.avg}%`,
            sub: "Overall",
            icon: TrendingUp,
            color: "text-blue-600",
            iconBg: "bg-blue-50",
          },
          {
            label: "Highest",
            value: `${stats.highest}%`,
            sub: "Best",
            icon: Award,
            color: "text-green-600",
            iconBg: "bg-green-50",
          },
          {
            label: "Lowest",
            value: `${stats.lowest}%`,
            sub: "Needs work",
            icon: FileText,
            color: "text-orange-600",
            iconBg: "bg-orange-50",
          },
          {
            label: "Total Exams",
            value: String(stats.total),
            sub: "Completed",
            icon: FileText,
            color: "text-purple-600",
            iconBg: "bg-purple-50",
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <article
              key={s.label}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className={`rounded-lg p-2 ${s.iconBg}`}>
                  <Icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <span className="text-sm font-medium text-gray-600">{s.label}</span>
              </div>
              <p className="mb-1 text-2xl font-semibold tracking-tight text-gray-900">
                {s.value}
              </p>
              <p className={`text-xs font-medium ${s.color}`}>{s.sub}</p>
            </article>
          );
        })}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-900 sm:text-base">
            Filter Results
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-wide text-gray-500">
              Subject
            </label>
            <select
              value={selSubject}
              onChange={(e) => setSelSubject(e.target.value)}
              className="min-h-11 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              {subjects.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-wide text-gray-500">
              Exam Type
            </label>
            <select
              value={selExam}
              onChange={(e) => setSelExam(e.target.value)}
              className="min-h-11 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              {examTypes.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-4 py-4 sm:px-6">
          <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
            Detailed Marks
          </h2>
          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
            Showing {filtered.length} of {marks.length} results
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50/80">
              <tr>
                {["Subject", "Exam", "Marks", "Percentage", "Grade"].map(
                  (h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 sm:px-6"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length > 0 ? (
                filtered.map((m) => {
                  const grade = getGrade(m.percentage);
                  return (
                    <tr key={m.marksId} className="transition-colors hover:bg-gray-50/70">
                      <td className="whitespace-nowrap px-4 py-4 font-medium text-gray-900 sm:px-6">
                        {m.subject}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-gray-600 sm:px-6">
                        {m.exam}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-gray-900 sm:px-6">
                        {m.marksObtained}/{m.totalMarks}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-gray-900 sm:px-6">
                        {m.percentage}%
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${gradeColor(grade)}`}
                        >
                          {grade}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-sm text-gray-500 sm:px-6"
                  >
                    No marks found for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 text-base font-semibold text-gray-900 sm:text-lg">
          Subject-wise Performance
        </h2>
        <div className="space-y-3">
          {subjects
            .filter((s) => s !== "All Subjects")
            .map((subject) => {
              const sm = marks.filter((m) => m.subject === subject);
              if (!sm.length) return null;
              const avg = sm.reduce((s, m) => s + m.percentage, 0) / sm.length;
              const grade = getGrade(avg);
              return (
                <div
                  key={subject}
                  className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {subject}
                    </p>
                    <p className="text-xs text-gray-500">{sm.length} exam(s)</p>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Average</p>
                      <p className="text-sm font-medium text-gray-900">
                        {Math.round(avg * 10) / 10}%
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${gradeColor(grade)}`}
                    >
                      {grade}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </section>
    </div>
  );
}
