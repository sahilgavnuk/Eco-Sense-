export type Language = 'en' | 'mr';

export interface Translations {
  // Brand & Nav
  brandTitle: string;
  brandSubtitle: string;
  navHome: string;
  navScanner: string;
  navCommunity: string;
  navEcoScore: string;
  navCopilot: string;
  navReport: string;
  navDashboard: string;
  scanWasteCta: string;
  langSwitch: string;
  langSwitchLabel: string;

  // Zones
  zone1Name: string;
  zone2Name: string;
  zoneActiveAiBadge: string;
  zoneSelectPrompt: string;

  // Categories & Conditions
  catDryRecyclable: string;
  catWetOrganic: string;
  catNonRecyclable: string;
  catEWaste: string;
  catHazardous: string;
  catSpecialHandling: string;
  condClean: string;
  condSlightlyContaminated: string;
  condHeavilyContaminated: string;
  condMixedMaterial: string;

  // Hero / Landing
  heroBadge: string;
  heroTitle1: string;
  heroTitle2: string;
  heroSubtitle: string;
  heroScanBtn: string;
  heroExploreBtn: string;
  problemBadge: string;
  problemTitle: string;
  problemSubtitle: string;
  problemCard1Title: string;
  problemCard1Desc: string;
  problemCard2Title: string;
  problemCard2Desc: string;
  problemCard3Title: string;
  problemCard3Desc: string;

  // Telemetry Story
  telemetrySectionBadge: string;
  telemetrySectionTitle: string;
  telemetrySectionDesc: string;
  telemetryStep1Title: string;
  telemetryStep1Desc: string;
  telemetryStep2Title: string;
  telemetryStep2Desc: string;
  telemetryStep3Title: string;
  telemetryStep3Desc: string;
  telemetryStep4Title: string;
  telemetryStep4Desc: string;

  // Ecosystem Section
  ecosystemBadge: string;
  ecosystemTitle: string;
  ecosystemCard1Title: string;
  ecosystemCard1Desc: string;
  ecosystemCard1Cta: string;
  ecosystemCard2Title: string;
  ecosystemCard2Desc: string;
  ecosystemCard2Cta: string;
  ecosystemCard3Title: string;
  ecosystemCard3Desc: string;
  ecosystemCard3Cta: string;

  // Final CTA
  ctaBannerTitle1: string;
  ctaBannerTitle2: string;
  ctaBannerDesc: string;
  ctaBannerBtn: string;

  // Scanner
  scannerHeaderBadge: string;
  scannerHeaderTitle: string;
  scannerHeaderDesc: string;
  scannerLiveCamera: string;
  scannerCloseCamera: string;
  scannerUpload: string;
  scannerCapture: string;
  scannerClear: string;
  scannerSelectZone: string;
  scannerTelemetryCheck: string;
  scannerPrivacy: string;
  scannerSuccessLogged: string;
  scannerViewTelemetry: string;
  scannerStep1: string;
  scannerStep2: string;
  scannerStep3: string;
  scannerStep4: string;
  scannerStep5: string;
  scannerReadyTitle: string;
  scannerReadyDesc: string;
  scannerInspectingTitle: string;
  scannerErrorTitle: string;
  scannerErrorDesc: string;
  scannerObjectsDetected: string;
  scannerTapToInspect: string;
  scannerRecommendation: string;
  scannerExplainable: string;
  scannerImpact: string;
  scannerConfidence: string;
  scannerMaterial: string;
  scannerCondition: string;
  scannerEcoSenseProtocol: string;

  // Analytics
  analyticsBadge: string;
  analyticsTitle: string;
  analyticsDesc: string;
  analyticsExport: string;
  kpiTotalScans: string;
  kpiPlasticShare: string;
  kpiSegregation: string;
  kpiInputsDesc: string;
  kpiLiveTelemetry: string;
  kpiPlasticSub: string;
  kpiSegregationSub: string;
  insightEngineBadge: string;
  insightKokanTitle: string;
  insightKokanDesc: string;
  insightNspTitle: string;
  insightNspDesc: string;
  insightActionTitle: string;
  insightActionDesc: string;
  analyticsBreakdownTitle: string;
  trendChartTitle: string;
  trendTotalScans: string;
  trendRecyclable: string;
  trendOrganic: string;
  catPetPlastic: string;
  catWetOrganicLabel: string;
  catPaperCardboard: string;
  catEWasteHazardous: string;
  zoneTableTitle: string;
  zoneColName: string;
  zoneColScans: string;
  zoneColSegregation: string;
  zoneColDominant: string;
  zoneColIssues: string;
  unitScans: string;
  unitIssues: string;

  // EcoScore
  ecoScoreBadge: string;
  ecoScoreTitle: string;
  ecoScoreDesc: string;
  ecoScoreStreak: string;
  ecoScoreDays: string;
  ecoScoreGaugeTitle: string;
  ecoScoreOutOf100: string;
  ecoScoreNote: string;
  ecoScoreDimensions: string;
  ecoMilestone: string;
  dimSegregationAccuracy: string;
  dimCommunityAwareness: string;
  dimResidentParticipation: string;
  dimWasteReduction: string;
  ecoScoreFooterNotice: string;
  circularBadge: string;
  circularTitle: string;
  circularStep1: string;
  circularStep2: string;
  circularStep3: string;
  circularStep4: string;
  circularStep5: string;
  ecoChallengeTitle: string;
  challenge1Badge: string;
  challenge1Participants: string;
  challenge1Title: string;
  challenge1Desc: string;
  challenge2Badge: string;
  challenge2Participants: string;
  challenge2Title: string;
  challenge2Desc: string;
  joinChallenge: string;
  joinedChallenge: string;

  // Copilot
  copilotBadge: string;
  copilotTitle: string;
  copilotDesc: string;
  copilotSubtitle: string;
  copilotPlaceholder: string;
  copilotSend: string;
  copilotClear: string;
  copilotSuggested: string;
  copilotLiveAi: string;
  copilotKnowledgeEngine: string;
  copilotApiKey: string;
  copilotRemoveKey: string;
  copilotSaveKey: string;
  copilotKeyPrompt: string;
  copilotTyping: string;

  // Report Issue
  reportBadge: string;
  reportTitle: string;
  reportDesc: string;
  reportStorageTitle: string;
  reportStorageNotice: string;
  reportFormTitle: string;
  reportFormSubtitle: string;
  reportCategory: string;
  reportPhoto: string;
  reportPhotoNote: string;
  reportTakePhoto: string;
  reportUploadFile: string;
  reportRetake: string;
  reportSample: string;
  reportLocation: string;
  reportLocateBtn: string;
  reportGpsVerified: string;
  reportLocating: string;
  reportDescription: string;
  reportDescPlaceholder: string;
  reportSubmitBtn: string;
  reportAnalyzingBtn: string;
  reportTicketBadge: string;
  reportAiPriority: string;
  reportAiAnalysisResult: string;
  reportTimelineTitle: string;
  reportLiveStatus: string;
  timelineStep1: string;
  timelineStep2: string;
  timelineStep3: string;
  timelineStep4: string;
  timelineStep5: string;
  reportFeedTitle: string;
  reportFeedSubtitle: string;
  reportFilterAll: string;
  reportFilterHigh: string;
  reportFilterMedium: string;
  reportConfirmResolved: string;
  reportResolved: string;
  issueGarbage: string;
  issueOverflow: string;
  issueDumping: string;
  issueMissed: string;
  issueSegregation: string;
  issueOther: string;

  // Severity & Status
  sevHigh: string;
  sevMedium: string;
  sevLow: string;
  statusAiAnalysis: string;
  statusAssigned: string;
  statusInProgress: string;
  statusResolved: string;

  // Roles
  roleResident: string;
  roleCoordinator: string;
  roleAdmin: string;

