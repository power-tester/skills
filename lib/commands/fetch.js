const fs = require("node:fs");
const path = require("node:path");
const { fetchUrl } = require("../utils/http");
const { rawFileUrl } = require("../utils/providers");
const { loadManifest } = require("../manifest");

async function cmdFetch() {
  const entries = await loadManifest({ remote: false });

  if (!entries.length) {
    console.log("No enabled skills found in manifest.");
    return;
  }

  const outDir = path.join(__dirname, "..", "..", "skills");
  const basePath = (p) => (p && p !== "." ? `${p}/` : "");

  for (const entry of entries) {
    const ref = entry.ref ?? "main";

    if (entry.select && entry.select.length > 0) {
      for (const skillName of entry.select) {
        const filePath = `${basePath(entry.path)}${skillName}/SKILL.md`;
        const url = rawFileUrl(entry.host, entry.repo, ref, filePath);

        process.stdout.write(`  ${skillName}  (${entry.repo}@${ref})  ... `);
        const content = await fetchUrl(url);

        const dest = path.join(outDir, skillName);
        fs.mkdirSync(dest, { recursive: true });
        fs.writeFileSync(path.join(dest, "SKILL.md"), content);
        console.log("✓");
      }
    } else {
      const filePath = `${basePath(entry.path)}SKILL.md`;
      const url = rawFileUrl(entry.host, entry.repo, ref, filePath);
      const label = entry.repo.split("/")[1];

      process.stdout.write(`  ${label}  (${entry.repo}@${ref})  ... `);
      const content = await fetchUrl(url);

      const dest = path.join(outDir, label);
      fs.mkdirSync(dest, { recursive: true });
      fs.writeFileSync(path.join(dest, "SKILL.md"), content);
      console.log("✓");
    }
  }

  console.log(`\n✓ Skill files written to skills/.`);
}

module.exports = { cmdFetch };
