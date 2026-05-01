// FILE: src/components/teacher/TeacherDashboardOverview.tsx
// ACTION: REPLACE existing file entirely

import React, { useEffect, useState } from "react";
import {
  Users,
  Calendar,
  FileText,
  AlertCircle,
  Award,
  Bell,
  TrendingUp,
  BookOpen,
} from "lucide-react";
import { fetchDashboardStats, DashboardStats } from "../../services/teacherApi";

export function TeacherDashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 h-28" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
        <p className="font-medium">Failed to load dashboard</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Students",
      value: stats?.totalStudents ?? 0,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      label: "Today's Attendance",
      value: stats?.todayAttendance ?? 0,
      icon: Calendar,
      color: "bg-green-500",
    },
    {
      label: "Pending Complaints",
      value: stats?.pendingComplaints ?? 0,
      icon: AlertCircle,
      color: "bg-yellow-500",
    },
    {
      label: "Active Notices",
      value: stats?.activeNotices ?? 0,
      icon: Bell,
      color: "bg-purple-500",
    },
  ];

  const subjectList = stats?.assignedSubjects
    ? stats.assignedSubjects.split(",").map((s) => s.trim())
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-1">
          Welcome, {stats?.firstName} {stats?.lastName}
        </h1>
        <p className="text-gray-600">Here's your teaching overview for today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6">
              <div
                className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-gray-600 text-sm mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
          <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center">
            <Award className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.achievementsAdded ?? 0}
            </p>
            <p className="text-gray-600 text-sm">Achievements Recorded</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
          <div className="bg-pink-100 w-12 h-12 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.behaviorRemarks ?? 0}
            </p>
            <p className="text-gray-600 text-sm">Behavior Remarks Added</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
          <div className="bg-teal-100 w-12 h-12 rounded-lg flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {subjectList.length || "—"}
            </p>
            <p className="text-gray-600 text-sm">Assigned Subjects</p>
          </div>
        </div>
      </div>

      {/* Assigned Subjects */}
      {subjectList.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-purple-600" />
            <h2 className="text-gray-900 font-semibold">
              My Assigned Subjects
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {subjectList.map((subject, i) => (
              <span
                key={i}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
              >
                {subject}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-lg">
        <h3 className="text-gray-900 font-semibold mb-3">📋 Quick Reminders</h3>
        <div className="space-y-2 text-gray-700 text-sm">
          <p>• Mark today's attendance from the Attendance section.</p>
          <p>• Check the Complaints tab for pending student issues.</p>
          <p>• Upload student achievements under the Certificates section.</p>
          <p>• Post announcements using the Announcements tab.</p>
        </div>
      </div>
    </div>
  );
}
