import { BadRequestException, Injectable } from "@nestjs/common";

import type {
  NudgeAcknowledgeInput,
  NudgeCopySelection,
  NudgeEvent,
  NudgePostponeInput,
  NudgeResistance,
  NudgeSnoozeInput,
  NudgeStrategy,
  NudgeUrgency,
  TaskNudgeProfile,
  UserNudgePreferences
} from "@zuam/shared/nudges";
import { selectNudgeCopy } from "@zuam/shared/nudges";

import { TasksDao } from "../tasks/dao";
import { NudgesDao } from "./dao";
import { NudgesEventBus } from "./events";

type TaskWithNudgeState = Awaited<ReturnType<TasksDao["getById"]>> & {
  nudge: TaskNudgeProfile;
};

@Injectable()
export class NudgesService {
  constructor(
    private readonly tasksDao: TasksDao,
    private readonly nudgesDao: NudgesDao,
    private readonly eventBus: NudgesEventBus
  ) {}

  upsertUserPreferences(userId: string, input: Partial<UserNudgePreferences>) {
    return this.nudgesDao.upsertUserPreferences(userId, input);
  }

  upsertTaskProfile(userId: string, taskId: string, input: Partial<TaskNudgeProfile>) {
    this.tasksDao.getById(userId, taskId);
    return this.nudgesDao.upsertTaskProfile(userId, taskId, input);
  }

  runScheduler(userId: string, at = new Date()) {
    const now = at.toISOString();
    const preferences = this.nudgesDao.getUserPreferences(userId);
    const events: NudgeEvent[] = [];

    for (const task of this.tasksDao.list(userId)) {
      if (task.isDeleted || task.completed || !task.dueDate) {
        continue;
      }

      const dueAt = new Date(task.dueDate);
      if (Number.isNaN(dueAt.getTime()) || dueAt > at) {
        continue;
      }

      const profile = this.nudgesDao.ensureTaskProfile(userId, task.id);
      const snoozedUntil = profile.snoozedUntil ? new Date(profile.snoozedUntil) : null;
      if (snoozedUntil && !Number.isNaN(snoozedUntil.getTime()) && snoozedUntil > at) {
        continue;
      }

      if (profile.activeEventId) {
        const active = this.nudgesDao.findActiveEventByTask(userId, task.id);
        if (active && active.state === "delivered") {
          continue;
        }
      }

      const level = this.resolveLevel(profile, preferences);
      const timesPostponed = profile.timesPostponed ?? 0;
      const copy = this.selectCopy(task.title, profile, level);
      const reason = timesPostponed > 0 ? "Task was postponed" : "Task is overdue";
      const event = this.nudgesDao.createEvent({
        userId,
        taskId: task.id,
        kind: "trigger",
        taskTitle: task.title,
        copyId: copy.copyId,
        message: copy.message,
        level,
        resistance: copy.resistance,
        urgency: copy.urgency,
        estimateMinutes: profile.estimateMinutes ?? 0,
        reason,
        scheduledAt: now,
        deliveredAt: now,
        acknowledgedAt: null,
        snoozedUntil: profile.snoozedUntil ?? null,
        state: "delivered",
        requiresExplicitDismissal: level === 2,
        canAutoDismiss: level === 1,
        blocking: level === 2,
        autoDismissAfter: level === 1 ? null : null,
        frequencyMin: profile.nudgeFrequencyMin ?? preferences.frequencyMin,
        timesPostponed,
        timesNudged: (profile.timesNudged ?? 0) + 1
      });

      this.nudgesDao.updateTaskProfile(userId, task.id, {
        activeEventId: event.id,
        lastNudgedAt: now,
        timesNudged: (profile.timesNudged ?? 0) + 1,
        lastAction: "trigger"
      });
      this.eventBus.emitTriggered(event);
      events.push(event);
    }

    return events;
  }

