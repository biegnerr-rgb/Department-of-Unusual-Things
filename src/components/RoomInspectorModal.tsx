import React, { useEffect, useState } from 'react';
import {
  ArrowUpCircle,
  FlaskConical,
  Hand,
  Lock,
  Package,
  PlusSquare,
  Sparkles,
  UserMinus,
  UserPlus,
  Wrench,
  X,
} from 'lucide-react';
import { ROOM_DEFINITIONS } from '../data/gameData';
import { GameState, RoomId } from '../types/game';
import {
  canAssignObjectToRoom,
  ENVIRONMENT_LABELS,
  FacilityRates,
  formatCompact,
  getEffectiveEmployeeStats,
  getEnvironmentMatchInfo,
  getRoomAssignedObjectIds,
  getRoomCapacityExpandCost,
  getRoomCostDiscountMultiplier,
  getRoomEffectiveContainmentTier,
  getRoomEquipmentUpgradeCost,
  getRoomStaffExpandCost,
  getRoomUpgradeCost,
} from '../utils/simulation';
import { EmployeeAvatar, ObjectIcon } from './svg/ObjectIcon';

interface RoomInspectorModalProps {
  roomId: RoomId | null;
  gameState: GameState;
  rates: FacilityRates;
  onClose: () => void;
  onUnlockRoom: (roomId: RoomId) => void;
  onUpgradeRoom: (roomId: RoomId) => void;
  onUpgradeRoomEquipment: (roomId: RoomId) => void;
  onExpandObjectCapacity: (roomId: RoomId) => void;
  onExpandStaffCapacity: (roomId: RoomId) => void;
  onTriggerUniqueAction: (roomId: RoomId) => void;
  onManualWorkRoom: (roomId: RoomId) => void;
  onAssignEmployee: (employeeId: string, roomId: RoomId | null) => void;
  onAssignObject: (objectId: string, roomId: RoomId | null) => void;
  onOpenInvestigationBench: (objectId?: string) => void;
}

