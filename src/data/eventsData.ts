import { EventCategory, GameState, RandomEventDefinition } from '../types/game';

export const EVENT_CATEGORY_META: Record<
  EventCategory,
  {
    label: string;
    shortLabel: string;
    badgeBg: string;
    badgeText: string;
    cardTint: string;
  }
> = {
  positive: {
    label: 'Positive Event',
    shortLabel: 'Positive',
    badgeBg: 'bg-[#DCFCE7]',
    badgeText: 'text-[#166534]',
    cardTint: 'bg-[#F3FCF6]',
  },
  negative: {
    label: 'Department Disruption',
    shortLabel: 'Negative',
    badgeBg: 'bg-[#FEE2E2]',
    badgeText: 'text-[#991B1B]',
    cardTint: 'bg-[#FFF5F5]',
  },
  neutral: {
    label: 'Neutral Encounter',
    shortLabel: 'Neutral',
    badgeBg: 'bg-[#FEF3C7]',
    badgeText: 'text-[#92400E]',
    cardTint: 'bg-[#FFFDF8]',
  },
  rare: {
    label: 'Rare Event',
    shortLabel: 'Rare',
    badgeBg: 'bg-[#DBEAFE]',
    badgeText: 'text-[#1E40AF]',
    cardTint: 'bg-[#F3F8FF]',
  },
  secret: {
    label: 'Secret Phenomenon',
    shortLabel: 'Secret',
    badgeBg: 'bg-[#F3E8FF]',
    badgeText: 'text-[#6B21A8]',
    cardTint: 'bg-[#FAF5FF]',
  },
};

