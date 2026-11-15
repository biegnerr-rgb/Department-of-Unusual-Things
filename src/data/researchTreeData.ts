import {
  GameState,
  PrestigeTechnology,
  ResearchBranch,
  ResearchNode,
} from '../types/game';

export const RESEARCH_BRANCH_META: Record<
  ResearchBranch,
  {
    label: string;
    shortLabel: string;
    description: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  investigation: {
    label: 'Investigation Technology',
    shortLabel: 'Investigation',
    description: 'Advanced scanners, rapid analysis workflows, and hidden-property detection.',
    badgeBg: 'bg-[#E6F4F2]',
    badgeText: 'text-[#0F766E]',
  },
  containment: {
    label: 'Containment Technology',
    shortLabel: 'Containment',
    description: 'Tier upgrades, automated shelving, and disruption-proof security hardware.',
    badgeBg: 'bg-[#DBEAFE]',
    badgeText: 'text-[#1E40AF]',
  },
  automation: {
    label: 'Automation',
    shortLabel: 'Automation',
    description: 'Self-queuing investigations, smart staff routing, and self-maintaining machines.',
    badgeBg: 'bg-[#FEF3C7]',
    badgeText: 'text-[#92400E]',
  },
  employee: {
    label: 'Employee Development',
    shortLabel: 'Employees',
    description: 'Fellowships, XP accelerators, and ergonomic workplace morale systems.',
    badgeBg: 'bg-[#FCE7F3]',
    badgeText: 'text-[#9D174D]',
  },
  experimental: {
    label: 'Experimental Science',
    shortLabel: 'Experimental',
    description: 'Object combination harmonics, Sample processing, and rare mutation analysis.',
    badgeBg: 'bg-[#F3E8FF]',
    badgeText: 'text-[#6B21A8]',
  },
  anomaly: {
    label: 'Anomaly Research',
    shortLabel: 'Anomalies',
    description: 'Grants, dossier indexing, and catalog discoveries across oddity tiers.',
    badgeBg: 'bg-[#DCFCE7]',
    badgeText: 'text-[#166534]',
  },
  reality: {
    label: 'Reality Manipulation',
    shortLabel: 'Reality',
    description: 'Spatial distortion, temporal chronometry, and dimensional containment bays.',
    badgeBg: 'bg-[#E0E7FF]',
    badgeText: 'text-[#3730A3]',
  },
};

