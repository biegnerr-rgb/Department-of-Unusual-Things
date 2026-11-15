import { RANDOM_EVENT_TEMPLATES, ROOM_DEFINITIONS } from '../data/gameData';
import { INVESTIGATION_STAGES, RARITY_CONFIG } from '../data/objectCatalog';
import { hasPrestigeTech } from '../data/researchTreeData';
import { evaluatePassiveStoryUnlocks } from '../data/storyData';
import {
  ActiveObjectSynergy,
  Employee,
  EmployeeEquipment,
  EnvironmentAffinity,
  GameState,
  InvestigationEquipment,
  InvestigationReportEntry,
  OfflineReport,
  RoomDefinition,
  RoomId,
  RoomRuntimeState,
  UnusualObject,
} from '../types/game';

export const ENVIRONMENT_LABELS: Record<EnvironmentAffinity, string> = {
  laboratory: 'Laboratory',
  containment: 'Containment',
  archives: 'Archives',
  experimental: 'Experimental',
  deep_storage: 'Deep Storage',
  reality: 'Reality Wing',
};

export interface FacilityRates {
  fundsPerSec: number;
  grossFundsPerSec: number;
  totalSalaryPerSec: number;
  researchPerSec: number;
  reputationPerSec: number;
  samplesPerSec: number;
  investigationSpeedMultiplier: number;
  clickPowerMultiplier: number;
  roomCostDiscountPct: number;
  managerBoostPct: number;
  repFundingBonusPct: number;
  totalFundsMultiplier: number;
  totalResearchMultiplier: number;
  deliveryIntervalMult: number;
  offlineCapSec: number;
  offlineEfficiency: number;
  activeBoostLabel: string | null;
  activeSynergies: ActiveObjectSynergy[];
  roomRates: Record<
    RoomId,
    {
      fundsPerSec: number;
      researchPerSec: number;
      reputationPerSec: number;
      staffEfficiency: number;
      effectiveTier: number;
    }
  >;
}

export function getUpgradeCount(state: GameState, upgradeId: string): number {
  return state.upgrades.find((u) => u.id === upgradeId)?.purchasedCount ?? 0;
}

export function isResearched(state: GameState, researchId: string): boolean {
  return Boolean(state.researchNodes.find((r) => r.id === researchId)?.researched);
}

export function isExperimentalProjectDone(state: GameState, projectId: string): boolean {
  return (
    (state.experimentalProjects?.find((p) => p.id === projectId)?.completedCount ?? 0) > 0
  );
}

export function getEffectiveResearchCost(costResearch: number, state?: GameState): number {
  if (state && hasPrestigeTech(state, 'pres_reality_bench')) {
    return Math.max(10, Math.round(costResearch * 0.75));
  }
  return costResearch;
}

export function getOfflineSettings(state: GameState) {
  const loggerLevels = getUpgradeCount(state, 'upg_night_shift_loggers');
  const dimensionalCapBonus = isResearched(state, 'res_real_dimensional') ? 7200 : 0;
  const dimensionalEffBonus = isResearched(state, 'res_real_dimensional') ? 0.1 : 0;
  const capSeconds = 7200 + loggerLevels * 7200 + dimensionalCapBonus; // 2h base, up to 12h
  const efficiency = Math.min(0.95, 0.5 + loggerLevels * 0.1 + dimensionalEffBonus); // 50% base, up to 95%
  return {
    capSeconds,
    capHours: Math.round(capSeconds / 3600),
    efficiency,
    efficiencyPct: Math.round(efficiency * 100),
  };
}

export function getDepartmentRank(reputation: number): string {
  if (reputation >= 160) return 'Mythic Bureau of Curiosities';
  if (reputation >= 100) return 'Classified Flagship Facility';
  if (reputation >= 60) return 'Respected Anomaly Directorate';
  if (reputation >= 30) return 'Accredited Oddities Wing';
  if (reputation >= 12) return 'Active Field Office';
  return 'Obscure Basement Bureau';
}

export function getRoomCostDiscountMultiplier(state: GameState): number {
  const workshop = state.rooms.anomaly_workshop;
  if (!workshop || !workshop.unlocked) return 1;
  const discount =
    0.08 + (workshop.level - 1) * 0.03 + ((workshop.equipmentLevel ?? 1) - 1) * 0.025;
  return Math.max(0.72, 1 - discount);
}

export function getRoomEffectiveContainmentTier(
  roomId: RoomId,
  runtime?: Pick<RoomRuntimeState, 'level' | 'equipmentLevel'>,
  state?: GameState
): number {
  const def = ROOM_DEFINITIONS[roomId];
  const researchTierBonus =
    (state && isResearched(state, 'res_con_improved_chambers') ? 1 : 0) +
    (state && hasPrestigeTech(state, 'pres_dimensional_vault') ? 1 : 0);
  if (!runtime) return Math.min(3, def.containmentTierProvided + researchTierBonus);
  const lv = runtime.level ?? 1;
  const eq = runtime.equipmentLevel ?? 1;
  const tier2Unlock = lv >= 2 || eq >= 2 ? 1 : 0;
  const tier3Unlock = lv >= 4 || eq >= 3 ? 1 : 0;
  return Math.min(3, def.containmentTierProvided + tier2Unlock + tier3Unlock + researchTierBonus);
}

export function getRoomUpgradeCost(
  roomDef: Pick<RoomDefinition, 'unlockCostFunds'>,
  level: number,
  discountMultiplier = 1
): number {
  const base = Math.max(95, Math.round(roomDef.unlockCostFunds * 0.45) || 95);
  return Math.round(base * Math.pow(1.65, level - 1) * discountMultiplier);
}

export function getRoomEquipmentUpgradeCost(
  roomDef: Pick<RoomDefinition, 'unlockCostFunds' | 'floor'>,
  equipmentLevel: number,
  discountMultiplier = 1
): number {
  const base = Math.max(115, Math.round(roomDef.unlockCostFunds * 0.35) || 115 + (roomDef.floor - 1) * 60);
  return Math.round(base * Math.pow(1.75, equipmentLevel - 1) * discountMultiplier);
}

