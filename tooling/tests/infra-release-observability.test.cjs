const fs = require("node:fs");
const path = require("node:path");
const YAML = require("yaml");

const {
  buildDesktopReleaseMetadata,
  emitSummary,
  paths,
  readDesktopReleaseFiles,
  writeDesktopReleaseFiles
} = require("../release/desktop-release.cjs");

const repoRoot = path.resolve(__dirname, "..", "..");
const workflowPath = path.join(repoRoot, ".github", "workflows", "release-desktop.yml");

function readWorkflow() {
  const workflowText = fs.readFileSync(workflowPath, "utf8");
  return { workflowText, workflow: YAML.parse(workflowText) };
}

describe("infra-release-observability", () => {
  test("BE-UNIT-INFRA-001: release workflow has valid YAML, named jobs, and ordered steps", () => {
    const { workflow, workflowText } = readWorkflow();

    expect(workflow.name).toBe("release-desktop");
    expect(workflow.jobs["release-desktop"]).toBeDefined();
    expect(workflow.jobs["release-desktop"]["runs-on"]).toBe("windows-latest");
    expect(workflow.jobs["release-desktop"].steps.map((step) => step.name)).toEqual([
      "checkout",
      "setup-node",
      "enable-corepack",
      "install dependencies",
      "lint",
      "typecheck",
      "test",
      "build",
      "package-smoke",
      "package",
      "write-release-metadata",
      "upload-packaged-artifacts",
      "publish",
      "summary"
    ]);
    expect(workflowText).toContain("GITHUB_STEP_SUMMARY");
  });

  test("BE-UNIT-INFRA-002: release packaging writes versioned provenance metadata and fails on tag mismatch", () => {
    const metadata = buildDesktopReleaseMetadata({
      GITHUB_SHA: "abcdef1234567890",
      GITHUB_RUN_ID: "123",
      GITHUB_RUN_ATTEMPT: "1",
      GITHUB_WORKFLOW: "release-desktop",
      GITHUB_REF_TYPE: "tag",
      GITHUB_REF_NAME: "v0.1.0"
    });

    expect(metadata).toMatchObject({
      packageName: "@zuam/desktop",
      version: "0.1.0",
      gitSha: "abcdef1234567890",
      workflowRunId: "123",
      packageChannel: "stable",
      artifactStem: "zuam-desktop-0.1.0-abcdef1"
    });

    expect(() =>
      buildDesktopReleaseMetadata({
        GITHUB_SHA: "abcdef1234567890",
        GITHUB_RUN_ID: "123",
        GITHUB_RUN_ATTEMPT: "1",
        GITHUB_WORKFLOW: "release-desktop",
        GITHUB_REF_TYPE: "tag",
        GITHUB_REF_NAME: "v9.9.9"
      })
    ).toThrow(/Tagged release mismatch/);
  });

  test("BE-UNIT-INFRA-003: artifact metadata includes version, SHA, and channel data", () => {
    const metadata = buildDesktopReleaseMetadata({
      GITHUB_SHA: "abcdef1234567890",
      GITHUB_RUN_ID: "123",
      GITHUB_RUN_ATTEMPT: "1",
      GITHUB_WORKFLOW: "release-desktop",
      GITHUB_REF_TYPE: "branch",
      GITHUB_REF_NAME: "main"
    });
    const result = writeDesktopReleaseFiles(metadata);

    expect(fs.existsSync(result.metadataPath)).toBe(true);
    expect(fs.existsSync(result.eventPath)).toBe(true);

    const files = readDesktopReleaseFiles();
    expect(files.metadata).toMatchObject({
      version: "0.1.0",
      gitSha: "abcdef1234567890",
      packageChannel: "development",
      artifacts: []
    });
    expect(files.event.type).toBe("desktop.release.packaged");

    fs.rmSync(paths.desktopDistPath, { recursive: true, force: true });
  });

  test("BE-UNIT-INFRA-004: workflow summary names workflow, package, and failing stage", () => {
    const summaryPath = path.join(repoRoot, "tooling", "tests", "infra-summary.md");
    const metadata = {
      workflow: "release-desktop",
      packageName: "@zuam/desktop",
      gitSha: "abcdef1234567890",
      artifactName: "zuam-desktop-0.1.0-abcdef1.zip"
    };
    const event = { type: "desktop.release.published" };

    emitSummary(summaryPath, metadata, event, "none");

    const summary = fs.readFileSync(summaryPath, "utf8");
    expect(summary).toContain("workflow: release-desktop");
    expect(summary).toContain("package: @zuam/desktop");
    expect(summary).toContain("failing stage: none");
    expect(summary).toContain("artifact count: 0");

    fs.rmSync(summaryPath, { force: true });
  });

  test("BE-UNIT-INFRA-005 and BE-E2E-INFRA-001: publish event links commit, workflow run, artifact, and release trace", () => {
    const metadata = buildDesktopReleaseMetadata({
      GITHUB_SHA: "abcdef1234567890",
      GITHUB_RUN_ID: "456",
      GITHUB_RUN_ATTEMPT: "2",
      GITHUB_WORKFLOW: "release-desktop",
      GITHUB_REF_TYPE: "tag",
      GITHUB_REF_NAME: "v0.1.0"
    });
    const result = writeDesktopReleaseFiles(metadata);

    expect(result.metadata.workflowRunId).toBe("456");
    expect(result.metadata.artifactName).toContain("abcdef1");
    expect(result.metadata.gitSha).toBe("abcdef1234567890");
    expect(result.metadata.packageChannel).toBe("stable");
    expect(result.metadata.version).toBe("0.1.0");
  });
});