export const EXPANDED_RESEARCH_TREE: ResearchNode[] = [
  // 1. INVESTIGATION TECHNOLOGY
  {
    id: 'res_intake_protocol',
    branch: 'investigation',
    name: 'Polite Intake Protocols',
    description: 'Standardizes wooden-ruler poking and warm tea rituals for newly arrived objects.',
    costResearch: 35,
    researched: false,
    effectLabel: '+25% Investigation Speed & discovers The Cube of Unnecessary Knowledge',
    unlocksObjectId: 'obj_cube_knowledge',
    unlockType: 'object',
    unlockSummary: 'Unlocks DOU-005 Object',
  },
  {
    id: 'res_inv_scanners',
    branch: 'investigation',
    name: 'Advanced Object Scanners',
    description: 'Builds an automated acoustic-resonance hood for the Investigation Laboratory.',
    costResearch: 95,
    prerequisiteId: 'res_intake_protocol',
    researched: false,
    effectLabel: '+30% Investigation Speed & unlocks Subspace Resonance Scanner equipment',
    unlockType: 'equipment',
    unlockSummary: 'Unlocks Scanner Gear',
  },
  {
    id: 'res_inv_faster_analysis',
    branch: 'investigation',
    name: 'Faster Analysis Pipelines',
    description: 'Streamlines five-stage waveform forms using carbon-copy templates.',
    costResearch: 175,
    prerequisiteId: 'res_inv_scanners',
    researched: false,
    effectLabel: '+35% Investigation Speed & -25% RP Acceleration Cost',
    unlockType: 'mechanic',
    unlockSummary: '-25% Accel Cost',
  },
  {
    id: 'res_inv_hidden_detection',
    branch: 'investigation',
    name: 'Hidden Property Detection',
    description: 'Dual-spectrum lamps expose shy secondary traits & mutations during testing.',
    costResearch: 280,
    prerequisiteId: 'res_inv_faster_analysis',
    researched: false,
    effectLabel: '+35% Unexpected Finding Chance & +25% Secondary Ability Yield',
    unlockType: 'mechanic',
    unlockSummary: 'Hidden Trait Detector',
  },

  // 2. CONTAINMENT TECHNOLOGY
  {
    id: 'res_botanical_dampening',
    branch: 'containment',
    name: 'Acoustic & Botanical Sensing',
    description: 'Deploys brass listening cones and gentle misting across sub-levels.',
    costResearch: 90,
    prerequisiteId: 'res_intake_protocol',
    researched: false,
    effectLabel: '+20% Reputation Gain & +15% Anomaly Sample Yield',
    unlockType: 'upgrade',
    unlockSummary: 'Rep & Samples Boost',
  },
  {
    id: 'res_con_improved_chambers',
    branch: 'containment',
    name: 'Improved Containment Chambers',
    description: 'Reinforces pedestal glass with laminated brass strips across every floor.',
    costResearch: 190,
    prerequisiteId: 'res_botanical_dampening',
    researched: false,
    effectLabel: '+1 Effective Containment Tier Facility-Wide & +25% Contained Object Output',
    unlockType: 'room',
    unlockSummary: '+1 Containment Tier',
  },
  {
    id: 'res_con_automated_storage',
    branch: 'containment',
    name: 'Automated Storage Carousels',
    description: 'Installs motorized rotating display trays inside Containment, Archives & Deep Storage.',
    costResearch: 310,
    prerequisiteId: 'res_con_improved_chambers',
    researched: false,
    effectLabel: '+1 Object Slot in Containment/Archives/Deep Storage & +20% Object Yield',
    unlockType: 'room',
    unlockSummary: '+1 Storage Pedestal',
  },
  {
    id: 'res_con_advanced_security',
    branch: 'containment',
    name: 'Advanced Security Systems',
    description: 'Installs velvet motion baffles that keep high-tier objects calm and staff steady.',
    costResearch: 430,
    prerequisiteId: 'res_con_automated_storage',
    researched: false,
    effectLabel: '+30% Funds Output & +30% Reputation Gain from Security & Containment',
    unlockType: 'upgrade',
    unlockSummary: 'Security Protocol',
  },

  // 3. AUTOMATION
  {
    id: 'res_auto_investigations',
    branch: 'automation',
    name: 'Automated Investigations',
    description: 'Pneumatic conveyor automatically moves newly discovered objects onto empty Lab benches.',
    costResearch: 130,
    prerequisiteId: 'res_intake_protocol',
    researched: false,
    effectLabel: 'Unlocks Auto-Investigation Queue + +15% Investigation Speed',
    unlockType: 'mechanic',
    unlockSummary: 'Auto-Investigate Mechanic',
  },
  {
    id: 'res_auto_staff',
    branch: 'automation',
    name: 'Automatic Employee Assignments',
    description: 'Corridor bulletin bells automatically route idle staff into open specialty rooms.',
    costResearch: 230,
    prerequisiteId: 'res_auto_investigations',
    researched: false,
    effectLabel: 'Unlocks Auto-Assign Staff + +20% Automated Worker Productivity',
    unlockType: 'mechanic',
    unlockSummary: 'Auto-Roster Mechanic',
  },
  {
    id: 'res_auto_machines',
    branch: 'automation',
    name: 'Self-Maintaining Machines',
    description: 'Self-oiling brass flywheels keep workshop and laboratory machinery tuned nonstop.',
    costResearch: 380,
    prerequisiteId: 'res_auto_staff',
    researched: false,
    effectLabel: '+25% Room Equipment Performance & +20% Funds Output Facility-Wide',
    unlockType: 'upgrade',
    unlockSummary: '+25% Machine Output',
  },

  // 4. EMPLOYEE DEVELOPMENT
  {
    id: 'res_emp_seminars',
    branch: 'employee',
    name: 'Structured Apprenticeship Seminars',
    description: 'Evening tea workshops accelerate how quickly staff master bizarre equipment.',
    costResearch: 115,
    prerequisiteId: 'res_intake_protocol',
    researched: false,
    effectLabel: '+40% Employee XP Gain & +15% Staff Yield',
    unlockType: 'upgrade',
    unlockSummary: '+40% Staff XP',
  },
  {
    id: 'res_emp_fellowships',
    branch: 'employee',
    name: 'Senior Bureaucratic Fellowships',
    description: 'Establishes a prestigious postdoctoral bench attracting veteran anomaly scholars.',
    costResearch: 245,
    prerequisiteId: 'res_emp_seminars',
    researched: false,
    effectLabel: 'Recruits Dr. Helena Vance (Senior Scholar) free or grants +50 Team XP & +25% Staff Yield',
    unlockType: 'employee',
    unlockSummary: 'Unlocks Senior Fellow',
  },
  {
    id: 'res_emp_morale',
    branch: 'employee',
    name: 'High-Morale Ergonomics',
    description: 'Cushioned mats and acoustic wall paneling keep teams energetic during long shifts.',
    costResearch: 360,
    prerequisiteId: 'res_emp_fellowships',
    researched: false,
    effectLabel: 'Staff Recover Passive Energy & +25% Employee Speed Bonus',
    unlockType: 'mechanic',
    unlockSummary: 'Passive Energy Regen',
  },

  // 5. EXPERIMENTAL SCIENCE
  {
    id: 'res_exp_combinations',
    branch: 'experimental',
    name: 'Object Combination Experiments',
    description: 'Maps safe resonant pairings between anomalies housed in adjacent corridors.',
    costResearch: 155,
    prerequisiteId: 'res_botanical_dampening',
    researched: false,
    effectLabel: '+45% All Object-to-Object Synergy Outputs',
    unlockType: 'mechanic',
    unlockSummary: '+45% Synergy Yield',
  },
  {
    id: 'res_exp_materials',
    branch: 'experimental',
    name: 'Unusual Material Processing',
    description: 'Condenses stray luminescence and espresso frost into pure Anomaly Samples.',
    costResearch: 265,
    prerequisiteId: 'res_exp_combinations',
    researched: false,
    effectLabel: '+35% Anomaly Sample Generation Facility-Wide',
    unlockType: 'upgrade',
    unlockSummary: '+35% Sample Yield',
  },
  {
    id: 'res_exp_mutations',
    branch: 'experimental',
    name: 'Advanced Mutation Analysis',
    description: 'Extracts extra Funds & Research whenever rare object variants manifest.',
    costResearch: 410,
    prerequisiteId: 'res_exp_materials',
    researched: false,
    effectLabel: '+40% Rare Variant Yield & +25% Research Points',
    unlockType: 'upgrade',
    unlockSummary: 'Mutation Catalyst',
  },

  // 6. ANOMALY RESEARCH
  {
    id: 'res_grant_forms',
    branch: 'anomaly',
    name: 'Triplicate Grant Filing',
    description: 'Turns bizarre lab incidents into tidy budget justifications.',
    costResearch: 65,
    prerequisiteId: 'res_intake_protocol',
    researched: false,
    effectLabel: '+25% Department Funds from all rooms',
    unlockType: 'upgrade',
    unlockSummary: '+25% Funds',
  },
  {
    id: 'res_self_catalog',
    branch: 'anomaly',
    name: 'Nostalgia Archive Indexing',
    description: 'Decodes unlabeled glass memory canisters and invisible wingbeats.',
    costResearch: 275,
    prerequisiteId: 'res_botanical_dampening',
    researched: false,
    effectLabel: '+25% Object Output & discovers The Memory Vending Machine',
    unlocksObjectId: 'obj_memory_vending',
    unlockType: 'object',
    unlockSummary: 'Unlocks DOU-003 Object',
  },
  {
    id: 'res_acoustic_containment',
    branch: 'anomaly',
    name: 'Barometric Bell-Jar Containment',
    description: 'Uses copper lightning rods to safely capture pocket-sized weather anomalies.',
    costResearch: 420,
    prerequisiteId: 'res_chronometry',
    researched: false,
    effectLabel: '+35% All Yield & discovers The Pocket-Sized Thunderstorm',
    unlocksObjectId: 'obj_thunderstorm',
    unlockType: 'object',
    unlockSummary: 'Unlocks DOU-010 Object',
  },

  // 7. REALITY MANIPULATION
  {
    id: 'res_chronometry',
    branch: 'reality',
    name: 'Nested Chronometry',
    description: 'Calibrates escapements and mirror wavelengths across alternate afternoons.',
    costResearch: 185,
    prerequisiteId: 'res_grant_forms',
    researched: false,
    effectLabel: '+30% Research Points & unlocks The Suspicious Mirror clue',
    unlocksObjectId: 'obj_suspicious_mirror',
    unlockType: 'object',
    unlockSummary: 'Unlocks DOU-008 Object',
  },
  {
    id: 'res_real_spatial',
    branch: 'reality',
    name: 'Spatial Distortion Blueprinting',
    description: 'Folds hallway corners neatly by three inches, opening extra sub-level space.',
    costResearch: 350,
    prerequisiteId: 'res_chronometry',
    researched: false,
    effectLabel: 'Unlocks Sub-Level B2 Access (or +$300 Refund) & +25% All Output',
    unlockType: 'room',
    unlockSummary: 'Sub-Level B2 Access',
  },
  {
    id: 'res_real_temporal',
    branch: 'reality',
    name: 'Temporal Shift Chronometry',
    description: 'Issues calibrated brass pocket watches to slip extra seconds into lab work.',
    costResearch: 520,
    prerequisiteId: 'res_real_spatial',
    researched: false,
    effectLabel: 'Unlocks Pocket Chronometer Staff Gear & +30% Investigation/RP Output',
    unlockType: 'equipment',
    unlockSummary: 'Unlocks Chronometer Gear',
  },
  {
    id: 'res_real_dimensional',
    branch: 'reality',
    name: 'Dimensional Storage Pockets',
    description: 'Stacks shelving slightly sideways into harmless non-Euclidean recesses.',
    costResearch: 700,
    prerequisiteId: 'res_real_temporal',
    researched: false,
    effectLabel: '+45% Object Output, +25% Samples & +2h Offline Cap',
    unlockType: 'mechanic',
    unlockSummary: 'Dimensional Storage',
  },
];

