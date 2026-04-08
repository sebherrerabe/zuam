import { Module } from "@nestjs/common";

import { TasksModule } from "../tasks/module";
import { GoogleCalendarContextController } from "./controller";
import { GoogleCalendarContextDao } from "./dao";
import { GoogleCalendarContextEventBus } from "./events";
import { GoogleCalendarContextService } from "./service";

@Module({
  imports: [TasksModule],
  controllers: [GoogleCalendarContextController],
  providers: [GoogleCalendarContextDao, GoogleCalendarContextEventBus, GoogleCalendarContextService],
  exports: [GoogleCalendarContextDao, GoogleCalendarContextEventBus, GoogleCalendarContextService]
})
export class GoogleCalendarContextModule {}
