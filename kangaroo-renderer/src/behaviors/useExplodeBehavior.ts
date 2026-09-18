import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { Group } from 'three';
import { useProblemStore } from '../stores/problemStore';
import type { Entity, ExplodeBehavior } from '../types/problem';

const SETTLE_EPSILON = 0.001;

export function useExplodeBehavior(
  ref: React.RefObject<Group>,
  entity: Entity,
  behavior: ExplodeBehavior,
) {
  const isExploded = useProblemStore((s) => s.isExploded);
  const { invalidate } = useThree();
  // 0 = assembled, 1 = fully exploded; eased toward the target each frame.
  const progress = useRef(0);
  const [ox, oy, oz] = entity.transform.position;

  useEffect(() => {
    invalidate();
  }, [isExploded, invalidate]);

  useFrame(() => {
    if (!ref.current) return;

    const target = useProblemStore.getState().isExploded ? 1 : 0;
    progress.current += (target - progress.current) * behavior.speed;
    const t = progress.current;

    if (behavior.offset) {
      const [dx, dy, dz] = behavior.offset;
      ref.current.position.set(ox + dx * t, oy + dy * t, oz + dz * t);
    } else {
      const factor = 1 + (behavior.target_factor - 1) * t;
      ref.current.position.set(ox * factor, oy * factor, oz * factor);
    }

    if (Math.abs(target - t) > SETTLE_EPSILON) {
      invalidate();
    }
  });
}
