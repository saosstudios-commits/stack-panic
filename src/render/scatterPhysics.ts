import * as CANNON from 'cannon-es';
import { CONTAINER_H, CONTAINER_W } from '../sim/constants.ts';
import type { ContainerNode, LevelDef } from '../sim/types.ts';

const MAX_POOLED_BODIES = 16;

/**
 * Pooled rigid-body scatter system using cannon-es.
 * Dormant during normal play; activates only on failure to scatter the carried stack
 * comically across the diorama plane.
 */
export class ScatterPhysics {
  private world: CANNON.World;
  private pool: CANNON.Body[] = [];
  private levelBodies: CANNON.Body[] = [];
  private activeCount = 0;

  constructor() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -28, 0);
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);

    const boxShape = new CANNON.Box(
      new CANNON.Vec3(CONTAINER_W * 0.48, CONTAINER_H * 0.48, CONTAINER_W * 0.48)
    );

    for (let i = 0; i < MAX_POOLED_BODIES; i++) {
      const body = new CANNON.Body({
        mass: 1,
        shape: boxShape,
        linearDamping: 0.08,
        angularDamping: 0.12,
      });
      body.sleep();
      this.pool.push(body);
    }
  }

  setLevelPlatforms(level: LevelDef): void {
    for (const b of this.levelBodies) {
      this.world.removeBody(b);
    }
    this.levelBodies.length = 0;

    for (const p of level.platforms) {
      if (p.fake) continue;
      const shape = new CANNON.Box(new CANNON.Vec3(p.w * 0.5, p.h * 0.5, 1.2));
      const body = new CANNON.Body({
        mass: 0,
        shape,
        position: new CANNON.Vec3(p.x + p.w * 0.5, p.y + p.h * 0.5, 0),
      });
      this.world.addBody(body);
      this.levelBodies.push(body);
    }
  }

  triggerBurst(stack: ContainerNode[], playerVx: number, playerVy: number): void {
    this.clearActive();
    const count = Math.min(stack.length, MAX_POOLED_BODIES);
    this.activeCount = count;

    for (let i = 0; i < count; i++) {
      const node = stack[i];
      const body = this.pool[i];
      body.position.set(node.worldX, node.worldY, (i % 2 === 0 ? 1 : -1) * 0.05);
      body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), node.tilt);

      const spread = ((i - count * 0.5) / Math.max(1, count)) * 8.5;
      const burstX = playerVx * 0.65 + spread + (Math.sin(i * 2.7) * 3.5);
      const burstY = Math.max(3.5, playerVy * 0.4 + 5.5 + i * 0.45);
      const burstZ = Math.cos(i * 1.9) * 1.4;

      body.velocity.set(burstX, burstY, burstZ);
      body.angularVelocity.set(
        Math.sin(i * 1.7) * 5,
        Math.cos(i * 2.3) * 4,
        (i % 2 === 0 ? 1 : -1) * (7 + i * 0.8)
      );
      body.wakeUp();
      this.world.addBody(body);
    }
  }

  step(dt: number): void {
    if (this.activeCount === 0) return;
    this.world.step(1 / 60, dt, 3);
    // Keep Z constrained near gameplay plane so containers stay readable
    for (let i = 0; i < this.activeCount; i++) {
      const b = this.pool[i];
      if (b.position.z > 1.1) {
        b.position.z = 1.1;
        b.velocity.z *= -0.4;
      } else if (b.position.z < -0.5) {
        b.position.z = -0.5;
        b.velocity.z *= -0.4;
      }
    }
  }

  getBody(index: number): CANNON.Body | null {
    if (index < 0 || index >= this.activeCount) return null;
    return this.pool[index];
  }

  clearActive(): void {
    for (let i = 0; i < this.activeCount; i++) {
      this.world.removeBody(this.pool[i]);
    }
    this.activeCount = 0;
  }
}
