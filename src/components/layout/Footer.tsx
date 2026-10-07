import { Leaf, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate?: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleNav = (tab: string) => {
    if (onNavigate) {
      onNavigate(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#0F2E23] text-white border-t border-[#154233] pt-12 pb-24 lg:pb-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-white/10 text-xs">
          {/* Col 1 */}
          <div className="space-y-3 md:col-span-2">
            <div
              onClick={() => handleNav('home')}
              className="flex items-center gap-2 cursor-pointer group inline-flex"
            >
              <div className="w-8 h-8 rounded-lg bg-[#10B981] text-[#0F2E23] flex items-center justify-center font-bold group-hover:scale-105 transition-all">
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
            <ul className="space-y-2 text-gray-300">
              <li>
                <button
                  onClick={() => handleNav('scanner')}
                  className="hover:text-white hover:underline transition-all cursor-pointer text-left"
                >
                  AI Waste Scanner
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('analytics')}
                  className="hover:text-white hover:underline transition-all cursor-pointer text-left"
                >
                  Community Intelligence
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('map')}
                  className="hover:text-white hover:underline transition-all cursor-pointer text-left"
                >
                  Geospatial Waste Map
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('predictions')}
                  className="hover:text-white hover:underline transition-all cursor-pointer text-left"
                >
                  Predictive Analytics
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('copilot')}
                  className="hover:text-white hover:underline transition-all cursor-pointer text-left"
                >
                  EcoSense Copilot
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('report')}
                  className="hover:text-white hover:underline transition-all cursor-pointer text-left"
                >
                  Report Incident
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h4 className="font-bold text-emerald-300 uppercase tracking-wider text-[11px]">Technology Stack</h4>
            <ul className="space-y-1.5 text-gray-300">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                <span>Google Gemini 3.8 Flash Vision</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                <span>Leaflet GIS OpenStreetMap</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                <span>Vercel Edge Functions</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                <span>Recharts Analytical Engine</span>
              </li>
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
