import { Injectable } from "@nestjs/common";

import { newId, notFound } from "../core-data-utils";
import type { FocusSession, FocusSessionSnapshot, FocusTaskRollup } from "./types";

type StoredFocusState = {
  sessions: FocusSession[];
  currentSessionId: string | null;
  taskRollups: Map<string, FocusTaskRollup>;
};

@Injectable()
export class FocusSessionsDao {
  private readonly users = new Map<string, StoredFocusState>();

  listSessions(userId: string) {
    return [...this.ensureUser(userId).sessions].sort((left, right) => {
      if (left.startedAt !== right.startedAt) {
        return left.startedAt.localeCompare(right.startedAt);
      }
      return left.id.localeCompare(right.id);
    });
  }

  getCurrentSession(userId: string) {
    const state = this.ensureUser(userId);
    if (!state.currentSessionId) {
      return null;
    }

    return this.getSession(userId, state.currentSessionId);
  }

  getSession(userId: string, sessionId: string) {
    const session = this.ensureUser(userId).sessions.find((item) => item.id === sessionId) ?? null;
    if (!session) {
      notFound("Focus session", sessionId);
    }
    return session;
  }

  createSession(
    userId: string,
    input: {
      taskId: string;
      startedAt: string;
      durationMinutes: number;
      breakDurationMinutes: number;
    }
  ) {
    const state = this.ensureUser(userId);
    const session: FocusSession = {
      id: newId("focus"),
      userId,
      taskId: input.taskId,
      state: "running",
      startedAt: input.startedAt,
      endedAt: null,
      pausedAt: null,
      breakStartedAt: null,
      durationMinutes: input.durationMinutes,
      breakDurationMinutes: input.breakDurationMinutes,
      extraMinutes: 0,
      loggedMinutes: 0,
      workMinutes: 0,
      breakMinutes: 0,
      lastTransitionAt: input.startedAt
    };

    state.sessions.push(session);
    state.currentSessionId = session.id;
    return session;
  }

  updateSession(
    userId: string,
    sessionId: string,
    updater: (session: FocusSession) => FocusSession
  ) {
    const state = this.ensureUser(userId);
    const index = state.sessions.findIndex((item) => item.id === sessionId);
    if (index === -1) {
      notFound("Focus session", sessionId);
    }

    const next = updater(state.sessions[index]!);
    state.sessions[index] = next;
    return next;
  }

  completeSession(
    userId: string,
    sessionId: string,
    input: {
      endedAt: string;
      workMinutes: number;
      breakMinutes: number;
    }
  ) {
    const state = this.ensureUser(userId);
    const session = this.getSession(userId, sessionId);
    const next: FocusSession = {
      ...session,
      state: "completed",
      endedAt: input.endedAt,
      pausedAt: null,
      breakStartedAt: null,
      workMinutes: input.workMinutes,
      breakMinutes: input.breakMinutes,
      loggedMinutes: input.workMinutes,
      extraMinutes: Math.max(0, input.workMinutes - session.durationMinutes),
      lastTransitionAt: input.endedAt
    };

    state.sessions = state.sessions.map((item) => (item.id === sessionId ? next : item));
    state.currentSessionId = null;
    return next;
  }

  markCurrentSession(userId: string, sessionId: string | null) {
    this.ensureUser(userId).currentSessionId = sessionId;
  }

  upsertTaskRollup(
    userId: string,
    input: {
      session: FocusSession;
    }
  ) {
    const state = this.ensureUser(userId);
    const current = state.taskRollups.get(input.session.taskId) ?? {
      taskId: input.session.taskId,
      totalFocusMinutes: 0,
      extraMinutes: 0,
      sessionCount: 0,
      lastSessionId: null,
      lastEndedAt: null
    };

    const next: FocusTaskRollup = {
      taskId: input.session.taskId,
      totalFocusMinutes: current.totalFocusMinutes + input.session.loggedMinutes,
      extraMinutes: current.extraMinutes + input.session.extraMinutes,
      sessionCount: current.sessionCount + 1,
      lastSessionId: input.session.id,
      lastEndedAt: input.session.endedAt
    };

    state.taskRollups.set(input.session.taskId, next);
    return next;
  }

  getTaskRollup(userId: string, taskId: string) {
    return this.ensureUser(userId).taskRollups.get(taskId) ?? null;
  }

  listTaskRollups(userId: string) {
    return [...this.ensureUser(userId).taskRollups.values()].sort((left, right) =>
      left.taskId.localeCompare(right.taskId)
    );
  }

  buildSnapshot(userId: string): FocusSessionSnapshot {
    const currentSession = this.getCurrentSession(userId);
    return {
      runtimeState: currentSession?.state ?? "idle",
      currentSession,
      sessions: this.listSessions(userId),
      taskRollups: this.listTaskRollups(userId)
    };
  }

  private ensureUser(userId: string) {
    let state = this.users.get(userId);
    if (!state) {
      state = {
        sessions: [],
        currentSessionId: null,
        taskRollups: new Map()
      };
      this.users.set(userId, state);
    }
    return state;
  }
}
