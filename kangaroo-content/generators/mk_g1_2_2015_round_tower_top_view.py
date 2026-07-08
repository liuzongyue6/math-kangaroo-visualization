"""Generate MK_G1_2_2015_RoundTowerTopView: 2015 Math Kangaroo Grade 1-2,
"what does the round tower look like from above" problem.

Ported from a standalone canvas-2D prototype (examples/MK_G1_2_2015.html):
a cylinder topped by a cone, freely orbited by the user. The draft predates
the ENTITY MANIFEST convention, so geometry/camera values were read directly
out of its hand-rolled 3D renderer instead of a manifest comment block. No
new geometry/behavior needed - the cone is a CylinderGeometry with
radius_top=0, and the HTML's drag-to-rotate is replaced by the framework's
existing camera.controls="orbit" (Front/Isometric/Top preset buttons from
the draft are intentionally dropped: free orbit already reaches the top
view, which is the point of the problem).
"""

from __future__ import annotations

import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from generators._registry import write_problem  # noqa: E402
from schemas.entity import CylinderGeometry, Entity, Transform  # noqa: E402
from schemas.problem import CameraConfig, ProblemConfig, ProblemMeta, SceneConfig  # noqa: E402

RADIUS = 60.0
CYL_HEIGHT = 100.0
CONE_HEIGHT = 80.0
TOWER_COLOR = "#c9c9c9"


def orbit_camera_position(distance: float, yaw: float, pitch: float) -> tuple[float, float, float]:
    """Spherical -> cartesian, matching the HTML draft's default yaw/pitch feel."""
    x = distance * math.cos(pitch) * math.sin(yaw)
    y = distance * math.sin(pitch)
    z = distance * math.cos(pitch) * math.cos(yaw)
    return (x, y, z)


def build_problem() -> ProblemConfig:
    cyl_center_y = -CYL_HEIGHT / 2
    cone_center_y = CONE_HEIGHT / 2
    # Height-weighted vertical midline of the two stacked solids, so the
    # default orbit target frames the whole tower instead of just one part.
    look_at_y = (cyl_center_y * CYL_HEIGHT + cone_center_y * CONE_HEIGHT) / (
        CYL_HEIGHT + CONE_HEIGHT
    )

    entities = [
        Entity(
            id="tower-cylinder",
            geometry=CylinderGeometry(radius_top=RADIUS, radius_bottom=RADIUS, height=CYL_HEIGHT),
            material={"color": TOWER_COLOR, "roughness": 0.65},
            transform=Transform(position=(0, cyl_center_y, 0)),
        ),
        Entity(
            id="tower-cone",
            geometry=CylinderGeometry(radius_top=0, radius_bottom=RADIUS, height=CONE_HEIGHT),
            material={"color": TOWER_COLOR, "roughness": 0.65},
            transform=Transform(position=(0, cone_center_y, 0)),
        ),
    ]

    return ProblemConfig(
        meta=ProblemMeta(
            id="MK_G1_2_2015_RoundTowerTopView",
            title="What does the round tower look like from above?",
            description=(
                "Drag to orbit the tower and figure out what its silhouette "
                "looks like from directly above."
            ),
            stats_type="none",
            controls=[],
        ),
        camera=CameraConfig(
            mode="orthographic",
            position=orbit_camera_position(distance=260, yaw=-0.5, pitch=0.35),
            look_at=(0, look_at_y, 0),
            zoom=1.3,
            viewport_width=600,
            viewport_height=460,
            controls="orbit",
        ),
        scene=SceneConfig(entities=entities, initial_state={}),
    )


def main() -> None:
    config = build_problem()
    out_path = write_problem(config, grade="MK_G1_2")
    print(f"Wrote {out_path}")


if __name__ == "__main__":
    main()
