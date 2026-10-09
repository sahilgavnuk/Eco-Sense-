import React from 'react';
import { Leaf, ShieldCheck, Heart } from 'lucide-react';
import { useEco } from '../../context/EcoContext';

interface FooterProps {
  onNavigate?: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t } = useEco();

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
              <span className="font-extrabold text-white text-lg tracking-tight">{t.brandTitle} AI</span>
            </div>
            <p className="text-emerald-100/70 max-w-sm leading-relaxed">
              {t.footerDesc}
            </p>
            <div className="flex items-center gap-2 text-[#10B981] font-semibold">
              <ShieldCheck className="w-4 h-4" /> {t.footerPrivacy}
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h4 className="font-bold text-emerald-300 uppercase tracking-wider text-[11px]">{t.footerCoreTitle}</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <button
                  onClick={() => handleNav('scanner')}
                  className="hover:text-white hover:underline transition-all cursor-pointer text-left"
                >
                  {t.navScanner}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('analytics')}
                  className="hover:text-white hover:underline transition-all cursor-pointer text-left"
                >
                  {t.navCommunity}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('challenges')}
                  className="hover:text-white hover:underline transition-all cursor-pointer text-left"
                >
                  {t.navEcoScore}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('copilot')}
                  className="hover:text-white hover:underline transition-all cursor-pointer text-left"
                >
                  {t.navCopilot}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('report')}
                  className="hover:text-white hover:underline transition-all cursor-pointer text-left"
                >
                  {t.navReport}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h4 className="font-bold text-emerald-300 uppercase tracking-wider text-[11px]">{t.footerZonesTitle}</h4>
            <ul className="space-y-1.5 text-gray-300">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                <span>{t.zone1Name}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                <span>{t.zone2Name}</span>
              </li>
              <li className="flex items-center gap-1.5 pt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>{t.footerEngine}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>{t.footerStandards}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>{t.footerRights}</p>
          <p className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> {t.footerMadeWith}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
