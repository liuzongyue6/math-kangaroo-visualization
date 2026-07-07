"""Generate MK_G5_6_2023_CubeNetFold: 2023 Math Kangaroo Grade 5-6, cube net
folding problem.

Ported from a standalone HTML/CSS prototype (nested `transform-style:
preserve-3d` divs hinging around shared edges) into the Entity/Behavior
pipeline. The net is a 6-square "cross" layout:

        [top]
[left][base][right][far-right]
        [bottom]

`base` is the static front face; every other face carries a `hinge_fold`
behavior whose `chain` encodes the hinge(s) from `base` down to itself, so a
single global `foldAngle` (driven by the fold slider, see `ControlBar`)
folds the whole net shut into a cube. `far-right` is hinged off `right`
(its chain lists both joints), which reproduces the CSS demo's nested-div
folding without the renderer needing a real entity parent/child tree — see
`HingeFoldBehavior` / `useHingeFoldBehavior`.

Paper look, matching the CSS reference (`examples/3d_folder.html`): the
extruded panel body is a neutral gray (that's the paper's back + edges),
while the colored front face — with its border and optional kangaroo symbol
— is a `PatternSpec` painted as a real WebGL texture plane. Unlike the old
DOM `LabelSpec` overlays, patterns participate in depth testing and
perspective, so symbols stay glued to their face while it folds and get
correctly occluded by other faces. `fold_center_shift` mirrors the demo's
dynamic `--center-z`, keeping the cube centered under orbit as it closes.
"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from generators._registry import write_problem  # noqa: E402
from schemas.entity import (  # noqa: E402
    Entity,
    HingeFoldBehavior,
    HingeJoint,
    PatternSpec,
    PolygonGeometry,
)
from schemas.problem import CameraConfig, ProblemConfig, ProblemMeta, SceneConfig  # noqa: E402

S = 100.0  # face edge length
DEPTH = 6.0  # panel thickness
KANGAROO = "🦘"

GREEN = "#6fbb6b"
YELLOW = "#fce98a"
BLUE = "#8bc6fc"
PAPER_BACK = "#e0e0e0"  # back + edges of every panel, like the CSS demo

HALF = S / 2
# Front cap sits at DEPTH/2 plus the extrude bevel (0.6); float the pattern
# just above it so it never z-fights with the panel body.
PATTERN_Z = DEPTH / 2 + 0.8


def square(x0: float, y0: float, x1: float, y1: float) -> list[tuple[float, float]]:
    """Axis-aligned rectangle, corners in winding order."""
    return [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]


def face_pattern(color: str, center_x: float, center_y: float, symbol: bool) -> PatternSpec:
    return PatternSpec(
        color=color,
        symbol=KANGAROO if symbol else None,
        symbol_size=50,
        # Matches the reference demo's `rotate(270deg) scaleX(-1)` glyph
        # transform (canvas 2D and CSS share the same y-down screen frame
        # and the same transform composition order).
        symbol_rotation_deg=270,
        symbol_mirror_x=True,
        center=(center_x, center_y),
        size=(S, S),
        offset_z=PATTERN_Z,
        border_width=1.8,
    )


def paper_face(
    face_id: str,
    points: list[tuple[float, float]],
    color: str,
    pattern_center: tuple[float, float],
    symbol: bool = False,
    chain: list[HingeJoint] | None = None,
) -> Entity:
    return Entity(
        id=face_id,
        geometry=PolygonGeometry(points=points, depth=DEPTH),
        material={"color": PAPER_BACK, "roughness": 0.7},
        behaviors=[HingeFoldBehavior(chain=chain)] if chain else [],
        pattern=face_pattern(color, *pattern_center, symbol=symbol),
    )


def build_cube_net_fold_problem() -> ProblemConfig:
    entities = [
        # Static front face — everything else hinges off this one.
        paper_face("base", square(-HALF, -HALF, HALF, HALF), GREEN, (0, 0)),
        paper_face(
            "top",
            square(-HALF, 0, HALF, S),
            YELLOW,
            (0, HALF),
            symbol=True,
            chain=[HingeJoint(pivot=(0, HALF, 0), axis="x", sign=1)],
        ),
        paper_face(
            "bottom",
            square(-HALF, -S, HALF, 0),
            BLUE,
            (0, -HALF),
            symbol=True,
            chain=[HingeJoint(pivot=(0, -HALF, 0), axis="x", sign=-1)],
        ),
        paper_face(
            "left",
            square(-S, -HALF, 0, HALF),
            YELLOW,
            (-HALF, 0),
            symbol=True,
            chain=[HingeJoint(pivot=(-HALF, 0, 0), axis="y", sign=1)],
        ),
        paper_face(
            "right",
            square(0, -HALF, S, HALF),
            GREEN,
            (HALF, 0),
            chain=[HingeJoint(pivot=(HALF, 0, 0), axis="y", sign=-1)],
        ),
        paper_face(
            "far-right",
            square(0, -HALF, S, HALF),
            GREEN,
            (HALF, 0),
            chain=[
                HingeJoint(pivot=(HALF, 0, 0), axis="y", sign=-1),
                HingeJoint(pivot=(S, 0, 0), axis="y", sign=-1),
            ],
        ),
    ]

    return ProblemConfig(
        meta=ProblemMeta(
            id="MK_G5_6_2023_CubeNetFold",
            title="Cube Net Folding Simulator",
            description=(
                "Drag the slider to fold this 6-square net shut into a cube, "
                "and drag in the viewport to orbit around it and check where "
                "each kangaroo symbol ends up."
            ),
            stats_type="none",
            controls=["fold", "reset"],
        ),
        camera=CameraConfig(
            mode="perspective",
            position=(220, 200, 300),
            look_at=(25, 0, 0),
            fov=42,
            zoom=None,
            viewport_width=640,
            viewport_height=480,
            controls="orbit",
            # At +/-90 deg the folded cube's center sits S/2 in front
            # of/behind the base face; counter-shift keeps it centered
            # (the CSS demo's `--center-z`).
            fold_center_shift=(0, 0, S / 2),
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
            },
        ),
    )


def main() -> None:
    config = build_cube_net_fold_problem()
    out_path = write_problem(config, grade="MK_G5_6")
    print(f"Wrote {out_path}")


if __name__ == "__main__":
    main()
