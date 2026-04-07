import {
  NudgesController,
  NudgesDao,
  NudgesEventBus,
  NudgesService
} from "../src/modules/nudges";
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
import { selectNudgeCopy } from "@zuam/shared/nudges";

function buildHarness() {
  const store = new CoreDataStore();
  const coreEvents = new CoreDataEventBus();
  const listsDao = new ListsDao(store, coreEvents);
  const sectionsDao = new SectionsDao(store, coreEvents);
  const tasksDao = new TasksDao(store, coreEvents);
  const listsService = new ListsService(listsDao);
  const sectionsService = new SectionsService(sectionsDao, listsDao);
  const tasksService = new TasksService(tasksDao, listsDao, sectionsDao);
  const listsController = new ListsController(listsService);
  const sectionsController = new SectionsController(sectionsService);
  const tasksController = new TasksController(tasksService);
  const nudgeEvents = new NudgesEventBus();
  const nudgesDao = new NudgesDao();
  const nudgesService = new NudgesService(tasksDao, nudgesDao, nudgeEvents);
  const nudgesController = new NudgesController(nudgesService);

  return {
    listsController,
    sectionsController,
    tasksController,
    nudgesDao,
    nudgesService,
    nudgesController,
    nudgeEvents
  };
}

function createTask(harness: ReturnType<typeof buildHarness>, userId: string, input: Record<string, unknown>) {
  const list = harness.listsController.create(userId, { name: "Inbox" });
  const section = harness.sectionsController.create(userId, { listId: list.id, name: "Focus" });

  return harness.tasksController.create(userId, {
    listId: list.id,
    sectionId: section.id,
    title: "Write nudge tests",
    ...input
  });
}

