import React from 'react';
import { ArrowUpCircle, Building2, Hammer, PlusSquare, UserPlus, Wrench } from 'lucide-react';
import { FLOOR_3_UNLOCK_COST, ROOM_DEFINITIONS } from '../../data/gameData';
import { GameState, RoomId } from '../../types/game';
import {
  FacilityRates,
  formatCompact,
  getRoomCapacityExpandCost,
  getRoomCostDiscountMultiplier,
  getRoomEffectiveContainmentTier,
  getRoomEquipmentUpgradeCost,
  getRoomStaffExpandCost,
  getRoomUpgradeCost,
  getUpgradeNextCost,
} from '../../utils/simulation';

interface UpgradesPanelProps {
  gameState: GameState;
  rates: FacilityRates;
  onPurchaseUpgrade: (upgradeId: string) => void;
  onUpgradeRoom: (roomId: RoomId) => void;
  onUpgradeRoomEquipment: (roomId: RoomId) => void;
  onExpandObjectCapacity: (roomId: RoomId) => void;
  onExpandStaffCapacity: (roomId: RoomId) => void;
  onUnlockRoom: (roomId: RoomId) => void;
  onUnlockFloor3: () => void;
}

export const UpgradesPanel: React.FC<UpgradesPanelProps> = ({
  gameState,
  rates,
  onPurchaseUpgrade,
  onUpgradeRoom,
  onUpgradeRoomEquipment,
  onExpandObjectCapacity,
  onExpandStaffCapacity,
  onUnlockRoom,
  onUnlockFloor3,
}) => {
  const stage = gameState.onboarding?.progressionStage ?? 6;
  const tutorialStep = gameState.onboarding?.tutorialStep ?? 'completed';

  const STAGE_3_UPGRADES = new Set(['upg_ergonomic_chairs', 'upg_espresso_beans']);
  const STAGE_4_UPGRADES = new Set([
    'upg_modular_racks',
    'upg_courier_contract',
    'upg_night_shift_loggers',
  ]);

  const visibleUpgrades = gameState.upgrades.filter((upg) => {
    if (upg.purchasedCount > 0) return true;
    if (STAGE_4_UPGRADES.has(upg.id)) return stage >= 4;
    if (STAGE_3_UPGRADES.has(upg.id)) return stage >= 3;
    return true;
  });

  const roomList = (Object.keys(ROOM_DEFINITIONS) as RoomId[]).filter((rId) => {
    const runtime = gameState.rooms[rId];
    if (runtime.unlocked) return true;
    const def = ROOM_DEFINITIONS[rId];
    if (def.floor === 3) return stage >= 5 || gameState.floor3Unlocked;
    if (rId === 'research_desk' || rId === 'archive_vault' || rId === 'anomaly_workshop') {
      return stage >= 3;
    }
    return true;
  });

  const discountMult = getRoomCostDiscountMultiplier(gameState);
  const canExcavateFloor3 =
    !gameState.floor3Unlocked &&
    gameState.resources.funds >= FLOOR_3_UNLOCK_COST.funds &&
    gameState.resources.reputation >= FLOOR_3_UNLOCK_COST.reputation;

  return (
    <div className="w-full h-full overflow-y-auto warm-scroll bg-[#F4EFE4] p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-[#26211C]">
              Facility & Economy Upgrades
            </h2>
            <p className="text-sm text-[#5A4D41]">
              {stage < 3
                ? 'Start with affordable pneumatic tubes, warm lamps, and room upgrades to grow your budget.'
                : 'Balance department upgrades, room hardware, object storage capacity, courier frequency, and overnight offline efficiency.'}
            </p>
          </div>
          {rates.roomCostDiscountPct > 0 && (
            <span className="px-3 py-1.5 rounded-xl border-2 border-[#2D241E] bg-[#E5EFEA] text-xs font-bold text-[#0F766E]">
              Engineering Workshop: -{rates.roomCostDiscountPct}% Room Costs
            </span>
          )}
        </div>

        {/* Economy Multipliers Breakdown (Stage 3+) */}
        {stage >= 3 && (
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-xl border-2 border-[#2D241E] bg-[#FFFDF8] p-3">
              <p className="text-[11px] font-semibold text-[#7A6B5C]">Gov. Funding (Rep)</p>
              <p className="font-mono-num text-sm font-extrabold text-[#4338CA] mt-0.5">
                +{rates.repFundingBonusPct}% Grant Bonus
              </p>
            </div>
            <div className="rounded-xl border-2 border-[#2D241E] bg-[#FFFDF8] p-3">
              <p className="text-[11px] font-semibold text-[#7A6B5C]">Active Yield Multipliers</p>
              <p className="font-mono-num text-sm font-extrabold text-[#0F766E] mt-0.5">
                {rates.totalFundsMultiplier.toFixed(2)}x $ · {rates.totalResearchMultiplier.toFixed(2)}x RP
              </p>
            </div>
            <div className="rounded-xl border-2 border-[#2D241E] bg-[#FFFDF8] p-3">
              <p className="text-[11px] font-semibold text-[#7A6B5C]">Offline Shift Capacity</p>
              <p className="font-mono-num text-sm font-extrabold text-[#26211C] mt-0.5">
                {Math.round(rates.offlineCapSec / 3600)}h Max @ {Math.round(rates.offlineEfficiency * 100)}%
              </p>
            </div>
            <div className="rounded-xl border-2 border-[#2D241E] bg-[#FEF6E4] p-3">
              <p className="text-[11px] font-semibold text-[#8C6D46]">Temporary Event Surge</p>
              <p className="text-xs font-bold text-[#26211C] mt-0.5 truncate">
                {rates.activeBoostLabel ?? 'Standard Operations'}
              </p>
            </div>
          </section>
        )}

        {/* Department Equipment Upgrades */}
        <section className="space-y-3">
          <h3 className="font-display text-lg font-bold text-[#26211C]">
            Department Economy & Efficiency Upgrades
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleUpgrades.map((upg, idx) => {
              const isMax = upg.purchasedCount >= upg.maxPurchases;
              const nextCost = getUpgradeNextCost(upg.costFunds, upg.purchasedCount);
              const canAfford = !isMax && gameState.resources.funds >= nextCost;
              const highlightUpg = tutorialStep === 'expand' && canAfford && idx === 0;

              return (
                <div
                  key={upg.id}
                  className="rounded-2xl border-2 border-[#2D241E] bg-[#FFFDF8] p-4 shadow-[0_4px_0_#2D241E] flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-[#0F766E]">
                        {upg.upgradeTag ?? 'Department'}
                      </span>
                      <span className="font-mono-num text-xs font-bold text-[#5A4D41]">
                        Lv.{upg.purchasedCount}/{upg.maxPurchases}
                      </span>
                    </div>
                    <h4 className="font-display text-base font-extrabold text-[#26211C] mt-0.5">
                      {upg.name}
                    </h4>
                    <p className="text-xs text-[#4B4035] mt-1 leading-relaxed">
                      {upg.description}
                    </p>
                    <p className="text-xs font-semibold text-[#B45309] mt-1.5">
                      {upg.effectLabel}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#2D241E]/15">
                    <span className="font-mono-num text-xs font-bold text-[#26211C]">
                      {isMax ? 'Maxed Out' : `$${formatCompact(nextCost)}`}
                    </span>
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => onPurchaseUpgrade(upg.id)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-[#2D241E] text-xs font-bold transition-all whitespace-nowrap ${
                        isMax
                          ? 'bg-[#E5EFEA] text-[#0F766E] cursor-default'
                          : canAfford
                          ? 'bg-[#F59E0B] hover:bg-[#D97706] text-[#26211C] cursor-pointer shadow-[0_3px_0_#2D241E]'
                          : 'bg-[#E5DDD0] text-[#7A6B5C] cursor-not-allowed'
                      } ${highlightUpg ? 'ring-4 ring-[#F59E0B] ring-offset-2 ring-offset-[#FFFDF8]' : ''}`}
                    >
                      <ArrowUpCircle className="w-4 h-4" />
                      <span>{isMax ? 'Maxed' : 'Upgrade'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Floor 3 Excavation (Stage 5+) */}
        {!gameState.floor3Unlocked && (stage >= 5 || gameState.resources.reputation >= 16) && (
          <section className="rounded-2xl border-2 border-[#2D241E] bg-[#FEF6E4] p-4 shadow-[0_4px_0_#2D241E] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl border-2 border-[#2D241E] bg-[#F59E0B] flex items-center justify-center shrink-0">
                <Hammer className="w-5 h-5 text-[#26211C]" />
              </div>
              <div>
                <h3 className="font-display text-base font-extrabold text-[#26211C]">
                  Floor 3 Excavation (Sub-Level B2)
                </h3>
                <p className="text-xs text-[#5A4D41]">
                  Unlocks Experimental Wing, Deep Storage (Tier 3), and Reality Division (Tier 3).
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={!canExcavateFloor3}
              onClick={onUnlockFloor3}
              className={`px-4 py-2.5 rounded-xl border-2 border-[#2D241E] text-xs font-bold shrink-0 ${
                canExcavateFloor3
                  ? 'bg-[#0D9488] hover:bg-[#0F766E] text-white cursor-pointer shadow-[0_3px_0_#2D241E]'
                  : 'bg-[#E5DDD0] text-[#7A6B5C] cursor-not-allowed'
              }`}
            >
              Excavate (${formatCompact(FLOOR_3_UNLOCK_COST.funds)} · {FLOOR_3_UNLOCK_COST.reputation} Rep)
            </button>
          </section>
        )}

        {/* Wing Expansions, Equipment & Capacity */}
        <section className="space-y-3">
          <h3 className="font-display text-lg font-bold text-[#26211C]">
            Room Expansion, Equipment & Capacity
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {roomList.map((rId) => {
              const def = ROOM_DEFINITIONS[rId];
              const runtime = gameState.rooms[rId];
              const floorLocked = def.floor === 3 && !gameState.floor3Unlocked;

              if (!runtime.unlocked) {
                const canUnlock =
                  !floorLocked &&
                  gameState.resources.funds >= def.unlockCostFunds &&
                  gameState.resources.reputation >= def.unlockMinReputation;

                return (
                  <div
                    key={rId}
                    className="rounded-xl border-2 border-dashed border-[#2D241E] bg-[#FAF5EB] p-4 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#7A6B5C]">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>
                          Floor {def.floor} · {floorLocked ? 'Requires Floor 3 Excavation' : 'Locked Wing'}
                        </span>
                      </div>
                      <h4 className="font-display text-base font-bold text-[#26211C] mt-1">
                        {def.name}
                      </h4>
                      <p className="text-xs text-[#5A4D41] mt-1">{def.description}</p>
                    </div>
                    <button
                      type="button"
                      disabled={!canUnlock}
                      onClick={() => onUnlockRoom(rId)}
                      className={`w-full py-2 px-3 rounded-xl border-2 border-[#2D241E] text-xs font-bold ${
                        canUnlock
                          ? 'bg-[#0D9488] hover:bg-[#0F766E] text-white cursor-pointer'
                          : 'bg-[#E5DDD0] text-[#7A6B5C] cursor-not-allowed'
                      }`}
                    >
                      {floorLocked
                        ? 'Excavate Floor 3 First'
                        : `Build ($${formatCompact(def.unlockCostFunds)} · ${def.unlockMinReputation} Rep)`}
                    </button>
                  </div>
                );
              }

              const isMaxLv = runtime.level >= def.maxLevel;
              const lvCost = getRoomUpgradeCost(def, runtime.level, discountMult);
              const canUpgradeLv = !isMaxLv && gameState.resources.funds >= lvCost;

              const eqLv = runtime.equipmentLevel ?? 1;
              const isMaxEq = eqLv >= 4;
              const eqCost = getRoomEquipmentUpgradeCost(def, eqLv, discountMult);
              const canUpgradeEq = !isMaxEq && gameState.resources.funds >= eqCost;

              const isMaxObj =
                def.supportsObjectSlot === 'none' || runtime.objectCapacity >= def.maxObjectCapacity;
              const objCost = getRoomCapacityExpandCost(def, runtime.objectCapacity, discountMult);
              const canExpandObj = !isMaxObj && gameState.resources.funds >= objCost;

              const isMaxStaff = runtime.staffCapacity >= def.maxStaffCapacity;
              const staffCost = getRoomStaffExpandCost(def, runtime.staffCapacity, discountMult);
              const canExpandStaff = !isMaxStaff && gameState.resources.funds >= staffCost;

              const tier = getRoomEffectiveContainmentTier(rId, runtime, gameState);

              return (
                <div
                  key={rId}
                  className="rounded-xl border-2 border-[#2D241E] bg-[#FFFDF8] p-4 flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-[#7A6B5C]">
                      <span>
                        Floor {def.floor}
                        {def.supportsObjectSlot !== 'none' ? ` · Tier ${tier}` : ''}
                      </span>
                      <span className="font-mono-num text-[#0F766E]">
                        Lv.{runtime.level}/{def.maxLevel} · Gear {eqLv}/4
                      </span>
                    </div>
                    <h4 className="font-display text-base font-bold text-[#26211C] mt-0.5">
                      {def.name}
                    </h4>
                    <p className="text-[11px] text-[#5A4D41] mt-1">
                      Capacity: {runtime.staffCapacity}/{def.maxStaffCapacity} Staff
                      {def.supportsObjectSlot !== 'none'
                        ? ` · ${runtime.objectCapacity}/${def.maxObjectCapacity} Objects`
                        : ''}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <button
                      type="button"
                      disabled={!canUpgradeLv}
                      onClick={() => onUpgradeRoom(rId)}
                      className={`w-full py-1.5 px-3 rounded-lg border-2 border-[#2D241E] text-xs font-bold flex items-center justify-between ${
                        isMaxLv
                          ? 'bg-[#E5EFEA] text-[#0F766E] cursor-default'
                          : canUpgradeLv
                          ? 'bg-[#F59E0B] hover:bg-[#D97706] text-[#26211C] cursor-pointer'
                          : 'bg-[#E5DDD0] text-[#7A6B5C] cursor-not-allowed'
                      }`}
                    >
                      <span>{isMaxLv ? 'Room Max Level' : `Room Lv.${runtime.level + 1}`}</span>
                      <span className="font-mono-num">
                        {isMaxLv ? 'Max' : `$${formatCompact(lvCost)}`}
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={!canUpgradeEq}
                      onClick={() => onUpgradeRoomEquipment(rId)}
                      className={`w-full py-1.5 px-3 rounded-lg border border-[#2D241E] text-xs font-semibold flex items-center justify-between ${
                        isMaxEq
                          ? 'bg-[#E5EFEA] text-[#0F766E] cursor-default'
                          : canUpgradeEq
                          ? 'bg-[#FAF5EB] hover:bg-[#FEF6E4] text-[#26211C] cursor-pointer'
                          : 'bg-[#EAE2D3] text-[#7A6B5C] cursor-not-allowed'
                      }`}
                    >
                      <span className="inline-flex items-center gap-1">
                        <Wrench className="w-3.5 h-3.5 text-[#B45309]" />
                        <span>{isMaxEq ? 'Gear Maxed' : `Gear Lv.${eqLv + 1} (+25%)`}</span>
                      </span>
                      <span className="font-mono-num">
                        {isMaxEq ? 'Max' : `$${formatCompact(eqCost)}`}
                      </span>
                    </button>

                    <div className="grid grid-cols-2 gap-1.5">
                      {def.supportsObjectSlot !== 'none' && (
                        <button
                          type="button"
                          disabled={!canExpandObj}
                          onClick={() => onExpandObjectCapacity(rId)}
                          className={`py-1.5 px-2 rounded-lg border border-[#2D241E] text-[11px] font-semibold flex items-center justify-between gap-1 ${
                            isMaxObj
                              ? 'bg-[#E5EFEA] text-[#0F766E] cursor-default'
                              : canExpandObj
                              ? 'bg-[#FAF5EB] hover:bg-[#E6F4F2] text-[#26211C] cursor-pointer'
                              : 'bg-[#EAE2D3] text-[#7A6B5C] cursor-not-allowed'
                          }`}
                        >
                          <span className="inline-flex items-center gap-1 truncate">
                            <PlusSquare className="w-3 h-3 shrink-0" />
                            <span>+1 Obj</span>
                          </span>
                          <span className="font-mono-num shrink-0">
                            {isMaxObj ? 'Max' : `$${formatCompact(objCost)}`}
                          </span>
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={!canExpandStaff}
                        onClick={() => onExpandStaffCapacity(rId)}
                        className={`py-1.5 px-2 rounded-lg border border-[#2D241E] text-[11px] font-semibold flex items-center justify-between gap-1 ${
                          def.supportsObjectSlot === 'none' ? 'col-span-2' : ''
                        } ${
                          isMaxStaff
                            ? 'bg-[#E5EFEA] text-[#0F766E] cursor-default'
                            : canExpandStaff
                            ? 'bg-[#FAF5EB] hover:bg-[#EEF2FF] text-[#26211C] cursor-pointer'
                            : 'bg-[#EAE2D3] text-[#7A6B5C] cursor-not-allowed'
                        }`}
                      >
                        <span className="inline-flex items-center gap-1 truncate">
                          <UserPlus className="w-3 h-3 shrink-0" />
                          <span>+1 Staff</span>
                        </span>
                        <span className="font-mono-num shrink-0">
                          {isMaxStaff ? 'Max' : `$${formatCompact(staffCost)}`}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
