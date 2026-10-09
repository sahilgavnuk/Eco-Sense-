import React from 'react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { Sparkles, BarChart3, ArrowUpRight, Download } from 'lucide-react';
import { useEco } from '../../context/EcoContext';
import { MOCK_DAILY_TRENDS } from '../../data/mockData';

const CATEGORY_PIE_DATA = [
  { name: 'PET & Plastic Packaging', value: 44, color: '#10B981' },
  { name: 'Wet / Organic Waste', value: 34, color: '#F59E0B' },
  { name: 'Paper & Cardboard', value: 14, color: '#3B82F6' },
  { name: 'E-Waste & Hazardous', value: 8, color: '#8B5CF6' }
];

export const AnalyticsView: React.FC = () => {
  const { totalWasteCount, zoneMetrics, t } = useEco();

  const handleExportCSV = () => {
    const headers = 'Zone,Total Scans,Segregation Rate,Dominant Waste,Active Issues\n';
    const rows = zoneMetrics.map(
      (z) => `"${z.zoneName}",${z.scansThisMonth},${z.segregationRate}%,"${z.dominantCategory}",${z.activeIssues}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ecosense_waste_intelligence_2zones_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-[#0F2E23] text-white p-6 sm:p-8 rounded-2xl border border-[#154233] shadow-xl space-y-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#10B981]/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/20 text-[#34D399] text-xs font-bold uppercase tracking-wider mb-2">
              <BarChart3 className="w-3.5 h-3.5" /> {t.analyticsBadge}
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              {t.analyticsTitle}
            </h2>
            <p className="text-emerald-100/70 text-sm mt-1 max-w-2xl">
              {t.analyticsDesc}
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/15 flex items-center gap-2 transition-all shrink-0 cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 text-[#10B981]" /> {t.analyticsExport}
          </button>
        </div>
      </div>

      {/* KPI Stat Cards (Connection Reliability Removed, Total Waste Count = 150) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-md space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold uppercase">
            <span>{t.kpiTotalScans}</span>
            <span className="text-emerald-600 font-bold flex items-center"><ArrowUpRight className="w-3.5 h-3.5" /> Live Telemetry</span>
          </div>
          <div className="text-4xl font-extrabold text-[#0F2E23]">{totalWasteCount}</div>
          <div className="text-xs text-gray-500">{t.kpiInputsDesc}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-md space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold uppercase">
            <span>{t.kpiPlasticShare}</span>
            <span className="text-rose-600 font-bold flex items-center"><ArrowUpRight className="w-3.5 h-3.5" /> 44.0%</span>
          </div>
          <div className="text-4xl font-extrabold text-[#10B981]">44.0%</div>
          <div className="text-xs text-gray-500">Highest Category in NSP/Virar</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-md space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold uppercase">
            <span>{t.kpiSegregation}</span>
            <span className="text-emerald-600 font-bold flex items-center"><ArrowUpRight className="w-3.5 h-3.5" /> +5.4%</span>
          </div>
          <div className="text-4xl font-extrabold text-[#0F2E23]">80.0%</div>
          <div className="text-xs text-gray-500">Correctly sorted across Kokan & NSP/Virar</div>
        </div>
      </div>

      {/* AI INSIGHT ENGINE HIGHLIGHT BANNER */}
      <div className="bg-gradient-to-r from-[#0F2E23] to-[#154233] text-white p-6 rounded-2xl border border-[#10B981]/30 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[#34D399] uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-[#10B981]" /> EcoSense AI 2-Zone Insight Engine
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-white/10 p-4 rounded-xl border border-white/10 space-y-1">
            <span className="text-emerald-300 font-bold uppercase text-[10px]">01 — Kokan Region Telemetry</span>
            <p className="text-emerald-50 leading-relaxed">
              Kokan region shows high organic and bio-waste generation (38%), with an 84% segregation accuracy into organic compost streams.
            </p>
          </div>

          <div className="bg-white/10 p-4 rounded-xl border border-white/10 space-y-1">
            <span className="text-emerald-300 font-bold uppercase text-[10px]">02 — NSP East/West & Virar</span>
            <p className="text-emerald-50 leading-relaxed">
              PET plastic packaging and takeaway wrappers constitute 48% of scans near Station and Commercial areas, requiring rinse awareness.
            </p>
          </div>

          <div className="bg-[#10B981] text-[#0F2E23] p-4 rounded-xl font-medium space-y-1 shadow-md">
            <span className="font-bold uppercase text-[10px] text-[#0F2E23]/80">03 — Action Plan</span>
            <p className="leading-relaxed font-bold">
              Targeted "Empty & Rinse" drive in NSP/Virar and coastal biomethanation support in Kokan.
            </p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Distribution Pie Chart */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-200 shadow-md space-y-4">
          <h3 className="font-bold text-gray-900 text-base">{t.analyticsBreakdownTitle}</h3>
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_PIE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {CATEGORY_PIE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {CATEGORY_PIE_DATA.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                <span className="text-gray-700 font-medium truncate">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Scan Trend Line Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-200 shadow-md space-y-4">
          <h3 className="font-bold text-gray-900 text-base">Daily Scan Telemetry (Kokan & NSP/Virar)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_DAILY_TRENDS}>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="scans" stroke="#10B981" strokeWidth={3} name="Total Scans" />
                <Line type="monotone" dataKey="recyclable" stroke="#3B82F6" strokeWidth={2} name="Recyclable" />
                <Line type="monotone" dataKey="organic" stroke="#F59E0B" strokeWidth={2} name="Organic Scraps" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Zone Performance Table — Exactly 2 Zones Only (Reliability removed) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md space-y-4">
        <h3 className="font-bold text-gray-900 text-base">{t.zoneTableTitle}</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 border-b border-gray-200 uppercase font-bold text-gray-500">
              <tr>
                <th className="py-3 px-4">{t.zoneColName}</th>
                <th className="py-3 px-4">{t.zoneColScans}</th>
                <th className="py-3 px-4">{t.zoneColSegregation}</th>
                <th className="py-3 px-4">{t.zoneColDominant}</th>
                <th className="py-3 px-4 text-right">{t.zoneColIssues}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {zoneMetrics.map((zone) => (
                <tr key={zone.zoneId} className="hover:bg-gray-50/80 transition-all">
                  <td className="py-3.5 px-4 font-bold text-[#0F2E23] text-sm">{zone.zoneName}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-800">{zone.scansThisMonth} scans</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      {zone.segregationRate}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">{zone.dominantCategory}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold ${
                      zone.activeIssues > 3 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {zone.activeIssues} issues
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
