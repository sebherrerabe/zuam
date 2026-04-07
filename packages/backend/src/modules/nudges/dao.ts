import { Injectable } from "@nestjs/common";

import type {
  NudgeEvent,
  TaskNudgeProfile,
  UserNudgePreferences
} from "@zuam/shared/nudges";

import { newId, notFound } from "../core-data-utils";

type TaskNudgeProfileRecord = TaskNudgeProfile;

type NudgeEventRecord = NudgeEvent;

const defaultPreferences: UserNudgePreferences = {
  defaultStrategy: "gentle",
  frequencyMin: 30,
  escalationEnabled: true,
  soundEnabled: true
};

function normalizeProfile(userId: string, taskId: string, input: Partial<TaskNudgeProfileRecord>): TaskNudgeProfileRecord {
  return {
    userId,
    taskId,
    resistance: input.resistance,
    urgency: input.urgency,
    estimateMinutes: input.estimateMinutes,
    nudgeStrategy: input.nudgeStrategy,
    nudgeFrequencyMin: input.nudgeFrequencyMin,
    nudgeEscalation: input.nudgeEscalation,
    snoozedUntil: input.snoozedUntil ?? null,
    timesPostponed: input.timesPostponed ?? 0,
    timesNudged: input.timesNudged ?? 0,
    lastNudgedAt: input.lastNudgedAt ?? null,
    activeEventId: input.activeEventId ?? null,
    lastAction: input.lastAction
  };
}

@Injectable()
export class NudgesDao {
  private readonly preferences = new Map<string, UserNudgePreferences>();
  private readonly taskProfiles = new Map<string, TaskNudgeProfileRecord>();
  private readonly events = new Map<string, NudgeEventRecord>();

  getUserPreferences(userId: string): UserNudgePreferences {
    return this.preferences.get(userId) ?? defaultPreferences;
  }

  upsertUserPreferences(userId: string, input: Partial<UserNudgePreferences>): UserNudgePreferences {
    const current = this.getUserPreferences(userId);
    const next = {
      ...current,
      ...input
    };
    this.preferences.set(userId, next);
    return next;
  }

  findTaskProfile(userId: string, taskId: string): TaskNudgeProfileRecord | undefined {
    const profile = this.taskProfiles.get(taskId);
    if (!profile || profile.userId !== userId) {
      return undefined;
    }
    return profile;
  }

  getTaskProfile(userId: string, taskId: string): TaskNudgeProfileRecord {
    const profile = this.findTaskProfile(userId, taskId);
    if (!profile) {
      notFound("Nudge profile for task", taskId);
    }
    return profile;
  }

  ensureTaskProfile(userId: string, taskId: string): TaskNudgeProfileRecord {
    return this.findTaskProfile(userId, taskId) ?? this.upsertTaskProfile(userId, taskId, {});
  }

  upsertTaskProfile(
    userId: string,
    taskId: string,
    input: Partial<TaskNudgeProfileRecord>
  ): TaskNudgeProfileRecord {
    const current = this.findTaskProfile(userId, taskId);
    const next = normalizeProfile(userId, taskId, {
      ...current,
      ...input
    });
    this.taskProfiles.set(taskId, next);
    return next;
  }

  updateTaskProfile(
    userId: string,
    taskId: string,
    input: Partial<TaskNudgeProfileRecord>
  ): TaskNudgeProfileRecord {
    const current = this.getTaskProfile(userId, taskId);
    return this.upsertTaskProfile(userId, taskId, {
      ...current,
      ...input
    });
  }

  listTaskProfiles(userId: string): TaskNudgeProfileRecord[] {
    return [...this.taskProfiles.values()].filter((profile) => profile.userId === userId);
  }

  createEvent(input: Omit<NudgeEventRecord, "id">): NudgeEventRecord {
    const event: NudgeEventRecord = {
      id: newId("nudge"),
      ...input
    };

    this.events.set(event.id, event);
    return event;
  }

  updateEvent(
    userId: string,
    eventId: string,
    input: Partial<NudgeEventRecord>
  ): NudgeEventRecord {
    const current = this.getEventById(userId, eventId);
    const next = {
      ...current,
      ...input
    };
    this.events.set(eventId, next);
    return next;
  }

  getEventById(userId: string, eventId: string): NudgeEventRecord {
    const event = this.events.get(eventId);
    if (!event || event.userId !== userId) {
      notFound("Nudge event", eventId);
    }
    return event;
  }

  findActiveEventByTask(userId: string, taskId: string): NudgeEventRecord | undefined {
    return [...this.events.values()].find(
      (event) => event.userId === userId && event.taskId === taskId && event.state === "delivered"
    );
  }

  listEvents(userId: string, taskId?: string): NudgeEventRecord[] {
    return [...this.events.values()]
      .filter((event) => event.userId === userId && (taskId ? event.taskId === taskId : true))
      .sort((left, right) => {
        if (left.deliveredAt !== right.deliveredAt) {
          return left.deliveredAt.localeCompare(right.deliveredAt);
        }
        return left.id.localeCompare(right.id);
      });
  }

}
