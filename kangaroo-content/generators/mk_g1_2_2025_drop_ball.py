"""Generate MK_G1_2_2025_DropBall: 2025 Math Kangaroo Grade 1-2, drop balls problem."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from generators._registry import write_problem  # noqa: E402
from schemas.entity import (  # noqa: E402
    BoxGeometry,
    ClickCollectBehavior,
    CylinderGeometry,
    Entity,
    SphereGeometry,
    StackFallBehavior,
    Transform,
)
from schemas.problem import CameraConfig, ProblemConfig, ProblemMeta, SceneConfig  # noqa: E402

START_DATA = [
    ["blue", "yellow", "yellow", "blue", "blue"],
    ["yellow", "blue", "blue", "white", "yellow"],
    ["blue", "white", "white", "yellow", "blue"],
    ["white", "yellow", "yellow", "yellow", "white"],
    ["yellow", "yellow", "blue", "white", "yellow"],
]

COLOR_MAP = {
    "blue": "#3fa9ff",
    "yellow": "#ffd63d",
    "white": "#ffffff",
}

MACHINE_W = 420
MACHINE_H = 280
COLUMN_W = 60
BALL_RADIUS = 21
BALL_GAP = 6
CANVAS_W = 500
CANVAS_H = 400

TUBE_RADIUS = 27
TUBE_HEIGHT = MACHINE_H - 20
TUBE_RADIAL_SEGMENTS = 28
TUBE_CAP_HEIGHT = 10
STAND_HEIGHT = 20
STAND_DEPTH = 16


def canvas_to_scene(x: float, y: float, z: float = 0) -> tuple[float, float, float]:
    return (x - CANVAS_W / 2, CANVAS_H / 2 - y, z)


def build_drop_balls_problem() -> ProblemConfig:
    entities: list[Entity] = []
    machine_left = (CANVAS_W - MACHINE_W) / 2
    machine_bottom = 80
    column_count = len(START_DATA)

    tube_center_canvas_y = machine_bottom + MACHINE_H / 2
    tube_bottom_canvas_y = tube_center_canvas_y + TUBE_HEIGHT / 2
    cap_center_canvas_y = tube_bottom_canvas_y + TUBE_CAP_HEIGHT / 2
    stand_center_canvas_y = tube_bottom_canvas_y + TUBE_CAP_HEIGHT + STAND_HEIGHT / 2

    # Rack stand the tubes appear to rest on (grounding only, not a ball container).
    entities.append(
        Entity(
            id="rack-stand",
            geometry=BoxGeometry(
                size=(MACHINE_W + 20, STAND_HEIGHT, STAND_DEPTH), corner_radius=8
            ),
            material={"color": "#7c8798"},
            transform=Transform(
                position=canvas_to_scene(
                    machine_left + MACHINE_W / 2, stand_center_canvas_y, -4
                )
            ),
        )
    )

    for col_idx, column in enumerate(START_DATA):
        col_x = machine_left + COLUMN_W / 2 + col_idx * COLUMN_W + (MACHINE_W - column_count * COLUMN_W) / 2
        group_id = f"column-{col_idx}"

        # Transparent tube holding this column's balls; doubles as the click target.
        entities.append(
            Entity(
                id=f"tube-{col_idx}",
                geometry=CylinderGeometry(
                    radius_top=TUBE_RADIUS,
                    radius_bottom=TUBE_RADIUS,
                    height=TUBE_HEIGHT,
                    radial_segments=TUBE_RADIAL_SEGMENTS,
                    open_ended=True,
                ),
                material={
                    "color": "#bfe4ff",
                    "opacity": 0.28,
                    "metalness": 0.1,
                    "roughness": 0.1,
                },
                transform=Transform(
                    position=canvas_to_scene(col_x, tube_center_canvas_y, 0)
                ),
                interactive=True,
                group_id=group_id,
            )
        )

        # Opaque floor cap so the bottom ball looks grounded inside the tube.
        entities.append(
            Entity(
                id=f"tube-cap-{col_idx}",
                geometry=CylinderGeometry(
                    radius_top=TUBE_RADIUS,
                    radius_bottom=TUBE_RADIUS,
                    height=TUBE_CAP_HEIGHT,
                    radial_segments=TUBE_RADIAL_SEGMENTS,
                ),
                material={"color": "#7c8798"},
                transform=Transform(
                    position=canvas_to_scene(col_x, cap_center_canvas_y, 0)
                ),
            )
        )

        for stack_idx, color_name in enumerate(column):
            ball_y = machine_bottom + 30 + stack_idx * (BALL_RADIUS * 2 + BALL_GAP)
            ball_id = f"ball-{col_idx}-{stack_idx}"
            ball_z = 5 + stack_idx * 0.5
            entities.append(
                Entity(
                    id=ball_id,
                    geometry=SphereGeometry(radius=BALL_RADIUS),
                    material={"color": COLOR_MAP[color_name]},
                    transform=Transform(position=canvas_to_scene(col_x, ball_y, ball_z)),
                    group_id=group_id,
                    behaviors=[
                        ClickCollectBehavior(
                            group_id=group_id,
                            stack_order=stack_idx,
                            color=color_name,
                            on_collect_effect="white_ball_message" if color_name == "white" else None,
                        ),
                        StackFallBehavior(group_id=group_id, stack_order=stack_idx),
                    ],
                )
            )

    return ProblemConfig(
        meta=ProblemMeta(
            id="MK_G1_2_2025_DropBall",
            title="Click Any Column",
            description="Drop balls from any column. Collect them below!",
            stats_type="coins",
            on_white_collect_message="You Got A WHITE Ball!",
            controls=["reset"],
        ),
        camera=CameraConfig(
            mode="perspective",
            position=(0, -60, 420),
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
                "rotations": {},
                "collected": [],
                "message": "",
                "driverAngles": {},
            },
        ),
    )


def main() -> None:
    config = build_drop_balls_problem()
    out_path = write_problem(config, grade="MK_G1_2")
    print(f"Wrote {out_path}")


if __name__ == "__main__":
    main()
