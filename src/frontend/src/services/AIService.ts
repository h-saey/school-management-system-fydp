// ── AIService.ts ─────────────────────────────────────────────
// All API calls for the AI module.
// Drop into: src/services/AIService.ts

const API_BASE = 'http://localhost:5036/api';

const getToken = (): string => localStorage.getItem('token') ?? '';

const authHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  Authorization:  `Bearer ${getToken()}`,
});

async function post<T>(url: string, body: object): Promise<T> {
  const res = await fetch(url, {
    method:  'POST',
    headers: authHeaders(),
    body:    JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message ?? `Error ${res.status}`);
  return data as T;
}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message ?? `Error ${res.status}`);
  return data as T;
}

// ── Types ────────────────────────────────────────────────────

export type RiskPrediction = {
  studentId:       number;
  studentName:     string;
  class:           string;
  rollNumber:      string;
  ruleBasedRisk:   string;
  mlRisk:          string;
  finalRisk:       string;
  attendanceRate:  number;
  averageMarks:    number;
  negativeRemarks: number;
  behaviorScore:   number;
  factors:         string[];
  mlModelUsed:     boolean;
};

export type Recommendation = {
  area:           string;
  priority:       string;
  message:        string;
  actionRequired: string;
};

export type RecommendationResponse = {
  studentId:       number;
  studentName:     string;
  riskLevel:       string;
  recommendations: Recommendation[];
};

export type SimulationResult = {
  originalRiskLevel:   string;
  simulatedRiskLevel:  string;
  originalAttendance:  number;
  simulatedAttendance: number;
  originalMarks:       number;
  simulatedMarks:      number;
  riskImproved:        boolean;
  message:             string;
  improvementSteps:    string[];
};

export type AllRisksResponse = {
  insights: {
    totalStudents:   number;
    highRiskCount:   number;
    mediumRiskCount: number;
    lowRiskCount:    number;
    highRiskPercent: number;
    avgAttendance:   number;
    avgMarks:        number;
    aiSummary:       string;
  };
  students: RiskPrediction[];
};

// ── API Functions ────────────────────────────────────────────

export const predictRisk = (studentId: number) =>
  post<RiskPrediction>(`${API_BASE}/ai/predict-risk`, { studentId });

export const getRecommendations = (studentId: number) =>
  post<RecommendationResponse>(`${API_BASE}/ai/recommendations`, { studentId });

export const simulate = (
  studentId:          number,
  attendanceIncrease: number,
  marksIncrease:      number
) =>
  post<{ studentId: number; studentName: string; simulation: SimulationResult }>(
    `${API_BASE}/ai/simulate`,
    { studentId, attendanceIncrease, marksIncrease }
  );

export const getAllRisks = (params?: {
  riskLevel?: string;
  minMarks?:  number;
  maxMarks?:  number;
}) => {
  const q = new URLSearchParams();
  if (params?.riskLevel) q.set('riskLevel', params.riskLevel);
  if (params?.minMarks  !== undefined) q.set('minMarks',  String(params.minMarks));
  if (params?.maxMarks  !== undefined) q.set('maxMarks',  String(params.maxMarks));
  const qs = q.toString();
  return get<AllRisksResponse>(`${API_BASE}/ai/all-risks${qs ? '?' + qs : ''}`);
};

export const trainModel = () =>
  post<{ message: string; trainedOn: string; usedRealData: boolean }>(
    `${API_BASE}/ai/train`, {}
  );
