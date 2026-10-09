import { useState } from 'react';
import Navbar from './components/layout/Navbar';
import MobileNav from './components/layout/MobileNav';
import Footer from './components/layout/Footer';
import LandingPage from './pages/LandingPage';
import ScannerInterface from './components/scanner/ScannerInterface';
import AnalyticsView from './components/analytics/AnalyticsView';
import EcoCopilotChat from './components/copilot/EcoCopilotChat';
import ReportForm from './components/report/ReportForm';
import ChallengesView from './components/challenges/ChallengesView';
import DashboardView from './components/dashboard/DashboardView';
import LoginModal from './components/auth/LoginModal';
import { EcoProvider, useEco } from './context/EcoContext';

function AppContent() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const { t } = useEco();

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'scanner':
        return (
          <div className="pt-2 space-y-6">
            <div className="text-center space-y-1.5 max-w-xl mx-auto">
              <h1 className="text-3xl font-extrabold text-[#0F2E23]">{t.navScanner}</h1>
              <p className="text-xs text-gray-600">
                {t.scannerHeaderDesc}
              </p>
            </div>
            <ScannerInterface onNavigate={handleNavigate} />
          </div>
        );
      case 'analytics':
        return <AnalyticsView />;
      case 'copilot':
        return <EcoCopilotChat />;
      case 'report':
        return <ReportForm />;
      case 'challenges':
        return <ChallengesView />;
      case 'dashboard':
        return <DashboardView onNavigateToScanner={() => handleNavigate('scanner')} />;
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#111827] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Auth / Login Modal */}
      <LoginModal />

      {/* Sticky Header Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={handleNavigate} />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-6">
        {renderContent()}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Mobile Bottom Navigation */}
      <MobileNav activeTab={activeTab} setActiveTab={handleNavigate} />
    </div>
  );
}

export function App() {
  return (
    <EcoProvider>
      <AppContent />
    </EcoProvider>
  );
}

export default App;