export function getRoomCapacityExpandCost(
  roomDef: Pick<RoomDefinition, 'unlockCostFunds' | 'floor'>,
  currentObjectCapacity: number,
  discountMultiplier = 1
): number {
  const base = Math.max(190, Math.round(roomDef.unlockCostFunds * 0.6) || 190 + (roomDef.floor - 1) * 110);
  return Math.round(base * Math.pow(1.9, Math.max(0, currentObjectCapacity - 1)) * discountMultiplier);
}

export function getRoomStaffExpandCost(
  roomDef: Pick<RoomDefinition, 'unlockCostFunds' | 'floor'>,
  currentStaffCapacity: number,
  discountMultiplier = 1
): number {
  const base = Math.max(240, Math.round(roomDef.unlockCostFunds * 0.65) || 240 + (roomDef.floor - 1) * 100);
  return Math.round(base * Math.pow(1.85, Math.max(0, currentStaffCapacity - 2)) * discountMultiplier);
}

export function getUpgradeNextCost(baseCost: number, purchasedCount: number): number {
  return Math.round(baseCost * Math.pow(1.65, purchasedCount));
}

export function getEnvironmentMatchInfo(
  obj: UnusualObject,
  roomId: RoomId
): { isMatch: boolean; bonusPct: number; label: string } {
  const def = ROOM_DEFINITIONS[roomId];
  const isMatch = def.environmentTypes.includes(obj.preferredEnvironment);
  if (!isMatch) {
    return {
      isMatch: false,
      bonusPct: 0,
      label: `Prefers ${ENVIRONMENT_LABELS[obj.preferredEnvironment]}`,
    };
  }
  const bonusPct =
    obj.id === 'obj_thunderstorm'
      ? 55
      : obj.requiredContainmentTier === 3
      ? 50
      : obj.preferredEnvironment === 'archives' ||
        obj.preferredEnvironment === 'deep_storage' ||
        obj.id === 'obj_overachieving_plant'
      ? 45
      : 40;
  return {
    isMatch: true,
    bonusPct,
    label: `Ideal Environment (+${bonusPct}%)`,
  };
}

export function getRoomAssignedObjectIds(runtime: RoomRuntimeState): string[] {
  if (Array.isArray(runtime.assignedObjectIds)) {
    return runtime.assignedObjectIds;
  }
  return runtime.assignedObjectId ? [runtime.assignedObjectId] : [];
}

export function getEquippedGear(state: GameState): InvestigationEquipment {
  return (
    state.investigationEquipment.find((e) => e.id === state.equippedInvestigationGearId) ??
    state.investigationEquipment[0]
  );
}

export function getStageInfo(progress: number) {
  const clamped = Math.max(0, Math.min(100, progress));
  const idx = clamped >= 100 ? 4 : Math.min(4, Math.floor(clamped / 20));
  const stage = INVESTIGATION_STAGES[idx];
  const stageLocalPct =
    clamped >= 100 ? 100 : Math.min(100, ((clamped - idx * 20) / 20) * 100);
  return {
    stageNumber: stage.stageNumber,
    stageName: stage.name,
    description: stage.description,
    stageLocalPct,
  };
}

export function getAccelerateResearchCost(obj: UnusualObject, state?: GameState): number {
  const rank = RARITY_CONFIG[obj.rarity].rank;
  const base = 10 + rank * 4;
  if (state && isResearched(state, 'res_inv_faster_analysis')) {
    return Math.max(4, Math.round(base * 0.75));
  }
  return base;
}

export function resolveInvestigationTransition(
  obj: UnusualObject,
  nextProgressRaw: number,
  gear: InvestigationEquipment,
  now: number,
  state?: GameState
): {
  updatedObject: UnusualObject;
  bonusFunds: number;
  bonusResearch: number;
  bonusReputation: number;
  unexpectedHeadline: string | null;
  completedNow: boolean;
} {
  const prevStage = Math.min(5, Math.floor(obj.investigationProgress / 20) + 1);
  const nextProgress = Math.min(100, nextProgressRaw);
  const completedNow = nextProgress >= 100 && !obj.investigated;
  const nextStage = completedNow ? 5 : Math.min(5, Math.floor(nextProgress / 20) + 1);

  let bonusFunds = 0;
  let bonusResearch = 0;
  let bonusReputation = 0;
  let unexpectedHeadline: string | null = null;
  let rareVariant = obj.rareVariant;
  let secondaryAbilityUnlocked = obj.secondaryAbilityUnlocked;

  const newReports: InvestigationReportEntry[] = [...obj.investigationReports];
  const thresholdsCrossed: number[] = [];

  for (let s = 1; s <= 5; s++) {
    const threshold = s * 20;
    if (obj.investigationProgress < threshold && nextProgress >= threshold) {
      thresholdsCrossed.push(s);
    }
  }

  thresholdsCrossed.forEach((stageNum) => {
    const stageMeta = INVESTIGATION_STAGES[stageNum - 1];
    const stageRp = Math.round(
      (4 + RARITY_CONFIG[obj.rarity].rank * 2) * (1 + gear.rpYieldBonusPct / 100)
    );
    bonusResearch += stageRp;

    let summary = '';
    if (stageNum === 1) {
      summary = `Initial inspection logged: verified dimensions and confirmed ${obj.containmentRequirement}.`;
    } else if (stageNum === 2) {
      summary = `Behavioral observation complete: recorded "${obj.shortQuirk}" under desk lighting.`;
    } else if (stageNum === 3) {
      summary = `Ability testing verified "${obj.specialAbility.name}" operates safely within normal tolerances.`;
    } else if (stageNum === 4) {
      secondaryAbilityUnlocked = true;
      summary = `Research analysis exposed hidden secondary ability: "${obj.secondaryAbilityName}"!`;
    } else {
      secondaryAbilityUnlocked = true;
      bonusFunds += Math.round(35 * RARITY_CONFIG[obj.rarity].multiplier);
      bonusResearch += Math.round(obj.researchValue * 0.35);
      bonusReputation += obj.reputationReward;
      summary = `Final classification certified (${obj.anomalyClass}). Full research value & containment bonus unlocked!`;
    }

    newReports.unshift({
      id: `rep_${obj.id}_s${stageNum}_${now}`,
      stageNumber: stageNum,
      stageName: stageMeta.name,
      timestamp: now,
      summary,
      rewardText:
        stageNum === 5
          ? `+$${Math.round(35 * RARITY_CONFIG[obj.rarity].multiplier)}, +${
              stageRp + Math.round(obj.researchValue * 0.35)
            } RP, +${obj.reputationReward} Rep`
          : `+${stageRp} RP`,
    });

    const unexpectedChance = Math.min(
      95,
      gear.unexpectedChancePct +
        (state && isResearched(state, 'res_inv_hidden_detection') ? 35 : 0)
    );
    if (stageNum >= 2 && Math.random() * 100 < unexpectedChance) {
      if (!rareVariant && stageNum >= 3 && Math.random() < 0.45) {
        rareVariant = obj.rareVariantCandidate;
        bonusReputation += 4;
        bonusFunds += 45;
        unexpectedHeadline = `Rare Variant Uncovered: ${obj.name} (${rareVariant})! Output +25%.`;
        newReports.unshift({
          id: `unexp_var_${obj.id}_${now}_${stageNum}`,
          stageNumber: stageNum,
          stageName: 'Unexpected Discovery',
          timestamp: now,
          summary: `Precision ${gear.name} spotted a rare "${rareVariant}" anomaly signature (+25% permanent yield)!`,
          isUnexpected: true,
          rewardText: '+$45, +4 Rep, +25% Yield',
        });
      } else {
        const extraF = Math.round(28 * RARITY_CONFIG[obj.rarity].multiplier);
        const extraR = Math.round(10 * RARITY_CONFIG[obj.rarity].multiplier);
        bonusFunds += extraF;
        bonusResearch += extraR;
        unexpectedHeadline = `Unexpected Finding on ${obj.code}: +$${extraF} & +${extraR} RP!`;
        newReports.unshift({
          id: `unexp_${obj.id}_${now}_${stageNum}`,
          stageNumber: stageNum,
          stageName: 'Unexpected Discovery',
          timestamp: now,
          summary: `Sub-surface scan revealed hidden markings during ${stageMeta.name}.`,
          isUnexpected: true,
          rewardText: `+$${extraF}, +${extraR} RP`,
        });
      }
    }
  });

  const nextHiddenProps = obj.hiddenProperties.map((hp) => {
    if (hp.revealed) return hp;
    if (nextStage > hp.unlockAtStage || completedNow) {
      return { ...hp, revealed: true };
    }
    return hp;
  });

  void prevStage;

  return {
    updatedObject: {
      ...obj,
      investigationProgress: nextProgress,
      investigated: obj.investigated || completedNow,
      secondaryAbilityUnlocked,
      hiddenProperties: nextHiddenProps,
      investigationReports: newReports.slice(0, 16),
      rareVariant,
    },
    bonusFunds,
    bonusResearch,
    bonusReputation,
    unexpectedHeadline,
    completedNow,
  };
}

