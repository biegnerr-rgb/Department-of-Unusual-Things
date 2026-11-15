import React from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  FileText,
  FlaskConical,
  HelpCircle,
  Sparkles,
  UserMinus,
  UserPlus,
  Wrench,
  Zap,
} from 'lucide-react';
import { ROOM_DEFINITIONS } from '../../data/gameData';
import { INVESTIGATION_STAGES, RARITY_CONFIG } from '../../data/objectCatalog';
import { GameState, RoomId, UnusualObject } from '../../types/game';
import {
  FacilityRates,
  formatCompact,
  getAccelerateResearchCost,
  getEquippedGear,
  getRoomInvestigationSpeed,
  getStageInfo,
} from '../../utils/simulation';
import { EmployeeAvatar, ObjectIcon } from '../svg/ObjectIcon';

interface InvestigationScreenProps {
  gameState: GameState;
  rates: FacilityRates;
  onBackToDepartment: () => void;
  onSelectObject: (objectId: string) => void;
  onPlaceInInvestigationRoom: (objectId: string, roomId: RoomId) => void;
  onManualInspectObject: (objectId: string) => void;
  onAccelerateWithResearch: (objectId: string) => void;
  onAssignEmployee: (employeeId: string, roomId: RoomId | null) => void;
  onSelectOrUnlockEquipment: (gearId: string) => void;
}

