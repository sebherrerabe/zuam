const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..");
const clientDistPath = path.join(repoRoot, "packages", "desktop", "dist", "client");
const clientAssetsPath = path.join(clientDistPath, "assets");
const indexPath = path.join(clientDistPath, "index.html");

function main() {
  if (!fs.existsSync(clientAssetsPath)) {
    throw new Error(`Cannot generate desktop client index: missing assets directory at ${clientAssetsPath}`);
  }

  const assetEntries = fs.readdirSync(clientAssetsPath);
  const mainScript = assetEntries.find((entry) => /^main-.*\.js$/.test(entry));
  if (!mainScript) {
    throw new Error("Cannot generate desktop client index: missing main client entry chunk");
  }

  const cssEntries = assetEntries
    .filter((entry) => entry.endsWith(".css"))
    .sort((left, right) => left.localeCompare(right))
    .map((entry) => `    <link rel="stylesheet" href="./assets/${entry}" />`)
    .join("\n");

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Zuam Desktop</title>
${cssEntries}
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="./assets/${mainScript}"></script>
  </body>
</html>
`;

  fs.writeFileSync(indexPath, html);
  process.stdout.write(`${JSON.stringify({ indexPath, mainScript }, null, 2)}\n`);
  return { indexPath, mainScript };
}

if (require.main === module) {
  main();
}

module.exports = { main };
