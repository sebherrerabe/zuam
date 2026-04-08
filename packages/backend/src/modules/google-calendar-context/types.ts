export const calendarConfidenceLevels = ["low", "medium", "high"] as const;
export const calendarAccessRoles = ["freeBusyReader", "reader", "writer", "owner"] as const;

export type CalendarConfidenceLevel = (typeof calendarConfidenceLevels)[number];
export type CalendarAccessRole = (typeof calendarAccessRoles)[number];

export type RawGoogleCalendarListItem = {
  id: string;
  summary: string;
  accessRole: CalendarAccessRole;
  hidden?: boolean;
  deleted?: boolean;
  primary?: boolean;
};

export type RawGoogleCalendarBusyItem = {
  start: string;
  end: string;
};

export type RawGoogleCalendarBusySource = {
  busy: RawGoogleCalendarBusyItem[];
  errors?: string[];
};

export type RawGoogleCalendarSource = {
  calendars: RawGoogleCalendarListItem[];
  busyByCalendarId: Record<string, RawGoogleCalendarBusySource>;
  planningWindowStart: string;
  planningWindowEnd: string;
  fetchedAt?: string;
  freshnessTtlMinutes?: number;
  nextSyncToken?: string | null;
};

export type BusyBlock = {
  id: string;
  calendarId: string;
  calendarSummary: string;
  start: string;
  end: string;
  confidence: CalendarConfidenceLevel;
};

export type FreeWindow = {
  start: string;
  end: string;
  durationMinutes: number;
};

export type ScheduleSuggestion = {
  taskId: string;
  taskTitle: string;
  start: string;
  end: string;
  durationMinutes: number;
  rationale: string;
  blockingBusyWindows: BusyBlock[];
};

export type GoogleCalendarContextSnapshot = {
  userId: string;
  lastRefreshedAt: string | null;
  expiresAt: string | null;
  stale: boolean;
  calendars: RawGoogleCalendarListItem[];
  busyBlocks: BusyBlock[];
  freeWindows: FreeWindow[];
  partialErrors: string[];
  planningWindowStart: string;
  planningWindowEnd: string;
  nextSyncToken: string | null;
};
