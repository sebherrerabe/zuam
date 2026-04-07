import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

type SyncConnectionState = "unknown" | "connected" | "disconnected";
type SyncStatusState = "loading" | "idle" | "syncing" | "ready" | "failed";

export type SyncTaskRow = {
  id: string;
  title: string;
  listName: string;
  pending?: boolean;
};

export type SyncStatusSnapshot = {
  connection: SyncConnectionState;
  status: SyncStatusState;
  lastSyncAt: string | null;
  lastError: string | null;
  listCount: number;
  taskCount: number;
  pendingTaskCount: number;
  eventRevision: number;
  taskRows: SyncTaskRow[];
};

type SyncStatusCardProps = {
  snapshot: SyncStatusSnapshot;
  onRefresh: () => void | Promise<void>;
  onRetry?: () => void | Promise<void>;
  onDismissError?: () => void;
};

type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger";

const cardStyle = {
  display: "grid",
  gap: "14px",
  borderRadius: "18px",
  border: "1px solid var(--border)",
  background: "var(--surface-elevated)",
  boxShadow: "var(--shadow-soft)",
  padding: "18px 20px"
} satisfies CSSProperties;

const headerStyle = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "16px"
} satisfies CSSProperties;

const eyebrowStyle = {
  margin: "0 0 6px",
  color: "var(--accent)",
  fontSize: "12px",
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase"
} satisfies CSSProperties;

const titleStyle = {
  margin: 0,
  color: "var(--text-soft)",
  fontSize: "18px",
  fontWeight: 700,
  lineHeight: 1.2
} satisfies CSSProperties;

const subcopyStyle = {
  margin: 0,
  color: "var(--text-muted)",
  fontSize: "12px"
} satisfies CSSProperties;

const statRowStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "10px"
} satisfies CSSProperties;

const statCardStyle = {
  display: "grid",
  gap: "3px",
  borderRadius: "12px",
  border: "1px solid rgba(208, 139, 91, 0.16)",
  background: "rgba(247, 245, 241, 0.7)",
  padding: "10px 12px"
} satisfies CSSProperties;

const statLabelStyle = {
  color: "var(--text-muted)",
  fontSize: "11px",
  letterSpacing: "0.04em",
  textTransform: "uppercase"
} satisfies CSSProperties;

const statValueStyle = {
  color: "var(--text-soft)",
  fontSize: "14px",
  fontWeight: 700
} satisfies CSSProperties;

const detailGridStyle = {
  display: "grid",
  gap: "8px"
} satisfies React.CSSProperties;

const detailRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  color: "var(--text-soft)",
  fontSize: "12px"
} satisfies React.CSSProperties;

const buttonRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
  alignItems: "center"
} satisfies React.CSSProperties;

const primaryButtonStyle = {
  border: 0,
  borderRadius: "10px",
  padding: "11px 16px",
  color: "#fffcf7",
  background: "linear-gradient(90deg, #00d4ab, #5c6bf0)",
  boxShadow: "0 4px 16px rgba(0, 212, 171, 0.22)",
  fontWeight: 700,
  cursor: "pointer"
} satisfies React.CSSProperties;

const secondaryButtonStyle = {
  border: 0,
  borderRadius: "10px",
  padding: "11px 16px",
  color: "var(--text-soft)",
  background: "transparent",
  cursor: "pointer",
  fontWeight: 600
} satisfies React.CSSProperties;

const taskListStyle = {
  display: "grid",
  gap: "8px",
  margin: 0,
  padding: 0,
  listStyle: "none"
} satisfies React.CSSProperties;

const taskRowStyle = {
  display: "grid",
  gap: "6px",
  borderRadius: "12px",
  border: "1px solid rgba(224, 219, 214, 0.8)",
  background: "#fffefb",
  padding: "10px 12px"
} satisfies React.CSSProperties;

const taskRowHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px"
} satisfies React.CSSProperties;

const taskRowTitleStyle = {
  margin: 0,
  color: "var(--text-soft)",
  fontSize: "13px",
  fontWeight: 600
} satisfies React.CSSProperties;

