import * as THREE from 'three';
import { CONTAINER_H, CONTAINER_W } from '../sim/constants.ts';
import type { ContainerTheme } from '../sim/types.ts';
import { PALETTE } from './palette.ts';
import { addToyOutline, createBlobShadowTexture, createStripeTexture, makeToonMat } from './toonMaterials.ts';

export interface WorkerRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  headGroup: THREE.Group;
  torsoGroup: THREE.Group;
  leftLeg: THREE.Mesh;
  rightLeg: THREE.Mesh;
  armGroup: THREE.Group;
  leftArm: THREE.Mesh;
  rightArm: THREE.Mesh;
  leftEye: THREE.Mesh;
  rightEye: THREE.Mesh;
  sweatDrop: THREE.Mesh;
  blobShadow: THREE.Mesh;
  resetPose: () => void;
  dispose: () => void;
}

export function buildWorkerRig(): WorkerRig {
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  const disposables: Array<{ dispose: () => void }> = [];

  const charcoalMat = makeToonMat(PALETTE.charcoal);
  const apronMat = makeToonMat(PALETTE.apronWhite);
  const redMat = makeToonMat(PALETTE.tomatoRed);
  const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x1d1a1b });
  const sweatMat = makeToonMat(PALETTE.skyBlue);
  disposables.push(charcoalMat, apronMat, redMat, eyeWhiteMat, pupilMat, sweatMat);

  // Torso group (torso + apron + badge so they dismantle together)
  const torsoGroup = new THREE.Group();
  bodyGroup.add(torsoGroup);

  const torsoGeo = new THREE.CylinderGeometry(0.24, 0.27, 0.48, 12);
  const torso = new THREE.Mesh(torsoGeo, charcoalMat);
  torso.position.set(0, 0.50, 0);
  torso.castShadow = true;
  addToyOutline(torso, 1.07);
  torsoGroup.add(torso);
  disposables.push(torsoGeo);

  // White apron front
  const apronGeo = new THREE.BoxGeometry(0.22, 0.42, 0.36);
  const apron = new THREE.Mesh(apronGeo, apronMat);
  apron.position.set(0.14, 0.47, 0);
  apron.castShadow = true;
  addToyOutline(apron, 1.06);
  torsoGroup.add(apron);
  disposables.push(apronGeo);

  // Red apron tie / badge
  const badgeGeo = new THREE.BoxGeometry(0.05, 0.08, 0.14);
  const badge = new THREE.Mesh(badgeGeo, redMat);
  badge.position.set(0.25, 0.54, 0);
  torsoGroup.add(badge);
  disposables.push(badgeGeo);

  // Stubby rounded legs
  const legGeo = new THREE.CapsuleGeometry(0.09, 0.16, 4, 8);
  const leftLeg = new THREE.Mesh(legGeo, charcoalMat);
  leftLeg.position.set(0, 0.17, 0.11);
  leftLeg.castShadow = true;
  addToyOutline(leftLeg, 1.08);
  bodyGroup.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, charcoalMat);
  rightLeg.position.set(0, 0.17, -0.11);
  rightLeg.castShadow = true;
  addToyOutline(rightLeg, 1.08);
  bodyGroup.add(rightLeg);
  disposables.push(legGeo);

  // Arms reaching forward (+X) to hold the front-carried stack!
  const armGroup = new THREE.Group();
  armGroup.position.set(0.10, 0.56, 0);
  const armGeo = new THREE.CapsuleGeometry(0.075, 0.32, 4, 8);
  armGeo.rotateZ(Math.PI / 2);

  const leftArm = new THREE.Mesh(armGeo, charcoalMat);
  leftArm.position.set(0.22, 0, 0.20);
  leftArm.rotation.y = -0.18;
  leftArm.castShadow = true;
  addToyOutline(leftArm, 1.08);
  armGroup.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, charcoalMat);
  rightArm.position.set(0.22, 0, -0.20);
  rightArm.rotation.y = 0.18;
  rightArm.castShadow = true;
  addToyOutline(rightArm, 1.08);
  armGroup.add(rightArm);

  // Little white gloves / hands
  const handGeo = new THREE.SphereGeometry(0.085, 8, 8);
  const leftHand = new THREE.Mesh(handGeo, apronMat);
  leftHand.position.set(0.40, 0, 0.14);
  armGroup.add(leftHand);
  const rightHand = new THREE.Mesh(handGeo, apronMat);
  rightHand.position.set(0.40, 0, -0.14);
  armGroup.add(rightHand);

  bodyGroup.add(armGroup);
  disposables.push(armGeo, handGeo);

  // Oversized rounded head
  const headGroup = new THREE.Group();
  headGroup.position.set(0.02, 0.92, 0);
  bodyGroup.add(headGroup);

  const headGeo = new THREE.SphereGeometry(0.25, 14, 12);
  const head = new THREE.Mesh(headGeo, charcoalMat);
  head.castShadow = true;
  addToyOutline(head, 1.06);
  headGroup.add(head);
  disposables.push(headGeo);

  // Red visor band & brim
  const bandGeo = new THREE.CylinderGeometry(0.258, 0.258, 0.09, 14);
  const band = new THREE.Mesh(bandGeo, redMat);
  band.position.set(0, 0.08, 0);
  addToyOutline(band, 1.05);
  headGroup.add(band);

  const brimGeo = new THREE.BoxGeometry(0.22, 0.04, 0.34);
  const brim = new THREE.Mesh(brimGeo, redMat);
  brim.position.set(0.20, 0.08, 0);
  brim.rotation.z = -0.12;
  addToyOutline(brim, 1.06);
  headGroup.add(brim);
  disposables.push(bandGeo, brimGeo);

  // Expressive eyes (side-facing +X)
  const eyeGeo = new THREE.SphereGeometry(0.055, 8, 8);
  const pupilGeo = new THREE.SphereGeometry(0.028, 6, 6);

  const leftEye = new THREE.Mesh(eyeGeo, eyeWhiteMat);
  leftEye.position.set(0.21, -0.01, 0.10);
  const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
  leftPupil.position.set(0.042, 0, 0);
  leftEye.add(leftPupil);
  headGroup.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeo, eyeWhiteMat);
  rightEye.position.set(0.21, -0.01, -0.10);
  const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
  rightPupil.position.set(0.042, 0, 0);
  rightEye.add(rightPupil);
  headGroup.add(rightEye);
  disposables.push(eyeGeo, pupilGeo);

  // Sweat drop for danger state
  const sweatGeo = new THREE.ConeGeometry(0.055, 0.14, 8);
  const sweatDrop = new THREE.Mesh(sweatGeo, sweatMat);
  sweatDrop.position.set(-0.08, 0.28, 0.16);
  sweatDrop.rotation.z = 0.35;
  sweatDrop.visible = false;
  headGroup.add(sweatDrop);
  disposables.push(sweatGeo);

  // Blob shadow under worker
  const shadowTex = createBlobShadowTexture();
  const shadowGeo = new THREE.PlaneGeometry(0.95, 0.95);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    depthWrite: false,
  });
  const blobShadow = new THREE.Mesh(shadowGeo, shadowMat);
  blobShadow.position.set(0, 0.02, 0);
  root.add(blobShadow);
  disposables.push(shadowTex, shadowGeo, shadowMat);

  const resetPose = () => {
    bodyGroup.visible = true;
    bodyGroup.position.set(0, 0, 0);
    bodyGroup.rotation.set(0, 0, 0);
    headGroup.position.set(0.02, 0.92, 0);
    headGroup.rotation.set(0, 0, 0);
    torsoGroup.position.set(0, 0, 0);
    torsoGroup.rotation.set(0, 0, 0);
    leftLeg.position.set(0, 0.17, 0.11);
    leftLeg.rotation.set(0, 0, 0);
    rightLeg.position.set(0, 0.17, -0.11);
    rightLeg.rotation.set(0, 0, 0);
    armGroup.position.set(0.10, 0.56, 0);
    armGroup.rotation.set(0, 0, 0);
    leftArm.position.set(0.22, 0, 0.20);
    leftArm.rotation.set(0, -0.18, 0);
    rightArm.position.set(0.22, 0, -0.20);
    rightArm.rotation.set(0, 0.18, 0);
  };

  return {
    root,
    bodyGroup,
    headGroup,
    torsoGroup,
    leftLeg,
    rightLeg,
    armGroup,
    leftArm,
    rightArm,
    leftEye,
    rightEye,
    sweatDrop,
    blobShadow,
    resetPose,
    dispose: () => {
      for (const d of disposables) d.dispose();
    },
  };
}