  // Login / Dashboard
  loginModalTitle: string;
  loginModalDesc: string;
  loginWelcome: string;
  loginWelcomeUser: string;
  loginProfileUpdated: string;
  loginSubtitle: string;
  loginNameLabel: string;
  loginNamePlaceholder: string;
  loginEmailLabel: string;
  loginEmailPlaceholder: string;
  loginZoneLabel: string;
  loginRoleLabel: string;
  loginSubmitBtn: string;
  loginLogoutBtn: string;
  loginGuest: string;
  loginChangeUser: string;
  dashAuthSession: string;
  dashPortalSuffix: string;
  dashEditProfile: string;
  dashPrimaryAction: string;
  dashReadyTitle: string;
  dashReadyDesc: string;
  dashScanNow: string;
  dashSnapshotTitle: string;
  dashViewSuffix: string;
  dashLiveTelemetryBadge: string;
  dashYourScans: string;
  dashYourScansSub: string;
  dashActiveIssues: string;
  dashActiveIssuesSub: string;
  dashEcoScore: string;
  dashEcoScoreSub: string;
  unitItems: string;
  unitReports: string;
  dashCoordTitle: string;
  dashCoordCard1Title: string;
  dashCoordCard1Desc: string;
  dashCoordCard2Title: string;
  dashCoordCard2Desc: string;
  dashAdminTitle: string;
  dashAdminSubtitle: string;
  dashAdminActiveZones: string;
  dashAdminTotalTelemetry: string;
  dashAdminApiHealth: string;
  adminScansIndexed: string;
  adminActiveZonesVal: string;
  adminSystemHealthVal: string;

  // Footer
  footerDesc: string;
  footerPrivacy: string;
  footerCoreTitle: string;
  footerZonesTitle: string;
  footerEngine: string;
  footerStandards: string;
  footerRights: string;
  footerMadeWith: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    brandTitle: 'EcoSense',
    brandSubtitle: 'Waste Intelligence',
    navHome: 'Home',
    navScanner: 'AI Scanner',
    navCommunity: 'Community',
    navEcoScore: 'EcoScore',
    navCopilot: 'AI Copilot',
    navReport: 'Report Issue',
    navDashboard: 'Dashboard',
    scanWasteCta: 'Scan Waste',
    langSwitch: 'मराठी',
    langSwitchLabel: 'मराठी मध्ये बदला',

    zone1Name: 'Zone 1 — Kokan Region',
    zone2Name: 'Zone 2 — NSP East/West & Virar',
    zoneActiveAiBadge: 'Active 2-Zone AI',
    zoneSelectPrompt: 'Select Target Zone for Telemetry',

    catDryRecyclable: 'Dry / Recyclable',
    catWetOrganic: 'Wet / Organic',
    catNonRecyclable: 'Non-Recyclable',
    catEWaste: 'E-Waste',
    catHazardous: 'Hazardous',
    catSpecialHandling: 'Special Handling',
    condClean: 'Clean',
    condSlightlyContaminated: 'Slightly Contaminated',
    condHeavilyContaminated: 'Heavily Contaminated',
    condMixedMaterial: 'Mixed-material',

    heroBadge: 'The AI Waste Intelligence Platform',
    heroTitle1: 'Waste is everywhere.',
    heroTitle2: "Insight shouldn't be.",
    heroSubtitle: 'Scan any waste item with AI, understand what it is, discover how to dispose of it correctly, and help your community build smarter waste intelligence.',
    heroScanBtn: 'Scan Your Waste Now',
    heroExploreBtn: 'Explore Community Intelligence',
    problemBadge: '01 — The Daily Waste Challenge',
    problemTitle: 'Waste decisions happen every single day.',
    problemSubtitle: 'Most residents face confusion at the bin. EcoSense AI eliminates guesswork.',
    problemCard1Title: '"What is this item?"',
    problemCard1Desc: 'Multi-layer packaging, take-out wrappers, and electronic items often confuse households.',
    problemCard2Title: '"Is it contaminated?"',
    problemCard2Desc: 'Food residues and oils ruin entire dry recycling batches without visual clarity.',
    problemCard3Title: '"Where does it belong?"',
    problemCard3Desc: 'EcoSense provides instant stepwise disposal protocol (Empty → Rinse → Dry → Bin).',

    telemetrySectionBadge: '02 — 2-Zone Telemetry Network',
    telemetrySectionTitle: 'Every scan powers real-time Kokan & NSP/Virar intelligence.',
    telemetrySectionDesc: 'Turning individual citizen actions into systemic municipal optimization across exactly 2 defined telemetry zones.',
    telemetryStep1Title: 'Citizen Scans Waste',
    telemetryStep1Desc: 'Residents capture photos via mobile camera or gallery for real-time AI classification.',
    telemetryStep2Title: 'Visual Classification',
    telemetryStep2Desc: 'Multi-class identification, contamination score, and actionable disposal guidance.',
    telemetryStep3Title: 'Aggregated Telemetry',
    telemetryStep3Desc: 'Anonymized scan counts feed directly into 2-zone municipal dashboards.',
    telemetryStep4Title: 'Targeted Action',
    telemetryStep4Desc: 'Optimized truck collection routes and localized public awareness campaigns.',

    ecosystemBadge: '03 — The EcoSense AI Platform',
    ecosystemTitle: 'A complete waste intelligence ecosystem.',
    ecosystemCard1Title: 'Live 2-Zone Telemetry',
    ecosystemCard1Desc: 'Monitor total scans, contamination rates, and ward hotspots across Kokan & NSP/Virar in real time.',
    ecosystemCard1Cta: 'Explore Telemetry Data',
    ecosystemCard2Title: 'EcoScore & Challenges',
    ecosystemCard2Desc: 'Earn Eco-Points, join neighborhood cleanup challenges, and unlock green citizen badges.',
    ecosystemCard2Cta: 'View Community Challenges',
    ecosystemCard3Title: 'Community Issue Reporting',
    ecosystemCard3Desc: 'Report illegal dumping, bin overflow, and track municipal resolution with AI severity scoring.',
    ecosystemCard3Cta: 'File Waste Incident',

    ctaBannerTitle1: 'Start scanning waste with AI.',
    ctaBannerTitle2: 'Help keep Kokan & NSP/Virar cleaner.',
    ctaBannerDesc: 'No specialized hardware needed. Simply point your phone camera and get instant AI disposal intelligence.',
    ctaBannerBtn: 'Launch Live AI Scanner',

    scannerHeaderBadge: 'Live Computer Vision Engine',
    scannerHeaderTitle: 'Scan & Classify Waste in Real Time',
    scannerHeaderDesc: 'Point your camera at any waste item. AI detects material type, evaluates contamination level, and gives step-by-step disposal instructions.',
    scannerLiveCamera: 'Start Live Camera',
    scannerCloseCamera: 'Close Camera',
    scannerUpload: 'Upload Photo',
    scannerCapture: 'Capture & Analyze',
    scannerClear: 'Clear / Scan Another',
    scannerSelectZone: 'Select Active Zone for Telemetry',
    scannerTelemetryCheck: 'Contribute anonymized scan data to community intelligence',
    scannerPrivacy: 'Photos are analyzed in memory; only material category metadata is aggregated.',
    scannerSuccessLogged: 'Scan recorded successfully in telemetry stream',
    scannerViewTelemetry: 'View Telemetry Analytics →',
    scannerStep1: 'Capturing optical frame…',
    scannerStep2: 'Detecting object boundaries…',
    scannerStep3: 'Analyzing material polymers & texture…',
    scannerStep4: 'Assessing contamination level…',
    scannerStep5: 'Generating verified disposal protocol…',
    scannerReadyTitle: 'AI Scanner Ready',
    scannerReadyDesc: 'Start your live camera or upload a photo from your gallery to classify waste.',
    scannerInspectingTitle: 'Inspecting item…',
    scannerErrorTitle: 'Scan Error',
    scannerErrorDesc: 'Could not complete scan. Please try again with better lighting.',
    scannerObjectsDetected: 'Object(s) Detected',
    scannerTapToInspect: 'Tap bounding box to inspect details',
    scannerRecommendation: 'Certified Disposal Protocol',
    scannerExplainable: 'Explainable AI Analysis',
    scannerImpact: 'Telemetry logged to Kokan & NSP/Virar intelligence stream.',
    scannerConfidence: 'Confidence',
    scannerMaterial: 'Material:',
    scannerCondition: 'Condition:',
    scannerEcoSenseProtocol: 'EcoSense Certified',

