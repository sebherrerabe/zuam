import { Module } from "@nestjs/common";

import { AuthModule } from "./modules/auth";
import { CoreDataStoreModule } from "./modules/core-data-store";
import { FocusSessionsModule } from "./modules/focus-sessions";
import { AnalyticsInsightsModule } from "./modules/analytics-insights";
import { GoogleTasksSyncModule } from "./modules/google-tasks-sync";
import { GoogleCalendarContextModule } from "./modules/google-calendar-context";
import { ListsModule } from "./modules/lists/module";
import { NudgesModule } from "./modules/nudges";
import { ProgressionModule } from "./modules/progression";
import { SectionsModule } from "./modules/sections/module";
import { TasksModule } from "./modules/tasks/module";

@Module({
  imports: [
    AuthModule,
    AnalyticsInsightsModule,
    CoreDataStoreModule,
    FocusSessionsModule,
    GoogleTasksSyncModule,
    GoogleCalendarContextModule,
    ListsModule,
    NudgesModule,
    ProgressionModule,
    SectionsModule,
    TasksModule
  ]
})
export class AppModule {}