export function evaluateObjectInteractions(state: GameState): ActiveObjectSynergy[] {
  const discovered = state.objects.filter((o) => o.status !== 'locked');
  const activeSynergies: ActiveObjectSynergy[] = [];
  const synergyBoost = isResearched(state, 'res_exp_combinations') ? 1.45 : 1;

  discovered.forEach((source) => {
    if (!source.interactionRules || source.interactionRules.length === 0) return;
    source.interactionRules.forEach((rule) => {
      if (rule.partnerObjectId === 'ANY_ACTIVE') {
        const others = discovered.filter(
          (o) => o.id !== source.id && (o.assignedRoomId !== null || o.investigated)
        );
        const partner =
          others.sort(
            (a, b) => RARITY_CONFIG[b.rarity].rank - RARITY_CONFIG[a.rarity].rank
          )[0] ?? discovered.find((o) => o.id !== source.id);

        if (partner) {
          activeSynergies.push({
            ruleId: rule.id,
            sourceObjectId: source.id,
            sourceObjectName: source.name,
            targetObjectId: partner.id,
            targetObjectName: partner.name,
            title: rule.title,
            description: `${rule.description} (Currently interacting with ${partner.name})`,
            bonusFundsPerSec: Number(((rule.bonusFundsPerSec ?? 0) * synergyBoost).toFixed(2)),
            bonusResearchPerSec: Number(((rule.bonusResearchPerSec ?? 0) * synergyBoost).toFixed(2)),
            bonusInvestigationSpeedPct: Math.round(
              (rule.bonusInvestigationSpeedPct ?? 0) * synergyBoost
            ),
          });
        }
        return;
      }

      const partner = discovered.find((o) => o.id === rule.partnerObjectId);
      if (partner) {
        activeSynergies.push({
          ruleId: rule.id,
          sourceObjectId: source.id,
          sourceObjectName: source.name,
          targetObjectId: partner.id,
          targetObjectName: partner.name,
          title: rule.title,
          description: rule.description,
          bonusFundsPerSec: Number(((rule.bonusFundsPerSec ?? 0) * synergyBoost).toFixed(2)),
          bonusResearchPerSec: Number(((rule.bonusResearchPerSec ?? 0) * synergyBoost).toFixed(2)),
          bonusInvestigationSpeedPct: Math.round(
            (rule.bonusInvestigationSpeedPct ?? 0) * synergyBoost
          ),
        });
      }
    });
  });

  return activeSynergies;
}

