import { Module } from "@nestjs/common";

import { TasksModule } from "../tasks/module";
import { NudgesController } from "./controller";
import { NudgesDao } from "./dao";
import { NudgesEventBus } from "./events";
import { NudgesService } from "./service";

@Module({
  imports: [TasksModule],
  controllers: [NudgesController],
  providers: [NudgesDao, NudgesEventBus, NudgesService],
  exports: [NudgesDao, NudgesEventBus, NudgesService]
})
export class NudgesModule {}

