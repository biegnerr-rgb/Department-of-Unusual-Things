import {
  ArchivedDocument,
  ClassifiedProject,
  EmployeeConversation,
  GameState,
  SecretRoomEntry,
  StrangeMessage,
} from '../types/game';

export const INITIAL_CLASSIFIED_PROJECTS: ClassifiedProject[] = [
  {
    id: 'proj_001_missing_floor',
    code: 'PROJECT 001',
    title: 'The Missing Floor',
    teaser:
      'Original 1974 architectural blueprints list a mezzanine level between B1 and B2, yet the concrete stairwell jumps straight over an unmarked brass hatch.',
    requirements: {
      minUnlockedRooms: 4,
      minCompletedResearch: 3,
      costFunds: 240,
      costResearch: 65,
      costSamples: 3,
    },
    completed: false,
    completedAt: null,
    unlocksSecretRoomId: 'secret_tea_vault',
    unlocksDocumentId: 'doc_missing_floor',
    unlocksConversationId: 'conv_tea_hatch',
    rewardFunds: 180,
    rewardResearch: 35,
    rewardReputation: 6,
    rewardSamples: 2,
    declassifiedLog:
      'Mason bricks removed behind Archives shelving. Discovered Floor 2.5: a spotless brass Tea Vault with fresh biscuits from October 1998.',
  },
  {
    id: 'proj_002_original_employees',
    code: 'PROJECT 002',
    title: 'The Original Employees',
    teaser:
      'Payroll ledgers show twenty-four founder staff simply vanished from punch-cards on a Tuesday—except Badge #0000 still clocks in every morning at 8:59.',
    requirements: {
      minDiscoveredObjects: 6,
      minCompletedResearch: 5,
      costFunds: 380,
      costResearch: 95,
      costSamples: 4,
    },
    completed: false,
    completedAt: null,
    unlocksDocumentId: 'doc_original_staff',
    unlocksConversationId: 'conv_badge_zero',
    rewardFunds: 260,
    rewardResearch: 50,
    rewardReputation: 8,
    rewardSamples: 2,
    declassifiedLog:
      'They did not vanish—they accidentally stepped into an unindexed hallway during a polka-pipe calibration and now run the Night Annex cleanly from behind the drywall.',
  },
  {
    id: 'proj_003_undelivered_object',
    code: 'PROJECT 003',
    title: 'The Object That Was Never Delivered',
    teaser:
      'Manifest DOU-000 lists "Weight: Yes, Shape: Polite" and was signed three days before construction began. The crate shelf remains warm to the touch.',
    requirements: {
      minInvestigatedObjects: 4,
      minCompletedResearch: 7,
      costFunds: 520,
      costResearch: 130,
      costSamples: 6,
    },
    completed: false,
    completedAt: null,
    unlocksDocumentId: 'doc_never_delivered',
    unlocksConversationId: 'conv_crate_zero',
    rewardFunds: 360,
    rewardResearch: 80,
    rewardReputation: 10,
    rewardSamples: 3,
    declassifiedLog:
      'Infrared scans confirm Crate DOU-000 IS the basement foundation stone. The department was built around it because nobody had a big enough box.',
  },
  {
    id: 'proj_004_sealed_elevator',
    code: 'PROJECT 004',
    title: 'The Sealed Elevator',
    teaser:
      'Behind the basement boiler stands an Art-Deco brass lift chained shut with three padlocks and a sticky note reading: "B3 smells like ozone and butterscotch."',
    requirements: {
      minUnlockedRooms: 6,
      minCompletedResearch: 10,
      costFunds: 750,
      costResearch: 185,
      costSamples: 8,
    },
    completed: false,
    completedAt: null,
    unlocksSecretRoomId: 'secret_sublevel_b3',
    unlocksDocumentId: 'doc_sealed_elevator',
    unlocksConversationId: 'conv_elevator_scent',
    rewardFunds: 480,
    rewardResearch: 110,
    rewardReputation: 12,
    rewardSamples: 4,
    declassifiedLog:
      'Cut the brass chains safely. The lift descends cleanly to Sub-Level B3, opening the original Dept. 404 Observatory and restoring archival telemetry!',
  },
  {
    id: 'proj_005_original_purpose',
    code: 'PROJECT 005',
    title: "The Department's Original Purpose",
    teaser:
      'Why bury a government agency beneath an ordinary post office just to study backwards clocks and prophetic toasters? All clues converge here.',
    requirements: {
      minInvestigatedObjects: 7,
      minUnlockedRooms: 7,
      minCompletedResearch: 14,
      costFunds: 1100,
      costResearch: 260,
      costSamples: 12,
    },
    completed: false,
    completedAt: null,
    unlocksDocumentId: 'doc_original_purpose',
    unlocksConversationId: 'conv_dept_404_truth',
    rewardFunds: 900,
    rewardResearch: 160,
    rewardReputation: 20,
    rewardSamples: 5,
    declassifiedLog:
      'Charter 404 Declassified! Impossible objects do not want containment—they just get anxious without tidy clipboards, velvet cushions, and respectful tea service. Permanently activates +25% Dept. 404 Charter Output!',
  },
];

