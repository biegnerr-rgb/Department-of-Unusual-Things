import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BottomNavBar } from './components/BottomNavBar';
import { BuildingView } from './components/BuildingView';
import { GuidanceStrip } from './components/GuidanceStrip';
import { NotificationArea } from './components/NotificationArea';
import { DiscoveriesPanel, DiscoveriesSubTab } from './components/panels/DiscoveriesPanel';
import { EmployeesPanel } from './components/panels/EmployeesPanel';
import { InvestigationScreen } from './components/panels/InvestigationScreen';
import { ObjectsPanel } from './components/panels/ObjectsPanel';
import { ResearchPanel } from './components/panels/ResearchPanel';
import { UpgradesPanel } from './components/panels/UpgradesPanel';
import { OfflineReportModal } from './components/OfflineReportModal';
import { RoomInspectorModal } from './components/RoomInspectorModal';
import { SettingsModal } from './components/SettingsModal';
import { TitleScreen } from './components/TitleScreen';
import { TopResourceBar } from './components/TopResourceBar';
import {
  formatEventMessage,
  pickEligibleRandomEvent,
  RANDOM_EVENTS_CATALOG,
} from './data/eventsData';
import {
  createInitialGameState,
  FLOOR_3_UNLOCK_COST,
  ROOM_DEFINITIONS,
} from './data/gameData';
import { RARITY_CONFIG } from './data/objectCatalog';
import {
  DEFAULT_ONBOARDING_STATE,
  evaluateOnboardingProgression,
  getUnlockedTabsForStage,
  ONBOARDING_OBJECTIVES,
} from './data/onboardingData';
import {
  canEnterNextOperationalEra,
  hasPrestigeTech,
} from './data/researchTreeData';
import {
  evaluateClassifiedProjectEligibility,
  INITIAL_ARCHIVED_DOCUMENTS,
  INITIAL_CLASSIFIED_PROJECTS,
  INITIAL_SECRET_ROOMS,
  STRANGE_MESSAGE_POOL,
} from './data/storyData';
import {
  ActiveEconomicBoost,
  EmployeeActivityEntry,
  FloatingFeedback,
  GameNotification,
  GameScreen,
  GameSettings,
  GameState,
  NavTab,
  NotificationChoice,
  OfflineReport,
  OnboardingState,
  ProgressionStage,
  RoomId,
  TutorialStepId,
} from './types/game';
import { soundFX } from './utils/audio';
import {
  calculateFacilityRates,
  canAssignObjectToRoom,
  evaluateDiscoveryMilestones,
  getAccelerateResearchCost,
  getEffectiveEmployeeStats,
  getEffectiveResearchCost,
  getEmployeeDefaultTask,
  getEmployeeTrainCost,
  getEquippedGear,
  getRoomAssignedObjectIds,
  getRoomCapacityExpandCost,
  getRoomCostDiscountMultiplier,
  getRoomEquipmentUpgradeCost,
  getRoomInvestigationSpeed,
  getRoomStaffExpandCost,
  getRoomUpgradeCost,
  getUpgradeNextCost,
  grantEmployeeExperience,
  isResearched,
  resolveInvestigationTransition,
} from './utils/simulation';
import {
  clearSaveData,
  exportSaveJson,
  getBackupSaveTimestamp,
  hasSavedGame,
  loadGameState,
  parseImportedSave,
  restoreBackupSave,
  saveGameState,
} from './utils/storage';

function finishTutorialState(
  prev: GameState,
  now: number
): OnboardingState {
  const base = prev.onboarding ?? DEFAULT_ONBOARDING_STATE;
  return {
    ...base,
    tutorialStep: 'completed',
    tutorialCompleted: true,
    progressionStage: Math.max(2, base.progressionStage) as ProgressionStage,
    replayMode: false,
  };
}

function getTutorialHighlightTarget(step: TutorialStepId): string | null {
  switch (step) {
    case 'welcome':
      return 'investigation_room';
    case 'investigate':
      return 'inspect_action';
    case 'contain':
      return 'containment_room';
    case 'earn_rewards':
      return 'reception_bell';
    case 'expand':
      return 'upgrades_action';
    default:
      return null;
  }
}

