import { Injectable } from "@nestjs/common";

import type { ListDto } from "@zuam/shared/tasks";

import { CoreDataEventBus, CoreDataStore } from "../core-data-store";
import { badRequest, maxSortOrder, newId, notFound, nowIso, sortByOrder } from "../core-data-utils";

@Injectable()
export class ListsDao {
  constructor(
    private readonly store: CoreDataStore,
    private readonly events: CoreDataEventBus
  ) {}

  list(userId: string): ListDto[] {
    return sortByOrder([...this.store.lists.values()].filter((list) => list.userId === userId));
  }

  getById(userId: string, id: string): ListDto {
    const list = this.store.lists.get(id);
    if (!list || list.userId !== userId || list.isDeleted) {
      notFound("List", id);
    }
    return list;
  }

  create(userId: string, input: { name: string; color?: string | null; icon?: string | null }): ListDto {
    const now = nowIso();
    const list: ListDto = {
      id: newId("list"),
      userId,
      name: input.name,
      color: input.color ?? null,
      icon: input.icon ?? null,
      sortOrder: maxSortOrder(this.list(userId)) + 1,
      isDeleted: false,
      createdAt: now,
      updatedAt: now
    };

    this.store.lists.set(list.id, list);
    this.events.emitListUpdated(list);
    return list;
  }

  update(
    userId: string,
    id: string,
    input: Partial<Pick<ListDto, "name" | "color" | "icon" | "sortOrder">>
  ): ListDto {
    const current = this.getById(userId, id);
    const updated: ListDto = {
      ...current,
      ...input,
      color: input.color === undefined ? current.color : input.color,
      icon: input.icon === undefined ? current.icon : input.icon,
      updatedAt: nowIso()
    };

    this.store.lists.set(id, updated);
    this.events.emitListUpdated(updated);
    return updated;
  }

  reorder(userId: string, id: string, sortOrder: number): ListDto {
    if (!Number.isInteger(sortOrder)) {
      badRequest("sortOrder must be an integer");
    }

    return this.update(userId, id, { sortOrder });
  }

  softDelete(userId: string, id: string): ListDto {
    const current = this.getById(userId, id);
    const deleted: ListDto = {
      ...current,
      isDeleted: true,
      updatedAt: nowIso()
    };

    this.store.lists.set(id, deleted);
    this.events.emitListUpdated(deleted);

    for (const section of [...this.store.sections.values()]) {
      if (section.userId === userId && section.listId === id && !section.isDeleted) {
        const sectionDeleted = {
          ...section,
          isDeleted: true,
          updatedAt: nowIso()
        };
        this.store.sections.set(section.id, sectionDeleted);
        this.events.emitSectionUpdated(sectionDeleted);
      }
    }

    for (const task of [...this.store.tasks.values()]) {
      if (task.userId === userId && task.listId === id && !task.isDeleted) {
        const taskDeleted = {
          ...task,
          isDeleted: true,
          updatedAt: nowIso()
        };
        this.store.tasks.set(task.id, taskDeleted);
        this.events.emitTaskDeleted(taskDeleted);
      }
    }

    return deleted;
  }

}
