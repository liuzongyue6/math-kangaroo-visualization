from __future__ import annotations

from typing import Literal, Union

from pydantic import BaseModel, Field


class ParamRef(BaseModel):
    """Reference to a runtime problem parameter (see ProblemMeta.params).

    Bindable numeric fields are typed `int | ParamRef`; a ParamRef serializes
    as `{"$param": "<param id>"}` and the renderer resolves it against the
    live `paramValues` store, so users can retune the problem (e.g. track
    size) without regenerating JSON.
    """

    param: str = Field(alias="$param")

    class Config:
        allow_population_by_field_name = True


class Transform(BaseModel):
    position: tuple[float, float, float] = (0, 0, 0)
    rotation: tuple[float, float, float] = (0, 0, 0)
    scale: tuple[float, float, float] = (1, 1, 1)


class Material(BaseModel):
    """Typed, structured material params shared by every geometry renderer."""

    color: str = "#cccccc"
    opacity: float = 1.0
    metalness: float = 0.0
    roughness: float = 0.6
    wireframe: bool = False
    # True => rendered unlit (meshBasicMaterial): flat CSS-like color with no
    # shading. The right look for 2D diagram problems (tracks, counters);
    # keep False for real 3D solids that need depth cues.
    unlit: bool = False


class GearGeometry(BaseModel):
    kind: Literal["gear"] = "gear"
    radius: float
    teeth: int
    tooth_depth: float = 12
    marked_tooth_index: int | None = None


class SphereGeometry(BaseModel):
    kind: Literal["sphere"] = "sphere"
    radius: float


class BoxGeometry(BaseModel):
    kind: Literal["box"] = "box"
    size: tuple[float, float, float]
    corner_radius: float = 0.0


class CylinderGeometry(BaseModel):
    kind: Literal["cylinder"] = "cylinder"
    radius_top: float
    radius_bottom: float | None = None
    height: float
    radial_segments: int = 32
    open_ended: bool = False


class PolygonGeometry(BaseModel):
    """Flat shape extruded to a thin slab. Reusable for nets, tangrams, area problems."""

    kind: Literal["polygon"] = "polygon"
    points: list[tuple[float, float]]
    depth: float = 12


class CircularTrackGeometry(BaseModel):
    """Procedural circular race track: a backdrop disc plus `num_nodes`
    evenly-spaced node spheres with START/FINISH captions. Rendered entirely
    on the frontend from these parameters (instead of baking one entity per
    node into the JSON), so `num_nodes` can be a ParamRef and the track
    rebuilds live when the user changes the parameter."""

    kind: Literal["circular_track"] = "circular_track"
    num_nodes: int | ParamRef
    radius: float = 180
    node_radius: float = 9
    node_color: str = "#d9dde2"
    backdrop_color: str | None = "#f4f7f6"
    backdrop_margin: float = 40
    backdrop_thickness: float = 6
    backdrop_z: float = -20
    # None => finish sits diametrically opposite START (floor(num_nodes / 2)).
    finish_node: int | None = None


Geometry = Union[
    GearGeometry,
    SphereGeometry,
    BoxGeometry,
    CylinderGeometry,
    PolygonGeometry,
    CircularTrackGeometry,
]


class RotateCoupledBehavior(BaseModel):
    kind: Literal["rotate_coupled"] = "rotate_coupled"
    driver_id: str | None = None
    ratio: float
    direction: Literal[1, -1] = 1
    speed: float = 0.02
    initial_rotation: float = 0.0


class ClickCollectBehavior(BaseModel):
    kind: Literal["click_collect"] = "click_collect"
    group_id: str
    stack_order: int = 0
    on_collect_effect: str | None = None
    color: str | None = None


class StackFallBehavior(BaseModel):
    """Declared separately from click_collect so collection UX and column-stack
    physics can be mixed independently (e.g. grid/flip-card collect games that
    should NOT fall into a column). Carries its own `stack_order` so it never
    has to reach into ClickCollectBehavior to know its slot."""

    kind: Literal["stack_fall"] = "stack_fall"
    group_id: str
    stack_order: int = 0
    fall_duration_ms: float = 300


class PathFollowBehavior(BaseModel):
    """Move an entity along a named path defined in SceneConfig.paths."""

    kind: Literal["path_follow"] = "path_follow"
    path_id: str
    duration: float = 2.0
    loop: bool = False
    trigger: Literal["auto", "click"] = "auto"


