import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { Group } from 'three';
import { useProblemStore, JUMP_DURATION_MS } from '../stores/problemStore';
import type { CircularJumpBehavior, Entity } from '../types/problem';
import { resolveParam } from '../types/problem';
import { clampDelta } from './clampDelta';

const JUMP_DURATION_S = JUMP_DURATION_MS / 1000;

function positionAt(
  behavior: CircularJumpBehavior,
  numNodes: number,
  exactIndex: number,
  arc: number,
): [number, number, number] {
  const angle = (exactIndex / numNodes) * Math.PI * 2;
  const r = behavior.radius + behavior.lane_offset + arc;
  const [cx, cy] = behavior.center;
  return [cx + r * Math.sin(angle), cy + r * Math.cos(angle), arc * 0.05];
}

/** Discrete, turn-based hop around a shared circular node layout. Advances
 * `behavior.step` nodes every time the global `turnCount` increments (see
 * ControlBar's "Jump" button / `stepTurn`), with a parabolic hop arc, and
 * freezes once it lands exactly on the finish node. `num_nodes` may be a
 * ParamRef bound to a runtime parameter; `finish_node: null` means
 * "diametrically opposite START" (floor(num_nodes / 2)). */
export function useCircularJumpBehavior(
  ref: React.RefObject<Group>,
  entity: Entity,
  behavior: CircularJumpBehavior,
) {
  const turnCount = useProblemStore((s) => s.turnCount);
  const markJumpFinished = useProblemStore((s) => s.markJumpFinished);
  const paramValues = useProblemStore((s) => s.paramValues);
  const { invalidate } = useThree();

  const numNodes = Math.max(2, Math.round(resolveParam(behavior.num_nodes, paramValues, 20)));
  const finishNode = behavior.finish_node ?? Math.floor(numNodes / 2);

  const posRef = useRef(0);
  const startRef = useRef(0);
  const targetRef = useRef(0);
  const progressRef = useRef(1); // 1 = at rest (not mid-jump)
  const finishedRef = useRef(false);
  // Seeded with the current value so a stale leftover turnCount from a
  // previously-loaded problem never triggers a spurious jump on mount.
  const lastTurnRef = useRef(turnCount);

  useEffect(() => {
    if (turnCount === 0) {
      posRef.current = 0;
      startRef.current = 0;
      targetRef.current = 0;
      progressRef.current = 1;
      finishedRef.current = false;
      lastTurnRef.current = 0;
      if (ref.current) {
        const [x, y, z] = positionAt(behavior, numNodes, 0, 0);
        ref.current.position.set(x, y, z);
      }
      invalidate();
      return;
    }

    if (turnCount === lastTurnRef.current || finishedRef.current) return;
    lastTurnRef.current = turnCount;

    startRef.current = posRef.current;
    targetRef.current = posRef.current + behavior.step;
    progressRef.current = 0;
    invalidate();
    // Only turnCount transitions (and track-size parameter changes, which
    // reset turnCount to 0 via setParam) should reposition the racer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turnCount, numNodes]);

  useFrame((_, delta) => {
    if (!ref.current || progressRef.current >= 1) return;

    // clampDelta: after an idle demand-frameloop gap the first frame's raw
    // delta can span seconds, which would complete the hop instantly.
    progressRef.current = Math.min(
      progressRef.current + clampDelta(delta) / JUMP_DURATION_S,
      1,
    );
    const exactIndex =
      startRef.current + (targetRef.current - startRef.current) * progressRef.current;
    const arc = Math.sin(progressRef.current * Math.PI) * behavior.jump_height;
    const [x, y, z] = positionAt(behavior, numNodes, exactIndex, arc);
    ref.current.position.set(x, y, z);
    invalidate();

    if (progressRef.current >= 1) {
      posRef.current = targetRef.current;
      if (posRef.current > 0 && posRef.current % numNodes === finishNode) {
        finishedRef.current = true;
        markJumpFinished(entity.id, lastTurnRef.current);
      }
    }
  });
}
