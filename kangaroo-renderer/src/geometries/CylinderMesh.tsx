import * as THREE from 'three';
import { Outlines } from '@react-three/drei';
import type { CylinderGeometry, Material } from '../types/problem';
import { materialProps, OUTLINE_COLOR, OUTLINE_THICKNESS } from './materialProps';

type CylinderMeshProps = {
  geo: CylinderGeometry;
  material: Material;
};

export function CylinderMesh({ geo, material }: CylinderMeshProps) {
  const radiusBottom = geo.radius_bottom ?? geo.radius_top;

  return (
    <mesh castShadow receiveShadow>
      <cylinderGeometry
        args={[geo.radius_top, radiusBottom, geo.height, geo.radial_segments, 1, geo.open_ended]}
      />
      <meshStandardMaterial {...materialProps(material)} side={THREE.DoubleSide} />
      {material.opacity >= 1 && (
        <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
      )}
    </mesh>
  );
}
