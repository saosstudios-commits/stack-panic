# Stack Panic

A 3D-rendered, side-view 2D troll platformer inspired by *Level Devil* and arcade delivery games. Carry an absurdly tall, spring-physics-driven tower of food containers out in front of your worker across 5 single-screen diorama levels packed with traps that target your stack's height, reach, and sway.

## Quick Start

```bash
npm install
npm run dev        # Start Vite dev server
npm run build      # TypeScript check + production bundle
npm run preview    # Preview production build
npm run test:levels # Run headless deterministic replay tests for all 5 levels & traps
```

## Controls

- **Move:** `A` / `D` or `Left` / `Right` Arrow
- **Jump:** `Space` / `W` / `Up` Arrow (release early for a short tap-hop!)
- **Restart:** `R`
- **Pause:** `Esc`
- **Mute:** `M`
- **Touch:** On-screen Left / Right / Jump buttons (landscape-first; portrait displays a rotate prompt).

## Architecture

- `src/sim/` — Pure TypeScript deterministic 60Hz platformer & spring-damped stack simulation (zero Three.js or DOM imports).
- `src/levels/` — Data-driven `LevelDef` files (`level1.ts`–`level5.ts`).
- `src/render/` — Three.js orthographic diorama renderer, toon materials, procedural textures, pooled `cannon-es` scatter physics on failure, and instanced particles.
- `src/audio/` — Procedural WebAudio synthesizer.
- `src/input/` — Keyboard + multi-touch pointer manager.
- `src/state/` — `localStorage` persistence with in-memory fallback.
- `src/ui/` — Title, HUD, Pause, Level Complete, and Finale overlays.

## Adding a Trap or Level

1. **Add a Trap:** Add the new `TrapType` to `src/sim/types.ts`, implement its behavior in `stepSim` (`src/sim/simulation.ts`), add its 3D mesh & `syncTrapVisual` case in `src/render/levelBuilder.ts`, and reference it in a level's `traps` array.
2. **Add a Level:** Create `src/levels/levelN.ts` exporting a `LevelDef` on the `32 × 18` grid, register it in `src/levels/index.ts`, and add a win replay + trap replays in `tests/runLevels.ts`.
