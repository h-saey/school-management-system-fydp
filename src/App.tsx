import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { StudentDashboard } from './components/student/StudentDashboard';
import { ParentDashboard } from './components/parent/ParentDashboard';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AppProvider, useApp } from './contexts/AppContext';
import { Toaster } from 'sonner';

export type UserRole = 'student' | 'parent' | 'teacher' | 'admin';

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
    <div className="min-h-screen bg-gray-50">
      {currentUser.role === 'student' && <StudentDashboard user={currentUser} onLogout={logout} />}
      {currentUser.role === 'parent' && <ParentDashboard user={currentUser} onLogout={logout} />}
      {currentUser.role === 'teacher' && <TeacherDashboard user={currentUser} onLogout={logout} />}
      {currentUser.role === 'admin' && <AdminDashboard user={currentUser} onLogout={logout} />}
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