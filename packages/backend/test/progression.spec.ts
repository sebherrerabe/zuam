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
import { AnalyticsInsightsDao } from "../src/modules/analytics-insights/dao";
import { ProgressionController } from "../src/modules/progression/controller";
import { ProgressionDao } from "../src/modules/progression/dao";
import { ProgressionEventBus } from "../src/modules/progression/events";
import { ProgressionService } from "../src/modules/progression/service";
import { getLevelForXp } from "@zuam/shared";

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
  const progressionDao = new ProgressionDao();
  const progressionEvents = new ProgressionEventBus();
  const progressionService = new ProgressionService(
    progressionDao,
    analyticsDao,
    events,
    focusEvents,
    progressionEvents
  );
  const progressionController = new ProgressionController(progressionService);

  return {
    listsController,
    sectionsController,
    tasksController,
    tasksDao,
    focusController,
    progressionController,
    progressionDao,
    progressionEvents
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

describe("progression backend flows", () => {
  it("BE-UNIT-PPR-001 and BE-E2E-PPR-001: task completion grants deterministic XP and keeps task semantics unchanged", () => {
    const harness = buildHarness();
    const task = createTask(harness, "user-a", "File taxes");

    harness.tasksController.update("user-a", task.id, {
      priority: "high",
      resistance: "DREAD",
      dueDate: "2026-04-05T12:00:00.000Z"
    });
    const completed = harness.tasksDao.update("user-a", task.id, {
      completed: true,
      completedAt: "2026-04-07T10:00:00.000Z",
      status: "completed"
    });

    const { profile } = harness.progressionController.getProfile("user-a");

    expect(profile.totalXp).toBe(56);
    expect(profile.level).toBe(getLevelForXp(56));
    expect(completed.priority).toBe("high");
    expect(completed.resistance).toBe("DREAD");
    expect(completed.status).toBe("completed");
  });

  it("BE-UNIT-PPR-002 and BE-E2E-PPR-002: focus-session completion grants deterministic XP exactly once", () => {
    const harness = buildHarness();
    const task = createTask(harness, "user-a", "Deep work block");

    const started = harness.focusController.start("user-a", {
      taskId: task.id,
      durationMinutes: 25,
      breakDurationMinutes: 5,
      startedAt: "2026-04-07T08:00:00.000Z"
    });
    harness.focusController.end("user-a", started.id, { at: "2026-04-07T08:35:00.000Z" });
    harness.focusController.sync("user-a");

    const rewardHistory = harness.progressionController.getRewardHistory("user-a");
    const focusRewards = rewardHistory.filter((reward) => reward.source === "FOCUS_SESSION_COMPLETION");

    expect(focusRewards).toHaveLength(1);
    expect(focusRewards[0]).toEqual(
      expect.objectContaining({
        sourceId: started.id,
        xpGranted: 75
      })
    );
  });

  it("BE-UNIT-PPR-003 and BE-UNIT-PPR-006: locked cosmetics are rejected and share payloads stay private", () => {
    const harness = buildHarness();

    expectHttpError(
      () => harness.progressionController.equipCosmetic("user-a", { cosmeticId: "cosmetic-flame-cloak" }),
      400,
      "Cosmetic cosmetic-flame-cloak is locked"
    );

    const shareCard = harness.progressionController.getShareCard("user-a");
    expect(shareCard).toEqual(
      expect.objectContaining({
        userName: "Seb H.",
        level: 1,
        totalXp: 0,
        equippedCosmetics: [],
        unlockedCosmetics: []
      })
    );
    expect(shareCard).not.toHaveProperty("taskTitle");
    expect(shareCard).not.toHaveProperty("dueDate");
    expect(shareCard).not.toHaveProperty("analytics");
  });

  it("BE-UNIT-PPR-004 and BE-UNIT-PPR-005: thresholds fire once, unlocks are equippable, and no rewards come from snooze-like edits", () => {
    const harness = buildHarness();
    const task = createTask(harness, "user-a", "High-value finish");
    const updates: number[] = [];
    const unlocks: string[] = [];

    harness.progressionEvents.on("progression:updated", ({ profile }) => updates.push(profile.totalXp));
    harness.progressionEvents.on("progression:unlock-earned", (unlockable) => unlocks.push(unlockable.id));

    harness.tasksController.update("user-a", task.id, { notes: "Minor edit only" });
    expect(harness.progressionController.getRewardHistory("user-a")).toHaveLength(0);

    for (let index = 0; index < 15; index += 1) {
      const repeatTask = createTask(harness, "user-a", `Repeat task ${index}`);
      harness.tasksController.update("user-a", repeatTask.id, {
        priority: "high",
        resistance: "DREAD",
        dueDate: "2026-04-05T12:00:00.000Z"
      });
      harness.tasksDao.update("user-a", repeatTask.id, {
        completed: true,
        completedAt: `2026-04-07T${String(10 + Math.min(index, 9)).padStart(2, "0")}:00:00.000Z`,
        status: "completed"
      });
      harness.tasksController.update("user-a", repeatTask.id, {
        notes: `Follow-up ${index}`
      });
    }

    const { profile, milestonePreview } = harness.progressionController.getProfile("user-a");
    expect(profile.totalXp).toBe(840);
    expect(unlocks).toContain("cosmetic-flame-cloak");
    expect(unlocks.filter((id) => id === "cosmetic-flame-cloak")).toHaveLength(1);
    expect(milestonePreview.nextUnlock?.id).toBe("cosmetic-wayward-cap");

    const equipped = harness.progressionController.equipCosmetic("user-a", { cosmeticId: "cosmetic-flame-cloak" });
    expect(equipped.profile.equippedCosmetics).toContain("cosmetic-flame-cloak");
    expect(updates[updates.length - 1]).toBe(840);
  });
});
