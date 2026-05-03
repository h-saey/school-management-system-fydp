import React, { useState } from "react";
import { User } from "../../App";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  DollarSign,
  Bell,
  AlertCircle,
  BarChart,
  ShieldCheck,
  Heart,
  FileText,
} from "lucide-react";
import { AdminDashboardOverview } from "./AdminDashboardOverview";
import { ManageStudents } from "./ManageStudents";
import { ManageTeachers } from "./ManageTeachers";
import { ManageParents } from "./ManageParents";
import { ManageUsers } from "./ManageUsers";
import { ManageAttendanceMarks } from "./ManageAttendanceMarks";
import { ManageFees } from "./ManageFees";
import { ManageNoticeboard } from "./ManageNoticeboard";
import { ManageComplaints } from "./ManageComplaints";
import { DataReporting } from "./DataReporting";
import { AuditLogViewer } from "./AuditLogViewer";
import { ResponsiveDashboard } from "../ResponsiveDashboard";
import { NotificationBell } from "../NotificationBell";

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

type Page =
  | "dashboard"
  | "students"
  | "teachers"
  | "parents"
  | "users"
  | "attendance/marks"
  | "fees"
  | "noticeboard"
  | "complaints"
  | "reports"
  | "auditlogs";

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");

  const menuItems = [
    { id: "dashboard" as Page, label: "Dashboard", icon: LayoutDashboard },
    { id: "students" as Page, label: "Students", icon: Users },
    { id: "teachers" as Page, label: "Teachers", icon: BookOpen },
    { id: "parents" as Page, label: "Parents", icon: Heart },
    { id: "users" as Page, label: "Users", icon: ShieldCheck },
    {
      id: "attendance/marks" as Page,
      label: "Attendance & Marks",
      icon: Calendar,
    },
    { id: "fees" as Page, label: "Fees", icon: DollarSign },
    { id: "noticeboard" as Page, label: "Noticeboard", icon: Bell },
    { id: "complaints" as Page, label: "Complaints", icon: AlertCircle },
    { id: "reports" as Page, label: "Reports", icon: BarChart },
    { id: "auditlogs" as Page, label: "Audit Logs", icon: FileText },
  ];

  return (
    <>
      <ResponsiveDashboard
        user={user}
        onLogout={onLogout}
        menuItems={menuItems}
        currentPage={currentPage}
        onPageChange={(page) => setCurrentPage(page as Page)}
        roleColor="red"
        subtitle="Administrator"
      >
        {currentPage === "dashboard" && <AdminDashboardOverview />}
        {currentPage === "students" && <ManageStudents />}
        {currentPage === "teachers" && <ManageTeachers />}
        {currentPage === "parents" && <ManageParents />}
        {currentPage === "users" && <ManageUsers />}
        {currentPage === "attendance/marks" && <ManageAttendanceMarks />}
        {currentPage === "fees" && <ManageFees />}
        {currentPage === "noticeboard" && <ManageNoticeboard />}
        {currentPage === "complaints" && <ManageComplaints />}
        {currentPage === "reports" && <DataReporting />}
        {currentPage === "auditlogs" && <AuditLogViewer />}
      </ResponsiveDashboard>
    </>
  );
}
// import React, { useState } from "react";
// import { User } from "../../App";
// import {
//   LayoutDashboard,
//   Users,
//   BookOpen,
//   Calendar,
//   DollarSign,
//   Bell,
//   AlertCircle,
//   BarChart,
//   ShieldCheck,
//   Heart,
// } from "lucide-react";
// import { AdminDashboardOverview } from "./AdminDashboardOverview";
// import { ManageStudents } from "./ManageStudents";
// import { ManageTeachers } from "./ManageTeachers";
// import { ManageParents } from "./ManageParents";
// import { ManageUsers } from "./ManageUsers";
// import { ManageAttendanceMarks } from "./ManageAttendanceMarks";
// import { ManageFees } from "./ManageFees";
// import { ManageNoticeboard } from "./ManageNoticeboard";
// import { ManageComplaints } from "./ManageComplaints";
// import { DataReporting } from "./DataReporting";
// import { ResponsiveDashboard } from "../ResponsiveDashboard";
// import { AIWidget } from "../ai/AIWidget";

// interface AdminDashboardProps {
//   user: User;
//   onLogout: () => void;
// }

// type Page =
//   | "dashboard"
//   | "students"
//   | "teachers"
//   | "parents"
//   | "users"
//   | "attendance/marks"
//   | "fees"
//   | "noticeboard"
//   | "complaints"
//   | "reports";

// export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
//   const [currentPage, setCurrentPage] = useState<Page>("dashboard");

//   const menuItems = [
//     { id: "dashboard" as Page, label: "Dashboard", icon: LayoutDashboard },
//     { id: "students" as Page, label: "Students", icon: Users },
//     { id: "teachers" as Page, label: "Teachers", icon: BookOpen },
//     { id: "parents" as Page, label: "Parents", icon: Heart },
//     { id: "users" as Page, label: "Users", icon: ShieldCheck },
//     {
//       id: "attendance/marks" as Page,
//       label: "Attendance & Marks",
//       icon: Calendar,
//     },
//     { id: "fees" as Page, label: "Fees", icon: DollarSign },
//     { id: "noticeboard" as Page, label: "Noticeboard", icon: Bell },
//     { id: "complaints" as Page, label: "Complaints", icon: AlertCircle },
//     { id: "reports" as Page, label: "Reports", icon: BarChart },
//   ];

//   return (
//     <>
//       <ResponsiveDashboard
//         user={user}
//         onLogout={onLogout}
//         menuItems={menuItems}
//         currentPage={currentPage}
//         onPageChange={(page) => setCurrentPage(page as Page)}
//         roleColor="red"
//         subtitle="Administrator"
//       >
//         {currentPage === "dashboard" && <AdminDashboardOverview />}
//         {currentPage === "students" && <ManageStudents />}
//         {currentPage === "teachers" && <ManageTeachers />}
//         {currentPage === "parents" && <ManageParents />}
//         {currentPage === "users" && <ManageUsers />}
//         {currentPage === "attendance/marks" && <ManageAttendanceMarks />}
//         {currentPage === "fees" && <ManageFees />}
//         {currentPage === "noticeboard" && <ManageNoticeboard />}
//         {currentPage === "complaints" && <ManageComplaints />}
//         {currentPage === "reports" && <DataReporting />}
//       </ResponsiveDashboard>

//       {/* AI Widget — floats over all pages */}
//       {/*<AIWidget />*/}
//     </>
//   );
// }
