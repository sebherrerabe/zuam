const { buildDesktopReleaseMetadata, writeDesktopReleaseFiles } = require("./desktop-release.cjs");

function main() {
  const metadata = buildDesktopReleaseMetadata(process.env);
  const result = writeDesktopReleaseFiles(metadata);

  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

if (require.main === module) {
  main();
}

module.exports = { main };
