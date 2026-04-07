import type { DesktopBuildMetadata, DesktopUpdateState } from "../../lib/build-metadata";

import { formatUpdateState } from "../../lib/build-metadata";

type BuildStatusCardProps = {
  metadata: DesktopBuildMetadata;
  updateState: DesktopUpdateState;
};

export function BuildStatusCard({ metadata, updateState }: BuildStatusCardProps) {
  return (
    <section className="build-status-card">
      <p className="eyebrow">Build</p>
      <h3>{metadata.appVersion}</h3>
      <p>Channel: {metadata.packageChannel}</p>
      <p>Commit: {metadata.gitSha}</p>
      <p>Built: {metadata.buildTimestamp}</p>
      <p>{formatUpdateState(updateState)}</p>
      {updateState.status === "update-available" ? (
        <a className="cta" href={updateState.href}>
          Update now
        </a>
      ) : null}
    </section>
  );
}
