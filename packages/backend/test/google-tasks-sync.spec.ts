import { CoreDataEventBus, CoreDataStore } from "../src/modules/core-data-store";
import { ListsController } from "../src/modules/lists/controller";
import { ListsDao } from "../src/modules/lists/dao";
import { ListsService } from "../src/modules/lists/service";
import { SectionsDao } from "../src/modules/sections/dao";
import { TasksController } from "../src/modules/tasks/controller";
import { TasksDao } from "../src/modules/tasks/dao";
import { TasksService } from "../src/modules/tasks/service";
import { GoogleTasksSyncController } from "../src/modules/google-tasks-sync/controller";
import { GoogleTasksSyncDao } from "../src/modules/google-tasks-sync/dao";
import { FakeGoogleTasksProviderClient } from "../src/modules/google-tasks-sync/provider";
import { GoogleTasksSyncEventBus, GoogleTasksSyncService } from "../src/modules/google-tasks-sync/service";

function buildHarness() {
  const store = new CoreDataStore();
  const events = new CoreDataEventBus();
  const listsDao = new ListsDao(store, events);
  const sectionsDao = new SectionsDao(store, events);
  const tasksDao = new TasksDao(store, events);
  const listsService = new ListsService(listsDao);
  const tasksService = new TasksService(tasksDao, listsDao, sectionsDao);
  const listsController = new ListsController(listsService);
  const tasksController = new TasksController(tasksService);
  const syncDao = new GoogleTasksSyncDao(store, events);
  const provider = new FakeGoogleTasksProviderClient();
  const syncEvents = new GoogleTasksSyncEventBus();
  const syncService = new GoogleTasksSyncService(syncDao, provider, events, syncEvents);
  const syncController = new GoogleTasksSyncController(syncService);

  return {
    store,
    events,
    listsDao,
    sectionsDao,
    tasksDao,
    listsService,
    tasksService,
    listsController,
    tasksController,
    syncDao,
    provider,
    syncEvents,
    syncService,
    syncController
  };
}