export const InvestigationScreen: React.FC<InvestigationScreenProps> = ({
  gameState,
  rates,
  onBackToDepartment,
  onSelectObject,
  onPlaceInInvestigationRoom,
  onManualInspectObject,
  onAccelerateWithResearch,
  onAssignEmployee,
  onSelectOrUnlockEquipment,
}) => {
  const discovered = gameState.objects.filter((o) => o.status !== 'locked');

  const selectedObj: UnusualObject =
    discovered.find((o) => o.id === gameState.selectedInvestigationObjectId) ??
    discovered.find((o) => !o.investigated) ??
    discovered[0];

  const activeGear = getEquippedGear(gameState);

  const investigationRooms = (Object.keys(ROOM_DEFINITIONS) as RoomId[]).filter(
    (rId) =>
      gameState.rooms[rId].unlocked &&
      (ROOM_DEFINITIONS[rId].supportsObjectSlot === 'investigation' ||
        ROOM_DEFINITIONS[rId].supportsObjectSlot === 'hybrid')
  );

  // Determine which investigation room holds this object (or default to main 'investigation' room)
  const targetRoomId: RoomId =
    selectedObj.assignedRoomId &&
    (ROOM_DEFINITIONS[selectedObj.assignedRoomId].supportsObjectSlot === 'investigation' ||
      ROOM_DEFINITIONS[selectedObj.assignedRoomId].supportsObjectSlot === 'hybrid')
      ? selectedObj.assignedRoomId
      : investigationRooms[0] ?? 'investigation';

  const targetRoomDef = ROOM_DEFINITIONS[targetRoomId];
  const targetRoomRuntime = gameState.rooms[targetRoomId];
  const hiredStaff = gameState.employees.filter((e) => e.hired);
  const assignedStaff = hiredStaff.filter((e) =>
    targetRoomRuntime.assignedEmployeeIds.includes(e.id)
  );
  const availableStaff = hiredStaff.filter(
    (e) => !targetRoomRuntime.assignedEmployeeIds.includes(e.id)
  );

  const stageInfo = getStageInfo(selectedObj.investigationProgress);
  const rpAccelerateCost = getAccelerateResearchCost(selectedObj, gameState);
  const canAccelerate =
    !selectedObj.investigated && gameState.resources.research >= rpAccelerateCost;
  const isPlacedInInvRoom =
    selectedObj.assignedRoomId !== null &&
    (ROOM_DEFINITIONS[selectedObj.assignedRoomId].supportsObjectSlot === 'investigation' ||
      ROOM_DEFINITIONS[selectedObj.assignedRoomId].supportsObjectSlot === 'hybrid');
  const passiveSpeed = isPlacedInInvRoom
    ? getRoomInvestigationSpeed(gameState, targetRoomId, rates)
    : 0;

  const otherDiscovered = discovered.find((o) => o.id !== selectedObj.id);

  return (
    <div className="w-full h-full overflow-y-auto warm-scroll bg-[#F4EFE4] p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-[#26211C]">
              Investigation & Discovery Bench
            </h2>
            <p className="text-sm text-[#5A4D41]">
              Guide curiosities through all 5 stages passively with specialists or actively with equipment and Research Points.
            </p>
          </div>
          <button
            type="button"
            onClick={onBackToDepartment}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#2D241E] bg-[#FFFDF8] hover:bg-[#EFE6D5] text-xs font-bold text-[#26211C] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Building</span>
          </button>
        </div>

        {/* Discovered Object Selector Strip */}
        <div className="flex items-stretch gap-2.5 overflow-x-auto pb-1 warm-scroll">
          {discovered.map((obj) => {
            const isSel = obj.id === selectedObj.id;
            return (
              <button
                key={obj.id}
                type="button"
                onClick={() => onSelectObject(obj.id)}
                className={`min-w-[190px] p-2.5 rounded-xl border-2 text-left flex items-center gap-2.5 transition-all cursor-pointer shrink-0 ${
                  isSel
                    ? 'bg-[#FFFDF8] border-[#2D241E] shadow-[0_3px_0_#0D9488]'
                    : 'bg-[#FAF5EB] border-[#2D241E]/40 hover:bg-[#FFFDF8]'
                }`}
              >
                <ObjectIcon
                  iconKey={obj.iconKey}
                  idleAnimation={obj.idleAnimation}
                  className="w-10 h-10 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-[10px] font-mono-num font-bold text-[#6B5E51]">
                    <span>{obj.code}</span>
                    <span className={obj.investigated ? 'text-[#0F766E]' : 'text-[#B45309]'}>
                      {obj.investigated ? 'Classified' : `${Math.floor(obj.investigationProgress)}%`}
                    </span>
                  </div>
                  <p className="font-display text-xs font-bold text-[#26211C] truncate">
                    {obj.name}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main 2-Column Investigation Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left 7 Columns: Active Bench, 5-Stage Tracker, Staff & Equipment */}
          <div className="lg:col-span-7 space-y-4">
            {/* Object Showcase & Stage Progress Card */}
            <div className="rounded-2xl border-2 border-[#2D241E] bg-[#FFFDF8] p-5 shadow-[0_5px_0_#2D241E] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div
                  className="w-24 h-24 rounded-2xl border-2 flex items-center justify-center shrink-0 mx-auto sm:mx-0"
                  style={{
                    backgroundColor: RARITY_CONFIG[selectedObj.rarity].glowColor,
                    borderColor: RARITY_CONFIG[selectedObj.rarity].frameBorder,
                  }}
                >
                  <ObjectIcon
                    iconKey={selectedObj.iconKey}
                    idleAnimation={selectedObj.idleAnimation}
                    reflectedIconKey={otherDiscovered?.iconKey}
                    className="w-20 h-20"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#6B5E51]">
                    <span className="font-mono-num font-bold text-[#26211C]">
                      {selectedObj.code}
                    </span>
                    <span>·</span>
                    <span style={{ color: RARITY_CONFIG[selectedObj.rarity].badgeText }}>
                      {selectedObj.rarity}
                    </span>
                    <span>·</span>
                    <span>{selectedObj.anomalyClass}</span>
                    {selectedObj.rareVariant && (
                      <>
                        <span>·</span>
                        <span className="text-[#B45309] font-bold">
                          Variant: {selectedObj.rareVariant} (+25%)
                        </span>
                      </>
                    )}
                  </div>

                  <h3 className="font-display text-xl sm:text-2xl font-extrabold text-[#26211C] mt-0.5">
                    {selectedObj.name}
                  </h3>

                  <p className="text-xs text-[#4B4035] mt-1">
                    {isPlacedInInvRoom
                      ? `Actively mounted in ${ROOM_DEFINITIONS[selectedObj.assignedRoomId!].name} (${passiveSpeed.toFixed(2)}x passive speed)`
                      : selectedObj.investigated
                      ? 'All 5 investigation stages complete! Ready for Containment.'
                      : 'Not currently on an Investigation table — assign below for passive progress.'}
                  </p>
                </div>
              </div>

              {/* 5-Stage Process Stepper */}
              <div className="space-y-2.5 pt-2 border-t border-[#2D241E]/15">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#26211C]">
                    Stage {stageInfo.stageNumber} of 5: {stageInfo.stageName}
                  </span>
                  <span className="font-mono-num text-[#0F766E] font-bold">
                    {Math.floor(selectedObj.investigationProgress)}% Overall
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1 sm:gap-1.5">
                  {INVESTIGATION_STAGES.map((st) => {
                    const completed =
                      selectedObj.investigated ||
                      selectedObj.investigationProgress >= st.stageNumber * 20;
                    const active =
                      !selectedObj.investigated &&
                      stageInfo.stageNumber === st.stageNumber;
                    return (
                      <div
                        key={st.stageNumber}
                        className={`rounded-lg border p-1.5 sm:p-2 text-center transition-colors ${
                          completed
                            ? 'bg-[#E5EFEA] border-[#0F766E] text-[#0F766E]'
                            : active
                            ? 'bg-[#FEF6E4] border-[#D97706] text-[#26211C]'
                            : 'bg-[#F5EFE3] border-[#2D241E]/20 text-[#7A6B5C]'
                        }`}
                      >
                        <div className="font-mono-num text-[10px] font-bold">
                          S{st.stageNumber}
                        </div>
                        <div className="text-[9px] sm:text-[10px] font-semibold leading-tight mt-0.5 line-clamp-2 break-words">
                          {st.name}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="h-3 rounded-full bg-[#E5DDD0] border border-[#2D241E]/40 overflow-hidden">
                  <div
                    className="h-full bg-[#0D9488] transition-all duration-150"
                    style={{ width: `${Math.min(100, selectedObj.investigationProgress)}%` }}
                  />
                </div>
                <p className="text-xs text-[#5A4D41]">{stageInfo.description}</p>
              </div>

              {/* Active & Passive Interaction Buttons */}
              <div className="flex flex-wrap gap-2.5 pt-1">
                {!selectedObj.investigated && !isPlacedInInvRoom && (
                  <button
                    type="button"
                    onClick={() => onPlaceInInvestigationRoom(selectedObj.id, targetRoomId)}
                    className="px-4 py-2.5 rounded-xl border-2 border-[#2D241E] bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold cursor-pointer shadow-[0_3px_0_#2D241E]"
                  >
                    Mount in {targetRoomDef.name} (Start Passive)
                  </button>
                )}

                {!selectedObj.investigated && (
                  <>
                    <button
                      type="button"
                      onClick={() => onManualInspectObject(selectedObj.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-[#2D241E] bg-[#F59E0B] hover:bg-[#D97706] text-[#26211C] text-xs font-bold cursor-pointer shadow-[0_3px_0_#2D241E] active:translate-y-0.5"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Run Active Step (+Progress & +RP)</span>
                    </button>

                    <button
                      type="button"
                      disabled={!canAccelerate}
                      onClick={() => onAccelerateWithResearch(selectedObj.id)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-[#2D241E] text-xs font-bold transition-all ${
                        canAccelerate
                          ? 'bg-[#4F46E5] hover:bg-[#4338CA] text-white cursor-pointer shadow-[0_3px_0_#2D241E]'
                          : 'bg-[#E5DDD0] text-[#7A6D60] cursor-not-allowed'
                      }`}
                    >
                      <Zap className="w-4 h-4" />
                      <span>Accelerate Stage (-{rpAccelerateCost} RP)</span>
                    </button>
                  </>
                )}

                {selectedObj.investigated && (
                  <div className="w-full rounded-xl bg-[#E5EFEA] border border-[#0F766E]/40 px-3.5 py-2.5 flex items-center gap-2 text-xs font-semibold text-[#0F766E]">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      Final classification complete! Move this object to a Containment Bay for maximum output.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Investigation Equipment Selection */}
            <div className="rounded-2xl border-2 border-[#2D241E] bg-[#FFFDF8] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-[#B45309]" />
                  <h3 className="font-display text-base font-bold text-[#26211C]">
                    Investigation Equipment
                  </h3>
                </div>
                <span className="text-xs font-semibold text-[#0F766E]">
                  Active: {activeGear.name}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {gameState.investigationEquipment.map((eq) => {
                  const isEquipped = gameState.equippedInvestigationGearId === eq.id;
                  const canBuy = !eq.unlocked && gameState.resources.funds >= eq.costFunds;

                  return (
                    <button
                      key={eq.id}
                      type="button"
                      disabled={!eq.unlocked && !canBuy}
                      onClick={() => onSelectOrUnlockEquipment(eq.id)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        isEquipped
                          ? 'bg-[#E6F4F2] border-[#0D9488] cursor-default'
                          : eq.unlocked
                          ? 'bg-[#FAF5EB] border-[#2D241E] hover:bg-[#FEF6E4] cursor-pointer'
                          : canBuy
                          ? 'bg-[#FFFDF8] border-[#2D241E] hover:bg-[#FEF6E4] cursor-pointer'
                          : 'bg-[#EAE2D3] border-[#8C7D6B] opacity-75 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display text-xs font-bold text-[#26211C]">
                          {eq.name}
                        </span>
                        <span className="font-mono-num text-[11px] font-bold text-[#0F766E]">
                          {isEquipped
                            ? 'Equipped'
                            : eq.unlocked
                            ? 'Equip'
                            : `$${formatCompact(eq.costFunds)}`}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5A4D41] mt-1">{eq.description}</p>
                      <p className="font-mono-num text-[10px] font-semibold text-[#B45309] mt-1">
                        +{eq.speedBonusPct}% Speed · +{eq.rpYieldBonusPct}% RP · {eq.unexpectedChancePct}% Unexpected Chance
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Employee Assignment for Investigation Wing */}
            <div className="rounded-2xl border-2 border-[#2D241E] bg-[#FFFDF8] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-[#0D9488]" />
                  <h3 className="font-display text-base font-bold text-[#26211C]">
                    {targetRoomDef.name} Specialists ({assignedStaff.length}/{targetRoomRuntime.staffCapacity})
                  </h3>
                </div>
              </div>

              {assignedStaff.length > 0 && (
                <div className="space-y-2">
                  {assignedStaff.map((emp) => (
                    <div
                      key={emp.id}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#F5EFE3] border border-[#2D241E]/25"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <EmployeeAvatar
                          avatarKey={emp.avatarKey}
                          coatColor={emp.coatColor}
                          hairColor={emp.hairColor}
                          skinColor={emp.skinColor}
                          className="w-9 h-9 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#26211C] truncate">{emp.name}</p>
                          <p className="text-[11px] text-[#5A4D41] truncate">
                            +{Math.round(emp.speedBonus * 100)}% Investigation Speed
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onAssignEmployee(emp.id, null)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#2D241E] bg-[#FFFDF8] text-xs font-semibold cursor-pointer"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {assignedStaff.length < targetRoomRuntime.staffCapacity && availableStaff.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableStaff.map((emp) => (
                    <button
                      key={emp.id}
                      type="button"
                      onClick={() => onAssignEmployee(emp.id, targetRoomId)}
                      className="flex items-center justify-between gap-2 p-2 rounded-lg border border-[#2D241E]/40 bg-[#FAF5EB] hover:bg-[#E6F4F2] text-left cursor-pointer"
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
              )}
            </div>
          </div>

          {/* Right 5 Columns: Known/Unknown Properties & Investigation Reports */}
          <div className="lg:col-span-5 space-y-4">
            {/* Known & Hidden Properties */}
            <div className="rounded-2xl border-2 border-[#2D241E] bg-[#FFFDF8] p-4 shadow-[0_4px_0_#2D241E] space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#B45309]" />
                <h3 className="font-display text-base font-bold text-[#26211C]">
                  Known & Hidden Properties
                </h3>
              </div>

              <div className="rounded-xl bg-[#FAF5EB] border border-[#2D241E]/25 p-3 space-y-1.5 text-xs text-[#3F362D]">
                <p>
                  <span className="font-bold text-[#26211C]">Known Quirk: </span>
                  {selectedObj.shortQuirk}
                </p>
                <p>
                  <span className="font-bold text-[#26211C]">Primary Ability: </span>
                  {selectedObj.specialAbility.name}
                </p>
                <p>
                  <span className="font-bold text-[#26211C]">Containment Req: </span>
                  {selectedObj.containmentRequirement}
                </p>
              </div>

              {/* Hidden Properties */}
              <div className="space-y-2">
                {selectedObj.hiddenProperties.map((hp) => (
                  <div
                    key={hp.id}
                    className={`rounded-xl border p-3 text-xs ${
                      hp.revealed
                        ? 'bg-[#E5EFEA] border-[#0F766E]/45 text-[#134E4A]'
                        : 'bg-[#EAE2D3] border-dashed border-[#7A6B5C] text-[#6B5E51]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 font-bold">
                      <span className="inline-flex items-center gap-1.5">
                        {hp.revealed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E]" />
                        ) : (
                          <HelpCircle className="w-3.5 h-3.5" />
                        )}
                        <span>{hp.revealed ? hp.label : 'Unknown Hidden Property'}</span>
                      </span>
                      <span className="font-mono-num text-[10px]">
                        {hp.revealed ? 'Revealed' : `Stage ${hp.unlockAtStage}`}
                      </span>
                    </div>
                    <p className="mt-1 leading-relaxed">
                      {hp.revealed
                        ? hp.detail
                        : `Complete Stage ${hp.unlockAtStage} (${
                            INVESTIGATION_STAGES[hp.unlockAtStage - 1]?.name
                          }) to uncover this hidden property.`}
                    </p>
                  </div>
                ))}

                {/* Secondary Hidden Ability */}
                <div
                  className={`rounded-xl border p-3 text-xs ${
                    selectedObj.secondaryAbilityUnlocked
                      ? 'bg-[#FEF6E4] border-[#D97706] text-[#26211C]'
                      : 'bg-[#EAE2D3] border-dashed border-[#7A6B5C] text-[#6B5E51]'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>
                      {selectedObj.secondaryAbilityUnlocked
                        ? `Hidden Ability: ${selectedObj.secondaryAbilityName}`
                        : 'Hidden Secondary Ability (???)'}
                    </span>
                    <span className="font-mono-num text-[10px]">
                      {selectedObj.secondaryAbilityUnlocked ? '+15% Output' : 'Stage 4'}
                    </span>
                  </div>
                  <p className="mt-1 leading-relaxed">
                    {selectedObj.secondaryAbilityUnlocked
                      ? selectedObj.secondaryAbilityDescription
                      : 'Unlocks during Research Analysis (Stage 4).'}
                  </p>
                </div>
              </div>
            </div>

            {/* Investigation Reports Log */}
            <div className="rounded-2xl border-2 border-[#2D241E] bg-[#FFFDF8] p-4 shadow-[0_4px_0_#2D241E] space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#2563EB]" />
                <h3 className="font-display text-base font-bold text-[#26211C]">
                  Investigation Reports ({selectedObj.investigationReports.length})
                </h3>
              </div>

              {selectedObj.investigationReports.length === 0 ? (
                <p className="text-xs text-[#6B5E51] py-3">
                  No stage reports logged yet. Run an active step or mount the object in an Investigation room to begin Stage 1!
                </p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto warm-scroll pr-1">
                  {selectedObj.investigationReports.map((rep) => (
                    <div
                      key={rep.id}
                      className={`rounded-xl border p-3 text-xs ${
                        rep.isUnexpected
                          ? 'bg-[#FEF3C7] border-[#D97706]'
                          : 'bg-[#FAF5EB] border-[#2D241E]/25'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 font-bold text-[#26211C]">
                        <span>
                          {rep.isUnexpected
                            ? 'Unexpected Discovery!'
                            : `Stage ${rep.stageNumber}: ${rep.stageName}`}
                        </span>
                        {rep.rewardText && (
                          <span className="font-mono-num text-[10px] text-[#0F766E]">
                            {rep.rewardText}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[#4B4035] leading-relaxed">{rep.summary}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