export const INITIAL_ARCHIVED_DOCUMENTS: ArchivedDocument[] = [
  {
    id: 'doc_charter_1974',
    docCode: 'CHARTER-404-00',
    title: 'Founding Memo: Bureau Section 404',
    dateLabel: 'October 14, 1974',
    author: 'Undersecretary M. Finch (Ret.)',
    classification: 'Internal',
    excerpt: 'Why we stamped "NOT FOUND" on the lobby doorknob and went downstairs.',
    body: 'Following the excavation of a surprisingly polite brass sphere beneath Municipal Post Office #9, Parliament authorized an unnamed subterranean bureau. Numbered "Department 404" solely so auditors assume the budget sheet is a clerical error. Remember: if an appliance offers you toast before you plug it in, thank it politely and record the weather forecast.',
    unlocked: true,
    unlockHint: 'Inherited in your desk drawer on Day 1.',
  },
  {
    id: 'doc_coffee_1998',
    docCode: 'LOG-1998-07',
    title: 'Incident Summary: The 1998 Sideways Shift',
    dateLabel: 'November 3, 1998',
    author: 'Shift Supervisor H. Vance',
    classification: 'Confidential',
    excerpt: 'Concerning the afternoon twenty-four researchers walked out for bagels and arrived on Floor 2.5.',
    body: 'At 2:14 PM, someone set The Confused Clock beside an oscillating desk fan while carrying an unlisted suggestion box. Half the hallway rotated 90 degrees into spare architectural space. Nobody was harmed; in fact, they report the acoustics are lovely and send up fresh marmalade via the pneumatic tubes every Thursday.',
    unlocked: false,
    unlockHint: 'Discover 5 Objects or complete 2 Research Nodes.',
  },
  {
    id: 'doc_missing_floor',
    docCode: 'BLUEPRINT-B2.5',
    title: 'Architect Note: Sub-Level 2.5 Mezzanine',
    dateLabel: 'March 19, 1975',
    author: 'Chief Draughtsman P. Holt',
    classification: 'Confidential',
    excerpt: 'Why the staircase counts 14 steps down, then 14 steps sideways.',
    body: 'Contractors swore they poured concrete straight down, yet every plumb-bob pointed toward the tea kettle closet. Rather than argue with geometry, we installed velvet armchairs, a self-refilling Earl Grey samovar, and locked the brass hatch behind Filing Cabinet 44-B.',
    unlocked: false,
    unlockHint: 'Complete Classified Project 001: The Missing Floor.',
  },
  {
    id: 'doc_original_staff',
    docCode: 'HR-LEDGER-0000',
    title: 'Personnel Audit: Badge #0000',
    dateLabel: 'August 9, 2004',
    author: 'Night Watchman (Unsigned)',
    classification: 'Dept. 404 Eyes Only',
    excerpt: 'On the cheerful colleague who polishes gauges in empty rooms.',
    body: 'Every time we retire Badge #0000, the punch-clock chimes cheerfully and prints a fresh timecard reading "JUST HELPING OUT — CLEANED THE OSCILLOSCOPES." After forty years, HR officially classified Badge #0000 as "Beneficial Ambient Staff." Do not charge them for breakroom mugs.',
    unlocked: false,
    unlockHint: 'Complete Classified Project 002 or trigger a Secret Badge Event.',
  },
  {
    id: 'doc_never_delivered',
    docCode: 'MANIFEST-DOU-000',
    title: 'Intake Receipt: Crate #000 (Weight: Yes)',
    dateLabel: 'October 11, 1974 (Pre-Dated)',
    author: 'Courier Unknown',
    classification: 'Dept. 404 Eyes Only',
    excerpt: 'The package that arrived three days before there was a basement to put it in.',
    body: 'Signed upon receipt by "Future Management." Dimensions listed as "Approximately Tuesday." When surveyors cleared the dirt around it, they realized Crate #000 was quietly stabilizing every weird object within three city blocks—so they built Reception on top of it and hung up a coat rack.',
    unlocked: false,
    unlockHint: 'Complete Classified Project 003: The Object That Was Never Delivered.',
  },
  {
    id: 'doc_sealed_elevator',
    docCode: 'MAINT-LIFT-B3',
    title: 'Elevator Inspection: Car #3 ("Do Not Hum")',
    dateLabel: 'December 2, 1998',
    author: 'Chief Engineer Osei (Sr.)',
    classification: 'Dept. 404 Eyes Only',
    excerpt: 'Why the brass lift plays elevator jazz in keys that do not exist on pianos.',
    body: 'Car #3 rides smoothly down to Sub-Level B3 provided passengers do not hum showtunes inside the cab (the elevator takes it personally and stops at 1982). Sub-Level B3 houses the Observatory where all original Dept. 404 founders recorded sky readings... from 40 feet underground.',
    unlocked: false,
    unlockHint: 'Complete Classified Project 004: The Sealed Elevator.',
  },
  {
    id: 'doc_original_purpose',
    docCode: 'CHARTER-404-FINAL',
    title: 'Executive Truth: Department 404',
    dateLabel: 'Declassified Today',
    author: 'Founding Council',
    classification: 'Dept. 404 Eyes Only',
    excerpt: 'Why we gave impossible things clipboards instead of cages.',
    body: 'Early containment tests with steel vaults only made anomalies anxious, louder, and prone to multiplying. Then an intern offered a prophetic toaster a doily and a filing number—and it calmed down immediately. Department 404 exists as a cozy hospitality agency for impossible things: give them polite shelves, observant staff, and warm tea, and the universe stays delightfully steady.',
    unlocked: false,
    unlockHint: 'Complete Classified Project 005: The Department’s Original Purpose.',
  },
];

