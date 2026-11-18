import {
  CONTAINER_H,
  DANGER_RATIO,
  STACK_ANCHOR_X,
  STACK_ANCHOR_Y,
  STACK_DAMPING,
  STACK_FLIP_WHIP,
  STACK_INERTIA,
  STACK_STIFFNESS,
  TIP_BASE,
  TIP_PER_BOX,
} from './constants.ts';
import type { ContainerNode } from './types.ts';

export function createStack(count: number, playerX: number, playerY: number, facing: 1 | -1): ContainerNode[] {
  const anchorX = playerX + facing * STACK_ANCHOR_X;
  const anchorY = playerY + STACK_ANCHOR_Y;
  const nodes: ContainerNode[] = [];
  for (let i = 0; i < count; i++) {
    nodes.push({
      offsetX: 0,
      velX: 0,
      squash: 1,
      squashVel: 0,
      worldX: anchorX,
      worldY: anchorY + i * CONTAINER_H + CONTAINER_H * 0.5,
      tilt: 0,
    });
  }
  return nodes;
}

export interface StackStepParams {
  dt: number;
  playerX: number;
  playerY: number;
  playerAx: number;
  facing: 1 | -1;
  flippedThisFrame: boolean;
  landImpulse: number;
  windForceX: number;
}

export interface StackStepResult {
  leanRatio: number;
  inDanger: boolean;
  tipped: boolean;
}

/**
 * Deterministic spring-damped chain for the carried container tower.
 * Each container couples to the one below it (or the worker's hands for index 0),
 * with progressive lag and whip toward the top.
 */
export function stepStack(stack: ContainerNode[], p: StackStepParams): StackStepResult {
  const n = stack.length;
  if (n === 0) {
    return { leanRatio: 0, inDanger: false, tipped: false };
  }

  const anchorX = p.playerX + p.facing * STACK_ANCHOR_X;
  const anchorY = p.playerY + STACK_ANCHOR_Y;

  let curY = anchorY;
  const heightScale = 1 + (n - 3) * 0.035;

  for (let i = 0; i < n; i++) {
    const node = stack[i];
    const prevOffset = i === 0 ? 0 : stack[i - 1].offsetX;
    const prevVel = i === 0 ? 0 : stack[i - 1].velX;

    // Higher containers have slightly softer springs so sway cascades naturally
    const levelFactor = 1 / (1 + i * 0.045);
    const stiffness = STACK_STIFFNESS * levelFactor / Math.max(0.85, heightScale * 0.85);
    const damping = STACK_DAMPING * (1 - i * 0.015);

    // Inertial force from player acceleration + external wind (stronger higher up)
    const inertiaAccel = -p.playerAx * STACK_INERTIA * (1 + i * 0.08);
    const windAccel = p.windForceX * (0.65 + (i / Math.max(1, n)) * 1.1);

    const springForce = (prevOffset - node.offsetX) * stiffness;
    const dampForce = (prevVel - node.velX) * damping;

    if (p.flippedThisFrame) {
      node.velX += p.facing * STACK_FLIP_WHIP * (0.5 + i * 0.16);
    }

    if (p.landImpulse > 0) {
      // Landing ripples a squash wave + subtle forward wobble up the stack
      node.squashVel -= p.landImpulse * (0.28 + i * 0.025);
      node.velX += p.facing * p.landImpulse * 0.06 * (i + 1);
    }

    const totalAccel = springForce + dampForce + inertiaAccel + windAccel;
    node.velX += totalAccel * p.dt;
    node.offsetX += node.velX * p.dt;

    // Squash-and-stretch spring per container
    const squashForce = (1.0 - node.squash) * 240.0 - node.squashVel * 14.0;
    node.squashVel += squashForce * p.dt;
    node.squash += node.squashVel * p.dt;
    if (node.squash < 0.62) node.squash = 0.62;
    if (node.squash > 1.32) node.squash = 1.32;

    const h = CONTAINER_H * node.squash;
    node.worldX = anchorX + node.offsetX;
    node.worldY = curY + h * 0.5;
    // Tilt proportional to relative offset from container below
    const rel = node.offsetX - prevOffset;
    node.tilt = Math.max(-0.55, Math.min(0.55, -rel * 1.85 - node.offsetX * 0.16));

    curY += h;
  }

  const topOffset = Math.abs(stack[n - 1].offsetX);
  const tipLimit = TIP_BASE + n * TIP_PER_BOX;
  const leanRatio = topOffset / tipLimit;

  return {
    leanRatio,
    inDanger: leanRatio >= DANGER_RATIO,
    tipped: leanRatio >= 1.0,
  };
}
