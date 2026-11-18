import type { LevelDef } from '../sim/types.ts';

/**
 * Level 6: The Peaceful Walk (4 Orange Tubs)
 * Psychological troll: lined with cracked-looking blocks that look like they'll collapse,
 * but NONE of them actually fall. Just walk straight across!
 */
export const level6: LevelDef = {
  id: 6,
  name: 'The Peaceful Walk',
  subtitle: 'Every tile looks cracked... or is it?',
  theme: 'street',
  containerTheme: 'orange_tub',
  startX: 1.8,
  startY: 2.0,
  goalX: 29.8,
  goalY: 2.0,
  initialStack: 4,
  platforms: [
    { id: 'l6_start', x: 0, y: 0, w: 5.5, h: 2.0, style: 'curb' },
    { id: 'l6_end', x: 26.5, y: 0, w: 5.5, h: 2.0, style: 'curb' },
  ],
  pickups: [],
  traps: [
    { id: 'l6_decoy_1', type: 'vanish', x: 5.7, y: 1.4, w: 3.2, h: 0.6, decoy: true },
    { id: 'l6_decoy_2', type: 'vanish', x: 9.1, y: 1.4, w: 3.2, h: 0.6, decoy: true },
    { id: 'l6_decoy_3', type: 'vanish', x: 12.5, y: 1.4, w: 3.2, h: 0.6, decoy: true },
    { id: 'l6_decoy_4', type: 'vanish', x: 15.9, y: 1.4, w: 3.2, h: 0.6, decoy: true },
    { id: 'l6_decoy_5', type: 'vanish', x: 19.3, y: 1.4, w: 3.2, h: 0.6, decoy: true },
    { id: 'l6_decoy_6', type: 'vanish', x: 22.7, y: 1.4, w: 3.6, h: 0.6, decoy: true },
  ],
};

/**
 * Level 7: Trust Issues (5 Pizza Boxes)
 * Same visual layout as Level 6... EXCEPT now the trust is broken!
 * Real vanishing tiles, popup spikes, and a giant Nuke Block!
 */
export const level7: LevelDef = {
  id: 7,
  name: 'Trust Issues',
  subtitle: 'Same bridge. Completely different rules.',
  theme: 'street',
  containerTheme: 'pizza_box',
  startX: 1.8,
  startY: 2.0,
  goalX: 29.8,
  goalY: 2.0,
  initialStack: 5,
  platforms: [
    { id: 'l7_start', x: 0, y: 0, w: 5.5, h: 2.0, style: 'curb' },
    { id: 'l7_end', x: 26.5, y: 0, w: 5.5, h: 2.0, style: 'curb' },
  ],
  pickups: [],
  traps: [
    { id: 'l7_decoy_1', type: 'vanish', x: 5.7, y: 1.4, w: 3.2, h: 0.6, decoy: true },
    { id: 'l7_real_2', type: 'vanish', x: 9.1, y: 1.4, w: 3.2, h: 0.6, delay: 0.14 },
    { id: 'l7_decoy_3', type: 'vanish', x: 12.5, y: 1.4, w: 3.2, h: 0.6, decoy: true },
    {
      id: 'l7_spikes',
      type: 'popup_spikes',
      x: 14.8,
      y: 2.0,
      w: 0.85,
      h: 0.85,
      trigger: { x: 14.1, y: 1.8, w: 1.1, h: 3.5 },
      delay: 0.04,
    },
    { id: 'l7_real_4', type: 'vanish', x: 15.9, y: 1.4, w: 3.2, h: 0.6, delay: 0.14 },
    { id: 'l7_decoy_5', type: 'vanish', x: 19.3, y: 1.4, w: 3.2, h: 0.6, decoy: true },
    {
      id: 'l7_nuke',
      type: 'ceiling_drop',
      x: 20.5,
      y: 9.5,
      w: 1.8,
      h: 1.5,
      minY: 2.0,
      speed: 22.0,
      delay: 0.34,
      nuke: true,
      trigger: { x: 20.0, y: 2.0, w: 2.0, h: 7.0 },
    },
    { id: 'l7_real_6', type: 'vanish', x: 22.7, y: 1.4, w: 3.6, h: 0.6, delay: 0.14 },
  ],
};

