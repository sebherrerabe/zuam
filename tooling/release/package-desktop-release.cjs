const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const {
  buildDesktopReleaseMetadata,
  paths,
  readDesktopPackageVersion,
  writeDesktopReleaseFiles
} = require("./desktop-release.cjs");

function assertFileExists(filePath, label) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Desktop package failed: missing ${label} at ${filePath}`);
  }
}

function ensureBuildOutputs(repoRoot) {
  assertFileExists(path.join(repoRoot, "packages", "desktop", "dist", "client", "index.html"), "desktop client index");
  assertFileExists(
    path.join(repoRoot, "packages", "desktop", "dist-electron", "electron", "main.js"),
    "Electron main bundle"
  );
  assertFileExists(
    path.join(repoRoot, "packages", "desktop", "dist-electron", "electron", "preload.js"),
    "Electron preload bundle"
  );
}

function ensurePackagedOutputs() {
  assertFileExists(path.join(paths.desktopReleaseArtifactsPath, "win-unpacked"), "packaged Windows app");
}

function createPortableZip(metadata) {
  const unpackedDir = path.join(paths.desktopReleaseArtifactsPath, "win-unpacked");
  if (!fs.existsSync(unpackedDir)) {
    throw new Error(`Desktop package failed: missing unpacked Windows app at ${unpackedDir}`);
  }

  const portableZipPath = path.join(paths.desktopReleaseArtifactsPath, `${metadata.artifactStem}-x64-portable.zip`);
  fs.rmSync(portableZipPath, { force: true });
  const archive = require("node:child_process").spawnSync(
    "tar",
    ["-a", "-cf", portableZipPath, "-C", unpackedDir, "."],
    {
      cwd: paths.desktopPackageDir,
      env: process.env,
      stdio: "inherit",
      shell: process.platform === "win32"
    }
  );

  if (archive.status !== 0) {
    throw new Error(`Desktop package failed: portable zip creation exited with status ${archive.status ?? "unknown"}`);
  }
}

function collectArtifacts() {
  const artifactEntries = fs
    .readdirSync(paths.desktopReleaseArtifactsPath, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .filter((entry) => /\.(exe|zip|yml|blockmap)$/i.test(entry.name))
    .filter((entry) => entry.name !== "builder-debug.yml")
    .map((entry) => {
      const filePath = path.join(paths.desktopReleaseArtifactsPath, entry.name);
      const fileBuffer = fs.readFileSync(filePath);
      return {
        fileName: entry.name,
        filePath,
        size: fs.statSync(filePath).size,
        sha256: crypto.createHash("sha256").update(fileBuffer).digest("hex")
      };
    })
    .sort((left, right) => left.fileName.localeCompare(right.fileName));

  if (artifactEntries.length === 0) {
    throw new Error("Desktop package failed: electron-builder produced no artifacts");
  }

  return artifactEntries;
}

function choosePrimaryArtifact(artifacts) {
  return (
    artifacts.find((artifact) => artifact.fileName.endsWith("-x64-nsis.exe")) ??
    artifacts.find((artifact) => artifact.fileName.endsWith(".exe")) ??
    artifacts[0]
  );
}

function main() {
  const repoRoot = path.resolve(__dirname, "..", "..");
  const packageVersion = readDesktopPackageVersion();

  if (!fs.existsSync(path.join(paths.desktopReleaseArtifactsPath, "win-unpacked"))) {
    ensureBuildOutputs(repoRoot);
  }

  const metadata = buildDesktopReleaseMetadata(process.env, packageVersion);
  writeDesktopReleaseFiles(metadata);

  ensurePackagedOutputs();
  createPortableZip(metadata);

  const artifacts = collectArtifacts();
  const primaryArtifact = choosePrimaryArtifact(artifacts);
  const result = writeDesktopReleaseFiles(
    {
      ...metadata,
      artifactName: primaryArtifact.fileName
    },
    artifacts
  );

  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

if (require.main === module) {
  main();
}

module.exports = { main };
