import { Body, Controller, Get, Headers, Post } from "@nestjs/common";

import { ensureUserId } from "../core-data-utils";
import { GoogleCalendarContextService } from "./service";

@Controller("sync/google/calendar")
export class GoogleCalendarContextController {
  constructor(private readonly calendarContextService: GoogleCalendarContextService) {}

  @Get()
  get(@Headers("x-zuam-user-id") userId: string | undefined) {
    return this.calendarContextService.getCalendarContext(ensureUserId(userId));
  }

  @Post("refresh")
  refresh(@Headers("x-zuam-user-id") userId: string | undefined, @Body() body: unknown) {
    return this.calendarContextService.refreshCalendarContext(ensureUserId(userId), body);
  }

  @Post("suggestions")
  suggestions(@Headers("x-zuam-user-id") userId: string | undefined, @Body() body: unknown) {
    return this.calendarContextService.suggestSlots(ensureUserId(userId), body);
  }
}