/**
 * Level 8: Double Wind Tunnel (6 Striped Buckets)
 */
export const level8: LevelDef = {
  id: 8,
  name: 'Wind Tunnel',
  subtitle: 'Lean into the gusts, duck under the beams!',
  theme: 'rooftop',
  containerTheme: 'striped_bucket',
  startX: 1.8,
  startY: 2.0,
  goalX: 29.8,
  goalY: 2.0,
  initialStack: 6,
  platforms: [
    { id: 'l8_p1', x: 0, y: 0, w: 13.5, h: 2.0, style: 'brick' },
    { id: 'l8_p2', x: 15.8, y: 0, w: 16.2, h: 2.0, style: 'brick' },
  ],
  pickups: [],
  traps: [
    { id: 'l8_gust_1', type: 'gust', x: 4.5, y: 2.0, w: 4.5, h: 6.0, period: 2.5, duration: 0.85, forceX: -14.0, phase: 0.2 },
    { id: 'l8_low_1', type: 'low_bridge', x: 10.2, y: 5.55, w: 1.8, h: 0.7, label: 'BEAM' },
    { id: 'l8_gust_2', type: 'gust', x: 17.0, y: 2.0, w: 4.8, h: 6.0, period: 2.5, duration: 0.85, forceX: 14.0, phase: 1.1 },
    {
      id: 'l8_spikes',
      type: 'popup_spikes',
      x: 23.0,
      y: 2.0,
      w: 1.1,
      h: 0.85,
      trigger: { x: 22.1, y: 1.8, w: 1.3, h: 3.5 },
      delay: 0.04,
    },
    { id: 'l8_nuke', type: 'ceiling_drop', x: 26.2, y: 9.2, w: 1.5, h: 1.2, minY: 2.0, speed: 20.0, delay: 0.25, nuke: true, trigger: { x: 25.8, y: 2.0, w: 1.8, h: 6.8 } },
  ],
};

/**
 * Level 9: Conveyor Chaos (7 Pizza Boxes)
 */
export const level9: LevelDef = {
  id: 9,
  name: 'Conveyor Chaos',
  subtitle: 'Two belts, both lying about direction.',
  theme: 'kitchen',
  containerTheme: 'pizza_box',
  startX: 1.8,
  startY: 2.0,
  goalX: 29.8,
  goalY: 2.0,
  initialStack: 7,
  platforms: [
    { id: 'l9_p1', x: 0, y: 0, w: 5.0, h: 2.0, style: 'tile' },
    { id: 'l9_p2', x: 11.4, y: 0, w: 6.2, h: 2.0, style: 'tile' },
    { id: 'l9_p3', x: 23.8, y: 0, w: 8.2, h: 2.0, style: 'tile' },
  ],
  pickups: [],
  traps: [
    { id: 'l9_conv_1', type: 'conveyor', x: 5.3, y: 1.4, w: 5.8, h: 0.6, speed: 3.4, reverseOnTrigger: true, triggerX: 8.2 },
    { id: 'l9_low_hood', type: 'low_bridge', x: 12.8, y: 5.85, w: 1.8, h: 0.7, label: 'HOOD' },
    { id: 'l9_steam', type: 'steam_vent', x: 15.6, y: 2.0, w: 1.2, h: 2.2, period: 2.4, duration: 0.55, impulseY: 13.5, forceX: 9.0, phase: 1.0 },
    { id: 'l9_conv_2', type: 'conveyor', x: 17.9, y: 1.4, w: 5.6, h: 0.6, speed: 3.6, reverseOnTrigger: true, triggerX: 20.8 },
    { id: 'l9_fake_door', type: 'fake_door', x: 26.8, y: 2.0, w: 1.4, h: 1.8, triggerDist: 0.8 },
  ],
};

