import type { LevelDef } from '../sim/types.ts';

/**
 * Level 1: Street Corner (3 Orange Tubs)
 * Gentle tutorial that lies to you. Teaches move, jump, tap-jump, and stack sway, then betrays them.
 */
export const level1: LevelDef = {
  id: 1,
  name: 'Street Corner',
  subtitle: 'Just a quick sidewalk stroll...',
  theme: 'street',
  containerTheme: 'orange_tub',
  startX: 2.0,
  startY: 2.0,
  goalX: 29.8,
  goalY: 2.0,
  initialStack: 3,
  platforms: [
    { id: 'l1_start', x: 0, y: 0, w: 7.5, h: 2.0, style: 'curb' },
    // Fake curb tile right over the first gap (Floor That Was Never There)
    { id: 'l1_fake_curb', x: 7.8, y: 0, w: 1.6, h: 2.0, style: 'curb', fake: true },
    { id: 'l1_mid1', x: 9.8, y: 0, w: 6.2, h: 2.0, style: 'curb' },
    // Gap with vanish step at x=16.6..18.2
    { id: 'l1_mid2', x: 18.8, y: 0, w: 5.5, h: 2.0, style: 'curb' },
    // Elevated curb near finish
    { id: 'l1_end', x: 25.0, y: 0, w: 7.0, h: 2.0, style: 'curb' },
  ],
  pickups: [
    // Bait pickup: adds +2 tubs right before the low awning at x=13.8..15.8!
    { id: 'l1_bait', x: 12.2, y: 6.45, addCount: 2, isBait: true },
  ],
  traps: [
    // 1. Low Awning: safe to walk under with 3 tubs (top=3.64), clips if you jump or grab bait!
    {
      id: 'l1_low_awning',
      type: 'low_bridge',
      x: 13.8,
      y: 4.15,
      w: 1.8,
      h: 0.7,
      label: 'PIZZA',
    },
    // 2. Vanishing curb tile over the second gap
    {
      id: 'l1_vanish_step',
      type: 'vanish',
      x: 16.4,
      y: 1.4,
      w: 1.8,
      h: 0.6,
      delay: 0.14,
    },
    // 3. Popup spikes at the landing spot after the vanishing step
    {
      id: 'l1_popup_spikes',
      type: 'popup_spikes',
      x: 19.6,
      y: 2.0,
      w: 1.2,
      h: 0.85,
      trigger: { x: 18.6, y: 1.8, w: 1.5, h: 3.5 },
      delay: 0.04,
    },
    // 4. Ceiling drop sign above mid2
    {
      id: 'l1_ceiling_sign',
      type: 'ceiling_drop',
      x: 22.0,
      y: 7.8,
      w: 1.4,
      h: 1.0,
      minY: 2.0,
      speed: 17.0,
      delay: 0.24,
      trigger: { x: 21.5, y: 2.0, w: 1.8, h: 5.5 },
    },
    // 5. Gust of street traffic breeze
    {
      id: 'l1_gust',
      type: 'gust',
      x: 24.0,
      y: 2.0,
      w: 3.2,
      h: 5.0,
      period: 2.0,
      duration: 1.0,
      forceX: -14.0,
      phase: 1.2,
    },
    // 6. Fake delivery door before the real one
    {
      id: 'l1_fake_door',
      type: 'fake_door',
      x: 27.2,
      y: 2.0,
      w: 1.4,
      h: 1.8,
      triggerDist: 0.78,
    },
  ],
};
