import { useEffect, useState } from "react";

import type { SmartListId, TaskGroupBy, TaskSortBy } from "@zuam/shared";
import type { NudgeEvent } from "@zuam/shared";

import { acknowledgeNudge, snoozeTask } from "../../lib/api/desktop-api";
import { useShellStore, type ShellPresentation, type ShellView } from "../../lib/state/shell-store";
import { NudgeBlockingModal, NudgeNotificationSurface } from "../nudges";
import { FocusBreakOverlay, FocusSessionPanel } from "../focus/focus-session-panel";
import { useFocusSession } from "../focus/use-focus-session";
import { useSyncStatus } from "../system";
import { TaskDetailPanel } from "../tasks/task-detail-panel";
import { TaskViews } from "../views/task-views";
import { useTaskWorkspace } from "../views/use-task-workspace";
import { parseQuickCapturePreviews } from "./quick-capture";
import {
  blockingNudge,
  initialSyncSnapshot,
  notificationNudge
} from "./shell-data";

const smartNavItems: Array<{ id: ShellView; label: string; smartList?: SmartListId }> = [
  { id: "today", label: "Today", smartList: "today" },
  { id: "next7days", label: "Next 7 Days", smartList: "next7days" },
  { id: "assigned", label: "Assigned to Me" },
  { id: "inbox", label: "Inbox", smartList: "inbox" },
  { id: "focusQueue", label: "Focus Queue" }
];

const presentationTabs: ShellPresentation[] = ["list", "kanban", "matrix", "calendar"];

