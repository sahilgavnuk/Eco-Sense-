import { useState } from 'react';
import { Camera, Sparkles } from 'lucide-react';
import type { UserRole } from '../../types';

interface DashboardViewProps {
  onNavigateToScanner: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateToScanner }) => {
  const [role, setRole] = useState<UserRole>('Resident');

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Role Switcher Bar */}
      <div className="bg-[#0F2E23] text-white p-4 sm:p-6 rounded-2xl border border-[#154233] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
            Authenticated Portal — Active Session
          </span>
          <h2 className="text-xl font-bold text-white">Welcome Back, Sarah</h2>
          <p className="text-xs text-emerald-100/70">Zone 2 — Central District Resident Member</p>
        </div>

        {/* Role Toggles */}
        <div className="flex items-center bg-white/10 p-1 rounded-xl border border-white/15 text-xs">
          <span className="px-2 font-bold text-emerald-200">Role View:</span>
          {(['Resident', 'Coordinator', 'Administrator'] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                role === r
                  ? 'bg-[#10B981] text-white shadow'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* TOP SECTION: SCANNER FIRST CTA */}
      <div className="bg-gradient-to-r from-[#0F2E23] via-[#154233] to-[#0F2E23] p-8 rounded-2xl border-2 border-[#10B981] shadow-2xl text-center space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#10B981]/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/20 text-[#34D399] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Primary Action Needed
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Good morning. Ready to scan waste?
          </h2>
          <p className="text-emerald-100/80 text-sm">
            Point your camera at any item. Receive instant disposal steps and feed your anonymized scan into EcoSense Community Intelligence.
          </p>

          <div className="pt-2 flex justify-center">
            <button
              onClick={onNavigateToScanner}
              className="px-8 py-4 bg-[#10B981] hover:bg-[#059669] text-[#0F2E23] font-black text-base rounded-full shadow-2xl flex items-center gap-3 transform hover:scale-105 transition-all cursor-pointer"
            >
              <Camera className="w-6 h-6" />
              <span>SCAN WASTE NOW</span>
            </button>
          </div>
        </div>
      </div>

      {/* Community Snapshot Cards */}
      <div className="space-y-4">
        <h3 className="font-bold text-gray-900 text-lg flex items-center justify-between">
          <span>Community Snapshot ({role} View)</span>
          <span className="text-xs text-[#10B981] font-semibold">Live Telemetry Stream</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-md space-y-2">
            <span className="text-xs font-bold uppercase text-gray-500">Your Scans This Month</span>
            <div className="text-3xl font-extrabold text-[#0F2E23]">24 items</div>
            <div className="text-xs text-emerald-600 font-semibold">96% Segregation Accuracy</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-md space-y-2">
            <span className="text-xs font-bold uppercase text-gray-500">Active Neighborhood Issues</span>
            <div className="text-3xl font-extrabold text-amber-600">3 reports</div>
            <div className="text-xs text-gray-500">1 High Priority Dispatch</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-md space-y-2">
            <span className="text-xs font-bold uppercase text-gray-500">Community EcoScore</span>
            <div className="text-3xl font-extrabold text-[#10B981]">78 / 100</div>
            <div className="text-xs text-gray-500">Top 15% Neighborhood Rank</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-md space-y-2">
            <span className="text-xs font-bold uppercase text-gray-500">Collection Status</span>
            <div className="text-3xl font-extrabold text-[#0F2E23]">ON TIME</div>
            <div className="text-xs text-emerald-600 font-semibold">Zone 2 Truck ETA: 08:30 AM</div>
          </div>
        </div>
      </div>

      {/* Role Specific Actions */}
      {role === 'Resident' && (
        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-[#0F2E23] text-base">7-Day Segregation Challenge Active</h4>
            <p className="text-xs text-gray-700 mt-0.5">Maintain your 14-day scan streak for additional community badges.</p>
          </div>
          <button
            onClick={onNavigateToScanner}
            className="px-5 py-2.5 bg-[#0F2E23] text-white font-bold text-xs rounded-xl shadow"
          >
            Log Today's Scan
          </button>
        </div>
      )}

      {role === 'Coordinator' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md space-y-4">
          <h4 className="font-bold text-[#0F2E23] text-base">Community Coordinator Management Panel</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-1">
              <span className="font-bold text-gray-900">Zone 2 Inspection Dispatch</span>
              <p className="text-gray-600">Review 4 reports logged along Market St commercial sector.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-1">
              <span className="font-bold text-gray-900">Campaign Creation</span>
              <p className="text-gray-600">Schedule "Empty & Rinse PET Bottles" notification drive.</p>
            </div>
          </div>
        </div>
      )}

      {role === 'Administrator' && (
        <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-emerald-400 text-base">Municipal System Administrator Console</h4>
            <span className="text-xs font-mono text-gray-400">PostGIS + PyTorch Pipeline Active</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-white/10 p-3 rounded-xl border border-white/10">
              <span className="text-gray-400">Computer Vision Inference</span>
              <div className="font-mono font-bold text-white mt-1">YOLOv8-Waste v2.6 (94.2% Acc)</div>
            </div>
            <div className="bg-white/10 p-3 rounded-xl border border-white/10">
              <span className="text-gray-400">Spatial Vector DB</span>
              <div className="font-mono font-bold text-white mt-1">pgvector PostGIS (1,842 nodes)</div>
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
