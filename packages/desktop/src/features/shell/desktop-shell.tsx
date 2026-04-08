import { useEffect, useMemo, useState } from "react";

import type { NudgeEvent } from "@zuam/shared";

import { acknowledgeNudge, snoozeTask } from "../../lib/api/desktop-api";
import { useShellStore, type ShellView } from "../../lib/state/shell-store";
import { NudgeBlockingModal, NudgeNotificationSurface } from "../nudges";
import { useSyncStatus } from "../system";
import { TaskDetailPanel } from "../tasks/task-detail-panel";
import { parseQuickCapturePreviews } from "./quick-capture";
import {
  assignedSections,
  blockingNudge,
  focusQueueSections,
  inboxSections,
  initialSyncSnapshot,
  listSections,
  nextSevenDaysSections,
  notificationNudge,
  presentationTabs,
  sidebarTags,
  smartNavItems,
  systemNavItems,
  todaySections,
  userLists,
  type ShellTaskRow
} from "./shell-data";

type PresentationTab = (typeof presentationTabs)[number]["id"];

const rootViews = new Set<ShellView>(["today", "next7days", "assigned", "inbox", "focusQueue"]);

export function DesktopShell() {
  const activeView = useShellStore((state) => state.activeView);
  const activeListId = useShellStore((state) => state.activeListId);
  const selectedTaskId = useShellStore((state) => state.selectedTaskId);
  const sidebarCollapsed = useShellStore((state) => state.sidebarCollapsed);
  const commandPaletteOpen = useShellStore((state) => state.commandPaletteOpen);
  const quickCaptureOpen = useShellStore((state) => state.quickCaptureOpen);
  const setActiveView = useShellStore((state) => state.setActiveView);
  const setActiveListId = useShellStore((state) => state.setActiveListId);
  const setSelectedTaskId = useShellStore((state) => state.setSelectedTaskId);
  const setSidebarCollapsed = useShellStore((state) => state.setSidebarCollapsed);
  const openQuickCapture = useShellStore((state) => state.openQuickCapture);
  const closeQuickCapture = useShellStore((state) => state.closeQuickCapture);
  const closeCommandPalette = useShellStore((state) => state.closeCommandPalette);
  const [activePresentation, setActivePresentation] = useState<PresentationTab>("list");
  const [notificationVisible, setNotificationVisible] = useState(true);
  const [notificationPermissionGranted, setNotificationPermissionGranted] = useState(false);
  const [activeBlockingNudge, setActiveBlockingNudge] = useState<NudgeEvent | null>(blockingNudge);
  const { snapshot: syncSnapshot, refresh: refreshSync, dismissError } = useSyncStatus(initialSyncSnapshot);

  useEffect(() => {
    if (!selectedTaskId) {
      setSelectedTaskId("task-1");
    }
  }, [selectedTaskId, setSelectedTaskId]);

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

  const content = useMemo(() => getShellContent(activeView, activeListId), [activeListId, activeView]);

  function selectRootView(view: ShellView) {
    if (!rootViews.has(view)) {
      return;
    }

    setActiveListId(null);
    setActiveView(view);
  }

  function selectList(listId: string) {
    setActiveView("list");
    setActiveListId(listId);
  }

  function openTaskFromNudge(taskId: string) {
    setSelectedTaskId(taskId);
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
              className={`sidebar-nav-item${activeView === item.view ? " is-active" : ""}`}
              onClick={() => selectRootView(item.view)}
            >
              <span className={`sidebar-nav-icon icon-${item.icon.toLowerCase()}`} aria-hidden="true" />
              <span className="sidebar-nav-label">{item.label}</span>
              {item.count ? <span className="sidebar-nav-count">{item.count}</span> : null}
            </button>
          ))}
        </nav>

        <section className="sidebar-group">
          <div className="sidebar-group-header">
            <p>Lists</p>
            <button type="button" aria-label="Create list">
              +
            </button>
          </div>
          <div className="sidebar-list-stack">
            {userLists.map((list) => (
              <button
                key={list.id}
                type="button"
                className={`sidebar-list-item${activeView === "list" && activeListId === list.id ? " is-active" : ""}`}
                onClick={() => selectList(list.id)}
              >
                <span className={`sidebar-list-dot ${list.colorClass}`} aria-hidden="true" />
                <span className="sidebar-nav-label">{list.label}</span>
                <span className="sidebar-nav-count">{list.count}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="sidebar-group">
          <div className="sidebar-group-header">
            <p>Tags</p>
            <button type="button" aria-label="Create tag">
              +
            </button>
          </div>
          <div className="sidebar-tag-stack">
            {sidebarTags.map((tag) => (
              <button key={tag} type="button" className="sidebar-tag-item">
                {tag}
              </button>
            ))}
          </div>
        </section>

        <div className="sidebar-footer-nav" aria-label="System navigation">
          {systemNavItems.map((item) => (
            <button key={item.id} type="button" className="sidebar-nav-item is-muted">
              <span className={`sidebar-nav-icon icon-${item.icon.toLowerCase()}`} aria-hidden="true" />
              <span className="sidebar-nav-label">{item.label}</span>
            </button>
          ))}
        </div>
      </aside>

      <section className="desktop-main-panel" aria-label="Task list">
        <header className="desktop-main-header">
          <div className="desktop-main-title-group">
            <h1>{content.title}</h1>
            <p>{content.subtitle}</p>
          </div>

          <div className="desktop-main-header-actions">
            <div className="desktop-view-switcher" role="tablist" aria-label="View mode">
              {presentationTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`desktop-view-chip${activePresentation === tab.id ? " is-active" : ""}`}
                  onClick={() => setActivePresentation(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button type="button" className="desktop-main-more" aria-label="More actions">
              •••
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
          {activePresentation === "list" ? (
            <div className="task-section-stack">
              {content.sections.map((section) => (
                <section key={section.id} className="task-section">
                  <header className="task-section-header">
                    <span className="task-section-label">{section.label}</span>
                    <span className="task-section-count">{section.count}</span>
                  </header>

                  <div className="task-list">
                    {section.tasks.map((task) => (
                      <TaskListRow
                        key={task.id}
                        task={task}
                        selected={selectedTaskId === task.id}
                        onSelect={() => setSelectedTaskId(task.id)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <section className="desktop-placeholder-panel" aria-label={`${activePresentation} view placeholder`}>
              <h2>{presentationTabs.find((tab) => tab.id === activePresentation)?.label}</h2>
              <p>
                The Phase 1 shell keeps the switcher chrome visible while richer {activePresentation} rendering is
                phased in behind the same layout.
              </p>
            </section>
          )}
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
        {selectedTaskId ? <TaskDetailPanel taskId={selectedTaskId} /> : null}
      </div>

      {(commandPaletteOpen || quickCaptureOpen) && (
        <QuickCaptureDialog
          onClose={() => {
            closeQuickCapture();
            closeCommandPalette();
          }}
        />
      )}

      {notificationVisible ? (
        <div className="nudge-notification-dock">
          <NudgeNotificationSurface
            event={notificationNudge}
            deliveryState={notificationPermissionGranted ? "ready" : "permission-denied"}
            onRequestPermission={() => setNotificationPermissionGranted(true)}
            onOpenTask={({ event }) => {
              openTaskFromNudge(event.taskId);
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
            openTaskFromNudge(event.taskId);
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
    </main>
  );
}

function TaskListRow({
  task,
  selected,
  onSelect
}: {
  task: ShellTaskRow;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`task-list-row${selected ? " is-selected" : ""}`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <span className={`task-list-check is-${task.checkboxTone}`} aria-hidden="true" />

      <div className="task-list-copy">
        <div className="task-list-title-row">
          <p>{task.title}</p>
          {task.timeLabel ? <span className="task-list-time">{task.timeLabel}</span> : null}
          {task.dueBadge ? <span className="task-list-due-badge">{task.dueBadge}</span> : null}
        </div>

        <div className="task-list-meta-row">
          <span className={`task-list-dot ${task.listColorClass}`} aria-hidden="true" />
          <span>{task.listName}</span>
          {task.progressLabel ? <span>{task.progressLabel}</span> : null}
          {task.estimate ? <span>{task.estimate}</span> : null}
          {task.tag ? <span className={`task-list-tag is-${task.tagTone ?? "teal"}`}>{task.tag}</span> : null}
          {task.priorityLabel ? (
            <span className={`task-list-priority is-${task.priorityTone ?? "medium"}`}>{task.priorityLabel}</span>
          ) : null}
        </div>
      </div>
    </button>
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
          <input
            aria-label="Task text"
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
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

function getShellContent(activeView: ShellView, activeListId: string | null) {
  if (activeView === "list" && activeListId) {
    const selectedList = userLists.find((list) => list.id === activeListId);
    return {
      title: selectedList?.label ?? "List",
      subtitle: `${selectedList?.count ?? 0} tasks synced from Google Tasks`,
      sections: listSections[activeListId] ?? todaySections
    };
  }

  switch (activeView) {
    case "next7days":
      return {
        title: "Next 7 Days",
        subtitle: "Upcoming commitments kept in the same persistent shell",
        sections: nextSevenDaysSections
      };
    case "assigned":
      return {
        title: "Assigned to Me",
        subtitle: "Tasks that still need a clear next move from you",
        sections: assignedSections
      };
    case "inbox":
      return {
        title: "Inbox",
        subtitle: "Captured work that still needs triage",
        sections: inboxSections
      };
    case "focusQueue":
      return {
        title: "Focus Queue",
        subtitle: "High-leverage work to pull into a focused session",
        sections: focusQueueSections
      };
    case "today":
    default:
      return {
        title: "Today",
        subtitle: "Sunday, April 5 · 7 tasks · est 4h 50m",
        sections: todaySections
      };
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

  return `Google Tasks connected · Last sync ${formattedTime} · ${snapshot.taskCount} tasks across ${snapshot.listCount} lists`;
}
