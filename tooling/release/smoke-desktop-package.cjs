const fs = require("node:fs");
const path = require("node:path");

const {
  buildDesktopReleaseMetadata,
  paths,
  readDesktopPackageVersion,
  readDesktopReleaseFiles,
  writeDesktopReleaseFiles
} = require("./desktop-release.cjs");

function assertFileExists(filePath, label) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Desktop packaging smoke check failed: missing ${label} at ${filePath}`);
  }
}

function main(env = process.env) {
  const packageVersion = readDesktopPackageVersion();
  const repoRoot = path.resolve(__dirname, "..", "..");
  const clientIndexPath = path.join(repoRoot, "packages", "desktop", "dist", "client", "index.html");
  const electronMainPath = path.join(repoRoot, "packages", "desktop", "dist-electron", "electron", "main.js");
  const electronPreloadPath = path.join(repoRoot, "packages", "desktop", "dist-electron", "electron", "preload.js");

  assertFileExists(clientIndexPath, "desktop client index");
  assertFileExists(electronMainPath, "Electron main bundle");
  assertFileExists(electronPreloadPath, "Electron preload bundle");

  const metadata = buildDesktopReleaseMetadata(
    {
      GITHUB_SHA: env.GITHUB_SHA || "local-dev-sha-1234567",
      GITHUB_REF_NAME: env.GITHUB_REF_NAME || "development",
      GITHUB_REF_TYPE: env.GITHUB_REF_TYPE || "branch",
      GITHUB_RUN_ID: env.GITHUB_RUN_ID || "local-run",
      GITHUB_RUN_ATTEMPT: env.GITHUB_RUN_ATTEMPT || "1",
      GITHUB_WORKFLOW: env.GITHUB_WORKFLOW || "desktop-package-smoke"
    },
    packageVersion
  );

  writeDesktopReleaseFiles(metadata);
  const persisted = readDesktopReleaseFiles();

  if (persisted.metadata.packageName !== "@zuam/desktop") {
    throw new Error(`Desktop packaging smoke check failed: unexpected package ${persisted.metadata.packageName}`);
  }

  if (persisted.metadata.version !== packageVersion) {
    throw new Error(
      `Desktop packaging smoke check failed: expected version ${packageVersion}, got ${persisted.metadata.version}`
    );
  }

  if (persisted.event.type !== "desktop.release.published") {
    throw new Error(`Desktop packaging smoke check failed: unexpected release event ${persisted.event.type}`);
  }

  const summary = {
    clientIndexPath,
    electronMainPath,
    electronPreloadPath,
    metadataPath: paths.metadataPath,
    eventPath: paths.eventPath,
    artifactName: persisted.metadata.artifactName,
    packageChannel: persisted.metadata.packageChannel
  };

  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
  return summary;
}

if (require.main === module) {
  main();
}

module.exports = { main };