/**
 * Level 10: Seesaw Circus (8 Striped Buckets)
 */
export const level10: LevelDef = {
  id: 10,
  name: 'Seesaw Circus',
  subtitle: 'Now with real tilted-plank physics!',
  theme: 'rooftop',
  containerTheme: 'striped_bucket',
  startX: 1.8,
  startY: 2.5,
  goalX: 25.5,
  goalY: 2.5,
  initialStack: 8,
  platforms: [
    { id: 'l10_p1', x: 0, y: 0, w: 5.5, h: 2.5, style: 'brick' },
    { id: 'l10_p2', x: 11.4, y: 0, w: 4.5, h: 2.5, style: 'brick' },
    { id: 'l10_p3', x: 22.0, y: 0, w: 10.0, h: 2.5, style: 'brick' },
  ],
  pickups: [],
  traps: [
    { id: 'l10_wobble_1', type: 'wobble_plank', x: 5.8, y: 2.0, w: 5.2, h: 0.5 },
    { id: 'l10_wobble_2', type: 'wobble_plank', x: 16.3, y: 2.0, w: 5.2, h: 0.5 },
    { id: 'l10_nuke', type: 'ceiling_drop', x: 23.8, y: 9.8, w: 1.5, h: 1.3, minY: 2.5, speed: 20.0, delay: 0.25, nuke: true, trigger: { x: 23.4, y: 2.5, w: 1.6, h: 7.0 } },
    { id: 'l10_runaway', type: 'runaway_exit', x: 25.5, y: 2.5, w: 1.5, h: 1.8, triggerDist: 2.5, targetX: 30.0, targetY: 2.5 },
  ],
};

/**
 * Level 11: False Hope (8 Orange Tubs)
 * Looks terrifying (cracked tiles everywhere + low beam), but almost everything is safe...
 * except ONE sneaky popup spike right before the exit!
 */
export const level11: LevelDef = {
  id: 11,
  name: 'False Hope',
  subtitle: 'Relax, nothing here can hurt you... mostly.',
  theme: 'alley',
  containerTheme: 'orange_tub',
  startX: 1.8,
  startY: 2.0,
  goalX: 29.8,
  goalY: 2.0,
  initialStack: 8,
  platforms: [
    { id: 'l11_p1', x: 0, y: 0, w: 6.0, h: 2.0, style: 'metal' },
    { id: 'l11_p2', x: 23.5, y: 0, w: 8.5, h: 2.0, style: 'metal' },
  ],
  pickups: [],
  traps: [
    { id: 'l11_decoy_1', type: 'vanish', x: 6.2, y: 1.4, w: 4.0, h: 0.6, decoy: true },
    { id: 'l11_decoy_2', type: 'vanish', x: 10.4, y: 1.4, w: 4.0, h: 0.6, decoy: true },
    { id: 'l11_decoy_3', type: 'vanish', x: 14.6, y: 1.4, w: 4.2, h: 0.6, decoy: true },
    { id: 'l11_decoy_4', type: 'vanish', x: 19.0, y: 1.4, w: 4.3, h: 0.6, decoy: true },
    {
      id: 'l11_last_spike',
      type: 'popup_spikes',
      x: 26.8,
      y: 2.0,
      w: 1.1,
      h: 0.85,
      trigger: { x: 25.8, y: 1.8, w: 1.3, h: 3.5 },
      delay: 0.04,
    },
  ],
};

/**
 * Level 12: Nuke Alley (9 Orange Tubs)
 * Nuke blocks + controls swap + closing shutter.
 */
