import React, { useState } from "react";
import { User } from "../../App";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Award,
  MessageSquare,
  Bell,
  DollarSign,
} from "lucide-react";
import { DashboardOverview } from "./DashboardOverview";
import { ViewAttendance } from "./ViewAttendance";
import { ViewMarks } from "./ViewMarks";
import { StudentPortfolio } from "./StudentPortfolio";
import { ComplaintSubmission } from "./ComplaintSubmission";
import { Notifications } from "./Notifications";
import { FeeStatus } from "./FeeStatus";
import { ResponsiveDashboard } from "../ResponsiveDashboard";

// interface User {
//   id: number;
//   username: string;
//   email: string;
//   role: string;
// }

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
}

type Page =
  | "dashboard"
  | "attendance"
  | "marks"
  | "portfolio"
  | "complaints"
  | "notifications"
  | "fees";

export function StudentDashboard({ user, onLogout }: StudentDashboardProps) {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");

  const menuItems = [
    { id: "dashboard" as Page, label: "Dashboard", icon: LayoutDashboard },
    { id: "attendance" as Page, label: "Attendance", icon: Calendar },
    { id: "marks" as Page, label: "Marks", icon: FileText },
    { id: "fees" as Page, label: "Fees", icon: DollarSign },
    { id: "portfolio" as Page, label: "Portfolio", icon: Award },
    { id: "complaints" as Page, label: "Complaints", icon: MessageSquare },
    { id: "notifications" as Page, label: "Notifications", icon: Bell },
  ];

  return (
    <ResponsiveDashboard
      user={user}
      onLogout={onLogout}
      menuItems={menuItems}
      currentPage={currentPage}
      onPageChange={(page) => setCurrentPage(page as Page)}
      roleColor="blue"
      subtitle="Student Portal"
    >
      {currentPage === "dashboard" && <DashboardOverview />}
      {currentPage === "attendance" && <ViewAttendance />}
      {currentPage === "marks" && <ViewMarks />}
      {currentPage === "fees" && <FeeStatus />}
      {currentPage === "portfolio" && <StudentPortfolio />}
      {currentPage === "complaints" && <ComplaintSubmission />}
      {currentPage === "notifications" && <Notifications />}
    </ResponsiveDashboard>
  );
}
// import React, { useState } from 'react';
// import { User } from '../../App';
// import {
//   LayoutDashboard,
//   Calendar,
//   FileText,
//   Award,
//   MessageSquare,
//   Bell
// } from 'lucide-react';
// import { DashboardOverview } from './DashboardOverview';
// import { ViewAttendance } from './ViewAttendance';
// import { ViewMarks } from './ViewMarks';
// import { StudentPortfolio } from './StudentPortfolio';
// import { ComplaintSubmission } from './ComplaintSubmission';
// import { Notifications } from './Notifications';
// import { ResponsiveDashboard } from '../ResponsiveDashboard';

// interface StudentDashboardProps {
//   user: User;
//   onLogout: () => void;
// }

// type Page = 'dashboard' | 'attendance' | 'marks' | 'portfolio' | 'complaints' | 'notifications';

// export function StudentDashboard({ user, onLogout }: StudentDashboardProps) {
//   const [currentPage, setCurrentPage] = useState<Page>('dashboard');

//   const menuItems = [
//     { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
//     { id: 'attendance' as Page, label: 'Attendance', icon: Calendar },
//     { id: 'marks' as Page, label: 'Marks', icon: FileText },
//     { id: 'portfolio' as Page, label: 'Portfolio', icon: Award },
//     { id: 'complaints' as Page, label: 'Complaints', icon: MessageSquare },
//     { id: 'notifications' as Page, label: 'Notifications', icon: Bell }
//   ];

//   return (
//     <ResponsiveDashboard
//       user={user}
//       onLogout={onLogout}
//       menuItems={menuItems}
//       currentPage={currentPage}
//       onPageChange={(page) => setCurrentPage(page as Page)}
//       roleColor="blue"
//       subtitle="Class 10-A"
//     >
//       {currentPage === 'dashboard' && <DashboardOverview />}
//       {currentPage === 'attendance' && <ViewAttendance />}
//       {currentPage === 'marks' && <ViewMarks />}
//       {currentPage === 'portfolio' && <StudentPortfolio />}
//       {currentPage === 'complaints' && <ComplaintSubmission />}
//       {currentPage === 'notifications' && <Notifications />}
//     </ResponsiveDashboard>
//   );
// }
