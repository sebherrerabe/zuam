import { randomUUID } from "node:crypto";

import { BadRequestException, Injectable } from "@nestjs/common";

import type { GoogleTasksRemoteList, GoogleTasksRemoteTask } from "./types";

type ProviderUserState = {
  connected: boolean;
  webhookToken: string;
  lists: GoogleTasksRemoteList[];
  tasksByListId: Map<string, GoogleTasksRemoteTask[]>;
  lastSyncCalls: number;
  lastWriteCount: number;
  failNextSyncMessage: string | null;
};

@Injectable()
export class FakeGoogleTasksProviderClient {
  private readonly users = new Map<string, ProviderUserState>();

  connect(userId: string) {
    const state = this.ensureUser(userId);
    state.connected = true;
    return { userId, webhookToken: state.webhookToken };
  }

  disconnect(userId: string) {
    this.ensureUser(userId).connected = false;
  }

  isConnected(userId: string) {
    return this.ensureUser(userId).connected;
  }

  getWebhookToken(userId: string) {
    return this.ensureUser(userId).webhookToken;
  }

  seedRemoteState(
    userId: string,
    input: {
      lists?: GoogleTasksRemoteList[];
      tasks?: GoogleTasksRemoteTask[];
    } = {}
  ) {
    const state = this.ensureUser(userId);
    if (input.lists) {
      state.lists = input.lists.map((list) => ({ ...list }));
    }
    if (input.tasks) {
      state.tasksByListId = new Map();
      for (const task of input.tasks) {
        const bucket = state.tasksByListId.get(task.listId) ?? [];
        bucket.push({ ...task });
        state.tasksByListId.set(task.listId, bucket);
      }
    }
  }

  failNextSync(userId: string, message = "Provider unavailable") {
    this.ensureUser(userId).failNextSyncMessage = message;
  }

  getCounters(userId: string) {
    const state = this.ensureUser(userId);
    return {
      lastSyncCalls: state.lastSyncCalls,
      lastWriteCount: state.lastWriteCount
    };
  }

  listTaskLists(userId: string, input: { updatedMin?: string | null; maxResults?: number } = {}) {
    this.assertCanSync(userId);
    this.maybeFailSync(userId);

    const state = this.ensureUser(userId);
    state.lastSyncCalls += 1;

    return state.lists
      .filter((list) => this.isFresh(list.updatedAt, input.updatedMin))
      .slice(0, input.maxResults ?? state.lists.length)
      .map((list) => ({ ...list }));
  }

  listTasks(
    userId: string,
    listId: string,
    input: {
      updatedMin?: string | null;
      maxResults?: number;
      showCompleted?: boolean;
      showDeleted?: boolean;
      showHidden?: boolean;
      showAssigned?: boolean;
    }
  ) {
    this.assertCanSync(userId);
    this.maybeFailSync(userId);

    if (
      input.showCompleted !== true ||
      input.showDeleted !== true ||
      input.showHidden !== true ||
      input.showAssigned !== true
    ) {
      throw new BadRequestException("Google Tasks list query flags must be explicit");
    }

    const state = this.ensureUser(userId);
    state.lastSyncCalls += 1;

    return (state.tasksByListId.get(listId) ?? [])
      .filter((task) => this.isFresh(task.updatedAt, input.updatedMin))
      .slice(0, input.maxResults ?? 100)
      .map((task) => ({ ...task }));
  }

  upsertTaskList(
    userId: string,
    input: { id?: string; title: string; updatedAt?: string; isDeleted?: boolean }
  ): GoogleTasksRemoteList {
    const state = this.ensureUser(userId);
    const now = input.updatedAt ?? new Date().toISOString();
    const existing = input.id ? state.lists.find((list) => list.id === input.id) ?? null : null;
    const next: GoogleTasksRemoteList = existing
      ? {
          ...existing,
          title: input.title,
          isDeleted: input.isDeleted ?? existing.isDeleted,
          updatedAt: now
        }
      : {
          id: input.id ?? `glist_${randomUUID()}`,
          title: input.title,
          updatedAt: now,
          isDeleted: input.isDeleted ?? false
        };

    if (existing) {
      state.lists = state.lists.map((list) => (list.id === next.id ? next : list));
    } else {
      state.lists.push(next);
    }

    state.lastWriteCount += 1;
    return { ...next };
  }