export function calculateFacilityRates(
  state: GameState,
  now = Date.now()
): FacilityRates {
  const tubeLevels = getUpgradeCount(state, 'upg_pneumatic_tubes');
  const lampLevels = getUpgradeCount(state, 'upg_warm_lamps');
  const chairLevels = getUpgradeCount(state, 'upg_ergonomic_chairs');
  const espressoLevels = getUpgradeCount(state, 'upg_espresso_beans');
  const cushionLevels = getUpgradeCount(state, 'upg_velvet_cushions');
  const toolkitLevels = getUpgradeCount(state, 'upg_manual_toolkit');
  const courierLevels = getUpgradeCount(state, 'upg_courier_contract');

  const expWing = state.rooms.break_lounge;
  const expWingBoost = expWing?.unlocked
    ? 0.16 + (expWing.level - 1) * 0.08 + ((expWing.equipmentLevel ?? 1) - 1) * 0.05
    : 0;

  const gear = getEquippedGear(state);
  const activeSynergies = evaluateObjectInteractions(state);
  const synergyFunds = activeSynergies.reduce((sum, s) => sum + s.bonusFundsPerSec, 0);
  const synergyResearch = activeSynergies.reduce((sum, s) => sum + s.bonusResearchPerSec, 0);
  const synergySpeedBonus = activeSynergies.reduce(
    (sum, s) => sum + s.bonusInvestigationSpeedPct / 100,
    0
  );

  // Diminishing-returns Government Funding multiplier from Reputation
  const hasGrantCharter = isExperimentalProjectDone(state, 'exp_proj_grant_subsidy');
  const rawRepFactor = Math.min(1.2, state.resources.reputation * 0.012);
  const repFundingBonusMultiplier = 1 + rawRepFactor * (hasGrantCharter ? 2 : 1);
  const repFundingBonusPct = Math.round((repFundingBonusMultiplier - 1) * 100);

  // Temporary Events (active timed boosts / disruptions)
  const liveBoosts = (state.activeBoosts ?? []).filter((b) => b.expiresAt > now);
  const tempFundsMult = liveBoosts.reduce((acc, b) => acc * b.fundsMult, 1);
  const tempResearchMult = liveBoosts.reduce((acc, b) => acc * b.researchMult, 1);
  const tempSamplesMult = liveBoosts.reduce((acc, b) => acc * b.samplesMult, 1);
  const tempDeliveryMult = liveBoosts.reduce((acc, b) => acc * b.deliverySpeedMult, 1);
  const tempInvSpeedMult = liveBoosts.reduce(
    (acc, b) => acc * (b.investigationSpeedMult ?? 1),
    1
  );
  const activeBoostLabel =
    liveBoosts.length > 0
      ? liveBoosts.map((b) => b.label).join(' + ')
      : null;

  const hasDistillation = isExperimentalProjectDone(state, 'exp_proj_distillation');
  const hasStorageMatrix = isExperimentalProjectDone(state, 'exp_proj_storage_matrix');
  const hasStormBottle = isExperimentalProjectDone(state, 'exp_proj_storm_bottle');

  const era = Math.max(1, state.prestigeEra ?? 1);
  const hasQuantumLedger = hasPrestigeTech(state, 'pres_quantum_ledger');
  const eraMultiplier = 1 + (era - 1) * 0.25 + (hasQuantumLedger ? era * 0.5 : 0);

  let fundsMult =
    (1 + tubeLevels * 0.18) *
    repFundingBonusMultiplier *
    (hasDistillation ? 1.15 : 1) *
    eraMultiplier *
    tempFundsMult;
  let researchMult =
    (1 + lampLevels * 0.18) *
    (1 + rawRepFactor * 0.5 * (hasGrantCharter ? 1.5 : 1)) *
    (hasDistillation ? 1.15 : 1) *
    eraMultiplier *
    tempResearchMult;
  let repMult = hasGrantCharter ? 1.2 : 1;
  let objectOutputMult = (1 + cushionLevels * 0.22) * (hasStorageMatrix ? 1.2 : 1);
  let samplesMult =
    (1 + courierLevels * 0.25) *
    (hasDistillation ? 1.25 : 1) *
    (hasStormBottle ? 1.35 : 1) *
    (hasPrestigeTech(state, 'pres_dimensional_vault') ? 1.35 : 1) *
    tempSamplesMult;
  const machinePerformanceMult =
    1 + toolkitLevels * 0.12 + (isResearched(state, 'res_auto_machines') ? 0.25 : 0);
  let investigationSpeedMultiplier =
    (1 +
      espressoLevels * 0.22 +
      expWingBoost +
      synergySpeedBonus +
      gear.speedBonusPct / 100 +
      (hasStorageMatrix ? 0.2 : 0)) *
    tempInvSpeedMult;

  // Investigation Branch
  if (isResearched(state, 'res_intake_protocol')) {
    investigationSpeedMultiplier += 0.25;
  }
  if (isResearched(state, 'res_inv_scanners')) {
    investigationSpeedMultiplier += 0.3;
  }
  if (isResearched(state, 'res_inv_faster_analysis')) {
    investigationSpeedMultiplier += 0.35;
  }
  const hiddenDetectionActive = isResearched(state, 'res_inv_hidden_detection');

  // Containment Branch
  if (isResearched(state, 'res_botanical_dampening')) {
    repMult += 0.2;
    samplesMult *= 1.15;
  }
  if (isResearched(state, 'res_con_improved_chambers')) {
    objectOutputMult *= 1.25;
  }
  if (isResearched(state, 'res_con_automated_storage')) {
    objectOutputMult *= 1.2;
  }
  if (isResearched(state, 'res_con_advanced_security')) {
    fundsMult *= 1.3;
    repMult += 0.3;
  }

  // Automation Branch
  if (isResearched(state, 'res_auto_investigations')) {
    investigationSpeedMultiplier += 0.15;
  }
  if (isResearched(state, 'res_auto_machines')) {
    fundsMult *= 1.2;
  }

  // Experimental Branch
  if (isResearched(state, 'res_exp_materials')) {
    samplesMult *= 1.35;
  }
  const mutationAnalysisActive = isResearched(state, 'res_exp_mutations');
  if (mutationAnalysisActive) {
    researchMult *= 1.25;
  }

  // Anomaly Research Branch
  if (isResearched(state, 'res_grant_forms')) {
    fundsMult *= 1.25;
  }
  if (isResearched(state, 'res_self_catalog')) {
    objectOutputMult *= 1.25;
  }
  if (isResearched(state, 'res_acoustic_containment')) {
    fundsMult *= 1.35;
    researchMult *= 1.35;
    repMult += 0.35;
    samplesMult *= 1.25;
  }

  // Reality Manipulation Branch
  if (isResearched(state, 'res_chronometry')) {
    researchMult *= 1.3;
  }
  if (isResearched(state, 'res_real_spatial')) {
    fundsMult *= 1.25;
    researchMult *= 1.25;
    samplesMult *= 1.25;
  }
  if (isResearched(state, 'res_real_temporal')) {
    investigationSpeedMultiplier += 0.3;
    researchMult *= 1.3;
  }
  if (isResearched(state, 'res_real_dimensional')) {
    objectOutputMult *= 1.45;
    samplesMult *= 1.25;
  }

  // Prestige Technologies
  if (hasPrestigeTech(state, 'pres_chronal_archive')) {
    investigationSpeedMultiplier += 0.25;
  }
  if (hasPrestigeTech(state, 'pres_reality_bench')) {
    investigationSpeedMultiplier += 0.6;
  }

  // Dept. 404 Final Charter (Project 005 completion)
  const has404Charter = Boolean(
    state.classifiedProjects?.find((p) => p.id === 'proj_005_original_purpose')?.completed
  );
  if (has404Charter) {
    fundsMult *= 1.25;
    researchMult *= 1.25;
    repMult += 0.25;
    samplesMult *= 1.25;
  }

  let totalFunds = synergyFunds * eraMultiplier;
  let totalResearch = synergyResearch * eraMultiplier;
  let totalRep = 0;
  let totalSamples = 0;

  (state.secretRooms ?? []).forEach((sr) => {
    if (!sr.discovered) return;
    totalFunds += sr.passiveFundsPerSec * eraMultiplier;
    totalResearch += sr.passiveResearchPerSec * eraMultiplier;
    totalRep += sr.passiveReputationPerSec;
  });

  const SAMPLE_ROOM_BASE: Partial<Record<RoomId, number>> = {
    research_desk: 0.012,
    containment: 0.014,
    break_lounge: 0.024,
    temporal_lab: 0.032,
    quantum_pantry: 0.042,
  };

  const SAMPLE_RARITY_BASE: Record<UnusualObject['rarity'], number> = {
    Common: 0.005,
    Uncommon: 0.012,
    Rare: 0.022,
    Epic: 0.038,
    Legendary: 0.06,
    Impossible: 0.095,
  };

  const roomRates = {} as FacilityRates['roomRates'];

  (Object.keys(ROOM_DEFINITIONS) as RoomId[]).forEach((roomId) => {
    const def = ROOM_DEFINITIONS[roomId];
    const runtime: RoomRuntimeState = state.rooms[roomId];

    if (!runtime || !runtime.unlocked) {
      roomRates[roomId] = {
        fundsPerSec: 0,
        researchPerSec: 0,
        reputationPerSec: 0,
        staffEfficiency: 1,
        effectiveTier: getRoomEffectiveContainmentTier(roomId, undefined, state),
      };
      return;
    }

    const levelMult = 1 + (runtime.level - 1) * 0.4;
    const equipMult = (1 + ((runtime.equipmentLevel ?? 1) - 1) * 0.25) * machinePerformanceMult;
    const effectiveTier = getRoomEffectiveContainmentTier(roomId, runtime, state);

    const assignedStaff = state.employees.filter((e) =>
      runtime.assignedEmployeeIds.includes(e.id)
    );

    const chairYieldBoost = 1 + chairLevels * 0.15;
    let staffYieldBonus = 0;
    let staffSpeedBonus = 0;
    assignedStaff.forEach((emp) => {
      const specialtyMult = emp.specialtyRoom === roomId ? 1.35 : 1.0;
      staffYieldBonus += emp.yieldBonus * specialtyMult * chairYieldBoost;
      staffSpeedBonus += emp.speedBonus * specialtyMult;
    });

    const staffMult = 1 + staffYieldBonus + expWingBoost * (assignedStaff.length > 0 ? 1 : 0);

    let objFunds = 0;
    let objResearch = 0;
    let objRep = 0;
    let objSamples = 0;

    const assignedObjIds = getRoomAssignedObjectIds(runtime);
    assignedObjIds.forEach((objId) => {
      const obj = state.objects.find((o) => o.id === objId);
      if (!obj) return;

      const stateFactor = obj.status === 'contained' ? 1.0 : 0.45;
      const variantBonus = obj.rareVariant ? (mutationAnalysisActive ? 1.65 : 1.25) : 1.0;
      const secondaryBonus = obj.secondaryAbilityUnlocked
        ? hiddenDetectionActive
          ? 1.4
          : 1.15
        : 1.0;
      const envMatch = getEnvironmentMatchInfo(obj, roomId);
      const envMult = 1 + envMatch.bonusPct / 100;

      objFunds +=
        obj.fundsPerSec *
        stateFactor *
        objectOutputMult *
        variantBonus *
        secondaryBonus *
        envMult *
        equipMult;
      objResearch +=
        obj.researchPerSec *
        stateFactor *
        objectOutputMult *
        variantBonus *
        secondaryBonus *
        envMult *
        equipMult;
      objRep += obj.reputationPerSec * stateFactor * variantBonus * envMult;
      objSamples +=
        SAMPLE_RARITY_BASE[obj.rarity] *
        (obj.investigated ? 1.25 : 0.55) *
        (envMatch.isMatch ? 1.3 : 1);
    });

    const roomSampleBase = SAMPLE_ROOM_BASE[roomId] ?? 0;
    totalSamples += (roomSampleBase * (1 + (runtime.level - 1) * 0.25) + objSamples) * samplesMult;

    const roomFunds = (def.baseFundsPerSec * levelMult * equipMult * staffMult + objFunds) * fundsMult;
    const roomResearch =
      (def.baseResearchPerSec * levelMult * equipMult * staffMult + objResearch) * researchMult;
    const roomRep = (def.baseReputationPerSec * levelMult + objRep) * repMult;

    totalFunds += roomFunds;
    totalResearch += roomResearch;
    totalRep += roomRep;

    roomRates[roomId] = {
      fundsPerSec: roomFunds,
      researchPerSec: roomResearch,
      reputationPerSec: roomRep,
      staffEfficiency: 1 + staffSpeedBonus,
      effectiveTier,
    };
  });

  const discountMult = getRoomCostDiscountMultiplier(state);

  // Employee effective productivity + manager aura + payroll calculation
  const manager = state.employees.find(
    (e) => e.hired && e.role === 'Department Manager' && e.assignedRoomId !== null
  );
  const managerBoostPct = manager ? 12 * manager.level : 0;
  const totalSalaryPerSec = state.employees
    .filter((e) => e.hired)
    .reduce((sum, e) => sum + (e.salaryPerSec ?? 0), 0);

  let staffExtraYield = 0;
  let staffExtraSpeed = 0;
  let engineerCount = 0;
  state.employees.forEach((emp) => {
    if (!emp.hired || !emp.assignedRoomId) return;
    const stats = getEffectiveEmployeeStats(state, emp);
    staffExtraYield += stats.effectiveYield - emp.yieldBonus;
    staffExtraSpeed += stats.effectiveSpeed - emp.speedBonus;
    if (emp.role === 'Engineer') engineerCount += 1;
  });

  const grossFundsPerSec =
    totalFunds * (1 + Math.max(0, staffExtraYield * 0.25) + engineerCount * 0.08);
  const netFundsPerSec = grossFundsPerSec - totalSalaryPerSec;
  const adjustedResearchPerSec =
    totalResearch * (1 + Math.max(0, staffExtraYield * 0.2));

  const offline = getOfflineSettings(state);
  const deliveryIntervalMult = Math.max(
    0.45,
    (1 - courierLevels * 0.12) / tempDeliveryMult
  );

  return {
    fundsPerSec: netFundsPerSec,
    grossFundsPerSec,
    totalSalaryPerSec,
    researchPerSec: adjustedResearchPerSec,
    reputationPerSec: totalRep,
    samplesPerSec: totalSamples,
    investigationSpeedMultiplier:
      investigationSpeedMultiplier + Math.max(0, staffExtraSpeed * 0.3),
    clickPowerMultiplier: 1 + toolkitLevels * 0.3,
    roomCostDiscountPct: Math.round((1 - discountMult) * 100),
    managerBoostPct,
    repFundingBonusPct,
    totalFundsMultiplier: fundsMult,
    totalResearchMultiplier: researchMult,
    deliveryIntervalMult,
    offlineCapSec: offline.capSeconds,
    offlineEfficiency: offline.efficiency,
    activeBoostLabel,
    activeSynergies,
    roomRates,
  };
}

