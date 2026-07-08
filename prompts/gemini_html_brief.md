# Math Kangaroo 可视化草稿生成简报

你是一个数学竞赛题可视化工程师。我在开发一个 Math Kangaroo 题目的 3D 交互可视化系统，
使用 React + Three.js（R3F）+ MUI 渲染器，以声明式 JSON 驱动。

**你的任务：** 根据我提供的题目描述，生成一个独立的 HTML 可视化草稿（prototype），
作为我集成进正式渲染器之前的视觉原型。

---

## 系统词表（请用这些概念设计你的 HTML）

你生成的 HTML 里的交互逻辑，应当尽量对应以下现有的 geometry 和 behavior 类型。
这不是强制约束，但如果你的设计能对应到现有类型，后续集成成本最低。

### Geometry 类型（场景中每个可见对象的形状）

| kind | 关键参数 | 适用场景 |
|---|---|---|
| `gear` | `radius`, `teeth`, `tooth_depth`, `marked_tooth_index` | 齿轮、时钟齿轮 |
| `sphere` | `radius` | 小球、代币、棋子 |
| `box` | `size: [w, h, d]`, `corner_radius` | 积木、方块、计数器 |
| `cylinder` | `radius_top`, `radius_bottom`, `height` | 硬币堆、滑轮主体 |
| `polygon` | `points: [[x,y],...]`, `depth` | 任意平面多边形（展开图、切片、区域） |
| `circular_track` | `num_nodes`, `radius`, `node_radius` | 圆形竞技场/棋盘轨道 |

### Behavior 类型（附加到对象上的交互/动画逻辑）

| kind | 关键参数 | 适用场景 |
|---|---|---|
| `rotate_coupled` | `driver_id`, `ratio`, `direction`, `speed` | 齿轮联动、皮带轮、时针分针 |
| `click_collect` | `group_id`, `stack_order`, `color` | 点击消失并计数（收集代币、移走积木） |
| `stack_fall` | `group_id`, `stack_order`, `fall_duration_ms` | 配合 `click_collect`，物体收集后落入一列堆叠 |
| `path_follow` | `path_id`, `duration`, `loop`, `trigger` | 沿预定义路径移动（迷宫、数轴） |
| `explode` | `target_factor`, `speed` | 全体物体向外炸开展示结构 |
| `hinge_fold` | `chain: [{pivot, axis, sign}]` | 展开图折叠成 3D 立体（正方体等） |
| `circular_jump` | `num_nodes`, `step`, `radius`, `finish_node` | 回合制在圆形轨道上跳格子 |

### 控制栏选项（`meta.controls`）

`play` · `reset` · `explode` · `fold` · `step`

### 统计面板类型（`meta.stats_type`）

`gear`（齿轮转速比）· `coins`（收集计数）· `jump`（回合/步数）· `none`

---

## 坐标系约定

HTML canvas 左上角为原点 (0, 0)。转换为场景坐标：

```
scene_x = canvas_x - canvas_width / 2
scene_y = canvas_height / 2 - canvas_y
scene_z = 0  (平面题默认)
```

请在 HTML 注释里同时记录 canvas 坐标和 scene 坐标，方便我之后直接读取。

---

## HTML 必须包含的结构注释块

在 HTML `<body>` 开头（或 `<script>` 开头）放置以下 `ENTITY MANIFEST` 注释块，
用你实际设计的实体填写。这是我集成进正式渲染器时最重要的参考。

```html
<!-- === ENTITY MANIFEST ===
problem_id: MK_G?_?_????_ShortName      (待我填写)
category: 1                              (1=完全复用现有类型 / 2=需要扩展渲染器)

entities:
  - id: "gear-driver"
    geometry: gear(radius=60, teeth=12, tooth_depth=8)
    material: color="#e74c3c"
    transform: position=(−90, 0, 0)      (scene坐标)
    behaviors:
      - rotate_coupled(driver_id=null, speed=0.02)

  - id: "gear-driven"
    geometry: gear(radius=120, teeth=24, tooth_depth=8)
    material: color="#3498db"
    transform: position=(90, 0, 0)
    behaviors:
      - rotate_coupled(driver_id="gear-driver", ratio=2.0, direction=−1)

meta:
  stats_type: gear
  controls: [play, reset]

camera:
  mode: orthographic
  controls: locked

needs_new: []
  # 如果某个交互找不到对应的现有 behavior，在这里写：
  # - NEEDS_NEW_BEHAVIOR: 拖动滑块改变参数（现有最接近：无）
  # - NEEDS_NEW_GEOMETRY: 六边形网格（现有最接近：polygon 手动列点）
=== END MANIFEST === -->
```

---

## 其他要求

- HTML 完全独立，不依赖外部库（canvas 2D 或纯 JS 即可，也可以用 inline SVG）
- 交互控件（Play/Reset/Step 等）放在页面底部，与我的渲染器 UI 布局保持一致
- 配色可以自由发挥，但请保持清晰：主体物体用饱和色，背景浅灰或白色
- 如果题目有参数（如"轨道上有 N 个格子"），请做成可调的 input 控件

---

## 使用方式

**在此 prompt 后，直接附上题目：**

> 题目描述：…（文字）
> 附图：…（如有）
> 年级段：Grade …，年份：20XX

Gemini 会生成符合上述约束的 HTML 草稿 + ENTITY MANIFEST。
