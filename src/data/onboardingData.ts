import {
  GameNotification,
  GameState,
  NavTab,
  OnboardingState,
  ProgressionStage,
  TutorialStepId,
} from '../types/game';

export interface StageDefinition {
  stage: ProgressionStage;
  name: string;
  subtitle: string;
  unlockSummary: string;
  featureIntroTitle: string;
  featureIntroBody: string;
  ctaTab?: NavTab;
  ctaLabel?: string;
}

export const STAGE_INFO: Record<ProgressionStage, StageDefinition> = {
  1: {
    stage: 1,
    name: 'Orientation',
    subtitle: 'Stage 1 · Beginning',
    unlockSummary: 'Reception, Investigation Bench & Containment',
    featureIntroTitle: 'Welcome to Shift One',
    featureIntroBody:
      'Start small: inspect The Forecasting Toaster, move it to Containment, and collect your first stipend.',
  },
  2: {
    stage: 2,
    name: 'Early Department',
    subtitle: 'Stage 2 · Foundations',
    unlockSummary: 'Upgrades Tab, Objects Collection & Second Arrival',
    featureIntroTitle: 'Upgrades & Object Collection Unlocked!',
    featureIntroBody:
      'Use Upgrades to boost room income and research speed. A second oddity—The Infinite Mug—just arrived in Intake!',
    ctaTab: 'objects',
    ctaLabel: 'Check Objects',
  },
  3: {
    stage: 3,
    name: 'Developing Wing',
    subtitle: 'Stage 3 · Staffing & Expansion',
    unlockSummary: 'Employees Tab, Free Investigator Hire & Sub-Level Wings',
    featureIntroTitle: 'Staff Roster Unlocked!',
    featureIntroBody:
      'You can now hire Pippa Vance ($0) in the Employees tab to automate investigations and unlock additional wings like Archives.',
    ctaTab: 'employees',
    ctaLabel: 'Open Employees',
  },
  4: {
    stage: 4,
    name: 'Established Facility',
    subtitle: 'Stage 4 · Science & Events',
    unlockSummary: 'Research Tree, Object Synergies & Live Department Events',
    featureIntroTitle: 'Research Lab & Events Active!',
    featureIntroBody:
      'Spend Research Points on permanent breakthroughs in Research, pair synergetic objects, and respond to unpredictable facility events.',
    ctaTab: 'research',
    ctaLabel: 'Open Research',
  },
  5: {
    stage: 5,
    name: 'Advanced Bureau',
    subtitle: 'Stage 5 · Deep Archives',
    unlockSummary: 'Discoveries & Dept. 404 Classified Cases, Field Scouting & Samples',
    featureIntroTitle: 'Classified Dept. 404 Archives Unlocked!',
    featureIntroBody:
      'Track milestones, dispatch Field Explorations, gather Anomaly Samples, and unseal Department 404 classified case files in Discoveries.',
    ctaTab: 'discoveries',
    ctaLabel: 'Open Discoveries',
  },
  6: {
    stage: 6,
    name: 'Full Directorate',
    subtitle: 'Stage 6 · Deep Sub-Levels & Eras',
    unlockSummary: 'Floor 3 (Experimental, Deep Storage, Reality Division) & Operational Eras',
    featureIntroTitle: 'Sub-Level B2 & Full Authority Active!',
    featureIntroBody:
      'Every wing, Tier-3 vault, Experimental Sample Project, and Operational Era charter is now at your command.',
    ctaTab: 'department',
    ctaLabel: 'View Facility',
  },
};

export interface TutorialStepGuide {
  step: Exclude<TutorialStepId, 'completed'>;
  stepNumber: number;
  title: string;
  agnesLine: string;
  actionHint: string;
  whyItMatters: string;
  highlightTarget:
    | 'investigation_room'
    | 'inspect_action'
    | 'containment_room'
    | 'reception_bell'
    | 'upgrades_action';
  primaryActionLabel?: string;
}

export const SUPERVISOR_STEPS: Record<
  Exclude<TutorialStepId, 'completed'>,
  TutorialStepGuide
