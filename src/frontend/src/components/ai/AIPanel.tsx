// import React, { useState, useEffect } from "react";
// import {
//   X,
//   Brain,
//   AlertTriangle,
//   Lightbulb,
//   TrendingUp,
//   ChevronRight,
//   Loader2,
//   CheckCircle,
// } from "lucide-react";
// import {
//   predictRisk,
//   getRecommendations,
//   simulate,
//   RiskPrediction,
//   RecommendationResponse,
//   SimulationResult,
// } from "../../services/AIService";

// // ── Role passed from App so panel knows what to show ────────
// export type UserRoleForAI = "admin" | "teacher" | "student" | "parent";

// type Tab = "predict" | "recommend" | "simulate";

// interface AIPanelProps {
//   onClose: () => void;
//   userRole: UserRoleForAI;
// }

// const riskColor = (level: string) =>
//   level === "High"
//     ? "text-red-600 bg-red-50 border-red-200"
//     : level === "Medium"
//       ? "text-yellow-600 bg-yellow-50 border-yellow-200"
//       : "text-green-600 bg-green-50 border-green-200";

// const priorityColor = (p: string) =>
//   p === "High"
//     ? "bg-red-100 text-red-700"
//     : p === "Medium"
//       ? "bg-yellow-100 text-yellow-700"
//       : "bg-green-100 text-green-700";

// export function AIPanel({ onClose, userRole }: AIPanelProps) {
//   const [tab, setTab] = useState<Tab>("predict");
//   const [studentId, setStudentId] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [prediction, setPrediction] = useState<RiskPrediction | null>(null);
//   const [recResult, setRecResult] = useState<RecommendationResponse | null>(
//     null,
//   );
//   const [attInc, setAttInc] = useState("10");
//   const [marksInc, setMarksInc] = useState("10");
//   const [simResult, setSimResult] = useState<{
//     studentName: string;
//     simulation: SimulationResult;
//   } | null>(null);

//   const clearError = () => setError("");

//   // For student/parent roles, auto-load on mount (no ID needed)
//   useEffect(() => {
//     if (userRole === "student" || userRole === "parent") {
//       handleAutoPredict();
//     }
//   }, [userRole]);

//   // ── Auto-predict for student/parent using JWT identity ───
//   const handleAutoPredict = async () => {
//     setLoading(true);
//     clearError();
//     try {
//       // studentId=0 → backend uses JWT identity for student/parent
//       const result = await predictRisk(0);
//       setPrediction(result);
//     } catch (e: any) {
//       setError(e.message ?? "Failed to load your risk data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAutoRecommend = async () => {
//     setLoading(true);
//     clearError();
//     try {
//       const result = await getRecommendations(0);
//       setRecResult(result);
//     } catch (e: any) {
//       setError(e.message ?? "Failed to load recommendations");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── Manual predict (admin/teacher) ───────────────────────
//   const handlePredict = async () => {
//     const id = parseInt(studentId);
//     if (isNaN(id) || id <= 0) {
//       setError("Please enter a valid Student ID");
//       return;
//     }
//     setLoading(true);
//     clearError();
//     try {
//       setPrediction(await predictRisk(id));
//     } catch (e: any) {
//       setError(e.message ?? "Prediction failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRecommend = async () => {
//     const id = parseInt(studentId);
//     if (isNaN(id) || id <= 0) {
//       setError("Please enter a valid Student ID");
//       return;
//     }
//     setLoading(true);
//     clearError();
//     try {
//       setRecResult(await getRecommendations(id));
//     } catch (e: any) {
//       setError(e.message ?? "Failed to get recommendations");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSimulate = async () => {
//     const id =
//       userRole === "student" || userRole === "parent" ? 0 : parseInt(studentId);
//     const att = parseFloat(attInc);
//     const mks = parseFloat(marksInc);
//     if (
//       (userRole === "admin" || userRole === "teacher") &&
//       (isNaN(id) || id <= 0)
//     ) {
//       setError("Please enter a valid Student ID");
//       return;
//     }
//     if (isNaN(att) || isNaN(mks)) {
//       setError("Enter valid numbers");
//       return;
//     }
//     setLoading(true);
//     clearError();
//     try {
//       const result = await simulate(id, att, mks);
//       setSimResult({
//         studentName: result.studentName,
//         simulation: result.simulation,
//       });
//     } catch (e: any) {
//       setError(e.message ?? "Simulation failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const switchTab = (t: Tab) => {
//     setTab(t);
//     clearError();
//     setPrediction(null);
//     setRecResult(null);
//     setSimResult(null);
//     // Auto-load for student/parent when switching tabs
//     if (userRole === "student" || userRole === "parent") {
//       if (t === "predict") handleAutoPredict();
//       if (t === "recommend") handleAutoRecommend();
//     }
//   };

