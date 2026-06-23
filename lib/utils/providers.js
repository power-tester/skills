/**
 * Builds the raw file URL for a given git host.
 * Supports GitHub, GitLab (cloud + self-hosted), and Bitbucket.
 * Unknown hosts fall back to GitLab-style, which also works for Gitea/Forgejo.
 */
function rawFileUrl(host, repo, ref, filePath) {
  const h = host || "github.com";

  if (h === "github.com") {
    return `https://raw.githubusercontent.com/${repo}/${ref}/${filePath}`;
  }
  if (h === "bitbucket.org") {
    return `https://bitbucket.org/${repo}/raw/${ref}/${filePath}`;
  }
  // gitlab.com and self-hosted GitLab / Gitea / Forgejo instances
  return `https://${h}/${repo}/-/raw/${ref}/${filePath}`;
}

module.exports = { rawFileUrl };