export const EMPLOYEE_CONVERSATIONS: EmployeeConversation[] = [
  {
    id: 'conv_toaster_weather',
    title: 'Breakroom Forecast Debate',
    participants: ['emp_pippa', 'emp_barnaby'],
    roomLabel: 'Investigation Laboratory',
    unlockHint: 'Unlocked from the start once Barnaby or Pippa works the shift.',
    lines: [
      {
        speaker: 'Pippa Vance',
        text: 'DOU-001 just popped two slices shaped like tiny umbrellas. Should I bring a raincoat tomorrow?',
      },
      {
        speaker: 'Dr. Barnaby Finch',
        text: 'Only if you also respect the rye slice that says "Mildly Sarcastic Drizzle." Check the clipboard.',
      },
      {
        speaker: 'Pippa Vance',
        text: 'Right. Also—did someone stamp "DEPT. 404" under the crumb tray, or was it always engraved there?',
      },
    ],
  },
  {
    id: 'conv_tea_hatch',
    title: 'The Floor 2.5 Tea Kettle',
    participants: ['emp_mina', 'emp_sora'],
    roomLabel: 'Archives & Mezzanine',
    unlockHint: 'Unlocks via Project 001 (The Missing Floor) or hiring Mina & Sora.',
    lines: [
      {
        speaker: 'Mina Kowalski',
        text: 'Sora, there is a brass hatch behind Drawer 44-B that smells strongly of bergamot and shortbread.',
      },
      {
        speaker: 'Sora Takahashi',
        text: 'Oh, that’s Sub-Level 2.5! The index card says it’s an officially unofficial tea lounge from 1975.',
      },
      {
        speaker: 'Mina Kowalski',
        text: 'Is it safe to open? Wait—someone inside just slid a warm scone under the door.',
      },
    ],
  },
  {
    id: 'conv_badge_zero',
    title: 'Spotting Badge #0000',
    participants: ['emp_jasper', 'emp_cedric'],
    roomLabel: 'Engineering Workshop',
    unlockHint: 'Unlocks via Project 002 (The Original Employees).',
    lines: [
      {
        speaker: 'Jasper Holt',
        text: 'Saw Badge #0000 again during rounds. Wiped dust off the barometer and gave me a thumbs-up through a brick wall.',
      },
      {
        speaker: 'Prof. Cedric Osei',
        text: 'Bless ’em. Whoever they are, they oiled my workshop lathe at 3 AM and left a lemon tart on the blueprint table.',
      },
      {
        speaker: 'Jasper Holt',
        text: 'Honestly, best night-shift coworker we’ve ever not-hired.',
      },
    ],
  },
  {
    id: 'conv_crate_zero',
    title: 'The Warm Floorboard in Reception',
    participants: ['emp_tessa', 'emp_winston'],
    roomLabel: 'Reception & Sub-Level B2',
    unlockHint: 'Unlocks via Project 003 (The Object That Was Never Delivered).',
    lines: [
      {
        speaker: 'Tessa Moreau',
        text: 'Boss, why does that one tile in Reception hum whenever someone signs a waiver?',
      },
      {
        speaker: 'Winston Sterling',
        text: 'Manifest DOU-000. Signed before the mortar dried. Just avoid dropping paperclips directly on it—they come back monogrammed.',
      },
    ],
  },
  {
    id: 'conv_elevator_scent',
    title: 'Car #3 & The Butterscotch Fog',
    participants: ['emp_helena', 'emp_pippa'],
    roomLabel: 'Sub-Level B3 Observatory',
    unlockHint: 'Unlocks via Project 004 or Project 005.',
    lines: [
      {
        speaker: 'Dr. Helena Vance',
        text: 'The sealed brass lift works smoothly once you remember not to hum near the call button.',
      },
      {
        speaker: 'Pippa Vance',
        text: 'Look at the B3 Observatory dome—it maps stars that aren’t even in this hemisphere yet!',
      },
      {
        speaker: 'Dr. Helena Vance',
        text: 'No wonder they numbered this place 404. Auditors look once, shrug, and leave us in peace.',
      },
    ],
  },
  {
    id: 'conv_dept_404_truth',
    title: 'Why Department 404 Works',
    participants: ['emp_winston', 'emp_helena'],
    roomLabel: 'Director Desk & Observatory',
    unlockHint: "Unlocks upon completing Project 005: The Department's Original Purpose.",
    lines: [
      {
        speaker: 'Winston Sterling',
        text: 'Just finished reading the 1974 Founding Charter. Turns out this whole basement was built to be a polite bed-and-breakfast for anxious physics.',
      },
      {
        speaker: 'Dr. Helena Vance',
        text: 'Which explains why giving The Confused Clock a velvet cushion raised productivity by twelve percent.',
      },
      {
        speaker: 'Winston Sterling',
        text: 'To hospitality science, Director. May the kettle never run dry.',
      },
    ],
  },
];

