import { Body, Controller, Headers, Param, Post } from "@nestjs/common";

import { ensureUserId } from "../core-data-utils";
import { NudgesService } from "./service";

@Controller()
export class NudgesController {
  constructor(private readonly nudgesService: NudgesService) {}

  @Post("tasks/:id/snooze")
  snooze(@Headers("x-zuam-user-id") userId: string | undefined, @Param("id") id: string, @Body() body: unknown) {
    return this.nudgesService.snoozeTask(ensureUserId(userId), id, body as { minutes?: number; snoozedUntil?: string; at?: string });
  }

  @Post("tasks/:id/postpone")
  postpone(
    @Headers("x-zuam-user-id") userId: string | undefined,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    return this.nudgesService.postponeTask(ensureUserId(userId), id, body as { dueDate?: string; reason?: string; at?: string });
  }

  @Post("nudge/:id/acknowledge")
  acknowledge(
    @Headers("x-zuam-user-id") userId: string | undefined,
    @Param("id") id: string,
    @Body() body: unknown = {}
  ) {
    return this.nudgesService.acknowledge(ensureUserId(userId), id, body as { at?: string });
  }
}

