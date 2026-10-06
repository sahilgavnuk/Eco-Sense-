import React from 'react';
import { CheckCircle2, ArrowRight, MapPin, Recycle, BarChart3, RefreshCw, Info } from 'lucide-react';
import type { ScanResult, DetectedObject } from '../../types';

interface ScanResultCardProps {
  result: ScanResult;
  activeObject: DetectedObject;
  onScanAnother: () => void;
  onNavigateToMap?: () => void;
}

export const ScanResultCard: React.FC<ScanResultCardProps> = ({ result: _result, activeObject, onScanAnother, onNavigateToMap }) => {
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Dry / Recyclable':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Wet / Organic':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Non-Recyclable':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'E-Waste':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Hazardous':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getConditionColor = (cond: string) => {
    switch (cond) {
      case 'Clean':
        return 'text-emerald-700 bg-emerald-50';
      case 'Slightly Contaminated':
        return 'text-amber-700 bg-amber-50';
      case 'Heavily Contaminated':
        return 'text-rose-700 bg-rose-50';
      default:
        return 'text-gray-700 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden space-y-5 p-6">
      {/* Header Label & Confidence */}
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-gray-100">
        <div>
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getCategoryColor(activeObject.category)} mb-1.5`}>
            {activeObject.category}
          </span>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>{activeObject.label}</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Material: <span className="font-semibold text-gray-700">{activeObject.material}</span>
          </p>
        </div>

        <div className="text-right">
          <div className="inline-flex items-center gap-1 bg-emerald-50 text-[#10B981] px-3 py-1 rounded-full border border-emerald-200 font-mono text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {activeObject.confidence}% AI Confidence
          </div>
          <div className={`mt-1 text-[11px] font-medium px-2 py-0.5 rounded inline-block ${getConditionColor(activeObject.condition)}`}>
            Condition: {activeObject.condition}
          </div>
        </div>
      </div>

      {/* STRONGEST VISUAL ELEMENT: ACTIONABLE DISPOSAL RECOMMENDATION */}
      <div className="bg-[#0F2E23] text-white p-5 rounded-xl border border-[#154233] shadow-md space-y-3">
        <div className="flex items-center justify-between text-xs uppercase tracking-wider text-emerald-300 font-bold">
          <span className="flex items-center gap-1.5">
            <Recycle className="w-4 h-4 text-[#10B981]" /> Recommended Action
          </span>
          <span className="text-white/60 text-[10px]">EcoSense Protocol</span>
        </div>

        {/* Step-by-step action flow */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {activeObject.disposalRecommendation.map((step, idx) => (
            <React.Fragment key={idx}>
              <div className="bg-white/10 hover:bg-white/15 px-3 py-2 rounded-lg border border-white/15 text-xs font-bold text-emerald-50 flex items-center gap-2 shadow-sm">
                <span className="w-4 h-4 rounded-full bg-[#10B981] text-[#0F2E23] text-[10px] font-black flex items-center justify-center">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </div>
              {idx < activeObject.disposalRecommendation.length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* EXPLAINABLE AI SECTION */}
      <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100 text-xs text-gray-700 space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-[#0F2E23]">
          <Info className="w-4 h-4 text-[#10B981]" />
          <span>Why this recommendation? (Explainable AI)</span>
        </div>
        <p className="text-gray-600 leading-relaxed pl-5">
          {activeObject.whyExplanation}
        </p>
      </div>

      {/* Community Intelligence Telemetry Message */}
      <div className="bg-gray-550/5 bg-gray-50 p-3 rounded-lg border border-gray-200/70 flex items-center gap-3 text-xs text-gray-600">
        <BarChart3 className="w-5 h-5 text-[#10B981] shrink-0" />
        <div>
          <span className="font-semibold text-gray-900">Community Intelligence Impact:</span> Every scan teaches EcoSense what your community throws away.
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 pt-2">
        <button
          onClick={onScanAnother}
          className="px-4 py-2.5 bg-[#0F2E23] hover:bg-[#154233] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Scan Another Item
        </button>

        <button
          onClick={() => {
            if (onNavigateToMap) {
              onNavigateToMap();
            } else {
              const mapEl = document.getElementById('map');
              if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-[#0F2E23] font-semibold text-xs rounded-xl border border-emerald-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <MapPin className="w-3.5 h-3.5 text-[#10B981]" /> Find Collection Point
        </button>
      </div>
    </div>
  );
};

export default ScanResultCard;
