"""Generate MK_G1_2_2025_2Blocks: 2025 Math Kangaroo Grade 1-2, "which object
cannot be built with these two building blocks?" (Mike has a 3-cube L block
and a 2-cube bar).

Each answer figure is a set of unit-cube grid cells read off the original
problem drawing (pics/Snipaste_2026-09-17_21-08-00.jpg), together with how it
splits into Mike's two blocks. Every split is validated here - and option E
is proven to have none - before any entity is emitted. Pressing Explode
reuses the `explode` behavior with a per-piece `offset`: in A-D the bar
slides off the L along their shared faces; in E the four arms spread away
from the red center cube, showing why no 3 + 2 split exists (each arm only
touches the center, so every arm must share a block with it -> all 5 cubes
would be one block).
"""

from __future__ import annotations

import math
import sys
from itertools import combinations
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from generators._registry import write_problem  # noqa: E402
from schemas.entity import BoxGeometry, Entity, ExplodeBehavior, LabelSpec, Transform  # noqa: E402
from schemas.problem import CameraConfig, ProblemConfig, ProblemMeta, SceneConfig  # noqa: E402

# Grid cells are (x, y, z): x right, y up, z AWAY from the viewer (the depth
# direction of the drawing). World z is flipped, since the camera sits at +z.
Cell = tuple[int, int, int]
Vec3 = tuple[float, float, float]

CUBE_SIZE = 32.0
BAR_GAP = 0.9 * CUBE_SIZE  # how far the bar slides off the L on Explode
ARM_GAP = 0.6 * CUBE_SIZE  # how far E's arms spread from its center
EXPLODE_SPEED = 0.08

L_COLOR = "#4a90e2"
BAR_COLOR = "#f5a623"
E_COLOR = "#4caf50"  # the original drawing's green: E can't be split
E_CENTER_COLOR = "#e53935"

BLOCKS_GROUND_Y = 60.0
BLOCK_SPACING = 160.0
OPTIONS_GROUND_Y = -150.0
OPTION_SPACING = 135.0
LABEL_MARGIN = 0.55 * CUBE_SIZE

# Default view: from the front-right and above, like the drawing. The user
# may peek around the figures, but not so far that the row lines up edge-on
# or (looking straight down) Mike's blocks land on top of the options row,
# which is only separated from it by height.
CAMERA_YAW = 0.45
CAMERA_PITCH = 0.42
MIN_POLAR = 0.75
MAX_POLAR = 1.45
MIN_AZIMUTH = -0.4
MAX_AZIMUTH = 0.95

# Mike's blocks, oriented as drawn.
MIKE_L: frozenset[Cell] = frozenset({(0, 0, 0), (1, 0, 0), (0, 1, 0)})
MIKE_BAR: frozenset[Cell] = frozenset({(0, 0, 0), (1, 0, 0)})

# letter -> (L piece, bar piece); the figure is their union. A and D have
# exactly one split. B's bar is the back post, so it slides away from the
# viewer (toward the free space next to C) instead of into A's sliding bar;
# C's split lifts the bar straight up.
BUILDABLE: dict[str, tuple[frozenset[Cell], frozenset[Cell]]] = {
    "A": (frozenset({(0, 0, 0), (0, 0, 1), (0, 1, 1)}), frozenset({(1, 0, 1), (2, 0, 1)})),
    "B": (frozenset({(0, 1, 0), (0, 0, 0), (0, 0, 1)}), frozenset({(0, 0, 2), (0, 1, 2)})),
    "C": (frozenset({(0, 0, 0), (0, 0, 1), (1, 0, 1)}), frozenset({(0, 1, 1), (1, 1, 1)})),
    "D": (frozenset({(0, 0, 0), (0, 0, 1), (1, 0, 1)}), frozenset({(0, 1, 0), (0, 2, 0)})),
}
# A center cube with four one-cube arms: front, back, right and up.
OPTION_E: frozenset[Cell] = frozenset({(0, 0, 1), (0, 0, 0), (0, 0, 2), (1, 0, 1), (0, 1, 1)})

UNIT_STEPS: tuple[Cell, ...] = (
    (1, 0, 0), (-1, 0, 0), (0, 1, 0), (0, -1, 0), (0, 0, 1), (0, 0, -1),
)


def add(a: Cell, b: Cell) -> Cell:
    return (a[0] + b[0], a[1] + b[1], a[2] + b[2])


def sub(a: Cell, b: Cell) -> Cell:
    return (a[0] - b[0], a[1] - b[1], a[2] - b[2])


def grid_dir_to_world(v: Vec3, length: float) -> Vec3:
    """Scale a grid-space direction to world units, flipping z."""
    return (v[0] * length, v[1] * length, -v[2] * length)


