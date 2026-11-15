import React from 'react';
import {
  Atom,
  Award,
  Bell,
  Clock,
  Coins,
  FlaskConical,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { OfflineReport } from '../types/game';
import { formatCompact } from '../utils/simulation';

interface OfflineReportModalProps {
  report: OfflineReport | null;
  onClose: () => void;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.floor(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ${Math.floor(seconds % 60)}s`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hrs}h ${remMins}m`;
}

export const OfflineReportModal: React.FC<OfflineReportModalProps> = ({
  report,
  onClose,
}) => {
  if (!report) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#26211C]/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[88dvh] bg-[#FAF5EB] border-2 border-[#2D241E] rounded-2xl shadow-[0_8px_0_#2D241E] flex flex-col overflow-hidden animate-modal-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 bg-[#FFFDF8] border-b-2 border-[#2D241E] flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] border-2 border-[#2D241E] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-[#B45309]" />
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-extrabold text-[#26211C]">
                While You Were Away
              </h2>
              <p className="font-mono-num text-xs text-[#6B5E51]">
                Time Away: {formatDuration(report.rawSecondsAway)}
                {report.wasCapped
                  ? ` (Capped at ${formatDuration(report.capSeconds)})`
                  : ''}{' '}
                · {report.efficiencyPct}% Shift Efficiency
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close offline report"
            className="w-10 h-10 rounded-lg border-2 border-[#2D241E] bg-[#FFFDF8] hover:bg-[#EFE6D5] flex items-center justify-center cursor-pointer shrink-0 active:scale-95 transition-transform"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto warm-scroll p-5 space-y-4">
          {/* Resource Totals */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl border-2 border-[#2D241E] bg-[#FEF6E4] p-3 flex items-center gap-2.5">
              <Coins className="w-5 h-5 text-[#B45309] shrink-0" />
              <div>
                <p className="text-[11px] font-semibold text-[#8C6D46]">Funds Generated</p>
                <p className="font-mono-num text-base font-extrabold text-[#26211C]">
                  +${formatCompact(report.fundsGenerated)}
                </p>
              </div>
            </div>

            <div className="rounded-xl border-2 border-[#2D241E] bg-[#E6F4F2] p-3 flex items-center gap-2.5">
              <FlaskConical className="w-5 h-5 text-[#0F766E] shrink-0" />
              <div>
                <p className="text-[11px] font-semibold text-[#0F766E]">Research Generated</p>
                <p className="font-mono-num text-base font-extrabold text-[#26211C]">
                  +{formatCompact(report.researchGenerated)} RP
                </p>
              </div>
            </div>

            <div className="rounded-xl border-2 border-[#2D241E] bg-[#F5EEFF] p-3 flex items-center gap-2.5">
              <Atom className="w-5 h-5 text-[#6D28D9] shrink-0" />
              <div>
                <p className="text-[11px] font-semibold text-[#5B21B6]">Anomaly Samples</p>
                <p className="font-mono-num text-base font-extrabold text-[#26211C]">
                  +{report.samplesGenerated.toFixed(1)}
                </p>
              </div>
            </div>

            <div className="rounded-xl border-2 border-[#2D241E] bg-[#EEF2FF] p-3 flex items-center gap-2.5">
              <Award className="w-5 h-5 text-[#4338CA] shrink-0" />
              <div>
                <p className="text-[11px] font-semibold text-[#4338CA]">Reputation</p>
                <p className="font-mono-num text-base font-extrabold text-[#26211C]">
                  +{report.reputationGenerated.toFixed(1)} Rep
                </p>
              </div>
            </div>
          </div>

          {/* Objects Investigated */}
          <div className="rounded-xl border-2 border-[#2D241E] bg-[#FFFDF8] p-3.5 space-y-1.5">
            <h3 className="font-display text-xs font-bold text-[#26211C] flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-[#0D9488]" />
              <span>Objects Investigated</span>
            </h3>
            {report.objectsInvestigated.length === 0 ? (
              <p className="text-xs text-[#6B5E51]">
                No objects were mounted in Investigation bays during this shift.
              </p>
            ) : (
              <ul className="space-y-1">
                {report.objectsInvestigated.map((item, idx) => (
                  <li key={idx} className="text-xs text-[#3F362D]">
                    · {item}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Discoveries Made */}
          <div className="rounded-xl border-2 border-[#2D241E] bg-[#FFFDF8] p-3.5 space-y-1.5">
            <h3 className="font-display text-xs font-bold text-[#26211C] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#B45309]" />
              <span>Discoveries Made</span>
            </h3>
            {report.discoveriesMade.length === 0 ? (
              <p className="text-xs text-[#6B5E51]">
                No new agency milestones crossed while away.
              </p>
            ) : (
              <ul className="space-y-1">
                {report.discoveriesMade.map((item, idx) => (
                  <li key={idx} className="text-xs font-semibold text-[#0F766E]">
                    · Unlocked Milestone: {item}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Events That Occurred */}
          <div className="rounded-xl border-2 border-[#2D241E] bg-[#FFFDF8] p-3.5 space-y-1.5">
            <h3 className="font-display text-xs font-bold text-[#26211C] flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-[#4F46E5]" />
              <span>Events That Occurred</span>
            </h3>
            {report.eventsOccurred.length === 0 ? (
              <p className="text-xs text-[#6B5E51]">
                Quiet shift — no unusual pneumatic dispatches occurred while away.
              </p>
            ) : (
              <ul className="space-y-1">
                {report.eventsOccurred.map((ev, idx) => (
                  <li key={idx} className="text-xs text-[#3F362D]">
                    · {ev}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="px-5 py-3.5 bg-[#FFFDF8] border-t-2 border-[#2D241E] flex items-center justify-between gap-3">
          <p className="text-[11px] text-[#6B5E51]">
            Upgrade Night-Shift Chart Loggers to raise offline cap & efficiency.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 py-2.5 rounded-xl border-2 border-[#2D241E] bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold cursor-pointer shadow-[0_3px_0_#2D241E] active:translate-y-0.5 shrink-0"
          >
            Collect & Resume
          </button>
        </div>
      </div>
    </div>
  );
};