export interface ContainerPool {
  meshes: THREE.Group[];
  dispose: () => void;
}

export function buildContainerPool(theme: ContainerTheme, count = 16): ContainerPool {
  const meshes: THREE.Group[] = [];
  const disposables: Array<{ dispose: () => void }> = [];

  const rimMat = makeToonMat(PALETTE.creamRim);
  const foodMat = makeToonMat(PALETTE.orangeBright);
  const redMat = makeToonMat(PALETTE.tomatoRed);
  disposables.push(rimMat, foodMat, redMat);

  let bodyMat: THREE.MeshToonMaterial;
  let bodyGeo: THREE.BufferGeometry;
  let rimGeo: THREE.BufferGeometry;
  let topGeo: THREE.BufferGeometry;

  if (theme === 'pizza_box' || theme === 'vip_gold') {
    const boxColor = theme === 'vip_gold' ? PALETTE.goldVip : PALETTE.creamRim;
    bodyMat = makeToonMat(boxColor);
    bodyGeo = new THREE.BoxGeometry(CONTAINER_W, CONTAINER_H * 0.78, CONTAINER_W);
    rimGeo = new THREE.BoxGeometry(CONTAINER_W * 1.04, CONTAINER_H * 0.22, CONTAINER_W * 1.04);
    topGeo = new THREE.BoxGeometry(CONTAINER_W * 0.65, 0.04, CONTAINER_W * 0.65);
    disposables.push(bodyMat, bodyGeo, rimGeo, topGeo);
  } else if (theme === 'striped_bucket') {
    const stripeTex = createStripeTexture('#EA362B', '#FAF4EA', false, 4, 1);
    bodyMat = makeToonMat(0xffffff, { map: stripeTex });
    bodyGeo = new THREE.CylinderGeometry(CONTAINER_W * 0.48, CONTAINER_W * 0.43, CONTAINER_H * 0.82, 14);
    rimGeo = new THREE.CylinderGeometry(CONTAINER_W * 0.52, CONTAINER_W * 0.50, CONTAINER_H * 0.22, 14);
    topGeo = new THREE.CylinderGeometry(CONTAINER_W * 0.42, CONTAINER_W * 0.42, 0.05, 12);
    disposables.push(stripeTex, bodyMat, bodyGeo, rimGeo, topGeo);
  } else {
    // orange_tub (matches reference!)
    bodyMat = makeToonMat(PALETTE.orangeTub);
    bodyGeo = new THREE.CylinderGeometry(CONTAINER_W * 0.48, CONTAINER_W * 0.45, CONTAINER_H * 0.80, 14);
    rimGeo = new THREE.CylinderGeometry(CONTAINER_W * 0.52, CONTAINER_W * 0.52, CONTAINER_H * 0.22, 14);
    topGeo = new THREE.CylinderGeometry(CONTAINER_W * 0.43, CONTAINER_W * 0.43, 0.05, 12);
    disposables.push(bodyMat, bodyGeo, rimGeo, topGeo);
  }

  for (let i = 0; i < count; i++) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    body.receiveShadow = true;
    addToyOutline(body, 1.055);
    g.add(body);

    const rim = new THREE.Mesh(rimGeo, theme === 'pizza_box' || theme === 'vip_gold' ? redMat : rimMat);
    rim.position.y = CONTAINER_H * 0.34;
    rim.castShadow = true;
    addToyOutline(rim, 1.045);
    g.add(rim);

    const top = new THREE.Mesh(topGeo, theme === 'vip_gold' ? redMat : foodMat);
    top.position.y = CONTAINER_H * 0.46;
    g.add(top);

    g.visible = false;
    meshes.push(g);
  }

  return {
    meshes,
    dispose: () => {
      for (const d of disposables) d.dispose();
    },
  };
}
