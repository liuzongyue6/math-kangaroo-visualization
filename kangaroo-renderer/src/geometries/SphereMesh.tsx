import { Outlines } from '@react-three/drei';
import type { SphereGeometry, Material } from '../types/problem';
import { OUTLINE_COLOR, OUTLINE_THICKNESS } from './materialProps';
import { EntityMaterial } from './EntityMaterial';

type SphereMeshProps = {
  geo: SphereGeometry;
  material: Material;
};

export function SphereMesh({ geo, material }: SphereMeshProps) {
  return (
    <mesh castShadow receiveShadow>
      <sphereGeometry args={[geo.radius, 32, 32]} />
      <EntityMaterial material={material} />
      <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
    </mesh>
  );
}