export function DesktopShell() {
  const activeView = useShellStore((state) => state.activeView);
  const activeListId = useShellStore((state) => state.activeListId);
  const activeTagSlug = useShellStore((state) => state.activeTagSlug);
  const activeSavedFilterId = useShellStore((state) => state.activeSavedFilterId);
  const activePresentation = useShellStore((state) => state.activePresentation);
  const groupBy = useShellStore((state) => state.groupBy);
  const sortBy = useShellStore((state) => state.sortBy);
  const selectedTaskId = useShellStore((state) => state.selectedTaskId);
  const sidebarCollapsed = useShellStore((state) => state.sidebarCollapsed);
  const commandPaletteOpen = useShellStore((state) => state.commandPaletteOpen);
  const quickCaptureOpen = useShellStore((state) => state.quickCaptureOpen);
  const setActiveView = useShellStore((state) => state.setActiveView);
  const setActiveListId = useShellStore((state) => state.setActiveListId);
  const setActiveTagSlug = useShellStore((state) => state.setActiveTagSlug);
  const setActiveSavedFilterId = useShellStore((state) => state.setActiveSavedFilterId);
  const setActivePresentation = useShellStore((state) => state.setActivePresentation);
  const setGroupBy = useShellStore((state) => state.setGroupBy);
  const setSortBy = useShellStore((state) => state.setSortBy);
  const setSelectedTaskId = useShellStore((state) => state.setSelectedTaskId);
  const setSidebarCollapsed = useShellStore((state) => state.setSidebarCollapsed);
  const openQuickCapture = useShellStore((state) => state.openQuickCapture);
  const closeQuickCapture = useShellStore((state) => state.closeQuickCapture);
  const closeCommandPalette = useShellStore((state) => state.closeCommandPalette);
  const [notificationVisible, setNotificationVisible] = useState(true);
  const [notificationPermissionGranted, setNotificationPermissionGranted] = useState(false);
  const [activeBlockingNudge, setActiveBlockingNudge] = useState<NudgeEvent | null>(blockingNudge);
  const { snapshot: syncSnapshot, refresh: refreshSync, dismissError } = useSyncStatus(initialSyncSnapshot);

  const workspace = useTaskWorkspace({
    activeView,
    activePresentation,
    activeListId,
    activeTagSlug,
    activeSavedFilterId,
    groupBy,
    sortBy,
    selectedTaskId
  });
  const focus = useFocusSession(selectedTaskId);

  useEffect(() => {
    const firstTaskId = workspace.taskQuery.data?.items[0]?.id ?? workspace.focusQueueQuery.data?.task?.id ?? null;
    if (!selectedTaskId && firstTaskId) {
      setSelectedTaskId(firstTaskId);
    }
  }, [selectedTaskId, setSelectedTaskId, workspace.focusQueueQuery.data?.task?.id, workspace.taskQuery.data?.items]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openQuickCapture();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [openQuickCapture]);

  const sidebarCounts = workspace.bootstrapQuery.data?.sidebarCounts ?? [];
  const lists = workspace.bootstrapQuery.data?.lists ?? [];
  const tags = workspace.bootstrapQuery.data?.tags ?? [];
  const savedFilters = workspace.bootstrapQuery.data?.savedFilters ?? [];
  const heading = resolveHeading(activeView, activeListId, activeTagSlug, activeSavedFilterId, lists, savedFilters);
  const subtitle = resolveSubtitle(activeView, workspace.taskQuery.data?.totalCount ?? 0, activePresentation, groupBy, sortBy);

  const focusCallToAction = (() => {
    if (focus.currentSession && focus.currentSession.taskId === selectedTaskId) {
      if (focus.runtimeState === "running") {
        return {
          label: `Pause focus - ${formatDuration(focus.remainingSeconds)}`,
          helper: "A session is already running for this task.",
          onClick: focus.pause
        };
      }

      if (focus.runtimeState === "paused") {
        return {
          label: `Resume focus - ${formatDuration(focus.remainingSeconds)}`,
          helper: "Resume the paused session and keep the timer anchored to this task.",
          onClick: focus.resume
        };
      }

      if (focus.runtimeState === "break") {
        return {
          label: `Resume after break - ${formatDuration(focus.remainingSeconds)}`,
          helper: "Break mode is active. Resume when you are ready.",
          onClick: focus.resume
        };
      }
    }

    return {
      label: "Start 25-min Focus Session",
      helper: focus.currentSession && focus.currentSession.taskId !== selectedTaskId
        ? "Another task already owns the active session."
        : "Start a focused sprint from this task.",
      onClick: focus.start
    };
  })();

  const primarySuggestion = workspace.calendarSuggestionsQuery.data?.suggestions[0] ?? null;
  const calendarHint = primarySuggestion
    ? {
        title: `Best next slot: ${formatTimeRange(primarySuggestion.start, primarySuggestion.end)}`,
        body: primarySuggestion.rationale
      }
    : workspace.calendarContextQuery.data
      ? {
          title: workspace.calendarContextQuery.data.stale ? "Calendar context is stale" : "Calendar context is available",
          body: `Busy blocks: ${workspace.calendarContextQuery.data.busyBlocks.length}. Free windows: ${workspace.calendarContextQuery.data.freeWindows.length}.`
        }
      : null;

  function selectSmartView(view: ShellView) {
    setActiveView(view);
    setActiveListId(null);
    setActiveTagSlug(null);
    setActiveSavedFilterId(null);
    if (view === "focusQueue") {
      setActivePresentation("list");
      setGroupBy("none");
      setSortBy("priority");
      return;
    }

    applyPresentationDefaults(activePresentation, setGroupBy, setSortBy);
  }

  function selectList(listId: string) {
    setActiveView("list");
    setActiveListId(listId);
    setActiveTagSlug(null);
    setActiveSavedFilterId(null);
  }

  function selectTag(tagSlug: string) {
    setActiveView("tag");
    setActiveTagSlug(tagSlug);
    setActiveListId(null);
    setActiveSavedFilterId(null);
  }

  function selectSavedFilter(filterId: string) {
    setActiveView("savedFilter");
    setActiveSavedFilterId(filterId);
    setActiveListId(null);
    setActiveTagSlug(null);
  }

  function selectPresentation(presentation: ShellPresentation) {
    setActivePresentation(presentation);
    applyPresentationDefaults(presentation, setGroupBy, setSortBy);
  }

  async function handleRefreshSync() {
    await refreshSync();
  }

  return (
    <main className={`desktop-shell${sidebarCollapsed ? " is-sidebar-collapsed" : ""}`}>
      <aside className="desktop-sidebar" aria-label="Primary navigation">
        <header className="sidebar-logo-row">
          <div className="sidebar-logo-mark" aria-hidden="true">
            Z
          </div>
          <p className="sidebar-brand">Zuam</p>
          <div className="sidebar-spacer" />
          <button
            type="button"
            className="sidebar-utility-button"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <span />
          </button>
        </header>

        <div className="sidebar-user-row">
          <div className="sidebar-user-avatar" aria-hidden="true">
            SB
          </div>
          <p>Seb H.</p>
        </div>

        <div className="sidebar-search-wrap">
          <button type="button" className="sidebar-search-trigger" onClick={openQuickCapture}>
            <span className="sidebar-search-icon" aria-hidden="true" />
            <span>Quick capture - Ctrl/Cmd+K</span>
          </button>
        </div>

        <nav className="sidebar-smart-nav" aria-label="Smart lists">
          {smartNavItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`sidebar-nav-item${activeView === item.id ? " is-active" : ""}`}
              onClick={() => selectSmartView(item.id)}
            >
              <span className="sidebar-nav-label">{item.label}</span>
              <span className="sidebar-nav-count">{sidebarCounts.find((row) => row.key === (item.smartList ?? item.id))?.count ?? 0}</span>
            </button>
          ))}
        </nav>

        <section className="sidebar-group">
          <div className="sidebar-group-header">
            <p>Lists</p>
          </div>
          <div className="sidebar-list-stack">
            {lists.map((list) => (
              <button
                key={list.id}
                type="button"
                className={`sidebar-list-item${activeView === "list" && activeListId === list.id ? " is-active" : ""}`}
                onClick={() => selectList(list.id)}
              >
                <span className="sidebar-list-dot" aria-hidden="true" style={{ backgroundColor: list.color ?? "#7b8fa6" }} />
                <span className="sidebar-nav-label">{list.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="sidebar-group">
          <div className="sidebar-group-header">
            <p>Tags</p>
          </div>
          <div className="sidebar-tag-stack">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                className="sidebar-tag-item"
                onClick={() => selectTag(tag.slug)}
              >
                #{tag.slug}
              </button>
            ))}
          </div>
        </section>

        <section className="sidebar-group">
          <div className="sidebar-group-header">
            <p>Filters</p>
          </div>
          <div className="sidebar-tag-stack">
            {savedFilters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                className="sidebar-tag-item"
                onClick={() => selectSavedFilter(filter.id)}
              >
                {filter.name}
              </button>
            ))}
          </div>
        </section>
      </aside>

      <section className="desktop-main-panel" aria-label="Task list">
        <header className="desktop-main-header">
          <div className="desktop-main-title-group">
            <h1>{heading}</h1>
            <p>{subtitle}</p>
          </div>

          <div className="desktop-main-header-actions">
            <div className="desktop-view-switcher" role="tablist" aria-label="View mode">
              {presentationTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`desktop-view-chip${activePresentation === tab ? " is-active" : ""}`}
                  onClick={() => selectPresentation(tab)}
                >
                  {tab === "list" ? "List" : tab === "kanban" ? "Kanban" : tab === "matrix" ? "Matrix" : "Calendar"}
                </button>
              ))}
            </div>

            <button type="button" className="desktop-main-more" aria-label="More actions">
              ...
            </button>
          </div>
        </header>

        <div className="desktop-sync-strip" aria-label="Google Tasks sync status">
          <div className="desktop-sync-copy">
            <span className={`desktop-sync-pill is-${syncSnapshot.status}`}>{renderSyncLabel(syncSnapshot.status)}</span>
            <p>{renderSyncCopy(syncSnapshot)}</p>
          </div>
          <div className="desktop-sync-actions">
            <button type="button" className="desktop-sync-button" onClick={() => void handleRefreshSync()}>
              Refresh
            </button>
            {syncSnapshot.status === "failed" ? (
              <button type="button" className="desktop-sync-button is-ghost" onClick={dismissError}>
                Dismiss
              </button>
            ) : null}
          </div>
        </div>

        <div className="desktop-main-content">
          <TaskViews
            activeView={activeView}
            activePresentation={activePresentation}
            selectedTaskId={selectedTaskId}
            taskQuery={workspace.taskQuery.data}
            focusRecommendation={workspace.focusQueueQuery.data}
            calendarContext={workspace.calendarContextQuery.data}
            calendarSuggestions={workspace.calendarSuggestionsQuery.data?.suggestions ?? []}
            onSelectTask={setSelectedTaskId}
            onMoveTask={(taskId, input) => workspace.moveTask.mutate({ taskId, ...input })}
            onSetTaskStatus={(taskId, status) => workspace.setTaskStatus.mutate({ taskId, status })}
          />
        </div>

        <footer className="desktop-quick-add-wrap">
          <button type="button" className="desktop-quick-add" onClick={openQuickCapture}>
            <span className="desktop-quick-add-plus" aria-hidden="true">
              +
            </span>
            <span>{`Add task... try "review design tomorrow 3pm ~platform !1 #work"`}</span>
          </button>
        </footer>
      </section>

      <div className="desktop-shell-divider" aria-hidden="true" />

      <div className="desktop-detail-column">
        {selectedTaskId ? (
          <TaskDetailPanel
            taskId={selectedTaskId}
            focusCallToAction={focusCallToAction}
            calendarHint={calendarHint}
          />
        ) : null}
      </div>

      {commandPaletteOpen || quickCaptureOpen ? (
        <QuickCaptureDialog
          onClose={() => {
            closeQuickCapture();
            closeCommandPalette();
          }}
        />
      ) : null}

      {notificationVisible ? (
        <div className="nudge-notification-dock">
          <NudgeNotificationSurface
            event={notificationNudge}
            deliveryState={notificationPermissionGranted ? "ready" : "permission-denied"}
            onRequestPermission={() => setNotificationPermissionGranted(true)}
            onOpenTask={({ event }) => {
              setSelectedTaskId(event.taskId);
              setNotificationVisible(false);
            }}
            onSnooze={({ event, minutes }) => {
              void snoozeTask(event.taskId, minutes).catch(() => undefined);
              setNotificationVisible(false);
            }}
            onAcknowledge={({ event }) => {
              void acknowledgeNudge(event.id).catch(() => undefined);
              setNotificationVisible(false);
            }}
          />
        </div>
      ) : null}

      {activeBlockingNudge ? (
        <NudgeBlockingModal
          event={activeBlockingNudge}
          onOpenTask={({ event }) => {
            setSelectedTaskId(event.taskId);
            setActiveBlockingNudge(null);
          }}
          onSnooze={({ event, minutes }) => {
            void snoozeTask(event.taskId, minutes).catch(() => undefined);
            setActiveBlockingNudge(null);
          }}
          onAcknowledge={({ event }) => {
            void acknowledgeNudge(event.id).catch(() => undefined);
            setActiveBlockingNudge(null);
          }}
        />
      ) : null}

      <FocusSessionPanel
        snapshot={focus.focusQuery.data}
        remainingSeconds={focus.remainingSeconds}
        onPause={focus.pause}
        onResume={focus.resume}
        onTakeBreak={focus.takeBreak}
        onEnd={focus.end}
      />
      <FocusBreakOverlay
        visible={focus.runtimeState === "break"}
        remainingSeconds={focus.remainingSeconds}
        onResume={focus.resume}
      />
    </main>
  );
}

