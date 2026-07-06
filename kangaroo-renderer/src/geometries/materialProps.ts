import type { Material } from '../types/problem';

/** Shared mapping from the typed Material schema to meshStandardMaterial props,
 * so every geometry renderer speaks the same material language. */
export function materialProps(material: Material) {
  return {
    color: material.color,
    opacity: material.opacity,
    transparent: material.opacity < 1,
    metalness: material.metalness,
    roughness: material.roughness,
    wireframe: material.wireframe,
  };
}

export const OUTLINE_COLOR = '#2b2f38';
export const OUTLINE_THICKNESS = 1.5;
