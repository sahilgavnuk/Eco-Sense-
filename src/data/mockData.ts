import type { ScanResult, WasteReport, ZoneMetric, DailyTrend, EcoScore } from '../types';

export const SAMPLE_SCANS: ScanResult[] = [
  {
    id: 'scan-001',
    timestamp: '2026-10-06T14:32:10Z',
    imageUrl: 'https://images.unsplash.com/photo-1528323273322-d81458248d40?auto=format&fit=crop&w=800&q=80',
    primaryCategory: 'Dry / Recyclable',
    primaryCondition: 'Slightly Contaminated',
    overallRecommendation: ['Empty liquid contents', 'Rinse gently with water', 'Crush bottle to save space', 'Deposit in Dry/Recyclable bin'],
    explainableAI: 'This object was identified as a clear PET plastic bottle (94% confidence) and a snack packaging wrapper (88% confidence). PET plastic is highly recyclable when clean, whereas thin laminate wrappers belong in non-recyclable dry waste.',
    anonymizedTelemetryOptIn: true,
    zone: 'Zone 2 — Central District',
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
        whyExplanation: 'Transparent rigid body structure with molded cap characteristic of Grade-1 recyclable PET.'
      },
      {
        id: 'obj-2',
        label: 'Snack Packaging Wrapper',
        category: 'Non-Recyclable',
        material: 'Multi-layer Foil Laminate',
        confidence: 88,
        box: { x: 55, y: 40, w: 35, h: 45 },
        condition: 'Heavily Contaminated',
        disposalRecommendation: ['Do not wash', 'Dispose in Black/Non-Recyclable Bin'],
        whyExplanation: 'Composite metallized film layers cannot be separated in standard recycling plants.'
      }
    ]
  },
  {
    id: 'scan-002',
    timestamp: '2026-10-06T15:10:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1577705998148-6da4f3963bc8?auto=format&fit=crop&w=800&q=80',
    primaryCategory: 'Dry / Recyclable',
    primaryCondition: 'Clean',
    overallRecommendation: ['Flatten cardboard box', 'Remove plastic tape if possible', 'Keep dry', 'Place in Paper/Cardboard recycling'],
    explainableAI: 'High confidence detection of corrugated cardboard box (96% confidence). Clean, dry fiber material ready for repulping into secondary cardboard containers.',
    anonymizedTelemetryOptIn: true,
    zone: 'Zone 4 — Tech Quarter',
    objects: [
      {
        id: 'obj-3',
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
    timestamp: '2026-10-06T16:05:44Z',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    primaryCategory: 'Wet / Organic',
    primaryCondition: 'Mixed-material',
    overallRecommendation: ['Separate food scraps into Compost/Wet waste bin', 'Rinse plastic salad tray and place in Recyclables'],
    explainableAI: 'Detected organic food waste mixed with a rigid plastic tray (91% confidence). Segregating organic material prevents landfill methane emissions and allows plastic recovery.',
    anonymizedTelemetryOptIn: true,
    zone: 'Zone 1 — Green Valley',
    objects: [
      {
        id: 'obj-4',
        label: 'Organic Food Scraps',
        category: 'Wet / Organic',
        material: 'Compostable Organic Matter',
        confidence: 92,
        box: { x: 25, y: 25, w: 50, h: 45 },
        condition: 'Mixed-material',
        disposalRecommendation: ['Scrape into Green/Wet Waste Bin or Home Compost'],
        whyExplanation: 'Perishable organic nutrient content suitable for aerobic composting or biomethanation.'
      },
      {
        id: 'obj-5',
        label: 'Clear Plastic Salad Container',
        category: 'Dry / Recyclable',
        material: 'RPET Plastic',
        confidence: 89,
        box: { x: 15, y: 15, w: 70, h: 65 },
        condition: 'Slightly Contaminated',
        disposalRecommendation: ['Rinse residual food sauce', 'Place in Dry Recyclables'],
        whyExplanation: 'Thermoformed PET polymer tray.'
      }
    ]
  },
  {
    id: 'scan-004',
    timestamp: '2026-10-06T16:40:12Z',
    imageUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80',
    primaryCategory: 'E-Waste',
    primaryCondition: 'Clean',
    overallRecommendation: ['Do NOT place in municipal trash bins', 'Deliver to authorized E-Waste drop-off center or municipal electronic collection drive'],
    explainableAI: 'Identified printed circuit board and lithium battery components (97% confidence). E-Waste contains heavy metals and toxic chemicals that require specialized e-waste recovery.',
    anonymizedTelemetryOptIn: true,
    zone: 'Zone 3 — Industrial Park',
    objects: [
      {
        id: 'obj-6',
        label: 'Electronic Circuit Board & Battery',
        category: 'E-Waste',
        material: 'PCB / Lithium-Ion Assembly',
        confidence: 97,
        box: { x: 10, y: 15, w: 80, h: 70 },
        condition: 'Clean',
        disposalRecommendation: ['Locate nearest E-Waste kiosk', 'Do not incinerate or puncture'],
        whyExplanation: 'Contains copper, gold traces, and lithium compounds requiring hazardous e-waste extraction.'
      }
    ]
  }
];

export const MOCK_REPORTS: WasteReport[] = [
  {
    id: 'ES-2026-001284',
    timestamp: '2026-10-06T12:15:00Z',
    issueType: 'Garbage Accumulation',
    severity: 'HIGH',
    status: 'In Progress',
    location: {
      lat: 37.7749,
      lng: -122.4194,
      address: '742 Market St, Central District',
      zone: 'Zone 2 — Central District'
    },
    photoUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    description: 'Commercial waste bags piled near sidewalk corner, blocking pedestrian walkway and attracting pests.',
    aiAnalysis: {
      detectedIssue: 'Uncollected Commercial Waste Accumulation',
      severityScore: 89,
      confidence: 93,
      interpretation: 'High severity cluster of 12+ plastic bags obstructing public right-of-way.'
    },
    residentConfirmed: false,
    clusterCount: 4
  },
  {
    id: 'ES-2026-001283',
    timestamp: '2026-10-06T10:30:00Z',
    issueType: 'Overflowing Bin',
    severity: 'MEDIUM',
    status: 'Assigned',
    location: {
      lat: 37.7833,
      lng: -122.4167,
      address: 'Civic Center Park North, Gate 3',
      zone: 'Zone 1 — Green Valley'
    },
    photoUrl: 'https://images.unsplash.com/photo-1503596476-1c12a8ba09a9?auto=format&fit=crop&w=800&q=80',
    description: 'Public park dry-waste bin overflowing onto grass after weekend festival.',
    aiAnalysis: {
      detectedIssue: 'Municipal Public Bin Capacity Breach',
      severityScore: 68,
      confidence: 95,
      interpretation: 'Bin capacity at 140%. Overflow consists primarily of paper cups and beverage cans.'
    },
    residentConfirmed: false,
    clusterCount: 2
  },
  {
    id: 'ES-2026-001280',
    timestamp: '2026-10-05T18:45:00Z',
    issueType: 'Illegal Dumping',
    severity: 'HIGH',
    status: 'AI Analysis',
    location: {
      lat: 37.769,
      lng: -122.448,
      address: 'Behind Oak Ridge Industrial Alley 4',
      zone: 'Zone 3 — Industrial Park'
    },
    photoUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80',
    description: 'Bulk furniture and discarded construction debris dumped illegally under bridge overhead.',
    aiAnalysis: {
      detectedIssue: 'Hazardous / Construction Bulk Dumping',
      severityScore: 94,
      confidence: 91,
      interpretation: 'Hazardous mixed timber, foam, and drywall debris requiring heavy municipal vehicle deployment.'
    },
    residentConfirmed: false,
    clusterCount: 6
  },
  {
    id: 'ES-2026-001275',
    timestamp: '2026-10-04T14:20:00Z',
    issueType: 'Missed Collection',
    severity: 'LOW',
    status: 'Resolved',
    location: {
      lat: 37.755,
      lng: -122.422,
      address: '210 Mission Residential Way',
      zone: 'Zone 4 — Tech Quarter'
    },
    photoUrl: 'https://images.unsplash.com/photo-1528323273322-d81458248d40?auto=format&fit=crop&w=800&q=80',
    description: 'Residential green organic waste bin missed during Tuesday collection truck route.',
    aiAnalysis: {
      detectedIssue: 'Single-Household Collection Route Skip',
      severityScore: 35,
      confidence: 88,
      interpretation: 'Localized missed bin. Dispatch dispatched secondary collection van.'
    },
    residentConfirmed: true
  }
];

export const MOCK_ZONE_METRICS: ZoneMetric[] = [
  {
    zoneId: 'Z1',
    zoneName: 'Zone 1 — Green Valley',
    scansThisMonth: 412,
    segregationRate: 84,
    activeIssues: 3,
    collectionReliability: 96,
    dominantCategory: 'Wet / Organic'
  },
  {
    zoneId: 'Z2',
    zoneName: 'Zone 2 — Central District',
    scansThisMonth: 680,
    segregationRate: 64,
    activeIssues: 12,
    collectionReliability: 82,
    dominantCategory: 'Dry / Recyclable (PET & Packaging)'
  },
  {
    zoneId: 'Z3',
    zoneName: 'Zone 3 — Industrial Park',
    scansThisMonth: 210,
    segregationRate: 58,
    activeIssues: 8,
    collectionReliability: 79,
    dominantCategory: 'Non-Recyclable / E-Waste'
  },
  {
    zoneId: 'Z4',
    zoneName: 'Zone 4 — Tech Quarter',
    scansThisMonth: 540,
    segregationRate: 91,
    activeIssues: 2,
    collectionReliability: 98,
    dominantCategory: 'Dry / Recyclable (Paper & Cardboard)'
  }
];

export const MOCK_DAILY_TRENDS: DailyTrend[] = [
  { date: 'Sep 30', scans: 85, recyclable: 42, organic: 28, nonRecyclable: 15, forecastKg: 680 },
  { date: 'Oct 01', scans: 92, recyclable: 48, organic: 30, nonRecyclable: 14, forecastKg: 695 },
  { date: 'Oct 02', scans: 110, recyclable: 55, organic: 35, nonRecyclable: 20, forecastKg: 710 },
  { date: 'Oct 03', scans: 134, recyclable: 68, organic: 42, nonRecyclable: 24, forecastKg: 730 },
  { date: 'Oct 04', scans: 128, recyclable: 64, organic: 40, nonRecyclable: 24, forecastKg: 725 },
  { date: 'Oct 05', scans: 145, recyclable: 74, organic: 46, nonRecyclable: 25, forecastKg: 745 },
  { date: 'Oct 06', scans: 162, recyclable: 84, organic: 52, nonRecyclable: 26, forecastKg: 760 },
  // 30-Day Forecast projections
  { date: 'Oct 07 (FC)', scans: 168, recyclable: 88, organic: 54, nonRecyclable: 26, forecastKg: 768 },
  { date: 'Oct 08 (FC)', scans: 172, recyclable: 90, organic: 55, nonRecyclable: 27, forecastKg: 775 },
  { date: 'Oct 09 (FC)', scans: 178, recyclable: 93, organic: 57, nonRecyclable: 28, forecastKg: 785 },
  { date: 'Oct 10 (FC)', scans: 185, recyclable: 98, organic: 59, nonRecyclable: 28, forecastKg: 800 }
];

export const MOCK_ECOSCORE: EcoScore = {
  totalScore: 78,
  segregationScore: 82,
  awarenessScore: 89,
  participationScore: 74,
  wasteReductionScore: 68,
  activeStreakDays: 14,
  communityMilestone: 'Top 15% Cleaner Neighborhood Distinction'
};