function QuickCaptureDialog({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState("Finish shell work ~project-zero !high today");
  const previews = parseQuickCapturePreviews(text);

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-label="Quick capture"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="panel-header">
          <div>
            <p className="eyebrow">Quick capture</p>
            <h2>Deterministic capture</h2>
          </div>
          <button className="text-button" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <label className="capture-input">
          <span>Task text</span>
          <input aria-label="Task text" value={text} onChange={(event) => setText(event.target.value)} />
        </label>

        <p className="grammar-hint">
          Use explicit tokens only: <code>~list</code>, <code>!priority</code>, <code>#tag</code>, <code>today</code>.
        </p>

        <div className="preview-row" aria-label="Quick capture previews">
          {previews.map((preview) => (
            <span key={`${preview.label}:${preview.value}`} className="preview-chip">
              <strong>{preview.label}</strong>
              <span>{preview.value}</span>
            </span>
          ))}
        </div>

        <div className="review-actions">
          <button className="approve-button" type="button">
            Create task
          </button>
          <button className="text-button" type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function resolveHeading(
  activeView: ShellView,
  activeListId: string | null,
  activeTagSlug: string | null,
  activeSavedFilterId: string | null,
  lists: Array<{ id: string; name: string }>,
  savedFilters: Array<{ id: string; name: string }>
) {
  switch (activeView) {
    case "next7days":
      return "Next 7 Days";
    case "assigned":
      return "Assigned to Me";
    case "inbox":
      return "Inbox";
    case "list":
      return lists.find((list) => list.id === activeListId)?.name ?? "List";
    case "tag":
      return activeTagSlug ? `#${activeTagSlug}` : "Tag";
    case "savedFilter":
      return savedFilters.find((filter) => filter.id === activeSavedFilterId)?.name ?? "Saved filter";
    case "focusQueue":
      return "Focus Queue";
    case "today":
    default:
      return "Today";
  }
}

function resolveSubtitle(
  activeView: ShellView,
  totalCount: number,
  activePresentation: ShellPresentation,
  groupBy: TaskGroupBy,
  sortBy: TaskSortBy
) {
  if (activeView === "focusQueue") {
    return `${totalCount} supporting tasks - recommendation-first queue - ${sortBy}`;
  }

  return `${totalCount} tasks - ${activePresentation} view - grouped by ${groupBy} - sorted by ${sortBy}`;
}

function applyPresentationDefaults(
  presentation: ShellPresentation,
  setGroupBy: (groupBy: TaskGroupBy) => void,
  setSortBy: (sortBy: TaskSortBy) => void
) {
  switch (presentation) {
    case "kanban":
      setGroupBy("section");
      setSortBy("manual");
      break;
    case "matrix":
      setGroupBy("quadrant");
      setSortBy("priority");
      break;
    case "calendar":
      setGroupBy("date");
      setSortBy("dueDate");
      break;
    case "list":
    default:
      setGroupBy("section");
      setSortBy("manual");
      break;
  }
}

function renderSyncLabel(status: "loading" | "idle" | "syncing" | "ready" | "failed") {
  switch (status) {
    case "loading":
      return "Loading";
    case "idle":
      return "Idle";
    case "syncing":
      return "Syncing";
    case "failed":
      return "Attention";
    case "ready":
    default:
      return "Synced";
  }
}

function renderSyncCopy(snapshot: typeof initialSyncSnapshot) {
  if (snapshot.status === "failed") {
    return snapshot.lastError ?? "Google Tasks reported a sync error.";
  }

  if (!snapshot.lastSyncAt) {
    return "Google Tasks connected. Waiting for the first completed import.";
  }

  const syncTime = new Date(snapshot.lastSyncAt);
  const formattedTime = Number.isNaN(syncTime.getTime())
    ? snapshot.lastSyncAt
    : syncTime.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  return `Google Tasks connected - Last sync ${formattedTime} - ${snapshot.taskCount} tasks across ${snapshot.listCount} lists`;
}

function formatTimeRange(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return `${startDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}-${endDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
