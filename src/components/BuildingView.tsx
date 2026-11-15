import React from 'react';
import { Eye, Hammer, KeyRound, Lock, Plus, Sparkles, Users } from 'lucide-react';
import { FLOOR_3_UNLOCK_COST, ROOM_DEFINITIONS } from '../data/gameData';
import {
  FloatingFeedback,
  GameState,
  RoomId,
} from '../types/game';
import {
  FacilityRates,
  formatCompact,
  getRoomAssignedObjectIds,
} from '../utils/simulation';
import { RoomInteriorScene } from './svg/BuildingArtwork';

interface BuildingViewProps {
  gameState: GameState;
  rates: FacilityRates;
  feedbacks: FloatingFeedback[];
  recentUpgradedRoomId?: RoomId | null;
  highlightTarget?: string | null;
  onSelectRoom: (roomId: RoomId) => void;
  onQuickPropClick: (e: React.MouseEvent, roomId: RoomId) => void;
  onUnlockRoom: (roomId: RoomId) => void;
  onUnlockFloor3: () => void;
  onFindHiddenClue: (clueId: string) => void;
  onOpenClassifiedTab: () => void;
  onTriggerSecretRoomAction: (secretRoomId: string) => void;
}

const FLOOR_GROUPS: Array<{ floor: 1 | 2 | 3; label: string; depthLabel: string; rooms: RoomId[] }> = [
  {
    floor: 1,
    label: 'Ground Wing',
    depthLabel: '0m',
    rooms: ['reception', 'investigation', 'research_desk'],
  },
  {
    floor: 2,
    label: 'Sub-Level B1',
    depthLabel: '-6m',
    rooms: ['containment', 'archive_vault', 'anomaly_workshop'],
  },
  {
    floor: 3,
    label: 'Sub-Level B2 · Deep Wing',
    depthLabel: '-12m',
    rooms: ['break_lounge', 'temporal_lab', 'quantum_pantry'],
  },
];

