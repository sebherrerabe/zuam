import { Body, Controller, Get, Headers, Param, Post } from "@nestjs/common";

import { ensureUserId } from "../core-data-utils";
import { FocusSessionsService } from "./service";

@Controller("focus-sessions")
export class FocusSessionsController {
  constructor(private readonly focusSessionsService: FocusSessionsService) {}

  @Get()
  list(@Headers("x-zuam-user-id") userId: string | undefined) {
    return this.focusSessionsService.listSessions(ensureUserId(userId));
  }

  @Get("sync")
  sync(@Headers("x-zuam-user-id") userId: string | undefined) {
    return this.focusSessionsService.syncSession(ensureUserId(userId));
  }

  @Post("start")
  start(@Headers("x-zuam-user-id") userId: string | undefined, @Body() body: unknown) {
    return this.focusSessionsService.startSession(ensureUserId(userId), body);
  }

  @Post(":id/pause")
  pause(@Headers("x-zuam-user-id") userId: string | undefined, @Param("id") id: string, @Body() body: unknown) {
    return this.focusSessionsService.pauseSession(ensureUserId(userId), id, body);
  }

  @Post(":id/break")
  break(@Headers("x-zuam-user-id") userId: string | undefined, @Param("id") id: string, @Body() body: unknown) {
    return this.focusSessionsService.startBreak(ensureUserId(userId), id, body);
  }

  @Post(":id/resume")
  resume(@Headers("x-zuam-user-id") userId: string | undefined, @Param("id") id: string, @Body() body: unknown) {
    return this.focusSessionsService.endBreak(ensureUserId(userId), id, body);
  }

  @Post(":id/end")
  end(@Headers("x-zuam-user-id") userId: string | undefined, @Param("id") id: string, @Body() body: unknown) {
    return this.focusSessionsService.endSession(ensureUserId(userId), id, body);
  }
}
