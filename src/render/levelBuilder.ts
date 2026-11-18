import * as THREE from 'three';
import type { LevelDef, LevelTheme, TrapRuntime } from '../sim/types.ts';
import { PALETTE, PALETTE_CSS } from './palette.ts';
import { addToyOutline, createCheckerTexture, createStripeTexture, makeToonMat } from './toonMaterials.ts';

export interface BuiltLevel {
  group: THREE.Group;
  trapMeshes: Map<string, THREE.Object3D>;
  goalMesh: THREE.Group;
  pickupMeshes: Map<string, THREE.Group>;
  dispose: () => void;
}

const THEME_BG: Record<LevelTheme, { wall: number; trim: number; accent: number }> = {
  street: { wall: PALETTE.creamLight, trim: PALETTE.skyBlue, accent: PALETTE.bubblegumPink },
  kitchen: { wall: PALETTE.creamWarm, trim: PALETTE.tomatoRed, accent: PALETTE.orangeBright },
  rooftop: { wall: 0xf7dec8, trim: PALETTE.skyTeal, accent: PALETTE.mustard },
  alley: { wall: 0xc8d2d1, trim: PALETTE.slate, accent: PALETTE.sageMint },
  plaza: { wall: PALETTE.creamLight, trim: PALETTE.goldVip, accent: PALETTE.tomatoRed },
};

