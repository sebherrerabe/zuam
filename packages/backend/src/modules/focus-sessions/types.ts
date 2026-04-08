export const focusSessionRuntimeStates = ["idle", "running", "paused", "break", "completed"] as const;

export type FocusSessionRuntimeState = (typeof focusSessionRuntimeStates)[number];
export type FocusSessionState = Exclude<FocusSessionRuntimeState, "idle">;

export type FocusSession = {
  id: string;
  userId: string;
  taskId: string;
  state: FocusSessionState;
  startedAt: string;
  endedAt: string | null;
  pausedAt: string | null;
  breakStartedAt: string | null;
  durationMinutes: number;
  breakDurationMinutes: number;
  extraMinutes: number;
  loggedMinutes: number;
  workMinutes: number;
  breakMinutes: number;
  lastTransitionAt: string;
};

export type FocusTaskRollup = {
  taskId: string;
  totalFocusMinutes: number;
  extraMinutes: number;
  sessionCount: number;
  lastSessionId: string | null;
  lastEndedAt: string | null;
};

export type FocusSessionSnapshot = {
  runtimeState: FocusSessionRuntimeState;
  currentSession: FocusSession | null;
  sessions: FocusSession[];
  taskRollups: FocusTaskRollup[];
};

export type StartFocusSessionInput = {
  taskId: string;
  durationMinutes?: number;
  breakDurationMinutes?: number;
  startedAt?: string;
};

export type TransitionFocusSessionInput = {
  at?: string;
};