export const INITIAL_PRESTIGE_TECHNOLOGIES: PrestigeTechnology[] = [
  {
    id: 'pres_quantum_ledger',
    name: 'Quantum Grant Ledger',
    description: 'Encodes treasury stipends across operational eras with brass-foil seals.',
    costSeals: 2,
    purchased: false,
    effectLabel: '+50% Permanent Funds & Research Multiplier per Era',
  },
  {
    id: 'pres_chronal_archive',
    name: 'Chronal Relic Category Charter',
    description: 'Unlocks the Chronal Relic object category, introducing DOU-011 (Paradoxical Compass).',
    costSeals: 3,
    purchased: false,
    effectLabel: 'Unlocks Chronal Category & DOU-011 Compass + +25% Investigation Speed',
  },
  {
    id: 'pres_dimensional_vault',
    name: 'Dimensional Construct Charter',
    description: 'Unlocks the Dimensional Construct category, introducing DOU-012 (Klein-Bottle Suggestion Box).',
    costSeals: 4,
    purchased: false,
    effectLabel: 'Unlocks Dimensional Category & DOU-012 Box + +35% Sample Yield',
  },
  {
    id: 'pres_headstart_protocol',
    name: 'Veteran Era Headstart',
    description: 'Carries starter blueprints and senior contacts across operational era resets.',
    costSeals: 3,
    purchased: false,
    effectLabel: 'Start each Era with Archives Open, +$350 Funds & Dr. Barnaby active',
  },
  {
    id: 'pres_reality_bench',
    name: 'Eternal Investigation Rig',
    description: 'Rebuilds workbench optics from indestructible era-anchored brass.',
    costSeals: 5,
    purchased: false,
    effectLabel: '+60% Permanent Investigation Speed & -25% Research RP Costs',
  },
];

