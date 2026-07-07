"""Generate MK_G5_6_2023_AnimalJumpRace: 2023 Math Kangaroo Grade 5-6,
animal jumping competition problem.

Ported from a standalone HTML/CSS/JS prototype (a circular div track with
absolutely-positioned emoji divs animated via requestAnimationFrame) into
the Entity/Behavior pipeline. This visualizes IKMC 2023 Benjamin (Grade
5-6) problem 18: a beaver/rabbit/kangaroo race hopping 1/2/3 spaces per
turn around a track, first to land exactly on FINISH wins. Kept as
Mouse/Rabbit/Kangaroo here to match the source prototype.

The number of track spaces is a *runtime parameter* (`num_nodes`, default
20, range 5-60 -- mirroring the prototype's "Total Spaces on Track" input):
the track is a single procedural `circular_track` entity and every racer's
`circular_jump` behavior binds `num_nodes` via a `$param` reference, so the
frontend rebuilds the track and restarts the race whenever the user changes
the value. FINISH is always diametrically opposite START
(`finish_node=None` => floor(num_nodes / 2)).

With the default 20 spaces the math reproduces the official answer: Mouse
(step 1) needs 10 jumps, Kangaroo (step 3) also needs 10 jumps (3*10 = 30,
which is 10 mod 20), and Rabbit (step 2) needs only 5 jumps -- so the
Rabbit wins outright, matching the published answer key.

Every racer entity carries one `circular_jump` behavior; clicking "Jump!"
(see ControlBar's `"step"` control) advances the shared `turnCount` by
one, and each racer's behavior hook independently hops `step` nodes with
a parabolic arc, freezing once it lands exactly on the finish node.
"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from generators._registry import write_problem  # noqa: E402
from schemas.entity import (  # noqa: E402
    CircularJumpBehavior,
    CircularTrackGeometry,
    Entity,
    LabelSpec,
    ParamRef,
    SphereGeometry,
    Transform,
)
from schemas.problem import (  # noqa: E402
    CameraConfig,
    ParamSpec,
    ProblemConfig,
    ProblemMeta,
    SceneConfig,
)

NUM_NODES_PARAM = "num_nodes"
DEFAULT_NUM_NODES = 20
TRACK_RADIUS = 170.0
CENTER = (0.0, 0.0)

NODE_COLOR = "#d9dde2"
BACKDROP_COLOR = "#f4f7f6"


def build_track_entity() -> Entity:
    return Entity(
        id="track",
        geometry=CircularTrackGeometry(
            num_nodes=ParamRef(param=NUM_NODES_PARAM),
            radius=TRACK_RADIUS,
            node_radius=9,
            node_color=NODE_COLOR,
            backdrop_color=BACKDROP_COLOR,
            backdrop_margin=40,
            backdrop_thickness=6,
            backdrop_z=-20,
        ),
    )


def build_racer_entities() -> list[Entity]:
    racers = [
        ("mouse", "\U0001f401", 1, "#c9c9c9", -25.0),
        ("rabbit", "\U0001f407", 2, "#f7c9c9", 0.0),
        ("kangaroo", "\U0001f998", 3, "#f4dfa0", 25.0),
    ]

    entities: list[Entity] = []
    for racer_id, emoji, step, color, lane_offset in racers:
        entities.append(
            Entity(
                id=racer_id,
                geometry=SphereGeometry(radius=14),
                # Unlit: 2D-diagram look (flat colored disc), like the CSS demo.
                material={"color": color, "unlit": True},
                # Node 0 sits at angle 0 regardless of num_nodes, so the
                # start position stays valid for any track size.
                transform=Transform(
                    position=(CENTER[0], CENTER[1] + TRACK_RADIUS + lane_offset, 6)
                ),
                behaviors=[
                    CircularJumpBehavior(
                        num_nodes=ParamRef(param=NUM_NODES_PARAM),
                        step=step,
                        finish_node=None,
                        center=CENTER,
                        radius=TRACK_RADIUS,
                        lane_offset=lane_offset,
                        jump_height=35,
                    )
                ],
                label=LabelSpec(text=emoji, offset=(0, 0, 20), variant="symbol"),
            )
        )
    return entities


def build_animal_jump_race_problem() -> ProblemConfig:
    entities = [build_track_entity()] + build_racer_entities()

    return ProblemConfig(
        meta=ProblemMeta(
            id="MK_G5_6_2023_AnimalJumpRace",
            title="Animal Jumping Competition",
            description=(
                "A mouse, rabbit and kangaroo start together and hop 1, 2 and 3 spaces "
                "at a time around a circular track. Change the number of spaces, then "
                "click Jump to play one turn at a time and see who lands exactly on "
                "FINISH in the fewest jumps -- this visualizes the 2023 Math Kangaroo "
                "Grade 5-6 beaver/rabbit/kangaroo race."
            ),
            stats_type="jump",
            controls=["step", "reset"],
            params=[
                ParamSpec(
                    id=NUM_NODES_PARAM,
                    label="Total Spaces on Track",
                    min=5,
                    max=60,
                    step=1,
                    default=DEFAULT_NUM_NODES,
                )
            ],
        ),
        # Locked orthographic top-down camera: this is a flat 2D diagram
        # problem, so no perspective distortion (the hop arc still reads via
        # the radial bulge, exactly like the 2D reference demo).
        camera=CameraConfig(
            mode="orthographic",
            position=(0, 0, 500),
            look_at=(0, 0, 0),
            zoom=1,
            fov=None,
            viewport_width=520,
            viewport_height=520,
            controls="locked",
        ),
        scene=SceneConfig(
            entities=entities,
            initial_state={
                "isPlaying": False,
                "isExploded": False,
                "foldAngle": 0,
                "coins": 0,
                "history": [],
                "rotations": {},
                "collected": [],
                "message": "",
                "driverAngles": {},
                "turnCount": 0,
                "jumpFinishedTurn": {},
                "isJumping": False,
            },
        ),
    )


def main() -> None:
    config = build_animal_jump_race_problem()
    out_path = write_problem(config, grade="MK_G5_6")
    print(f"Wrote {out_path}")


if __name__ == "__main__":
    main()
