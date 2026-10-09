import React, { useState } from 'react';
import { Camera, BarChart3, Bot, ShieldAlert, Trophy, LayoutDashboard, Leaf, Menu, X, Globe, User } from 'lucide-react';
import { useEco } from '../../context/EcoContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t, currentUser, setLoginModalOpen } = useEco();

  const navItems = [
    { id: 'home', label: t.navHome },
    { id: 'scanner', label: t.navScanner, icon: Camera },
    { id: 'analytics', label: t.navCommunity, icon: BarChart3 },
    { id: 'challenges', label: t.navEcoScore, icon: Trophy },
    { id: 'copilot', label: t.navCopilot, icon: Bot },
    { id: 'report', label: t.navReport, icon: ShieldAlert },
    { id: 'dashboard', label: t.navDashboard, icon: LayoutDashboard }
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'mr' : 'en');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FBFBFA]/95 backdrop-blur-md border-b border-gray-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <div
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-[#0F2E23] text-[#10B981] flex items-center justify-center font-black shadow-md group-hover:scale-105 transition-all">
            <Leaf className="w-5 h-5 text-[#10B981]" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-gray-900 text-lg tracking-tight">{t.brandTitle}</span>
              <span className="text-[#10B981] font-black text-lg">AI</span>
            </div>
            <span className="text-[10px] text-gray-500 font-semibold tracking-wider block -mt-1 uppercase">
              {t.brandSubtitle}
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

        {/* Right CTA / Language / User */}
        <div className="flex items-center gap-2">
          {/* Language Switcher Button */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl border border-gray-200 transition-all cursor-pointer shadow-2xs"
            title={t.langSwitchLabel}
          >
            <Globe className="w-3.5 h-3.5 text-[#10B981]" />
            <span>{language === 'en' ? 'मराठी' : 'EN'}</span>
          </button>

          {/* User Profile / Login Button */}
          <button
            onClick={() => setLoginModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#0F2E23] font-bold text-xs rounded-xl border border-emerald-200 transition-all cursor-pointer shadow-2xs"
          >
            <User className="w-3.5 h-3.5 text-[#10B981]" />
            <span className="truncate max-w-[100px]">{currentUser.isLoggedIn ? currentUser.name : t.loginGuest}</span>
          </button>

          {/* Highlighted Primary CTA */}
          <button
            onClick={() => handleNavClick('scanner')}
            className="px-3.5 sm:px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-[#0F2E23] font-black text-xs rounded-full shadow-md flex items-center gap-1.5 transform hover:scale-105 transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>{t.scanWasteCta}</span>
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
        <div className="lg:hidden border-t border-gray-200 bg-white/98 backdrop-blur-xl px-4 py-4 space-y-2 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <button
              onClick={() => {
                setLoginModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-[#0F2E23] bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200"
            >
              <User className="w-3.5 h-3.5 text-[#10B981]" />
              <span>{currentUser.isLoggedIn ? currentUser.name : t.loginGuest}</span>
            </button>

            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 text-xs font-bold bg-gray-100 px-3 py-1.5 rounded-lg"
            >
              <Globe className="w-3.5 h-3.5 text-[#10B981]" />
              <span>{language === 'en' ? 'मराठी' : 'English'}</span>
            </button>
          </div>

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