> = {
  welcome: {
    step: 'welcome',
    stepNumber: 1,
    title: 'Welcome to the Department',
    agnesLine:
      '“Good morning, Director! I’m Agnes Caldwell, Shift Supervisor. A slightly psychic toaster just arrived at Reception—let’s open the Investigation Lab and take a look.”',
    actionHint: 'Click “Open Investigation Lab” below (or tap the glowing wing).',
    whyItMatters: 'Every strange item is inspected safely before joining the facility.',
    highlightTarget: 'investigation_room',
    primaryActionLabel: 'Open Investigation Lab & Stage Toaster',
  },
  investigate: {
    step: 'investigate',
    stepNumber: 2,
    title: 'Investigate Your First Object',
    agnesLine:
      '“Splendid! That’s DOU-001, The Forecasting Toaster. Give it a quick manual inspection to log its quirks and reveal what it does.”',
    actionHint: 'Click “Inspect Toaster” below, or tap the glowing toaster in the Lab.',
    whyItMatters: 'Investigations uncover hidden quirks, bonus Research Points, and safe containment rules.',
    highlightTarget: 'inspect_action',
    primaryActionLabel: 'Inspect Toaster (+50%)',
  },
  contain: {
    step: 'contain',
    stepNumber: 3,
    title: 'Contain Safely for Steady Yield',
    agnesLine:
      '“Classified cleanly! Now let’s open the Containment Chamber downstairs and place the Toaster on a velvet pedestal so it earns passively.”',
    actionHint: 'Click “Place Toaster in Containment” below (or assign it in Objects).',
    whyItMatters: 'Contained objects generate steady Funds & Research Points every second.',
    highlightTarget: 'containment_room',
    primaryActionLabel: 'Open Containment & Assign Toaster',
  },
  earn_rewards: {
    step: 'earn_rewards',
    stepNumber: 4,
    title: 'Collect Department Funds',
    agnesLine:
      '“Listen to that desk bell! Reception handles paperwork stipends—tap the glowing +$ bell on Reception to collect your first payout.”',
    actionHint: 'Tap Reception’s pulsing +$ bell (or click Collect Stipend below).',
    whyItMatters: 'Department Funds pay for new rooms, upgrades, and specialist hires.',
    highlightTarget: 'reception_bell',
    primaryActionLabel: 'Collect Reception Stipend (+$26)',
  },
  expand: {
    step: 'expand',
    stepNumber: 5,
    title: 'Expand & Upgrade',
    agnesLine:
      '“Last orientation task: let’s invest some of that budget! Open Upgrades or click any room to buy your first room or department upgrade.”',
    actionHint: 'Purchase any Room Lv.2 or Department Upgrade to complete orientation.',
    whyItMatters: 'Upgrades permanently multiply room earnings and unlock deeper wings.',
    highlightTarget: 'upgrades_action',
    primaryActionLabel: 'Open Upgrades Tab',
  },
};

export interface OnboardingObjective {
  id: string;
  minStage: ProgressionStage;
  title: string;
  description: string;
  whyItMatters: string;
  rewardFunds: number;
  rewardResearch: number;
  rewardReputation: number;
  focusTab?: NavTab;
  isComplete: (state: GameState) => boolean;
  progressText: (state: GameState) => string;
}

