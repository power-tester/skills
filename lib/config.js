const pkg = require("../package.json");

const PKG_NAME = pkg.name;
const SOURCE_REPO = pkg.skillsConfig?.repo;
const SOURCE_HOST = pkg.skillsConfig?.host ?? "github.com";
const AGENT = pkg.skillsConfig?.agent ?? "claude-code";

if (!SOURCE_REPO) {
  console.error(`Error: set skillsConfig.repo in ${PKG_NAME}'s package.json`);
  process.exit(1);
}

module.exports = { PKG_NAME, SOURCE_REPO, SOURCE_HOST, AGENT };
