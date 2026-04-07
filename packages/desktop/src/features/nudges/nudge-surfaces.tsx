import { useId, useMemo, useState } from "react";
import type { KeyboardEvent } from "react";

import type { NudgeEvent } from "@zuam/shared";

import "./nudge-surfaces.css";

type NudgeDeliveryState = "loading" | "ready" | "permission-denied";

type NudgeSurfaceAction =
  | {
      kind: "open-task";
      event: NudgeEvent;
    }
  | {
      kind: "snooze";
      event: NudgeEvent;
      minutes: number;
    }
  | {
      kind: "acknowledge";
      event: NudgeEvent;
    };

type NudgeNotificationSurfaceProps = {
  event: NudgeEvent;
  deliveryState?: NudgeDeliveryState;
  onOpenTask?: (action: Extract<NudgeSurfaceAction, { kind: "open-task" }>) => void;
  onSnooze?: (action: Extract<NudgeSurfaceAction, { kind: "snooze" }>) => void;
  onAcknowledge?: (action: Extract<NudgeSurfaceAction, { kind: "acknowledge" }>) => void;
  onRequestPermission?: () => void;
};

type NudgeBlockingModalProps = {
  event: NudgeEvent;
  onSnooze?: (action: Extract<NudgeSurfaceAction, { kind: "snooze" }>) => void;
  onAcknowledge?: (action: Extract<NudgeSurfaceAction, { kind: "acknowledge" }>) => void;
  onOpenTask?: (action: Extract<NudgeSurfaceAction, { kind: "open-task" }>) => void;
};

type NudgeSurfaceHarnessProps = {
  event: NudgeEvent;
  deliveryState?: NudgeDeliveryState;
};

type SurfaceTone = {
  kicker: string;
  title: string;
  body: string;
  helper: string;
  status: string;
};

const toneCopy: Record<NudgeEvent["resistance"], SurfaceTone> = {
  low: {
    kicker: "Light nudge",
    title: "Keep it moving",
    body: "Open the task and take one small step. A short action is enough to restart momentum.",
    helper: "No pressure to finish. Just reduce friction and choose a first step.",
    status: "Low resistance"
  },
  mild: {
    kicker: "Gentle nudge",
    title: "Pick the next clear step",
    body: "You do not need to solve the whole task right now. One clear move is enough.",
    helper: "Keep the next action visible and let the rest wait.",
    status: "Mild resistance"
  },
  high: {
    kicker: "Firm nudge",
    title: "Choose a smallest next action",
    body: "This task will stay in focus until you decide what happens next.",
    helper: "Make the next move tiny and concrete so it feels doable.",
    status: "High resistance"
  },
  dread: {
    kicker: "Blocking nudge",
    title: "Settle the next step now",
    body: "Keep this task open long enough to choose a realistic next move.",
    helper: "Stay with a tiny decision. You do not need to do the whole task at once.",
    status: "Dread resistance"
  }
};

const urgencyLabels: Record<NudgeEvent["urgency"], string> = {
  low: "Low urgency",
  medium: "Medium urgency",
  high: "High urgency"
};

function useTone(event: NudgeEvent) {
  return useMemo(() => toneCopy[event.resistance], [event.resistance]);
}

function renderActionLabel(kind: "snooze" | "acknowledge" | "open-task") {
  switch (kind) {
    case "snooze":
      return "Snooze 15 min";
    case "acknowledge":
      return "Acknowledge";
    case "open-task":
      return "Open task";
  }
}

function formatEstimate(event: NudgeEvent) {
  return `${event.estimateMinutes} min estimate`;
}

function formatSnoozeLabel(minutes: number) {
  return `Snoozed for ${minutes} minutes`;
}

function PixelAvatar() {
  const pixels = [
    "light",
    "dark",
    "light",
    "dark",
    "light",
    "light",
    "dark",
    "light",
    "dark",
    "light",
    "light",
    "dark",
    "light",
    "dark",
    "light",
    "light"
  ] as const;

  return (
    <div className="nudge-avatar" aria-hidden="true">
      {pixels.map((tone, index) => (
        <span key={index} className="nudge-avatar__pixel" data-tone={tone} />
      ))}
    </div>
  );
}

