export type NavTab =
  | 'department'
  | 'objects'
  | 'employees'
  | 'research'
  | 'upgrades'
  | 'discoveries';

export type GameScreen = 'TITLE' | 'PLAYING';

export type RoomId =
  | 'reception'
  | 'investigation'
  | 'research_desk'
  | 'containment'
  | 'archive_vault'
  | 'anomaly_workshop'
  | 'break_lounge'
  | 'temporal_lab'
  | 'quantum_pantry';

export type RoomCategory = 'operations' | 'science' | 'containment' | 'reality';

export type EnvironmentAffinity =
  | 'laboratory'
  | 'containment'
  | 'archives'
  | 'experimental'
  | 'deep_storage'
  | 'reality';

export interface RoomDefinition {
  id: RoomId;
  name: string;
  floor: 1 | 2 | 3;
  slot: 0 | 1 | 2;
  category: RoomCategory;
  description: string;
  flavorQuote: string;
  initiallyUnlocked: boolean;
  unlockCostFunds: number;
  unlockMinReputation: number;
  maxLevel: number;
  baseStaffCapacity: number;
  maxStaffCapacity: number;
  baseObjectCapacity: number;
  maxObjectCapacity: number;
  supportsObjectSlot: 'investigation' | 'containment' | 'hybrid' | 'none';
  containmentTierProvided: number; // 1, 2, or 3 (scales with room level too)
  environmentTypes: EnvironmentAffinity[];
  uniqueActionLabel: string;
  uniqueActionDescription: string;
  baseFundsPerSec: number;
  baseResearchPerSec: number;
  baseReputationPerSec: number;
  accentColor: string;
  wallColor: string;
  floorColor: string;
}

export interface RoomRuntimeState {
  id: RoomId;
  unlocked: boolean;
  level: number;
  equipmentLevel: number; // 1..4 room-specific equipment efficiency tier
  objectCapacity: number;
  staffCapacity: number;
  assignedEmployeeIds: string[];
  assignedObjectIds: string[];
  assignedObjectId?: string | null; // backward compat alias
  bonusReady: boolean;
  bonusFunds: number;
  bonusResearch: number;
  lastUniqueActionAt?: number;
}

export type ObjectRarity =
  | 'Common'
  | 'Uncommon'
  | 'Rare'
  | 'Epic'
  | 'Legendary'
  | 'Impossible';

export type DiscoverySource =
  | 'starter'
  | 'delivery'
  | 'research'
  | 'event'
  | 'exploration'
  | 'assignment'
  | 'hidden';

export type IdleAnimationType =
  | 'toast_forecast'
  | 'plant_sprout'
  | 'vending_hum'
  | 'clock_reverse'
  | 'cube_hover'
  | 'invisible_ripple'
  | 'mood_lamp'
  | 'mirror_glint'
  | 'mug_steam'
  | 'storm_cloud'
  | 'float_gentle'
  | 'drip_pulse';

export type AnomalyClass = 'Harmlessly Odd' | 'Mildly Unruly' | 'Bureau-Grade' | 'Paradoxical';

export type ObjectStatus = 'locked' | 'intake' | 'investigating' | 'contained';

export interface ObjectSpecialAbility {
  name: string;
  description: string;
  cooldownSec: number;
  activationLines: string[];
}

export interface ObjectInteractionRule {
  id: string;
  partnerObjectId: string;
  title: string;
  description: string;
  bonusFundsPerSec?: number;
  bonusResearchPerSec?: number;
  bonusInvestigationSpeedPct?: number;
}

export type InvestigationStageName =
  | 'Initial inspection'
  | 'Behavioral observation'
  | 'Ability testing'
  | 'Research analysis'
  | 'Final classification';

export interface HiddenProperty {
  id: string;
  label: string;
  detail: string;
  unlockAtStage: number;
  revealed: boolean;
}

export interface InvestigationReportEntry {
  id: string;
  stageNumber: number;
  stageName: string;
  timestamp: number;
  summary: string;
  isUnexpected?: boolean;
  rewardText?: string;
}

export interface InvestigationEquipment {
  id: string;
  name: string;
  description: string;
  costFunds: number;
  unlocked: boolean;
  speedBonusPct: number;
  rpYieldBonusPct: number;
  unexpectedChancePct: number;
}

