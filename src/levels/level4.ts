import type { LevelDef } from '../sim/types.ts';

/**
 * Level 4: Alley / Sewer (9 Orange Tubs)
 * Controls-swap detour sign, closing doorway shutter, popup spikes, wobble pipe, and bait pickup.
 */
export const level4: LevelDef = {
  id: 4,
  name: 'Alley & Sewer',
  subtitle: 'Mind the detour sign and the closing shutter!',
  theme: 'alley',
  containerTheme: 'orange_tub',
  startX: 1.8,
  startY: 2.0,
  goalX: 29.8,
  goalY: 2.0,
  initialStack: 9,
  platforms: [
    { id: 'l4_p1', x: 0, y: 0, w: 7.0, h: 2.0, style: 'metal' },
    // Fake grate
    { id: 'l4_fake_grate', x: 7.4, y: 0, w: 1.6, h: 2.0, style: 'metal', fake: true },
    { id: 'l4_p2', x: 9.4, y: 0, w: 6.6, h: 2.0, style: 'metal' },
    { id: 'l4_p3', x: 20.6, y: 0, w: 11.4, h: 2.0, style: 'metal' },
  ],
  pickups: [
    // Bait pickup (+2 tubs -> 11 tubs, makes closing shutter much tighter!)
    { id: 'l4_bait', x: 23.8, y: 6.9, addCount: 2, isBait: true },
  ],
  traps: [
    // 1. Controls-Swap Sign near start
    {
      id: 'l4_swap_sign',
      type: 'controls_swap',
      x: 4.5,
      y: 2.0,
      w: 1.0,
      h: 1.6,
      duration: 2.0,
    },
    // 2. Popup spikes on p2
    {
      id: 'l4_popup',
      type: 'popup_spikes',
      x: 10.6,
      y: 2.0,
      w: 1.3,
      h: 0.85,
      trigger: { x: 9.6, y: 1.8, w: 1.4, h: 3.5 },
      delay: 0.04,
    },
    // 3. Alley Draft Gust
    {
      id: 'l4_gust',
      type: 'gust',
      x: 12.6,
      y: 2.0,
      w: 3.2,
      h: 6.0,
      period: 2.6,
      duration: 0.85,
      forceX: 9.0,
      phase: 0.3,
    },
    // 4. Wobble Pipe over sewer gap
    {
      id: 'l4_wobble_pipe',
      type: 'wobble_plank',
      x: 16.3,
      y: 1.5,
      w: 4.0,
      h: 0.5,
    },
    // 5. Steam Vent on p3
    {
      id: 'l4_steam',
      type: 'steam_vent',
      x: 21.2,
      y: 2.0,
      w: 1.2,
      h: 2.2,
      period: 2.2,
      duration: 0.5,
      impulseY: 13.0,
      forceX: -8.0,
      phase: 1.2,
    },
    // 6. Closing Shutter Doorway: 9 tubs top = 5.68; starts at y=6.9, lowers to 6.28!
    {
      id: 'l4_closing_door',
      type: 'closing_door',
      x: 25.5,
      y: 6.9,
      w: 1.3,
      h: 2.2,
      minY: 6.28,
      speed: 1.05,
      triggerX: 22.0,
    },
    // 7. Ceiling drop near finish
    {
      id: 'l4_ceiling',
      type: 'ceiling_drop',
      x: 27.6,
      y: 9.5,
      w: 1.2,
      h: 1.0,
      minY: 2.0,
      speed: 18.0,
      delay: 0.22,
      trigger: { x: 27.2, y: 2.0, w: 1.6, h: 7.0 },
    },
  ],
};
