import { render, screen } from "@testing-library/react";

import { BuildStatusCard } from "./build-status-card";
import { formatUpdateState, readDesktopBuildMetadata } from "../../lib/build-metadata";

describe("desktop build metadata", () => {
  it("FE-UNIT-INFRA-003: accepts injected build metadata at startup", () => {
    const metadata = readDesktopBuildMetadata({
      VITE_APP_VERSION: "1.2.3",
      VITE_GIT_SHA: "abc1234",
      VITE_BUILD_TIMESTAMP: "2026-04-07T16:00:00.000Z",
      VITE_PACKAGE_CHANNEL: "stable"
    });

    expect(metadata).toEqual({
      appVersion: "1.2.3",
      gitSha: "abc1234",
      buildTimestamp: "2026-04-07T16:00:00.000Z",
      packageChannel: "stable"
    });
  });

  it("FE-UNIT-INFRA-001: surfaces build metadata in the about/settings surface without hardcoded version strings", () => {
    render(
      <BuildStatusCard
        metadata={{
          appVersion: "1.2.3",
          gitSha: "abc1234",
          buildTimestamp: "2026-04-07T16:00:00.000Z",
          packageChannel: "stable"
        }}
        updateState={{ status: "up-to-date" }}
      />
    );

    expect(screen.getByText("1.2.3")).toBeInTheDocument();
    expect(screen.getByText("Commit: abc1234")).toBeInTheDocument();
    expect(screen.getByText("Up to date")).toBeInTheDocument();
  });

  it("FE-UNIT-INFRA-002: renders a clear update CTA when a newer release is available", () => {
    render(
      <BuildStatusCard
        metadata={{
          appVersion: "1.2.3",
          gitSha: "abc1234",
          buildTimestamp: "2026-04-07T16:00:00.000Z",
          packageChannel: "stable"
        }}
        updateState={{
          status: "update-available",
          latestVersion: "1.3.0",
          href: "https://example.com/releases/1.3.0"
        }}
      />
    );

    expect(screen.getByText("Update available: 1.3.0")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Update now" })).toHaveAttribute(
      "href",
      "https://example.com/releases/1.3.0"
    );
    expect(formatUpdateState({ status: "unknown" })).toBe("Update status unavailable");
  });
});
