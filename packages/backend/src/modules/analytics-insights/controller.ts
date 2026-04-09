import { Controller, Get, Headers, Query } from "@nestjs/common";
import type { AnalyticsWindow } from "@zuam/shared";

import { ensureUserId } from "../core-data-utils";
import { AnalyticsInsightsService } from "./service";

@Controller("analytics")
export class AnalyticsInsightsController {
  constructor(private readonly analyticsInsightsService: AnalyticsInsightsService) {}

  @Get("summary")
  getSummary(
    @Headers("x-zuam-user-id") userId: string | undefined,
    @Query("window") window?: AnalyticsWindow
  ) {
    return this.analyticsInsightsService.getSummary(ensureUserId(userId), window);
  }

  @Get("heatmap")
  getHeatmap(
    @Headers("x-zuam-user-id") userId: string | undefined,
    @Query("window") window?: AnalyticsWindow
  ) {
    return this.analyticsInsightsService.getHeatmap(ensureUserId(userId), window ?? "last-28-days");
  }
}
