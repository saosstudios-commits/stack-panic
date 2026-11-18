import { FIXED_DT } from './constants.ts';
import { createSimState, stepSim } from './simulation.ts';
import type { InputState, LevelDef, SimState } from './types.ts';

export interface ReplaySegment {
  duration: number; // seconds
  left?: boolean;
  right?: boolean;
  jump?: boolean;
}

export interface ReplayResult {
  won: boolean;
  failed: boolean;
  failReason: string;
  elapsed: number;
  triggeredTraps: Set<string>;
  finalState: SimState;
}

export function runReplay(level: LevelDef, segments: ReplaySegment[]): ReplayResult {
  const state = createSimState(level);
  const triggeredTraps = new Set<string>();

  for (const seg of segments) {
    const frames = Math.max(1, Math.round(seg.duration / FIXED_DT));
    const input: InputState = {
      left: Boolean(seg.left),
      right: Boolean(seg.right),
      jump: Boolean(seg.jump),
    };
    for (let f = 0; f < frames; f++) {
      stepSim(state, input, FIXED_DT);
      for (const id of state.triggeredTrapIds) {
        triggeredTraps.add(id);
      }
      if (state.phase === 'won' || state.phase === 'failing') {
        return {
          won: state.phase === 'won',
          failed: state.phase === 'failing',
          failReason: state.failReason,
          elapsed: state.elapsed,
          triggeredTraps,
          finalState: state,
        };
      }
    }
  }

  return {
    won: state.phase === 'won',
    failed: state.phase === 'failing',
    failReason: state.failReason,
    elapsed: state.elapsed,
    triggeredTraps,
    finalState: state,
  };
}
