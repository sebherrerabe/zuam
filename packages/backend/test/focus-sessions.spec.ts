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
import { FocusSessionsController } from "../src/modules/focus-sessions/controller";
import { FocusSessionsDao } from "../src/modules/focus-sessions/dao";
import { FocusSessionsEventBus } from "../src/modules/focus-sessions/events";
import { FocusSessionsService } from "../src/modules/focus-sessions/service";

function buildHarness() {
  const store = new CoreDataStore();
  const events = new CoreDataEventBus();
  const listsDao = new ListsDao(store, events);
  const sectionsDao = new SectionsDao(store, events);
  const tasksDao = new TasksDao(store, events);
  const listsService = new ListsService(listsDao);
  const sectionsService = new SectionsService(sectionsDao, listsDao);
  const tasksService = new TasksService(tasksDao, listsDao, sectionsDao);
  const listsController = new ListsController(listsService);
  const sectionsController = new SectionsController(sectionsService);
  const tasksController = new TasksController(tasksService);
  const focusDao = new FocusSessionsDao();
  const focusEvents = new FocusSessionsEventBus();
  const focusService = new FocusSessionsService(tasksDao, focusDao, focusEvents);
  const focusController = new FocusSessionsController(focusService);

  return {
    listsController,
    sectionsController,
    tasksController,
    focusDao,
    focusEvents,
    focusService,
    focusController
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

function createTask(harness: ReturnType<typeof buildHarness>, userId: string, title: string) {
  const list = harness.listsController.create(userId, { name: "Inbox" });
  const section = harness.sectionsController.create(userId, { listId: list.id, name: "Focus" });

  return harness.tasksController.create(userId, {
    listId: list.id,
    sectionId: section.id,
    title
  });
}

describe("focus-sessions backend flows", () => {
  it("BE-UNIT-FCS-001: repeated starts are idempotent for the same active task and reject a second active timer", () => {
    const harness = buildHarness();
    const taskA = createTask(harness, "user-a", "Write focus tests");
    const taskB = createTask(harness, "user-a", "Write calendar tests");

    const started = harness.focusController.start("user-a", {
      taskId: taskA.id,
      durationMinutes: 20,
      breakDurationMinutes: 5,
      startedAt: "2026-04-07T10:00:00.000Z"
    });
    const duplicate = harness.focusController.start("user-a", {
      taskId: taskA.id,
      durationMinutes: 20,
      breakDurationMinutes: 5,
      startedAt: "2026-04-07T10:05:00.000Z"
    });

    expect(duplicate.id).toBe(started.id);
    expect(harness.focusController.list("user-a")).toHaveLength(1);

    expectHttpError(
      () =>
        harness.focusController.start("user-a", {
          taskId: taskB.id,
          durationMinutes: 20,
          breakDurationMinutes: 5,
          startedAt: "2026-04-07T10:06:00.000Z"
        }),
      409,
      "A focus session is already active for this user"
    );
  });

  it("BE-UNIT-FCS-002 and BE-E2E-FCS-001/002: pause, break, reconnect, and end persist the session and roll up task time", () => {
    const harness = buildHarness();
    const task = createTask(harness, "user-a", "Write session history");
    const lifecycleEvents: string[] = [];

    harness.focusEvents.on("focus:start", () => lifecycleEvents.push("focus:start"));
    harness.focusEvents.on("focus:pause", () => lifecycleEvents.push("focus:pause"));
    harness.focusEvents.on("focus:break-start", () => lifecycleEvents.push("focus:break-start"));
    harness.focusEvents.on("focus:break-end", () => lifecycleEvents.push("focus:break-end"));
    harness.focusEvents.on("focus:end", () => lifecycleEvents.push("focus:end"));

    const started = harness.focusController.start("user-a", {
      taskId: task.id,
      durationMinutes: 20,
      breakDurationMinutes: 5,
      startedAt: "2026-04-07T10:00:00.000Z"
    });
    expect(started.state).toBe("running");

    const paused = harness.focusController.pause("user-a", started.id, {
      at: "2026-04-07T10:10:00.000Z"
    });
    expect(paused.state).toBe("paused");
    expect(harness.focusController.sync("user-a")).toEqual(
      expect.objectContaining({
        runtimeState: "paused",
        currentSession: expect.objectContaining({
          id: started.id,
          state: "paused"
        })
      })
    );

    const onBreak = harness.focusController.break("user-a", started.id, {
      at: "2026-04-07T10:12:00.000Z"
    });
    expect(onBreak.state).toBe("break");
    expect(harness.focusController.sync("user-a")).toEqual(
      expect.objectContaining({
        runtimeState: "break",
        currentSession: expect.objectContaining({
          id: started.id,
          state: "break"
        })
      })
    );

    const resumed = harness.focusController.resume("user-a", started.id, {
      at: "2026-04-07T10:17:00.000Z"
    });
    expect(resumed.state).toBe("running");
    expect(harness.focusController.sync("user-a")).toEqual(
      expect.objectContaining({
        runtimeState: "running",
        currentSession: expect.objectContaining({
          id: started.id,
          state: "running"
        })
      })
    );

    const ended = harness.focusController.end("user-a", started.id, {
      at: "2026-04-07T10:32:00.000Z"
    });

    expect(ended).toEqual(
      expect.objectContaining({
        session: expect.objectContaining({
          id: started.id,
          state: "completed",
          endedAt: "2026-04-07T10:32:00.000Z",
          loggedMinutes: 25,
          extraMinutes: 5
        }),
        taskRollup: expect.objectContaining({
          taskId: task.id,
          totalFocusMinutes: 25,
          extraMinutes: 5,
          sessionCount: 1
        })
      })
    );
    expect(harness.focusDao.getTaskRollup("user-a", task.id)).toEqual(
      expect.objectContaining({
        totalFocusMinutes: 25,
        extraMinutes: 5,
        sessionCount: 1,
        lastSessionId: started.id
      })
    );
    expect(harness.focusController.sync("user-a")).toEqual(
      expect.objectContaining({
        runtimeState: "idle",
        currentSession: null
      })
    );
    expect(lifecycleEvents).toEqual([
      "focus:start",
      "focus:pause",
      "focus:break-start",
      "focus:break-end",
      "focus:end"
    ]);
  });
});
