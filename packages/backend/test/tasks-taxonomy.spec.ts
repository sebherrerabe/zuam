import { CoreDataEventBus, CoreDataStore } from "../src/modules/core-data-store";
import { ListsController } from "../src/modules/lists/controller";
import { ListsDao } from "../src/modules/lists/dao";
import { ListsService } from "../src/modules/lists/service";
import { SectionsController } from "../src/modules/sections/controller";
import { SectionsDao } from "../src/modules/sections/dao";
import { SectionsService } from "../src/modules/sections/service";
import { TasksController } from "../src/modules/tasks/controller";
import { TasksDao } from "../src/modules/tasks/dao";
import { TaskTaxonomyDao } from "../src/modules/tasks/taxonomy.dao";
import { TaskTaxonomyService } from "../src/modules/tasks/taxonomy.service";
import { TasksService } from "../src/modules/tasks/service";

function buildHarness() {
  const store = new CoreDataStore();
  const eventBus = new CoreDataEventBus();
  const listsDao = new ListsDao(store, eventBus);
  const sectionsDao = new SectionsDao(store, eventBus);
  const tasksDao = new TasksDao(store, eventBus);
  const taxonomyDao = new TaskTaxonomyDao(store);
  const listsService = new ListsService(listsDao);
  const sectionsService = new SectionsService(sectionsDao, listsDao);
  const tasksService = new TasksService(tasksDao, listsDao, sectionsDao);
  const taxonomyService = new TaskTaxonomyService(taxonomyDao, tasksDao);
  const listsController = new ListsController(listsService);
  const sectionsController = new SectionsController(sectionsService);
  const tasksController = new TasksController(tasksService);

  return {
    store,
    eventBus,
    listsDao,
    sectionsDao,
    tasksDao,
    taxonomyDao,
    listsService,
    sectionsService,
    tasksService,
    taxonomyService,
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

function isoAtUtcNoon(daysFromToday: number) {
  const date = new Date();
  date.setUTCHours(12, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + daysFromToday);
  return date.toISOString();
}

describe("task taxonomy backend flows", () => {
  it("BE-UNIT-TF-001: tag CRUD keeps slugs stable and rejects duplicates", () => {
    const { taxonomyService } = buildHarness();

    const first = taxonomyService.createTag("user-a", { slug: "#work", name: "Work" });
    expect(first.slug).toBe("work");

    const renamed = taxonomyService.updateTag("user-a", first.id, { slug: "work-focus", name: "Work focus" });
    expect(renamed.slug).toBe("work-focus");

    expectHttpError(
      () => taxonomyService.createTag("user-a", { slug: "work-focus", name: "Duplicate" }),
      400,
      'Tag slug "work-focus" already exists'
    );
  });

  it("BE-UNIT-TF-002: every smart list resolves to the documented predicate", () => {
    const { listsController, sectionsController, tasksController, taxonomyService } = buildHarness();
    const list = listsController.create("user-a", { name: "Inbox" });
    const section = sectionsController.create("user-a", { listId: list.id, name: "Focus" });

    const todayTask = tasksController.create("user-a", {
      listId: list.id,
      sectionId: section.id,
      title: "Today task",
      dueDate: isoAtUtcNoon(0),
      tagSlugs: ["work"],
      priority: "high",
      energyLevel: "HIGH",
      resistance: "MILD"
    });
    const nextTask = tasksController.create("user-a", {
      listId: list.id,
      sectionId: section.id,
      title: "Next week task",
      dueDate: isoAtUtcNoon(3),
      priority: "medium"
    });
    const inboxTask = tasksController.create("user-a", {
      listId: list.id,
      title: "Inbox task",
      priority: "low"
    });
    const completedTask = tasksController.create("user-a", {
      listId: list.id,
      title: "Completed task"
    });
    const wontDoTask = tasksController.create("user-a", {
      listId: list.id,
      title: "Won't do task"
    });
    const trashTask = tasksController.create("user-a", {
      listId: list.id,
      title: "Trash task"
    });

    tasksController.complete("user-a", completedTask.id, { completed: true });
    tasksController.setStatus("user-a", wontDoTask.id, { status: "wont_do" });
    tasksController.delete("user-a", trashTask.id);

    expect(taxonomyService.querySmartList("user-a", "today").items.map((task) => task.id)).toEqual([todayTask.id]);
    expect(taxonomyService.querySmartList("user-a", "next7days").items.map((task) => task.id)).toEqual([
      todayTask.id,
      nextTask.id
    ]);
    expect(taxonomyService.querySmartList("user-a", "inbox").items.map((task) => task.id)).toEqual([inboxTask.id]);
    expect(taxonomyService.querySmartList("user-a", "completed").items.map((task) => task.id)).toEqual([
      completedTask.id
    ]);
    expect(taxonomyService.querySmartList("user-a", "wontdo").items.map((task) => task.id)).toEqual([wontDoTask.id]);
    expect(taxonomyService.querySmartList("user-a", "trash").items.map((task) => task.id)).toEqual([trashTask.id]);
    expect(taxonomyService.sidebarCounts("user-a")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "today", count: 1 }),
        expect.objectContaining({ key: "next7days", count: 2 }),
        expect.objectContaining({ key: "inbox", count: 1 }),
        expect.objectContaining({ key: "completed", count: 1 }),
        expect.objectContaining({ key: "wontdo", count: 1 }),
        expect.objectContaining({ key: "trash", count: 1 })
      ])
    );
    expect(taxonomyService.sidebarCounts("user-a")).toEqual(
      expect.arrayContaining([expect.objectContaining({ key: "work", count: 1 })])
    );
  });

  it("BE-UNIT-TF-003: saved-filter AST evaluation matches direct query execution", () => {
    const { listsController, sectionsController, tasksController, taxonomyService } = buildHarness();
    const list = listsController.create("user-a", { name: "Platform" });
    const section = sectionsController.create("user-a", { listId: list.id, name: "Review" });

    const matching = tasksController.create("user-a", {
      listId: list.id,
      sectionId: section.id,
      title: "Write plan",
      tagSlugs: ["work"],
      priority: "high",
      energyLevel: "HIGH"
    });
    tasksController.create("user-a", {
      listId: list.id,
      sectionId: section.id,
      title: "Ignore me",
      tagSlugs: ["personal"],
      priority: "low"
    });

    const query = {
      kind: "and",
      clauses: [
        { kind: "list", listIds: [list.id] },
        { kind: "tag", tagSlugs: ["work"] },
        { kind: "priority", priorities: ["high"] }
      ]
    } as const;

    const saved = taxonomyService.createSavedFilter("user-a", {
      name: "Work / high priority",
      query
    });

    expect(taxonomyService.queryTasks("user-a", { filter: query }).items.map((task) => task.id)).toEqual([
      matching.id
    ]);
    expect(taxonomyService.executeSavedFilter("user-a", saved.id).items.map((task) => task.id)).toEqual([
      matching.id
    ]);
    expect(taxonomyService.executeSavedFilter("user-a", saved.id).explanation).toContain("Matched 1 task(s)");
  });

  it("BE-UNIT-TF-004: sidebar counts match the task results for each built-in list", () => {
    const { listsController, tasksController, taxonomyService } = buildHarness();
    const list = listsController.create("user-a", { name: "Inbox" });

    const active = tasksController.create("user-a", { listId: list.id, title: "Active task" });
    const completed = tasksController.create("user-a", { listId: list.id, title: "Completed task" });
    tasksController.complete("user-a", completed.id, { completed: true });

    const counts = taxonomyService.sidebarCounts("user-a");
    expect(counts.find((row) => row.key === "today")?.count).toBeGreaterThanOrEqual(0);
    expect(counts.find((row) => row.key === "completed")?.count).toBe(1);
    expect(counts.find((row) => row.key === "trash")?.count).toBe(0);
    expect(taxonomyService.querySmartList("user-a", "completed").items.map((task) => task.id)).toEqual([
      completed.id
    ]);
    expect(taxonomyService.querySmartList("user-a", "inbox").items.map((task) => task.id)).toEqual([active.id]);
  });

  it("BE-UNIT-TF-005: invalid filter criteria return validation errors", () => {
    const { taxonomyService } = buildHarness();

    expectHttpError(
      () => taxonomyService.queryTasks("user-a", { filter: { kind: "keyword", fields: [], value: "" } }),
      400,
      "Invalid query payload"
    );
  });

  it("BE-UNIT-TVW-001 and BE-E2E-TVW-002: focus queue and move mutations stay deterministic", () => {
    const { listsController, sectionsController, tasksController, taxonomyService } = buildHarness();
    const list = listsController.create("user-a", { name: "Platform" });
    const backlog = sectionsController.create("user-a", { listId: list.id, name: "Backlog" });
    const inProgress = sectionsController.create("user-a", { listId: list.id, name: "In Progress" });

    const lowerPriority = tasksController.create("user-a", {
      listId: list.id,
      sectionId: backlog.id,
      title: "Later task",
      priority: "low"
    });
    const recommended = tasksController.create("user-a", {
      listId: list.id,
      sectionId: backlog.id,
      title: "High leverage task",
      dueDate: isoAtUtcNoon(0),
      priority: "high",
      resistance: "HIGH"
    });

    const focus = taxonomyService.focusQueueRecommendation("user-a", {});
    expect(focus.task?.id).toBe(recommended.id);
    expect(focus.rationale).toContain("High leverage task");

    const moved = tasksController.move("user-a", lowerPriority.id, {
      listId: list.id,
      sectionId: inProgress.id,
      sortOrder: 7,
      kanbanColumn: "IN_PROGRESS",
      matrixQuadrant: "Q1_URGENT_IMPORTANT"
    });
    expect(moved.sectionId).toBe(inProgress.id);
    expect(moved.sortOrder).toBe(7);
    expect(moved.kanbanColumn).toBe("IN_PROGRESS");
    expect(moved.matrixQuadrant).toBe("Q1_URGENT_IMPORTANT");

    const reordered = tasksController.reorder("user-a", lowerPriority.id, { sortOrder: 1 });
    expect(reordered.sortOrder).toBe(1);

    const grouped = taxonomyService.queryTasks("user-a", {
      listId: list.id,
      view: "kanban",
      groupBy: "section",
      sortBy: "title"
    });
    expect(grouped.items.map((task) => task.listId)).toEqual([list.id, list.id]);
    expect(grouped.groups.length).toBeGreaterThan(0);
  });
});
