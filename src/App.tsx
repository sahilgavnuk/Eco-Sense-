import { useState } from 'react';
import { Bot } from 'lucide-react';
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
  const { t, language } = useEco();

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
        return (
          <div className="pt-2 space-y-4">
            <div className="text-center space-y-1.5 max-w-xl mx-auto">
              <h1 className="text-3xl font-extrabold text-[#0F2E23]">{t.navCopilot}</h1>
              <p className="text-xs text-gray-600">
                {language === 'mr'
                  ? 'कचरा वर्गीकरण, पुनर्वापर आणि इकोसेन्स एआय मार्गदर्शक'
                  : 'Get instant, reliable AI guidance on waste segregation, recycling rules, and EcoSense AI'}
              </p>
            </div>
            <EcoCopilotChat />
          </div>
        );
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

      {/* Floating AI Chatbot Button */}
      {activeTab !== 'copilot' && (
        <button
          onClick={() => handleNavigate('copilot')}
          className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-40 bg-[#0F2E23] hover:bg-[#154233] text-white p-3 sm:px-4 sm:py-2.5 rounded-full shadow-2xl flex items-center gap-2.5 border border-emerald-500/40 transition-all hover:scale-105 group cursor-pointer"
          title={t.navCopilot}
          aria-label={t.navCopilot}
        >
          <div className="w-8 h-8 rounded-full bg-[#10B981] text-[#0F2E23] flex items-center justify-center font-bold shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold leading-tight flex items-center gap-1.5">
              {t.navCopilot}
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </span>
            <span className="text-[10px] text-emerald-300">
              {language === 'mr' ? 'प्रश्न विचारा' : 'Ask AI'}
            </span>
          </div>
        </button>
      )}

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
