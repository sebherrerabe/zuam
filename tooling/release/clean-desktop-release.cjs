const fs = require("node:fs");

const { paths } = require("./desktop-release.cjs");

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function main() {
  let lastError = null;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      fs.rmSync(paths.desktopReleasePath, { recursive: true, force: true });
      return;
    } catch (error) {
      lastError = error;
      if (error && (error.code === "EBUSY" || error.code === "EPERM")) {
        sleep(500);
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}

if (require.main === module) {
  main();
}

module.exports = { main };
