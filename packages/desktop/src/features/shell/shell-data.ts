import type { NudgeEvent } from "@zuam/shared";

import type { SyncStatusSnapshot } from "../system";

export type ChatMessage = {
  id: string;
  speaker: "user" | "zuamy";
  text: string;
};

export type PlanCard = {
  day: string;
  items: Array<{ time: string; label: string }>;
};

export type ReviewTab = "summary" | "checklist" | "task-diff" | "calendar" | "rationale";

export const reviewTabs: Array<{ id: ReviewTab; label: string }> = [
  { id: "summary", label: "Summary" },
  { id: "checklist", label: "Checklist" },
  { id: "task-diff", label: "Task Diff" },
  { id: "calendar", label: "Calendar" },
  { id: "rationale", label: "Rationale" }
];

export const chatMessages: ChatMessage[] = [
  {
    id: "user-1",
    speaker: "user",
    text: "My week is a mess. I need to prep the investor update, finish the nudge engine, and somehow survive today."
  },
  {
    id: "zuamy-1",
    speaker: "zuamy",
    text:
      "Got it. I see three threads:\n\n1. Investor update - high stakes, due Thursday\n2. Nudge engine - deep work, needs a big block\n3. Daily survival - quick wins for momentum\n\nI've drafted a plan. Review it on the right."
  },
  {
    id: "user-2",
    speaker: "user",
    text: "Can you also make sure I have time for the dentist Tuesday afternoon?"
  },
  {
    id: "zuamy-2",
    speaker: "zuamy",
    text:
      "Noted - I see the dentist block on your calendar (Tue 2-3:30 PM). I've routed deep work around it. Updated plan is ready for review."
  }
];

export const planCards: PlanCard[] = [
  {
    day: "Today (Sun)",
    items: [
      { time: "2-4 PM", label: "Investor outline (focus)" },
      { time: "4:30 PM", label: "Call mom back" },
      { time: "5:00 PM", label: "Water plants" }
    ]
  },
  {
    day: "Monday",
    items: [
      { time: "9-11:30 AM", label: "Nudge engine (focus)" },
      { time: "1:00 PM", label: "Review Jiholabo copy" },
      { time: "3:00 PM", label: "Pull Q1 metrics data" }
    ]
  },
  {
    day: "Tuesday",
    items: [
      { time: "9-11 AM", label: "Investor data pull (focus)" },
      { time: "2-3:30 PM", label: "Dentist (blocked)" },
      { time: "4:00 PM", label: "Scoring weights doc" }
    ]
  }
];

export const understandingCopy =
  "You have 3 priorities this week: investor update (due Thu), nudge engine shipping (needs deep-work blocks), and daily survival tasks. The dentist appointment Tue 2-3:30 PM is protected. I'm front-loading the highest-leverage item and routing deep work around calendar blocks.";

export const planStats = "7 actions | 3 focus blocks | 6h 30m deep work | 0 conflicts";

export const initialSyncSnapshot: SyncStatusSnapshot = {
  connection: "connected",
  status: "ready",
  lastSyncAt: "2026-04-07T16:05:00.000Z",
  lastError: null,
  listCount: 5,
  taskCount: 19,
  pendingTaskCount: 1,
  eventRevision: 12,
  taskRows: [
    { id: "task-1", title: "Ship nudge engine v1 (Level 0-2)", listName: "Platform", pending: true },
    { id: "task-2", title: "Review onboarding invite copy", listName: "Jiholabo V2" },
    { id: "task-3", title: "Pull Q1 metrics data", listName: "Platform" }
  ]
};

export const notificationNudge: NudgeEvent = {
  id: "nudge-l1-1",
  userId: "user-1",
  taskId: "task-2",
  kind: "trigger",
  taskTitle: "Review onboarding invite copy",
  copyId: "mild-l1-next-step",
  message: "Pick the next clear step for Review onboarding invite copy.",
  level: 1,
  resistance: "mild",
  urgency: "medium",
  estimateMinutes: 25,
  reason: "This task is due soon and is still waiting on a concrete next step.",
  scheduledAt: "2026-04-07T17:20:00.000+02:00",
  deliveredAt: "2026-04-07T17:21:00.000+02:00",
  acknowledgedAt: null,
  snoozedUntil: null,
  state: "delivered",
  requiresExplicitDismissal: false,
  canAutoDismiss: true,
  blocking: false,
  autoDismissAfter: null,
  frequencyMin: 60,
  timesPostponed: 0,
  timesNudged: 1
};

export const blockingNudge: NudgeEvent = {
  id: "nudge-l2-1",
  userId: "user-1",
  taskId: "task-1",
  kind: "trigger",
  taskTitle: "Ship nudge engine v1 (Level 0-2)",
  copyId: "high-l2-blocking-choice",
  message: "Choose how to move Ship nudge engine v1 (Level 0-2) forward now.",
  level: 2,
  resistance: "high",
  urgency: "high",
  estimateMinutes: 45,
  reason: "This task has been postponed and now needs an explicit next action.",
  scheduledAt: "2026-04-07T17:10:00.000+02:00",
  deliveredAt: "2026-04-07T17:12:00.000+02:00",
  acknowledgedAt: null,
  snoozedUntil: null,
  state: "delivered",
  requiresExplicitDismissal: true,
  canAutoDismiss: false,
  blocking: true,
  autoDismissAfter: null,
  frequencyMin: 15,
  timesPostponed: 2,
  timesNudged: 5
};