export const RoomInspectorModal: React.FC<RoomInspectorModalProps> = ({
  roomId,
  gameState,
  rates,
  onClose,
  onUnlockRoom,
  onUpgradeRoom,
  onUpgradeRoomEquipment,
  onExpandObjectCapacity,
  onExpandStaffCapacity,
  onTriggerUniqueAction,
  onManualWorkRoom,
  onAssignEmployee,
  onAssignObject,
  onOpenInvestigationBench,
}) => {
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!roomId) return;
    const id = window.setInterval(() => setNowMs(Date.now()), 500);
    return () => window.clearInterval(id);
  }, [roomId]);

  if (!roomId) return null;

  const def = ROOM_DEFINITIONS[roomId];
  const runtime = gameState.rooms[roomId];
  const roomRate = rates.roomRates[roomId];
  const discountMult = getRoomCostDiscountMultiplier(gameState);
  const effectiveTier = getRoomEffectiveContainmentTier(roomId, runtime, gameState);
  const equipLevel = runtime.equipmentLevel ?? 1;

  const upgradeCost = getRoomUpgradeCost(def, runtime.level, discountMult);
  const canUpgrade =
    runtime.unlocked &&
    runtime.level < def.maxLevel &&
    gameState.resources.funds >= upgradeCost;

  const equipCost = getRoomEquipmentUpgradeCost(def, equipLevel, discountMult);
  const canUpgradeEquip =
    runtime.unlocked && equipLevel < 4 && gameState.resources.funds >= equipCost;

  const objCapCost = getRoomCapacityExpandCost(def, runtime.objectCapacity, discountMult);
  const canExpandObj =
    runtime.unlocked &&
    def.supportsObjectSlot !== 'none' &&
    runtime.objectCapacity < def.maxObjectCapacity &&
    gameState.resources.funds >= objCapCost;

  const staffCapCost = getRoomStaffExpandCost(def, runtime.staffCapacity, discountMult);
  const canExpandStaff =
    runtime.unlocked &&
    runtime.staffCapacity < def.maxStaffCapacity &&
    gameState.resources.funds >= staffCapCost;

  const uniqueCooldownSec = 25;
  const elapsedUniqueSec = Math.floor((nowMs - (runtime.lastUniqueActionAt ?? 0)) / 1000);
  const uniqueRemainingSec = Math.max(0, uniqueCooldownSec - elapsedUniqueSec);

  const hiredStaff = gameState.employees.filter((e) => e.hired);
  const assignedStaff = hiredStaff.filter((e) =>
    runtime.assignedEmployeeIds.includes(e.id)
  );
  const availableStaff = hiredStaff.filter(
    (e) => !runtime.assignedEmployeeIds.includes(e.id)
  );

  const assignedObjIds = getRoomAssignedObjectIds(runtime);
  const assignedObjects = assignedObjIds
    .map((id) => gameState.objects.find((o) => o.id === id))
    .filter((o): o is NonNullable<typeof o> => Boolean(o));

  const candidateObjects = gameState.objects.filter(
    (o) => o.status !== 'locked' && !assignedObjIds.includes(o.id)
  );

  const otherDiscovered = gameState.objects.find(
    (o) => o.status !== 'locked' && !assignedObjIds.includes(o.id)
  );

  const envLabels = def.environmentTypes.map((t) => ENVIRONMENT_LABELS[t]).join(' · ');
  const tutorialStep = gameState.onboarding?.tutorialStep ?? 'completed';
  const highlightManualAction =
    (tutorialStep === 'investigate' && roomId === 'investigation') ||
    (tutorialStep === 'earn_rewards' && roomId === 'reception');
  const highlightUpgradeRoom = tutorialStep === 'expand' && canUpgrade;
  const highlightContainToaster = tutorialStep === 'contain' && roomId === 'containment';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#26211C]/45"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90dvh] bg-[#FAF5EB] border-2 border-[#2D241E] rounded-2xl shadow-[0_8px_0_#2D241E] flex flex-col overflow-hidden animate-modal-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 sm:px-5 py-3.5 sm:py-4 bg-[#FFFDF8] border-b-2 border-[#2D241E] flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#7A6B5C]">
              <span>Floor {def.floor}</span>
              <span>·</span>
              <span className="capitalize">{def.category}</span>
              {runtime.unlocked && (
                <>
                  <span>·</span>
                  <span>Level {runtime.level}/{def.maxLevel}</span>
                  <span>·</span>
                  <span>Gear Lv.{equipLevel}/4</span>
                  {def.supportsObjectSlot !== 'none' && (
                    <>
                      <span>·</span>
                      <span className="text-[#4338CA] font-bold">Tier {effectiveTier}</span>
                    </>
                  )}
                </>
              )}
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#26211C] mt-0.5">
              {def.name}
            </h2>
            <p className="text-xs italic text-[#6E5F50] mt-1">“{def.flavorQuote}”</p>
            {envLabels && (
              <p className="text-[11px] font-semibold text-[#0F766E] mt-1">
                Environment: {envLabels}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close room details"
            className="w-11 h-11 rounded-xl border-2 border-[#2D241E] bg-[#FFFDF8] hover:bg-[#EFE6D5] flex items-center justify-center cursor-pointer shrink-0 active:scale-95 transition-transform"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto warm-scroll p-4 sm:p-5 space-y-5">
          <p className="text-sm text-[#3F362D] leading-relaxed">{def.description}</p>

          {!runtime.unlocked ? (
            <div className="rounded-xl border-2 border-[#2D241E] bg-[#FFFDF8] p-5 text-center space-y-3">
              <Lock className="w-8 h-8 mx-auto text-[#8C6D46]" />
              <div>
                <h3 className="font-display text-lg font-bold text-[#26211C]">
                  Expansion Wing Locked
                </h3>
                <p className="text-xs text-[#5A4D41] mt-1">
                  Requires ${formatCompact(def.unlockCostFunds)} Funds and {def.unlockMinReputation} Reputation to construct.
                </p>
              </div>
              <button
                type="button"
                disabled={
                  gameState.resources.funds < def.unlockCostFunds ||
                  gameState.resources.reputation < def.unlockMinReputation
                }
                onClick={() => onUnlockRoom(roomId)}
                className={`px-5 py-2.5 rounded-xl border-2 border-[#2D241E] font-semibold text-sm transition-all ${
                  gameState.resources.funds >= def.unlockCostFunds &&
                  gameState.resources.reputation >= def.unlockMinReputation
                    ? 'bg-[#0D9488] hover:bg-[#0F766E] text-white cursor-pointer shadow-[0_3px_0_#2D241E]'
                    : 'bg-[#E5DDD0] text-[#7A6D60] cursor-not-allowed'
                }`}
              >
                Construct {def.name} (${formatCompact(def.unlockCostFunds)})
              </button>
            </div>
          ) : (
            <>
              {/* Output + Primary Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border-2 border-[#2D241E] bg-[#FFFDF8] p-3">
                  <p className="text-[11px] font-semibold text-[#7A6B5C]">Room Output</p>
                  <p className="font-mono-num text-sm font-bold text-[#26211C] mt-1">
                    +${roomRate.fundsPerSec.toFixed(1)}/s · +{roomRate.researchPerSec.toFixed(1)} RP/s
                  </p>
                  <p className="font-mono-num text-[11px] text-[#4338CA] mt-0.5">
                    +{roomRate.reputationPerSec.toFixed(2)} Rep/s
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onManualWorkRoom(roomId)}
                  className={`rounded-xl border-2 border-[#2D241E] bg-[#F59E0B] hover:bg-[#D97706] p-3 text-left transition-colors cursor-pointer shadow-[0_3px_0_#2D241E] active:translate-y-0.5 ${
                    highlightManualAction ? 'ring-4 ring-[#F59E0B] ring-offset-2 ring-offset-[#FAF5EB]' : ''
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-display text-sm font-bold text-[#26211C]">
                    <Hand className="w-4 h-4" />
                    <span>
                      {(def.supportsObjectSlot === 'investigation' ||
                        def.supportsObjectSlot === 'hybrid') &&
                      assignedObjects.some((o) => !o.investigated)
                        ? 'Inspect Manually'
                        : 'Assist Operations'}
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-[#3F3116] mt-1">
                    Instant bonus Funds, RP & progress
                  </p>
                </button>

                <button
                  type="button"
                  disabled={uniqueRemainingSec > 0}
                  onClick={() => onTriggerUniqueAction(roomId)}
                  className={`rounded-xl border-2 border-[#2D241E] p-3 text-left transition-colors ${
                    uniqueRemainingSec > 0
                      ? 'bg-[#EDE6D8] text-[#7A6D60] cursor-not-allowed'
                      : 'bg-[#4F46E5] hover:bg-[#4338CA] text-white cursor-pointer shadow-[0_3px_0_#2D241E]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-display text-sm font-bold">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span className="truncate">{def.uniqueActionLabel}</span>
                  </div>
                  <p className="font-mono-num text-[11px] mt-1 opacity-90">
                    {uniqueRemainingSec > 0
                      ? `Recharging (${uniqueRemainingSec}s)`
                      : 'Room Special Action'}
                  </p>
                </button>
              </div>

              <p className="text-xs text-[#5A4D41] bg-[#FFFDF8] border border-[#2D241E]/20 rounded-xl px-3.5 py-2">
                <strong className="text-[#26211C]">{def.uniqueActionLabel}:</strong>{' '}
                {def.uniqueActionDescription}
              </p>

              {/* Room Upgrades & Expansion Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Upgrade Room Level */}
                <button
                  type="button"
                  disabled={!canUpgrade}
                  onClick={() => onUpgradeRoom(roomId)}
                  className={`rounded-xl border-2 border-[#2D241E] p-3 text-left transition-colors ${
                    runtime.level >= def.maxLevel
                      ? 'bg-[#E5EFEA] text-[#0F766E] cursor-default'
                      : canUpgrade
                      ? 'bg-[#0D9488] hover:bg-[#0F766E] text-white cursor-pointer shadow-[0_3px_0_#2D241E]'
                      : 'bg-[#EDE6D8] text-[#7A6D60] cursor-not-allowed'
                  } ${highlightUpgradeRoom ? 'ring-4 ring-[#F59E0B] ring-offset-2 ring-offset-[#FAF5EB]' : ''}`}
                >
                  <div className="flex items-center justify-between gap-2 font-display text-sm font-bold">
                    <span className="inline-flex items-center gap-1.5">
                      <ArrowUpCircle className="w-4 h-4" />
                      <span>
                        {runtime.level >= def.maxLevel
                          ? 'Wing Max Level'
                          : `Upgrade Wing Lv.${runtime.level + 1}`}
                      </span>
                    </span>
                    <span className="font-mono-num text-xs">
                      {runtime.level}/{def.maxLevel}
                    </span>
                  </div>
                  <p className="font-mono-num text-[11px] mt-1">
                    {runtime.level >= def.maxLevel
                      ? 'Full visual & structural tier reached'
                      : `$${formatCompact(upgradeCost)} (+40% base output & visual upgrade)`}
                  </p>
                </button>

                {/* Upgrade Room Equipment */}
                <button
                  type="button"
                  disabled={!canUpgradeEquip}
                  onClick={() => onUpgradeRoomEquipment(roomId)}
                  className={`rounded-xl border-2 border-[#2D241E] p-3 text-left transition-colors ${
                    equipLevel >= 4
                      ? 'bg-[#E5EFEA] text-[#0F766E] cursor-default'
                      : canUpgradeEquip
                      ? 'bg-[#FFFDF8] hover:bg-[#FEF6E4] text-[#26211C] cursor-pointer shadow-[0_3px_0_#2D241E]'
                      : 'bg-[#EDE6D8] text-[#7A6D60] cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 font-display text-sm font-bold">
                    <span className="inline-flex items-center gap-1.5">
                      <Wrench className="w-4 h-4 text-[#B45309]" />
                      <span>
                        {equipLevel >= 4 ? 'Equipment Maxed' : `Upgrade Gear Lv.${equipLevel + 1}`}
                      </span>
                    </span>
                    <span className="font-mono-num text-xs">{equipLevel}/4</span>
                  </div>
                  <p className="font-mono-num text-[11px] mt-1">
                    {equipLevel >= 4
                      ? '+75% equipment efficiency active'
                      : `$${formatCompact(equipCost)} (+25% room/object output & tier)`}
                  </p>
                </button>

                {/* Expand Object Capacity */}
                {def.supportsObjectSlot !== 'none' && (
                  <button
                    type="button"
                    disabled={!canExpandObj}
                    onClick={() => onExpandObjectCapacity(roomId)}
                    className={`rounded-xl border-2 border-[#2D241E] p-3 text-left transition-colors ${
                      runtime.objectCapacity >= def.maxObjectCapacity
                        ? 'bg-[#E5EFEA] text-[#0F766E] cursor-default'
                        : canExpandObj
                        ? 'bg-[#FFFDF8] hover:bg-[#E6F4F2] text-[#26211C] cursor-pointer shadow-[0_3px_0_#2D241E]'
                        : 'bg-[#EDE6D8] text-[#7A6D60] cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 font-display text-sm font-bold">
                      <span className="inline-flex items-center gap-1.5">
                        <PlusSquare className="w-4 h-4 text-[#0D9488]" />
                        <span>
                          {runtime.objectCapacity >= def.maxObjectCapacity
                            ? 'Pedestals Maxed'
                            : 'Expand Object Pedestals'}
                        </span>
                      </span>
                      <span className="font-mono-num text-xs">
                        {runtime.objectCapacity}/{def.maxObjectCapacity}
                      </span>
                    </div>
                    <p className="font-mono-num text-[11px] mt-1">
                      {runtime.objectCapacity >= def.maxObjectCapacity
                        ? 'Maximum simultaneous object slots unlocked'
                        : `$${formatCompact(objCapCost)} (+1 simultaneous object slot)`}
                    </p>
                  </button>
                )}

                {/* Expand Staff Capacity */}
                <button
                  type="button"
                  disabled={!canExpandStaff}
                  onClick={() => onExpandStaffCapacity(roomId)}
                  className={`rounded-xl border-2 border-[#2D241E] p-3 text-left transition-colors ${
                    runtime.staffCapacity >= def.maxStaffCapacity
                      ? 'bg-[#E5EFEA] text-[#0F766E] cursor-default'
                      : canExpandStaff
                      ? 'bg-[#FFFDF8] hover:bg-[#FEF6E4] text-[#26211C] cursor-pointer shadow-[0_3px_0_#2D241E]'
                      : 'bg-[#EDE6D8] text-[#7A6D60] cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 font-display text-sm font-bold">
                    <span className="inline-flex items-center gap-1.5">
                      <UserPlus className="w-4 h-4 text-[#4F46E5]" />
                      <span>
                        {runtime.staffCapacity >= def.maxStaffCapacity
                          ? 'Desks Maxed'
                          : 'Expand Staff Desks'}
                      </span>
                    </span>
                    <span className="font-mono-num text-xs">
                      {runtime.staffCapacity}/{def.maxStaffCapacity}
                    </span>
                  </div>
                  <p className="font-mono-num text-[11px] mt-1">
                    {runtime.staffCapacity >= def.maxStaffCapacity
                      ? 'Maximum specialist capacity reached'
                      : `$${formatCompact(staffCapCost)} (+1 specialist slot)`}
                  </p>
                </button>
              </div>

              {rates.roomCostDiscountPct > 0 && (
                <p className="text-[11px] font-semibold text-[#0F766E]">
                  Engineering Workshop discount active: -{rates.roomCostDiscountPct}% off all room & equipment costs.
                </p>
              )}

              {/* Object Placement Section */}
              {def.supportsObjectSlot !== 'none' && (
                <div className="rounded-xl border-2 border-[#2D241E] bg-[#FFFDF8] p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#0D9488]" />
                      <h3 className="font-display text-base font-bold text-[#26211C]">
                        {def.supportsObjectSlot === 'investigation'
                          ? `Investigation Pedestals (${assignedObjects.length}/${runtime.objectCapacity})`
                          : def.supportsObjectSlot === 'hybrid'
                          ? `Experimental Bays (${assignedObjects.length}/${runtime.objectCapacity})`
                          : `Containment Pedestals (${assignedObjects.length}/${runtime.objectCapacity}) · Tier ${effectiveTier}`}
                      </h3>
                    </div>
                    {(def.supportsObjectSlot === 'investigation' ||
                      def.supportsObjectSlot === 'hybrid') && (
                      <button
                        type="button"
                        onClick={() => onOpenInvestigationBench(assignedObjects[0]?.id)}
                        className="px-2.5 py-1 rounded-lg border border-[#2D241E] bg-[#FEF6E4] hover:bg-[#FDE68A] text-xs font-bold text-[#26211C] cursor-pointer"
                      >
                        Open Investigation Bench
                      </button>
                    )}
                  </div>

                  {assignedObjects.length === 0 ? (
                    <p className="text-xs text-[#6B5E51]">
                      No objects placed here yet. Select a discovered object below to mount it:
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {assignedObjects.map((obj) => {
                        const env = getEnvironmentMatchInfo(obj, roomId);
                        return (
                          <div
                            key={obj.id}
                            className="flex items-center gap-3.5 p-3 rounded-xl bg-[#F5EFE3] border border-[#2D241E]/30"
                          >
                            <ObjectIcon
                              iconKey={obj.iconKey}
                              idleAnimation={obj.idleAnimation}
                              reflectedIconKey={otherDiscovered?.iconKey}
                              className="w-12 h-12 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B5E51]">
                                <span className="font-mono-num font-bold">{obj.code}</span>
                                <span>·</span>
                                <span>{obj.rarity}</span>
                                <span>·</span>
                                <span
                                  className={
                                    env.isMatch ? 'text-[#0F766E] font-bold' : 'text-[#6B5E51]'
                                  }
                                >
                                  {env.label}
                                </span>
                              </div>
                              <p className="font-display text-sm font-bold text-[#26211C]">
                                {obj.name}
                              </p>
                              <p className="text-[11px] text-[#4B4035] mt-0.5">{obj.shortQuirk}</p>
                              {!obj.investigated && (
                                <div className="mt-1.5">
                                  <div className="flex justify-between text-[11px] font-mono-num font-semibold text-[#0F766E]">
                                    <span>Investigation Progress</span>
                                    <span>{Math.floor(obj.investigationProgress)}%</span>
                                  </div>
                                  <div className="h-1.5 rounded-full bg-[#D8CBB8] overflow-hidden mt-0.5">
                                    <div
                                      className="h-full bg-[#0D9488] transition-all"
                                      style={{ width: `${Math.min(100, obj.investigationProgress)}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => onAssignObject(obj.id, null)}
                              className="min-h-[40px] px-3 py-1.5 rounded-lg border border-[#2D241E] bg-[#FFFDF8] hover:bg-[#EFE6D5] text-xs font-semibold text-[#26211C] cursor-pointer shrink-0"
                            >
                              Remove
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {candidateObjects.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <p className="text-xs font-semibold text-[#5A4D41]">
                        {assignedObjects.length >= runtime.objectCapacity
                          ? 'Replace a pedestal slot with:'
                          : 'Place Object Here:'}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {candidateObjects.map((obj) => {
                          const check = canAssignObjectToRoom(obj, roomId, runtime, gameState);
                          const env = getEnvironmentMatchInfo(obj, roomId);
                          return (
                            <button
                              key={obj.id}
                              type="button"
                              disabled={!check.ok}
                              onClick={() => onAssignObject(obj.id, roomId)}
                              className={`flex items-center gap-2.5 p-2 rounded-lg border text-left transition-colors ${
                                check.ok
                                  ? 'border-[#2D241E]/40 bg-[#FAF5EB] hover:bg-[#E6F4F2] cursor-pointer'
                                  : 'border-[#8C7D6B]/40 bg-[#EAE2D3] opacity-65 cursor-not-allowed'
                              } ${
                                highlightContainToaster && obj.id === 'obj_toaster'
                                  ? 'ring-2 ring-[#F59E0B] border-[#2D241E]'
                                  : ''
                              }`}
                            >
                              <ObjectIcon
                                iconKey={obj.iconKey}
                                idleAnimation={obj.idleAnimation}
                                className="w-8 h-8 shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-[#26211C] truncate">
                                  {obj.code} · {obj.name}
                                </p>
                                <p
                                  className={`text-[11px] truncate ${
                                    !check.ok
                                      ? 'text-[#B45309] font-semibold'
                                      : env.isMatch
                                      ? 'text-[#0F766E] font-semibold'
                                      : 'text-[#5A4D41]'
                                  }`}
                                >
                                  {!check.ok
                                    ? check.reason
                                    : env.isMatch
                                    ? env.label
                                    : `${obj.rarity} · Tier ${obj.requiredContainmentTier}`}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Assigned Specialists */}
              <div className="rounded-xl border-2 border-[#2D241E] bg-[#FFFDF8] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-[#B45309]" />
                    <h3 className="font-display text-base font-bold text-[#26211C]">
                      Assigned Specialists ({assignedStaff.length}/{runtime.staffCapacity})
                    </h3>
                  </div>
                </div>

                {assignedStaff.length === 0 ? (
                  <p className="text-xs text-[#6B5E51]">
                    Room is operating on automated timers. Assign an employee to boost output and speed!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {assignedStaff.map((emp) => {
                      const eff = getEffectiveEmployeeStats(gameState, emp);
                      return (
                        <div
                          key={emp.id}
                          className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#F5EFE3] border border-[#2D241E]/30"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <EmployeeAvatar
                              avatarKey={emp.avatarKey}
                              coatColor={emp.coatColor}
                              hairColor={emp.hairColor}
                              skinColor={emp.skinColor}
                              className="w-10 h-10 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#26211C] truncate">
                                {emp.name} · Lv.{emp.level}
                                {emp.specialtyRoom === roomId ? ' · Specialty Match!' : ''}
                              </p>
                              <p className="text-[11px] text-[#5A4D41] truncate">
                                {emp.role} · {Math.round(eff.effectiveProductivity * 100)}% Prod · {emp.currentTask}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onAssignEmployee(emp.id, null)}
                            className="inline-flex items-center gap-1 min-h-[40px] px-3 py-1.5 rounded-lg border border-[#2D241E] bg-[#FFFDF8] hover:bg-[#F3E9D8] text-xs font-semibold cursor-pointer shrink-0"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                            <span>Unassign</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {assignedStaff.length < runtime.staffCapacity && availableStaff.length > 0 && (
                  <div className="pt-1 space-y-1.5">
                    <p className="text-xs font-semibold text-[#5A4D41]">
                      Assign Available Employee:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {availableStaff.map((emp) => (
                        <button
                          key={emp.id}
                          type="button"
                          onClick={() => onAssignEmployee(emp.id, roomId)}
                          className="flex items-center justify-between gap-2 p-2 rounded-lg border border-[#2D241E]/40 bg-[#FAF5EB] hover:bg-[#FEF6E4] text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <EmployeeAvatar
                              avatarKey={emp.avatarKey}
                              coatColor={emp.coatColor}
                              hairColor={emp.hairColor}
                              skinColor={emp.skinColor}
                              className="w-8 h-8 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#26211C] truncate">{emp.name}</p>
                              <p className="text-[11px] text-[#5A4D41] truncate">
                                {emp.assignedRoomId
                                  ? `In ${ROOM_DEFINITIONS[emp.assignedRoomId].name}`
                                  : 'Unassigned'}
                              </p>
                            </div>
                          </div>
                          <UserPlus className="w-4 h-4 text-[#0D9488] shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
