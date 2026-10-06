import { Leaf, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0F2E23] text-white border-t border-[#154233] pt-12 pb-24 lg:pb-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-white/10 text-xs">
          {/* Col 1 */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#10B981] text-[#0F2E23] flex items-center justify-center font-bold">
                <Leaf className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight">EcoSense AI</span>
            </div>
            <p className="text-emerald-100/70 max-w-sm leading-relaxed">
              AI-Powered Community Waste Intelligence Platform. Transforming everyday waste scanning into community dataset telemetry, geospatial analytics, and predictive action.
            </p>
            <div className="flex items-center gap-2 text-[#10B981] font-semibold">
              <ShieldCheck className="w-4 h-4" /> Anonymized Privacy-First Architecture
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h4 className="font-bold text-emerald-300 uppercase tracking-wider text-[11px]">Platform Core</h4>
            <ul className="space-y-1.5 text-gray-300">
              <li><a href="#scanner" className="hover:text-white transition-all">AI Waste Scanner</a></li>
              <li><a href="#analytics" className="hover:text-white transition-all">Community Intelligence</a></li>
              <li><a href="#map" className="hover:text-white transition-all">Geospatial Waste Map</a></li>
              <li><a href="#predictions" className="hover:text-white transition-all">Predictive Analytics</a></li>
              <li><a href="#copilot" className="hover:text-white transition-all">EcoSense Copilot</a></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h4 className="font-bold text-emerald-300 uppercase tracking-wider text-[11px]">Environmental Startup</h4>
            <ul className="space-y-1.5 text-gray-300">
              <li><span>PyTorch Computer Vision</span></li>
              <li><span>PostGIS GIS Pipeline</span></li>
              <li><span>Zero-Hallucination RAG</span></li>
              <li><span>Municipal APIs</span></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>© 2026 EcoSense AI Platform Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for cleaner communities.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
