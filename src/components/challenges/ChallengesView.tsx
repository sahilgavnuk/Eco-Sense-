import React, { useState } from 'react';
import { Flame, CheckCircle2, ShieldCheck, Trophy, ArrowRight } from 'lucide-react';
import { MOCK_ECOSCORE } from '../../data/mockData';
import { useEco } from '../../context/EcoContext';

export const ChallengesView: React.FC = () => {
  const { t } = useEco();
  const [joinedChallenges, setJoinedChallenges] = useState<string[]>(['c-2']);

  const toggleChallenge = (id: string) => {
    if (joinedChallenges.includes(id)) {
      setJoinedChallenges(joinedChallenges.filter(c => c !== id));
    } else {
      setJoinedChallenges([...joinedChallenges, id]);
    }
  };

  const circularSteps = [
    t.circularStep1,
    t.circularStep2,
    t.circularStep3,
    t.circularStep4,
    t.circularStep5
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-[#0F2E23] text-white p-6 sm:p-8 rounded-2xl border border-[#154233] shadow-xl space-y-4 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-[#10B981]/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/20 text-[#34D399] text-xs font-bold uppercase tracking-wider mb-2">
              <Trophy className="w-3.5 h-3.5" /> {t.ecoScoreBadge}
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              {t.ecoScoreTitle}
            </h2>
            <p className="text-emerald-100/70 text-sm mt-1 max-w-2xl">
              {t.ecoScoreDesc}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 px-5 py-3 rounded-2xl border border-white/15 shrink-0">
            <Flame className="w-8 h-8 text-amber-400 animate-pulse" />
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-200">{t.ecoScoreStreak}</span>
              <div className="text-2xl font-black text-white">{MOCK_ECOSCORE.activeStreakDays} {t.ecoScoreDays}</div>
            </div>
          </div>
        </div>
      </div>

      {/* EcoScore Gauge & Metric Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Big EcoScore Card */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-200 shadow-xl flex flex-col items-center justify-center text-center space-y-4 relative">
          <span className="text-xs font-extrabold uppercase text-[#0F2E23] tracking-wider">
            {t.ecoScoreGaugeTitle}
          </span>

          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="10" fill="transparent" />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#10B981"
                strokeWidth="10"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * MOCK_ECOSCORE.totalScore) / 100}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-[#0F2E23]">{MOCK_ECOSCORE.totalScore}</span>
              <span className="text-xs font-bold text-[#10B981]">{t.ecoScoreOutOf100}</span>
            </div>
          </div>

          <div className="text-xs text-gray-600 max-w-xs leading-relaxed font-semibold">
            {t.ecoMilestone}
          </div>

          <div className="text-[11px] text-gray-400 bg-gray-50 p-2.5 rounded-lg border border-gray-100 w-full text-center">
            {t.ecoScoreNote}
          </div>
        </div>

        {/* Sub-Metric Cards */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-200 shadow-xl space-y-5 flex flex-col justify-between">
          <h3 className="font-bold text-gray-900 text-base">{t.ecoScoreDimensions}</h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                <span>{t.dimSegregationAccuracy}</span>
                <span className="text-[#10B981]">{MOCK_ECOSCORE.segregationScore} / 100</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#10B981] h-full rounded-full" style={{ width: `${MOCK_ECOSCORE.segregationScore}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                <span>{t.dimCommunityAwareness}</span>
                <span className="text-blue-600">{MOCK_ECOSCORE.awarenessScore} / 100</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${MOCK_ECOSCORE.awarenessScore}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                <span>{t.dimResidentParticipation}</span>
                <span className="text-amber-600">{MOCK_ECOSCORE.participationScore} / 100</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${MOCK_ECOSCORE.participationScore}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                <span>{t.dimWasteReduction}</span>
                <span className="text-purple-600">{MOCK_ECOSCORE.wasteReductionScore} / 100</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: `${MOCK_ECOSCORE.wasteReductionScore}%` }}></div>
              </div>
            </div>
          </div>

          <div className="pt-2 text-xs text-gray-500 flex items-center gap-2 border-t border-gray-100">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            <span>{t.ecoScoreFooterNotice}</span>
          </div>
        </div>
      </div>

      {/* Circular Economy Visual Loop */}
      <div className="bg-[#0F2E23] text-white p-8 rounded-2xl border border-[#154233] shadow-xl text-center space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">{t.circularBadge}</span>
          <h3 className="text-2xl font-extrabold text-white">{t.circularTitle}</h3>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-2">
          {circularSteps.map((step, idx) => (
            <React.Fragment key={step}>
              <div className="bg-white/10 hover:bg-white/20 border border-white/15 px-4 py-3 rounded-xl text-xs font-extrabold text-emerald-200 shadow-md">
                {step}
              </div>
              {idx < 4 && <ArrowRight className="w-4 h-4 text-emerald-400 hidden sm:block" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Community Challenges List */}
      <div className="space-y-4">
        <h3 className="font-bold text-gray-900 text-xl">{t.ecoChallengeTitle}</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Challenge 1 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200">
                  {t.challenge1Badge}
                </span>
                <span className="text-xs text-gray-500 font-medium">{t.challenge1Participants}</span>
              </div>
              <h4 className="font-bold text-gray-900 text-base">{t.challenge1Title}</h4>
              <p className="text-xs text-gray-600">
                {t.challenge1Desc}
              </p>
            </div>

            <button
              onClick={() => toggleChallenge('c-2')}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                joinedChallenges.includes('c-2')
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                  : 'bg-[#0F2E23] text-white hover:bg-[#154233]'
              }`}
            >
              {joinedChallenges.includes('c-2') ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" /> {t.joinedChallenge}
                </>
              ) : (
                t.joinChallenge
              )}
            </button>
          </div>

          {/* Challenge 2 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold text-[10px] border border-purple-200">
                  {t.challenge2Badge}
                </span>
                <span className="text-xs text-gray-500 font-medium">{t.challenge2Participants}</span>
              </div>
              <h4 className="font-bold text-gray-900 text-base">{t.challenge2Title}</h4>
              <p className="text-xs text-gray-600">
                {t.challenge2Desc}
              </p>
            </div>

            <button
              onClick={() => toggleChallenge('c-3')}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                joinedChallenges.includes('c-3')
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                  : 'bg-[#0F2E23] text-white hover:bg-[#154233]'
              }`}
            >
              {joinedChallenges.includes('c-3') ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" /> {t.joinedChallenge}
                </>
              ) : (
                t.joinChallenge
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengesView;
