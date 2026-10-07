import { useState } from 'react';
import { Camera, BarChart3, MapPin, TrendingUp, Bot, ShieldAlert, Trophy, LayoutDashboard, Leaf, Menu, X } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'scanner', label: 'AI Scanner', icon: Camera },
    { id: 'analytics', label: 'Community', icon: BarChart3 },
    { id: 'map', label: 'Waste Map', icon: MapPin },
    { id: 'predictions', label: 'Predictions', icon: TrendingUp },
    { id: 'copilot', label: 'AI Copilot', icon: Bot },
    { id: 'report', label: 'Report Issue', icon: ShieldAlert },
    { id: 'challenges', label: 'EcoScore', icon: Trophy },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FBFBFA]/95 backdrop-blur-md border-b border-gray-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#0F2E23] text-[#10B981] flex items-center justify-center font-black shadow-md group-hover:scale-105 transition-all">
            <Leaf className="w-5 h-5 text-[#10B981]" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-gray-900 text-lg tracking-tight">EcoSense</span>
              <span className="text-[#10B981] font-black text-lg">AI</span>
            </div>
            <span className="text-[10px] text-gray-500 font-semibold tracking-wider block -mt-1 uppercase">
              Waste Intelligence
            </span>
          </div>
        </div>

        {/* Desktop Nav Items */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-gray-700">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === item.id
                  ? 'bg-[#0F2E23] text-white font-bold shadow-xs'
                  : 'hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Highlighted Primary CTA & Mobile Hamburger */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleNavClick('scanner')}
            className="px-4 sm:px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] text-[#0F2E23] font-black text-xs rounded-full shadow-lg flex items-center gap-2 transform hover:scale-105 transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Waste</span>
          </button>

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 transition-all cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white/98 backdrop-blur-xl px-4 py-4 space-y-1.5 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-1.5 pb-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    activeTab === item.id
                      ? 'bg-[#0F2E23] text-white shadow-xs'
                      : 'bg-gray-50 text-gray-700 hover:bg-emerald-50 hover:text-[#0F2E23]'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 text-[#10B981] shrink-0" />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
