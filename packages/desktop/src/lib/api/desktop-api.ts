import type { ListDto } from "@zuam/shared";

import type { SyncStatusSnapshot } from "../../features/system";
import {
  equipMockProgressionItem,
  fetchMockAnalyticsHeatmap,
  fetchMockAnalyticsSummary,
  createMockSubtask,
  deleteMockTask,
  fetchMockCalendarContext,
  fetchMockCalendarSuggestions,
  fetchMockFocusQueueRecommendation,
  fetchMockFocusSessionSnapshot,
  fetchMockProgressionProfile,
  fetchMockProgressionRewardHistory,
  fetchMockProgressionShareCard,
  fetchMockTaskDetail,
  fetchMockTaskQuery,
  fetchMockWorkspaceBootstrap,
  moveMockTask,
  pauseMockFocusSession,
  resetDesktopApiMocks,
  resumeMockFocusSession,
  setMockSubtaskCompleted,
  setMockTaskStatus,
  startMockBreak,
  startMockFocusSession,
  endMockFocusSession,
  updateMockTaskDetail
} from "./desktop-api.mock";
import type {
  AnalyticsHeatmapResponse,
  AnalyticsSummaryResponse,
  AnalyticsWindow,
  CalendarSuggestionsResponse,
  CreateSubtaskInput,
  DesktopWorkspaceBootstrap,
  EquipProgressionItemInput,
  FocusQueueRecommendation,
  FocusSessionSnapshot,
  GoogleCalendarContextSnapshot,
  ProgressionProfileResponse,
  RewardEvent,
  ShareProgressCardPayload,
  StartFocusSessionInput,
  TaskDetailResponse,
  TaskMoveInput,
  TaskStatusInput,
  TaskTaxonomyQueryInput,
  TaskViewQueryResult,
  TransitionFocusSessionInput,
  UpdateTaskDetailInput
} from "./desktop-api.types";

const DEFAULT_USER_ID = "user-1";

type SyncStatusResponse = {
  googleTasksCursor: string | null;
  googleTasksLastSyncAt: string | null;
  googleTasksStatus: "idle" | "syncing" | "ready" | "failed";
  googleTasksLastError: string | null;
};

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH";
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

export async function fetchDesktopWorkspaceBootstrap() {
  if (!hasDesktopApiBaseUrl()) {
    return fetchMockWorkspaceBootstrap();
  }

  const [lists, sidebarCounts, tags, savedFilters] = await Promise.all([
    apiRequest<ListDto[]>("/lists"),
    apiRequest<DesktopWorkspaceBootstrap["sidebarCounts"]>("/taxonomy/sidebar-counts"),
    apiRequest<DesktopWorkspaceBootstrap["tags"]>("/taxonomy/tags"),
    apiRequest<DesktopWorkspaceBootstrap["savedFilters"]>("/taxonomy/saved-filters")
  ]);

  return {
    lists,
    sidebarCounts,
    tags,
    savedFilters
  } satisfies DesktopWorkspaceBootstrap;
}

export async function fetchTaskViewQuery(input: TaskTaxonomyQueryInput) {
  if (!hasDesktopApiBaseUrl()) {
    return fetchMockTaskQuery(input);
  }

  return apiRequest<TaskViewQueryResult>("/taxonomy/query", {
    method: "POST",
    body: input
  });
}

export async function fetchTaskDetail(taskId: string) {
  if (!hasDesktopApiBaseUrl()) {
    return fetchMockTaskDetail(taskId);
  }

  return apiRequest<TaskDetailResponse>(`/tasks/${taskId}`);
}

export async function updateTaskDetail(taskId: string, input: UpdateTaskDetailInput) {
  if (!hasDesktopApiBaseUrl()) {
    return updateMockTaskDetail(taskId, input);
  }

  return apiRequest<TaskDetailResponse>(`/tasks/${taskId}`, {
    method: "PATCH",
    body: input
  });
}

export async function createSubtask(input: CreateSubtaskInput) {
  if (!hasDesktopApiBaseUrl()) {
    return createMockSubtask(input);
  }

  return apiRequest(`/tasks`, {
    method: "POST",
    body: input
  });
}

export async function setSubtaskCompleted(taskId: string, completed: boolean) {
  if (!hasDesktopApiBaseUrl()) {
    return setMockSubtaskCompleted(taskId, completed);
  }

  return apiRequest(`/tasks/${taskId}/complete`, {
    method: "POST",
    body: { completed }
  });
}