const taskRowMetaStyle = {
  margin: 0,
  color: "var(--text-muted)",
  fontSize: "11px"
} satisfies React.CSSProperties;

const bannerStyleByTone: Record<BadgeTone, CSSProperties> = {
  neutral: {
    background: "rgba(247, 245, 241, 0.9)",
    color: "var(--text-soft)",
    borderColor: "rgba(224, 219, 214, 0.9)"
  },
  accent: {
    background: "rgba(208, 139, 91, 0.12)",
    color: "var(--accent)",
    borderColor: "rgba(208, 139, 91, 0.2)"
  },
  success: {
    background: "rgba(0, 184, 152, 0.12)",
    color: "#00875f",
    borderColor: "rgba(0, 184, 152, 0.18)"
  },
  warning: {
    background: "rgba(91, 106, 240, 0.1)",
    color: "#5b6af0",
    borderColor: "rgba(91, 106, 240, 0.18)"
  },
  danger: {
    background: "rgba(191, 56, 43, 0.1)",
    color: "var(--danger)",
    borderColor: "rgba(191, 56, 43, 0.18)"
  }
};

const statusToneByState: Record<SyncStatusState, BadgeTone> = {
  loading: "accent",
  idle: "neutral",
  syncing: "warning",
  ready: "success",
  failed: "danger"
};

export function SyncStatusCard({ snapshot, onRefresh, onRetry, onDismissError }: SyncStatusCardProps) {
  const [refreshLocked, setRefreshLocked] = useState(false);
  const [dismissedErrorRevision, setDismissedErrorRevision] = useState<number | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const showEmptyState = snapshot.status === "idle" && snapshot.lastSyncAt === null;
  const showLoadingState = snapshot.status === "loading";
  const showError = snapshot.status === "failed" && dismissedErrorRevision !== snapshot.eventRevision;
  const primaryDisabled = refreshLocked || snapshot.status === "syncing" || snapshot.status === "loading";
  const primaryLabel = refreshLocked
    ? "Refreshing..."
    : snapshot.status === "syncing"
      ? "Syncing..."
      : snapshot.status === "failed"
        ? "Retry sync"
        : "Refresh now";

  async function runRefresh(callback: () => void | Promise<void>) {
    if (primaryDisabled) {
      return;
    }

    setRefreshLocked(true);
    try {
      await Promise.resolve(callback());
    } finally {
      if (mountedRef.current) {
        setRefreshLocked(false);
      }
    }
  }

  function handleDismissError() {
    setDismissedErrorRevision(snapshot.eventRevision);
    onDismissError?.();
  }

  return (
    <section aria-label="Google Tasks sync" style={cardStyle}>
      <header style={headerStyle}>
        <div>
          <p style={eyebrowStyle}>Sync</p>
          <h3 style={titleStyle}>Google Tasks</h3>
          <p style={subcopyStyle}>{renderConnectionCopy(snapshot.connection)}</p>
        </div>
        <StatusBadge state={snapshot.status} />
      </header>

      <div style={statRowStyle} aria-label="Sync summary">
        <StatCard label="Lists" value={snapshot.listCount.toString()} />
        <StatCard label="Tasks" value={snapshot.taskCount.toString()} />
        <StatCard label="Pending" value={snapshot.pendingTaskCount.toString()} />
      </div>

      <div style={detailGridStyle}>
        <div style={detailRowStyle}>
          <span>Connection</span>
          <strong>{renderConnectionCopy(snapshot.connection)}</strong>
        </div>
        <div style={detailRowStyle}>
          <span>Last sync</span>
          <strong>{snapshot.lastSyncAt ? formatSyncTimestamp(snapshot.lastSyncAt) : "No sync yet"}</strong>
        </div>
      </div>

      {showLoadingState ? (
        <Banner tone="accent" title="Checking Google Tasks connection" body="Loading status before the first sync completes." />
      ) : null}

      {showEmptyState ? (
        <Banner
          tone="neutral"
          title="No sync history yet"
          body="The shell can show this card before Google Tasks has completed its first import."
        />
      ) : null}

      {snapshot.status === "syncing" || snapshot.pendingTaskCount > 0 ? (
        <Banner
          tone="warning"
          title="Sync in progress"
          body="Sidebar counts and task rows should be updated from live sync events, not a full reload."
        />
      ) : null}

      {showError ? (
        <Banner
          tone="danger"
          title="Sync failed"
          body={snapshot.lastError ?? "Google Tasks reported an error while syncing."}
        />
      ) : null}

      <ul aria-label="Synced tasks" style={taskListStyle}>
        {snapshot.taskRows.map((row) => (
          <li key={row.id} style={taskRowStyle} data-pending={row.pending ? "true" : "false"}>
            <div style={taskRowHeaderStyle}>
              <p style={taskRowTitleStyle}>{row.title}</p>
              {row.pending ? <PendingChip label={`Pending sync row: ${row.title}`}>Pending</PendingChip> : null}
            </div>
            <p style={taskRowMetaStyle}>{row.listName}</p>
          </li>
        ))}
      </ul>

      <div style={buttonRowStyle}>
        <button type="button" style={primaryButtonStyle} disabled={primaryDisabled} onClick={() => void runRefresh(onRefresh)}>
          {primaryLabel}
        </button>
        {snapshot.status === "failed" ? (
          <>
            <button
              type="button"
              style={secondaryButtonStyle}
              onClick={() => {
                void runRefresh(onRetry ?? onRefresh);
              }}
            >
              Retry
            </button>
            <button type="button" style={secondaryButtonStyle} onClick={handleDismissError}>
              Dismiss
            </button>
          </>
        ) : null}
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={statCardStyle} role="group" aria-label={`${label} count ${value}`}>
      <span style={statLabelStyle}>{label}</span>
      <span style={statValueStyle}>{value}</span>
    </div>
  );
}

