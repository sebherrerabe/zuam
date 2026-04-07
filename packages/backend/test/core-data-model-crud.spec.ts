import { CoreDataEventBus, CoreDataStore } from "../src/modules/core-data-store";
import { ListsController } from "../src/modules/lists/controller";
import { ListsDao } from "../src/modules/lists/dao";
import { ListsService } from "../src/modules/lists/service";
import { SectionsController } from "../src/modules/sections/controller";
import { SectionsDao } from "../src/modules/sections/dao";
import { SectionsService } from "../src/modules/sections/service";
import { TasksController } from "../src/modules/tasks/controller";
import { TasksDao } from "../src/modules/tasks/dao";
import { TasksService } from "../src/modules/tasks/service";

function buildHarness() {
  const store = new CoreDataStore();
  const eventBus = new CoreDataEventBus();
  const listsDao = new ListsDao(store, eventBus);
  const sectionsDao = new SectionsDao(store, eventBus);
  const tasksDao = new TasksDao(store, eventBus);
  const listsService = new ListsService(listsDao);
  const sectionsService = new SectionsService(sectionsDao, listsDao);
  const tasksService = new TasksService(tasksDao, listsDao, sectionsDao);
  const listsController = new ListsController(listsService);
  const sectionsController = new SectionsController(sectionsService);
  const tasksController = new TasksController(tasksService);

  return {
    store,
    eventBus,
    listsDao,
    sectionsDao,
    tasksDao,
    listsService,
    sectionsService,
    tasksService,
    listsController,
    sectionsController,
    tasksController
  };
}

function expectHttpError(fn: () => unknown, status: number, message: string) {
  try {
    fn();
    throw new Error("Expected function to throw");
  } catch (error) {
    expect(error).toHaveProperty("getStatus");
    expect((error as { getStatus: () => number }).getStatus()).toBe(status);
    expect((error as { getResponse: () => unknown }).getResponse()).toEqual(
      expect.objectContaining({ message })
    );
  }
}

