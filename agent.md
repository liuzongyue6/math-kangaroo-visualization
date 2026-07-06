# Math Kangaroo Visualization — AI Agent Guide

## Project Layout

```
Visulization/
├── kangaroo-content/          # Python: schemas + JSON generators
│   ├── schemas/entity.py      # Geometry, Material, Behavior, Entity, LabelSpec
│   ├── schemas/problem.py     # ProblemConfig, CameraConfig, SceneConfig
│   ├── generators/_registry.py# write_problem() + manifest rebuild helper
│   ├── generators/*.py        # One script per problem, named mk_g<low>_<high>_<year>_<short_name>.py
│   └── problems/MK_G{low}_{high}/*.json + problems/manifest.json
├── kangaroo-renderer/         # React + R3F player (generic, no per-problem scenes)
│   ├── public/problems/       # JSON + manifest.json copied here for fetch()
│   └── src/
│       ├── theme.ts           # MUI (Material Design) theme
│       ├── main.tsx           # Fetches manifest.json, renders problem picker
│       ├── player/ProblemPlayer.tsx
│       ├── scene/SceneInterpreter.tsx, EntityNode.tsx
│       ├── geometries/        # gear/sphere/box/cylinder/polygon registry + materialProps.ts
│       ├── behaviors/         # rotate_coupled, click_collect, stack_fall, path_follow
│       ├── ui/                # MUI-based ProblemHeader/StatsPanel/ControlBar/HistoryPanel
│       ├── stores/problemStore.ts  # zustand bridge DOM ↔ Canvas
│       └── types/problem.ts   # Must mirror Python schema
└── proposal.txt               # Original architecture rationale
```

## Runtime Flow

1. Python generator → `ProblemConfig` JSON → `write_problem()` writes it + rebuilds `manifest.json` in both `kangaroo-content/problems/` and `kangaroo-renderer/public/problems/`
2. `main.tsx` fetches `manifest.json`, renders a grade-band-grouped MUI `Select` (e.g. "Grade 1-2", "Grade 5-6"), then fetches the chosen problem JSON
3. `ProblemPlayer` initializes zustand from `scene.initial_state`
4. DOM shell (MUI header/stats/controls/history) + R3F `SceneInterpreter`
5. `EntityNode` renders geometry + attaches behavior hooks (via small "Host" components so hooks aren't called conditionally) + optional `label` via drei `Html`
6. Behaviors write to zustand; DOM components subscribe — no props drilling

## Commands

```bash
# Generate JSON (also rebuilds manifest.json)
cd kangaroo-content
pip install pydantic
python generators/mk_g1_2_2021_gear_ratio.py
python generators/mk_g1_2_2025_drop_ball.py
python generators/mk_g5_6_2020_cube3x3x3.py

# Run dev server
cd kangaroo-renderer
npm install
npm run dev
```

## Naming Convention

Problems are identified and grouped by Math Kangaroo **grade band**, not by year:

```
MK_G<lowGrade>_<highGrade>_<competitionYear>_<ShortName>
```

e.g. `MK_G1_2_2021_GearRatio`. This id string is used consistently as: the generator script name (`mk_g1_2_2021_gear_ratio.py`, snake_case), the `ProblemMeta.id`, the JSON filename, and it lives inside the `MK_G1_2/` grade folder. `_registry.rebuild_manifest()` parses the 4-digit year back out of the id for display/sorting, but the folder/grouping key is always the grade band (`MK_G1_2`, `MK_G5_6`, ...).

## Adding a New Problem

**Default path (no React changes):**

1. Create `kangaroo-content/generators/mk_g<low>_<high>_<year>_<short_name>.py` returning a `ProblemConfig` whose `meta.id` is `MK_G<low>_<high>_<year>_<ShortName>`
2. Call `write_problem(config, grade="MK_G<low>_<high>")` from `generators._registry` as the last step of `main()` — this writes the JSON to both `kangaroo-content/problems/` and `kangaroo-renderer/public/problems/`, and regenerates `manifest.json` in both places
3. Run the script. The new problem appears in the frontend dropdown automatically — no `main.tsx` edit required

**Reuse matrix (v2):**

| Problem pattern | Geometry | Behavior | meta.stats_type |
|-----------------|----------|----------|-----------------|
| Gear / pulley / clock hands | `gear` | `rotate_coupled` | `gear` |
| Drop balls / click-remove-and-stack | `sphere`, `box` | `click_collect` + `stack_fall` | `coins` |
| Grid/flip-card collect (no column physics) | any | `click_collect` only | `coins` |
| Maze / number-line jump | any + `SceneConfig.paths` | `path_follow` | — |
| Nets / tangram / area / custom flat shapes | `polygon` (2D point list) | — | — |
| Coin stacks / pulleys / clock body | `cylinder` | — | — |

**Coordinate rule:** HTML canvas (top-left origin) → scene coords:
`x' = x - viewport_width/2`, `y' = viewport_height/2 - y`

**Python owns math:** gear ratios, mesh phase offsets (`initial_rotation`), layout positions, path point lists.

**Camera:** pick `camera.controls`:
- Use `locked` (default) for problems that are conceptually 2D/flat — keeps the "clean diagram" look, no accidental tilting.
- Use `limited` with `min_polar_angle`/`max_polar_angle` for problems that benefit from a *little* 3D depth without letting users spin it randomly.
- Use `orbit` only when free 3D exploration is actually part of the problem.

## Extending the Framework

Only when reuse fails:

1. Add geometry/behavior to `schemas/entity.py` (and keep `Material`/`LabelSpec` reuse in mind before adding new free-form fields)
2. Mirror types in `src/types/problem.ts`
3. Add a mesh component under `geometries/` (reuse `materialProps()` + drei `Outlines` for visual consistency) or a behavior hook under `behaviors/`, then register it in `geometries/index.ts` / wire it in `scene/EntityNode.tsx`

Do NOT create per-problem React scene components.

## Key Files

| Purpose | File |
|---------|------|
| Problem JSON schema | `kangaroo-content/schemas/problem.py` |
| Entity/Geometry/Behavior schema | `kangaroo-content/schemas/entity.py` |
| Generator → JSON + manifest helper | `kangaroo-content/generators/_registry.py` |
| Gear example generator | `kangaroo-content/generators/mk_g1_2_2021_gear_ratio.py` |
| Drop balls generator | `kangaroo-content/generators/mk_g1_2_2025_drop_ball.py` |
| Cube explode generator | `kangaroo-content/generators/mk_g5_6_2020_cube3x3x3.py` |
| Problem discovery (manifest-driven) | `kangaroo-renderer/src/main.tsx` |
| MUI theme | `kangaroo-renderer/src/theme.ts` |
| State store | `kangaroo-renderer/src/stores/problemStore.ts` |
| Scene entry | `kangaroo-renderer/src/scene/SceneInterpreter.tsx` |
| Shared material mapping | `kangaroo-renderer/src/geometries/materialProps.ts` |

## Conventions

- UI text, counters, buttons → DOM only (MUI components), except short entity annotations which may use `Entity.label` (still DOM via drei `Html`, just anchored to a 3D position)
- Scene objects → R3F only, all sharing `materialProps()` + drei `Outlines` for a consistent look
- Canvas uses `frameloop="demand"`; behaviors call `invalidate()` when animating
- `initial_state` must include all fields `problemStore` reads on reset
- Behaviors are declared explicitly — never infer one behavior's effect from another's presence (e.g. `stack_fall` carries its own `stack_order`, it does not reach into `click_collect`)