//   // ── Role-based UI helpers ────────────────────────────────
//   const isPassive = userRole === "student" || userRole === "parent";
//   const headerLabel =
//     userRole === "student"
//       ? "My Risk Analysis"
//       : userRole === "parent"
//         ? "My Child's Risk"
//         : userRole === "teacher"
//           ? "Student Risk (Your Students)"
//           : "AI Risk Assistant";

//   return (
//     <div
//       style={{
//         position: "fixed",
//         bottom: "96px",
//         right: "16px",
//         zIndex: 9998,
//         width: "384px",
//         maxHeight: "80vh",
//         backgroundColor: "white",
//         borderRadius: "16px",
//         boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
//         border: "1px solid #e5e7eb",
//         display: "flex",
//         flexDirection: "column",
//         overflow: "hidden",
//       }}
//     >
//       {/* HEADER */}
//       <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white">
//         <div className="flex items-center gap-2">
//           <Brain className="w-5 h-5" />
//           <span className="font-semibold text-sm">{headerLabel}</span>
//         </div>
//         <button onClick={onClose} className="hover:bg-red-800 p-1 rounded-lg">
//           <X className="w-4 h-4" />
//         </button>
//       </div>

//       {/* TABS */}
//       <div className="flex border-b border-gray-200">
//         {(
//           [
//             { id: "predict", icon: AlertTriangle, label: "Risk" },
//             { id: "recommend", icon: Lightbulb, label: "Advice" },
//             { id: "simulate", icon: TrendingUp, label: "Simulate" },
//           ] as { id: Tab; icon: any; label: string }[]
//         ).map((t) => (
//           <button
//             key={t.id}
//             onClick={() => switchTab(t.id)}
//             className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium transition-colors ${
//               tab === t.id
//                 ? "border-b-2 border-red-600 text-red-600"
//                 : "text-gray-500 hover:text-gray-700"
//             }`}
//           >
//             <t.icon className="w-3.5 h-3.5" />
//             {t.label}
//           </button>
//         ))}
//       </div>

//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {/* ── STUDENT ID INPUT (admin/teacher only) ── */}
//         {!isPassive && (
//           <div>
//             <label className="block text-gray-700 text-sm mb-1 font-medium">
//               Student ID
//               {userRole === "teacher" && (
//                 <span className="text-xs text-gray-400 ml-2">
//                   (your students only)
//                 </span>
//               )}
//             </label>
//             <div className="flex gap-2">
//               <input
//                 type="number"
//                 min="1"
//                 value={studentId}
//                 onChange={(e) => {
//                   setStudentId(e.target.value);
//                   clearError();
//                 }}
//                 placeholder="Enter Student ID"
//                 className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
//               />
//               {tab === "predict" && (
//                 <button
//                   onClick={handlePredict}
//                   disabled={loading}
//                   className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
//                 >
//                   {loading ? (
//                     <Loader2 className="w-3.5 h-3.5 animate-spin" />
//                   ) : (
//                     <ChevronRight className="w-3.5 h-3.5" />
//                   )}
//                   Run
//                 </button>
//               )}
//               {tab === "recommend" && (
//                 <button
//                   onClick={handleRecommend}
//                   disabled={loading}
//                   className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
//                 >
//                   {loading ? (
//                     <Loader2 className="w-3.5 h-3.5 animate-spin" />
//                   ) : (
//                     <ChevronRight className="w-3.5 h-3.5" />
//                   )}
//                   Get
//                 </button>
//               )}
//             </div>
//           </div>
//         )}

