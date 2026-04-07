import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query } from "@nestjs/common";

import { ensureUserId } from "../core-data-utils";
import { TasksService } from "./service";

@Controller("tasks")
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  list(@Headers("x-zuam-user-id") userId?: string, @Query("listId") listId?: string) {
    return this.tasksService.listTasks(ensureUserId(userId), listId);
  }

  @Post()
  create(@Headers("x-zuam-user-id") userId: string | undefined, @Body() body: unknown) {
    return this.tasksService.createTask(ensureUserId(userId), body);
  }

  @Patch(":id")
  update(
    @Headers("x-zuam-user-id") userId: string | undefined,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    return this.tasksService.updateTask(ensureUserId(userId), id, body);
  }

  @Patch(":id/reorder")
  reorder(
    @Headers("x-zuam-user-id") userId: string | undefined,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    return this.tasksService.reorderTask(ensureUserId(userId), id, body);
  }

  @Post(":id/complete")
  complete(
    @Headers("x-zuam-user-id") userId: string | undefined,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    return this.tasksService.completeTask(ensureUserId(userId), id, body);
  }

  @Delete(":id")
  delete(@Headers("x-zuam-user-id") userId: string | undefined, @Param("id") id: string) {
    return this.tasksService.deleteTask(ensureUserId(userId), id);
  }
}
