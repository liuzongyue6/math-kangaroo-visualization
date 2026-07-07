import { useCallback, useRef } from 'react';
import type { Group } from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { geometryRegistry } from '../geometries';
import { PatternPlane } from './PatternPlane';
import { useRotateCoupledBehavior } from '../behaviors/useRotateCoupledBehavior';
import { useStackFallBehavior } from '../behaviors/useStackFallBehavior';
import { usePathFollowBehavior } from '../behaviors/usePathFollowBehavior';
import { useExplodeBehavior } from '../behaviors/useExplodeBehavior';
import { useHingeFoldBehavior } from '../behaviors/useHingeFoldBehavior';
import { useCircularJumpBehavior } from '../behaviors/useCircularJumpBehavior';
import { useTriggerClick } from '../behaviors/useClickCollect';
import { useGearDrag } from '../behaviors/useGearDrag';
import { useProblemStore } from '../stores/problemStore';
import type {
  CircularJumpBehavior,
  Entity,
  ExplodeBehavior,
  HingeFoldBehavior,
  PathFollowBehavior,
  ProblemConfig,
  RotateCoupledBehavior,
  StackFallBehavior,
} from '../types/problem';

function RotateCoupledHost({
  groupRef,
  entity,
  behavior,
}: {
  groupRef: React.RefObject<Group>;
  entity: Entity;
  behavior: RotateCoupledBehavior;
}) {
  useRotateCoupledBehavior(groupRef, entity, behavior);
  return null;
}

function StackFallHost({
  groupRef,
  entity,
  entities,
  behavior,
}: {
  groupRef: React.RefObject<Group>;
  entity: Entity;
  entities: Entity[];
  behavior: StackFallBehavior;
}) {
  useStackFallBehavior(groupRef, entity, entities, behavior);
  return null;
}

function ExplodeHost({
  groupRef,
  entity,
  behavior,
}: {
  groupRef: React.RefObject<Group>;
  entity: Entity;
  behavior: ExplodeBehavior;
}) {
  useExplodeBehavior(groupRef, entity, behavior);
  return null;
}

function HingeFoldHost({
  groupRef,
  behavior,
}: {
  groupRef: React.RefObject<Group>;
  behavior: HingeFoldBehavior;
}) {
  useHingeFoldBehavior(groupRef, behavior);
  return null;
}

function CircularJumpHost({
  groupRef,
  entity,
  behavior,
}: {
  groupRef: React.RefObject<Group>;
  entity: Entity;
  behavior: CircularJumpBehavior;
}) {
  useCircularJumpBehavior(groupRef, entity, behavior);
  return null;
}

function PathFollowHost({
  groupRef,
  behavior,
  path,
  onReady,
}: {
  groupRef: React.RefObject<Group>;
  behavior: PathFollowBehavior;
  path: [number, number, number][] | undefined;
  onReady: (trigger: () => void) => void;
}) {
  const trigger = usePathFollowBehavior(groupRef, behavior, path);
  onReady(trigger);
  return null;
}

type EntityNodeProps = {
  entity: Entity;
  entities: Entity[];
  paths: ProblemConfig['scene']['paths'];
  meta: ProblemConfig['meta'];
};

const LABEL_VARIANT_STYLE: Record<string, React.CSSProperties> = {
  body: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1f2430',
  },
  caption: {
    fontSize: 11,
    fontWeight: 500,
    color: '#5b6472',
  },
  chip: {
    fontSize: 12,
    fontWeight: 700,
    color: '#ffffff',
    background: '#3f51b5',
    padding: '2px 8px',
    borderRadius: 999,
  },
  // For `follow_rotation` labels rendered via Html's `transform` mode, the
  // font size is interpreted in scene world-units (see the distanceFactor
  // passed alongside `transform` below), not screen pixels — so it needs to
  // be sized relative to the entity's own scale, not typical DOM text sizes.
  symbol: {
    fontSize: 40,
    lineHeight: 1,
  },
};