//         {/* ── STUDENT/PARENT: auto-loading message ── */}
//         {isPassive && loading && (
//           <div className="flex items-center justify-center py-6 gap-2 text-gray-500">
//             <Loader2 className="w-5 h-5 animate-spin text-red-500" />
//             <span className="text-sm">Loading your data...</span>
//           </div>
//         )}

//         {/* Error */}
//         {error && (
//           <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-xs">
//             {error}
//           </div>
//         )}

//         {/* ── PREDICT RESULTS ── */}
//         {tab === "predict" && prediction && (
//           <div className="space-y-3">
//             <div
//               className={`rounded-xl border p-4 ${riskColor(prediction.finalRisk)}`}
//             >
//               <p className="text-xs font-medium mb-1">
//                 {prediction.studentName}
//                 {prediction.rollNumber && ` — ${prediction.rollNumber}`}
//               </p>
//               <p className="text-lg font-bold">{prediction.finalRisk} Risk</p>
//               {prediction.mlModelUsed && (
//                 <span className="text-xs bg-white bg-opacity-60 px-2 py-0.5 rounded-full">
//                   ML.NET used
//                 </span>
//               )}
//             </div>
//             <div className="grid grid-cols-3 gap-2">
//               {[
//                 {
//                   label: "Attendance",
//                   value: `${prediction.attendanceRate?.toFixed(1)}%`,
//                 },
//                 {
//                   label: "Avg Marks",
//                   value: `${prediction.averageMarks?.toFixed(1)}%`,
//                 },
//                 {
//                   label: "Behavior",
//                   value: `${prediction.behaviorScore?.toFixed(0)}/100`,
//                 },
//               ].map((m) => (
//                 <div
//                   key={m.label}
//                   className="bg-gray-50 rounded-lg p-2 text-center"
//                 >
//                   <p className="text-gray-500 text-xs">{m.label}</p>
//                   <p className="text-gray-900 font-semibold text-sm">
//                     {m.value}
//                   </p>
//                 </div>
//               ))}
//             </div>
//             <div>
//               <p className="text-gray-700 text-xs font-semibold mb-2">
//                 Risk Factors:
//               </p>
//               <ul className="space-y-1">
//                 {prediction.factors?.map((f, i) => (
//                   <li
//                     key={i}
//                     className="flex items-start gap-2 text-xs text-gray-600"
//                   >
//                     <span className="text-red-500 mt-0.5 flex-shrink-0">•</span>
//                     {f}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//             {/* Refresh button for student/parent */}
//             {isPassive && (
//               <button
//                 onClick={handleAutoPredict}
//                 disabled={loading}
//                 className="w-full py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
//               >
//                 Refresh
//               </button>
//             )}
//           </div>
//         )}

