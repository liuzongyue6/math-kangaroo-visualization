import { useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { useProblemStore } from '../stores/problemStore';
import type { Entity, ProblemConfig } from '../types/problem';

export function useColumnClickHandler(
  entities: Entity[],
  meta: ProblemConfig['meta'],
) {
  const collected = useProblemStore((s) => s.collected);
  const incrementCoin = useProblemStore((s) => s.incrementCoin);
  const addHistory = useProblemStore((s) => s.addHistory);
  const markCollected = useProblemStore((s) => s.markCollected);
  const setMessage = useProblemStore((s) => s.setMessage);
  const { invalidate } = useThree();

  return useCallback(
    (groupId: string) => {
      const ballsInGroup = entities.filter(
        (e) =>
          e.group_id === groupId &&
          e.geometry.kind === 'sphere' &&
          !collected.includes(e.id),
      );

      if (ballsInGroup.length === 0) return;

      const topBall = ballsInGroup.reduce((top, ball) => {
        const topBehavior = top.behaviors.find((b) => b.kind === 'click_collect');
        const ballBehavior = ball.behaviors.find((b) => b.kind === 'click_collect');
        const topOrder = topBehavior?.kind === 'click_collect' ? topBehavior.stack_order : 0;
        const ballOrder = ballBehavior?.kind === 'click_collect' ? ballBehavior.stack_order : 0;
        return ballOrder > topOrder ? ball : top;
      });

      const collectBehavior = topBall.behaviors.find(
        (b) => b.kind === 'click_collect',
      );
      if (collectBehavior?.kind !== 'click_collect') return;

      incrementCoin();
      if (collectBehavior.color) {
        addHistory(collectBehavior.color);
      }
      markCollected(topBall.id);

      if (
        collectBehavior.on_collect_effect === 'white_ball_message' &&
        meta.on_white_collect_message
      ) {
        setMessage(meta.on_white_collect_message);
      }

      invalidate();
    },
    [
      entities,
      collected,
      incrementCoin,
      addHistory,
      markCollected,
      setMessage,
      meta,
      invalidate,
    ],
  );
}

export function useTriggerClick(
  entity: Entity,
  entities: Entity[],
  meta: ProblemConfig['meta'],
) {
  const handleColumnClick = useColumnClickHandler(entities, meta);

  return useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (entity.group_id) {
        handleColumnClick(entity.group_id);
      }
    },
    [entity.group_id, handleColumnClick],
  );
}