export function NudgeNotificationSurface({
  event,
  deliveryState = "ready",
  onOpenTask,
  onSnooze,
  onAcknowledge,
  onRequestPermission
}: NudgeNotificationSurfaceProps) {
  const tone = useTone(event);

  if (deliveryState === "loading") {
    return (
      <section className="nudge-root nudge-notification" aria-label="Preparing nudge" data-state="loading" role="status">
        <div className="nudge-stack">
          <p className="nudge-kicker">Notification</p>
          <h2 className="nudge-title">Preparing reminder</h2>
          <p className="nudge-copy">The nudge is being assembled with task context and timing metadata.</p>
        </div>
      </section>
    );
  }

  if (deliveryState === "permission-denied") {
    return (
      <section
        className="nudge-root nudge-notification"
        aria-label="Notification permission required"
        data-state="permission-denied"
        role="status"
      >
        <div className="nudge-notification__header">
          <div className="nudge-notification__title-group">
            <p className="nudge-kicker">Notification blocked</p>
            <h2 className="nudge-title">Desktop notifications are off</h2>
          </div>
          <PixelAvatar />
        </div>
        <p className="nudge-copy">
          Enable notification permission to show this reminder outside the app. Until then, the task can still open
          from the shell.
        </p>
        <div className="nudge-actions">
          <button type="button" className="nudge-button nudge-button--primary" onClick={onRequestPermission}>
            Enable notifications
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="nudge-root nudge-notification" aria-label={`Reminder for ${event.taskTitle}`} data-state="ready">
      <div className="nudge-notification__header">
        <div className="nudge-notification__title-group">
          <p className="nudge-kicker">{tone.kicker}</p>
          <h2 className="nudge-title">{event.taskTitle}</h2>
          <p className="nudge-copy">{event.message}</p>
        </div>
        <PixelAvatar />
      </div>

      <div className="nudge-meta-row" aria-label="Nudge metadata">
        <span className="nudge-chip nudge-chip--accent">{tone.status}</span>
        <span className="nudge-chip">{urgencyLabels[event.urgency]}</span>
        <span className="nudge-chip">{formatEstimate(event)}</span>
      </div>

      <p className="nudge-copy nudge-copy--compact">{tone.helper}</p>

      <hr className="nudge-divider" />

      <div className="nudge-actions">
        <button type="button" className="nudge-button nudge-button--primary" onClick={() => onOpenTask?.({ kind: "open-task", event })}>
          {renderActionLabel("open-task")}
        </button>
        <button type="button" className="nudge-button" onClick={() => onSnooze?.({ kind: "snooze", event, minutes: 15 })}>
          {renderActionLabel("snooze")}
        </button>
        <button type="button" className="nudge-button nudge-button--ghost" onClick={() => onAcknowledge?.({ kind: "acknowledge", event })}>
          {renderActionLabel("acknowledge")}
        </button>
      </div>
    </section>
  );
}

export function NudgeBlockingModal({
  event,
  onSnooze,
  onAcknowledge,
  onOpenTask
}: NudgeBlockingModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const tone = useTone(event);

  function handleKeyDown(eventObject: KeyboardEvent<HTMLDivElement>) {
    if (eventObject.key === "Escape") {
      eventObject.preventDefault();
      return;
    }

    if (eventObject.key.toLowerCase() === "s") {
      eventObject.preventDefault();
      onSnooze?.({ kind: "snooze", event, minutes: 15 });
    }

    if (eventObject.key.toLowerCase() === "a") {
      eventObject.preventDefault();
      onAcknowledge?.({ kind: "acknowledge", event });
    }

    if (eventObject.key.toLowerCase() === "o") {
      eventObject.preventDefault();
      onOpenTask?.({ kind: "open-task", event });
    }
  }

  return (
    <div className="nudge-modal-backdrop" data-testid="nudge-modal-backdrop">
      <section
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className="nudge-root nudge-modal"
        onKeyDown={handleKeyDown}
        role="dialog"
        tabIndex={-1}
      >
        <div className="nudge-modal__header">
          <div className="nudge-modal__title-group">
            <p className="nudge-kicker">Blocking modal</p>
            <h2 id={titleId} className="nudge-title">
              {event.taskTitle}
            </h2>
          </div>
          <div className="nudge-chip nudge-chip--accent" aria-label="Nudge level">
            Level {event.level}
          </div>
        </div>

        <div className="nudge-modal__content">
          <div className="nudge-modal__summary">
            <p id={descriptionId} className="nudge-copy">
              {event.reason}
            </p>
            <div className="nudge-meta-row">
              <span className="nudge-chip">{tone.status}</span>
              <span className="nudge-chip">{urgencyLabels[event.urgency]}</span>
              <span className="nudge-chip">{formatEstimate(event)}</span>
            </div>
          </div>

          <div className="nudge-detail-grid" aria-label="Task context">
            <DetailCard label="Copy" value={event.message} />
            <DetailCard label="Timing" value={`Scheduled ${event.scheduledAt}\nDelivered ${event.deliveredAt ?? "pending"}`} />
            <DetailCard label="Reminder id" value={event.id} />
            <DetailCard label="Task" value={event.taskId} />
          </div>

          <div className="nudge-state-panel" aria-label="Supportive guidance">
            <p className="nudge-state-panel__title">{tone.title}</p>
            <p className="nudge-state-panel__copy">{tone.body}</p>
          </div>

          <div className="nudge-actions">
            <button type="button" className="nudge-button nudge-button--primary" onClick={() => onAcknowledge?.({ kind: "acknowledge", event })}>
              Acknowledge
            </button>
            <button type="button" className="nudge-button" onClick={() => onSnooze?.({ kind: "snooze", event, minutes: 15 })}>
              Snooze 15 min
            </button>
            <button type="button" className="nudge-button nudge-button--ghost" onClick={() => onOpenTask?.({ kind: "open-task", event })}>
              Open task
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export function NudgeSurfaceHarness({ event, deliveryState = "ready" }: NudgeSurfaceHarnessProps) {
  const [status, setStatus] = useState<"ready" | "snoozed" | "acknowledged" | "opened">("ready");
  const [snoozeLabel, setSnoozeLabel] = useState<string | null>(null);

  if (event.level === 1) {
    return <NudgeNotificationSurface event={event} deliveryState={deliveryState} />;
  }

  return (
    <div className="nudge-layout nudge-layout--modal">
      <NudgeBlockingModal
        event={event}
        onAcknowledge={() => {
          setStatus("acknowledged");
          setSnoozeLabel(null);
        }}
        onOpenTask={() => {
          setStatus("opened");
          setSnoozeLabel(null);
        }}
        onSnooze={({ minutes }) => {
          setStatus("snoozed");
          setSnoozeLabel(formatSnoozeLabel(minutes));
        }}
      />

      {status === "snoozed" ? (
        <div className="nudge-state-panel" aria-live="polite" role="status">
          <p className="nudge-state-panel__title">{snoozeLabel ?? "Snoozed"}</p>
          <p className="nudge-state-panel__copy">The modal stays deferred until the next trigger.</p>
        </div>
      ) : null}

      {status === "acknowledged" ? (
        <div className="nudge-state-panel" aria-live="polite" role="status">
          <p className="nudge-state-panel__title">Acknowledged</p>
          <p className="nudge-state-panel__copy">The reminder was explicitly dismissed and will not keep blocking the shell.</p>
        </div>
      ) : null}

      {status === "opened" ? (
        <div className="nudge-state-panel" aria-live="polite" role="status">
          <p className="nudge-state-panel__title">Task opened</p>
          <p className="nudge-state-panel__copy">The shell can now focus the underlying task detail surface.</p>
        </div>
      ) : null}
    </div>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="nudge-detail-card">
      <span className="nudge-detail-card__label">{label}</span>
      <span className="nudge-detail-card__value">{value}</span>
    </div>
  );
}
