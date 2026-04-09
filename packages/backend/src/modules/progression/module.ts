import { Module } from "@nestjs/common";

import { AnalyticsInsightsModule } from "../analytics-insights/module";
import { CoreDataStoreModule } from "../core-data-store";
import { FocusSessionsModule } from "../focus-sessions/module";
import { ProgressionController } from "./controller";
import { ProgressionDao } from "./dao";
import { ProgressionEventBus } from "./events";
import { ProgressionService } from "./service";

@Module({
  imports: [AnalyticsInsightsModule, CoreDataStoreModule, FocusSessionsModule],
  controllers: [ProgressionController],
  providers: [ProgressionDao, ProgressionEventBus, ProgressionService],
  exports: [ProgressionDao, ProgressionEventBus, ProgressionService]
})
export class ProgressionModule {}