export type ObjectCategory = 'Standard' | 'Chronal' | 'Dimensional';

export interface UnusualObject {
  id: string;
  code: string;
  name: string;
  rarity: ObjectRarity;
  objectCategory?: ObjectCategory;
  minPrestigeEra?: number;
  anomalyClass: AnomalyClass;
  iconKey: string;
  idleAnimation: IdleAnimationType;
  appearance: string;
  shortQuirk: string;
  description: string;
  discoveryLore: string;
  discoverySource: DiscoverySource;
  originHint: string;
  containmentRequirement: string;
  containmentNote: string;
  preferredEnvironment: EnvironmentAffinity;
  environmentBonusNote: string;
  requiredContainmentTier: 1 | 2 | 3;
  specialAbility: ObjectSpecialAbility;
  secondaryAbilityName: string;
  secondaryAbilityDescription: string;
  secondaryAbilityUnlocked: boolean;
  hiddenProperties: HiddenProperty[];
  investigationReports: InvestigationReportEntry[];
  rareVariant: string | null;
  rareVariantCandidate: string;
  researchValue: number;
  status: ObjectStatus;
  investigationProgress: number;
  investigationDurationSec: number;
  investigated: boolean;
  fundsPerSec: number;
  researchPerSec: number;
  reputationReward: number;
  reputationPerSec: number;
  assignedRoomId: RoomId | null;
  discoveredAt: number | null;
  lastAbilityUsedAt?: number;
  interactionRules?: ObjectInteractionRule[];
}

export interface ActiveObjectSynergy {
  ruleId: string;
  sourceObjectId: string;
  sourceObjectName: string;
  targetObjectId: string;
  targetObjectName: string;
  title: string;
  description: string;
  bonusFundsPerSec: number;
  bonusResearchPerSec: number;
  bonusInvestigationSpeedPct: number;
}

export interface SpecialAssignment {
  id: string;
  title: string;
  description: string;
  rewardObjectId: string;
  completed: boolean;
  claimed: boolean;
}

export type EmployeeRole =
  | 'Junior Investigator'
  | 'Research Scientist'
  | 'Containment Specialist'
  | 'Engineer'
  | 'Archivist'
  | 'Security Officer'
  | 'Experimental Technician'
  | 'Department Manager';

export type EmployeePersonality =
  | 'Curious'
  | 'Overconfident'
  | 'Extremely Nervous'
  | 'Lazy'
  | 'Inventive'
  | 'Meticulous'
  | 'Steadfast'
  | 'Charismatic';

export interface EmployeeSpecialAbility {
  name: string;
  description: string;
  unlockedAtLevel: number;
  cooldownSec: number;
}

export interface EmployeeEquipment {
  id: string;
  name: string;
  description: string;
  costFunds: number;
  unlocked: boolean;
  productivityBonus: number;
  speedBonus: number;
  xpBonusPct: number;
}

export interface EmployeeActivityEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  role: EmployeeRole;
  roomId: RoomId | null;
  text: string;
  rewardText?: string;
  timestamp: number;
}

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  specialtyRoom: RoomId;
  quirk: string;
  bio: string;
  personality: EmployeePersonality;
  personalityNote: string;
  specialAbility: EmployeeSpecialAbility;
  avatarKey: string;
  coatColor: string;
  hairColor: string;
  skinColor: string;
  hired: boolean;
  hireCostFunds: number;
  hireMinReputation: number;
  level: number;
  experience: number;
  xpToNextLevel: number;
  productivity: number;
  salaryPerSec: number;
  speedBonus: number;
  yieldBonus: number;
  energy: number;
  equippedGearId: string | null;
  assignedRoomId: RoomId | null;
  currentTask: string;
  lastActionAt: number;
  lastAbilityAt: number;
  lastMotivatedAt: number;
}

export type UpgradeCategoryTag =
  | 'Room Productivity'
  | 'Employee Efficiency'
  | 'Investigation Speed'
  | 'Research Production'
  | 'Object Storage'
  | 'Delivery Frequency'
  | 'Machine Performance'
  | 'Offline Earnings';

