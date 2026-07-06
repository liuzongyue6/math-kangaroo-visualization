import { useMemo } from 'react';
import * as THREE from 'three';
import { Outlines } from '@react-three/drei';
import type { GearGeometry, Material } from '../types/problem';
import { materialProps, OUTLINE_COLOR, OUTLINE_THICKNESS } from './materialProps';

type GearMeshProps = {
  geo: GearGeometry;
  material: Material;
};

const GEAR_DEPTH = 12;

function buildToothShape(
  innerRadius: number,
  outerRadius: number,
  anglePerTooth: number,
  toothIndex: number,
): THREE.Shape {
  const shape = new THREE.Shape();
  const start = toothIndex * anglePerTooth;
  const end = start + anglePerTooth;
  shape.moveTo(Math.cos(start) * innerRadius, Math.sin(start) * innerRadius);
  shape.lineTo(
    Math.cos(start + 0.15) * outerRadius,
    Math.sin(start + 0.15) * outerRadius,
  );
  shape.lineTo(
    Math.cos(end - 0.15) * outerRadius,
    Math.sin(end - 0.15) * outerRadius,
  );
  shape.lineTo(Math.cos(end) * innerRadius, Math.sin(end) * innerRadius);
  shape.closePath();
  return shape;
}

function buildGearShape(
  innerRadius: number,
  outerRadius: number,
  teeth: number,
  anglePerTooth: number,
): THREE.Shape {
  const shape = new THREE.Shape();

  for (let i = 0; i < teeth; i++) {
    const start = i * anglePerTooth;
    const end = start + anglePerTooth;
    const points: [number, number][] = [
      [Math.cos(start) * innerRadius, Math.sin(start) * innerRadius],
      [
        Math.cos(start + 0.15) * outerRadius,
        Math.sin(start + 0.15) * outerRadius,
      ],
      [
        Math.cos(end - 0.15) * outerRadius,
        Math.sin(end - 0.15) * outerRadius,
      ],
      [Math.cos(end) * innerRadius, Math.sin(end) * innerRadius],
    ];

    if (i === 0) {
      shape.moveTo(points[0][0], points[0][1]);
    } else {
      shape.lineTo(points[0][0], points[0][1]);
    }
    shape.lineTo(points[1][0], points[1][1]);
    shape.lineTo(points[2][0], points[2][1]);
    shape.lineTo(points[3][0], points[3][1]);
  }

  shape.closePath();
  return shape;
}

const extrudeSettings: THREE.ExtrudeGeometryOptions = {
  depth: GEAR_DEPTH,
  bevelEnabled: true,
  bevelThickness: 1.2,
  bevelSize: 1.2,
  bevelSegments: 4,
};

export function GearMesh({ geo, material }: GearMeshProps) {
  const markedIndex = geo.marked_tooth_index;

  const innerRadius = geo.radius - geo.tooth_depth;
  const outerRadius = geo.radius + geo.tooth_depth;
  const anglePerTooth = (Math.PI * 2) / geo.teeth;

  const bodyGeometry = useMemo(() => {
    const shape = buildGearShape(innerRadius, outerRadius, geo.teeth, anglePerTooth);
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [geo.teeth, innerRadius, outerRadius, anglePerTooth]);

  const markedToothGeometry = useMemo(() => {
    if (markedIndex === null) return null;
    const shape = buildToothShape(
      innerRadius,
      outerRadius,
      anglePerTooth,
      markedIndex,
    );
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [markedIndex, innerRadius, outerRadius, anglePerTooth]);

  const zOffset = -GEAR_DEPTH / 2;

  return (
    <group>
      <mesh geometry={bodyGeometry} position={[0, 0, zOffset]} castShadow receiveShadow>
        <meshStandardMaterial {...materialProps(material)} />
        <Outlines thickness={OUTLINE_THICKNESS} color={OUTLINE_COLOR} />
      </mesh>
      {markedToothGeometry !== null && (
        <mesh geometry={markedToothGeometry} position={[0, 0, zOffset]} castShadow>
          <meshStandardMaterial color="#2b2f38" roughness={0.5} />
        </mesh>
      )}
      <mesh position={[0, 0, 0.2]}>
        <circleGeometry args={[8, 32]} />
        <meshStandardMaterial color="#2b2f38" roughness={0.5} />
      </mesh>
    </group>
  );
}
