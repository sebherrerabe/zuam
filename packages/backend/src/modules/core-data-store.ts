import { Global, Injectable, Module } from "@nestjs/common";
import { EventEmitter } from "node:events";

import type { ListDto, SectionDto, TaskDto } from "@zuam/shared/tasks";

@Injectable()
export class CoreDataStore {
  readonly lists = new Map<string, ListDto>();
  readonly sections = new Map<string, SectionDto>();
  readonly tasks = new Map<string, TaskDto>();
}

@Injectable()
export class CoreDataEventBus extends EventEmitter {
  emitListUpdated(list: ListDto) {
    this.emit("list:updated", list);
  }

  emitSectionUpdated(section: SectionDto) {
    this.emit("section:updated", section);
  }

  emitTaskCreated(task: TaskDto) {
    this.emit("task:created", task);
  }

  emitTaskUpdated(task: TaskDto) {
    this.emit("task:updated", task);
  }

  emitTaskDeleted(task: TaskDto) {
    this.emit("task:deleted", task);
  }
}

@Global()
@Module({
  providers: [CoreDataStore, CoreDataEventBus],
  exports: [CoreDataStore, CoreDataEventBus]
})
export class CoreDataStoreModule {}
