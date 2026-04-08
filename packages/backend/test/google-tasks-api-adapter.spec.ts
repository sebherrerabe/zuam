import {
  normalizeGoogleTaskListsListResponse,
  normalizeGoogleTasksListResponse
} from "../src/modules/google-tasks-sync/google-api-adapter";
import {
  googleTaskListsListDocFixture,
  googleTasksListDocFixture
} from "./fixtures/google-tasks-api-doc-fixtures";

describe("google-tasks api adapter fixtures", () => {
  it("maps a documented tasklists.list response envelope into remote list records", () => {
    const normalized = normalizeGoogleTaskListsListResponse(googleTaskListsListDocFixture);

    expect(normalized).toEqual({
      etag: "\"tasklists-page-etag\"",
      nextPageToken: "page-token-2",
      items: [
        {
          id: "MDk3NTM4NjA0OTg2Mjc1MTM0OTM6MDow",
          title: "Inbox",
          updatedAt: "2026-04-07T10:00:00.000Z",
          isDeleted: false
        },
        {
          id: "MDk3NTM4NjA0OTg2Mjc1MTM0OTM6MDox",
          title: "Platform",
          updatedAt: "2026-04-07T10:02:00.000Z",
          isDeleted: false
        }
      ]
    });
  });

  it("maps a documented tasks.list response envelope into remote task records", () => {
    const normalized = normalizeGoogleTasksListResponse("list-1", googleTasksListDocFixture);

    expect(normalized).toEqual({
      etag: "\"tasks-page-etag\"",
      nextPageToken: "next-task-page",
      items: [
        {
          id: "remote-task-1",
          listId: "list-1",
          title: "Ship nudge engine v1 (Level 0-2)",
          notes: "Cover ambient -> gentle -> firm escalation.",
          dueDate: "2026-04-07",
          completed: false,
          completedAt: null,
          parentTaskId: null,
          updatedAt: "2026-04-07T10:03:00.000Z",
          isDeleted: false
        },
        {
          id: "remote-task-2",
          listId: "list-1",
          title: "Scheduler hook to task.dueDate",
          notes: null,
          dueDate: null,
          completed: true,
          completedAt: "2026-04-07T10:05:00.000Z",
          parentTaskId: "remote-task-1",
          updatedAt: "2026-04-07T10:04:00.000Z",
          isDeleted: false
        },
        {
          id: "remote-task-3",
          listId: "list-1",
          title: "Assigned task from Docs",
          notes: null,
          dueDate: null,
          completed: false,
          completedAt: null,
          parentTaskId: null,
          updatedAt: "2026-04-07T10:06:00.000Z",
          isDeleted: true
        }
      ]
    });
  });

  it("treats missing items arrays as an empty documented page", () => {
    expect(normalizeGoogleTaskListsListResponse({ kind: "tasks#taskLists" }).items).toEqual([]);
    expect(normalizeGoogleTasksListResponse("list-1", { kind: "tasks#tasks" }).items).toEqual([]);
  });

  it("rejects malformed documented payloads before they reach sync logic", () => {
    expect(() =>
      normalizeGoogleTasksListResponse("list-1", {
        kind: "tasks#tasks",
        items: [{ id: "bad-task", title: "Missing updated" }]
      })
    ).toThrow(/updated/);
  });
});
