import { loadBackendEnv } from "../src/config/env";

describe("backend platform guards", () => {
  it("BE-UNIT-MONO-005: fails clearly when a required env var is absent", () => {
    expect(() => loadBackendEnv({ PORT: "4000" })).toThrow(
      "@zuam/backend env bootstrap failed. Missing or invalid variables: DATABASE_URL"
    );
  });

  it("BE-UNIT-MONO-004: backend cannot deep-import shared internals outside public exports", () => {
    expect(() => require.resolve("@zuam/shared/src/tasks/types")).toThrow(
      /Package subpath|Cannot find module/
    );
  });
});
