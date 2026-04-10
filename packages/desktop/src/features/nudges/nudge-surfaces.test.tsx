import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { fireEvent, render, screen } from "@testing-library/react";

import type { NudgeEvent } from "@zuam/shared";

import { NudgeBlockingModal, NudgeNotificationSurface, NudgeSurfaceHarness } from "./nudge-surfaces";

const stylesheetText = readFileSync(
  resolve(dirname(fileURLToPath(import.meta.url)), "nudge-surfaces.css"),
  "utf8"
);

const baseEvent: NudgeEvent = {
  id: "nudge-1",
  userId: "user-1",
  taskId: "task-1",
  kind: "trigger",
  taskTitle: "Finish the onboarding invite copy",
  copyId: "mild-l2-direct-action",
  message: "Pick the next clear step for Finish the onboarding invite copy.",
  level: 2,
  resistance: "mild",
  urgency: "high",
  estimateMinutes: 15,
  reason: "This task has been postponed and now needs a direct next action.",
  scheduledAt: "2026-04-07T09:00:00.000+02:00",
  deliveredAt: "2026-04-07T09:01:00.000+02:00",
  acknowledgedAt: null,
  snoozedUntil: null,
  state: "delivered",
  requiresExplicitDismissal: true,
  canAutoDismiss: false,
  blocking: true,
  autoDismissAfter: null,
  frequencyMin: 30,
  timesPostponed: 2,
  timesNudged: 5
};

describe("desktop nudge surfaces", () => {
  it("NUDGE-FE-001: renders notification loading, ready, and permission denied states", () => {
    const { rerender } = render(<NudgeNotificationSurface event={baseEvent} deliveryState="loading" />);

    expect(screen.getByRole("status", { name: /preparing nudge/i })).toHaveTextContent("Preparing reminder");

    rerender(<NudgeNotificationSurface event={baseEvent} deliveryState="ready" />);
    expect(screen.getByRole("region", { name: /reminder for finish the onboarding invite copy/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /open task/i })).toBeInTheDocument();
    expect(screen.getByText("High urgency")).toBeInTheDocument();

    rerender(<NudgeNotificationSurface event={baseEvent} deliveryState="permission-denied" />);
    expect(screen.getByRole("status", { name: /notification permission required/i })).toHaveTextContent(
      /desktop notifications are off/i
    );
    expect(screen.getByRole("button", { name: /enable notifications/i })).toBeInTheDocument();
  });

  it("NUDGE-FE-002: renders an explicit-dismissal modal that ignores accidental close affordances", () => {
    render(<NudgeBlockingModal event={baseEvent} />);

    const dialog = screen.getByRole("dialog", { name: /finish the onboarding invite copy/i });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByRole("button", { name: /acknowledge/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /snooze 15 min/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /open task/i })).toBeInTheDocument();

    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(screen.getByRole("dialog", { name: /finish the onboarding invite copy/i })).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("nudge-modal-backdrop"));
    expect(screen.getByRole("dialog", { name: /finish the onboarding invite copy/i })).toBeInTheDocument();
  });

  it("NUDGE-FE-003: snooze and acknowledge update visible state via keyboard and mouse actions", () => {
    render(<NudgeSurfaceHarness event={baseEvent} />);

    const dialog = screen.getByRole("dialog", { name: /finish the onboarding invite copy/i });
    fireEvent.keyDown(dialog, { key: "s" });

    expect(screen.getByText("Snoozed for 15 minutes")).toBeInTheDocument();
    expect(screen.getByText("The modal stays deferred until the next trigger.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /acknowledge/i }));
    expect(screen.getByText("Acknowledged")).toBeInTheDocument();
    expect(screen.getByText("The reminder was explicitly dismissed and will not keep blocking the shell.")).toBeInTheDocument();
  });

  it("NUDGE-FE-004: renders supportive copy with accessible labels and no guilt-heavy tone", () => {
    render(<NudgeBlockingModal event={{ ...baseEvent, resistance: "dread", urgency: "high" }} />);

    expect(screen.getByRole("dialog")).toHaveAccessibleName("Finish the onboarding invite copy");
    expect(screen.getByText("Dread resistance")).toBeInTheDocument();
    expect(screen.getByText("Settle the next step now")).toBeInTheDocument();
    expect(screen.getByText(/keep this task open long enough to choose a realistic next move/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /acknowledge/i })).toBeVisible();
    expect(screen.getByRole("button", { name: /snooze 15 min/i })).toBeVisible();
    expect(screen.queryByText(/should have|guilty|lazy|bad/i)).not.toBeInTheDocument();
  });

  it("NUDGE-FE-VIS-001: uses the warm-light action hierarchy instead of the legacy blue-teal CTA palette", () => {
    render(<NudgeBlockingModal event={baseEvent} />);

    const primaryButton = screen.getByRole("button", { name: /acknowledge/i });
    const detailCard = screen.getByText("Copy").closest(".nudge-detail-card");

    if (!detailCard) {
      throw new Error("Expected nudge detail card to be rendered");
    }

    expect(stylesheetText).toContain(".nudge-button--primary");
    expect(stylesheetText).toContain("#b7764b");
    expect(stylesheetText).not.toContain("#00d4ab");
    expect(stylesheetText).toContain("border-radius: 12px;");
    expect(stylesheetText).toContain(".nudge-detail-card");
    expect(stylesheetText).toContain("background: #fffcf7;");
    expect(primaryButton).toHaveClass("nudge-button--primary");
    expect(detailCard).toHaveClass("nudge-detail-card");
  });
});
