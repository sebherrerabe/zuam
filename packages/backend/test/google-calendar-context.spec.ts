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
import { GoogleCalendarContextController } from "../src/modules/google-calendar-context/controller";
import { GoogleCalendarContextDao } from "../src/modules/google-calendar-context/dao";
import { GoogleCalendarContextEventBus } from "../src/modules/google-calendar-context/events";
import { GoogleCalendarContextService } from "../src/modules/google-calendar-context/service";

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
  const calendarDao = new GoogleCalendarContextDao();
  const calendarEvents = new GoogleCalendarContextEventBus();
  const calendarService = new GoogleCalendarContextService(tasksDao, calendarDao, calendarEvents);
  const calendarController = new GoogleCalendarContextController(calendarService);

  return {
    listsController,
    sectionsController,
    tasksController,
    calendarDao,
    calendarEvents,
    calendarService,
    calendarController
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

describe("google-calendar-context backend flows", () => {
  it("BE-UNIT-GCAL-001: raw calendar data normalizes into busy blocks and free windows", () => {
    const harness = buildHarness();

    harness.calendarService.seedRawSource("user-a", {
      calendars: [
        {
          id: "work",
          summary: "Work",
          accessRole: "reader"
        },
        {
          id: "personal",
          summary: "Personal",
          accessRole: "freeBusyReader",
          hidden: true
        },
        {
          id: "archived",
          summary: "Archived",
          accessRole: "owner",
          deleted: true
        }
      ],
      busyByCalendarId: {
        work: {
          busy: [
            {
              start: "2026-04-07T10:00:00.000Z",
              end: "2026-04-07T11:00:00.000Z"
            },
            {
              start: "2026-04-07T13:00:00.000Z",
              end: "2026-04-07T14:00:00.000Z"
            }
          ]
        }
      },
      planningWindowStart: "2026-04-07T09:00:00.000Z",
      planningWindowEnd: "2026-04-07T17:00:00.000Z",
      fetchedAt: "2026-04-07T09:05:00.000Z",
      freshnessTtlMinutes: 15,
      nextSyncToken: "token-1"
    });

    const snapshot = harness.calendarController.get("user-a");
    expect(snapshot).toMatchObject({
      userId: "user-a",
      stale: false,
      calendars: expect.arrayContaining([expect.objectContaining({ id: "work", summary: "Work" })]),
      busyBlocks: expect.arrayContaining([expect.objectContaining({ calendarId: "work", confidence: "medium" })]),
      freeWindows: expect.arrayContaining([
        expect.objectContaining({
          start: "2026-04-07T09:00:00.000Z",
          end: "2026-04-07T10:00:00.000Z",
          durationMinutes: 60
        }),
        expect.objectContaining({
          start: "2026-04-07T11:00:00.000Z",
          end: "2026-04-07T13:00:00.000Z",
          durationMinutes: 120
        }),
        expect.objectContaining({
          start: "2026-04-07T14:00:00.000Z",
          end: "2026-04-07T17:00:00.000Z",
          durationMinutes: 180
        })
      ]),
      partialErrors: []
    });
  });

  it("BE-UNIT-GCAL-002: stale calendar state refreshes instead of serving an expired snapshot", () => {
    const harness = buildHarness();
    const refreshEvents: unknown[] = [];
    harness.calendarEvents.on("calendar:refreshed", (snapshot) => refreshEvents.push(snapshot));

    harness.calendarService.seedRawSource("user-a", {
      calendars: [
        {
          id: "work",
          summary: "Work",
          accessRole: "reader"
        }
      ],
      busyByCalendarId: {
        work: {
          busy: [
            {
              start: "2026-04-07T10:00:00.000Z",
              end: "2026-04-07T11:00:00.000Z"
            }
          ]
        }
      },
      planningWindowStart: "2026-04-07T09:00:00.000Z",
      planningWindowEnd: "2026-04-07T17:00:00.000Z",
      fetchedAt: "2026-04-07T09:00:00.000Z",
      freshnessTtlMinutes: 15
    });

    const snapshot = harness.calendarService.getCalendarContext("user-a", {
      at: "2026-04-07T10:00:00.000Z"
    });

    expect(snapshot).toEqual(
      expect.objectContaining({
        stale: false,
        lastRefreshedAt: "2026-04-07T09:00:00.000Z"
      })
    );
    expect(refreshEvents).toHaveLength(2);
  });

  it("BE-UNIT-GCAL-003 and BE-UNIT-GCAL-004: slot suggestions avoid busy blocks and explain the blockers", () => {
    const harness = buildHarness();
    const task = createTask(harness, "user-a", "Write calendar hints");

    harness.calendarService.seedRawSource("user-a", {
      calendars: [
        {
          id: "work",
          summary: "Work",
          accessRole: "reader"
        }
      ],
      busyByCalendarId: {
        work: {
          busy: [
            {
              start: "2026-04-07T10:00:00.000Z",
              end: "2026-04-07T11:00:00.000Z"
            },
            {
              start: "2026-04-07T13:00:00.000Z",
              end: "2026-04-07T14:00:00.000Z"
            }
          ]
        }
      },
      planningWindowStart: "2026-04-07T09:00:00.000Z",
      planningWindowEnd: "2026-04-07T17:00:00.000Z",
      fetchedAt: "2026-04-07T09:05:00.000Z",
      freshnessTtlMinutes: 15
    });

    const suggestions = harness.calendarController.suggestions("user-a", {
      taskId: task.id,
      durationMinutes: 75,
      windowStart: "2026-04-07T09:00:00.000Z",
      windowEnd: "2026-04-07T17:00:00.000Z",
      limit: 3
    });

    expect(suggestions).toHaveLength(2);
    expect(suggestions[0]).toMatchObject({
      taskId: task.id,
      taskTitle: "Write calendar hints",
      start: "2026-04-07T11:00:00.000Z",
      end: "2026-04-07T12:15:00.000Z",
      durationMinutes: 75,
      blockingBusyWindows: expect.arrayContaining([
        expect.objectContaining({
          start: "2026-04-07T10:00:00.000Z",
          end: "2026-04-07T11:00:00.000Z"
        }),
        expect.objectContaining({
          start: "2026-04-07T13:00:00.000Z",
          end: "2026-04-07T14:00:00.000Z"
        })
      ])
    });
    expect(suggestions[1]).toMatchObject({
      start: "2026-04-07T14:00:00.000Z",
      end: "2026-04-07T15:15:00.000Z"
    });
    expect(suggestions[0]!.rationale).toContain("Write calendar hints");
    expect(suggestions[0]!.rationale).toContain("Work");
    for (const suggestion of suggestions) {
      expect(suggestion.start).not.toBe("2026-04-07T10:30:00.000Z");
      expect(suggestion.end).not.toBe("2026-04-07T13:30:00.000Z");
    }
  });

  it("BE-UNIT-GCAL-005: partial calendar failures still return the available context", () => {
    const harness = buildHarness();

    harness.calendarService.seedRawSource("user-a", {
      calendars: [
        {
          id: "work",
          summary: "Work",
          accessRole: "reader"
        },
        {
          id: "team",
          summary: "Team",
          accessRole: "freeBusyReader"
        }
      ],
      busyByCalendarId: {
        work: {
          busy: [
            {
              start: "2026-04-07T10:00:00.000Z",
              end: "2026-04-07T11:00:00.000Z"
            }
          ]
        }
      },
      planningWindowStart: "2026-04-07T09:00:00.000Z",
      planningWindowEnd: "2026-04-07T17:00:00.000Z",
      fetchedAt: "2026-04-07T09:05:00.000Z"
    });

    const snapshot = harness.calendarController.get("user-a");
    expect(snapshot.partialErrors).toEqual([
      "Missing free/busy data for team"
    ]);
    expect(snapshot.busyBlocks).toHaveLength(1);
    expect(snapshot.freeWindows).not.toHaveLength(0);
  });
});
