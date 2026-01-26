import React, { useState } from 'react';
import { User } from '../../App';
import { 
  LayoutDashboard, 
  TrendingUp, 
  DollarSign, 
  MessageSquare, 
  AlertCircle, 
  Bell
} from 'lucide-react';
import { ParentDashboardOverview } from './ParentDashboardOverview';
import { ChildProgress } from './ChildProgress';
import { FeeStatus } from './FeeStatus';
import { CommunicationHub } from './CommunicationHub';
import { BehaviourComplaints } from './BehaviourComplaints';
import { DigitalNoticeboard } from './DigitalNoticeboard';
import { ResponsiveDashboard } from '../ResponsiveDashboard';

interface ParentDashboardProps {
  user: User;
  onLogout: () => void;
}

type Page = 'dashboard' | 'progress' | 'fees' | 'communication' | 'behaviour' | 'notices';

export function ParentDashboard({ user, onLogout }: ParentDashboardProps) {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const menuItems = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'progress' as Page, label: "Child's Progress", icon: TrendingUp },
    { id: 'fees' as Page, label: 'Fee Status', icon: DollarSign },
    { id: 'communication' as Page, label: 'Messages', icon: MessageSquare },
    { id: 'behaviour' as Page, label: 'Behavior', icon: AlertCircle },
    { id: 'notices' as Page, label: 'Noticeboard', icon: Bell }
  ];

  return (
    <ResponsiveDashboard
      user={user}
      onLogout={onLogout}
      menuItems={menuItems}
      currentPage={currentPage}
      onPageChange={(page) => setCurrentPage(page as Page)}
      roleColor="green"
      subtitle="Parent Portal"
    >
      {currentPage === 'dashboard' && <ParentDashboardOverview />}
      {currentPage === 'progress' && <ChildProgress />}
      {currentPage === 'fees' && <FeeStatus />}
      {currentPage === 'communication' && <CommunicationHub />}
      {currentPage === 'behaviour' && <BehaviourComplaints />}
      {currentPage === 'notices' && <DigitalNoticeboard />}
    </ResponsiveDashboard>
  );
}