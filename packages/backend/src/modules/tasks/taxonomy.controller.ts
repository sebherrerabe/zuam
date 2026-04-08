import { BadRequestException, Body, Controller, Delete, Get, Headers, Param, Patch, Post } from "@nestjs/common";

import { ensureUserId } from "../core-data-utils";
import { TaskTaxonomyService } from "./taxonomy.service";
import { smartListKeys } from "./types";
import type { SmartListKey } from "./types";

@Controller("taxonomy")
export class TaskTaxonomyController {
  constructor(private readonly taxonomyService: TaskTaxonomyService) {}

  @Get("sidebar-counts")
  sidebarCounts(@Headers("x-zuam-user-id") userId: string | undefined) {
    return this.taxonomyService.sidebarCounts(ensureUserId(userId));
  }

  @Post("query")
  query(@Headers("x-zuam-user-id") userId: string | undefined, @Body() body: unknown) {
    return this.taxonomyService.queryTasks(ensureUserId(userId), body);
  }

  @Get("smart-lists/:smartList")
  smartList(@Headers("x-zuam-user-id") userId: string | undefined, @Param("smartList") smartList: string) {
    if (!isSmartListKey(smartList)) {
      throw new BadRequestException(`Unknown smart list "${smartList}"`);
    }

    return this.taxonomyService.querySmartList(ensureUserId(userId), smartList);
  }

  @Post("focus-queue/recommendation")
  focusRecommendation(@Headers("x-zuam-user-id") userId: string | undefined, @Body() body: unknown) {
    return this.taxonomyService.focusQueueRecommendation(ensureUserId(userId), body);
  }

  @Get("tags")
  listTags(@Headers("x-zuam-user-id") userId: string | undefined) {
    return this.taxonomyService.listTags(ensureUserId(userId));
  }

  @Post("tags")
  createTag(@Headers("x-zuam-user-id") userId: string | undefined, @Body() body: unknown) {
    return this.taxonomyService.createTag(ensureUserId(userId), body);
  }

  @Patch("tags/:id")
  updateTag(
    @Headers("x-zuam-user-id") userId: string | undefined,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    return this.taxonomyService.updateTag(ensureUserId(userId), id, body);
  }

  @Delete("tags/:id")
  deleteTag(@Headers("x-zuam-user-id") userId: string | undefined, @Param("id") id: string) {
    return this.taxonomyService.deleteTag(ensureUserId(userId), id);
  }

  @Get("saved-filters")
  listSavedFilters(@Headers("x-zuam-user-id") userId: string | undefined) {
    return this.taxonomyService.listSavedFilters(ensureUserId(userId));
  }

  @Post("saved-filters")
  createSavedFilter(@Headers("x-zuam-user-id") userId: string | undefined, @Body() body: unknown) {
    return this.taxonomyService.createSavedFilter(ensureUserId(userId), body);
  }

  @Patch("saved-filters/:id")
  updateSavedFilter(
    @Headers("x-zuam-user-id") userId: string | undefined,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    return this.taxonomyService.updateSavedFilter(ensureUserId(userId), id, body);
  }

  @Delete("saved-filters/:id")
  deleteSavedFilter(@Headers("x-zuam-user-id") userId: string | undefined, @Param("id") id: string) {
    return this.taxonomyService.deleteSavedFilter(ensureUserId(userId), id);
  }

  @Post("saved-filters/:id/execute")
  executeSavedFilter(@Headers("x-zuam-user-id") userId: string | undefined, @Param("id") id: string) {
    return this.taxonomyService.executeSavedFilter(ensureUserId(userId), id);
  }
}

function isSmartListKey(value: string): value is SmartListKey {
  return smartListKeys.includes(value as SmartListKey);
}