    analyticsBadge: 'Telemetry & Insights',
    analyticsTitle: '2-Zone Community Waste Intelligence',
    analyticsDesc: 'Live aggregated scan telemetry from Zone 1 (Kokan Region) and Zone 2 (NSP East/West & Virar).',
    analyticsExport: 'Export Intelligence CSV',
    kpiTotalScans: 'Total Waste Scans',
    kpiPlasticShare: 'Plastic & PET Share',
    kpiSegregation: 'Segregation Accuracy',
    kpiInputsDesc: 'Aggregated citizen inputs across 2 zones',
    kpiLiveTelemetry: 'Live Telemetry',
    kpiPlasticSub: 'Dominant category in NSP/Virar',
    kpiSegregationSub: 'Up +5.4% this month across Kokan',
    insightEngineBadge: 'EcoSense AI 2-Zone Insight Engine',
    insightKokanTitle: '01 — Kokan Region Telemetry',
    insightKokanDesc: 'Kokan region shows high organic and bio-waste generation (38%), with an 84% segregation accuracy into organic compost streams.',
    insightNspTitle: '02 — NSP East/West & Virar',
    insightNspDesc: 'PET plastic packaging and takeaway wrappers constitute 48% of scans near Station and Commercial areas, requiring rinse awareness.',
    insightActionTitle: '03 — Action Plan',
    insightActionDesc: 'Targeted "Empty & Rinse" drive in NSP/Virar and coastal biomethanation support in Kokan.',
    analyticsBreakdownTitle: 'Waste Category Composition',
    trendChartTitle: 'Daily Scan Telemetry (Kokan & NSP/Virar)',
    trendTotalScans: 'Total Scans',
    trendRecyclable: 'Recyclable',
    trendOrganic: 'Organic Scraps',
    catPetPlastic: 'PET & Plastic Packaging',
    catWetOrganicLabel: 'Wet / Organic Waste',
    catPaperCardboard: 'Paper & Cardboard',
    catEWasteHazardous: 'E-Waste & Hazardous',
    zoneTableTitle: 'Zone-Level Waste Intelligence Breakdown (2 Zones)',
    zoneColName: 'Zone Name',
    zoneColScans: 'Scans This Month',
    zoneColSegregation: 'Segregation Index',
    zoneColDominant: 'Dominant Waste Category',
    zoneColIssues: 'Active Issues',
    unitScans: 'scans',
    unitIssues: 'issues',

    ecoScoreBadge: 'Community Sustainability Index',
    ecoScoreTitle: 'EcoScore & Community Action',
    ecoScoreDesc: 'Turn waste identification into community action. Track your neighborhood EcoScore, maintain scan streaks, and participate in sustainability drives.',
    ecoScoreStreak: 'Active Scan Streak',
    ecoScoreDays: 'Days',
    ecoScoreGaugeTitle: 'Kokan & NSP/Virar EcoScore',
    ecoScoreOutOf100: 'OUT OF 100',
    ecoScoreNote: '* EcoScore aggregates scan volumes, segregation compliance, and rapid issue resolution.',
    ecoScoreDimensions: 'EcoScore Performance Dimensions',
    ecoMilestone: 'Top 15% Cleaner Neighborhood Distinction (Kokan & NSP/Virar)',
    dimSegregationAccuracy: 'Segregation Accuracy Index',
    dimCommunityAwareness: 'Community Awareness Rate',
    dimResidentParticipation: 'Resident Action Participation',
    dimWasteReduction: 'Waste Generation Reduction',
    ecoScoreFooterNotice: 'Community Index updated daily from verified Kokan & NSP/Virar scanner telemetry inputs.',
    circularBadge: 'Circular Economy Protocol',
    circularTitle: "Waste doesn't have to end at disposal.",
    circularStep1: '1. USE',
    circularStep2: '2. SCAN & SORT',
    circularStep3: '3. RECOVER',
    circularStep4: '4. REUSE',
    circularStep5: '5. RECYCLE',
    ecoChallengeTitle: 'Active Neighborhood Challenges',
    challenge1Badge: 'Monthly Goal',
    challenge1Participants: '189 Participants',
    challenge1Title: 'Plastic Packaging Reduction Drive',
    challenge1Desc: 'Reduce single-use PET bottles and multi-layer film packaging across Kokan & NSP/Virar through reusable alternatives.',
    challenge2Badge: 'E-Waste Safety',
    challenge2Participants: '210 Participants',
    challenge2Title: 'Community E-Waste & Battery Drive',
    challenge2Desc: 'Identify and drop off unused electronics or lithium batteries safely at authorized municipal collection points.',
    joinChallenge: 'Join Challenge',
    joinedChallenge: 'Challenge Joined',

    copilotBadge: 'Professional Waste Engineer AI',
    copilotTitle: 'EcoSense Copilot — Waste Intelligence Assistant',
    copilotDesc: 'Authoritative guidance on recycling protocols, resin codes, toxic e-waste prevention, composting, and municipal standards.',
    copilotSubtitle: 'Waste Segregation · 2-Zone Compliance (Kokan & NSP/Virar) · 24/7 AI Guidance',
    copilotPlaceholder: 'Ask about any waste item, recycling rules, composting, or zone protocol...',
    copilotSend: 'Consult',
    copilotClear: 'Clear Chat',
    copilotSuggested: 'Quick Questions:',
    copilotLiveAi: 'Live AI Active',
    copilotKnowledgeEngine: 'Smart Knowledge Engine',
    copilotApiKey: 'API Key',
    copilotRemoveKey: 'Remove',
    copilotSaveKey: 'Save Key',
    copilotKeyPrompt: 'Paste your Google AI Studio API Key to enable direct generative model responses:',
    copilotTyping: 'Analyzing disposal protocols…',

    reportBadge: 'Smart Geospatial Waste Reporting',
    reportTitle: 'See a problem? Report it immediately.',
    reportDesc: 'Report uncollected garbage, illegal dumping, or bin overflows. EcoSense AI automatically analyzes severity, records zone metrics, and updates local dispatch.',
    reportStorageTitle: 'Data Storage & Local Architecture',
    reportStorageNotice: '💾 Data Storage: All reports are securely persisted to your local browser storage (localStorage) and integrated with Kokan & NSP/Virar telemetry.',
    reportFormTitle: 'New Incident Report',
    reportFormSubtitle: '2-Zone Dispatch Form',
    reportCategory: 'Issue Category',
    reportPhoto: 'Incident Photo Proof',
    reportPhotoNote: 'Camera or file upload',
    reportTakePhoto: 'Take Photo',
    reportUploadFile: 'Upload File',
    reportRetake: 'Retake',
    reportSample: 'Sample',
    reportLocation: 'Geospatial Location & Zone',
    reportLocateBtn: 'Lock GPS',
    reportGpsVerified: 'GPS Verified ✓',
    reportLocating: 'Locating...',
    reportDescription: 'Incident Description',
    reportDescPlaceholder: 'Describe waste accumulation, landmark, or bin condition...',
    reportSubmitBtn: 'Submit Report to Municipal Dispatch',
    reportAnalyzingBtn: 'AI Analyzing & Submitting…',
    reportTicketBadge: 'Dispatch Ticket',
    reportAiPriority: 'AI Severity Assessment',
    reportAiAnalysisResult: 'AI Triage & Route Recommendation:',
    reportTimelineTitle: 'Resolution Timeline',
    reportLiveStatus: 'DISPATCH ACTIVE',
    timelineStep1: 'Reported',
    timelineStep2: 'AI Analysis',
    timelineStep3: 'Assigned',
    timelineStep4: 'In Progress',
    timelineStep5: 'Resolved',
    reportFeedTitle: 'Recent Community Reports Feed',
    reportFeedSubtitle: 'Active incidents logged across 2 zones',
    reportFilterAll: 'All Reports',
    reportFilterHigh: 'High Severity',
    reportFilterMedium: 'Medium',
    reportConfirmResolved: 'Confirm Resolved',
    reportResolved: 'Resolved & Verified',
    issueGarbage: 'Garbage Accumulation',
    issueOverflow: 'Overflowing Bin',
    issueDumping: 'Illegal Dumping',
    issueMissed: 'Missed Collection',
    issueSegregation: 'Improper Segregation',
    issueOther: 'Other Issue',

    sevHigh: 'HIGH',
    sevMedium: 'MEDIUM',
    sevLow: 'LOW',
    statusAiAnalysis: 'AI Analysis',
    statusAssigned: 'Assigned',
    statusInProgress: 'In Progress',
    statusResolved: 'Resolved',

