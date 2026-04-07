import { Body, Controller, Get, Headers, Param, Post } from "@nestjs/common";

import { ensureUserId } from "../core-data-utils";
import { SectionsService } from "./service";

@Controller("lists/:listId/sections")
export class ListSectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Get()
  list(@Headers("x-zuam-user-id") userId?: string, @Param("listId") listId?: string) {
    return this.sectionsService.listSections(ensureUserId(userId), listId);
  }

  @Post()
  create(
    @Headers("x-zuam-user-id") userId: string | undefined,
    @Param("listId") listId: string,
    @Body() body: Record<string, unknown>
  ) {
    return this.sectionsService.createSection(ensureUserId(userId), {
      ...body,
      listId
    });
  }
}
