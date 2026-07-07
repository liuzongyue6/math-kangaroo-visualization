import { useMemo } from 'react';
import { Html } from '@react-three/drei';
import type { CircularTrackGeometry, Material } from '../types/problem';
import { resolveParam } from '../types/problem';
import { useProblemStore } from '../stores/problemStore';

type CircularTrackMeshProps = {
  geo: CircularTrackGeometry;
  material: Material;
};

const CAPTION_STYLE: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  color: '#5b6472',
  whiteSpace: 'nowrap',
};

/**
 * Procedural circular race track: backdrop disc + `num_nodes` node spheres
 * with START/FINISH captions. `num_nodes` may be a ParamRef bound to a
 * runtime problem parameter, so the track rebuilds live when the user
 * changes the value in the control bar (no regenerated JSON needed).
 */
export function CircularTrackMesh({ geo }: CircularTrackMeshProps) {
  const paramValues = useProblemStore((s) => s.paramValues);
  const numNodes = Math.max(2, Math.round(resolveParam(geo.num_nodes, paramValues, 20)));
  const finishNode = geo.finish_node ?? Math.floor(numNodes / 2);

  const nodePositions = useMemo(
    () =>
      Array.from({ length: numNodes }, (_, i) => {
        const angle = (i / numNodes) * Math.PI * 2;
        return [
          geo.radius * Math.sin(angle),
          geo.radius * Math.cos(angle),
          0,
        ] as [number, number, number];
      }),
    [numNodes, geo.radius],
  );

  const backdropRadius = geo.radius + geo.backdrop_margin;

  return (
    <group>
      {geo.backdrop_color && (
        <mesh position={[0, 0, geo.backdrop_z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry
            args={[backdropRadius, backdropRadius, geo.backdrop_thickness, 64]}
          />
          {/* Unlit flat colors: a 2D-diagram track should look like the flat
              CSS reference demo, not a shaded 3D prop. */}
          <meshBasicMaterial color={geo.backdrop_color} toneMapped={false} />
        </mesh>
      )}
      {nodePositions.map((position, i) => (
        <group key={i} position={position}>
          <mesh>
            <sphereGeometry args={[geo.node_radius, 24, 24]} />
            <meshBasicMaterial color={geo.node_color} toneMapped={false} />
          </mesh>
          {i === 0 && (
            <Html position={[0, 22, 0]} center zIndexRange={[10, 0]}>
              <span style={CAPTION_STYLE}>START (0)</span>
            </Html>
          )}
          {i === finishNode && i !== 0 && (
            <Html position={[0, -22, 0]} center zIndexRange={[10, 0]}>
              <span style={CAPTION_STYLE}>FINISH ({finishNode})</span>
            </Html>
          )}
        </group>
      ))}
    </group>
  );
}
