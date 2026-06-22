# pramodyadav027/skills

The central manifest of agent skills for pramodyadav027. It holds two kinds of skill, both
delivered to developers' agents via [`npx @pramodyadav027/skills-pm`](https://www.npmjs.com/package/@pramodyadav027/skills-pm):

- **`skills/.curated/`** — skills we author for our own software standards (API conventions,
  PR workflow, testing, etc.).
- **`skills/.vendored/`** — curated **copies** of the best public skills, pinned to a reviewed
  upstream commit. The list, pins, and provenance live in [`skills.yml`](./skills.yml).

Target agent: **Claude Code**. Install scope: **global** (applies across all of a user's projects).

```
.
├── skills/
│   ├── .curated/<skill>/SKILL.md      # our standards (edit freely)
│   └── .vendored/<skill>/SKILL.md     # external copies (do NOT hand-edit)
├── skills.yml                          # the manifest: vendored list, pins, provenance
├── scripts/vendor-sync.py              # re-pull vendored skills from upstream
├── .github/workflows/refresh.yml       # weekly: bump vendored skills, open a PR
├── bin/skills-sync.js                  # the @pramodyadav027/skills-pm consumer CLI
└── package.json                        # npm package definition
```

## For developers: install & stay current

One command installs everything and keeps it updated (Claude Code, global):

```bash
npx @pramodyadav027/skills-pm sync
```

Pin to a released tag instead of the latest `main`:

```bash
npx @pramodyadav027/skills-pm sync --tag v2
```

Under the hood this runs:

```bash
npx skills add pramodyadav027/skills -g --all -a claude-code -y
npx skills update -g -y
```

Other commands: `npx @pramodyadav027/skills-pm list`, `npx @pramodyadav027/skills-pm remove`.

### Keep it automatic

- **In a project repo (CI-enforced):** add a job that runs `npx @pramodyadav027/skills-pm sync` so the
  agent picks up the latest standards on every CI run / devcontainer create. See
  `examples/consumer-ci.yml`.
- **For an individual:** schedule `npx @pramodyadav027/skills-pm sync` to run weekly (cron, or your
  agent's scheduled-task feature).

## For maintainers

### Add or change a pramodyadav027 standard
Edit/create a folder under `skills/.curated/<name>/SKILL.md` with `name` + `description`
frontmatter. Open a PR. Tag a release (`vN`) when you want consumers on tags to pick it up.

### Add an external skill
1. Find it: `npx skills find <query>` or browse https://skills.sh.
2. Add an entry under `vendored:` in `skills.yml` (dest, repo, path, commit, audited, reviewer).
3. Run `python3 scripts/vendor-sync.py` to vendor it in (needs `pip install ruamel.yaml`).
4. Review the vendored `SKILL.md` (and any scripts) for security, then PR it.

### Refresh externals to latest
`python3 scripts/vendor-sync.py --latest` rewrites the pins in `skills.yml` to upstream HEAD.
The weekly Action does this automatically and opens a PR — **review before merging**, since it
contains third-party changes.

### Hide work-in-progress
Add `metadata.internal: true` to a `SKILL.md`; it won't ship until you remove it.

## Releasing

Tag the repo (`git tag v2 && git push --tags`) to cut a stable version. Consumers using
`--tag` / `PRAMODYADAV027_SKILLS_PM_TAG` stay on that version; consumers without a tag track `main`.
