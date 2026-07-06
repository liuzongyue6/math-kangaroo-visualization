import { useCallback, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { useProblemStore } from '../stores/problemStore';
import type { Entity, RotateCoupledBehavior } from '../types/problem';

/** Shortest signed angular distance from `from` to `to`, in (-PI, PI]. */
function shortestAngleDelta(from: number, to: number): number {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}

/**
 * Lets the user grab a gear with the mouse and spin it by hand once the
 * animation is paused. Dragging either the driver gear or a driven gear
 * updates the same underlying driver angle in the store (converting through
 * the gear ratio when needed), so both gears stay correctly meshed exactly
 * like real gears.
 */
export function useGearDrag(entity: Entity, behavior: RotateCoupledBehavior | undefined) {
  const { gl } = useThree();
  const draggingRef = useRef(false);
  const lastAngleRef = useRef(0);

  const [cx, cy] = entity.transform.position;

  const pointerAngle = useCallback(
    (e: ThreeEvent<PointerEvent>) => Math.atan2(e.point.y - cy, e.point.x - cx),
    [cx, cy],
  );

  const onPointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!behavior || useProblemStore.getState().isPlaying) return;
      e.stopPropagation();
      draggingRef.current = true;
      lastAngleRef.current = pointerAngle(e);
      (e.target as Element).setPointerCapture(e.pointerId);
      gl.domElement.style.cursor = 'grabbing';
    },
    [behavior, pointerAngle, gl],
  );

  const onPointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!behavior || !draggingRef.current) return;
      e.stopPropagation();

      const angle = pointerAngle(e);
      const delta = shortestAngleDelta(lastAngleRef.current, angle);
      lastAngleRef.current = angle;

      const driverId = behavior.driver_id ?? entity.id;
      const driverDelta = behavior.driver_id === null ? delta : delta / behavior.ratio;
      const current = useProblemStore.getState().driverAngles[driverId] ?? 0;
      useProblemStore.getState().setDriverAngle(driverId, current + driverDelta);
    },
    [behavior, entity.id, pointerAngle],
  );

  const onPointerUp = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!behavior || !draggingRef.current) return;
      draggingRef.current = false;
      (e.target as Element).releasePointerCapture(e.pointerId);
      gl.domElement.style.cursor = useProblemStore.getState().isPlaying ? 'auto' : 'grab';
    },
    [behavior, gl],
  );

  const onPointerOver = useCallback(() => {
    if (!behavior || useProblemStore.getState().isPlaying) return;
    gl.domElement.style.cursor = 'grab';
  }, [behavior, gl]);

  const onPointerOut = useCallback(() => {
    if (!behavior || draggingRef.current) return;
    gl.domElement.style.cursor = 'auto';
  }, [behavior]);

  if (!behavior) {
    return {
      onPointerDown: undefined,
      onPointerMove: undefined,
      onPointerUp: undefined,
      onPointerOver: undefined,
      onPointerOut: undefined,
    };
  }

  return { onPointerDown, onPointerMove, onPointerUp, onPointerOver, onPointerOut };
}
