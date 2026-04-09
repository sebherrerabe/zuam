import { Injectable } from "@nestjs/common";
import type {
  AnalyticsExplanationRef,
  AnalyticsHeatmapResponse,
  AnalyticsSummary,
  AnalyticsWindow,
  FocusSessionCompletionFact,
  HardestTaskHighlight,
  HeatmapBucket,
  StreakSummary,
  TaskCompletionFact,
  WeeklySummary
} from "@zuam/shared";

import { AnalyticsInsightsDao } from "./dao";

const DEFAULT_TIMEZONE = "Europe/Brussels";
const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class AnalyticsInsightsService {
  constructor(private readonly analyticsDao: AnalyticsInsightsDao) {}

  getSummary(userId: string, window: AnalyticsWindow = "this-week", at = new Date().toISOString()): AnalyticsSummary {
    const taskFacts = this.analyticsDao.listTaskCompletionFacts(userId);
    const focusFacts = this.analyticsDao.listFocusSessionCompletionFacts(userId);
    const range = resolveWindowRange(window, at);
    const taskFactsInWindow = taskFacts.filter((fact) => isInWindow(fact.completedAt, range));
    const focusFactsInWindow = focusFacts.filter((fact) => isInWindow(fact.endedAt, range));

    return {
      generatedAt: at,
      timezone: DEFAULT_TIMEZONE,
      window,
      streakSummary: buildStreakSummary(taskFacts, focusFacts, at),
      weeklySummary: buildWeeklySummary(window, range, taskFactsInWindow, focusFactsInWindow),
      hardestTaskHighlight: buildHardestTaskHighlight(taskFactsInWindow, focusFactsInWindow),
      explanationRefs: buildExplanationRefs(taskFactsInWindow, focusFactsInWindow)
    };
  }

  getHeatmap(
    userId: string,
    window: AnalyticsWindow = "last-28-days",
    at = new Date().toISOString()
  ): AnalyticsHeatmapResponse {
    const taskFacts = this.analyticsDao.listTaskCompletionFacts(userId);
    const focusFacts = this.analyticsDao.listFocusSessionCompletionFacts(userId);
    const range = resolveWindowRange(window, at);
    const buckets = buildHeatmapBuckets(taskFacts, focusFacts, range);

    return {
      generatedAt: at,
      timezone: DEFAULT_TIMEZONE,
      window,
      buckets
    };
  }
}

function buildExplanationRefs(
  taskFacts: TaskCompletionFact[],
  focusFacts: FocusSessionCompletionFact[]
): AnalyticsExplanationRef[] {
  return [
    ...taskFacts.map((fact) => ({
      source: "task-completion" as const,
      sourceId: fact.taskId,
      label: fact.title,
      timestamp: fact.completedAt
    })),
    ...focusFacts.map((fact) => ({
      source: "focus-session" as const,
      sourceId: fact.sessionId,
      label: `${fact.taskTitle} · ${fact.loggedMinutes} focus mins`,
      timestamp: fact.endedAt
    }))
  ].sort((left, right) => left.timestamp.localeCompare(right.timestamp));
}

function buildWeeklySummary(
  window: AnalyticsWindow,
  range: { start: string; end: string },
  taskFacts: TaskCompletionFact[],
  focusFacts: FocusSessionCompletionFact[]
): WeeklySummary {
  const activeDays = new Set<string>();

  for (const fact of taskFacts) {
    activeDays.add(fact.completedDate);
  }

  for (const fact of focusFacts) {
    activeDays.add(fact.completedDate);
  }

  return {
    window,
    windowStart: range.start,
    windowEnd: range.end,
    completedTaskCount: taskFacts.length,
    completedFocusSessionCount: focusFacts.length,
    focusMinutes: focusFacts.reduce((total, fact) => total + fact.loggedMinutes, 0),
    activeDays: activeDays.size
  };
}