export const ONBOARDING_OBJECTIVES: OnboardingObjective[] = [
  {
    id: 'obj_first_investigation',
    minStage: 1,
    title: 'Classify The Forecasting Toaster',
    description: 'Complete all 5 investigation stages on DOU-001.',
    whyItMatters: 'Classified objects earn full passive output in containment.',
    rewardFunds: 55,
    rewardResearch: 15,
    rewardReputation: 3,
    focusTab: 'department',
    isComplete: (s) => s.objects.some((o) => o.id === 'obj_toaster' && o.investigated),
    progressText: (s) => {
      const t = s.objects.find((o) => o.id === 'obj_toaster');
      return t?.investigated ? '1/1' : `${Math.floor(t?.investigationProgress ?? 0)}%`;
    },
  },
  {
    id: 'obj_second_curiosity',
    minStage: 2,
    title: 'Investigate The Infinite Mug',
    description: 'Place DOU-002 in Investigation Lab and finish its 5-stage report.',
    whyItMatters: 'Unlocks your second reliable earner and pushes you toward Staffing.',
    rewardFunds: 85,
    rewardResearch: 20,
    rewardReputation: 4,
    focusTab: 'objects',
    isComplete: (s) => s.objects.some((o) => o.id === 'obj_infinite_mug' && o.investigated),
    progressText: (s) => {
      const m = s.objects.find((o) => o.id === 'obj_infinite_mug');
      if (!m || m.status === 'locked') return '0/1';
      return m.investigated ? '1/1' : `${Math.floor(m.investigationProgress)}%`;
    },
  },
  {
    id: 'obj_buy_two_upgrades',
    minStage: 2,
    title: 'Strengthen Department Gear',
    description: 'Purchase at least 2 upgrades (department upgrades or room levels).',
    whyItMatters: 'Compounds early income so hiring staff feels effortless.',
    rewardFunds: 95,
    rewardResearch: 15,
    rewardReputation: 3,
    focusTab: 'upgrades',
    isComplete: (s) => {
      const deptUpgs = s.upgrades.reduce((sum, u) => sum + u.purchasedCount, 0);
      const roomLvs = Object.values(s.rooms).reduce((sum, r) => sum + Math.max(0, r.level - 1), 0);
      return deptUpgs + roomLvs >= 2;
    },
    progressText: (s) => {
      const deptUpgs = s.upgrades.reduce((sum, u) => sum + u.purchasedCount, 0);
      const roomLvs = Object.values(s.rooms).reduce((sum, r) => sum + Math.max(0, r.level - 1), 0);
      return `${Math.min(2, deptUpgs + roomLvs)}/2`;
    },
  },
  {
    id: 'obj_hire_first_staff',
    minStage: 3,
    title: 'Hire Your First Specialist',
    description: 'Recruit Pippa Vance (free $0!) or another specialist in Employees.',
    whyItMatters: 'Specialists automate investigations, boost room yields, and level up.',
    rewardFunds: 110,
    rewardResearch: 25,
    rewardReputation: 4,
    focusTab: 'employees',
    isComplete: (s) => s.employees.some((e) => e.hired),
    progressText: (s) => `${Math.min(1, s.employees.filter((e) => e.hired).length)}/1`,
  },
  {
    id: 'obj_open_research_lab',
    minStage: 3,
    title: 'Open the Research Laboratory',
    description: 'Build the Research Laboratory on Floor 1 to generate Research Points.',
    whyItMatters: 'Unlocks the Research Tree, Lab-affined bonuses, and steady RP income.',
    rewardFunds: 130,
    rewardResearch: 30,
    rewardReputation: 5,
    focusTab: 'department',
    isComplete: (s) => Boolean(s.rooms.research_desk?.unlocked),
    progressText: (s) => (s.rooms.research_desk?.unlocked ? '1/1' : '0/1'),
  },
  {
    id: 'obj_contain_three_objects',
    minStage: 3,
    title: 'Contain 3 Unusual Objects',
    description: 'Keep 3 investigated objects safely placed in facility rooms.',
    whyItMatters: 'Triggers object-to-object synergies and qualifies you for deeper wings.',
    rewardFunds: 175,
    rewardResearch: 35,
    rewardReputation: 6,
    focusTab: 'objects',
    isComplete: (s) =>
      s.objects.filter((o) => o.investigated && o.assignedRoomId !== null).length >= 3,
    progressText: (s) =>
      `${Math.min(
        3,
        s.objects.filter((o) => o.investigated && o.assignedRoomId !== null).length
      )}/3`,
  },
  {
    id: 'obj_first_research_node',
    minStage: 4,
    title: 'Complete First Research Project',
    description: 'Unlock any breakthrough node in the Research tab.',
    whyItMatters: 'Research nodes permanently unlock new mechanics, staff slots, and objects.',
    rewardFunds: 190,
    rewardResearch: 40,
    rewardReputation: 6,
    focusTab: 'research',
    isComplete: (s) => s.researchNodes.some((r) => r.researched),
    progressText: (s) => `${Math.min(1, s.researchNodes.filter((r) => r.researched).length)}/1`,
  },
  {
    id: 'obj_discover_rare_object',
    minStage: 4,
    title: 'Discover a Rare+ Curiosity',
    description: 'Catalog any Rare, Epic, Legendary, or Impossible unusual object.',
    whyItMatters: 'High-tier anomalies produce vastly more Funds, RP, and Anomaly Samples.',
    rewardFunds: 240,
    rewardResearch: 50,
    rewardReputation: 8,
    focusTab: 'objects',
    isComplete: (s) =>
      s.objects.some(
        (o) =>
          o.status !== 'locked' &&
          (o.rarity === 'Rare' ||
            o.rarity === 'Epic' ||
            o.rarity === 'Legendary' ||
            o.rarity === 'Impossible')
      ),
    progressText: (s) =>
      s.objects.some(
        (o) =>
          o.status !== 'locked' &&
          (o.rarity === 'Rare' ||
            o.rarity === 'Epic' ||
            o.rarity === 'Legendary' ||
            o.rarity === 'Impossible')
      )
        ? '1/1'
        : '0/1',
  },
  {
    id: 'obj_unseal_classified_case',
    minStage: 5,
    title: 'Declassify a Dept. 404 Case',
    description: 'Open Discoveries → Dept. 404 Cases and complete Project 001 or any classified file.',
    whyItMatters: 'Reveals hidden rooms, lore, and permanent facility-wide bonuses.',
    rewardFunds: 340,
    rewardResearch: 65,
    rewardReputation: 10,
    focusTab: 'discoveries',
    isComplete: (s) => (s.classifiedProjects ?? []).some((p) => p.completed),
    progressText: (s) =>
      `${Math.min(1, (s.classifiedProjects ?? []).filter((p) => p.completed).length)}/1`,
  },
  {
    id: 'obj_excavate_floor3',
    minStage: 5,
    title: 'Excavate Sub-Level B2 (Floor 3)',
    description: 'Unlock Floor 3 to access the Experimental Wing, Deep Storage & Reality Division.',
    whyItMatters: 'Tier 3 chambers house Impossible anomalies and late-game projects.',
    rewardFunds: 550,
    rewardResearch: 90,
    rewardReputation: 15,
    focusTab: 'department',
    isComplete: (s) => Boolean(s.floor3Unlocked),
    progressText: (s) => (s.floor3Unlocked ? '1/1' : '0/1'),
  },
];

