import { createInitialGameState } from '../data/gameData';
import { GameState, OfflineReport, RoomId } from '../types/game';
import { simulateOfflineProgress } from './simulation';

const STORAGE_KEY = 'department_of_unusual_things_save_v1';
const BACKUP_STORAGE_KEY = 'department_of_unusual_things_save_backup_v1';

function isValidRawSave(parsed: unknown): parsed is GameState {
  return Boolean(
    parsed &&
      typeof parsed === 'object' &&
      'rooms' in parsed &&
      'objects' in parsed &&
      'resources' in parsed
  );
}

function safeNonNeg(val: unknown, fallback: number): number {
  const num = typeof val === 'number' && Number.isFinite(val) ? val : fallback;
  return Math.max(0, num);
}

export function hasSavedGame(): boolean {
  try {
    return Boolean(localStorage.getItem(STORAGE_KEY) || localStorage.getItem(BACKUP_STORAGE_KEY));
  } catch {
    return false;
  }
}

export function getBackupSaveTimestamp(): number | null {
  try {
    const raw = localStorage.getItem(BACKUP_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GameState>;
    return typeof parsed?.lastSavedAt === 'number' ? parsed.lastSavedAt : null;
  } catch {
    return null;
  }
}

export function saveGameState(state: GameState): boolean {
  try {
    const prevRaw = localStorage.getItem(STORAGE_KEY);
    if (prevRaw) {
      try {
        const prevParsed = JSON.parse(prevRaw);
        if (isValidRawSave(prevParsed)) {
          localStorage.setItem(BACKUP_STORAGE_KEY, prevRaw);
        }
      } catch {
        // Previous primary was corrupted; preserve existing backup untouched!
      }
    }

    const payload: GameState = {
      ...state,
      lastSavedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function migrateSavedState(parsed: GameState): GameState {
  const base = createInitialGameState();
  const isLegacyPreOnboarding = !parsed.onboarding;
  const legacyStarterRooms = new Set<RoomId>([
    'reception',
    'investigation',
    'research_desk',
    'containment',
  ]);

  const savedObjMap = new Map((parsed.objects ?? []).map((o) => [o.id, o]));
  const mergedObjects = base.objects.map((baseObj) => {
    const saved = savedObjMap.get(baseObj.id);
    if (!saved) return baseObj;

    const progress = saved.investigationProgress ?? baseObj.investigationProgress;
    const investigated = saved.investigated ?? baseObj.investigated;
    const currentStage = Math.min(5, Math.floor(progress / 20) + 1);
    const savedHiddenMap = new Map((saved.hiddenProperties ?? []).map((h) => [h.id, h]));

    return {
      ...baseObj,
      status: saved.status ?? baseObj.status,
      investigationProgress: progress,
      investigated,
      assignedRoomId: saved.assignedRoomId ?? baseObj.assignedRoomId,
      discoveredAt: saved.discoveredAt ?? baseObj.discoveredAt,
      lastAbilityUsedAt: saved.lastAbilityUsedAt,
      secondaryAbilityUnlocked:
        saved.secondaryAbilityUnlocked ?? (investigated || progress >= 80),
      rareVariant: saved.rareVariant ?? null,
      investigationReports:
        saved.investigationReports && saved.investigationReports.length > 0
          ? saved.investigationReports
          : baseObj.investigationReports,
      hiddenProperties: baseObj.hiddenProperties.map((hp) => {
        const sHp = savedHiddenMap.get(hp.id);
        return {
          ...hp,
          revealed: sHp?.revealed ?? (investigated || currentStage > hp.unlockAtStage),
        };
      }),
    };
  });

  const validObjIds = new Set(mergedObjects.map((o) => o.id));
  const mergedRooms = { ...base.rooms };
  (Object.keys(mergedRooms) as RoomId[]).forEach((rId) => {
    const savedRoom = parsed.rooms?.[rId];
    if (savedRoom) {
      let nextObjIds: string[] = mergedRooms[rId].assignedObjectIds;
      if (Array.isArray(savedRoom.assignedObjectIds)) {
        nextObjIds = savedRoom.assignedObjectIds.filter((id) => validObjIds.has(id));
      } else if (savedRoom.assignedObjectId && validObjIds.has(savedRoom.assignedObjectId)) {
        nextObjIds = [savedRoom.assignedObjectId];
      } else if (savedRoom.assignedObjectId === null) {
        nextObjIds = [];
      }

      const unlocked =
        savedRoom.unlocked !== undefined
          ? savedRoom.unlocked
          : isLegacyPreOnboarding && legacyStarterRooms.has(rId)
          ? true
          : mergedRooms[rId].unlocked;

      mergedRooms[rId] = {
        ...mergedRooms[rId],
        ...savedRoom,
        unlocked,
        equipmentLevel: savedRoom.equipmentLevel ?? mergedRooms[rId].equipmentLevel,
        objectCapacity: Math.max(
          mergedRooms[rId].objectCapacity,
          savedRoom.objectCapacity ?? mergedRooms[rId].objectCapacity,
          nextObjIds.length
        ),
        staffCapacity: Math.max(
          mergedRooms[rId].staffCapacity,
          savedRoom.staffCapacity ?? mergedRooms[rId].staffCapacity
        ),
        assignedObjectIds: nextObjIds,
        assignedObjectId: nextObjIds[0] ?? null,
        lastUniqueActionAt: savedRoom.lastUniqueActionAt ?? 0,
      };
    } else if (isLegacyPreOnboarding && legacyStarterRooms.has(rId)) {
      mergedRooms[rId] = {
        ...mergedRooms[rId],
        unlocked: true,
      };
    }
  });

  const floor3WasUnlocked =
    Boolean(parsed.floor3Unlocked) ||
    mergedRooms.break_lounge.unlocked ||
    mergedRooms.temporal_lab.unlocked ||
    mergedRooms.quantum_pantry.unlocked;

  const savedResMap = new Map((parsed.researchNodes ?? []).map((r) => [r.id, r]));
  const mergedResearch = base.researchNodes.map((r) => {
    const s = savedResMap.get(r.id);
    return s ? { ...r, researched: s.researched } : r;
  });

  const savedUpgMap = new Map((parsed.upgrades ?? []).map((u) => [u.id, u]));
  const mergedUpgrades = base.upgrades.map((u) => {
    const s = savedUpgMap.get(u.id);
    return s ? { ...u, purchasedCount: s.purchasedCount } : u;
  });

  const savedEmpMap = new Map((parsed.employees ?? []).map((e) => [e.id, e]));
  const mergedEmployees = base.employees.map((e) => {
    const s = savedEmpMap.get(e.id);
    if (!s) return e;
    const lv = Math.max(1, Math.min(10, s.level ?? e.level));
    const levelSteps = lv - 1;
    const recomputedThreshold = Math.round(e.xpToNextLevel * Math.pow(1.45, levelSteps));

    return {
      ...e,
      hired: s.hired ?? e.hired,
      assignedRoomId: s.assignedRoomId ?? e.assignedRoomId,
      level: lv,
      experience: s.experience ?? (lv === 1 ? e.experience : 0),
      xpToNextLevel: s.xpToNextLevel ?? recomputedThreshold,
      productivity:
        s.productivity ?? Number((e.productivity + levelSteps * 0.12).toFixed(2)),
      yieldBonus:
        s.yieldBonus ?? Number((e.yieldBonus + levelSteps * 0.08).toFixed(2)),
      speedBonus:
        s.speedBonus ?? Number((e.speedBonus + levelSteps * 0.06).toFixed(2)),
      energy: s.energy ?? e.energy,
      equippedGearId:
        s.equippedGearId !== undefined ? s.equippedGearId : e.equippedGearId,
      currentTask: s.currentTask ?? e.currentTask,
      lastActionAt: s.lastActionAt ?? 0,
      lastAbilityAt: s.lastAbilityAt ?? 0,
      lastMotivatedAt: s.lastMotivatedAt ?? 0,
    };
  });

  const savedEmpGearMap = new Map(
    (parsed.employeeEquipment ?? []).map((g) => [g.id, g])
  );
  const mergedEmployeeEquipment = base.employeeEquipment.map((g) => {
    const s = savedEmpGearMap.get(g.id);
    return s ? { ...g, unlocked: s.unlocked ?? g.unlocked } : g;
  });

  const savedDiscMap = new Map((parsed.discoveries ?? []).map((d) => [d.id, d]));
  const mergedDiscoveries = base.discoveries.map((d) => {
    const s = savedDiscMap.get(d.id);
    return s ? { ...d, unlocked: s.unlocked, claimed: s.claimed } : d;
  });

  const savedAssignMap = new Map((parsed.specialAssignments ?? []).map((a) => [a.id, a]));
  const mergedAssignments = base.specialAssignments.map((a) => {
    const s = savedAssignMap.get(a.id);
    return s ? { ...a, completed: s.completed, claimed: s.claimed } : a;
  });

  const savedGearMap = new Map((parsed.investigationEquipment ?? []).map((g) => [g.id, g]));
  const mergedGear = base.investigationEquipment.map((g) => {
    const s = savedGearMap.get(g.id);
    return s ? { ...g, unlocked: s.unlocked } : g;
  });

  const savedExpProjMap = new Map(
    (parsed.experimentalProjects ?? []).map((p) => [p.id, p])
  );
  const mergedExpProjects = base.experimentalProjects.map((p) => {
    const s = savedExpProjMap.get(p.id);
    return s ? { ...p, completedCount: s.completedCount ?? p.completedCount } : p;
  });

  const savedPrestigeMap = new Map(
    (parsed.prestigeTechnologies ?? []).map((t) => [t.id, t])
  );
  const mergedPrestigeTechs = base.prestigeTechnologies.map((t) => {
    const s = savedPrestigeMap.get(t.id);
    return s ? { ...t, purchased: Boolean(s.purchased) } : t;
  });

  const savedClassifiedMap = new Map(
    (parsed.classifiedProjects ?? []).map((p) => [p.id, p])
  );
  const mergedClassified = base.classifiedProjects.map((p) => {
    const s = savedClassifiedMap.get(p.id);
    return s ? { ...p, completed: Boolean(s.completed), completedAt: s.completedAt ?? null } : p;
  });

  const savedDocsMap = new Map(
    (parsed.archivedDocuments ?? []).map((d) => [d.id, d])
  );
  const mergedDocs = base.archivedDocuments.map((d) => {
    const s = savedDocsMap.get(d.id);
    return s ? { ...d, unlocked: Boolean(s.unlocked) } : d;
  });

  const savedSecretMap = new Map(
    (parsed.secretRooms ?? []).map((sr) => [sr.id, sr])
  );
  const mergedSecrets = base.secretRooms.map((sr) => {
    const s = savedSecretMap.get(sr.id);
    return s
      ? { ...sr, discovered: Boolean(s.discovered), lastUsedAt: s.lastUsedAt ?? 0 }
      : sr;
  });

  const mergedConvIds = Array.from(
    new Set([...(base.unlockedConversations ?? []), ...(parsed.unlockedConversations ?? [])])
  );

  const now = Date.now();
  const activeBoosts = Array.isArray(parsed.activeBoosts)
    ? parsed.activeBoosts.filter((b) => b && b.expiresAt > now)
    : [];

  const onboarding = isLegacyPreOnboarding
    ? {
        tutorialStep: 'completed' as const,
        tutorialCompleted: true,
        progressionStage: 6 as const,
        claimedObjectiveIds: [],
        dismissedFeatureStage: 6 as const,
        replayMode: false,
      }
    : {
        tutorialStep: parsed.onboarding?.tutorialStep ?? 'completed',
        tutorialCompleted: Boolean(parsed.onboarding?.tutorialCompleted),
        progressionStage: parsed.onboarding?.progressionStage ?? 1,
        claimedObjectiveIds: Array.isArray(parsed.onboarding?.claimedObjectiveIds)
          ? parsed.onboarding.claimedObjectiveIds
          : [],
        dismissedFeatureStage: parsed.onboarding?.dismissedFeatureStage ?? 1,
        replayMode: Boolean(parsed.onboarding?.replayMode),
      };

  return {
    ...base,
    ...parsed,
    version: 10,
    onboarding,
    floor3Unlocked: floor3WasUnlocked,
    resources: {
      funds: safeNonNeg(parsed.resources?.funds, base.resources.funds),
      research: safeNonNeg(parsed.resources?.research, base.resources.research),
      reputation: safeNonNeg(parsed.resources?.reputation, base.resources.reputation),
      samples: safeNonNeg(parsed.resources?.samples, base.resources.samples),
    },
    totalFundsEarned: safeNonNeg(parsed.totalFundsEarned, base.totalFundsEarned),
    totalResearchEarned: safeNonNeg(parsed.totalResearchEarned, base.totalResearchEarned),
    totalSamplesEarned: safeNonNeg(parsed.totalSamplesEarned, base.totalSamplesEarned),
    settings: { ...base.settings, ...parsed.settings },
    rooms: mergedRooms,
    objects: mergedObjects,
    employees: mergedEmployees,
    employeeEquipment: mergedEmployeeEquipment,
    employeeActivityLog: Array.isArray(parsed.employeeActivityLog)
      ? parsed.employeeActivityLog.slice(0, 14)
      : base.employeeActivityLog,
    upgrades: mergedUpgrades,
    researchNodes: mergedResearch,
    experimentalProjects: mergedExpProjects,
    activeBoosts,
    discoveries: mergedDiscoveries,
    specialAssignments: mergedAssignments,
    investigationEquipment: mergedGear,
    equippedInvestigationGearId:
      parsed.equippedInvestigationGearId ?? base.equippedInvestigationGearId,
    selectedInvestigationObjectId:
      parsed.selectedInvestigationObjectId ?? base.selectedInvestigationObjectId,
    hiddenCluesFound: parsed.hiddenCluesFound ?? [],
    expeditionsCompleted: parsed.expeditionsCompleted ?? 0,
    nextExplorationAt: parsed.nextExplorationAt ?? Date.now(),
    eventCooldowns:
      parsed.eventCooldowns && typeof parsed.eventCooldowns === 'object'
        ? parsed.eventCooldowns
        : {},
    eventCategoryHistory: {
      ...base.eventCategoryHistory,
      ...(parsed.eventCategoryHistory ?? {}),
    },
    prestigeEra: Math.max(1, parsed.prestigeEra ?? base.prestigeEra),
    prestigeCurrency: Math.max(0, parsed.prestigeCurrency ?? base.prestigeCurrency),
    prestigeTechnologies: mergedPrestigeTechs,
    automationSettings: {
      ...base.automationSettings,
      ...(parsed.automationSettings ?? {}),
    },
    classifiedProjects: mergedClassified,
    archivedDocuments: mergedDocs,
    unlockedConversations: mergedConvIds,
    secretRooms: mergedSecrets,
    strangeMessages:
      Array.isArray(parsed.strangeMessages) && parsed.strangeMessages.length > 0
        ? parsed.strangeMessages.slice(0, 16)
        : base.strangeMessages,
  };
}

export function loadGameState(): {
  state: GameState;
  offlineReport: OfflineReport | null;
  recoveredFromBackup: boolean;
} {
  const tryParse = (raw: string | null): GameState | null => {
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return isValidRawSave(parsed) ? migrateSavedState(parsed) : null;
    } catch {
      return null;
    }
  };

  try {
    let recoveredFromBackup = false;
    let merged = tryParse(localStorage.getItem(STORAGE_KEY));

    if (!merged) {
      const backupMerged = tryParse(localStorage.getItem(BACKUP_STORAGE_KEY));
      if (backupMerged) {
        merged = backupMerged;
        recoveredFromBackup = true;
        saveGameState(backupMerged);
      }
    }

    if (!merged) {
      return { state: createInitialGameState(), offlineReport: null, recoveredFromBackup: false };
    }

    const elapsedSec = Math.max(
      0,
      Math.floor((Date.now() - (merged.lastSavedAt || Date.now())) / 1000)
    );

    if (elapsedSec > 8 && !merged.settings.paused) {
      const { nextState, report } = simulateOfflineProgress(merged, elapsedSec);
      return { state: nextState, offlineReport: report, recoveredFromBackup };
    }

    return { state: merged, offlineReport: null, recoveredFromBackup };
  } catch {
    return { state: createInitialGameState(), offlineReport: null, recoveredFromBackup: false };
  }
}

export function restoreBackupSave(): GameState | null {
  try {
    const raw = localStorage.getItem(BACKUP_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!isValidRawSave(parsed)) return null;
    const restored = migrateSavedState(parsed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...restored, lastSavedAt: Date.now() }));
    return restored;
  } catch {
    return null;
  }
}

export function clearSaveData(): GameState {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(BACKUP_STORAGE_KEY);
  } catch {
    // Ignore
  }
  return createInitialGameState();
}

export function exportSaveJson(state: GameState): string {
  return JSON.stringify(state, null, 2);
}

export function parseImportedSave(raw: string): GameState | null {
  try {
    const parsed = JSON.parse(raw);
    if (!isValidRawSave(parsed)) {
      return null;
    }
    return migrateSavedState(parsed);
  } catch {
    return null;
  }
}
