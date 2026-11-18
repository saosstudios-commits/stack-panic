import { LEVELS } from '../src/levels/index.ts';
import { runReplay, type ReplaySegment } from '../src/sim/replay.ts';

interface LevelTestSuite {
  levelId: number;
  winReplay: ReplaySegment[];
  trapReplays: Record<string, ReplaySegment[]>;
}

const l1Win: ReplaySegment[] = [
  { duration: 0.68, right: true },
  { duration: 0.35, right: true, jump: true },
  { duration: 0.85, right: true },
  { duration: 0.25, right: true, jump: true },
  { duration: 0.20, right: true },
  { duration: 0.30, right: true, jump: true },
  { duration: 0.25, right: true },
  { duration: 0.28, right: true },
  { duration: 0.28, left: true },
  { duration: 0.35, right: true },
  { duration: 0.35, right: true, jump: true },
  { duration: 0.14, right: true },
  { duration: 0.24, right: true, jump: true },
  { duration: 0.50, right: true },
  { duration: 0.35, left: true },
];

const l2Win: ReplaySegment[] = [
  { duration: 0.35, right: true },
  { duration: 0.25, right: true, jump: true },
  { duration: 1.05, right: true },
  { duration: 0.72, right: true },
  { duration: 0.14, right: true, jump: true },
  { duration: 0.45, right: true },
  { duration: 0.10, right: true, jump: true },
  { duration: 0.35, right: true },
  { duration: 0.38, right: true, jump: true },
  { duration: 0.15, right: true },
  { duration: 0.38, right: true, jump: true },
  { duration: 0.85, right: true },
  { duration: 0.35, right: true, jump: true },
  { duration: 0.50, right: true },
];

const l3Win: ReplaySegment[] = [
  { duration: 0.55, right: true },
  { duration: 0.22, right: true, jump: true },
  { duration: 0.65, right: true },
  { duration: 0.75, right: true },
  { duration: 0.26, right: true, jump: true },
  { duration: 0.16, right: true },
  { duration: 0.26, right: true, jump: true },
  { duration: 0.16, right: true },
  { duration: 0.28, right: true, jump: true },
  { duration: 0.25, right: true },
  { duration: 0.35, right: true, jump: true },
  { duration: 0.45, right: true },
  { duration: 0.35, right: true },
  { duration: 0.28, left: true },
  { duration: 0.90, right: true },
];

const l4Win: ReplaySegment[] = [
  { duration: 0.40, right: true },
  { duration: 0.28, left: true },
  { duration: 0.35, left: true, jump: true },
  { duration: 0.45, left: true },
  { duration: 0.25, left: true, jump: true },
  { duration: 0.20, right: true, jump: true },
  { duration: 0.55, right: true },
  { duration: 0.65, right: true },
  { duration: 0.30, right: true, jump: true },
  { duration: 0.75, right: true },
  { duration: 0.22, right: true },
  { duration: 0.14 },
  { duration: 0.28, left: true },
  { duration: 0.14 },
  { duration: 0.25, right: true },
  { duration: 0.35, right: true, jump: true },
  { duration: 0.25, right: true },
  { duration: 0.60, left: true },
];

const l5Win: ReplaySegment[] = [
  { duration: 0.35, right: true },
  { duration: 0.14, right: true, jump: true },
  { duration: 0.26, right: true },
  { duration: 0.14, right: true, jump: true },
  { duration: 0.26, right: true },
  { duration: 0.14, right: true, jump: true },
  { duration: 0.16, right: true },
  { duration: 0.22, right: true },
  { duration: 0.05 },
  { duration: 0.32, right: true, jump: true },
  { duration: 0.25, right: true },
  { duration: 0.25, right: true, jump: true },
  { duration: 0.40, right: true },
  { duration: 0.32, right: true, jump: true },
  { duration: 0.45, right: true },
  { duration: 0.20, right: true },
  { duration: 0.28, left: true },
  { duration: 0.70, right: true },
  { duration: 0.30 },
];

