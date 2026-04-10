import { describe, expect, it } from "vitest";

import { getRouter } from "../router";

describe("desktop router", () => {
  it("creates a single root route tree without duplicate ids", () => {
    const router = getRouter();

    expect(router.routeTree.id).toBe("__root__");
    expect(router.routesById.__root__).toBeDefined();
    expect(router.routesById["/"]).toBeDefined();
  });
});