export function buildLevelScene(level: LevelDef): BuiltLevel {
  const group = new THREE.Group();
  const trapMeshes = new Map<string, THREE.Object3D>();
  const pickupMeshes = new Map<string, THREE.Group>();
  const disposables: Array<{ dispose: () => void }> = [];

  const track = <T extends { dispose: () => void }>(item: T): T => {
    disposables.push(item);
    return item;
  };

  const themeColors = THEME_BG[level.theme];

  // 1. Diorama Backdrop Wall (z = -2.4)
  const wallGeo = track(new THREE.BoxGeometry(38, 22, 0.4));
  const wallMat = track(makeToonMat(themeColors.wall));
  const wall = new THREE.Mesh(wallGeo, wallMat);
  wall.position.set(16, 9, -2.5);
  wall.receiveShadow = false;
  group.add(wall);

  // Subtle floor shelf under the diorama
  const shelfGeo = track(new THREE.BoxGeometry(38, 0.8, 4.2));
  const shelfMat = track(makeToonMat(PALETTE.creamWarm));
  const shelf = new THREE.Mesh(shelfGeo, shelfMat);
  shelf.position.set(16, -0.45, -1.0);
  shelf.receiveShadow = true;
  group.add(shelf);

  // Theme-specific backdrop props (z in [-2.1, -1.2], never occluding playfield)
  buildBackdropProps(group, level.theme, themeColors, track);

  // 2. Platforms (extruded blocks z in [-0.6, +0.6])
  const checkerTex = track(createCheckerTexture(PALETTE_CSS.creamLight, PALETTE_CSS.creamWarm, 4, 1));
  const stripeTex = track(createStripeTexture(PALETTE_CSS.tomatoRed, PALETTE_CSS.creamRim, false, 4, 1));

  for (const p of level.platforms) {
    const pGroup = new THREE.Group();
    const blockGeo = track(new THREE.BoxGeometry(p.w, p.h, 1.2));
    let blockColor: number = PALETTE.creamWarm;
    let mapTex: THREE.Texture | undefined;

    if (p.style === 'curb') {
      blockColor = p.fake ? 0xe5d3be : PALETTE.creamLight;
      mapTex = checkerTex;
    } else if (p.style === 'tile') {
      blockColor = PALETTE.creamLight;
      mapTex = checkerTex;
    } else if (p.style === 'brick') {
      blockColor = PALETTE.coralRed;
    } else if (p.style === 'metal') {
      blockColor = p.fake ? 0x73706d : PALETTE.slate;
    } else if (p.style === 'stripe') {
      blockColor = 0xffffff;
      mapTex = stripeTex;
    }

    const blockMat = track(makeToonMat(blockColor, { map: mapTex }));
    const mesh = new THREE.Mesh(blockGeo, blockMat);
    mesh.position.set(p.x + p.w * 0.5, p.y + p.h * 0.5, 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    addToyOutline(mesh, 1.015);
    pGroup.add(mesh);

    // Top trim lip for crisp silhouette
    const trimGeo = track(new THREE.BoxGeometry(p.w + 0.06, 0.14, 1.26));
    const trimColor =
      p.style === 'brick'
        ? PALETTE.creamRim
        : p.style === 'metal'
          ? PALETTE.sageMint
          : PALETTE.tomatoRed;
    const trimMat = track(makeToonMat(trimColor));
    const trim = new THREE.Mesh(trimGeo, trimMat);
    trim.position.set(p.x + p.w * 0.5, p.y + p.h - 0.05, 0);
    trim.receiveShadow = true;
    pGroup.add(trim);

    group.add(pGroup);
  }

  // 3. Pickups (floating mini containers with gentle bob)
  for (const pk of level.pickups) {
    const pkGroup = new THREE.Group();
    pkGroup.position.set(pk.x, pk.y, 0);
    const tubGeo = track(new THREE.CylinderGeometry(0.24, 0.21, 0.26, 12));
    const tubMat = track(makeToonMat(PALETTE.orangeTub));
    const tub = new THREE.Mesh(tubGeo, tubMat);
    addToyOutline(tub, 1.07);
    pkGroup.add(tub);

    const rimGeo = track(new THREE.CylinderGeometry(0.26, 0.26, 0.08, 12));
    const rimMat = track(makeToonMat(PALETTE.creamRim));
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.position.y = 0.11;
    pkGroup.add(rim);

    group.add(pkGroup);
    pickupMeshes.set(pk.id, pkGroup);
  }

  // 4. Traps
  for (const tr of level.traps) {
    const obj = buildTrapMesh(tr, track);
    group.add(obj);
    trapMeshes.set(tr.id, obj);
  }

  // 5. Real Delivery Counter / Goal
  const hasRunaway = level.traps.some((t) => t.type === 'runaway_exit');
  const goalMesh = buildDeliveryCounter(track, false, hasRunaway);
  goalMesh.position.set(level.goalX, level.goalY, 0);
  group.add(goalMesh);

  return {
    group,
    trapMeshes,
    goalMesh,
    pickupMeshes,
    dispose: () => {
      for (const d of disposables) d.dispose();
    },
  };
}

function buildBackdropProps(
  group: THREE.Group,
  theme: LevelTheme,
  colors: { wall: number; trim: number; accent: number },
  track: <T extends { dispose: () => void }>(item: T) => T
): void {
  const propMat1 = track(makeToonMat(colors.trim));
  const propMat2 = track(makeToonMat(colors.accent));
  const creamMat = track(makeToonMat(PALETTE.creamRim));

  if (theme === 'street') {
    // Storefront windows & pastel toy cars in backdrop
    for (let x = 4; x <= 28; x += 8) {
      const winGeo = track(new THREE.BoxGeometry(3.2, 2.4, 0.2));
      const win = new THREE.Mesh(winGeo, propMat1);
      win.position.set(x, 7.5, -2.1);
      group.add(win);
      const sillGeo = track(new THREE.BoxGeometry(3.6, 0.25, 0.35));
      const sill = new THREE.Mesh(sillGeo, creamMat);
      sill.position.set(x, 6.2, -2.0);
      group.add(sill);
    }
    // Cute pastel car silhouette in background
    const carGeo = track(new THREE.BoxGeometry(2.6, 0.9, 0.5));
    const car = new THREE.Mesh(carGeo, propMat2);
    car.position.set(11, 2.5, -1.8);
    group.add(car);
  } else if (theme === 'kitchen') {
    // Brick pizza ovens & hanging pans
    for (let x = 6; x <= 26; x += 10) {
      const ovenGeo = track(new THREE.BoxGeometry(3.4, 3.6, 0.6));
      const oven = new THREE.Mesh(ovenGeo, propMat1);
      oven.position.set(x, 3.8, -1.9);
      group.add(oven);
      const glowGeo = track(new THREE.CylinderGeometry(0.9, 0.9, 0.2, 12));
      glowGeo.rotateX(Math.PI / 2);
      const glow = new THREE.Mesh(glowGeo, propMat2);
      glow.position.set(x, 3.6, -1.55);
      group.add(glow);
    }
  } else if (theme === 'rooftop') {
    // Skyline buildings & chimneys
    const heights = [6, 9, 5, 10, 7, 8];
    heights.forEach((h, i) => {
      const bGeo = track(new THREE.BoxGeometry(4.2, h, 0.5));
      const b = new THREE.Mesh(bGeo, i % 2 === 0 ? propMat1 : creamMat);
      b.position.set(3 + i * 5.2, h * 0.5, -2.0);
      group.add(b);
    });
  } else if (theme === 'alley') {
    // Pipes & neon sign
    const pipeGeo = track(new THREE.CylinderGeometry(0.25, 0.25, 28, 10));
    pipeGeo.rotateZ(Math.PI / 2);
    const pipe = new THREE.Mesh(pipeGeo, propMat2);
    pipe.position.set(16, 11.5, -1.8);
    group.add(pipe);
  } else {
    // Plaza festive bunting pillars
    for (let x = 5; x <= 27; x += 7) {
      const colGeo = track(new THREE.CylinderGeometry(0.35, 0.42, 12, 12));
      const col = new THREE.Mesh(colGeo, creamMat);
      col.position.set(x, 6, -1.9);
      group.add(col);
      const capGeo = track(new THREE.SphereGeometry(0.55, 10, 10));
      const cap = new THREE.Mesh(capGeo, propMat1);
      cap.position.set(x, 12.2, -1.9);
      group.add(cap);
    }
  }
}

function buildDeliveryCounter(
  track: <T extends { dispose: () => void }>(item: T) => T,
  isFake: boolean,
  hasWheels: boolean
): THREE.Group {
  const g = new THREE.Group();
  const stripeTex = track(createStripeTexture(PALETTE_CSS.tomatoRed, PALETTE_CSS.creamRim, false, 3, 1));
  const baseGeo = track(new THREE.BoxGeometry(1.4, 1.1, 1.1));
  const baseMat = track(makeToonMat(0xffffff, { map: stripeTex }));
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.55;
  base.castShadow = true;
  addToyOutline(base, 1.04);
  g.add(base);

  const topGeo = track(new THREE.BoxGeometry(1.56, 0.18, 1.24));
  const topMat = track(makeToonMat(isFake ? PALETTE.coralRed : PALETTE.creamRim));
  const top = new THREE.Mesh(topGeo, topMat);
  top.position.y = 1.15;
  addToyOutline(top, 1.04);
  g.add(top);

  // Arch / Flag pole
  const poleGeo = track(new THREE.CylinderGeometry(0.06, 0.06, 1.5, 8));
  const poleMat = track(makeToonMat(PALETTE.charcoal));
  const pole = new THREE.Mesh(poleGeo, poleMat);
  pole.position.set(0.5, 1.9, -0.35);
  g.add(pole);

  const flagGeo = track(new THREE.BoxGeometry(0.85, 0.48, 0.1));
  const flagMat = track(makeToonMat(isFake ? PALETTE.dangerAmber : PALETTE.sageMint));
  const flag = new THREE.Mesh(flagGeo, flagMat);
  flag.position.set(0.1, 2.35, -0.35);
  if (isFake) flag.rotation.z = 0.14; // Subtle crooked tell!
  addToyOutline(flag, 1.06);
  g.add(flag);

  if (hasWheels) {
    const wheelGeo = track(new THREE.CylinderGeometry(0.2, 0.2, 0.18, 10));
    wheelGeo.rotateX(Math.PI / 2);
    const wheelMat = track(makeToonMat(PALETTE.charcoal));
    const w1 = new THREE.Mesh(wheelGeo, wheelMat);
    w1.position.set(-0.45, 0.18, 0.52);
    g.add(w1);
    const w2 = new THREE.Mesh(wheelGeo, wheelMat);
    w2.position.set(0.45, 0.18, 0.52);
    g.add(w2);
  }

  return g;
}

function buildTrapMesh(
  tr: LevelDef['traps'][number],
  track: <T extends { dispose: () => void }>(item: T) => T
): THREE.Object3D {
  const g = new THREE.Group();

  switch (tr.type) {
    case 'vanish': {
      const geo = track(new THREE.BoxGeometry(tr.w, tr.h, 1.16));
      const mat = track(makeToonMat(PALETTE.creamWarm));
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(tr.x + tr.w * 0.5, tr.y + tr.h * 0.5, 0);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      addToyOutline(mesh, 1.03);
      g.add(mesh);
      // Hairline crack accent
      const crackGeo = track(new THREE.BoxGeometry(tr.w * 0.7, 0.06, 1.2));
      const crackMat = track(makeToonMat(PALETTE.espresso));
      const crack = new THREE.Mesh(crackGeo, crackMat);
      crack.position.set(tr.x + tr.w * 0.5, tr.y + tr.h * 0.75, 0);
      g.add(crack);
      break;
    }

    case 'popup_spikes': {
      const count = Math.max(2, Math.round(tr.w / 0.42));
      const coneGeo = track(new THREE.ConeGeometry(0.18, tr.h, 6));
      const coneMat = track(makeToonMat(PALETTE.tomatoRed));
      for (let i = 0; i < count; i++) {
        const cone = new THREE.Mesh(coneGeo, coneMat);
        cone.position.set(tr.x + (i + 0.5) * (tr.w / count), tr.y + tr.h * 0.5, 0);
        addToyOutline(cone, 1.08);
        g.add(cone);
      }
      g.visible = false;
      break;
    }

    case 'ceiling_drop': {
      if (tr.nuke) {
        const hazTex = track(createStripeTexture('#EE8F20', '#1D1A1B', true, 2, 1));
        const geo = track(new THREE.BoxGeometry(tr.w, tr.h, 1.2));
        const mat = track(makeToonMat(0xffffff, { map: hazTex }));
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(tr.x + tr.w * 0.5, tr.y + tr.h * 0.5, 0);
        mesh.castShadow = true;
        addToyOutline(mesh, 1.04);
        g.add(mesh);

        const capGeo = track(new THREE.BoxGeometry(tr.w * 0.85, 0.22, 1.0));
        const capMat = track(makeToonMat(PALETTE.tomatoRed));
        const cap = new THREE.Mesh(capGeo, capMat);
        cap.position.set(tr.x + tr.w * 0.5, tr.y + tr.h + 0.1, 0);
        addToyOutline(cap, 1.05);
        g.add(cap);
      } else {
        const geo = track(new THREE.BoxGeometry(tr.w, tr.h, 1.15));
        const mat = track(makeToonMat(PALETTE.tomatoRed));
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(tr.x + tr.w * 0.5, tr.y + tr.h * 0.5, 0);
        mesh.castShadow = true;
        addToyOutline(mesh, 1.04);
        g.add(mesh);
      }
      break;
    }

    case 'low_bridge':
    case 'closing_door': {
      const hazTex = track(createStripeTexture('#EE8F20', '#2B2422', true, 3, 1));
      const geo = track(new THREE.BoxGeometry(tr.w, tr.h, 1.16));
      const mat = track(makeToonMat(0xffffff, { map: hazTex }));
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(tr.x + tr.w * 0.5, tr.y + tr.h * 0.5, 0);
      mesh.castShadow = true;
      addToyOutline(mesh, 1.04);
      g.add(mesh);
      break;
    }

    case 'gust': {
      // Visual wind ribbons inside the gust zone
      const ribGeo = track(new THREE.BoxGeometry(tr.w * 0.6, 0.08, 0.1));
      const ribMat = track(makeToonMat(PALETTE.skyBlue));
      for (let i = 0; i < 4; i++) {
        const rib = new THREE.Mesh(ribGeo, ribMat);
        rib.position.set(tr.x + tr.w * 0.5, tr.y + 0.8 + i * 1.1, 0.35);
        g.add(rib);
      }
      g.visible = false;
      break;
    }

    case 'wobble_plank': {
      const pivotX = tr.x + tr.w * 0.5;
      const pivotY = tr.y + tr.h * 0.5;
      g.position.set(pivotX, pivotY, 0);
      const plankGeo = track(new THREE.BoxGeometry(tr.w, tr.h, 1.15));
      const plankMat = track(makeToonMat(PALETTE.goldenCrust));
      const plank = new THREE.Mesh(plankGeo, plankMat);
      plank.castShadow = true;
      plank.receiveShadow = true;
      addToyOutline(plank, 1.03);
      g.add(plank);

      const pinGeo = track(new THREE.CylinderGeometry(0.16, 0.16, 1.3, 10));
      pinGeo.rotateX(Math.PI / 2);
      const pinMat = track(makeToonMat(PALETTE.charcoal));
      const pin = new THREE.Mesh(pinGeo, pinMat);
      g.add(pin);
      break;
    }

    case 'conveyor': {
      const stripeTex = track(createStripeTexture('#5E5956', '#EE8F20', true, 6, 1));
      const geo = track(new THREE.BoxGeometry(tr.w, tr.h, 1.15));
      const mat = track(makeToonMat(0xffffff, { map: stripeTex }));
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(tr.x + tr.w * 0.5, tr.y + tr.h * 0.5, 0);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      addToyOutline(mesh, 1.03);
      g.add(mesh);
      break;
    }

    case 'steam_vent': {
      const baseGeo = track(new THREE.BoxGeometry(tr.w, 0.25, 1.0));
      const baseMat = track(makeToonMat(PALETTE.slate));
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.set(tr.x + tr.w * 0.5, tr.y + 0.12, 0);
      g.add(base);

      const jetGeo = track(new THREE.CylinderGeometry(tr.w * 0.4, tr.w * 0.25, tr.h, 10));
      const jetMat = track(makeToonMat(PALETTE.steamWhite));
      const jet = new THREE.Mesh(jetGeo, jetMat);
      jet.position.set(tr.x + tr.w * 0.5, tr.y + tr.h * 0.5, 0);
      jet.name = 'steamJet';
      jet.visible = false;
      g.add(jet);
      break;
    }

    case 'trampoline': {
      const padGeo = track(new THREE.BoxGeometry(tr.w, tr.h, 1.05));
      const padMat = track(makeToonMat(PALETTE.tomatoRed));
      const pad = new THREE.Mesh(padGeo, padMat);
      pad.position.set(tr.x + tr.w * 0.5, tr.y + tr.h * 0.5, 0);
      addToyOutline(pad, 1.06);
      g.add(pad);
      break;
    }

    case 'fake_door': {
      const counter = buildDeliveryCounter(track, true, false);
      counter.position.set(tr.x + tr.w * 0.5, tr.y, 0);
      g.add(counter);
      break;
    }

    case 'controls_swap': {
      const postGeo = track(new THREE.CylinderGeometry(0.06, 0.06, 1.4, 8));
      const postMat = track(makeToonMat(PALETTE.charcoal));
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(tr.x + tr.w * 0.5, tr.y + 0.7, -0.35);
      g.add(post);

      const signGeo = track(new THREE.BoxGeometry(0.9, 0.6, 0.12));
      const signMat = track(makeToonMat(PALETTE.mustard));
      const sign = new THREE.Mesh(signGeo, signMat);
      sign.position.set(tr.x + tr.w * 0.5, tr.y + 1.35, -0.35);
      sign.name = 'swapSign';
      addToyOutline(sign, 1.06);
      g.add(sign);
      break;
    }

    case 'moving_hazard': {
      const trayGeo = track(new THREE.CylinderGeometry(tr.w * 0.5, tr.w * 0.45, tr.h, 14));
      const trayMat = track(makeToonMat(PALETTE.tomatoRed));
      const tray = new THREE.Mesh(trayGeo, trayMat);
      tray.position.set(tr.x + tr.w * 0.5, tr.y + tr.h * 0.5, 0);
      addToyOutline(tray, 1.06);
      g.add(tray);
      break;
    }

    case 'confetti_fakeout': {
      const archGeo = track(new THREE.BoxGeometry(0.25, 2.2, 0.25));
      const archMat = track(makeToonMat(PALETTE.goldVip));
      const arch = new THREE.Mesh(archGeo, archMat);
      arch.position.set(tr.x, tr.y + 1.1, -0.4);
      g.add(arch);
      break;
    }

    case 'runaway_exit':
      // Rendered by goalMesh with wheels
      break;
  }

  return g;
}

export function syncTrapVisual(tr: TrapRuntime, obj: THREE.Object3D, elapsed: number): void {
  const d = tr.def;
  switch (d.type) {
    case 'vanish':
      obj.visible = !tr.gone;
      if (tr.triggered && !tr.gone && !d.decoy) {
        obj.position.x = Math.sin(elapsed * 60) * 0.05;
        obj.position.y = -tr.telegraph * 0.15;
      } else {
        obj.position.set(0, 0, 0);
      }
      break;

    case 'popup_spikes':
      obj.visible = tr.active;
      if (tr.active) {
        const s = Math.max(0.1, tr.curH / d.h);
        obj.scale.set(1, s, 1);
        obj.position.y = d.y * (1 - s);
      }
      break;

    case 'ceiling_drop':
      obj.position.y = tr.curY - d.y;
      if (tr.triggered && !tr.active) {
        obj.position.x = Math.sin(elapsed * 55) * 0.06;
      } else {
        obj.position.x = 0;
      }
      break;

    case 'closing_door': {
      const scaleY = tr.curH / d.h;
      obj.scale.set(1, scaleY, 1);
      obj.position.y = tr.curY - d.y * scaleY;
      break;
    }

    case 'gust':
      obj.visible = tr.active || tr.telegraph > 0.2;
      if (obj.visible) {
        const dir = (d.forceX ?? -20) > 0 ? 1 : -1;
        obj.position.x = Math.sin(elapsed * 18) * 0.25 * dir;
      }
      break;

    case 'wobble_plank':
      obj.rotation.z = tr.angle;
      break;

    case 'steam_vent': {
      const jet = obj.getObjectByName('steamJet');
      if (jet) {
        jet.visible = tr.active;
        if (tr.active) {
          jet.scale.y = 0.85 + Math.sin(elapsed * 30) * 0.15;
        }
      }
      break;
    }

    case 'controls_swap': {
      const sign = obj.getObjectByName('swapSign');
      if (sign) {
        sign.rotation.y = tr.triggered ? elapsed * 8 : Math.sin(elapsed * 2) * 0.25;
      }
      break;
    }

    case 'moving_hazard':
      obj.position.set(tr.curX - d.x, tr.curY - d.y, 0);
      break;
  }
}