export interface UpgradeItem {
  id: string;
  name: string;
  description: string;
  category: 'room' | 'department';
  upgradeTag?: UpgradeCategoryTag;
  targetRoomId?: RoomId;
  costFunds: number;
  maxPurchases: number;
  purchasedCount: number;
  effectLabel: string;
}

export type ResearchBranch =
  | 'investigation'
  | 'containment'
  | 'automation'
  | 'employee'
  | 'experimental'
  | 'anomaly'
  | 'reality';

export interface ResearchNode {
  id: string;
  branch: ResearchBranch;
  name: string;
  description: string;
  costResearch: number;
  prerequisiteId?: string;
  researched: boolean;
  effectLabel: string;
  unlocksObjectId?: string;
  unlockType?: 'object' | 'equipment' | 'room' | 'employee' | 'mechanic' | 'upgrade';
  unlockSummary?: string;
}

export interface PrestigeTechnology {
  id: string;
  name: string;
  description: string;
  costSeals: number;
  purchased: boolean;
  effectLabel: string;
}

export interface AutomationSettings {
  autoInvestigate: boolean;
  autoAssignStaff: boolean;
}

export interface DiscoveryEntry {
  id: string;
  title: string;
  category: 'object' | 'milestone' | 'phenomenon';
  description: string;
  unlocked: boolean;
  claimed: boolean;
  rewardFunds: number;
  rewardResearch: number;
  rewardReputation: number;
}

export type EventCategory = 'positive' | 'negative' | 'neutral' | 'rare' | 'secret';

export interface ActiveEconomicBoost {
  id: string;
  label: string;
  description: string;
  fundsMult: number;
  researchMult: number;
  samplesMult: number;
  deliverySpeedMult: number;
  investigationSpeedMult?: number;
  expiresAt: number;
}

export interface ExperimentalProject {
  id: string;
  name: string;
  description: string;
  costSamples: number;
  costResearch: number;
  minReputation: number;
  completedCount: number;
  maxCompletions: number;
  repeatable?: boolean;
  effectLabel: string;
}

export interface OfflineReport {
  rawSecondsAway: number;
  effectiveSecondsSimulated: number;
  capSeconds: number;
  wasCapped: boolean;
  efficiencyPct: number;
  fundsGenerated: number;
  researchGenerated: number;
  reputationGenerated: number;
  samplesGenerated: number;
  objectsInvestigated: string[];
  discoveriesMade: string[];
  eventsOccurred: string[];
}

export interface NotificationChoice {
  label: string;
  fundsDelta?: number;
  researchDelta?: number;
  reputationDelta?: number;
  samplesDelta?: number;
  staffEnergyDelta?: number;
  staffXpDelta?: number;
  deliverNewObject?: boolean;
  unlockObjectId?: string;
  relocateAssignedObjectToIntake?: boolean;
  recruitMissingEmployee?: boolean;
  unlockNextLockedRoom?: boolean;
  unlockFloor3?: boolean;
  triggerBoost?: {
    id: string;
    label: string;
    description: string;
    fundsMult: number;
    researchMult: number;
    samplesMult: number;
    deliverySpeedMult: number;
    investigationSpeedMult?: number;
    durationSec: number;
  };
  outcomeText: string;
}

export interface RandomEventDefinition {
  id: string;
  category: EventCategory;
  kind: GameNotification['kind'];
  weight: number;
  cooldownSec: number;
  minReputation?: number;
  minDiscoveredObjects?: number;
  minUnlockedRooms?: number;
  requiresLockedObject?: boolean;
  requiresAssignedObject?: boolean;
  requiresUnhiredEmployee?: boolean;
  title: string;
  message: string;
  choices: NotificationChoice[];
}

export interface GameNotification {
  id: string;
  eventId?: string;
  category?: EventCategory;
  kind: 'delivery' | 'discovery' | 'event' | 'milestone';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  resolved: boolean;
  choices?: NotificationChoice[];
  resolvedText?: string;
}

export interface FloatingFeedback {
  id: string;
  roomId: RoomId;
  text: string;
  tone: 'funds' | 'research' | 'reputation';
}

export interface GameSettings {
  soundEnabled: boolean;
  simulationSpeed: 1 | 2;
  paused: boolean;
}

