import { useEffect, useLayoutEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera, PerspectiveCamera } from '@react-three/drei';
import type { Group } from 'three';
import type { Entity, ProblemConfig } from '../types/problem';
import { EntityNode } from './EntityNode';
import { DemandFrameInvalidator } from './DemandFrameInvalidator';
import { useProblemStore } from '../stores/problemStore';
import { clampDelta } from '../behaviors/clampDelta';

// Tween speed for the fold pose, in degrees per second (0 -> 90 in 0.5s).
const FOLD_TWEEN_DEG_PER_S = 180;

/**
 * Walks the rendered fold pose (`foldAngleAnimated`) toward the target
 * (`foldAngle`) at a constant angular speed, so value jumps — clicking the
 * slider track, Reset — fold/unfold smoothly instead of snapping. While the
 * user drags the slider the target changes continuously and the pose tracks
 * it closely, matching the reference demo's direct-drag feel.
 */
function FoldTweenDriver() {
  const foldAngle = useProblemStore((s) => s.foldAngle);
  const setFoldAngleAnimated = useProblemStore((s) => s.setFoldAngleAnimated);
  const invalidate = useThree((s) => s.invalidate);

  // Kick the demand frameloop whenever the target moves.
  useEffect(() => {
    invalidate();
  }, [foldAngle, invalidate]);

  useFrame((_, delta) => {
    const { foldAngle: target, foldAngleAnimated: current } = useProblemStore.getState();
    if (current === target) return;
    const step = FOLD_TWEEN_DEG_PER_S * clampDelta(delta);
    const next =
      Math.abs(target - current) <= step ? target : current + Math.sign(target - current) * step;
    setFoldAngleAnimated(next);
    invalidate();
  });

  return null;
}

type SceneInterpreterProps = {
  config: ProblemConfig['scene'];
  camera: ProblemConfig['camera'];
  meta: ProblemConfig['meta'];
};

/**
 * Counter-shifts the scene as the global fold angle changes so the folding
 * solid stays centered under the (fixed) orbit target — the analog of the
 * CSS reference demo's dynamic `--center-z` transform-origin. `shift` is
 * the folded solid's center offset at foldAngle = +90deg; the group is
 * translated by -(foldAngle/90) * shift. Runs in an effect (not useFrame)
 * for the same demand-frameloop reasons as useHingeFoldBehavior.
 */
function FoldCenterGroup({
  shift,
  children,
}: {
  shift: [number, number, number];
  children: React.ReactNode;
}) {
  const groupRef = useRef<Group>(null);
  const foldAngle = useProblemStore((s) => s.foldAngleAnimated);
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    if (!groupRef.current) return;
    const f = foldAngle / 90;
    groupRef.current.position.set(-f * shift[0], -f * shift[1], -f * shift[2]);
    groupRef.current.updateMatrixWorld(true);
    invalidate();
  }, [foldAngle, shift, invalidate]);

  return <group ref={groupRef}>{children}</group>;
}

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
  const hasFold = config.entities.some((e) =>
    e.behaviors.some((b) => b.kind === 'hinge_fold'),
  );

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
      {hasFold && <FoldTweenDriver />}
      {(() => {
        const entityNodes = config.entities.map((e: Entity) => (
          <EntityNode
            key={e.id}
            entity={e}
            entities={config.entities}
            paths={config.paths}
            meta={meta}
          />
        ));
        return camera.fold_center_shift ? (
          <FoldCenterGroup shift={camera.fold_center_shift}>{entityNodes}</FoldCenterGroup>
        ) : (
          entityNodes
        );
      })()}
    </>
  );
}
