import React, { useState, useEffect } from "react";
import {
  FileText,
  Calendar,
  Download,
  Trophy,
  AlertCircle,
} from "lucide-react";

import {
  getMyPortfolio,
  getMyMarks,
  getMyAttendance,
  getMyAchievements,
  type PortfolioRecord,
  type MarkRecord,
  type AttendanceRecord,
  type AchievementRecord,
} from "../../services/studentApi";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import jsPDF from "jspdf";
import * as htmlToImage from "html-to-image";

type Tab = "academics" | "attendance" | "achievements" | "portfolio";

const COLORS = {
  primary: "#2563eb",
  green: "#16a34a",
  red: "#dc2626",
  yellow: "#f59e0b",
  gray: "#6b7280",
  light: "#f8fafc",
};

export function StudentPortfolio() {
  const [activeTab, setActiveTab] = useState<Tab>("academics");
  const [portfolio, setPortfolio] = useState<PortfolioRecord | null>(null);
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [att, setAtt] = useState<AttendanceRecord[]>([]);
  const [ach, setAch] = useState<AchievementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const chartRef1 = React.useRef<HTMLDivElement>(null);
  const chartRef2 = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const [m, a, ac, pf] = await Promise.all([
          getMyMarks(),
          getMyAttendance(),
          getMyAchievements(),
          getMyPortfolio(),
        ]);
        setMarks(m);
        setAtt(a);
        setAch(ac);
        setPortfolio(pf);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ================= DERIVED DATA =================
  const total = att.length;
  const present = att.filter((a) => a.status === "Present").length;
  const absent = att.filter((a) => a.status === "Absent").length;
  const late = att.filter((a) => a.status === "Late").length;
  const attPct = total ? Math.round(((present + late) / total) * 100) : 0;

  const avgMarks =
    marks.length > 0
      ? Math.round(marks.reduce((a, b) => a + b.percentage, 0) / marks.length)
      : 0;

  const subjectMap = marks.reduce<Record<string, number[]>>((acc, m) => {
    if (!acc[m.subject]) acc[m.subject] = [];
    acc[m.subject].push(m.percentage);
    return acc;
  }, {});

  const subjectChartData = Object.entries(subjectMap).map(([s, p]) => ({
    subject: s,
    average: Math.round(p.reduce((a, b) => a + b, 0) / p.length),
  }));

  const attendanceChartData = [
    { name: "Present", value: present },
    { name: "Absent", value: absent },
    { name: "Late", value: late },
  ];

  // ================= PDF EXPORT (NO html2canvas) =================
  // const handleExportPDF = async () => {
  //   const pdf = new jsPDF("p", "mm", "a4");

  //   // ===== HEADER =====
  //   pdf.setFont("helvetica", "bold");
  //   pdf.setFontSize(18);
  //   pdf.text("Student Portfolio Report", 15, 20);

  //   pdf.setFontSize(11);
  //   pdf.setFont("helvetica", "normal");
  //   pdf.text(`Attendance: ${attPct}%`, 15, 30);
  //   pdf.text(`Average Marks: ${avgMarks}%`, 15, 37);
  //   pdf.text(`Achievements: ${ach.length}`, 15, 44);

  //   // ===== CHART 1 =====
  //   if (chartRef1.current) {
  //     const img1 = await htmlToImage.toPng(chartRef1.current);
  //     pdf.addImage(img1, "PNG", 15, 55, 180, 60);
  //   }

  //   // ===== PAGE BREAK =====
  //   pdf.addPage();

  //   // ===== ATTENDANCE PIE CHART =====
  //   if (chartRef2.current) {
  //     const img2 = await htmlToImage.toPng(chartRef2.current);
  //     pdf.text("Attendance Breakdown", 15, 20);
  //     pdf.addImage(img2, "PNG", 15, 30, 180, 80);
  //   }

  //   // ===== SUMMARY PAGE =====
  //   pdf.addPage();

  //   pdf.text("Performance Summary", 15, 20);

  //   pdf.text(portfolio?.attendanceSummary || "No attendance data", 15, 35);
  //   pdf.text(portfolio?.marksSummary || "", 15, 50);
  //   pdf.text(portfolio?.achievementsSummary || "", 15, 70);
  //   pdf.text(portfolio?.behaviorSummary || "", 15, 90);

  //   pdf.save("Student_Portfolio.pdf");
  // };
  const handleExportPDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");

    const W = 210;
    const H = 297;
    const margin = 14;
    const contentW = W - margin * 2;

    let y = 0;

    // ================= HELPERS =================
    const line = (color = [220, 220, 220]) => {
      pdf.setDrawColor(color[0], color[1], color[2]);
      pdf.line(margin, y, W - margin, y);
      y += 6;
    };

    const sectionTitle = (text: string) => {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(13);
      pdf.setTextColor(30, 41, 59);

      pdf.text(text, margin, y);
      y += 6;

      pdf.setDrawColor(226, 232, 240);
      pdf.line(margin, y, W - margin, y);
      y += 8;
    };

    const textBlock = (text: string) => {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(71, 85, 105);

      const lines = pdf.splitTextToSize(text || "No data available", contentW);
      pdf.text(lines, margin, y);
      y += lines.length * 5 + 4;
    };

    const kpiCard = (
      x: number,
      y0: number,
      title: string,
      value: string,
      color: number[],
    ) => {
      pdf.setFillColor(color[0], color[1], color[2]);
      pdf.roundedRect(x, y0, 42, 22, 2, 2, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.text(title, x + 3, y0 + 7);

      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text(value, x + 3, y0 + 16);
    };

    // ================= HEADER =================
    pdf.setFillColor(37, 99, 235);
    pdf.rect(0, 0, W, 38, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text("STUDENT PORTFOLIO REPORT", margin, 18);

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text("Academic Performance & Progress Evaluation", margin, 26);

    pdf.setTextColor(255, 255, 255);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 140, 26);

    // ================= KPI SECTION =================
    y = 50;

    const rowY = y;

    kpiCard(margin, rowY, "Attendance", `${attPct}%`, [37, 99, 235]);
    kpiCard(margin + 46, rowY, "Avg Marks", `${avgMarks}%`, [22, 163, 74]);
    kpiCard(margin + 92, rowY, "Achievements", `${ach.length}`, [245, 158, 11]);
    kpiCard(
      margin + 138,
      rowY,
      "Risk Level",
      attPct > 75 ? "Good" : "Low",
      attPct > 75 ? [16, 185, 129] : [239, 68, 68],
    );

    y = rowY + 32;

    // ================= PAGE 1 CONTENT =================
    sectionTitle("ACADEMIC PERFORMANCE SUMMARY");
    textBlock(portfolio?.marksSummary || "");

    sectionTitle("ATTENDANCE REPORT");
    textBlock(portfolio?.attendanceSummary || "");

    // ================= PAGE BREAK =================
    pdf.addPage();
    y = 20;

    // ================= PAGE 2 =================
    sectionTitle("ACHIEVEMENTS OVERVIEW");
    textBlock(portfolio?.achievementsSummary || "");

    sectionTitle("BEHAVIOR & REMARKS");
    textBlock(portfolio?.behaviorSummary || "");

    // ================= ACADEMIC STATUS BOX =================
    pdf.setFillColor(248, 250, 252);
    pdf.roundedRect(margin, y, contentW, 28, 3, 3, "F");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(30, 41, 59);
    pdf.text("ACADEMIC STATUS", margin + 4, y + 8);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);

    const status =
      attPct >= 75 ? "Eligible for Promotion" : "Needs Improvement";

    pdf.text(`Status: ${status}`, margin + 4, y + 18);
    pdf.text(
      `Attendance: ${attPct}% | Average: ${avgMarks}%`,
      margin + 4,
      y + 24,
    );

    y += 40;

    // ================= PAGE 3 (RESUME STYLE SUMMARY) =================
    pdf.addPage();

    pdf.setFillColor(240, 249, 255);
    pdf.rect(0, 0, W, H, "F");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.setTextColor(37, 99, 235);
    pdf.text("STUDENT PROFILE SUMMARY", margin, 25);

    const boxes = [
      `Attendance Rate: ${attPct}%`,
      `Average Marks: ${avgMarks}%`,
      `Total Achievements: ${ach.length}`,
      `Academic Standing: ${attPct > 75 ? "Good Standing" : "At Risk"}`,
    ];

    let boxY = 45;

    boxes.forEach((b) => {
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(margin, boxY, contentW, 16, 2, 2, "F");

      pdf.setTextColor(30, 41, 59);
      pdf.setFontSize(11);
      pdf.text(b, margin + 6, boxY + 10);

      boxY += 22;
    });

    // ================= FOOTER =================
    pdf.setFontSize(9);
    pdf.setTextColor(100, 116, 139);
    pdf.text(
      "Generated by Student Management System • Confidential Academic Report",
      margin,
      285,
    );

    pdf.save("Student_Portfolio_Report.pdf");
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  if (error)
    return (
      <div className="p-6 bg-red-50 text-red-700">
        <AlertCircle className="inline mr-2" />
        {error}
      </div>
    );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between">
        <h1 className="text-xl font-bold">Student Portfolio</h1>

        <button
          onClick={handleExportPDF}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.99]"
        >
          <Download className="h-4 w-4" />
          Export PDF
        </button>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card
          title="Attendance"
          value={`${attPct}%`}
          icon={<Calendar className="w-5 h-5" />}
          color="bg-blue-500"
        />

        <Card
          title="Avg Marks"
          value={`${avgMarks}%`}
          icon={<FileText className="w-5 h-5" />}
          color="bg-green-500"
        />

        <Card
          title="Achievements"
          value={ach.length}
          icon={<Trophy className="w-5 h-5" />}
          color="bg-yellow-500"
        />

        <Card
          title="Remarks"
          value={portfolio?.behaviorSummary ?? "0"}
          icon={<AlertCircle className="w-5 h-5" />}
          color="bg-red-500"
        />
      </div>

      {/* CHARTS (IMPORTANT: REF FOR PDF) */}
      <div className="grid md:grid-cols-2 gap-6">
        <div ref={chartRef1} className="bg-white p-4 rounded">
          <h3>Marks by Subject</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={subjectChartData}>
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="average" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div ref={chartRef2} className="bg-white p-4 rounded">
          <h3>Attendance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={attendanceChartData} dataKey="value" label>
                {attendanceChartData.map((_, i) => (
                  <Cell key={i} fill={["#22c55e", "#ef4444", "#f59e0b"][i]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SUMMARY */}
      {portfolio && (
        <div className="space-y-3">
          <div className="bg-white p-4 rounded">
            <h3>Attendance</h3>
            <p>{portfolio.attendanceSummary}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ================= UI COMPONENTS =================
function Card({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: any;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition">
      {/* ICON BOX */}
      <div
        className={`w-10 h-10 flex items-center justify-center rounded-lg text-white ${color}`}
      >
        {icon}
      </div>

      {/* TEXT */}
      <div>
        <p className="text-gray-500 text-xs">{title}</p>
        <p className="text-lg font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

// import React, { useState } from "react";
// import {
//   Award,
//   FileText,
//   Calendar,
//   Download,
//   Trophy,
//   Star,
//   Medal,
// } from "lucide-react";

// export function StudentPortfolio() {
//   const [activeTab, setActiveTab] = useState<
//     "academics" | "attendance" | "certificates" | "achievements"
//   >("academics");

//   const academicRecords = [
//     { year: "2024-25", class: "Class 10", percentage: "84.8%", rank: "3rd" },
//     { year: "2023-24", class: "Class 9", percentage: "88.2%", rank: "2nd" },
//     { year: "2022-23", class: "Class 8", percentage: "86.5%", rank: "5th" },
//   ];

//   const certificates = [
//     {
//       name: "Science Olympiad Gold Medal",
//       issuedBy: "Dr. Singh",
//       date: "2025-11-15",
//       type: "Academic",
//     },
//     {
//       name: "Inter-School Debate Winner",
//       issuedBy: "Mrs. Sharma",
//       date: "2025-10-20",
//       type: "Co-curricular",
//     },
//     {
//       name: "Perfect Attendance Award",
//       issuedBy: "Principal",
//       date: "2025-09-01",
//       type: "Achievement",
//     },
//   ];

//   const achievements = [
//     {
//       title: "100% Attendance",
//       icon: Calendar,
//       color: "bg-green-500",
//       date: "Aug-Nov 2025",
//     },
//     {
//       title: "Top 3 in Mathematics",
//       icon: Star,
//       color: "bg-yellow-500",
//       date: "Mid-Term 2025",
//     },
//     {
//       title: "Science Fair Winner",
//       icon: Trophy,
//       color: "bg-blue-500",
//       date: "Oct 2025",
//     },
//     {
//       title: "Best Speaker Award",
//       icon: Medal,
//       color: "bg-purple-500",
//       date: "Sep 2025",
//     },
//   ];

//   const activities = [
//     { name: "Science Club Member", duration: "2 years", badge: "Active" },
//     { name: "Debate Team Captain", duration: "1 year", badge: "Leadership" },
//     { name: "Sports Committee", duration: "1.5 years", badge: "Active" },
//   ];

//   return (
//     <div className="space-y-6">
//       <div className="flex items-start justify-between">
//         <div>
//           <h1 className="text-gray-900 mb-2">Student Portfolio</h1>
//           <p className="text-gray-600">
//             Comprehensive record of your academic journey
//           </p>
//         </div>
//         <button
//           className="
//     flex items-center justify-center gap-2
//     w-full sm:w-auto sm:px-4
//     px-5 py-3
//     mt-4
//     sm:mt-0 sm:ml-4 sm:mx-4
//     text-base font-medium
//     bg-blue-600 text-white
//     rounded-xl
//     hover:bg-blue-700
//     active:scale-95
//     transition-all duration-200
//     focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
//   "
//         >
//           <Download className="w-5 h-5" />
//           <span>Export Portfolio PDF</span>
//         </button>

//         {/* <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
//           <Download className="w-4 h-4" />
//           Export Portfolio PDF
//         </button> */}
//       </div>

//       {/* Tab Navigation */}
//       <div className="bg-white rounded-xl shadow-sm p-2">
//         <div className="flex gap-2 overflow-x-auto scrollbar-hide">
//           {[
//             {
//               id: "academics" as const,
//               label: "Academic Records",
//               icon: FileText,
//             },
//             {
//               id: "attendance" as const,
//               label: "Attendance Report",
//               icon: Calendar,
//             },
//             { id: "certificates" as const, label: "Certificates", icon: Award },
//             {
//               id: "achievements" as const,
//               label: "Achievements & Activities",
//               icon: Trophy,
//             },
//           ].map((tab) => {
//             const Icon = tab.icon;

//             return (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`flex items-center justify-center gap-2
//             whitespace-nowrap
//             min-w-fit
//             px-4 py-3
//             text-sm sm:text-base
//             rounded-lg
//             transition-all duration-200
//             ${
//               activeTab === tab.id
//                 ? "bg-blue-600 text-white shadow-sm"
//                 : "text-gray-700 hover:bg-gray-100"
//             }`}
//               >
//                 <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
//                 <span>{tab.label}</span>
//               </button>
//             );
//           })}
//         </div>
//       </div>

//       {/* <div className="bg-white rounded-xl shadow-sm p-2">
//         <div className="flex gap-2">
//           {[
//             {
//               id: "academics" as const,
//               label: "Academic Records",
//               icon: FileText,
//             },
//             {
//               id: "attendance" as const,
//               label: "Attendance Report",
//               icon: Calendar,
//             },
//             { id: "certificates" as const, label: "Certificates", icon: Award },
//             {
//               id: "achievements" as const,
//               label: "Achievements & Activities",
//               icon: Trophy,
//             },
//           ].map((tab) => {
//             const Icon = tab.icon;
//             return (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
//                   activeTab === tab.id
//                     ? "bg-blue-600 text-white"
//                     : "text-gray-700 hover:bg-gray-100"
//                 }`}
//               >
//                 <Icon className="w-4 h-4" />
//                 {tab.label}
//               </button>
//             );
//           })}
//         </div>
//       </div> */}

//       {/* Tab Content */}
//       {activeTab === "academics" && (
//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <h2 className="text-gray-900 mb-6">Academic Performance History</h2>
//           <div className="space-y-4">
//             {academicRecords.map((record, index) => (
//               <div
//                 key={index}
//                 className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg"
//               >
//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                   <div>
//                     <p className="text-sm text-gray-600">Academic Year</p>
//                     <p className="text-gray-900">{record.year}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">Class</p>
//                     <p className="text-gray-900">{record.class}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">Percentage</p>
//                     <p className="text-gray-900">{record.percentage}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">Class Rank</p>
//                     <p className="text-gray-900">{record.rank}</p>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {activeTab === "attendance" && (
//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <h2 className="text-gray-900 mb-6">Attendance Summary</h2>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
//             <div className="p-6 bg-green-50 rounded-lg">
//               <p className="text-sm text-gray-600 mb-2">Total Days Present</p>
//               <p className="text-gray-900">102 days</p>
//             </div>
//             <div className="p-6 bg-red-50 rounded-lg">
//               <p className="text-sm text-gray-600 mb-2">Total Days Absent</p>
//               <p className="text-gray-900">5 days</p>
//             </div>
//             <div className="p-6 bg-blue-50 rounded-lg">
//               <p className="text-sm text-gray-600 mb-2">Attendance Rate</p>
//               <p className="text-gray-900">92%</p>
//             </div>
//           </div>
//           <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
//             <p className="text-gray-700">
//               <strong>Note:</strong> Maintain at least 75% attendance to be
//               eligible for examinations.
//             </p>
//           </div>
//         </div>
//       )}

//       {/* {activeTab === "certificates" && (
//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <h2 className="text-gray-900 mb-6">Certificates & Awards</h2>
//           <div className="space-y-4">
//             {certificates.map((cert, index) => (
//               <div
//                 key={index}
//                 className="flex items-center justify-between p-6 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
//               >
//                 <div className="flex items-start gap-4">
//                   <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
//                     <Award className="w-6 h-6 text-blue-600" />
//                   </div>
//                   <div>
//                     <h3 className="text-gray-900 mb-1">{cert.name}</h3>
//                     <p className="text-sm text-gray-600">
//                       Issued by: {cert.issuedBy}
//                     </p>
//                     <p className="text-sm text-gray-600">Date: {cert.date}</p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
//                     {cert.type}
//                   </span>
//                   <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
//                     View
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )} */}
//       {activeTab === "certificates" && (
//         <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
//           <h2 className="text-gray-900 text-lg sm:text-xl mb-6">
//             Certificates & Awards
//           </h2>

//           <div className="space-y-4">
//             {certificates.map((cert, index) => (
//               <div
//                 key={index}
//                 className="
//             flex flex-col sm:flex-row
//             sm:items-center sm:justify-between
//             gap-4
//             p-4 sm:p-6
//             border border-gray-200
//             rounded-lg
//             hover:border-blue-300
//             transition-colors
//           "
//               >
//                 {/* LEFT CONTENT */}
//                 <div className="flex items-start gap-4">
//                   <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
//                     <Award className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
//                   </div>

//                   <div>
//                     <h3 className="text-gray-900 text-sm sm:text-base mb-1">
//                       {cert.name}
//                     </h3>

//                     <p className="text-xs sm:text-sm text-gray-600">
//                       Issued by: {cert.issuedBy}
//                     </p>

//                     <p className="text-xs sm:text-sm text-gray-600">
//                       Date: {cert.date}
//                     </p>
//                   </div>
//                 </div>

//                 {/* RIGHT ACTIONS */}
//                 <div className="flex items-center justify-between sm:justify-end gap-3">
//                   <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs sm:text-sm">
//                     {cert.type}
//                   </span>

//                   <button className="px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
//                     View
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {activeTab === "achievements" && (
//         <div className="space-y-6">
//           <div className="bg-white rounded-xl shadow-sm p-6">
//             <h2 className="text-gray-900 mb-6">Achievements & Badges</h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//               {achievements.map((achievement, index) => {
//                 const Icon = achievement.icon;
//                 return (
//                   <div
//                     key={index}
//                     className="p-6 border border-gray-200 rounded-lg text-center"
//                   >
//                     <div
//                       className={`${achievement.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}
//                     >
//                       <Icon className="w-8 h-8 text-white" />
//                     </div>
//                     <h3 className="text-gray-900 mb-2">{achievement.title}</h3>
//                     <p className="text-sm text-gray-600">{achievement.date}</p>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>

//           <div className="bg-white rounded-xl shadow-sm p-6">
//             <h2 className="text-gray-900 mb-6">Co-curricular Activities</h2>
//             <div className="space-y-4">
//               {activities.map((activity, index) => (
//                 <div
//                   key={index}
//                   className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
//                 >
//                   <div>
//                     <h3 className="text-gray-900">{activity.name}</h3>
//                     <p className="text-sm text-gray-600">{activity.duration}</p>
//                   </div>
//                   <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
//                     {activity.badge}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
