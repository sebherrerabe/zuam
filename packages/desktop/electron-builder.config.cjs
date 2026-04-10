const outputDir = process.env.ZUAM_RELEASE_OUTPUT_DIR || ".release/artifacts";

module.exports = {
  appId: "com.zuam.desktop",
  productName: "Zuam",
  directories: {
    output: outputDir
  },
  files: ["dist/**/*", "dist-electron/**/*", "package.json"],
  artifactName: "${env.ZUAM_ARTIFACT_STEM}.${ext}",
  asar: true,
  npmRebuild: false,
  buildDependenciesFromSource: false,
  win: {
    target: [{ target: "nsis", arch: ["x64"] }]
  },
  nsis: {
    oneClick: false,
    perMachine: false,
    allowToChangeInstallationDirectory: true
  }
};
