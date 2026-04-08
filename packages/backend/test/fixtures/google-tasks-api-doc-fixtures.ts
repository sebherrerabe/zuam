import type {
  GoogleTasksApiTaskListsListResponse,
  GoogleTasksApiTasksListResponse
} from "../../src/modules/google-tasks-sync/google-api-adapter";

// These fixtures intentionally follow the raw response envelopes documented in:
// - https://developers.google.com/workspace/tasks/reference/rest/v1/tasklists/list
// - https://developers.google.com/workspace/tasks/reference/rest/v1/tasks/list
// - https://developers.google.com/workspace/tasks/reference/rest/v1/tasks

export const googleTaskListsListDocFixture: GoogleTasksApiTaskListsListResponse = {
  kind: "tasks#taskLists",
  etag: "\"tasklists-page-etag\"",
  nextPageToken: "page-token-2",
  items: [
    {
      kind: "tasks#taskList",
      id: "MDk3NTM4NjA0OTg2Mjc1MTM0OTM6MDow",
      etag: "\"tasklist-etag-1\"",
      title: "Inbox",
      updated: "2026-04-07T10:00:00.000Z",
      selfLink: "https://tasks.googleapis.com/tasks/v1/users/@me/lists/MDk3NTM4NjA0OTg2Mjc1MTM0OTM6MDow"
    },
    {
      kind: "tasks#taskList",
      id: "MDk3NTM4NjA0OTg2Mjc1MTM0OTM6MDox",
      etag: "\"tasklist-etag-2\"",
      title: "Platform",
      updated: "2026-04-07T10:02:00.000Z",
      selfLink: "https://tasks.googleapis.com/tasks/v1/users/@me/lists/MDk3NTM4NjA0OTg2Mjc1MTM0OTM6MDox"
    }
  ]
};

export const googleTasksListDocFixture: GoogleTasksApiTasksListResponse = {
  kind: "tasks#tasks",
  etag: "\"tasks-page-etag\"",
  nextPageToken: "next-task-page",
  items: [
    {
      kind: "tasks#task",
      id: "remote-task-1",
      etag: "\"task-etag-1\"",
      title: "Ship nudge engine v1 (Level 0-2)",
      updated: "2026-04-07T10:03:00.000Z",
      selfLink: "https://tasks.googleapis.com/tasks/v1/lists/list-1/tasks/remote-task-1",
      notes: "Cover ambient -> gentle -> firm escalation.",
      status: "needsAction",
      due: "2026-04-07T18:30:00.000Z",
      deleted: false,
      hidden: false,
      webViewLink: "https://tasks.google.com/embed/list-1/remote-task-1"
    },
    {
      kind: "tasks#task",
      id: "remote-task-2",
      etag: "\"task-etag-2\"",
      title: "Scheduler hook to task.dueDate",
      updated: "2026-04-07T10:04:00.000Z",
      selfLink: "https://tasks.googleapis.com/tasks/v1/lists/list-1/tasks/remote-task-2",
      parent: "remote-task-1",
      position: "00000000000000000001",
      status: "completed",
      completed: "2026-04-07T10:05:00.000Z",
      deleted: false,
      hidden: false
    },
    {
      kind: "tasks#task",
      id: "remote-task-3",
      etag: "\"task-etag-3\"",
      title: "Assigned task from Docs",
      updated: "2026-04-07T10:06:00.000Z",
      selfLink: "https://tasks.googleapis.com/tasks/v1/lists/list-1/tasks/remote-task-3",
      status: "needsAction",
      deleted: true,
      hidden: true,
      assignmentInfo: {
        linkToTask: "https://docs.google.com/document/d/example#task",
        surfaceType: "DOCUMENT"
      }
    }
  ]
};
