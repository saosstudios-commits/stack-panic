import * as THREE from 'three';
import { PALETTE, PALETTE_CSS } from './palette.ts';

let cachedGradientMap: THREE.DataTexture | null = null;
let cachedOutlineMat: THREE.MeshBasicMaterial | null = null;

export function getToonGradientMap(): THREE.DataTexture {
  if (cachedGradientMap) return cachedGradientMap;
  const data = new Uint8Array([155, 215, 255]);
  const tex = new THREE.DataTexture(data, 3, 1, THREE.RedFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  cachedGradientMap = tex;
  return tex;
}

export function getOutlineMaterial(): THREE.MeshBasicMaterial {
  if (cachedOutlineMat) return cachedOutlineMat;
  cachedOutlineMat = new THREE.MeshBasicMaterial({
    color: PALETTE.charcoal,
    side: THREE.BackSide,
  });
  return cachedOutlineMat;
}

export function makeToonMat(
  color: number,
  options: { map?: THREE.Texture; emissive?: number; emissiveIntensity?: number } = {}
): THREE.MeshToonMaterial {
  return new THREE.MeshToonMaterial({
    color,
    gradientMap: getToonGradientMap(),
    map: options.map ?? null,
    emissive: options.emissive ?? 0x000000,
    emissiveIntensity: options.emissiveIntensity ?? 0,
  });
}

export function addToyOutline(mesh: THREE.Mesh, scale = 1.05): THREE.Mesh {
  const outline = new THREE.Mesh(mesh.geometry, getOutlineMaterial());
  outline.scale.setScalar(scale);
  outline.castShadow = false;
  outline.receiveShadow = false;
  mesh.add(outline);
  return outline;
}

export function createCheckerTexture(
  c1: string = PALETTE_CSS.creamLight,
  c2: string = PALETTE_CSS.creamWarm,
  repeatX = 4,
  repeatY = 2
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = c1;
  ctx.fillRect(0, 0, 64, 64);
  ctx.fillStyle = c2;
  ctx.fillRect(0, 0, 32, 32);
  ctx.fillRect(32, 32, 32, 32);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createStripeTexture(
  c1: string = PALETTE_CSS.tomatoRed,
  c2: string = PALETTE_CSS.creamRim,
  diagonal = false,
  repeatX = 3,
  repeatY = 1
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = c2;
  ctx.fillRect(0, 0, 64, 64);
  ctx.fillStyle = c1;
  if (diagonal) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(32, 0);
    ctx.lineTo(0, 32);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(64, 0);
    ctx.lineTo(64, 32);
    ctx.lineTo(32, 64);
    ctx.lineTo(0, 64);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.fillRect(0, 0, 32, 64);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createBlobShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(32, 32, 4, 32, 32, 30);
  grad.addColorStop(0, 'rgba(89, 42, 35, 0.36)');
  grad.addColorStop(0.65, 'rgba(89, 42, 35, 0.14)');
  grad.addColorStop(1, 'rgba(89, 42, 35, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
