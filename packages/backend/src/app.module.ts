import { Module } from "@nestjs/common";

import { AuthModule } from "./modules/auth";
import { CoreDataStoreModule } from "./modules/core-data-store";
import { FocusSessionsModule } from "./modules/focus-sessions";
import { GoogleTasksSyncModule } from "./modules/google-tasks-sync";
import { GoogleCalendarContextModule } from "./modules/google-calendar-context";
import { ListsModule } from "./modules/lists/module";
import { NudgesModule } from "./modules/nudges";
import { SectionsModule } from "./modules/sections/module";
import { TasksModule } from "./modules/tasks/module";

@Module({
  imports: [
    AuthModule,
    CoreDataStoreModule,
    FocusSessionsModule,
    GoogleTasksSyncModule,
    GoogleCalendarContextModule,
    ListsModule,
    NudgesModule,
    SectionsModule,
    TasksModule
  ]
})
export class AppModule {}
