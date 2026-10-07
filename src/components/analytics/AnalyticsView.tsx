import { XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { Sparkles, BarChart3, ArrowUpRight, Download } from 'lucide-react';
import { MOCK_DAILY_TRENDS, MOCK_ZONE_METRICS } from '../../data/mockData';

const CATEGORY_PIE_DATA = [
  { name: 'PET & Plastic Packaging', value: 42, color: '#10B981' },
  { name: 'Wet / Organic Waste', value: 28, color: '#F59E0B' },
  { name: 'Paper & Cardboard', value: 17, color: '#3B82F6' },
  { name: 'E-Waste & Non-Recyclable', value: 13, color: '#8B5CF6' }
];

export const AnalyticsView: React.FC = () => {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-[#0F2E23] text-white p-6 sm:p-8 rounded-2xl border border-[#154233] shadow-xl space-y-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#10B981]/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/20 text-[#34D399] text-xs font-bold uppercase tracking-wider mb-2">
              <BarChart3 className="w-3.5 h-3.5" /> Environmental Data Platform
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              Community Waste Intelligence
            </h2>
            <p className="text-emerald-100/70 text-sm mt-1 max-w-2xl">
              Anonymized telemetry from user scans transformed into actionable waste management insights, category breakdown models, and zone-level intervention metrics.
            </p>
          </div>

          <button
            onClick={() => {
              const headers = 'Zone,Total Scans,Segregation Rate,Collection Reliability,Dominant Waste,Active Issues\n';
              const rows = MOCK_ZONE_METRICS.map(
                (z) => `"${z.zoneName}",${z.scansThisMonth},${z.segregationRate}%,${z.collectionReliability}%,"${z.dominantCategory}",${z.activeIssues}`
              ).join('\n');
              const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', `ecosense_waste_intelligence_${new Date().toISOString().slice(0, 10)}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/15 flex items-center gap-2 transition-all shrink-0 cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 text-[#10B981]" /> Export Dataset (CSV)
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-md space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold uppercase">
            <span>Total Waste Scans</span>
            <span className="text-emerald-600 font-bold flex items-center"><ArrowUpRight className="w-3.5 h-3.5" /> +18.4%</span>
          </div>
          <div className="text-3xl font-extrabold text-[#0F2E23]">1,842</div>
          <div className="text-xs text-gray-500">Telemetry inputs from 4 community zones</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-md space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold uppercase">
            <span>Plastic Packaging Share</span>
            <span className="text-rose-600 font-bold flex items-center"><ArrowUpRight className="w-3.5 h-3.5" /> Highest</span>
          </div>
          <div className="text-3xl font-extrabold text-[#10B981]">42.0%</div>
          <div className="text-xs text-gray-[#10B981] font-medium">Dominant item: PET Beverage Containers</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-md space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold uppercase">
            <span>Segregation Accuracy</span>
            <span className="text-emerald-600 font-bold flex items-center"><ArrowUpRight className="w-3.5 h-3.5" /> +4.2%</span>
          </div>
          <div className="text-3xl font-extrabold text-[#0F2E23]">78.4%</div>
          <div className="text-xs text-gray-500">Correctly sorted into Dry/Organic bins</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-md space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold uppercase">
            <span>Collection Reliability</span>
            <span className="text-[#10B981] font-bold">92.0%</span>
          </div>
          <div className="text-3xl font-extrabold text-[#0F2E23]">92 / 100</div>
          <div className="text-xs text-gray-500">Municipal truck schedule adherence</div>
        </div>
      </div>

      {/* AI INSIGHT ENGINE HIGHLIGHT BANNER */}
      <div className="bg-gradient-to-r from-[#0F2E23] to-[#154233] text-white p-6 rounded-2xl border border-[#10B981]/30 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[#34D399] uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-[#10B981]" /> EcoSense AI Community Insight Engine
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-white/10 p-4 rounded-xl border border-white/10 space-y-1">
            <span className="text-emerald-300 font-bold uppercase text-[10px]">01 — Observed Data</span>
            <p className="text-emerald-50 leading-relaxed">
              PET plastic packaging constitutes 42% of all scans in Zone 2, with a 24% contamination rate due to unrinsed food residues.
            </p>
          </div>

          <div className="bg-white/10 p-4 rounded-xl border border-white/10 space-y-1">
            <span className="text-emerald-300 font-bold uppercase text-[10px]">02 — AI Interpretation</span>
            <p className="text-emerald-50 leading-relaxed">
              Residential households are eager to recycle plastic bottles but lack awareness regarding mandatory rinsing prior to blue bin disposal.
            </p>
          </div>

          <div className="bg-[#10B981] text-[#0F2E23] p-4 rounded-xl font-medium space-y-1 shadow-md">
            <span className="font-bold uppercase text-[10px] text-[#0F2E23]/80">03 — Recommended Community Action</span>
            <p className="leading-relaxed font-bold">
              Deploy targeted "Empty & Rinse" micro-campaign to Zone 2 residents and increase dry recyclables pickup frequency by 15%.
            </p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Distribution Pie Chart */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-200 shadow-md space-y-4">
          <h3 className="font-bold text-gray-900 text-base">Waste Category Composition</h3>
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
          <h3 className="font-bold text-gray-900 text-base">Daily Scan Telemetry & Segregation Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_DAILY_TRENDS.slice(0, 7)}>
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

      {/* Zone Performance Table */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md space-y-4">
        <h3 className="font-bold text-gray-900 text-base">Zone-Level Waste Intelligence Breakdown</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 border-b border-gray-200 uppercase font-bold text-gray-500">
              <tr>
                <th className="py-3 px-4">Zone Name</th>
                <th className="py-3 px-4">Scans This Month</th>
                <th className="py-3 px-4">Segregation Index</th>
                <th className="py-3 px-4">Collection Reliability</th>
                <th className="py-3 px-4">Dominant Waste Category</th>
                <th className="py-3 px-4 text-right">Active Issues</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {MOCK_ZONE_METRICS.map((zone) => (
                <tr key={zone.zoneId} className="hover:bg-gray-50/80 transition-all">
                  <td className="py-3.5 px-4 font-bold text-[#0F2E23]">{zone.zoneName}</td>
                  <td className="py-3.5 px-4">{zone.scansThisMonth} scans</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">
                      {zone.segregationRate}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4">{zone.collectionReliability}%</td>
                  <td className="py-3.5 px-4 text-gray-600">{zone.dominantCategory}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      zone.activeIssues > 5 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
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
