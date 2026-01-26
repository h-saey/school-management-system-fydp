import React, { useState } from 'react';
import { User } from '../../App';
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  Award, 
  Bell, 
  MessageSquare, 
  AlertCircle
} from 'lucide-react';
import { TeacherDashboardOverview } from './TeacherDashboardOverview';
import { MarkAttendance } from './MarkAttendance';
import { EnterMarks } from './EnterMarks';
import { UploadCertificates } from './UploadCertificates';
import { PostAnnouncements } from './PostAnnouncements';
import { ParentMessages } from './ParentMessages';
import { ComplaintManagement } from './ComplaintManagement';
import { ResponsiveDashboard } from '../ResponsiveDashboard';

interface TeacherDashboardProps {
  user: User;
  onLogout: () => void;
}

type Page = 'dashboard' | 'attendance' | 'marks' | 'certificates' | 'announcements' | 'messages' | 'complaints';

export function TeacherDashboard({ user, onLogout }: TeacherDashboardProps) {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const menuItems = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance' as Page, label: 'Attendance', icon: Calendar },
    { id: 'marks' as Page, label: 'Enter Marks', icon: FileText },
    { id: 'certificates' as Page, label: 'Certificates', icon: Award },
    { id: 'announcements' as Page, label: 'Announcements', icon: Bell },
    { id: 'messages' as Page, label: 'Messages', icon: MessageSquare },
    { id: 'complaints' as Page, label: 'Complaints', icon: AlertCircle }
  ];

  return (
    <ResponsiveDashboard
      user={user}
      onLogout={onLogout}
      menuItems={menuItems}
      currentPage={currentPage}
      onPageChange={(page) => setCurrentPage(page as Page)}
      roleColor="purple"
      subtitle="Teacher Portal"
    >
      {currentPage === 'dashboard' && <TeacherDashboardOverview />}
      {currentPage === 'attendance' && <MarkAttendance />}
      {currentPage === 'marks' && <EnterMarks />}
      {currentPage === 'certificates' && <UploadCertificates />}
      {currentPage === 'announcements' && <PostAnnouncements />}
      {currentPage === 'messages' && <ParentMessages />}
      {currentPage === 'complaints' && <ComplaintManagement />}
    </ResponsiveDashboard>
  );
}