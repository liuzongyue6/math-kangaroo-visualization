# Math Kangaroo Entity+Behavior Visualization Framework

Monorepo for declarative Math Kangaroo problem visualizations: Python generates JSON configs, React + R3F renders them through a reusable Entity/Behavior interpreter. The DOM shell uses Google Material Design (MUI).

# Overall workflow
Python 生成数据 → JSON 是唯一的"内容"载体 → React+WebGL 通用播放器解释数据 → Vite 打包 → GitHub Pages 部署。

## Structure

```
Visulization/
├── kangaroo-content/     # Python schemas + problem generators
├── kangaroo-renderer/    # React + R3F player
├── proposal.txt          # Architecture design notes
└── README.md
```

## Quick Start

### 1. Generate problem JSON (Python)

```bash
cd kangaroo-content
pip install pydantic
python generators/run_all.py
```

`run_all.py` discovers every `generators/mk_*.py` script by filename convention and runs each one, so adding a new generator later needs no edits here (or in CI). To run a single generator instead (e.g. while iterating on one problem):


```bash
python generators/run_all.py
python generators/mk_g1_2_2021_gear_ratio.py
```

Each generator writes its `ProblemConfig` JSON to `kangaroo-content/problems/<grade>/`, mirrors it to `kangaroo-renderer/public/problems/<grade>/`, and regenerates `problems/manifest.json` (also mirrored) so the frontend can discover every problem automatically — no React edits needed.

### Naming convention

Problems are grouped by Math Kangaroo grade band, not by year. Every problem id (and its JSON filename, generator script, and folder) follows:

```
MK_G<lowGrade>_<highGrade>_<competitionYear>_<ShortName>
```

e.g. `MK_G1_2_2021_GearRatio` lives at `problems/MK_G1_2/MK_G1_2_2021_GearRatio.json` and is produced by `generators/mk_g1_2_2021_gear_ratio.py`. The competition year is still parsed out of the id for display/sorting, but the folder/grouping key is the grade band.

### 2. Run the renderer (Node.js)

```bash
npm install
npm run dev
```


### 3. Production build

```bash
cd kangaroo-renderer
npm run build
npm run preview
```

## Architecture

| Layer | Responsibility |
|-------|----------------|
| **DOM shell** | Title, stats, buttons, history — MUI-based `ProblemHeader`, `StatsPanel`, `ControlBar`, `HistoryPanel` |
| **R3F scene** | Gears, spheres, boxes, cylinders, polygons — `SceneInterpreter` + geometry/behavior registries |
| **zustand store** | Bridges DOM and Canvas (`coins`, `rotations`, `collected`, `isPlaying`) |

New problems are added by:
1. Writing a Python generator (named `mk_g<low>_<high>_<year>_<short_name>.py`) that outputs `ProblemConfig` JSON via `generators._registry.write_problem(config, grade)`, where `grade` is the `MK_G<low>_<high>` folder name
2. No new React scene components required if the problem can be expressed by existing geometries/behaviors (reuse `gear`/`sphere`/`box`/`cylinder`/`polygon` + `rotate_coupled`/`click_collect`/`stack_fall`/`path_follow`/`explode`/`hinge_fold`/`circular_jump`)
3. No `main.tsx` edits — the problem picker reads `public/problems/manifest.json`, which is rebuilt automatically by every generator run

## Supported Primitives (v2)

**Geometries:** `gear`, `sphere`, `box` (optional `corner_radius` for rounded/pill shapes), `cylinder`, `polygon` (arbitrary 2D point list, extruded — covers nets/tangrams/area problems)

**Behaviors:**
- `rotate_coupled` — gears, pulleys, clock hands
- `click_collect` — click-to-remove-and-tally (drop balls, grid counting)
- `stack_fall` — declared independently from `click_collect` so "falls into a column" physics can be mixed freely with any collection UX
- `path_follow` — move along a named path from `SceneConfig.paths` (mazes, number lines), auto-start or click-triggered
- `explode` — radially offsets an entity from the origin (its `transform.position` scaled by `target_factor`), driven by the global `isExploded` toggle; pair with `meta.controls: ["explode"]` for an Explode/Assemble button (3D structure/cube-count problems)
- `hinge_fold` — animates a flat net folding into a 3D solid (cube/box nets). Each entity carries a root-first `chain` of `HingeJoint`s (pivot + axis + sign); every joint rotates by the same global `foldAngle`, so multi-hinge flaps compose correctly with no entity parent/child tree required. Pair with `meta.controls: ["fold"]` for a fold-angle slider (-90°..90°)
- `circular_jump` — discrete, turn-based hop around a shared circular node layout (racing/track problems). Every racer entity declares the same `num_nodes`/`center`/`radius` plus its own `step` size and `lane_offset`; clicking Jump (`meta.controls: ["step"]`) advances the shared `turnCount`, and each racer hops `step` nodes with a parabolic arc, freezing once it lands exactly on `finish_node`

