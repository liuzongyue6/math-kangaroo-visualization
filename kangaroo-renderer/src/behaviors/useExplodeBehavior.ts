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
  const currentFactor = useRef(1);
  const [ox, oy, oz] = entity.transform.position;

  useEffect(() => {
    invalidate();
  }, [isExploded, invalidate]);

  useFrame(() => {
    if (!ref.current) return;

    const target = useProblemStore.getState().isExploded ? behavior.target_factor : 1;
    currentFactor.current += (target - currentFactor.current) * behavior.speed;

    ref.current.position.set(
      ox * currentFactor.current,
      oy * currentFactor.current,
      oz * currentFactor.current,
    );

    if (Math.abs(target - currentFactor.current) > SETTLE_EPSILON) {
      invalidate();
    }
  });
}