  deleteTaskList(userId: string, id: string) {
    return this.upsertTaskList(userId, {
      id,
      title: this.getTaskListTitle(userId, id),
      isDeleted: true
    });
  }

  upsertTask(
    userId: string,
    input: {
      id?: string;
      listId: string;
      title: string;
      notes: string | null;
      dueDate: string | null;
      completed: boolean;
      completedAt: string | null;
      parentTaskId: string | null;
      updatedAt?: string;
      isDeleted?: boolean;
    }
  ): GoogleTasksRemoteTask {
    const state = this.ensureUser(userId);
    const now = input.updatedAt ?? new Date().toISOString();
    const bucket = state.tasksByListId.get(input.listId) ?? [];
    const existing = input.id ? bucket.find((task) => task.id === input.id) ?? null : null;
    const next: GoogleTasksRemoteTask = existing
      ? {
          ...existing,
          listId: input.listId,
          title: input.title,
          notes: input.notes,
          dueDate: input.dueDate,
          completed: input.completed,
          completedAt: input.completedAt,
          parentTaskId: input.parentTaskId,
          isDeleted: input.isDeleted ?? existing.isDeleted,
          updatedAt: now
        }
      : {
          id: input.id ?? `gtask_${randomUUID()}`,
          listId: input.listId,
          title: input.title,
          notes: input.notes,
          dueDate: input.dueDate,
          completed: input.completed,
          completedAt: input.completedAt,
          parentTaskId: input.parentTaskId,
          updatedAt: now,
          isDeleted: input.isDeleted ?? false
        };

    const nextBucket = existing ? bucket.map((task) => (task.id === next.id ? next : task)) : [...bucket, next];
    state.tasksByListId.set(input.listId, nextBucket);
    state.lastWriteCount += 1;
    return { ...next };
  }

  deleteTask(userId: string, listId: string, id: string) {
    const state = this.ensureUser(userId);
    const bucket = state.tasksByListId.get(listId) ?? [];
    const existing = bucket.find((task) => task.id === id);
    if (!existing) {
      return null;
    }

    return this.upsertTask(userId, {
      id,
      listId,
      title: existing.title,
      notes: existing.notes,
      dueDate: existing.dueDate,
      completed: existing.completed,
      completedAt: existing.completedAt,
      parentTaskId: existing.parentTaskId,
      isDeleted: true
    });
  }

  getRemoteState(userId: string) {
    const state = this.ensureUser(userId);
    return {
      connected: state.connected,
      lists: state.lists.map((list) => ({ ...list })),
      tasksByListId: new Map(
        [...state.tasksByListId.entries()].map(([listId, tasks]) => [listId, tasks.map((task) => ({ ...task }))])
      )
    };
  }

  private ensureUser(userId: string): ProviderUserState {
    let state = this.users.get(userId);
    if (!state) {
      state = {
        connected: false,
        webhookToken: `webhook_${randomUUID()}`,
        lists: [],
        tasksByListId: new Map(),
        lastSyncCalls: 0,
        lastWriteCount: 0,
        failNextSyncMessage: null
      };
      this.users.set(userId, state);
    }
    return state;
  }

  private assertCanSync(userId: string) {
    if (!this.ensureUser(userId).connected) {
      throw new BadRequestException("Google Tasks token not connected");
    }
  }

  private maybeFailSync(userId: string) {
    const state = this.ensureUser(userId);
    if (state.failNextSyncMessage) {
      const message = state.failNextSyncMessage;
      state.failNextSyncMessage = null;
      throw new BadRequestException(message);
    }
  }

  private isFresh(updatedAt: string, updatedMin?: string | null) {
    if (!updatedMin) {
      return true;
    }

    return new Date(updatedAt).getTime() >= new Date(updatedMin).getTime();
  }

  private getTaskListTitle(userId: string, id: string) {
    const list = this.ensureUser(userId).lists.find((entry) => entry.id === id);
    return list?.title ?? "Deleted list";
  }
}