// drei's Html `transform` mode scales the element by `1 / ((distanceFactor
// || 10) / 400)`; 400 cancels that out so `symbol` font sizes map ~1:1 to
// scene world-units instead of being shrunk 40x.
const FOLLOW_ROTATION_DISTANCE_FACTOR = 400;

export function EntityNode({ entity, entities, paths, meta }: EntityNodeProps) {
  const ref = useRef<Group>(null);
  const pathTriggerRef = useRef<(() => void) | null>(null);
  const collected = useProblemStore((s) => s.collected);
  const GeometryComp = geometryRegistry[entity.geometry.kind];
  const rotateBehavior = entity.behaviors.find(
    (b): b is RotateCoupledBehavior => b.kind === 'rotate_coupled',
  );
  const stackFallBehavior = entity.behaviors.find(
    (b): b is StackFallBehavior => b.kind === 'stack_fall',
  );
  const pathFollowBehavior = entity.behaviors.find(
    (b): b is PathFollowBehavior => b.kind === 'path_follow',
  );
  const explodeBehavior = entity.behaviors.find(
    (b): b is ExplodeBehavior => b.kind === 'explode',
  );
  const hingeFoldBehavior = entity.behaviors.find(
    (b): b is HingeFoldBehavior => b.kind === 'hinge_fold',
  );
  const circularJumpBehavior = entity.behaviors.find(
    (b): b is CircularJumpBehavior => b.kind === 'circular_jump',
  );
  const onCollectClick = useTriggerClick(entity, entities, meta);
  const gearDrag = useGearDrag(entity, rotateBehavior);

  const handleReady = useCallback((trigger: () => void) => {
    pathTriggerRef.current = trigger;
  }, []);

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      if (pathFollowBehavior?.trigger === 'click') {
        e.stopPropagation();
        pathTriggerRef.current?.();
        return;
      }
      onCollectClick(e);
    },
    [pathFollowBehavior, onCollectClick],
  );

  if (!GeometryComp) return null;
  if (collected.includes(entity.id)) return null;

  const [px, py, pz] = entity.transform.position;
  const [rx, ry, rz] = entity.transform.rotation;
  const [sx, sy, sz] = entity.transform.scale;

  return (
    <group
      ref={ref}
      position={[px, py, pz]}
      rotation={[rx, ry, rz]}
      scale={[sx, sy, sz]}
      onClick={entity.interactive ? handleClick : undefined}
      onPointerDown={gearDrag.onPointerDown}
      onPointerMove={gearDrag.onPointerMove}
      onPointerUp={gearDrag.onPointerUp}
      onPointerOver={gearDrag.onPointerOver}
      onPointerOut={gearDrag.onPointerOut}
    >
      <GeometryComp geo={entity.geometry} material={entity.material} />
      {entity.pattern && <PatternPlane pattern={entity.pattern} />}
      {entity.label && (
        <Html
          position={entity.label.offset}
          transform={entity.label.follow_rotation}
          distanceFactor={entity.label.follow_rotation ? FOLLOW_ROTATION_DISTANCE_FACTOR : undefined}
          center
        >
          <span style={LABEL_VARIANT_STYLE[entity.label.variant]}>
            {entity.label.text}
          </span>
        </Html>
      )}
      {rotateBehavior && (
        <RotateCoupledHost groupRef={ref} entity={entity} behavior={rotateBehavior} />
      )}
      {stackFallBehavior && (
        <StackFallHost
          groupRef={ref}
          entity={entity}
          entities={entities}
          behavior={stackFallBehavior}
        />
      )}
      {pathFollowBehavior && (
        <PathFollowHost
          groupRef={ref}
          behavior={pathFollowBehavior}
          path={paths[pathFollowBehavior.path_id]}
          onReady={handleReady}
        />
      )}
      {explodeBehavior && (
        <ExplodeHost groupRef={ref} entity={entity} behavior={explodeBehavior} />
      )}
      {hingeFoldBehavior && (
        <HingeFoldHost groupRef={ref} behavior={hingeFoldBehavior} />
      )}
      {circularJumpBehavior && (
        <CircularJumpHost groupRef={ref} entity={entity} behavior={circularJumpBehavior} />
      )}
    </group>
  );
}