function buildStreakSummary(
  taskFacts: TaskCompletionFact[],
  focusFacts: FocusSessionCompletionFact[],
  at: string
): StreakSummary {
  const dates = new Set<string>();

  for (const fact of taskFacts) {
    dates.add(fact.completedDate);
  }

  for (const fact of focusFacts) {
    dates.add(fact.completedDate);
  }

  const sortedDates = [...dates].sort();
  if (sortedDates.length === 0) {
    return {
      currentStreak: 0,
      bestStreak: 0,
      lastActiveDate: null,
      timezone: DEFAULT_TIMEZONE,
      gracePolicy: "A one-day grace window keeps the streak alive through the next local day."
    };
  }

  let best = 1;
  let running = 1;

  for (let index = 1; index < sortedDates.length; index += 1) {
    const previous = new Date(`${sortedDates[index - 1]}T00:00:00.000Z`);
    const current = new Date(`${sortedDates[index]}T00:00:00.000Z`);
    const deltaDays = Math.round((current.getTime() - previous.getTime()) / DAY_MS);

    if (deltaDays === 1) {
      running += 1;
      best = Math.max(best, running);
      continue;
    }

    running = 1;
  }

  const lastActiveDate = sortedDates[sortedDates.length - 1] ?? null;
  const today = formatDate(new Date(at));
  const yesterday = formatDate(new Date(startOfDay(new Date(at)).getTime() - DAY_MS));
  const currentStreak =
    lastActiveDate === today || lastActiveDate === yesterday ? countBackwardStreak(sortedDates) : 0;

  return {
    currentStreak,
    bestStreak: best,
    lastActiveDate,
    timezone: DEFAULT_TIMEZONE,
    gracePolicy: "A one-day grace window keeps the streak alive through the next local day."
  };
}

function buildHardestTaskHighlight(
  taskFacts: TaskCompletionFact[],
  focusFacts: FocusSessionCompletionFact[]
): HardestTaskHighlight | null {
  if (taskFacts.length === 0) {
    return null;
  }

  let winner: HardestTaskHighlight | null = null;

  for (const fact of taskFacts) {
    const relatedFocus = focusFacts.filter((item) => item.taskId === fact.taskId);
    const focusMinutes = relatedFocus.reduce((total, item) => total + item.loggedMinutes, 0);
    const effortScore =
      priorityWeight(fact.priority) +
      resistanceWeight(fact.resistance) +
      (fact.overdueAtCompletion ? 8 : 0) +
      focusMinutes / 5;
    const explanationParts = [];

    if (fact.overdueAtCompletion) {
      explanationParts.push("overdue recovery");
    }
    explanationParts.push(`${fact.priority} priority`);
    if (fact.resistance !== "NONE") {
      explanationParts.push(`${fact.resistance.toLowerCase()} resistance`);
    }
    if (focusMinutes > 0) {
      explanationParts.push(`${focusMinutes} focus mins`);
    }

    const candidate: HardestTaskHighlight = {
      taskId: fact.taskId,
      title: fact.title,
      completedAt: fact.completedAt,
      effortScore: Number(effortScore.toFixed(2)),
      focusMinutes,
      explanation: explanationParts.join(" + "),
      explanationRefs: [
        {
          source: "task-completion",
          sourceId: fact.taskId,
          label: fact.title,
          timestamp: fact.completedAt
        },
        ...relatedFocus.map((item) => ({
          source: "focus-session" as const,
          sourceId: item.sessionId,
          label: `${item.taskTitle} · ${item.loggedMinutes} focus mins`,
          timestamp: item.endedAt
        }))
      ]
    };

    if (!winner || candidate.effortScore > winner.effortScore) {
      winner = candidate;
    }
  }

  return winner;
}

