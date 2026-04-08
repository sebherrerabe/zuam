import type { FocusSessionSnapshot } from "../../lib/api/desktop-api.types";

type FocusSessionPanelProps = {
  snapshot: FocusSessionSnapshot | undefined;
  remainingSeconds: number;
  onPause: () => void;
  onResume: () => void;
  onTakeBreak: () => void;
  onEnd: () => void;
};

export function FocusSessionPanel({
  snapshot,
  remainingSeconds,
  onPause,
  onResume,
  onTakeBreak,
  onEnd
}: FocusSessionPanelProps) {
  if (!snapshot?.currentSession || snapshot.runtimeState === "idle") {
    return null;
  }

  const session = snapshot.currentSession;

  return (
    <aside className="focus-session-dock" aria-label="focus session">
      <p className="focus-session-eyebrow">Focus Session</p>
      <h2>{formatDuration(remainingSeconds)}</h2>
      <p>{session.state === "break" ? "Break in progress" : `Task ${session.taskId}`}</p>
      <div className="focus-session-actions">
        {snapshot.runtimeState === "running" ? (
          <button type="button" className="desktop-sync-button" onClick={onPause}>
            Pause
          </button>
        ) : null}
        {snapshot.runtimeState === "paused" ? (
          <button type="button" className="desktop-sync-button" onClick={onResume}>
            Resume
          </button>
        ) : null}
        {(snapshot.runtimeState === "running" || snapshot.runtimeState === "paused") ? (
          <button type="button" className="desktop-sync-button is-ghost" onClick={onTakeBreak}>
            Break
          </button>
        ) : null}
        {snapshot.runtimeState === "break" ? (
          <button type="button" className="desktop-sync-button" onClick={onResume}>
            End break
          </button>
        ) : null}
        <button type="button" className="desktop-sync-button is-ghost" onClick={onEnd}>
          End
        </button>
      </div>
    </aside>
  );
}

export function FocusBreakOverlay({
  visible,
  remainingSeconds,
  onResume
}: {
  visible: boolean;
  remainingSeconds: number;
  onResume: () => void;
}) {
  if (!visible) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal-card focus-break-overlay" role="dialog" aria-modal="true" aria-label="Break in progress">
        <p className="eyebrow">Break</p>
        <h2>{formatDuration(remainingSeconds)}</h2>
        <p>Break mode suppresses non-blocking nudges until you resume the session.</p>
        <button type="button" className="approve-button" onClick={onResume}>
          Resume focus
        </button>
      </div>
    </div>
  );
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
