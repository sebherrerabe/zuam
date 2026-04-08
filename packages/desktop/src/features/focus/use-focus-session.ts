import { useEffect, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  endFocusSession,
  fetchFocusSessionSnapshot,
  pauseFocusSession,
  resumeFocusSession,
  startFocusBreak,
  startFocusSession
} from "../../lib/api/desktop-api";

function computeRemainingSeconds(snapshot: Awaited<ReturnType<typeof fetchFocusSessionSnapshot>> | undefined) {
  const session = snapshot?.currentSession;
  if (!session) {
    return 0;
  }

  if (session.state === "break") {
    const remaining = session.breakDurationMinutes * 60 - session.breakMinutes * 60;
    return Math.max(0, remaining);
  }

  if (session.state === "running" || session.state === "paused") {
    const remaining = session.durationMinutes * 60 - session.workMinutes * 60;
    return Math.max(0, remaining);
  }

  return 0;
}

export function useFocusSession(selectedTaskId: string | null) {
  const queryClient = useQueryClient();
  const focusQuery = useQuery({
    queryKey: ["desktop-focus-session"],
    queryFn: fetchFocusSessionSnapshot,
    refetchInterval: (query) => {
      const state = query.state.data?.runtimeState;
      return state === "running" || state === "break" ? 1000 : false;
    }
  });
  const [, setTick] = useState(0);

  useEffect(() => {
    if (focusQuery.data?.runtimeState !== "running" && focusQuery.data?.runtimeState !== "break") {
      return;
    }

    const timer = window.setInterval(() => setTick((current) => current + 1), 1000);
    return () => window.clearInterval(timer);
  }, [focusQuery.data?.runtimeState]);

  const startMutation = useMutation({
    mutationFn: (taskId: string) => startFocusSession({ taskId, durationMinutes: 25, breakDurationMinutes: 5 }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["desktop-focus-session"] })
  });

  const pauseMutation = useMutation({
    mutationFn: (sessionId: string) => pauseFocusSession(sessionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["desktop-focus-session"] })
  });

  const breakMutation = useMutation({
    mutationFn: (sessionId: string) => startFocusBreak(sessionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["desktop-focus-session"] })
  });

  const resumeMutation = useMutation({
    mutationFn: (sessionId: string) => resumeFocusSession(sessionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["desktop-focus-session"] })
  });

  const endMutation = useMutation({
    mutationFn: (sessionId: string) => endFocusSession(sessionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["desktop-focus-session"] })
  });

  const currentSession = focusQuery.data?.currentSession ?? null;
  const runtimeState = focusQuery.data?.runtimeState ?? "idle";
  const remainingSeconds = computeRemainingSeconds(focusQuery.data);

  return {
    focusQuery,
    currentSession,
    runtimeState,
    remainingSeconds,
    canStartSelectedTask: Boolean(selectedTaskId) && (!currentSession || currentSession.taskId === selectedTaskId),
    start: () => {
      if (selectedTaskId) {
        startMutation.mutate(selectedTaskId);
      }
    },
    pause: () => {
      if (currentSession) {
        pauseMutation.mutate(currentSession.id);
      }
    },
    takeBreak: () => {
      if (currentSession) {
        breakMutation.mutate(currentSession.id);
      }
    },
    resume: () => {
      if (currentSession) {
        resumeMutation.mutate(currentSession.id);
      }
    },
    end: () => {
      if (currentSession) {
        endMutation.mutate(currentSession.id);
      }
    }
  };
}
