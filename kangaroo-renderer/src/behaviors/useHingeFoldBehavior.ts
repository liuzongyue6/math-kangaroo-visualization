import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Quaternion, Vector3 } from 'three';
import type { Group } from 'three';
import { useProblemStore } from '../stores/problemStore';
import type { HingeFoldBehavior } from '../types/problem';

const AXIS_VECTORS: Record<'x' | 'y' | 'z', Vector3> = {
  x: new Vector3(1, 0, 0),
  y: new Vector3(0, 1, 0),
  z: new Vector3(0, 0, 1),
};

/**
 * Animates a flat net folding into a 3D solid. Walks `behavior.chain`
 * (root-first) and composes each joint's pivot translation (in the frame
 * established by prior joints) followed by its own rotation about the
 * shared global `foldAngle`, then writes the result directly to the
 * entity's group position/quaternion.
 *
 * The fold angle has no easing (it's a direct 1:1 slider readout, like the
 * reference CSS demo), so this runs in a plain effect rather than
 * `useFrame`: an effect is guaranteed to commit before the next R3F render,
 * which matters because drei's `Html` `transform` mode reads
 * `object.matrixWorld` from its OWN `useFrame` callback — if we instead
 * wrote the transform inside `useFrame`, subscriber ordering could let
 * Html's callback read a stale (one-frame-behind) matrixWorld under
 * `frameloop="demand"`, making labels visibly detach from their face.
 */
export function useHingeFoldBehavior(
  ref: React.RefObject<Group>,
  behavior: HingeFoldBehavior,
) {
  // The tweened pose (see FoldTweenDriver), not the raw slider target — so
  // target jumps (slider track clicks, reset) fold smoothly.
  const foldAngle = useProblemStore((s) => s.foldAngleAnimated);
  const { invalidate } = useThree();

  useEffect(() => {
    if (!ref.current) return;

    const foldRad = (foldAngle * Math.PI) / 180;
    const pos = new Vector3();
    const quat = new Quaternion();

    for (const joint of behavior.chain) {
      const jointOffset = new Vector3(...joint.pivot).applyQuaternion(quat);
      pos.add(jointOffset);
      const jointQuat = new Quaternion().setFromAxisAngle(
        AXIS_VECTORS[joint.axis],
        joint.sign * foldRad,
      );
      quat.multiply(jointQuat);
    }

    ref.current.position.copy(pos);
    ref.current.quaternion.copy(quat);
    ref.current.updateMatrixWorld(true);
    invalidate();
  }, [foldAngle, behavior, ref, invalidate]);
}