export function getEmployeeEquippedGear(
  state: GameState,
  emp: Employee
): EmployeeEquipment | null {
  if (!emp.equippedGearId) return null;
  return state.employeeEquipment.find((g) => g.id === emp.equippedGearId && g.unlocked) ?? null;
}

export function getEffectiveEmployeeStats(state: GameState, emp: Employee) {
  const gear = getEmployeeEquippedGear(state, emp);
  const chairLevels = getUpgradeCount(state, 'upg_ergonomic_chairs');
  const manager = state.employees.find(
    (e) => e.hired && e.role === 'Department Manager' && e.assignedRoomId !== null
  );
  const calmer = state.employees.find(
    (e) =>
      e.hired &&
      e.assignedRoomId !== null &&
      (e.role === 'Security Officer' || e.role === 'Department Manager')
  );

  const levelYieldMult = 1 + (emp.level - 1) * 0.14;
  const levelSpeedMult = 1 + (emp.level - 1) * 0.1;
  const chairProdMult = 1 + chairLevels * 0.15;
  const managerMult = manager && emp.id !== manager.id ? 1 + manager.level * 0.12 : 1;

  let personalityYieldBonus = 0;
  let personalitySpeedBonus = 0;
  let statusNote = emp.personalityNote;

  if (emp.personality === 'Curious') {
    personalitySpeedBonus += 0.12;
  } else if (emp.personality === 'Overconfident') {
    personalityYieldBonus += 0.12;
  } else if (emp.personality === 'Inventive') {
    personalityYieldBonus += 0.15;
  } else if (emp.personality === 'Meticulous') {
    personalityYieldBonus += 0.15;
  } else if (emp.personality === 'Lazy') {
    if (emp.energy >= 80 || emp.level >= 3) {
      personalityYieldBonus += 0.35;
      personalitySpeedBonus += 0.25;
      statusNote = 'Lazy (High Potential Active!): +35% productivity surge.';
    } else {
      personalitySpeedBonus -= 0.15;
      statusNote = 'Lazy: Needs motivation or Lv.3 for high-potential surge.';
    }
  } else if (emp.personality === 'Extremely Nervous') {
    const roomObjs = emp.assignedRoomId
      ? getRoomAssignedObjectIds(state.rooms[emp.assignedRoomId])
          .map((id) => state.objects.find((o) => o.id === id))
          .filter((o): o is UnusualObject => Boolean(o))
      : [];
    const hasSpookyObj = roomObjs.some((o) => o.requiredContainmentTier >= 2);
    if (hasSpookyObj && !calmer) {
      personalitySpeedBonus -= 0.15;
      statusNote = 'Extremely Nervous: Spooked by Tier 2/3 object (-15% speed; hire Security!).';
    } else if (hasSpookyObj && calmer) {
      statusNote = `Extremely Nervous (Reassured by ${calmer.name.split(' ')[0]}): Normal speed!`;
    }
  }

  const researchEmpYieldMult =
    1 +
    (isResearched(state, 'res_emp_seminars') ? 0.15 : 0) +
    (isResearched(state, 'res_emp_fellowships') ? 0.25 : 0) +
    (isResearched(state, 'res_auto_staff') ? 0.2 : 0);
  const researchEmpSpeedMult = isResearched(state, 'res_emp_morale') ? 1.25 : 1;
  const researchXpBonus = isResearched(state, 'res_emp_seminars') ? 0.4 : 0;

  const effectiveProductivity = Math.max(
    0.5,
    (emp.productivity + personalityYieldBonus + (gear?.productivityBonus ?? 0)) *
      levelYieldMult *
      chairProdMult *
      managerMult *
      researchEmpYieldMult *
      (emp.energy < 40 ? 0.85 : 1)
  );
  const effectiveYield =
    (emp.yieldBonus + personalityYieldBonus + (gear?.productivityBonus ?? 0)) *
    levelYieldMult *
    chairProdMult *
    managerMult *
    researchEmpYieldMult;
  const effectiveSpeed = Math.max(
    0.1,
    (emp.speedBonus + personalitySpeedBonus + (gear?.speedBonus ?? 0)) *
      levelSpeedMult *
      managerMult *
      researchEmpSpeedMult
  );

  return {
    effectiveProductivity,
    effectiveYield,
    effectiveSpeed,
    xpMultiplier: 1 + (gear?.xpBonusPct ?? 0) / 100 + chairLevels * 0.2 + researchXpBonus,
    statusNote,
    gear,
  };
}