//         {/* ── RECOMMENDATIONS ── */}
//         {tab === "recommend" && recResult && (
//           <div className="space-y-3">
//             <div className="flex items-center justify-between">
//               <p className="text-gray-900 font-semibold text-sm">
//                 {recResult.studentName}
//               </p>
//               <span
//                 className={`text-xs px-2 py-0.5 rounded-full border ${riskColor(recResult.riskLevel)}`}
//               >
//                 {recResult.riskLevel} Risk
//               </span>
//             </div>
//             {recResult.recommendations.map((r, i) => (
//               <div
//                 key={i}
//                 className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-1"
//               >
//                 <div className="flex items-center justify-between">
//                   <p className="text-gray-900 text-xs font-semibold">
//                     {r.area}
//                   </p>
//                   <span
//                     className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor(r.priority)}`}
//                   >
//                     {r.priority}
//                   </span>
//                 </div>
//                 <p className="text-gray-600 text-xs">{r.message}</p>
//                 <p className="text-gray-500 text-xs italic">
//                   <span className="font-medium not-italic text-gray-700">
//                     Action:{" "}
//                   </span>
//                   {r.actionRequired}
//                 </p>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* ── SIMULATE ── */}
//         {tab === "simulate" && (
//           <div className="space-y-3">
//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <label className="block text-gray-700 text-xs mb-1 font-medium">
//                   Attendance Increase (%)
//                 </label>
//                 <input
//                   type="number"
//                   min="0"
//                   max="100"
//                   value={attInc}
//                   onChange={(e) => setAttInc(e.target.value)}
//                   className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
//                 />
//               </div>
//               <div>
//                 <label className="block text-gray-700 text-xs mb-1 font-medium">
//                   Marks Increase (%)
//                 </label>
//                 <input
//                   type="number"
//                   min="0"
//                   max="100"
//                   value={marksInc}
//                   onChange={(e) => setMarksInc(e.target.value)}
//                   className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
//                 />
//               </div>
//             </div>
//             <button
//               onClick={handleSimulate}
//               disabled={loading}
//               className="w-full py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
//             >
//               {loading ? (
//                 <>
//                   <Loader2 className="w-4 h-4 animate-spin" /> Running...
//                 </>
//               ) : (
//                 <>
//                   <TrendingUp className="w-4 h-4" /> Run Simulation
//                 </>
//               )}
//             </button>

//             {simResult && (
//               <div className="space-y-3">
//                 <p className="text-gray-900 font-semibold text-sm">
//                   {simResult.studentName}
//                 </p>
//                 <div className="grid grid-cols-2 gap-2">
//                   <div
//                     className={`rounded-lg border p-3 text-center ${riskColor(simResult.simulation.originalRiskLevel)}`}
//                   >
//                     <p className="text-xs mb-0.5">Before</p>
//                     <p className="font-bold text-sm">
//                       {simResult.simulation.originalRiskLevel}
//                     </p>
//                   </div>
//                   <div
//                     className={`rounded-lg border p-3 text-center ${riskColor(simResult.simulation.simulatedRiskLevel)}`}
//                   >
//                     <p className="text-xs mb-0.5">After</p>
//                     <p className="font-bold text-sm">
//                       {simResult.simulation.simulatedRiskLevel}
//                     </p>
//                   </div>
//                 </div>
//                 {simResult.simulation.riskImproved && (
//                   <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-2">
//                     <CheckCircle className="w-4 h-4 text-green-600" />
//                     <p className="text-green-700 text-xs font-medium">
//                       Risk level improves!
//                     </p>
//                   </div>
//                 )}
//                 <p className="text-gray-600 text-xs">
//                   {simResult.simulation.message}
//                 </p>
//                 <ul className="space-y-1">
//                   {simResult.simulation.improvementSteps.map((s, i) => (
//                     <li
//                       key={i}
//                       className="flex items-start gap-2 text-xs text-gray-600"
//                     >
//                       <span className="text-blue-500 mt-0.5">→</span>
//                       {s}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import React, { useState } from "react";
import {
  X,
  Brain,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  ChevronRight,
  Loader2,
  CheckCircle,
} from "lucide-react";
import {
  predictRisk,
  getRecommendations,
  simulate,
  RiskPrediction,
  RecommendationResponse,
  SimulationResult,
} from "../../services/AIService";

type Tab = "predict" | "recommend" | "simulate";

interface AIPanelProps {
  onClose: () => void;
}

const riskColor = (level: string) =>
  level === "High"
    ? "text-red-600 bg-red-50 border-red-200"
    : level === "Medium"
      ? "text-yellow-600 bg-yellow-50 border-yellow-200"
      : "text-green-600 bg-green-50 border-green-200";

