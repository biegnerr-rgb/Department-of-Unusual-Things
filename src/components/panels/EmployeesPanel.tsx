import React, { useEffect, useState } from 'react';
import {
  Activity,
  Award,
  Briefcase,
  Coffee,
  GraduationCap,
  Lock,
  Sparkles,
  UserPlus,
  Wrench,
} from 'lucide-react';
import { ROOM_DEFINITIONS } from '../../data/gameData';
import { EMPLOYEE_CONVERSATIONS } from '../../data/storyData';
import { GameState, RoomId } from '../../types/game';
import {
  FacilityRates,
  formatCompact,
  getEffectiveEmployeeStats,
  getEmployeeDefaultTask,
  getEmployeeTrainCost,
} from '../../utils/simulation';
import { EmployeeAvatar } from '../svg/ObjectIcon';

interface EmployeesPanelProps {
  gameState: GameState;
  rates: FacilityRates;
  onHireEmployee: (employeeId: string) => void;
  onAssignEmployee: (employeeId: string, roomId: RoomId | null) => void;
  onTrainEmployee: (employeeId: string) => void;
  onMotivateEmployee: (employeeId: string) => void;
  onTriggerEmployeeAbility: (employeeId: string) => void;
  onUnlockOrEquipEmployeeGear: (gearId: string, employeeId?: string) => void;
}

