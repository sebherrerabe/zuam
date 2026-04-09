import { BadRequestException, Body, Controller, Get, Headers, Patch } from "@nestjs/common";

import { ensureUserId } from "../core-data-utils";
import { ProgressionService } from "./service";

@Controller("progression")
export class ProgressionController {
  constructor(private readonly progressionService: ProgressionService) {}

  @Get("profile")
  getProfile(@Headers("x-zuam-user-id") userId: string | undefined) {
    return this.progressionService.getProfile(ensureUserId(userId));
  }

  @Get("reward-history")
  getRewardHistory(@Headers("x-zuam-user-id") userId: string | undefined) {
    return this.progressionService.listRewardHistory(ensureUserId(userId));
  }

  @Patch("profile/equipment")
  equipCosmetic(
    @Headers("x-zuam-user-id") userId: string | undefined,
    @Body() body: { cosmeticId?: string }
  ) {
    if (!body?.cosmeticId) {
      throw new BadRequestException("cosmeticId is required");
    }
    return this.progressionService.equipCosmetic(ensureUserId(userId), body.cosmeticId);
  }

  @Get("share-card")
  getShareCard(@Headers("x-zuam-user-id") userId: string | undefined) {
    return this.progressionService.getShareCard(ensureUserId(userId));
  }
}
