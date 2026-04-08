import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";

import { TasksDao } from "../tasks/dao";
import { FocusSessionsDao } from "./dao";
import { FocusSessionsEventBus } from "./events";
import {
  startFocusSessionInputSchema,
  transitionFocusSessionInputSchema
} from "./dto";
import type { FocusSession, FocusSessionSnapshot } from "./types";

@Injectable()
export class FocusSessionsService {
  constructor(
    private readonly tasksDao: TasksDao,
    private readonly focusSessionsDao: FocusSessionsDao,
    private readonly eventBus: FocusSessionsEventBus
  ) {}

  listSessions(userId: string) {
    return this.focusSessionsDao.listSessions(userId);
  }

  getSnapshot(userId: string): FocusSessionSnapshot {
    return this.focusSessionsDao.buildSnapshot(userId);
  }

  startSession(userId: string, input: unknown) {
    const parsed = startFocusSessionInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException("Invalid focus session payload");
    }

    this.tasksDao.getById(userId, parsed.data.taskId);
    const active = this.focusSessionsDao.getCurrentSession(userId);

    if (active) {
      if (
        active.taskId === parsed.data.taskId &&
        active.state === "running" &&
        active.durationMinutes === parsed.data.durationMinutes &&
        active.breakDurationMinutes === parsed.data.breakDurationMinutes
      ) {
        return active;
      }

      throw new ConflictException("A focus session is already active for this user");
    }

    const session = this.focusSessionsDao.createSession(userId, {
      taskId: parsed.data.taskId,
      startedAt: parsed.data.startedAt ?? new Date().toISOString(),
      durationMinutes: parsed.data.durationMinutes,
      breakDurationMinutes: parsed.data.breakDurationMinutes
    });

    this.eventBus.emitStarted(session);
    this.eventBus.emitSync(this.focusSessionsDao.buildSnapshot(userId));
    return session;
  }

  pauseSession(userId: string, sessionId: string, input: unknown = {}) {
    const parsed = transitionFocusSessionInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException("Invalid focus session payload");
    }

    const session = this.focusSessionsDao.getSession(userId, sessionId);
    this.assertActiveSession(session, "running");
    const at = parsed.data.at ?? new Date().toISOString();
    const next = this.rollForward(session, at, "paused");
    const normalized: FocusSession = {
      ...next,
      pausedAt: at,
      breakStartedAt: null,
      lastTransitionAt: at
    };

    this.focusSessionsDao.updateSession(userId, sessionId, () => normalized);
    this.focusSessionsDao.markCurrentSession(userId, sessionId);
    this.eventBus.emitPaused(normalized);
    this.eventBus.emitSync(this.focusSessionsDao.buildSnapshot(userId));
    return normalized;
  }

  startBreak(userId: string, sessionId: string, input: unknown = {}) {
    const parsed = transitionFocusSessionInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException("Invalid focus session payload");
    }

    const session = this.focusSessionsDao.getSession(userId, sessionId);
    if (session.state !== "running" && session.state !== "paused") {
      throw new BadRequestException("Focus session must be running or paused to enter break");
    }

    const at = parsed.data.at ?? new Date().toISOString();
    const next = this.rollForward(session, at, "break");
    const normalized: FocusSession = {
      ...next,
      pausedAt: next.pausedAt ?? at,
      breakStartedAt: at,
      lastTransitionAt: at
    };

    this.focusSessionsDao.updateSession(userId, sessionId, () => normalized);
    this.eventBus.emitBreakStarted(normalized);
    this.eventBus.emitSync(this.focusSessionsDao.buildSnapshot(userId));
    return normalized;
  }

  endBreak(userId: string, sessionId: string, input: unknown = {}) {
    const parsed = transitionFocusSessionInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException("Invalid focus session payload");
    }

    const session = this.focusSessionsDao.getSession(userId, sessionId);
    this.assertActiveSession(session, "break");
    const at = parsed.data.at ?? new Date().toISOString();
    const next = this.rollForward(session, at, "running");
    const normalized: FocusSession = {
      ...next,
      pausedAt: null,
      breakStartedAt: null,
      lastTransitionAt: at
    };

    this.focusSessionsDao.updateSession(userId, sessionId, () => normalized);
    this.eventBus.emitBreakEnded(normalized);
    this.eventBus.emitSync(this.focusSessionsDao.buildSnapshot(userId));
    return normalized;
  }

  endSession(userId: string, sessionId: string, input: unknown = {}) {
    const parsed = transitionFocusSessionInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException("Invalid focus session payload");
    }

    const session = this.focusSessionsDao.getSession(userId, sessionId);
    if (session.state === "completed") {
      return session;
    }

    if (session.state === "break" || session.state === "running" || session.state === "paused") {
      const at = parsed.data.at ?? new Date().toISOString();
      const rolled = this.rollForward(session, at, session.state === "break" ? "break" : "running");
      const completed = this.focusSessionsDao.completeSession(userId, sessionId, {
        endedAt: at,
        workMinutes: rolled.workMinutes,
        breakMinutes: rolled.breakMinutes
      });
      const rollup = this.focusSessionsDao.upsertTaskRollup(userId, { session: completed });
      this.eventBus.emitEnded(completed);
      this.eventBus.emitSync(this.focusSessionsDao.buildSnapshot(userId));
      return { session: completed, taskRollup: rollup };
    }

    throw new BadRequestException("Focus session is not active");
  }

  syncSession(userId: string) {
    const snapshot = this.focusSessionsDao.buildSnapshot(userId);
    if (snapshot.currentSession) {
      this.eventBus.emitTick(snapshot.currentSession);
    }
    this.eventBus.emitSync(snapshot);
    return snapshot;
  }

  private rollForward(session: FocusSession, at: string, nextState: "running" | "paused" | "break") {
    const currentAt = new Date(session.lastTransitionAt);
    const nextAt = new Date(at);
    if (Number.isNaN(currentAt.getTime()) || Number.isNaN(nextAt.getTime())) {
      throw new BadRequestException("Focus timestamps must be valid ISO strings");
    }

    const deltaMinutes = Math.max(0, Math.round((nextAt.getTime() - currentAt.getTime()) / 60_000));
    let workMinutes = session.workMinutes;
    let breakMinutes = session.breakMinutes;

    if (session.state === "running") {
      workMinutes += deltaMinutes;
    } else if (session.state === "break") {
      breakMinutes += deltaMinutes;
    }

    const next: FocusSession = {
      ...session,
      state: nextState,
      workMinutes,
      breakMinutes,
      loggedMinutes: workMinutes,
      extraMinutes: Math.max(0, workMinutes - session.durationMinutes),
      lastTransitionAt: at
    };

    return next;
  }

  private assertActiveSession(session: FocusSession, expectedState: FocusSession["state"]) {
    if (session.state !== expectedState) {
      throw new BadRequestException(`Focus session must be ${expectedState}`);
    }
  }
}
