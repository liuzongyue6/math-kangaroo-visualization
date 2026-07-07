import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { PatternSpec } from '../types/problem';

// Horizontal texture resolution; vertical follows the pattern aspect ratio.
const TEXTURE_WIDTH = 512;

const SYMBOL_FONT_STACK =
  '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';

function buildPatternTexture(pattern: PatternSpec): THREE.CanvasTexture {
  const [w, h] = pattern.size;
  const canvas = document.createElement('canvas');
  canvas.width = TEXTURE_WIDTH;
  canvas.height = Math.max(1, Math.round((TEXTURE_WIDTH * h) / w));
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = pattern.color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const pxPerUnit = canvas.width / w;

  if (pattern.border_width > 0) {
    const bw = pattern.border_width * pxPerUnit;
    ctx.strokeStyle = pattern.border_color;
    ctx.lineWidth = bw;
    ctx.strokeRect(bw / 2, bw / 2, canvas.width - bw, canvas.height - bw);
  }

  if (pattern.symbol) {
    ctx.translate(canvas.width / 2, canvas.height / 2);
    // Same composition order as CSS `rotate(..) scaleX(-1)`: the mirror
    // applies to the glyph first, then the whole thing rotates.
    ctx.rotate((pattern.symbol_rotation_deg * Math.PI) / 180);
    if (pattern.symbol_mirror_x) ctx.scale(-1, 1);
    ctx.font = `${Math.round(pattern.symbol_size * pxPerUnit)}px ${SYMBOL_FONT_STACK}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000000';
    ctx.fillText(pattern.symbol, 0, 0);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/**
 * The colored front face of a "paper" panel, painted as a real WebGL
 * texture plane inside the entity's group. Unlike the DOM-based `LabelSpec`
 * overlays, this participates in depth testing and perspective projection,
 * so symbols stay glued to their face (and get correctly occluded) while
 * the net folds. Unlit material keeps the flat CSS-reference colors.
 */
export function PatternPlane({ pattern }: { pattern: PatternSpec }) {
  const texture = useMemo(() => buildPatternTexture(pattern), [pattern]);

  useEffect(() => () => texture.dispose(), [texture]);

  const [cx, cy] = pattern.center;
  const [w, h] = pattern.size;

  return (
    <mesh position={[cx, cy, pattern.offset_z]}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}