def neighbors(cell: Cell, cells: frozenset[Cell]) -> list[Cell]:
    return [n for n in (add(cell, step) for step in UNIT_STEPS) if n in cells]


def is_connected(cells: frozenset[Cell]) -> bool:
    if not cells:
        return False
    start = min(cells)
    seen = {start}
    stack = [start]
    while stack:
        for n in neighbors(stack.pop(), cells):
            if n not in seen:
                seen.add(n)
                stack.append(n)
    return seen == cells


def is_l_block(cells: frozenset[Cell]) -> bool:
    """A connected 3-cube piece that bends, i.e. not the straight tricube
    (the only other one) - so it is congruent to Mike's L."""
    if len(cells) != 3 or not is_connected(cells):
        return False
    return not any(len({c[axis] for c in cells}) == 3 for axis in range(3))


def is_bar_block(cells: frozenset[Cell]) -> bool:
    return len(cells) == 2 and is_connected(cells)


def all_splits(cells: frozenset[Cell]) -> list[tuple[frozenset[Cell], frozenset[Cell]]]:
    """Every way to split `cells` into an L block plus a bar block."""
    splits = []
    for trio in combinations(sorted(cells), 3):
        l_piece = frozenset(trio)
        bar = cells - l_piece
        if is_l_block(l_piece) and is_bar_block(bar):
            splits.append((l_piece, bar))
    return splits


def validate() -> None:
    assert is_l_block(MIKE_L) and is_bar_block(MIKE_BAR)
    for letter, (l_piece, bar) in BUILDABLE.items():
        assert is_l_block(l_piece), f"{letter}: L piece is not an L block"
        assert is_bar_block(bar), f"{letter}: bar piece is not a 2-cube bar"
        assert not l_piece & bar, f"{letter}: pieces overlap"
        assert is_connected(l_piece | bar), f"{letter}: figure falls apart"
    assert len(OPTION_E) == 5 and is_connected(OPTION_E)
    assert not all_splits(OPTION_E), "E must be impossible to build"


def separation_dir(l_piece: frozenset[Cell], bar: frozenset[Cell]) -> Vec3:
    """Unit grid direction to slide the bar off the L: the average outward
    normal of every face the two pieces share."""
    total = (0, 0, 0)
    for b in bar:
        for l_cell in neighbors(b, l_piece):
            total = add(total, sub(b, l_cell))
    length = math.sqrt(sum(v * v for v in total))
    assert length > 0, "pieces must share a face"
    return (total[0] / length, total[1] / length, total[2] / length)


def cell_positions(cells: frozenset[Cell], center_x: float, ground_y: float) -> dict[Cell, Vec3]:
    """World cube centers for a figure, centered on `center_x` (x and z by
    bounding box) and standing on `ground_y`."""
    xs = [c[0] for c in cells]
    zs = [c[2] for c in cells]
    cx = (min(xs) + max(xs)) / 2
    cz = (min(zs) + max(zs)) / 2
    return {
        c: (
            center_x + (c[0] - cx) * CUBE_SIZE,
            ground_y + (c[1] + 0.5) * CUBE_SIZE,
            -(c[2] - cz) * CUBE_SIZE,
        )
        for c in cells
    }


def figure_label(
    text: str, cells: frozenset[Cell], positions: dict[Cell, Vec3], anchor: Cell,
    center_x: float, ground_y: float,
) -> LabelSpec:
    """Label centered under the figure, expressed relative to `anchor` (a
    cube that never moves, so the label stays put on Explode). It sits in
    the figure's center plane (world z = 0) so it lines up under the figure
    in the default view, dropped far enough that the figure's front bottom
    edge - which the tilted camera projects lower - doesn't overlap it."""
    front_z = max(positions[c][2] for c in cells) + CUBE_SIZE / 2
    drop = LABEL_MARGIN + front_z * math.tan(CAMERA_PITCH)
    ax, ay, az = positions[anchor]
    return LabelSpec(
        text=text,
        offset=(center_x - ax, ground_y - drop - ay, -az),
        variant="body",
    )


def cube(
    entity_id: str, position: Vec3, color: str,
    offset: Vec3 | None = None, label: LabelSpec | None = None,
) -> Entity:
    return Entity(
        id=entity_id,
        geometry=BoxGeometry(size=(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE)),
        material={"color": color, "roughness": 0.5},
        transform=Transform(position=position),
        behaviors=[ExplodeBehavior(offset=offset, speed=EXPLODE_SPEED)] if offset else [],
        label=label,
    )


def cell_id(prefix: str, cell: Cell) -> str:
    return f"{prefix}-{cell[0]}{cell[1]}{cell[2]}"


