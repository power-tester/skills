const fs = require("node:fs");
const path = require("node:path");
const { parse: parseYaml } = require("yaml");
const { fetchUrl } = require("./utils/http");
const { rawFileUrl } = require("./utils/providers");
const { SOURCE_REPO, SOURCE_HOST } = require("./config");

async function loadManifest({ remote = false, ref = "main" } = {}) {
  let content;
  if (remote) {
    const url = rawFileUrl(SOURCE_HOST, SOURCE_REPO, ref, "skills.yml");
    console.log(`Fetching manifest from ${SOURCE_HOST}/${SOURCE_REPO} (${ref})...`);
    content = await fetchUrl(url);
  } else {
    content = fs.readFileSync(path.join(__dirname, "..", "skills.yml"), "utf8");
  }
  const manifest = parseYaml(content);
  return (manifest.skills || []).filter((s) => s.enabled !== false);
}

// Returns the skill name(s) declared by a manifest entry.
function skillNamesFor(entry) {
  if (entry.select && entry.select.length > 0) return entry.select;
  return [entry.repo.split("/")[1]];
}

module.exports = { loadManifest, skillNamesFor };
