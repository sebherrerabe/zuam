import { BadRequestException, Injectable } from "@nestjs/common";

import { ListsDao } from "../lists/dao";
import { SectionsDao } from "./dao";
import {
  createSectionInputSchema,
  reorderSectionInputSchema,
  updateSectionInputSchema
} from "./dto";

@Injectable()
export class SectionsService {
  constructor(
    private readonly sectionsDao: SectionsDao,
    private readonly listsDao: ListsDao
  ) {}

  listSections(userId: string, listId?: string) {
    return this.sectionsDao
      .list(userId, listId)
      .filter((section) => !section.isDeleted && (!listId || section.listId === listId));
  }

  createSection(userId: string, input: unknown) {
    const parsed = createSectionInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException("Invalid section payload");
    }

    this.listsDao.getById(userId, parsed.data.listId);
    return this.sectionsDao.create(userId, parsed.data);
  }

  updateSection(userId: string, id: string, input: unknown) {
    const parsed = updateSectionInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException("Invalid section payload");
    }

    if (parsed.data.listId) {
      this.listsDao.getById(userId, parsed.data.listId);
    }

    return this.sectionsDao.update(userId, id, parsed.data);
  }

  reorderSection(userId: string, id: string, input: unknown) {
    const parsed = reorderSectionInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException("Invalid reorder payload");
    }

    return this.sectionsDao.reorder(userId, id, parsed.data.sortOrder);
  }

  deleteSection(userId: string, id: string) {
    return this.sectionsDao.softDelete(userId, id);
  }
}
