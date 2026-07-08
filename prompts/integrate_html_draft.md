# HTML 草稿 → 项目集成简报

你是本仓库（Math Kangaroo Visualization）的开发 Agent。我会给你一个由 Gemini
生成的 HTML 可视化草稿（带 `ENTITY MANIFEST` 注释块），你的任务是把它集成为一个
正式的 Python 生成器，产出 `ProblemConfig` JSON，并接入现有 pipeline。

**在开始前，请先阅读 `agent.md`**，它定义了本仓库的架构约定、命名规则和扩展流程，
本简报只是针对"HTML 草稿 → 生成器"这一步的操作细化。

---

## 输入

- 一个 HTML 文件，`<!-- === ENTITY MANIFEST === -->` 注释块里列出了：
  - `problem_id`（可能待填）、`category`（1=复用现有类型 / 2=需要扩展）
  - 每个 entity 的 `geometry` / `material` / `transform` / `behaviors`
  - `meta`（`stats_type`, `controls`）、`camera`
  - `needs_new`（如果有交互找不到对应 behavior/geometry）
- 题目本身的文字描述（年级段、年份、题干），如果 HTML 里没写全，向我确认

---

## 集成步骤

### 1. 确定 problem_id 和文件路径

按 `MK_G<low>_<high>_<year>_<ShortName>` 命名（见 `agent.md` Naming Convention）。
生成器脚本路径：`kangaroo-content/generators/mk_g<low>_<high>_<year>_<short_name>.py`
（snake_case）。按年级段分组，不要按年份分组。

### 2. 处理 `category`

- **category: 1（完全复用）** → 直接进入第 3 步。
- **category: 2（`needs_new` 非空）** → 先停下来，不要直接编代码。向我报告：
  - 缺什么（`NEEDS_NEW_BEHAVIOR` / `NEEDS_NEW_GEOMETRY`）
  - 有没有现有类型可以"降级近似"实现（哪怕效果打折扣），作为临时方案
  - 是否值得按 `agent.md` 的 "Extending the Framework" 流程新增类型
  - 等我确认方案后再动手

### 3. 坐标转换

ENTITY MANIFEST 里的 `transform.position` 应该已经是 scene 坐标
（HTML 生成阶段已按 `x' = x - W/2, y' = H/2 - y` 转换）。如果发现还是 canvas 像素坐标，
在生成器里用相同公式转换一遍，不要硬编码转换后的数字，保留一个
`canvas_to_scene()` 辅助函数，方便日后调整。

### 4. 编写生成器脚本

结构参考 `kangaroo-content/generators/mk_g1_2_2021_gear_ratio.py`：

```python
"""Generate <PROBLEM_ID>: <一句话描述>."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from generators._registry import write_problem  # noqa: E402
from schemas.entity import (  # noqa: E402
    Entity,
    # ... 用到的 Geometry / Behavior 类
    Transform,
)
from schemas.problem import CameraConfig, ProblemConfig, ProblemMeta, SceneConfig  # noqa: E402

CANVAS_W = ...
CANVAS_H = ...


def canvas_to_scene(x: float, y: float, z: float = 0) -> tuple[float, float, float]:
    return (x - CANVAS_W / 2, CANVAS_H / 2 - y, z)


def build_problem() -> ProblemConfig:
    entities = [
        Entity(id="...", geometry=..., material={"color": "..."}, transform=Transform(position=...), behaviors=[...]),
        ...
    ]
    return ProblemConfig(
        meta=ProblemMeta(
            id="<PROBLEM_ID>",
            title="...",
            description="...",
            stats_type="...",   # 来自 ENTITY MANIFEST 的 meta.stats_type
            controls=[...],     # 来自 ENTITY MANIFEST 的 meta.controls
        ),
        camera=CameraConfig(...),  # 来自 ENTITY MANIFEST 的 camera
        scene=SceneConfig(
            entities=entities,
            initial_state={...},  # 见下方第 5 步，HTML 里未必有对应信息，需要你补全
        ),
    )


def main() -> None:
    config = build_problem()
    out_path = write_problem(config, grade="MK_G<low>_<high>")
    print(f"Wrote {out_path}")


if __name__ == "__main__":
    main()
```

关键点：

- 每个 `Entity.id` 必须唯一，`RotateCoupledBehavior.driver_id` /
  `ClickCollectBehavior.group_id` 等跨实体引用要对应到这些 id
- 数学计算（齿轮传动比、间距、hinge chain 的 pivot 坐标等）在 Python 里用代码算，
  不要从 HTML 里抄写死数字（HTML 只是视觉参考，不是数据源）
- `material` 可以直接传 dict（如 `{"color": "#e74c3c"}`），Pydantic 会解析成 `Material`

### 5. 补全 `initial_state`

这是 HTML 草稿通常**覆盖不到**的部分——`ProblemPlayer` 用它初始化 zustand store。
检查用到的每个 behavior，确保 `initial_state` 包含它读取的所有字段，例如：

| Behavior | 通常需要的 initial_state 字段 |
|---|---|
| `rotate_coupled` | `isPlaying`, `rotations: {<id>: 0, ...}`, `driverAngles` |
| `click_collect` | `coins`, `collected: []`, `history: []`, `message` |
| `hinge_fold` | `foldAngle`, `foldAngleAnimated` |
| `explode` | `isExploded` |
| `circular_jump` | `turnCount`, `jumpFinishedTurn`, `isJumping` |

参考同类型现有生成器（如 `mk_g1_2_2021_gear_ratio.py` 用到 `rotate_coupled`）里的
`initial_state` 写法。

### 6. 运行并验证

```bash
cd kangaroo-content
python generators/mk_g<low>_<high>_<year>_<short_name>.py
```

确认：
- 脚本无报错，打印出写入路径
- `kangaroo-content/problems/<grade>/<id>.json` 和
  `kangaroo-renderer/public/problems/<grade>/<id>.json` 都已生成
- `problems/manifest.json` 里出现了新条目（`rebuild_manifest()` 自动完成，无需手动改）

如果条件允许，启动渲染器做一次目视检查：

```bash
cd kangaroo-renderer
npm run dev
```

打开新题目，对照原始 HTML 草稿检查视觉效果和交互是否一致（形状、颜色、动画方向、
点击行为等），重点检查容易出错的地方：旋转方向（`direction`/`ratio` 正负号）、
坐标是否镜像、`stack_order`/`driver_id` 等跨实体引用是否写对。

### 7. 收尾

- 不要新建任何 per-problem 的 React 组件（除非第 2 步确认了需要扩展渲染器）
- 不要手动编辑 `manifest.json` 或 `main.tsx`——它们都是自动发现的
- 如果这道题在第 2 步走了 category 2 分支并新增了 geometry/behavior，记得同步：
  1. `kangaroo-content/schemas/entity.py`
  2. `kangaroo-renderer/src/types/problem.ts`
  3. 对应的 mesh 组件 / behavior hook，并在 `geometries/index.ts` /
     `scene/EntityNode.tsx` 里注册

---

## 使用方式

把这份简报和 HTML 草稿文件一起发给我（贴 HTML 内容或附上文件路径），
如有题目背景信息（年级、年份、原始题干）请一并附上。