    roleResident: 'Resident',
    roleCoordinator: 'Coordinator',
    roleAdmin: 'Administrator',

    loginModalTitle: 'User Profile & Zone Access',
    loginModalDesc: 'Switch roles to test Resident, Ward Coordinator, and Municipal Administrator views.',
    loginWelcome: 'Welcome to EcoSense AI',
    loginWelcomeUser: 'Welcome back',
    loginProfileUpdated: 'Profile updated successfully.',
    loginSubtitle: 'Participate in telemetry, report waste, and boost your neighborhood EcoScore.',
    loginNameLabel: 'Your Full Name',
    loginNamePlaceholder: 'e.g. Sahil Sawant',
    loginEmailLabel: 'Email / Phone',
    loginEmailPlaceholder: 'e.g. user@ecosense.org',
    loginZoneLabel: 'Assigned Telemetry Zone',
    loginRoleLabel: 'Role / Access Level',
    loginSubmitBtn: 'Save Profile & Enter Portal',
    loginLogoutBtn: 'Log Out / Switch Account',
    loginGuest: 'Guest User',
    loginChangeUser: 'Switch User',
    dashAuthSession: 'Authenticated Session',
    dashPortalSuffix: 'Portal',
    dashEditProfile: 'Edit Profile / Switch Role',
    dashPrimaryAction: 'Primary Action',
    dashReadyTitle: 'Ready to scan and classify waste today?',
    dashReadyDesc: 'Capture an item photo. Get instant disposal instructions while contributing to verified Kokan & NSP/Virar telemetry.',
    dashScanNow: 'Open AI Scanner',
    dashSnapshotTitle: 'Community Telemetry Snapshot',
    dashViewSuffix: 'View',
    dashLiveTelemetryBadge: 'Live 2-Zone Telemetry',
    dashYourScans: 'Your Scans This Month',
    dashYourScansSub: '96% Segregation Accuracy',
    dashActiveIssues: 'Active Neighborhood Issues',
    dashActiveIssuesSub: 'Kokan & NSP/Virar incidents',
    dashEcoScore: 'Community EcoScore',
    dashEcoScoreSub: 'Total Waste Inputs',
    unitItems: 'items',
    unitReports: 'reports',
    dashCoordTitle: 'Ward Coordinator Management Panel',
    dashCoordCard1Title: 'Zone 2 (NSP/Virar) Inspection Order',
    dashCoordCard1Desc: 'Review high-severity clusters near Station Road & Bypass.',
    dashCoordCard2Title: 'Zone 1 (Kokan) Coastal Cleanup Drive',
    dashCoordCard2Desc: 'Coordinate organic waste composting workshops in coastal belt.',
    dashAdminTitle: 'Municipal Administrator Console',
    dashAdminSubtitle: '2-Zone Data Pipeline Active',
    dashAdminActiveZones: 'Active Zones',
    dashAdminTotalTelemetry: 'Total Scans Telemetry',
    dashAdminApiHealth: 'System Health',
    adminScansIndexed: 'Scans Indexed',
    adminActiveZonesVal: '2 Zones (Kokan & NSP/Virar)',
    adminSystemHealthVal: '200 OK (14ms latency)',

