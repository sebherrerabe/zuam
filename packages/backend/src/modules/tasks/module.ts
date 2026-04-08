import { Module } from "@nestjs/common";

import { CoreDataStoreModule } from "../core-data-store";
import { ListsModule } from "../lists/module";
import { SectionsModule } from "../sections/module";
import { TasksController } from "./controller";
import { TasksDao } from "./dao";
import { TasksService } from "./service";
import { TaskTaxonomyController } from "./taxonomy.controller";
import { TaskTaxonomyDao } from "./taxonomy.dao";
import { TaskTaxonomyService } from "./taxonomy.service";

@Module({
  imports: [CoreDataStoreModule, ListsModule, SectionsModule],
  controllers: [TasksController, TaskTaxonomyController],
  providers: [TasksDao, TasksService, TaskTaxonomyDao, TaskTaxonomyService],
  exports: [TasksDao, TasksService, TaskTaxonomyDao, TaskTaxonomyService]
})
export class TasksModule {}
