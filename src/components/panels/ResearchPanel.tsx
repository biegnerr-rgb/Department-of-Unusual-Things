import React, { useState } from 'react';
import {
  Atom,
  Award,
  Bot,
  CheckCircle2,
  FlaskConical,
  Lock,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  canEnterNextOperationalEra,
  RESEARCH_BRANCH_META,
} from '../../data/researchTreeData';
import { GameState, ResearchBranch } from '../../types/game';
import { formatCompact, getEffectiveResearchCost, isResearched } from '../../utils/simulation';

interface ResearchPanelProps {
  gameState: GameState;
  onUnlockResearch: (nodeId: string) => void;
  onCompleteExperimentalProject: (projectId: string) => void;
  onToggleAutomation: (key: 'autoInvestigate' | 'autoAssignStaff') => void;
  onPurchasePrestigeTech: (techId: string) => void;
  onEnterNextOperationalEra: () => void;
}

const BRANCH_ORDER: ResearchBranch[] = [
  'investigation',
  'containment',
  'automation',
  'employee',
  'experimental',
  'anomaly',
  'reality',
];

const UNLOCK_TYPE_LABELS: Record<string, string> = {
  object: 'New Object',
  equipment: 'Equipment',
  room: 'Facility Wing',
  employee: 'Specialist',
  mechanic: 'New Mechanic',
  upgrade: 'Permanent Boost',
};

