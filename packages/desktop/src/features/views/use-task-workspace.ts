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
import type { TaskTaxonomyQueryInput } from "../../lib/api/desktop-api.types";
import type { TaskGroupBy, TaskSortBy } from "@zuam/shared";

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

export function useTaskWorkspace(args: UseTaskWorkspaceArgs) {
  const queryClient = useQueryClient();
  const queryInput = buildQueryInput(args);

  const bootstrapQuery = useQuery({
    queryKey: ["desktop-workspace-bootstrap"],
    queryFn: fetchDesktopWorkspaceBootstrap
  });

  const taskQuery = useQuery({
    queryKey: ["desktop-task-query", queryInput],
    queryFn: () => fetchTaskViewQuery(queryInput)
  });

  const focusQueueQuery = useQuery({
    queryKey: ["desktop-focus-queue", queryInput],
    queryFn: () => fetchFocusQueueRecommendation(queryInput),
    enabled: args.activeView === "focusQueue"
  });

  const calendarContextQuery = useQuery({
    queryKey: ["desktop-calendar-context"],
    queryFn: fetchCalendarContext
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