export const RANDOM_EVENTS_CATALOG: RandomEventDefinition[] = [
  // =========================================================================
  // 1. POSITIVE EVENTS
  // =========================================================================
  {
    id: 'evt_pos_research_breakthrough',
    category: 'positive',
    kind: 'discovery',
    weight: 16,
    cooldownSec: 120,
    title: 'Oscilloscope Research Breakthrough',
    message:
      'Every desk oscilloscope synchronized to a cozy acoustic wavelength, printing tidy anomaly waveforms without being plugged in.',
    choices: [
      {
        label: 'Publish Lab Memo (+38 RP & +60% Research / 60s)',
        researchDelta: 38,
        reputationDelta: 3,
        triggerBoost: {
          id: 'boost_breakthrough_rp',
          label: 'Harmonic Research Bloom',
          description: '+60% Research & +30% Anomaly Samples for 60s',
          fundsMult: 1,
          researchMult: 1.6,
          samplesMult: 1.3,
          deliverySpeedMult: 1,
          durationSec: 60,
        },
        outcomeText: 'Published harmonic memo for +38 RP, +3 Rep, and a 60s Research Bloom!',
      },
      {
        label: 'Collect Distilled Samples (+20 RP & +3 Samples)',
        researchDelta: 20,
        samplesDelta: 3,
        reputationDelta: 2,
        outcomeText: 'Collected +3 clean Anomaly Samples & +20 RP from the workbench.',
      },
    ],
  },
  {
    id: 'evt_pos_unexpected_funding',
    category: 'positive',
    kind: 'event',
    weight: 16,
    cooldownSec: 130,
    title: 'Unexpected Ministry Funding',
    message:
      'Treasury clerks misread "Unusual Things" as "Essential Bridge Infrastructure" and wired an emergency discretionary check.',
    choices: [
      {
        label: 'Deposit Grant (+$165 & +45% Funds / 60s)',
        fundsDelta: 165,
        reputationDelta: 2,
        triggerBoost: {
          id: 'boost_funding_surge',
          label: 'Treasury Stipend Boost',
          description: '+45% Department Funds output for 60s',
          fundsMult: 1.45,
          researchMult: 1,
          samplesMult: 1,
          deliverySpeedMult: 1,
          durationSec: 60,
        },
        outcomeText: 'Cashed +$165 check with a 60s +45% Funds Grant!',
      },
      {
        label: 'Buy Telemetry Supplies (+$85, +24 RP, +2 Samples)',
        fundsDelta: 85,
        researchDelta: 24,
        samplesDelta: 2,
        outcomeText: 'Split stipend into +$85 Funds, +24 RP & +2 Samples.',
      },
    ],
  },
  {
    id: 'evt_pos_rare_delivery',
    category: 'positive',
    kind: 'delivery',
    weight: 11,
    cooldownSec: 180,
    requiresLockedObject: true,
    title: 'Rare Object Courier Delivery',
    message:
      'A velvet-lined diplomatic brass tube arrived via pneumatic express. Something inside is faintly humming.',
    choices: [
      {
        label: 'Unbox & Register Curiosity (+Object, +2 Samples)',
        researchDelta: 22,
        reputationDelta: 4,
        samplesDelta: 2,
        deliverNewObject: true,
        outcomeText: 'Unboxed new curiosity into Intake with +22 RP & +2 Samples!',
      },
      {
        label: 'Claim Priority Courier Rebate (+$170)',
        fundsDelta: 170,
        reputationDelta: 1,
        outcomeText: 'Signed diplomatic courier waiver for +$170 Funds.',
      },
    ],
  },
  {
    id: 'evt_pos_employee_bonus',
    category: 'positive',
    kind: 'milestone',
    weight: 14,
    cooldownSec: 120,
    title: 'Department Productivity Surge',
    message:
      'Someone swapped the break-room decaf for mysterious artisanal roast. Everybody is double-checking clipboards twice as fast.',
    choices: [
      {
        label: 'Pour Double Shots (+Energy, +25 XP & +35% Inv. Speed)',
        staffEnergyDelta: 30,
        staffXpDelta: 25,
        reputationDelta: 2,
        triggerBoost: {
          id: 'boost_espresso_clarity',
          label: 'Espresso Clarity (+35% Speed)',
          description: '+35% Investigation Speed & +25% Funds for 50s',
          fundsMult: 1.25,
          researchMult: 1.2,
          samplesMult: 1,
          deliverySpeedMult: 1.15,
          investigationSpeedMult: 1.35,
          durationSec: 50,
        },
        outcomeText: 'Staff energized (+30 Energy, +25 XP) & +35% Investigation Speed for 50s!',
      },
      {
        label: 'Focus on Lab Analysis (+30 RP, +15 XP)',
        researchDelta: 30,
        samplesDelta: 1,
        staffXpDelta: 15,
        outcomeText: 'Turned extra alertness into +30 RP, +1 Sample & +15 Staff XP.',
      },
    ],
  },

  // =========================================================================
  // 2. NEGATIVE EVENTS (DEPARTMENT CHAOS)
  // =========================================================================
  {
    id: 'evt_neg_machine_malfunction',
    category: 'negative',
    kind: 'event',
    weight: 10,
    cooldownSec: 150,
    minReputation: 6,
    title: 'Temporary Machine Malfunction',
    message:
      'Brass pressure pipes in the basement started playing polka rhythms, shaking calibration needles off zero.',
    choices: [
      {
        label: 'Emergency Brass Repair (-$65 · Avoid Slowdown)',
        fundsDelta: -65,
        staffXpDelta: 15,
        reputationDelta: 1,
        outcomeText: 'Tightened loose valves for $65, preventing output loss & granting +15 XP!',
      },
      {
        label: 'Let Rattles Settle (-30% Funds & RP / 45s, +1 Sample)',
        samplesDelta: 1,
        researchDelta: 10,
        triggerBoost: {
          id: 'debuff_machine_rattle',
          label: 'Pipe Rattle (-30% Yield)',
          description: 'Temporary hardware malfunction reducing Funds & Research by 30% for 45s',
          fundsMult: 0.7,
          researchMult: 0.7,
          samplesMult: 1,
          deliverySpeedMult: 1,
          durationSec: 45,
        },
        outcomeText: 'Gauges rattled (-30% Funds & RP for 45s), but scraped +1 Sample & +10 RP.',
      },
    ],
  },
  {
    id: 'evt_neg_missing_object',
    category: 'negative',
    kind: 'event',
    weight: 9,
    cooldownSec: 170,
    minReputation: 8,
    requiresAssignedObject: true,
    title: 'Missing Object in Hallway B1',
    message:
      'One of your assigned anomalies slipped off its velvet pad and went exploring the air conditioning ducts!',
    choices: [
      {
        label: 'Search With Bribe Crackers (-$50 · Keep In Room)',
        fundsDelta: -50,
        reputationDelta: 2,
        staffXpDelta: 12,
        outcomeText: 'Recovered wandering curiosity back to its pedestal intact (+2 Rep, +12 XP)!',
      },
      {
        label: 'Wait at Intake Desk (Relocates 1 Object, +20 RP)',
        researchDelta: 20,
        samplesDelta: 1,
        relocateAssignedObjectToIntake: true,
        outcomeText: 'Object strolled back to Intake by itself. Logged +20 RP & +1 Sample.',
      },
    ],
  },
  {
    id: 'evt_neg_containment_interruption',
    category: 'negative',
    kind: 'event',
    weight: 9,
    cooldownSec: 165,
    minReputation: 10,
    title: 'Containment System Interruption',
    message:
      'A stray static charge briefly flipped every containment bell jar into reverse polarity!',
    choices: [
      {
        label: 'Install Copper Shunt (-$75 · Stabilize + 2 Samples)',
        fundsDelta: -75,
        samplesDelta: 2,
        reputationDelta: 2,
        outcomeText: 'Reset polarity for $75, recovering +2 Anomaly Samples & +2 Rep!',
      },
      {
        label: 'Wait For Static Drain (-25% Output / 45s, +24 RP)',
        researchDelta: 24,
        samplesDelta: 1,
        triggerBoost: {
          id: 'debuff_polarity_flip',
          label: 'Static Hiccup (-25% Yield)',
          description: 'Containment interruption lowering Funds & RP by 25% for 45s',
          fundsMult: 0.75,
          researchMult: 0.75,
          samplesMult: 1.15,
          deliverySpeedMult: 1,
          durationSec: 45,
        },
        outcomeText: 'Containment throttled (-25% output for 45s), harvesting +24 RP & +1 Sample.',
      },
    ],
  },
  {
    id: 'evt_neg_employee_confusion',
    category: 'negative',
    kind: 'event',
    weight: 9,
    cooldownSec: 155,
    minReputation: 7,
    title: 'Mass Employee Confusion',
    message:
      'All corridor door signs rearranged themselves alphabetically overnight. Half your team walked into the broom closet twice.',
    choices: [
      {
        label: 'Repaint Signs & Bribe Pastries (-$45 · +15 Energy)',
        fundsDelta: -45,
        staffEnergyDelta: 15,
        staffXpDelta: 18,
        outcomeText: 'Re-labeled doors cleanly! Staff morale +15 Energy & +18 XP.',
      },
      {
        label: 'Let Staff Wander (-15 Energy, -25% Speed / 40s)',
        staffEnergyDelta: -15,
        researchDelta: 14,
        triggerBoost: {
          id: 'debuff_door_confusion',
          label: 'Door Sign Scramble (-25% Speed)',
          description: 'Confused staff slowing Investigation Speed by 25% for 40s',
          fundsMult: 0.9,
          researchMult: 0.85,
          samplesMult: 1,
          deliverySpeedMult: 0.85,
          investigationSpeedMult: 0.75,
          durationSec: 40,
        },
        outcomeText: 'Staff lost -15 Energy & -25% Speed (40s), but mapped 2 extra broom closets (+14 RP).',
      },
    ],
  },

  // =========================================================================
  // 3. NEUTRAL EVENTS
  // =========================================================================
  {
    id: 'evt_neu_strange_visitor',
    category: 'neutral',
    kind: 'event',
    weight: 14,
    cooldownSec: 135,
    title: 'Strange Polite Visitor',
    message:
      'A cheerful stranger in a pocket-watch trenchcoat politely asks if this is the "Lost & Found Department of Next Tuesday."',
    choices: [
      {
        label: 'Serve Warm Tea & Chat (+$70, +3 Rep)',
        fundsDelta: 70,
        reputationDelta: 3,
        outcomeText: 'Visitor left a generous tip ($70) and praised your hospitality (+3 Rep).',
      },
      {
        label: 'Swap Anomaly Notes (-1 Sample -> +$135 & +26 RP)',
        samplesDelta: -1,
        fundsDelta: 135,
        researchDelta: 26,
        outcomeText: 'Exchanged 1 Anomaly Sample for $135 & +26 obscure Research Notes!',
      },
      {
        label: 'Hand Out Guest Brochure (+16 RP)',
        researchDelta: 16,
        reputationDelta: 1,
        outcomeText: 'Visitor sketched helpful margins on the brochure (+16 RP, +1 Rep).',
      },
    ],
  },
  {
    id: 'evt_neu_mysterious_package',
    category: 'neutral',
    kind: 'delivery',
    weight: 14,
    cooldownSec: 125,
    title: 'Unmarked Mysterious Package',
    message:
      'A whistling brass pneumatic parcel landed in Reception with a handwritten tag: "Do not shake, smells faintly of rain and buttered toast."',
    choices: [
      {
        label: 'Unbox & Catalog (+Object if Found, +20 RP & +2 Samples)',
        researchDelta: 20,
        reputationDelta: 3,
        samplesDelta: 2,
        deliverNewObject: true,
        outcomeText: 'Cataloged parcel safely (+20 RP, +2 Samples & +3 Rep).',
      },
      {
        label: 'Invoice Handling Fee (+$105 & +1 Rep)',
        fundsDelta: 105,
        reputationDelta: 1,
        outcomeText: 'Collected $105 courier handling fee and +1 Rep.',
      },
    ],
  },
  {
    id: 'evt_neu_unusual_phone_call',
    category: 'neutral',
    kind: 'event',
    weight: 13,
    cooldownSec: 130,
    title: 'Unusual Rotary Phone Call',
    message:
      'An unplugged rotary desk phone rang cleanly. A familiar voice whispered: "Tell Pippa the calibration knob is actually a hat rack."',
    choices: [
      {
        label: 'Record Call Transcript (+24 RP, +1 Sample, +25% Speed / 45s)',
        researchDelta: 24,
        samplesDelta: 1,
        triggerBoost: {
          id: 'boost_future_tip',
          label: 'Future Tip (+25% Speed)',
          description: '+25% Investigation Speed for 45s from timeline advice',
          fundsMult: 1,
          researchMult: 1.15,
          samplesMult: 1,
          deliverySpeedMult: 1,
          investigationSpeedMult: 1.25,
          durationSec: 45,
        },
        outcomeText: 'Applied future tip (+24 RP, +1 Sample & +25% Speed for 45s)!',
      },
      {
        label: 'Hang Up & File Incident Form (+$85 & +2 Rep)',
        fundsDelta: 85,
        reputationDelta: 2,
        outcomeText: 'Filed Form P-9 cleanly for +$85 & +2 Rep.',
      },
    ],
  },
  {
    id: 'evt_neu_unexpected_inspection',
    category: 'neutral',
    kind: 'event',
    weight: 13,
    cooldownSec: 145,
    title: 'Unexpected Budget Inspection',
    message:
      'Two inspectors from the Ministry of Unexplained Budgets dropped by unannounced to admire your velvet containment shelves.',
    choices: [
      {
        label: 'Pitch Grant Renewal (+$145, +4 Rep & +50% Funds / 60s)',
        fundsDelta: 145,
        reputationDelta: 4,
        triggerBoost: {
          id: 'boost_grant_surge',
          label: 'Federal Curiosity Grant',
          description: '+50% Department Funds output for 60s',
          fundsMult: 1.5,
          researchMult: 1,
          samplesMult: 1,
          deliverySpeedMult: 1,
          durationSec: 60,
        },
        outcomeText: 'Inspectors approved $145 stipend, +4 Rep & a 60s +50% Funds Grant!',
      },
      {
        label: 'Tour Research Wing (+30 RP, +2 Samples & +50% RP / 60s)',
        researchDelta: 30,
        reputationDelta: 3,
        samplesDelta: 2,
        triggerBoost: {
          id: 'boost_research_tour',
          label: 'Oversight Research Endorsement',
          description: '+50% Research & Anomaly Samples for 60s',
          fundsMult: 1,
          researchMult: 1.5,
          samplesMult: 1.5,
          deliverySpeedMult: 1.2,
          durationSec: 60,
        },
        outcomeText: 'Inspectors applauded lab discipline (+30 RP, +2 Samples & 60s boost)!',
      },
    ],
  },

  // =========================================================================
  // 4. RARE EVENTS
  // =========================================================================
  {
    id: 'evt_rare_duplicating_object',
    category: 'rare',
    kind: 'event',
    weight: 5.5,
    cooldownSec: 260,
    minReputation: 10,
    title: 'Spontaneous Object Duplication!',
    message:
      'An object in storage just started producing tiny, gleaming 2-inch copies of itself every eight seconds!',
    choices: [
      {
        label: 'Stop the Process (+3 Rep & +$75 Safe Bonus)',
        fundsDelta: 75,
        reputationDelta: 3,
        outcomeText: 'Contained replication calmly! Awarded +3 Rep & $75 safety stipend.',
      },
      {
        label: 'Study the Copies (+52 RP, +3 Samples & +2 Rep)',
        researchDelta: 52,
        samplesDelta: 3,
        reputationDelta: 2,
        outcomeText: 'Dissected miniature copies for +52 RP, +3 Anomaly Samples & +2 Rep!',
      },
      {
        label: 'Allow the Process to Continue (+$240, +2 Samples, Chaotic Lab Surge)',
        fundsDelta: 240,
        samplesDelta: 2,
        triggerBoost: {
          id: 'boost_duplicate_chaos',
          label: 'Replica Swarm (+65% RP & Samples)',
          description: 'Hallways ankle-deep in tiny replicas: +65% RP & Samples, -15% Funds (60s)',
          fundsMult: 0.85,
          researchMult: 1.65,
          samplesMult: 1.65,
          deliverySpeedMult: 1.25,
          durationSec: 60,
        },
        outcomeText: 'Sold novelty spares (+$240, +2 Samples) while replicas flooded labs (+65% RP/Samples / 60s)!',
      },
    ],
  },
  {
    id: 'evt_rare_secret_room',
    category: 'rare',
    kind: 'milestone',
    weight: 4.5,
    cooldownSec: 320,
    minReputation: 12,
    title: 'Hollow Wall Discovered Behind Filing Cabinets',
    message:
      'Tap, tap, THUNK. A sliding brass bulkhead hidden behind Reception maps directly into an unbuilt Blueprinted Facility Wing!',
    choices: [
      {
        label: 'Claim Hidden Chamber (Unlock Next Locked Room or +$280)',
        reputationDelta: 5,
        fundsDelta: 90,
        unlockNextLockedRoom: true,
        outcomeText: 'Opened hidden masonry arch! Wing expansion fast-tracked (+5 Rep).',
      },
      {
        label: 'Harvest Vintage Copper Fixtures (+$220 & +35 RP)',
        fundsDelta: 220,
        researchDelta: 35,
        samplesDelta: 2,
        outcomeText: 'Salvaged vintage laboratory brassware for +$220, +35 RP & +2 Samples.',
      },
    ],
  },
  {
    id: 'evt_rare_impossible_object',
    category: 'rare',
    kind: 'discovery',
    weight: 4.2,
    cooldownSec: 340,
    minReputation: 14,
    requiresLockedObject: true,
    title: 'An Impossible Anomaly Materializes!',
    message:
      'Barometers spun twice backwards as an uncataloged object politely faded out of thin air right beside the water fountain.',
    choices: [
      {
        label: 'Scoop Into Velvet Net (+Rare/Impossible Object & +3 Samples)',
        samplesDelta: 3,
        reputationDelta: 5,
        researchDelta: 25,
        deliverNewObject: true,
        outcomeText: 'Captured drifting curiosity cleanly into Intake (+3 Samples, +5 Rep)!',
      },
      {
        label: 'Measure Refraction Spectrum (+55 RP & +$180)',
        researchDelta: 55,
        fundsDelta: 180,
        samplesDelta: 2,
        outcomeText: 'Logged impossible spectral spikes (+55 RP, +$180, +2 Samples).',
      },
    ],
  },
  {
    id: 'evt_rare_missing_employee',
    category: 'rare',
    kind: 'milestone',
    weight: 4.8,
    cooldownSec: 320,
    minReputation: 10,
    title: 'A Previously Missing Employee Returns!',
    message:
      'The corridor fire door creaks open. A dusty researcher from "The 1998 Coffee Run" strolls in carrying warm bagels and immaculate notebooks.',
    choices: [
      {
        label: 'Reinstate On Payroll (Auto-Recruit / +Team Boost)',
        reputationDelta: 4,
        staffXpDelta: 35,
        recruitMissingEmployee: true,
        outcomeText: 'Welcomed veteran specialist back with +35 Staff XP & +4 Rep!',
      },
      {
        label: 'Read Their 1998 Field Journal (+48 RP, +$150, +2 Samples)',
        researchDelta: 48,
        fundsDelta: 150,
        samplesDelta: 2,
        outcomeText: 'Transcribed vintage field sketches (+48 RP, +$150, +2 Samples)!',
      },
    ],
  },

  // =========================================================================
  // 5. SECRET EVENTS
  // =========================================================================
  {
    id: 'evt_sec_whispering_cabinet',
    category: 'secret',
    kind: 'discovery',
    weight: 2.8,
    cooldownSec: 360,
    minReputation: 10,
    minDiscoveredObjects: 5,
    title: 'Secret Event: The Filing Cabinet Whispers',
    message:
      'At 11:04 PM, Drawer 44-B softly whispered: "Did you remember to feed the invisible duck toast crumbs on Tuesdays?"',
    choices: [
      {
        label: 'Hold Tape Recorder to Keyhole (+60 RP, +3 Samples & Object Clue)',
        researchDelta: 60,
        samplesDelta: 3,
        reputationDelta: 4,
        unlockObjectId: 'obj_invisible_duck',
        outcomeText: 'Recorded cabinet secrets (+60 RP, +3 Samples, +4 Rep)!',
      },
      {
        label: 'Feed It Mint Humbugs & Lock Drawer (+$160 & +5 Rep)',
        fundsDelta: 160,
        reputationDelta: 5,
        samplesDelta: 1,
        outcomeText: 'Drawer purred contentedly (+$160 Funds, +5 Rep, +1 Sample).',
      },
    ],
  },
  {
    id: 'evt_sec_unidentified_employee',
    category: 'secret',
    kind: 'discovery',
    weight: 2.5,
    cooldownSec: 380,
    minReputation: 16,
    title: 'Secret Event: Unidentified Badge in Empty Wing',
    message:
      'Lobby cameras spotted a cheerful technician wearing Badge #0000 polishing every brass gauge in an empty wing before walking smoothly through a closed bookcase.',
    choices: [
      {
        label: 'Leave Fresh Mug & Note (+45 RP, +4 Samples & +45% All Output / 90s)',
        researchDelta: 45,
        samplesDelta: 4,
        triggerBoost: {
          id: 'boost_phantom_colleague',
          label: 'Phantom Colleague Shift',
          description: '+45% Funds, Research & Investigation Speed for 90s',
          fundsMult: 1.45,
          researchMult: 1.45,
          samplesMult: 1.3,
          deliverySpeedMult: 1.2,
          investigationSpeedMult: 1.45,
          durationSec: 90,
        },
        outcomeText: 'Found mug washed spotless alongside +45 RP, +4 Samples & a 90s Shift Surge!',
      },
      {
        label: 'Cross-Check Brass Badge Archive (+$260 & +5 Rep)',
        fundsDelta: 260,
        reputationDelta: 5,
        staffXpDelta: 30,
        outcomeText: 'Archive matched founder-era insignia (+$260 Funds, +5 Rep, +30 Staff XP).',
      },
    ],
  },
  {
    id: 'evt_sec_department_dossier',
    category: 'secret',
    kind: 'discovery',
    weight: 2.4,
    cooldownSec: 400,
    minReputation: 20,
    title: 'Secret Event: Object Displays Your Department File',
    message:
      'An oscilloscope screen flickered green and printed a crisp live receipt: "{departmentName} · Objects Found: {discoveredCount}/10 · Lifetime Funds: ${fundsEarned} · Investigations Closed: {investigatedCount}. Nice layout."',
    choices: [
      {
        label: 'Archive Self-Aware Tape (+75 RP, +4 Samples & +5 Rep)',
        researchDelta: 75,
        samplesDelta: 4,
        reputationDelta: 5,
        outcomeText: 'Sealed meta-oscilloscope tape in Archives (+75 RP, +4 Samples, +5 Rep)!',
      },
      {
        label: 'Compliment the Monitor Back (+$275 & +35 Staff XP)',
        fundsDelta: 275,
        staffXpDelta: 35,
        reputationDelta: 4,
        outcomeText: 'Screen beamed a smiley face and dispensed $275 + 35 Staff XP!',
      },
    ],
  },
  {
    id: 'evt_sec_sealed_elevator',
    category: 'secret',
    kind: 'milestone',
    weight: 2.3,
    cooldownSec: 420,
    minReputation: 18,
    title: 'Secret Event: Sealed Brass Elevator Opens',
    message:
      'Heavy chains behind the Basement stairwell quietly dropped away. An art-deco elevator marked "SUB-LEVEL B2" chimes once with warm golden light.',
    choices: [
      {
        label: 'Step Inside & Descend (Excavate Sub-Level B2 / +4 Samples)',
        samplesDelta: 4,
        reputationDelta: 6,
        unlockFloor3: true,
        outcomeText: 'Elevator unlocked Deep Wing access and yielded +4 Samples & +6 Rep!',
      },
      {
        label: 'Measure Shaft Resonance Only (+$250 & +55 RP)',
        fundsDelta: 250,
        researchDelta: 55,
        samplesDelta: 2,
        outcomeText: 'Logged deep-shaft echoes safely (+$250 Funds, +55 RP, +2 Samples).',
      },
    ],
  },
  {
    id: 'evt_sec_pneumatic_note_1974',
    category: 'secret',
    kind: 'discovery',
    weight: 2.6,
    cooldownSec: 390,
    minReputation: 12,
    title: 'Secret Event: Pneumatic Tube #0 Drops a 1974 Slip',
    message:
      'A dented brass capsule rolled out of a wall pipe that is not connected to Reception. Inside is a typewritten slip signed "B. 0000 · Dept. 404: Check behind Drawer 44-B for the kettle."',
    choices: [
      {
        label: 'Transcribe & Log Into Dept. 404 Archives (+55 RP, +3 Samples)',
        researchDelta: 55,
        samplesDelta: 3,
        reputationDelta: 5,
        outcomeText: 'Filed strange 1974 pneumatic note (+55 RP, +3 Samples, +5 Rep)!',
      },
      {
        label: 'Send Down Mint Biscuits in Reply (+$210 & +30 Staff XP)',
        fundsDelta: 210,
        staffXpDelta: 30,
        reputationDelta: 4,
        outcomeText: 'Tube whistled happily and returned $210 in vintage stamps + 30 Staff XP!',
      },
    ],
  },
];

