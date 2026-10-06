import React from 'react';
import { Home, Camera, ShieldAlert, Bot, User } from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-[#0F2E23]/95 backdrop-blur-lg border-t border-[#154233] px-4 py-2 flex items-center justify-around shadow-2xl">
      <button
        onClick={() => setActiveTab('home')}
        className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
          activeTab === 'home' ? 'text-[#10B981]' : 'text-gray-400'
        }`}
      >
        <Home className="w-5 h-5" />
        <span>Home</span>
      </button>

      <button
        onClick={() => setActiveTab('report')}
        className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
          activeTab === 'report' ? 'text-[#10B981]' : 'text-gray-400'
        }`}
      >
        <ShieldAlert className="w-5 h-5" />
        <span>Report</span>
      </button>

      {/* Prominent Center Scan CTA */}
      <button
        onClick={() => setActiveTab('scanner')}
        className="flex flex-col items-center -mt-6"
      >
        <div className="w-14 h-14 rounded-full bg-[#10B981] text-[#0F2E23] flex items-center justify-center font-bold shadow-2xl ring-4 ring-[#0F2E23] transform hover:scale-110 transition-all">
          <Camera className="w-7 h-7" />
        </div>
        <span className="text-[10px] font-extrabold text-[#10B981] mt-1 uppercase tracking-wider">Scan</span>
      </button>

      <button
        onClick={() => setActiveTab('copilot')}
        className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
          activeTab === 'copilot' ? 'text-[#10B981]' : 'text-gray-400'
        }`}
      >
        <Bot className="w-5 h-5" />
        <span>AI Copilot</span>
      </button>

      <button
        onClick={() => setActiveTab('dashboard')}
        className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
          activeTab === 'dashboard' ? 'text-[#10B981]' : 'text-gray-400'
        }`}
      >
        <User className="w-5 h-5" />
        <span>Profile</span>
      </button>
    </div>
  );
};

export default MobileNav;
