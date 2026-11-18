import {
  AIR_ACCEL,
  AIR_DECEL,
  APEX_GRAVITY_MULT,
  APEX_VY_THRESHOLD,
  CONTAINER_H,
  CONTAINER_W,
  COYOTE_TIME,
  FIXED_DT,
  GRAVITY,
  GROUND_ACCEL,
  GROUND_DECEL,
  JUMP_BUFFER,
  JUMP_CUT_MULT,
  JUMP_VEL,
  MAX_FALL_SPEED,
  MAX_SPEED,
  PLAYER_H,
  PLAYER_W,
  RESPAWN_DELAY,
  WORLD_WIDTH,
} from './constants.ts';
import { createStack, stepStack } from './stackPhysics.ts';
import type {
  InputState,
  LevelDef,
  Rect,
  SimState,
  TrapDef,
  TrapRuntime,
} from './types.ts';

function rectsOverlap(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function makeTrapRuntime(def: TrapDef): TrapRuntime {
  return {
    def,
    triggered: false,
    active: def.type === 'low_bridge' || def.type === 'conveyor' || def.type === 'moving_hazard' || def.type === 'wobble_plank' || def.type === 'trampoline' || def.type === 'gust' || def.type === 'steam_vent',
    timer: def.phase ?? 0,
    curX: def.x,
    curY: def.y,
    curW: def.w,
    curH: def.h,
    angle: 0,
    angVel: 0,
    telegraph: 0,
    reversed: false,
    gone: false,
  };
}

export function createSimState(level: LevelDef): SimState {
  return {
    level,
    phase: 'playing',
    elapsed: 0,
    failTimer: 0,
    failReason: '',
    player: {
      x: level.startX,
      y: level.startY,
      vx: 0,
      vy: 0,
      ax: 0,
      facing: 1,
      grounded: false,
      coyoteTimer: 0,
      jumpBufferTimer: 0,
      prevJumpHeld: false,
      squashX: 1,
      squashY: 1,
      runCycle: 0,
      controlsSwapTimer: 0,
    },
    stack: createStack(level.initialStack, level.startX, level.startY, 1),
    leanRatio: 0,
    inDanger: false,
    traps: level.traps.map(makeTrapRuntime),
    collectedPickups: new Set<string>(),
    goalX: level.goalX,
    goalY: level.goalY,
    events: [],
    triggeredTrapIds: new Set<string>(),
  };
}

function getPlayerRect(state: SimState): Rect {
  return {
    x: state.player.x - PLAYER_W * 0.5,
    y: state.player.y,
    w: PLAYER_W,
    h: PLAYER_H,
  };
}

function getContainerRects(state: SimState): Rect[] {
  const rects: Rect[] = [];
  for (let i = 0; i < state.stack.length; i++) {
    const c = state.stack[i];
    const h = CONTAINER_H * 0.88;
    rects.push({
      x: c.worldX - CONTAINER_W * 0.46,
      y: c.worldY - h * 0.5,
      w: CONTAINER_W * 0.92,
      h,
    });
  }
  return rects;
}

function anyBoxOverlaps(playerRect: Rect, stackRects: Rect[], target: Rect): boolean {
  if (rectsOverlap(playerRect, target)) return true;
  for (let i = 0; i < stackRects.length; i++) {
    if (rectsOverlap(stackRects[i], target)) return true;
  }
  return false;
}

function triggerFail(state: SimState, reason: string): void {
  if (state.phase !== 'playing') return;
  state.phase = 'failing';
  state.failTimer = 0;
  state.failReason = reason;
  state.events.push({
    type: 'fail',
    x: state.player.x,
    y: state.player.y + 0.8,
    reason,
  });
}

export function stepSim(state: SimState, rawInput: InputState, dt: number = FIXED_DT): void {
  state.events.length = 0;

  if (state.phase === 'failing') {
    state.failTimer += dt;
    if (state.failTimer >= RESPAWN_DELAY) {
      // Preserve triggeredTrapIds across respawns? No, each run is clean;
      // the caller tracks overall triggeredTrapIds for tests.
      const fresh = createSimState(state.level);
      Object.assign(state, fresh);
    }
    return;
  }

  if (state.phase === 'won') {
    return;
  }

  state.elapsed += dt;
  const p = state.player;

  // Controls swap timer
  let leftHeld = rawInput.left;
  let rightHeld = rawInput.right;
  if (p.controlsSwapTimer > 0) {
    p.controlsSwapTimer = Math.max(0, p.controlsSwapTimer - dt);
    const tmp = leftHeld;
    leftHeld = rightHeld;
    rightHeld = tmp;
  }

  const moveDir = (rightHeld ? 1 : 0) - (leftHeld ? 1 : 0);
  const jumpPressed = rawInput.jump && !p.prevJumpHeld;
  const jumpReleased = !rawInput.jump && p.prevJumpHeld;
  p.prevJumpHeld = rawInput.jump;

  if (jumpPressed) {
    p.jumpBufferTimer = JUMP_BUFFER;
  } else {
    p.jumpBufferTimer = Math.max(0, p.jumpBufferTimer - dt);
  }

  if (p.grounded) {
    p.coyoteTimer = COYOTE_TIME;
  } else {
    p.coyoteTimer = Math.max(0, p.coyoteTimer - dt);
  }

  // Facing flip detection
  let flippedThisFrame = false;
  if (moveDir !== 0 && moveDir !== p.facing) {
    p.facing = moveDir as 1 | -1;
    flippedThisFrame = true;
  }

  // Horizontal acceleration & deceleration
  const prevVx = p.vx;
  const targetVx = moveDir * MAX_SPEED;
  const accel = p.grounded
    ? moveDir !== 0
      ? GROUND_ACCEL
      : GROUND_DECEL
    : moveDir !== 0
      ? AIR_ACCEL
      : AIR_DECEL;

  // Conveyor surface velocity if standing on one
  let conveyorVx = 0;
  const pRectPre = getPlayerRect(state);
  for (const tr of state.traps) {
    if (tr.def.type === 'conveyor') {
      const topCheck: Rect = { x: tr.curX, y: tr.curY + tr.curH - 0.05, w: tr.curW, h: 0.15 };
      if (p.grounded && rectsOverlap(pRectPre, topCheck)) {
        conveyorVx = (tr.def.speed ?? 3.5) * (tr.reversed ? -1 : 1);
      }
    }
  }

  if (p.vx < targetVx) {
    p.vx = Math.min(targetVx, p.vx + accel * dt);
  } else if (p.vx > targetVx) {
    p.vx = Math.max(targetVx, p.vx - accel * dt);
  }

  p.ax = (p.vx - prevVx) / dt;

  // Jump execution (coyote + jump buffer)
  if (p.jumpBufferTimer > 0 && p.coyoteTimer > 0) {
    p.vy = JUMP_VEL;
    p.grounded = false;
    p.coyoteTimer = 0;
    p.jumpBufferTimer = 0;
    p.squashX = 0.78;
    p.squashY = 1.26;
    state.events.push({ type: 'jump', x: p.x, y: p.y });
  }

  // Variable jump height
  if (jumpReleased && p.vy > 0) {
    p.vy *= JUMP_CUT_MULT;
  }

  // Gravity with apex hang
  const gravMult = !p.grounded && Math.abs(p.vy) < APEX_VY_THRESHOLD ? APEX_GRAVITY_MULT : 1.0;
  p.vy = Math.max(-MAX_FALL_SPEED, p.vy - GRAVITY * gravMult * dt);

  // Build solid platform list (real platforms + active solid traps)
  const solids: Rect[] = [];
  for (const plat of state.level.platforms) {
    if (!plat.fake) {
      solids.push(plat);
    }
  }
  for (const tr of state.traps) {
    if (tr.gone) continue;
    if (tr.def.type === 'vanish') {
      solids.push({ x: tr.curX, y: tr.curY, w: tr.curW, h: tr.curH });
    } else if (tr.def.type === 'conveyor' || tr.def.type === 'trampoline') {
      solids.push({ x: tr.curX, y: tr.curY, w: tr.curW, h: tr.curH });
    }
  }

  // Move X & resolve solid X collisions
  p.x += (p.vx + conveyorVx) * dt;
  if (p.x < PLAYER_W * 0.5) {
    p.x = PLAYER_W * 0.5;
    p.vx = 0;
  } else if (p.x > WORLD_WIDTH - PLAYER_W * 0.5) {
    p.x = WORLD_WIDTH - PLAYER_W * 0.5;
    p.vx = 0;
  }

  let pRect = getPlayerRect(state);
  for (const s of solids) {
    if (rectsOverlap(pRect, s)) {
      if (p.vx + conveyorVx > 0) {
        p.x = s.x - PLAYER_W * 0.5;
      } else if (p.vx + conveyorVx < 0) {
        p.x = s.x + s.w + PLAYER_W * 0.5;
      }
      p.vx = 0;
      pRect = getPlayerRect(state);
    }
  }

  // Move Y & resolve solid Y collisions
  const wasGrounded = p.grounded;
  const preLandVy = p.vy;
  p.y += p.vy * dt;
  p.grounded = false;

  pRect = getPlayerRect(state);
  for (const s of solids) {
    if (rectsOverlap(pRect, s)) {
      if (p.vy <= 0) {
        p.y = s.y + s.h;
        p.vy = 0;
        p.grounded = true;
      } else {
        p.y = s.y - PLAYER_H;
        p.vy = 0;
      }
      pRect = getPlayerRect(state);
    }
  }

  // Tilted wobble_plank surface collision (worker stands cleanly on the sloped surface)
  for (const tr of state.traps) {
    if (tr.def.type !== 'wobble_plank') continue;
    const halfW = tr.curW * 0.5;
    const centerX = tr.curX + halfW;
    const centerY = tr.curY + tr.curH * 0.5;
    if (p.x >= tr.curX - 0.22 && p.x <= tr.curX + tr.curW + 0.22) {
      const dx = Math.max(-halfW, Math.min(halfW, p.x - centerX));
      const surfaceY = centerY + dx * Math.tan(tr.angle) + (tr.curH * 0.5) / Math.max(0.5, Math.cos(tr.angle));
      if (p.vy <= 0 && p.y >= surfaceY - 0.48 && p.y <= surfaceY + 0.22) {
        p.y = surfaceY;
        p.vy = 0;
        p.grounded = true;
        // Subtle downhill slide when plank tilts steeply
        p.vx -= Math.sin(tr.angle) * 8.5 * dt;
      }
    }
  }

  let landImpulse = 0;
  if (!wasGrounded && p.grounded && preLandVy < -2.5) {
    landImpulse = Math.min(1.8, Math.abs(preLandVy) / 10.0);
    p.squashX = 1.24;
    p.squashY = 0.78;
    state.events.push({ type: 'land', x: p.x, y: p.y });
  }

  // Recover player squash-and-stretch
  p.squashX += (1 - p.squashX) * Math.min(1, 14 * dt);
  p.squashY += (1 - p.squashY) * Math.min(1, 14 * dt);
  if (p.grounded && Math.abs(p.vx) > 0.3) {
    p.runCycle += Math.abs(p.vx) * dt * 2.2;
  }

  // Update traps & compute external wind force
  let windForceX = 0;
  pRect = getPlayerRect(state);

  for (const tr of state.traps) {
    const d = tr.def;
    switch (d.type) {
      case 'vanish': {
        if (!tr.triggered && !tr.gone) {
          const topZone: Rect = { x: tr.curX - 0.05, y: tr.curY + tr.curH - 0.05, w: tr.curW + 0.1, h: 0.2 };
          if (p.grounded && rectsOverlap(pRect, topZone)) {
            tr.triggered = true;
            tr.timer = 0;
            state.triggeredTrapIds.add(d.id);
            state.events.push({ type: 'trap_trigger', x: tr.curX + tr.curW * 0.5, y: tr.curY, trapId: d.id });
          }
        } else if (!tr.gone && !d.decoy) {
          tr.timer += dt;
          const delay = d.delay ?? 0.14;
          tr.telegraph = Math.min(1, tr.timer / delay);
          if (tr.timer >= delay) {
            tr.gone = true;
          }
        }
        break;
      }

      case 'popup_spikes': {
        const trig = d.trigger ?? { x: d.x - 0.6, y: d.y, w: d.w + 1.2, h: 3.0 };
        if (!tr.triggered && rectsOverlap(pRect, trig)) {
          tr.triggered = true;
          tr.timer = 0;
          state.triggeredTrapIds.add(d.id);
          state.events.push({ type: 'trap_trigger', x: d.x + d.w * 0.5, y: d.y, trapId: d.id });
        }
        if (tr.triggered) {
          tr.timer += dt;
          const popDelay = d.delay ?? 0.05;
          if (tr.timer >= popDelay) {
            tr.active = true;
            const grow = Math.min(1, (tr.timer - popDelay) / 0.08);
            tr.curH = d.h * grow;
          }
        }
        break;
      }

      case 'ceiling_drop': {
        const trig = d.trigger ?? { x: d.x - 0.4, y: 0, w: d.w + 0.8, h: d.y };
        if (!tr.triggered && rectsOverlap(pRect, trig)) {
          tr.triggered = true;
          tr.timer = 0;
          state.triggeredTrapIds.add(d.id);
          state.events.push({ type: 'trap_telegraph', x: d.x + d.w * 0.5, y: d.y, trapId: d.id });
        }
        if (tr.triggered) {
          tr.timer += dt;
          const delay = d.delay ?? 0.22;
          tr.telegraph = Math.min(1, tr.timer / delay);
          if (tr.timer >= delay) {
            tr.active = true;
            const minY = d.minY ?? 1.0;
            const speed = d.speed ?? 16.0;
            tr.curY = Math.max(minY, tr.curY - speed * dt);
          }
        }
        break;
      }

      case 'low_bridge': {
        // Static overhead beam; triggers tracking if player passes under/near it
        if (!tr.triggered && p.x > d.x - 0.5 && p.x < d.x + d.w + 0.5) {
          tr.triggered = true;
          state.triggeredTrapIds.add(d.id);
        }
        break;
      }

      case 'gust': {
        const period = d.period ?? 2.8;
        const duration = d.duration ?? 1.0;
        tr.timer = (tr.timer + dt) % period;
        const teleStart = period - duration - 0.4;
        const blowStart = period - duration;
        if (tr.timer >= blowStart) {
          tr.active = true;
          tr.telegraph = 1;
          if (rectsOverlap(pRect, { x: tr.curX, y: tr.curY, w: tr.curW, h: tr.curH })) {
            windForceX += d.forceX ?? -26.0;
            if (!tr.triggered) {
              tr.triggered = true;
              state.triggeredTrapIds.add(d.id);
              state.events.push({ type: 'trap_trigger', x: tr.curX + tr.curW * 0.5, y: tr.curY + 1, trapId: d.id });
            }
          }
        } else if (tr.timer >= teleStart) {
          tr.active = false;
          tr.telegraph = (tr.timer - teleStart) / 0.4;
        } else {
          tr.active = false;
          tr.telegraph = 0;
        }
        break;
      }

      case 'wobble_plank': {
        const halfW = tr.curW * 0.5;
        const center = tr.curX + halfW;
        const centerY = tr.curY + tr.curH * 0.5;
        const dx = Math.max(-halfW, Math.min(halfW, p.x - center));
        const surfaceY = centerY + dx * Math.tan(tr.angle) + (tr.curH * 0.5) / Math.max(0.5, Math.cos(tr.angle));
        const onPlank =
          p.grounded &&
          p.x >= tr.curX - 0.22 &&
          p.x <= tr.curX + tr.curW + 0.22 &&
          Math.abs(p.y - surfaceY) < 0.25;
        if (onPlank) {
          if (!tr.triggered) {
            tr.triggered = true;
            state.triggeredTrapIds.add(d.id);
            state.events.push({ type: 'trap_trigger', x: center, y: tr.curY, trapId: d.id });
          }
          const comX = p.x + p.facing * 0.35;
          const torque = (comX - center) * 1.45;
          tr.angVel += torque * dt;
        } else {
          tr.angVel += -tr.angle * 6.0 * dt;
        }
        tr.angVel *= Math.max(0, 1 - 3.5 * dt);
        tr.angle = Math.max(-0.42, Math.min(0.42, tr.angle + tr.angVel * dt));
        if (onPlank && Math.abs(tr.angle) > 0.12) {
          windForceX += Math.sin(tr.angle) * 26.0;
        }
        break;
      }

      case 'conveyor': {
        if (d.reverseOnTrigger && !tr.reversed) {
          const trigX = d.triggerX ?? d.x + d.w * 0.55;
          if (p.x >= trigX && p.y >= d.y && p.y <= d.y + d.h + 1.5) {
            tr.reversed = true;
            tr.triggered = true;
            state.triggeredTrapIds.add(d.id);
            state.events.push({ type: 'trap_trigger', x: tr.curX + tr.curW * 0.5, y: tr.curY, trapId: d.id });
          }
        } else if (!d.reverseOnTrigger && !tr.triggered && p.x >= d.x && p.x <= d.x + d.w) {
          tr.triggered = true;
          state.triggeredTrapIds.add(d.id);
        }
        break;
      }

      case 'steam_vent': {
        const period = d.period ?? 2.4;
        const duration = d.duration ?? 0.55;
        tr.timer = (tr.timer + dt) % period;
        const teleStart = period - duration - 0.35;
        const burstStart = period - duration;
        if (tr.timer >= burstStart) {
          tr.active = true;
          tr.telegraph = 1;
          if (rectsOverlap(pRect, { x: tr.curX, y: tr.curY, w: tr.curW, h: tr.curH })) {
            p.vy = Math.max(p.vy, d.impulseY ?? 14.5);
            p.grounded = false;
            windForceX += (d.forceX ?? 12.0) * p.facing;
            if (!tr.triggered) {
              tr.triggered = true;
              state.triggeredTrapIds.add(d.id);
              state.events.push({ type: 'trap_trigger', x: tr.curX + tr.curW * 0.5, y: tr.curY, trapId: d.id });
            }
          }
        } else if (tr.timer >= teleStart) {
          tr.active = false;
          tr.telegraph = (tr.timer - teleStart) / 0.35;
        } else {
          tr.active = false;
          tr.telegraph = 0;
        }
        break;
      }

      case 'trampoline': {
        const padRect: Rect = { x: tr.curX, y: tr.curY, w: tr.curW, h: tr.curH + 0.14 };
        if (p.vy <= 0 && rectsOverlap(pRect, padRect)) {
          p.vy = d.impulseY ?? 17.8;
          p.grounded = false;
          p.squashX = 0.72;
          p.squashY = 1.32;
          if (!tr.triggered) {
            tr.triggered = true;
            state.triggeredTrapIds.add(d.id);
          }
          state.events.push({ type: 'trap_trigger', x: tr.curX + tr.curW * 0.5, y: tr.curY, trapId: d.id });
        }
        break;
      }

      case 'closing_door': {
        const trigX = d.triggerX ?? d.x - 4.5;
        if (!tr.triggered && p.x >= trigX) {
          tr.triggered = true;
          state.triggeredTrapIds.add(d.id);
          state.events.push({ type: 'trap_telegraph', x: tr.curX + tr.curW * 0.5, y: tr.curY, trapId: d.id });
        }
        if (tr.triggered) {
          const minY = d.minY ?? d.y - 2.0;
          const speed = d.speed ?? 1.45;
          if (tr.curY > minY) {
            tr.curY = Math.max(minY, tr.curY - speed * dt);
            tr.curH = d.h + (d.y - tr.curY);
          }
        }
        break;
      }

      case 'fake_door': {
        if (!tr.triggered) {
          const dist = Math.hypot(p.x - (d.x + d.w * 0.5), p.y - d.y);
          if (dist < (d.triggerDist ?? 1.3)) {
            tr.triggered = true;
            tr.active = true;
            state.triggeredTrapIds.add(d.id);
            state.events.push({ type: 'trap_trigger', x: d.x, y: d.y, trapId: d.id });
            triggerFail(state, 'Fake delivery door!');
            return;
          }
        }
        break;
      }

      case 'runaway_exit': {
        if (!tr.triggered) {
          const dist = Math.hypot(p.x - state.goalX, p.y - state.goalY);
          if (dist < (d.triggerDist ?? 2.4)) {
            tr.triggered = true;
            tr.timer = 0;
            state.triggeredTrapIds.add(d.id);
            state.events.push({ type: 'trap_trigger', x: state.goalX, y: state.goalY, trapId: d.id });
          }
        } else if (tr.timer < 0.65) {
          tr.timer += dt;
          const t = Math.min(1, tr.timer / 0.65);
          const tx = d.targetX ?? state.level.goalX;
          const ty = d.targetY ?? state.level.goalY;
          state.goalX = d.x + (tx - d.x) * t;
          state.goalY = d.y + (ty - d.y) * t;
        }
        break;
      }

      case 'controls_swap': {
        if (!tr.triggered && rectsOverlap(pRect, { x: d.x, y: d.y, w: d.w, h: d.h })) {
          tr.triggered = true;
          p.controlsSwapTimer = d.duration ?? 2.1;
          state.triggeredTrapIds.add(d.id);
          state.events.push({ type: 'controls_swap', x: d.x, y: d.y, trapId: d.id });
        }
        break;
      }

      case 'moving_hazard': {
        const speed = d.speed ?? 2.6;
        tr.timer += dt * speed;
        const tx = d.targetX ?? d.x;
        const ty = d.targetY ?? d.y;
        const wave = (Math.sin(tr.timer) + 1) * 0.5;
        tr.curX = d.x + (tx - d.x) * wave;
        tr.curY = d.y + (ty - d.y) * wave;
        if (!tr.triggered && Math.abs(p.x - tr.curX) < 2.2) {
          tr.triggered = true;
          state.triggeredTrapIds.add(d.id);
        }
        break;
      }

      case 'confetti_fakeout': {
        if (!tr.triggered && p.x >= (d.triggerX ?? d.x - 1.5)) {
          tr.triggered = true;
          tr.timer = 0;
          state.triggeredTrapIds.add(d.id);
          state.events.push({ type: 'fakeout', x: d.x, y: d.y, trapId: d.id });
        }
        if (tr.triggered) {
          tr.timer += dt;
        }
        break;
      }
    }
  }

  // Step the carried stack spring-damped chain
  const wasDanger = state.inDanger;
  const stackRes = stepStack(state.stack, {
    dt,
    playerX: p.x,
    playerY: p.y,
    playerAx: p.ax,
    facing: p.facing,
    flippedThisFrame,
    landImpulse,
    windForceX,
  });

  state.leanRatio = stackRes.leanRatio;
  state.inDanger = stackRes.inDanger;
  if (!wasDanger && state.inDanger) {
    state.events.push({ type: 'stack_danger', x: p.x, y: p.y + 1.4 });
  }

  if (stackRes.tipped) {
    triggerFail(state, 'Tower tipped over!');
    return;
  }

  // Pit fall check
  if (p.y < -1.5) {
    triggerFail(state, 'Fell into the gap!');
    return;
  }

  // Pickups (including bait pickups)
  const stackRects = getContainerRects(state);
  for (const pk of state.level.pickups) {
    if (state.collectedPickups.has(pk.id)) continue;
    const pkRect: Rect = { x: pk.x - 0.35, y: pk.y - 0.35, w: 0.7, h: 0.7 };
    if (anyBoxOverlaps(pRect, stackRects, pkRect)) {
      state.collectedPickups.add(pk.id);
      const top = state.stack[state.stack.length - 1];
      for (let i = 0; i < pk.addCount; i++) {
        state.stack.push({
          offsetX: top ? top.offsetX : 0,
          velX: top ? top.velX : 0,
          squash: 1.25,
          squashVel: 0,
          worldX: top ? top.worldX : p.x,
          worldY: (top ? top.worldY : p.y + 1) + (i + 1) * CONTAINER_H,
          tilt: top ? top.tilt : 0,
        });
      }
      state.events.push({ type: 'pickup', x: pk.x, y: pk.y });
    }
  }

  // Hazard & stack-clipping checks against BOTH player and every container in the stack
  const updatedStackRects = getContainerRects(state);
  for (const tr of state.traps) {
    if (tr.gone) continue;
    const t = tr.def.type;
    if (
      (t === 'popup_spikes' && tr.active && tr.curH > 0.08) ||
      (t === 'ceiling_drop' && tr.active) ||
      t === 'low_bridge' ||
      t === 'closing_door' ||
      t === 'moving_hazard'
    ) {
      const hazRect: Rect = { x: tr.curX, y: tr.curY, w: tr.curW, h: tr.curH };
      if (anyBoxOverlaps(pRect, updatedStackRects, hazRect)) {
        triggerFail(state, `Hit ${t.replace('_', ' ')}!`);
        return;
      }
    }
  }

  // Goal check (only if runaway_exit isn't still actively scooting)
  const goalRect: Rect = { x: state.goalX - 0.75, y: state.goalY, w: 1.5, h: 1.8 };
  if (rectsOverlap(pRect, goalRect)) {
    // Make sure any runaway_exit on this level has already triggered and finished moving
    const runaway = state.traps.find((t) => t.def.type === 'runaway_exit');
    if (!runaway || (runaway.triggered && runaway.timer >= 0.65)) {
      state.phase = 'won';
      state.events.push({ type: 'win', x: state.goalX, y: state.goalY });
    }
  }
}
