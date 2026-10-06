import { useState } from 'react';
import Navbar from './components/layout/Navbar';
import MobileNav from './components/layout/MobileNav';
import Footer from './components/layout/Footer';
import LandingPage from './pages/LandingPage';
import ScannerInterface from './components/scanner/ScannerInterface';
import AnalyticsView from './components/analytics/AnalyticsView';
import WasteMap from './components/map/WasteMap';
import PredictionsView from './components/predictions/PredictionsView';
import EcoCopilotChat from './components/copilot/EcoCopilotChat';
import ReportForm from './components/report/ReportForm';
import ChallengesView from './components/challenges/ChallengesView';
import DashboardView from './components/dashboard/DashboardView';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <LandingPage onNavigate={(tab) => setActiveTab(tab)} />;
      case 'scanner':
        return (
          <div className="pt-4 space-y-6">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <h1 className="text-3xl font-extrabold text-[#0F2E23]">AI Waste Intelligence Scanner</h1>
              <p className="text-xs text-gray-600">Scan waste items, analyze material composition, and discover disposal protocols.</p>
            </div>
            <ScannerInterface onNavigateToMap={() => setActiveTab('map')} />
          </div>
        );
      case 'analytics':
        return <AnalyticsView />;
      case 'map':
        return <WasteMap />;
      case 'predictions':
        return <PredictionsView />;
      case 'copilot':
        return <EcoCopilotChat />;
      case 'report':
        return <ReportForm />;
      case 'challenges':
        return <ChallengesView />;
      case 'dashboard':
        return <DashboardView onNavigateToScanner={() => setActiveTab('scanner')} />;
      default:
        return <LandingPage onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#111827] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Sticky Header Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderContent()}
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;
