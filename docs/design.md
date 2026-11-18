# Stack Panic — Phase 1 Design Document

## 1. Overview & Controls
- **Title:** *Stack Panic*
- **Scope:** 5 single-screen levels, 6–10 traps each, 20–45s optimal clear time per level.
- **Keyboard:** `A/D` or `Left/Right` to move; `W/Up/Space` to jump (variable height on release); `R` instant restart; `Esc` pause; `M` mute toggle.
- **Touch:** Large on-screen Left / Right / Jump buttons (`touch-action: none`, multi-touch pointer tracking, no scroll/zoom). Portrait mode displays a friendly "Rotate your device" overlay.

---

## 2. Camera & World Grid
- **Grid:** `32 × 18` units (`x ∈ [0, 32]`, `y ∈ [0, 18]`), exact `16:9` aspect ratio, `z = 0` gameplay plane.
- **Fixed Orthographic Camera:** Centered on `(16, 9, 0)` with half-height `9` and half-width `16`. Constant tilt: `CAMERA_PITCH_DEG = 7.5°` down, `CAMERA_YAW_DEG = 4.0°` yaw. No scrolling, no zoom, no follow-cam. Screen shake is additive offset only.
- **Diorama Depth:** Platforms extruded `z ∈ [-0.6, +0.6]`; backdrop wall at `z = -2.4` with themed props in `z ∈ [-2.0, -0.8]`. Nothing in `z > 0.7` occludes gameplay.

---

## 3. Simulation & Stack Physics (`src/sim/`)
Pure TypeScript, zero DOM/Three.js imports, fixed `DT = 1/60`s:
- **Worker Movement:**
  - Hitbox: `0.72 × 1.15` units.
  - `MAX_SPEED = 7.8`, `GROUND_ACCEL = 58`, `GROUND_DECEL = 68`, `AIR_ACCEL = 38`, `AIR_DECEL = 18`.
  - `JUMP_VEL = 13.4`, `GRAVITY = 34.0`, `APEX_GRAVITY_MULT = 0.65` (`|vy| < 2.0`), `JUMP_CUT_MULT = 0.48`.
  - `COYOTE_TIME = 0.10s`, `JUMP_BUFFER = 0.09s`.
- **Spring-Damped Stack Chain:**
  - Anchor in front of worker: `(x + facing * 0.52, y + 0.62)`.
  - `N` containers (`height = 0.34`, `width = 0.60`), each with `offsetX`, `velX`, `squash`, `squashVel`.
  - Inertial coupling from `-player.ax`, direction-flip whip impulse, landing squash cascade, and wind/trap forces.
  - **Danger & Tip Threshold:** `leanRatio = |topOffsetX| / (0.85 + N * 0.09)`. At `leanRatio >= 0.65`, worker panics (wide eyes + sweat drop). At `leanRatio >= 1.0`, stack tips -> Fail!
  - **Container Hitboxes:** Every container has a world AABB checked against traps, spikes, low beams, and closing doorways.
- **Fail & Scatter Burst:**
  - On fail, `cannon-es` spawns `N` pooled rigid bodies matching the live containers' positions/velocities + radial burst, constrained near `z = 0`.
  - `0.18s` slow-mo (`0.28x`) + screen shake, total respawn time `0.52s` (`< 600ms`).

---

## 4. Art Direction & Palette (`src/render/palette.ts`)
Sampled directly from `/reference/reference.png`:
- Cream/Beige Floor: `#EADACB`, `#E0CCB5`
- Tomato Red: `#EA362B`, Deep Red: `#9B2C20`
- Saturated Orange Tubs: `#DC5E1D`, Golden Top: `#EE8F20`, Cream Rim: `#FAF4EA`
- Worker Charcoal: `#1D1A1B`, Apron: `#FAF6F0`, Visor: `#EA362B`
- Pastel Accents: Sky Blue `#ACCAC9` / `#6B979E`, Bubblegum Pink `#F4A2DD`, Sage `#B2CCB7`, Mustard `#E09D5E`
- Toon shading (`MeshToonMaterial` + 3-band procedural gradient map), subtle `BackSide` outlines, soft `PCFSoftShadowMap` directional sun + hemisphere light, and blob shadows.

---

## 5. Level & Trap Architecture (`src/levels/`)
Data-driven `LevelDef` with `platforms`, `traps` (trigger/condition/action components), `pickups`, `start`, `goal`, `stackCount`, `theme`.
1. **L1 Street Corner** (3 Orange Tubs, 7 traps): Fake Curb, Vanishing Curb, Low Awning (tap-jump), Popup Spikes, Bait Pickup, Fake Delivery Door, Falling Sign.
2. **L2 Pizza Kitchen** (5 Pizza Boxes, 7 traps): Conveyor Reversal, Vanishing Prep Table, Steam Vent, Flying Tray, Low Exhaust Hood, Oven Ceiling Press, Fake Order Window.
3. **L3 Rooftops** (7 Striped Buckets, 7 traps): Gust Alley, Wobble Plank, Collapsing Shingles, Trampoline Betrayal, Chimney Ceiling Drop, Low Clothesline, Runaway Exit.
4. **L4 Alley / Sewer** (9 Orange Tubs, 8 traps): Controls-Swap Sign, Closing Shutter Doorway, Popup Spikes, Alley Draft Gust, Wobble Pipe, Fake Grate, Bait Pickup, Steam Vent.
5. **L5 Delivery Gauntlet** (12 Golden VIP Boxes, 9 traps): Rapid Vanishing Steps, Conveyor Reversal, Strong Gust Alley, Low VIP Banner, Trampoline Betrayal, Ceiling Press, Closing VIP Gate, Exit Swap, Final Confetti Fake-Out.

---

## 6. Audio, UI & Persistence
- **WebAudio (`src/audio/`):** Procedural synthesis for jump, land, container tick/wobble, trap sting, scatter burst, delivery hop chime, UI click, and light ambient loop. Unlocked on first gesture; mute persisted.
- **UI (`src/ui/`):** Title screen (Play, Level Select once unlocked, Settings/Mute), HUD (Level name, Death counter with pop, Stack height meter, Pause/Mute/Restart buttons), Pause menu, Level Complete card, Finale screen, and rotating-device portrait overlay. Taunting one-liners at 5/10/20 deaths per level.
- **Persistence:** `localStorage` with `try/catch` and in-memory fallback for unlocked level, deaths per level & total, best times, and mute setting.