export function getEmployeeTrainCost(emp: Employee): number {
  return Math.round(55 * Math.pow(1.45, emp.level - 1));
}

export function getEmployeeDefaultTask(emp: Employee, state: GameState): string {
  if (!emp.hired) return emp.currentTask;
  if (!emp.assignedRoomId) return 'Taking coffee break · Unassigned';
  const roomDef = ROOM_DEFINITIONS[emp.assignedRoomId];
  const roomObjs = getRoomAssignedObjectIds(state.rooms[emp.assignedRoomId])
    .map((id) => state.objects.find((o) => o.id === id))
    .filter((o): o is UnusualObject => Boolean(o));
  const firstObj = roomObjs[0];

  switch (emp.role) {
    case 'Junior Investigator':
      return firstObj
        ? `Investigating ${firstObj.code} (${firstObj.name}) in ${roomDef.name}`
        : `Inspecting benches in ${roomDef.name}`;
    case 'Research Scientist':
      return firstObj
        ? `Analyzing ${firstObj.code} waveforms in ${roomDef.name}`
        : `Running oscilloscope sweeps in ${roomDef.name}`;
    case 'Containment Specialist':
      return firstObj
        ? `Monitoring ${firstObj.name} containment inside ${roomDef.name}`
        : `Calibrating velvet pedestals in ${roomDef.name}`;
    case 'Engineer':
      return `Maintaining equipment & brass piping in ${roomDef.name}`;
    case 'Archivist':
      return `Cross-referencing dossiers & lore in ${roomDef.name}`;
    case 'Security Officer':
      return `Guarding ${roomDef.name} & reassuring coworkers`;
    case 'Experimental Technician':
      return firstObj
        ? `Testing experimental pulses on ${firstObj.code} in ${roomDef.name}`
        : `Calibrating test coils in ${roomDef.name}`;
    case 'Department Manager':
      return `Coordinating shift productivity from ${roomDef.name}`;
  }
}

