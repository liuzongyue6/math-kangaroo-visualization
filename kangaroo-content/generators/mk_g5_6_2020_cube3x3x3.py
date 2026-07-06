"""Generate MK_G5_6_2020_Cube3x3x3: 2020 Math Kangaroo Grade 5-6, cube structure
explode/assemble problem.

Ported from a standalone three.js prototype (3d_cube_animation.html) into the
Entity/Behavior pipeline: 27 unit cubes colored by position, toggled between
assembled and exploded layouts via the shared `explode` behavior + the
`isExploded` store flag (see `ExplodeBehavior`, `useExplodeBehavior`,
ControlBar's Explode/Assemble button).
"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from generators._registry import write_problem  # noqa: E402
from schemas.entity import BoxGeometry, Entity, ExplodeBehavior, Transform  # noqa: E402
from schemas.problem import CameraConfig, ProblemConfig, ProblemMeta, SceneConfig  # noqa: E402

CUBE_SIZE = 90.0
GRID = 3

COLORS = {
    "dark": "#555555",
    "white": "#ffffff",
    "light": "#aaaaaa",
}

# Coordinates (grid indices 0..2) that should be painted white, matching the
# original prototype's hand-picked pattern.
WHITE_POSITIONS = {
    (1, 2, 2), (0, 1, 2), (2, 1, 2), (1, 0, 2), (2, 2, 1),
    (2, 1, 0), (2, 0, 1), (1, 2, 0), (0, 2, 1), (1, 2, 1),
}

EXPLODE_TARGET_FACTOR = 2.2
EXPLODE_SPEED = 0.06


def cube_color(x: int, y: int, z: int) -> str:
    if x < 2 and y < 2 and z < 2:
        return COLORS["dark"]
    if (x, y, z) in WHITE_POSITIONS:
        return COLORS["white"]
    return COLORS["light"]


def build_cube_explode_problem() -> ProblemConfig:
    entities: list[Entity] = []

    for x in range(GRID):
        for y in range(GRID):
            for z in range(GRID):
                position = (
                    (x - 1) * CUBE_SIZE,
                    (y - 1) * CUBE_SIZE,
                    (z - 1) * CUBE_SIZE,
                )
                entities.append(
                    Entity(
                        id=f"cube-{x}-{y}-{z}",
                        geometry=BoxGeometry(size=(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE)),
                        material={"color": cube_color(x, y, z), "roughness": 0.5},
                        transform=Transform(position=position),
                        behaviors=[
                            ExplodeBehavior(
                                target_factor=EXPLODE_TARGET_FACTOR,
                                speed=EXPLODE_SPEED,
                            )
                        ],
                    )
                )

    return ProblemConfig(
        meta=ProblemMeta(
            id="MK_G5_6_2020_Cube3x3x3",
            title="3x3x3 Cube Structure Explorer",
            description=(
                "A 3x3x3 cube built from 27 unit cubes. Drag to orbit, and use "
                "Explode / Assemble to pull the cubes apart and inspect the "
                "hidden interior blocks."
            ),
            stats_type="none",
            controls=["explode"],
        ),
        camera=CameraConfig(
            mode="perspective",
            position=(240, 240, 360),
            look_at=(0, 0, 0),
            fov=45,
            zoom=None,
            viewport_width=600,
            viewport_height=460,
            controls="orbit",
        ),
        scene=SceneConfig(
            entities=entities,
            initial_state={
                "isPlaying": False,
                "isExploded": False,
                "coins": 0,
                "history": [],
                "rotations": {},
                "collected": [],
                "message": "",
                "driverAngles": {},
            },
        ),
    )


def main() -> None:
    config = build_cube_explode_problem()
    out_path = write_problem(config, grade="MK_G5_6")
    print(f"Wrote {out_path}")


if __name__ == "__main__":
    main()