export function formatEventMessage(template: string, state: GameState): string {
  const discoveredCount = state.objects.filter((o) => o.status !== 'locked').length;
  const investigatedCount = state.objects.filter((o) => o.investigated).length;
  return template
    .replace('{departmentName}', state.departmentName)
    .replace('{discoveredCount}', String(discoveredCount))
    .replace('{investigatedCount}', String(investigatedCount))
    .replace('{fundsEarned}', String(Math.round(state.totalFundsEarned)));
}

export function pickEligibleRandomEvent(
  state: GameState,
  now = Date.now()
): RandomEventDefinition | null {
  if (state.onboarding && !state.onboarding.tutorialCompleted) {
    return null;
  }

  const stage = state.onboarding?.progressionStage ?? 6;
  const rep = state.resources.reputation;
  const discoveredCount = state.objects.filter((o) => o.status !== 'locked').length;
  const unlockedRoomsCount = Object.values(state.rooms).filter((r) => r.unlocked).length;
  const hasLockedObject = state.objects.some((o) => o.status === 'locked');
  const hasUnhiredEmployee = state.employees.some((e) => !e.hired);
  const hasAssignedNonStarter = state.objects.some(
    (o) => o.assignedRoomId !== null && o.id !== 'obj_toaster'
  );
  const cooldowns = state.eventCooldowns ?? {};

  const eligible = RANDOM_EVENTS_CATALOG.filter((evt) => {
    if (stage < 4 && evt.category === 'negative') return false;
    if ((cooldowns[evt.id] ?? 0) > now) return false;
    if (evt.minReputation !== undefined && rep < evt.minReputation) return false;
    if (evt.minDiscoveredObjects !== undefined && discoveredCount < evt.minDiscoveredObjects) {
      return false;
    }
    if (evt.minUnlockedRooms !== undefined && unlockedRoomsCount < evt.minUnlockedRooms) {
      return false;
    }
    if (evt.requiresLockedObject && !hasLockedObject) return false;
    if (evt.requiresAssignedObject && !hasAssignedNonStarter) return false;
    if (evt.requiresUnhiredEmployee && !hasUnhiredEmployee) return false;
    return true;
  });

  if (eligible.length === 0) {
    return RANDOM_EVENTS_CATALOG[0] ?? null;
  }

  const totalWeight = eligible.reduce((sum, evt) => sum + evt.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const evt of eligible) {
    roll -= evt.weight;
    if (roll <= 0) return evt;
  }
  return eligible[eligible.length - 1];
}
