import { Module } from "@nestjs/common";

import { CoreDataStoreModule } from "../core-data-store";
import { ListsModule } from "../lists/module";
import { SectionsModule } from "../sections/module";
import { TasksController } from "./controller";
import { TasksDao } from "./dao";
import { TasksService } from "./service";

@Module({
  imports: [CoreDataStoreModule, ListsModule, SectionsModule],
  controllers: [TasksController],
  providers: [TasksDao, TasksService],
  exports: [TasksDao, TasksService]
})
export class TasksModule {}
