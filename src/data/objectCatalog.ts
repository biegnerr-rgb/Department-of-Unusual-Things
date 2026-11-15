import {
  EnvironmentAffinity,
  HiddenProperty,
  InvestigationEquipment,
  InvestigationStageName,
  ObjectCategory,
  ObjectRarity,
  SpecialAssignment,
  UnusualObject,
} from '../types/game';

export const INVESTIGATION_STAGES: Array<{
  stageNumber: number;
  name: InvestigationStageName;
  minProgress: number;
  description: string;
}> = [
  {
    stageNumber: 1,
    name: 'Initial inspection',
    minProgress: 0,
    description: 'Measure dimensions, check safe handling, and log surface markings.',
  },
  {
    stageNumber: 2,
    name: 'Behavioral observation',
    minProgress: 20,
    description: 'Monitor idle patterns, quirks, and reactions to nearby staff.',
  },
  {
    stageNumber: 3,
    name: 'Ability testing',
    minProgress: 40,
    description: 'Probe primary anomalous behavior under controlled desk lamps.',
  },
  {
    stageNumber: 4,
    name: 'Research analysis',
    minProgress: 60,
    description: 'Cross-reference waveforms to expose hidden secondary properties.',
  },
  {
    stageNumber: 5,
    name: 'Final classification',
    minProgress: 80,
    description: 'Certify anomaly class, containment rules, and permanent bonuses.',
  },
];

export const INITIAL_INVESTIGATION_EQUIPMENT: InvestigationEquipment[] = [
  {
    id: 'eq_calipers',
    name: 'Standard Brass Calipers',
    description: 'Reliable bureaucratic ruler and magnifying lens for careful inspection.',
    costFunds: 0,
    unlocked: true,
    speedBonusPct: 10,
    rpYieldBonusPct: 0,
    unexpectedChancePct: 15,
  },
  {
    id: 'eq_parabolic',
    name: 'Acoustic Parabolic Dish',
    description: 'Picks up faint humming, whispers, and hidden quacks inside objects.',
    costFunds: 140,
    unlocked: false,
    speedBonusPct: 30,
    rpYieldBonusPct: 15,
    unexpectedChancePct: 32,
  },
  {
    id: 'eq_strobe',
    name: 'Chronometric Strobe Lamp',
    description: 'Reveals micro-second shifts and stabilizes erratic timing anomalies.',
    costFunds: 290,
    unlocked: false,
    speedBonusPct: 48,
    rpYieldBonusPct: 28,
    unexpectedChancePct: 42,
  },
  {
    id: 'eq_prism',
    name: 'Resonance Crystal Prism',
    description: 'Refracts hidden object auras to uncover rare variants and extra RP.',
    costFunds: 520,
    unlocked: false,
    speedBonusPct: 65,
    rpYieldBonusPct: 45,
    unexpectedChancePct: 60,
  },
  {
    id: 'eq_subspace_scanner',
    name: 'Automated Resonance Scanner',
    description: 'Research-unlocked parabolic array that sweeps 5 investigation wavelengths automatically.',
    costFunds: 460,
    unlocked: false,
    speedBonusPct: 85,
    rpYieldBonusPct: 60,
    unexpectedChancePct: 72,
  },
];

export const RARITY_CONFIG: Record<
  ObjectRarity,
  {
    rank: number;
    label: string;
    multiplier: number;
    badgeBg: string;
    badgeText: string;
    frameBorder: string;
    glowColor: string;
  }
> = {
  Common: {
    rank: 1,
    label: 'Common',
    multiplier: 1.0,
    badgeBg: '#EAE2D3',
    badgeText: '#4B4035',
    frameBorder: '#8C7D6B',
    glowColor: 'rgba(140, 125, 107, 0.15)',
  },
  Uncommon: {
    rank: 2,
    label: 'Uncommon',
    multiplier: 1.35,
    badgeBg: '#DCFCE7',
    badgeText: '#166534',
    frameBorder: '#16A34A',
    glowColor: 'rgba(22, 163, 74, 0.18)',
  },
  Rare: {
    rank: 3,
    label: 'Rare',
    multiplier: 1.8,
    badgeBg: '#DBEAFE',
    badgeText: '#1E40AF',
    frameBorder: '#2563EB',
    glowColor: 'rgba(37, 99, 235, 0.2)',
  },
  Epic: {
    rank: 4,
    label: 'Epic',
    multiplier: 2.4,
    badgeBg: '#F3E8FF',
    badgeText: '#6B21A8',
    frameBorder: '#9333EA',
    glowColor: 'rgba(147, 51, 234, 0.22)',
  },
  Legendary: {
    rank: 5,
    label: 'Legendary',
    multiplier: 3.2,
    badgeBg: '#FEF3C7',
    badgeText: '#92400E',
    frameBorder: '#D97706',
    glowColor: 'rgba(217, 119, 6, 0.26)',
  },
  Impossible: {
    rank: 6,
    label: 'Impossible',
    multiplier: 4.5,
    badgeBg: '#CCFBF1',
    badgeText: '#115E59',
    frameBorder: '#0D9488',
    glowColor: 'rgba(13, 148, 136, 0.3)',
  },
};

