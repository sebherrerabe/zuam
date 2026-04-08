import type { NudgeEvent } from "@zuam/shared";

import type { SyncStatusSnapshot } from "../system";

export type SidebarSmartItem = {
  id: string;
  label: string;
  view: "today" | "next7days" | "assigned" | "inbox" | "focusQueue";
  icon: string;
  count?: number;
};

export type SidebarListItem = {
  id: string;
  label: string;
  count: number;
  colorClass: string;
};

export type SidebarSystemItem = {
  id: string;
  label: string;
  icon: string;
};

export type ShellTaskRow = {
  id: string;
  title: string;
  listName: string;
  listColorClass: string;
  checkboxTone: "danger" | "warning" | "blue" | "neutral";
  timeLabel?: string;
  dueBadge?: string;
  progressLabel?: string;
  estimate?: string;
  tag?: string;
  tagTone?: "teal" | "blue";
  priorityLabel?: string;
  priorityTone?: "high" | "medium";
};

export type ShellTaskSection = {
  id: string;
  label: string;
  count: number;
  tasks: ShellTaskRow[];
};

export const smartNavItems: SidebarSmartItem[] = [
  { id: "today", label: "Today", view: "today", icon: "Today", count: 7 },
  { id: "next7days", label: "Next 7 Days", view: "next7days", icon: "Next", count: 7 },
  { id: "assigned", label: "Assigned to Me", view: "assigned", icon: "Me", count: 2 },
  { id: "inbox", label: "Inbox", view: "inbox", icon: "Inbox", count: 6 },
  { id: "focusQueue", label: "Focus Queue", view: "focusQueue", icon: "Focus" }
];

export const userLists: SidebarListItem[] = [
  { id: "jiholabo-v2", label: "Jiholabo V2", count: 24, colorClass: "is-violet" },
  { id: "personal", label: "Personal", count: 12, colorClass: "is-green" },
  { id: "family", label: "Family", count: 4, colorClass: "is-yellow" },
  { id: "glimpact", label: "Glimpact", count: 16, colorClass: "is-blue" },
  { id: "platform", label: "Platform", count: 17, colorClass: "is-red" }
];

export const sidebarTags = ["#work", "#urgent", "#deep-work"];

export const systemNavItems: SidebarSystemItem[] = [
  { id: "completed", label: "Completed", icon: "Done" },
  { id: "wontdo", label: "Won't Do", icon: "Skip" },
  { id: "trash", label: "Trash", icon: "Trash" },
  { id: "settings", label: "Settings", icon: "Gear" }
];

export const presentationTabs = [
  { id: "list", label: "List" },
  { id: "kanban", label: "Kanban" },
  { id: "matrix", label: "Matrix" },
  { id: "calendar", label: "Calendar" }
] as const;

export const todaySections: ShellTaskSection[] = [
  {
    id: "overdue",
    label: "Overdue",
    count: 2,
    tasks: [
      {
        id: "task-7",
        title: "File Q1 taxes",
        listName: "Personal",
        listColorClass: "is-green",
        checkboxTone: "danger",
        dueBadge: "2d overdue",
        estimate: "45 min",
        tag: "URGENT",
        tagTone: "blue",
        priorityLabel: "DREAD",
        priorityTone: "high"
      },
      {
        id: "task-8",
        title: "Send invoice to Glimpact",
        listName: "Glimpact",
        listColorClass: "is-blue",
        checkboxTone: "warning",
        dueBadge: "1d overdue",
        progressLabel: "0/2",
        estimate: "10 min"
      }
    ]
  },
  {
    id: "due-today",
    label: "Due Today",
    count: 5,
    tasks: [
      {
        id: "task-1",
        title: "Ship nudge engine v1 (Level 0-2)",
        listName: "Platform",
        listColorClass: "is-red",
        checkboxTone: "danger",
        timeLabel: "6:00 PM",
        progressLabel: "3/7",
        estimate: "2h 15m",
        tag: "#deep-work",
        tagTone: "teal",
        priorityLabel: "HIGH",
        priorityTone: "medium"
      },
      {
        id: "task-2",
        title: "Review Jiholabo onboarding copy",
        listName: "Jiholabo V2",
        listColorClass: "is-violet",
        checkboxTone: "warning",
        timeLabel: "3:30 PM",
        progressLabel: "2/4",
        estimate: "25 min"
      },
      {
        id: "task-4",
        title: "Call mom back",
        listName: "Family",
        listColorClass: "is-yellow",
        checkboxTone: "blue",
        estimate: "15 min"
      },
      {
        id: "task-5",
        title: "Rewrite scoring weights doc",
        listName: "Platform",
        listColorClass: "is-red",
        checkboxTone: "warning",
        timeLabel: "8:00 PM",
        estimate: "40 min",
        tag: "#work",
        tagTone: "teal"
      },
      {
        id: "task-6",
        title: "Water the plants",
        listName: "Personal",
        listColorClass: "is-green",
        checkboxTone: "neutral",
        estimate: "5 min"
      }
    ]
  }
];

