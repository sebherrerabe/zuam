import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable
} from "@nestjs/common";
import { EventEmitter } from "node:events";

import type { ListDto, TaskDto } from "@zuam/shared/tasks";

import { CoreDataEventBus } from "../core-data-store";
import { GoogleTasksSyncDao } from "./dao";
import { FakeGoogleTasksProviderClient } from "./provider";
import type {
  GoogleTasksRemoteList,
  GoogleTasksRemoteTask,
  GoogleTasksSyncScope,
  GoogleTasksSyncState,
  GoogleTasksWebhookSignal
} from "./types";

const LOOKBACK_MS = 60_000;

type SyncEventPayload = {
  userId: string;
  scope: GoogleTasksSyncScope;
  syncId: string;
  affectedEntityIds: string[];
};

@Injectable()
export class GoogleTasksSyncEventBus extends EventEmitter {
  emitSyncStarted(event: SyncEventPayload) {
    this.emit("sync:started", event);
  }

  emitSyncCompleted(event: SyncEventPayload) {
    this.emit("sync:completed", event);
  }

  emitSyncFailed(event: SyncEventPayload & { error: string }) {
    this.emit("sync:failed", event);
  }
}

@Injectable()
export class GoogleTasksSyncService {
  private readonly syncingUsers = new Set<string>();

  constructor(
    private readonly dao: GoogleTasksSyncDao,
    private readonly provider: FakeGoogleTasksProviderClient,
    private readonly coreEvents: CoreDataEventBus,
    private readonly syncEvents: GoogleTasksSyncEventBus
  ) {
    this.coreEvents.on("list:updated", (list) => this.handleLocalListEvent(list));
    this.coreEvents.on("task:created", (task) => this.handleLocalTaskEvent(task));
    this.coreEvents.on("task:updated", (task) => this.handleLocalTaskEvent(task));
    this.coreEvents.on("task:deleted", (task) => this.handleLocalTaskEvent(task));
  }

  getStatus(userId: string): Pick<
    GoogleTasksSyncState,
    "googleTasksCursor" | "googleTasksLastSyncAt" | "googleTasksStatus" | "googleTasksLastError"
  > {
    const state = this.dao.getStatus(userId);
    return {
      googleTasksCursor: state.googleTasksCursor,
      googleTasksLastSyncAt: state.googleTasksLastSyncAt,
      googleTasksStatus: state.googleTasksStatus,
      googleTasksLastError: state.googleTasksLastError
    };
  }

