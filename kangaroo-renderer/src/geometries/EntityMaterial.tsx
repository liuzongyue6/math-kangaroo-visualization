import * as THREE from 'three';
import type { Material } from '../types/problem';
import { materialProps } from './materialProps';

type EntityMaterialProps = {
  material: Material;
  side?: THREE.Side;
};

/**
 * Shared material element for every geometry renderer. `unlit` materials
 * render as flat meshBasicMaterial with exact (un-tone-mapped) colors —
 * matching the flat CSS look of the 2D reference demos — while everything
 * else keeps the lit meshStandardMaterial with depth cues.
 */
export function EntityMaterial({ material, side }: EntityMaterialProps) {
  if (material.unlit) {
    return (
      <meshBasicMaterial
        color={material.color}
        opacity={material.opacity}
        transparent={material.opacity < 1}
        wireframe={material.wireframe}
        toneMapped={false}
        side={side}
      />
    );
  }
  return <meshStandardMaterial {...materialProps(material)} side={side} />;
}
