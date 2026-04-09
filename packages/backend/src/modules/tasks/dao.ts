import { Injectable } from "@nestjs/common";

import { CoreDataEventBus, CoreDataStore } from "../core-data-store";
import { badRequest, maxSortOrder, newId, notFound, nowIso, sortByOrder } from "../core-data-utils";
import { normalizeTagSlugs } from "./query";
import type { TaskRecord } from "./types";

@Injectable()
export class TasksDao {
  constructor(
    private readonly store: CoreDataStore,
    private readonly events: CoreDataEventBus
  ) {}

  list(userId: string, listId?: string): TaskRecord[] {
    return sortByOrder(
      [...this.store.tasks.values()].filter(
        (task) => task.userId === userId && (listId ? task.listId === listId : true)
      )
    );
  }

  listByParentTaskId(userId: string, parentTaskId: string): TaskRecord[] {
    return sortByOrder(
      [...this.store.tasks.values()].filter(
        (task) => task.userId === userId && task.parentTaskId === parentTaskId && !task.isDeleted
      )
    );
  }

  getById(userId: string, id: string): TaskRecord {
    const task = this.store.tasks.get(id);
    if (!task || task.userId !== userId || task.isDeleted) {
      notFound("Task", id);
    }
    return task;
  }

  create(
    userId: string,
    input: Omit<TaskRecord, "id" | "userId" | "sortOrder" | "isDeleted" | "createdAt" | "updatedAt">
  ): TaskRecord {
    const now = nowIso();
    const normalizedInput: Omit<TaskRecord, "id" | "userId" | "sortOrder" | "isDeleted" | "createdAt" | "updatedAt"> = {
      ...input,
      status: input.status ?? "active",
      priority: input.priority ?? "none",
      energyLevel: input.energyLevel ?? "MEDIUM",
      resistance: input.resistance ?? "NONE",
      kanbanColumn: input.kanbanColumn ?? "TODO",
      matrixQuadrant: input.matrixQuadrant ?? null,
      tagSlugs: normalizeTagSlugs(input.tagSlugs)
    };

    const task: TaskRecord = {
      id: newId("task"),
      userId,
      sortOrder: maxSortOrder(this.list(userId, input.listId)) + 1,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
      ...normalizedInput
    };

    this.store.tasks.set(task.id, task);
    this.events.emitTaskCreated(task);
    return task;
  }

  update(
    userId: string,
    id: string,
    input: Partial<
      Pick<
        TaskRecord,
        | "listId"
        | "sectionId"
        | "parentTaskId"
        | "title"
        | "notes"
        | "dueDate"
        | "completed"
        | "completedAt"
        | "sortOrder"
        | "status"
        | "priority"
        | "energyLevel"
        | "resistance"
        | "kanbanColumn"
        | "matrixQuadrant"
        | "tagSlugs"
      >
    >
  ): TaskRecord {
    const current = this.getById(userId, id);
    const updated: TaskRecord = {
      ...current,
      ...input,
      tagSlugs: input.tagSlugs === undefined ? current.tagSlugs : normalizeTagSlugs(input.tagSlugs),
      updatedAt: nowIso()
    };

    this.store.tasks.set(id, updated);
    this.events.emitTaskUpdated(updated);
    return updated;
  }

  reorder(userId: string, id: string, sortOrder: number): TaskRecord {
    if (!Number.isInteger(sortOrder)) {
      badRequest("sortOrder must be an integer");
    }

    return this.update(userId, id, { sortOrder });
  }

  softDelete(userId: string, id: string): TaskRecord {
    const current = this.getById(userId, id);
    const deleted: TaskRecord = {
      ...current,
      status: "trash",
      isDeleted: true,
      updatedAt: nowIso()
    };

    this.store.tasks.set(id, deleted);
    this.events.emitTaskDeleted(deleted);
    return deleted;
  }

  softDeleteByList(userId: string, listId: string): TaskRecord[] {
    const deleted: TaskRecord[] = [];

    for (const task of [...this.store.tasks.values()]) {
      if (task.userId === userId && task.listId === listId && !task.isDeleted) {
        const tombstone: TaskRecord = {
          ...task,
          status: "trash",
          isDeleted: true,
          updatedAt: nowIso()
        };
        this.store.tasks.set(task.id, tombstone);
        this.events.emitTaskDeleted(tombstone);
        deleted.push(tombstone);
      }
    }

    return deleted;
  }

  softDeleteBySection(userId: string, sectionId: string): TaskRecord[] {
    const deleted: TaskRecord[] = [];

    for (const task of [...this.store.tasks.values()]) {
      if (task.userId === userId && task.sectionId === sectionId && !task.isDeleted) {
        const tombstone: TaskRecord = {
          ...task,
          status: "trash",
          isDeleted: true,
          updatedAt: nowIso()
        };
        this.store.tasks.set(task.id, tombstone);
        this.events.emitTaskDeleted(tombstone);
        deleted.push(tombstone);
      }
    }

    return deleted;
  }
}
