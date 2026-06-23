const { spawnSync } = require("node:child_process");

function run(args, { allowFailure = false } = {}) {
  console.log(`\n$ npx ${args.join(" ")}\n`);
  const r = spawnSync("npx", ["--package", "skills", ...args], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (r.status !== 0 && !allowFailure) process.exit(r.status ?? 1);
  return r.status ?? 0;
}

function runCapture(args) {
  const r = spawnSync("npx", ["--package", "skills", ...args], {
    stdio: "pipe",
    shell: process.platform === "win32",
    encoding: "utf8",
  });
  return r.stdout ?? "";
}

function git(args, cwd) {
  return spawnSync(
    "git",
    ["-c", "user.name=skills-pm", "-c", "user.email=noreply@skills-pm", ...args],
    { cwd, stdio: "pipe" }
  );
}

module.exports = { run, runCapture, git };
