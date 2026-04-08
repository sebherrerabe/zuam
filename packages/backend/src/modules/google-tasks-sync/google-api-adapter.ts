import type { GoogleTasksRemoteList, GoogleTasksRemoteTask } from "./types";

export type GoogleTasksApiTaskStatus = "needsAction" | "completed";

export type GoogleTasksApiTaskListResource = {
  kind?: "tasks#taskList";
  id: string;
  etag?: string;
  title: string;
  updated: string;
  selfLink?: string;
};

export type GoogleTasksApiTaskResource = {
  kind?: "tasks#task";
  id: string;
  etag?: string;
  title: string;
  updated: string;
  selfLink?: string;
  parent?: string;
  position?: string;
  notes?: string;
  status?: GoogleTasksApiTaskStatus;
  due?: string;
  completed?: string;
  deleted?: boolean;
  hidden?: boolean;
  webViewLink?: string;
  assignmentInfo?: {
    linkToTask?: string;
    surfaceType?: string;
  };
};

export type GoogleTasksApiTaskListsListResponse = {
  kind?: "tasks#taskLists";
  etag?: string;
  nextPageToken?: string;
  items?: GoogleTasksApiTaskListResource[];
};

export type GoogleTasksApiTasksListResponse = {
  kind?: "tasks#tasks";
  etag?: string;
  nextPageToken?: string;
  items?: GoogleTasksApiTaskResource[];
};

export type GoogleTasksNormalizedListPage = {
  etag: string | null;
  nextPageToken: string | null;
  items: GoogleTasksRemoteList[];
};

export type GoogleTasksNormalizedTaskPage = {
  etag: string | null;
  nextPageToken: string | null;
  items: GoogleTasksRemoteTask[];
};

export function normalizeGoogleTaskListsListResponse(payload: unknown): GoogleTasksNormalizedListPage {
  const response = asRecord(payload, "tasklists.list response");
  const items = readItems(response, "tasklists.list").map((item, index) =>
    normalizeGoogleTaskListResource(item, `tasklists.list.items[${index}]`)
  );

  return {
    etag: readOptionalString(response.etag),
    nextPageToken: readOptionalString(response.nextPageToken),
    items
  };
}

export function normalizeGoogleTasksListResponse(
  taskListId: string,
  payload: unknown
): GoogleTasksNormalizedTaskPage {
  const response = asRecord(payload, "tasks.list response");
  const items = readItems(response, "tasks.list").map((item, index) =>
    normalizeGoogleTaskResource(taskListId, item, `tasks.list.items[${index}]`)
  );

  return {
    etag: readOptionalString(response.etag),
    nextPageToken: readOptionalString(response.nextPageToken),
    items
  };
}

function normalizeGoogleTaskListResource(
  payload: unknown,
  label: string
): GoogleTasksRemoteList {
  const item = asRecord(payload, label);

  return {
    id: readRequiredString(item.id, `${label}.id`),
    title: readRequiredString(item.title, `${label}.title`),
    updatedAt: readRequiredString(item.updated, `${label}.updated`),
    // The public tasklists resource does not expose a deleted flag.
    isDeleted: false
  };
}

function normalizeGoogleTaskResource(
  taskListId: string,
  payload: unknown,
  label: string
): GoogleTasksRemoteTask {
  const item = asRecord(payload, label);
  const status = item.status;

  if (status !== undefined && status !== "needsAction" && status !== "completed") {
    throw new Error(`${label}.status must be "needsAction" or "completed"`);
  }

  const completedAt = readOptionalString(item.completed);

  return {
    id: readRequiredString(item.id, `${label}.id`),
    listId: taskListId,
    title: readRequiredString(item.title, `${label}.title`),
    notes: readOptionalString(item.notes),
    dueDate: normalizeGoogleDueDate(readOptionalString(item.due)),
    completed: status === "completed" || completedAt !== null,
    completedAt,
    parentTaskId: readOptionalString(item.parent),
    updatedAt: readRequiredString(item.updated, `${label}.updated`),
    isDeleted: item.deleted === true
  };
}

function normalizeGoogleDueDate(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid Google Tasks due timestamp: ${value}`);
  }

  return parsed.toISOString().slice(0, 10);
}

function readItems(
  value: Record<string, unknown>,
  label: string
): unknown[] {
  if (value.items === undefined) {
    return [];
  }

  if (!Array.isArray(value.items)) {
    throw new Error(`${label}.items must be an array when present`);
  }

  return value.items;
}

function asRecord(value: unknown, label: string) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }

  return value as Record<string, unknown>;
}

function readRequiredString(value: unknown, label: string) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${label} must be a non-empty string`);
  }

  return value;
}

function readOptionalString(value: unknown) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error("Expected optional string value");
  }

  return value;
}
