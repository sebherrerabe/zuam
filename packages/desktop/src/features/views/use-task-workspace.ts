import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchCalendarContext,
  fetchCalendarSuggestions,
  fetchDesktopWorkspaceBootstrap,
  fetchFocusQueueRecommendation,
  fetchTaskViewQuery,
  moveTask,
  setTaskStatus
} from "../../lib/api/desktop-api";
import type { ShellPresentation, ShellView } from "../../lib/state/shell-store";
import type {
  GoogleCalendarContextSnapshot,
  TaskTaxonomyQueryInput,
  TaskViewQueryResult
} from "../../lib/api/desktop-api.types";
import type { TaskGroupBy, TaskSortBy } from "@zuam/shared";

type TaskViewQuerySurfaceResult = TaskViewQueryResult & {
  error?: string;
};

type GoogleCalendarContextSurface = GoogleCalendarContextSnapshot & {
  error?: string;
};

type UseTaskWorkspaceArgs = {
  activeView: ShellView;
  activePresentation: ShellPresentation;
  activeListId: string | null;
  activeTagSlug: string | null;
  activeSavedFilterId: string | null;
  groupBy: TaskGroupBy;
  sortBy: TaskSortBy;
  selectedTaskId: string | null;
};

function buildQueryInput({
  activeView,
  activePresentation,
  activeListId,
  activeTagSlug,
  activeSavedFilterId,
  groupBy,
  sortBy
}: Omit<UseTaskWorkspaceArgs, "selectedTaskId">): TaskTaxonomyQueryInput {
  const input: TaskTaxonomyQueryInput = {
    view: activeView === "focusQueue" ? "focusQueue" : activePresentation === "calendar" ? "list" : activePresentation,
    groupBy,
    sortBy
  };

  switch (activeView) {
    case "today":
      input.smartList = "today";
      break;
    case "next7days":
      input.smartList = "next7days";
      break;
    case "inbox":
      input.smartList = "inbox";
      break;
    case "list":
      if (activeListId) {
        input.listId = activeListId;
      }
      break;
    case "tag":
      if (activeTagSlug) {
        input.filter = { kind: "tag", tagSlugs: [activeTagSlug] };
      }
      break;
    case "savedFilter":
      if (activeSavedFilterId) {
        input.savedFilterId = activeSavedFilterId;
      }
      break;
    case "assigned":
      input.savedFilterId = "assigned";
      break;
    case "focusQueue":
    default:
      break;
  }

  return input;
}

function buildTaskQueryErrorResult(input: TaskTaxonomyQueryInput, error: unknown): TaskViewQuerySurfaceResult {
  const message = error instanceof Error ? error.message : "Unknown task query error";
  const sortBy = input.sortBy ?? (input.view === "matrix" ? "priority" : "manual");
  const groupBy =
    input.groupBy ?? (input.view === "kanban" ? "section" : input.view === "matrix" ? "quadrant" : "section");

  return {
    items: [],
    explanation: "Unable to load the current task surface.",
    predicate: {
      key: "error",
      label: "Unavailable",
      description: message
    },
    reasonsByTaskId: {},
    groupBy,
    sortBy,
    groups: [],
    totalCount: 0,
    error: message
  };
}

function buildCalendarContextErrorResult(error: unknown): GoogleCalendarContextSurface {
  const message = error instanceof Error ? error.message : "Unknown calendar context error";
  const now = new Date().toISOString();

  return {
    userId: "user-1",
    lastRefreshedAt: null,
    expiresAt: now,
    stale: true,
    calendars: [],
    busyBlocks: [],
    freeWindows: [],
    partialErrors: [message],
    planningWindowStart: now,
    planningWindowEnd: now,
    nextSyncToken: null,
    error: message
  };
}

export function useTaskWorkspace(args: UseTaskWorkspaceArgs) {
  const queryClient = useQueryClient();
  const queryInput = buildQueryInput(args);

  const bootstrapQuery = useQuery({
    queryKey: ["desktop-workspace-bootstrap"],
    queryFn: fetchDesktopWorkspaceBootstrap
  });

  const taskQuery = useQuery<TaskViewQuerySurfaceResult>({
    queryKey: ["desktop-task-query", queryInput],
    queryFn: async () => {
      try {
        return await fetchTaskViewQuery(queryInput);
      } catch (error) {
        return buildTaskQueryErrorResult(queryInput, error);
      }
    }
  });

  const focusQueueQuery = useQuery({
    queryKey: ["desktop-focus-queue", queryInput],
    queryFn: () => fetchFocusQueueRecommendation(queryInput),
    enabled: args.activeView === "focusQueue"
  });

  const calendarContextQuery = useQuery<GoogleCalendarContextSurface>({
    queryKey: ["desktop-calendar-context"],
    queryFn: async () => {
      try {
        return await fetchCalendarContext();
      } catch (error) {
        return buildCalendarContextErrorResult(error);
      }
    }
  });

  const calendarSuggestionsQuery = useQuery({
    queryKey: ["desktop-calendar-suggestions", args.selectedTaskId],
    queryFn: () => fetchCalendarSuggestions(args.selectedTaskId ?? ""),
    enabled: Boolean(args.selectedTaskId)
  });

  const moveTaskMutation = useMutation({
    mutationFn: ({ taskId, ...input }: { taskId: string } & Parameters<typeof moveTask>[1]) =>
      moveTask(taskId, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["desktop-task-query"] }),
        queryClient.invalidateQueries({ queryKey: ["desktop-workspace-bootstrap"] }),
        queryClient.invalidateQueries({ queryKey: ["desktop-focus-queue"] })
      ]);
    }
  });

  const setTaskStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: "active" | "completed" | "wont_do" | "trash" }) =>
      setTaskStatus(taskId, { status }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["desktop-task-query"] }),
        queryClient.invalidateQueries({ queryKey: ["desktop-workspace-bootstrap"] }),
        queryClient.invalidateQueries({ queryKey: ["desktop-focus-queue"] })
      ]);
    }
  });

  return {
    bootstrapQuery,
    taskQuery,
    focusQueueQuery,
    calendarContextQuery,
    calendarSuggestionsQuery,
    moveTask: moveTaskMutation,
    setTaskStatus: setTaskStatusMutation
  };
}
