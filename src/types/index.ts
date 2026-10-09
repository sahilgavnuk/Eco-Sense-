export type WasteCategory =
  | 'Dry / Recyclable'
  | 'Wet / Organic'
  | 'Non-Recyclable'
  | 'Hazardous'
  | 'E-Waste'
  | 'Special Handling';

export type ContaminationLevel =
  | 'Clean'
  | 'Slightly Contaminated'
  | 'Heavily Contaminated'
  | 'Mixed-material'
  | 'Unknown';

export interface BoundingBox {
  x: number; // percentage from left
  y: number; // percentage from top
  w: number; // percentage width
  h: number; // percentage height
}

export interface DetectedObject {
  id: string;
  label: string;
  category: WasteCategory;
  material: string;
  confidence: number; // 0 to 100
  box: BoundingBox;
  condition: ContaminationLevel;
  disposalRecommendation: string[];
  whyExplanation: string;
}

export interface ScanResult {
  id: string;
  timestamp: string;
  imageUrl: string;
  objects: DetectedObject[];
  primaryCategory: WasteCategory;
  primaryCondition: ContaminationLevel;
  overallRecommendation: string[];
  explainableAI: string;
  anonymizedTelemetryOptIn: boolean;
  zone: string;
}

export type IssueType =
  | 'Garbage Accumulation'
  | 'Overflowing Bin'
  | 'Illegal Dumping'
  | 'Missed Collection'
  | 'Improper Segregation'
  | 'Other';

export type IssueSeverity = 'HIGH' | 'MEDIUM' | 'LOW';

export type ReportStatus =
  | 'Submitted'
  | 'AI Analysis'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved';

export interface WasteReport {
  id: string; // e.g. ES-2026-001284
  timestamp: string;
  issueType: IssueType;
  severity: IssueSeverity;
  status: ReportStatus;
  location: {
    lat: number;
    lng: number;
    address: string;
    zone: string;
  };
  photoUrl: string;
  description: string;
  aiAnalysis: {
    detectedIssue: string;
    severityScore: number;
    confidence: number;
    interpretation: string;
  };
  residentConfirmed: boolean;
  clusterCount?: number;
}

export interface ZoneMetric {
  zoneId: string;
  zoneName: string;
  scansThisMonth: number;
  segregationRate: number; // %
  activeIssues: number;
  dominantCategory: string;
}

export interface DailyTrend {
  date: string;
  scans: number;
  recyclable: number;
  organic: number;
  nonRecyclable: number;
  forecastKg?: number;
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  groundedSources?: string[];
  suggestedActions?: string[];
}

export interface EcoScore {
  totalScore: number; // e.g. 78
  segregationScore: number; // 82
  awarenessScore: number; // 89
  participationScore: number; // 74
  wasteReductionScore: number; // 68
  activeStreakDays: number;
  communityMilestone: string;
}

export type UserRole = 'Resident' | 'Coordinator' | 'Administrator';

export interface UserProfile {
  name: string;
  email: string;
  zone: string;
  role: UserRole;
  isLoggedIn: boolean;
}