export const INITIAL_SECRET_ROOMS: SecretRoomEntry[] = [
  {
    id: 'secret_tea_vault',
    name: 'Sub-Level 2.5: Mezzanine Tea Vault',
    floorLabel: 'Hidden Mezzanine (-9m)',
    description:
      'A velvet-lined mezzanine wedged neatly between Floors 2 and 3. Vintage samovars brew calm tea that steadies nearby anomalies and energizes staff.',
    discovered: false,
    unlockHint: 'Complete Project 001: The Missing Floor (or discover the hidden wall behind Archives).',
    passiveFundsPerSec: 8,
    passiveResearchPerSec: 3.5,
    passiveReputationPerSec: 0.08,
    specialActionLabel: 'Brew Archive Earl Grey',
    specialActionDescription: 'Serves porcelain cups across every floor (+28 RP, +1 Sample, +15% Staff Energy).',
    lastUsedAt: 0,
  },
  {
    id: 'secret_sublevel_b3',
    name: 'Sub-Level B3: Dept. 404 Observatory',
    floorLabel: 'Deepest Floor (-18m)',
    description:
      'Reached exclusively via the unchained Art-Deco elevator. Brass telescopes observe ceiling constellations and intercept polite pneumatic memos from 1974.',
    discovered: false,
    unlockHint: 'Complete Project 004: The Sealed Elevator.',
    passiveFundsPerSec: 18,
    passiveResearchPerSec: 7.5,
    passiveReputationPerSec: 0.16,
    specialActionLabel: 'Intercept Pneumatic Slip',
    specialActionDescription: 'Pulls a fresh strange message from 1974 (+$140, +45 RP, +2 Samples).',
    lastUsedAt: 0,
  },
];

export const INITIAL_STRANGE_MESSAGES: StrangeMessage[] = [
  {
    id: 'msg_init_1974',
    sender: 'Drawer 44-B (Pneumatic Slip)',
    channel: 'Pneumatic Tube #0',
    text: 'Welcome, new Director. The kettle on Floor 2.5 still whistles at 4 PM sharp. Please do not look directly at Crate DOU-000 until Tuesday.',
    timestamp: Date.now(),
  },
];

