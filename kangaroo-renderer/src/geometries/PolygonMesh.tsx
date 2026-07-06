import { useMemo } from 'react';
import * as THREE from 'three';
import { Outlines } from '@react-three/drei';
import type { PolygonGeometry, Material } from '../types/problem';
import { materialProps, OUTLINE_COLOR, OUTLINE_THICKNESS } from './materialProps';

type PolygonMeshProps = {
  geo: PolygonGeometry;
  material: Material;
};

const extrudeSettings = (depth: number): THREE.ExtrudeGeometryOptions => ({
  depth,
  bevelEnabled: true,
  bevelThickness: 0.6,
  bevelSize: 0.6,
  bevelSegments: 2,
});

export function PolygonMesh({ geo, material }: PolygonMeshProps) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    geo.points.forEach(([x, y], i) => {
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    });
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, extrudeSettings(geo.depth));
  }, [geo.points, geo.depth]);

  return (
    <mesh geometry={geometry} position={[0, 0, -geo.depth / 2]} castShadow receiveShadow>
      <meshStandardMaterial {...materialProps(material)} />
      <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
    </mesh>
  );
}
