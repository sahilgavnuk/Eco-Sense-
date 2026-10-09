import type { ScanResult, WasteReport, ZoneMetric, DailyTrend, EcoScore } from '../types';

export const ZONE_1_NAME = 'Zone 1 — Kokan Region';
export const ZONE_2_NAME = 'Zone 2 — NSP East/West & Virar';

export const AVAILABLE_ZONES = [
  ZONE_1_NAME,
  ZONE_2_NAME,
];

export const SAMPLE_SCANS: ScanResult[] = [
  {
    id: 'scan-001',
    timestamp: '2026-10-09T08:32:10Z',
    imageUrl: 'https://images.unsplash.com/photo-1528323273322-d81458248d40?auto=format&fit=crop&w=800&q=80',
    primaryCategory: 'Dry / Recyclable',
    primaryCondition: 'Slightly Contaminated',
    overallRecommendation: ['Empty liquid contents', 'Rinse gently with water', 'Crush bottle to save space', 'Deposit in Dry/Recyclable bin'],
    explainableAI: 'Identified PET plastic bottle with 94% confidence. PET plastic is highly recyclable when clean.',
    anonymizedTelemetryOptIn: true,
    zone: ZONE_2_NAME,
    objects: [
      {
        id: 'obj-1',
        label: 'PET Plastic Bottle',
        category: 'Dry / Recyclable',
        material: 'PET (Polyethylene Terephthalate)',
        confidence: 94,
        box: { x: 18, y: 15, w: 42, h: 68 },
        condition: 'Slightly Contaminated',
        disposalRecommendation: ['Empty liquids', 'Rinse with water', 'Place cap back on', 'Deposit in Blue/Recyclable Bin'],
        whyExplanation: 'Transparent rigid body structure characteristic of Grade-1 recyclable PET.'
      }
    ]
  },
  {
    id: 'scan-002',
    timestamp: '2026-10-09T08:50:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1577705998148-6da4f3963bc8?auto=format&fit=crop&w=800&q=80',
    primaryCategory: 'Dry / Recyclable',
    primaryCondition: 'Clean',
    overallRecommendation: ['Flatten cardboard box', 'Remove synthetic tape', 'Place in dry cardboard collection'],
    explainableAI: 'High confidence detection of corrugated cardboard box. Clean, dry fiber material ready for repulping.',
    anonymizedTelemetryOptIn: true,
    zone: ZONE_1_NAME,
    objects: [
      {
        id: 'obj-2',
        label: 'Corrugated Shipping Box',
        category: 'Dry / Recyclable',
        material: 'Kraft Fiberboard',
        confidence: 96,
        box: { x: 12, y: 10, w: 76, h: 80 },
        condition: 'Clean',
        disposalRecommendation: ['Flatten container', 'Remove synthetic tape', 'Place in dry cardboard collection'],
        whyExplanation: 'High grade cellulose pulp material with minimal ink contamination.'
      }
    ]
  },
  {
    id: 'scan-003',
    timestamp: '2026-10-09T09:05:44Z',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    primaryCategory: 'Wet / Organic',
    primaryCondition: 'Mixed-material',
    overallRecommendation: ['Scrape food scraps into Wet/Organic waste bin or home compost', 'Rinse container'],
    explainableAI: 'Detected organic food waste suitable for aerobic composting or biomethanation.',
    anonymizedTelemetryOptIn: true,
    zone: ZONE_1_NAME,
    objects: [
      {
        id: 'obj-3',
        label: 'Organic Food Scraps',
        category: 'Wet / Organic',
        material: 'Compostable Organic Matter',
        confidence: 92,
        box: { x: 25, y: 25, w: 50, h: 45 },
        condition: 'Mixed-material',
        disposalRecommendation: ['Scrape into Green/Wet Waste Bin or Home Compost'],
        whyExplanation: 'Perishable organic nutrient content suitable for composting.'
      }
    ]
  }
];

