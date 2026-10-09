import React from 'react';
import { Camera, Sparkles, User, Edit3, ShieldCheck } from 'lucide-react';
import { useEco } from '../../context/EcoContext';
import type { UserRole } from '../../types';

interface DashboardViewProps {
  onNavigateToScanner: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateToScanner }) => {
  const { currentUser, updateUserProfile, setLoginModalOpen, totalWasteCount, scansList, reports, t } = useEco();

  const handleRoleChange = (r: UserRole) => {
    updateUserProfile({ role: r });
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Dynamic User Profile Header */}
      <div className="bg-[#0F2E23] text-white p-6 sm:p-8 rounded-2xl border border-[#154233] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Authenticated Session
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
            <span className="text-xs text-emerald-200/80 font-medium">{currentUser.role} Portal</span>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {t.loginWelcome}, {currentUser.name}
            </h2>
            <button
              onClick={() => setLoginModalOpen(true)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-300 hover:text-white transition-all cursor-pointer"
              title="Edit Profile / Switch User"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-emerald-100/80 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#10B981]" />
            <span>{currentUser.zone}</span> · <span className="font-mono">{currentUser.email}</span>
          </p>
        </div>

        {/* Role Switcher & Switch User Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-white/10 p-1 rounded-xl border border-white/15 text-xs">
            {(['Resident', 'Coordinator', 'Administrator'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => handleRoleChange(r)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  currentUser.role === r
                    ? 'bg-[#10B981] text-[#0F2E23] shadow-sm'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={() => setLoginModalOpen(true)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-emerald-200 text-xs font-bold rounded-xl border border-white/15 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <User className="w-3.5 h-3.5" />
            <span>{t.loginChangeUser}</span>
          </button>
        </div>
      </div>

      {/* TOP SECTION: SCANNER FIRST CTA */}
      <div className="bg-gradient-to-r from-[#0F2E23] via-[#154233] to-[#0F2E23] p-8 rounded-2xl border-2 border-[#10B981] shadow-2xl text-center space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#10B981]/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/20 text-[#34D399] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Primary Action
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {t.dashReadyTitle}
          </h2>
          <p className="text-emerald-100/80 text-sm">
            {t.dashReadyDesc}
          </p>

          <div className="pt-2 flex justify-center">
            <button
              onClick={onNavigateToScanner}
              className="px-8 py-4 bg-[#10B981] hover:bg-[#059669] text-[#0F2E23] font-black text-base rounded-full shadow-2xl flex items-center gap-3 transform hover:scale-105 transition-all cursor-pointer"
            >
              <Camera className="w-6 h-6" />
              <span>{t.dashScanNow}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Community Snapshot Cards (Collection Status Removed) */}
      <div className="space-y-4">
        <h3 className="font-bold text-gray-900 text-lg flex items-center justify-between">
          <span>{t.dashSnapshotTitle} ({currentUser.role} View)</span>
          <span className="text-xs text-[#10B981] font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Live 2-Zone Telemetry
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-md space-y-2">
            <span className="text-xs font-bold uppercase text-gray-500">{t.dashYourScans}</span>
            <div className="text-3xl font-extrabold text-[#0F2E23]">{scansList.length} items</div>
            <div className="text-xs text-emerald-600 font-semibold">96% Segregation Accuracy</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-md space-y-2">
            <span className="text-xs font-bold uppercase text-gray-500">{t.dashActiveIssues}</span>
            <div className="text-3xl font-extrabold text-amber-600">{reports.length} reports</div>
            <div className="text-xs text-gray-500">Kokan & NSP/Virar Active Tickets</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-md space-y-2">
            <span className="text-xs font-bold uppercase text-gray-500">{t.dashEcoScore}</span>
            <div className="text-3xl font-extrabold text-[#10B981]">82 / 100</div>
            <div className="text-xs text-gray-500">Total Scans Logged: {totalWasteCount}</div>
          </div>
        </div>
      </div>

      {/* Role Specific Actions */}
      {currentUser.role === 'Coordinator' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md space-y-4">
          <h4 className="font-bold text-[#0F2E23] text-base">Community Coordinator Management Panel</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-1">
              <span className="font-bold text-gray-900">Zone 2 (NSP/Virar) Inspection Dispatch</span>
              <p className="text-gray-600">Review 4 reports logged along Station Road & Bypass sector.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-1">
              <span className="font-bold text-gray-900">Zone 1 (Kokan) Coastal Clean Campaign</span>
              <p className="text-gray-600">Schedule organic bio-waste composting awareness drive.</p>
            </div>
          </div>
        </div>
      )}

      {currentUser.role === 'Administrator' && (
        <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-emerald-400 text-base">Municipal System Administrator Console</h4>
            <span className="text-xs font-mono text-gray-400">2-Zone Pipeline Active</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-white/10 p-3 rounded-xl border border-white/10">
              <span className="text-gray-400">Active Zones</span>
              <div className="font-mono font-bold text-white mt-1">2 Zones (Kokan & NSP/Virar)</div>
            </div>
            <div className="bg-white/10 p-3 rounded-xl border border-white/10">
              <span className="text-gray-400">Total Scans Telemetry</span>
              <div className="font-mono font-bold text-white mt-1">{totalWasteCount} Scans Indexed</div>
            </div>
            <div className="bg-white/10 p-3 rounded-xl border border-white/10">
              <span className="text-gray-400">API Health</span>
              <div className="font-mono font-bold text-[#10B981] mt-1">200 OK (14ms latency)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;
