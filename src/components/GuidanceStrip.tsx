import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Gift,
  Lock,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import {
  ONBOARDING_OBJECTIVES,
  STAGE_INFO,
  SUPERVISOR_STEPS,
} from '../data/onboardingData';
import { GameState, NavTab, ProgressionStage } from '../types/game';

interface GuidanceStripProps {
  gameState: GameState;
  onTutorialPrimaryAction: () => void;
  onSkipTutorial: () => void;
  onDismissFeatureBanner: (stage: ProgressionStage) => void;
  onClaimObjective: (objectiveId: string) => void;
  onNavigateTab: (tab: NavTab) => void;
}

const SupervisorAgnesAvatar: React.FC<{ className?: string }> = ({ className = 'w-11 h-11' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
    <circle cx="32" cy="32" r="30" fill="#FEF3C7" stroke="#2D241E" strokeWidth="2.5" />
    {/* Hair bun & pencil */}
    <circle cx="32" cy="14" r="8" fill="#D1D5DB" stroke="#2D241E" strokeWidth="2" />
    <line x1="21" y1="9" x2="43" y2="17" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
    {/* Blazer & collar */}
    <path
      d="M15 58 C16 44 23 41 32 41 C41 41 48 44 49 58 Z"
      fill="#0F766E"
      stroke="#2D241E"
      strokeWidth="2.2"
    />
    <path d="M26 42 L32 51 L38 42 Z" fill="#FFFDF8" stroke="#2D241E" strokeWidth="1.8" />
    {/* Face */}
    <circle cx="32" cy="29" r="12" fill="#F6D5B8" stroke="#2D241E" strokeWidth="2.2" />
    {/* Silver swoop hair */}
    <path
      d="M20 27 C21 18 43 18 44 27 C39 22 25 22 20 27 Z"
      fill="#E5E7EB"
      stroke="#2D241E"
      strokeWidth="2"
    />
    {/* Glasses */}
    <circle cx="27" cy="29.5" r="3.6" fill="#FFFDF8" fillOpacity="0.55" stroke="#2D241E" strokeWidth="1.8" />
    <circle cx="37" cy="29.5" r="3.6" fill="#FFFDF8" fillOpacity="0.55" stroke="#2D241E" strokeWidth="1.8" />
    <line x1="30.6" y1="29.5" x2="33.4" y2="29.5" stroke="#2D241E" strokeWidth="1.8" />
    <circle cx="27" cy="29.5" r="1.2" fill="#2D241E" />
    <circle cx="37" cy="29.5" r="1.2" fill="#2D241E" />
    {/* Warm smile */}
    <path
      d="M28.5 34.5 Q32 37.5 35.5 34.5"
      stroke="#2D241E"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

export const GuidanceStrip: React.FC<GuidanceStripProps> = ({
  gameState,
  onTutorialPrimaryAction,
  onSkipTutorial,
  onDismissFeatureBanner,
  onClaimObjective,
  onNavigateTab,
}) => {
  const [expanded, setExpanded] = useState(false);

  const onboarding = gameState.onboarding;
  if (!onboarding) return null;

  // 1. Active Interactive Tutorial Steps (1-5)
  if (onboarding.tutorialStep !== 'completed') {
    const guide = SUPERVISOR_STEPS[onboarding.tutorialStep];
    return (
      <section
        aria-label="Shift orientation guide"
        className="w-full bg-[#FEF6E4] border-b-2 border-[#2D241E] px-3 sm:px-5 py-2.5 z-20 shrink-0"
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
            <SupervisorAgnesAvatar className="w-10 h-10 sm:w-11 sm:h-11 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-bold text-[#92400E]">
                <span className="font-mono-num uppercase tracking-wide">
                  Step {guide.stepNumber} of 5
                </span>
                <span>·</span>
                <span>Agnes Caldwell, Shift Supervisor</span>
                {onboarding.replayMode && (
                  <>
                    <span>·</span>
                    <span className="text-[#0F766E]">Replay Mode</span>
                  </>
                )}
              </div>
              <p className="font-display text-sm sm:text-base font-extrabold text-[#26211C] leading-snug">
                {guide.title}
              </p>
              <p className="text-xs text-[#3F362D] leading-snug mt-0.5">
                {guide.agnesLine}
              </p>
              <p className="text-[11px] font-semibold text-[#0F766E] mt-1">
                Next: {guide.actionHint}{' '}
                <span className="font-normal text-[#5A4D41]">— {guide.whyItMatters}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            {guide.primaryActionLabel && (
              <button
                type="button"
                onClick={onTutorialPrimaryAction}
                className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 border-[#2D241E] bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold shadow-[0_2px_0_#2D241E] active:translate-y-0.5 cursor-pointer whitespace-nowrap"
              >
                <span>{guide.primaryActionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            )}
            <button
              type="button"
              onClick={onSkipTutorial}
              className="min-h-[40px] px-3 py-2 rounded-xl border border-[#2D241E]/40 bg-[#FFFDF8] hover:bg-[#F3E9D8] text-[11px] font-semibold text-[#5A4D41] cursor-pointer whitespace-nowrap"
            >
              Skip Guide
            </button>
          </div>
        </div>
      </section>
    );
  }

  // 2. New Feature Unlock Spotlight Banner (triggered when entering a new stage >= 2)
  const stage = onboarding.progressionStage;
  const stageMeta = STAGE_INFO[stage];
  const showFeatureIntro = stage >= 2 && stage > onboarding.dismissedFeatureStage;

  // Compute Objectives
  const claimedSet = new Set(onboarding.claimedObjectiveIds);
  const stageObjectives = ONBOARDING_OBJECTIVES.filter(
    (obj) => obj.minStage <= stage || claimedSet.has(obj.id)
  );
  const claimableObjectives = stageObjectives.filter(
    (obj) => !claimedSet.has(obj.id) && obj.isComplete(gameState)
  );
  const nextActiveObjective =
    claimableObjectives[0] ??
    stageObjectives.find((obj) => !claimedSet.has(obj.id)) ??
    null;

  // Fade back cleanly in late Stage 6 once all onboarding goals are claimed
  if (stage >= 6 && !showFeatureIntro && !nextActiveObjective && !expanded) {
    return null;
  }

  return (
    <section
      aria-label="Department guidance and objectives"
      className="w-full bg-[#FFFDF8] border-b-2 border-[#2D241E] px-3 sm:px-5 py-1.5 z-20 shrink-0"
    >
      <div className="max-w-7xl mx-auto space-y-2">
        {/* Feature Unlock Spotlight from Supervisor Agnes */}
        {showFeatureIntro && (
          <div className="rounded-xl border-2 border-[#2D241E] bg-[#EEF2FF] px-3 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-panel-enter">
            <div className="flex items-center gap-2.5 min-w-0">
              <SupervisorAgnesAvatar className="w-9 h-9 shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#4338CA]">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>{stageMeta.subtitle} · New Feature Unlocked</span>
                </div>
                <p className="font-display text-xs sm:text-sm font-extrabold text-[#1E1B4B] leading-tight">
                  {stageMeta.featureIntroTitle}
                </p>
                <p className="text-[11px] text-[#312E81] leading-snug mt-0.5">
                  {stageMeta.featureIntroBody}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
              {stageMeta.ctaTab && stageMeta.ctaLabel && (
                <button
                  type="button"
                  onClick={() => {
                    onNavigateTab(stageMeta.ctaTab!);
                    onDismissFeatureBanner(stage);
                  }}
                  className="min-h-[36px] inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border-2 border-[#2D241E] bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold cursor-pointer whitespace-nowrap"
                >
                  <span>{stageMeta.ctaLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </button>
              )}
              <button
                type="button"
                onClick={() => onDismissFeatureBanner(stage)}
                aria-label="Dismiss feature note"
                className="min-h-[36px] inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#2D241E]/40 bg-[#FFFDF8] hover:bg-[#E0E7FF] text-xs font-semibold text-[#1E1B4B] cursor-pointer whitespace-nowrap"
              >
                <X className="w-3.5 h-3.5 shrink-0" />
                <span>Got It</span>
              </button>
            </div>
          </div>
        )}

        {/* Compact Progress & Current Objective Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-[#2D241E]/35 bg-[#FEF6E4] font-mono-num text-[10px] sm:text-[11px] font-bold text-[#92400E] shrink-0 whitespace-nowrap">
              Stage {stage}/6 · {stageMeta.name}
            </span>

            {nextActiveObjective ? (
              <div className="flex items-center gap-2 min-w-0 text-xs">
                <Target className="w-3.5 h-3.5 text-[#0F766E] shrink-0 hidden sm:block" />
                <span className="font-bold text-[#26211C] truncate">
                  {nextActiveObjective.title}
                </span>
                <span className="font-mono-num text-[11px] font-bold text-[#0F766E] shrink-0">
                  ({nextActiveObjective.progressText(gameState)})
                </span>
              </div>
            ) : (
              <span className="text-xs font-semibold text-[#0F766E] truncate">
                All Department Orientation Objectives Complete!
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {claimableObjectives.length > 0 && (
              <button
                type="button"
                onClick={() => onClaimObjective(claimableObjectives[0].id)}
                className="min-h-[34px] inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border-2 border-[#2D241E] bg-[#F59E0B] hover:bg-[#D97706] text-[#26211C] text-[11px] font-bold cursor-pointer whitespace-nowrap shadow-[0_2px_0_#2D241E]"
              >
                <Gift className="w-3.5 h-3.5 shrink-0" />
                <span>Claim +${claimableObjectives[0].rewardFunds}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="min-h-[34px] inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#2D241E]/40 bg-[#FAF5EB] hover:bg-[#EFE6D5] text-[11px] font-semibold text-[#26211C] cursor-pointer whitespace-nowrap"
            >
              <span>Objectives</span>
              <span className="font-mono-num text-[#0F766E]">
                {onboarding.claimedObjectiveIds.length}/{ONBOARDING_OBJECTIVES.length}
              </span>
              {expanded ? (
                <ChevronUp className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 shrink-0" />
              )}
            </button>
          </div>
        </div>

        {/* Expandable Objectives & Stage Progression Roadmap */}
        {expanded && (
          <div className="pt-2 pb-1 border-t border-[#2D241E]/15 space-y-3 max-h-[46dvh] overflow-y-auto warm-scroll animate-panel-enter">
            {/* 6-Stage Progression Roadmap */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
              {([1, 2, 3, 4, 5, 6] as ProgressionStage[]).map((stNum) => {
                const info = STAGE_INFO[stNum];
                const unlocked = stage >= stNum;
                const current = stage === stNum;
                return (
                  <div
                    key={stNum}
                    className={`rounded-lg border px-2 py-1.5 text-[10px] ${
                      current
                        ? 'bg-[#E6F4F2] border-[#0D9488] text-[#134E4A]'
                        : unlocked
                        ? 'bg-[#FAF5EB] border-[#2D241E]/30 text-[#4B4035]'
                        : 'bg-[#EFE8DB] border-dashed border-[#8C7D6B] text-[#7A6D60]'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>
                        {stNum}. {info.name}
                      </span>
                      {unlocked ? (
                        <CheckCircle2 className="w-3 h-3 text-[#0F766E] shrink-0" />
                      ) : (
                        <Lock className="w-3 h-3 shrink-0" />
                      )}
                    </div>
                    <p className="mt-0.5 leading-tight opacity-90">{info.unlockSummary}</p>
                  </div>
                );
              })}
            </div>

            {/* Active & Upcoming Objectives */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {stageObjectives.map((obj) => {
                const claimed = claimedSet.has(obj.id);
                const complete = obj.isComplete(gameState);
                if (claimed) return null;

                return (
                  <div
                    key={obj.id}
                    className={`rounded-xl border-2 p-2.5 flex items-center justify-between gap-2.5 ${
                      complete
                        ? 'bg-[#FEF6E4] border-[#2D241E]'
                        : 'bg-[#FAF5EB] border-[#2D241E]/35'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#26211C]">
                        <span className="truncate">{obj.title}</span>
                        <span className="font-mono-num text-[11px] text-[#0F766E] shrink-0">
                          {obj.progressText(gameState)}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#4B4035] mt-0.5 leading-snug">
                        {obj.description}
                      </p>
                      <p className="text-[10px] text-[#6B5E51] mt-0.5">
                        Why: {obj.whyItMatters} · Reward: +${obj.rewardFunds}, +{obj.rewardResearch} RP, +{obj.rewardReputation} Rep
                      </p>
                    </div>

                    {complete ? (
                      <button
                        type="button"
                        onClick={() => onClaimObjective(obj.id)}
                        className="min-h-[36px] px-3 py-1.5 rounded-lg border-2 border-[#2D241E] bg-[#F59E0B] hover:bg-[#D97706] text-[#26211C] text-xs font-bold cursor-pointer shrink-0 whitespace-nowrap"
                      >
                        Claim
                      </button>
                    ) : obj.focusTab ? (
                      <button
                        type="button"
                        onClick={() => {
                          onNavigateTab(obj.focusTab!);
                          setExpanded(false);
                        }}
                        className="min-h-[36px] px-2.5 py-1.5 rounded-lg border border-[#2D241E]/40 bg-[#FFFDF8] hover:bg-[#EFE6D5] text-[11px] font-semibold text-[#26211C] cursor-pointer shrink-0 whitespace-nowrap"
                      >
                        Go →
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
