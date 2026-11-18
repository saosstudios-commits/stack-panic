import type { LevelDef } from '../sim/types.ts';
import { level1 } from './level1.ts';
import { level2 } from './level2.ts';
import { level3 } from './level3.ts';
import { level4 } from './level4.ts';
import { level5 } from './level5.ts';
import {
  level6,
  level7,
  level8,
  level9,
  level10,
  level11,
  level12,
  level13,
  level14,
  level15,
} from './levels6to15.ts';

export const LEVELS: LevelDef[] = [
  level1,
  level2,
  level3,
  level4,
  level5,
  level6,
  level7,
  level8,
  level9,
  level10,
  level11,
  level12,
  level13,
  level14,
  level15,
];

export function getLevel(id: number): LevelDef {
  return LEVELS.find((l) => l.id === id) ?? LEVELS[0];
}
