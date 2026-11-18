/**
 * Color palette sampled directly from the reference art (/reference/reference.png).
 * Warm cream/beige surfaces, tomato red trim, saturated orange containers,
 * and soft pastel accents with no harsh blacks.
 */
export const PALETTE = {
  // Floor & architectural neutrals
  creamLight: 0xeadacb,
  creamWarm: 0xe0ccb5,
  creamRim: 0xfaf4ea,
  apronWhite: 0xfaf6f0,
  letterbox: '#241c1a',

  // Worker & dark accents (charcoal espresso, never pure #000000)
  charcoal: 0x1d1a1b,
  espresso: 0x592a23,
  slate: 0x5e5956,
  warmShadow: 0x9e886d,

  // Tomato red & white trim
  tomatoRed: 0xea362b,
  deepRed: 0x9b2c20,
  coralRed: 0xd56355,

  // Saturated food containers
  orangeTub: 0xdc5e1d,
  orangeBright: 0xee8f20,
  goldenCrust: 0xe09d5e,
  pizzaBoxTan: 0xe6c79c,
  goldVip: 0xf5b82e,

  // Pastel pops
  skyBlue: 0xaccac9,
  skyTeal: 0x6b979e,
  bubblegumPink: 0xf4a2dd,
  sageMint: 0xb2ccb7,
  dustyRose: 0xd8b0a5,
  mustard: 0xeeb342,

  // Hazard / UI accents
  dangerAmber: 0xff9f1c,
  hazardStripe: 0x2b2422,
  steamWhite: 0xf7f2eb,
} as const;

export const PALETTE_CSS = {
  creamLight: '#EADACB',
  creamWarm: '#E0CCB5',
  creamRim: '#FAF4EA',
  charcoal: '#1D1A1B',
  tomatoRed: '#EA362B',
  deepRed: '#9B2C20',
  orangeTub: '#DC5E1D',
  orangeBright: '#EE8F20',
  skyBlue: '#ACCAC9',
  bubblegumPink: '#F4A2DD',
  sageMint: '#B2CCB7',
} as const;