export const level12: LevelDef = {
  id: 12,
  name: 'Nuke Alley',
  subtitle: 'Watch the sky and mind the detour!',
  theme: 'alley',
  containerTheme: 'orange_tub',
  startX: 1.8,
  startY: 2.0,
  goalX: 29.8,
  goalY: 2.0,
  initialStack: 9,
  platforms: [
    { id: 'l12_p1', x: 0, y: 0, w: 12.0, h: 2.0, style: 'metal' },
    { id: 'l12_p2', x: 14.2, y: 0, w: 17.8, h: 2.0, style: 'metal' },
  ],
  pickups: [],
  traps: [
    { id: 'l12_swap', type: 'controls_swap', x: 4.6, y: 2.0, w: 1.0, h: 1.6, duration: 1.8 },
    { id: 'l12_nuke_1', type: 'ceiling_drop', x: 16.5, y: 9.8, w: 1.6, h: 1.4, minY: 2.0, speed: 21.0, delay: 0.24, nuke: true, trigger: { x: 16.0, y: 2.0, w: 1.8, h: 7.0 } },
    { id: 'l12_closing', type: 'closing_door', x: 22.0, y: 6.9, w: 1.3, h: 2.2, minY: 6.28, speed: 1.05, triggerX: 18.5 },
    { id: 'l12_nuke_2', type: 'ceiling_drop', x: 26.2, y: 9.8, w: 1.6, h: 1.4, minY: 2.0, speed: 21.0, delay: 0.24, nuke: true, trigger: { x: 25.8, y: 2.0, w: 1.8, h: 7.0 } },
  ],
};

/**
 * Level 13: Skyscraper Shuffle (10 Striped Buckets)
 */
export const level13: LevelDef = {
  id: 13,
  name: 'Skyscraper Shuffle',
  subtitle: 'Ten buckets high. Don’t look down.',
  theme: 'rooftop',
  containerTheme: 'striped_bucket',
  startX: 1.8,
  startY: 2.5,
  goalX: 29.8,
  goalY: 2.5,
  initialStack: 10,
  platforms: [
    { id: 'l13_p1', x: 0, y: 0, w: 5.5, h: 2.5, style: 'brick' },
    { id: 'l13_p2', x: 11.0, y: 0, w: 7.5, h: 2.5, style: 'brick' },
    { id: 'l13_p3', x: 22.5, y: 0, w: 9.5, h: 2.5, style: 'brick' },
  ],
  pickups: [],
  traps: [
    { id: 'l13_shingle_1', type: 'vanish', x: 6.0, y: 2.0, w: 1.8, h: 0.5, delay: 0.14 },
    { id: 'l13_shingle_2', type: 'vanish', x: 8.4, y: 2.0, w: 1.8, h: 0.5, delay: 0.14 },
    { id: 'l13_gust', type: 'gust', x: 11.5, y: 2.5, w: 6.0, h: 7.0, period: 2.6, duration: 0.85, forceX: -13.0, phase: 0.3 },
    { id: 'l13_tramp', type: 'trampoline', x: 19.3, y: 2.0, w: 1.4, h: 0.5, impulseY: 16.0 },
    { id: 'l13_chimney_haz', type: 'low_bridge', x: 18.8, y: 10.6, w: 2.4, h: 1.0, label: 'SPIKE' },
    { id: 'l13_nuke', type: 'ceiling_drop', x: 25.5, y: 10.2, w: 1.6, h: 1.4, minY: 2.5, speed: 21.0, delay: 0.24, nuke: true, trigger: { x: 25.0, y: 2.5, w: 1.8, h: 7.0 } },
  ],
};

/**
 * Level 14: The Fakeout Factory (11 Pizza Boxes)
 */