def mike_block(name: str, cells: frozenset[Cell], color: str, text: str, center_x: float) -> list[Entity]:
    positions = cell_positions(cells, center_x, BLOCKS_GROUND_Y)
    anchor = min(cells)
    label = figure_label(text, cells, positions, anchor, center_x, BLOCKS_GROUND_Y)
    return [
        cube(cell_id(name, c), positions[c], color, label=label if c == anchor else None)
        for c in sorted(cells)
    ]


def buildable_figure(letter: str, center_x: float) -> list[Entity]:
    l_piece, bar = BUILDABLE[letter]
    cells = l_piece | bar
    positions = cell_positions(cells, center_x, OPTIONS_GROUND_Y)
    slide = grid_dir_to_world(separation_dir(l_piece, bar), BAR_GAP)
    anchor = min(l_piece)
    label = figure_label(f"({letter}) ✓", cells, positions, anchor, center_x, OPTIONS_GROUND_Y)
    prefix = f"option-{letter.lower()}"

    entities = [
        cube(cell_id(f"{prefix}-l", c), positions[c], L_COLOR, label=label if c == anchor else None)
        for c in sorted(l_piece)
    ]
    entities += [cube(cell_id(f"{prefix}-bar", c), positions[c], BAR_COLOR, offset=slide) for c in sorted(bar)]
    return entities


def impossible_figure(center_x: float) -> list[Entity]:
    cells = OPTION_E
    positions = cell_positions(cells, center_x, OPTIONS_GROUND_Y)
    center = next(c for c in cells if len(neighbors(c, cells)) == 4)
    assert all(len(neighbors(c, cells)) == 1 for c in cells - {center})
    label = figure_label("(E) ✗", cells, positions, center, center_x, OPTIONS_GROUND_Y)

    entities = [cube(cell_id("option-e-center", center), positions[center], E_CENTER_COLOR, label=label)]
    entities += [
        cube(
            cell_id("option-e-arm", c), positions[c], E_COLOR,
            offset=grid_dir_to_world(sub(c, center), ARM_GAP),
        )
        for c in sorted(cells - {center})
    ]
    return entities


def orbit_camera_position(
    target: Vec3, distance: float, yaw: float, pitch: float,
) -> Vec3:
    """Spherical offset around `target`; positive yaw looks from the right,
    matching the drawing's visible right-hand side faces."""
    return (
        target[0] + distance * math.cos(pitch) * math.sin(yaw),
        target[1] + distance * math.sin(pitch),
        target[2] + distance * math.cos(pitch) * math.cos(yaw),
    )


def build_problem() -> ProblemConfig:
    validate()

    entities: list[Entity] = []
    entities += mike_block("mike-l", MIKE_L, L_COLOR, "Mike's L (3 cubes)", -BLOCK_SPACING / 2)
    entities += mike_block("mike-bar", MIKE_BAR, BAR_COLOR, "Mike's bar (2 cubes)", BLOCK_SPACING / 2)
    for i, letter in enumerate("ABCD"):
        entities += buildable_figure(letter, (i - 2) * OPTION_SPACING)
    entities += impossible_figure(2 * OPTION_SPACING)

    # Frame the vertical middle of the whole layout (blocks row on top,
    # options row below) so the default orbit target centers everything.
    ys = [e.transform.position[1] for e in entities]
    look_at = (0.0, (min(ys) + max(ys)) / 2, 0.0)

    return ProblemConfig(
        meta=ProblemMeta(
            id="MK_G1_2_2025_2Blocks",
            title="Which object cannot be built with Mike's 2 blocks?",
            description=(
                "Top: Mike's blocks, a 3-cube L (blue) and a 2-cube bar (orange). "
                "A-D are colored to show how the two blocks fit together; press "
                "Explode to pull them apart. E can't be split: its red center cube "
                "touches 4 cubes that touch nothing else, so all 5 cubes would have "
                "to be one block. Drag to tilt the view and find the hidden cubes."
            ),
            stats_type="none",
            controls=["explode"],
        ),
        camera=CameraConfig(
            mode="orthographic",
            position=orbit_camera_position(look_at, distance=600, yaw=CAMERA_YAW, pitch=CAMERA_PITCH),
            look_at=look_at,
            zoom=0.85,
            viewport_width=600,
            viewport_height=460,
            controls="limited",
            min_polar_angle=MIN_POLAR,
            max_polar_angle=MAX_POLAR,
            min_azimuth_angle=MIN_AZIMUTH,
            max_azimuth_angle=MAX_AZIMUTH,
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
    config = build_problem()
    out_path = write_problem(config, grade="MK_G1_2")
    print(f"Wrote {out_path}")


if __name__ == "__main__":
    main()
