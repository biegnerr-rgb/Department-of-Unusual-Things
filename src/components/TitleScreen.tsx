import React, { useEffect, useState } from 'react';
import { ArrowRight, RotateCcw } from 'lucide-react';

interface TitleScreenProps {
  hasSave: boolean;
  onStartContinue: () => void;
  onStartNew: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  hasSave,
  onStartContinue,
  onStartNew,
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onStartContinue();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onStartContinue]);

  return (
    <div className="relative w-screen min-h-[100dvh] lg:h-screen overflow-y-auto lg:overflow-hidden bg-[#F5EFE3] flex flex-col lg:flex-row">
      {/* Left calm negative space & Title Lockup */}
      <div className="relative z-10 w-full lg:w-[44%] lg:h-full flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-[#F5EFE3] lg:border-r-4 border-[#2D241E]">
        {/* Bespoke Agency Seal SVG */}
        <div className="flex items-center gap-3.5">
          <svg viewBox="0 0 56 56" className="w-11 h-11 sm:w-12 sm:h-12 shrink-0" fill="none">
            <circle cx="28" cy="28" r="25" fill="#F59E0B" stroke="#2D241E" strokeWidth="3" />
            <circle cx="28" cy="28" r="19" fill="#FFFBEB" stroke="#2D241E" strokeWidth="2" strokeDasharray="4 3" />
            <path d="M28 15 L32 24 L41 25 L34 31 L36 40 L28 35 L20 40 L22 31 L15 25 L24 24 Z" fill="#0D9488" stroke="#2D241E" strokeWidth="2" strokeLinejoin="round" />
          </svg>
          <div>
            <p className="text-xs font-semibold tracking-wider uppercase text-[#7C6B58]">
              Bureau of Unexplained Paperwork
            </p>
            <p className="text-sm font-medium text-[#2D241E]">Facility Sector 04 · Dept. 404</p>
          </div>
        </div>

        {/* Main Title Lockup */}
        <div className="my-6 lg:my-auto py-2 sm:py-6 max-w-lg">
          <h1
            className="font-display text-3xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight text-[#26211C] leading-[1.04]"
            style={{ textWrap: 'balance' }}
          >
            Department of Unusual Things
          </h1>
          <p className="mt-4 text-sm sm:text-lg text-[#5A4D41] leading-relaxed">
            Investigate peculiar deliveries, staff eccentric wings, and keep mildly impossible
            objects politely contained before lunch.
          </p>

          <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onStartContinue}
              className="min-h-[48px] inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold text-base border-2 border-[#2D241E] shadow-[0_4px_0_#2D241E] active:translate-y-0.5 active:shadow-[0_2px_0_#2D241E] transition-all cursor-pointer"
            >
              <span>{hasSave ? 'Resume Department' : 'Open Department'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            {hasSave && (
              <button
                type="button"
                onClick={onStartNew}
                className="min-h-[48px] inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-[#FFFDF8] hover:bg-[#EFE6D5] text-[#2D241E] font-semibold text-sm border-2 border-[#2D241E] shadow-[0_3px_0_#2D241E] active:translate-y-0.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>New Facility</span>
              </button>
            )}
          </div>
        </div>

        {/* Single flat control hint line */}
        <p className="text-xs sm:text-sm text-[#6E5F50] font-medium">
          Tap any room to manage · Assign specialists · Saves automatically
        </p>
      </div>

      {/* Right side illustrated facility cutaway */}
      <div className="relative flex-1 min-h-[220px] sm:min-h-[280px] lg:h-full bg-[#D9E8E4] overflow-hidden border-t-4 lg:border-t-0 border-[#2D241E]">
        {!imgFailed ? (
          <img
            src="/src/assets/images/department_title_backdrop_1794635779198.jpg"
            alt="Stylized cross-section of the Department of Unusual Things underground research facility"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover object-right"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#CCE7E0] via-[#E6EFE9] to-[#F4DFC0] p-8">
            <svg viewBox="0 0 240 160" className="w-64 h-44" fill="none">
              <rect x="20" y="30" width="200" height="110" rx="8" fill="#5C4938" stroke="#2D241E" strokeWidth="3" />
              <rect x="30" y="42" width="84" height="40" rx="4" fill="#FEF6E4" stroke="#2D241E" strokeWidth="2" />
              <rect x="124" y="42" width="84" height="40" rx="4" fill="#E6F4F2" stroke="#2D241E" strokeWidth="2" />
              <rect x="30" y="90" width="178" height="40" rx="4" fill="#EEF2FF" stroke="#2D241E" strokeWidth="2" />
            </svg>
          </div>
        )}
        {/* Clean gradient blend on the left edge so the image crops gracefully */}
        <div
          aria-hidden="true"
          className="hidden lg:block absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#F5EFE3] via-[#F5EFE3]/70 to-transparent pointer-events-none"
        />
      </div>
    </div>
  );
};
