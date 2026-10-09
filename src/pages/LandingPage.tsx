import React from 'react';
import { Camera, Sparkles, ArrowRight, Layers, BarChart3, Trophy, ShieldAlert } from 'lucide-react';
import ScannerInterface from '../components/scanner/ScannerInterface';
import { useEco } from '../context/EcoContext';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { t } = useEco();

  return (
    <div className="space-y-16 sm:space-y-24 pb-12">
      {/* HERO SECTION — SCANNER FIRST */}
      <section className="relative pt-6 pb-12">
        <div className="text-center space-y-4 max-w-4xl mx-auto mb-10 px-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[#0F2E23] text-xs font-extrabold uppercase tracking-wider shadow-xs">
            <Sparkles className="w-4 h-4 text-[#10B981]" /> {t.heroBadge}
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-[#0F2E23] tracking-tight leading-[1.1]">
            {t.heroTitle1} <br className="hidden sm:block" />
            <span className="text-[#10B981]">{t.heroTitle2}</span>
          </h1>

          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {t.heroSubtitle}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => {
                const scannerElement = document.getElementById('hero-scanner');
                scannerElement?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3.5 bg-[#0F2E23] hover:bg-[#154233] text-white font-extrabold text-sm rounded-full shadow-xl flex items-center gap-2 transform hover:scale-105 transition-all cursor-pointer"
            >
              <Camera className="w-5 h-5 text-[#10B981]" /> {t.heroScanBtn}
            </button>

            <button
              onClick={() => onNavigate('analytics')}
              className="px-6 py-3.5 bg-white hover:bg-gray-50 text-[#0F2E23] font-bold text-sm rounded-full border border-gray-300 shadow-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <BarChart3 className="w-4 h-4 text-[#10B981]" /> {t.heroExploreBtn}
            </button>
          </div>
        </div>

        {/* HERO SCANNER ENGINE WORKSPACE */}
        <div id="hero-scanner" className="px-2 sm:px-4">
          <ScannerInterface
            onNavigate={onNavigate}
            onScanComplete={(res) => console.log('Hero scan complete', res)}
          />
        </div>
      </section>

      {/* SECTION 01 — THE PROBLEM */}
      <section className="bg-white py-16 border-y border-gray-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold text-[#10B981] uppercase tracking-wider">{t.problemBadge}</span>
            <h2 className="text-3xl font-extrabold text-[#0F2E23]">{t.problemTitle}</h2>
            <p className="text-sm text-gray-600">{t.problemSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">?</div>
              <h3 className="font-bold text-gray-900 text-base">{t.problemCard1Title}</h3>
              <p className="text-xs text-gray-600">{t.problemCard1Desc}</p>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">?</div>
              <h3 className="font-bold text-gray-900 text-base">{t.problemCard2Title}</h3>
              <p className="text-xs text-gray-600">{t.problemCard2Desc}</p>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">✓</div>
              <h3 className="font-bold text-gray-900 text-base">{t.problemCard3Title}</h3>
              <p className="text-xs text-gray-600">{t.problemCard3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 02 — THE BIGGER IDEA: TELEMETRY LOOP STORY */}
      <section className="bg-[#0F2E23] text-white py-16 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/20 text-[#34D399] text-xs font-bold uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" /> {t.telemetrySectionBadge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {t.telemetrySectionTitle}
            </h2>
            <p className="text-emerald-100/70 text-sm">
              {t.telemetrySectionDesc}
            </p>
          </div>

          {/* Continuous Loop Visual */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white/10 p-5 rounded-2xl border border-white/10 space-y-2">
              <span className="text-xs font-bold text-emerald-400">STEP 01</span>
              <h4 className="font-bold text-white text-sm">{t.telemetryStep1Title}</h4>
              <p className="text-[11px] text-emerald-100/70">{t.telemetryStep1Desc}</p>
            </div>

            <div className="bg-white/10 p-5 rounded-2xl border border-white/10 space-y-2">
              <span className="text-xs font-bold text-emerald-400">STEP 02</span>
              <h4 className="font-bold text-white text-sm">{t.telemetryStep2Title}</h4>
              <p className="text-[11px] text-emerald-100/70">{t.telemetryStep2Desc}</p>
            </div>

            <div className="bg-white/10 p-5 rounded-2xl border border-white/10 space-y-2">
              <span className="text-xs font-bold text-emerald-400">STEP 03</span>
              <h4 className="font-bold text-white text-sm">{t.telemetryStep3Title}</h4>
              <p className="text-[11px] text-emerald-100/70">{t.telemetryStep3Desc}</p>
            </div>

            <div className="bg-[#10B981] text-[#0F2E23] p-5 rounded-2xl font-bold space-y-2 shadow-lg">
              <span className="text-xs uppercase text-[#0F2E23]/80">STEP 04</span>
              <h4 className="font-extrabold text-sm">{t.telemetryStep4Title}</h4>
              <p className="text-[11px] text-[#0F2E23]/90">{t.telemetryStep4Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 03 — PLATFORM MODULE TEASERS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-extrabold text-[#10B981] uppercase tracking-wider">{t.ecosystemBadge}</span>
          <h2 className="text-3xl font-extrabold text-[#0F2E23]">{t.ecosystemTitle}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => onNavigate('analytics')}
            className="p-6 rounded-2xl bg-white border border-gray-200 shadow-md hover:shadow-xl transition-all cursor-pointer space-y-3 group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center font-bold group-hover:scale-110 transition-all">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">{t.ecosystemCard1Title}</h3>
            <p className="text-xs text-gray-600">{t.ecosystemCard1Desc}</p>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#10B981] pt-2">
              {t.ecosystemCard1Cta} <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div
            onClick={() => onNavigate('challenges')}
            className="p-6 rounded-2xl bg-white border border-gray-200 shadow-md hover:shadow-xl transition-all cursor-pointer space-y-3 group"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold group-hover:scale-110 transition-all">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">{t.ecosystemCard2Title}</h3>
            <p className="text-xs text-gray-600">{t.ecosystemCard2Desc}</p>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 pt-2">
              {t.ecosystemCard2Cta} <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div
            onClick={() => onNavigate('report')}
            className="p-6 rounded-2xl bg-white border border-gray-200 shadow-md hover:shadow-xl transition-all cursor-pointer space-y-3 group"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold group-hover:scale-110 transition-all">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">{t.ecosystemCard3Title}</h3>
            <p className="text-xs text-gray-600">{t.ecosystemCard3Desc}</p>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 pt-2">
              {t.ecosystemCard3Cta} <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </section>

      {/* FINAL CTA BANNER */}
      <section className="bg-gradient-to-r from-[#0F2E23] via-[#154233] to-[#0F2E23] text-white py-16 text-center px-4 rounded-3xl max-w-6xl mx-auto shadow-2xl space-y-6">
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
          {t.ctaBannerTitle1} <br />
          <span className="text-[#10B981]">{t.ctaBannerTitle2}</span>
        </h2>
        <p className="text-emerald-100/70 text-sm max-w-xl mx-auto">
          {t.ctaBannerDesc}
        </p>

        <button
          onClick={() => onNavigate('scanner')}
          className="px-8 py-4 bg-[#10B981] hover:bg-[#059669] text-[#0F2E23] font-black text-base rounded-full shadow-2xl inline-flex items-center gap-3 transform hover:scale-105 transition-all cursor-pointer"
        >
          <Camera className="w-6 h-6" />
          <span>{t.ctaBannerBtn}</span>
        </button>
      </section>
    </div>
  );
};

export default LandingPage;
