import React, { useState, useEffect } from "react";
import {
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  getMyAttendance,
  type AttendanceRecord,
} from "../../services/studentApi";

export function ViewAttendance() {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().substring(0, 7),
  );
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    percentage: 0,
  });
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const records = await getMyAttendance();
        setAttendance(records);

        const present = records.filter((a) => a.status === "Present").length;
        const absent = records.filter((a) => a.status === "Absent").length;
        const late = records.filter((a) => a.status === "Late").length;
        const total = records.length;
        const pct =
          total > 0 ? Math.round(((present + late) / total) * 100) : 0;
        setStats({ present, absent, late, percentage: pct });

        // Monthly trend (last 6 months)
        const map = new Map<
          string,
          { present: number; absent: number; late: number }
        >();
        records.forEach((a) => {
          const m = a.date.substring(0, 7);
          if (!map.has(m)) map.set(m, { present: 0, absent: 0, late: 0 });
          const d = map.get(m)!;
          if (a.status === "Present") d.present++;
          else if (a.status === "Absent") d.absent++;
          else d.late++;
        });
        const arr = Array.from(map.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-6)
          .map(([month, data]) => ({
            month: new Date(month + "-01").toLocaleDateString("en-US", {
              month: "short",
            }),
            ...data,
          }));
        setMonthlyData(arr);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Calendar helpers
  const getCalendarDays = () => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const days: { date: number | null; status: string; dateStr: string }[] = [];

    const startDow = firstDay.getDay() || 7; // Mon=1
    for (let i = 1; i < startDow; i++)
      days.push({ date: null, status: "empty", dateStr: "" });

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dow = new Date(year, month - 1, d).getDay();
      const isWeekend = dow === 0 || dow === 6;
      const isUpcoming = new Date(dateStr) > new Date();
      const rec = attendance.find((a) => a.date.startsWith(dateStr));
      let status = "no-data";
      if (isUpcoming) status = "upcoming";
      else if (isWeekend) status = "weekend";
      else if (rec) status = rec.status.toLowerCase();
      days.push({ date: d, status, dateStr });
    }
    return days;
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "present":
        return "bg-green-500 text-white";
      case "absent":
        return "bg-red-500 text-white";
      case "late":
        return "bg-yellow-500 text-white";
      case "weekend":
        return "bg-gray-200 text-gray-500";
      case "upcoming":
        return "bg-blue-50 text-blue-400";
      default:
        return "bg-gray-100 text-gray-400";
    }
  };

  if (loading)
    return (
      <div className="flex min-h-[256px] items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="text-sm font-medium text-gray-500">
          Loading attendance…
        </div>
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
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
          Attendance Overview
        </h1>
        <p className="mt-2 text-sm leading-6 text-gray-600 sm:text-base">
          Track your attendance record and trends
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Attendance Rate",
            value: `${stats.percentage}%`,
            sub: stats.percentage >= 75 ? "Good standing" : "Below minimum",
            icon: TrendingUp,
            color: "text-blue-600",
            iconBg: "bg-blue-50",
            subColor:
              stats.percentage >= 75 ? "text-green-600" : "text-red-600",
          },
          {
            label: "Total Present",
            value: `${stats.present} days`,
            sub: "Including on-time",
            icon: CheckCircle,
            color: "text-green-600",
            iconBg: "bg-green-50",
            subColor: "text-green-600",
          },
          {
            label: "Total Absent",
            value: `${stats.absent} days`,
            sub: "Unauthorized",
            icon: XCircle,
            color: "text-red-600",
            iconBg: "bg-red-50",
            subColor: "text-red-600",
          },
          {
            label: "Late Arrivals",
            value: `${stats.late} days`,
            sub: "Arrived late",
            icon: Clock,
            color: "text-yellow-600",
            iconBg: "bg-yellow-50",
            subColor: "text-yellow-600",
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
              <p className={`text-xs font-medium ${s.subColor}`}>{s.sub}</p>
            </article>
          );
        })}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
              Monthly Calendar
            </h2>
          </div>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            max={new Date().toISOString().substring(0, 7)}
            className="min-h-11 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:w-auto sm:px-5"
          />
        </div>

        <div className="mb-3 grid grid-cols-7 gap-1 sm:gap-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div
              key={d}
              className="py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-500 sm:text-xs"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {getCalendarDays().map((day, i) => (
            <div
              key={i}
              title={day.dateStr ? `${day.dateStr}: ${day.status}` : ""}
              className={`aspect-square flex items-center justify-center rounded-lg border border-transparent text-xs font-medium shadow-sm ${
                day.date ? statusColor(day.status) : ""
              }`}
            >
              {day.date ?? ""}
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs sm:gap-6">
          {[
            { color: "bg-green-500", label: "Present" },
            { color: "bg-red-500", label: "Absent" },
            { color: "bg-yellow-500", label: "Late" },
            { color: "bg-gray-200", label: "Weekend" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className={`h-3 w-3 rounded ${l.color}`} />
              <span className="text-gray-600">{l.label}</span>
            </div>
          ))}
        </div>
      </section>

      {monthlyData.length > 0 && (
        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
              Attendance Trends (Last 6 Months)
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" fill="#10b981" name="Present" />
              <Bar dataKey="absent" fill="#ef4444" name="Absent" />
              <Bar dataKey="late" fill="#f59e0b" name="Late" />
            </BarChart>
          </ResponsiveContainer>
        </section>
      )}
    </div>
  );
}
