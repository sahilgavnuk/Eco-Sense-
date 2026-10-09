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

  // Zones
  zone1Name: string;
  zone2Name: string;

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
  scannerRecommendation: string;
  scannerExplainable: string;
  scannerImpact: string;

  // Analytics
  analyticsBadge: string;
  analyticsTitle: string;
  analyticsDesc: string;
  analyticsExport: string;
  kpiTotalScans: string;
  kpiPlasticShare: string;
  kpiSegregation: string;
  kpiInputsDesc: string;
  analyticsBreakdownTitle: string;
  zoneTableTitle: string;
  zoneColName: string;
  zoneColScans: string;
  zoneColSegregation: string;
  zoneColDominant: string;
  zoneColIssues: string;

  // EcoScore
  ecoScoreBadge: string;
  ecoScoreTitle: string;
  ecoScoreDesc: string;
  ecoScoreStreak: string;
  ecoScoreRank: string;
  ecoScoreDimensions: string;
  ecoChallengeTitle: string;
  joinChallenge: string;
  joinedChallenge: string;

  // Copilot
  copilotBadge: string;
  copilotTitle: string;
  copilotDesc: string;
  copilotPlaceholder: string;
  copilotSend: string;
  copilotClear: string;
  copilotSuggested: string;

  // Report Issue
  reportBadge: string;
  reportTitle: string;
  reportDesc: string;
  reportStorageNotice: string;
  reportCategory: string;
  reportPhoto: string;
  reportTakePhoto: string;
  reportUploadFile: string;
  reportLocation: string;
  reportLocateBtn: string;
  reportDescription: string;
  reportSubmitBtn: string;
  reportTimelineTitle: string;
  reportFeedTitle: string;
  reportConfirmResolved: string;
  reportResolved: string;

  // Login / Dashboard
  loginModalTitle: string;
  loginWelcome: string;
  loginSubtitle: string;
  loginNameLabel: string;
  loginEmailLabel: string;
  loginZoneLabel: string;
  loginRoleLabel: string;
  loginSubmitBtn: string;
  loginLogoutBtn: string;
  loginGuest: string;
  loginChangeUser: string;
  dashReadyTitle: string;
  dashReadyDesc: string;
  dashScanNow: string;
  dashSnapshotTitle: string;
  dashYourScans: string;
  dashActiveIssues: string;
  dashEcoScore: string;
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

    zone1Name: 'Zone 1 — Kokan Region',
    zone2Name: 'Zone 2 — NSP East/West & Virar',

    heroBadge: 'The AI Waste Intelligence Platform',
    heroTitle1: 'Waste is everywhere.',
    heroTitle2: "Insight shouldn't be.",
    heroSubtitle: 'Scan any waste item with AI, understand what it is, discover how to dispose of it correctly, and help your community build smarter waste intelligence.',
    heroScanBtn: 'Scan Your Waste Now',
    heroExploreBtn: 'Explore Community Intelligence',
    problemBadge: '01 — The Daily Waste Challenge',
    problemTitle: 'Waste decisions happen every single day.',
    problemSubtitle: 'Most residents face confusion at the bin. EcoSense AI eliminates guesswork.',

    scannerHeaderBadge: 'Gemini Vision AI · Real-Time Precision Engine',
    scannerHeaderTitle: 'Point. Scan. Understand.',
    scannerHeaderDesc: 'Capture or upload any real waste item — Gemini AI inspects material composition, contamination, and gives certified disposal guidance.',
    scannerLiveCamera: 'Live Camera',
    scannerCloseCamera: 'Close Camera',
    scannerUpload: 'Upload / Snap Photo',
    scannerCapture: 'Capture & Analyze',
    scannerClear: 'Clear & Scan New Item',
    scannerSelectZone: 'Select Target Zone for Telemetry',
    scannerTelemetryCheck: 'Contribute anonymized scan to Zone Waste Telemetry (+1 to Total Count)',
    scannerPrivacy: 'Privacy Secured',
    scannerSuccessLogged: '✅ Waste successfully scanned and added to Zone Telemetry dataset!',
    scannerRecommendation: 'Recommended Disposal Action',
    scannerExplainable: 'Why this recommendation? (Explainable AI)',
    scannerImpact: 'Community Intelligence Impact: Every scan teaches EcoSense what your community throws away.',

    analyticsBadge: 'Environmental Data Platform',
    analyticsTitle: 'Community Waste Intelligence',
    analyticsDesc: 'Anonymized telemetry from user scans transformed into actionable waste management insights, category breakdown models, and zone-level intervention metrics.',
    analyticsExport: 'Export Dataset (CSV)',
    kpiTotalScans: 'Total Waste Scans',
    kpiPlasticShare: 'Plastic Packaging Share',
    kpiSegregation: 'Segregation Accuracy',
    kpiInputsDesc: 'Telemetry inputs from 2 active community zones',
    analyticsBreakdownTitle: 'Waste Category Composition',
    zoneTableTitle: 'Zone-Level Waste Intelligence Breakdown (2 Zones)',
    zoneColName: 'Zone Name',
    zoneColScans: 'Scans This Month',
    zoneColSegregation: 'Segregation Index',
    zoneColDominant: 'Dominant Waste Category',
    zoneColIssues: 'Active Issues',

    ecoScoreBadge: 'Community Sustainability Index',
    ecoScoreTitle: 'EcoScore & Community Action',
    ecoScoreDesc: 'Turn waste identification into community action. Track your neighborhood EcoScore, maintain scan streaks, and participate in sustainability drives.',
    ecoScoreStreak: 'Active Scan Streak',
    ecoScoreRank: 'Top 15% Cleaner Neighborhood Distinction',
    ecoScoreDimensions: 'EcoScore Dimension Breakdown',
    ecoChallengeTitle: 'Active Neighborhood Challenges',
    joinChallenge: 'Join Challenge',
    joinedChallenge: 'Challenge Joined',

    copilotBadge: 'Professional Waste Engineer AI',
    copilotTitle: 'EcoSense Copilot — Waste Intelligence Assistant',
    copilotDesc: 'Authoritative guidance on recycling protocols, resin codes, toxic e-waste prevention, composting, and municipal standards.',
    copilotPlaceholder: 'Ask anything about recycling rules, material codes (#1-#7), or disposal safety protocols...',
    copilotSend: 'Consult',
    copilotClear: 'Clear Chat',
    copilotSuggested: 'Quick Questions:',

    reportBadge: 'Smart Geospatial Waste Reporting',
    reportTitle: 'See a problem? Report it immediately.',
    reportDesc: 'Report uncollected garbage, illegal dumping, or bin overflows. EcoSense AI automatically analyzes severity, records zone metrics, and updates local dispatch.',
    reportStorageNotice: '💾 Data Storage: All reports are securely persisted to your local browser storage (localStorage) and integrated with Kokan & NSP/Virar telemetry.',
    reportCategory: 'Issue Category',
    reportPhoto: 'Incident Photo Proof',
    reportTakePhoto: 'Take Photo',
    reportUploadFile: 'Upload File',
    reportLocation: 'Geospatial Location & Zone',
    reportLocateBtn: 'Lock GPS',
    reportDescription: 'Issue Description',
    reportSubmitBtn: 'Submit Report to EcoSense',
    reportTimelineTitle: 'Report Resolution Timeline',
    reportFeedTitle: 'Active Community Reports',
    reportConfirmResolved: 'Mark Resolved',
    reportResolved: 'Verified Resolved',

    loginModalTitle: 'User Profile & Authentication',
    loginWelcome: 'Welcome Back',
    loginSubtitle: 'Logged in as active community member',
    loginNameLabel: 'Your Full Name',
    loginEmailLabel: 'Email / Phone Number',
    loginZoneLabel: 'Assigned Zone',
    loginRoleLabel: 'Portal Role View',
    loginSubmitBtn: 'Save Profile & Login',
    loginLogoutBtn: 'Switch User / Logout',
    loginGuest: 'Guest User',
    loginChangeUser: 'Switch User',
    dashReadyTitle: 'Ready to scan waste today?',
    dashReadyDesc: 'Point your camera at any item. Receive instant disposal steps and feed your scan directly into Kokan & NSP/Virar community intelligence.',
    dashScanNow: 'SCAN WASTE NOW',
    dashSnapshotTitle: 'Community Snapshot',
    dashYourScans: 'Your Scans This Month',
    dashActiveIssues: 'Active Zone Issues',
    dashEcoScore: 'Community EcoScore'
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

    zone1Name: 'झोन १ — कोकण विभाग (Kokan Region)',
    zone2Name: 'झोन २ — नालासोपारा (NSP) पूर्व/पश्चिम व विरार',

    heroBadge: 'एआय कचरा व्यवस्थापन प्रणाली',
    heroTitle1: 'कचरा सगळीकडे आहे.',
    heroTitle2: 'योग्य माहिती आता तुमच्या हातात आहे.',
    heroSubtitle: 'कोणत्याही कचऱ्याचे एआय द्वारे स्कॅनिंग करा, त्याचे योग्य वर्गीकरण समजून घ्या आणि आपल्या विभागाला स्वच्छ बनवण्यात मदत करा.',
    heroScanBtn: 'आता कचरा स्कॅन करा',
    heroExploreBtn: 'समुदाय माहिती पाहा',
    problemBadge: '०१ — दैनंदिन कचऱ्याचे आव्हान',
    problemTitle: 'कचऱ्याचे योग्य नियोजन दररोज आवश्यक आहे.',
    problemSubtitle: 'कचरा कोणत्या डब्यात टाकावा याबाबतचा संभ्रम इकोसेन्स एआय दूर करते.',

    scannerHeaderBadge: 'जेमिनी व्हिजन एआय · रिअल-टाइम अचूक प्रणाली',
    scannerHeaderTitle: 'पहा. स्कॅन करा. समजून घ्या.',
    scannerHeaderDesc: 'कचऱ्याचा थेट फोटो काढा किंवा अपलोड करा — एआय कचऱ्याचा प्रकार व विल्हेवाट लावण्याची योग्य पद्धत सांगेल.',
    scannerLiveCamera: 'लाइव्ह कॅमेरा सुरू करा',
    scannerCloseCamera: 'कॅमेरा बंद करा',
    scannerUpload: 'फोटो अपलोड / काढा',
    scannerCapture: 'फोटो काढून स्कॅन करा',
    scannerClear: 'नवीन स्कॅन करा',
    scannerSelectZone: 'कचरा नोंदणीसाठी झोन निवडा',
    scannerTelemetryCheck: 'हा स्कॅन विभागाच्या कचरा डेटाबेसमध्ये जोडा (+१ एकूण मोजणीमध्ये)',
    scannerPrivacy: 'डेटा पूर्ण सुरक्षित',
    scannerSuccessLogged: '✅ कचरा यशस्वीरीत्या स्कॅन झाला आणि झोन डेटामध्ये जोडला गेला!',
    scannerRecommendation: 'विल्हेवाटीची योग्य कृती',
    scannerExplainable: 'या शिफारसीचे कारण काय? (एआय स्पष्टीकरण)',
    scannerImpact: 'सामुदायिक प्रभाव: प्रत्येक स्कॅनमुळे आपल्या भागातील कचरा व्यवस्थापन अधिक स्मार्ट होते.',

    analyticsBadge: 'पर्यावरण डेटा प्लॅटफॉर्म',
    analyticsTitle: 'सामुदायिक कचरा विश्लेषण',
    analyticsDesc: 'नागरिकांच्या स्कॅनमधून संकलित केलेला डेटा, कचरा प्रकार विश्लेषण आणि झोननिहाय कृती आराखडा.',
    analyticsExport: 'डेटा डाउनलोड करा (CSV)',
    kpiTotalScans: 'एकूण कचरा स्कॅन',
    kpiPlasticShare: 'प्लॅस्टिक पॅकेजिंगचे प्रमाण',
    kpiSegregation: 'कचरा वर्गीकरण अचूकता',
    kpiInputsDesc: '२ कार्यरत झोनमधील संकलित आकडेवारी',
    analyticsBreakdownTitle: 'कचरा प्रकारांचे प्रमाण',
    zoneTableTitle: 'झोननिहाय कचरा विश्लेषण (केवळ २ झोन)',
    zoneColName: 'झोनचे नाव',
    zoneColScans: 'या महिन्यातील स्कॅन',
    zoneColSegregation: 'वर्गीकरण प्रमाण',
    zoneColDominant: 'प्रमुख कचरा प्रकार',
    zoneColIssues: 'सक्रिय तक्रारी',

    ecoScoreBadge: 'सामुदायिक पर्यावरण निर्देशांक',
    ecoScoreTitle: 'इको-स्कोअर आणि उपक्रम',
    ecoScoreDesc: 'कचऱ्याचे अचूक वर्गीकरण करून आपल्या परिसराचा इको-स्कोअर वाढवा आणि मोहिमांमध्ये भाग घ्या.',
    ecoScoreStreak: 'सलग स्कॅनिंग दिवस',
    ecoScoreRank: 'स्वच्छ परिसर क्रमवारीत अव्वल १५%',
    ecoScoreDimensions: 'इको-स्कोअर घटक विश्लेषण',
    ecoChallengeTitle: 'सक्रिय सामुदायिक आव्हाने',
    joinChallenge: 'सहभागी व्हा',
    joinedChallenge: 'सहभागी झाले आहात',

    copilotBadge: 'तज्ज्ञ पर्यावरण सहाय्यक एआय',
    copilotTitle: 'इकोसेन्स कोपायलट — कचरा व्यवस्थापन मार्गदर्शक',
    copilotDesc: 'पुनर्वापर नियम, प्लॅस्टिक ग्रेड्स (#१-#७), घातक ई-कचरा सुरक्षितता आणि खतनिर्मिती याबाबत अचूक उत्तरे मिळवा.',
    copilotPlaceholder: 'कचरा वर्गीकरण, पुनर्वापर नियम किंवा विल्हेवाटीबद्दल काहीही विचारा...',
    copilotSend: 'विचारा',
    copilotClear: 'चॅट साफ करा',
    copilotSuggested: 'नेहमी विचारले जाणारे प्रश्न:',

    reportBadge: 'स्मार्ट कचरा तक्रार निवारण',
    reportTitle: 'कचरा साचला आहे? त्वरित तक्रार नोंदवा.',
    reportDesc: 'कचरा साचणे, उघड्यावर टाकणे किंवा कचरापेटी भरल्याची तक्रार नोंदवा. एआय द्वारे तपासणी होऊन स्थानिक प्रशासनाकडे पाठवले जाईल.',
    reportStorageNotice: '💾 डेटा साठवणूक: सर्व तक्रारी आपल्या ब्राउझर स्टोरेजमध्ये (localStorage) सुरक्षित साठवल्या जातात व कोकण/नालासोपारा-विरार डेटामध्ये अपडेट होतात.',
    reportCategory: 'तक्रारीचा प्रकार',
    reportPhoto: 'कचऱ्याचा फोटो पुरावा',
    reportTakePhoto: 'फोटो काढा',
    reportUploadFile: 'फाइल अपलोड करा',
    reportLocation: 'भौगोलिक स्थान व झोन',
    reportLocateBtn: 'जीपीएस लोकेशन मिळवा',
    reportDescription: 'तपशील / वर्णन',
    reportSubmitBtn: 'तक्रार सबमिट करा',
    reportTimelineTitle: 'तक्रार निवारण प्रगती',
    reportFeedTitle: 'नोंदवलेल्या तक्रारींची यादी',
    reportConfirmResolved: 'निवारण झाले म्हणून मार्क करा',
    reportResolved: 'निवारण सत्यापित झाले',

    loginModalTitle: 'वापरकर्ता प्रोफाइल व लॉगिन',
    loginWelcome: 'स्वागत आहे',
    loginSubtitle: 'सक्रिय समुदाय सदस्य म्हणून लॉगिन केले आहे',
    loginNameLabel: 'आपले पूर्ण नाव',
    loginEmailLabel: 'ईमेल / फोन नंबर',
    loginZoneLabel: 'आपला विभाग / झोन',
    loginRoleLabel: 'भूमिका (Role)',
    loginSubmitBtn: 'प्रोफाइल सेव्ह करा व लॉगिन व्हा',
    loginLogoutBtn: 'लॉगआउट / नाव बदला',
    loginGuest: 'अतिथी वापरकर्ता',
    loginChangeUser: 'नाव बदला',
    dashReadyTitle: 'आज कचरा स्कॅन करण्यास तयार आहात का?',
    dashReadyDesc: 'कॅमेऱ्याने कचऱ्याचा फोटो घ्या. त्वरित विल्हेवाट सूचना मिळवा आणि कोकण व नालासोपारा-विरार डेटामध्ये योगदान द्या.',
    dashScanNow: 'आता स्कॅन करा',
    dashSnapshotTitle: 'समुदाय माहिती',
    dashYourScans: 'आपले या महिन्यातील स्कॅन',
    dashActiveIssues: 'परिसरातील सक्रिय तक्रारी',
    dashEcoScore: 'समुदाय इको-स्कोअर'
  }
};
