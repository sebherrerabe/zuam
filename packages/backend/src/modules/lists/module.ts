import { Module } from "@nestjs/common";

import { CoreDataStoreModule } from "../core-data-store";
import { ListsController } from "./controller";
import { ListsDao } from "./dao";
import { ListsService } from "./service";

@Module({
  imports: [CoreDataStoreModule],
  controllers: [ListsController],
  providers: [ListsDao, ListsService],
  exports: [ListsDao, ListsService]
})
export class ListsModule {}
