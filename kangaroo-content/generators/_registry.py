"""Shared helpers for problem generators: JSON output + manifest bookkeeping.

Every generator should call `write_problem(config, grade)` as its last step.
This keeps `kangaroo-renderer/public/problems/manifest.json` in sync so the
frontend can discover problems without any hand-edited registry.

Naming convention: problem ids follow `MK_G<low>_<high>_<year>_<ShortName>`
(e.g. `MK_G1_2_2021_GearRatio`), grouping problems by Math Kangaroo grade
band (`MK_G1_2`, `MK_G5_6`, ...) rather than by competition year. Each
generator writes into `problems/<grade>/<id>.json`; the actual competition
year is parsed out of the id for display purposes.
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

CONTENT_ROOT = Path(__file__).resolve().parent.parent
PROBLEMS_DIR = CONTENT_ROOT / "problems"
RENDERER_PUBLIC_DIR = CONTENT_ROOT.parent / "kangaroo-renderer" / "public" / "problems"

_YEAR_RE = re.compile(r"_(\d{4})_")
_GRADE_NUMS_RE = re.compile(r"\d+")


def serialize_model(model: Any) -> dict:
    if hasattr(model, "model_dump"):
        return model.model_dump()
    return model.dict()


def _extract_year(problem_id: str) -> str:
    """Pull the 4-digit competition year out of an `MK_G<band>_<year>_<Name>` id."""
    match = _YEAR_RE.search(problem_id)
    return match.group(1) if match else "unknown"


def _grade_sort_key(grade: str) -> tuple[int, ...]:
    """Sort grade folders numerically (MK_G1_2 before MK_G5_6, not alphabetically)."""
    nums = tuple(int(n) for n in _GRADE_NUMS_RE.findall(grade))
    return nums or (999,)


def write_problem(config: Any, grade: str) -> Path:
    """Write a ProblemConfig JSON to content + renderer public dirs, then
    rebuild the shared manifest so the frontend picks it up automatically.

    `grade` is the Math Kangaroo grade-band folder name, e.g. `MK_G1_2`.
    """
    problem_id = config.meta.id
    payload = json.dumps(serialize_model(config), indent=2, ensure_ascii=False)

    out_dir = PROBLEMS_DIR / grade
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{problem_id}.json"
    out_path.write_text(payload, encoding="utf-8")

    renderer_dir = RENDERER_PUBLIC_DIR / grade
    renderer_dir.mkdir(parents=True, exist_ok=True)
    (renderer_dir / f"{problem_id}.json").write_text(payload, encoding="utf-8")

    rebuild_manifest()
    return out_path


def rebuild_manifest() -> None:
    """Scan every problem JSON on disk and regenerate manifest.json."""
    entries: list[dict] = []

    if PROBLEMS_DIR.exists():
        for grade_dir in sorted(
            (p for p in PROBLEMS_DIR.iterdir() if p.is_dir()),
            key=lambda p: _grade_sort_key(p.name),
        ):
            for json_path in sorted(grade_dir.glob("*.json")):
                data = json.loads(json_path.read_text(encoding="utf-8"))
                meta = data.get("meta", {})
                problem_id = meta.get("id", json_path.stem)
                entries.append(
                    {
                        "id": problem_id,
                        "title": meta.get("title", json_path.stem),
                        "description": meta.get("description", ""),
                        "grade": grade_dir.name,
                        "year": _extract_year(problem_id),
                        "stats_type": meta.get("stats_type", "gear"),
                        "path": f"problems/{grade_dir.name}/{json_path.name}",
                    }
                )

    manifest_json = json.dumps({"problems": entries}, indent=2, ensure_ascii=False)

    PROBLEMS_DIR.mkdir(parents=True, exist_ok=True)
    (PROBLEMS_DIR / "manifest.json").write_text(manifest_json, encoding="utf-8")

    RENDERER_PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    (RENDERER_PUBLIC_DIR / "manifest.json").write_text(manifest_json, encoding="utf-8")
