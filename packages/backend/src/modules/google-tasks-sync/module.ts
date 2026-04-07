import { Module } from "@nestjs/common";

import { CoreDataStoreModule } from "../core-data-store";
import { GoogleTasksSyncController } from "./controller";
import { GoogleTasksSyncDao } from "./dao";
import { FakeGoogleTasksProviderClient } from "./provider";
import { GoogleTasksSyncEventBus, GoogleTasksSyncService } from "./service";

@Module({
  imports: [CoreDataStoreModule],
  controllers: [GoogleTasksSyncController],
  providers: [GoogleTasksSyncDao, FakeGoogleTasksProviderClient, GoogleTasksSyncEventBus, GoogleTasksSyncService],
  exports: [GoogleTasksSyncDao, FakeGoogleTasksProviderClient, GoogleTasksSyncEventBus, GoogleTasksSyncService]
})
export class GoogleTasksSyncModule {}

