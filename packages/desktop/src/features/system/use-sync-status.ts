import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchGoogleSyncStatus,
  hasDesktopApiBaseUrl,
  mergeSyncStatusSnapshot,
  triggerGoogleSync
} from "../../lib/api/desktop-api";
import type { SyncStatusSnapshot } from "./sync-status-card";

export function useSyncStatus(initialSnapshot: SyncStatusSnapshot) {
  const queryClient = useQueryClient();

  const statusQuery = useQuery({
    queryKey: ["google-sync-status"],
    queryFn: async () => {
      if (!hasDesktopApiBaseUrl()) {
        return initialSnapshot;
      }

      const response = await fetchGoogleSyncStatus();
      return mergeSyncStatusSnapshot(initialSnapshot, response);
    },
    initialData: initialSnapshot,
    staleTime: 15_000
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      if (!hasDesktopApiBaseUrl()) {
        return null;
      }

      return triggerGoogleSync("incremental");
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["google-sync-status"] });
      const previous = queryClient.getQueryData<SyncStatusSnapshot>(["google-sync-status"]) ?? initialSnapshot;

      queryClient.setQueryData<SyncStatusSnapshot>(["google-sync-status"], {
        ...previous,
        status: "syncing",
        pendingTaskCount: Math.max(previous.pendingTaskCount, 1),
        eventRevision: previous.eventRevision + 1,
        taskRows: previous.taskRows.map((row, index) =>
          index === 0 ? { ...row, pending: true } : row
        )
      });

      return { previous };
    },
    onError: (error, _variables, context) => {
      const previous = context?.previous ?? initialSnapshot;
      queryClient.setQueryData<SyncStatusSnapshot>(["google-sync-status"], {
        ...previous,
        status: "failed",
        lastError: error instanceof Error ? error.message : "Sync request failed",
        eventRevision: previous.eventRevision + 1
      });
    },
    onSuccess: () => {
      if (!hasDesktopApiBaseUrl()) {
        queryClient.setQueryData<SyncStatusSnapshot>(["google-sync-status"], (current) => {
          const snapshot = current ?? initialSnapshot;
          return {
            ...snapshot,
            status: "ready",
            lastError: null,
            lastSyncAt: "2026-04-07T16:12:00.000Z",
            pendingTaskCount: 0,
            eventRevision: snapshot.eventRevision + 1,
            taskRows: snapshot.taskRows.map((row) => ({ ...row, pending: false }))
          };
        });
        return;
      }

      void queryClient.invalidateQueries({ queryKey: ["google-sync-status"] });
    }
  });

  function dismissError() {
    queryClient.setQueryData<SyncStatusSnapshot>(["google-sync-status"], (current) => {
      const snapshot = current ?? initialSnapshot;
      return {
        ...snapshot,
        status: snapshot.lastSyncAt ? "ready" : "idle",
        lastError: null,
        eventRevision: snapshot.eventRevision + 1
      };
    });
  }

  return {
    snapshot: statusQuery.data ?? initialSnapshot,
    isRefreshing: refreshMutation.isPending,
    refresh: () => refreshMutation.mutateAsync(),
    dismissError
  };
}
