const { emitSummary, readDesktopReleaseFiles } = require("./desktop-release.cjs");

function main() {
  const { metadata, event } = readDesktopReleaseFiles();
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;

  emitSummary(summaryPath, metadata, event, "none");

  process.stdout.write(
    `${JSON.stringify(
      {
        published: false,
        reason: "release publish is stubbed until GitHub release automation is enabled",
        event
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