describe("google-tasks-sync backend flows", () => {
  it("BE-E2E-SYNC-001: first force sync imports remote lists and tasks with stable local records", () => {
    const { provider, syncController, syncDao, listsController, tasksController } = buildHarness();
    provider.connect("user-a");

    provider.seedRemoteState("user-a", {
      lists: [
        { id: "remote-list-a", title: "Inbox", updatedAt: "2026-04-07T10:00:00.000Z", isDeleted: false },
        { id: "remote-list-a", title: "Inbox", updatedAt: "2026-04-07T10:00:00.000Z", isDeleted: false }
      ],
      tasks: [
        {
          id: "remote-task-a",
          listId: "remote-list-a",
          title: "Write tests",
          notes: "seed",
          dueDate: null,
          completed: false,
          completedAt: null,
          parentTaskId: null,
          updatedAt: "2026-04-07T10:01:00.000Z",
          isDeleted: false
        },
        {
          id: "remote-task-a",
          listId: "remote-list-a",
          title: "Write tests",
          notes: "seed",
          dueDate: null,
          completed: false,
          completedAt: null,
          parentTaskId: null,
          updatedAt: "2026-04-07T10:01:00.000Z",
          isDeleted: false
        }
      ]
    });

    const response = syncController.forceSync("user-a", { scope: "full" });
    expect(response).toEqual({ started: true, syncId: expect.any(String) });

    expect(listsController.list("user-a").map((list) => list.name)).toEqual(["Inbox"]);
    expect(tasksController.list("user-a").map((task) => task.title)).toEqual(["Write tests"]);
    expect(syncDao.getStatus("user-a")).toEqual(
      expect.objectContaining({
        googleTasksStatus: "ready",
        googleTasksLastError: null,
        googleTasksLastSyncAt: expect.any(String),
        googleTasksCursor: "2026-04-07T10:01:00.000Z"
      })
    );
  });

  it("BE-E2E-SYNC-002: webhook signals trigger incremental sync and merge the latest remote update", () => {
    const { provider, syncController, tasksController, syncEvents } = buildHarness();
    provider.connect("user-a");

    provider.seedRemoteState("user-a", {
      lists: [{ id: "remote-list-a", title: "Inbox", updatedAt: "2026-04-07T10:00:00.000Z", isDeleted: false }],
      tasks: [
        {
          id: "remote-task-a",
          listId: "remote-list-a",
          title: "Seed task",
          notes: null,
          dueDate: null,
          completed: false,
          completedAt: null,
          parentTaskId: null,
          updatedAt: "2026-04-07T10:01:00.000Z",
          isDeleted: false
        }
      ]
    });

    syncController.forceSync("user-a", { scope: "full" });
    const webhookToken = provider.getWebhookToken("user-a");
    provider.upsertTask("user-a", {
      id: "remote-task-a",
      listId: "remote-list-a",
      title: "Updated from Google",
      notes: null,
      dueDate: null,
      completed: false,
      completedAt: null,
      parentTaskId: null,
      updatedAt: "2026-04-07T10:02:00.000Z"
    });

    const completedEvents: unknown[] = [];
    syncEvents.on("sync:completed", (event) => completedEvents.push(event));

    const result = syncController.webhook({ userId: "user-a", token: webhookToken });
    expect(result).toEqual({ accepted: true });
    expect(tasksController.list("user-a").map((task) => task.title)).toEqual(["Updated from Google"]);
    expect(completedEvents).toHaveLength(1);
    expect(syncController.status("user-a")).toEqual(
      expect.objectContaining({
        googleTasksStatus: "ready",
        googleTasksLastError: null
      })
    );
  });

  it("BE-E2E-SYNC-003: Google wins for synced fields while local app state stays deterministic", () => {
    const { provider, syncController, tasksController, store, events } = buildHarness();
    provider.connect("user-a");

    provider.seedRemoteState("user-a", {
      lists: [{ id: "remote-list-a", title: "Inbox", updatedAt: "2026-04-07T10:00:00.000Z", isDeleted: false }],
      tasks: [
        {
          id: "remote-task-a",
          listId: "remote-list-a",
          title: "Remote title",
          notes: "remote notes",
          dueDate: null,
          completed: false,
          completedAt: null,
          parentTaskId: null,
          updatedAt: "2026-04-07T10:01:00.000Z",
          isDeleted: false
        }
      ]
    });

    syncController.forceSync("user-a", { scope: "full" });
    const localTask = tasksController.list("user-a")[0]!;
    const localId = localTask.id;

    const titleUpdates: string[] = [];
    events.on("task:updated", (task) => titleUpdates.push(task.title));

    store.tasks.set(localId, {
      ...localTask,
      title: "Local title",
      updatedAt: "2026-04-07T10:01:30.000Z"
    });

    provider.upsertTask("user-a", {
      id: "remote-task-a",
      listId: "remote-list-a",
      title: "Google title",
      notes: "remote notes",
      dueDate: null,
      completed: false,
      completedAt: null,
      parentTaskId: null,
      updatedAt: "2026-04-07T10:03:00.000Z"
    });

    syncController.forceSync("user-a", { scope: "incremental" });

    expect(tasksController.list("user-a")[0]!.title).toBe("Google title");
    expect(titleUpdates).toContain("Google title");
  });

  it("BE-E2E-SYNC-004: app-only fields survive Google merges intact", () => {
    const { provider, syncController, listsController, tasksController, store } = buildHarness();
    provider.connect("user-a");

    provider.seedRemoteState("user-a", {
      lists: [{ id: "remote-list-a", title: "Inbox", updatedAt: "2026-04-07T10:00:00.000Z", isDeleted: false }],
      tasks: [
        {
          id: "remote-task-a",
          listId: "remote-list-a",
          title: "Seed task",
          notes: null,
          dueDate: null,
          completed: false,
          completedAt: null,
          parentTaskId: null,
          updatedAt: "2026-04-07T10:01:00.000Z",
          isDeleted: false
        }
      ]
    });

    syncController.forceSync("user-a", { scope: "full" });
    const list = listsController.list("user-a")[0]!;
    const task = tasksController.list("user-a")[0]!;
    const sectionId = "section_local_a";

    store.sections.set(sectionId, {
      id: sectionId,
      userId: "user-a",
      listId: list.id,
      name: "App-only section",
      sortOrder: 0,
      isCollapsed: false,
      isDeleted: false,
      createdAt: "2026-04-07T10:02:00.000Z",
      updatedAt: "2026-04-07T10:02:00.000Z"
    });

    store.tasks.set(task.id, {
      ...task,
      sectionId,
      sortOrder: 99,
      updatedAt: "2026-04-07T10:02:30.000Z"
    });

    provider.upsertTask("user-a", {
      id: "remote-task-a",
      listId: "remote-list-a",
      title: "Remote title",
      notes: "remote notes",
      dueDate: null,
      completed: true,
      completedAt: "2026-04-07T10:03:00.000Z",
      parentTaskId: null,
      updatedAt: "2026-04-07T10:03:00.000Z"
    });

    syncController.forceSync("user-a", { scope: "incremental" });

    const mergedTask = tasksController.list("user-a")[0]!;
    expect(mergedTask.title).toBe("Remote title");
    expect(mergedTask.completed).toBe(true);
    expect(mergedTask.sectionId).toBe(sectionId);
    expect(mergedTask.sortOrder).toBe(99);
  });

  it("BE-E2E-SYNC-005: provider failures set a recoverable state and retry from the latest valid cursor", () => {
    const { provider, syncController, syncDao, tasksController } = buildHarness();
    provider.connect("user-a");

    provider.seedRemoteState("user-a", {
      lists: [{ id: "remote-list-a", title: "Inbox", updatedAt: "2026-04-07T10:00:00.000Z", isDeleted: false }],
      tasks: [
        {
          id: "remote-task-a",
          listId: "remote-list-a",
          title: "Seed task",
          notes: null,
          dueDate: null,
          completed: false,
          completedAt: null,
          parentTaskId: null,
          updatedAt: "2026-04-07T10:01:00.000Z",
          isDeleted: false
        }
      ]
    });

    syncController.forceSync("user-a", { scope: "full" });
    const cursorBeforeFailure = syncDao.getStatus("user-a").googleTasksCursor;

    provider.failNextSync("user-a", "Provider temporarily unavailable");
    provider.upsertTask("user-a", {
      id: "remote-task-a",
      listId: "remote-list-a",
      title: "Retry me",
      notes: null,
      dueDate: null,
      completed: false,
      completedAt: null,
      parentTaskId: null,
      updatedAt: "2026-04-07T10:04:00.000Z"
    });

    const failureResult = syncController.forceSync("user-a", { scope: "incremental" });
    expect(failureResult.started).toBe(true);
    expect(syncDao.getStatus("user-a")).toEqual(
      expect.objectContaining({
        googleTasksStatus: "failed",
        googleTasksLastError: "Provider temporarily unavailable",
        googleTasksCursor: cursorBeforeFailure
      })
    );
    expect(tasksController.list("user-a")[0]!.title).toBe("Seed task");

    const retryResult = syncController.forceSync("user-a", { scope: "incremental" });
    expect(retryResult.started).toBe(true);
    expect(tasksController.list("user-a")[0]!.title).toBe("Retry me");
    expect(syncDao.getStatus("user-a")).toEqual(
      expect.objectContaining({
        googleTasksStatus: "ready",
        googleTasksLastError: null,
        googleTasksCursor: "2026-04-07T10:04:00.000Z"
      })
    );
  });
});
