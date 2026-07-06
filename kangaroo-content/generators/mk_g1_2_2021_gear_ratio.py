"""Generate MK_G1_2_2021_GearRatio: 2021 Math Kangaroo Grade 1-2, gear ratio problem."""

from __future__ import annotations

import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from generators._registry import write_problem  # noqa: E402
from schemas.entity import (  # noqa: E402
    Entity,
    GearGeometry,
    RotateCoupledBehavior,
    Transform,
)
from schemas.problem import CameraConfig, ProblemConfig, ProblemMeta, SceneConfig  # noqa: E402

CANVAS_W = 600
CANVAS_H = 400


def canvas_to_scene(x: float, y: float, z: float = 0) -> tuple[float, float, float]:
    return (x - CANVAS_W / 2, CANVAS_H / 2 - y, z)


def compute_mesh_offset(small_teeth: int, large_teeth: int) -> float:
    """Phase offset so marked teeth mesh at start."""
    return math.pi + math.pi / large_teeth


def build_gear_problem() -> ProblemConfig:
    small_teeth = 8
    large_teeth = 16
    ratio = -small_teeth / large_teeth  # driven gear turns opposite at teeth ratio
    mesh_offset = compute_mesh_offset(small_teeth, large_teeth)

    small_pos = canvas_to_scene(220, 200)
    large_pos = canvas_to_scene(385, 200)

    entities = [
        Entity(
            id="small-gear",
            geometry=GearGeometry(
                radius=50,
                teeth=small_teeth,
                tooth_depth=12,
                marked_tooth_index=0,
            ),
            material={"color": "#ffb3ba"},
            transform=Transform(position=small_pos),
            behaviors=[
                RotateCoupledBehavior(
                    driver_id=None,
                    ratio=1.0,
                    direction=1,
                    speed=0.02,
                )
            ],
        ),
        Entity(
            id="large-gear",
            geometry=GearGeometry(
                radius=100,
                teeth=large_teeth,
                tooth_depth=12,
                marked_tooth_index=-1,
            ),
            material={"color": "#b3b3ff"},
            transform=Transform(position=large_pos),
            behaviors=[
                RotateCoupledBehavior(
                    driver_id="small-gear",
                    ratio=ratio,
                    direction=-1,
                    initial_rotation=mesh_offset,
                )
            ],
        ),
    ]

    return ProblemConfig(
        meta=ProblemMeta(
            id="MK_G1_2_2021_GearRatio",
            title="Gear Ratio 2:1 Simulation",
            description=(
                "Watch how the small gear must spin twice for every one spin of the "
                "large gear. Pause the animation, then drag either gear to turn it by hand."
            ),
            stats_type="gear",
            controls=["play", "reset"],
        ),
        camera=CameraConfig(
            mode="perspective",
            position=(0, -90, 480),
            look_at=(0, 0, 0),
            fov=38,
            zoom=None,
            viewport_width=CANVAS_W,
            viewport_height=CANVAS_H,
            controls="locked",
        ),
        scene=SceneConfig(
            entities=entities,
            initial_state={
                "isPlaying": True,
                "coins": 0,
                "history": [],
                "rotations": {"small-gear": 0, "large-gear": 0},
                "collected": [],
                "message": "",
                "driverAngles": {"small-gear": 0},
            },
        ),
    )


def main() -> None:
    config = build_gear_problem()
    out_path = write_problem(config, grade="MK_G1_2")
    print(f"Wrote {out_path}")


if __name__ == "__main__":
    main()
