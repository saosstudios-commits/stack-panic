import type { LevelDef } from '../sim/types.ts';

/**
 * Level 3: Rooftops (7 Striped Buckets)
 * Wind gusts, wobble plank, collapsing shingles, trampoline betrayal, and a runaway exit!
 */
export const level3: LevelDef = {
  id: 3,
  name: 'Windy Rooftops',
  subtitle: 'Hold onto your buckets up here!',
  theme: 'rooftop',
  containerTheme: 'striped_bucket',
  startX: 1.8,
  startY: 2.5,
  goalX: 25.5,
  goalY: 2.5,
  initialStack: 7,
  platforms: [
    { id: 'l3_roof1', x: 0, y: 0, w: 6.2, h: 2.5, style: 'brick' },
    { id: 'l3_roof2', x: 11.4, y: 0, w: 5.8, h: 2.5, style: 'brick' },
    { id: 'l3_roof3', x: 21.8, y: 0, w: 10.2, h: 2.5, style: 'brick' },
  ],
  pickups: [],
  traps: [
    // 1. Wobble Plank seesaw over first gap
    {
      id: 'l3_wobble',
      type: 'wobble_plank',
      x: 6.5,
      y: 2.0,
      w: 4.5,
      h: 0.5,
    },
    // 2. Gust Alley across roof2
    {
      id: 'l3_gust',
      type: 'gust',
      x: 11.8,
      y: 2.5,
      w: 5.0,
      h: 6.0,
      period: 2.8,
      duration: 0.9,
      forceX: -24.0,
      phase: 0.4,
    },
    // 3. Low Clothesline (7 buckets top = 5.50; beam at 5.95 clips full jumps!)
    {
      id: 'l3_clothesline',
      type: 'low_bridge',
      x: 13.5,
      y: 5.95,
      w: 2.0,
      h: 0.5,
      label: 'LINE',
    },
    // 4. Collapsing Shingles across second gap
    {
      id: 'l3_shingle_1',
      type: 'vanish',
      x: 17.6,
      y: 2.0,
      w: 1.6,
      h: 0.5,
      delay: 0.14,
    },
    {
      id: 'l3_shingle_2',
      type: 'vanish',
      x: 19.7,
      y: 2.0,
      w: 1.6,
      h: 0.5,
      delay: 0.14,
    },
    // 5. Trampoline Betrayal + overhead chimney hazard
    {
      id: 'l3_trampoline',
      type: 'trampoline',
      x: 22.4,
      y: 2.5,
      w: 1.3,
      h: 0.45,
      impulseY: 16.5,
    },
    {
      id: 'l3_chimney_haz',
      type: 'low_bridge',
      x: 22.0,
      y: 9.2,
      w: 2.2,
      h: 1.0,
      label: 'SPIKE',
    },
    // 6. Chimney brick ceiling drop
    {
      id: 'l3_brick_drop',
      type: 'ceiling_drop',
      x: 27.0,
      y: 9.5,
      w: 1.3,
      h: 1.0,
      minY: 2.5,
      speed: 18.0,
      delay: 0.22,
      trigger: { x: 26.6, y: 2.5, w: 1.6, h: 6.5 },
    },
    // 7. Runaway Exit: scoots from 25.5 to 30.0 when you approach!
    {
      id: 'l3_runaway',
      type: 'runaway_exit',
      x: 25.5,
      y: 2.5,
      w: 1.5,
      h: 1.8,
      triggerDist: 2.2,
      targetX: 30.0,
      targetY: 2.5,
    },
  ],
};