export default function App() {
  const [hasSave, setHasSave] = useState<boolean>(() => hasSavedGame());
  const [screen, setScreen] = useState<GameScreen>('TITLE');
  const [activeTab, setActiveTab] = useState<NavTab>('department');
  const [discoveriesSubTab, setDiscoveriesSubTab] = useState<DiscoveriesSubTab>('milestones');
  const [investigationOpen, setInvestigationOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<RoomId | null>(null);
  const [eventsDrawerOpen, setEventsDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [feedbacks, setFeedbacks] = useState<FloatingFeedback[]>([]);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [lastAbilityMessage, setLastAbilityMessage] = useState<{
    objectId: string;
    text: string;
  } | null>(null);
  const [lastExplorationResult, setLastExplorationResult] = useState<string | null>(null);
  const [saveFeedbackMsg, setSaveFeedbackMsg] = useState<string | null>(null);
  const [recentUpgradedRoomId, setRecentUpgradedRoomId] = useState<RoomId | null>(null);

  const [initialBoot] = useState(() => loadGameState());
  const [offlineReport, setOfflineReport] = useState<OfflineReport | null>(
    () => initialBoot.offlineReport
  );

  const [gameState, setGameState] = useState<GameState>(() => {
    let initial = initialBoot.state;
    const bootNotifs: GameNotification[] = [];
    if (initialBoot.recoveredFromBackup) {
      bootNotifs.push({
        id: `backup_recovered_${Date.now()}`,
        kind: 'milestone',
        category: 'neutral',
        title: 'Save Recovered From Automatic Backup',
        message:
          'Primary browser storage appeared damaged or incomplete, so Department 404 automatically restored your latest verified backup.',
        timestamp: Date.now(),
        read: false,
        resolved: true,
        resolvedText: 'Verified save restored cleanly.',
      });
    }
    if (initialBoot.offlineReport) {
      const rep = initialBoot.offlineReport;
      bootNotifs.push({
        id: `offline_${Date.now()}`,
        kind: 'milestone',
        title: 'Facility Kept Humming While Away',
        message: `Staff worked ${Math.max(
          1,
          Math.round(rep.effectiveSecondsSimulated / 60)
        )} min (+$${Math.round(rep.fundsGenerated)}, +${Math.round(
          rep.researchGenerated
        )} RP, +${rep.samplesGenerated.toFixed(1)} Samples).`,
        timestamp: Date.now(),
        read: false,
        resolved: true,
        resolvedText: 'Offline earnings added directly to Department balances.',
      });
    }
    if (bootNotifs.length > 0) {
      initial = {
        ...initial,
        notifications: [...bootNotifs, ...initial.notifications].slice(0, 20),
      };
    }
    soundFX.setEnabled(initial.settings.soundEnabled);
    return initial;
  });

  const stateRef = useRef(gameState);
  stateRef.current = gameState;
  const saveToastTimerRef = useRef<number | null>(null);
  const roomFxTimerRef = useRef<number | null>(null);

  const triggerSaveToast = useCallback((msg: string) => {
    setSaveFeedbackMsg(msg);
    if (saveToastTimerRef.current) {
      window.clearTimeout(saveToastTimerRef.current);
    }
    saveToastTimerRef.current = window.setTimeout(() => {
      setSaveFeedbackMsg(null);
    }, 2400);
  }, []);

  const triggerRoomUpgradeFX = useCallback((roomId: RoomId) => {
    setRecentUpgradedRoomId(roomId);
    if (roomFxTimerRef.current) {
      window.clearTimeout(roomFxTimerRef.current);
    }
    roomFxTimerRef.current = window.setTimeout(() => {
      setRecentUpgradedRoomId(null);
    }, 900);
  }, []);

  const pushFeedback = useCallback(
    (roomId: RoomId, text: string, tone: FloatingFeedback['tone']) => {
      const id = `fb_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      setFeedbacks((prev) => [...prev.slice(-10), { id, roomId, text, tone }]);
      window.setTimeout(() => {
        setFeedbacks((prev) => prev.filter((item) => item.id !== id));
      }, 1150);
    },
    []
  );

  useEffect(() => {
    soundFX.setEnabled(gameState.settings.soundEnabled);
  }, [gameState.settings.soundEnabled]);

  // Simulation Loop
  useEffect(() => {
    if (screen !== 'PLAYING') return;

    let lastTick = Date.now();
    const timer = window.setInterval(() => {
      const current = Date.now();
      setNowMs(current);
      const rawDt = (current - lastTick) / 1000;
      lastTick = current;
      const dt = Math.min(Math.max(rawDt, 0), 1.0);

      setGameState((prev) => {
        if (prev.settings.paused) return prev;
        const simDt = dt * prev.settings.simulationSpeed;
        const rates = calculateFacilityRates(prev, current);
        const gear = getEquippedGear(prev);
        const liveBoosts = (prev.activeBoosts ?? []).filter((b) => b.expiresAt > current);

        const gainedFunds = rates.fundsPerSec * simDt;
        const gainedResearch = rates.researchPerSec * simDt;
        const gainedRep = rates.reputationPerSec * simDt;
        const gainedSamples = rates.samplesPerSec * simDt;

        let nextObjects = prev.objects;
        let bonusFundsFromInv = 0;
        let bonusResearchFromInv = 0;
        let bonusRepFromInv = 0;
        let bonusSamplesFromInv = 0;
        let completedInvestigations = 0;
        const newlyCompletedNotifs: GameNotification[] = [];

        const investigatingRooms = (Object.keys(ROOM_DEFINITIONS) as RoomId[]).filter((rId) => {
          const def = ROOM_DEFINITIONS[rId];
          const rt = prev.rooms[rId];
          return (
            rt.unlocked &&
            (def.supportsObjectSlot === 'investigation' || def.supportsObjectSlot === 'hybrid') &&
            getRoomAssignedObjectIds(rt).length > 0
          );
        });

        if (investigatingRooms.length > 0) {
          nextObjects = prev.objects.map((obj) => {
            const roomId = investigatingRooms.find((rId) =>
              getRoomAssignedObjectIds(prev.rooms[rId]).includes(obj.id)
            );
            if (!roomId || obj.investigated) return obj;

            const speed = getRoomInvestigationSpeed(prev, roomId, rates);
            const deltaPct = (100 / obj.investigationDurationSec) * speed * simDt;
            const res = resolveInvestigationTransition(
              obj,
              obj.investigationProgress + deltaPct,
              gear,
              current,
              prev
            );

            bonusFundsFromInv += res.bonusFunds;
            bonusResearchFromInv += res.bonusResearch;
            bonusRepFromInv += res.bonusReputation;

            if (res.unexpectedHeadline) {
              newlyCompletedNotifs.push({
                id: `unexp_${obj.id}_${current}`,
                kind: 'discovery',
                title: 'Unexpected Investigation Finding!',
                message: res.unexpectedHeadline,
                timestamp: current,
                read: false,
                resolved: true,
                resolvedText: 'Logged into Investigation Reports.',
              });
            }

            if (res.completedNow) {
              completedInvestigations += 1;
              bonusSamplesFromInv += 1;
              newlyCompletedNotifs.push({
                id: `inv_${obj.id}_${current}`,
                kind: 'discovery',
                title: `Classification Complete: ${obj.code}`,
                message: `${obj.name} (${obj.rarity}) finished Stage 5! Hidden ability "${obj.secondaryAbilityName}" unlocked (+1 Sample).`,
                timestamp: current,
                read: false,
                resolved: true,
                resolvedText: `Dossier filed (+${res.bonusReputation} Rep, +${res.bonusResearch} RP, +1 Sample).`,
              });
              soundFX.discovery();
            }

            return res.updatedObject;
          });
        }

        let nextRooms = prev.rooms;
        if (!prev.rooms.reception.bonusReady && Math.random() < 0.04 * simDt) {
          nextRooms = {
            ...prev.rooms,
            reception: { ...prev.rooms.reception, bonusReady: true },
          };
        }

        // Employee Automation Engine
        let empFundsDelta = 0;
        let empRpDelta = 0;
        let empRepDelta = 0;
        let empInvDelta = 0;
        let teamEnergyBoost = 0;
        let teamXpBoost = 0;
        const newEmpLogs: EmployeeActivityEntry[] = [];
        const discoveredCount = nextObjects.filter((o) => o.status !== 'locked').length;

        let nextEmployees = prev.employees.map((emp) => {
          if (!emp.hired || !emp.assignedRoomId) return emp;

          // Stagger fresh hires/loads instead of firing immediately at t=0
          if (!emp.lastActionAt) {
            return { ...emp, lastActionAt: current - 4500 };
          }

          const eff = getEffectiveEmployeeStats(prev, emp);
          const intervalMs = Math.max(
            6800,
            Math.round(13500 / (Math.max(0.4, eff.effectiveSpeed) * prev.settings.simulationSpeed))
          );

          if (current - emp.lastActionAt < intervalMs) {
            return emp;
          }

          let actionText = getEmployeeDefaultTask(emp, prev);
          let rewardText = '+8 XP';
          const roomObjs = getRoomAssignedObjectIds(prev.rooms[emp.assignedRoomId])
            .map((id) => nextObjects.find((o) => o.id === id))
            .filter((o): o is NonNullable<typeof o> => Boolean(o));

          switch (emp.role) {
            case 'Junior Investigator': {
              const target =
                roomObjs.find((o) => !o.investigated) ??
                nextObjects.find((o) => !o.investigated && o.status === 'investigating');
              const curiousRp = emp.personality === 'Curious' ? 3 : 0;
              const rp = Math.round((4 + curiousRp) * eff.effectiveProductivity);
              empRpDelta += rp;
              if (target) {
                const progPct = emp.personality === 'Curious' ? 5.5 : 4;
                nextObjects = nextObjects.map((o) => {
                  if (o.id !== target.id) return o;
                  const res = resolveInvestigationTransition(
                    o,
                    o.investigationProgress + progPct,
                    gear,
                    current,
                    prev
                  );
                  empFundsDelta += res.bonusFunds;
                  empRpDelta += res.bonusResearch;
                  empRepDelta += res.bonusReputation;
                  if (res.completedNow) {
                    empInvDelta += 1;
                    bonusSamplesFromInv += 1;
                  }
                  return res.updatedObject;
                });
                actionText = `Auto-investigated ${target.code} (${target.name})`;
                rewardText = `+${Math.round(progPct)}% · +${rp} RP`;
              } else {
                actionText = `Filed routine field observation notes`;
                rewardText = `+${rp} RP`;
              }
              break;
            }

            case 'Research Scientist': {
              const overconfidentSpike =
                emp.personality === 'Overconfident' && Math.random() < 0.28;
              const rp = Math.round(
                (overconfidentSpike ? 16 : 8) * eff.effectiveProductivity
              );
              empRpDelta += rp;
              actionText = overconfidentSpike
                ? 'Overconfident oscilloscope leap paid off!'
                : 'Synthesized steady anomaly waveforms';
              rewardText = overconfidentSpike ? `+${rp} RP (!)` : `+${rp} RP`;
              break;
            }

            case 'Containment Specialist': {
              const f = Math.round(14 * eff.effectiveProductivity);
              const rep = 0.5;
              empFundsDelta += f;
              empRepDelta += rep;
              actionText = `Stabilized velvet pedestals in ${ROOM_DEFINITIONS[emp.assignedRoomId].name}`;
              rewardText = `+$${f} · +0.5 Rep`;
              break;
            }

            case 'Engineer': {
              const inventiveSurge = emp.personality === 'Inventive' && Math.random() < 0.35;
              const f = Math.round((inventiveSurge ? 26 : 18) * eff.effectiveProductivity);
              const rp = inventiveSurge ? 8 : 5;
              empFundsDelta += f;
              empRpDelta += rp;
              actionText = inventiveSurge
                ? 'Invented brass coil bypass on workshop machinery'
                : 'Serviced pneumatic pumps & gear housings';
              rewardText = `+$${f} · +${rp} RP`;
              break;
            }

            case 'Archivist': {
              const rp = Math.round(
                (5 + discoveredCount * 1.1) * eff.effectiveProductivity
              );
              empRpDelta += rp;
              empRepDelta += 0.4;
              actionText = `Cross-referenced ${discoveredCount} archived object dossiers`;
              rewardText = `+${rp} RP`;
              break;
            }

            case 'Security Officer': {
              const f = Math.round(12 * eff.effectiveProductivity);
              empFundsDelta += f;
              empRepDelta += 0.6;
              teamEnergyBoost += 2;
              actionText = 'Completed corridor patrol & calmed uneasy staff';
              rewardText = `+$${f} · +Team Energy`;
              break;
            }

            case 'Experimental Technician': {
              const target =
                roomObjs.find((o) => !o.investigated) ??
                nextObjects.find((o) => !o.investigated && o.status === 'investigating');
              const rp = Math.round(7 * eff.effectiveProductivity);
              empRpDelta += rp;
              if (target) {
                nextObjects = nextObjects.map((o) => {
                  if (o.id !== target.id) return o;
                  const res = resolveInvestigationTransition(
                    o,
                    o.investigationProgress + 3.5,
                    gear,
                    current,
                    prev
                  );
                  empFundsDelta += res.bonusFunds;
                  empRpDelta += res.bonusResearch;
                  empRepDelta += res.bonusReputation;
                  if (res.completedNow) {
                    empInvDelta += 1;
                    bonusSamplesFromInv += 1;
                  }
                  return res.updatedObject;
                });
                actionText = `Pulsed test array on ${target.code}`;
              } else {
                actionText = 'Calibrated experimental safety condensers';
              }
              rewardText = `+${rp} RP`;
              break;
            }

            case 'Department Manager': {
              const f = Math.round(20 * eff.effectiveProductivity);
              empFundsDelta += f;
              empRepDelta += 1;
              teamEnergyBoost += 2;
              teamXpBoost += 2;
              actionText = 'Hosted shift briefing boosting department output';
              rewardText = `+$${f} · +1 Rep`;
              break;
            }
          }

          const xpGain = grantEmployeeExperience(emp, 9, prev);
          if (xpGain.leveledUp) {
            soundFX.discovery();
            newlyCompletedNotifs.push({
              id: `emplv_${emp.id}_${current}`,
              kind: 'milestone',
              title: `${emp.name} Reached Lv.${xpGain.employee.level}!`,
              message: `${emp.name} (${emp.role}) leveled up and improved department productivity!`,
              timestamp: current,
              read: false,
              resolved: true,
              resolvedText: `Productivity boosted to ${Math.round(xpGain.employee.productivity * 100)}%.`,
            });
          }

          newEmpLogs.push({
            id: `log_${emp.id}_${current}_${Math.random().toString(36).slice(2, 5)}`,
            employeeId: emp.id,
            employeeName: emp.name,
            role: emp.role,
            roomId: emp.assignedRoomId,
            text: actionText,
            rewardText,
            timestamp: current,
          });

          return {
            ...xpGain.employee,
            energy: Math.max(40, Math.min(100, xpGain.employee.energy - 1)),
            currentTask: actionText,
            lastActionAt: current,
          };
        });

        if (teamEnergyBoost > 0 || teamXpBoost > 0) {
          nextEmployees = nextEmployees.map((emp) => {
            if (!emp.hired) return emp;
            const withEnergy = {
              ...emp,
              energy: Math.min(100, emp.energy + teamEnergyBoost),
            };
            if (teamXpBoost > 0) {
              return grantEmployeeExperience(withEnergy, teamXpBoost, prev).employee;
            }
            return withEnergy;
          });
        }

        if (isResearched(prev, 'res_emp_morale')) {
          nextEmployees = nextEmployees.map((emp) =>
            emp.hired ? { ...emp, energy: Math.min(100, emp.energy + 0.5 * simDt) } : emp
          );
        }

        // Research-Unlocked Automation: Auto-Investigate Intake Objects
        if (prev.automationSettings?.autoInvestigate && isResearched(prev, 'res_auto_investigations')) {
          const invSlots: RoomId[] = (['investigation', 'break_lounge'] as RoomId[]).filter(
            (rId) => {
              const rt = nextRooms[rId];
              return (
                rt?.unlocked &&
                getRoomAssignedObjectIds(rt).length < rt.objectCapacity
              );
            }
          );

          if (invSlots.length > 0) {
            const roomCopy = { ...nextRooms };
            let modified = false;
            nextObjects = nextObjects.map((o) => {
              if (o.status !== 'intake' || o.investigated || o.assignedRoomId !== null) return o;
              const openRoomId = invSlots.find(
                (rId) => getRoomAssignedObjectIds(roomCopy[rId]).length < roomCopy[rId].objectCapacity
              );
              if (!openRoomId) return o;
              const curIds = getRoomAssignedObjectIds(roomCopy[openRoomId]);
              const nextIds = [...curIds, o.id];
              roomCopy[openRoomId] = {
                ...roomCopy[openRoomId],
                assignedObjectIds: nextIds,
                assignedObjectId: nextIds[0] ?? null,
              };
              modified = true;
              return {
                ...o,
                assignedRoomId: openRoomId,
                status: 'investigating' as const,
              };
            });
            if (modified) {
              nextRooms = roomCopy;
            }
          }
        }

        // Research-Unlocked Automation: Auto-Assign Idle Staff
        if (prev.automationSettings?.autoAssignStaff && isResearched(prev, 'res_auto_staff')) {
          const idleStaff = nextEmployees.filter((e) => e.hired && e.assignedRoomId === null);
          if (idleStaff.length > 0) {
            const roomCopy = { ...nextRooms };
            let staffAssigned = false;
            nextEmployees = nextEmployees.map((emp) => {
              if (!emp.hired || emp.assignedRoomId !== null) return emp;
              const specRt = roomCopy[emp.specialtyRoom];
              let targetRoom: RoomId | null = null;
              if (specRt.unlocked && specRt.assignedEmployeeIds.length < specRt.staffCapacity) {
                targetRoom = emp.specialtyRoom;
              } else {
                targetRoom =
                  (Object.keys(ROOM_DEFINITIONS) as RoomId[]).find(
                    (rId) =>
                      roomCopy[rId].unlocked &&
                      roomCopy[rId].assignedEmployeeIds.length < roomCopy[rId].staffCapacity
                  ) ?? null;
              }
              if (!targetRoom) return emp;
              roomCopy[targetRoom] = {
                ...roomCopy[targetRoom],
                assignedEmployeeIds: [...roomCopy[targetRoom].assignedEmployeeIds, emp.id],
              };
              staffAssigned = true;
              const updatedEmp = { ...emp, assignedRoomId: targetRoom };
              return {
                ...updatedEmp,
                currentTask: getEmployeeDefaultTask(updatedEmp, {
                  ...prev,
                  rooms: roomCopy,
                }),
              };
            });
            if (staffAssigned) {
              nextRooms = roomCopy;
            }
          }
        }

        let nextNotifs = [...newlyCompletedNotifs, ...prev.notifications];
        let nextEventAt = prev.nextEventAt;
        let nextEventCooldowns = prev.eventCooldowns ?? {};
        let nextEventCategoryHistory = prev.eventCategoryHistory ?? {
          positive: 0,
          negative: 0,
          neutral: 0,
          rare: 0,
          secret: 0,
        };
        const unresolvedCount = nextNotifs.filter((n) => !n.resolved).length;

        if (current >= prev.nextEventAt && unresolvedCount < 2) {
          const picked = pickEligibleRandomEvent(prev, current);
          if (picked) {
            nextNotifs = [
              {
                id: `evt_${picked.id}_${current}`,
                eventId: picked.id,
                category: picked.category,
                kind: picked.kind,
                title: picked.title,
                message: formatEventMessage(picked.message, prev),
                timestamp: current,
                read: false,
                resolved: false,
                choices: picked.choices,
              },
              ...nextNotifs,
            ];
            nextEventCooldowns = {
              ...nextEventCooldowns,
              [picked.id]: current + picked.cooldownSec * 1000,
            };
            nextEventCategoryHistory = {
              ...nextEventCategoryHistory,
              [picked.category]: (nextEventCategoryHistory[picked.category] ?? 0) + 1,
            };
            if (picked.category === 'rare' || picked.category === 'secret') {
              soundFX.discovery();
            } else {
              soundFX.pneumatic();
            }
          }
          nextEventAt =
            current +
            Math.round(
              (42_000 + Math.floor(Math.random() * 24_000)) * rates.deliveryIntervalMult
            );
        }

        const totalFundsGainThisTick = gainedFunds + bonusFundsFromInv + empFundsDelta;
        const totalRpGainThisTick = gainedResearch + bonusResearchFromInv + empRpDelta;
        const totalSamplesGainThisTick = gainedSamples + bonusSamplesFromInv;

        const updated: GameState = {
          ...prev,
          resources: {
            funds: Math.max(0, prev.resources.funds + totalFundsGainThisTick),
            research: prev.resources.research + totalRpGainThisTick,
            reputation: prev.resources.reputation + gainedRep + bonusRepFromInv + empRepDelta,
            samples: (prev.resources.samples ?? 0) + totalSamplesGainThisTick,
          },
          totalFundsEarned: prev.totalFundsEarned + Math.max(0, totalFundsGainThisTick),
          totalResearchEarned: prev.totalResearchEarned + totalRpGainThisTick,
          totalSamplesEarned: (prev.totalSamplesEarned ?? 0) + totalSamplesGainThisTick,
          totalInvestigationsCompleted:
            prev.totalInvestigationsCompleted + completedInvestigations + empInvDelta,
          activeBoosts: liveBoosts,
          eventCooldowns: nextEventCooldowns,
          eventCategoryHistory: nextEventCategoryHistory,
          rooms: nextRooms,
          objects: nextObjects,
          employees: nextEmployees,
          employeeActivityLog:
            newEmpLogs.length > 0
              ? [...newEmpLogs, ...prev.employeeActivityLog].slice(0, 14)
              : prev.employeeActivityLog,
          notifications: nextNotifs.slice(0, 20),
          nextEventAt,
        };

        let nextOnboarding = updated.onboarding;
        let tickRooms = updated.rooms;
        if (
          nextOnboarding?.tutorialStep === 'investigate' &&
          updated.objects.some((o) => o.id === 'obj_toaster' && o.investigated)
        ) {
          tickRooms = {
            ...tickRooms,
            containment: { ...tickRooms.containment, unlocked: true },
          };
          nextOnboarding = {
            ...nextOnboarding,
            tutorialStep: 'contain',
          };
        }

        return evaluateOnboardingProgression(
          evaluateDiscoveryMilestones({
            ...updated,
            rooms: tickRooms,
            onboarding: nextOnboarding,
          })
        );
      });
    }, 250);

    return () => window.clearInterval(timer);
  }, [screen]);

  // Auto-save & instant mobile/tab-close flush
  useEffect(() => {
    if (screen !== 'PLAYING') return;
    const saver = window.setInterval(() => {
      if (saveGameState(stateRef.current)) {
        setHasSave(true);
      }
    }, 5000);

    const flushSave = () => {
      saveGameState(stateRef.current);
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        flushSave();
      }
    };

    window.addEventListener('pagehide', flushSave);
    window.addEventListener('beforeunload', flushSave);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.clearInterval(saver);
      window.removeEventListener('pagehide', flushSave);
      window.removeEventListener('beforeunload', flushSave);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [screen]);

  const commitState = useCallback((updater: (prev: GameState) => GameState) => {
    setGameState((prev) => {
      const next = evaluateOnboardingProgression(
        evaluateDiscoveryMilestones(updater(prev))
      );
      saveGameState(next);
      setHasSave(true);
      return next;
    });
  }, []);

  const rates = useMemo(() => calculateFacilityRates(gameState, nowMs), [gameState, nowMs]);

  const handleStartContinue = useCallback(() => {
    soundFX.click();
    setScreen('PLAYING');
  }, []);

  const handleStartNew = useCallback(() => {
    soundFX.click();
    const fresh = clearSaveData();
    saveGameState(fresh);
    setGameState(fresh);
    setOfflineReport(null);
    setHasSave(true);
    setActiveTab('department');
    setInvestigationOpen(false);
    setScreen('PLAYING');
  }, []);

  const handleManualInspectObject = useCallback(
    (objectId: string) => {
      const mult = rates.clickPowerMultiplier;
      const rpGain = Math.round(4 * mult);
      const baseProgGain = Math.round(10 * mult);
      soundFX.collect();

      commitState((prev) => {
        const gear = getEquippedGear(prev);
        const now = Date.now();
        const isTutorialInspect =
          prev.onboarding?.tutorialStep === 'investigate' && objectId === 'obj_toaster';
        const progGain = isTutorialInspect ? Math.max(baseProgGain, 50) : baseProgGain;

        let bonusFunds = 0;
        let bonusRp = 0;
        let bonusRep = 0;
        let completedDelta = 0;
        const extraNotifs: GameNotification[] = [];

        const nextObjects = prev.objects.map((o) => {
          if (o.id !== objectId || o.investigated || o.status === 'locked') return o;
          const res = resolveInvestigationTransition(
            o,
            o.investigationProgress + progGain,
            gear,
            now,
            prev
          );
          bonusFunds += res.bonusFunds;
          bonusRp += res.bonusResearch;
          bonusRep += res.bonusReputation;
          if (res.completedNow) {
            completedDelta = 1;
            soundFX.discovery();
          }
          if (res.unexpectedHeadline) {
            extraNotifs.push({
              id: `man_unexp_${o.id}_${now}`,
              kind: 'discovery',
              title: 'Unexpected Investigation Finding!',
              message: res.unexpectedHeadline,
              timestamp: now,
              read: false,
              resolved: true,
              resolvedText: 'Logged into Investigation Reports.',
            });
          }
          return res.updatedObject;
        });

        const toasterDone = nextObjects.some((o) => o.id === 'obj_toaster' && o.investigated);
        let nextRooms = prev.rooms;
        let nextOnboarding = prev.onboarding;
        if (prev.onboarding?.tutorialStep === 'investigate' && toasterDone) {
          nextRooms = {
            ...prev.rooms,
            containment: { ...prev.rooms.containment, unlocked: true },
          };
          nextOnboarding = {
            ...prev.onboarding,
            tutorialStep: 'contain',
          };
        }

        return {
          ...prev,
          rooms: nextRooms,
          onboarding: nextOnboarding,
          resources: {
            ...prev.resources,
            funds: prev.resources.funds + bonusFunds,
            research: prev.resources.research + rpGain + bonusRp,
            reputation: prev.resources.reputation + bonusRep,
            samples: (prev.resources.samples ?? 0) + completedDelta,
          },
          totalFundsEarned: prev.totalFundsEarned + bonusFunds,
          totalResearchEarned: prev.totalResearchEarned + rpGain + bonusRp,
          totalSamplesEarned: (prev.totalSamplesEarned ?? 0) + completedDelta,
          totalInvestigationsCompleted: prev.totalInvestigationsCompleted + completedDelta,
          objects: nextObjects,
          notifications: [...extraNotifs, ...prev.notifications].slice(0, 20),
        };
      });
    },
    [commitState, rates.clickPowerMultiplier]
  );

  const handleAccelerateWithResearch = useCallback(
    (objectId: string) => {
      commitState((prev) => {
        const obj = prev.objects.find((o) => o.id === objectId);
        if (!obj || obj.investigated || obj.status === 'locked') return prev;
        const cost = getAccelerateResearchCost(obj, prev);
        if (prev.resources.research < cost) return prev;

        soundFX.upgrade();
        const gear = getEquippedGear(prev);
        const now = Date.now();
        const res = resolveInvestigationTransition(
          obj,
          obj.investigationProgress + 20,
          gear,
          now,
          prev
        );

        const extraNotifs: GameNotification[] = [];
        if (res.unexpectedHeadline) {
          extraNotifs.push({
            id: `acc_unexp_${obj.id}_${now}`,
            kind: 'discovery',
            title: 'Unexpected Investigation Finding!',
            message: res.unexpectedHeadline,
            timestamp: now,
            read: false,
            resolved: true,
            resolvedText: 'Logged into Investigation Reports.',
          });
        }
        if (res.completedNow) {
          soundFX.discovery();
        }

        const sampleBonus = res.completedNow ? 1 : 0;
        return {
          ...prev,
          resources: {
            ...prev.resources,
            funds: prev.resources.funds + res.bonusFunds,
            research: prev.resources.research - cost + res.bonusResearch,
            reputation: prev.resources.reputation + res.bonusReputation,
            samples: (prev.resources.samples ?? 0) + sampleBonus,
          },
          totalFundsEarned: prev.totalFundsEarned + res.bonusFunds,
          totalResearchEarned: prev.totalResearchEarned + res.bonusResearch,
          totalSamplesEarned: (prev.totalSamplesEarned ?? 0) + sampleBonus,
          totalInvestigationsCompleted:
            prev.totalInvestigationsCompleted + (res.completedNow ? 1 : 0),
          objects: prev.objects.map((o) => (o.id === objectId ? res.updatedObject : o)),
          notifications: [...extraNotifs, ...prev.notifications].slice(0, 20),
        };
      });
    },
    [commitState]
  );

  const handleSelectOrUnlockEquipment = useCallback(
    (gearId: string) => {
      commitState((prev) => {
        const eq = prev.investigationEquipment.find((g) => g.id === gearId);
        if (!eq) return prev;
        if (eq.unlocked) {
          soundFX.click();
          return { ...prev, equippedInvestigationGearId: gearId };
        }
        if (prev.resources.funds < eq.costFunds) return prev;
        soundFX.upgrade();
        return {
          ...prev,
          resources: {
            ...prev.resources,
            funds: prev.resources.funds - eq.costFunds,
          },
          equippedInvestigationGearId: gearId,
          investigationEquipment: prev.investigationEquipment.map((g) =>
            g.id === gearId ? { ...g, unlocked: true } : g
          ),
        };
      });
    },
    [commitState]
  );

  const handleManualWorkRoom = useCallback(
    (roomId: RoomId) => {
      const mult = rates.clickPowerMultiplier;
      const def = ROOM_DEFINITIONS[roomId];
      const runtime = gameState.rooms[roomId];
      if (!runtime.unlocked) return;

      if (roomId === 'reception') {
        soundFX.bell();
        const payout = Math.round((16 + runtime.level * 10) * mult);
        pushFeedback(roomId, `+$${payout}`, 'funds');
        commitState((prev) => ({
          ...prev,
          resources: { ...prev.resources, funds: prev.resources.funds + payout },
          totalFundsEarned: prev.totalFundsEarned + payout,
          rooms: {
            ...prev.rooms,
            reception: { ...prev.rooms.reception, bonusReady: false },
          },
          onboarding:
            prev.onboarding?.tutorialStep === 'earn_rewards'
              ? { ...prev.onboarding, tutorialStep: 'expand' }
              : prev.onboarding,
        }));
        return;
      }

      const assignedIds = getRoomAssignedObjectIds(runtime);
      const uninvestigatedId = assignedIds.find((id) => {
        const o = gameState.objects.find((obj) => obj.id === id);
        return o && !o.investigated;
      });

      if (
        (def.supportsObjectSlot === 'investigation' || def.supportsObjectSlot === 'hybrid') &&
        uninvestigatedId
      ) {
        const rpGain = Math.round((4 + runtime.level * 2) * mult);
        pushFeedback(roomId, `+${rpGain} RP`, 'research');
        handleManualInspectObject(uninvestigatedId);
        return;
      }

      soundFX.collect();
      const fundsGain = Math.round((8 + def.baseFundsPerSec * 2) * mult);
      const rpGain = Math.round((2 + def.baseResearchPerSec * 1.5) * mult);
      pushFeedback(
        roomId,
        rpGain > fundsGain ? `+${rpGain} RP` : `+$${fundsGain}`,
        rpGain > fundsGain ? 'research' : 'funds'
      );
      commitState((prev) => ({
        ...prev,
        resources: {
          ...prev.resources,
          funds: prev.resources.funds + fundsGain,
          research: prev.resources.research + rpGain,
        },
        totalFundsEarned: prev.totalFundsEarned + fundsGain,
        totalResearchEarned: prev.totalResearchEarned + rpGain,
        employees: prev.employees.map((e) =>
          e.hired && e.assignedRoomId === roomId
            ? grantEmployeeExperience(e, 7, prev).employee
            : e
        ),
      }));
    },
    [commitState, gameState.objects, gameState.rooms, handleManualInspectObject, pushFeedback, rates.clickPowerMultiplier]
  );

  const handleQuickPropClick = useCallback(
    (_e: React.MouseEvent, roomId: RoomId) => {
      handleManualWorkRoom(roomId);
    },
    [handleManualWorkRoom]
  );

  const handleFindHiddenClue = useCallback(
    (clueId: string) => {
      soundFX.discovery();
      commitState((prev) => {
        if (prev.hiddenCluesFound.includes(clueId)) return prev;

        if (clueId === 'facade_404_plaque') {
          const now = Date.now();
          const notif: GameNotification = {
            id: `hidden_${clueId}_${now}`,
            kind: 'milestone',
            category: 'secret',
            title: 'Uncovered Brass Plaque: "BUREAU SECTION 404"',
            message:
              'You brushed away ivy beside the front step and found the original 1974 brass nameplate: "DEPARTMENT 404 — PLEASE KNOCK SOFTLY." Archived Notes & Classified Cases updated.',
            timestamp: now,
            read: false,
            resolved: true,
            resolvedText: '+15 Research Points & Pneumatic Tube #0 Clue Logged.',
          };
          const plaqueMsg = {
            id: `msg_plaque_${now}`,
            sender: 'Exterior Brass Plaque (1974)',
            channel: 'Field Rubbing',
            text: 'Engraved underneath in tiny letters: "If forgotten, check behind Filing Drawer 44-B and do not hum in Car #3."',
            timestamp: now,
          };
          return {
            ...prev,
            hiddenCluesFound: [...prev.hiddenCluesFound, clueId],
            resources: {
              ...prev.resources,
              research: prev.resources.research + 15,
              reputation: prev.resources.reputation + 2,
            },
            totalResearchEarned: prev.totalResearchEarned + 15,
            strangeMessages: [plaqueMsg, ...(prev.strangeMessages ?? [])].slice(0, 14),
            notifications: [notif, ...prev.notifications].slice(0, 20),
          };
        }

        const nextObjects = prev.objects.map((o) =>
          o.id === 'obj_thunderstorm' && o.status === 'locked'
            ? { ...o, status: 'intake' as const, discoveredAt: Date.now() }
            : o
        );

        const notif: GameNotification = {
          id: `hidden_${clueId}_${Date.now()}`,
          kind: 'discovery',
          title: 'Hidden Discovery: The Pocket-Sized Thunderstorm!',
          message:
            'You caught a sparkling 4-inch cumulonimbus hiding behind the rooftop weather vane! It has been safely scooped into a copper saucer in Intake.',
          timestamp: Date.now(),
          read: false,
          resolved: true,
          resolvedText: 'Impossible Object DOU-010 added to your Collection!',
        };

        return {
          ...prev,
          hiddenCluesFound: [...prev.hiddenCluesFound, clueId],
          resources: {
            ...prev.resources,
            research: prev.resources.research + 30,
            reputation: prev.resources.reputation + 8,
          },
          totalResearchEarned: prev.totalResearchEarned + 30,
          objects: nextObjects,
          notifications: [notif, ...prev.notifications].slice(0, 20),
        };
      });
    },
    [commitState]
  );

  const handleActivateObjectAbility = useCallback(
    (objectId: string) => {
      commitState((prev) => {
        const now = Date.now();
        const obj = prev.objects.find((o) => o.id === objectId);
        if (!obj || obj.status === 'locked') return prev;
        const elapsedSec = obj.lastAbilityUsedAt ? (now - obj.lastAbilityUsedAt) / 1000 : 999;
        if (elapsedSec < obj.specialAbility.cooldownSec) return prev;

        soundFX.collect();
        const mult = RARITY_CONFIG[obj.rarity].multiplier * (obj.secondaryAbilityUnlocked ? 1.15 : 1);
        const bonusFunds = Math.round(18 * mult);
        const bonusResearch = Math.round(8 * mult);
        const bonusRep = obj.rarity === 'Legendary' || obj.rarity === 'Impossible' ? 2 : 1;
        const bonusSamples =
          obj.rarity === 'Impossible'
            ? 2
            : obj.rarity === 'Rare' || obj.rarity === 'Epic' || obj.rarity === 'Legendary'
            ? 1
            : 0;

        const lines = obj.specialAbility.activationLines;
        const line = lines[Math.floor(Math.random() * lines.length)];
        setLastAbilityMessage({
          objectId,
          text: `${line} (+$${bonusFunds}, +${bonusResearch} RP, +${bonusRep} Rep${
            bonusSamples > 0 ? `, +${bonusSamples} Sample` : ''
          })`,
        });

        return {
          ...prev,
          resources: {
            ...prev.resources,
            funds: prev.resources.funds + bonusFunds,
            research: prev.resources.research + bonusResearch,
            reputation: prev.resources.reputation + bonusRep,
            samples: (prev.resources.samples ?? 0) + bonusSamples,
          },
          totalFundsEarned: prev.totalFundsEarned + bonusFunds,
          totalResearchEarned: prev.totalResearchEarned + bonusResearch,
          totalSamplesEarned: (prev.totalSamplesEarned ?? 0) + bonusSamples,
          objects: prev.objects.map((o) =>
            o.id === objectId ? { ...o, lastAbilityUsedAt: now } : o
          ),
        };
      });
    },
    [commitState]
  );

  const handleRunExploration = useCallback(() => {
    commitState((prev) => {
      const now = Date.now();
      const cost = 85;
      if (now < prev.nextExplorationAt || prev.resources.funds < cost) return prev;

      const currentEra = prev.prestigeEra ?? 1;
      const lockedObjs = prev.objects.filter((o) => {
        if (o.status !== 'locked') return false;
        if ((o.minPrestigeEra ?? 1) <= currentEra) return true;
        if (o.id === 'obj_paradox_compass' && hasPrestigeTech(prev, 'pres_chronal_archive')) {
          return true;
        }
        if (o.id === 'obj_klein_box' && hasPrestigeTech(prev, 'pres_dimensional_vault')) {
          return true;
        }
        return false;
      });
      const prioritized =
        lockedObjs.find((o) => o.discoverySource === 'exploration') ??
        lockedObjs.find((o) => o.discoverySource === 'delivery' || o.discoverySource === 'event') ??
        lockedObjs[0];

      if (prioritized && (prev.expeditionsCompleted >= 1 || Math.random() < 0.65)) {
        soundFX.discovery();
        setLastExplorationResult(
          `Discovered ${prioritized.code} (${prioritized.name}, ${prioritized.rarity})! Sent straight to Intake.`
        );
        return {
          ...prev,
          resources: {
            ...prev.resources,
            funds: Math.max(0, prev.resources.funds - cost),
            reputation: prev.resources.reputation + 4,
          },
          expeditionsCompleted: prev.expeditionsCompleted + 1,
          nextExplorationAt: now + 22_000,
          objects: prev.objects.map((o) =>
            o.id === prioritized.id
              ? { ...o, status: 'intake' as const, discoveredAt: now }
              : o
          ),
          notifications: [
            {
              id: `exp_${now}`,
              kind: 'discovery' as const,
              title: `Exploration Discovery: ${prioritized.name}`,
              message: `Field scouts recovered ${prioritized.name} (${prioritized.rarity}) and logged it into Intake!`,
              timestamp: now,
              read: false,
              resolved: true,
              resolvedText: 'Added to Objects Collection.',
            },
            ...prev.notifications,
          ].slice(0, 20),
        };
      }

      soundFX.collect();
      const rpHaul = 26 + prev.expeditionsCompleted * 4;
      setLastExplorationResult(
        `Scouts mapped an abandoned annex and returned with +${rpHaul} Research Points & +2 Rep!`
      );
      return {
        ...prev,
        resources: {
          ...prev.resources,
          funds: Math.max(0, prev.resources.funds - cost),
          research: prev.resources.research + rpHaul,
          reputation: prev.resources.reputation + 2,
        },
        totalResearchEarned: prev.totalResearchEarned + rpHaul,
        expeditionsCompleted: prev.expeditionsCompleted + 1,
        nextExplorationAt: now + 22_000,
      };
    });
  }, [commitState]);

  const handleClaimAssignment = useCallback(
    (assignmentId: string) => {
      soundFX.discovery();
      commitState((prev) => {
        const assign = prev.specialAssignments.find((a) => a.id === assignmentId);
        if (!assign || !assign.completed || assign.claimed) return prev;
        const targetObj = prev.objects.find((o) => o.id === assign.rewardObjectId);
        const now = Date.now();

        return {
          ...prev,
          resources: {
            ...prev.resources,
            reputation: prev.resources.reputation + 5,
            research: prev.resources.research + 20,
          },
          totalResearchEarned: prev.totalResearchEarned + 20,
          specialAssignments: prev.specialAssignments.map((a) =>
            a.id === assignmentId ? { ...a, claimed: true } : a
          ),
          objects: prev.objects.map((o) =>
            o.id === assign.rewardObjectId && o.status === 'locked'
              ? { ...o, status: 'intake' as const, discoveredAt: now }
              : o
          ),
          notifications: targetObj
            ? [
                {
                  id: `assign_${assignmentId}_${now}`,
                  kind: 'discovery' as const,
                  title: `Assignment Complete: ${targetObj.name}`,
                  message: `Your field assignment secured ${targetObj.name} (${targetObj.rarity}) into Intake!`,
                  timestamp: now,
                  read: false,
                  resolved: true,
                  resolvedText: 'Added to Objects Collection.',
                },
                ...prev.notifications,
              ].slice(0, 20)
            : prev.notifications,
        };
      });
    },
    [commitState]
  );

  const handleUnlockFloor3 = useCallback(() => {
    commitState((prev) => {
      if (prev.floor3Unlocked) return prev;
      if (
        prev.resources.funds < FLOOR_3_UNLOCK_COST.funds ||
        prev.resources.reputation < FLOOR_3_UNLOCK_COST.reputation
      ) {
        return prev;
      }
      soundFX.discovery();
      const now = Date.now();
      return {
        ...prev,
        floor3Unlocked: true,
        resources: {
          ...prev.resources,
          funds: prev.resources.funds - FLOOR_3_UNLOCK_COST.funds,
          reputation: prev.resources.reputation + 4,
        },
        notifications: [
          {
            id: `floor3_${now}`,
            kind: 'milestone' as const,
            title: 'Sub-Level B2 Excavated!',
            message:
              'Floor 3 is now accessible! You can build the Experimental Wing, Deep Storage, and Reality Division.',
            timestamp: now,
            read: false,
            resolved: true,
            resolvedText: 'Floor 3 rooms unlocked for construction.',
          },
          ...prev.notifications,
        ].slice(0, 20),
      };
    });
  }, [commitState]);

  const handleUnlockRoom = useCallback(
    (roomId: RoomId) => {
      const def = ROOM_DEFINITIONS[roomId];
      commitState((prev) => {
        if (prev.rooms[roomId].unlocked) return prev;
        if (def.floor === 3 && !prev.floor3Unlocked) return prev;
        if (
          prev.resources.funds < def.unlockCostFunds ||
          prev.resources.reputation < def.unlockMinReputation
        ) {
          return prev;
        }
        soundFX.upgrade();
        pushFeedback(roomId, `${def.name} Open!`, 'reputation');
        triggerRoomUpgradeFX(roomId);

        let nextRooms = {
          ...prev.rooms,
          [roomId]: { ...prev.rooms[roomId], unlocked: true },
        };
        let nextObjects = prev.objects;
        let nextOnboarding = prev.onboarding;
        let nextSelectedInvId = prev.selectedInvestigationObjectId;

        if (roomId === 'investigation' && prev.onboarding?.tutorialStep === 'welcome') {
          const toaster = prev.objects.find((o) => o.id === 'obj_toaster');
          if (toaster && !toaster.investigated && !toaster.assignedRoomId) {
            nextRooms = {
              ...nextRooms,
              investigation: {
                ...nextRooms.investigation,
                assignedObjectId: 'obj_toaster',
                assignedObjectIds: ['obj_toaster'],
              },
            };
            nextObjects = prev.objects.map((o) =>
              o.id === 'obj_toaster'
                ? { ...o, assignedRoomId: 'investigation', status: 'investigating' as const }
                : o
            );
            nextSelectedInvId = 'obj_toaster';
          }
          nextOnboarding = { ...prev.onboarding, tutorialStep: 'investigate' };
        } else if (prev.onboarding?.tutorialStep === 'expand' && def.unlockCostFunds > 0) {
          nextOnboarding = finishTutorialState(prev, Date.now());
        }

        return {
          ...prev,
          resources: {
            ...prev.resources,
            funds: prev.resources.funds - def.unlockCostFunds,
            reputation: prev.resources.reputation + 4,
          },
          rooms: nextRooms,
          objects: nextObjects,
          selectedInvestigationObjectId: nextSelectedInvId,
          onboarding: nextOnboarding,
        };
      });
    },
    [commitState, pushFeedback, triggerRoomUpgradeFX]
  );

  const handleUpgradeRoom = useCallback(
    (roomId: RoomId) => {
      const def = ROOM_DEFINITIONS[roomId];
      commitState((prev) => {
        const rt = prev.rooms[roomId];
        if (!rt.unlocked || rt.level >= def.maxLevel) return prev;
        const discountMult = getRoomCostDiscountMultiplier(prev);
        const cost = getRoomUpgradeCost(def, rt.level, discountMult);
        if (prev.resources.funds < cost) return prev;
        soundFX.upgrade();
        pushFeedback(roomId, `Lv.${rt.level + 1}!`, 'funds');
        triggerRoomUpgradeFX(roomId);
        const now = Date.now();
        const completedTutorial = prev.onboarding?.tutorialStep === 'expand';
        return {
          ...prev,
          resources: { ...prev.resources, funds: prev.resources.funds - cost },
          rooms: {
            ...prev.rooms,
            [roomId]: { ...rt, level: rt.level + 1 },
          },
          onboarding: completedTutorial ? finishTutorialState(prev, now) : prev.onboarding,
          nextEventAt: completedTutorial
            ? Math.min(prev.nextEventAt, now + 24_000)
            : prev.nextEventAt,
        };
      });
    },
    [commitState, pushFeedback, triggerRoomUpgradeFX]
  );

  const handleUpgradeRoomEquipment = useCallback(
    (roomId: RoomId) => {
      const def = ROOM_DEFINITIONS[roomId];
      commitState((prev) => {
        const rt = prev.rooms[roomId];
        const eqLv = rt.equipmentLevel ?? 1;
        if (!rt.unlocked || eqLv >= 4) return prev;
        const discountMult = getRoomCostDiscountMultiplier(prev);
        const cost = getRoomEquipmentUpgradeCost(def, eqLv, discountMult);
        if (prev.resources.funds < cost) return prev;
        soundFX.upgrade();
        pushFeedback(roomId, `Gear Lv.${eqLv + 1}!`, 'research');
        triggerRoomUpgradeFX(roomId);
        const now = Date.now();
        const completedTutorial = prev.onboarding?.tutorialStep === 'expand';
        return {
          ...prev,
          resources: { ...prev.resources, funds: prev.resources.funds - cost },
          rooms: {
            ...prev.rooms,
            [roomId]: { ...rt, equipmentLevel: eqLv + 1 },
          },
          onboarding: completedTutorial ? finishTutorialState(prev, now) : prev.onboarding,
          nextEventAt: completedTutorial
            ? Math.min(prev.nextEventAt, now + 24_000)
            : prev.nextEventAt,
        };
      });
    },
    [commitState, pushFeedback, triggerRoomUpgradeFX]
  );

  const handleExpandObjectCapacity = useCallback(
    (roomId: RoomId) => {
      const def = ROOM_DEFINITIONS[roomId];
      commitState((prev) => {
        const rt = prev.rooms[roomId];
        if (
          !rt.unlocked ||
          def.supportsObjectSlot === 'none' ||
          rt.objectCapacity >= def.maxObjectCapacity
        ) {
          return prev;
        }
        const discountMult = getRoomCostDiscountMultiplier(prev);
        const cost = getRoomCapacityExpandCost(def, rt.objectCapacity, discountMult);
        if (prev.resources.funds < cost) return prev;
        soundFX.upgrade();
        pushFeedback(roomId, `+1 Pedestal!`, 'reputation');
        triggerRoomUpgradeFX(roomId);
        const now = Date.now();
        const completedTutorial = prev.onboarding?.tutorialStep === 'expand';
        return {
          ...prev,
          resources: { ...prev.resources, funds: prev.resources.funds - cost },
          rooms: {
            ...prev.rooms,
            [roomId]: { ...rt, objectCapacity: rt.objectCapacity + 1 },
          },
          onboarding: completedTutorial ? finishTutorialState(prev, now) : prev.onboarding,
          nextEventAt: completedTutorial
            ? Math.min(prev.nextEventAt, now + 24_000)
            : prev.nextEventAt,
        };
      });
    },
    [commitState, pushFeedback, triggerRoomUpgradeFX]
  );

  const handleExpandStaffCapacity = useCallback(
    (roomId: RoomId) => {
      const def = ROOM_DEFINITIONS[roomId];
      commitState((prev) => {
        const rt = prev.rooms[roomId];
        if (!rt.unlocked || rt.staffCapacity >= def.maxStaffCapacity) return prev;
        const discountMult = getRoomCostDiscountMultiplier(prev);
        const cost = getRoomStaffExpandCost(def, rt.staffCapacity, discountMult);
        if (prev.resources.funds < cost) return prev;
        soundFX.upgrade();
        pushFeedback(roomId, `+1 Desk!`, 'reputation');
        triggerRoomUpgradeFX(roomId);
        const now = Date.now();
        const completedTutorial = prev.onboarding?.tutorialStep === 'expand';
        return {
          ...prev,
          resources: { ...prev.resources, funds: prev.resources.funds - cost },
          rooms: {
            ...prev.rooms,
            [roomId]: { ...rt, staffCapacity: rt.staffCapacity + 1 },
          },
          onboarding: completedTutorial ? finishTutorialState(prev, now) : prev.onboarding,
          nextEventAt: completedTutorial
            ? Math.min(prev.nextEventAt, now + 24_000)
            : prev.nextEventAt,
        };
      });
    },
    [commitState, pushFeedback, triggerRoomUpgradeFX]
  );

  const handleTriggerRoomUniqueAction = useCallback(
    (roomId: RoomId) => {
      commitState((prev) => {
        const rt = prev.rooms[roomId];
        if (!rt.unlocked) return prev;
        const now = Date.now();
        if (now - (rt.lastUniqueActionAt ?? 0) < 25_000) return prev;

        soundFX.discovery();
        const objCount = getRoomAssignedObjectIds(rt).length;
        const discoveredCount = prev.objects.filter((o) => o.status !== 'locked').length;
        let fundsDelta = 0;
        let rpDelta = 0;
        let repDelta = 0;
        let samplesDelta = 0;
        let nextDeliveryCooldownAt = prev.nextDeliveryCooldownAt;
        let nextObjects = prev.objects;

        switch (roomId) {
          case 'reception':
            fundsDelta = 45 + rt.level * 15;
            repDelta = 1;
            nextDeliveryCooldownAt = now;
            pushFeedback(roomId, `+$${fundsDelta}`, 'funds');
            break;
          case 'investigation': {
            rpDelta = 14 + rt.level * 6;
            const targetId = getRoomAssignedObjectIds(rt).find((id) => {
              const o = prev.objects.find((obj) => obj.id === id);
              return o && !o.investigated;
            });
            if (targetId) {
              const gear = getEquippedGear(prev);
              nextObjects = prev.objects.map((o) => {
                if (o.id !== targetId) return o;
                const res = resolveInvestigationTransition(o, o.investigationProgress + 16, gear, now, prev);
                fundsDelta += res.bonusFunds;
                rpDelta += res.bonusResearch;
                repDelta += res.bonusReputation;
                if (res.completedNow) samplesDelta += 1;
                return res.updatedObject;
              });
            }
            pushFeedback(roomId, `+${rpDelta} RP`, 'research');
            break;
          }
          case 'research_desk':
            rpDelta = 18 + rt.level * 8 + objCount * 10;
            samplesDelta = 1;
            pushFeedback(roomId, `+${rpDelta} RP · +1 Sample`, 'research');
            break;
          case 'containment':
            fundsDelta = 38 + rt.level * 16 + objCount * 18;
            repDelta = 2;
            pushFeedback(roomId, `+$${fundsDelta}`, 'funds');
            break;
          case 'archive_vault':
            rpDelta = 12 + discoveredCount * 4 + rt.level * 6;
            repDelta = 2;
            pushFeedback(roomId, `+${rpDelta} RP`, 'research');
            break;
          case 'anomaly_workshop':
            fundsDelta = 58 + rt.level * 22;
            rpDelta = 10;
            samplesDelta = 1;
            pushFeedback(roomId, `+$${fundsDelta} · +1 Sample`, 'funds');
            break;
          case 'break_lounge': {
            rpDelta = 22 + rt.level * 8;
            repDelta = 3;
            samplesDelta = 1;
            const targetId = getRoomAssignedObjectIds(rt).find((id) => {
              const o = prev.objects.find((obj) => obj.id === id);
              return o && !o.investigated;
            });
            if (targetId) {
              const gear = getEquippedGear(prev);
              nextObjects = prev.objects.map((o) => {
                if (o.id !== targetId) return o;
                const res = resolveInvestigationTransition(o, o.investigationProgress + 14, gear, now, prev);
                fundsDelta += res.bonusFunds;
                rpDelta += res.bonusResearch;
                repDelta += res.bonusReputation;
                if (res.completedNow) samplesDelta += 1;
                return res.updatedObject;
              });
            }
            pushFeedback(roomId, `+${rpDelta} RP · +1 Sample`, 'research');
            break;
          }
          case 'temporal_lab':
            fundsDelta = 75 + rt.level * 26 + objCount * 22;
            repDelta = 3;
            samplesDelta = 1;
            pushFeedback(roomId, `+$${fundsDelta} · +1 Sample`, 'funds');
            break;
          case 'quantum_pantry':
            fundsDelta = 95 + rt.level * 32 + objCount * 25;
            rpDelta = 28;
            repDelta = 4;
            samplesDelta = 2;
            pushFeedback(roomId, `+${repDelta} Rep · +2 Samples!`, 'reputation');
            break;
        }

        return {
          ...prev,
          nextDeliveryCooldownAt,
          resources: {
            ...prev.resources,
            funds: prev.resources.funds + fundsDelta,
            research: prev.resources.research + rpDelta,
            reputation: prev.resources.reputation + repDelta,
            samples: (prev.resources.samples ?? 0) + samplesDelta,
          },
          totalFundsEarned: prev.totalFundsEarned + fundsDelta,
          totalResearchEarned: prev.totalResearchEarned + rpDelta,
          totalSamplesEarned: (prev.totalSamplesEarned ?? 0) + samplesDelta,
          objects: nextObjects,
          rooms: {
            ...prev.rooms,
            [roomId]: { ...rt, lastUniqueActionAt: now },
          },
        };
      });
    },
    [commitState, pushFeedback]
  );

  const handleAssignEmployee = useCallback(
    (employeeId: string, targetRoomId: RoomId | null) => {
      soundFX.click();
      commitState((prev) => {
        const emp = prev.employees.find((e) => e.id === employeeId);
        if (!emp || !emp.hired) return prev;

        if (targetRoomId) {
          const targetRuntime = prev.rooms[targetRoomId];
          if (!targetRuntime.unlocked) return prev;
          if (
            targetRuntime.assignedEmployeeIds.length >= targetRuntime.staffCapacity &&
            !targetRuntime.assignedEmployeeIds.includes(employeeId)
          ) {
            return prev;
          }
        }

        const nextRooms = { ...prev.rooms };
        (Object.keys(nextRooms) as RoomId[]).forEach((rId) => {
          const rt = nextRooms[rId];
          const filtered = rt.assignedEmployeeIds.filter((id) => id !== employeeId);
          if (rId === targetRoomId && !filtered.includes(employeeId)) {
            nextRooms[rId] = { ...rt, assignedEmployeeIds: [...filtered, employeeId] };
          } else if (filtered.length !== rt.assignedEmployeeIds.length) {
            nextRooms[rId] = { ...rt, assignedEmployeeIds: filtered };
          }
        });

        const nextEmployees = prev.employees.map((e) => {
          if (e.id !== employeeId) return e;
          const updatedEmp = { ...e, assignedRoomId: targetRoomId };
          return {
            ...updatedEmp,
            currentTask: getEmployeeDefaultTask(updatedEmp, {
              ...prev,
              rooms: nextRooms,
            }),
          };
        });

        return {
          ...prev,
          rooms: nextRooms,
          employees: nextEmployees,
        };
      });
    },
    [commitState]
  );

  const handleAssignObject = useCallback(
    (objectId: string, targetRoomId: RoomId | null) => {
      soundFX.click();
      commitState((prev) => {
        const obj = prev.objects.find((o) => o.id === objectId);
        if (!obj || obj.status === 'locked') return prev;
        if (targetRoomId) {
          const rt = prev.rooms[targetRoomId];
          const check = canAssignObjectToRoom(obj, targetRoomId, rt, prev);
          if (!check.ok || !rt.unlocked) return prev;
        }

        let displacedObjectId: string | null = null;
        const nextRooms = { ...prev.rooms };

        // Remove objectId from any room that currently holds it
        (Object.keys(nextRooms) as RoomId[]).forEach((rId) => {
          const existingIds = getRoomAssignedObjectIds(nextRooms[rId]);
          if (existingIds.includes(objectId)) {
            const filtered = existingIds.filter((id) => id !== objectId);
            nextRooms[rId] = {
              ...nextRooms[rId],
              assignedObjectIds: filtered,
              assignedObjectId: filtered[0] ?? null,
            };
          }
        });

        if (targetRoomId) {
          const targetRt = nextRooms[targetRoomId];
          const currentIds = getRoomAssignedObjectIds(targetRt);
          const nextIds = [...currentIds];
          if (nextIds.length >= targetRt.objectCapacity) {
            displacedObjectId = nextIds.shift() ?? null;
          }
          if (!nextIds.includes(objectId)) {
            nextIds.push(objectId);
          }
          nextRooms[targetRoomId] = {
            ...targetRt,
            assignedObjectIds: nextIds,
            assignedObjectId: nextIds[0] ?? null,
          };
        }

        const nextObjects = prev.objects.map((o) => {
          if (o.id === objectId) {
            if (!targetRoomId) {
              return {
                ...o,
                assignedRoomId: null,
                status: o.investigated ? ('contained' as const) : ('intake' as const),
              };
            }
            const slot = ROOM_DEFINITIONS[targetRoomId].supportsObjectSlot;
            const isInvestigatingHere =
              slot === 'investigation' || (slot === 'hybrid' && !o.investigated);
            return {
              ...o,
              assignedRoomId: targetRoomId,
              status: isInvestigatingHere ? ('investigating' as const) : ('contained' as const),
            };
          }
          if (displacedObjectId && o.id === displacedObjectId) {
            return {
              ...o,
              assignedRoomId: null,
              status: o.investigated ? ('contained' as const) : ('intake' as const),
            };
          }
          return o;
        });

        const targetSlot = targetRoomId ? ROOM_DEFINITIONS[targetRoomId].supportsObjectSlot : null;
        let nextOnboarding = prev.onboarding;
        let bonusFunds = 0;

        if (
          prev.onboarding?.tutorialStep === 'contain' &&
          targetRoomId &&
          targetSlot === 'containment'
        ) {
          bonusFunds = prev.onboarding.replayMode ? 0 : 45;
          nextRooms.reception = { ...nextRooms.reception, bonusReady: true };
          nextOnboarding = { ...prev.onboarding, tutorialStep: 'earn_rewards' };
        }

        return {
          ...prev,
          resources: {
            ...prev.resources,
            funds: prev.resources.funds + bonusFunds,
          },
          totalFundsEarned: prev.totalFundsEarned + bonusFunds,
          rooms: nextRooms,
          objects: nextObjects,
          onboarding: nextOnboarding,
          selectedInvestigationObjectId:
            targetRoomId && (targetSlot === 'investigation' || targetSlot === 'hybrid')
              ? objectId
              : prev.selectedInvestigationObjectId,
        };
      });
    },
    [commitState]
  );

  const handleHireEmployee = useCallback(
    (employeeId: string) => {
      commitState((prev) => {
        const emp = prev.employees.find((e) => e.id === employeeId);
        if (!emp || emp.hired) return prev;
        if (
          prev.resources.funds < emp.hireCostFunds ||
          prev.resources.reputation < emp.hireMinReputation
        ) {
          return prev;
        }
        soundFX.upgrade();

        let autoRoom: RoomId | null = null;
        const specRt = prev.rooms[emp.specialtyRoom];
        if (
          specRt.unlocked &&
          specRt.assignedEmployeeIds.length < specRt.staffCapacity
        ) {
          autoRoom = emp.specialtyRoom;
        } else {
          const openId = (Object.keys(ROOM_DEFINITIONS) as RoomId[]).find(
            (rId) =>
              prev.rooms[rId].unlocked &&
              prev.rooms[rId].assignedEmployeeIds.length < prev.rooms[rId].staffCapacity
          );
          autoRoom = openId ?? null;
        }

        const nextRooms = { ...prev.rooms };
        if (autoRoom) {
          nextRooms[autoRoom] = {
            ...nextRooms[autoRoom],
            assignedEmployeeIds: [...nextRooms[autoRoom].assignedEmployeeIds, emp.id],
          };
        }

        const now = Date.now();
        const nextEmployees = prev.employees.map((e) => {
          if (e.id !== employeeId) return e;
          const hiredEmp = {
            ...e,
            hired: true,
            assignedRoomId: autoRoom,
            lastActionAt: now - 4000,
          };
          return {
            ...hiredEmp,
            currentTask: getEmployeeDefaultTask(hiredEmp, {
              ...prev,
              rooms: nextRooms,
            }),
          };
        });

        const welcomeLog: EmployeeActivityEntry = {
          id: `hire_${emp.id}_${now}`,
          employeeId: emp.id,
          employeeName: emp.name,
          role: emp.role,
          roomId: autoRoom,
          text: autoRoom
            ? `Reported for duty in ${ROOM_DEFINITIONS[autoRoom].name}`
            : 'Joined department roster',
          rewardText: 'Hired',
          timestamp: now,
        };

        return {
          ...prev,
          resources: {
            ...prev.resources,
            funds: prev.resources.funds - emp.hireCostFunds,
          },
          rooms: nextRooms,
          employees: nextEmployees,
          employeeActivityLog: [welcomeLog, ...prev.employeeActivityLog].slice(0, 14),
        };
      });
    },
    [commitState]
  );

  const handleTrainEmployee = useCallback(
    (employeeId: string) => {
      commitState((prev) => {
        const emp = prev.employees.find((e) => e.id === employeeId);
        if (!emp || !emp.hired || emp.level >= 10) return prev;
        const cost = getEmployeeTrainCost(emp);
        if (prev.resources.funds < cost) return prev;

        const now = Date.now();
        const res = grantEmployeeExperience(emp, 40, prev);
        if (res.leveledUp) {
          soundFX.discovery();
        } else {
          soundFX.upgrade();
        }

        const logEntry: EmployeeActivityEntry = {
          id: `train_${emp.id}_${now}`,
          employeeId: emp.id,
          employeeName: emp.name,
          role: emp.role,
          roomId: emp.assignedRoomId,
          text: res.leveledUp
            ? `Completed specialist training and reached Lv.${res.employee.level}!`
            : 'Attended department skills seminar',
          rewardText: res.leveledUp ? `Lv.${res.employee.level}` : '+40 XP',
          timestamp: now,
        };

        return {
          ...prev,
          resources: { ...prev.resources, funds: prev.resources.funds - cost },
          employees: prev.employees.map((e) => (e.id === employeeId ? res.employee : e)),
          employeeActivityLog: [logEntry, ...prev.employeeActivityLog].slice(0, 14),
        };
      });
    },
    [commitState]
  );

  const handleMotivateEmployee = useCallback(
    (employeeId: string) => {
      commitState((prev) => {
        const emp = prev.employees.find((e) => e.id === employeeId);
        if (!emp || !emp.hired) return prev;
        const now = Date.now();
        if (now - (emp.lastMotivatedAt ?? 0) < 20_000) return prev;

        soundFX.collect();
        const withEnergy = { ...emp, energy: Math.min(100, emp.energy + 25) };
        const xpRes = grantEmployeeExperience(withEnergy, 12, prev);

        const logEntry: EmployeeActivityEntry = {
          id: `mot_${emp.id}_${now}`,
          employeeId: emp.id,
          employeeName: emp.name,
          role: emp.role,
          roomId: emp.assignedRoomId,
          text: 'Recharged with hot espresso and encouragement',
          rewardText: '+25% Energy · +12 XP',
          timestamp: now,
        };

        return {
          ...prev,
          employees: prev.employees.map((e) =>
            e.id === employeeId
              ? { ...xpRes.employee, lastMotivatedAt: now }
              : e
          ),
          employeeActivityLog: [logEntry, ...prev.employeeActivityLog].slice(0, 14),
        };
      });
    },
    [commitState]
  );

  const handleTriggerEmployeeAbility = useCallback(
    (employeeId: string) => {
      commitState((prev) => {
        const emp = prev.employees.find((e) => e.id === employeeId);
        if (!emp || !emp.hired || !emp.assignedRoomId) return prev;
        if (emp.level < emp.specialAbility.unlockedAtLevel) return prev;
        const now = Date.now();
        if ((now - (emp.lastAbilityAt ?? 0)) / 1000 < emp.specialAbility.cooldownSec) {
          return prev;
        }

        soundFX.discovery();
        const eff = getEffectiveEmployeeStats(prev, emp);
        const gear = getEquippedGear(prev);
        let fundsGain = 0;
        let rpGain = 0;
        let repGain = 0;
        let invCompleted = 0;
        let teamEnergy = 0;
        let teamXp = 0;
        let nextObjects = prev.objects;
        let rewardLabel = '';

        switch (emp.role) {
          case 'Junior Investigator': {
            rpGain = Math.round(14 * eff.effectiveProductivity);
            const target = nextObjects.find((o) => !o.investigated && o.status !== 'locked');
            if (target) {
              nextObjects = nextObjects.map((o) => {
                if (o.id !== target.id) return o;
                const res = resolveInvestigationTransition(
                  o,
                  o.investigationProgress + 16,
                  gear,
                  now,
                  prev
                );
                fundsGain += res.bonusFunds;
                rpGain += res.bonusResearch;
                repGain += res.bonusReputation;
                if (res.completedNow) invCompleted += 1;
                return res.updatedObject;
              });
            }
            rewardLabel = `+16% Inv · +${rpGain} RP`;
            break;
          }
          case 'Research Scientist':
            rpGain = Math.round(28 * eff.effectiveProductivity);
            repGain = 2;
            rewardLabel = `+${rpGain} RP · +2 Rep`;
            break;
          case 'Containment Specialist':
            fundsGain = Math.round(52 * eff.effectiveProductivity);
            repGain = 2;
            rewardLabel = `+$${fundsGain} · +2 Rep`;
            break;
          case 'Security Officer':
            fundsGain = Math.round(36 * eff.effectiveProductivity);
            repGain = 3;
            teamEnergy = 15;
            rewardLabel = `+$${fundsGain} · +3 Rep`;
            break;
          case 'Engineer':
            fundsGain = Math.round(64 * eff.effectiveProductivity);
            rpGain = Math.round(16 * eff.effectiveProductivity);
            rewardLabel = `+$${fundsGain} · +${rpGain} RP`;
            break;
          case 'Archivist':
            rpGain = Math.round(34 * eff.effectiveProductivity);
            repGain = 3;
            rewardLabel = `+${rpGain} RP · +3 Rep`;
            break;
          case 'Experimental Technician': {
            rpGain = Math.round(20 * eff.effectiveProductivity);
            const target = nextObjects.find((o) => !o.investigated && o.status !== 'locked');
            if (target) {
              nextObjects = nextObjects.map((o) => {
                if (o.id !== target.id) return o;
                const res = resolveInvestigationTransition(
                  o,
                  o.investigationProgress + 14,
                  gear,
                  now,
                  prev
                );
                fundsGain += res.bonusFunds;
                rpGain += res.bonusResearch;
                repGain += res.bonusReputation;
                if (res.completedNow) invCompleted += 1;
                return res.updatedObject;
              });
            }
            rewardLabel = `+14% Inv · +${rpGain} RP`;
            break;
          }
          case 'Department Manager':
            fundsGain = Math.round(70 * eff.effectiveProductivity);
            repGain = 3;
            teamEnergy = 25;
            teamXp = 12;
            rewardLabel = `+$${fundsGain} · +Team Buff`;
            break;
        }

        if (emp.assignedRoomId) {
          pushFeedback(
            emp.assignedRoomId,
            emp.specialAbility.name,
            rpGain > fundsGain ? 'research' : 'funds'
          );
        }

        let nextEmployees = prev.employees.map((e) => {
          if (e.id === employeeId) {
            const xpRes = grantEmployeeExperience(e, 16, prev);
            return {
              ...xpRes.employee,
              lastAbilityAt: now,
              currentTask: `Executed ${emp.specialAbility.name}!`,
            };
          }
          if (!e.hired) return e;
          let updatedCoworker =
            teamEnergy > 0 ? { ...e, energy: Math.min(100, e.energy + teamEnergy) } : e;
          if (teamXp > 0) {
            updatedCoworker = grantEmployeeExperience(updatedCoworker, teamXp, prev).employee;
          }
          return updatedCoworker;
        });

        const logEntry: EmployeeActivityEntry = {
          id: `ab_${emp.id}_${now}`,
          employeeId: emp.id,
          employeeName: emp.name,
          role: emp.role,
          roomId: emp.assignedRoomId,
          text: `Activated Special Ability: ${emp.specialAbility.name}`,
          rewardText: rewardLabel,
          timestamp: now,
        };

        const samplesGain =
          invCompleted > 0 ? invCompleted : emp.role === 'Experimental Technician' ? 1 : 0;

        return {
          ...prev,
          resources: {
            ...prev.resources,
            funds: prev.resources.funds + fundsGain,
            research: prev.resources.research + rpGain,
            reputation: prev.resources.reputation + repGain,
            samples: (prev.resources.samples ?? 0) + samplesGain,
          },
          totalFundsEarned: prev.totalFundsEarned + fundsGain,
          totalResearchEarned: prev.totalResearchEarned + rpGain,
          totalSamplesEarned: (prev.totalSamplesEarned ?? 0) + samplesGain,
          totalInvestigationsCompleted: prev.totalInvestigationsCompleted + invCompleted,
          objects: nextObjects,
          employees: nextEmployees,
          employeeActivityLog: [logEntry, ...prev.employeeActivityLog].slice(0, 14),
        };
      });
    },
    [commitState, pushFeedback]
  );

  const handleUnlockOrEquipEmployeeGear = useCallback(
    (gearId: string, employeeId?: string) => {
      commitState((prev) => {
        if (!gearId) {
          if (!employeeId) return prev;
          soundFX.click();
          return {
            ...prev,
            employees: prev.employees.map((e) =>
              e.id === employeeId ? { ...e, equippedGearId: null } : e
            ),
          };
        }

        const gear = prev.employeeEquipment.find((g) => g.id === gearId);
        if (!gear) return prev;

        if (!gear.unlocked) {
          if (prev.resources.funds < gear.costFunds) return prev;
          soundFX.upgrade();
          return {
            ...prev,
            resources: {
              ...prev.resources,
              funds: prev.resources.funds - gear.costFunds,
            },
            employeeEquipment: prev.employeeEquipment.map((g) =>
              g.id === gearId ? { ...g, unlocked: true } : g
            ),
            employees: employeeId
              ? prev.employees.map((e) =>
                  e.id === employeeId ? { ...e, equippedGearId: gearId } : e
                )
              : prev.employees,
          };
        }

        if (!employeeId) return prev;
        soundFX.click();
        return {
          ...prev,
          employees: prev.employees.map((e) =>
            e.id === employeeId ? { ...e, equippedGearId: gearId } : e
          ),
        };
      });
    },
    [commitState]
  );

  const handlePurchaseUpgrade = useCallback(
    (upgradeId: string) => {
      commitState((prev) => {
        const upg = prev.upgrades.find((u) => u.id === upgradeId);
        if (!upg || upg.purchasedCount >= upg.maxPurchases) return prev;
        const cost = getUpgradeNextCost(upg.costFunds, upg.purchasedCount);
        if (prev.resources.funds < cost) return prev;
        soundFX.upgrade();

        let nextRooms = prev.rooms;
        if (upgradeId === 'upg_modular_racks') {
          nextRooms = { ...prev.rooms };
          (Object.keys(ROOM_DEFINITIONS) as RoomId[]).forEach((rId) => {
            const def = ROOM_DEFINITIONS[rId];
            if (def.supportsObjectSlot !== 'none') {
              const rt = nextRooms[rId];
              nextRooms[rId] = {
                ...rt,
                objectCapacity: Math.min(6, rt.objectCapacity + 1),
              };
            }
          });
        }

        const now = Date.now();
        const completedTutorial = prev.onboarding?.tutorialStep === 'expand';

        return {
          ...prev,
          resources: { ...prev.resources, funds: prev.resources.funds - cost },
          rooms: nextRooms,
          upgrades: prev.upgrades.map((u) =>
            u.id === upgradeId ? { ...u, purchasedCount: u.purchasedCount + 1 } : u
          ),
          onboarding: completedTutorial ? finishTutorialState(prev, now) : prev.onboarding,
          nextEventAt: completedTutorial
            ? Math.min(prev.nextEventAt, now + 24_000)
            : prev.nextEventAt,
        };
      });
    },
    [commitState]
  );

  const handleCompleteExperimentalProject = useCallback(
    (projectId: string) => {
      commitState((prev) => {
        const proj = prev.experimentalProjects.find((p) => p.id === projectId);
        if (!proj) return prev;
        if (!proj.repeatable && proj.completedCount >= proj.maxCompletions) return prev;
        const effectiveSampleCost = proj.repeatable
          ? proj.costSamples + proj.completedCount * 2
          : proj.costSamples;
        if (
          (prev.resources.samples ?? 0) < effectiveSampleCost ||
          prev.resources.research < proj.costResearch ||
          prev.resources.reputation < proj.minReputation
        ) {
          return prev;
        }
        soundFX.discovery();
        const now = Date.now();
        let nextObjects = prev.objects;
        let fundsGain = 0;
        let rpGain = 0;
        let repGain = 2;
        const extraNotifs: GameNotification[] = [];
        let nextBoosts = (prev.activeBoosts ?? []).filter((b) => b.expiresAt > now);

        if (projectId === 'exp_proj_storm_bottle') {
          const stormObj = prev.objects.find(
            (o) => o.id === 'obj_thunderstorm' && o.status === 'locked'
          );
          if (stormObj) {
            nextObjects = prev.objects.map((o) =>
              o.id === 'obj_thunderstorm'
                ? { ...o, status: 'intake' as const, discoveredAt: now }
                : o
            );
            extraNotifs.push({
              id: `proj_storm_${now}`,
              kind: 'discovery',
              title: 'Storm Extracted: The Pocket-Sized Thunderstorm!',
              message:
                'Barometric distillation condensed DOU-010 into a copper specimen bottle in Intake!',
              timestamp: now,
              read: false,
              resolved: true,
              resolvedText: 'Added to Objects Collection.',
            });
          }
        }

        if (projectId === 'exp_proj_flux_conversion') {
          fundsGain = 320;
          rpGain = 70;
          repGain = 3;
          const surge: ActiveEconomicBoost = {
            id: `boost_symposium_${now}`,
            label: 'Symposium Surge (+40% Yield)',
            description: 'Temporary exhibition grant boosting Funds & Research by +40%.',
            fundsMult: 1.4,
            researchMult: 1.4,
            samplesMult: 1.25,
            deliverySpeedMult: 1,
            expiresAt: now + 60_000,
          };
          nextBoosts = [...nextBoosts, surge];
        }

        return {
          ...prev,
          resources: {
            ...prev.resources,
            funds: prev.resources.funds + fundsGain,
            research: Math.max(0, prev.resources.research - proj.costResearch) + rpGain,
            reputation: prev.resources.reputation + repGain,
            samples: Math.max(0, (prev.resources.samples ?? 0) - effectiveSampleCost),
          },
          totalFundsEarned: prev.totalFundsEarned + fundsGain,
          totalResearchEarned: prev.totalResearchEarned + rpGain,
          experimentalProjects: prev.experimentalProjects.map((p) =>
            p.id === projectId ? { ...p, completedCount: p.completedCount + 1 } : p
          ),
          activeBoosts: nextBoosts,
          objects: nextObjects,
          notifications: [...extraNotifs, ...prev.notifications].slice(0, 20),
        };
      });
    },
    [commitState]
  );

  const handleUnlockResearch = useCallback(
    (nodeId: string) => {
      commitState((prev) => {
        const node = prev.researchNodes.find((r) => r.id === nodeId);
        if (!node || node.researched) return prev;
        if (node.prerequisiteId) {
          const pre = prev.researchNodes.find((r) => r.id === node.prerequisiteId);
          if (!pre?.researched) return prev;
        }
        const effectiveCost = getEffectiveResearchCost(node.costResearch, prev);
        if (prev.resources.research < effectiveCost) return prev;
        soundFX.discovery();
        const now = Date.now();

        const nextObjects = prev.objects.map((o) => {
          if (node.unlocksObjectId && o.id === node.unlocksObjectId && o.status === 'locked') {
            return { ...o, status: 'intake' as const, discoveredAt: now };
          }
          return o;
        });

        let nextRooms = { ...prev.rooms };
        let nextEmployees = prev.employees;
        let nextEmpGear = prev.employeeEquipment;
        let nextInvGear = prev.investigationEquipment;
        let nextFloor3Unlocked = prev.floor3Unlocked;
        let nextAutomation = { ...(prev.automationSettings ?? { autoInvestigate: false, autoAssignStaff: false }) };
        let nextActivityLog = prev.employeeActivityLog;
        let bonusFunds = 0;
        const specialUnlockNotes: string[] = [];

        if (nodeId === 'res_inv_scanners') {
          nextInvGear = nextInvGear.map((eq) =>
            eq.id === 'eq_subspace_scanner' ? { ...eq, unlocked: true } : eq
          );
          specialUnlockNotes.push('Unlocked Automated Resonance Scanner on the Investigation Bench.');
        }

        if (nodeId === 'res_con_automated_storage') {
          (['containment', 'archive_vault', 'temporal_lab'] as RoomId[]).forEach((rId) => {
            const rt = nextRooms[rId];
            nextRooms[rId] = {
              ...rt,
              objectCapacity: Math.min(6, rt.objectCapacity + 1),
            };
          });
          specialUnlockNotes.push('+1 Object Pedestal slot added to Containment, Archives, and Deep Storage.');
        }

        if (nodeId === 'res_auto_investigations') {
          nextAutomation = { ...nextAutomation, autoInvestigate: true };
          specialUnlockNotes.push('Auto-Investigate Intake Queue enabled!');
        }

        if (nodeId === 'res_auto_staff') {
          nextAutomation = { ...nextAutomation, autoAssignStaff: true };
          specialUnlockNotes.push('Auto-Assign Idle Staff enabled!');
        }

        if (nodeId === 'res_emp_fellowships') {
          const helena = nextEmployees.find((e) => e.id === 'emp_helena');
          if (helena && !helena.hired) {
            let autoRoom: RoomId | null = null;
            const specRt = nextRooms[helena.specialtyRoom];
            if (specRt.unlocked && specRt.assignedEmployeeIds.length < specRt.staffCapacity) {
              autoRoom = helena.specialtyRoom;
            } else {
              autoRoom =
                (Object.keys(ROOM_DEFINITIONS) as RoomId[]).find(
                  (rId) =>
                    nextRooms[rId].unlocked &&
                    nextRooms[rId].assignedEmployeeIds.length < nextRooms[rId].staffCapacity
                ) ?? null;
            }
            if (autoRoom) {
              nextRooms[autoRoom] = {
                ...nextRooms[autoRoom],
                assignedEmployeeIds: [...nextRooms[autoRoom].assignedEmployeeIds, helena.id],
              };
            }
            nextEmployees = nextEmployees.map((e) =>
              e.id === 'emp_helena'
                ? {
                    ...e,
                    hired: true,
                    assignedRoomId: autoRoom,
                    lastActionAt: now - 3000,
                    currentTask: autoRoom
                      ? `Leading Fellowship studies in ${ROOM_DEFINITIONS[autoRoom].name}`
                      : 'Senior Fellow ready for posting',
                  }
                : e
            );
            nextActivityLog = [
              {
                id: `fellow_${now}`,
                employeeId: 'emp_helena',
                employeeName: helena.name,
                role: helena.role,
                roomId: autoRoom,
                text: 'Joined department via Senior Bureaucratic Fellowship!',
                rewardText: 'Free Fellow!',
                timestamp: now,
              },
              ...nextActivityLog,
            ].slice(0, 14);
            specialUnlockNotes.push('Recruited Dr. Helena Vance (Senior Research Fellow)!');
          } else {
            nextEmployees = nextEmployees.map((e) =>
              e.hired ? grantEmployeeExperience(e, 50, prev).employee : e
            );
            specialUnlockNotes.push('Awarded +50 Fellowship XP to all active personnel!');
          }
        }

        if (nodeId === 'res_real_spatial') {
          if (!nextFloor3Unlocked) {
            nextFloor3Unlocked = true;
            specialUnlockNotes.push('Sub-Level B2 Elevator unlocked!');
          } else {
            bonusFunds += 300;
            specialUnlockNotes.push('Sub-Level B2 already open — refunded +$300 grant!');
          }
        }

        if (nodeId === 'res_real_temporal') {
          nextEmpGear = nextEmpGear.map((eq) =>
            eq.id === 'emp_gear_chrono' ? { ...eq, unlocked: true } : eq
          );
          specialUnlockNotes.push('Unlocked Pocket Chronometer staff equipment!');
        }

        const unlockedNames = nextObjects
          .filter((o, idx) => o.status !== prev.objects[idx].status)
          .map((o) => o.name);

        let nextNotifs = prev.notifications;
        if (unlockedNames.length > 0 || specialUnlockNotes.length > 0) {
          const detailParts = [
            unlockedNames.length > 0
              ? `Discovered ${unlockedNames.join(' & ')} in Intake.`
              : '',
            ...specialUnlockNotes,
          ].filter(Boolean);
          nextNotifs = [
            {
              id: `res_unlock_${now}`,
              kind: unlockedNames.length > 0 ? ('delivery' as const) : ('milestone' as const),
              category: 'positive' as const,
              title:
                unlockedNames.length > 0
                  ? `Research Breakthrough: ${unlockedNames.join(' & ')}`
                  : `Research Complete: ${node.name}`,
              message: detailParts.join(' '),
              timestamp: now,
              read: false,
              resolved: true,
              resolvedText: node.effectLabel,
            },
            ...prev.notifications,
          ].slice(0, 20);
        }

        return {
          ...prev,
          floor3Unlocked: nextFloor3Unlocked,
          resources: {
            ...prev.resources,
            funds: prev.resources.funds + bonusFunds,
            research: prev.resources.research - effectiveCost,
            reputation: prev.resources.reputation + 4,
          },
          totalFundsEarned: prev.totalFundsEarned + bonusFunds,
          rooms: nextRooms,
          employees: nextEmployees,
          employeeEquipment: nextEmpGear,
          investigationEquipment: nextInvGear,
          automationSettings: nextAutomation,
          employeeActivityLog: nextActivityLog,
          researchNodes: prev.researchNodes.map((r) =>
            r.id === nodeId ? { ...r, researched: true } : r
          ),
          objects: nextObjects,
          notifications: nextNotifs,
        };
      });
    },
    [commitState]
  );

  const handleToggleAutomation = useCallback(
    (key: 'autoInvestigate' | 'autoAssignStaff') => {
      soundFX.click();
      commitState((prev) => ({
        ...prev,
        automationSettings: {
          ...(prev.automationSettings ?? { autoInvestigate: false, autoAssignStaff: false }),
          [key]: !(prev.automationSettings?.[key] ?? false),
        },
      }));
    },
    [commitState]
  );

  const handlePurchasePrestigeTech = useCallback(
    (techId: string) => {
      commitState((prev) => {
        const tech = (prev.prestigeTechnologies ?? []).find((t) => t.id === techId);
        if (!tech || tech.purchased || (prev.prestigeCurrency ?? 0) < tech.costSeals) {
          return prev;
        }
        soundFX.discovery();
        const now = Date.now();
        let nextObjects = prev.objects;
        const unlockedNames: string[] = [];

        if (techId === 'pres_chronal_archive') {
          nextObjects = nextObjects.map((o) => {
            if (o.id === 'obj_paradox_compass' && o.status === 'locked') {
              unlockedNames.push(o.name);
              return { ...o, status: 'intake' as const, discoveredAt: now };
            }
            return o;
          });
        }
        if (techId === 'pres_dimensional_vault') {
          nextObjects = nextObjects.map((o) => {
            if (o.id === 'obj_klein_box' && o.status === 'locked') {
              unlockedNames.push(o.name);
              return { ...o, status: 'intake' as const, discoveredAt: now };
            }
            return o;
          });
        }

        const notif: GameNotification = {
          id: `pres_tech_${techId}_${now}`,
          kind: 'milestone',
          category: 'rare',
          title: `Prestige Charter Signed: ${tech.name}`,
          message:
            unlockedNames.length > 0
              ? `${tech.effectLabel} — ${unlockedNames.join(' & ')} delivered directly into Intake!`
              : tech.effectLabel,
          timestamp: now,
          read: false,
          resolved: true,
          resolvedText: 'Active across this and all future Operational Eras.',
        };

        return {
          ...prev,
          prestigeCurrency: (prev.prestigeCurrency ?? 0) - tech.costSeals,
          prestigeTechnologies: (prev.prestigeTechnologies ?? []).map((t) =>
            t.id === techId ? { ...t, purchased: true } : t
          ),
          objects: nextObjects,
          notifications: [notif, ...prev.notifications].slice(0, 20),
        };
      });
    },
    [commitState]
  );

  const handleEnterNextOperationalEra = useCallback(() => {
    commitState((prev) => {
      const check = canEnterNextOperationalEra(prev);
      if (!check.eligible) return prev;

      soundFX.discovery();
      const now = Date.now();
      const fresh = createInitialGameState();
      const nextEra = (prev.prestigeEra ?? 1) + 1;
      const nextSeals = (prev.prestigeCurrency ?? 0) + check.rewardSeals;
      const preservedTechs = (prev.prestigeTechnologies ?? fresh.prestigeTechnologies).map((t) => ({
        ...t,
      }));

      const hasHeadstart = preservedTechs.some(
        (t) => t.id === 'pres_headstart_protocol' && t.purchased
      );
      const hasChronalCharter = preservedTechs.some(
        (t) => t.id === 'pres_chronal_archive' && t.purchased
      );
      const hasDimensionalCharter = preservedTechs.some(
        (t) => t.id === 'pres_dimensional_vault' && t.purchased
      );

      if (hasHeadstart) {
        fresh.rooms.archive_vault = {
          ...fresh.rooms.archive_vault,
          unlocked: true,
          assignedEmployeeIds: ['emp_barnaby'],
        };
        fresh.resources.funds += 350;
        fresh.employees = fresh.employees.map((e) =>
          e.id === 'emp_barnaby'
            ? {
                ...e,
                hired: true,
                assignedRoomId: 'archive_vault',
                lastActionAt: now - 3000,
                currentTask: 'Leading Era Headstart research in Archives',
              }
            : e
        );
      }

      fresh.objects = fresh.objects.map((o) => {
        if (o.id === 'obj_paradox_compass' && (hasChronalCharter || nextEra >= 2)) {
          return { ...o, status: 'intake' as const, discoveredAt: now };
        }
        if (o.id === 'obj_klein_box' && (hasDimensionalCharter || nextEra >= 3)) {
          return { ...o, status: 'intake' as const, discoveredAt: now };
        }
        return o;
      });

      const eraNotif: GameNotification = {
        id: `era_transition_${nextEra}_${now}`,
        kind: 'milestone',
        category: 'rare',
        title: `Welcome to Operational Era ${nextEra}!`,
        message: `Earned +${check.rewardSeals} Archival Seals and locked in a permanent +${
          (nextEra - 1) * 25
        }% Funds & Research Era multiplier!`,
        timestamp: now,
        read: false,
        resolved: true,
        resolvedText: 'Era transition charter sealed.',
      };

      // Preserve completed progression & core 4 rooms across Operational Era resets
      fresh.rooms.investigation = { ...fresh.rooms.investigation, unlocked: true };
      fresh.rooms.research_desk = { ...fresh.rooms.research_desk, unlocked: true };
      fresh.rooms.containment = { ...fresh.rooms.containment, unlocked: true };

      return {
        ...fresh,
        prestigeEra: nextEra,
        prestigeCurrency: nextSeals,
        prestigeTechnologies: preservedTechs,
        onboarding: {
          tutorialStep: 'completed',
          tutorialCompleted: true,
          progressionStage: 6,
          claimedObjectiveIds: prev.onboarding?.claimedObjectiveIds ?? [],
          dismissedFeatureStage: 6,
          replayMode: false,
        },
        discoveries: prev.discoveries.map((d) => ({ ...d })),
        classifiedProjects: (prev.classifiedProjects ?? INITIAL_CLASSIFIED_PROJECTS).map((p) => ({
          ...p,
        })),
        archivedDocuments: (prev.archivedDocuments ?? INITIAL_ARCHIVED_DOCUMENTS).map((d) => ({
          ...d,
        })),
        unlockedConversations: [...(prev.unlockedConversations ?? ['conv_toaster_weather'])],
        secretRooms: (prev.secretRooms ?? INITIAL_SECRET_ROOMS).map((sr) => ({ ...sr })),
        strangeMessages: [...(prev.strangeMessages ?? [])],
        hiddenCluesFound: [...prev.hiddenCluesFound],
        totalFundsEarned: prev.totalFundsEarned,
        totalResearchEarned: prev.totalResearchEarned,
        totalSamplesEarned: prev.totalSamplesEarned ?? 0,
        totalInvestigationsCompleted: prev.totalInvestigationsCompleted,
        totalDeliveriesProcessed: prev.totalDeliveriesProcessed,
        expeditionsCompleted: prev.expeditionsCompleted,
        settings: prev.settings,
        notifications: [eraNotif, ...fresh.notifications].slice(0, 20),
      };
    });
    setSelectedRoomId(null);
    setInvestigationOpen(false);
  }, [commitState]);

  const handleClaimDiscovery = useCallback(
    (discoveryId: string) => {
      soundFX.discovery();
      commitState((prev) => {
        const entry = prev.discoveries.find((d) => d.id === discoveryId);
        if (!entry || !entry.unlocked || entry.claimed) return prev;

        return {
          ...prev,
          resources: {
            ...prev.resources,
            funds: prev.resources.funds + entry.rewardFunds,
            research: prev.resources.research + entry.rewardResearch,
            reputation: prev.resources.reputation + entry.rewardReputation,
          },
          totalFundsEarned: prev.totalFundsEarned + entry.rewardFunds,
          totalResearchEarned: prev.totalResearchEarned + entry.rewardResearch,
          discoveries: prev.discoveries.map((d) =>
            d.id === discoveryId ? { ...d, claimed: true } : d
          ),
        };
      });
    },
    [commitState]
  );

  const handleCompleteClassifiedProject = useCallback(
    (projectId: string) => {
      commitState((prev) => {
        const projects = prev.classifiedProjects ?? INITIAL_CLASSIFIED_PROJECTS;
        const proj = projects.find((p) => p.id === projectId);
        if (!proj || proj.completed) return prev;
        const { canLaunch } = evaluateClassifiedProjectEligibility(proj, prev);
        if (!canLaunch) return prev;

        soundFX.discovery();
        const now = Date.now();
        const nextSecretRooms = (prev.secretRooms ?? INITIAL_SECRET_ROOMS).map((sr) =>
          sr.id === proj.unlocksSecretRoomId ? { ...sr, discovered: true } : sr
        );
        const nextDocs = (prev.archivedDocuments ?? INITIAL_ARCHIVED_DOCUMENTS).map((doc) =>
          doc.id === proj.unlocksDocumentId ? { ...doc, unlocked: true } : doc
        );
        const nextConvs = [...(prev.unlockedConversations ?? ['conv_toaster_weather'])];
        if (proj.unlocksConversationId && !nextConvs.includes(proj.unlocksConversationId)) {
          nextConvs.push(proj.unlocksConversationId);
        }

        const nextFloor3Unlocked =
          prev.floor3Unlocked || projectId === 'proj_004_sealed_elevator';

        const storyMsg = {
          id: `msg_proj_${proj.id}_${now}`,
          sender: `${proj.code} Declassification`,
          channel: 'Archive Terminal',
          text: proj.declassifiedLog,
          timestamp: now,
        };

        const notif: GameNotification = {
          id: `classified_${proj.id}_${now}`,
          kind: 'milestone',
          category: 'secret',
          title: `Declassified: ${proj.code} — ${proj.title}`,
          message: proj.declassifiedLog,
          timestamp: now,
          read: false,
          resolved: true,
          resolvedText: `Rewards: +$${proj.rewardFunds}, +${proj.rewardResearch} RP, +${proj.rewardReputation} Rep, +${proj.rewardSamples} Samples.`,
        };

        return {
          ...prev,
          floor3Unlocked: nextFloor3Unlocked,
          resources: {
            ...prev.resources,
            funds: prev.resources.funds - proj.requirements.costFunds + proj.rewardFunds,
            research: prev.resources.research - proj.requirements.costResearch + proj.rewardResearch,
            reputation: prev.resources.reputation + proj.rewardReputation,
            samples:
              (prev.resources.samples ?? 0) - proj.requirements.costSamples + proj.rewardSamples,
          },
          totalFundsEarned: prev.totalFundsEarned + proj.rewardFunds,
          totalResearchEarned: prev.totalResearchEarned + proj.rewardResearch,
          totalSamplesEarned: (prev.totalSamplesEarned ?? 0) + proj.rewardSamples,
          classifiedProjects: projects.map((p) =>
            p.id === projectId ? { ...p, completed: true, completedAt: now } : p
          ),
          secretRooms: nextSecretRooms,
          archivedDocuments: nextDocs,
          unlockedConversations: nextConvs,
          strangeMessages: [storyMsg, ...(prev.strangeMessages ?? [])].slice(0, 14),
          notifications: [notif, ...prev.notifications].slice(0, 20),
        };
      });
    },
    [commitState]
  );

  const handleTriggerSecretRoomAction = useCallback(
    (secretRoomId: string) => {
      commitState((prev) => {
        const now = Date.now();
        const secretRooms = prev.secretRooms ?? INITIAL_SECRET_ROOMS;
        const target = secretRooms.find((sr) => sr.id === secretRoomId);
        if (!target || !target.discovered) return prev;
        if (now - target.lastUsedAt < 45_000) return prev;

        soundFX.collect();

        if (secretRoomId === 'secret_tea_vault') {
          const nextEmployees = prev.employees.map((e) =>
            e.hired ? { ...e, energy: Math.min(100, e.energy + 15) } : e
          );
          const teaMsg = {
            id: `msg_tea_${now}`,
            sender: 'Sub-Level 2.5 Samovar',
            channel: 'Tea Dumbwaiter',
            text: 'Fresh porcelain pots of 1975 Bergamot delivered to all wings. Staff energy +15%, +28 RP, +1 Anomaly Sample.',
            timestamp: now,
          };
          return {
            ...prev,
            resources: {
              ...prev.resources,
              research: prev.resources.research + 28,
              samples: (prev.resources.samples ?? 0) + 1,
            },
            totalResearchEarned: prev.totalResearchEarned + 28,
            totalSamplesEarned: (prev.totalSamplesEarned ?? 0) + 1,
            employees: nextEmployees,
            secretRooms: secretRooms.map((sr) =>
              sr.id === secretRoomId ? { ...sr, lastUsedAt: now } : sr
            ),
            strangeMessages: [teaMsg, ...(prev.strangeMessages ?? [])].slice(0, 14),
          };
        }

        const poolItem =
          STRANGE_MESSAGE_POOL[Math.floor(Math.random() * STRANGE_MESSAGE_POOL.length)];
        const interceptedMsg = {
          id: `msg_b3_${now}`,
          sender: poolItem.sender,
          channel: `B3 Observatory · ${poolItem.channel}`,
          text: poolItem.text,
          timestamp: now,
        };
        return {
          ...prev,
          resources: {
            ...prev.resources,
            funds: prev.resources.funds + 140,
            research: prev.resources.research + 45,
            samples: (prev.resources.samples ?? 0) + 2,
          },
          totalFundsEarned: prev.totalFundsEarned + 140,
          totalResearchEarned: prev.totalResearchEarned + 45,
          totalSamplesEarned: (prev.totalSamplesEarned ?? 0) + 2,
          secretRooms: secretRooms.map((sr) =>
            sr.id === secretRoomId ? { ...sr, lastUsedAt: now } : sr
          ),
          strangeMessages: [interceptedMsg, ...(prev.strangeMessages ?? [])].slice(0, 14),
        };
      });
    },
    [commitState]
  );

  const handleListenPneumaticTube = useCallback(() => {
    commitState((prev) => {
      const now = Date.now();
      const latestAt = prev.strangeMessages?.[0]?.timestamp ?? 0;
      if (now - latestAt < 40_000) return prev;
      soundFX.pneumatic();
      const poolItem =
        STRANGE_MESSAGE_POOL[Math.floor(Math.random() * STRANGE_MESSAGE_POOL.length)];
      const newMsg = {
        id: `msg_tube_${now}`,
        sender: poolItem.sender,
        channel: poolItem.channel,
        text: poolItem.text,
        timestamp: now,
      };
      return {
        ...prev,
        resources: {
          ...prev.resources,
          research: prev.resources.research + 12,
        },
        totalResearchEarned: prev.totalResearchEarned + 12,
        strangeMessages: [newMsg, ...(prev.strangeMessages ?? [])].slice(0, 14),
      };
    });
  }, [commitState]);

  const handleResolveChoice = useCallback(
    (notifId: string, choice: NotificationChoice) => {
      soundFX.collect();
      commitState((prev) => {
        const now = Date.now();
        const targetNotif = prev.notifications.find((n) => n.id === notifId);
        let nextObjects = prev.objects;
        let nextRooms = { ...prev.rooms };
        let nextEmployees = prev.employees;
        let nextFloor3Unlocked = prev.floor3Unlocked;
        let nextActivityLog = prev.employeeActivityLog;
        let nextArchivedDocs = prev.archivedDocuments ?? INITIAL_ARCHIVED_DOCUMENTS;
        let nextStrangeMessages = prev.strangeMessages ?? [];
        let extraFunds = 0;
        let extraSamples = 0;
        let extraOutcome = '';

        if (choice.unlockObjectId) {
          const target = prev.objects.find(
            (o) => o.id === choice.unlockObjectId && o.status === 'locked'
          );
          if (target) {
            nextObjects = nextObjects.map((o) =>
              o.id === target.id
                ? { ...o, status: 'intake' as const, discoveredAt: now }
                : o
            );
            extraOutcome = ` Discovered ${target.code} (${target.name})!`;
          }
        } else if (choice.deliverNewObject) {
          const currentEra = prev.prestigeEra ?? 1;
          const isEraEligible = (o: (typeof nextObjects)[number]) =>
            (o.minPrestigeEra ?? 1) <= currentEra ||
            (o.id === 'obj_paradox_compass' && hasPrestigeTech(prev, 'pres_chronal_archive')) ||
            (o.id === 'obj_klein_box' && hasPrestigeTech(prev, 'pres_dimensional_vault'));
          const lockedObj =
            nextObjects.find((o) => o.status === 'locked' && isEraEligible(o) && o.rarity === 'Impossible') ??
            nextObjects.find((o) => o.status === 'locked' && isEraEligible(o) && o.discoverySource === 'delivery') ??
            nextObjects.find((o) => o.status === 'locked' && isEraEligible(o));
          if (lockedObj) {
            nextObjects = nextObjects.map((o) =>
              o.id === lockedObj.id
                ? { ...o, status: 'intake' as const, discoveredAt: now }
                : o
            );
            extraOutcome = ` Unboxed ${lockedObj.code} (${lockedObj.name}, ${lockedObj.rarity})!`;
          }
        }

        if (choice.relocateAssignedObjectToIntake) {
          const wandering = nextObjects.find(
            (o) => o.assignedRoomId !== null && o.id !== 'obj_toaster'
          );
          if (wandering && wandering.assignedRoomId) {
            const oldRoom = nextRooms[wandering.assignedRoomId];
            const filteredIds = getRoomAssignedObjectIds(oldRoom).filter(
              (id) => id !== wandering.id
            );
            nextRooms[wandering.assignedRoomId] = {
              ...oldRoom,
              assignedObjectIds: filteredIds,
              assignedObjectId: filteredIds[0] ?? null,
            };
            nextObjects = nextObjects.map((o) =>
              o.id === wandering.id
                ? {
                    ...o,
                    assignedRoomId: null,
                    status: o.investigated ? ('contained' as const) : ('intake' as const),
                  }
                : o
            );
            extraOutcome += ` ${wandering.name} returned to staging!`;
          }
        }

        if (choice.recruitMissingEmployee) {
          const missingEmp = nextEmployees.find((e) => !e.hired);
          if (missingEmp) {
            let autoRoom: RoomId | null = null;
            const specRt = nextRooms[missingEmp.specialtyRoom];
            if (specRt.unlocked && specRt.assignedEmployeeIds.length < specRt.staffCapacity) {
              autoRoom = missingEmp.specialtyRoom;
            } else {
              autoRoom =
                (Object.keys(ROOM_DEFINITIONS) as RoomId[]).find(
                  (rId) =>
                    nextRooms[rId].unlocked &&
                    nextRooms[rId].assignedEmployeeIds.length < nextRooms[rId].staffCapacity
                ) ?? null;
            }
            if (autoRoom) {
              nextRooms[autoRoom] = {
                ...nextRooms[autoRoom],
                assignedEmployeeIds: [...nextRooms[autoRoom].assignedEmployeeIds, missingEmp.id],
              };
            }
            nextEmployees = nextEmployees.map((e) => {
              if (e.id !== missingEmp.id) return e;
              const recruited = {
                ...e,
                hired: true,
                assignedRoomId: autoRoom,
                lastActionAt: now - 3000,
              };
              return grantEmployeeExperience(recruited, 65, prev).employee;
            });
            nextActivityLog = [
              {
                id: `evt_recruit_${missingEmp.id}_${now}`,
                employeeId: missingEmp.id,
                employeeName: missingEmp.name,
                role: missingEmp.role,
                roomId: autoRoom,
                text: 'Returned from the 1998 coffee run and rejoined payroll!',
                rewardText: 'Reinstated!',
                timestamp: now,
              },
              ...nextActivityLog,
            ].slice(0, 14);
            soundFX.discovery();
            extraOutcome += ` ${missingEmp.name} (${missingEmp.role}) rejoined payroll!`;
          } else {
            extraFunds += 190;
            extraSamples += 2;
            extraOutcome += ' All staff already hired — gained +$190 & +2 Samples instead!';
          }
        }

        if (choice.unlockNextLockedRoom) {
          const nextLockedRoomId = (Object.keys(ROOM_DEFINITIONS) as RoomId[]).find((rId) => {
            const def = ROOM_DEFINITIONS[rId];
            return !nextRooms[rId].unlocked && (def.floor < 3 || nextFloor3Unlocked);
          });
          if (nextLockedRoomId) {
            nextRooms[nextLockedRoomId] = {
              ...nextRooms[nextLockedRoomId],
              unlocked: true,
            };
            soundFX.discovery();
            extraOutcome += ` Unlocked ${ROOM_DEFINITIONS[nextLockedRoomId].name} for free!`;
          } else {
            extraFunds += 220;
            extraOutcome += ' All floor rooms already open — gained +$220 grant!';
          }
        }

        if (choice.unlockFloor3) {
          if (!nextFloor3Unlocked) {
            nextFloor3Unlocked = true;
            soundFX.discovery();
            extraOutcome += ' Sub-Level B2 Elevator is now permanently accessible!';
          } else {
            extraFunds += 180;
            extraSamples += 2;
            extraOutcome += ' Sub-Level B2 already open — salvaged +$180 & +2 Samples!';
          }
        }

        if ((choice.staffEnergyDelta ?? 0) !== 0 || (choice.staffXpDelta ?? 0) > 0) {
          nextEmployees = nextEmployees.map((emp) => {
            if (!emp.hired) return emp;
            const nextEnergy = Math.max(
              25,
              Math.min(100, emp.energy + (choice.staffEnergyDelta ?? 0))
            );
            const energized = { ...emp, energy: nextEnergy };
            if ((choice.staffXpDelta ?? 0) > 0) {
              return grantEmployeeExperience(energized, choice.staffXpDelta ?? 0, prev).employee;
            }
            return energized;
          });
        }

        let nextBoosts = (prev.activeBoosts ?? []).filter((b) => b.expiresAt > now);
        if (choice.triggerBoost) {
          nextBoosts = [
            ...nextBoosts,
            {
              id: `${choice.triggerBoost.id}_${now}`,
              label: choice.triggerBoost.label,
              description: choice.triggerBoost.description,
              fundsMult: choice.triggerBoost.fundsMult,
              researchMult: choice.triggerBoost.researchMult,
              samplesMult: choice.triggerBoost.samplesMult,
              deliverySpeedMult: choice.triggerBoost.deliverySpeedMult,
              investigationSpeedMult: choice.triggerBoost.investigationSpeedMult,
              expiresAt: now + choice.triggerBoost.durationSec * 1000,
            },
          ];
        }

        if (targetNotif?.eventId === 'evt_sec_unidentified_employee') {
          const alreadyDoc = nextArchivedDocs.find((d) => d.id === 'doc_original_staff')?.unlocked;
          if (!alreadyDoc) {
            nextArchivedDocs = nextArchivedDocs.map((d) =>
              d.id === 'doc_original_staff' ? { ...d, unlocked: true } : d
            );
            extraOutcome += ' Unlocked Dept. 404 File: Personnel Audit (Badge #0000)!';
          }
        }

        if (
          targetNotif?.eventId === 'evt_sec_pneumatic_note_1974' ||
          targetNotif?.eventId === 'evt_sec_department_dossier' ||
          targetNotif?.eventId === 'evt_sec_filing_whisper'
        ) {
          const poolItem =
            STRANGE_MESSAGE_POOL[Math.floor(Math.random() * STRANGE_MESSAGE_POOL.length)];
          nextStrangeMessages = [
            {
              id: `msg_evt_${now}`,
              sender: targetNotif.title,
              channel: poolItem.channel,
              text: `${choice.outcomeText} ("${poolItem.text}")`,
              timestamp: now,
            },
            ...nextStrangeMessages,
          ].slice(0, 14);
        }

        const totalFundsDelta = (choice.fundsDelta ?? 0) + extraFunds;
        const samplesDelta = (choice.samplesDelta ?? 0) + extraSamples;

        return {
          ...prev,
          floor3Unlocked: nextFloor3Unlocked,
          resources: {
            ...prev.resources,
            funds: Math.max(0, prev.resources.funds + totalFundsDelta),
            research: prev.resources.research + (choice.researchDelta ?? 0),
            reputation: prev.resources.reputation + (choice.reputationDelta ?? 0),
            samples: Math.max(0, (prev.resources.samples ?? 0) + samplesDelta),
          },
          totalFundsEarned: prev.totalFundsEarned + Math.max(0, totalFundsDelta),
          totalResearchEarned: prev.totalResearchEarned + (choice.researchDelta ?? 0),
          totalSamplesEarned: (prev.totalSamplesEarned ?? 0) + Math.max(0, samplesDelta),
          totalDeliveriesProcessed: prev.totalDeliveriesProcessed + 1,
          activeBoosts: nextBoosts,
          rooms: nextRooms,
          employees: nextEmployees,
          employeeActivityLog: nextActivityLog,
          objects: nextObjects,
          archivedDocuments: nextArchivedDocs,
          strangeMessages: nextStrangeMessages,
          notifications: prev.notifications.map((n) =>
            n.id === notifId
              ? {
                  ...n,
                  read: true,
                  resolved: true,
                  resolvedText: `${choice.outcomeText}${extraOutcome}`,
                }
              : n
          ),
        };
      });
    },
    [commitState]
  );

  const handleDismissNotification = useCallback(
    (notifId: string) => {
      soundFX.click();
      commitState((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) =>
          n.id === notifId ? { ...n, read: true, resolved: true } : n
        ),
      }));
    },
    [commitState]
  );

  const handleTriggerDelivery = useCallback(() => {
    commitState((prev) => {
      const now = Date.now();
      if (now < prev.nextDeliveryCooldownAt) return prev;
      soundFX.pneumatic();

      const deliveryTemplates = RANDOM_EVENTS_CATALOG.filter((t) => t.kind === 'delivery');
      const tpl = deliveryTemplates[Math.floor(Math.random() * deliveryTemplates.length)];

      return {
        ...prev,
        nextDeliveryCooldownAt: now + Math.round(20_000 * rates.deliveryIntervalMult),
        eventCategoryHistory: {
          ...(prev.eventCategoryHistory ?? {
            positive: 0,
            negative: 0,
            neutral: 0,
            rare: 0,
            secret: 0,
          }),
          [tpl.category]: (prev.eventCategoryHistory?.[tpl.category] ?? 0) + 1,
        },
        notifications: [
          {
            id: `manual_del_${now}`,
            eventId: tpl.id,
            category: tpl.category,
            kind: tpl.kind,
            title: tpl.title,
            message: formatEventMessage(tpl.message, prev),
            timestamp: now,
            read: false,
            resolved: false,
            choices: tpl.choices,
          },
          ...prev.notifications,
        ].slice(0, 20),
      };
    });
  }, [commitState, rates.deliveryIntervalMult]);

  const handleUpdateSettings = useCallback(
    (partial: Partial<GameSettings>) => {
      soundFX.click();
      commitState((prev) => ({
        ...prev,
        settings: { ...prev.settings, ...partial },
      }));
    },
    [commitState]
  );

  const handleResetGame = useCallback(() => {
    soundFX.click();
    const fresh = clearSaveData();
    saveGameState(fresh);
    setGameState(fresh);
    setOfflineReport(null);
    setSelectedRoomId(null);
    setActiveTab('department');
    setInvestigationOpen(false);
    setLastAbilityMessage(null);
    setLastExplorationResult(null);
  }, []);

  const openInvestigationBench = useCallback(
    (objectId?: string) => {
      soundFX.click();
      setSelectedRoomId(null);
      if (objectId) {
        commitState((prev) => ({
          ...prev,
          selectedInvestigationObjectId: objectId,
        }));
      }
      setInvestigationOpen(true);
    },
    [commitState]
  );

  const handleTutorialPrimaryAction = useCallback(() => {
    const step = gameState.onboarding?.tutorialStep ?? 'completed';
    if (step === 'completed') return;

    if (step === 'welcome') {
      soundFX.upgrade();
      pushFeedback('investigation', 'Lab Open!', 'reputation');
      triggerRoomUpgradeFX('investigation');
      commitState((prev) => {
        const toaster = prev.objects.find((o) => o.id === 'obj_toaster');
        let nextRooms = {
          ...prev.rooms,
          investigation: { ...prev.rooms.investigation, unlocked: true },
        };
        let nextObjects = prev.objects;
        if (toaster && !toaster.investigated && !toaster.assignedRoomId) {
          nextRooms = {
            ...nextRooms,
            investigation: {
              ...nextRooms.investigation,
              assignedObjectId: 'obj_toaster',
              assignedObjectIds: ['obj_toaster'],
            },
          };
          nextObjects = prev.objects.map((o) =>
            o.id === 'obj_toaster'
              ? { ...o, assignedRoomId: 'investigation', status: 'investigating' as const }
              : o
          );
        }
        return {
          ...prev,
          rooms: nextRooms,
          objects: nextObjects,
          selectedInvestigationObjectId: 'obj_toaster',
          onboarding: {
            ...(prev.onboarding ?? DEFAULT_ONBOARDING_STATE),
            tutorialStep: 'investigate',
          },
        };
      });
      return;
    }

    if (step === 'investigate') {
      const toaster = gameState.objects.find((o) => o.id === 'obj_toaster');
      if (toaster && toaster.investigated) {
        soundFX.discovery();
        commitState((prev) => ({
          ...prev,
          rooms: {
            ...prev.rooms,
            containment: { ...prev.rooms.containment, unlocked: true },
          },
          onboarding: {
            ...(prev.onboarding ?? DEFAULT_ONBOARDING_STATE),
            tutorialStep: 'contain',
          },
        }));
      } else {
        handleManualInspectObject('obj_toaster');
      }
      return;
    }

    if (step === 'contain') {
      soundFX.upgrade();
      pushFeedback('containment', 'Toaster Contained!', 'funds');
      triggerRoomUpgradeFX('containment');
      setInvestigationOpen(false);
      setSelectedRoomId(null);
      setActiveTab('department');
      commitState((prev) => {
        const ob = prev.onboarding ?? DEFAULT_ONBOARDING_STATE;
        const nextRooms = { ...prev.rooms };
        (Object.keys(nextRooms) as RoomId[]).forEach((rId) => {
          const ids = getRoomAssignedObjectIds(nextRooms[rId]);
          if (ids.includes('obj_toaster')) {
            const filtered = ids.filter((id) => id !== 'obj_toaster');
            nextRooms[rId] = {
              ...nextRooms[rId],
              assignedObjectIds: filtered,
              assignedObjectId: filtered[0] ?? null,
            };
          }
        });
        const containIds = getRoomAssignedObjectIds(nextRooms.containment);
        const updatedContainIds = containIds.includes('obj_toaster')
          ? containIds
          : [...containIds, 'obj_toaster'];
        nextRooms.containment = {
          ...nextRooms.containment,
          unlocked: true,
          assignedObjectIds: updatedContainIds,
          assignedObjectId: updatedContainIds[0] ?? null,
        };
        nextRooms.reception = {
          ...nextRooms.reception,
          bonusReady: true,
        };
        const bonusFunds = ob.replayMode ? 0 : 45;
        return {
          ...prev,
          resources: {
            ...prev.resources,
            funds: prev.resources.funds + bonusFunds,
          },
          totalFundsEarned: prev.totalFundsEarned + bonusFunds,
          rooms: nextRooms,
          objects: prev.objects.map((o) =>
            o.id === 'obj_toaster'
              ? { ...o, assignedRoomId: 'containment', status: 'contained' as const }
              : o
          ),
          onboarding: {
            ...ob,
            tutorialStep: 'earn_rewards',
          },
        };
      });
      return;
    }

    if (step === 'earn_rewards') {
      handleManualWorkRoom('reception');
      return;
    }

    if (step === 'expand') {
      soundFX.click();
      setInvestigationOpen(false);
      setSelectedRoomId(null);
      if (gameState.onboarding?.replayMode) {
        commitState((prev) => ({
          ...prev,
          onboarding: finishTutorialState(prev, Date.now()),
        }));
      } else {
        setActiveTab('upgrades');
      }
    }
  }, [
    commitState,
    gameState.objects,
    gameState.onboarding?.replayMode,
    gameState.onboarding?.tutorialStep,
    handleManualInspectObject,
    handleManualWorkRoom,
    pushFeedback,
    triggerRoomUpgradeFX,
  ]);

  const handleSkipTutorial = useCallback(() => {
    soundFX.click();
    commitState((prev) => {
      const now = Date.now();
      return {
        ...prev,
        rooms: {
          ...prev.rooms,
          investigation: { ...prev.rooms.investigation, unlocked: true },
          containment: { ...prev.rooms.containment, unlocked: true },
        },
        onboarding: finishTutorialState(prev, now),
        nextEventAt: Math.min(prev.nextEventAt, now + 24_000),
      };
    });
  }, [commitState]);

  const handleDismissFeatureBanner = useCallback(
    (stage: ProgressionStage) => {
      soundFX.click();
      commitState((prev) => {
        const ob = prev.onboarding ?? DEFAULT_ONBOARDING_STATE;
        return {
          ...prev,
          onboarding: {
            ...ob,
            dismissedFeatureStage: Math.max(ob.dismissedFeatureStage, stage) as ProgressionStage,
          },
        };
      });
    },
    [commitState]
  );

  const handleClaimObjective = useCallback(
    (objectiveId: string) => {
      commitState((prev) => {
        const ob = prev.onboarding ?? DEFAULT_ONBOARDING_STATE;
        if (ob.claimedObjectiveIds.includes(objectiveId)) return prev;
        const obj = ONBOARDING_OBJECTIVES.find((o) => o.id === objectiveId);
        if (!obj || !obj.isComplete(prev)) return prev;

        soundFX.discovery();
        return {
          ...prev,
          resources: {
            ...prev.resources,
            funds: prev.resources.funds + obj.rewardFunds,
            research: prev.resources.research + obj.rewardResearch,
            reputation: prev.resources.reputation + obj.rewardReputation,
          },
          totalFundsEarned: prev.totalFundsEarned + obj.rewardFunds,
          totalResearchEarned: prev.totalResearchEarned + obj.rewardResearch,
          onboarding: {
            ...ob,
            claimedObjectiveIds: [...ob.claimedObjectiveIds, objectiveId],
          },
        };
      });
    },
    [commitState]
  );

  const handleReplayTutorial = useCallback(() => {
    soundFX.click();
    setSettingsOpen(false);
    setSelectedRoomId(null);
    setInvestigationOpen(false);
    setActiveTab('department');
    commitState((prev) => ({
      ...prev,
      onboarding: {
        ...(prev.onboarding ?? DEFAULT_ONBOARDING_STATE),
        tutorialStep: 'welcome',
        replayMode: true,
      },
    }));
  }, [commitState]);

  const onboardingState = gameState.onboarding;
  const progressionStage: ProgressionStage = onboardingState?.progressionStage ?? 6;
  const tutorialStep: TutorialStepId = onboardingState?.tutorialStep ?? 'completed';
  const unlockedTabs = useMemo(
    () => getUnlockedTabsForStage(progressionStage, tutorialStep),
    [progressionStage, tutorialStep]
  );
  const highlightTarget = getTutorialHighlightTarget(tutorialStep);
  const effectiveActiveTab: NavTab = unlockedTabs.includes(activeTab)
    ? activeTab
    : unlockedTabs[0] ?? 'department';

  const unreadNotifications = gameState.notifications.filter((n) => !n.resolved).length;
  const claimableDiscoveries = gameState.discoveries.filter((d) => d.unlocked && !d.claimed).length;
  const readyClassifiedCount = (gameState.classifiedProjects ?? []).filter(
    (p) => evaluateClassifiedProjectEligibility(p, gameState).canLaunch
  ).length;
  const affordableExperimental = (gameState.experimentalProjects ?? []).filter((p) => {
    const sampleCost = p.repeatable ? p.costSamples + p.completedCount * 2 : p.costSamples;
    return (
      (p.repeatable || p.completedCount < p.maxCompletions) &&
      (gameState.resources.samples ?? 0) >= sampleCost &&
      gameState.resources.research >= p.costResearch &&
      gameState.resources.reputation >= p.minReputation
    );
  }).length;
  const affordableResearch =
    gameState.researchNodes.filter((r) => {
      if (r.researched) return false;
      const pre = r.prerequisiteId
        ? gameState.researchNodes.find((p) => p.id === r.prerequisiteId)?.researched
        : true;
      return pre && gameState.resources.research >= getEffectiveResearchCost(r.costResearch, gameState);
    }).length + affordableExperimental;
  const affordableUpgrades = gameState.upgrades.filter(
    (u) =>
      u.purchasedCount < u.maxPurchases &&
      gameState.resources.funds >= getUpgradeNextCost(u.costFunds, u.purchasedCount)
  ).length;
  const intakeCount =
    gameState.objects.filter((o) => o.status === 'intake').length +
    gameState.specialAssignments.filter((a) => a.completed && !a.claimed).length;

  const activeInvObject = gameState.objects.find(
    (o) => o.status === 'investigating' && !o.investigated
  );

  const deliveryCooldownRemainingSec = Math.max(
    0,
    Math.ceil((gameState.nextDeliveryCooldownAt - nowMs) / 1000)
  );
  const explorationCooldownRemainingSec = Math.max(
    0,
    Math.ceil((gameState.nextExplorationAt - nowMs) / 1000)
  );

  if (screen === 'TITLE') {
    return (
      <TitleScreen
        hasSave={hasSave}
        onStartContinue={handleStartContinue}
        onStartNew={handleStartNew}
      />
    );
  }

  return (
    <div className="w-screen h-[100dvh] flex flex-col overflow-hidden bg-[#F4EFE4] text-[#26211C]">
      <TopResourceBar
        resources={gameState.resources}
        rates={rates}
        activeBoosts={gameState.activeBoosts ?? []}
        paused={gameState.settings.paused}
        unreadNotifications={unreadNotifications}
        investigationOpen={investigationOpen}
        activeInvestigationPct={activeInvObject ? activeInvObject.investigationProgress : null}
        saveFeedbackMsg={saveFeedbackMsg}
        progressionStage={progressionStage}
        tutorialStep={tutorialStep}
        highlightTarget={highlightTarget}
        onToggleInvestigation={() => {
          soundFX.click();
          setInvestigationOpen((v) => !v);
        }}
        onToggleNotifications={() => {
          soundFX.click();
          setEventsDrawerOpen((v) => !v);
        }}
        onOpenSettings={() => {
          soundFX.click();
          setSettingsOpen(true);
        }}
      />

      <GuidanceStrip
        gameState={gameState}
        onTutorialPrimaryAction={handleTutorialPrimaryAction}
        onSkipTutorial={handleSkipTutorial}
        onDismissFeatureBanner={handleDismissFeatureBanner}
        onClaimObjective={handleClaimObjective}
        onNavigateTab={(tab) => {
          soundFX.click();
          setInvestigationOpen(false);
          setActiveTab(tab);
        }}
      />

      <main className="relative flex-1 min-h-0 overflow-hidden">
        <div
          key={investigationOpen ? 'investigation' : effectiveActiveTab}
          className="w-full h-full animate-panel-enter"
        >
          {investigationOpen ? (
            <InvestigationScreen
              gameState={gameState}
              rates={rates}
              onBackToDepartment={() => {
                soundFX.click();
                setInvestigationOpen(false);
              }}
              onSelectObject={(objectId) => {
                soundFX.click();
                commitState((prev) => ({
                  ...prev,
                  selectedInvestigationObjectId: objectId,
                }));
              }}
              onPlaceInInvestigationRoom={(objectId, roomId) =>
                handleAssignObject(objectId, roomId)
              }
              onManualInspectObject={handleManualInspectObject}
              onAccelerateWithResearch={handleAccelerateWithResearch}
              onAssignEmployee={handleAssignEmployee}
              onSelectOrUnlockEquipment={handleSelectOrUnlockEquipment}
            />
          ) : (
            <>
              {effectiveActiveTab === 'department' && (
                <BuildingView
                  gameState={gameState}
                  rates={rates}
                  feedbacks={feedbacks}
                  recentUpgradedRoomId={recentUpgradedRoomId}
                  highlightTarget={highlightTarget}
                  onSelectRoom={(rId) => {
                    soundFX.click();
                    setSelectedRoomId(rId);
                  }}
                  onQuickPropClick={handleQuickPropClick}
                  onUnlockRoom={handleUnlockRoom}
                  onUnlockFloor3={handleUnlockFloor3}
                  onFindHiddenClue={handleFindHiddenClue}
                  onOpenClassifiedTab={() => {
                    soundFX.click();
                    setInvestigationOpen(false);
                    setDiscoveriesSubTab('classified');
                    setActiveTab('discoveries');
                  }}
                  onTriggerSecretRoomAction={handleTriggerSecretRoomAction}
                />
              )}

            {effectiveActiveTab === 'objects' && (
              <ObjectsPanel
                gameState={gameState}
                activeSynergies={rates.activeSynergies}
                explorationCooldownSec={explorationCooldownRemainingSec}
                lastAbilityMessage={lastAbilityMessage}
                lastExplorationResult={lastExplorationResult}
                onAssignObject={handleAssignObject}
                onManualInspectObject={handleManualInspectObject}
                onActivateAbility={handleActivateObjectAbility}
                onRunExploration={handleRunExploration}
                onClaimAssignment={handleClaimAssignment}
                onOpenInvestigationBench={(objId) => openInvestigationBench(objId)}
              />
            )}

            {effectiveActiveTab === 'employees' && (
              <EmployeesPanel
                gameState={gameState}
                rates={rates}
                onHireEmployee={handleHireEmployee}
                onAssignEmployee={handleAssignEmployee}
                onTrainEmployee={handleTrainEmployee}
                onMotivateEmployee={handleMotivateEmployee}
                onTriggerEmployeeAbility={handleTriggerEmployeeAbility}
                onUnlockOrEquipEmployeeGear={handleUnlockOrEquipEmployeeGear}
              />
            )}

            {effectiveActiveTab === 'research' && (
              <ResearchPanel
                gameState={gameState}
                onUnlockResearch={handleUnlockResearch}
                onCompleteExperimentalProject={handleCompleteExperimentalProject}
                onToggleAutomation={handleToggleAutomation}
                onPurchasePrestigeTech={handlePurchasePrestigeTech}
                onEnterNextOperationalEra={handleEnterNextOperationalEra}
              />
            )}

            {effectiveActiveTab === 'upgrades' && (
              <UpgradesPanel
                gameState={gameState}
                rates={rates}
                onPurchaseUpgrade={handlePurchaseUpgrade}
                onUpgradeRoom={handleUpgradeRoom}
                onUpgradeRoomEquipment={handleUpgradeRoomEquipment}
                onExpandObjectCapacity={handleExpandObjectCapacity}
                onExpandStaffCapacity={handleExpandStaffCapacity}
                onUnlockRoom={handleUnlockRoom}
                onUnlockFloor3={handleUnlockFloor3}
              />
            )}

            {effectiveActiveTab === 'discoveries' && (
              <DiscoveriesPanel
                gameState={gameState}
                initialSubTab={discoveriesSubTab}
                onClaimDiscovery={handleClaimDiscovery}
                onCompleteClassifiedProject={handleCompleteClassifiedProject}
                onTriggerSecretRoomAction={handleTriggerSecretRoomAction}
                onListenPneumaticTube={handleListenPneumaticTube}
              />
            )}
            </>
          )}
        </div>

        <NotificationArea
          notifications={gameState.notifications}
          resources={gameState.resources}
          eventCategoryHistory={gameState.eventCategoryHistory}
          drawerOpen={eventsDrawerOpen}
          onCloseDrawer={() => setEventsDrawerOpen(false)}
          onResolveChoice={handleResolveChoice}
          onDismissNotification={handleDismissNotification}
          onTriggerDelivery={handleTriggerDelivery}
          deliveryCooldownRemainingSec={deliveryCooldownRemainingSec}
        />
      </main>

      <BottomNavBar
        activeTab={effectiveActiveTab}
        visibleTabs={unlockedTabs}
        highlightTab={tutorialStep === 'expand' ? 'upgrades' : null}
        onSelectTab={(tab) => {
          soundFX.click();
          setInvestigationOpen(false);
          if (tab !== 'discoveries') {
            setDiscoveriesSubTab('milestones');
          }
          setActiveTab(tab);
        }}
        badges={{
          objects: intakeCount,
          research: affordableResearch,
          upgrades: affordableUpgrades,
          discoveries: claimableDiscoveries + readyClassifiedCount,
        }}
      />

      <RoomInspectorModal
        roomId={selectedRoomId}
        gameState={gameState}
        rates={rates}
        onClose={() => setSelectedRoomId(null)}
        onUnlockRoom={handleUnlockRoom}
        onUpgradeRoom={handleUpgradeRoom}
        onUpgradeRoomEquipment={handleUpgradeRoomEquipment}
        onExpandObjectCapacity={handleExpandObjectCapacity}
        onExpandStaffCapacity={handleExpandStaffCapacity}
        onTriggerUniqueAction={handleTriggerRoomUniqueAction}
        onManualWorkRoom={handleManualWorkRoom}
        onAssignEmployee={handleAssignEmployee}
        onAssignObject={handleAssignObject}
        onOpenInvestigationBench={(objId) => openInvestigationBench(objId)}
      />

      <SettingsModal
        open={settingsOpen}
        settings={gameState.settings}
        lastSavedAt={gameState.lastSavedAt}
        backupTimestamp={getBackupSaveTimestamp()}
        onClose={() => setSettingsOpen(false)}
        onUpdateSettings={handleUpdateSettings}
        onManualSave={() => {
          const ok = saveGameState(stateRef.current);
          if (ok) {
            setHasSave(true);
            triggerSaveToast('Saved');
          }
          return ok;
        }}
        onExportSave={() => exportSaveJson(gameState)}
        onImportSave={(raw) => {
          const parsed = parseImportedSave(raw);
          if (!parsed) return false;
          saveGameState(parsed);
          setGameState(parsed);
          setOfflineReport(null);
          setHasSave(true);
          triggerSaveToast('Imported');
          return true;
        }}
        onRestoreBackup={() => {
          const restored = restoreBackupSave();
          if (!restored) return false;
          setGameState(restored);
          setOfflineReport(null);
          setHasSave(true);
          triggerSaveToast('Backup Restored');
          return true;
        }}
        onResetGame={handleResetGame}
        onReplayTutorial={handleReplayTutorial}
        onReturnTitle={() => {
          saveGameState(stateRef.current);
          setSettingsOpen(false);
          setScreen('TITLE');
        }}
      />

      <OfflineReportModal
        report={offlineReport}
        onClose={() => {
          soundFX.click();
          setOfflineReport(null);
        }}
      />
    </div>
  );
}
