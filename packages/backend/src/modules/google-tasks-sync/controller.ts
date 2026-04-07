import { Body, Controller, Get, Headers, HttpCode, Post } from "@nestjs/common";

import { ensureUserId } from "../core-data-utils";
import { GoogleTasksSyncService } from "./service";
import type { GoogleTasksSyncScope, GoogleTasksWebhookSignal } from "./types";

@Controller("sync")
export class GoogleTasksSyncController {
  constructor(private readonly service: GoogleTasksSyncService) {}

  @Post("google/tasks")
  forceSync(
    @Headers("x-zuam-user-id") userId: string | undefined,
    @Body() body: { scope?: GoogleTasksSyncScope } = {}
  ) {
    return this.service.forceSync(ensureUserId(userId), body);
  }

  @Get("status")
  status(@Headers("x-zuam-user-id") userId: string | undefined) {
    return this.service.getStatus(ensureUserId(userId));
  }

  @Post("google/tasks/webhook")
  @HttpCode(202)
  webhook(@Body() body: GoogleTasksWebhookSignal = {}) {
    this.service.handleWebhook(body);
    return { accepted: true };
  }
}