export interface ObjectBlueprintInput {
  id: string;
  code: string;
  name: string;
  rarity: ObjectRarity;
  objectCategory?: ObjectCategory;
  minPrestigeEra?: number;
  anomalyClass: UnusualObject['anomalyClass'];
  iconKey: string;
  idleAnimation: UnusualObject['idleAnimation'];
  appearance: string;
  shortQuirk: string;
  description: string;
  discoveryLore: string;
  discoverySource: UnusualObject['discoverySource'];
  originHint: string;
  containmentRequirement: string;
  containmentNote: string;
  preferredEnvironment: EnvironmentAffinity;
  environmentBonusNote: string;
  requiredContainmentTier: 1 | 2 | 3;
  specialAbility: UnusualObject['specialAbility'];
  secondaryAbilityName: string;
  secondaryAbilityDescription: string;
  hiddenProperties: Array<Omit<HiddenProperty, 'revealed'>>;
  rareVariantCandidate: string;
  researchValue: number;
  investigationDurationSec: number;
  fundsPerSec: number;
  researchPerSec: number;
  reputationReward: number;
  reputationPerSec: number;
  startingStatus?: UnusualObject['status'];
  startingRoomId?: UnusualObject['assignedRoomId'];
  startingProgress?: number;
  interactionRules?: UnusualObject['interactionRules'];
}

export function createObjectFromBlueprint(bp: ObjectBlueprintInput): UnusualObject {
  const status = bp.startingStatus ?? 'locked';
  const progress = bp.startingProgress ?? (status === 'contained' ? 100 : 0);
  const investigated = status === 'contained' || progress >= 100;
  const currentStage = Math.min(5, Math.floor(progress / 20) + 1);

  return {
    id: bp.id,
    code: bp.code,
    name: bp.name,
    rarity: bp.rarity,
    objectCategory: bp.objectCategory ?? 'Standard',
    minPrestigeEra: bp.minPrestigeEra,
    anomalyClass: bp.anomalyClass,
    iconKey: bp.iconKey,
    idleAnimation: bp.idleAnimation,
    appearance: bp.appearance,
    shortQuirk: bp.shortQuirk,
    description: bp.description,
    discoveryLore: bp.discoveryLore,
    discoverySource: bp.discoverySource,
    originHint: bp.originHint,
    containmentRequirement: bp.containmentRequirement,
    containmentNote: bp.containmentNote,
    preferredEnvironment: bp.preferredEnvironment,
    environmentBonusNote: bp.environmentBonusNote,
    requiredContainmentTier: bp.requiredContainmentTier,
    specialAbility: bp.specialAbility,
    secondaryAbilityName: bp.secondaryAbilityName,
    secondaryAbilityDescription: bp.secondaryAbilityDescription,
    secondaryAbilityUnlocked: investigated,
    hiddenProperties: bp.hiddenProperties.map((hp) => ({
      ...hp,
      revealed: investigated || currentStage > hp.unlockAtStage,
    })),
    investigationReports: investigated
      ? [
          {
            id: `rep_init_${bp.id}`,
            stageNumber: 5,
            stageName: 'Final classification',
            timestamp: 1,
            summary: `Baseline dossier completed on ${bp.name}. Confirmed safe for velvet-lined containment.`,
          },
        ]
      : [],
    rareVariant: null,
    rareVariantCandidate: bp.rareVariantCandidate,
    researchValue: bp.researchValue,
    status,
    investigationProgress: progress,
    investigationDurationSec: bp.investigationDurationSec,
    investigated,
    fundsPerSec: bp.fundsPerSec,
    researchPerSec: bp.researchPerSec,
    reputationReward: bp.reputationReward,
    reputationPerSec: bp.reputationPerSec,
    assignedRoomId: bp.startingRoomId ?? null,
    discoveredAt: status !== 'locked' ? 1 : null,
    interactionRules: bp.interactionRules ?? [],
  };
}

