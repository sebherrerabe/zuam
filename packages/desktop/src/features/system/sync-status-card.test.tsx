import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { SyncStatusCard, type SyncStatusSnapshot } from "./sync-status-card";

function createSnapshot(overrides: Partial<SyncStatusSnapshot> = {}): SyncStatusSnapshot {
  return {
    connection: "connected",
    status: "idle",
    lastSyncAt: null,
    lastError: null,
    listCount: 0,
    taskCount: 0,
    pendingTaskCount: 0,
    eventRevision: 0,
    taskRows: [],
    ...overrides
  };
}

describe("sync status card", () => {
  it("FE-UNIT-SYNC-001: shows loading and empty states before the first sync completes", () => {
    const { rerender } = render(
      <SyncStatusCard
        snapshot={createSnapshot({
          connection: "unknown",
          status: "loading",
          lastSyncAt: null,
          listCount: 0,
          taskCount: 0,
          pendingTaskCount: 0,
          taskRows: []
        })}
        onRefresh={vi.fn()}
      />
    );

    expect(screen.getByText("Checking Google Tasks connection")).toBeInTheDocument();
    expect(screen.getByText("Connection unknown", { selector: "p" })).toBeInTheDocument();

    rerender(
      <SyncStatusCard
        snapshot={createSnapshot({
          connection: "connected",
          status: "idle",
          lastSyncAt: null,
          listCount: 0,
          taskCount: 0,
          pendingTaskCount: 0,
          taskRows: []
        })}
        onRefresh={vi.fn()}
      />
    );

    expect(screen.getByText("No sync history yet")).toBeInTheDocument();
    expect(screen.getByText("Google Tasks connected", { selector: "p" })).toBeInTheDocument();
  });

  it("FE-UNIT-SYNC-002: disables manual refresh until the pending request settles", async () => {
    let resolveRefresh!: () => void;
    const onRefresh = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveRefresh = resolve;
        })
    );

    render(
      <SyncStatusCard
        snapshot={createSnapshot({
          status: "ready",
          lastSyncAt: "2026-04-07T10:00:00.000Z",
          listCount: 2,
          taskCount: 6,
          pendingTaskCount: 0,
          taskRows: [{ id: "task-1", title: "Ship sync status", listName: "Inbox" }]
        })}
        onRefresh={onRefresh}
      />
    );

    const button = screen.getByRole("button", { name: "Refresh now" });
    fireEvent.click(button);
    fireEvent.click(button);

    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Refreshing..." })).toBeDisabled();

    resolveRefresh();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Refresh now" })).toBeEnabled();
    });
  });

  it("FE-UNIT-SYNC-003: surfaces retry and dismiss affordances without hiding the task rows", () => {
    const onRefresh = vi.fn();
    const onDismissError = vi.fn();

    render(
      <SyncStatusCard
        snapshot={createSnapshot({
          status: "failed",
          lastSyncAt: "2026-04-07T10:00:00.000Z",
          lastError: "Provider temporarily unavailable",
          listCount: 2,
          taskCount: 6,
          pendingTaskCount: 1,
          eventRevision: 4,
          taskRows: [{ id: "task-1", title: "Ship sync status", listName: "Inbox", pending: true }]
        })}
        onRefresh={onRefresh}
        onDismissError={onDismissError}
      />
    );

    expect(screen.getByText("Sync failed")).toBeInTheDocument();
    expect(screen.getByText("Provider temporarily unavailable")).toBeInTheDocument();
    expect(screen.getByText("Ship sync status")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));

    expect(onDismissError).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Sync failed")).not.toBeInTheDocument();
    expect(screen.getByText("Ship sync status")).toBeInTheDocument();
  });

  it("FE-UNIT-SYNC-004: reflects live sync events and clears stale indicators after success", () => {
    const { rerender } = render(
      <SyncStatusCard
        snapshot={createSnapshot({
          status: "syncing",
          lastSyncAt: "2026-04-07T10:00:00.000Z",
          listCount: 2,
          taskCount: 6,
          pendingTaskCount: 2,
          eventRevision: 7,
          taskRows: [
            { id: "task-1", title: "Ship sync status", listName: "Inbox", pending: true },
            { id: "task-2", title: "Resolve conflict", listName: "Project Zero", pending: true }
          ]
        })}
        onRefresh={vi.fn()}
      />
    );

    expect(screen.getByText("Sync in progress")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Lists count 2" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Tasks count 6" })).toBeInTheDocument();
    expect(screen.getAllByLabelText(/Pending sync row/i)).toHaveLength(2);

    rerender(
      <SyncStatusCard
        snapshot={createSnapshot({
          status: "ready",
          lastSyncAt: "2026-04-07T10:05:00.000Z",
          listCount: 3,
          taskCount: 8,
          pendingTaskCount: 0,
          eventRevision: 8,
          taskRows: [
            { id: "task-1", title: "Ship sync status", listName: "Inbox" },
            { id: "task-2", title: "Resolve conflict", listName: "Project Zero" },
            { id: "task-3", title: "Newly synced task", listName: "Today" }
          ]
        })}
        onRefresh={vi.fn()}
      />
    );

    expect(screen.queryByText("Sync in progress")).not.toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Lists count 3" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Tasks count 8" })).toBeInTheDocument();
    expect(screen.getByText("Apr 7, 2026 | 10:05 AM UTC")).toBeInTheDocument();
    expect(screen.getByText("Newly synced task")).toBeInTheDocument();
    expect(screen.queryAllByLabelText(/Pending sync row/i)).toHaveLength(0);
  });
});
