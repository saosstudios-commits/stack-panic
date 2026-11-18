import type { LevelDef } from '../sim/types.ts';

/**
 * Level 2: Pizza Kitchen (5 Pizza Boxes)
 * Conveyor reversals, steam vents, flying trays, vanishing prep tables, and a fake order window.
 */
export const level2: LevelDef = {
  id: 2,
  name: 'Pizza Kitchen',
  subtitle: 'Watch the exhaust hood and hot steam!',
  theme: 'kitchen',
  containerTheme: 'pizza_box',
  startX: 1.8,
  startY: 2.0,
  goalX: 29.8,
  goalY: 4.5,
  initialStack: 5,
  platforms: [
    { id: 'l2_start', x: 0, y: 0, w: 5.0, h: 2.0, style: 'tile' },
    { id: 'l2_mid1', x: 11.2, y: 0, w: 6.0, h: 2.0, style: 'tile' },
    { id: 'l2_mid2', x: 19.6, y: 0, w: 5.2, h: 2.0, style: 'tile' },
    { id: 'l2_upper_step', x: 25.5, y: 0, w: 2.5, h: 3.2, style: 'tile' },
    { id: 'l2_goal_ledge', x: 28.2, y: 0, w: 3.8, h: 4.5, style: 'tile' },
  ],
  pickups: [],
  traps: [
    // 1. Conveyor belt that reverses halfway across to whip the 5-box stack!
    {
      id: 'l2_conveyor_rev',
      type: 'conveyor',
      x: 5.2,
      y: 1.4,
      w: 5.6,
      h: 0.6,
      speed: 3.4,
      reverseOnTrigger: true,
      triggerX: 8.2,
    },
    // 2. Low Exhaust Hood: safe to walk under (5 boxes top = 4.32), clips if you jump!
    {
      id: 'l2_low_hood',
      type: 'low_bridge',
      x: 12.6,
      y: 5.2,
      w: 1.6,
      h: 0.8,
      label: 'HOOD',
    },
    // 3. Steam Vent that launches you if mistimed
    {
      id: 'l2_steam',
      type: 'steam_vent',
      x: 15.6,
      y: 2.0,
      w: 1.3,
      h: 2.2,
      period: 2.4,
      duration: 0.55,
      impulseY: 13.5,
      forceX: 10.0,
      phase: 1.0,
    },
    // 4. Vanishing prep table over the gap
    {
      id: 'l2_vanish_prep',
      type: 'vanish',
      x: 17.6,
      y: 1.4,
      w: 1.6,
      h: 0.6,
      delay: 0.13,
    },
    // 5. Flying hot pizza tray patrolling at stack-top height (walk under, or time it!)
    {
      id: 'l2_flying_tray',
      type: 'moving_hazard',
      x: 20.6,
      y: 6.05,
      w: 1.2,
      h: 0.45,
      targetX: 22.6,
      targetY: 6.05,
      speed: 2.5,
    },
    // 6. Oven Ceiling Press
    {
      id: 'l2_oven_press',
      type: 'ceiling_drop',
      x: 22.8,
      y: 8.2,
      w: 1.3,
      h: 1.1,
      minY: 2.0,
      speed: 18.0,
      delay: 0.32,
      trigger: { x: 22.4, y: 2.0, w: 1.6, h: 6.0 },
    },
    // 7. Fake Order Window on the lower step before the upper real counter
    {
      id: 'l2_fake_window',
      type: 'fake_door',
      x: 26.1,
      y: 3.2,
      w: 1.2,
      h: 1.6,
      triggerDist: 1.05,
    },
  ],
};