export const nextSevenDaysSections: ShellTaskSection[] = [
  {
    id: "next-seven-days",
    label: "Next 7 Days",
    count: 4,
    tasks: [
      {
        id: "task-2",
        title: "Review onboarding invite copy",
        listName: "Jiholabo V2",
        listColorClass: "is-violet",
        checkboxTone: "warning",
        timeLabel: "Thu · 9:00 AM",
        estimate: "45 min"
      },
      {
        id: "task-3",
        title: "Pull Q1 metrics data",
        listName: "Platform",
        listColorClass: "is-red",
        checkboxTone: "danger",
        timeLabel: "Today · 8:00 PM",
        estimate: "40 min",
        tag: "#work",
        tagTone: "teal"
      },
      {
        id: "task-4",
        title: "Call mom back",
        listName: "Family",
        listColorClass: "is-yellow",
        checkboxTone: "blue",
        timeLabel: "Today · 4:30 PM",
        estimate: "15 min"
      },
      {
        id: "task-6",
        title: "Water the plants",
        listName: "Personal",
        listColorClass: "is-green",
        checkboxTone: "neutral",
        timeLabel: "Today",
        estimate: "5 min"
      }
    ]
  }
];

export const assignedSections: ShellTaskSection[] = [
  {
    id: "assigned",
    label: "Assigned to Me",
    count: 2,
    tasks: [
      {
        id: "task-1",
        title: "Ship nudge engine v1 (Level 0-2)",
        listName: "Platform",
        listColorClass: "is-red",
        checkboxTone: "danger",
        timeLabel: "Today · 6:00 PM",
        progressLabel: "3/7",
        estimate: "2h 15m",
        tag: "#deep-work",
        tagTone: "teal"
      },
      {
        id: "task-3",
        title: "Pull Q1 metrics data",
        listName: "Platform",
        listColorClass: "is-red",
        checkboxTone: "danger",
        timeLabel: "Today · 8:00 PM",
        estimate: "40 min"
      }
    ]
  }
];

export const inboxSections: ShellTaskSection[] = [
  {
    id: "inbox",
    label: "Inbox",
    count: 3,
    tasks: [
      {
        id: "task-8",
        title: "Send invoice to Glimpact",
        listName: "Glimpact",
        listColorClass: "is-blue",
        checkboxTone: "warning",
        estimate: "10 min"
      },
      {
        id: "task-5",
        title: "Rewrite scoring weights doc",
        listName: "Platform",
        listColorClass: "is-red",
        checkboxTone: "warning",
        estimate: "40 min"
      },
      {
        id: "task-6",
        title: "Water the plants",
        listName: "Personal",
        listColorClass: "is-green",
        checkboxTone: "neutral",
        estimate: "5 min"
      }
    ]
  }
];

export const focusQueueSections: ShellTaskSection[] = [
  {
    id: "focus-queue",
    label: "Focus Queue",
    count: 3,
    tasks: [
      {
        id: "task-1",
        title: "Ship nudge engine v1 (Level 0-2)",
        listName: "Platform",
        listColorClass: "is-red",
        checkboxTone: "danger",
        estimate: "2h 15m",
        tag: "#deep-work",
        tagTone: "teal"
      },
      {
        id: "task-3",
        title: "Pull Q1 metrics data",
        listName: "Platform",
        listColorClass: "is-red",
        checkboxTone: "danger",
        estimate: "40 min",
        tag: "#work",
        tagTone: "teal"
      },
      {
        id: "task-2",
        title: "Review onboarding invite copy",
        listName: "Jiholabo V2",
        listColorClass: "is-violet",
        checkboxTone: "warning",
        estimate: "45 min"
      }
    ]
  }
];

export const listSections: Record<string, ShellTaskSection[]> = {
  platform: [
    {
      id: "platform",
      label: "Platform",
      count: 3,
      tasks: [
        todaySections[1]!.tasks[0]!,
        {
          id: "task-3",
          title: "Pull Q1 metrics data",
          listName: "Platform",
          listColorClass: "is-red",
          checkboxTone: "danger",
          estimate: "40 min",
          tag: "#work",
          tagTone: "teal"
        },
        todaySections[1]!.tasks[3]!
      ]
    }
  ],
  "jiholabo-v2": [
    {
      id: "jiholabo-v2",
      label: "Jiholabo V2",
      count: 1,
      tasks: [todaySections[1]!.tasks[1]!]
    }
  ],
  personal: [
    {
      id: "personal",
      label: "Personal",
      count: 2,
      tasks: [todaySections[0]!.tasks[0]!, todaySections[1]!.tasks[4]!]
    }
  ],
  family: [
    {
      id: "family",
      label: "Family",
      count: 1,
      tasks: [todaySections[1]!.tasks[2]!]
    }
  ],
  glimpact: [
    {
      id: "glimpact",
      label: "Glimpact",
      count: 1,
      tasks: [todaySections[0]!.tasks[1]!]
    }
  ]
};

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
