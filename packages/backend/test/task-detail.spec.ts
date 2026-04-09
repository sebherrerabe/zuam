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

describe("task detail backend flows", () => {
  it("BE-E2E-TDE-001: task detail round-trips through PATCH and GET with the documented Phase 1 fields", () => {
    const { listsController, sectionsController, tasksController } = buildHarness();
    const inbox = listsController.create("user-a", { name: "Inbox" });
    const today = listsController.create("user-a", { name: "Today" });
    const inboxSection = sectionsController.create("user-a", { listId: inbox.id, name: "Focus" });
    const todaySection = sectionsController.create("user-a", { listId: today.id, name: "Today" });

    const task = tasksController.create("user-a", {
      listId: inbox.id,
      sectionId: inboxSection.id,
      title: "Draft the task detail contract",
      notes: "Keep the edit surface narrow.",
      dueDate: "2026-04-07T12:00:00.000Z",
      priority: "high"
    });

    const updated = tasksController.update("user-a", task.id, {
      listId: today.id,
      sectionId: todaySection.id,
      title: "Draft the task detail contract v2",
      notes: "Keep the edit surface narrow and explicit.",
      dueDate: "2026-04-08T12:00:00.000Z",
      priority: "medium"
    });

    expect(updated).toMatchObject({
      id: task.id,
      listId: today.id,
      sectionId: todaySection.id,
      title: "Draft the task detail contract v2",
      notes: "Keep the edit surface narrow and explicit.",
      dueDate: "2026-04-08T12:00:00.000Z",
      priority: "medium"
    });

    expect(tasksController.get("user-a", task.id)).toEqual(
      expect.objectContaining({
        id: task.id,
        listId: today.id,
        sectionId: todaySection.id,
        title: "Draft the task detail contract v2",
        notes: "Keep the edit surface narrow and explicit.",
        dueDate: "2026-04-08T12:00:00.000Z",
        priority: "medium",
        completed: false,
        subtasks: []
      })
    );
  });

  it("BE-UNIT-TDE-002: empty titles and invalid due dates are rejected by the task detail mutation boundary", () => {
    const { listsController, sectionsController, tasksController } = buildHarness();
    const list = listsController.create("user-a", { name: "Inbox" });
    const section = sectionsController.create("user-a", { listId: list.id, name: "Focus" });
    const task = tasksController.create("user-a", {
      listId: list.id,
      sectionId: section.id,
      title: "Valid task"
    });

    expectHttpError(
      () =>
        tasksController.create("user-a", {
          listId: list.id,
          sectionId: section.id,
          title: "   "
        }),
      400,
      "Invalid task payload"
    );

    expectHttpError(
      () =>
        tasksController.update("user-a", task.id, {
          dueDate: "2026-04-07"
        }),
      400,
      "Invalid task payload"
    );
  });

  it("BE-E2E-TDE-003: immediate subtasks are returned from GET detail and child-task flows stay scoped", () => {
    const { listsController, sectionsController, tasksController } = buildHarness();
    const list = listsController.create("user-a", { name: "Inbox" });
    const section = sectionsController.create("user-a", { listId: list.id, name: "Focus" });

    const parent = tasksController.create("user-a", {
      listId: list.id,
      sectionId: section.id,
      title: "Parent task"
    });
    const firstChild = tasksController.create("user-a", {
      listId: list.id,
      sectionId: section.id,
      parentTaskId: parent.id,
      title: "First child"
    });
    const secondChild = tasksController.create("user-a", {
      listId: list.id,
      sectionId: section.id,
      parentTaskId: parent.id,
      title: "Second child"
    });
    const grandChild = tasksController.create("user-a", {
      listId: list.id,
      sectionId: section.id,
      parentTaskId: firstChild.id,
      title: "Grandchild"
    });

    const initialDetail = tasksController.get("user-a", parent.id);
    expect(initialDetail.subtasks.map((task) => task.id)).toEqual([firstChild.id, secondChild.id]);
    expect(initialDetail.subtasks.map((task) => task.title)).toEqual(["First child", "Second child"]);
    expect(initialDetail.subtasks.some((task) => task.id === grandChild.id)).toBe(false);

    const completedChild = tasksController.complete("user-a", firstChild.id, { completed: true });
    expect(completedChild.completed).toBe(true);

    tasksController.delete("user-a", secondChild.id);

    const refreshedDetail = tasksController.get("user-a", parent.id);
    expect(refreshedDetail.subtasks).toHaveLength(1);
    expect(refreshedDetail.subtasks[0]).toEqual(
      expect.objectContaining({
        id: firstChild.id,
        title: "First child",
        completed: true,
        parentTaskId: parent.id
      })
    );
    expect(refreshedDetail.subtasks.some((task) => task.id === secondChild.id)).toBe(false);
    expect(refreshedDetail.subtasks.some((task) => task.id === grandChild.id)).toBe(false);
  });
});
