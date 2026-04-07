import { BadRequestException, Injectable } from "@nestjs/common";

import { ListsDao } from "./dao";
import { createListInputSchema, reorderListInputSchema, updateListInputSchema } from "./dto";

@Injectable()
export class ListsService {
  constructor(private readonly listsDao: ListsDao) {}

  listLists(userId: string) {
    return this.listsDao.list(userId).filter((list) => !list.isDeleted);
  }

  createList(userId: string, input: unknown) {
    const parsed = createListInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException("Invalid list payload");
    }

    return this.listsDao.create(userId, parsed.data);
  }

  updateList(userId: string, id: string, input: unknown) {
    const parsed = updateListInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException("Invalid list payload");
    }

    return this.listsDao.update(userId, id, parsed.data);
  }

  reorderList(userId: string, id: string, input: unknown) {
    const parsed = reorderListInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException("Invalid reorder payload");
    }

    return this.listsDao.reorder(userId, id, parsed.data.sortOrder);
  }

  deleteList(userId: string, id: string) {
    return this.listsDao.softDelete(userId, id);
  }
}
