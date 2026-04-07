import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query } from "@nestjs/common";

import { ensureUserId } from "../core-data-utils";
import { SectionsService } from "./service";

@Controller("sections")
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Get()
  list(@Headers("x-zuam-user-id") userId?: string, @Query("listId") listId?: string) {
    return this.sectionsService.listSections(ensureUserId(userId), listId);
  }

  @Post()
  create(@Headers("x-zuam-user-id") userId: string | undefined, @Body() body: unknown) {
    return this.sectionsService.createSection(ensureUserId(userId), body);
  }

  @Patch(":id")
  update(
    @Headers("x-zuam-user-id") userId: string | undefined,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    return this.sectionsService.updateSection(ensureUserId(userId), id, body);
  }

  @Patch(":id/reorder")
  reorder(
    @Headers("x-zuam-user-id") userId: string | undefined,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    return this.sectionsService.reorderSection(ensureUserId(userId), id, body);
  }

  @Delete(":id")
  delete(@Headers("x-zuam-user-id") userId: string | undefined, @Param("id") id: string) {
    return this.sectionsService.deleteSection(ensureUserId(userId), id);
  }
}