export const OBJECT_BLUEPRINTS: ObjectBlueprintInput[] = [
  {
    id: 'obj_toaster',
    code: 'DOU-001',
    name: 'The Forecasting Toaster',
    rarity: 'Common',
    anomalyClass: 'Harmlessly Odd',
    iconKey: 'forecast_toaster',
    idleAnimation: 'toast_forecast',
    appearance: 'Polished 1958 chrome two-slice toaster with brass barometer dial on the side.',
    shortQuirk: 'Predicts tomorrow’s weather through scorched toast patterns.',
    description:
      'Ejects lightly browned slices featuring crisp cloud, sunshine, or umbrella patterns corresponding to the next morning’s barometric shift.',
    discoveryLore:
      'Donated by a sleepy meteorologist whose breakfast outperformed satellite Doppler for four straight months.',
    discoverySource: 'starter',
    originHint: 'Standard intake appliance from the Regional Weather Bureau.',
    containmentRequirement: 'Tier 1 Containment · Dry oak counter & daily crumb tray inspection',
    containmentNote:
      'Provide one slice of sourdough each morning to receive an accurate 24-hour forecast.',
    preferredEnvironment: 'laboratory',
    environmentBonusNote: '+40% Research output in Research Laboratory or Investigation Laboratory.',
    requiredContainmentTier: 1,
    specialAbility: {
      name: 'Pop Forecast Slice',
      description: 'Prints an immediate forecast slice, awarding bonus Research & Funds.',
      cooldownSec: 18,
      activationLines: [
        'Toast pattern: Clear skies with a 15% chance of stray memo gusts.',
        'Toast pattern: High-pressure espresso front moving toward Floor 2.',
        'Toast pattern: Expect mild static near the Confused Clock around 3:14 PM.',
      ],
    },
    secondaryAbilityName: 'Pre-Crime Malfunction Toast',
    secondaryAbilityDescription:
      'Revealed via investigation: prints warning slices whenever nearby chronometric objects are about to tick backwards (+15% RP ability bonus).',
    hiddenProperties: [
      {
        id: 'hp_toaster_1',
        label: 'Crumb-Tray Barometry',
        detail: 'Sourdough crumbs align magnetically along approaching low-pressure fronts.',
        unlockAtStage: 2,
      },
      {
        id: 'hp_toaster_2',
        label: 'Clock-Drift Foresight',
        detail: 'Toasts tiny hourglass scorch marks 10 minutes before the Confused Clock malfunctions.',
        unlockAtStage: 4,
      },
    ],
    rareVariantCandidate: 'Sunburst Chrome Edition',
    researchValue: 45,
    investigationDurationSec: 16,
    fundsPerSec: 2.3,
    researchPerSec: 1.5,
    reputationReward: 6,
    reputationPerSec: 0.05,
    startingStatus: 'intake',
    startingRoomId: null,
    startingProgress: 0,
    interactionRules: [
      {
        id: 'syn_toaster_clock',
        partnerObjectId: 'obj_confused_clock',
        title: 'Malfunction Forecast Link',
        description:
          'Forecasting Toaster predicts Confused Clock reverse-ticks 10 minutes early, stabilizing chronometric telemetry.',
        bonusResearchPerSec: 1.8,
        bonusInvestigationSpeedPct: 12,
      },
    ],
  },
  {
    id: 'obj_infinite_mug',
    code: 'DOU-002',
    name: 'The Infinite Mug',
    rarity: 'Common',
    anomalyClass: 'Harmlessly Odd',
    iconKey: 'infinite_mug',
    idleAnimation: 'mug_steam',
    appearance: 'Speckled cobalt enamel camp mug that stays pleasantly warm without a coaster.',
    shortQuirk: 'Always contains exactly one more sip than expected.',
    description:
      'No matter how thoroughly drained by thirsty analysts, tipping the mug gently reveals one fresh, aromatic sip of warm roast.',
    discoveryLore:
      'Recovered from an all-night budget committee room after sustaining six clerks for 72 hours.',
    discoverySource: 'delivery',
    originHint: 'Found near an exhausted accounting desk.',
    containmentRequirement: 'Tier 1 Containment · Ceramic saucer & strict no-tipping-upside-down rule',
    containmentNote:
      'Do not attempt to empty into a sink; drains complain about endless drizzle.',
    preferredEnvironment: 'containment',
    environmentBonusNote: '+40% Yield inside Containment Chamber or Experimental Wing.',
    requiredContainmentTier: 1,
    specialAbility: {
      name: 'Take One More Sip',
      description: 'Refreshes nearby staff morale for an instant burst of Research Points.',
      cooldownSec: 15,
      activationLines: [
        'Surprisingly, there is still one warm sip left. Tastes like hazelnut.',
        'Another last sip! Staff focus sharpens noticeably.',
        'Bottom of the mug remains politely out of reach.',
      ],
    },
    secondaryAbilityName: 'Thermal Constant Brew',
    secondaryAbilityDescription:
      'Maintains 64°C temperature indefinitely, subtly boosting nearby Research Laboratory efficiency.',
    hiddenProperties: [
      {
        id: 'hp_mug_1',
        label: 'Aroma Memory',
        detail: 'Switches roast profile automatically to match the drinker’s favorite childhood café.',
        unlockAtStage: 2,
      },
      {
        id: 'hp_mug_2',
        label: 'Micro-Thermodynamics',
        detail: 'Liquid level resets only when nobody is peeking straight down the rim.',
        unlockAtStage: 4,
      },
    ],
    rareVariantCandidate: 'Bottomless Porcelain Reserve',
    researchValue: 40,
    investigationDurationSec: 20,
    fundsPerSec: 1.9,
    researchPerSec: 1.3,
    reputationReward: 5,
    reputationPerSec: 0.05,
    startingStatus: 'locked',
    interactionRules: [
      {
        id: 'syn_mug_cube',
        partnerObjectId: 'obj_cube_knowledge',
        title: 'Midnight Study Fuel',
        description:
          'Infinite Mug pairs with the Cube of Unnecessary Knowledge, turning useless trivia into steady Research.',
        bonusResearchPerSec: 1.6,
        bonusFundsPerSec: 1.2,
      },
    ],
  },
  {
    id: 'obj_overachieving_plant',
    code: 'DOU-003',
    name: 'The Overachieving Plant',
    rarity: 'Uncommon',
    anomalyClass: 'Mildly Unruly',
    iconKey: 'overachieving_plant',
    idleAnimation: 'plant_sprout',
    appearance: 'Cheerful potted fern sprouting tiny leaf-sculpted miniatures of nearby gadgets.',
    shortQuirk: 'Grows miniature copies of nearby objects along its stems.',
    description:
      'An unusually ambitious houseplant that observes neighboring furniture and blossoms into thumb-sized botanical replicas of staplers, teacups, or clocks.',
    discoveryLore:
      'Confiscated from a conservatory after blooming twelve working miniature brass padlocks.',
    discoverySource: 'delivery',
    originHint: 'Originally cataloged in the Municipal Conservatory.',
    containmentRequirement: 'Tier 1 Containment · Warm lamp light & misting twice weekly',
    containmentNote:
      'Keep clear of confidential keys unless you want sprout-sized duplicates.',
    preferredEnvironment: 'containment',
    environmentBonusNote: 'Self-duplicating flora produces +45% resources in Containment Chamber or Experimental Wing.',
    requiredContainmentTier: 1,
    specialAbility: {
      name: 'Prune Mini Replica',
      description: 'Harvests a cute miniature replica for bonus Department Funds.',
      cooldownSec: 20,
      activationLines: [
        'Snipped a leaf-sized brass desk bell! Collectors paid happily.',
        'A tiny fern-toaster sprouted on the left frond!',
        'Sprouted an adorable miniature clipboard.',
      ],
    },
    secondaryAbilityName: 'Symbiotic Canopy Bloom',
    secondaryAbilityDescription:
      'Revealed via investigation: mimics neighboring anomalies for +25% bonus Funds during ability activations.',
    hiddenProperties: [
      {
        id: 'hp_plant_1',
        label: 'Photosynthetic Mimicry',
        detail: 'Reproduces exact brass hinges and springs using reinforced chlorophyll.',
        unlockAtStage: 2,
      },
      {
        id: 'hp_plant_2',
        label: 'Polite Pruning Response',
        detail: 'Leans gently toward scissors and hums when given distilled rainwater.',
        unlockAtStage: 4,
      },
    ],
    rareVariantCandidate: 'Golden Frond Cultivar',
    researchValue: 65,
    investigationDurationSec: 28,
    fundsPerSec: 3.1,
    researchPerSec: 1.9,
    reputationReward: 8,
    reputationPerSec: 0.07,
    startingStatus: 'locked',
    interactionRules: [
      {
        id: 'syn_plant_nearby',
        partnerObjectId: 'ANY_ACTIVE',
        title: 'Botanical Mimicry',
        description:
          'Grows miniature leaf copies of neighboring active objects, boosting facility Funds & Research.',
        bonusFundsPerSec: 2.2,
        bonusResearchPerSec: 1.1,
      },
    ],
  },
  {
    id: 'obj_emotional_lamp',
    code: 'DOU-004',
    name: 'The Emotional Lamp',
    rarity: 'Uncommon',
    anomalyClass: 'Harmlessly Odd',
    iconKey: 'emotional_lamp',
    idleAnimation: 'mood_lamp',
    appearance: 'Mid-century pleated brass desk lamp with an opalescent color-shifting shade.',
    shortQuirk: 'Changes color depending on nearby people’s emotions.',
    description:
      'Shifts seamlessly from warm amber (contentment) to seafoam (curiosity) or rosy coral (mild Monday panic) based on everyone within twenty feet.',
    discoveryLore:
      'Discovered in a therapy waiting room where it politely turned soothing lavender before group sessions.',
    discoverySource: 'delivery',
    originHint: 'Arrived from a quiet mid-century lounge.',
    containmentRequirement: 'Tier 1 Containment · Grounded brass outlet & calm background music',
    containmentNote:
      'Avoid placing near surprise audit announcements; shade turns bright tangerine.',
    preferredEnvironment: 'laboratory',
    environmentBonusNote: '+40% Research yield inside Research Laboratory or Experimental Wing.',
    requiredContainmentTier: 1,
    specialAbility: {
      name: 'Calibrate Warm Glow',
      description: 'Radiates calming amber light, boosting Investigation Speed & Reputation.',
      cooldownSec: 18,
      activationLines: [
        'Shade settles into tranquil seafoam teal. Analysts feel inspired!',
        'Glowing warm marigold — everyone is oddly cheerful.',
        'Brief lavender pulse recorded in the room log.',
      ],
    },
    secondaryAbilityName: 'Empathy Filament Resonance',
    secondaryAbilityDescription:
      'Revealed via investigation: harmonizes room lighting to reduce fatigue and boost research breakthroughs.',
    hiddenProperties: [
      {
        id: 'hp_lamp_1',
        label: 'Unplugged Luminescence',
        detail: 'Continues glowing softly even when unplugged if someone nearby tells a good joke.',
        unlockAtStage: 2,
      },
      {
        id: 'hp_lamp_2',
        label: 'Curiosity Spectrum',
        detail: 'Emits a specific seafoam wavelength whenever an analyst solves a tough puzzle.',
        unlockAtStage: 4,
      },
    ],
    rareVariantCandidate: 'Aurora Pleated Brass',
    researchValue: 60,
    investigationDurationSec: 26,
    fundsPerSec: 2.6,
    researchPerSec: 2.2,
    reputationReward: 8,
    reputationPerSec: 0.08,
    startingStatus: 'locked',
    interactionRules: [
      {
        id: 'syn_lamp_staff',
        partnerObjectId: 'obj_infinite_mug',
        title: 'Cozy Shift Harmony',
        description:
          'Emotional Lamp & Infinite Mug create ideal studio lighting and morale (+15% Investigation Speed).',
        bonusInvestigationSpeedPct: 15,
        bonusResearchPerSec: 1.0,
      },
    ],
  },
  {
    id: 'obj_confused_clock',
    code: 'DOU-005',
    name: 'The Confused Clock',
    rarity: 'Rare',
    anomalyClass: 'Bureau-Grade',
    iconKey: 'confused_clock',
    idleAnimation: 'clock_reverse',
    appearance: 'Octagonal walnut wall clock whose brass hands occasionally debate direction.',
    shortQuirk: 'Sometimes runs backwards, especially right before lunch.',
    description:
      'Ticks faithfully forward for eleven minutes, hesitates apologetically, and briskly rewinds four minutes to double-check its work.',
    discoveryLore:
      'Removed from a train station concourse where commuters kept arriving before departing.',
    discoverySource: 'delivery',
    originHint: 'Salvaged from Platform 9B clocktower · Appears via Deliveries or Exploration.',
    containmentRequirement: 'Tier 2 Containment · Containment Chamber Lv.2+, Deep Storage, or Archives',
    containmentNote: 'Never use to schedule staff shift changes.',
    preferredEnvironment: 'laboratory',
    environmentBonusNote: '+40% Research output in Research Laboratory or Experimental Wing.',
    requiredContainmentTier: 2,
    specialAbility: {
      name: 'Wind Backwards',
      description: 'Reverses local entropy for a sharp burst of Research Points.',
      cooldownSec: 22,
      activationLines: [
        'Ticked backwards 37 seconds — recovered spilled coffee notes!',
        'Hands spun counter-clockwise and chimed 13 o’clock.',
        'Time hesitated politely; telemetry spiked.',
      ],
    },
    secondaryAbilityName: 'Retro-Causal Pendulum',
    secondaryAbilityDescription:
      'Revealed via investigation: occasionally rewinds small room cooldowns and doubles clockwork telemetry.',
    hiddenProperties: [
      {
        id: 'hp_clock_1',
        label: 'Lunchtime Hesitation',
        detail: 'Always stalls for 90 seconds at 11:58 AM as if debating whether noon arrived.',
        unlockAtStage: 2,
      },
      {
        id: 'hp_clock_2',
        label: 'Hidden 13th Chime',
        detail: 'Rings a quiet brass thirteenth chime whenever a rare discovery is imminent.',
        unlockAtStage: 4,
      },
    ],
    rareVariantCandidate: 'Gilded Chrono Edition',
    researchValue: 95,
    investigationDurationSec: 34,
    fundsPerSec: 3.8,
    researchPerSec: 3.1,
    reputationReward: 12,
    reputationPerSec: 0.1,
    startingStatus: 'locked',
  },
  {
    id: 'obj_cube_knowledge',
    code: 'DOU-006',
    name: 'The Cube of Unnecessary Knowledge',
    rarity: 'Rare',
    anomalyClass: 'Bureau-Grade',
    iconKey: 'knowledge_cube',
    idleAnimation: 'cube_hover',
    appearance: 'Palm-sized brushed anodized cube engraved with glowing cyan geometric trivia runes.',
    shortQuirk: 'Contains extremely specific useless information.',
    description:
      'Hums softly and whispers hyper-exact trivia whenever tapped, such as the exact number of brass paperclips dropped in Boise in 1974.',
    discoveryLore:
      'Decoded after an analyst accidentally solved an impossible crossword puzzle.',
    discoverySource: 'research',
    originHint: 'Origin Hint: Unlocked through Research Breakthroughs in Intake Protocols.',
    containmentRequirement: 'Tier 2 Containment · Archives, Research Laboratory, or Containment Lv.2+',
    containmentNote: 'Do not ask it how many grains of sand fit in a filing cabinet.',
    preferredEnvironment: 'archives',
    environmentBonusNote: '+45% Research & Reputation inside Archives or Research Laboratory.',
    requiredContainmentTier: 2,
    specialAbility: {
      name: 'Query Obscure Fact',
      description: 'Spouts startlingly useless trivia that sparks +RP & +Rep.',
      cooldownSec: 18,
      activationLines: [
        '"Fact: 412 left-handed staplers were painted teal in 1963."',
        '"Fact: Flamingos cannot legally sign municipal leases in Sector 04."',
        '"Fact: A standard thermos loses 0.002% charm every Tuesday."',
      ],
    },
    secondaryAbilityName: 'Encyclopedic Echo Index',
    secondaryAbilityDescription:
      'Revealed via investigation: cross-indexes trivia with active lab equipment for +25% Research output.',
    hiddenProperties: [
      {
        id: 'hp_cube_1',
        label: 'Sub-Vocal Trivia Hum',
        detail: 'Vibrates in Morse code listing discontinued 1950s cereal box prizes.',
        unlockAtStage: 2,
      },
      {
        id: 'hp_cube_2',
        label: 'Accidental Accuracy',
        detail: '1 in every 400 trivial facts accidentally solves an actual research equation.',
        unlockAtStage: 4,
      },
    ],
    rareVariantCandidate: 'Sapphire Runed Matrix',
    researchValue: 115,
    investigationDurationSec: 36,
    fundsPerSec: 4.1,
    researchPerSec: 4.2,
    reputationReward: 14,
    reputationPerSec: 0.12,
  },
  {
    id: 'obj_invisible_duck',
    code: 'DOU-007',
    name: 'The Invisible Duck',
    rarity: 'Epic',
    anomalyClass: 'Mildly Unruly',
    iconKey: 'invisible_duck',
    idleAnimation: 'invisible_ripple',
    appearance: 'Completely transparent silhouette marked only by acoustic ripples and tiny damp footprints.',
    shortQuirk: 'Makes polite quacking sounds but cannot be seen.',
    description:
      'An entirely invisible waterfowl that waddles between desks, leaves faint webbed prints on freshly waxed floors, and quacks whenever someone drops a pen.',
    discoveryLore:
      'Tracked down via sonar microphones after bread crusts vanished from the breakroom.',
    discoverySource: 'event',
    originHint: 'Origin Hint: Appears during Random Events, Field Exploration, or Special Assignments.',
    containmentRequirement: 'Tier 2 Containment · Containment Lv.2+, Deep Storage, or Experimental Wing',
    containmentNote: 'Tap the floor gently before rolling office chairs backward.',
    preferredEnvironment: 'deep_storage',
    environmentBonusNote: '+45% Yield inside Deep Storage or Experimental Wing.',
    requiredContainmentTier: 2,
    specialAbility: {
      name: 'Offer Breadcrumb',
      description: 'Triggers an invisible splash and happy quack for Reputation & RP.',
      cooldownSec: 22,
      activationLines: [
        'Quack! *happy invisible wing-flap ripples the air*',
        'Two tiny wet footprints appeared near the filing cabinet.',
        'Loud echoing "QUACK" boosted office spirits!',
      ],
    },
    secondaryAbilityName: 'Sonar Echo Localization',
    secondaryAbilityDescription:
      'Revealed via investigation: quacks reflect off hidden anomalies, boosting Exploration discovery odds.',
    hiddenProperties: [
      {
        id: 'hp_duck_1',
        label: 'Infrared Feather Outline',
        detail: 'Shows up under thermal scopes wearing a tiny invisible bow tie.',
        unlockAtStage: 2,
      },
      {
        id: 'hp_duck_2',
        label: 'Polite Puddle Etiquette',
        detail: 'Wipes its invisible webbed feet on a welcome mat before entering Research.',
        unlockAtStage: 4,
      },
    ],
    rareVariantCandidate: 'Echo-Plated Mallard',
    researchValue: 165,
    investigationDurationSec: 42,
    fundsPerSec: 5.5,
    researchPerSec: 5.0,
    reputationReward: 19,
    reputationPerSec: 0.16,
  },
  {
    id: 'obj_suspicious_mirror',
    code: 'DOU-008',
    name: 'The Suspicious Mirror',
    rarity: 'Epic',
    anomalyClass: 'Paradoxical',
    iconKey: 'suspicious_mirror',
    idleAnimation: 'mirror_glint',
    appearance: 'Ornate oval brass vanity mirror whose glass occasionally shows a completely different room.',
    shortQuirk: 'Occasionally shows something different from the room.',
    description:
      'Reflects the laboratory faithfully 85% of the time; the other 15%, it frames another discovered anomaly sitting on a velvet armchair.',
    discoveryLore:
      'Flagged during a Special Assignment after catching the reflection wearing a tiny hat.',
    discoverySource: 'assignment',
    originHint: 'Origin Hint: Earned by completing a Special Assignment or Nested Chronometry.',
    containmentRequirement: 'Tier 3 Containment · Reality Division, Deep Storage, or Containment Lv.3+',
    containmentNote: 'Wave politely if the reflection waves before you do.',
    preferredEnvironment: 'reality',
    environmentBonusNote: '+50% Output inside Reality Division or Deep Storage.',
    requiredContainmentTier: 3,
    specialAbility: {
      name: 'Peer Into Reflection',
      description: 'Glances into an alternate angle to copy Research from another object.',
      cooldownSec: 25,
      activationLines: [
        'The glass briefly showed an Infinite Mug floating in a sunlit hallway!',
        'Caught a glimpse of a Pocket-Sized Thunderstorm inside the mirror.',
        'Reflection blinked half a second late. Fascinating!',
      ],
    },
    secondaryAbilityName: 'Alternate Wing Glimpse',
    secondaryAbilityDescription:
      'Revealed via investigation: permanently mirrors passive telemetry from another discovered object.',
    hiddenProperties: [
      {
        id: 'hp_mirror_1',
        label: 'Delayed Blink Lag',
        detail: 'Reflections lag 0.4 seconds behind anyone holding a clipboard.',
        unlockAtStage: 2,
      },
      {
        id: 'hp_mirror_2',
        label: 'Cross-Room Windowing',
        detail: 'Shows active anomalies from other floors when the room lights dim.',
        unlockAtStage: 4,
      },
    ],
    rareVariantCandidate: 'Silvered Looking-Glass',
    researchValue: 185,
    investigationDurationSec: 46,
    fundsPerSec: 6.2,
    researchPerSec: 5.8,
    reputationReward: 22,
    reputationPerSec: 0.19,
    interactionRules: [
      {
        id: 'syn_mirror_any',
        partnerObjectId: 'ANY_ACTIVE',
        title: 'Cross-Reflection Resonance',
        description:
          'Suspicious Mirror reflects another discovered object in the facility, amplifying Research & Reputation.',
        bonusResearchPerSec: 2.5,
        bonusFundsPerSec: 1.5,
      },
    ],
  },
  {
    id: 'obj_memory_vending',
    code: 'DOU-009',
    name: 'The Memory Vending Machine',
    rarity: 'Legendary',
    anomalyClass: 'Paradoxical',
    iconKey: 'memory_vending',
    idleAnimation: 'vending_hum',
    appearance: 'Retro mint-green spiral vending machine stocked with glowing glass memory vials.',
    shortQuirk: 'Dispenses memories from people who never existed.',
    description:
      'Accepts loose buttons or quarters and drops a warm glass capsule containing vivid nostalgia—like winning a 1967 roller-skating ribbon in a town that isn’t on any map.',
    discoveryLore:
      'Rolled off an unmarked freight truck during a midnight Pneumatic Delivery.',
    discoverySource: 'delivery',
    originHint: 'Origin Hint: Arrives via Pneumatic Deliveries or Field Exploration.',
    containmentRequirement: 'Tier 3 Containment · Deep Storage, Reality Division, or Containment Lv.3+',
    containmentNote: 'Do not sample more than one nostalgic memory per shift.',
    preferredEnvironment: 'deep_storage',
    environmentBonusNote: '+50% Output inside Deep Storage or Archives.',
    requiredContainmentTier: 3,
    specialAbility: {
      name: 'Vend Memory Vial',
      description: 'Dispenses a fictional souvenir memory worth major Funds & Research.',
      cooldownSec: 28,
      activationLines: [
        'Dispensed Vial #B4: "Summer lemonade on the floating pier of New Brimble."',
        'Dispensed Vial #F9: "Teaching an invisible dog to fetch brass keys."',
        'Dispensed Vial #A1: "First snowfall inside a subterranean greenhouse."',
      ],
    },
    secondaryAbilityName: 'Phantom Town Archive',
    secondaryAbilityDescription:
      'Revealed via investigation: dispensed vials cross-reference forgotten blueprints for extra Funds.',
    hiddenProperties: [
      {
        id: 'hp_vending_1',
        label: 'Button-Currency Calibration',
        detail: 'Prefers vintage brass coat buttons over modern pocket change.',
        unlockAtStage: 2,
      },
      {
        id: 'hp_vending_2',
        label: 'Shared Daydream Echo',
        detail: 'Staff near the machine briefly recall baking pies in towns that never existed.',
        unlockAtStage: 4,
      },
    ],
    rareVariantCandidate: 'Mint Enamel Collectors Run',
    researchValue: 260,
    investigationDurationSec: 55,
    fundsPerSec: 9.2,
    researchPerSec: 7.4,
    reputationReward: 28,
    reputationPerSec: 0.24,
  },
  {
    id: 'obj_thunderstorm',
    code: 'DOU-010',
    name: 'The Pocket-Sized Thunderstorm',
    rarity: 'Impossible',
    anomalyClass: 'Paradoxical',
    iconKey: 'pocket_thunderstorm',
    idleAnimation: 'storm_cloud',
    appearance: 'Miniature silver-lined storm cloud crackling softly with harmless golden sparks.',
    shortQuirk: 'Produces miniature weather events inside a palm-sized space.',
    description:
      'A cheerful four-inch cumulonimbus cloud hovering above a copper dish, unleashing tiny rain showers, teacup-sized rainbows, and polite static crackles.',
    discoveryLore:
      'Hidden inside an unmarked brass weather vane on the facility rooftop.',
    discoverySource: 'hidden',
    originHint: 'Origin Hint: Hidden Discovery — look closely at the facility’s rooftop weather gear or explore deep anomalies.',
    containmentRequirement: 'Tier 3 Containment · Reality Division, Deep Storage, or Containment Lv.3+',
    containmentNote: 'Produces adorable 2-inch rainbows when watered with distilled mist.',
    preferredEnvironment: 'reality',
    environmentBonusNote: '+55% Output inside Reality Division or Experimental Wing.',
    requiredContainmentTier: 3,
    specialAbility: {
      name: 'Trigger Micro-Squall',
      description: 'Unleashes a miniature lightning & rainbow burst for huge RP, Funds & Rep.',
      cooldownSec: 30,
      activationLines: [
        'Crack! A tiny golden lightning bolt energized the Research Desk!',
        'Miniature drizzle formed a three-inch double rainbow over the desk!',
        'Tiny thunderclap rattled paperclips across the table.',
      ],
    },
    secondaryAbilityName: 'Micro-Rainbow Harvest',
    secondaryAbilityDescription:
      'Revealed via investigation: channels harmless static into nearby rooms and waters the Overachieving Plant.',
    hiddenProperties: [
      {
        id: 'hp_storm_1',
        label: 'Polite Thunder Volume',
        detail: 'Lowers thunder volume to a soft purr whenever someone is on the rotary phone.',
        unlockAtStage: 2,
      },
      {
        id: 'hp_storm_2',
        label: 'Double-Rainbow Condensation',
        detail: 'Raindrops taste faintly of ozone and lemon drops.',
        unlockAtStage: 4,
      },
    ],
    rareVariantCandidate: 'Golden Nimbus Paradox',
    researchValue: 380,
    investigationDurationSec: 65,
    fundsPerSec: 12.8,
    researchPerSec: 10.5,
    reputationReward: 38,
    reputationPerSec: 0.32,
    interactionRules: [
      {
        id: 'syn_storm_plant',
        partnerObjectId: 'obj_overachieving_plant',
        title: 'Micro-Climate Greenhouse',
        description:
          'Pocket-Sized Thunderstorm gently rains on the Overachieving Plant, supercharging miniature replica growth.',
        bonusFundsPerSec: 4.5,
        bonusResearchPerSec: 3.4,
      },
    ],
  },
  {
    id: 'obj_paradox_compass',
    code: 'DOU-011',
    name: 'The Paradoxical Compass',
    rarity: 'Legendary',
    objectCategory: 'Chronal',
    minPrestigeEra: 2,
    anomalyClass: 'Paradoxical',
    iconKey: 'paradox_compass',
    idleAnimation: 'clock_reverse',
    appearance: 'Antique brass mariner compass whose needles spin toward "Last Tuesday" and "Almost Midnight."',
    shortQuirk: 'Points directly toward whichever missing object you forgot you lost.',
    description:
      'A pocket brass compass from an Operational Era that never officially happened. Whenever shaken, its sapphire needle points unerringly toward misplaced coffee mugs and uncharted anomalies.',
    discoveryLore:
      'Cataloged under the Chronal Relic Category unlocked by Operational Era Progression.',
    discoverySource: 'research',
    originHint: 'Chronal Category Unlock: Enter Operational Era 2 or unlock Chronal Relic Charter.',
    containmentRequirement: 'Tier 3 Containment · Reality Division, Deep Storage, or Containment Lv.3+',
    containmentNote: 'Keeps desk schedules 14 seconds ahead of the Department clock.',
    preferredEnvironment: 'reality',
    environmentBonusNote: '+50% Output inside Reality Division or Archives.',
    requiredContainmentTier: 3,
    specialAbility: {
      name: 'Chart Temporal Bearing',
      description: 'Pins an alternate afternoon coordinate for major Research, Funds & Samples.',
      cooldownSec: 28,
      activationLines: [
        'Needle locked on "Three Hours Ago" — salvaged an extra notebook of telemetry!',
        'Brass casing chimed; pointing directly toward tomorrow’s petty cash envelope.',
      ],
    },
    secondaryAbilityName: 'Pre-Solved Filing Margin',
    secondaryAbilityDescription:
      'Revealed via investigation: boosts adjacent laboratory research synthesis across eras.',
    hiddenProperties: [
      {
        id: 'hp_compass_1',
        label: 'Six Cardinal Directions',
        detail: 'Includes North, South, East, West, Yesterday, and Slightly Left of Now.',
        unlockAtStage: 2,
      },
      {
        id: 'hp_compass_2',
        label: 'Chronal Echo Dampening',
        detail: 'Reduces nearby temporal jitter inside Reality Manipulation wings.',
        unlockAtStage: 4,
      },
    ],
    rareVariantCandidate: 'Gilded Meridian Sextant Edition',
    researchValue: 440,
    investigationDurationSec: 60,
    fundsPerSec: 15.0,
    researchPerSec: 13.0,
    reputationReward: 42,
    reputationPerSec: 0.36,
  },
  {
    id: 'obj_klein_box',
    code: 'DOU-012',
    name: 'The Klein-Bottle Suggestion Box',
    rarity: 'Impossible',
    objectCategory: 'Dimensional',
    minPrestigeEra: 2,
    anomalyClass: 'Paradoxical',
    iconKey: 'klein_box',
    idleAnimation: 'cube_hover',
    appearance: 'Iridescent blown-glass suggestion box whose inside is neatly folded onto its outside.',
    shortQuirk: 'Replies to complaints dropped inside before they are written.',
    description:
      'A one-sided topological wooden-and-glass ballot box. Slips dropped into the top slot flutter softly out of the bottom with polite stamps from the Archival Board.',
    discoveryLore:
      'Cataloged under the Dimensional Construct Category unlocked via Operational Era Charters.',
    discoverySource: 'research',
    originHint: 'Dimensional Category Unlock: Enter Operational Era 2 or unlock Dimensional Charter.',
    containmentRequirement: 'Tier 3 Containment · Reality Division, Deep Storage, or Containment Lv.3+',
    containmentNote: 'Do not fold employee feedback forms more than four dimensions deep.',
    preferredEnvironment: 'reality',
    environmentBonusNote: '+55% Output inside Reality Division or Archives.',
    requiredContainmentTier: 3,
    specialAbility: {
      name: 'Process Pre-Signed Memo',
      description: 'Folds a bureaucratic form inside-out for huge Funds, Research & Reputation.',
      cooldownSec: 30,
      activationLines: [
        'Pulled out a stamped approval memo dated from three Eras hence!',
        'The slot blinked cheerfully and refunded yesterday’s stationary budget twice.',
      ],
    },
    secondaryAbilityName: 'Non-Euclidean Grant Pocket',
    secondaryAbilityDescription:
      'Revealed via investigation: bends storage math to generate Anomaly Samples cleanly.',
    hiddenProperties: [
      {
        id: 'hp_klein_1',
        label: 'Reversible Hinges',
        detail: 'Locks from the inside even while standing open on both sides.',
        unlockAtStage: 2,
      },
      {
        id: 'hp_klein_2',
        label: 'Infinite Staple Hopper',
        detail: 'Always contains one helpful golden paperclip.',
        unlockAtStage: 4,
      },
    ],
    rareVariantCandidate: 'Topological Amber Prism Box',
    researchValue: 520,
    investigationDurationSec: 65,
    fundsPerSec: 18.5,
    researchPerSec: 15.5,
    reputationReward: 50,
    reputationPerSec: 0.44,
  },
];

export const INITIAL_SPECIAL_ASSIGNMENTS: SpecialAssignment[] = [
  {
    id: 'assign_mirror_hunt',
    title: 'Field Assignment: Reflective Oddity',
    description:
      'Complete at least 2 full object investigations and reach 18 Reputation to track down The Suspicious Mirror.',
    rewardObjectId: 'obj_suspicious_mirror',
    completed: false,
    claimed: false,
  },
  {
    id: 'assign_duck_breadcrumbs',
    title: 'Field Assignment: Acoustic Footprints',
    description:
      'Have at least 2 hired specialists and 1 Research project completed to coax out The Invisible Duck.',
    rewardObjectId: 'obj_invisible_duck',
    completed: false,
    claimed: false,
  },
];

export const INITIAL_COLLECTION_OBJECTS: UnusualObject[] =
  OBJECT_BLUEPRINTS.map(createObjectFromBlueprint);