    footerDesc: 'AI-Powered Community Waste Intelligence Platform serving Zone 1 (Kokan Region) and Zone 2 (NSP East/West & Virar).',
    footerPrivacy: 'Anonymized Privacy-First Architecture',
    footerCoreTitle: 'Platform Core',
    footerZonesTitle: 'Covered Zones',
    footerEngine: 'Gemini Vision AI Engine',
    footerStandards: 'CPCB Recycling Standards',
    footerRights: '© 2026 EcoSense AI Platform. All rights reserved.',
    footerMadeWith: 'Built with ❤️ for Kokan & NSP/Virar.'
  },
  mr: {
    brandTitle: 'इकोसेन्स',
    brandSubtitle: 'कचरा व्यवस्थापन बुद्धिमत्ता',
    navHome: 'मुख्यपृष्ठ',
    navScanner: 'एआय स्कॅनर',
    navCommunity: 'समुदाय माहिती',
    navEcoScore: 'इको-स्कोअर',
    navCopilot: 'एआय सहाय्यक',
    navReport: 'तक्रार नोंदवा',
    navDashboard: 'माझे डॅशबोर्ड',
    scanWasteCta: 'कचरा स्कॅन करा',
    langSwitch: 'English',
    langSwitchLabel: 'Switch to English',

    zone1Name: 'झोन १ — कोकण विभाग (Kokan Region)',
    zone2Name: 'झोन २ — नालासोपारा (NSP) पूर्व/पश्चिम व विरार',
    zoneActiveAiBadge: 'सक्रिय २-झोन एआय',
    zoneSelectPrompt: 'नोंदणीसाठी झोन निवडा',

    catDryRecyclable: 'सुका / पुनर्वापरयोग्य कचरा',
    catWetOrganic: 'ओला / सेंद्रिय कचरा',
    catNonRecyclable: 'पुनर्वापर न होणारा कचरा',
    catEWaste: 'ई-कचरा (इलेक्ट्रॉनिक्स)',
    catHazardous: 'घातक / विषारी कचरा',
    catSpecialHandling: 'विशेष हाताळणी कचरा',
    condClean: 'स्वच्छ',
    condSlightlyContaminated: 'किंचित दूषित / तेलकट',
    condHeavilyContaminated: 'अत्यंत दूषित / घाण',
    condMixedMaterial: 'मिश्र कचरा',

    heroBadge: 'एआय कचरा व्यवस्थापन प्रणाली',
    heroTitle1: 'कचरा सगळीकडे आहे.',
    heroTitle2: 'योग्य माहिती आता तुमच्या हातात आहे.',
    heroSubtitle: 'कोणत्याही कचऱ्याचे एआय द्वारे स्कॅनिंग करा, त्याचे योग्य वर्गीकरण समजून घ्या, विल्हेवाटीची योग्य कृती जाणून घ्या आणि आपल्या परिसराला स्वच्छ ठेवा.',
    heroScanBtn: 'आता कचरा स्कॅन करा',
    heroExploreBtn: 'समुदाय माहिती पाहा',
    problemBadge: '०१ — दैनंदिन कचऱ्याचे आव्हान',
    problemTitle: 'कचऱ्याचे योग्य नियोजन दररोज आवश्यक आहे.',
    problemSubtitle: 'कचरा कोणत्या डब्यात टाकावा याबाबतचा संभ्रम इकोसेन्स एआय दूर करते.',
    problemCard1Title: '"हा कोणता कचरा आहे?"',
    problemCard1Desc: 'मल्टी-लेयर प्लॅस्टिक, अन्न पॅकेट्स व इलेक्ट्रॉनिक वस्तूंचे वर्गीकरण ओळखणे कठीण असते.',
    problemCard2Title: '"हा कचरा दूषित आहे का?"',
    problemCard2Desc: 'अन्न किंवा तेलाचे अंश संपूर्ण सुक्या कचऱ्याची प्रत खराब करतात. एआय तात्काळ दूषितता ओळखते.',
    problemCard3Title: '"हा कचरा कुठे टाकावा?"',
    problemCard3Desc: 'इकोसेन्स क्रमवार विल्हेवाट पद्धत सांगते (रिकामे करा → धुवा → सुकवा → रिसायकल करा).',

    telemetrySectionBadge: '०२ — २-झोन पर्यावरण डेटा नेटवर्क',
    telemetrySectionTitle: 'प्रत्येक स्कॅनमुळे कोकण व नालासोपारा-विरारमध्ये स्वच्छता सुधारते.',
    telemetrySectionDesc: 'नागरिकांच्या प्रत्येक स्कॅनचे विश्लेषण करून महापालिका आणि परिसरासाठी उपयुक्त कचरा माहिती तयार केली जाते.',
    telemetryStep1Title: 'नागरिक कचरा स्कॅन करतात',
    telemetryStep1Desc: 'मोबाईल कॅमेरा किंवा गॅलरीतून फोटो काढून तात्काळ एआय विश्लेषण मिळवा.',
    telemetryStep2Title: 'एआय अचूक वर्गीकरण',
    telemetryStep2Desc: 'कचरा प्रकार, दूषिततेचे प्रमाण आणि विल्हेवाटीची योग्य पायरी तात्काळ स्क्रीनवर दिसते.',
    telemetryStep3Title: '२-झोन डेटा संकलन',
    telemetryStep3Desc: 'सर्व माहिती थेट कोकण व नालासोपारा-विरारच्या पर्यावरण डॅशबोर्डवर जोडली जाते.',
    telemetryStep4Title: 'स्थानिक कृती व सुधारणा',
    telemetryStep4Desc: 'कचरा उचलण्याच्या गाड्यांचे नियोजन आणि जनजागृती मोहिमा अधिक प्रभावी बनतात.',

    ecosystemBadge: '०३ — इकोसेन्स एआय व्यासपीठ',
    ecosystemTitle: 'स्वच्छतेसाठी संपूर्ण डिजिटल परिसंस्था.',
    ecosystemCard1Title: 'थेट २-झोन माहिती व आकडेवारी',
    ecosystemCard1Desc: 'कोकण आणि नालासोपारा-विरारमधील एकूण स्कॅन, वर्गीकरण प्रमाण आणि हॉटस्पॉट्स पहा.',
    ecosystemCard1Cta: 'आकडेवारी पाहा',
    ecosystemCard2Title: 'इको-स्कोअर आणि आव्हाने',
    ecosystemCard2Desc: 'कचरा वर्गीकरणासाठी इको-पॉइंट्स मिळवा, स्वच्छता मोहिमेत सहभागी व्हा आणि बॅजेस जिंका.',
    ecosystemCard2Cta: 'आव्हाने पहा',
    ecosystemCard3Title: 'कचरा समस्या तक्रार निवारण',
    ecosystemCard3Desc: 'कचरा साचणे किंवा कचरापेटी भरल्याची तक्रार नोंदवा. एआय द्वारे प्राधान्य निश्चित होते.',
    ecosystemCard3Cta: 'तक्रार नोंदवा',

    ctaBannerTitle1: 'आजच एआय द्वारे कचरा स्कॅन करण्यास सुरुवात करा.',
    ctaBannerTitle2: 'आपला परिसर स्वच्छ व सुंदर ठेवण्यास मदत करा.',
    ctaBannerDesc: 'कोणत्याही विशेष साधनांची गरज नाही. आपल्या मोबाईल कॅमेऱ्याने फोटो घ्या आणि योग्य विल्हेवाट सूचना मिळवा.',
    ctaBannerBtn: 'थेट एआय स्कॅनर सुरू करा',

    scannerHeaderBadge: 'थेट कॉम्प्युटर व्हिजन एआय',
    scannerHeaderTitle: 'कचऱ्याचे थेट स्कॅनिंग आणि वर्गीकरण',
    scannerHeaderDesc: 'कॅमेरा कचऱ्यासमोर धरा. एआय वस्तूचा प्रकार, दूषितता आणि विल्हेवाटीची योग्य कृती त्वरित दाखवेल.',
    scannerLiveCamera: 'थेट कॅमेरा सुरू करा',
    scannerCloseCamera: 'कॅमेरा बंद करा',
    scannerUpload: 'गॅलरीतून फोटो निवडा',
    scannerCapture: 'फोटो काढून स्कॅन करा',
    scannerClear: 'साफ करा / नवीन स्कॅन',
    scannerSelectZone: 'डेटा नोंदीसाठी आपला झोन निवडा',
    scannerTelemetryCheck: 'माहिती सुधारण्यासाठी हा स्कॅन डेटा समाविष्ट करा',
    scannerPrivacy: 'फोटो केवळ तपासणीसाठी वापरले जातात; वैयक्तिक माहिती साठवली जात नाही.',
    scannerSuccessLogged: 'स्कॅन यशस्वीरीत्या सिस्टीममध्ये नोंदवला गेला आहे',
    scannerViewTelemetry: 'आकडेवारी पाहा →',
    scannerStep1: 'कॅमेरा फ्रेम तपासत आहे…',
    scannerStep2: 'कचऱ्याची सीमा ओळखत आहे…',
    scannerStep3: 'वस्तूचा प्रकार व पोत तपासत आहे…',
    scannerStep4: 'दूषिततेचे प्रमाण मोजत आहे…',
    scannerStep5: 'प्रमाणित विल्हेवाट कृती तयार करत आहे…',
    scannerReadyTitle: 'एआय स्कॅनर तयार आहे',
    scannerReadyDesc: 'थेट कॅमेरा सुरू करा किंवा गॅलरीतून कचऱ्याचा फोटो निवडून वर्गीकरण तपासा.',
    scannerInspectingTitle: 'तपासणी सुरू आहे…',
    scannerErrorTitle: 'स्कॅनिंग त्रुटी',
    scannerErrorDesc: 'स्कॅन पूर्ण होऊ शकले नाही. कृपया चांगल्या प्रकाशात पुन्हा प्रयत्न करा.',
    scannerObjectsDetected: 'ओळखलेली कचरा वस्तू',
    scannerTapToInspect: 'तपशील पाहण्यासाठी वस्तूवर टॅप करा',
    scannerRecommendation: 'प्रमाणित विल्हेवाट कृती',
    scannerExplainable: 'एआय विश्लेषण कारण',
    scannerImpact: 'कोकण व नालासोपारा-विरार डेटामध्ये नोंद करण्यात आली.',
    scannerConfidence: 'अचूकता',
    scannerMaterial: 'घटक (Material):',
    scannerCondition: 'स्थिती (Condition):',
    scannerEcoSenseProtocol: 'इकोसेन्स प्रमाणित',

    analyticsBadge: 'पर्यावरण डेटा व विश्लेषण',
    analyticsTitle: '२-झोन कचरा व्यवस्थापन आकडेवारी',
    analyticsDesc: 'झोन १ (कोकण विभाग) आणि झोन २ (नालासोपारा पूर्व/पश्चिम व विरार) मधील थेट स्कॅनिंग आकडेवारी.',
    analyticsExport: 'डेटा CSV डाउनलोड करा',
    kpiTotalScans: 'एकूण कचरा स्कॅन्स',
    kpiPlasticShare: 'प्लॅस्टिक व PET प्रमाण',
    kpiSegregation: 'अचूक वर्गीकरण प्रमाण',
    kpiInputsDesc: '२ झोनमधील नागरिकांच्या स्कॅनवर आधारित',
    kpiLiveTelemetry: 'थेट आकडेवारी',
    kpiPlasticSub: 'नालासोपारा-विरारमध्ये सर्वाधिक प्रमाण',
    kpiSegregationSub: 'कोकणात या महिन्यात +५.४% वाढ',
    insightEngineBadge: 'इकोसेन्स एआय २-झोन विश्लेषण इंजिन',
    insightKokanTitle: '०१ — कोकण विभाग विश्लेषण',
    insightKokanDesc: 'कोकणात ओला व सेंद्रिय कचरा ३८% असून ८४% वर्गीकरण अचूकतेसह खतनिर्मितीकडे पाठवला जातो.',
    insightNspTitle: '०२ — नालासोपारा-विरार विश्लेषण',
    insightNspDesc: 'स्टेशन व बाजारपेठ परिसरात PET प्लॅस्टिक व वेष्टने ४८% आढळतात; ते धुवून टाकण्याबाबत जनजागृती हवी.',
    insightActionTitle: '०३ — कृती योजना',
    insightActionDesc: 'नालासोपारा/विरारमध्ये "रिकामे करा व धुवा" मोहीम आणि कोकणात सेंद्रिय खत प्रकल्पांना चालना.',
    analyticsBreakdownTitle: 'कचरा प्रकारांची टक्केवारी',
    trendChartTitle: 'दैनंदिन स्कॅनिंग कल (कोकण व नालासोपारा-विरार)',
    trendTotalScans: 'एकूण स्कॅन्स',
    trendRecyclable: 'पुनर्वापरयोग्य',
    trendOrganic: 'ओला सेंद्रिय',
    catPetPlastic: 'PET व प्लॅस्टिक पॅकेजिंग',
    catWetOrganicLabel: 'ओला / सेंद्रिय कचरा',
    catPaperCardboard: 'कागद व पुठ्ठा',
    catEWasteHazardous: 'ई-कचरा व घातक',
    zoneTableTitle: 'झोननिहाय कचरा विश्लेषण (केवळ २ झोन)',
    zoneColName: 'झोनचे नाव',
    zoneColScans: 'या महिन्यातील स्कॅन',
    zoneColSegregation: 'वर्गीकरण प्रमाण',
    zoneColDominant: 'प्रमुख कचरा प्रकार',
    zoneColIssues: 'सक्रिय तक्रारी',
    unitScans: 'स्कॅन्स',
    unitIssues: 'तक्रारी',

    ecoScoreBadge: 'सामुदायिक पर्यावरण निर्देशांक',
    ecoScoreTitle: 'इको-स्कोअर आणि उपक्रम',
    ecoScoreDesc: 'कचऱ्याचे अचूक वर्गीकरण करून आपल्या परिसराचा इको-स्कोअर वाढवा आणि मोहिमांमध्ये भाग घ्या.',
    ecoScoreStreak: 'सलग स्कॅनिंग दिवस',
    ecoScoreDays: 'दिवस',
    ecoScoreGaugeTitle: 'कोकण व नालासोपारा-विरार इको-स्कोअर',
    ecoScoreOutOf100: '१०० पैकी',
    ecoScoreNote: '* इको-स्कोअर स्कॅन संख्या, अचूक वर्गीकरण आणि जलद तक्रार निवारणावर आधारित आहे.',
    ecoScoreDimensions: 'इको-स्कोअर कामगिरी मापदंड',
    ecoMilestone: 'शीर्ष १५% स्वच्छ परिसर बहुमान (कोकण व नालासोपारा-विरार)',
    dimSegregationAccuracy: 'वर्गीकरण अचूकता निर्देशांक',
    dimCommunityAwareness: 'सामुदायिक जनजागृती प्रमाण',
    dimResidentParticipation: 'नागरिक सहभाग दर',
    dimWasteReduction: 'कचरा घट निर्देशांक',
    ecoScoreFooterNotice: 'कोकण व नालासोपारा-विरार स्कॅनर इनपुटवरून निर्देशांक दररोज अपडेट होतो.',
    circularBadge: 'चक्रीय अर्थव्यवस्था नियमावली',
    circularTitle: 'कचरा टाकण्याने प्रवास संपत नाही.',
    circularStep1: '१. वापरा',
    circularStep2: '२. स्कॅन व वर्गीकरण',
    circularStep3: '३. संकलन',
    circularStep4: '४. पुनर्वापर',
    circularStep5: '५. रिसायकलिंग',
    ecoChallengeTitle: 'सक्रिय सामुदायिक आव्हाने',
    challenge1Badge: 'मासिक ध्येय',
    challenge1Participants: '१८९ सहभागी',
    challenge1Title: 'प्लॅस्टिक पॅकेजिंग घट मोहीम',
    challenge1Desc: 'पुनर्वापरयोग्य पर्यायांचा वापर करून कोकण व नालासोपारा-विरारमध्ये एकल-वापर प्लॅस्टिक कमी करा.',
    challenge2Badge: 'ई-कचरा सुरक्षा',
    challenge2Participants: '२१० सहभागी',
    challenge2Title: 'ई-कचरा व बॅटरी संकलन मोहीम',
    challenge2Desc: 'जुने इलेक्ट्रॉनिक्स व बॅटऱ्या अधिकृत पालिका संकलन केंद्रावर सुरक्षितपणे जमा करा.',
    joinChallenge: 'सहभागी व्हा',
    joinedChallenge: 'सहभागी झाले आहात',

    copilotBadge: 'तज्ज्ञ पर्यावरण सहाय्यक एआय',
    copilotTitle: 'इकोसेन्स कोपायलट — कचरा व्यवस्थापन मार्गदर्शक',
    copilotDesc: 'पुनर्वापर नियम, प्लॅस्टिक ग्रेड्स (#१-#७), घातक ई-कचरा सुरक्षितता आणि खतनिर्मिती याबाबत अचूक उत्तरे मिळवा.',
    copilotSubtitle: 'कचरा वर्गीकरण · २-झोन नियम (कोकण व नालासोपारा-विरार) · २४/७ एआय मार्गदर्शन',
    copilotPlaceholder: 'कचरा वर्गीकरण, पुनर्वापर नियम किंवा विल्हेवाटीबद्दल काहीही विचारा...',
    copilotSend: 'विचारा',
    copilotClear: 'चॅट साफ करा',
    copilotSuggested: 'नेहमी विचारले जाणारे प्रश्न:',
    copilotLiveAi: 'थेट एआय सक्रिय',
    copilotKnowledgeEngine: 'स्मार्ट ज्ञान इंजिन',
    copilotApiKey: 'एपीआय की',
    copilotRemoveKey: 'हटवा',
    copilotSaveKey: 'सेव्ह करा',
    copilotKeyPrompt: 'थेट जेमिनी मॉडेल उत्तरांसाठी तुमची Google AI Studio API Key टाका:',
    copilotTyping: 'विल्हेवाट नियमावली तपासत आहे…',

    reportBadge: 'स्मार्ट कचरा तक्रार निवारण',
    reportTitle: 'कचरा साचला आहे? त्वरित तक्रार नोंदवा.',
    reportDesc: 'कचरा साचणे, उघड्यावर टाकणे किंवा कचरापेटी भरल्याची तक्रार नोंदवा. एआय द्वारे तपासणी होऊन स्थानिक प्रशासनाकडे पाठवले जाईल.',
    reportStorageTitle: 'डेटा साठवणूक व स्थानिक सुरक्षा',
    reportStorageNotice: '💾 डेटा साठवणूक: सर्व तक्रारी आपल्या ब्राउझर स्टोरेजमध्ये (localStorage) सुरक्षित साठवल्या जातात व कोकण/नालासोपारा-विरार डेटामध्ये अपडेट होतात.',
    reportFormTitle: 'नवीन कचरा तक्रार नोंदणी',
    reportFormSubtitle: '२-झोन पालिका निवारण फॉर्म',
    reportCategory: 'तक्रारीचा प्रकार',
    reportPhoto: 'कचऱ्याचा फोटो पुरावा',
    reportPhotoNote: 'कॅमेरा किंवा गॅलरीतून निवडा',
    reportTakePhoto: 'फोटो काढा',
    reportUploadFile: 'फाइल अपलोड करा',
    reportRetake: 'पुन्हा काढा',
    reportSample: 'नमुना फोटो',
    reportLocation: 'भौगोलिक स्थान व झोन',
    reportLocateBtn: 'जीपीएस लॉक करा',
    reportGpsVerified: 'जीपीएस पडताळणी पूर्ण ✓',
    reportLocating: 'शोधत आहे...',
    reportDescription: 'तक्रारीचे सविस्तर वर्णन',
    reportDescPlaceholder: 'कचऱ्याचे प्रमाण, लँडमार्क किंवा ठिकाणाचे वर्णन लिहा...',
    reportSubmitBtn: 'पालिका निवारण कक्षाकडे तक्रार पाठवा',
    reportAnalyzingBtn: 'एआय तपासणी व नोंदणी सुरू आहे…',
    reportTicketBadge: 'तक्रार पावती क्र.',
    reportAiPriority: 'एआय द्वारे निश्चित प्राधान्य',
    reportAiAnalysisResult: 'एआय विश्लेषण व कृती शिफारस:',
    reportTimelineTitle: 'निवारण प्रगती ट्रॅकर',
    reportLiveStatus: 'निवारण सक्रिय',
    timelineStep1: 'नोंदवली',
    timelineStep2: 'एआय तपासणी',
    timelineStep3: 'नियुक्त',
    timelineStep4: 'प्रगतीपथावर',
    timelineStep5: 'निवारण पूर्ण',
    reportFeedTitle: 'परिसरातील ताज्या तक्रारी',
    reportFeedSubtitle: '२ झोनमध्ये नोंदवलेल्या सक्रिय तक्रारी',
    reportFilterAll: 'सर्व तक्रारी',
    reportFilterHigh: 'अति-गंभीर',
    reportFilterMedium: 'मध्यम',
    reportConfirmResolved: 'निवारण झाले?',
    reportResolved: 'निवारण पडताळणी पूर्ण',
    issueGarbage: 'कचरा साचणे / ढीग',
    issueOverflow: 'कचरापेटी ओसंडून वाहणे',
    issueDumping: 'उघड्यावर बेकायदेशीर कचरा टाकणे',
    issueMissed: 'कचरा गाडी न येणे',
    issueSegregation: 'अयोग्य वर्गीकरण',
    issueOther: 'इतर कचरा समस्या',

    sevHigh: 'गंभीर',
    sevMedium: 'मध्यम',
    sevLow: 'साधारण',
    statusAiAnalysis: 'एआय तपासणी',
    statusAssigned: 'नियुक्त',
    statusInProgress: 'प्रगतीपथावर',
    statusResolved: 'निवारण पूर्ण',

    roleResident: 'नागरिक',
    roleCoordinator: 'समन्वयक',
    roleAdmin: 'प्रशासक',

    loginModalTitle: 'वापरकर्ता प्रोफाइल व झोन निवड',
    loginModalDesc: 'नागरिक, प्रभाग समन्वयक किंवा महापालिका प्रशासक म्हणून लॉग इन करा.',
    loginWelcome: 'इकोसेन्स एआय मध्ये आपले स्वागत आहे',
    loginWelcomeUser: 'पुन्हा स्वागत आहे',
    loginProfileUpdated: 'प्रोफाइल यशस्वीरीत्या अद्यतनित झाली.',
    loginSubtitle: 'कचरा नोंदवा, माहिती मिळवा आणि परिसराचा इको-स्कोअर वाढवा.',
    loginNameLabel: 'आपले संपूर्ण नाव',
    loginNamePlaceholder: 'उदा. साहिल सावंत',
    loginEmailLabel: 'ईमेल / फोन नंबर',
    loginEmailPlaceholder: 'उदा. yourname@gmail.com किंवा ९८७६५४३२१०',
    loginZoneLabel: 'आपला विभाग / झोन',
    loginRoleLabel: 'भूमिका (Role)',
    loginSubmitBtn: 'प्रोफाइल सेव्ह करा व लॉगिन व्हा',
    loginLogoutBtn: 'लॉगआउट / नाव बदला',
    loginGuest: 'अतिथी वापरकर्ता',
    loginChangeUser: 'नाव बदला',
    dashAuthSession: 'प्रमाणित सत्र (Session)',
    dashPortalSuffix: 'पोर्टल',
    dashEditProfile: 'प्रोफाइल बदला / नाव बदला',
    dashPrimaryAction: 'प्राथमिक कृती',
    dashReadyTitle: 'आज कचरा स्कॅन करण्यास तयार आहात का?',
    dashReadyDesc: 'कॅमेऱ्याने कचऱ्याचा फोटो घ्या. त्वरित विल्हेवाट सूचना मिळवा आणि कोकण व नालासोपारा-विरार डेटामध्ये योगदान द्या.',
    dashScanNow: 'आता स्कॅन करा',
    dashSnapshotTitle: 'समुदाय माहिती आढावा',
    dashViewSuffix: 'दृश्य',
    dashLiveTelemetryBadge: 'लाइव्ह २-झोन आकडेवारी',
    dashYourScans: 'आपले या महिन्यातील स्कॅन',
    dashYourScansSub: '९६% कचरा वर्गीकरण अचूकता',
    dashActiveIssues: 'परिसरातील सक्रिय तक्रारी',
    dashActiveIssuesSub: 'कोकण व नालासोपारा-विरार सक्रिय तक्रारी',
    dashEcoScore: 'समुदाय इको-स्कोअर',
    dashEcoScoreSub: 'एकूण नोंदवलेले स्कॅन्स',
    unitItems: 'वस्तू',
    unitReports: 'तक्रारी',
    dashCoordTitle: 'समुदाय समन्वयक व्यवस्थापन पॅनेल',
    dashCoordCard1Title: 'झोन २ (नालासोपारा/विरार) तपासणी आदेश',
    dashCoordCard1Desc: 'स्टेशन रोड व बायपास भागातील तक्रारींची तपासणी करा.',
    dashCoordCard2Title: 'झोन १ (कोकण) किनारपट्टी स्वच्छता मोहीम',
    dashCoordCard2Desc: 'सेंद्रिय कचरा खतनिर्मितीबाबत जनजागृतीचे नियोजन करा.',
    dashAdminTitle: 'महापालिका प्रशासक कन्सोल',
    dashAdminSubtitle: '२-झोन डेटा पाइपलाइन सक्रिय',
    dashAdminActiveZones: 'सक्रिय झोन',
    dashAdminTotalTelemetry: 'एकूण स्कॅन्स डेटा',
    dashAdminApiHealth: 'सिस्टम आरोग्य',
    adminScansIndexed: 'स्कॅन्स समाविष्ट',
    adminActiveZonesVal: '२ झोन (कोकण व नालासोपारा-विरार)',
    adminSystemHealthVal: '२०० ठीक (१४ms लेटन्सी)',

    footerDesc: 'झोन १ (कोकण विभाग) आणि झोन २ (नालासोपारा पूर्व/पश्चिम व विरार) साठी एआय कचरा व्यवस्थापन प्रणाली.',
    footerPrivacy: 'गोपनीयता सुरक्षित आर्किटेक्चर',
    footerCoreTitle: 'प्लॅटफॉर्म साधने',
    footerZonesTitle: 'समाविष्ट विभाग (Zones)',
    footerEngine: 'जेमिनी व्हिजन एआय इंजिन',
    footerStandards: 'CPCB पुनर्वापर मानके',
    footerRights: '© २०२६ इकोसेन्स एआय प्लॅटफॉर्म. सर्व हक्क सुरक्षित.',
    footerMadeWith: 'कोकण व नालासोपारा-विरारसाठी प्रेमाने निर्मित ❤️'
  }
};