export const DEFAULT_ONBOARDING_STATE: OnboardingState = {
  tutorialStep: 'welcome',
  tutorialCompleted: false,
  progressionStage: 1,
  claimedObjectiveIds: [],
  dismissedFeatureStage: 1,
  replayMode: false,
};

export function getUnlockedTabsForStage(
  stage: ProgressionStage,
  tutorialStep: TutorialStepId
): NavTab[] {
  if (tutorialStep === 'welcome' || tutorialStep === 'investigate') {
    return ['department'];
  }
  if (tutorialStep === 'contain' || tutorialStep === 'earn_rewards') {
    return ['department', 'objects'];
  }
  if (tutorialStep === 'expand' || stage === 1 || stage === 2) {
    return ['department', 'objects', 'upgrades'];
  }
  if (stage === 3) {
    return ['department', 'objects', 'employees', 'upgrades'];
  }
  if (stage === 4) {
    return ['department', 'objects', 'employees', 'research', 'upgrades'];
  }
  return ['department', 'objects', 'employees', 'research', 'upgrades', 'discoveries'];
}

export function evaluateOnboardingProgression(state: GameState): GameState {
  const ob: OnboardingState = state.onboarding ?? {
    tutorialStep: 'completed',
    tutorialCompleted: true,
    progressionStage: 6,
    claimedObjectiveIds: [],
    dismissedFeatureStage: 6,
    replayMode: false,
  };

  const discoveredCount = state.objects.filter((o) => o.status !== 'locked').length;
  const investigatedCount = state.objects.filter((o) => o.investigated).length;
  const hiredCount = state.employees.filter((e) => e.hired).length;
  const unlockedRoomsCount = Object.values(state.rooms).filter((r) => r.unlocked).length;
  const researchDoneCount = state.researchNodes.filter((r) => r.researched).length;
  const upgradesPurchased =
    state.upgrades.reduce((s, u) => s + u.purchasedCount, 0) +
    Object.values(state.rooms).reduce((s, r) => s + Math.max(0, r.level - 1), 0);

  let nextStage: ProgressionStage = ob.progressionStage;

  if (ob.tutorialCompleted && nextStage < 2) {
    nextStage = 2;
  }

  if (
    nextStage === 2 &&
    (investigatedCount >= 2 ||
      (upgradesPurchased >= 1 && discoveredCount >= 2 && state.totalFundsEarned >= 210) ||
      state.resources.reputation >= 8)
  ) {
    nextStage = 3;
  }

  if (
    nextStage === 3 &&
    ((hiredCount >= 1 && unlockedRoomsCount >= 4) ||
      (investigatedCount >= 3 && state.rooms.research_desk?.unlocked) ||
      state.resources.reputation >= 12)
  ) {
    nextStage = 4;
  }

  if (
    nextStage === 4 &&
    ((researchDoneCount >= 1 && discoveredCount >= 4) ||
      state.resources.reputation >= 18 ||
      (state.classifiedProjects ?? []).some((p) => p.completed))
  ) {
    nextStage = 5;
  }

  if (
    nextStage === 5 &&
    (state.floor3Unlocked || state.resources.reputation >= 28 || (state.prestigeEra ?? 1) >= 2)
  ) {
    nextStage = 6;
  }

  let nextObjects = state.objects;
  let extraNotifs: GameNotification[] = [];
  const now = Date.now();

  // Deliver Stage 2 second starter object (The Infinite Mug) if still locked once Stage >= 2
  if (nextStage >= 2) {
    const mug = nextObjects.find((o) => o.id === 'obj_infinite_mug');
    if (mug && mug.status === 'locked') {
      nextObjects = nextObjects.map((o) =>
        o.id === 'obj_infinite_mug' ? { ...o, status: 'intake' as const, discoveredAt: now } : o
      );
      extraNotifs.push({
        id: `stage2_mug_${now}`,
        kind: 'delivery',
        category: 'positive',
        title: 'Second Delivery: The Infinite Mug',
        message:
          'A cobalt camp mug slid down the Reception chute with a note from Accounting: "Still warm." Check Objects to investigate it!',
        timestamp: now,
        read: false,
        resolved: true,
        resolvedText: 'DOU-002 delivered to Intake.',
      });
    }
  }

  // Deliver Stage 3 plant (DOU-003) cleanly when entering Stage >= 3
  if (nextStage >= 3) {
    const plant = nextObjects.find((o) => o.id === 'obj_overachieving_plant');
    if (plant && plant.status === 'locked') {
      nextObjects = nextObjects.map((o) =>
        o.id === 'obj_overachieving_plant'
          ? { ...o, status: 'intake' as const, discoveredAt: now }
          : o
      );
      extraNotifs.push({
        id: `stage3_plant_${now}`,
        kind: 'delivery',
        category: 'positive',
        title: 'Conservatory Transfer: The Overachieving Plant',
        message:
          'Municipal Conservatory transferred DOU-003 after it sprouted tiny brass paperclips. Inspect it to unlock object synergies!',
        timestamp: now,
        read: false,
        resolved: true,
        resolvedText: 'DOU-003 delivered to Intake.',
      });
    }
  }

  // Deliver Stage 4 lamp (DOU-004) cleanly when entering Stage >= 4
  if (nextStage >= 4) {
    const lamp = nextObjects.find((o) => o.id === 'obj_emotional_lamp');
    if (lamp && lamp.status === 'locked') {
      nextObjects = nextObjects.map((o) =>
        o.id === 'obj_emotional_lamp' ? { ...o, status: 'intake' as const, discoveredAt: now } : o
      );
      extraNotifs.push({
        id: `stage4_lamp_${now}`,
        kind: 'delivery',
        category: 'positive',
        title: 'Lounge Transfer: The Emotional Lamp',
        message:
          'DOU-004 arrived humming softly in seafoam teal. Place it in the Research Laboratory for +40% Research synergy!',
        timestamp: now,
        read: false,
        resolved: true,
        resolvedText: 'DOU-004 delivered to Intake.',
      });
    }
  }

  if (
    nextStage === ob.progressionStage &&
    nextObjects === state.objects &&
    state.onboarding !== undefined
  ) {
    return state;
  }

  return {
    ...state,
    objects: nextObjects,
    notifications:
      extraNotifs.length > 0
        ? [...extraNotifs, ...state.notifications].slice(0, 20)
        : state.notifications,
    onboarding: {
      ...ob,
      progressionStage: nextStage,
    },
  };
}