const l6Win: ReplaySegment[] = [{ duration: 3.8, right: true }];

const l7Win: ReplaySegment[] = [
  { duration: 0.90, right: true },
  { duration: 0.14, right: true, jump: true },
  { duration: 0.50 },
  { duration: 0.44, right: true, jump: true },
  { duration: 0.38, right: true },
  { duration: 0.35, right: true, jump: true },
  { duration: 0.15, right: true },
  { duration: 0.48, left: true },
  { duration: 0.30 },
  { duration: 0.35, right: true, jump: true },
  { duration: 0.45, right: true },
  { duration: 0.30, right: true, jump: true },
  { duration: 0.60, right: true },
];

const l8Win: ReplaySegment[] = [
  { duration: 1.65, right: true },
  { duration: 0.35, right: true, jump: true },
  { duration: 0.55, right: true },
  { duration: 0.32, right: true, jump: true },
  { duration: 0.18, right: true },
  { duration: 0.35, left: true },
  { duration: 0.22 },
  { duration: 0.35, right: true, jump: true },
  { duration: 0.65, right: true },
];

const l9Win: ReplaySegment[] = [
  { duration: 0.35, right: true },
  { duration: 0.25, right: true, jump: true },
  { duration: 1.05, right: true },
  { duration: 0.70, right: true },
  { duration: 0.28, right: true, jump: true },
  { duration: 0.65, right: true },
  { duration: 0.14, right: true, jump: true },
  { duration: 0.25, right: true },
  { duration: 0.35, right: true, jump: true },
  { duration: 0.65, right: true },
];

const l10Win: ReplaySegment[] = [
  { duration: 0.55, right: true },
  { duration: 0.14, right: true, jump: true },
  { duration: 0.75, right: true },
  { duration: 0.25, right: true, jump: true },
  { duration: 0.85, right: true },
  { duration: 0.18, right: true },
  { duration: 0.28, left: true },
  { duration: 0.15 },
  { duration: 0.35, right: true, jump: true },
  { duration: 0.90, right: true },
];

const l11Win: ReplaySegment[] = [
  { duration: 3.1, right: true },
  { duration: 0.32, right: true, jump: true },
  { duration: 0.65, right: true },
];

const l12Win: ReplaySegment[] = [
  { duration: 0.40, right: true },
  { duration: 0.85, left: true },
  { duration: 0.35, left: true, jump: true },
  { duration: 0.55 },
  { duration: 0.22, right: true },
  { duration: 0.14 },
  { duration: 0.26, left: true },
  { duration: 0.20 },
  { duration: 0.35, right: true, jump: true },
  { duration: 0.96, right: true },
  { duration: 0.26, right: true },
  { duration: 0.15 },
  { duration: 0.18, left: true },
  { duration: 0.25 },
  { duration: 0.35, right: true, jump: true },
  { duration: 0.60, right: true },
];

const l13Win: ReplaySegment[] = [
  { duration: 0.50, right: true },
  { duration: 0.16, right: true, jump: true },
  { duration: 0.22, right: true },
  { duration: 0.16, right: true, jump: true },
  { duration: 0.22, right: true },
  { duration: 0.22, right: true, jump: true },
  { duration: 0.85, right: true },
  { duration: 0.35, right: true, jump: true },
  { duration: 0.25, right: true },
  { duration: 0.14 },
  { duration: 0.35, left: true },
  { duration: 0.18 },
  { duration: 0.35, right: true, jump: true },
  { duration: 0.65, right: true },
];

const l14Win: ReplaySegment[] = [
  { duration: 0.45, right: true },
  { duration: 0.35, right: true, jump: true },
  { duration: 0.85, right: true },
  { duration: 0.35, right: true, jump: true },
  { duration: 0.65, right: true },
  { duration: 0.35, right: true, jump: true },
  { duration: 0.35, right: true },
  { duration: 0.25, right: true },
  { duration: 0.28, left: true },
  { duration: 0.35, right: true, jump: true },
  { duration: 0.60, right: true },
];