export function grantEmployeeExperience(
  emp: Employee,
  rawXp: number,
  state: GameState
): { employee: Employee; leveledUp: boolean } {
  if (emp.level >= 10) {
    return { employee: emp, leveledUp: false };
  }
  const { xpMultiplier } = getEffectiveEmployeeStats(state, emp);
  let nextXp = emp.experience + Math.round(rawXp * xpMultiplier);
  let nextLevel = emp.level;
  let nextThreshold = emp.xpToNextLevel;
  let leveledUp = false;
  let nextProd = emp.productivity;
  let nextYield = emp.yieldBonus;
  let nextSpeed = emp.speedBonus;

  while (nextXp >= nextThreshold && nextLevel < 10) {
    nextXp -= nextThreshold;
    nextLevel += 1;
    nextThreshold = Math.round(nextThreshold * 1.45);
    nextProd = Number((nextProd + 0.12).toFixed(2));
    nextYield = Number((nextYield + 0.08).toFixed(2));
    nextSpeed = Number((nextSpeed + 0.06).toFixed(2));
    leveledUp = true;
  }

  return {
    employee: {
      ...emp,
      level: nextLevel,
      experience: nextLevel >= 10 ? 0 : nextXp,
      xpToNextLevel: nextThreshold,
      productivity: nextProd,
      yieldBonus: nextYield,
      speedBonus: nextSpeed,
    },
    leveledUp,
  };
}

export function getRoomInvestigationSpeed(
  state: GameState,
  roomId: RoomId,
  rates: FacilityRates
): number {
  const room = state.rooms[roomId];
  if (!room || !room.unlocked) return 0;
  const staffCount = room.assignedEmployeeIds.length;
  const staffBonus = rates.roomRates[roomId]?.staffEfficiency ?? 1;
  const staffingFactor = staffCount > 0 ? staffBonus * (1 + (staffCount - 1) * 0.45) : 0.45;
  const roomLevelFactor = 1 + (room.level - 1) * 0.25;
  const equipFactor = 1 + ((room.equipmentLevel ?? 1) - 1) * 0.2;
  return staffingFactor * roomLevelFactor * equipFactor * rates.investigationSpeedMultiplier;
}

export function formatCompact(value: number, decimals = 0): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 10_000) return `${(value / 1_000).toFixed(1)}K`;
  if (decimals > 0) return value.toFixed(decimals);
  return Math.floor(value).toLocaleString();
}

export function canAssignObjectToRoom(
  obj: UnusualObject,
  roomId: RoomId,
  runtime?: RoomRuntimeState,
  state?: GameState
): { ok: boolean; reason?: string; willReplace?: boolean } {
  const def = ROOM_DEFINITIONS[roomId];
  const capacity = runtime ? runtime.objectCapacity : def.baseObjectCapacity;

  if (def.supportsObjectSlot === 'none' || capacity <= 0) {
    return { ok: false, reason: 'This room does not house objects.' };
  }

  if (def.supportsObjectSlot === 'investigation') {
    if (obj.investigated) {
      return { ok: false, reason: 'Already investigated — place in Containment or Lab.' };
    }
  } else if (def.supportsObjectSlot === 'containment') {
    const effTier = getRoomEffectiveContainmentTier(roomId, runtime, state);
    if (obj.requiredContainmentTier > effTier) {
      return {
        ok: false,
        reason: `Requires Tier ${obj.requiredContainmentTier} Containment (room is Tier ${effTier})`,
      };
    }
  } else if (def.supportsObjectSlot === 'hybrid') {
    if (obj.investigated) {
      const effTier = getRoomEffectiveContainmentTier(roomId, runtime, state);
      if (obj.requiredContainmentTier > effTier) {
        return {
          ok: false,
          reason: `Requires Tier ${obj.requiredContainmentTier} Containment (room is Tier ${effTier})`,
        };
      }
    }
  }

  const assignedIds = runtime ? getRoomAssignedObjectIds(runtime) : [];
  const willReplace = !assignedIds.includes(obj.id) && assignedIds.length >= capacity;

  return { ok: true, willReplace };
}