function buildHeatmapBuckets(
  taskFacts: TaskCompletionFact[],
  focusFacts: FocusSessionCompletionFact[],
  range: { start: string; end: string }
): HeatmapBucket[] {
  const taskCountsByDate = new Map<string, number>();
  const focusCountsByDate = new Map<string, number>();
  const focusMinutesByDate = new Map<string, number>();
  const refsByDate = new Map<string, AnalyticsExplanationRef[]>();

  for (const fact of taskFacts) {
    if (!isInWindow(fact.completedAt, range)) {
      continue;
    }

    taskCountsByDate.set(fact.completedDate, (taskCountsByDate.get(fact.completedDate) ?? 0) + 1);
    refsByDate.set(fact.completedDate, [
      ...(refsByDate.get(fact.completedDate) ?? []),
      {
        source: "task-completion",
        sourceId: fact.taskId,
        label: fact.title,
        timestamp: fact.completedAt
      }
    ]);
  }

  for (const fact of focusFacts) {
    if (!isInWindow(fact.endedAt, range)) {
      continue;
    }

    focusCountsByDate.set(fact.completedDate, (focusCountsByDate.get(fact.completedDate) ?? 0) + 1);
    focusMinutesByDate.set(
      fact.completedDate,
      (focusMinutesByDate.get(fact.completedDate) ?? 0) + fact.loggedMinutes
    );
    refsByDate.set(fact.completedDate, [
      ...(refsByDate.get(fact.completedDate) ?? []),
      {
        source: "focus-session",
        sourceId: fact.sessionId,
        label: `${fact.taskTitle} · ${fact.loggedMinutes} focus mins`,
        timestamp: fact.endedAt
      }
    ]);
  }

  const buckets: HeatmapBucket[] = [];
  let cursor = startOfDay(new Date(range.start));
  const endDate = startOfDay(new Date(range.end));

  while (cursor.getTime() <= endDate.getTime()) {
    const date = formatDate(cursor);
    const completedTaskCount = taskCountsByDate.get(date) ?? 0;
    const focusSessionCount = focusCountsByDate.get(date) ?? 0;
    const focusMinutes = focusMinutesByDate.get(date) ?? 0;
    const score = completedTaskCount * 3 + focusSessionCount * 2 + Math.floor(focusMinutes / 30);

    buckets.push({
      date,
      completedTaskCount,
      focusSessionCount,
      focusMinutes,
      intensity: normalizeIntensity(score),
      explanationRefs: refsByDate.get(date) ?? []
    });

    cursor = new Date(cursor.getTime() + DAY_MS);
  }

  return buckets;
}

function normalizeIntensity(score: number) {
  if (score <= 0) {
    return 0;
  }
  if (score <= 2) {
    return 1;
  }
  if (score <= 5) {
    return 2;
  }
  if (score <= 8) {
    return 3;
  }
  return 4;
}

function priorityWeight(priority: string) {
  switch (priority) {
    case "high":
      return 16;
    case "medium":
      return 10;
    case "low":
      return 6;
    default:
      return 2;
  }
}

function resistanceWeight(resistance: string) {
  switch (resistance) {
    case "DREAD":
      return 14;
    case "HIGH":
      return 10;
    case "MILD":
      return 4;
    default:
      return 0;
  }
}

function resolveWindowRange(window: AnalyticsWindow, at: string) {
  const now = new Date(at);
  const end = endOfDay(now);

  if (window === "this-week") {
    const start = startOfDay(now);
    const day = start.getUTCDay();
    const offset = day === 0 ? 6 : day - 1;
    start.setUTCDate(start.getUTCDate() - offset);
    return { start: start.toISOString(), end: end.toISOString() };
  }

  const days = window === "last-90-days" ? 89 : 27;
  const start = startOfDay(now);
  start.setUTCDate(start.getUTCDate() - days);
  return { start: start.toISOString(), end: end.toISOString() };
}

function countBackwardStreak(sortedDates: string[]) {
  if (sortedDates.length === 0) {
    return 0;
  }

  let streak = 1;

  for (let index = sortedDates.length - 1; index > 0; index -= 1) {
    const current = new Date(`${sortedDates[index]}T00:00:00.000Z`);
    const previous = new Date(`${sortedDates[index - 1]}T00:00:00.000Z`);
    const deltaDays = Math.round((current.getTime() - previous.getTime()) / DAY_MS);
    if (deltaDays !== 1) {
      break;
    }
    streak += 1;
  }

  return streak;
}

function isInWindow(value: string, range: { start: string; end: string }) {
  return value >= range.start && value <= range.end;
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(date: Date) {
  const copy = new Date(date);
  copy.setUTCHours(23, 59, 59, 999);
  return copy;
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}