/**
 * Helper function to translate waste categories dynamically
 */
export function getTranslatedCategory(category: string, t: Translations): string {
  switch (category) {
    case 'Dry / Recyclable':
      return t.catDryRecyclable;
    case 'Wet / Organic':
      return t.catWetOrganic;
    case 'Non-Recyclable':
      return t.catNonRecyclable;
    case 'E-Waste':
      return t.catEWaste;
    case 'Hazardous':
      return t.catHazardous;
    case 'Special Handling':
      return t.catSpecialHandling;
    default:
      return category;
  }
}

/**
 * Helper function to translate contamination conditions dynamically
 */
export function getTranslatedCondition(condition: string, t: Translations): string {
  switch (condition) {
    case 'Clean':
      return t.condClean;
    case 'Slightly Contaminated':
      return t.condSlightlyContaminated;
    case 'Heavily Contaminated':
      return t.condHeavilyContaminated;
    case 'Mixed-material':
      return t.condMixedMaterial;
    default:
      return condition;
  }
}

/**
 * Helper function to translate zone names dynamically
 */
export function getTranslatedZone(zone: string, t: Translations): string {
  if (!zone) return '';
  if (zone.includes('Zone 1') || zone.includes('Kokan') || zone.includes('कोकण')) {
    return t.zone1Name;
  }
  if (zone.includes('Zone 2') || zone.includes('NSP') || zone.includes('Virar') || zone.includes('नालासोपारा')) {
    return t.zone2Name;
  }
  return zone;
}

