import { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { Group } from 'three';
import { useProblemStore } from '../stores/problemStore';
import type { Entity, StackFallBehavior } from '../types/problem';

function getStackOrder(entity: Entity, groupId: string): number | null {
  const behavior = entity.behaviors.find(
    (b): b is StackFallBehavior => b.kind === 'stack_fall' && b.group_id === groupId,
  );
  return behavior?.stack_order ?? null;
}

function getColumnLayout(entities: Entity[], groupId: string) {
  const columnEntities = entities.filter(
    (e) => getStackOrder(e, groupId) !== null,
  );

  const sorted = [...columnEntities].sort(
    (a, b) => (getStackOrder(a, groupId) ?? 0) - (getStackOrder(b, groupId) ?? 0),
  );

  const slotY = new Map<number, number>();
  for (const item of sorted) {
    const order = getStackOrder(item, groupId)!;
    slotY.set(order, item.transform.position[1]);
  }

  const orders = sorted.map((e) => getStackOrder(e, groupId)!);
  const bottomOrder = Math.min(...orders);
  const bottomY = slotY.get(bottomOrder) ?? 0;
  const nextY = slotY.get(bottomOrder + 1);
  const spacing = nextY !== undefined ? nextY - bottomY : 0;

  return {
    bottomY,
    spacing,
    totalCount: sorted.length,
  };
}

function computeTargetY(
  entity: Entity,
  entities: Entity[],
  collected: string[],
  groupId: string,
): number {
  const { bottomY, spacing, totalCount } = getColumnLayout(entities, groupId);

  const remaining = entities
    .filter((e) => getStackOrder(e, groupId) !== null && !collected.includes(e.id))
    .sort((a, b) => (getStackOrder(a, groupId) ?? 0) - (getStackOrder(b, groupId) ?? 0));

  const visualIndex = remaining.findIndex((e) => e.id === entity.id);
  if (visualIndex < 0) {
    return entity.transform.position[1];
  }

  const collectedInGroup = totalCount - remaining.length;
  const targetSlot = collectedInGroup + visualIndex;
  return bottomY + targetSlot * spacing;
}

export function useStackFallBehavior(
  ref: React.RefObject<Group>,
  entity: Entity,
  entities: Entity[],
  behavior: StackFallBehavior,
) {
  const collected = useProblemStore((s) => s.collected);
  const { invalidate } = useThree();

  const targetY = useMemo(
    () => computeTargetY(entity, entities, collected, behavior.group_id),
    [entity, entities, collected, behavior.group_id],
  );

  useFrame((_, delta) => {
    if (!ref.current) return;

    const currentY = ref.current.position.y;
    if (Math.abs(currentY - targetY) < 0.01) {
      if (currentY !== targetY) {
        ref.current.position.y = targetY;
      }
      return;
    }

    const fallDurationSec = Math.max(behavior.fall_duration_ms, 1) / 1000;
    const t = Math.min(1, delta / fallDurationSec);
    ref.current.position.y = currentY + (targetY - currentY) * t;
    invalidate();
  });
}
