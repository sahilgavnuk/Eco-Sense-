import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Sparkles, AlertTriangle, ShieldCheck, Sliders } from 'lucide-react';
import { MOCK_DAILY_TRENDS } from '../../data/mockData';

export const PredictionsView: React.FC = () => {
  const [eventSurge, setEventSurge] = useState<boolean>(false);
  const [campaignActive, setCampaignActive] = useState<boolean>(true);

  const forecastData = MOCK_DAILY_TRENDS.map((item) => {
    let multiplier = 1.0;
    if (eventSurge) multiplier += 0.25;
    if (campaignActive && item.date.includes('FC')) multiplier -= 0.10;

    const baseKg = item.forecastKg || 720;
    return {
      ...item,
      projectedKg: Math.round(baseKg * multiplier),
      confidenceUpper: Math.round(baseKg * multiplier * 1.08),
      confidenceLower: Math.round(baseKg * multiplier * 0.92)
    };
  });

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-[#0F2E23] text-white p-6 sm:p-8 rounded-2xl border border-[#154233] shadow-xl space-y-4 relative overflow-hidden">
        <div className="absolute -left-10 -bottom-10 w-80 h-80 bg-[#10B981]/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/20 text-[#34D399] text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> AI Predictive Forecast Engine
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              Don't just understand yesterday. Prepare for tomorrow.
            </h2>
            <p className="text-emerald-100/70 text-sm mt-1 max-w-2xl">
              Machine learning models analyze historical scan telemetry, seasonal trends, and municipal weather patterns to forecast 30-day waste volumes and pressure zones.
            </p>
          </div>

          <div className="bg-emerald-950/80 border border-emerald-500/40 p-4 rounded-xl text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-emerald-300">30-Day Waste Generation Forecast</span>
            <div className="text-2xl font-black text-white mt-0.5">
              760 kg/day <span className="text-xs text-[#10B981] font-bold">↑ 8.2%</span>
            </div>
            <span className="text-[11px] text-emerald-200/80">AI Estimate (High Confidence)</span>
          </div>
        </div>
      </div>

      {/* Scenario Simulation Controls */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
          <Sliders className="w-4 h-4 text-[#10B981]" /> Scenario Simulation Controls:
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={eventSurge}
              onChange={(e) => setEventSurge(e.target.checked)}
              className="w-4 h-4 rounded text-[#10B981] focus:ring-[#10B981] accent-[#10B981]"
            />
            <span>Simulate Weekend Festival Surge (+25% Waste)</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={campaignActive}
              onChange={(e) => setCampaignActive(e.target.checked)}
              className="w-4 h-4 rounded text-[#10B981] focus:ring-[#10B981] accent-[#10B981]"
            />
            <span>Active Segregation Awareness Campaign (-10% Waste)</span>
          </label>
        </div>
      </div>

      {/* Main Forecast Graph */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-base">30-Day Waste Volume Generation Forecast (kg/day)</h3>
            <p className="text-xs text-gray-500">Shaded area represents AI confidence interval (95% statistical boundary)</p>
          </div>
          <span className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-full border border-emerald-200">
            Model: Time-Series ARIMA + Scan Telemetry
          </span>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData}>
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={[500, 1000]} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="confidenceUpper" stroke="none" fill="#10B981" fillOpacity={0.1} name="Upper CI (95%)" />
              <Area type="monotone" dataKey="projectedKg" stroke="#10B981" strokeWidth={3} fill="#10B981" fillOpacity={0.25} name="Projected Waste (kg/day)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* High Pressure Zone Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-amber-50/80 p-5 rounded-2xl border border-amber-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase">
            <AlertTriangle className="w-4 h-4 text-amber-600" /> High Pressure Forecast Alert — Zone 2
          </div>
          <h4 className="font-bold text-gray-900 text-sm">Central District Packaging Overflow Risk</h4>
          <p className="text-xs text-gray-700 leading-relaxed">
            AI projects a <strong>34% increase in PET bottle packaging</strong> on October 9 due to scheduled commercial market events. Municipal bin overflow probability is 82%.
          </p>
          <div className="text-xs font-bold text-amber-900 bg-amber-100/80 p-2.5 rounded-lg border border-amber-200">
            Suggested Preemptive Action: Dispatch extra 240L recycling bins to Market St by Oct 8 evening.
          </div>
        </div>

        <div className="bg-emerald-50/80 p-5 rounded-2xl border border-emerald-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" /> Segregation Improvement Forecast — Zone 4
          </div>
          <h4 className="font-bold text-gray-900 text-sm">Tech Quarter Plastic Reduction Milestone</h4>
          <p className="text-xs text-gray-700 leading-relaxed">
            Community participation trend indicates Zone 4 will achieve <strong>94% dry-waste segregation accuracy</strong> within 12 days, reducing landfill contamination by 1.2 metric tons.
          </p>
          <div className="text-xs font-bold text-emerald-900 bg-emerald-100/80 p-2.5 rounded-lg border border-emerald-200">
            Suggested Action: Award Zone 4 Community Green Distinction Badge.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionsView;