const priorityColor = (p: string) =>
  p === "High"
    ? "bg-red-100 text-red-700"
    : p === "Medium"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-green-100 text-green-700";

export function AIPanel({ onClose }: AIPanelProps) {
  const [tab, setTab] = useState<Tab>("predict");
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [prediction, setPrediction] = useState<RiskPrediction | null>(null);
  const [recResult, setRecResult] = useState<RecommendationResponse | null>(
    null,
  );
  const [attInc, setAttInc] = useState("10");
  const [marksInc, setMarksInc] = useState("10");
  const [simResult, setSimResult] = useState<{
    studentName: string;
    simulation: SimulationResult;
  } | null>(null);

  const clearError = () => setError("");

  const handlePredict = async () => {
    const id = parseInt(studentId);
    if (isNaN(id) || id <= 0) {
      setError("Please enter a valid Student ID");
      return;
    }
    setLoading(true);
    clearError();
    try {
      setPrediction(await predictRisk(id));
    } catch (e: any) {
      setError(e.message ?? "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRecommend = async () => {
    const id = parseInt(studentId);
    if (isNaN(id) || id <= 0) {
      setError("Please enter a valid Student ID");
      return;
    }
    setLoading(true);
    clearError();
    try {
      setRecResult(await getRecommendations(id));
    } catch (e: any) {
      setError(e.message ?? "Failed to get recommendations");
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async () => {
    const id = parseInt(studentId);
    const att = parseFloat(attInc);
    const mks = parseFloat(marksInc);
    if (isNaN(id) || id <= 0) {
      setError("Please enter a valid Student ID");
      return;
    }
    if (isNaN(att) || isNaN(mks)) {
      setError("Enter valid numbers for improvements");
      return;
    }
    setLoading(true);
    clearError();
    try {
      const result = await simulate(id, att, mks);
      setSimResult({
        studentName: result.studentName,
        simulation: result.simulation,
      });
    } catch (e: any) {
      setError(e.message ?? "Simulation failed");
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (t: Tab) => {
    setTab(t);
    clearError();
    setPrediction(null);
    setRecResult(null);
    setSimResult(null);
  };

  return (
    // ✅ ALL positioning via inline style — guaranteed to show above everything
    <div
      style={{
        position: "fixed",
        bottom: "96px", // sits above the 56px button + gap
        right: "16px",
        zIndex: 9998,
        width: "384px",
        maxHeight: "80vh",
        backgroundColor: "white",
        borderRadius: "16px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
        border: "1px solid #e5e7eb",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          <span className="font-semibold">AI Risk Assistant</span>
        </div>
        <button
          onClick={onClose}
          className="hover:bg-red-800 p-1 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* TABS */}
      <div className="flex border-b border-gray-200">
        {(
          [
            { id: "predict", icon: AlertTriangle, label: "Predict" },
            { id: "recommend", icon: Lightbulb, label: "Advise" },
            { id: "simulate", icon: TrendingUp, label: "Simulate" },
          ] as { id: Tab; icon: any; label: string }[]
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => switchTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium transition-colors ${
              tab === t.id
                ? "border-b-2 border-red-600 text-red-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Student ID */}
        <div>
          <label className="block text-gray-700 text-sm mb-1 font-medium">
            Student ID
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              value={studentId}
              onChange={(e) => {
                setStudentId(e.target.value);
                clearError();
              }}
              placeholder="Enter Student ID"
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {tab === "predict" && (
              <button
                onClick={handlePredict}
                disabled={loading}
                className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
                Run
              </button>
            )}
            {tab === "recommend" && (
              <button
                onClick={handleRecommend}
                disabled={loading}
                className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
                Get
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-xs">
            {error}
          </div>
        )}

        {/* ── PREDICT RESULTS ── */}
        {tab === "predict" && prediction && (
          <div className="space-y-3">
            <div
              className={`rounded-xl border p-4 ${riskColor(prediction.finalRisk)}`}
            >
              <p className="text-xs font-medium mb-1">
                {prediction.studentName} — {prediction.rollNumber}
              </p>
              <p className="text-lg font-bold">{prediction.finalRisk} Risk</p>
              {prediction.mlModelUsed && (
                <span className="text-xs bg-white bg-opacity-60 px-2 py-0.5 rounded-full">
                  ML.NET used
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  label: "Attendance",
                  value: `${prediction.attendanceRate.toFixed(1)}%`,
                },
                {
                  label: "Avg Marks",
                  value: `${prediction.averageMarks.toFixed(1)}%`,
                },
                {
                  label: "Behavior",
                  value: `${prediction.behaviorScore.toFixed(0)}/100`,
                },
              ].map((m) => (
                <div
                  key={m.label}
                  className="bg-gray-50 rounded-lg p-2 text-center"
                >
                  <p className="text-gray-500 text-xs">{m.label}</p>
                  <p className="text-gray-900 font-semibold text-sm">
                    {m.value}
                  </p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-gray-700 text-xs font-semibold mb-2">
                Risk Factors:
              </p>
              <ul className="space-y-1">
                {prediction.factors.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs text-gray-600"
                  >
                    <span className="text-red-500 mt-0.5 flex-shrink-0">•</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ── RECOMMENDATIONS ── */}
        {tab === "recommend" && recResult && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-gray-900 font-semibold text-sm">
                {recResult.studentName}
              </p>
              <span
                className={`text-xs px-2 py-0.5 rounded-full border ${riskColor(recResult.riskLevel)}`}
              >
                {recResult.riskLevel} Risk
              </span>
            </div>
            {recResult.recommendations.map((r, i) => (
              <div
                key={i}
                className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <p className="text-gray-900 text-xs font-semibold">
                    {r.area}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor(r.priority)}`}
                  >
                    {r.priority}
                  </span>
                </div>
                <p className="text-gray-600 text-xs">{r.message}</p>
                <p className="text-gray-500 text-xs italic">
                  <span className="font-medium not-italic text-gray-700">
                    Action:{" "}
                  </span>
                  {r.actionRequired}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── SIMULATE ── */}
        {tab === "simulate" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 text-xs mb-1 font-medium">
                  Attendance Increase (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={attInc}
                  onChange={(e) => setAttInc(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-xs mb-1 font-medium">
                  Marks Increase (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={marksInc}
                  onChange={(e) => setMarksInc(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            <button
              onClick={handleSimulate}
              disabled={loading}
              className="w-full py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Running...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4" /> Run Simulation
                </>
              )}
            </button>

            {simResult && (
              <div className="space-y-3">
                <p className="text-gray-900 font-semibold text-sm">
                  {simResult.studentName}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div
                    className={`rounded-lg border p-3 text-center ${riskColor(simResult.simulation.originalRiskLevel)}`}
                  >
                    <p className="text-xs mb-0.5">Before</p>
                    <p className="font-bold text-sm">
                      {simResult.simulation.originalRiskLevel}
                    </p>
                  </div>
                  <div
                    className={`rounded-lg border p-3 text-center ${riskColor(simResult.simulation.simulatedRiskLevel)}`}
                  >
                    <p className="text-xs mb-0.5">After</p>
                    <p className="font-bold text-sm">
                      {simResult.simulation.simulatedRiskLevel}
                    </p>
                  </div>
                </div>
                {simResult.simulation.riskImproved && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="text-green-700 text-xs font-medium">
                      Risk level improves!
                    </p>
                  </div>
                )}
                <p className="text-gray-600 text-xs">
                  {simResult.simulation.message}
                </p>
                <div>
                  <p className="text-gray-700 text-xs font-semibold mb-1">
                    Steps:
                  </p>
                  <ul className="space-y-1">
                    {simResult.simulation.improvementSteps.map((s, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs text-gray-600"
                      >
                        <span className="text-blue-500 mt-0.5">→</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
