import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";

import type { ListDto, TaskDto } from "@zuam/shared/tasks";

import { CoreDataEventBus, CoreDataStore } from "../core-data-store";
import { maxSortOrder, nowIso, newId } from "../core-data-utils";
import type {
  GoogleTasksRemoteList,
  GoogleTasksRemoteTask,
  GoogleTasksSyncScope,
  GoogleTasksSyncState
} from "./types";

type SyncUserRecord = {
  userId: string;
  googleTasksCursor: string | null;
  googleTasksLastSyncAt: string | null;
  googleTasksStatus: GoogleTasksSyncState["googleTasksStatus"];
  googleTasksLastError: string | null;
  googleTasksLastSyncId: string | null;
  googleTasksLastRequestedScope: GoogleTasksSyncScope | null;
  googleTasksLastWebhookAt: string | null;
  remoteListIdByLocalId: Map<string, string>;
  localListIdByRemoteId: Map<string, string>;
  remoteTaskIdByLocalId: Map<string, string>;
  localTaskIdByRemoteId: Map<string, string>;
  remoteListUpdatedAtById: Map<string, string>;
  remoteTaskUpdatedAtById: Map<string, string>;
};

type MergeResult = {
  changed: boolean;
  localId: string;
};

@Injectable()
export class GoogleTasksSyncDao {
  private readonly users = new Map<string, SyncUserRecord>();

  constructor(
    private readonly store: CoreDataStore,
    private readonly events: CoreDataEventBus
  ) {}

  getStatus(userId: string): GoogleTasksSyncState {
    const state = this.ensureUser(userId);
    return {
      userId: state.userId,
      googleTasksCursor: state.googleTasksCursor,
      googleTasksLastSyncAt: state.googleTasksLastSyncAt,
      googleTasksStatus: state.googleTasksStatus,
      googleTasksLastError: state.googleTasksLastError,
      googleTasksLastSyncId: state.googleTasksLastSyncId,
      googleTasksLastRequestedScope: state.googleTasksLastRequestedScope,
      googleTasksLastWebhookAt: state.googleTasksLastWebhookAt
    };
  }

  beginSync(userId: string, scope: GoogleTasksSyncScope) {
    const state = this.ensureUser(userId);
    if (state.googleTasksStatus === "syncing") {
      throw new Error("Google Tasks sync is already running");
    }

    const syncId = `sync_${randomUUID()}`;
    state.googleTasksStatus = "syncing";
    state.googleTasksLastSyncId = syncId;
    state.googleTasksLastRequestedScope = scope;
    state.googleTasksLastError = null;

    return { syncId };
  }

  completeSync(userId: string, input: { syncId: string; scope: GoogleTasksSyncScope; cursor: string | null }) {
    const state = this.ensureUser(userId);
    state.googleTasksStatus = "ready";
    state.googleTasksLastSyncAt = nowIso();
    state.googleTasksCursor = input.cursor ?? state.googleTasksCursor;
    state.googleTasksLastSyncId = input.syncId;
    state.googleTasksLastRequestedScope = input.scope;
    state.googleTasksLastError = null;
  }

  failSync(userId: string, input: { syncId: string; scope: GoogleTasksSyncScope; error: string }) {
    const state = this.ensureUser(userId);
    state.googleTasksStatus = "failed";
    state.googleTasksLastSyncId = input.syncId;
    state.googleTasksLastRequestedScope = input.scope;
    state.googleTasksLastError = input.error;
  }

  markWebhookSignal(userId: string) {
    const state = this.ensureUser(userId);
    state.googleTasksLastWebhookAt = nowIso();
  }

  getKnownRemoteListIds(userId: string) {
    return [...this.ensureUser(userId).localListIdByRemoteId.keys()];
  }

  getKnownRemoteTaskIds(userId: string) {
    return [...this.ensureUser(userId).localTaskIdByRemoteId.keys()];
  }

  resolveLocalListId(userId: string, remoteListId: string) {
    return this.ensureUser(userId).localListIdByRemoteId.get(remoteListId) ?? null;
  }

  resolveLocalTaskId(userId: string, remoteTaskId: string) {
    return this.ensureUser(userId).localTaskIdByRemoteId.get(remoteTaskId) ?? null;
  }

  rememberRemoteListVersion(userId: string, remoteId: string, updatedAt: string) {
    this.ensureUser(userId).remoteListUpdatedAtById.set(remoteId, updatedAt);
  }

  rememberRemoteTaskVersion(userId: string, remoteId: string, updatedAt: string) {
    this.ensureUser(userId).remoteTaskUpdatedAtById.set(remoteId, updatedAt);
  }

  getRemoteListVersion(userId: string, remoteId: string) {
    return this.ensureUser(userId).remoteListUpdatedAtById.get(remoteId) ?? null;
  }

  getRemoteTaskVersion(userId: string, remoteId: string) {
    return this.ensureUser(userId).remoteTaskUpdatedAtById.get(remoteId) ?? null;
  }

  linkList(userId: string, remoteListId: string, localListId: string) {
    const state = this.ensureUser(userId);
    state.localListIdByRemoteId.set(remoteListId, localListId);
    state.remoteListIdByLocalId.set(localListId, remoteListId);
  }