export const STRANGE_MESSAGE_POOL: Array<{ sender: string; channel: string; text: string }> = [
  {
    sender: 'Badge #0000',
    channel: 'Breakroom Post-It',
    text: 'Dusted the invisible duck’s perch. It quacked politely in F-sharp. Left fresh butterscotch in the top desk drawer.',
  },
  {
    sender: 'Car #3 Elevator Display',
    channel: 'Intercom Chime',
    text: 'Now arriving at Floor 2.5. Mind the non-Euclidean doormat. Thank you for riding Dept. 404.',
  },
  {
    sender: 'DOU-000 Foundation Stone',
    channel: 'Thermostat Readout',
    text: 'Facility Status: Cozy. Anomalies feel 14% more respected today. Keep up the clipboard work.',
  },
  {
    sender: '1998 Night Shift',
    channel: 'Pneumatic Capsule',
    text: 'We tried folding the hallway back straight, but the tea vault gets great afternoon sun from nowhere, so we kept it.',
  },
  {
    sender: 'Archived Oscilloscope',
    channel: 'Thermal Receipt',
    text: 'REMINDER: Auditors are scheduled for never-o’clock. Carry on with unusual science.',
  },
];

export function evaluateClassifiedProjectEligibility(
  proj: ClassifiedProject,
  state: GameState
): {
  canLaunch: boolean;
  checks: Array<{ label: string; current: number | string; target: number | string; met: boolean }>;
} {
  const discoveredCount = state.objects.filter((o) => o.status !== 'locked').length;
  const investigatedCount = state.objects.filter((o) => o.investigated).length;
  const unlockedRoomsCount = Object.values(state.rooms).filter((r) => r.unlocked).length;
  const researchedCount = state.researchNodes.filter((r) => r.researched).length;
  const req = proj.requirements;

  const checks: Array<{
    label: string;
    current: number | string;
    target: number | string;
    met: boolean;
  }> = [];

  if (req.minDiscoveredObjects !== undefined) {
    checks.push({
      label: 'Objects Discovered',
      current: discoveredCount,
      target: req.minDiscoveredObjects,
      met: discoveredCount >= req.minDiscoveredObjects,
    });
  }
  if (req.minInvestigatedObjects !== undefined) {
    checks.push({
      label: 'Investigations Closed',
      current: investigatedCount,
      target: req.minInvestigatedObjects,
      met: investigatedCount >= req.minInvestigatedObjects,
    });
  }
  if (req.minUnlockedRooms !== undefined) {
    checks.push({
      label: 'Active Wings',
      current: unlockedRoomsCount,
      target: req.minUnlockedRooms,
      met: unlockedRoomsCount >= req.minUnlockedRooms,
    });
  }
  if (req.minCompletedResearch !== undefined) {
    checks.push({
      label: 'Research Nodes',
      current: researchedCount,
      target: req.minCompletedResearch,
      met: researchedCount >= req.minCompletedResearch,
    });
  }

  checks.push({
    label: 'Funds',
    current: Math.floor(state.resources.funds),
    target: req.costFunds,
    met: state.resources.funds >= req.costFunds,
  });
  checks.push({
    label: 'Research Points',
    current: Math.floor(state.resources.research),
    target: req.costResearch,
    met: state.resources.research >= req.costResearch,
  });
  checks.push({
    label: 'Anomaly Samples',
    current: Math.floor(state.resources.samples ?? 0),
    target: req.costSamples,
    met: (state.resources.samples ?? 0) >= req.costSamples,
  });

  const canLaunch = !proj.completed && checks.every((c) => c.met);
  return { canLaunch, checks };
}

export function evaluatePassiveStoryUnlocks(state: GameState): GameState {
  const discoveredCount = state.objects.filter((o) => o.status !== 'locked').length;
  const researchedCount = state.researchNodes.filter((r) => r.researched).length;

  let docsChanged = false;
  const nextDocs = (state.archivedDocuments ?? INITIAL_ARCHIVED_DOCUMENTS).map((doc) => {
    if (doc.unlocked) return doc;
    if (doc.id === 'doc_coffee_1998' && (discoveredCount >= 5 || researchedCount >= 2)) {
      docsChanged = true;
      return { ...doc, unlocked: true };
    }
    return doc;
  });

  const currentConvs = state.unlockedConversations ?? ['conv_toaster_weather'];
  const nextConvs = [...currentConvs];
  if (!nextConvs.includes('conv_toaster_weather')) {
    nextConvs.push('conv_toaster_weather');
  }
  const minaHired = state.employees.some((e) => e.id === 'emp_mina' && e.hired);
  const soraHired = state.employees.some((e) => e.id === 'emp_sora' && e.hired);
  if (minaHired && soraHired && !nextConvs.includes('conv_tea_hatch')) {
    nextConvs.push('conv_tea_hatch');
  }

  if (!docsChanged && nextConvs.length === currentConvs.length) return state;
  return {
    ...state,
    archivedDocuments: nextDocs,
    unlockedConversations: nextConvs,
  };
}