const l15Win: ReplaySegment[] = [
  { duration: 0.35, right: true },
  { duration: 0.14, right: true, jump: true },
  { duration: 0.26, right: true },
  { duration: 0.14, right: true, jump: true },
  { duration: 0.26, right: true },
  { duration: 0.14, right: true, jump: true },
  { duration: 0.16, right: true },
  { duration: 0.22, right: true },
  { duration: 0.05 },
  { duration: 0.32, right: true, jump: true },
  { duration: 0.25, right: true },
  { duration: 0.25, right: true, jump: true },
  { duration: 0.40, right: true },
  { duration: 0.32, right: true, jump: true },
  { duration: 0.35, right: true },
  { duration: 0.28, left: true },
  { duration: 0.14 },
  { duration: 0.35, right: true, jump: true },
  { duration: 0.85, right: true },
  { duration: 0.30 },
];

const SUITES: LevelTestSuite[] = [
  {
    levelId: 1,
    winReplay: l1Win,
    trapReplays: {
      l1_low_awning: [{ duration: 1.9, right: true }],
      l1_vanish_step: l1Win.slice(0, 5),
      l1_popup_spikes: l1Win.slice(0, 7),
      l1_ceiling_sign: l1Win.slice(0, 9),
      l1_gust: l1Win.slice(0, 12),
      l1_fake_door: [...l1Win.slice(0, 9), { duration: 0.35, right: true }, { duration: 0.12, right: true, jump: true }, { duration: 0.3, left: true }, { duration: 0.7 }],
    },
  },
  {
    levelId: 2,
    winReplay: l2Win,
    trapReplays: {
      l2_conveyor_rev: l2Win.slice(0, 3),
      l2_low_hood: l2Win.slice(0, 4),
      l2_steam: [{ duration: 0.35, right: true }, { duration: 0.25, right: true, jump: true }, { duration: 1.05, right: true }, { duration: 0.35, right: true }, { duration: 2.2 }],
      l2_vanish_prep: l2Win.slice(0, 7),
      l2_flying_tray: [...l2Win.slice(0, 7), { duration: 0.8, right: true }],
      l2_oven_press: l2Win.slice(0, 11),
      l2_fake_window: [...l2Win.slice(0, 10), { duration: 0.35, right: true, jump: true }, { duration: 0.65, right: true }, { duration: 0.4, left: true }],
    },
  },
  {
    levelId: 3,
    winReplay: l3Win,
    trapReplays: {
      l3_wobble: [{ duration: 1.2, right: true }],
      l3_gust: [{ duration: 1.6, right: true }],
      l3_clothesline: [{ duration: 1.9, right: true }],
      l3_shingle_1: l3Win.slice(0, 6),
      l3_shingle_2: [{ duration: 0.55, right: true }, { duration: 0.22, right: true, jump: true }, { duration: 1.40, right: true }, { duration: 0.14, right: true, jump: true }, { duration: 0.75 }],
      l3_trampoline: [...l3Win.slice(0, 9), { duration: 0.5, right: true }],
      l3_chimney_haz: [...l3Win.slice(0, 9), { duration: 0.7, right: true }],
      l3_brick_drop: l3Win.slice(0, 14),
      l3_runaway: l3Win,
    },
  },
  {
    levelId: 4,
    winReplay: l4Win,
    trapReplays: {
      l4_swap_sign: l4Win.slice(0, 2),
      l4_popup: l4Win.slice(0, 6),
      l4_gust: l4Win.slice(0, 7),
      l4_wobble_pipe: l4Win.slice(0, 8),
      l4_steam: [...l4Win.slice(0, 9), { duration: 0.2, right: true }, { duration: 2.0 }],
      l4_closing_door: l4Win.slice(0, 11),
      l4_ceiling: l4Win.slice(0, 13),
    },
  },
  {
    levelId: 5,
    winReplay: l5Win,
    trapReplays: {
      l5_vanish_1: [{ duration: 0.15, right: true }, { duration: 0.10, right: true, jump: true }, { duration: 0.55, right: true }],
      l5_vanish_2: l5Win.slice(0, 5),
      l5_gust: [...l5Win.slice(0, 6), { duration: 0.8, right: true }],
      l5_low_banner: l5Win.slice(0, 8),
      l5_popup: [...l5Win.slice(0, 8), { duration: 0.5, right: true }],
      l5_conveyor: l5Win.slice(0, 13),
      l5_closing_gate: l5Win.slice(0, 15),
      l5_ceiling_press: l5Win.slice(0, 17),
      l5_runaway: l5Win,
      l5_confetti_fakeout: l5Win,
    },
  },
  {
    levelId: 6,
    winReplay: l6Win,
    trapReplays: {
      l6_decoy_1: l6Win,
      l6_decoy_2: l6Win,
      l6_decoy_3: l6Win,
      l6_decoy_4: l6Win,
      l6_decoy_5: l6Win,
      l6_decoy_6: l6Win,
    },
  },
  {
    levelId: 7,
    winReplay: l7Win,
    trapReplays: {
      l7_decoy_1: l7Win.slice(0, 1),
      l7_real_2: [...l7Win.slice(0, 1), { duration: 0.6, right: true }],
      l7_decoy_3: [...l7Win.slice(0, 2), { duration: 0.65, right: true }],
      l7_spikes: [...l7Win.slice(0, 2), { duration: 0.95, right: true }],
      l7_real_4: [...l7Win.slice(0, 4), { duration: 0.5, right: true }],
      l7_decoy_5: [...l7Win.slice(0, 6), { duration: 0.5 }],
      l7_nuke: l7Win.slice(0, 8),
      l7_real_6: [...l7Win.slice(0, 10), { duration: 0.6, right: true }],
    },
  },
  {
    levelId: 8,
    winReplay: l8Win,
    trapReplays: {
      l8_gust_1: [{ duration: 0.8, right: true }, { duration: 1.5 }],
      l8_low_1: l8Win.slice(0, 1),
      l8_gust_2: [...l8Win.slice(0, 2), { duration: 0.5, right: true }, { duration: 1.5 }],
      l8_spikes: l8Win.slice(0, 5),
      l8_nuke: l8Win.slice(0, 6),
    },
  },
  {
    levelId: 9,
    winReplay: l9Win,
    trapReplays: {
      l9_conv_1: l9Win.slice(0, 3),
      l9_low_hood: l9Win.slice(0, 4),
      l9_steam: [...l9Win.slice(0, 3), { duration: 0.45, right: true }, { duration: 2.0 }],
      l9_conv_2: l9Win.slice(0, 6),
      l9_fake_door: [...l9Win.slice(0, 5), { duration: 1.3, right: true }],
    },
  },
  {
    levelId: 10,
    winReplay: l10Win,
    trapReplays: {
      l10_wobble_1: l10Win.slice(0, 3),
      l10_wobble_2: l10Win.slice(0, 5),
      l10_nuke: [...l10Win.slice(0, 6), { duration: 0.6, right: true }],
      l10_runaway: l10Win,
    },
  },
  {
    levelId: 11,
    winReplay: l11Win,
    trapReplays: {
      l11_decoy_1: l11Win,
      l11_decoy_2: l11Win,
      l11_decoy_3: l11Win,
      l11_decoy_4: l11Win,
      l11_last_spike: l11Win,
    },
  },
  {
    levelId: 12,
    winReplay: l12Win,
    trapReplays: {
      l12_swap: l12Win.slice(0, 2),
      l12_nuke_1: l12Win.slice(0, 6),
      l12_closing: l12Win.slice(0, 10),
      l12_nuke_2: l12Win.slice(0, 12),
    },
  },
  {
    levelId: 13,
    winReplay: l13Win,
    trapReplays: {
      l13_shingle_1: [{ duration: 0.10, right: true }, { duration: 0.10, right: true, jump: true }, { duration: 0.65, right: true }],
      l13_shingle_2: l13Win.slice(0, 5),
      l13_gust: l13Win.slice(0, 7),
      l13_tramp: [...l13Win.slice(0, 7), { duration: 0.6, right: true }],
      l13_chimney_haz: [...l13Win.slice(0, 7), { duration: 0.8, right: true }],
      l13_nuke: l13Win.slice(0, 11),
    },
  },
  {
    levelId: 14,
    winReplay: l14Win,
    trapReplays: {
      l14_fake_1: [{ duration: 0.9, right: true }],
      l14_tray: l14Win.slice(0, 3),
      l14_closing: l14Win.slice(0, 5),
      l14_fake_2: [...l14Win.slice(0, 5), { duration: 0.9, right: true }],
      l14_nuke: l14Win.slice(0, 9),
    },
  },
  {
    levelId: 15,
    winReplay: l15Win,
    trapReplays: {
      l15_vanish_1: [{ duration: 0.15, right: true }, { duration: 0.10, right: true, jump: true }, { duration: 0.55, right: true }],
      l15_vanish_2: l15Win.slice(0, 5),
      l15_gust: [...l15Win.slice(0, 6), { duration: 0.8, right: true }],
      l15_low_vip: l15Win.slice(0, 8),
      l15_popup: [...l15Win.slice(0, 8), { duration: 0.5, right: true }],
      l15_conveyor: l15Win.slice(0, 13),
      l15_nuke: l15Win.slice(0, 16),
      l15_runaway: l15Win,
      l15_confetti: l15Win,
    },
  },
];

