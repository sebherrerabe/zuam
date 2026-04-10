const outputDir = process.env.ZUAM_RELEASE_OUTPUT_DIR || ".release/artifacts";

module.exports = {
  appId: "com.zuam.desktop",
  productName: "Zuam",
  executableName: "Zuam",
  directories: {
    output: outputDir,
    buildResources: "assets"
  },
  files: ["dist/**/*", "dist-electron/**/*", "package.json"],
  artifactName: "${env.ZUAM_ARTIFACT_STEM}.${ext}",
  asar: true,
  npmRebuild: false,
  buildDependenciesFromSource: false,
  win: {
    target: [{ target: "nsis", arch: ["x64"] }],
    icon: "assets/icon.ico"
  },
  nsis: {
    oneClick: false,
    perMachine: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    installerIcon: "assets/icon.ico",
    uninstallerIcon: "assets/icon.ico",
    installerHeader: "assets/installer-header.bmp",
    installerSidebar: "assets/installer-sidebar.bmp",
    shortcutName: "Zuam"
  }
};