  snoozeTask(userId: string, taskId: string, input: NudgeSnoozeInput): TaskWithNudgeState {
    const task = this.tasksDao.getById(userId, taskId);
    const profile = this.nudgesDao.ensureTaskProfile(userId, taskId);
    const at = input.at ?? new Date().toISOString();
    const snoozedUntil = this.resolveSnoozeTime(at, input);

    if (!snoozedUntil) {
      throw new BadRequestException("Snooze requires minutes or snoozedUntil");
    }

    const nextProfile = this.nudgesDao.updateTaskProfile(userId, taskId, {
      snoozedUntil,
      activeEventId: null,
      lastAction: "snooze"
    });
    const activeEvent = profile.activeEventId ? this.nudgesDao.findActiveEventByTask(userId, taskId) : undefined;
    if (activeEvent) {
      this.nudgesDao.updateEvent(userId, activeEvent.id, {
        kind: "snooze",
        snoozedUntil,
        state: "snoozed"
      });
      this.eventBus.emitSnoozed({ ...activeEvent, snoozedUntil, state: "snoozed" });
    }

    return { ...task, nudge: nextProfile };
  }

  postponeTask(userId: string, taskId: string, input: NudgePostponeInput): TaskWithNudgeState {
    const task = this.tasksDao.getById(userId, taskId);
    const profile = this.nudgesDao.ensureTaskProfile(userId, taskId);
    const at = input.at ?? new Date().toISOString();
    const preferences = this.nudgesDao.getUserPreferences(userId);
    const nextDueDate =
      input.dueDate ??
      new Date(new Date(task.dueDate ?? at).getTime() + preferences.frequencyMin * 60_000).toISOString();

    if (Number.isNaN(new Date(nextDueDate).getTime())) {
      throw new BadRequestException("Due date must be a valid ISO timestamp");
    }

    const updatedTask = this.tasksDao.update(userId, taskId, { dueDate: nextDueDate });
    const nextProfile = this.nudgesDao.updateTaskProfile(userId, taskId, {
      timesPostponed: (profile.timesPostponed ?? 0) + 1,
      snoozedUntil: null,
      activeEventId: null,
      lastAction: "postpone"
    });

    const activeEvent = profile.activeEventId ? this.nudgesDao.findActiveEventByTask(userId, taskId) : undefined;
    if (activeEvent) {
      this.nudgesDao.updateEvent(userId, activeEvent.id, {
        kind: "postpone",
        state: "suppressed"
      });
      this.eventBus.emitPostponed(activeEvent);
    }

    return { ...updatedTask, nudge: nextProfile };
  }

  acknowledge(userId: string, eventId: string, input: NudgeAcknowledgeInput = {}) {
    const at = input.at ?? new Date().toISOString();
    const acknowledged = this.nudgesDao.updateEvent(userId, eventId, {
      kind: "acknowledge",
      acknowledgedAt: at,
      state: "acknowledged"
    });
    this.nudgesDao.updateTaskProfile(userId, acknowledged.taskId, {
      activeEventId: null,
      lastAction: "acknowledge"
    });
    this.eventBus.emitAcknowledged(acknowledged);
    return acknowledged;
  }

  private resolveLevel(profile: TaskNudgeProfile, preferences: UserNudgePreferences) {
    if ((profile.nudgeEscalation ?? preferences.escalationEnabled) && (profile.timesPostponed ?? 0) > 0) {
      return 2 as const;
    }
    return 1 as const;
  }

  private selectCopy(taskTitle: string, profile: TaskNudgeProfile, level: 1 | 2): NudgeCopySelection {
    const resistance: NudgeResistance = profile.resistance ?? "low";
    const urgency: NudgeUrgency = profile.urgency ?? "medium";
    const strategy: NudgeStrategy = profile.nudgeStrategy ?? "gentle";
    return selectNudgeCopy({
      resistance,
      urgency,
      level,
      taskTitle,
      strategy
    });
  }

  private resolveSnoozeTime(at: string, input: NudgeSnoozeInput) {
    if (input.snoozedUntil) {
      return input.snoozedUntil;
    }
    if (!input.minutes) {
      return null;
    }
    const atDate = new Date(at);
    if (Number.isNaN(atDate.getTime())) {
      throw new BadRequestException("Snooze timestamp must be a valid ISO string");
    }
    return new Date(atDate.getTime() + input.minutes * 60_000).toISOString();
  }
}
