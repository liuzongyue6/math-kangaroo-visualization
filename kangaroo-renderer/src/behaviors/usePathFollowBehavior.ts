import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { Group } from 'three';
import { useProblemStore } from '../stores/problemStore';
import type { PathFollowBehavior } from '../types/problem';

/** Moves an entity along a named path (see SceneConfig.paths). Powers
 * maze / number-line style problems. Returns a `trigger()` you can wire to
 * an onClick when `behavior.trigger === "click"`. */
export function usePathFollowBehavior(
  ref: React.RefObject<Group>,
  behavior: PathFollowBehavior,
  path: [number, number, number][] | undefined,
) {
  const isPlaying = useProblemStore((s) => s.isPlaying);
  const { invalidate } = useThree();
  const progressRef = useRef(0);
  const activeRef = useRef(behavior.trigger === 'auto');

  const curve = useMemo(() => {
    if (!path || path.length < 2) return null;
    return new THREE.CatmullRomCurve3(
      path.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    );
  }, [path]);

  useEffect(() => {
    if (behavior.trigger === 'auto') {
      activeRef.current = true;
      progressRef.current = 0;
    }
  }, [behavior.trigger, curve]);

  const trigger = useCallback(() => {
    progressRef.current = 0;
    activeRef.current = true;
    invalidate();
  }, [invalidate]);

  useFrame((_, delta) => {
    if (!ref.current || !curve || !activeRef.current || !isPlaying) return;

    progressRef.current += delta / Math.max(behavior.duration, 0.0001);

    if (progressRef.current >= 1) {
      progressRef.current = behavior.loop ? progressRef.current % 1 : 1;
      if (!behavior.loop) activeRef.current = false;
    }

    const point = curve.getPointAt(Math.min(progressRef.current, 1));
    ref.current.position.set(point.x, point.y, point.z);
    invalidate();
  });

  return trigger;
}
