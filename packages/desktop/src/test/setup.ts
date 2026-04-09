import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

vi.mock("@pixi/react", () => ({
  Application: ({ children }: { children?: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "pixi-application" }, children),
  extend: vi.fn()
}));

vi.mock("pixi.js", () => ({
  Container: class {},
  Graphics: class {}
}));
