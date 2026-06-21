#!/usr/bin/env python3
"""
vendor-sync.py — vendor external skills declared in skills.yml into
skills/.vendored/<dest>, each pinned to its recorded commit/tag.

Usage:
    python3 scripts/vendor-sync.py            # sync all enabled entries at their pins
    python3 scripts/vendor-sync.py --latest   # fetch each repo's default HEAD and
                                              # rewrite the `commit` field in skills.yml

Requires: git, and ruamel.yaml (`pip install ruamel.yaml`).
ruamel preserves the comments and formatting in skills.yml across --latest rewrites.
"""
import argparse
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

try:
    from ruamel.yaml import YAML
except ImportError:
    sys.exit("error: ruamel.yaml is required. Install it with: pip install ruamel.yaml")

yaml = YAML()
yaml.preserve_quotes = True
yaml.indent(mapping=2, sequence=4, offset=2)

REPO_ROOT = Path(__file__).resolve().parent.parent
MANIFEST = REPO_ROOT / "skills.yml"
VENDOR_DIR = REPO_ROOT / "skills" / ".vendored"
PLACEHOLDER = "REPLACE_WITH_COMMIT_SHA"


def git(*args, cwd=None):
    subprocess.run(["git", *args], cwd=cwd, check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)


def git_out(*args, cwd=None):
    return subprocess.run(["git", *args], cwd=cwd, check=True,
                          capture_output=True, text=True).stdout.strip()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--latest", action="store_true",
                    help="ignore pins, fetch upstream HEAD, and rewrite skills.yml")
    args = ap.parse_args()

    if not MANIFEST.exists():
        sys.exit(f"error: {MANIFEST} not found")

    with MANIFEST.open() as f:
        data = yaml.load(f) or {}
    entries = data.get("vendored") or []
    VENDOR_DIR.mkdir(parents=True, exist_ok=True)
    changed_manifest = False

    for entry in entries:
        if not entry.get("enabled", True):
            print(f"-- skip {entry.get('dest')} (disabled)")
            continue

        dest = entry["dest"]
        repo = entry["repo"]
        path = entry["path"]
        commit = entry.get("commit") or ""

        print(f"==> {dest}  ({repo} @ {commit or 'HEAD'})")
        with tempfile.TemporaryDirectory() as tmp:
            clone = Path(tmp) / dest
            git("clone", "--quiet", "--no-checkout",
                f"https://github.com/{repo}.git", str(clone))

            if args.latest or not commit or commit == PLACEHOLDER:
                commit = git_out("rev-parse", "HEAD", cwd=clone)
                print(f"    resolved latest commit: {commit}")
                if entry.get("commit") != commit:
                    entry["commit"] = commit
                    changed_manifest = True

            git("checkout", "--quiet", commit, cwd=clone)

            src = clone / path
            if not (src / "SKILL.md").is_file():
                sys.exit(f"    error: {path}/SKILL.md not found in {repo}@{commit}")

            target = VENDOR_DIR / dest
            if target.exists():
                shutil.rmtree(target)
            shutil.copytree(src, target)
            print(f"    vendored -> skills/.vendored/{dest}")

    if changed_manifest:
        with MANIFEST.open("w") as f:
            yaml.dump(data, f)
        print("Updated pins in skills.yml.")

    print("Done. Review 'git status' and commit the vendored changes + skills.yml.")


if __name__ == "__main__":
    main()
