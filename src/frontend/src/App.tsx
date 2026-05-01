import React from "react";
import { Login } from "./components/Login";
import { StudentDashboard } from "./components/student/StudentDashboard";
import { ParentDashboard } from "./components/parent/ParentDashboard";
import { TeacherDashboard } from "./components/teacher/TeacherDashboard";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { AppProvider, useApp } from "./contexts/AppContext";
import { Toaster } from "sonner";
import { AIWidget } from "./components/ai/AIWidget";

export type UserRole = "student" | "parent" | "teacher" | "admin";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

function AppContent() {
  const { currentUser, isAuthenticated, logout } = useApp();

  if (!isAuthenticated || !currentUser) {
    return <Login />;
  }

  return (
    // ✅ NO overflow-hidden here — that clips fixed children
    <div className="min-h-screen bg-gray-50">
      {currentUser.role === "student" && (
        <StudentDashboard user={currentUser} onLogout={logout} />
      )}
      {currentUser.role === "parent" && (
        <ParentDashboard user={currentUser} onLogout={logout} />
      )}
      {currentUser.role === "teacher" && (
        <TeacherDashboard user={currentUser} onLogout={logout} />
      )}
      {currentUser.role === "admin" && (
        <AdminDashboard user={currentUser} onLogout={logout} />
      )}

      {/* ✅ AIWidget placed here — sibling of dashboards, not inside them */}
      {/* Visible for ALL roles automatically */}
      <AIWidget userRole={currentUser.role} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
      <Toaster position="top-right" richColors />
    </AppProvider>
  );
}