describe("nudge-engine backend flows", () => {
  it("NUDGE-BE-001: scheduler selects level 1 by default and escalates to level 2 only when configured rules are met", () => {
    const harness = buildHarness();
    const now = new Date("2026-04-07T10:00:00.000Z");
    const overdue = new Date("2026-04-06T10:00:00.000Z");
    const taskOne = createTask(harness, "user-a", { dueDate: overdue.toISOString() });
    const taskTwo = createTask(harness, "user-a", { dueDate: overdue.toISOString() });

    harness.nudgesDao.upsertTaskProfile("user-a", taskOne.id, {
      resistance: "mild",
      urgency: "medium",
      estimateMinutes: 25,
      nudgeEscalation: false,
      nudgeFrequencyMin: 30,
      timesPostponed: 0,
      timesNudged: 0,
      snoozedUntil: null,
      activeEventId: null
    });

    harness.nudgesDao.upsertTaskProfile("user-a", taskTwo.id, {
      resistance: "high",
      urgency: "high",
      estimateMinutes: 40,
      nudgeEscalation: true,
      nudgeFrequencyMin: 30,
      timesPostponed: 1,
      timesNudged: 0,
      snoozedUntil: null,
      activeEventId: null
    });

    const triggered = harness.nudgesService.runScheduler("user-a", now);

    expect(triggered).toHaveLength(2);
    expect(triggered.find((event) => event.taskId === taskOne.id)).toMatchObject({
      level: 1,
      requiresExplicitDismissal: false,
      canAutoDismiss: true
    });
    expect(triggered.find((event) => event.taskId === taskTwo.id)).toMatchObject({
      level: 2,
      requiresExplicitDismissal: true,
      canAutoDismiss: false
    });
  });

  it("NUDGE-BE-002: level 2 payload includes the task, estimate, reason, and explicit dismissal rule", () => {
    const harness = buildHarness();
    const now = new Date("2026-04-07T10:00:00.000Z");
    const overdue = new Date("2026-04-06T10:00:00.000Z");
    const task = createTask(harness, "user-a", { dueDate: overdue.toISOString() });

    harness.nudgesDao.upsertTaskProfile("user-a", task.id, {
      resistance: "dread",
      urgency: "high",
      estimateMinutes: 50,
      nudgeEscalation: true,
      nudgeFrequencyMin: 15,
      timesPostponed: 2,
      timesNudged: 0,
      snoozedUntil: null,
      activeEventId: null
    });

    const [event] = harness.nudgesService.runScheduler("user-a", now);
    expect(event).toBeDefined();

    expect(event!).toMatchObject({
      taskId: task.id,
      level: 2,
      reason: "Task was postponed",
      estimateMinutes: 50,
      requiresExplicitDismissal: true,
      canAutoDismiss: false,
      deliveredAt: now.toISOString()
    });
    expect(event!.message).toContain(task.title);
    expect(event!.autoDismissAfter).toBeNull();
  });

  it("NUDGE-BE-003: snooze, postpone, and acknowledge mutations update task state and event history consistently", () => {
    const harness = buildHarness();
    const now = new Date("2026-04-07T10:00:00.000Z");
    const overdue = new Date("2026-04-06T10:00:00.000Z");
    const snoozedTask = createTask(harness, "user-a", { dueDate: overdue.toISOString() });
    const postponedTask = createTask(harness, "user-a", { dueDate: overdue.toISOString() });

    harness.nudgesDao.upsertTaskProfile("user-a", snoozedTask.id, {
      resistance: "low",
      urgency: "medium",
      estimateMinutes: 10,
      nudgeEscalation: false,
      nudgeFrequencyMin: 20,
      timesPostponed: 0,
      timesNudged: 0,
      snoozedUntil: null,
      activeEventId: null
    });

    harness.nudgesDao.upsertTaskProfile("user-a", postponedTask.id, {
      resistance: "mild",
      urgency: "high",
      estimateMinutes: 30,
      nudgeEscalation: true,
      nudgeFrequencyMin: 20,
      timesPostponed: 0,
      timesNudged: 0,
      snoozedUntil: null,
      activeEventId: null
    });

    const postponed = harness.nudgesController.postpone("user-a", postponedTask.id, {
      dueDate: "2026-04-08T10:00:00.000Z",
      reason: "meeting"
    });

    expect(postponed.dueDate).toBe("2026-04-08T10:00:00.000Z");
    expect(postponed.nudge.timesPostponed).toBe(1);
    expect(postponed.nudge.lastAction).toBe("postpone");

    const [delivered] = harness.nudgesService.runScheduler("user-a", now);
    expect(delivered).toBeDefined();
    const snoozed = harness.nudgesController.snooze("user-a", snoozedTask.id, {
      minutes: 30,
      at: now.toISOString()
    });

    expect(snoozed.nudge.snoozedUntil).toBe("2026-04-07T10:30:00.000Z");
    expect(harness.nudgesService.runScheduler("user-a", new Date("2026-04-07T10:15:00.000Z"))).toHaveLength(0);

    const acknowledged = harness.nudgesController.acknowledge("user-a", delivered!.id, {
      at: now.toISOString()
    });

    expect(acknowledged.acknowledgedAt).toBe("2026-04-07T10:00:00.000Z");
    expect(acknowledged.state).toBe("acknowledged");
    expect(harness.nudgesDao.listEvents("user-a", snoozedTask.id)).toEqual([
      expect.objectContaining({
        kind: "acknowledge",
        state: "acknowledged",
        snoozedUntil: "2026-04-07T10:30:00.000Z"
      })
    ]);
    expect(harness.nudgesDao.getTaskProfile("user-a", snoozedTask.id).lastAction).toBe("acknowledge");
  });

  it("NUDGE-BE-004: copy selection is deterministic and matches tone to resistance without guilt-heavy wording", () => {
    const mild = selectNudgeCopy({
      resistance: "mild",
      urgency: "medium",
      level: 1,
      taskTitle: "Write tests",
      strategy: "gentle"
    });
    const repeat = selectNudgeCopy({
      resistance: "mild",
      urgency: "medium",
      level: 1,
      taskTitle: "Write tests",
      strategy: "gentle"
    });
    const dread = selectNudgeCopy({
      resistance: "dread",
      urgency: "high",
      level: 2,
      taskTitle: "Submit PR",
      strategy: "firm"
    });

    expect(repeat).toEqual(mild);
    expect(mild.copyId).toContain("mild");
    expect(dread.copyId).toContain("dread");
    expect(mild.message).not.toMatch(/guilt|lazy|failed|should have/i);
    expect(dread.message).not.toMatch(/guilt|lazy|failed|should have/i);
  });
});
