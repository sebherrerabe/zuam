const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const repoRoot = path.resolve(__dirname, "..", "..");
const read = (filePath) => fs.readFileSync(path.join(repoRoot, filePath), "utf8");

describe("monorepo-platform workspace contract", () => {
  test("BE-UNIT-MONO-001: workspace manifest includes first-party packages and project planning tree", () => {
    const workspace = read("pnpm-workspace.yaml");

    expect(workspace).toContain('  - "packages/*"');
    expect(workspace).toContain('  - "project"');
  });

  test("BE-UNIT-MONO-002: root package exposes canonical scripts", () => {
    const rootPackage = JSON.parse(read("package.json"));

    for (const script of ["dev", "lint", "test", "typecheck", "build"]) {
      expect(rootPackage.scripts[script]).toBeDefined();
    }
  });

  test("BE-UNIT-MONO-003: each first-party package exposes root-targetable lifecycle scripts", () => {
    const manifests = [
      "packages/backend/package.json",
      "packages/shared/package.json",
      "packages/desktop/package.json",
      "packages/mobile/package.json"
    ].map((filePath) => JSON.parse(read(filePath)));

    for (const manifest of manifests) {
      expect(manifest.scripts.build).toBeDefined();
      expect(manifest.scripts.test).toBeDefined();
      expect(manifest.scripts.typecheck).toBeDefined();
      expect(manifest.scripts.lint).toBeDefined();
    }
  });

  test("BE-E2E-MONO-001: pnpm can enumerate all workspace packages", () => {
    const output = execSync("pnpm -r list --depth -1 --json", {
      cwd: repoRoot,
      encoding: "utf8"
    });
    const workspaces = JSON.parse(output);
    const workspaceNames = new Set(workspaces.map((workspace) => workspace.name));

    expect(Array.from(workspaceNames)).toEqual(
      expect.arrayContaining([
        "@zuam/backend",
        "@zuam/shared",
        "@zuam/desktop",
        "@zuam/mobile"
      ])
    );
  });

  test("BE-E2E-MONO-002: package filters can target backend, desktop, and mobile independently", () => {
    const targets = {
      "@zuam/backend": path.join("packages", "backend"),
      "@zuam/desktop": path.join("packages", "desktop"),
      "@zuam/mobile": path.join("packages", "mobile")
    };

    for (const [name, expectedPath] of Object.entries(targets)) {
      const result = execSync(`pnpm --filter ${name} exec node -p "process.cwd()"`, {
        cwd: repoRoot,
        encoding: "utf8"
      }).trim();

      expect(result).toContain(expectedPath);
    }
  });

  test("FE-UNIT-MONO-003: deep shared-package imports fail through package exports with an actionable error", () => {
    expect(() => require.resolve("@zuam/shared/src/theme/tokens")).toThrow(
      /Package subpath|Cannot find module/
    );
  });
});