/**
 * Helper function to translate user roles dynamically
 */
export function getTranslatedRole(role: string, t: Translations): string {
  switch (role) {
    case 'Resident':
      return t.roleResident;
    case 'Coordinator':
      return t.roleCoordinator;
    case 'Administrator':
      return t.roleAdmin;
    default:
      return role;
  }
}

/**
 * Helper function to translate report severities dynamically
 */
export function getTranslatedSeverity(severity: string, t: Translations): string {
  switch (severity) {
    case 'HIGH':
      return t.sevHigh;
    case 'MEDIUM':
      return t.sevMedium;
    case 'LOW':
      return t.sevLow;
    default:
      return severity;
  }
}

/**
 * Helper function to translate report statuses dynamically
 */
export function getTranslatedStatus(status: string, t: Translations): string {
  switch (status) {
    case 'AI Analysis':
      return t.statusAiAnalysis;
    case 'Assigned':
      return t.statusAssigned;
    case 'In Progress':
      return t.statusInProgress;
    case 'Resolved':
      return t.statusResolved;
    default:
      return status;
  }
}

/**
 * Helper function to translate issue types dynamically
 */
export function getTranslatedIssueType(issue: string, t: Translations): string {
  switch (issue) {
    case 'Garbage Accumulation':
      return t.issueGarbage;
    case 'Overflowing Bin':
      return t.issueOverflow;
    case 'Illegal Dumping':
      return t.issueDumping;
    case 'Missed Collection':
      return t.issueMissed;
    case 'Improper Segregation':
      return t.issueSegregation;
    case 'Other':
      return t.issueOther;
    default:
      return issue;
  }
}

