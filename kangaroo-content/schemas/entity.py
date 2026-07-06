from __future__ import annotations

from typing import Literal, Union

from pydantic import BaseModel, Field


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


Geometry = Union[
    GearGeometry,
    SphereGeometry,
    BoxGeometry,
    CylinderGeometry,
    PolygonGeometry,
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


Behavior = Union[
    RotateCoupledBehavior,
    ClickCollectBehavior,
    StackFallBehavior,
    PathFollowBehavior,
    ExplodeBehavior,
]


class LabelSpec(BaseModel):
    """Anchors a DOM-rendered text label to an entity's 3D position."""

    text: str
    offset: tuple[float, float, float] = (0, 0, 0)
    variant: Literal["body", "caption", "chip"] = "body"


class Entity(BaseModel):
    id: str
    geometry: Geometry = Field(discriminator="kind")
    material: Material = Field(default_factory=Material)
    transform: Transform = Field(default_factory=Transform)
    behaviors: list[Behavior] = Field(default_factory=list)
    interactive: bool = False
    group_id: str | None = None
    label: LabelSpec | None = None