  forceSync(userId: string, input: { scope?: GoogleTasksSyncScope } = {}) {
    const scope = input.scope ?? "incremental";
    if (!this.provider.isConnected(userId)) {
      throw new ForbiddenException("Google Tasks token not connected");
    }

    if (this.dao.getStatus(userId).googleTasksStatus === "syncing") {
      throw new ConflictException("Google Tasks sync is already running");
    }

    const { syncId } = this.dao.beginSync(userId, scope);
    const affectedEntityIds: string[] = [];

    this.syncEvents.emitSyncStarted({
      userId,
      scope,
      syncId,
      affectedEntityIds
    });

    try {
      this.syncingUsers.add(userId);
      const cursor = this.runSync(userId, scope, affectedEntityIds);
      this.dao.completeSync(userId, { syncId, scope, cursor });
      this.syncEvents.emitSyncCompleted({
        userId,
        scope,
        syncId,
        affectedEntityIds
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Google Tasks sync failed";
      this.dao.failSync(userId, { syncId, scope, error: message });
      this.syncEvents.emitSyncFailed({
        userId,
        scope,
        syncId,
        affectedEntityIds,
        error: message
      });
    } finally {
      this.syncingUsers.delete(userId);
    }

    return { started: true, syncId };
  }

  handleWebhook(input: GoogleTasksWebhookSignal) {
    const userId = input.userId?.trim();
    const token = input.token?.trim();

    if (!userId || !token) {
      throw new BadRequestException("Invalid Google Tasks webhook payload");
    }

    if (this.provider.getWebhookToken(userId) !== token) {
      throw new BadRequestException("Invalid Google Tasks webhook signature");
    }

    this.dao.markWebhookSignal(userId);
    this.forceSync(userId, { scope: input.scope ?? "incremental" });
  }

  private runSync(userId: string, scope: GoogleTasksSyncScope, affectedEntityIds: string[]) {
    const state = this.dao.getStatus(userId);
    const cursor =
      scope === "full" || !state.googleTasksCursor ? null : this.safeLookbackCursor(state.googleTasksCursor);

    const remoteLists =
      scope === "full"
        ? this.provider.listTaskLists(userId, { maxResults: 1000 })
        : this.provider.listTaskLists(userId, { updatedMin: cursor, maxResults: 1000 });

    const remoteListsById = new Map<string, GoogleTasksRemoteList>();
    for (const remoteList of remoteLists) {
      if (this.shouldSkipListVersion(userId, remoteList)) {
        continue;
      }
      remoteListsById.set(remoteList.id, remoteList);
      const result = this.dao.upsertLocalListFromRemote(userId, remoteList);
      if (result.changed) {
        affectedEntityIds.push(result.localId);
      }
    }

    const knownRemoteListIds = new Set([
      ...this.dao.getKnownRemoteListIds(userId),
      ...remoteLists.map((list) => list.id)
    ]);

    const processedTaskVersions = new Set<string>();
    let maxCursor = state.googleTasksCursor;

    for (const remoteListId of knownRemoteListIds) {
      const remoteTasks = this.provider.listTasks(userId, remoteListId, {
        updatedMin: cursor,
        maxResults: 100,
        showCompleted: true,
        showDeleted: true,
        showHidden: true,
        showAssigned: true
      });

      for (const remoteTask of this.sortRemoteTasks(remoteTasks)) {
        const versionKey = `${remoteTask.id}:${remoteTask.updatedAt}`;
        if (processedTaskVersions.has(versionKey)) {
          continue;
        }
        processedTaskVersions.add(versionKey);

        if (this.shouldSkipTaskVersion(userId, remoteTask)) {
          continue;
        }

        const localListId = this.dao.resolveLocalListId(userId, remoteTask.listId);
        if (!localListId) {
          continue;
        }

        const localParentTaskId = remoteTask.parentTaskId
          ? this.dao.resolveLocalTaskId(userId, remoteTask.parentTaskId)
          : null;

        const result = this.dao.upsertLocalTaskFromRemote(userId, remoteTask, {
          localListId,
          localParentTaskId
        });
        if (result.changed) {
          affectedEntityIds.push(result.localId);
        }

        if (!maxCursor || new Date(remoteTask.updatedAt).getTime() > new Date(maxCursor).getTime()) {
          maxCursor = remoteTask.updatedAt;
        }
      }
    }

    for (const remoteList of remoteListsById.values()) {
      if (!maxCursor || new Date(remoteList.updatedAt).getTime() > new Date(maxCursor).getTime()) {
        maxCursor = remoteList.updatedAt;
      }
    }

    return maxCursor;
  }

  private handleLocalListEvent(list: ListDto) {
    if (this.syncingUsers.has(list.userId) || !this.provider.isConnected(list.userId)) {
      return;
    }

    try {
      const remoteListId = this.dao.resolveLocalListId(list.userId, list.id);
      if (list.isDeleted) {
        if (!remoteListId) {
          return;
        }
        const remote = this.provider.deleteTaskList(list.userId, remoteListId);
        if (remote) {
          this.dao.rememberRemoteListVersion(list.userId, remote.id, remote.updatedAt);
        }
        return;
      }

      const remote = this.provider.upsertTaskList(list.userId, {
        id: remoteListId ?? undefined,
        title: list.name
      });
      this.dao.linkList(list.userId, remote.id, list.id);
      this.dao.rememberRemoteListVersion(list.userId, remote.id, remote.updatedAt);
    } catch (error) {
      this.dao.failSync(list.userId, {
        syncId: this.dao.getStatus(list.userId).googleTasksLastSyncId ?? `sync_${Date.now()}`,
        scope: "incremental",
        error: error instanceof Error ? error.message : "Google Tasks push failed"
      });
    }
  }

  private handleLocalTaskEvent(task: TaskDto) {
    if (this.syncingUsers.has(task.userId) || !this.provider.isConnected(task.userId)) {
      return;
    }

    try {
      const remoteListId = this.dao.resolveLocalListId(task.userId, task.listId);
      if (!remoteListId) {
        return;
      }

      const remoteTaskId = this.dao.resolveLocalTaskId(task.userId, task.id);
      if (task.isDeleted) {
        if (!remoteTaskId) {
          return;
        }
        const remote = this.provider.deleteTask(task.userId, remoteListId, remoteTaskId);
        if (remote) {
          this.dao.rememberRemoteTaskVersion(task.userId, remote.id, remote.updatedAt);
        }
        return;
      }

      const remote = this.provider.upsertTask(task.userId, {
        id: remoteTaskId ?? undefined,
        listId: remoteListId,
        title: task.title,
        notes: task.notes,
        dueDate: task.dueDate,
        completed: task.completed,
        completedAt: task.completedAt,
        parentTaskId: task.parentTaskId ? this.dao.resolveLocalTaskId(task.userId, task.parentTaskId) : null
      });

      this.dao.linkTask(task.userId, remote.id, task.id);
      this.dao.rememberRemoteTaskVersion(task.userId, remote.id, remote.updatedAt);
    } catch (error) {
      this.dao.failSync(task.userId, {
        syncId: this.dao.getStatus(task.userId).googleTasksLastSyncId ?? `sync_${Date.now()}`,
        scope: "incremental",
        error: error instanceof Error ? error.message : "Google Tasks push failed"
      });
    }
  }

  private safeLookbackCursor(cursor: string) {
    return new Date(new Date(cursor).getTime() - LOOKBACK_MS).toISOString();
  }

  private shouldSkipListVersion(userId: string, remoteList: GoogleTasksRemoteList) {
    const lastSeen = this.dao.getRemoteListVersion(userId, remoteList.id);
    return lastSeen !== null && new Date(remoteList.updatedAt).getTime() <= new Date(lastSeen).getTime();
  }

  private shouldSkipTaskVersion(userId: string, remoteTask: GoogleTasksRemoteTask) {
    const lastSeen = this.dao.getRemoteTaskVersion(userId, remoteTask.id);
    return lastSeen !== null && new Date(remoteTask.updatedAt).getTime() <= new Date(lastSeen).getTime();
  }

  private sortRemoteTasks(remoteTasks: GoogleTasksRemoteTask[]) {
    return [...remoteTasks].sort((left, right) => {
      if (left.updatedAt !== right.updatedAt) {
        return left.updatedAt.localeCompare(right.updatedAt);
      }
      return left.id.localeCompare(right.id);
    });
  }
}

