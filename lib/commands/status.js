const { runCapture } = require("../utils/runner");
const { loadManifest, skillNamesFor } = require("../manifest");
const { AGENT, PKG_NAME } = require("../config");

async function cmdStatus(ref) {
  const entries = await loadManifest({ remote: true, ref });

  if (!entries.length) {
    console.log("No enabled skills found in manifest.");
    return;
  }

  const expected = entries.flatMap(skillNamesFor);

  process.stdout.write("Checking installed skills...");
  const listOutput = runCapture(["skills", "list", "-g", "-a", AGENT]).toLowerCase();
  console.log("\n");

  let installed = 0;
  for (const name of expected) {
    const ok = listOutput.includes(name.toLowerCase());
    console.log(`  ${ok ? "✓" : "✗"} ${name}`);
    if (ok) installed++;
  }

  const missing = expected.length - installed;
  console.log(`\n${installed}/${expected.length} skills installed`);

  if (missing > 0) {
    console.log(`\nRun: npx ${PKG_NAME} install  to install missing skills`);
  }
}

module.exports = { cmdStatus };