/**
 * Helper function to translate dominant waste categories dynamically
 */
export function getTranslatedDominantCategory(dominant: string, t: Translations): string {
  if (dominant.includes('Wet') || dominant.includes('Organic') || dominant.includes('Bio-Waste')) {
    return t.langSwitch === 'English' ? 'ओला / सेंद्रिय व सागरी जैव-कचरा' : dominant;
  }
  if (dominant.includes('Dry') || dominant.includes('PET') || dominant.includes('Recyclable')) {
    return t.langSwitch === 'English' ? 'सुका / पुनर्वापरयोग्य (PET बाटल्या व पॅकेजिंग)' : dominant;
  }
  return dominant;
}

/**
 * Helper to translate detected object labels dynamically
 */
export function getTranslatedObjectLabel(label: string, lang: Language): string {
  if (lang !== 'mr') return label;
  const map: Record<string, string> = {
    'PET Plastic Beverage Bottle': 'PET प्लॅस्टिक बाटली',
    'PET Plastic Bottle': 'PET प्लॅस्टिक बाटली',
    'Corrugated Cardboard Packaging': 'पुठ्ठ्याचा बॉक्स (कार्डबोर्ड)',
    'Corrugated Shipping Box': 'पुठ्ठ्याचा बॉक्स (कार्डबोर्ड)',
    'Organic Kitchen / Vegetable Scraps': 'ओला भाजीपाला व अन्न कचरा',
    'Organic Food Scraps': 'ओला भाजीपाला व अन्न कचरा',
    'Multi-layer Foil Snack Wrapper': 'मल्टी-लेयर वेफर्स/स्नॅक रॅपर',
    'Scanned Waste Item': 'स्कॅन केलेली कचरा वस्तू',
    'Waste Item': 'कचरा वस्तू'
  };
  return map[label] || label;
}

/**
 * Helper to translate materials dynamically
 */
export function getTranslatedMaterial(material: string, lang: Language): string {
  if (lang !== 'mr') return material;
  const map: Record<string, string> = {
    'PET (Polyethylene Terephthalate #1)': 'PET (पॉलीथिलीन टेरेफ्थालेट #1)',
    'PET (Polyethylene Terephthalate)': 'PET (पॉलीथिलीन टेरेफ्थालेट #1)',
    'Kraft Cellulose Fiberboard': 'सेल्युलोज क्राफ्ट पुठ्ठा फायबर',
    'Kraft Fiberboard': 'सेल्युलोज क्राफ्ट पुठ्ठा फायबर',
    'Biodegradable Plant Matter': 'विघटनशील सेंद्रिय वनस्पती घटक',
    'Compostable Organic Matter': 'विघटनशील सेंद्रिय वनस्पती घटक',
    'Metallized Polypropylene Composite': 'मेटलाइज्ड पॉलीप्रॉपिलीन संमिश्र',
    'Polymer / Composite': 'पॉलिमर / संमिश्र घटक'
  };
  return map[material] || material;
}

/**
 * Helper to translate disposal steps dynamically
 */
export function getTranslatedDisposalStep(step: string, lang: Language): string {
  if (lang !== 'mr') return step;
  const map: Record<string, string> = {
    'Empty residual liquid contents': 'आतील द्रव पूर्णपणे रिकामे करा',
    'Empty liquids': 'आतील द्रव रिकामे करा',
    'Empty liquid contents': 'आतील द्रव रिकामे करा',
    'Rinse container with small amount of water': 'थोड्या पाण्याने स्वच्छ धुवून घ्या',
    'Rinse with water': 'पाण्याने धुवा',
    'Rinse gently with water': 'पाण्याने स्वच्छ धुवून घ्या',
    'Crush bottle and replace screw cap': 'बाटली चपटी करा व झाकण परत लावा',
    'Crush bottle to save space': 'जागा वाचवण्यासाठी बाटली चपटी करा',
    'Place cap back on': 'झाकण परत लावा',
    'Deposit into Blue / Dry Recyclable bin': 'निळ्या / सुक्या पुनर्वापरयोग्य कचरापेटीत टाका',
    'Deposit in Dry/Recyclable bin': 'निळ्या / सुक्या कचरापेटीत टाका',
    'Deposit in Blue/Recyclable Bin': 'निळ्या / सुक्या कचरापेटीत टाका',
    'Flatten cardboard box completely': 'पुठ्ठ्याचा बॉक्स सपाट (फ्लॅट) करा',
    'Flatten cardboard box': 'पुठ्ठ्याचा बॉक्स सपाट करा',
    'Flatten container': 'बॉक्स सपाट करा',
    'Peel away heavy plastic tape if possible': 'चिकटपट्टी (टेप) काढून टाका',
    'Remove synthetic tape': 'चिकटपट्टी (टेप) काढून टाका',
    'Keep dry away from food grease': 'तेलकट अन्नापासून दूर कोरडे ठेवा',
    'Place in dry cardboard collection': 'सुक्या कागद/पुठ्ठा संकलनात द्या',
    'Place in Dry Recyclable / Paper collection': 'सुक्या कागद/पुठ्ठा संकलनात द्या',
    'Separate from plastic bags or cling film': 'प्लॅस्टिक पिशवीपासून वेगळे करा',
    'Deposit in Green / Wet Organic bin': 'हिरव्या / ओल्या कचरापेटीत टाका',
    'Suitable for home composting or municipal biomethanation': 'घरगुती खतनिर्मिती किंवा बायोगॅससाठी वापरा',
    'Scrape food scraps into Wet/Organic waste bin or home compost': 'हिरव्या / ओल्या कचरापेटीत किंवा खताच्या खड्ड्यात टाका',
    'Scrape into Green/Wet Waste Bin or Home Compost': 'हिरव्या / ओल्या कचरापेटीत किंवा खताच्या खड्ड्यात टाका',
    'Rinse container': 'पात्र धुवून घ्या',
    'Do not mix with clean paper or rigid plastics': 'स्वच्छ कागद किंवा प्लॅस्टिकमध्ये मिसळू नका',
    'Dispose in Black / General Waste bin': 'काळ्या / सामान्य कचरापेटीत टाका',
    'Empty contents and rinse': 'सामग्री रिकामी करा आणि धुवा',
    'Sort into dry recyclable bin': 'सुक्या कचरापेटीत वेगळे करा',
    'Sort into appropriate waste bin': 'योग्य कचरापेटीत टाका'
  };
  return map[step] || step;
}

/**
 * Helper to translate explainable AI statements dynamically
 */
export function getTranslatedExplanation(text: string, lang: Language): string {
  if (lang !== 'mr') return text;
  if (text.includes('PET') || text.includes('thermoplastic')) {
    return 'पारदर्शक ग्रेड-१ पुनर्वापरयोग्य पॉलिमर. नवीन कापड किंवा पॅकेजिंग उत्पादनांसाठी १००% पुनर्वापरयोग्य.';
  }
  if (text.includes('fiber') || text.includes('cardboard') || text.includes('cellulose')) {
    return 'स्वच्छ क्राफ्ट सेल्युलोज फायबर. नवीन कागद व खोकी बनवण्यासाठी उत्तम दर्जाचे.';
  }
  if (text.includes('organic') || text.includes('compostable') || text.includes('methane')) {
    return 'सेंद्रिय अन्न कचरा. कचराभूमीत जाण्याऐवजी घरगुती खत किंवा बायोगॅससाठी वापरणे पर्यावरणासाठी फायदेशीर.';
  }
  if (text.includes('foil') || text.includes('laminate') || text.includes('composite')) {
    return 'प्लॅस्टिक व ॲल्युमिनियमचे संमिश्र वेष्टन वेगळे करता येत नसल्याने पुनर्वापर न होणाऱ्या कचऱ्यात टाकावे.';
  }
  return text;
}
