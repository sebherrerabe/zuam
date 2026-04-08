import { Module } from "@nestjs/common";

import { TasksModule } from "../tasks/module";
import { FocusSessionsController } from "./controller";
import { FocusSessionsDao } from "./dao";
import { FocusSessionsEventBus } from "./events";
import { FocusSessionsService } from "./service";

@Module({
  imports: [TasksModule],
  controllers: [FocusSessionsController],
  providers: [FocusSessionsDao, FocusSessionsEventBus, FocusSessionsService],
  exports: [FocusSessionsDao, FocusSessionsEventBus, FocusSessionsService]
})
export class FocusSessionsModule {}
