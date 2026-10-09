import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ScanResult, WasteReport, ZoneMetric, UserProfile, ReportStatus } from '../types';
import { MOCK_ZONE_METRICS, MOCK_REPORTS, SAMPLE_SCANS, ZONE_2_NAME } from '../data/mockData';
import { TRANSLATIONS, type Language, type Translations } from '../data/translations';

interface EcoContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  
  totalWasteCount: number;
  zoneMetrics: ZoneMetric[];
  scansList: ScanResult[];
  reports: WasteReport[];
  
  currentUser: UserProfile;
  loginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
  
  addScan: (result: ScanResult, zoneName?: string) => void;
  addReport: (report: WasteReport) => void;
  updateReportStatus: (id: string, status: ReportStatus) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  logoutUser: () => void;
}

const DEFAULT_USER: UserProfile = {
  name: 'Community Member',
  email: 'resident@ecosense.org',
  zone: ZONE_2_NAME,
  role: 'Resident',
  isLoggedIn: false
};

const EcoContext = createContext<EcoContextType | undefined>(undefined);

export const EcoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Language
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('ecosense_lang');
    return (saved === 'mr' || saved === 'en') ? saved : 'en';
  });

  const t = TRANSLATIONS[language];

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('ecosense_lang', lang);
  };

  // Total Waste Count (Starts at 150)
  const [totalWasteCount, setTotalWasteCount] = useState<number>(() => {
    const saved = localStorage.getItem('ecosense_total_count');
    return saved ? parseInt(saved, 10) : 150;
  });

  // Zone Metrics
  const [zoneMetrics, setZoneMetrics] = useState<ZoneMetric[]>(() => {
    const saved = localStorage.getItem('ecosense_zone_metrics');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return MOCK_ZONE_METRICS;
      }
    }
    return MOCK_ZONE_METRICS;
  });

  // Scans List
  const [scansList, setScansList] = useState<ScanResult[]>(() => {
    const saved = localStorage.getItem('ecosense_scans');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return SAMPLE_SCANS;
      }
    }
    return SAMPLE_SCANS;
  });

  // Reports List (Persisted in localStorage)
  const [reports, setReports] = useState<WasteReport[]>(() => {
    const saved = localStorage.getItem('ecosense_reports');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return MOCK_REPORTS;
      }
    }
    return MOCK_REPORTS;
  });

  // Current User (Persisted in localStorage)
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('ecosense_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_USER;
      }
    }
    return DEFAULT_USER;
  });

  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('ecosense_total_count', totalWasteCount.toString());
  }, [totalWasteCount]);

  useEffect(() => {
    localStorage.setItem('ecosense_zone_metrics', JSON.stringify(zoneMetrics));
  }, [zoneMetrics]);

  useEffect(() => {
    localStorage.setItem('ecosense_scans', JSON.stringify(scansList));
  }, [scansList]);

  useEffect(() => {
    localStorage.setItem('ecosense_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('ecosense_user', JSON.stringify(currentUser));
  }, [currentUser]);

  // Add Scan Action
  const addScan = (result: ScanResult, zoneName: string = ZONE_2_NAME) => {
    const updatedResult = { ...result, zone: zoneName };
    setScansList((prev) => [updatedResult, ...prev]);
    
    // Increment total count: 150 -> 151
    setTotalWasteCount((prev) => prev + 1);

    // Update zone metrics
    setZoneMetrics((prev) =>
      prev.map((z) => {
        if (z.zoneName === zoneName || z.zoneName.includes(zoneName) || zoneName.includes(z.zoneId)) {
          return {
            ...z,
            scansThisMonth: z.scansThisMonth + 1
          };
        }
        return z;
      })
    );
  };

  // Add Report Action
  const addReport = (report: WasteReport) => {
    setReports((prev) => [report, ...prev]);
    
    // Update zone active issues count
    setZoneMetrics((prev) =>
      prev.map((z) => {
        if (z.zoneName === report.location.zone) {
          return {
            ...z,
            activeIssues: z.activeIssues + 1
          };
        }
        return z;
      })
    );
  };

  // Update Report Status
  const updateReportStatus = (id: string, status: ReportStatus) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status, residentConfirmed: status === 'Resolved' } : r
      )
    );
  };

  // User Profile Actions
  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setCurrentUser((prev) => ({
      ...prev,
      ...profile,
      isLoggedIn: true
    }));
  };

  const logoutUser = () => {
    setCurrentUser(DEFAULT_USER);
  };

  return (
    <EcoContext.Provider
      value={{
        language,
        setLanguage,
        t,
        totalWasteCount,
        zoneMetrics,
        scansList,
        reports,
        currentUser,
        loginModalOpen,
        setLoginModalOpen,
        addScan,
        addReport,
        updateReportStatus,
        updateUserProfile,
        logoutUser
      }}
    >
      {children}
    </EcoContext.Provider>
  );
};

export const useEco = () => {
  const context = useContext(EcoContext);
  if (!context) {
    throw new Error('useEco must be used within an EcoProvider');
  }
  return context;
};