export const EmployeesPanel: React.FC<EmployeesPanelProps> = ({
  gameState,
  rates,
  onHireEmployee,
  onAssignEmployee,
  onTrainEmployee,
  onMotivateEmployee,
  onTriggerEmployeeAbility,
  onUnlockOrEquipEmployeeGear,
}) => {
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 500);
    return () => window.clearInterval(id);
  }, []);

  const hired = gameState.employees.filter((e) => e.hired);
  const candidates = gameState.employees.filter((e) => !e.hired);
  const unlockedGear = gameState.employeeEquipment.filter((g) => g.unlocked);

  const unlockedRooms = (Object.keys(ROOM_DEFINITIONS) as RoomId[]).filter(
    (id) => gameState.rooms[id].unlocked
  );

  const formatSecondsAgo = (ts: number) => {
    const diff = Math.max(0, Math.floor((nowMs - ts) / 1000));
    if (diff < 60) return `${diff}s ago`;
    return `${Math.floor(diff / 60)}m ago`;
  };

  return (
    <div className="w-full h-full overflow-y-auto warm-scroll bg-[#F4EFE4] p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header & Department HR Overview */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-[#26211C]">
              Department Personnel & Automation
            </h2>
            <p className="text-sm text-[#5A4D41]">
              Assign specialists to wings so they automatically investigate anomalies, generate research, maintain machines, and level up.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 shrink-0">
            <div className="rounded-xl border-2 border-[#2D241E] bg-[#FFFDF8] px-3 py-2">
              <p className="text-[11px] font-semibold text-[#7A6B5C]">Roster</p>
              <p className="font-mono-num text-sm font-extrabold text-[#26211C]">
                {hired.length}/{gameState.employees.length}
              </p>
            </div>
            <div className="rounded-xl border-2 border-[#2D241E] bg-[#FEF6E4] px-3 py-2">
              <p className="text-[11px] font-semibold text-[#8C6D46]">Staff Payroll</p>
              <p className="font-mono-num text-sm font-extrabold text-[#B45309]">
                -${rates.totalSalaryPerSec.toFixed(2)}/s
              </p>
            </div>
            <div className="rounded-xl border-2 border-[#2D241E] bg-[#E6F4F2] px-3 py-2">
              <p className="text-[11px] font-semibold text-[#0F766E]">Manager Aura</p>
              <p className="font-mono-num text-sm font-extrabold text-[#0F766E]">
                {rates.managerBoostPct > 0 ? `+${rates.managerBoostPct}%` : 'Inactive'}
              </p>
            </div>
          </div>
        </div>

        {/* Live Workplace Activity Log */}
        <section className="rounded-2xl border-2 border-[#2D241E] bg-[#FFFDF8] p-4 shadow-[0_3px_0_#2D241E] space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#0D9488]" />
              <h3 className="font-display text-sm font-bold text-[#26211C]">
                Live Workplace Feed
              </h3>
            </div>
            <span className="text-[11px] font-medium text-[#7A6B5C]">
              Automated specialist actions across active rooms
            </span>
          </div>

          {gameState.employeeActivityLog.length === 0 ? (
            <p className="text-xs text-[#6B5E51]">
              Assigned staff will log automated field notes, machine tune-ups, and discoveries here every few seconds.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {gameState.employeeActivityLog.slice(0, 4).map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-xl border border-[#2D241E]/20 bg-[#FAF5EB] px-3 py-2 flex items-start justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#26211C] truncate">
                      {entry.employeeName}{' '}
                      <span className="font-normal text-[#7A6B5C]">({entry.role})</span>
                    </p>
                    <p className="text-[11px] text-[#4B4035] mt-0.5 line-clamp-1">
                      {entry.text}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {entry.rewardText && (
                      <p className="font-mono-num text-[11px] font-bold text-[#0F766E]">
                        {entry.rewardText}
                      </p>
                    )}
                    <p className="font-mono-num text-[10px] text-[#7A6B5C]">
                      {formatSecondsAgo(entry.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Optional Breakroom Conversations */}
        {(() => {
          const unlockedIds = new Set(gameState.unlockedConversations ?? ['conv_toaster_weather']);
          const unlockedChats = EMPLOYEE_CONVERSATIONS.filter((c) => unlockedIds.has(c.id));
          if (unlockedChats.length === 0) return null;
          return (
            <section className="rounded-2xl border-2 border-[#2D241E] bg-[#EEF2FF]/70 p-4 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-sm font-bold text-[#1E1B4B]">
                  Overheard Breakroom Conversations ({unlockedChats.length}/{EMPLOYEE_CONVERSATIONS.length})
                </h3>
                <span className="text-[11px] font-medium text-[#4338CA]">
                  Optional Dept. 404 chatter — read full archives in Discoveries
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {unlockedChats.slice(-2).map((chat) => (
                  <div
                    key={chat.id}
                    className="rounded-xl border border-[#4338CA]/30 bg-[#FFFDF8] p-3 space-y-1.5"
                  >
                    <p className="text-xs font-bold text-[#1E1B4B]">
                      {chat.title}{' '}
                      <span className="font-normal text-[#6B5E51]">· {chat.roomLabel}</span>
                    </p>
                    <div className="space-y-1">
                      {chat.lines.map((line, i) => (
                        <p key={i} className="text-[11px] text-[#3F362D] leading-snug">
                          <span className="font-bold text-[#0F766E]">{line.speaker}:</span>{' '}
                          “{line.text}”
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })()}

        {/* Active Roster */}
        <section className="space-y-3">
          <h3 className="font-display text-lg font-bold text-[#26211C]">
            Active Staff ({hired.length})
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {hired.map((emp) => {
              const eff = getEffectiveEmployeeStats(gameState, emp);
              const trainCost = getEmployeeTrainCost(emp);
              const canTrain = emp.level < 10 && gameState.resources.funds >= trainCost;
              const motivateElapsed = Math.floor((nowMs - (emp.lastMotivatedAt ?? 0)) / 1000);
              const motivateRemaining = Math.max(0, 20 - motivateElapsed);
              const abilityUnlocked = emp.level >= emp.specialAbility.unlockedAtLevel;
              const abilityElapsed = Math.floor((nowMs - (emp.lastAbilityAt ?? 0)) / 1000);
              const abilityRemaining = Math.max(0, emp.specialAbility.cooldownSec - abilityElapsed);
              const xpPct =
                emp.level >= 10
                  ? 100
                  : Math.min(100, Math.round((emp.experience / Math.max(1, emp.xpToNextLevel)) * 100));
              const liveTask = emp.currentTask || getEmployeeDefaultTask(emp, gameState);

              return (
                <div
                  key={emp.id}
                  className="rounded-2xl border-2 border-[#2D241E] bg-[#FFFDF8] p-4 shadow-[0_4px_0_#2D241E] flex flex-col justify-between gap-3.5"
                >
                  {/* Top identity row */}
                  <div className="flex items-start gap-3.5">
                    <EmployeeAvatar
                      avatarKey={emp.avatarKey}
                      coatColor={emp.coatColor}
                      hairColor={emp.hairColor}
                      skinColor={emp.skinColor}
                      className="w-16 h-16 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <h4 className="font-display text-base font-extrabold text-[#26211C] truncate">
                            {emp.name}
                          </h4>
                          <span className="px-2 py-0.5 rounded-md border border-[#2D241E] bg-[#FEF6E4] font-mono-num text-[11px] font-bold text-[#26211C] shrink-0">
                            Lv.{emp.level}
                          </span>
                        </div>
                        <span className="font-mono-num text-xs font-bold text-[#0F766E]">
                          {Math.round(eff.effectiveProductivity * 100)}% Prod · -$
                          {emp.salaryPerSec.toFixed(2)}/s
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-[#7A6B5C] mt-0.5">
                        {emp.role} · Best in {ROOM_DEFINITIONS[emp.specialtyRoom].name}
                      </p>

                      {/* Current live activity */}
                      <p className="text-xs font-medium text-[#0F766E] mt-1.5 bg-[#E6F4F2] border border-[#0D9488]/30 rounded-lg px-2.5 py-1">
                        Working: {liveTask}
                      </p>

                      {/* XP + Motivation meters */}
                      <div className="grid grid-cols-2 gap-2.5 mt-2">
                        <div>
                          <div className="flex justify-between font-mono-num text-[10px] font-bold text-[#5A4D41]">
                            <span>Experience</span>
                            <span>
                              {emp.level >= 10
                                ? 'MAX'
                                : `${emp.experience}/${emp.xpToNextLevel}`}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-[#E6DEC9] border border-[#2D241E]/30 overflow-hidden mt-0.5">
                            <div
                              className="h-full bg-[#4F46E5] transition-all"
                              style={{ width: `${xpPct}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between font-mono-num text-[10px] font-bold text-[#5A4D41]">
                            <span>Motivation</span>
                            <span>{Math.round(emp.energy)}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-[#E6DEC9] border border-[#2D241E]/30 overflow-hidden mt-0.5">
                            <div
                              className={`h-full transition-all ${
                                emp.energy >= 80
                                  ? 'bg-[#0D9488]'
                                  : emp.energy >= 45
                                  ? 'bg-[#F59E0B]'
                                  : 'bg-[#DC2626]'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(0, emp.energy))}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Personality & Special Ability */}
                  <div className="space-y-2 text-xs">
                    <div className="rounded-xl bg-[#FAF5EB] border border-[#2D241E]/20 px-3 py-2 text-[#4B4035]">
                      <strong className="text-[#26211C]">Personality ({emp.personality}):</strong>{' '}
                      {eff.statusNote}
                    </div>

                    <div className="rounded-xl bg-[#EEF2FF]/70 border border-[#4338CA]/30 px-3 py-2 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-bold text-[#26211C] flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#4F46E5] shrink-0" />
                          <span className="truncate">{emp.specialAbility.name}</span>
                        </p>
                        <p className="text-[11px] text-[#4B4035] mt-0.5">
                          {emp.specialAbility.description}
                        </p>
                      </div>
                      {abilityUnlocked ? (
                        <button
                          type="button"
                          disabled={abilityRemaining > 0 || !emp.assignedRoomId}
                          onClick={() => onTriggerEmployeeAbility(emp.id)}
                          className={`px-3 py-1.5 rounded-lg border-2 border-[#2D241E] font-mono-num text-[11px] font-bold shrink-0 transition-all ${
                            abilityRemaining > 0 || !emp.assignedRoomId
                              ? 'bg-[#E5DDD0] text-[#7A6B5C] cursor-not-allowed'
                              : 'bg-[#4F46E5] hover:bg-[#4338CA] text-white cursor-pointer shadow-[0_2px_0_#2D241E]'
                          }`}
                        >
                          {!emp.assignedRoomId
                            ? 'Assign First'
                            : abilityRemaining > 0
                            ? `${abilityRemaining}s`
                            : 'Activate'}
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#E5DDD0] text-[#6E5F50] font-mono-num text-[11px] font-bold shrink-0">
                          <Lock className="w-3 h-3" />
                          Lv.{emp.specialAbility.unlockedAtLevel}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Controls: Gear, Room Assignment, Motivate, Train */}
                  <div className="pt-2.5 border-t border-[#2D241E]/15 space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <label className="flex flex-col gap-1">
                        <span className="text-[11px] font-semibold text-[#5A4D41] inline-flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          Assigned Wing
                        </span>
                        <select
                          value={emp.assignedRoomId ?? ''}
                          onChange={(e) =>
                            onAssignEmployee(emp.id, (e.target.value || null) as RoomId | null)
                          }
                          className="px-2.5 py-1.5 rounded-lg border-2 border-[#2D241E] bg-[#FAF5EB] text-xs font-semibold text-[#26211C] cursor-pointer"
                        >
                          <option value="">Break Lounge / Unassigned</option>
                          {unlockedRooms.map((rId) => {
                            const runtime = gameState.rooms[rId];
                            const def = ROOM_DEFINITIONS[rId];
                            const isFull =
                              runtime.assignedEmployeeIds.length >= runtime.staffCapacity &&
                              emp.assignedRoomId !== rId;
                            return (
                              <option key={rId} value={rId} disabled={isFull}>
                                {def.name} ({runtime.assignedEmployeeIds.length}/{runtime.staffCapacity})
                                {rId === emp.specialtyRoom ? ' ★' : ''}
                              </option>
                            );
                          })}
                        </select>
                      </label>

                      <label className="flex flex-col gap-1">
                        <span className="text-[11px] font-semibold text-[#5A4D41] inline-flex items-center gap-1">
                          <Wrench className="w-3 h-3" />
                          Equipped Gear
                        </span>
                        <select
                          value={emp.equippedGearId ?? ''}
                          onChange={(e) =>
                            onUnlockOrEquipEmployeeGear(e.target.value, emp.id)
                          }
                          className="px-2.5 py-1.5 rounded-lg border-2 border-[#2D241E] bg-[#FAF5EB] text-xs font-semibold text-[#26211C] cursor-pointer"
                        >
                          <option value="">Standard Issue (None)</option>
                          {unlockedGear.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.name} (+{Math.round(g.productivityBonus * 100)}% Prod)
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={motivateRemaining > 0}
                        onClick={() => onMotivateEmployee(emp.id)}
                        className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border-2 border-[#2D241E] text-xs font-bold transition-all ${
                          motivateRemaining > 0
                            ? 'bg-[#E5DDD0] text-[#7A6B5C] cursor-not-allowed'
                            : 'bg-[#FEF6E4] hover:bg-[#FDE68A] text-[#26211C] cursor-pointer shadow-[0_2px_0_#2D241E]'
                        }`}
                      >
                        <Coffee className="w-3.5 h-3.5 text-[#B45309]" />
                        <span>
                          {motivateRemaining > 0
                            ? `Motivate (${motivateRemaining}s)`
                            : 'Motivate (+Energy/XP)'}
                        </span>
                      </button>

                      <button
                        type="button"
                        disabled={!canTrain}
                        onClick={() => onTrainEmployee(emp.id)}
                        className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border-2 border-[#2D241E] text-xs font-bold font-mono-num transition-all ${
                          emp.level >= 10
                            ? 'bg-[#E5EFEA] text-[#0F766E] cursor-default'
                            : canTrain
                            ? 'bg-[#0D9488] hover:bg-[#0F766E] text-white cursor-pointer shadow-[0_2px_0_#2D241E]'
                            : 'bg-[#E5DDD0] text-[#7A6B5C] cursor-not-allowed'
                        }`}
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>
                          {emp.level >= 10
                            ? 'Mastered (Lv.10)'
                            : `Train ($${formatCompact(trainCost)})`}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Staff Equipment Armory */}
        <section className="space-y-3">
          <div>
            <h3 className="font-display text-lg font-bold text-[#26211C] flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#B45309]" />
              <span>Staff Equipment Locker</span>
            </h3>
            <p className="text-xs text-[#5A4D41]">
              Unlock field gear once to make it equippable across your specialist roster.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {gameState.employeeEquipment.map((gear) => {
              const canUnlock = !gear.unlocked && gameState.resources.funds >= gear.costFunds;
              return (
                <div
                  key={gear.id}
                  className={`rounded-2xl border-2 border-[#2D241E] p-3.5 flex flex-col justify-between gap-3 ${
                    gear.unlocked ? 'bg-[#FFFDF8]' : 'bg-[#FAF5EB]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-display text-sm font-extrabold text-[#26211C]">
                        {gear.name}
                      </h4>
                      {gear.unlocked && (
                        <span className="px-2 py-0.5 rounded bg-[#E6F4F2] border border-[#0D9488] text-[10px] font-bold text-[#0F766E]">
                          Owned
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#4B4035] mt-1">{gear.description}</p>
                    <p className="font-mono-num text-[11px] font-bold text-[#0F766E] mt-1.5">
                      +{Math.round(gear.productivityBonus * 100)}% Prod · +
                      {Math.round(gear.speedBonus * 100)}% Speed · +{gear.xpBonusPct}% XP
                    </p>
                  </div>

                  {!gear.unlocked && (
                    <button
                      type="button"
                      disabled={!canUnlock}
                      onClick={() => onUnlockOrEquipEmployeeGear(gear.id)}
                      className={`w-full py-2 rounded-xl border-2 border-[#2D241E] font-mono-num text-xs font-bold transition-all ${
                        canUnlock
                          ? 'bg-[#F59E0B] hover:bg-[#D97706] text-[#26211C] cursor-pointer shadow-[0_2px_0_#2D241E]'
                          : 'bg-[#E5DDD0] text-[#7A6B5C] cursor-not-allowed'
                      }`}
                    >
                      Unlock Gear (${formatCompact(gear.costFunds)})
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Recruitment Pool */}
        <section className="space-y-3">
          <h3 className="font-display text-lg font-bold text-[#26211C]">
            Specialist Applicants ({candidates.length})
          </h3>
          {candidates.length === 0 ? (
            <div className="rounded-xl border-2 border-[#2D241E] bg-[#FFFDF8] p-5 text-sm text-[#5A4D41] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#0D9488]" />
              <span>All 8 specialist roles have been recruited into the department!</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {candidates.map((emp) => {
                const canAfford = gameState.resources.funds >= emp.hireCostFunds;
                const hasRep = gameState.resources.reputation >= emp.hireMinReputation;
                const canHire = canAfford && hasRep;

                return (
                  <div
                    key={emp.id}
                    className="rounded-2xl border-2 border-[#2D241E] bg-[#FAF5EB] p-4 flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-start gap-3.5">
                      <EmployeeAvatar
                        avatarKey={emp.avatarKey}
                        coatColor={emp.coatColor}
                        hairColor={emp.hairColor}
                        skinColor={emp.skinColor}
                        className="w-14 h-14 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-display text-base font-extrabold text-[#26211C]">
                            {emp.name}
                          </h4>
                          <span className="font-mono-num text-[11px] font-bold text-[#B45309]">
                            -${emp.salaryPerSec.toFixed(2)}/s
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-[#7A6B5C]">
                          {emp.role} · Specialty: {ROOM_DEFINITIONS[emp.specialtyRoom].name}
                        </p>
                        <p className="text-xs text-[#4B4035] mt-1">{emp.bio}</p>
                        <p className="text-[11px] font-semibold text-[#4338CA] mt-1.5">
                          Trait: {emp.personalityNote}
                        </p>
                        <p className="text-[11px] text-[#0F766E] font-semibold mt-1">
                          Ability (Lv.{emp.specialAbility.unlockedAtLevel}): {emp.specialAbility.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#2D241E]/15">
                      <span className="font-mono-num text-xs font-bold text-[#5A4D41]">
                        Hire: ${formatCompact(emp.hireCostFunds)}
                        {emp.hireMinReputation > 0 ? ` · ${emp.hireMinReputation} Rep` : ''}
                      </span>
                      <button
                        type="button"
                        disabled={!canHire}
                        onClick={() => onHireEmployee(emp.id)}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-[#2D241E] text-xs font-bold transition-all ${
                          canHire
                            ? 'bg-[#0D9488] hover:bg-[#0F766E] text-white cursor-pointer shadow-[0_3px_0_#2D241E]'
                            : 'bg-[#E5DDD0] text-[#7A6B5C] cursor-not-allowed'
                        }`}
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Hire Specialist</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
