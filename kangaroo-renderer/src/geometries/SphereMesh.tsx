import { Outlines } from '@react-three/drei';
import type { SphereGeometry, Material } from '../types/problem';
import { materialProps, OUTLINE_COLOR, OUTLINE_THICKNESS } from './materialProps';

type SphereMeshProps = {
  geo: SphereGeometry;
  material: Material;
};

export function SphereMesh({ geo, material }: SphereMeshProps) {
  return (
    <mesh castShadow receiveShadow>
      <sphereGeometry args={[geo.radius, 32, 32]} />
      <meshStandardMaterial {...materialProps(material)} />
      <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
    </mesh>
  );
}
