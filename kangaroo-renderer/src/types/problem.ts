/** Reference to a runtime problem parameter (see ProblemMeta.params).
 * Resolved against the store's live `paramValues` via `resolveParam`. */
export type ParamRef = { $param: string };

export type Bindable = number | ParamRef;

export function isParamRef(value: Bindable | null | undefined): value is ParamRef {
  return typeof value === 'object' && value !== null && '$param' in value;
}

export function resolveParam(
  value: Bindable | null | undefined,
  paramValues: Record<string, number>,
  fallback = 0,
): number {
  if (value == null) return fallback;
  if (isParamRef(value)) return paramValues[value.$param] ?? fallback;
  return value;
}

export type Transform = {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
};

export type Material = {
  color: string;
  opacity: number;
  metalness: number;
  roughness: number;
  wireframe: boolean;
  /** True => unlit flat color (meshBasicMaterial), the right look for 2D
   * diagram problems. Older problem JSONs omit this field. */
  unlit?: boolean;
};

export type GearGeometry = {
  kind: 'gear';
  radius: number;
  teeth: number;
  tooth_depth: number;
  marked_tooth_index: number | null;
};

export type SphereGeometry = {
  kind: 'sphere';
  radius: number;
};

export type BoxGeometry = {
  kind: 'box';
  size: [number, number, number];
  corner_radius: number;
};

export type CylinderGeometry = {
  kind: 'cylinder';
  radius_top: number;
  radius_bottom: number | null;
  height: number;
  radial_segments: number;
  open_ended: boolean;
};

export type PolygonGeometry = {
  kind: 'polygon';
  points: [number, number][];
  depth: number;
};

export type CircularTrackGeometry = {
  kind: 'circular_track';
  num_nodes: Bindable;
  radius: number;
  node_radius: number;
  node_color: string;
  backdrop_color: string | null;
  backdrop_margin: number;
  backdrop_thickness: number;
  backdrop_z: number;
  finish_node: number | null;
};

export type Geometry =
  | GearGeometry
  | SphereGeometry
  | BoxGeometry
  | CylinderGeometry
  | PolygonGeometry
  | CircularTrackGeometry;

export type RotateCoupledBehavior = {
  kind: 'rotate_coupled';
  driver_id: string | null;
  ratio: number;
  direction: 1 | -1;
  speed: number;
  initial_rotation: number;
};

export type ClickCollectBehavior = {
  kind: 'click_collect';
  group_id: string;
  stack_order: number;
  on_collect_effect: string | null;
  color: string | null;
};

export type StackFallBehavior = {
  kind: 'stack_fall';
  group_id: string;
  stack_order: number;
  fall_duration_ms: number;
};

export type PathFollowBehavior = {
  kind: 'path_follow';
  path_id: string;
  duration: number;
  loop: boolean;
  trigger: 'auto' | 'click';
};

export type ExplodeBehavior = {
  kind: 'explode';
  target_factor: number;
  speed: number;
};

export type HingeJoint = {
  pivot: [number, number, number];
  axis: 'x' | 'y' | 'z';
  sign: 1 | -1;
};

export type HingeFoldBehavior = {
  kind: 'hinge_fold';
  chain: HingeJoint[];
};

export type CircularJumpBehavior = {
  kind: 'circular_jump';
  num_nodes: Bindable;
  step: number;
  /** null => diametrically opposite START, i.e. floor(num_nodes / 2). */
  finish_node: number | null;
  center: [number, number];
  radius: number;
  lane_offset: number;
  jump_height: number;
};

export type Behavior =
  | RotateCoupledBehavior
  | ClickCollectBehavior
  | StackFallBehavior
  | PathFollowBehavior
  | ExplodeBehavior
  | HingeFoldBehavior
  | CircularJumpBehavior;

export type LabelSpec = {
  text: string;
  offset: [number, number, number];
  variant: 'body' | 'caption' | 'chip' | 'symbol';
  follow_rotation: boolean;
};

export type PatternSpec = {
  color: string;
  symbol: string | null;
  symbol_size: number;
  symbol_rotation_deg: number;
  symbol_mirror_x: boolean;
  center: [number, number];
  size: [number, number];
  offset_z: number;
  border_color: string;
  border_width: number;
};

export type Entity = {
  id: string;
  geometry: Geometry;
  material: Material;
  transform: Transform;
  behaviors: Behavior[];
  interactive: boolean;
  group_id: string | null;
  label: LabelSpec | null;
  pattern?: PatternSpec | null;
};

export type ParamSpec = {
  id: string;
  label: string;
  type: 'int';
  min: number;
  max: number;
  step: number;
  default: number;
};

export type ProblemMeta = {
  id: string;
  title: string;
  description: string;
  stats_type: 'gear' | 'coins' | 'jump' | 'none';
  on_white_collect_message: string | null;
  controls: string[];
  params?: ParamSpec[];
};

export type CameraConfig = {
  mode: 'orthographic' | 'perspective';
  position: [number, number, number];
  look_at: [number, number, number];
  zoom: number | null;
  fov: number | null;
  viewport_width: number;
  viewport_height: number;
  controls: 'locked' | 'orbit' | 'limited';
  min_polar_angle: number | null;
  max_polar_angle: number | null;
  /** World-space offset of the folded solid's center at foldAngle = +90deg;
   * the renderer counter-shifts the scene linearly with the fold angle
   * (group position = -(foldAngle/90) * shift) so the model stays centered
   * under orbit while folding. */
  fold_center_shift?: [number, number, number] | null;
};

export type SceneConfig = {
  entities: Entity[];
  paths: Record<string, [number, number, number][]>;
  initial_state: ProblemState;
};

export type ProblemConfig = {
  meta: ProblemMeta;
  camera: CameraConfig;
  scene: SceneConfig;
};

export type ProblemState = {
  isPlaying: boolean;
  isExploded: boolean;
  /** Fold TARGET angle (what the slider / reset set). */
  foldAngle: number;
  /** Currently rendered fold angle; tweened toward `foldAngle` by
   * FoldTweenDriver so value jumps (slider track clicks, reset) animate. */
  foldAngleAnimated: number;
  coins: number;
  history: string[];
  rotations: Record<string, number>;
  collected: string[];
  message: string;
  driverAngles: Record<string, number>;
  turnCount: number;
  jumpFinishedTurn: Record<string, number | null>;
  isJumping: boolean;
  paramValues: Record<string, number>;
};

export type ProblemManifestEntry = {
  id: string;
  title: string;
  description: string;
  grade: string;
  year: string;
  stats_type: 'gear' | 'coins' | 'jump' | 'none';
  path: string;
};

export type ProblemManifest = {
  problems: ProblemManifestEntry[];
};
