from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field

from .entity import Entity


class ParamSpec(BaseModel):
    """A user-tunable runtime parameter (Math Kangaroo problems often invite
    "what if we change N?" exploration). The renderer's control bar shows a
    numeric input per param; behaviors/geometries opt in by using a ParamRef
    (`{"$param": "<id>"}`) in a bindable field. Changing a param resets the
    problem's run state (like regenerating the track)."""

    id: str
    label: str
    type: Literal["int"] = "int"
    min: float
    max: float
    step: float = 1
    default: float


class ProblemMeta(BaseModel):
    id: str
    title: str
    description: str = ""
    stats_type: Literal["gear", "coins", "jump", "none"] = "gear"
    on_white_collect_message: str | None = None
    controls: list[str] = Field(default_factory=lambda: ["play", "reset"])
    params: list[ParamSpec] = Field(default_factory=list)


class CameraConfig(BaseModel):
    mode: Literal["orthographic", "perspective"] = "orthographic"
    position: tuple[float, float, float] = (0, 0, 500)
    look_at: tuple[float, float, float] = (0, 0, 0)
    zoom: float | None = 1
    fov: float | None = None
    viewport_width: float = 600
    viewport_height: float = 400
    # "locked": no user camera control (clean diagram look)
    # "orbit": free OrbitControls
    # "limited": OrbitControls constrained to min/max_polar_angle
    controls: Literal["locked", "orbit", "limited"] = "locked"
    min_polar_angle: float | None = None
    max_polar_angle: float | None = None
    # For hinge-fold scenes: world-space offset of the folded solid's center
    # at foldAngle = +90 deg. The renderer counter-shifts the scene linearly
    # with the fold angle (group position = -(foldAngle/90) * shift) so the
    # model stays centered under orbit while folding — the analog of the CSS
    # demo's dynamic `--center-z` transform-origin.
    fold_center_shift: tuple[float, float, float] | None = None


class SceneConfig(BaseModel):
    entities: list[Entity]
    paths: dict[str, list[tuple[float, float, float]]] = Field(default_factory=dict)
    initial_state: dict[str, Any] = Field(default_factory=dict)


class ProblemConfig(BaseModel):
    meta: ProblemMeta
    camera: CameraConfig
    scene: SceneConfig
