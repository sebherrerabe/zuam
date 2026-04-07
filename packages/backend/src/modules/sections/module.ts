import { Module } from "@nestjs/common";

import { CoreDataStoreModule } from "../core-data-store";
import { ListsModule } from "../lists/module";
import { ListSectionsController } from "./list-sections.controller";
import { SectionsController } from "./controller";
import { SectionsDao } from "./dao";
import { SectionsService } from "./service";

@Module({
  imports: [CoreDataStoreModule, ListsModule],
  controllers: [ListSectionsController, SectionsController],
  providers: [SectionsDao, SectionsService],
  exports: [SectionsDao, SectionsService]
})
export class SectionsModule {}
