import { z } from "zod";

const desktopBuildMetadataSchema = z.object({
  VITE_APP_VERSION: z.string().min(1),
  VITE_GIT_SHA: z.string().min(1),
  VITE_BUILD_TIMESTAMP: z.string().min(1),
  VITE_PACKAGE_CHANNEL: z.string().min(1)
});

export type DesktopBuildMetadata = {
  appVersion: string;
  gitSha: string;
  buildTimestamp: string;
  packageChannel: string;
};

export type DesktopUpdateState =
  | { status: "up-to-date" }
  | { status: "update-available"; latestVersion: string; href: string }
  | { status: "unknown" };

export function readDesktopBuildMetadata(
  source: Record<string, string | undefined>
): DesktopBuildMetadata {
  const parsed = desktopBuildMetadataSchema.safeParse(source);

  if (parsed.success) {
    return {
      appVersion: parsed.data.VITE_APP_VERSION,
      gitSha: parsed.data.VITE_GIT_SHA,
      buildTimestamp: parsed.data.VITE_BUILD_TIMESTAMP,
      packageChannel: parsed.data.VITE_PACKAGE_CHANNEL
    };
  }

  return {
    appVersion: source.VITE_APP_VERSION ?? "development",
    gitSha: source.VITE_GIT_SHA ?? "unknown",
    buildTimestamp: source.VITE_BUILD_TIMESTAMP ?? "unknown",
    packageChannel: source.VITE_PACKAGE_CHANNEL ?? "development"
  };
}

export function formatUpdateState(updateState: DesktopUpdateState): string {
  switch (updateState.status) {
    case "up-to-date":
      return "Up to date";
    case "update-available":
      return `Update available: ${updateState.latestVersion}`;
    default:
      return "Update status unavailable";
  }
}
