import { BadRequestException, Injectable } from "@nestjs/common";

import { ListsDao } from "../lists/dao";
import { SectionsDao } from "../sections/dao";
import { TasksDao } from "./dao";
import {
  completeTaskInputSchema,
  createTaskInputSchema,
  reorderTaskInputSchema,
  updateTaskInputSchema
} from "./dto";

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

    const { listId, sectionId, parentTaskId, ...rest } = parsed.data;
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
      completed: false,
      completedAt: null
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

    return this.tasksDao.update(userId, id, {
      listId: nextListId,
      sectionId: nextSectionId,
      parentTaskId: nextParentTaskId,
      title: parsed.data.title ?? current.title,
      notes: parsed.data.notes === undefined ? current.notes : parsed.data.notes,
      dueDate: parsed.data.dueDate === undefined ? current.dueDate : parsed.data.dueDate,
      completed: parsed.data.completed === undefined ? current.completed : parsed.data.completed,
      completedAt:
        parsed.data.completed === undefined
          ? current.completedAt
          : parsed.data.completed
            ? current.completedAt ?? new Date().toISOString()
            : null
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
    return this.tasksDao.update(userId, id, {
      completed: parsed.data.completed,
      completedAt: parsed.data.completed ? current.completedAt ?? new Date().toISOString() : null
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