export const ResearchPanel: React.FC<ResearchPanelProps> = ({
  gameState,
  onUnlockResearch,
  onCompleteExperimentalProject,
  onToggleAutomation,
  onPurchasePrestigeTech,
  onEnterNextOperationalEra,
}) => {
  const [selectedBranch, setSelectedBranch] = useState<'all' | ResearchBranch>('all');
  const [confirmEraOpen, setConfirmEraOpen] = useState(false);

  const researchedCount = gameState.researchNodes.filter((r) => r.researched).length;
  const totalNodes = gameState.researchNodes.length;
  const era = gameState.prestigeEra ?? 1;
  const seals = gameState.prestigeCurrency ?? 0;
  const eraCheck = canEnterNextOperationalEra(gameState);

  const autoInvUnlocked = isResearched(gameState, 'res_auto_investigations');
  const autoStaffUnlocked = isResearched(gameState, 'res_auto_staff');
  const autoInvEnabled = Boolean(gameState.automationSettings?.autoInvestigate);
  const autoStaffEnabled = Boolean(gameState.automationSettings?.autoAssignStaff);

  const visibleNodes =
    selectedBranch === 'all'
      ? gameState.researchNodes
      : gameState.researchNodes.filter((n) => n.branch === selectedBranch);

  const activeBranchMeta =
    selectedBranch !== 'all' ? RESEARCH_BRANCH_META[selectedBranch] : null;

  return (
    <div className="w-full h-full overflow-y-auto warm-scroll bg-[#F4EFE4] p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header & Era Overview */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-[#26211C]">
              Research Tree & Long-Term Progression
            </h2>
            <p className="text-sm text-[#5A4D41]">
              Explore 7 specialized branches to unlock new objects, equipment, staff, rooms, automation systems, and cross-era Charters.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 shrink-0">
            <div className="rounded-xl border-2 border-[#2D241E] bg-[#FFFDF8] px-3 py-2">
              <p className="text-[11px] font-semibold text-[#7A6B5C]">Tree Progress</p>
              <p className="font-mono-num text-sm font-extrabold text-[#0F766E]">
                {researchedCount}/{totalNodes} Nodes
              </p>
            </div>
            <div className="rounded-xl border-2 border-[#2D241E] bg-[#EEF2FF] px-3 py-2">
              <p className="text-[11px] font-semibold text-[#4338CA]">Operational Era</p>
              <p className="font-mono-num text-sm font-extrabold text-[#312E81]">
                Era {era} {era > 1 ? `(+${(era - 1) * 25}%)` : ''}
              </p>
            </div>
            <div className="rounded-xl border-2 border-[#2D241E] bg-[#FEF6E4] px-3 py-2">
              <p className="text-[11px] font-semibold text-[#8C6D46]">Archival Seals</p>
              <p className="font-mono-num text-sm font-extrabold text-[#B45309]">
                {seals} Seals
              </p>
            </div>
          </div>
        </div>

        {/* Automation Systems Bar */}
        <section className="rounded-2xl border-2 border-[#2D241E] bg-[#FFFDF8] p-4 shadow-[0_3px_0_#2D241E] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-[#92400E]" />
              <h3 className="font-display text-sm font-bold text-[#26211C]">
                Department Automation Protocols
              </h3>
            </div>
            <span className="text-[11px] font-medium text-[#6B5E51]">
              Unlocked via the Automation research branch
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-xl border border-[#2D241E]/25 bg-[#FAF5EB] p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#26211C]">Auto-Investigate Intake Queue</p>
                <p className="text-[11px] text-[#5A4D41] mt-0.5">
                  {autoInvUnlocked
                    ? 'Automatically routes discovered objects onto empty Investigation Lab benches.'
                    : 'Requires "Automated Investigations" research node.'}
                </p>
              </div>
              {autoInvUnlocked ? (
                <button
                  type="button"
                  onClick={() => onToggleAutomation('autoInvestigate')}
                  className={`px-3 py-1.5 rounded-lg border-2 border-[#2D241E] text-xs font-bold shrink-0 cursor-pointer transition-colors ${
                    autoInvEnabled
                      ? 'bg-[#0D9488] text-white'
                      : 'bg-[#FFFDF8] text-[#4B4035] hover:bg-[#EFE6D5]'
                  }`}
                >
                  {autoInvEnabled ? 'Active' : 'Paused'}
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#E5DDD0] text-[#7A6B5C] text-[11px] font-bold shrink-0">
                  <Lock className="w-3 h-3" />
                  <span>Locked</span>
                </span>
              )}
            </div>

            <div className="rounded-xl border border-[#2D241E]/25 bg-[#FAF5EB] p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#26211C]">Auto-Assign Idle Employees</p>
                <p className="text-[11px] text-[#5A4D41] mt-0.5">
                  {autoStaffUnlocked
                    ? 'Automatically posts unassigned staff to open desks matching their specialty wing.'
                    : 'Requires "Automatic Employee Assignments" research node.'}
                </p>
              </div>
              {autoStaffUnlocked ? (
                <button
                  type="button"
                  onClick={() => onToggleAutomation('autoAssignStaff')}
                  className={`px-3 py-1.5 rounded-lg border-2 border-[#2D241E] text-xs font-bold shrink-0 cursor-pointer transition-colors ${
                    autoStaffEnabled
                      ? 'bg-[#0D9488] text-white'
                      : 'bg-[#FFFDF8] text-[#4B4035] hover:bg-[#EFE6D5]'
                  }`}
                >
                  {autoStaffEnabled ? 'Active' : 'Paused'}
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#E5DDD0] text-[#7A6B5C] text-[11px] font-bold shrink-0">
                  <Lock className="w-3 h-3" />
                  <span>Locked</span>
                </span>
              )}
            </div>
          </div>
        </section>

        {/* 7-Branch Research Tree */}
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display text-lg font-bold text-[#26211C] flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-[#0D9488]" />
              <span>Scientific Research Branches</span>
            </h3>
          </div>

          {/* Branch Filter Strip */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedBranch('all')}
              className={`px-3 py-1.5 rounded-lg border-2 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                selectedBranch === 'all'
                  ? 'bg-[#26211C] text-[#FFFDF8] border-[#26211C]'
                  : 'bg-[#FFFDF8] text-[#4B4035] border-[#2D241E]/35 hover:bg-[#EFE6D5]'
              }`}
            >
              All Branches ({researchedCount}/{totalNodes})
            </button>
            {BRANCH_ORDER.map((branchId) => {
              const meta = RESEARCH_BRANCH_META[branchId];
              const branchNodes = gameState.researchNodes.filter((n) => n.branch === branchId);
              const done = branchNodes.filter((n) => n.researched).length;
              const isActive = selectedBranch === branchId;
              return (
                <button
                  key={branchId}
                  type="button"
                  onClick={() => setSelectedBranch(branchId)}
                  className={`px-3 py-1.5 rounded-lg border-2 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#0D9488] text-white border-[#2D241E]'
                      : 'bg-[#FFFDF8] text-[#4B4035] border-[#2D241E]/35 hover:bg-[#EFE6D5]'
                  }`}
                >
                  {meta.shortLabel}{' '}
                  <span className="font-mono-num opacity-85">
                    ({done}/{branchNodes.length})
                  </span>
                </button>
              );
            })}
          </div>

          {activeBranchMeta && (
            <div className="rounded-xl border border-[#2D241E]/25 bg-[#FFFDF8] px-4 py-2.5 flex items-center justify-between gap-2">
              <div>
                <p className="font-display text-sm font-bold text-[#26211C]">
                  {activeBranchMeta.label}
                </p>
                <p className="text-xs text-[#5A4D41]">{activeBranchMeta.description}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleNodes.map((node) => {
              const branchMeta = RESEARCH_BRANCH_META[node.branch] ?? RESEARCH_BRANCH_META.anomaly;
              const prereqNode = node.prerequisiteId
                ? gameState.researchNodes.find((r) => r.id === node.prerequisiteId)
                : null;
              const prereqMet = !prereqNode || prereqNode.researched;
              const effectiveCost = getEffectiveResearchCost(node.costResearch, gameState);
              const canAfford = gameState.resources.research >= effectiveCost;
              const canBuy = !node.researched && prereqMet && canAfford;

              return (
                <div
                  key={node.id}
                  className={`rounded-2xl border-2 border-[#2D241E] p-4 flex flex-col justify-between gap-3 ${
                    node.researched
                      ? 'bg-[#E5EFEA]'
                      : prereqMet
                      ? 'bg-[#FFFDF8] shadow-[0_4px_0_#2D241E]'
                      : 'bg-[#EAE2D3] opacity-85'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border border-[#2D241E]/20 ${branchMeta.badgeBg} ${branchMeta.badgeText}`}
                        >
                          {branchMeta.shortLabel}
                        </span>
                        {node.unlockType && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#FAF5EB] text-[#5A4D41] border border-[#2D241E]/20">
                            {node.unlockSummary ?? UNLOCK_TYPE_LABELS[node.unlockType]}
                          </span>
                        )}
                      </div>
                      {node.researched ? (
                        <CheckCircle2 className="w-5 h-5 text-[#0F766E] shrink-0" />
                      ) : !prereqMet ? (
                        <Lock className="w-4 h-4 text-[#7A6B5C] shrink-0" />
                      ) : (
                        <FlaskConical className="w-4 h-4 text-[#0D9488] shrink-0" />
                      )}
                    </div>

                    <h4 className="font-display text-base font-extrabold text-[#26211C]">
                      {node.name}
                    </h4>
                    <p className="text-xs text-[#4B4035] leading-relaxed">{node.description}</p>
                    <p className="text-xs font-semibold text-[#0F766E]">{node.effectLabel}</p>
                    {prereqNode && !prereqMet && (
                      <p className="text-[11px] font-semibold text-[#8C6D46]">
                        Requires: {prereqNode.name}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#2D241E]/15">
                    <span className="font-mono-num text-xs font-bold text-[#26211C]">
                      {node.researched ? (
                        'Completed'
                      ) : effectiveCost < node.costResearch ? (
                        <span>
                          {formatCompact(effectiveCost)} RP{' '}
                          <span className="line-through text-[#7A6B5C] font-normal">
                            {formatCompact(node.costResearch)}
                          </span>
                        </span>
                      ) : (
                        `${formatCompact(effectiveCost)} RP`
                      )}
                    </span>
                    {!node.researched && (
                      <button
                        type="button"
                        disabled={!canBuy}
                        onClick={() => onUnlockResearch(node.id)}
                        className={`px-4 py-2 rounded-xl border-2 border-[#2D241E] text-xs font-bold transition-all ${
                          canBuy
                            ? 'bg-[#0D9488] hover:bg-[#0F766E] text-white cursor-pointer shadow-[0_3px_0_#2D241E]'
                            : 'bg-[#E5DDD0] text-[#7A6B5C] cursor-not-allowed'
                        }`}
                      >
                        Research
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Experimental Projects (Anomaly Samples) */}
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-lg font-bold text-[#26211C] flex items-center gap-2">
                <Atom className="w-4 h-4 text-[#6D28D9]" />
                <span>Experimental Projects (Anomaly Samples)</span>
              </h3>
              <p className="text-xs text-[#5A4D41]">
                Anomaly Samples are harvested from containment wings, investigations, and field events.
              </p>
            </div>
            <span className="px-3 py-1.5 rounded-xl border-2 border-[#2D241E] bg-[#F5EEFF] font-mono-num text-xs font-bold text-[#5B21B6]">
              Available: {Math.floor(gameState.resources.samples ?? 0)} Samples
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(gameState.experimentalProjects ?? []).map((proj) => {
              const isDone = !proj.repeatable && proj.completedCount >= proj.maxCompletions;
              const sampleCost = proj.repeatable
                ? proj.costSamples + proj.completedCount * 2
                : proj.costSamples;
              const hasSamples = (gameState.resources.samples ?? 0) >= sampleCost;
              const hasRp = gameState.resources.research >= proj.costResearch;
              const hasRep = gameState.resources.reputation >= proj.minReputation;
              const canRun = !isDone && hasSamples && hasRp && hasRep;

              return (
                <div
                  key={proj.id}
                  className={`rounded-2xl border-2 border-[#2D241E] p-4 flex flex-col justify-between gap-3 ${
                    isDone
                      ? 'bg-[#E5EFEA]'
                      : 'bg-[#FFFDF8] shadow-[0_4px_0_#2D241E]'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-display text-base font-extrabold text-[#26211C]">
                        {proj.name}
                      </h4>
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-[#0F766E] shrink-0" />
                      ) : proj.repeatable ? (
                        <span className="font-mono-num text-[11px] font-bold text-[#5B21B6]">
                          Run #{proj.completedCount + 1}
                        </span>
                      ) : (
                        <Sparkles className="w-4 h-4 text-[#6D28D9] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-[#4B4035] leading-relaxed">{proj.description}</p>
                    <p className="text-xs font-semibold text-[#5B21B6]">{proj.effectLabel}</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#2D241E]/15">
                    <div className="font-mono-num text-xs font-bold text-[#26211C]">
                      {isDone
                        ? 'Project Completed'
                        : `${sampleCost} Samples · ${proj.costResearch} RP · ${proj.minReputation} Rep`}
                    </div>
                    {!isDone && (
                      <button
                        type="button"
                        disabled={!canRun}
                        onClick={() => onCompleteExperimentalProject(proj.id)}
                        className={`px-4 py-2 rounded-xl border-2 border-[#2D241E] text-xs font-bold transition-all ${
                          canRun
                            ? 'bg-[#6D28D9] hover:bg-[#5B21B6] text-white cursor-pointer shadow-[0_3px_0_#2D241E]'
                            : 'bg-[#E5DDD0] text-[#7A6B5C] cursor-not-allowed'
                        }`}
                      >
                        {proj.repeatable ? 'Launch Symposium' : 'Initiate Project'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Optional Long-Term Prestige & Operational Era Charters */}
        <section className="rounded-2xl border-2 border-[#2D241E] bg-[#EEF2FF] p-5 shadow-[0_5px_0_#2D241E] space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#4338CA]" />
                <h3 className="font-display text-lg font-extrabold text-[#1E1B4B]">
                  Operational Era Charters (Optional Prestige)
                </h3>
              </div>
              <p className="text-xs text-[#3730A3] mt-1">
                When your department reaches major bureaucratic milestones, you may optionally begin a fresh Operational Era to earn permanent Archival Seals, unlock Cross-Era Technologies, and authorize Chronal & Dimensional object categories.
              </p>
            </div>
            <div className="rounded-xl border-2 border-[#2D241E] bg-[#FFFDF8] px-4 py-2 shrink-0 text-right">
              <p className="text-[11px] font-semibold text-[#5A4D41]">Archival Seals</p>
              <p className="font-mono-num text-lg font-extrabold text-[#4338CA]">
                {seals} Seals
              </p>
            </div>
          </div>

          {/* Prestige Transition Box */}
          <div className="rounded-xl border-2 border-[#2D241E] bg-[#FFFDF8] p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="font-display text-sm font-extrabold text-[#26211C]">
                Advance to Operational Era {era + 1}
              </h4>
              <span className="font-mono-num text-xs font-bold text-[#4338CA]">
                Projected Grant: +{eraCheck.rewardSeals} Archival Seals
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div
                className={`rounded-lg border p-2.5 flex items-center justify-between ${
                  eraCheck.reputationMet
                    ? 'bg-[#E5EFEA] border-[#0F766E] text-[#0F766E]'
                    : 'bg-[#FAF5EB] border-[#2D241E]/25 text-[#5A4D41]'
                }`}
              >
                <span className="font-semibold">Reputation</span>
                <span className="font-mono-num font-bold">
                  {Math.floor(gameState.resources.reputation)}/{eraCheck.reputationTarget}
                </span>
              </div>
              <div
                className={`rounded-lg border p-2.5 flex items-center justify-between ${
                  eraCheck.investigatedMet
                    ? 'bg-[#E5EFEA] border-[#0F766E] text-[#0F766E]'
                    : 'bg-[#FAF5EB] border-[#2D241E]/25 text-[#5A4D41]'
                }`}
              >
                <span className="font-semibold">Classified Objects</span>
                <span className="font-mono-num font-bold">
                  {gameState.objects.filter((o) => o.investigated).length}/{eraCheck.investigatedTarget}
                </span>
              </div>
              <div
                className={`rounded-lg border p-2.5 flex items-center justify-between ${
                  eraCheck.roomsMet
                    ? 'bg-[#E5EFEA] border-[#0F766E] text-[#0F766E]'
                    : 'bg-[#FAF5EB] border-[#2D241E]/25 text-[#5A4D41]'
                }`}
              >
                <span className="font-semibold">Unlocked Wings</span>
                <span className="font-mono-num font-bold">
                  {Object.values(gameState.rooms).filter((r) => r.unlocked).length}/{eraCheck.roomsTarget}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
              <div className="rounded-lg bg-[#E5EFEA]/70 border border-[#0F766E]/25 p-2.5 text-[#14532D]">
                <p className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Stays Permanent Across Eras</span>
                </p>
                <p className="mt-1">
                  Archival Seals, Prestige Technologies, Milestone Discoveries, Lifetime Stats, +25% Funds/RP Era bonus, and Era 2+ Object Categories.
                </p>
              </div>
              <div className="rounded-lg bg-[#FEF6E4] border border-[#B45309]/25 p-2.5 text-[#78350F]">
                <p className="font-bold flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>Resets For Fresh Run</span>
                </p>
                <p className="mt-1">
                  Room levels, Funds/RP/Samples/Rep balances, Standard Research Nodes, Staff roster & Upgrades (optional and never forced).
                </p>
              </div>
            </div>

            {!confirmEraOpen ? (
              <button
                type="button"
                disabled={!eraCheck.eligible}
                onClick={() => setConfirmEraOpen(true)}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-[#2D241E] text-xs font-bold transition-all ${
                  eraCheck.eligible
                    ? 'bg-[#4F46E5] hover:bg-[#4338CA] text-white cursor-pointer shadow-[0_3px_0_#2D241E]'
                    : 'bg-[#E5DDD0] text-[#7A6B5C] cursor-not-allowed'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                <span>
                  {eraCheck.eligible
                    ? `Begin Operational Era ${era + 1} (+${eraCheck.rewardSeals} Seals)`
                    : 'Complete Milestone Targets Above to Unlock Era Reset'}
                </span>
              </button>
            ) : (
              <div className="rounded-xl border-2 border-[#4F46E5] bg-[#EEF2FF] p-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-bold text-[#1E1B4B]">
                  Confirm transition to Era {era + 1}? You will receive +{eraCheck.rewardSeals} Archival Seals and keep all Prestige Technologies & Discoveries.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmEraOpen(false)}
                    className="px-3 py-1.5 rounded-lg border-2 border-[#2D241E] bg-[#FFFDF8] text-xs font-bold text-[#26211C] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmEraOpen(false);
                      onEnterNextOperationalEra();
                    }}
                    className="px-3 py-1.5 rounded-lg border-2 border-[#2D241E] bg-[#4F46E5] hover:bg-[#4338CA] text-xs font-bold text-white cursor-pointer"
                  >
                    Confirm Era {era + 1}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Prestige Technology Cards */}
          <div className="space-y-2.5">
            <h4 className="font-display text-sm font-bold text-[#1E1B4B]">
              Permanent Cross-Era Prestige Technologies
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(gameState.prestigeTechnologies ?? []).map((tech) => {
                const canBuy = !tech.purchased && seals >= tech.costSeals;
                return (
                  <div
                    key={tech.id}
                    className={`rounded-xl border-2 border-[#2D241E] p-3.5 flex flex-col justify-between gap-2.5 ${
                      tech.purchased ? 'bg-[#E5EFEA]' : 'bg-[#FFFDF8]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h5 className="font-display text-sm font-extrabold text-[#26211C]">
                          {tech.name}
                        </h5>
                        {tech.purchased && (
                          <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#4B4035] leading-relaxed">
                        {tech.description}
                      </p>
                      <p className="text-[11px] font-semibold text-[#4338CA]">
                        {tech.effectLabel}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[#2D241E]/15">
                      <span className="font-mono-num text-xs font-bold text-[#26211C]">
                        {tech.purchased ? 'Active Forever' : `${tech.costSeals} Seals`}
                      </span>
                      {!tech.purchased && (
                        <button
                          type="button"
                          disabled={!canBuy}
                          onClick={() => onPurchasePrestigeTech(tech.id)}
                          className={`px-3 py-1.5 rounded-lg border-2 border-[#2D241E] text-xs font-bold ${
                            canBuy
                              ? 'bg-[#4F46E5] hover:bg-[#4338CA] text-white cursor-pointer'
                              : 'bg-[#E5DDD0] text-[#7A6B5C] cursor-not-allowed'
                          }`}
                        >
                          Unlock
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
