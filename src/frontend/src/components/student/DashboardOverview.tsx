import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  Calendar,
  FileText,
  DollarSign,
  Award,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  getMyProfile,
  getMyAttendance,
  getMyMarks,
  getMyFees,
  getMyAchievements,
  getNoticesForStudent,
  type StudentProfile,
  type FeeRecord,
  type NoticeRecord,
} from "../../services/studentApi";

export function DashboardOverview() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [attPct, setAttPct] = useState<number>(0);
  const [avgMark, setAvgMark] = useState<number>(0);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [achCount, setAchCount] = useState<number>(0);
  const [notices, setNotices] = useState<NoticeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [prof, att, mrks, feeList, ach, ntc] = await Promise.all([
          getMyProfile(),
          getMyAttendance(),
          getMyMarks(),
          getMyFees(),
          getMyAchievements(),
          getNoticesForStudent(),
        ]);

        setProfile(prof);

        // Attendance %
        const total = att.length;
        const present = att.filter((a) => a.status === "Present").length;
        const late = att.filter((a) => a.status === "Late").length;
        setAttPct(total > 0 ? Math.round(((present + late) / total) * 100) : 0);

        // Average marks
        if (mrks.length > 0) {
          const avg = mrks.reduce((s, m) => s + m.percentage, 0) / mrks.length;
          setAvgMark(Math.round(avg * 10) / 10);
        }

        setFees(feeList);
        setAchCount(ach.length);
        // Show active notices only, latest 3
        setNotices(ntc.filter((n) => n.isActive).slice(0, 3));
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const pendingFees = fees.filter(
    (f) => f.status === "Unpaid" || f.status === "Overdue",
  );
  const totalDue = pendingFees.reduce(
    (s, f) => s + (f.totalAmount - f.paidAmount),
    0,
  );

  if (loading) {
    return (
      <div className="flex min-h-[256px] items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="text-sm font-medium text-gray-500">
          Loading dashboard…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm sm:p-6">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
        <span>{error}</span>
      </div>
    );
  }

  const stats = [
    {
      label: "Attendance Rate",
      value: `${attPct}%`,
      sub: attPct >= 75 ? "Good standing" : "Below minimum",
      icon: Calendar,
      color: "text-blue-500",
      subColor: attPct >= 75 ? "text-green-600" : "text-red-600",
    },
    {
      label: "Average Score",
      value: `${avgMark}%`,
      sub: "Overall performance",
      icon: TrendingUp,
      color: "text-green-500",
      subColor: "text-green-600",
    },
    {
      label: "Pending Fees",
      value:
        pendingFees.length > 0 ? `PKR ${totalDue.toLocaleString()}` : "Paid",
      sub:
        pendingFees.length > 0 ? `${pendingFees.length} pending` : "All clear",
      icon: DollarSign,
      color: pendingFees.length > 0 ? "text-red-500" : "text-green-500",
      subColor: pendingFees.length > 0 ? "text-red-600" : "text-green-600",
    },
    {
      label: "Achievements",
      value: String(achCount),
      sub: "Total earned",
      icon: Award,
      color: "text-yellow-500",
      subColor: "text-yellow-600",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 p-5 text-white shadow-sm sm:p-6">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Welcome back, {profile?.firstName} {profile?.lastName} 
        </h1>
        <p className="mt-2 text-sm text-blue-100 sm:text-base">
          Class {profile?.class}-{profile?.section} &nbsp;|&nbsp; Roll No:{" "}
          {profile?.rollNumber}
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <article
              key={s.label}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-gray-50 p-2">
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

      {pendingFees.length > 0 && (
        <section className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-sm">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div>
            <p className="font-semibold">Fee Payment Pending</p>
            <p className="mt-1 text-red-700">
              You have {pendingFees.length} unpaid fee(s) totalling PKR{" "}
              {totalDue.toLocaleString()}. Please visit the Fees section.
            </p>
          </div>
        </section>
      )}

      {attPct > 0 && attPct < 75 && (
        <section className="flex items-start gap-3 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 shadow-sm">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
          <div>
            <p className="font-semibold">Low Attendance Warning</p>
            <p className="mt-1 text-yellow-700">
              Your attendance is {attPct}%. Minimum 75% required for
              examinations.
            </p>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-lg bg-blue-50 p-2">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
            Latest Notices
          </h2>
        </div>
        {notices.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
            No active notices.
          </div>
        ) : (
          <ul className="space-y-3">
            {notices.map((n) => (
              <li
                key={n.noticeId}
                className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4"
              >
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{n.title}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(n.postedAt).toLocaleDateString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
