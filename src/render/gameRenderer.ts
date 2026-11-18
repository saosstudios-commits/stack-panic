import * as THREE from 'three';
import {
  CAMERA_DISTANCE,
  CAMERA_PITCH_DEG,
  CAMERA_YAW_DEG,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from '../sim/constants.ts';
import type { LevelDef, SimState } from '../sim/types.ts';
import { buildLevelScene, syncTrapVisual, type BuiltLevel } from './levelBuilder.ts';
import { PALETTE } from './palette.ts';
import { ScatterPhysics } from './scatterPhysics.ts';
import { buildContainerPool, buildWorkerRig, type ContainerPool, type WorkerRig } from './workerMesh.ts';

interface Particle {
  active: boolean;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  size: number;
  color: THREE.Color;
}

const MAX_PARTICLES = 96;

export class GameRenderer {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private baseCamPos = new THREE.Vector3();
  private camTarget = new THREE.Vector3(WORLD_WIDTH * 0.5, WORLD_HEIGHT * 0.5, 0);

  private worker: WorkerRig;
  private containerPool: ContainerPool | null = null;
  private builtLevel: BuiltLevel | null = null;
  private scatter: ScatterPhysics;

  private particleMesh: THREE.InstancedMesh;
  private particles: Particle[] = [];
  private dummy = new THREE.Object3D();

  private shakeIntensity = 0;
  private winDeliverTimer = 0;
  private prevFailPhase = false;
  private deathMode: 'none' | 'dismantle' | 'explode' = 'none';
  private deathTimer = 0;
  private explosionMesh: THREE.Mesh;
  private explosionRing: THREE.Mesh;
  private limbVels: Array<{ obj: THREE.Object3D; vx: number; vy: number; vz: number; rx: number; rz: number }> = [];

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(PALETTE.creamLight);

    // Fixed Orthographic Camera (Level Devil framing with slight constant 3D tilt)
    const halfW = WORLD_WIDTH * 0.5;
    const halfH = WORLD_HEIGHT * 0.5;
    this.camera = new THREE.OrthographicCamera(-halfW, halfW, halfH, -halfH, 0.5, 100);

    const pitch = THREE.MathUtils.degToRad(CAMERA_PITCH_DEG);
    const yaw = THREE.MathUtils.degToRad(CAMERA_YAW_DEG);
    const offset = new THREE.Vector3(
      Math.sin(yaw) * CAMERA_DISTANCE,
      Math.sin(pitch) * CAMERA_DISTANCE,
      Math.cos(pitch) * Math.cos(yaw) * CAMERA_DISTANCE
    );
    this.baseCamPos.copy(this.camTarget).add(offset);
    this.camera.position.copy(this.baseCamPos);
    this.camera.lookAt(this.camTarget);

    // Warm bright toy lighting (zero harsh blacks)
    const hemi = new THREE.HemisphereLight(0xfffcf5, 0xe8d8c3, 1.28);
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff8eb, 1.45);
    sun.position.set(18, 28, 18);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -20;
    sun.shadow.camera.right = 20;
    sun.shadow.camera.top = 15;
    sun.shadow.camera.bottom = -15;
    sun.shadow.camera.near = 2;
    sun.shadow.camera.far = 65;
    sun.shadow.bias = -0.001;
    sun.target.position.set(16, 6, 0);
    this.scene.add(sun);
    this.scene.add(sun.target);

    this.worker = buildWorkerRig();
    this.scene.add(this.worker.root);

    // Cartoonish explosion fireball & shockwave ring for explosive deaths
    const expGeo = new THREE.SphereGeometry(0.9, 14, 12);
    const expMat = new THREE.MeshBasicMaterial({ color: PALETTE.orangeBright, transparent: true, opacity: 0.9 });
    this.explosionMesh = new THREE.Mesh(expGeo, expMat);
    this.explosionMesh.visible = false;
    this.scene.add(this.explosionMesh);

    const ringGeo = new THREE.RingGeometry(0.65, 1.0, 20);
    const ringMat = new THREE.MeshBasicMaterial({ color: PALETTE.tomatoRed, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
    this.explosionRing = new THREE.Mesh(ringGeo, ringMat);
    this.explosionRing.visible = false;
    this.scene.add(this.explosionRing);

    this.scatter = new ScatterPhysics();

    // Pooled instanced particle mesh (steam, dust, confetti)
    const pGeo = new THREE.BoxGeometry(0.18, 0.18, 0.18);
    const pMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.particleMesh = new THREE.InstancedMesh(pGeo, pMat, MAX_PARTICLES);
    this.particleMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.particleMesh.frustumCulled = false;
    this.scene.add(this.particleMesh);

    for (let i = 0; i < MAX_PARTICLES; i++) {
      this.particles.push({
        active: false,
        x: 0,
        y: -100,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        life: 0,
        maxLife: 1,
        size: 1,
        color: new THREE.Color(0xffffff),
      });
      this.dummy.position.set(0, -100, 0);
      this.dummy.scale.setScalar(0);
      this.dummy.updateMatrix();
      this.particleMesh.setMatrixAt(i, this.dummy.matrix);
      this.particleMesh.setColorAt(i, new THREE.Color(0xffffff));
    }
  }

  loadLevel(level: LevelDef): void {
    if (this.builtLevel) {
      this.scene.remove(this.builtLevel.group);
      this.builtLevel.dispose();
    }
    if (this.containerPool) {
      for (const m of this.containerPool.meshes) {
        this.scene.remove(m);
      }
      this.containerPool.dispose();
    }

    this.builtLevel = buildLevelScene(level);
    this.scene.add(this.builtLevel.group);

    this.containerPool = buildContainerPool(level.containerTheme, 16);
    for (const m of this.containerPool.meshes) {
      this.scene.add(m);
    }

    this.scatter.setLevelPlatforms(level);
    this.scatter.clearActive();
    this.prevFailPhase = false;
    this.winDeliverTimer = 0;
  }

  addShake(amount: number): void {
    this.shakeIntensity = Math.min(0.65, Math.max(this.shakeIntensity, amount));
  }

  spawnParticles(
    x: number,
    y: number,
    count: number,
    colorHex: number,
    speed = 4.5,
    gravity = -12
  ): void {
    let spawned = 0;
    for (let i = 0; i < MAX_PARTICLES && spawned < count; i++) {
      const p = this.particles[i];
      if (p.active) continue;
      p.active = true;
      p.x = x + (Math.random() - 0.5) * 0.4;
      p.y = y + (Math.random() - 0.5) * 0.4;
      p.z = (Math.random() - 0.5) * 0.5;
      const angle = Math.random() * Math.PI * 2;
      const mag = (0.4 + Math.random() * 0.6) * speed;
      p.vx = Math.cos(angle) * mag;
      p.vy = Math.sin(angle) * mag + (gravity < 0 ? 2.5 : 0);
      p.vz = (Math.random() - 0.5) * 2.0;
      p.life = 0;
      p.maxLife = 0.35 + Math.random() * 0.45;
      p.size = 0.7 + Math.random() * 0.9;
      p.color.setHex(colorHex);
      spawned++;
    }
  }

  resize(width: number, height: number): void {
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  }

  render(sim: SimState, realDt: number): void {
    // Handle fail scatter transition (dismantle vs explosive death)
    if (sim.phase === 'failing' && !this.prevFailPhase) {
      this.prevFailPhase = true;
      this.deathTimer = 0;
      const isExplosive =
        sim.failReason.includes('spike') ||
        sim.failReason.includes('ceiling') ||
        sim.failReason.includes('Fake') ||
        sim.failReason.includes('moving');
      this.deathMode = isExplosive ? 'explode' : 'dismantle';
      this.scatter.triggerBurst(sim.stack, sim.player.vx, sim.player.vy);

      if (this.deathMode === 'explode') {
        this.addShake(0.62);
        this.worker.bodyGroup.visible = false;
        this.explosionMesh.visible = true;
        this.explosionRing.visible = true;
        this.explosionMesh.position.set(sim.player.x, sim.player.y + 0.65, 0.2);
        this.explosionRing.position.set(sim.player.x, sim.player.y + 0.65, 0.25);
        this.spawnParticles(sim.player.x, sim.player.y + 0.7, 22, PALETTE.tomatoRed, 8.5);
        this.spawnParticles(sim.player.x, sim.player.y + 0.7, 18, PALETTE.orangeBright, 7.0);
        this.spawnParticles(sim.player.x, sim.player.y + 0.7, 10, PALETTE.charcoal, 5.5);
      } else {
        this.addShake(0.42);
        const parts = [
          this.worker.headGroup,
          this.worker.torsoGroup,
          this.worker.leftArm,
          this.worker.rightArm,
          this.worker.leftLeg,
          this.worker.rightLeg,
        ];
        this.limbVels = parts.map((obj, idx) => ({
          obj,
          vx: (idx % 2 === 0 ? 1 : -1) * (2.5 + idx * 0.9),
          vy: 4.5 + (idx % 3) * 2.2,
          vz: (idx - 2.5) * 0.6,
          rx: (idx % 2 === 0 ? 1 : -1) * 8,
          rz: (idx % 2 === 0 ? -1 : 1) * 11,
        }));
        this.spawnParticles(sim.player.x, sim.player.y + 0.9, 14, PALETTE.orangeBright, 6.0);
      }
    } else if (sim.phase === 'playing' && this.prevFailPhase) {
      this.prevFailPhase = false;
      this.deathMode = 'none';
      this.limbVels.length = 0;
      this.explosionMesh.visible = false;
      this.explosionRing.visible = false;
      this.worker.resetPose();
      this.scatter.clearActive();
    }

    if (sim.phase === 'failing') {
      this.scatter.step(realDt);
    }

    if (sim.phase === 'won') {
      this.winDeliverTimer += realDt;
    } else {
      this.winDeliverTimer = 0;
    }

    // Update worker rig (or animate dismantle / explosion on fail)
    const p = sim.player;
    this.worker.root.position.set(p.x, p.y, 0);
    this.worker.root.rotation.y = p.facing === 1 ? 0 : Math.PI;

    if (sim.phase === 'failing') {
      this.deathTimer += realDt;
      if (this.deathMode === 'explode') {
        const s = 0.4 + this.deathTimer * 5.5;
        const fade = Math.max(0, 1 - this.deathTimer * 2.1);
        this.explosionMesh.scale.setScalar(s);
        (this.explosionMesh.material as THREE.MeshBasicMaterial).opacity = fade;
        this.explosionRing.scale.setScalar(s * 1.45);
        (this.explosionRing.material as THREE.MeshBasicMaterial).opacity = fade * 0.85;
      } else if (this.deathMode === 'dismantle') {
        for (const limb of this.limbVels) {
          limb.vy -= 22 * realDt;
          limb.obj.position.x += limb.vx * realDt;
          limb.obj.position.y += limb.vy * realDt;
          limb.obj.position.z += limb.vz * realDt;
          limb.obj.rotation.x += limb.rx * realDt;
          limb.obj.rotation.z += limb.rz * realDt;
        }
      }
    } else {
      const idleBob = p.grounded && Math.abs(p.vx) < 0.2 ? Math.sin(sim.elapsed * 5) * 0.03 : 0;
      this.worker.bodyGroup.scale.set(p.squashX, p.squashY, p.squashX);
      this.worker.bodyGroup.position.y = idleBob;

      // Run cycle legs & arm sway
      const swing = p.grounded ? Math.sin(p.runCycle) * Math.min(1, Math.abs(p.vx) / 4) * 0.65 : 0.35;
      this.worker.leftLeg.rotation.z = swing;
      this.worker.rightLeg.rotation.z = -swing;
      this.worker.armGroup.rotation.z = Math.sin(p.runCycle * 2) * 0.06;
    }

    // Panic reactions (wide eyes + sweat drop)
    const eyeScale = sim.inDanger || sim.phase === 'failing' ? 1.55 : 1.0;
    this.worker.leftEye.scale.setScalar(eyeScale);
    this.worker.rightEye.scale.setScalar(eyeScale);
    this.worker.sweatDrop.visible = sim.inDanger && sim.phase === 'playing';
    if (this.worker.sweatDrop.visible) {
      this.worker.sweatDrop.position.y = 0.28 + Math.sin(sim.elapsed * 16) * 0.04;
    }

    // Update carried containers (or scatter rigid bodies on fail, or counter hop on win)
    if (this.containerPool) {
      const meshes = this.containerPool.meshes;
      for (let i = 0; i < meshes.length; i++) {
        const m = meshes[i];
        if (i >= sim.stack.length) {
          m.visible = false;
          continue;
        }
        m.visible = true;

        if (sim.phase === 'failing') {
          const body = this.scatter.getBody(i);
          if (body) {
            m.position.set(body.position.x, body.position.y, body.position.z);
            m.quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w);
            m.scale.setScalar(1);
          }
        } else if (sim.phase === 'won') {
          // Containers hop onto the delivery counter one by one!
          const hopDelay = i * 0.06;
          const t = Math.max(0, Math.min(1, (this.winDeliverTimer - hopDelay) / 0.28));
          const node = sim.stack[i];
          const targetX = sim.goalX;
          const targetY = sim.goalY + 1.35 + i * 0.32;
          const arc = Math.sin(t * Math.PI) * 1.4;
          m.position.set(
            THREE.MathUtils.lerp(node.worldX, targetX, t),
            THREE.MathUtils.lerp(node.worldY, targetY, t) + arc,
            0
          );
          m.rotation.set(0, 0, node.tilt * (1 - t));
          m.scale.setScalar(1);
        } else {
          const node = sim.stack[i];
          const zWiggle = Math.sin(sim.elapsed * 5.5 + i * 0.6) * 0.02;
          m.position.set(node.worldX, node.worldY, zWiggle);
          m.rotation.set(0, 0, node.tilt);
          const invSq = 1 / Math.sqrt(node.squash);
          m.scale.set(invSq, node.squash, invSq);
        }
      }
    }

    // Update traps, pickups, and goal counter
    if (this.builtLevel) {
      for (const tr of sim.traps) {
        const obj = this.builtLevel.trapMeshes.get(tr.def.id);
        if (obj) syncTrapVisual(tr, obj, sim.elapsed);
      }

      for (const pk of sim.level.pickups) {
        const obj = this.builtLevel.pickupMeshes.get(pk.id);
        if (obj) {
          obj.visible = !sim.collectedPickups.has(pk.id);
          obj.position.y = pk.y + Math.sin(sim.elapsed * 4 + pk.x) * 0.12;
          obj.rotation.y = sim.elapsed * 2.2;
        }
      }

      this.builtLevel.goalMesh.position.set(sim.goalX, sim.goalY, 0);
    }

    // Update particles
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const pt = this.particles[i];
      if (!pt.active) continue;
      pt.life += realDt;
      if (pt.life >= pt.maxLife) {
        pt.active = false;
        this.dummy.position.set(0, -100, 0);
        this.dummy.scale.setScalar(0);
        this.dummy.updateMatrix();
        this.particleMesh.setMatrixAt(i, this.dummy.matrix);
        continue;
      }
      pt.vy -= 14 * realDt;
      pt.x += pt.vx * realDt;
      pt.y += pt.vy * realDt;
      pt.z += pt.vz * realDt;
      const s = pt.size * (1 - pt.life / pt.maxLife);
      this.dummy.position.set(pt.x, pt.y, pt.z);
      this.dummy.rotation.set(pt.life * 6, pt.life * 4, 0);
      this.dummy.scale.setScalar(s);
      this.dummy.updateMatrix();
      this.particleMesh.setMatrixAt(i, this.dummy.matrix);
      this.particleMesh.setColorAt(i, pt.color);
    }
    this.particleMesh.instanceMatrix.needsUpdate = true;
    if (this.particleMesh.instanceColor) {
      this.particleMesh.instanceColor.needsUpdate = true;
    }

    // Camera shake (framing never changes!)
    if (this.shakeIntensity > 0.002) {
      this.camera.position.set(
        this.baseCamPos.x + (Math.random() - 0.5) * this.shakeIntensity,
        this.baseCamPos.y + (Math.random() - 0.5) * this.shakeIntensity,
        this.baseCamPos.z
      );
      this.shakeIntensity *= Math.max(0, 1 - realDt * 12);
    } else {
      this.camera.position.copy(this.baseCamPos);
    }

    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    this.worker.dispose();
    if (this.builtLevel) this.builtLevel.dispose();
    if (this.containerPool) this.containerPool.dispose();
    this.particleMesh.geometry.dispose();
    (this.particleMesh.material as THREE.Material).dispose();
    this.explosionMesh.geometry.dispose();
    (this.explosionMesh.material as THREE.Material).dispose();
    this.explosionRing.geometry.dispose();
    (this.explosionRing.material as THREE.Material).dispose();
    this.renderer.dispose();
  }
}
