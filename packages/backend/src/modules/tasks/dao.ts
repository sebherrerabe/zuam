import { Injectable } from "@nestjs/common";

import type { TaskDto } from "@zuam/shared/tasks";

import { CoreDataEventBus, CoreDataStore } from "../core-data-store";
import { badRequest, maxSortOrder, newId, notFound, nowIso, sortByOrder } from "../core-data-utils";

@Injectable()
export class TasksDao {
  constructor(
    private readonly store: CoreDataStore,
    private readonly events: CoreDataEventBus
  ) {}

  list(userId: string, listId?: string): TaskDto[] {
    return sortByOrder(
      [...this.store.tasks.values()].filter(
        (task) => task.userId === userId && (listId ? task.listId === listId : true)
      )
    );
  }

  getById(userId: string, id: string): TaskDto {
    const task = this.store.tasks.get(id);
    if (!task || task.userId !== userId || task.isDeleted) {
      notFound("Task", id);
    }
    return task;
  }

  create(
    userId: string,
    input: Omit<TaskDto, "id" | "userId" | "sortOrder" | "isDeleted" | "createdAt" | "updatedAt">
  ): TaskDto {
    const now = nowIso();
    const task: TaskDto = {
      id: newId("task"),
      userId,
      sortOrder: maxSortOrder(this.list(userId, input.listId)) + 1,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
      ...input
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
        TaskDto,
        | "listId"
        | "sectionId"
        | "parentTaskId"
        | "title"
        | "notes"
        | "dueDate"
        | "completed"
        | "completedAt"
        | "sortOrder"
      >
    >
  ): TaskDto {
    const current = this.getById(userId, id);
    const updated: TaskDto = {
      ...current,
      ...input,
      updatedAt: nowIso()
    };

    this.store.tasks.set(id, updated);
    this.events.emitTaskUpdated(updated);
    return updated;
  }

  reorder(userId: string, id: string, sortOrder: number): TaskDto {
    if (!Number.isInteger(sortOrder)) {
      badRequest("sortOrder must be an integer");
    }

    return this.update(userId, id, { sortOrder });
  }

  softDelete(userId: string, id: string): TaskDto {
    const current = this.getById(userId, id);
    const deleted: TaskDto = {
      ...current,
      isDeleted: true,
      updatedAt: nowIso()
    };

    this.store.tasks.set(id, deleted);
    this.events.emitTaskDeleted(deleted);
    return deleted;
  }

  softDeleteByList(userId: string, listId: string): TaskDto[] {
    const deleted: TaskDto[] = [];

    for (const task of [...this.store.tasks.values()]) {
      if (task.userId === userId && task.listId === listId && !task.isDeleted) {
        const tombstone: TaskDto = {
          ...task,
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

  softDeleteBySection(userId: string, sectionId: string): TaskDto[] {
    const deleted: TaskDto[] = [];

    for (const task of [...this.store.tasks.values()]) {
      if (task.userId === userId && task.sectionId === sectionId && !task.isDeleted) {
        const tombstone: TaskDto = {
          ...task,
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
