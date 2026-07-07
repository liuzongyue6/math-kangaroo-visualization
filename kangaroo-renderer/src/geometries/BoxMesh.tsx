import { Outlines, RoundedBox } from '@react-three/drei';
import type { BoxGeometry, Material } from '../types/problem';
import { OUTLINE_COLOR, OUTLINE_THICKNESS } from './materialProps';
import { EntityMaterial } from './EntityMaterial';

type BoxMeshProps = {
  geo: BoxGeometry;
  material: Material;
};

export function BoxMesh({ geo, material }: BoxMeshProps) {
  const [w, h, d] = geo.size;

  if (geo.corner_radius > 0) {
    const radius = Math.min(geo.corner_radius, w / 2, h / 2, d / 2);
    return (
      <RoundedBox args={[w, h, d]} radius={radius} smoothness={4} castShadow receiveShadow>
        <EntityMaterial material={material} />
        <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
      </RoundedBox>
    );
  }

  return (
    <mesh castShadow receiveShadow>
      <boxGeometry args={geo.size} />
      <EntityMaterial material={material} />
      {material.opacity >= 1 && (
        <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
      )}
    </mesh>
  );
}
