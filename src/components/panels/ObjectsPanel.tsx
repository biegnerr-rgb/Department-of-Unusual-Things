import React, { useState } from 'react';
import {
  CheckCircle2,
  Compass,
  Eye,
  FlaskConical,
  Link2,
  Lock,
  Search,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { ROOM_DEFINITIONS } from '../../data/gameData';
import { RARITY_CONFIG } from '../../data/objectCatalog';
import {
  ActiveObjectSynergy,
  GameState,
  ObjectCategory,
  ObjectRarity,
  RoomId,
  UnusualObject,
} from '../../types/game';
import {
  canAssignObjectToRoom,
  ENVIRONMENT_LABELS,
  formatCompact,
  getEnvironmentMatchInfo,
  getRoomAssignedObjectIds,
} from '../../utils/simulation';
import { ObjectIcon } from '../svg/ObjectIcon';

interface ObjectsPanelProps {
  gameState: GameState;
  activeSynergies: ActiveObjectSynergy[];
  explorationCooldownSec: number;
  lastAbilityMessage: { objectId: string; text: string } | null;
  lastExplorationResult: string | null;
  onAssignObject: (objectId: string, roomId: RoomId | null) => void;
  onManualInspectObject: (objectId: string) => void;
  onActivateAbility: (objectId: string) => void;
  onRunExploration: () => void;
  onClaimAssignment: (assignmentId: string) => void;
  onOpenInvestigationBench: (objectId: string) => void;
}

type FilterMode = 'all' | 'discovered' | 'undiscovered' | 'contained';

const RARITY_FILTERS: Array<'All' | ObjectRarity> = [
  'All',
  'Common',
  'Uncommon',
  'Rare',
  'Epic',
  'Legendary',
  'Impossible',
];

const CATEGORY_FILTERS: Array<'All' | ObjectCategory> = ['All', 'Standard', 'Chronal', 'Dimensional'];

export const ObjectsPanel: React.FC<ObjectsPanelProps> = ({
  gameState,
  activeSynergies,
  explorationCooldownSec,
  lastAbilityMessage,
  lastExplorationResult,
  onAssignObject,
  onManualInspectObject,
  onActivateAbility,
  onRunExploration,
  onClaimAssignment,
  onOpenInvestigationBench,
}) => {
  const [filter, setFilter] = useState<FilterMode>('all');
  const [rarityFilter, setRarityFilter] = useState<'All' | ObjectRarity>('All');
  const [categoryFilter, setCategoryFilter] = useState<'All' | ObjectCategory>('All');
  const [selectedId, setSelectedId] = useState<string>(gameState.objects[0]?.id ?? 'obj_toaster');
  const [nowSec, setNowSec] = useState<number>(() => Math.floor(Date.now() / 1000));

  React.useEffect(() => {
    const id = window.setInterval(() => setNowSec(Math.floor(Date.now() / 1000)), 1000);
    return () => window.clearInterval(id);
  }, []);

  const stage = gameState.onboarding?.progressionStage ?? 6;
  const currentEra = gameState.prestigeEra ?? 1;
  const discoveredObjects = gameState.objects.filter((o) => o.status !== 'locked');

  const visibleObjects = gameState.objects.filter((o) => {
    const objCategory: ObjectCategory = o.objectCategory ?? 'Standard';
    if (stage >= 4 && rarityFilter !== 'All' && o.rarity !== rarityFilter) return false;
    if (stage >= 4 && categoryFilter !== 'All' && objCategory !== categoryFilter) return false;
    if (filter === 'discovered') return o.status !== 'locked';
    if (filter === 'undiscovered') return o.status === 'locked';
    if (filter === 'contained') return o.status === 'contained';
    return true;
  });

  const selectedObj: UnusualObject =
    gameState.objects.find((o) => o.id === selectedId) ?? gameState.objects[0];

  const unlockedObjectRooms = (Object.keys(ROOM_DEFINITIONS) as RoomId[]).filter((rId) => {
    const runtime = gameState.rooms[rId];
    return runtime.unlocked && ROOM_DEFINITIONS[rId].supportsObjectSlot !== 'none';
  });

  const reflectedCandidate = discoveredObjects.find(
    (o) => o.id !== selectedObj.id
  );

  const selectedSynergies = activeSynergies.filter(
    (s) => s.sourceObjectId === selectedObj.id || s.targetObjectId === selectedObj.id
  );

  const abilityLastUsedSec = selectedObj.lastAbilityUsedAt
    ? Math.floor(selectedObj.lastAbilityUsedAt / 1000)
    : 0;
  const abilityCooldownRemaining = Math.max(
    0,
    selectedObj.specialAbility.cooldownSec - (nowSec - abilityLastUsedSec)
  );

  const explorationCost = 85;
  const canExplore =
    explorationCooldownSec <= 0 && gameState.resources.funds >= explorationCost;

  const statusText = (obj: UnusualObject) => {
    if (obj.status === 'intake') return 'Discovered · Intake';
    if (obj.status === 'investigating') return 'Investigating';
    if (obj.status === 'contained') return 'Contained';
    return 'Undiscovered';
  };

  const sourceLabel = (src: UnusualObject['discoverySource']) => {
    switch (src) {
      case 'delivery':
        return 'Deliveries';
      case 'research':
        return 'Research Breakthrough';
      case 'event':
        return 'Random Events';
      case 'exploration':
        return 'Field Exploration';
      case 'assignment':
        return 'Special Assignment';
      case 'hidden':
        return 'Hidden Discovery';
      default:
        return 'Starter Intake';
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto warm-scroll bg-[#F4EFE4] p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Header & Collection Counter */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-[#26211C]">
              Unusual Object Collection
            </h2>
            <p className="text-sm text-[#5A4D41]">
              {discoveredObjects.length} of {gameState.objects.length} curiosities cataloged across 6 rarity tiers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status segmented controls */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#E7DFD0] border-2 border-[#2D241E]">
              {(
                [
                  { id: 'all', label: 'All', minStage: 1 },
                  { id: 'discovered', label: 'Discovered', minStage: 1 },
                  { id: 'undiscovered', label: 'Silhouettes', minStage: 3 },
                  { id: 'contained', label: 'Contained', minStage: 1 },
                ] as const
              )
                .filter((t) => stage >= t.minStage)
                .map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilter(tab.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      filter === tab.id
                        ? 'bg-[#FFFDF8] text-[#26211C] shadow-sm'
                        : 'text-[#5A4D41] hover:text-[#26211C]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Rarity & Category Filter Strip (Stage 4+) */}
        {stage >= 4 && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {RARITY_FILTERS.map((rf) => {
                const isActive = rarityFilter === rf;
                return (
                  <button
                    key={rf}
                    type="button"
                    onClick={() => setRarityFilter(rf)}
                    className={`px-3 py-1 rounded-lg border text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-[#26211C] text-[#FFFDF8] border-[#26211C]'
                        : 'bg-[#FFFDF8] text-[#4B4035] border-[#2D241E]/35 hover:bg-[#EFE6D5]'
                    }`}
                  >
                    {rf === 'All' ? 'All Rarities' : rf}
                  </button>
                );
              })}
            </div>
            {(stage >= 6 || currentEra >= 2) && (
              <div className="flex flex-wrap items-center gap-1.5">
                {CATEGORY_FILTERS.map((cf) => {
                  const isActive = categoryFilter === cf;
                  return (
                    <button
                      key={cf}
                      type="button"
                      onClick={() => setCategoryFilter(cf)}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-[#4F46E5] text-white border-[#2D241E]'
                          : 'bg-[#FFFDF8] text-[#4B4035] border-[#2D241E]/35 hover:bg-[#EEF2FF]'
                      }`}
                    >
                      {cf === 'All' ? 'All Categories' : cf}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Discovery Channels: Exploration (Stage 5+), Special Assignments & Active Interactions (Stage 4+) */}
        {stage >= 4 && (
          <div
            className={`grid grid-cols-1 ${
              stage >= 5 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'
            } gap-3.5`}
          >
            {/* Exploration Expedition */}
            {stage >= 5 && (
              <div className="rounded-xl border-2 border-[#2D241E] bg-[#FFFDF8] p-3.5 flex flex-col justify-between gap-2.5">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 font-display text-sm font-bold text-[#26211C]">
                  <Compass className="w-4 h-4 text-[#0D9488]" />
                  <span>Field Exploration</span>
                </span>
                <span className="font-mono-num text-[11px] font-bold text-[#6B5E51]">
                  {gameState.expeditionsCompleted} trips
                </span>
              </div>
              <p className="text-xs text-[#5A4D41] mt-1">
                Send scouts to odd basements and roadside curiosities to discover hidden objects or extra Research.
              </p>
              {lastExplorationResult && (
                <p className="mt-1.5 text-xs font-semibold text-[#0F766E]">
                  {lastExplorationResult}
                </p>
              )}
            </div>
            <button
              type="button"
              disabled={!canExplore}
              onClick={onRunExploration}
              className={`w-full py-2 px-3 rounded-lg border-2 border-[#2D241E] text-xs font-bold transition-colors ${
                canExplore
                  ? 'bg-[#0D9488] hover:bg-[#0F766E] text-white cursor-pointer'
                  : 'bg-[#E5DDD0] text-[#7A6D60] cursor-not-allowed'
              }`}
            >
              {explorationCooldownSec > 0
                ? `Scouting Cooldown (${explorationCooldownSec}s)`
                : `Dispatch Expedition ($${explorationCost})`}
            </button>
          </div>
            )}

          {/* Special Assignments */}
          <div className="rounded-xl border-2 border-[#2D241E] bg-[#FFFDF8] p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 font-display text-sm font-bold text-[#26211C]">
              <Sparkles className="w-4 h-4 text-[#B45309]" />
              <span>Special Assignments</span>
            </div>
            <div className="space-y-2">
              {gameState.specialAssignments.map((assign) => (
                <div
                  key={assign.id}
                  className="rounded-lg bg-[#FAF5EB] border border-[#2D241E]/25 p-2 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#26211C] truncate">{assign.title}</p>
                    <p className="text-[11px] text-[#5A4D41] leading-snug">{assign.description}</p>
                  </div>
                  {assign.claimed ? (
                    <span className="text-[11px] font-bold text-[#0F766E] shrink-0">Claimed</span>
                  ) : assign.completed ? (
                    <button
                      type="button"
                      onClick={() => onClaimAssignment(assign.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] border border-[#2D241E] text-[11px] font-bold text-[#26211C] shrink-0 cursor-pointer"
                    >
                      Claim
                    </button>
                  ) : (
                    <span className="text-[11px] font-semibold text-[#7A6B5C] shrink-0">Active</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Active Object Synergies */}
          <div className="rounded-xl border-2 border-[#2D241E] bg-[#FFFDF8] p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 font-display text-sm font-bold text-[#26211C]">
                <Link2 className="w-4 h-4 text-[#4338CA]" />
                <span>Object Interactions</span>
              </span>
              <span className="font-mono-num text-[11px] font-bold text-[#4338CA]">
                {activeSynergies.length} Active
              </span>
            </div>
            {activeSynergies.length === 0 ? (
              <p className="text-xs text-[#5A4D41]">
                Collect and place more unusual objects to trigger live cross-object interactions!
              </p>
            ) : (
              <div className="space-y-1.5 max-h-28 overflow-y-auto warm-scroll pr-1">
                {activeSynergies.map((syn) => (
                  <div
                    key={`${syn.ruleId}_${syn.targetObjectId}`}
                    className="rounded-lg bg-[#EEF2FF] border border-[#4338CA]/30 p-2 text-[11px]"
                  >
                    <p className="font-bold text-[#1E1B4B]">
                      {syn.sourceObjectName} ↔ {syn.targetObjectName}
                    </p>
                    <p className="text-[#3730A3] leading-snug mt-0.5">{syn.title}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          </div>
        )}

        {/* Collection Grid + Dossier Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Object Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {visibleObjects.length === 0 ? (
              <div className="sm:col-span-2 rounded-xl border-2 border-[#2D241E] bg-[#FFFDF8] p-8 text-center text-sm text-[#5A4D41]">
                No objects match the selected rarity and status filters.
              </div>
            ) : (
              visibleObjects.map((obj) => {
                const isSelected = selectedObj.id === obj.id;
                const isLocked = obj.status === 'locked';
                const rarityMeta = RARITY_CONFIG[obj.rarity];
                const hasSynergy = activeSynergies.some(
                  (s) => s.sourceObjectId === obj.id || s.targetObjectId === obj.id
                );

                return (
                  <button
                    key={obj.id}
                    type="button"
                    onClick={() => setSelectedId(obj.id)}
                    className={`text-left rounded-xl border-2 p-3.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FFFDF8] border-[#2D241E] shadow-[0_4px_0_#0D9488]'
                        : isLocked
                        ? 'bg-[#EAE2D3] border-[#7A6B5C] hover:bg-[#E4DAC8]'
                        : 'bg-[#FFFDF8] border-[#2D241E] hover:bg-[#FAF5EB] shadow-[0_3px_0_#2D241E]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-16 h-16 rounded-xl border-2 flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: isLocked ? '#DDD3C2' : rarityMeta.glowColor,
                          borderColor: isLocked ? '#8C7D6B' : rarityMeta.frameBorder,
                        }}
                      >
                        <ObjectIcon
                          iconKey={obj.iconKey}
                          idleAnimation={obj.idleAnimation}
                          silhouette={isLocked}
                          reflectedIconKey={reflectedCandidate?.iconKey}
                          className="w-13 h-13"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2 text-[11px] font-semibold">
                          <span className="font-mono-num text-[#6B5E51]">
                            {obj.code}
                            {obj.objectCategory && obj.objectCategory !== 'Standard'
                              ? ` · ${obj.objectCategory}`
                              : ''}
                          </span>
                          <span
                            className="font-bold"
                            style={{ color: rarityMeta.badgeText }}
                          >
                            {obj.rarity}
                          </span>
                        </div>

                        <h3 className="font-display text-sm font-bold text-[#26211C] truncate mt-0.5">
                          {isLocked ? '??? (Undiscovered)' : obj.name}
                        </h3>

                        <p className="text-xs text-[#5A4D41] line-clamp-2 mt-1">
                          {isLocked ? obj.originHint : obj.shortQuirk}
                        </p>

                        <div className="mt-2 flex items-center justify-between text-[11px] font-mono-num font-semibold">
                          {isLocked ? (
                            <span className="text-[#7A6B5C]">
                              Source: {sourceLabel(obj.discoverySource)}
                            </span>
                          ) : (
                            <>
                              <span className="text-[#0F766E]">
                                +${obj.fundsPerSec.toFixed(1)}/s · +{obj.researchPerSec.toFixed(1)} RP/s
                              </span>
                              {hasSynergy && (
                                <span className="text-[#4338CA] font-bold">Synergy</span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Right Detailed Object Dossier */}
          <div className="lg:col-span-5 rounded-2xl border-2 border-[#2D241E] bg-[#FFFDF8] p-5 shadow-[0_5px_0_#2D241E] space-y-4">
            {selectedObj.status === 'locked' ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-24 h-24 mx-auto rounded-2xl bg-[#E5DDD0] border-2 border-dashed border-[#7A6B5C] flex items-center justify-center">
                  <ObjectIcon
                    iconKey={selectedObj.iconKey}
                    silhouette
                    className="w-16 h-16"
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#6B5E51]">
                    {selectedObj.code} · {selectedObj.rarity} Rarity ·{' '}
                    {sourceLabel(selectedObj.discoverySource)}
                  </p>
                  <h3 className="font-display text-xl font-extrabold text-[#26211C] mt-1">
                    Undiscovered Anomaly Silhouette
                  </h3>
                  <p className="text-xs text-[#4B4035] max-w-sm mx-auto mt-2 leading-relaxed">
                    {selectedObj.originHint}
                  </p>
                </div>
                <div className="rounded-xl bg-[#FAF5EB] border border-[#2D241E]/25 p-3 text-xs text-[#5A4D41] flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>
                    Estimated Research Value: <strong className="font-mono-num">{selectedObj.researchValue} RP</strong>
                  </span>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <div
                    className="w-20 h-20 rounded-2xl border-2 flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: RARITY_CONFIG[selectedObj.rarity].glowColor,
                      borderColor: RARITY_CONFIG[selectedObj.rarity].frameBorder,
                    }}
                  >
                    <ObjectIcon
                      iconKey={selectedObj.iconKey}
                      idleAnimation={selectedObj.idleAnimation}
                      reflectedIconKey={reflectedCandidate?.iconKey}
                      className="w-16 h-16"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#6B5E51]">
                      <span className="font-mono-num">{selectedObj.code}</span>
                      <span>·</span>
                      <span style={{ color: RARITY_CONFIG[selectedObj.rarity].badgeText }}>
                        {selectedObj.rarity}
                      </span>
                      {selectedObj.objectCategory && selectedObj.objectCategory !== 'Standard' && (
                        <>
                          <span>·</span>
                          <span className="text-[#4F46E5] font-bold">
                            {selectedObj.objectCategory} Category
                          </span>
                        </>
                      )}
                      <span>·</span>
                      <span>{statusText(selectedObj)}</span>
                    </div>
                    <h3 className="font-display text-xl font-extrabold text-[#26211C] leading-tight mt-0.5">
                      {selectedObj.name}
                    </h3>
                    <p className="text-xs font-semibold text-[#0F766E] mt-1">
                      {selectedObj.assignedRoomId
                        ? `Located in ${ROOM_DEFINITIONS[selectedObj.assignedRoomId].name}`
                        : 'Ready in Collection Intake'}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-[#3F362D] leading-relaxed">{selectedObj.description}</p>

                {selectedObj.discoveryLore && (
                  <div className="rounded-xl bg-[#EEF2FF]/75 border border-[#4338CA]/30 px-3 py-2 text-xs text-[#312E81]">
                    <span className="font-bold">Dept. 404 Archive Lore: </span>
                    <span>{selectedObj.discoveryLore}</span>
                  </div>
                )}

                {/* Appearance, Environment Affinity, Research Value & Containment Requirement */}
                <div className="rounded-xl bg-[#FAF5EB] border border-[#2D241E]/25 p-3 space-y-1.5 text-xs text-[#4B4035]">
                  <p>
                    <span className="font-bold text-[#26211C]">Appearance: </span>
                    {selectedObj.appearance}
                  </p>
                  <p>
                    <span className="font-bold text-[#26211C]">Containment Req: </span>
                    Tier {selectedObj.requiredContainmentTier} · {selectedObj.containmentRequirement}
                  </p>
                  <p>
                    <span className="font-bold text-[#26211C]">Ideal Environment: </span>
                    <span className="text-[#0F766E] font-semibold">
                      {ENVIRONMENT_LABELS[selectedObj.preferredEnvironment]}
                    </span>{' '}
                    — {selectedObj.environmentBonusNote}
                  </p>
                  <p>
                    <span className="font-bold text-[#26211C]">Research Value: </span>
                    <span className="font-mono-num font-bold text-[#0F766E]">
                      {selectedObj.researchValue} RP
                    </span>{' '}
                    ·{' '}
                    <span className="font-mono-num">
                      +${selectedObj.fundsPerSec.toFixed(1)}/s, +{selectedObj.researchPerSec.toFixed(1)} RP/s
                    </span>
                  </p>
                </div>

                {/* Special Interactive Ability */}
                <div className="rounded-xl border-2 border-[#2D241E] bg-[#FEF6E4] p-3.5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 font-display text-sm font-bold text-[#26211C]">
                      <Zap className="w-4 h-4 text-[#B45309]" />
                      <span>Special Ability: {selectedObj.specialAbility.name}</span>
                    </span>
                    <span className="font-mono-num text-[11px] font-semibold text-[#7A6B5C]">
                      {selectedObj.specialAbility.cooldownSec}s CD
                    </span>
                  </div>
                  <p className="text-xs text-[#4B4035]">
                    {selectedObj.specialAbility.description}
                  </p>
                  {lastAbilityMessage?.objectId === selectedObj.id && (
                    <p className="text-xs font-semibold text-[#0F766E] bg-[#FFFDF8] border border-[#0F766E]/30 rounded-lg px-2.5 py-1.5">
                      {lastAbilityMessage.text}
                    </p>
                  )}
                  <button
                    type="button"
                    disabled={abilityCooldownRemaining > 0}
                    onClick={() => onActivateAbility(selectedObj.id)}
                    className={`w-full py-2 px-3 rounded-xl border-2 border-[#2D241E] text-xs font-bold transition-all ${
                      abilityCooldownRemaining > 0
                        ? 'bg-[#E5DDD0] text-[#7A6D60] cursor-not-allowed'
                        : 'bg-[#F59E0B] hover:bg-[#D97706] text-[#26211C] cursor-pointer shadow-[0_2px_0_#2D241E]'
                    }`}
                  >
                    {abilityCooldownRemaining > 0
                      ? `Recharging (${abilityCooldownRemaining}s)`
                      : `Activate ${selectedObj.specialAbility.name}`}
                  </button>
                </div>

                {/* Active Object-to-Object Interactions */}
                {selectedSynergies.length > 0 && (
                  <div className="rounded-xl bg-[#EEF2FF] border border-[#4338CA]/35 p-3 space-y-1.5">
                    <p className="text-xs font-bold text-[#1E1B4B] inline-flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5" />
                      <span>Active Interactions</span>
                    </p>
                    {selectedSynergies.map((syn) => (
                      <p key={`${syn.ruleId}_${syn.targetObjectId}`} className="text-xs text-[#3730A3] leading-snug">
                        <strong>{syn.title}:</strong> {syn.description}
                      </p>
                    ))}
                  </div>
                )}

                {/* Investigation progress & Quick Inspect */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#26211C] inline-flex items-center gap-1.5">
                      {selectedObj.investigated ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-[#0F766E]" />
                          <span>Investigation Complete</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4 text-[#B45309]" />
                          <span>Investigation Progress</span>
                        </>
                      )}
                    </span>
                    <span className="font-mono-num text-[#0F766E]">
                      {Math.floor(selectedObj.investigationProgress)}%
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[#E5DDD0] border border-[#2D241E]/40 overflow-hidden">
                    <div
                      className="h-full bg-[#0D9488] transition-all"
                      style={{ width: `${Math.min(100, selectedObj.investigationProgress)}%` }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!selectedObj.investigated && (
                      <button
                        type="button"
                        onClick={() => onManualInspectObject(selectedObj.id)}
                        className="flex-1 py-2 px-3 rounded-xl border-2 border-[#2D241E] bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Inspect (+Progress)</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onOpenInvestigationBench(selectedObj.id)}
                      className="flex-1 py-2 px-3 rounded-xl border-2 border-[#2D241E] bg-[#FEF6E4] hover:bg-[#FDE68A] text-[#26211C] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Search className="w-4 h-4" />
                      <span>Open Investigation Bench</span>
                    </button>
                  </div>
                </div>

                {/* Room Assignment Controls */}
                <div className="space-y-2 pt-1 border-t border-[#2D241E]/15">
                  <p className="text-xs font-bold text-[#26211C]">Place in Facility Room</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {unlockedObjectRooms.map((rId) => {
                      const def = ROOM_DEFINITIONS[rId];
                      const runtime = gameState.rooms[rId];
                      const check = canAssignObjectToRoom(selectedObj, rId, runtime, gameState);
                      const envMatch = getEnvironmentMatchInfo(selectedObj, rId);
                      const assignedIds = getRoomAssignedObjectIds(runtime);
                      const isCurrent = assignedIds.includes(selectedObj.id);
                      return (
                        <button
                          key={rId}
                          type="button"
                          disabled={!check.ok || isCurrent}
                          onClick={() => onAssignObject(selectedObj.id, rId)}
                          className={`p-2.5 rounded-xl border-2 border-[#2D241E] text-left text-xs transition-colors ${
                            isCurrent
                              ? 'bg-[#0D9488] text-white cursor-default'
                              : check.ok
                              ? 'bg-[#FAF5EB] hover:bg-[#E6F4F2] text-[#26211C] cursor-pointer'
                              : 'bg-[#EAE2D3] text-[#7A6B5C] opacity-65 cursor-not-allowed'
                          }`}
                        >
                          <div className="font-bold flex items-center justify-between gap-1.5">
                            <span className="inline-flex items-center gap-1.5 min-w-0">
                              {def.supportsObjectSlot === 'investigation' ? (
                                <FlaskConical className="w-3.5 h-3.5 shrink-0" />
                              ) : (
                                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                              )}
                              <span className="truncate">{def.name}</span>
                            </span>
                            <span className="font-mono-num text-[10px] shrink-0 opacity-85">
                              {assignedIds.length}/{runtime.objectCapacity}
                            </span>
                          </div>
                          <p className="text-[11px] opacity-90 mt-0.5 truncate">
                            {isCurrent
                              ? envMatch.isMatch
                                ? `Placed · ${envMatch.label}`
                                : 'Currently Placed Here'
                              : check.ok
                              ? envMatch.isMatch
                                ? envMatch.label
                                : check.willReplace
                                ? 'Click to swap slot'
                                : 'Click to place'
                              : check.reason}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                  {selectedObj.assignedRoomId && (
                    <button
                      type="button"
                      onClick={() => onAssignObject(selectedObj.id, null)}
                      className="w-full py-2 rounded-xl border border-[#2D241E] bg-[#FAF5EB] hover:bg-[#EFE6D5] text-xs font-semibold text-[#4B4035] cursor-pointer"
                    >
                      Return to Intake Shelf ({formatCompact(selectedObj.researchValue)} RP Value)
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