export function evaluateDiscoveryMilestones(state: GameState): GameState {
  const investigatedCount = state.objects.filter((o) => o.investigated).length;
  const discoveredCount = state.objects.filter((o) => o.status !== 'locked').length;
  const hiredCount = state.employees.filter((e) => e.hired).length;
  const unlockedRoomsCount = Object.values(state.rooms).filter((r) => r.unlocked).length;
  const researchDoneCount = state.researchNodes.filter((r) => r.researched).length;
  const synergies = evaluateObjectInteractions(state);

  let assignChanged = false;
  const nextAssignments = state.specialAssignments.map((a) => {
    if (a.completed) return a;
    let done = false;
    if (a.id === 'assign_mirror_hunt') {
      done = investigatedCount >= 2 && state.resources.reputation >= 18;
    } else if (a.id === 'assign_duck_breadcrumbs') {
      done = hiredCount >= 2 && researchDoneCount >= 1;
    }
    if (done) {
      assignChanged = true;
      return { ...a, completed: true };
    }
    return a;
  });

  let discChanged = false;
  const nextDiscoveries = state.discoveries.map((d) => {
    if (d.unlocked) return d;
    let shouldUnlock = false;
    if (d.id === 'disc_first_investigation' && investigatedCount >= 2) shouldUnlock = true;
    if (d.id === 'disc_three_investigated' && investigatedCount >= 4) shouldUnlock = true;
    if (d.id === 'disc_synergy_spark' && synergies.length > 0) shouldUnlock = true;
    if (d.id === 'disc_second_staff' && hiredCount >= 3) shouldUnlock = true;
    if (d.id === 'disc_fifth_room' && unlockedRoomsCount >= 5) shouldUnlock = true;
    if (d.id === 'disc_full_collection' && discoveredCount >= 10) shouldUnlock = true;
    if (d.id === 'disc_reputation_50' && state.resources.reputation >= 50) shouldUnlock = true;

    if (shouldUnlock) {
      discChanged = true;
      return { ...d, unlocked: true };
    }
    return d;
  });

  const withStory = evaluatePassiveStoryUnlocks(state);
  if (!discChanged && !assignChanged) return withStory;
  return {
    ...withStory,
    specialAssignments: nextAssignments,
    discoveries: nextDiscoveries,
  };
}

export function simulateOfflineProgress(
  state: GameState,
  rawSecondsAway: number
): { nextState: GameState; report: OfflineReport } {
  const now = Date.now();
  const offline = getOfflineSettings(state);
  const cappedSeconds = Math.min(rawSecondsAway, offline.capSeconds);
  const wasCapped = rawSecondsAway > offline.capSeconds;
  const rates = calculateFacilityRates(state, now);
  const gear = getEquippedGear(state);

  let fundsGenerated = Math.max(0, rates.fundsPerSec) * cappedSeconds * offline.efficiency;
  let researchGenerated = rates.researchPerSec * cappedSeconds * offline.efficiency;
  let reputationGenerated = rates.reputationPerSec * cappedSeconds * offline.efficiency;
  let samplesGenerated = rates.samplesPerSec * cappedSeconds * offline.efficiency;

  const objectsInvestigated: string[] = [];
  let completedOfflineCount = 0;

  const investigatingRooms = (Object.keys(ROOM_DEFINITIONS) as RoomId[]).filter((rId) => {
    const def = ROOM_DEFINITIONS[rId];
    const rt = state.rooms[rId];
    return (
      rt.unlocked &&
      (def.supportsObjectSlot === 'investigation' || def.supportsObjectSlot === 'hybrid') &&
      getRoomAssignedObjectIds(rt).length > 0
    );
  });

  let nextObjects = state.objects.map((obj) => {
    const roomId = investigatingRooms.find((rId) =>
      getRoomAssignedObjectIds(state.rooms[rId]).includes(obj.id)
    );
    if (!roomId || obj.investigated) return obj;

    const speed = getRoomInvestigationSpeed(state, roomId, rates);
    const deltaPct = (100 / obj.investigationDurationSec) * speed * cappedSeconds * offline.efficiency;
    const res = resolveInvestigationTransition(
      obj,
      obj.investigationProgress + deltaPct,
      gear,
      now
    );
    fundsGenerated += res.bonusFunds;
    researchGenerated += res.bonusResearch;
    reputationGenerated += res.bonusReputation;
    if (res.completedNow) {
      completedOfflineCount += 1;
      objectsInvestigated.push(`${obj.name} (Classified!)`);
    } else if (deltaPct >= 10) {
      objectsInvestigated.push(
        `${obj.name} (+${Math.min(100 - Math.floor(obj.investigationProgress), Math.floor(deltaPct))}%)`
      );
    }
    return res.updatedObject;
  });

  // Simulate realistic pneumatic & agency events proportional to time away
  const eventCount =
    cappedSeconds >= 3600 ? 3 : cappedSeconds >= 900 ? 2 : cappedSeconds >= 120 ? 1 : 0;
  const eventsOccurred: string[] = [];
  for (let i = 0; i < eventCount; i++) {
    const tpl = RANDOM_EVENT_TEMPLATES[i % RANDOM_EVENT_TEMPLATES.length];
    const eventFunds = 45 + i * 25;
    const eventRp = 12 + i * 6;
    const eventSample = i === 1 ? 1 : 0;
    fundsGenerated += eventFunds;
    researchGenerated += eventRp;
    samplesGenerated += eventSample;
    eventsOccurred.push(
      `${tpl.title} (+$${eventFunds}, +${eventRp} RP${eventSample ? ', +1 Sample' : ''})`
    );
  }

  const prevUnlockedDiscoveries = new Set(
    state.discoveries.filter((d) => d.unlocked).map((d) => d.id)
  );

  const preMilestoneState: GameState = {
    ...state,
    resources: {
      funds: state.resources.funds + fundsGenerated,
      research: state.resources.research + researchGenerated,
      reputation: state.resources.reputation + reputationGenerated,
      samples: (state.resources.samples ?? 0) + samplesGenerated,
    },
    totalFundsEarned: state.totalFundsEarned + fundsGenerated,
    totalResearchEarned: state.totalResearchEarned + researchGenerated,
    totalSamplesEarned: (state.totalSamplesEarned ?? 0) + samplesGenerated,
    totalInvestigationsCompleted: state.totalInvestigationsCompleted + completedOfflineCount,
    objects: nextObjects,
    lastSavedAt: now,
  };

  const afterMilestones = evaluateDiscoveryMilestones(preMilestoneState);
  const discoveriesMade = afterMilestones.discoveries
    .filter((d) => d.unlocked && !prevUnlockedDiscoveries.has(d.id))
    .map((d) => d.title);

  return {
    nextState: afterMilestones,
    report: {
      rawSecondsAway,
      effectiveSecondsSimulated: cappedSeconds,
      capSeconds: offline.capSeconds,
      wasCapped,
      efficiencyPct: offline.efficiencyPct,
      fundsGenerated,
      researchGenerated,
      reputationGenerated,
      samplesGenerated,
      objectsInvestigated,
      discoveriesMade,
      eventsOccurred,
    },
  };
}