export function hasPrestigeTech(state: GameState, techId: string): boolean {
  return Boolean(state.prestigeTechnologies?.find((t) => t.id === techId)?.purchased);
}

export function canEnterNextOperationalEra(state: GameState): {
  eligible: boolean;
  reputationMet: boolean;
  investigatedMet: boolean;
  roomsMet: boolean;
  reputationTarget: number;
  investigatedTarget: number;
  roomsTarget: number;
  rewardSeals: number;
} {
  const era = state.prestigeEra ?? 1;
  const reputationTarget = 35 + (era - 1) * 20;
  const investigatedTarget = 5;
  const roomsTarget = 5;

  const investigatedCount = state.objects.filter((o) => o.investigated).length;
  const unlockedRoomsCount = Object.values(state.rooms).filter((r) => r.unlocked).length;
  const reputationMet = state.resources.reputation >= reputationTarget;
  const investigatedMet = investigatedCount >= investigatedTarget;
  const roomsMet = unlockedRoomsCount >= roomsTarget;
  const eligible = reputationMet && investigatedMet && roomsMet;

  const researchCompleted = state.researchNodes.filter((r) => r.researched).length;
  const rewardSeals = Math.max(
    3,
    Math.floor(state.resources.reputation / 15) +
      Math.floor(researchCompleted / 4) +
      Math.max(0, investigatedCount - 4) +
      (unlockedRoomsCount >= 7 ? 2 : 0)
  );

  return {
    eligible,
    reputationMet,
    investigatedMet,
    roomsMet,
    reputationTarget,
    investigatedTarget,
    roomsTarget,
    rewardSeals,
  };
}
