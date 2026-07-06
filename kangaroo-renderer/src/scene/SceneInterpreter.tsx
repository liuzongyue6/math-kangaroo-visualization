import { useLayoutEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera, PerspectiveCamera } from '@react-three/drei';
import type { Entity, ProblemConfig } from '../types/problem';
import { EntityNode } from './EntityNode';
import { DemandFrameInvalidator } from './DemandFrameInvalidator';

type SceneInterpreterProps = {
  config: ProblemConfig['scene'];
  camera: ProblemConfig['camera'];
  meta: ProblemConfig['meta'];
};

function CameraLookAt({ lookAt }: { lookAt: [number, number, number] }) {
  const camera = useThree((s) => s.camera);

  useLayoutEffect(() => {
    camera.lookAt(...lookAt);
    camera.updateProjectionMatrix();
  }, [camera, lookAt]);

  return null;
}

export function SceneInterpreter({ config, camera, meta }: SceneInterpreterProps) {
  const halfW = camera.viewport_width / 2;
  const halfH = camera.viewport_height / 2;
  const isPerspective = camera.mode === 'perspective';
  const controlsMode = camera.controls;

  return (
    <>
      {isPerspective ? (
        <PerspectiveCamera
          makeDefault
          position={camera.position}
          fov={camera.fov ?? 45}
          near={0.1}
          far={2000}
        />
      ) : (
        <OrthographicCamera
          makeDefault
          position={camera.position}
          zoom={camera.zoom ?? 1}
          near={0.1}
          far={2000}
          left={-halfW}
          right={halfW}
          top={halfH}
          bottom={-halfH}
        />
      )}
      <CameraLookAt lookAt={camera.look_at} />
      {controlsMode !== 'locked' && (
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minPolarAngle={controlsMode === 'limited' ? camera.min_polar_angle ?? 0 : 0}
          maxPolarAngle={
            controlsMode === 'limited' ? camera.max_polar_angle ?? Math.PI : Math.PI
          }
          minDistance={200}
          maxDistance={900}
          target={camera.look_at}
        />
      )}
      <ambientLight intensity={0.9} />
      <directionalLight
        position={[6, 9, 12]}
        intensity={0.85}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      />
      <directionalLight position={[-6, -3, 6]} intensity={0.3} />
      <DemandFrameInvalidator />
      {config.entities.map((e: Entity) => (
        <EntityNode
          key={e.id}
          entity={e}
          entities={config.entities}
          paths={config.paths}
          meta={meta}
        />
      ))}
    </>
  );
}
