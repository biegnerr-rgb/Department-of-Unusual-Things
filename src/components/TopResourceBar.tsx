import React from 'react';
import {
  AlertTriangle,
  Atom,
  Award,
  Bell,
  CheckCircle2,
  Coins,
  FlaskConical,
  Search,
  Settings,
  Zap,
} from 'lucide-react';
import {
  ActiveEconomicBoost,
  ProgressionStage,
  Resources,
  TutorialStepId,
} from '../types/game';
import { FacilityRates, formatCompact, getDepartmentRank } from '../utils/simulation';

interface TopResourceBarProps {
  resources: Resources;
  rates: FacilityRates;
  activeBoosts: ActiveEconomicBoost[];
  paused: boolean;
  unreadNotifications: number;
  investigationOpen: boolean;
  activeInvestigationPct: number | null;
  saveFeedbackMsg?: string | null;
  progressionStage?: ProgressionStage;
  tutorialStep?: TutorialStepId;
  highlightTarget?: string | null;
  onToggleInvestigation: () => void;
  onToggleNotifications: () => void;
  onOpenSettings: () => void;
}

export const TopResourceBar: React.FC<TopResourceBarProps> = ({
  resources,
  rates,
  activeBoosts,
  paused,
  unreadNotifications,
  investigationOpen,
  activeInvestigationPct,
  saveFeedbackMsg,
  progressionStage = 6,
  tutorialStep = 'completed',
  highlightTarget,
  onToggleInvestigation,
  onToggleNotifications,
  onOpenSettings,
}) => {
  const rank = getDepartmentRank(resources.reputation);
  const now = Date.now();
  const liveBoost = activeBoosts.find((b) => b.expiresAt > now);
  const boostRemainingSec = liveBoost
    ? Math.max(1, Math.ceil((liveBoost.expiresAt - now) / 1000))
    : 0;

  const showInvestigateBtn = tutorialStep !== 'welcome';
  const showEventsBtn =
    tutorialStep === 'completed' && (progressionStage >= 4 || unreadNotifications > 0);
  const showResearchMeter = tutorialStep !== 'welcome' || progressionStage >= 2;
  const showRepMeter = progressionStage >= 3 || resources.reputation > 0;
  const showSamplesMeter = progressionStage >= 5 || (resources.samples ?? 0) > 0;

  const visibleMeterCount =
    1 + (showResearchMeter ? 1 : 0) + (showRepMeter ? 1 : 0) + (showSamplesMeter ? 1 : 0);
  const gridColsClass =
    visibleMeterCount === 1
      ? 'grid-cols-1'
      : visibleMeterCount === 2
      ? 'grid-cols-2'
      : visibleMeterCount === 3
      ? 'grid-cols-3'
      : 'grid-cols-4';

  return (
    <header className="w-full bg-[#FFFDF8] border-b-2 border-[#2D241E] px-2.5 sm:px-5 py-1.5 sm:py-2.5 z-30 shrink-0">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3">
        {/* Mobile Row 1 / Desktop Left+Right */}
        <div className="flex items-center justify-between gap-2 sm:contents">
          <div className="flex items-center gap-2 min-w-0 sm:order-1">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#F59E0B] border-2 border-[#2D241E] flex items-center justify-center shrink-0 shadow-[0_2px_0_#2D241E]">
              <span className="font-display font-extrabold text-xs sm:text-sm text-[#2D241E]">
                DU
              </span>
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-xs sm:text-sm md:text-base font-bold text-[#26211C] leading-tight truncate hidden lg:block">
                Department of Unusual Things
              </h1>
              <p className="text-[11px] font-medium text-[#6B5E51] leading-tight truncate">
                <span className="lg:hidden font-display font-bold text-[#26211C]">Dept. 404</span>
                <span className="hidden lg:inline">{rank}</span>
                {paused ? ' · Paused' : ''}
              </p>
            </div>
            {saveFeedbackMsg && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#E5EFEA] border border-[#0F766E] text-[#0F766E] text-[10px] font-bold animate-modal-pop whitespace-nowrap">
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                <span>{saveFeedbackMsg}</span>
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 sm:order-3">
            {showInvestigateBtn && (
              <button
                type="button"
                onClick={onToggleInvestigation}
                className={`min-h-[40px] sm:min-h-[42px] px-2.5 sm:px-3 rounded-lg border-2 border-[#2D241E] flex items-center gap-1.5 font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap active:scale-[0.98] ${
                  investigationOpen
                    ? 'bg-[#0D9488] text-white'
                    : 'bg-[#FEF6E4] hover:bg-[#FDE68A] text-[#26211C]'
                } ${highlightTarget === 'inspect_action' ? 'ring-2 ring-[#F59E0B] ring-offset-1' : ''}`}
              >
                <Search className="w-4 h-4 shrink-0" />
                <span>Investigate</span>
                {activeInvestigationPct !== null && (
                  <span className="font-mono-num text-[10px] font-bold">
                    {Math.floor(activeInvestigationPct)}%
                  </span>
                )}
              </button>
            )}

            {showEventsBtn && (
              <button
                type="button"
                onClick={onToggleNotifications}
                aria-label="Open deliveries and events"
                className="relative min-w-[40px] min-h-[40px] sm:min-h-[42px] px-2 sm:px-2.5 rounded-lg bg-[#FFFDF8] hover:bg-[#F3E9D8] border-2 border-[#2D241E] flex items-center justify-center gap-1.5 text-[#2D241E] font-semibold text-xs transition-colors cursor-pointer active:scale-[0.98] whitespace-nowrap"
              >
                <Bell className="w-4 h-4 shrink-0" />
                <span className="hidden md:inline">Events</span>
                {unreadNotifications > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-[#DC2626] text-white font-mono-num text-[10px] font-bold leading-none">
                    {unreadNotifications}
                  </span>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onOpenSettings}
              aria-label="Open settings menu"
              className="min-w-[40px] min-h-[40px] sm:min-h-[42px] px-2 sm:px-2.5 rounded-lg bg-[#FFFDF8] hover:bg-[#F3E9D8] border-2 border-[#2D241E] flex items-center justify-center gap-1.5 text-[#2D241E] font-semibold text-xs transition-colors cursor-pointer active:scale-[0.98] whitespace-nowrap"
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">Settings</span>
            </button>
          </div>
        </div>

        {/* Progressive Economy Resource Meters */}
        <div className={`grid ${gridColsClass} sm:flex items-center gap-1 sm:gap-2 sm:order-2`}>
          <div
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-[#FEF6E4] border-2 border-[#2D241E] min-w-0 ${
              highlightTarget === 'reception_bell' ? 'ring-2 ring-[#F59E0B] ring-offset-1' : ''
            }`}
          >
            <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#B45309] shrink-0" />
            <div className="leading-none min-w-0">
              <div className="font-mono-num text-[11px] sm:text-sm font-bold text-[#26211C] truncate">
                ${formatCompact(resources.funds)}
              </div>
              <div className="font-mono-num text-[9px] sm:text-[10px] font-medium text-[#8C6D46] mt-0.5 truncate">
                {rates.fundsPerSec >= 0 ? '+' : ''}
                {rates.fundsPerSec.toFixed(1)}/s
              </div>
            </div>
          </div>

          {showResearchMeter && (
            <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-[#E6F4F2] border-2 border-[#2D241E] min-w-0">
              <FlaskConical className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0F766E] shrink-0" />
              <div className="leading-none min-w-0">
                <div className="font-mono-num text-[11px] sm:text-sm font-bold text-[#26211C] truncate">
                  {formatCompact(resources.research)}
                  <span className="hidden sm:inline"> RP</span>
                </div>
                <div className="font-mono-num text-[9px] sm:text-[10px] font-medium text-[#0F766E] mt-0.5 truncate">
                  +{rates.researchPerSec.toFixed(1)}/s
                </div>
              </div>
            </div>
          )}

          {showRepMeter && (
            <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-[#EEF2FF] border-2 border-[#2D241E] min-w-0">
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4338CA] shrink-0" />
              <div className="leading-none min-w-0">
                <div className="font-mono-num text-[11px] sm:text-sm font-bold text-[#26211C] truncate">
                  {formatCompact(resources.reputation)}
                  <span className="hidden sm:inline"> Rep</span>
                </div>
                <div className="font-mono-num text-[9px] sm:text-[10px] font-medium text-[#4338CA] mt-0.5 truncate">
                  +{rates.reputationPerSec.toFixed(2)}/s
                </div>
              </div>
            </div>
          )}

          {showSamplesMeter && (
            <div
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-[#F5EEFF] border-2 border-[#2D241E] min-w-0"
              title="Anomaly Samples — Rare material used for Experimental Projects in Research"
            >
              <Atom className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6D28D9] shrink-0" />
              <div className="leading-none min-w-0">
                <div className="font-mono-num text-[11px] sm:text-sm font-bold text-[#26211C] truncate">
                  {Math.floor(resources.samples ?? 0)}
                  <span className="hidden sm:inline"> Samples</span>
                </div>
                <div className="font-mono-num text-[9px] sm:text-[10px] font-medium text-[#5B21B6] mt-0.5 truncate">
                  +{(rates.samplesPerSec * 60).toFixed(1)}/m
                </div>
              </div>
            </div>
          )}

          {liveBoost && (
            <div
              title={liveBoost.description}
              className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border-2 border-[#2D241E] font-mono-num text-[11px] font-bold ${
                liveBoost.fundsMult < 1 ||
                liveBoost.researchMult < 1 ||
                (liveBoost.investigationSpeedMult ?? 1) < 1
                  ? 'bg-[#FEE2E2] text-[#991B1B]'
                  : 'bg-[#FEF3C7] text-[#B45309]'
              }`}
            >
              {liveBoost.fundsMult < 1 ||
              liveBoost.researchMult < 1 ||
              (liveBoost.investigationSpeedMult ?? 1) < 1 ? (
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <Zap className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>
                {liveBoost.label} ({boostRemainingSec}s)
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

