import React, { useState } from 'react';
import { User } from '../../App';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Calendar, 
  DollarSign, 
  Bell, 
  AlertCircle, 
  BarChart
} from 'lucide-react';
import { AdminDashboardOverview } from './AdminDashboardOverview';
import { ManageStudents } from './ManageStudents';
import { ManageTeachers } from './ManageTeachers';
import { ManageAttendanceMarks } from './ManageAttendanceMarks';
import { ManageFees } from './ManageFees';
import { ManageNoticeboard } from './ManageNoticeboard';
import { ManageComplaints } from './ManageComplaints';
import { DataReporting } from './DataReporting';
import { ResponsiveDashboard } from '../ResponsiveDashboard';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

type Page = 'dashboard' | 'students' | 'teachers' | 'attendance' | 'fees' | 'noticeboard' | 'complaints' | 'reports';

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const menuItems = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students' as Page, label: 'Students', icon: Users },
    { id: 'teachers' as Page, label: 'Teachers', icon: BookOpen },
    { id: 'attendance' as Page, label: 'Attendance', icon: Calendar },
    { id: 'fees' as Page, label: 'Fees', icon: DollarSign },
    { id: 'noticeboard' as Page, label: 'Noticeboard', icon: Bell },
    { id: 'complaints' as Page, label: 'Complaints', icon: AlertCircle },
    { id: 'reports' as Page, label: 'Reports', icon: BarChart }
  ];

  return (
    <ResponsiveDashboard
      user={user}
      onLogout={onLogout}
      menuItems={menuItems}
      currentPage={currentPage}
      onPageChange={(page) => setCurrentPage(page as Page)}
      roleColor="red"
      subtitle="Administrator"
    >
      {currentPage === 'dashboard' && <AdminDashboardOverview />}
      {currentPage === 'students' && <ManageStudents />}
      {currentPage === 'teachers' && <ManageTeachers />}
      {currentPage === 'attendance' && <ManageAttendanceMarks />}
      {currentPage === 'fees' && <ManageFees />}
      {currentPage === 'noticeboard' && <ManageNoticeboard />}
      {currentPage === 'complaints' && <ManageComplaints />}
      {currentPage === 'reports' && <DataReporting />}
    </ResponsiveDashboard>
  );
}