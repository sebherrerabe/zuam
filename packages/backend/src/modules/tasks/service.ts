import { BadRequestException, Injectable } from "@nestjs/common";

import { ListsDao } from "../lists/dao";
import { SectionsDao } from "../sections/dao";
import { TasksDao } from "./dao";
import {
  completeTaskInputSchema,
  createTaskInputSchema,
  moveTaskInputSchema,
  reorderTaskInputSchema,
  setTaskStatusInputSchema,
  updateTaskInputSchema
} from "./dto";
import type { TaskLifecycleStatus, TaskRecord } from "./types";

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksDao: TasksDao,
    private readonly listsDao: ListsDao,
    private readonly sectionsDao: SectionsDao
  ) {}

  listTasks(userId: string, listId?: string) {
    return this.tasksDao
      .list(userId, listId)
      .filter((task) => !task.isDeleted && (!listId || task.listId === listId));
  }

  createTask(userId: string, input: unknown) {
    const parsed = createTaskInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException("Invalid task payload");
    }

    const { listId, sectionId, parentTaskId, status, ...rest } = parsed.data;
    this.listsDao.getById(userId, listId);

    if (sectionId) {
      const section = this.sectionsDao.getById(userId, sectionId);
      if (section.listId !== listId) {
        throw new BadRequestException("Section must belong to the same list as the task");
      }
    }

    this.assertParentTaskConstraints(userId, listId, parentTaskId ?? null, null);

    return this.tasksDao.create(userId, {
      listId,
      sectionId: sectionId ?? null,
      parentTaskId: parentTaskId ?? null,
      title: rest.title,
      notes: rest.notes ?? null,
      dueDate: rest.dueDate ?? null,
      completed: status === "completed",
      completedAt: status === "completed" ? new Date().toISOString() : null,
      status: status ?? "active",
      priority: rest.priority ?? "none",
      energyLevel: rest.energyLevel ?? "MEDIUM",
      resistance: rest.resistance ?? "NONE",
      kanbanColumn: rest.kanbanColumn ?? "TODO",
      matrixQuadrant: rest.matrixQuadrant ?? null,
      tagSlugs: rest.tagSlugs ?? []
    });
  }

  updateTask(userId: string, id: string, input: unknown) {
    const parsed = updateTaskInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException("Invalid task payload");
    }

    const current = this.tasksDao.getById(userId, id);
    const nextListId = parsed.data.listId ?? current.listId;
    const nextSectionId = parsed.data.sectionId === undefined ? current.sectionId : parsed.data.sectionId;
    const nextParentTaskId =
      parsed.data.parentTaskId === undefined ? current.parentTaskId : parsed.data.parentTaskId;

    this.listsDao.getById(userId, nextListId);

    if (nextSectionId) {
      const section = this.sectionsDao.getById(userId, nextSectionId);
      if (section.listId !== nextListId) {
        throw new BadRequestException("Section must belong to the same list as the task");
      }
    }

    this.assertParentTaskConstraints(userId, nextListId, nextParentTaskId, id);

    if (parsed.data.status === "trash") {
      return this.deleteTask(userId, id);
    }

    const nextStatus = resolveNextStatus(current, parsed.data.status, parsed.data.completed);
    let nextCompleted = parsed.data.completed ?? current.completed;
    if (parsed.data.status) {
      nextCompleted = parsed.data.status === "completed";
    }

    return this.tasksDao.update(userId, id, {
      listId: nextListId,
      sectionId: nextSectionId,
      parentTaskId: nextParentTaskId,
      title: parsed.data.title ?? current.title,
      notes: parsed.data.notes === undefined ? current.notes : parsed.data.notes,
      dueDate: parsed.data.dueDate === undefined ? current.dueDate : parsed.data.dueDate,
      completed: nextCompleted,
      completedAt:
        nextStatus === "completed" ? current.completedAt ?? new Date().toISOString() : null,
      status: nextStatus,
      priority: parsed.data.priority ?? current.priority,
      energyLevel: parsed.data.energyLevel ?? current.energyLevel,
      resistance: parsed.data.resistance ?? current.resistance,
      kanbanColumn: parsed.data.kanbanColumn ?? current.kanbanColumn,
      matrixQuadrant: parsed.data.matrixQuadrant === undefined ? current.matrixQuadrant : parsed.data.matrixQuadrant,
      tagSlugs: parsed.data.tagSlugs === undefined ? current.tagSlugs : parsed.data.tagSlugs
    });
  }

  moveTask(userId: string, id: string, input: unknown) {
    const parsed = moveTaskInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException("Invalid move payload");
    }

    const current = this.tasksDao.getById(userId, id);
    const nextListId = parsed.data.listId ?? current.listId;
    const nextSectionId = parsed.data.sectionId === undefined ? current.sectionId : parsed.data.sectionId;

    this.listsDao.getById(userId, nextListId);

    if (nextSectionId) {
      const section = this.sectionsDao.getById(userId, nextSectionId);
      if (section.listId !== nextListId) {
        throw new BadRequestException("Section must belong to the same list as the task");
      }
    }

    return this.tasksDao.update(userId, id, {
      listId: nextListId,
      sectionId: nextSectionId,
      sortOrder: parsed.data.sortOrder ?? current.sortOrder,
      kanbanColumn: parsed.data.kanbanColumn ?? current.kanbanColumn,
      matrixQuadrant:
        parsed.data.matrixQuadrant === undefined ? current.matrixQuadrant : parsed.data.matrixQuadrant,
      tagSlugs: parsed.data.tagSlugs === undefined ? current.tagSlugs : parsed.data.tagSlugs
    });
  }

  reorderTask(userId: string, id: string, input: unknown) {
    const parsed = reorderTaskInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException("Invalid reorder payload");
    }

    return this.tasksDao.reorder(userId, id, parsed.data.sortOrder);
  }

  completeTask(userId: string, id: string, input: unknown) {
    const parsed = completeTaskInputSchema.safeParse(input ?? {});
    if (!parsed.success) {
      throw new BadRequestException("Invalid completion payload");
    }

    const current = this.tasksDao.getById(userId, id);
    const nextStatus: TaskLifecycleStatus = parsed.data.completed ? "completed" : "active";
    return this.tasksDao.update(userId, id, {
      completed: parsed.data.completed,
      completedAt: parsed.data.completed ? current.completedAt ?? new Date().toISOString() : null,
      status: nextStatus
    });
  }

  setTaskStatus(userId: string, id: string, input: unknown) {
    const parsed = setTaskStatusInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException("Invalid task status payload");
    }

    if (parsed.data.status === "trash") {
      return this.deleteTask(userId, id);
    }

    return this.updateTask(userId, id, {
      status: parsed.data.status,
      completed: parsed.data.status === "completed"
    });
  }

  deleteTask(userId: string, id: string) {
    return this.tasksDao.softDelete(userId, id);
  }

  private assertParentTaskConstraints(
    userId: string,
    listId: string,
    parentTaskId: string | null,
    currentTaskId: string | null
  ) {
    if (!parentTaskId) {
      return;
    }

    const parent = this.tasksDao.getById(userId, parentTaskId);
    if (parent.listId !== listId) {
      throw new BadRequestException("Parent task must belong to the same list");
    }

    if (currentTaskId && parent.id === currentTaskId) {
      throw new BadRequestException("Task hierarchy cannot contain cycles");
    }

    let depth = 1;
    let cursor: string | null = parent.parentTaskId;
    while (cursor) {
      const ancestor = this.tasksDao.getById(userId, cursor);
      if (currentTaskId && ancestor.id === currentTaskId) {
        throw new BadRequestException("Task hierarchy cannot contain cycles");
      }
      cursor = ancestor.parentTaskId;
      depth += 1;
    }

    if (depth + 1 > 3) {
      throw new BadRequestException("Task nesting depth cannot exceed 3 levels");
    }
  }
}

function resolveNextStatus(
  current: TaskRecord,
  status: TaskLifecycleStatus | undefined,
  completed: boolean | undefined
): TaskLifecycleStatus {
  if (status) {
    return status;
  }

  if (completed !== undefined) {
    return completed ? "completed" : "active";
  }

  return current.status;
}
