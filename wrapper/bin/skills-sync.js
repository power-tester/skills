#!/usr/bin/env node
/**
 * Thin wrapper over `npx skills` so users don't memorize flags.
 * Configure via the "skillsConfig" key in package.json.
 *
 *   npx @yourorg/skills sync          install + update skills (Claude Code, global)
 *   npx @yourorg/skills sync --tag v2 pin to a released tag instead of the default branch
 *   npx @yourorg/skills list          list installed skills
 *   npx @yourorg/skills remove        remove skills
 */
const { skillsConfig, name: PKG_NAME } = require("../package.json");
const SOURCE_REPO = skillsConfig?.repo;
const AGENT = skillsConfig?.agent ?? "claude-code";

if (!SOURCE_REPO) {
  console.error(`Error: set skillsConfig.repo in ${PKG_NAME}'s package.json`);
  process.exit(1);
}

const { spawnSync } = require("node:child_process");

function run(args) {
  console.log(`\n$ npx ${args.join(" ")}\n`);
  const r = spawnSync("npx", args, { stdio: "inherit", shell: process.platform === "win32" });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function sourceArg(tag) {
  // A tag pins to an immutable release; no tag => default branch (latest).
  return tag ? `https://github.com/${SOURCE_REPO}/tree/${tag}` : SOURCE_REPO;
}

function main() {
  const argv = process.argv.slice(2);
  const cmd = argv[0] || "sync";
  const tagIdx = argv.indexOf("--tag");
  const tag = tagIdx !== -1 ? argv[tagIdx + 1] : process.env.YOURORG_SKILLS_TAG;

  switch (cmd) {
    case "sync": {
      const src = sourceArg(tag);
      // Install (or add new) skills globally for Claude Code, then update existing ones.
      run(["skills", "add", src, "-g", "--all", "-a", AGENT, "-y"]);
      run(["skills", "update", "-g", "-y"]);
      console.log("\n✓ YourOrg skills are installed and up to date.");
      break;
    }
    case "list":
      run(["skills", "list", "-g", "-a", AGENT]);
      break;
    case "remove":
      run(["skills", "remove", "-g", "-a", AGENT, "-y"]);
      break;
    default:
      console.log(
        "Usage:\n" +
          "  npx @yourorg/skills sync [--tag <tag>]   install + update (default)\n" +
          "  npx @yourorg/skills list                 list installed skills\n" +
          "  npx @yourorg/skills remove               remove YourOrg skills"
      );
      process.exit(cmd === "help" || cmd === "--help" ? 0 : 1);
  }
}

main();