**Material:** typed `Material` (`color`, `opacity`, `metalness`, `roughness`, `wireframe`) shared by every geometry — no more free-form dicts.

**Labels:** optional `Entity.label` anchors DOM-rendered text to a 3D position via drei's `Html`, so per-entity annotations (tooth numbers, axis ticks) stay accessible/selectable without giving up 3D anchoring. By default labels billboard (always face the camera); set `follow_rotation: true` (with `variant: "symbol"`) to instead glue the label to the entity's live 3D orientation — needed for symbols painted on faces that rotate, e.g. `hinge_fold` flaps.

**Stats:** `ProblemMeta.stats_type` picks the DOM stats panel: `gear` (rotation counters), `coins` (coin tally + collected history), `jump` (turn counter, per-racer status, and winner banner for `circular_jump` races), or `none` (hide the panel for problems with no running tally, e.g. structure/exploration demos).

**Camera:** `orthographic` (2D) or `perspective` (3D). `camera.controls` picks the interaction model:
- `locked` (default) — no OrbitControls, camera is fixed at the authored angle for a clean "diagram" look
- `limited` — OrbitControls constrained between `min_polar_angle`/`max_polar_angle`
- `orbit` — fully free OrbitControls

## Visual Design

The DOM shell uses [MUI](https://mui.com/) (`src/theme.ts`) with a softened Material palette, pill buttons, and card-style panels. The 3D scene uses a single consistent material language (`meshStandardMaterial` via `geometries/materialProps.ts`) with drei's `Outlines` for a uniform "clean vector" outline on every mesh, `RoundedBox` for rounded frames, and soft shadows enabled on the `Canvas`.

## Pipeline


数学袋鼠竞赛原题
   ↓ (人工阅读理解题意)
kangaroo-content/generators/mk_xx_xxxx.py   ← Python 脚本手写
   ↓ 用 Pydantic schema (schemas/entity.py, problem.py) 构造 ProblemConfig
   ↓ 计算：齿轮传动比、坐标转换、初始状态 initial_state 等数学逻辑
_registry.py::write_problem(config, grade)
   ↓ 序列化为 JSON，同时写两份：
   ├─ kangaroo-content/problems/<grade>/<id>.json      （源）
   └─ kangaroo-renderer/public/problems/<grade>/<id>.json （镜像，给前端用）
   ↓ 自动重建 manifest.json（题目索引，两边都更新）
kangaroo-renderer (React + Vite 项目)
   ↓ main.tsx 启动时 fetch manifest.json → 生成下拉菜单
   ↓ 用户选题 → fetch 对应 JSON → SceneInterpreter 解析
   ↓ EntityNode 按 geometry.kind 找 geometries/ 里的网格生成器
   ↓ behaviors/ 里的 hook 负责动画/交互，读写 zustand store
   ↓ ui/ 下的 MUI 组件（ControlBar/StatsPanel/…）同样订阅这个 store
   ↓ npm run build → dist/
   ↓ GitHub Actions (.github/workflows/deploy.yml) 自动跑生成器+构建+发布到 GitHub Pages

##
检查/关闭本地开发服务器
# 方式1：看端口占用（Vite 默认 5173，如果被占用会自动换成 5174/5175...）
Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
# 方式2：直接看有没有 node 进程在跑 vite
Get-Process node -ErrorAction SilentlyContinue

# 找出占用 5173 端口的进程 PID
Get-NetTCPConnection -LocalPort 5173 | Select-Object OwningProcess
# 用 PID 结束进程（把 <PID> 换成上面查到的数字）
Stop-Process -Id <PID> -Force