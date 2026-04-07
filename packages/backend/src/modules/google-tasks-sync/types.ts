export type GoogleTasksSyncScope = "full" | "incremental";

export type GoogleTasksSyncStatus = "idle" | "syncing" | "ready" | "failed";

export type GoogleTasksSyncState = {
  userId: string;
  googleTasksCursor: string | null;
  googleTasksLastSyncAt: string | null;
  googleTasksStatus: GoogleTasksSyncStatus;
  googleTasksLastError: string | null;
  googleTasksLastSyncId: string | null;
  googleTasksLastRequestedScope: GoogleTasksSyncScope | null;
  googleTasksLastWebhookAt: string | null;
};

export type GoogleTasksRemoteList = {
  id: string;
  title: string;
  updatedAt: string;
  isDeleted: boolean;
};

export type GoogleTasksRemoteTask = {
  id: string;
  listId: string;
  title: string;
  notes: string | null;
  dueDate: string | null;
  completed: boolean;
  completedAt: string | null;
  parentTaskId: string | null;
  updatedAt: string;
  isDeleted: boolean;
};

export type GoogleTasksWebhookSignal = {
  userId?: string;
  token?: string;
  scope?: GoogleTasksSyncScope;
};

