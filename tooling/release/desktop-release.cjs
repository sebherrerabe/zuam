const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..");
const desktopPackagePath = path.join(repoRoot, "packages", "desktop", "package.json");
const desktopDistPath = path.join(repoRoot, "packages", "desktop", "dist");
const metadataPath = path.join(desktopDistPath, "release-metadata.json");
const eventPath = path.join(desktopDistPath, "release-event.json");

function readDesktopPackageVersion() {
  const packageJson = JSON.parse(fs.readFileSync(desktopPackagePath, "utf8"));
  return packageJson.version;
}

function requireField(value, fieldName) {
  if (!value) {
    throw new Error(`@zuam/desktop release metadata is missing required field: ${fieldName}`);
  }

  return value;
}

function buildDesktopReleaseMetadata(env, packageVersion) {
  const version = packageVersion ?? readDesktopPackageVersion();
  const gitSha = requireField(env.GITHUB_SHA, "gitSha");
  const runId = requireField(env.GITHUB_RUN_ID, "workflowRunId");
  const runAttempt = requireField(env.GITHUB_RUN_ATTEMPT, "workflowRunAttempt");
  const workflow = requireField(env.GITHUB_WORKFLOW, "workflow");
  const refType = env.GITHUB_REF_TYPE || "branch";
  const refName = env.GITHUB_REF_NAME || "development";
  const buildTimestamp = new Date().toISOString();
  const packageChannel = refType === "tag" ? "stable" : "development";
  const artifactName = `zuam-desktop-${version}-${gitSha.slice(0, 7)}.zip`;

  if (refType === "tag" && refName !== `v${version}`) {
    throw new Error(
      `Tagged release mismatch: expected tag v${version} for package version ${version}, got ${refName}`
    );
  }

  return {
    workflow,
    packageName: "@zuam/desktop",
    version,
    gitSha,
    workflowRunId: runId,
    workflowRunAttempt: runAttempt,
    refType,
    refName,
    buildTimestamp,
    packageChannel,
    artifactName
  };
}

function writeDesktopReleaseFiles(metadata) {
  fs.mkdirSync(desktopDistPath, { recursive: true });

  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  fs.writeFileSync(
    eventPath,
    JSON.stringify(
      {
        type: "desktop.release.published",
        workflow: metadata.workflow,
        packageName: metadata.packageName,
        version: metadata.version,
        gitSha: metadata.gitSha,
        workflowRunId: metadata.workflowRunId,
        artifactName: metadata.artifactName,
        packageChannel: metadata.packageChannel,
        buildTimestamp: metadata.buildTimestamp
      },
      null,
      2
    )
  );

  return { metadataPath, eventPath, metadata };
}

function readDesktopReleaseFiles() {
  return {
    metadata: JSON.parse(fs.readFileSync(metadataPath, "utf8")),
    event: JSON.parse(fs.readFileSync(eventPath, "utf8"))
  };
}

function emitSummary(summaryPath, metadata, event, failingStage) {
  if (!summaryPath) {
    return;
  }

  const lines = [
    `workflow: ${metadata.workflow}`,
    `package: ${metadata.packageName}`,
    `failing stage: ${failingStage}`,
    `commit: ${metadata.gitSha}`,
    `artifact: ${metadata.artifactName}`,
    `release event: ${event.type}`
  ];

  fs.appendFileSync(summaryPath, `${lines.join("\n")}\n`);
}

module.exports = {
  buildDesktopReleaseMetadata,
  emitSummary,
  readDesktopPackageVersion,
  readDesktopReleaseFiles,
  writeDesktopReleaseFiles,
  paths: {
    desktopDistPath,
    metadataPath,
    eventPath
  }
};
