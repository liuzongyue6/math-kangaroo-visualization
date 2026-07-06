import { useCallback, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { Group } from 'three';
import { useProblemStore } from '../stores/problemStore';
import type { Entity, RotateCoupledBehavior } from '../types/problem';

function computeAngle(
  entity: Entity,
  behavior: RotateCoupledBehavior,
  driverAngles: Record<string, number>,
): number {
  if (behavior.driver_id === null) {
    return driverAngles[entity.id] ?? 0;
  }
  const driverAngle = driverAngles[behavior.driver_id] ?? 0;
  return driverAngle * behavior.ratio + behavior.initial_rotation;
}

export function useRotateCoupledBehavior(
  ref: React.RefObject<Group>,
  entity: Entity,
  behavior: RotateCoupledBehavior,
) {
  const isPlaying = useProblemStore((s) => s.isPlaying);
  const setRotation = useProblemStore((s) => s.setRotation);
  const setDriverAngle = useProblemStore((s) => s.setDriverAngle);
  const driverAngles = useProblemStore((s) => s.driverAngles);
  const { invalidate } = useThree();

  const applyRotation = useCallback(
    (angles: Record<string, number>) => {
      if (!ref.current) return;
      const angle = computeAngle(entity, behavior, angles);
      ref.current.rotation.z = angle;
      setRotation(entity.id, angle);
    },
    [ref, entity, behavior, setRotation],
  );

  useFrame(() => {
    if (!ref.current) return;

    const state = useProblemStore.getState();
    let angles = state.driverAngles;

    if (behavior.driver_id === null && state.isPlaying) {
      const driverAngle =
        (angles[entity.id] ?? 0) + behavior.speed * behavior.direction;
      setDriverAngle(entity.id, driverAngle);
      angles = { ...angles, [entity.id]: driverAngle };
    }

    applyRotation(angles);

    if (state.isPlaying) {
      invalidate();
    }
  });

  useEffect(() => {
    applyRotation(driverAngles);
    invalidate();
  }, [driverAngles, isPlaying, applyRotation, invalidate]);
}
