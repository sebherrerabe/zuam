import { Module } from "@nestjs/common";

import { FocusSessionsModule } from "../focus-sessions/module";
import { TasksModule } from "../tasks/module";
import { AnalyticsInsightsController } from "./controller";
import { AnalyticsInsightsDao } from "./dao";
import { AnalyticsInsightsService } from "./service";

@Module({
  imports: [TasksModule, FocusSessionsModule],
  controllers: [AnalyticsInsightsController],
  providers: [AnalyticsInsightsDao, AnalyticsInsightsService],
  exports: [AnalyticsInsightsDao, AnalyticsInsightsService]
})
export class AnalyticsInsightsModule {}