let failures = 0;

for (const suite of SUITES) {
  const level = LEVELS.find((l) => l.id === suite.levelId);
  if (!level) {
    console.error(`Missing level ${suite.levelId}`);
    failures++;
    continue;
  }

  // 1. Verify win replay
  const winRes = runReplay(level, suite.winReplay);
  if (!winRes.won) {
    console.error(
      `[FAIL] Level ${level.id} (${level.name}) win replay failed at t=${winRes.elapsed.toFixed(2)}s ` +
        `(x=${winRes.finalState.player.x.toFixed(2)}, y=${winRes.finalState.player.y.toFixed(2)}, ` +
        `lean=${winRes.finalState.leanRatio.toFixed(2)}, reason="${winRes.failReason}")`
    );
    failures++;
  } else {
    console.log(`[PASS] Level ${level.id} (${level.name}) completed in ${winRes.elapsed.toFixed(2)}s`);
  }

  // 2. Verify every trap triggers
  for (const trap of level.traps) {
    const segs = suite.trapReplays[trap.id];
    if (!segs) {
      console.error(`[FAIL] Missing trap replay for ${trap.id} in Level ${level.id}`);
      failures++;
      continue;
    }
    const res = runReplay(level, segs);
    if (!res.triggeredTraps.has(trap.id)) {
      console.error(
        `[FAIL] Trap ${trap.id} (${trap.type}) did not trigger in Level ${level.id} ` +
          `(stopped at x=${res.finalState.player.x.toFixed(2)}, y=${res.finalState.player.y.toFixed(2)}, reason="${res.failReason}")`
      );
      failures++;
    } else {
      console.log(`  [PASS] Trap ${trap.id} (${trap.type}) triggered`);
    }
  }
}

if (failures > 0) {
  throw new Error(`${failures} level/trap check(s) failed.`);
}
console.log('\nAll 5 levels and all traps passed headless verification!');