describe("core-data-model-crud backend flows", () => {
  it("BE-E2E-DATA-001: list CRUD and soft delete keep the active list surface consistent", () => {
    const { listsController } = buildHarness();

    const first = listsController.create("user-a", { name: "Inbox" });
    const second = listsController.create("user-a", { name: "Backlog" });

    expect(first.sortOrder).toBe(0);
    expect(second.sortOrder).toBe(1);

    const reordered = listsController.reorder("user-a", second.id, { sortOrder: 0 });
    expect(reordered.sortOrder).toBe(0);

    const renamed = listsController.update("user-a", first.id, { name: "Today" });
    expect(renamed.name).toBe("Today");

    const deleted = listsController.delete("user-a", first.id);
    expect(deleted.isDeleted).toBe(true);
    expect(listsController.list("user-a").map((list) => list.id)).toEqual([second.id]);
  });

  it("BE-E2E-DATA-002: task CRUD, completion, and cascade delete remain stable", () => {
    const { listsController, sectionsController, tasksController } = buildHarness();

    const list = listsController.create("user-a", { name: "Inbox" });
    const section = sectionsController.create("user-a", { listId: list.id, name: "Focus" });
    const task = tasksController.create("user-a", {
      listId: list.id,
      sectionId: section.id,
      title: "Write tests",
      notes: "first slice"
    });
    const child = tasksController.create("user-a", {
      listId: list.id,
      sectionId: section.id,
      parentTaskId: task.id,
      title: "Check output"
    });

    const completed = tasksController.complete("user-a", task.id, { completed: true });
    expect(completed.completed).toBe(true);
    expect(completed.completedAt).not.toBeNull();

    const updated = tasksController.update("user-a", task.id, { title: "Write more tests" });
    expect(updated.title).toBe("Write more tests");

    const deletedSection = sectionsController.delete("user-a", section.id);
    expect(deletedSection.isDeleted).toBe(true);
    expect(tasksController.list("user-a", list.id)).toEqual([]);
    expectHttpError(
      () => tasksController.delete("user-a", child.id),
      404,
      `Task ${child.id} was not found`
    );
  });

  it("BE-E2E-DATA-003: hierarchy and cross-list validation block invalid nesting", () => {
    const { listsController, sectionsController, tasksController } = buildHarness();

    const listOne = listsController.create("user-a", { name: "One" });
    const listTwo = listsController.create("user-a", { name: "Two" });
    const sectionOne = sectionsController.create("user-a", { listId: listOne.id, name: "A" });
    const sectionTwo = sectionsController.create("user-a", { listId: listTwo.id, name: "B" });

    const root = tasksController.create("user-a", {
      listId: listOne.id,
      sectionId: sectionOne.id,
      title: "Root"
    });
    const child = tasksController.create("user-a", {
      listId: listOne.id,
      sectionId: sectionOne.id,
      parentTaskId: root.id,
      title: "Child"
    });
    const grandchild = tasksController.create("user-a", {
      listId: listOne.id,
      sectionId: sectionOne.id,
      parentTaskId: child.id,
      title: "Grandchild"
    });

    expectHttpError(
      () =>
        tasksController.create("user-a", {
          listId: listOne.id,
          sectionId: sectionTwo.id,
          title: "Wrong section"
        }),
      400,
      "Section must belong to the same list as the task"
    );

    expectHttpError(
      () =>
        tasksController.create("user-a", {
          listId: listOne.id,
          sectionId: sectionOne.id,
          parentTaskId: grandchild.id,
          title: "Too deep"
        }),
      400,
      "Task nesting depth cannot exceed 3 levels"
    );
  });

  it("BE-E2E-DATA-005: ownership checks reject another user's records", () => {
    const { listsController, sectionsController, tasksController } = buildHarness();

    const list = listsController.create("user-a", { name: "Owned" });
    const section = sectionsController.create("user-a", { listId: list.id, name: "Owned section" });
    const task = tasksController.create("user-a", {
      listId: list.id,
      sectionId: section.id,
      title: "Owned task"
    });

    expectHttpError(() => listsController.update("user-b", list.id, { name: "Nope" }), 404, `List ${list.id} was not found`);
    expectHttpError(
      () => sectionsController.update("user-b", section.id, { name: "Nope" }),
      404,
      `Section ${section.id} was not found`
    );
    expectHttpError(
      () => tasksController.update("user-b", task.id, { title: "Nope" }),
      404,
      `Task ${task.id} was not found`
    );
  });

  it("BE-E2E-DATA-004: mutations stay consistent and emit the documented events", () => {
    const { listsController, sectionsController, tasksController, eventBus } = buildHarness();
    const events: string[] = [];

    eventBus.on("list:updated", () => events.push("list:updated"));
    eventBus.on("section:updated", () => events.push("section:updated"));
    eventBus.on("task:created", () => events.push("task:created"));
    eventBus.on("task:updated", () => events.push("task:updated"));
    eventBus.on("task:deleted", () => events.push("task:deleted"));

    const list = listsController.create("user-a", { name: "Inbox" });
    const section = sectionsController.create("user-a", { listId: list.id, name: "Work" });
    const task = tasksController.create("user-a", {
      listId: list.id,
      sectionId: section.id,
      title: "Ship slice"
    });

    tasksController.update("user-a", task.id, { completed: true });
    tasksController.delete("user-a", task.id);

    expect(events).toEqual([
      "list:updated",
      "section:updated",
      "task:created",
      "task:updated",
      "task:deleted"
    ]);
  });

  it("BE-E2E-DATA-005: unauthenticated requests are rejected before CRUD access", () => {
    const { listsController } = buildHarness();

    expectHttpError(
      () => listsController.list(undefined),
      401,
      "Missing authenticated user context"
    );
  });
});