export const BuildingView: React.FC<BuildingViewProps> = ({
  gameState,
  rates,
  feedbacks,
  recentUpgradedRoomId,
  highlightTarget,
  onSelectRoom,
  onQuickPropClick,
  onUnlockRoom,
  onUnlockFloor3,
  onFindHiddenClue,
  onOpenClassifiedTab,
  onTriggerSecretRoomAction,
}) => {
  const now = Date.now();
  const stage = gameState.onboarding?.progressionStage ?? 6;
  const tutorialStep = gameState.onboarding?.tutorialStep ?? 'completed';
  const thunderstormFound = gameState.hiddenCluesFound.includes('rooftop_storm_vane');
  const plaqueFound = gameState.hiddenCluesFound.includes('facade_404_plaque');
  const thunderstormUnlocked =
    gameState.objects.find((o) => o.id === 'obj_thunderstorm')?.status !== 'locked';
  const otherDiscovered = gameState.objects.find(
    (o) => o.status !== 'locked' && o.id !== 'obj_suspicious_mirror'
  );
  const secretRooms = gameState.secretRooms ?? [];
  const liveBoosts = (gameState.activeBoosts ?? []).filter((b) => b.expiresAt > now);

  const showRooftopStorm =
    tutorialStep === 'completed' && stage >= 2 && !thunderstormFound && !thunderstormUnlocked;
  const show404Plaque = (tutorialStep === 'completed' && stage >= 3) || plaqueFound;
  const showSecretRoomsStrip =
    secretRooms.length > 0 && (stage >= 5 || secretRooms.some((sr) => sr.discovered));

  const visibleFloors = FLOOR_GROUPS.filter((group) => {
    if (group.floor === 1) return true;
    if (group.floor === 2) {
      return (
        stage >= 2 ||
        tutorialStep === 'contain' ||
        tutorialStep === 'earn_rewards' ||
        tutorialStep === 'expand' ||
        tutorialStep === 'completed' ||
        gameState.rooms.containment.unlocked
      );
    }
    if (group.floor === 3) {
      return stage >= 5 || gameState.floor3Unlocked;
    }
    return true;
  });

  const isRoomVisibleInStage = (rId: RoomId): boolean => {
    if (gameState.rooms[rId].unlocked) return true;
    if (rId === 'investigation') return true;
    if (rId === 'containment') {
      return (
        stage >= 2 ||
        tutorialStep === 'contain' ||
        tutorialStep === 'earn_rewards' ||
        tutorialStep === 'expand' ||
        tutorialStep === 'completed'
      );
    }
    if (rId === 'research_desk') return stage >= 3;
    if (rId === 'archive_vault' || rId === 'anomaly_workshop') return stage >= 3;
    return stage >= 5 || gameState.floor3Unlocked;
  };

  const canExcavateFloor3 =
    !gameState.floor3Unlocked &&
    gameState.resources.funds >= FLOOR_3_UNLOCK_COST.funds &&
    gameState.resources.reputation >= FLOOR_3_UNLOCK_COST.reputation;

  return (
    <div className="w-full h-full overflow-auto warm-scroll bg-gradient-to-b from-[#DCEEF2] via-[#E8EFE7] to-[#D6C5AD]">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 pt-3 sm:pt-4 pb-8">
        {/* Exterior Ground Surface & Rooftop Scene */}
        <div className="relative h-24 sm:h-32 w-full rounded-t-2xl overflow-hidden border-2 border-b-0 border-[#2D241E] bg-gradient-to-b from-[#BAE6FD] to-[#E0F2FE]">
          <svg viewBox="0 0 960 130" className="w-full h-full" preserveAspectRatio="xMidYMax slice" fill="none">
            <g fill="#FFFFFF" fillOpacity="0.9">
              <ellipse cx="140" cy="34" rx="34" ry="13" />
              <ellipse cx="165" cy="30" rx="22" ry="11" />
              <ellipse cx="520" cy="26" rx="42" ry="14" />
              <ellipse cx="552" cy="24" rx="26" ry="11" />
              <ellipse cx="820" cy="38" rx="30" ry="11" />
            </g>
            <path d="M0 105 Q220 70 460 98 T960 92 V130 H0 Z" fill="#A7D7C5" />
            <rect x="0" y="102" width="960" height="28" fill="#65A30D" stroke="#2D241E" strokeWidth="2" />
            <rect x="275" y="76" width="410" height="28" rx="4" fill="#F5EFE3" stroke="#2D241E" strokeWidth="2.5" />
            <rect x="290" y="64" width="120" height="14" rx="3" fill="#CBD5E1" stroke="#2D241E" strokeWidth="2" />
            <rect x="550" y="60" width="95" height="18" rx="3" fill="#D97706" stroke="#2D241E" strokeWidth="2" />
            <rect x="418" y="42" width="124" height="26" rx="4" fill="#FFFDF8" stroke="#2D241E" strokeWidth="2.2" />
            <text x="480" y="59" textAnchor="middle" fill="#26211C" fontSize="10.5" fontWeight="800" fontFamily="Bricolage Grotesque, sans-serif">
              DEPT. SECTOR 04
            </text>
            <line x1="440" y1="68" x2="440" y2="76" stroke="#2D241E" strokeWidth="2.5" />
            <line x1="520" y1="68" x2="520" y2="76" stroke="#2D241E" strokeWidth="2.5" />
            <g transform="translate(86, 68)">
              <rect x="0" y="8" width="66" height="26" rx="5" fill="#FDE68A" stroke="#2D241E" strokeWidth="2.2" />
              <path d="M50 8 H62 L69 20 V34 H50 Z" fill="#F59E0B" stroke="#2D241E" strokeWidth="2.2" strokeLinejoin="round" />
              <rect x="53" y="12" width="10" height="8" rx="1.5" fill="#E0F2FE" stroke="#2D241E" strokeWidth="1.5" />
              <circle cx="16" cy="35" r="6" fill="#334155" stroke="#2D241E" strokeWidth="2" />
              <circle cx="55" cy="35" r="6" fill="#334155" stroke="#2D241E" strokeWidth="2" />
            </g>
            <circle cx="772" cy="96" r="12" fill="#15803D" stroke="#2D241E" strokeWidth="2" />
            <circle cx="790" cy="98" r="9" fill="#16A34A" stroke="#2D241E" strokeWidth="2" />
            <line x1="836" y1="44" x2="836" y2="104" stroke="#2D241E" strokeWidth="2.5" />
            <polygon points="837,46 868,53 837,61" fill="#0D9488" stroke="#2D241E" strokeWidth="1.8" />
          </svg>

          {/* Interactive Hidden Discovery on Rooftop Brass Vane */}
          {showRooftopStorm && (
            <button
              type="button"
              onClick={() => onFindHiddenClue('rooftop_storm_vane')}
              title="Inspect sparking miniature storm cloud near the rooftop vent!"
              className="absolute right-[16%] sm:right-[29%] top-2 sm:top-4 z-20 min-w-[40px] min-h-[40px] p-1.5 rounded-full bg-[#FFFDF8]/95 border-2 border-[#2D241E] shadow-md hover:scale-110 active:scale-95 transition-transform cursor-pointer flex items-center justify-center"
            >
              <svg viewBox="0 0 36 36" className="w-6 h-6 sm:w-7 sm:h-7" fill="none">
                <path
                  d="M9 21 C6 21, 5 16, 8 14 C8 10, 14 7, 19 9 C23 7, 28 10, 28 14 C31 15, 30 21, 26 21 Z"
                  fill="#64748B"
                  stroke="#2D241E"
                  strokeWidth="2"
                />
                <polygon
                  points="19,20 15,26 18,26 16,31 22,24 19,24"
                  fill="#FACC15"
                  stroke="#2D241E"
                  strokeWidth="1.3"
                  className="animate-storm-flash"
                />
              </svg>
            </button>
          )}

          {/* Subtle Dept. 404 scratched plaque easter egg */}
          {show404Plaque && (
            <button
              type="button"
              onClick={() =>
                plaqueFound ? onOpenClassifiedTab() : onFindHiddenClue('facade_404_plaque')
              }
              title={
                plaqueFound
                  ? 'Inspect Department 404 Archives'
                  : 'Scratch off moss on the old tarnished plaque ("DEPT. 404")'
              }
              className="absolute left-3 sm:left-[31%] bottom-1.5 z-20 min-h-[34px] px-2.5 py-1 rounded border border-[#2D241E] bg-[#FEF3C7]/95 hover:bg-[#FDE68A] active:scale-95 text-[10px] font-mono-num font-extrabold text-[#78350F] cursor-pointer shadow-sm"
            >
              {plaqueFound ? 'DEPT. 404 ARCHIVES' : 'SCRATCHED PLAQUE · 404?'}
            </button>
          )}
        </div>

        {/* Subterranean Facility Cutaway Shell */}
        <div className="relative bg-[#5C4938] border-2 border-[#2D241E] rounded-b-2xl p-3 sm:p-4 shadow-[0_8px_0_#3A2E23] space-y-3.5">
          {/* Active Random Event / Phenomenon Effects Strip */}
          {liveBoosts.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 px-3 py-2 rounded-xl border-2 border-[#F59E0B] bg-[#2D241E] text-[#FEF3C7] animate-panel-enter">
              <Sparkles className="w-4 h-4 text-[#FBBF24] shrink-0 animate-pulse-lamp" />
              <span className="text-[11px] font-bold uppercase tracking-wide text-[#FDE68A]">
                Active Department Effect:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {liveBoosts.map((boost) => {
                  const secLeft = Math.max(1, Math.ceil((boost.expiresAt - now) / 1000));
                  return (
                    <span
                      key={boost.id}
                      title={boost.description}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#43362B] border border-[#F59E0B]/50 text-[11px] font-mono-num font-semibold text-[#FFFDF8]"
                    >
                      <span>{boost.label}</span>
                      <span className="text-[#FBBF24]">{secLeft}s</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
          {visibleFloors.map((group) => {
            if (group.floor === 3 && !gameState.floor3Unlocked) {
              return (
                <div key={group.floor} className="space-y-1.5">
                  <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-[#F5EFE3]">
                    <span>
                      Floor {group.floor} · {group.label}
                    </span>
                    <span className="font-mono-num text-[#E2D4BE]">{group.depthLabel}</span>
                  </div>
                  <div className="rounded-xl border-2 border-dashed border-[#A89680] bg-[#3E3228] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 text-left">
                      <div className="w-12 h-12 rounded-xl border-2 border-[#D97706] bg-[#2D241E] flex items-center justify-center shrink-0 text-[#FBBF24]">
                        <Hammer className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-display text-base font-extrabold text-[#FFFDF8]">
                          Excavate Sub-Level B2 (Experimental, Deep Storage & Reality Wing)
                        </h3>
                        <p className="text-xs text-[#E2D4BE] mt-0.5">
                          Opens access to Floor 3 rooms: Experimental Wing, Deep Storage (Tier 3), and Reality Division (Tier 3).
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={!canExcavateFloor3}
                      onClick={onUnlockFloor3}
                      className={`px-5 py-2.5 rounded-xl border-2 border-[#2D241E] text-xs font-bold shrink-0 transition-all ${
                        canExcavateFloor3
                          ? 'bg-[#F59E0B] hover:bg-[#D97706] text-[#26211C] cursor-pointer shadow-[0_3px_0_#2D241E]'
                          : 'bg-[#5A4D41] text-[#D6C8B4] cursor-not-allowed'
                      }`}
                    >
                      Excavate Floor 3 (${formatCompact(FLOOR_3_UNLOCK_COST.funds)} · {FLOOR_3_UNLOCK_COST.reputation} Rep)
                    </button>
                  </div>
                </div>
              );
            }

            const visibleFloorRooms = group.rooms.filter(isRoomVisibleInStage);
            if (visibleFloorRooms.length === 0) return null;

            return (
              <div key={group.floor} className="space-y-1.5">
                <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-[#F5EFE3]">
                  <span>
                    Floor {group.floor} · {group.label}
                  </span>
                  <span className="font-mono-num text-[#E2D4BE]">{group.depthLabel}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {visibleFloorRooms.map((roomId) => {
                    const def = ROOM_DEFINITIONS[roomId];
                    const runtime = gameState.rooms[roomId];
                    const assignedStaff = gameState.employees.filter((e) =>
                      runtime.assignedEmployeeIds.includes(e.id)
                    );
                    const assignedObjIds = getRoomAssignedObjectIds(runtime);
                    const assignedObjects = assignedObjIds
                      .map((id) => gameState.objects.find((o) => o.id === id))
                      .filter((o): o is NonNullable<typeof o> => Boolean(o));

                    const activeInvestigatingObj = assignedObjects.find((o) => !o.investigated) ?? null;
                    const roomRate = rates.roomRates[roomId];
                    const roomFeedbacks = feedbacks.filter((f) => f.roomId === roomId);
                    const hasSynergy = assignedObjects.some((obj) =>
                      rates.activeSynergies.some(
                        (s) => s.sourceObjectId === obj.id || s.targetObjectId === obj.id
                      )
                    );
                    const isHighlighted =
                      (highlightTarget === 'investigation_room' && roomId === 'investigation') ||
                      (highlightTarget === 'inspect_action' && roomId === 'investigation') ||
                      (highlightTarget === 'containment_room' && roomId === 'containment') ||
                      (highlightTarget === 'reception_bell' && roomId === 'reception');

                    if (!runtime.unlocked) {
                      const canAfford = gameState.resources.funds >= def.unlockCostFunds;
                      const hasRep = gameState.resources.reputation >= def.unlockMinReputation;
                      const canUnlock = canAfford && hasRep;

                      return (
                        <button
                          key={roomId}
                          type="button"
                          onClick={() => (canUnlock ? onUnlockRoom(roomId) : onSelectRoom(roomId))}
                          className={`relative h-[176px] rounded-xl border-2 border-dashed p-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                            isHighlighted ? 'ring-4 ring-[#F59E0B] ' : ''
                          }${
                            canUnlock
                              ? 'bg-[#2C4B47] border-[#5EEAD4] hover:bg-[#335954] shadow-inner'
                              : 'bg-[#3D332B] border-[#8D7D6B] hover:bg-[#493D33]'
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2 ${
                              canUnlock
                                ? 'bg-[#0D9488] border-[#FFFDF8] text-white'
                                : 'bg-[#2A221C] border-[#7A6B5C] text-[#D6C8B4]'
                            }`}
                          >
                            {canUnlock ? <Plus className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                          </div>
                          <p className="font-display text-sm font-bold text-[#FFFDF8] leading-tight">
                            {def.name}
                          </p>
                          <p className="mt-1 font-mono-num text-[11px] font-semibold text-[#FDE68A]">
                            {def.unlockCostFunds === 0 && def.unlockMinReputation === 0
                              ? 'Free Orientation Build'
                              : `$${formatCompact(def.unlockCostFunds)} · ${def.unlockMinReputation} Rep`}
                          </p>
                          <span
                            className={`mt-2 text-[11px] font-semibold ${
                              canUnlock ? 'text-[#99F6E4]' : 'text-[#C7B8A5]'
                            }`}
                          >
                            {canUnlock ? 'Click to Open Wing' : 'Locked Wing'}
                          </span>
                        </button>
                      );
                    }

                    return (
                      <div
                        key={roomId}
                        role="button"
                        tabIndex={0}
                        onClick={() => onSelectRoom(roomId)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onSelectRoom(roomId);
                          }
                        }}
                        className={`group relative h-[176px] rounded-xl border-2 border-[#2D241E] bg-[#FFFDF8] overflow-hidden shadow-[0_3px_0_#2D241E] hover:-translate-y-0.5 active:scale-[0.99] transition-transform cursor-pointer focus-visible:outline-2 focus-visible:outline-[#F59E0B] ${
                          isHighlighted ? 'ring-4 ring-[#F59E0B] ' : ''
                        }${
                          recentUpgradedRoomId === roomId ? 'animate-room-upgrade' : ''
                        }`}
                      >
                        <div className="relative z-20 flex items-center justify-between px-2.5 py-1.5 bg-[#FFFDF8]/95 border-b border-[#2D241E]/15">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span
                              className="w-2.5 h-2.5 rounded-sm border border-[#2D241E] shrink-0"
                              style={{ backgroundColor: def.accentColor }}
                            />
                            <span className="font-display text-xs font-bold text-[#26211C] truncate">
                              {def.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-mono-num font-bold text-[#5A4D41]">
                            {hasSynergy && (
                              <span className="text-[#0D9488] font-bold">Syn</span>
                            )}
                            {def.supportsObjectSlot !== 'none' && (
                              <span className="text-[#4338CA]">
                                T{roomRate.effectiveTier}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-0.5">
                              <Users className="w-3 h-3" />
                              {assignedStaff.length}/{runtime.staffCapacity}
                            </span>
                            <span>Lv.{runtime.level}</span>
                          </div>
                        </div>

                        <div className="relative h-[142px] w-full">
                          <RoomInteriorScene
                            def={def}
                            runtime={runtime}
                            assignedEmployees={assignedStaff}
                            assignedObjects={assignedObjects}
                            reflectedIconKey={otherDiscovered?.iconKey}
                            onQuickPropClick={onQuickPropClick}
                          />

                          <div className="absolute inset-x-0 bottom-0 z-20 px-2.5 py-1 bg-[#26211C]/80 text-[#FFFDF8] flex items-center justify-between text-[10px] font-mono-num">
                            <span className="truncate">
                              +${roomRate.fundsPerSec.toFixed(1)}/s · +{roomRate.researchPerSec.toFixed(1)} RP/s
                            </span>
                            {activeInvestigatingObj ? (
                              <span className="text-[#5EEAD4] font-bold shrink-0 ml-1">
                                {Math.floor(activeInvestigatingObj.investigationProgress)}%
                              </span>
                            ) : def.supportsObjectSlot !== 'none' ? (
                              <span className="text-[#FDE68A] shrink-0 ml-1">
                                {assignedObjects.length}/{runtime.objectCapacity} Obj
                              </span>
                            ) : null}
                          </div>

                          {activeInvestigatingObj && (
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-[#1E293B] z-30">
                              <div
                                className="h-full bg-[#2DD4BF] transition-all duration-150"
                                style={{
                                  width: `${Math.min(100, activeInvestigatingObj.investigationProgress)}%`,
                                }}
                              />
                            </div>
                          )}
                        </div>

                        {roomFeedbacks.map((fb) => (
                          <div
                            key={fb.id}
                            className={`pointer-events-none absolute left-1/2 top-12 z-40 px-2 py-0.5 rounded-md border border-[#2D241E] text-xs font-mono-num font-bold shadow animate-float-popup ${
                              fb.tone === 'funds'
                                ? 'bg-[#FEF08A] text-[#26211C]'
                                : fb.tone === 'research'
                                ? 'bg-[#99F6E4] text-[#0F172A]'
                                : 'bg-[#E0E7FF] text-[#1E1B4B]'
                            }`}
                          >
                            {fb.text}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Deep Secrets & Sub-Level 2.5 / B3 Strip */}
          {showSecretRoomsStrip && (
            <div className="pt-1 space-y-1.5">
              <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-[#E2D4BE]">
                <span className="inline-flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#FBBF24]" />
                  <span>Sealed Blueprints & Dept. 404 Secret Sub-Levels</span>
                </span>
                <button
                  type="button"
                  onClick={onOpenClassifiedTab}
                  className="text-[#FDE68A] hover:underline cursor-pointer"
                >
                  Open Classified Dossiers →
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {secretRooms.map((sr) => {
                  const cooldownSec = 45;
                  const elapsed = Math.floor((Date.now() - (sr.lastUsedAt ?? 0)) / 1000);
                  const remaining = Math.max(0, cooldownSec - elapsed);

                  if (!sr.discovered) {
                    return (
                      <button
                        key={sr.id}
                        type="button"
                        onClick={onOpenClassifiedTab}
                        className="rounded-xl border-2 border-dashed border-[#A89680] bg-[#362B22] hover:bg-[#43362B] px-4 py-3 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg border border-[#D97706] bg-[#261E18] flex items-center justify-center shrink-0 text-[#FBBF24]">
                            <Lock className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-display text-xs font-extrabold text-[#FFFDF8] truncate">
                              {sr.id === 'secret_tea_vault'
                                ? 'Bricked Hatch Behind Archives (Floor 2.5)'
                                : 'Chained Brass Elevator: Car #3 ("DO NOT HUM")'}
                            </p>
                            <p className="text-[11px] text-[#D6C8B4] truncate mt-0.5">
                              {sr.unlockHint}
                            </p>
                          </div>
                        </div>
                        <Eye className="w-4 h-4 text-[#FDE68A] shrink-0" />
                      </button>
                    );
                  }

                  return (
                    <div
                      key={sr.id}
                      className="rounded-xl border-2 border-[#2D241E] bg-[#EEF2FF] px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-[0_3px_0_#2D241E]"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono-num font-bold text-[#4338CA]">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>
                            {sr.floorLabel} · +${sr.passiveFundsPerSec}/s · +{sr.passiveResearchPerSec} RP/s
                          </span>
                        </div>
                        <p className="font-display text-sm font-extrabold text-[#1E1B4B] truncate mt-0.5">
                          {sr.name}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={remaining > 0}
                        onClick={() => onTriggerSecretRoomAction(sr.id)}
                        className={`px-3 py-1.5 rounded-lg border-2 border-[#2D241E] text-xs font-bold shrink-0 ${
                          remaining > 0
                            ? 'bg-[#D6DDF5] text-[#5A5F8C] cursor-not-allowed'
                            : 'bg-[#4F46E5] hover:bg-[#4338CA] text-white cursor-pointer'
                        }`}
                      >
                        {remaining > 0 ? `Cooldown (${remaining}s)` : sr.specialActionLabel}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
