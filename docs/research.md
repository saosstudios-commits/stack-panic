# Stack Panic — Phase 0 Research

**Genre:** Comedic 3D-rendered, side-view 2D troll platformer  
**Core Pitch:** You are a tiny delivery worker carrying an absurdly tall, wobbly tower of food containers held out *in front* of your body across a single fixed-screen diorama. The tower is both your delivery goal and your biggest physical liability.

---

## 1. Level Devil Analysis: Why It Is Funny & Fair

*Level Devil* ("NOT A Troll Game") succeeds because it weaponizes classic platformer muscle memory for slapstick comedy rather than mean-spirited difficulty ([Fandom](https://level-devil.fandom.com/wiki/Level_Devil_Wiki), [Geeks vs Geeks](https://www.geeksvsgeeks.com/level-devil-review/), [Gfinity Esports](https://www.gfinityesports.com/guides/level-devil/)).

### Key Patterns Extracted
1. **Hyper-Simple Controls:** Move left/right + jump. Because movement is crisp and predictable, every death feels like you walked into a punchline, never like the controls failed you ([MiniReview](https://minireview.io/platform/level-devil-not-a-troll-game)).
2. **Single-Screen Readability:** Every level fits on one fixed screen. You can see the exit door from frame 1, which creates immediate confidence—and immediate comedic betrayal when the path to it lies.
3. **One New Gag Every ~5 Seconds:** Short 20–45s levels pack 6–10 distinct beats so momentum never stalls.
4. **Hindsight Fairness & Instant Restart:** Traps are deterministic. First encounter teaches the gag via a sudden slapstick death; instant respawn (<600ms) turns frustration into "oh, you got me!" laughter, and the second attempt is cleanly beatable.
5. **Classic Troll Vocabulary:**
   - Invisible trigger zones (spikes or pits activating only once you commit to a jump).
   - Vanishing/sliding floors that wait until mid-jump or touchdown.
   - Spikes popping out of walls or landing spots.
   - Fake exits, exits that run away or swap sides, and "safe" platforms that collapse.
   - Bait pickups that look helpful but trigger a hazard.
   - Ceiling drops and closing doorways.

---

## 2. Arcade Delivery Games (*Pizza Ready!*, *Burger Please!*)

Hyper-casual arcade hits by Supercent ([ArpuBrothers](https://arpubrothers.com/)) establish an instantly appealing tactile visual language:
- **Chunky Toy Proportions:** Oversized rounded heads, minimalist dot eyes, stubby limbs, crisp uniforms (red visor, white apron).
- **Front-Carried Tower Silhouette:** The worker holds a tall, uniform column of containers out in front of their chest with both arms wrapped around the base.
- **Appetizing Warm Palette:** Warm cream/beige surfaces (`#EADACB`, `#E0CCB5`), tomato red (`#EA362B`), saturated orange (`#DC5E1D`, `#EE8F20`), and pastel accents (sky blue `#ACCAC9`, bubblegum pink `#F4A2DD`, sage `#B2CCB7`) with soft shadows and no harsh blacks.
- **Tactile Juice:** Containers visibly bob, squash, and cascade when carried, and hop off one-by-one onto the delivery counter on completion.

---

## 3. Technical & Game-Feel References

### Platformer Feel Trifecta
To ensure deaths feel like *trap* comedy rather than stiff physics ([Game Maker's Toolkit / Platformer Feel](https://www.youtube.com/watch?v=2S3g8g2v1rE), [Mekai Games](https://mekaigames.com/)):
- **Coyote Time (~0.10s / 6 frames):** Allows jumping briefly after walking off a ledge.
- **Jump Buffering (~0.09s / 5–6 frames):** Queues a jump pressed right before landing.
- **Variable Jump Height:** Releasing jump early while ascending cuts upward velocity for tight low hops.
- **Apex Gravity Hang:** Slightly reduced gravity near `vy ≈ 0` for readable air control.

### Wobbly Carried Stack Simulation
- **Live Stack (Deterministic Spring-Damped Chain):** Modeling each container `i` as a 2D spring-damper / inverted-pendulum node driven by player horizontal acceleration, vertical jump/land impulses, wall bumps, and wind/trap forces keeps simulation 100% deterministic, zero-allocation, and cheap at 60Hz. Each container's lateral offset `x_i`, velocity `vx_i`, tilt `theta_i`, and squash `s_i` cascade up the tower: higher stacks naturally amplify sway and topple faster.
- **Failure Scatter (Rigid-Body Burst):** Only on failure, we spawn pooled `cannon-es` rigid bodies (z-constrained to stay readable in the diorama) matching the live stack's positions/velocities so containers explode comically across the screen during a brief slow-mo beat before snapping back in <600ms.

### Three.js Toy Diorama Rendering
- **Orthographic Camera with Slight Constant Tilt:** Fixed camera looking along `-Z` with ~8° pitch down and ~4° yaw gives platforms and containers real 3D depth and soft contact shadows while preserving exact 2D side-view Level Devil alignment.
- **Toon Shading + Soft Outlines:** `THREE.MeshToonMaterial` with a custom 3-band procedural `DataTexture` gradient map + subtle rim/outline pass (`BackSide` hull) and `PCFSoftShadowMap` directional sun + hemisphere fill produces the clean toy-set aesthetic without harsh blacks.

---

## 4. Design Pillars

1. **The Tower Is the Punchline:** Because the stack sits *in front* of the worker and rises above their head, traps target the tower's height, reach, and sway—not just the player's hitbox.
2. **Instant Slapstick, Zero Friction:** <600ms respawn, zero-latency restarts, deterministic 60Hz physics, and comical rigid-body food explosions make every death entertaining.
3. **Hindsight-Fair Deception:** Every trap is deterministic, never kills on the first possible action after respawn, and gives a subtle tell or clear rule once seen.
4. **Tactile Toy Diorama:** Bright warm palette, extruded 3D blocks, reactive eyes/sweat drops, and procedural WebAudio foley make the game feel like a living toy set.

---

## 5. Trap Catalogue (Original + Stack-Focused)

| Trap | Category | How It Targets the Worker / Stack | Tell / Hindsight Fairness |
| :--- | :--- | :--- | :--- |
| **Low Bridge** | Stack Height | Overhead beam safe for the worker's head, but clips the top containers of an upright stack (must duck-hop/lean or time a sway). | Visible warning stripes on beam bottom. |
| **Gust Alley** | Stack Sway | Periodic wind blasts shove the tower horizontally, threatening to exceed the tip threshold unless countered. | Swirl particles + telegraph whistle 0.4s before peak. |
| **Wobble Plank** | Stack Weight | Seesaw bridge tilts aggressively under the combined torque of the worker + front-heavy stack. | Central pivot pin visible. |
| **Vanishing Floor** | Classic Betrayal | Tile drops out 0.12s after contact or mid-jump. | Hairline crack / subtle tremor when stepped on. |
| **Fake Delivery Door** | Classic Betrayal | Identical delivery counter/door that slams shut or springs a boxing-glove/spike when approached. | Slightly crooked "OPEN?" sign or flickering bulb. |
| **Floor Never There** | Classic Betrayal | Looks like solid tile, player falls straight through. | Slightly lighter matte shade in hindsight. |
| **Popup Spikes** | Trigger Zone | Hidden spikes shoot up at a landing zone when player crosses an X-trigger. | Faint floor seam; avoidable by short-hopping or baiting. |
| **Ceiling Press** | Stack Height | Overhead slab drops when player passes under, crushing tall stacks first. | Dust particles fall 0.25s before drop. |
| **Bait Pickup** | Greed Trap | Extra container pickup sits over a trap or pushes stack height past a low doorway ahead. | Suspiciously generous placement. |
| **Steam Vent** | Timing / Impulse | Kitchen/alley vent blasts upward, launching the stack into a spin or into ceiling hazards. | Hissing valve glow 0.35s before burst. |
| **Conveyor Reversal** | Momentum / Sway | Belt suddenly flips direction mid-run, whipping the stack forward/back into tip-over. | Flashing arrow light on belt side. |
| **Closing Doorway** | Stack Height | Delivery shutter slowly lowers as you approach—tall stacks clip the lintel unless you hurry or time the bounce. | Shutter motor hum + descending teeth. |
| **Exit Swap / Runaway** | Classic Betrayal | Real delivery door scoots away or swaps to the opposite side when you get close. | Wheels under the counter! |
| **Trampoline Betrayal** | Impulse / Ceiling | Bounce pad launches you straight into overhead spikes unless you steer out mid-air. | Coiled red spring pad. |
| **Controls-Swap Sign** | Mind Game | Brief 2.5s left/right reversal when passing a spinning "DETOUR" sign. | Bright spinning arrow sign + audio sting. |