class ExplodeBehavior(BaseModel):
    """Radially offsets an entity away from the scene origin, driven by the
    global `isExploded` toggle (see ProblemMeta.controls `"explode"`).
    Entity's own `transform.position` is treated as the assembled position;
    the exploded position is that vector scaled by `target_factor`."""

    kind: Literal["explode"] = "explode"
    target_factor: float = 2.2
    speed: float = 0.05


class HingeJoint(BaseModel):
    """One hinge in a fold chain. `pivot` is expressed in the *previous*
    joint's already-rotated local frame (root-first), so a chain of joints
    composes exactly like nested CSS/DOM transforms without the interpreter
    needing a real entity parent/child tree."""

    pivot: tuple[float, float, float]
    axis: Literal["x", "y", "z"] = "x"
    sign: Literal[1, -1] = 1


class HingeFoldBehavior(BaseModel):
    """Animates a flat net folding into a 3D solid (cube nets, box nets,
    etc.). Every joint in `chain` rotates by the SAME global `foldAngle`
    control (see ProblemMeta.controls `"fold"`), scaled by its own `sign`;
    multi-hinge chains (e.g. a flap that is itself the hinge parent of
    another flap) list every ancestor joint root-first so the composed
    rotation matches what a real nested transform would produce."""

    kind: Literal["hinge_fold"] = "hinge_fold"
    chain: list[HingeJoint]


class CircularJumpBehavior(BaseModel):
    """Discrete step-hop movement around a shared circular node layout,
    advanced one full turn at a time (see ProblemMeta.controls `"step"`).
    Every racer entity shares the same `num_nodes`/`center`/`radius` so
    their positions land on the same ring; `lane_offset` staggers radii so
    multiple racers don't visually overlap. Each turn moves the entity
    `step` nodes forward with a parabolic hop arc; once an entity lands
    exactly on `finish_node` it freezes and ignores further turns."""

    kind: Literal["circular_jump"] = "circular_jump"
    num_nodes: int | ParamRef
    step: int
    # None => finish sits diametrically opposite START (floor(num_nodes / 2)),
    # which keeps it consistent when num_nodes is a runtime parameter.
    finish_node: int | None = None
    center: tuple[float, float] = (0, 0)
    radius: float = 180
    lane_offset: float = 0
    jump_height: float = 35


Behavior = Union[
    RotateCoupledBehavior,
    ClickCollectBehavior,
    StackFallBehavior,
    PathFollowBehavior,
    ExplodeBehavior,
    HingeFoldBehavior,
    CircularJumpBehavior,
]


class LabelSpec(BaseModel):
    """Anchors a DOM-rendered text label to an entity's 3D position."""

    text: str
    offset: tuple[float, float, float] = (0, 0, 0)
    variant: Literal["body", "caption", "chip", "symbol"] = "body"
    # False (default): billboarded, always faces the camera (fine for static
    # diagram annotations). True: rendered via drei Html's `transform` mode
    # so the label rotates along with its entity (needed e.g. for symbols
    # painted on faces that fold in 3D).
    follow_rotation: bool = False


class PatternSpec(BaseModel):
    """A colored face (optionally with a symbol) painted onto a flat panel as
    a real WebGL texture plane, so it participates in depth testing and
    perspective (unlike DOM `LabelSpec` overlays). Used for the "paper" look:
    the panel body stays a neutral back/side color while this pattern plane
    is the colored front face."""

    color: str
    # Symbol (e.g. an emoji) drawn centered on the colored face.
    symbol: str | None = None
    symbol_size: float = 60
    # CSS-like transform of the symbol within the face: rotation is in
    # degrees with the same sense as CSS `rotate()`, mirror flips
    # horizontally BEFORE the rotation is applied (matching the
    # `rotate(..) scaleX(-1)` composition in the CSS reference).
    symbol_rotation_deg: float = 0
    symbol_mirror_x: bool = False
    # Placement of the pattern plane in the entity's local frame.
    center: tuple[float, float] = (0, 0)
    size: tuple[float, float]
    offset_z: float = 0
    # Border drawn inside the face edge (world units); 0 disables it.
    border_color: str = "#222222"
    border_width: float = 0


class Entity(BaseModel):
    id: str
    geometry: Geometry = Field(discriminator="kind")
    material: Material = Field(default_factory=Material)
    transform: Transform = Field(default_factory=Transform)
    behaviors: list[Behavior] = Field(default_factory=list)
    interactive: bool = False
    group_id: str | None = None
    label: LabelSpec | None = None
    pattern: PatternSpec | None = None
