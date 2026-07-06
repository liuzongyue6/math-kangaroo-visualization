from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field

from .entity import Entity


class ProblemMeta(BaseModel):
    id: str
    title: str
    description: str = ""
    stats_type: Literal["gear", "coins", "none"] = "gear"
    on_white_collect_message: str | None = None
    controls: list[str] = Field(default_factory=lambda: ["play", "reset"])


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


class SceneConfig(BaseModel):
    entities: list[Entity]
    paths: dict[str, list[tuple[float, float, float]]] = Field(default_factory=dict)
    initial_state: dict[str, Any] = Field(default_factory=dict)


class ProblemConfig(BaseModel):
    meta: ProblemMeta
    camera: CameraConfig
    scene: SceneConfig