function Banner({ tone, title, body }: { tone: BadgeTone; title: string; body: string }) {
  return (
    <div
      aria-live="polite"
      style={{
        display: "grid",
        gap: "4px",
        borderRadius: "12px",
        border: "1px solid",
        padding: "12px 14px",
        ...bannerStyleByTone[tone]
      }}
    >
      <strong style={{ fontSize: "13px" }}>{title}</strong>
      <span style={{ fontSize: "12px", lineHeight: 1.45 }}>{body}</span>
    </div>
  );
}

function StatusBadge({ state }: { state: SyncStatusState }) {
  const tone = statusToneByState[state];
  return (
    <span
      aria-label={`Sync status: ${state}`}
      style={{
        alignSelf: "flex-start",
        borderRadius: "999px",
        border: "1px solid",
        padding: "6px 10px",
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        ...bannerStyleByTone[tone]
      }}
    >
      {renderStatusCopy(state)}
    </span>
  );
}

function PendingChip({ children, label }: { children: string; label: string }) {
  return (
    <span
      aria-label={label}
      style={{
        borderRadius: "999px",
        border: "1px solid rgba(91, 106, 240, 0.18)",
        background: "rgba(91, 106, 240, 0.1)",
        color: "#5b6af0",
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.05em",
        padding: "4px 8px",
        textTransform: "uppercase"
      }}
    >
      {children}
    </span>
  );
}

function renderStatusCopy(status: SyncStatusState) {
  switch (status) {
    case "loading":
      return "Checking";
    case "idle":
      return "Idle";
    case "syncing":
      return "Syncing";
    case "ready":
      return "Ready";
    case "failed":
      return "Needs retry";
  }
}

function renderConnectionCopy(connection: SyncConnectionState) {
  switch (connection) {
    case "connected":
      return "Google Tasks connected";
    case "disconnected":
      return "Google Tasks disconnected";
    default:
      return "Connection unknown";
  }
}

function formatSyncTimestamp(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;
  const year = date.getUTCFullYear();
  const month = months[date.getUTCMonth()];
  const day = date.getUTCDate();
  const hour = date.getUTCHours();
  const minute = date.getUTCMinutes().toString().padStart(2, "0");
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${month} ${day}, ${year} | ${hour12}:${minute} ${period} UTC`;
}