export async function deleteTask(taskId: string) {
  if (!hasDesktopApiBaseUrl()) {
    return deleteMockTask(taskId);
  }

  const apiBaseUrl = getApiBaseUrl();
  if (!apiBaseUrl) {
    throw new Error("Desktop API base URL is not configured");
  }

  const response = await fetch(`${apiBaseUrl}/tasks/${taskId}`, {
    method: "DELETE",
    headers: {
      "x-zuam-user-id": DEFAULT_USER_ID
    }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Desktop API request failed with ${response.status}`);
  }

  return null;
}

export async function fetchFocusQueueRecommendation(input: TaskTaxonomyQueryInput = {}) {
  if (!hasDesktopApiBaseUrl()) {
    return fetchMockFocusQueueRecommendation(input);
  }

  return apiRequest<FocusQueueRecommendation>("/taxonomy/focus-queue/recommendation", {
    method: "POST",
    body: input
  });
}

export async function moveTask(taskId: string, input: TaskMoveInput) {
  if (!hasDesktopApiBaseUrl()) {
    return moveMockTask(taskId, input);
  }

  return apiRequest(`/tasks/${taskId}/move`, {
    method: "PATCH",
    body: input
  });
}

export async function setTaskStatus(taskId: string, input: TaskStatusInput) {
  if (!hasDesktopApiBaseUrl()) {
    return setMockTaskStatus(taskId, input);
  }

  return apiRequest(`/tasks/${taskId}/status`, {
    method: "PATCH",
    body: input
  });
}

export async function fetchFocusSessionSnapshot() {
  if (!hasDesktopApiBaseUrl()) {
    return fetchMockFocusSessionSnapshot();
  }

  return apiRequest<FocusSessionSnapshot>("/focus-sessions/sync");
}

export async function startFocusSession(input: StartFocusSessionInput) {
  if (!hasDesktopApiBaseUrl()) {
    return startMockFocusSession(input);
  }

  return apiRequest("/focus-sessions/start", {
    method: "POST",
    body: input
  });
}

export async function pauseFocusSession(sessionId: string, input: TransitionFocusSessionInput = {}) {
  if (!hasDesktopApiBaseUrl()) {
    return pauseMockFocusSession(sessionId, input);
  }

  return apiRequest(`/focus-sessions/${sessionId}/pause`, {
    method: "POST",
    body: input
  });
}

export async function startFocusBreak(sessionId: string, input: TransitionFocusSessionInput = {}) {
  if (!hasDesktopApiBaseUrl()) {
    return startMockBreak(sessionId, input);
  }

  return apiRequest(`/focus-sessions/${sessionId}/break`, {
    method: "POST",
    body: input
  });
}

export async function resumeFocusSession(sessionId: string, input: TransitionFocusSessionInput = {}) {
  if (!hasDesktopApiBaseUrl()) {
    return resumeMockFocusSession(sessionId, input);
  }

  return apiRequest(`/focus-sessions/${sessionId}/resume`, {
    method: "POST",
    body: input
  });
}

export async function endFocusSession(sessionId: string, input: TransitionFocusSessionInput = {}) {
  if (!hasDesktopApiBaseUrl()) {
    return endMockFocusSession(sessionId, input);
  }

  return apiRequest(`/focus-sessions/${sessionId}/end`, {
    method: "POST",
    body: input
  });
}

export async function fetchCalendarContext() {
  if (!hasDesktopApiBaseUrl()) {
    return fetchMockCalendarContext();
  }

  return apiRequest<GoogleCalendarContextSnapshot>("/sync/google/calendar");
}

export async function fetchCalendarSuggestions(taskId: string) {
  if (!hasDesktopApiBaseUrl()) {
    return fetchMockCalendarSuggestions(taskId);
  }

  return apiRequest<CalendarSuggestionsResponse>("/sync/google/calendar/suggestions", {
    method: "POST",
    body: { taskId }
  });
}

export async function fetchAnalyticsSummary(window: Exclude<AnalyticsWindow, "last-90-days"> = "this-week") {
  if (!hasDesktopApiBaseUrl()) {
    return fetchMockAnalyticsSummary(window);
  }

  return apiRequest<AnalyticsSummaryResponse>(`/analytics/summary?window=${window}`);
}

export async function fetchAnalyticsHeatmap(window: AnalyticsWindow = "last-90-days") {
  if (!hasDesktopApiBaseUrl()) {
    return fetchMockAnalyticsHeatmap(window);
  }

  return apiRequest<AnalyticsHeatmapResponse>(`/analytics/heatmap?window=${window}`);
}

export async function fetchProgressionProfile() {
  if (!hasDesktopApiBaseUrl()) {
    return fetchMockProgressionProfile();
  }

  return apiRequest<ProgressionProfileResponse>("/progression/profile");
}

export async function fetchProgressionRewardHistory() {
  if (!hasDesktopApiBaseUrl()) {
    return fetchMockProgressionRewardHistory();
  }

  return apiRequest<RewardEvent[]>("/progression/reward-history");
}

export async function equipProgressionItem(input: EquipProgressionItemInput) {
  if (!hasDesktopApiBaseUrl()) {
    return equipMockProgressionItem(input);
  }

  return apiRequest<ProgressionProfileResponse>("/progression/profile/equipment", {
    method: "PATCH",
    body: { cosmeticId: input.unlockableId }
  });
}

export async function fetchProgressionShareCard() {
  if (!hasDesktopApiBaseUrl()) {
    return fetchMockProgressionShareCard();
  }

  return apiRequest<ShareProgressCardPayload>("/progression/share-card");
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

export { resetDesktopApiMocks };