export const MOCK_REPORTS: WasteReport[] = [
  {
    id: 'ES-2026-001284',
    timestamp: '2026-10-09T07:15:00Z',
    issueType: 'Garbage Accumulation',
    severity: 'HIGH',
    status: 'In Progress',
    location: {
      lat: 19.4184,
      lng: 72.8123,
      address: 'Near Station Road, Nalasopara East',
      zone: ZONE_2_NAME
    },
    photoUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    description: 'Commercial waste bags piled near sidewalk corner, blocking pedestrian walkway.',
    aiAnalysis: {
      detectedIssue: 'Uncollected Commercial Waste Accumulation',
      severityScore: 89,
      confidence: 93,
      interpretation: 'High severity cluster of plastic bags obstructing public walkway in NSP East.'
    },
    residentConfirmed: false,
    clusterCount: 4
  },
  {
    id: 'ES-2026-001283',
    timestamp: '2026-10-09T06:30:00Z',
    issueType: 'Overflowing Bin',
    severity: 'MEDIUM',
    status: 'Assigned',
    location: {
      lat: 18.1500,
      lng: 73.0000,
      address: 'Market Yard Road, Kokan Coastal Belt',
      zone: ZONE_1_NAME
    },
    photoUrl: 'https://images.unsplash.com/photo-1503596476-1c12a8ba09a9?auto=format&fit=crop&w=800&q=80',
    description: 'Public market dry-waste bin overflowing after morning wholesale market.',
    aiAnalysis: {
      detectedIssue: 'Municipal Public Bin Capacity Breach',
      severityScore: 68,
      confidence: 95,
      interpretation: 'Bin capacity exceeded 130%. Overflow consists primarily of paper crates and packaging.'
    },
    residentConfirmed: false,
    clusterCount: 2
  },
  {
    id: 'ES-2026-001280',
    timestamp: '2026-10-08T18:45:00Z',
    issueType: 'Illegal Dumping',
    severity: 'HIGH',
    status: 'AI Analysis',
    location: {
      lat: 19.4564,
      lng: 72.8010,
      address: 'Bypass Road, Virar West',
      zone: ZONE_2_NAME
    },
    photoUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80',
    description: 'Bulk furniture and discarded construction debris dumped near bypass turn.',
    aiAnalysis: {
      detectedIssue: 'Hazardous / Construction Bulk Dumping',
      severityScore: 94,
      confidence: 91,
      interpretation: 'Hazardous mixed debris requiring municipal collection truck dispatch in Virar West.'
    },
    residentConfirmed: false,
    clusterCount: 6
  },
  {
    id: 'ES-2026-001275',
    timestamp: '2026-10-08T14:20:00Z',
    issueType: 'Missed Collection',
    severity: 'LOW',
    status: 'Resolved',
    location: {
      lat: 17.9800,
      lng: 73.2000,
      address: 'Main Bazaar Lane, Chiplun - Kokan',
      zone: ZONE_1_NAME
    },
    photoUrl: 'https://images.unsplash.com/photo-1528323273322-d81458248d40?auto=format&fit=crop&w=800&q=80',
    description: 'Residential green organic waste bin missed during morning collection truck route.',
    aiAnalysis: {
      detectedIssue: 'Single-Household Collection Route Skip',
      severityScore: 35,
      confidence: 88,
      interpretation: 'Localized missed bin. Secondary collection resolved.'
    },
    residentConfirmed: true
  }
];

// Exactly 2 zones only with total 150 scans:
// Zone 1: 85 scans
// Zone 2: 65 scans
// Total = 150
export const MOCK_ZONE_METRICS: ZoneMetric[] = [
  {
    zoneId: 'Z1',
    zoneName: ZONE_1_NAME,
    scansThisMonth: 85,
    segregationRate: 84,
    activeIssues: 2,
    dominantCategory: 'Wet / Organic & Marine Bio-Waste'
  },
  {
    zoneId: 'Z2',
    zoneName: ZONE_2_NAME,
    scansThisMonth: 65,
    segregationRate: 76,
    activeIssues: 4,
    dominantCategory: 'Dry / Recyclable (PET Bottles & Packaging)'
  }
];

export const MOCK_DAILY_TRENDS: DailyTrend[] = [
  { date: 'Oct 03', scans: 18, recyclable: 9, organic: 6, nonRecyclable: 3 },
  { date: 'Oct 04', scans: 22, recyclable: 12, organic: 7, nonRecyclable: 3 },
  { date: 'Oct 05', scans: 25, recyclable: 14, organic: 8, nonRecyclable: 3 },
  { date: 'Oct 06', scans: 28, recyclable: 15, organic: 9, nonRecyclable: 4 },
  { date: 'Oct 07', scans: 31, recyclable: 17, organic: 10, nonRecyclable: 4 },
  { date: 'Oct 08', scans: 34, recyclable: 19, organic: 11, nonRecyclable: 4 },
  { date: 'Oct 09', scans: 38, recyclable: 21, organic: 12, nonRecyclable: 5 }
];

export const MOCK_ECOSCORE: EcoScore = {
  totalScore: 82,
  segregationScore: 84,
  awarenessScore: 89,
  participationScore: 78,
  wasteReductionScore: 76,
  activeStreakDays: 14,
  communityMilestone: 'Top 15% Cleaner Neighborhood Distinction (Kokan & NSP/Virar)'
};