export interface Resources {
  funds: number;
  research: number;
  reputation: number;
  samples: number;
}

export interface ClassifiedProjectRequirement {
  minDiscoveredObjects?: number;
  minInvestigatedObjects?: number;
  minUnlockedRooms?: number;
  minCompletedResearch?: number;
  requiredResearchId?: string;
  costFunds: number;
  costResearch: number;
  costSamples: number;
}

export interface ClassifiedProject {
  id: string;
  code: string;
  title: string;
  teaser: string;
  requirements: ClassifiedProjectRequirement;
  completed: boolean;
  completedAt: number | null;
  unlocksSecretRoomId?: string;
  unlocksDocumentId?: string;
  unlocksConversationId?: string;
  rewardFunds: number;
  rewardResearch: number;
  rewardReputation: number;
  rewardSamples: number;
  declassifiedLog: string;
}

export interface ArchivedDocument {
  id: string;
  docCode: string;
  title: string;
  dateLabel: string;
  author: string;
  classification: 'Internal' | 'Confidential' | 'Dept. 404 Eyes Only';
  excerpt: string;
  body: string;
  unlocked: boolean;
  unlockHint: string;
}

export interface EmployeeConversation {
  id: string;
  title: string;
  participants: string[];
  roomLabel: string;
  unlockHint: string;
  lines: Array<{ speaker: string; text: string }>;
}

export interface SecretRoomEntry {
  id: string;
  name: string;
  floorLabel: string;
  description: string;
  discovered: boolean;
  unlockHint: string;
  passiveFundsPerSec: number;
  passiveResearchPerSec: number;
  passiveReputationPerSec: number;
  specialActionLabel: string;
  specialActionDescription: string;
  lastUsedAt: number;
}

export interface StrangeMessage {
  id: string;
  sender: string;
  channel: string;
  text: string;
  timestamp: number;
}

export type TutorialStepId =
  | 'welcome'
  | 'investigate'
  | 'contain'
  | 'earn_rewards'
  | 'expand'
  | 'completed';

export type ProgressionStage = 1 | 2 | 3 | 4 | 5 | 6;

export interface OnboardingState {
  tutorialStep: TutorialStepId;
  tutorialCompleted: boolean;
  progressionStage: ProgressionStage;
  claimedObjectiveIds: string[];
  dismissedFeatureStage: ProgressionStage;
  replayMode?: boolean;
}

export interface GameState {
  version: number;
  departmentName: string;
  resources: Resources;
  totalFundsEarned: number;
  totalResearchEarned: number;
  totalSamplesEarned: number;
  totalInvestigationsCompleted: number;
  totalDeliveriesProcessed: number;
  expeditionsCompleted: number;
  nextExplorationAt: number;
  floor3Unlocked: boolean;
  specialAssignments: SpecialAssignment[];
  hiddenCluesFound: string[];
  investigationEquipment: InvestigationEquipment[];
  equippedInvestigationGearId: string;
  selectedInvestigationObjectId: string | null;
  rooms: Record<RoomId, RoomRuntimeState>;
  objects: UnusualObject[];
  employees: Employee[];
  employeeEquipment: EmployeeEquipment[];
  employeeActivityLog: EmployeeActivityEntry[];
  upgrades: UpgradeItem[];
  researchNodes: ResearchNode[];
  experimentalProjects: ExperimentalProject[];
  activeBoosts: ActiveEconomicBoost[];
  discoveries: DiscoveryEntry[];
  notifications: GameNotification[];
  eventCooldowns: Record<string, number>;
  eventCategoryHistory: Record<EventCategory, number>;
  prestigeEra: number;
  prestigeCurrency: number;
  prestigeTechnologies: PrestigeTechnology[];
  automationSettings: AutomationSettings;
  classifiedProjects: ClassifiedProject[];
  archivedDocuments: ArchivedDocument[];
  unlockedConversations: string[];
  secretRooms: SecretRoomEntry[];
  strangeMessages: StrangeMessage[];
  onboarding?: OnboardingState;
  settings: GameSettings;
  lastSavedAt: number;
  nextEventAt: number;
  nextDeliveryCooldownAt: number;
}
