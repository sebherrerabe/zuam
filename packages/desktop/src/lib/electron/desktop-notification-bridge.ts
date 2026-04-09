export const DESKTOP_NOTIFICATION_CHANNELS = {
  show: "zuam:notifications:show"
} as const;

export type DesktopNotificationPermissionState = "granted" | "denied" | "default" | "unsupported";

export type DesktopNotificationState = {
  supported: boolean;
  permission: DesktopNotificationPermissionState;
  platform: string;
};

export type DesktopNotificationRequest = {
  title: string;
  body?: string;
  silent?: boolean;
};

export type DesktopNotificationDeliveryResult = {
  delivered: boolean;
  reason?: string;
};

export type DesktopNotificationBridge = {
  getState: () => Promise<DesktopNotificationState>;
  requestPermission: () => Promise<DesktopNotificationState>;
  show: (request: DesktopNotificationRequest) => Promise<DesktopNotificationDeliveryResult>;
};

type NotificationIpc = {
  invoke: (channel: string, request: DesktopNotificationRequest) => Promise<DesktopNotificationDeliveryResult>;
};

export type DesktopRuntimeBridge = {
  platform: string;
  notifications: DesktopNotificationBridge;
};

declare global {
  interface Window {
    zuamDesktop?: DesktopRuntimeBridge;
  }
}

export function normalizeDesktopNotificationRequest(input: unknown): DesktopNotificationRequest | null {
  if (typeof input !== "object" || input === null) {
    return null;
  }

  const candidate = input as Record<string, unknown>;
  if (typeof candidate.title !== "string" || candidate.title.trim().length === 0) {
    return null;
  }

  const request: DesktopNotificationRequest = {
    title: candidate.title.trim()
  };

  if (typeof candidate.body === "string") {
    request.body = candidate.body;
  }

  if (typeof candidate.silent === "boolean") {
    request.silent = candidate.silent;
  }

  return request;
}

export function readBrowserNotificationState(): DesktopNotificationState {
  const permission = readBrowserNotificationPermission();
  return {
    supported: permission !== "unsupported",
    permission,
    platform: typeof navigator !== "undefined" ? navigator.platform : "web"
  };
}

export async function requestBrowserNotificationPermission(): Promise<DesktopNotificationState> {
  const notificationApi = getBrowserNotificationApi();
  if (!notificationApi || typeof notificationApi.requestPermission !== "function") {
    return readBrowserNotificationState();
  }

  const permission = await notificationApi.requestPermission();
  return {
    supported: true,
    permission: normalizePermissionState(permission),
    platform: typeof navigator !== "undefined" ? navigator.platform : "web"
  };
}

export function getDesktopNotificationBridge(): DesktopNotificationBridge | null {
  return window.zuamDesktop?.notifications ?? null;
}

export async function getDesktopNotificationState(): Promise<DesktopNotificationState> {
  const bridge = getDesktopNotificationBridge();
  if (bridge) {
    return bridge.getState();
  }

  return readBrowserNotificationState();
}

export async function requestDesktopNotificationPermission(): Promise<DesktopNotificationState> {
  const bridge = getDesktopNotificationBridge();
  if (bridge) {
    return bridge.requestPermission();
  }

  return requestBrowserNotificationPermission();
}

export async function showDesktopNotification(
  input: unknown,
  fallbackIpc?: NotificationIpc
): Promise<DesktopNotificationDeliveryResult> {
  const request = normalizeDesktopNotificationRequest(input);
  if (!request) {
    return { delivered: false, reason: "invalid-payload" };
  }

  const bridge = getDesktopNotificationBridge();
  if (bridge) {
    return bridge.show(request);
  }

  const state = await getDesktopNotificationState();
  if (!state.supported) {
    return { delivered: false, reason: "unsupported" };
  }

  if (state.permission !== "granted") {
    return { delivered: false, reason: state.permission };
  }

  if (fallbackIpc) {
    return fallbackIpc.invoke(DESKTOP_NOTIFICATION_CHANNELS.show, request) as Promise<DesktopNotificationDeliveryResult>;
  }

  const notificationApi = getBrowserNotificationApi();
  if (!notificationApi) {
    return { delivered: false, reason: "unsupported" };
  }

  // Web fallback: deliver locally when no Electron bridge is present.
  new notificationApi(request.title, {
    body: request.body,
    silent: request.silent
  });

  return { delivered: true };
}

function getBrowserNotificationApi() {
  if (typeof Notification === "undefined") {
    return null;
  }

  return Notification;
}

function readBrowserNotificationPermission(): DesktopNotificationPermissionState {
  const notificationApi = getBrowserNotificationApi();
  if (!notificationApi || typeof notificationApi.permission !== "string") {
    return "unsupported";
  }

  return normalizePermissionState(notificationApi.permission);
}

function normalizePermissionState(permission: string): DesktopNotificationPermissionState {
  if (permission === "granted" || permission === "denied" || permission === "default") {
    return permission;
  }

  return "unsupported";
}
