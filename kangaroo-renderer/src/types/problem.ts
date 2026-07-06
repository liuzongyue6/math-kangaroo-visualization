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

export type Geometry =
  | GearGeometry
  | SphereGeometry
  | BoxGeometry
  | CylinderGeometry
  | PolygonGeometry;

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

export type Behavior =
  | RotateCoupledBehavior
  | ClickCollectBehavior
  | StackFallBehavior
  | PathFollowBehavior
  | ExplodeBehavior;

export type LabelSpec = {
  text: string;
  offset: [number, number, number];
  variant: 'body' | 'caption' | 'chip';
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
};

export type ProblemMeta = {
  id: string;
  title: string;
  description: string;
  stats_type: 'gear' | 'coins' | 'none';
  on_white_collect_message: string | null;
  controls: string[];
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
  coins: number;
  history: string[];
  rotations: Record<string, number>;
  collected: string[];
  message: string;
  driverAngles: Record<string, number>;
};

export type ProblemManifestEntry = {
  id: string;
  title: string;
  description: string;
  grade: string;
  year: string;
  stats_type: 'gear' | 'coins' | 'none';
  path: string;
};

export type ProblemManifest = {
  problems: ProblemManifestEntry[];
};