export const level14: LevelDef = {
  id: 14,
  name: 'Fakeout Factory',
  subtitle: 'Spot the real counter before the shutter drops!',
  theme: 'kitchen',
  containerTheme: 'pizza_box',
  startX: 1.8,
  startY: 2.0,
  goalX: 29.8,
  goalY: 2.0,
  initialStack: 11,
  platforms: [
    { id: 'l14_p1', x: 0, y: 0, w: 14.0, h: 2.0, style: 'tile' },
    { id: 'l14_p2', x: 16.5, y: 0, w: 15.5, h: 2.0, style: 'tile' },
  ],
  pickups: [],
  traps: [
    { id: 'l14_fake_1', type: 'fake_door', x: 6.5, y: 2.0, w: 1.4, h: 1.8, triggerDist: 0.85 },
    { id: 'l14_tray', type: 'moving_hazard', x: 10.2, y: 7.95, w: 1.2, h: 0.5, targetX: 13.0, targetY: 7.95, speed: 2.6 },
    { id: 'l14_closing', type: 'closing_door', x: 20.6, y: 7.6, w: 1.3, h: 2.2, minY: 6.85, speed: 1.05, triggerX: 16.8 },
    { id: 'l14_fake_2', type: 'fake_door', x: 23.2, y: 2.0, w: 1.4, h: 1.8, triggerDist: 0.85 },
    { id: 'l14_nuke', type: 'ceiling_drop', x: 26.2, y: 10.2, w: 1.5, h: 1.4, minY: 2.0, speed: 21.0, delay: 0.24, nuke: true, trigger: { x: 25.8, y: 2.0, w: 1.6, h: 7.5 } },
  ],
};

/**
 * Level 15: Delivery Apocalypse (12 VIP Gold Boxes)
 */
export const level15: LevelDef = {
  id: 15,
  name: 'Delivery Apocalypse',
  subtitle: 'Twelve VIP boxes. Every dirty trick in the book!',
  theme: 'plaza',
  containerTheme: 'vip_gold',
  startX: 1.6,
  startY: 2.0,
  goalX: 25.8,
  goalY: 2.0,
  initialStack: 12,
  platforms: [
    { id: 'l15_p1', x: 0, y: 0, w: 4.5, h: 2.0, style: 'stripe' },
    { id: 'l15_p2', x: 9.2, y: 0, w: 7.5, h: 2.0, style: 'stripe' },
    { id: 'l15_p3', x: 21.0, y: 0, w: 11.0, h: 2.0, style: 'stripe' },
  ],
  pickups: [],
  traps: [
    { id: 'l15_vanish_1', type: 'vanish', x: 5.0, y: 1.5, w: 1.6, h: 0.5, delay: 0.13 },
    { id: 'l15_vanish_2', type: 'vanish', x: 7.1, y: 1.5, w: 1.6, h: 0.5, delay: 0.13 },
    { id: 'l15_gust', type: 'gust', x: 9.6, y: 2.0, w: 5.5, h: 7.0, period: 2.6, duration: 0.85, forceX: -14.0, phase: 0.3 },
    { id: 'l15_low_vip', type: 'low_bridge', x: 13.2, y: 8.25, w: 0.9, h: 0.65, label: 'VIP' },
    { id: 'l15_popup', type: 'popup_spikes', x: 15.8, y: 2.0, w: 0.85, h: 0.85, trigger: { x: 15.1, y: 1.8, w: 1.1, h: 4.0 }, delay: 0.04 },
    { id: 'l15_conveyor', type: 'conveyor', x: 16.9, y: 1.5, w: 3.9, h: 0.5, speed: 3.8, reverseOnTrigger: true, triggerX: 18.8 },
    { id: 'l15_nuke', type: 'ceiling_drop', x: 22.8, y: 10.6, w: 1.6, h: 1.4, minY: 2.0, speed: 22.0, delay: 0.24, nuke: true, trigger: { x: 22.4, y: 2.0, w: 1.8, h: 7.5 } },
    { id: 'l15_runaway', type: 'runaway_exit', x: 25.8, y: 2.0, w: 1.5, h: 1.8, triggerDist: 3.2, targetX: 30.2, targetY: 2.0 },
    { id: 'l15_confetti', type: 'confetti_fakeout', x: 28.4, y: 2.0, w: 1.0, h: 1.0, triggerX: 27.6 },
  ],
};