  linkTask(userId: string, remoteTaskId: string, localTaskId: string) {
    const state = this.ensureUser(userId);
    state.localTaskIdByRemoteId.set(remoteTaskId, localTaskId);
    state.remoteTaskIdByLocalId.set(localTaskId, remoteTaskId);
  }

  upsertLocalListFromRemote(userId: string, remote: GoogleTasksRemoteList): MergeResult {
    const state = this.ensureUser(userId);
    const localId = state.localListIdByRemoteId.get(remote.id) ?? newId("list");
    const current = this.store.lists.get(localId) ?? null;
    const shouldCreate = !current;
    const next: ListDto = current
      ? {
          ...current,
          name: remote.title,
          isDeleted: remote.isDeleted,
          updatedAt: nowIso()
        }
      : {
          id: localId,
          userId,
          name: remote.title,
          color: null,
          icon: null,
          sortOrder: maxSortOrder(this.listItemsForUser(userId)) + 1,
          isDeleted: remote.isDeleted,
          createdAt: nowIso(),
          updatedAt: nowIso()
        };

    const changed = shouldCreate || current?.name !== next.name || current?.isDeleted !== next.isDeleted;

    if (!changed) {
      state.localListIdByRemoteId.set(remote.id, localId);
      state.remoteListIdByLocalId.set(localId, remote.id);
      state.remoteListUpdatedAtById.set(remote.id, remote.updatedAt);
      return { changed: false, localId };
    }

    this.store.lists.set(localId, next);
    this.linkList(userId, remote.id, localId);
    this.events.emitListUpdated(next);
    state.remoteListUpdatedAtById.set(remote.id, remote.updatedAt);
    return { changed: true, localId };
  }

  upsertLocalTaskFromRemote(
    userId: string,
    remote: GoogleTasksRemoteTask,
    input: { localListId: string; localParentTaskId: string | null }
  ): MergeResult {
    const state = this.ensureUser(userId);
    const localId = state.localTaskIdByRemoteId.get(remote.id) ?? newId("task");
    const current = this.store.tasks.get(localId) ?? null;
    const shouldCreate = !current;
    const next: TaskDto = current
      ? {
          ...current,
          listId: input.localListId,
          parentTaskId: input.localParentTaskId,
          title: remote.title,
          notes: remote.notes,
          dueDate: remote.dueDate,
          completed: remote.completed,
          completedAt: remote.completedAt,
          isDeleted: remote.isDeleted,
          updatedAt: nowIso()
        }
      : {
          id: localId,
          userId,
          listId: input.localListId,
          sectionId: null,
          parentTaskId: input.localParentTaskId,
          title: remote.title,
          notes: remote.notes,
          dueDate: remote.dueDate,
          completed: remote.completed,
          completedAt: remote.completedAt,
          sortOrder: maxSortOrder(this.taskItemsForUserAndList(userId, input.localListId)) + 1,
          isDeleted: remote.isDeleted,
          createdAt: nowIso(),
          updatedAt: nowIso()
        };

    const changed =
      shouldCreate ||
      current?.listId !== next.listId ||
      current?.parentTaskId !== next.parentTaskId ||
      current?.title !== next.title ||
      current?.notes !== next.notes ||
      current?.dueDate !== next.dueDate ||
      current?.completed !== next.completed ||
      current?.completedAt !== next.completedAt ||
      current?.isDeleted !== next.isDeleted;

    if (!changed) {
      state.localTaskIdByRemoteId.set(remote.id, localId);
      state.remoteTaskIdByLocalId.set(localId, remote.id);
      state.remoteTaskUpdatedAtById.set(remote.id, remote.updatedAt);
      return { changed: false, localId };
    }

    this.store.tasks.set(localId, next);
    this.linkTask(userId, remote.id, localId);

    if (shouldCreate) {
      this.events.emitTaskCreated(next);
    } else if (remote.isDeleted) {
      this.events.emitTaskDeleted(next);
    } else {
      this.events.emitTaskUpdated(next);
    }

    state.remoteTaskUpdatedAtById.set(remote.id, remote.updatedAt);
    return { changed: true, localId };
  }

  private ensureUser(userId: string): SyncUserRecord {
    let state = this.users.get(userId);
    if (!state) {
      state = {
        userId,
        googleTasksCursor: null,
        googleTasksLastSyncAt: null,
        googleTasksStatus: "idle",
        googleTasksLastError: null,
        googleTasksLastSyncId: null,
        googleTasksLastRequestedScope: null,
        googleTasksLastWebhookAt: null,
        remoteListIdByLocalId: new Map(),
        localListIdByRemoteId: new Map(),
        remoteTaskIdByLocalId: new Map(),
        localTaskIdByRemoteId: new Map(),
        remoteListUpdatedAtById: new Map(),
        remoteTaskUpdatedAtById: new Map()
      };
      this.users.set(userId, state);
    }
    return state;
  }

  private listItemsForUser(userId: string) {
    return [...this.store.lists.values()].filter((list) => list.userId === userId);
  }

  private taskItemsForUserAndList(userId: string, listId: string) {
    return [...this.store.tasks.values()].filter(
      (task) => task.userId === userId && task.listId === listId && !task.isDeleted
    );
  }
}

