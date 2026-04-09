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
import { AnalyticsInsightsController } from "../src/modules/analytics-insights/controller";
import { AnalyticsInsightsDao } from "../src/modules/analytics-insights/dao";
import { AnalyticsInsightsService } from "../src/modules/analytics-insights/service";

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
  const analyticsDao = new AnalyticsInsightsDao(tasksDao, focusDao);
  const analyticsService = new AnalyticsInsightsService(analyticsDao);
  const analyticsController = new AnalyticsInsightsController(analyticsService);

  return {
    listsController,
    sectionsController,
    tasksController,
    tasksDao,
    focusController,
    analyticsController
  };
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

describe("analytics-insights backend flows", () => {
  it("BE-UNIT-AIN-001 and BE-E2E-AIN-001: consistency calculations honor the grace window and expose traceable explanation refs", () => {
    const harness = buildHarness();
    const taskA = createTask(harness, "user-a", "Write analytics service");
    const taskB = createTask(harness, "user-a", "Review copy");

    harness.tasksDao.update("user-a", taskA.id, {
      completed: true,
      completedAt: "2026-04-07T18:15:00.000Z",
      status: "completed"
    });
    harness.tasksDao.update("user-a", taskB.id, {
      completed: true,
      completedAt: "2026-04-08T09:30:00.000Z",
      status: "completed"
    });

    const summary = harness.analyticsController.getSummary("user-a", "this-week");

    expect(summary.streakSummary).toEqual(
      expect.objectContaining({
        currentStreak: 2,
        bestStreak: 2,
        lastActiveDate: "2026-04-08"
      })
    );
    expect(summary.explanationRefs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "task-completion",
          sourceId: taskA.id,
          label: "Write analytics service"
        }),
        expect.objectContaining({
          source: "task-completion",
          sourceId: taskB.id,
          label: "Review copy"
        })
      ])
    );
  });

  it("BE-UNIT-AIN-002 and BE-UNIT-AIN-004: weekly summaries and hardest-task highlights stay reporting-only and explain their inputs", () => {
    const harness = buildHarness();
    const hardTask = createTask(harness, "user-a", "File taxes");
    const lighterTask = createTask(harness, "user-a", "Water plants");

    harness.tasksController.update("user-a", hardTask.id, {
      priority: "high",
      resistance: "DREAD",
      dueDate: "2026-04-05T12:00:00.000Z"
    });
    harness.tasksController.update("user-a", lighterTask.id, {
      priority: "low",
      resistance: "NONE"
    });

    harness.tasksDao.update("user-a", hardTask.id, {
      completed: true,
      completedAt: "2026-04-07T10:00:00.000Z",
      status: "completed"
    });
    harness.tasksDao.update("user-a", lighterTask.id, {
      completed: true,
      completedAt: "2026-04-07T11:00:00.000Z",
      status: "completed"
    });

    const started = harness.focusController.start("user-a", {
      taskId: hardTask.id,
      durationMinutes: 25,
      breakDurationMinutes: 5,
      startedAt: "2026-04-07T08:30:00.000Z"
    });
    harness.focusController.end("user-a", started.id, { at: "2026-04-07T09:05:00.000Z" });

    const summary = harness.analyticsController.getSummary("user-a", "this-week");

    expect(summary.weeklySummary).toEqual(
      expect.objectContaining({
        completedTaskCount: 2,
        completedFocusSessionCount: 1,
        focusMinutes: 35,
        activeDays: 1
      })
    );
    expect(summary.hardestTaskHighlight).toEqual(
      expect.objectContaining({
        taskId: hardTask.id,
        title: "File taxes",
        focusMinutes: 35
      })
    );
    expect(summary.hardestTaskHighlight?.explanation).toContain("overdue recovery");
    expect(summary.hardestTaskHighlight?.explanationRefs).toEqual(
      expect.arrayContaining([expect.objectContaining({ source: "focus-session" })])
    );
  });

  it("BE-UNIT-AIN-003 and BE-E2E-AIN-002: heatmap buckets aggregate by day and stay read-only", () => {
    const harness = buildHarness();
    const task = createTask(harness, "user-a", "Heatmap task");

    harness.tasksDao.update("user-a", task.id, {
      completed: true,
      completedAt: "2026-04-06T08:15:00.000Z",
      status: "completed"
    });

    const started = harness.focusController.start("user-a", {
      taskId: task.id,
      durationMinutes: 20,
      breakDurationMinutes: 5,
      startedAt: "2026-04-06T09:00:00.000Z"
    });
    harness.focusController.end("user-a", started.id, { at: "2026-04-06T09:32:00.000Z" });

    const beforeTaskState = harness.tasksController.get("user-a", task.id);
    const heatmap = harness.analyticsController.getHeatmap("user-a", "last-28-days");
    const afterTaskState = harness.tasksController.get("user-a", task.id);
    const bucket = heatmap.buckets.find((entry: { date: string }) => entry.date === "2026-04-06");

    expect(bucket).toEqual(
      expect.objectContaining({
        completedTaskCount: 1,
        focusSessionCount: 1,
        focusMinutes: 32
      })
    );
    expect(bucket?.explanationRefs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "task-completion", sourceId: task.id }),
        expect.objectContaining({ source: "focus-session", sourceId: started.id })
      ])
    );
    expect(afterTaskState).toEqual(beforeTaskState);
  });
});
