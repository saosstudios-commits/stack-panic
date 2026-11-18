import type { LevelDef } from '../sim/types.ts';

/**
 * Level 5: Delivery Gauntlet (12 VIP Gold Boxes)
 * The grand finale: remixes every trap at higher stakes, ending with a confetti fake-out!
 */
export const level5: LevelDef = {
  id: 5,
  name: 'VIP Gauntlet',
  subtitle: 'Twelve boxes. Zero mercy. One grand tip!',
  theme: 'plaza',
  containerTheme: 'vip_gold',
  startX: 1.6,
  startY: 2.0,
  goalX: 26.0,
  goalY: 2.0,
  initialStack: 12,
  platforms: [
    { id: 'l5_start', x: 0, y: 0, w: 4.5, h: 2.0, style: 'stripe' },
    { id: 'l5_mid1', x: 9.2, y: 0, w: 7.5, h: 2.0, style: 'stripe' },
    { id: 'l5_mid2', x: 21.0, y: 0, w: 11.0, h: 2.0, style: 'stripe' },
  ],
  pickups: [],
  traps: [
    // 1. Rapid Vanishing Steps
    {
      id: 'l5_vanish_1',
      type: 'vanish',
      x: 5.0,
      y: 1.5,
      w: 1.6,
      h: 0.5,
      delay: 0.13,
    },
    {
      id: 'l5_vanish_2',
      type: 'vanish',
      x: 7.1,
      y: 1.5,
      w: 1.6,
      h: 0.5,
      delay: 0.13,
    },
    // 2. Gust Alley + Low VIP Banner (12 boxes top = 6.70; banner at 7.25 clips full jumps!)
    {
      id: 'l5_gust',
      type: 'gust',
      x: 9.5,
      y: 2.0,
      w: 6.2,
      h: 7.0,
      period: 2.6,
      duration: 0.85,
      forceX: -14.0,
      phase: 0.3,
    },
    {
      id: 'l5_low_banner',
      type: 'low_bridge',
      x: 13.2,
      y: 8.25,
      w: 0.9,
      h: 0.65,
      label: 'VIP',
    },
    // 3. Popup spikes at end of mid1
    {
      id: 'l5_popup',
      type: 'popup_spikes',
      x: 15.8,
      y: 2.0,
      w: 0.85,
      h: 0.85,
      trigger: { x: 15.1, y: 1.8, w: 1.1, h: 4.0 },
      delay: 0.04,
    },
    // 4. Conveyor Reversal over gap2
    {
      id: 'l5_conveyor',
      type: 'conveyor',
      x: 16.9,
      y: 1.5,
      w: 3.9,
      h: 0.5,
      speed: 3.8,
      reverseOnTrigger: true,
      triggerX: 18.8,
    },
    // 5. Closing VIP Gate (starts at 7.9, lowers to 7.05)
    {
      id: 'l5_closing_gate',
      type: 'closing_door',
      x: 22.8,
      y: 7.9,
      w: 1.2,
      h: 2.4,
      minY: 7.05,
      speed: 1.2,
      triggerX: 19.6,
    },
    // 6. Ceiling Press
    {
      id: 'l5_ceiling_press',
      type: 'ceiling_drop',
      x: 24.4,
      y: 10.5,
      w: 1.2,
      h: 1.0,
      minY: 2.0,
      speed: 18.5,
      delay: 0.22,
      trigger: { x: 24.0, y: 2.0, w: 1.6, h: 7.5 },
    },
    // 7. Runaway Exit (scoots from 26.0 to 30.2!)
    {
      id: 'l5_runaway',
      type: 'runaway_exit',
      x: 26.0,
      y: 2.0,
      w: 1.5,
      h: 1.8,
      triggerDist: 3.2,
      targetX: 30.2,
      targetY: 2.0,
    },
    // 8. Final Confetti Fake-Out right before the true goal!
    {
      id: 'l5_confetti_fakeout',
      type: 'confetti_fakeout',
      x: 28.4,
      y: 2.0,
      w: 1.0,
      h: 1.0,
      triggerX: 27.6,
    },
  ],
};
