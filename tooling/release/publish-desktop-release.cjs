const { spawnSync } = require("node:child_process");

const { emitSummary, readDesktopReleaseFiles, writeDesktopReleaseFiles } = require("./desktop-release.cjs");

function runGh(args) {
  const result = spawnSync("gh", args, {
    env: process.env,
    encoding: "utf8",
    shell: process.platform === "win32"
  });

  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || result.stdout.trim() || `gh ${args.join(" ")} failed`);
  }

  return result.stdout.trim();
}

function main() {
  const { metadata, event } = readDesktopReleaseFiles();
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  const releaseTag = process.env.GITHUB_REF_NAME || `v${metadata.version}`;

  if (metadata.refType !== "tag") {
    emitSummary(summaryPath, metadata, event, "none");

    process.stdout.write(
      `${JSON.stringify(
        {
          published: false,
          reason: "publish skipped for non-tag release flow",
          event
        },
        null,
        2
      )}\n`
    );
    return;
  }

  if (!process.env.GH_TOKEN && !process.env.GITHUB_TOKEN) {
    throw new Error("Desktop release publish requires GH_TOKEN or GITHUB_TOKEN");
  }

  try {
    runGh(["release", "view", releaseTag]);
  } catch {
    runGh([
      "release",
      "create",
      releaseTag,
      "--title",
      `Zuam desktop v${metadata.version}`,
      "--notes",
      `Desktop release for ${metadata.gitSha.slice(0, 7)} from workflow run ${metadata.workflowRunId}.`
    ]);
  }

  const artifactPaths = [...metadata.artifacts.map((artifact) => artifact.filePath)];
  artifactPaths.push(
    "packages/desktop/dist/release-metadata.json",
    "packages/desktop/dist/release-event.json"
  );

  runGh(["release", "upload", releaseTag, ...artifactPaths, "--clobber"]);

  const releaseView = runGh(["release", "view", releaseTag, "--json", "url"]).trim();
  const publishedRelease = JSON.parse(releaseView);
  const persisted = writeDesktopReleaseFiles(metadata, metadata.artifacts, "desktop.release.published", {
    tag: releaseTag,
    url: publishedRelease.url
  });

  emitSummary(summaryPath, persisted.metadata, readDesktopReleaseFiles().event, "none");

  process.stdout.write(
    `${JSON.stringify(
      {
        published: true,
        releaseTag,
        releaseUrl: publishedRelease.url,
        uploadedArtifacts: artifactPaths.length
      },
      null,
      2
    )}\n`
  );
}

if (require.main === module) {
  main();
}

module.exports = { main };
