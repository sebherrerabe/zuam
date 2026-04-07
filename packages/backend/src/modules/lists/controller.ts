import { Body, Controller, Delete, Get, Headers, Param, Patch, Post } from "@nestjs/common";

import { ensureUserId } from "../core-data-utils";
import { ListsService } from "./service";

@Controller("lists")
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Get()
  list(@Headers("x-zuam-user-id") userId?: string) {
    return this.listsService.listLists(ensureUserId(userId));
  }

  @Post()
  create(@Headers("x-zuam-user-id") userId: string | undefined, @Body() body: unknown) {
    return this.listsService.createList(ensureUserId(userId), body);
  }

  @Patch(":id")
  update(
    @Headers("x-zuam-user-id") userId: string | undefined,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    return this.listsService.updateList(ensureUserId(userId), id, body);
  }

  @Patch(":id/reorder")
  reorder(
    @Headers("x-zuam-user-id") userId: string | undefined,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    return this.listsService.reorderList(ensureUserId(userId), id, body);
  }

  @Delete(":id")
  delete(@Headers("x-zuam-user-id") userId: string | undefined, @Param("id") id: string) {
    return this.listsService.deleteList(ensureUserId(userId), id);
  }
}
