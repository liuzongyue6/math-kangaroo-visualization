"""Run every problem generator in this package.

Discovers scripts by filename convention (`generators/mk_*.py`) instead of
hard-coding a list, so adding a new generator file is automatically picked
up here and in CI (`.github/workflows/deploy.yml`) with zero edits.

Usage:
    python generators/run_all.py
    # or, from anywhere:
    python kangaroo-content/generators/run_all.py
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

GENERATORS_DIR = Path(__file__).resolve().parent


def find_generators() -> list[Path]:
    """Every problem generator script, in stable (alphabetical) order."""
    return sorted(GENERATORS_DIR.glob("mk_*.py"))


def main() -> None:
    generators = find_generators()
    if not generators:
        print("No generator scripts found (expected generators/mk_*.py).")
        sys.exit(1)

    failures: list[str] = []
    for script in generators:
        print(f"--- Running {script.name} ---", flush=True)
        result = subprocess.run([sys.executable, str(script)])
        if result.returncode != 0:
            failures.append(script.name)

    print(flush=True)
    if failures:
        print(f"{len(failures)}/{len(generators)} generator(s) failed: {', '.join(failures)}", flush=True)
        sys.exit(1)

    print(f"All {len(generators)} generators ran successfully.", flush=True)


if __name__ == "__main__":
    main()
