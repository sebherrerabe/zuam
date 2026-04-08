import { Injectable } from "@nestjs/common";

import type { SectionDto } from "@zuam/shared/tasks";

import { CoreDataEventBus, CoreDataStore } from "../core-data-store";
import { badRequest, maxSortOrder, newId, notFound, nowIso, sortByOrder } from "../core-data-utils";

@Injectable()
export class SectionsDao {
  constructor(
    private readonly store: CoreDataStore,
    private readonly events: CoreDataEventBus
  ) {}

  list(userId: string, listId?: string): SectionDto[] {
    return sortByOrder(
      [...this.store.sections.values()].filter(
        (section) => section.userId === userId && (listId ? section.listId === listId : true)
      )
    );
  }

  getById(userId: string, id: string): SectionDto {
    const section = this.store.sections.get(id);
    if (!section || section.userId !== userId || section.isDeleted) {
      notFound("Section", id);
    }
    return section;
  }

  create(userId: string, input: { listId: string; name: string }): SectionDto {
    const now = nowIso();
    const section: SectionDto = {
      id: newId("section"),
      userId,
      listId: input.listId,
      name: input.name,
      sortOrder: maxSortOrder(this.list(userId, input.listId)) + 1,
      isCollapsed: false,
      isDeleted: false,
      createdAt: now,
      updatedAt: now
    };

    this.store.sections.set(section.id, section);
    this.events.emitSectionUpdated(section);
    return section;
  }

  update(
    userId: string,
    id: string,
    input: Partial<Pick<SectionDto, "listId" | "name" | "isCollapsed" | "sortOrder">>
  ): SectionDto {
    const current = this.getById(userId, id);
    const updated: SectionDto = {
      ...current,
      ...input,
      updatedAt: nowIso()
    };

    this.store.sections.set(id, updated);
    this.events.emitSectionUpdated(updated);
    return updated;
  }

  reorder(userId: string, id: string, sortOrder: number): SectionDto {
    if (!Number.isInteger(sortOrder)) {
      badRequest("sortOrder must be an integer");
    }

    return this.update(userId, id, { sortOrder });
  }

  softDelete(userId: string, id: string): SectionDto {
    const current = this.getById(userId, id);
    const deleted: SectionDto = {
      ...current,
      isDeleted: true,
      updatedAt: nowIso()
    };

    this.store.sections.set(id, deleted);
    this.events.emitSectionUpdated(deleted);

    for (const task of [...this.store.tasks.values()]) {
      if (task.userId === userId && task.sectionId === id && !task.isDeleted) {
        const taskDeleted = {
          ...task,
          status: "trash" as const,
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
