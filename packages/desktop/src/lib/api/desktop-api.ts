import type { SyncStatusSnapshot } from "../../features/system";

const DEFAULT_USER_ID = "user-1";

type SyncStatusResponse = {
  googleTasksCursor: string | null;
  googleTasksLastSyncAt: string | null;
  googleTasksStatus: "idle" | "syncing" | "ready" | "failed";
  googleTasksLastError: string | null;
};

type RequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
};

function getApiBaseUrl() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  return typeof apiBaseUrl === "string" && apiBaseUrl.length > 0 ? apiBaseUrl : null;
}

export function hasDesktopApiBaseUrl() {
  return getApiBaseUrl() !== null;
}

async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const apiBaseUrl = getApiBaseUrl();
  if (!apiBaseUrl) {
    throw new Error("Desktop API base URL is not configured");
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "content-type": "application/json",
      "x-zuam-user-id": DEFAULT_USER_ID
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Desktop API request failed with ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function fetchGoogleSyncStatus() {
  return apiRequest<SyncStatusResponse>("/sync/status");
}

export async function triggerGoogleSync(scope: "full" | "incremental" = "incremental") {
  return apiRequest<{ started: true; syncId: string }>("/sync/google/tasks", {
    method: "POST",
    body: { scope }
  });
}

export async function snoozeTask(taskId: string, minutes = 15) {
  return apiRequest(`/tasks/${taskId}/snooze`, {
    method: "POST",
    body: { minutes }
  });
}

export async function acknowledgeNudge(nudgeId: string) {
  return apiRequest(`/nudge/${nudgeId}/acknowledge`, {
    method: "POST",
    body: {}
  });
}

export function mergeSyncStatusSnapshot(
  baseSnapshot: SyncStatusSnapshot,
  response: SyncStatusResponse
): SyncStatusSnapshot {
  return {
    ...baseSnapshot,
    status:
      response.googleTasksStatus === "ready" ||
      response.googleTasksStatus === "syncing" ||
      response.googleTasksStatus === "failed" ||
      response.googleTasksStatus === "idle"
        ? response.googleTasksStatus
        : baseSnapshot.status,
    lastSyncAt: response.googleTasksLastSyncAt,
    lastError: response.googleTasksLastError,
    connection: response.googleTasksStatus === "failed" ? "connected" : baseSnapshot.connection
  };
}
