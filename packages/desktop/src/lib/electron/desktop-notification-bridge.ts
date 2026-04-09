export const DESKTOP_NOTIFICATION_CHANNELS = {
  show: "zuam:notifications:show"
} as const;

export const DESKTOP_SHARE_CHANNELS = {
  exportProgressCard: "zuam:share:export-progress-card"
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

export type ProgressShareCardPayload = {
  userName: string;
  level: number;
  totalXp: number;
  nextLevelXp: number;
  archetype: string;
  equippedCosmetics: string[];
  unlockedCosmetics: string[];
  weeklyActiveDays: number;
  shareMessage: string;
};

export type ProgressShareCardExportResult = {
  saved: boolean;
  path?: string;
  reason?: string;
};

export type DesktopShareBridge = {
  exportProgressCard: (payload: ProgressShareCardPayload) => Promise<ProgressShareCardExportResult>;
};

type NotificationIpc = {
  invoke: (channel: string, request: DesktopNotificationRequest) => Promise<DesktopNotificationDeliveryResult>;
};

export type DesktopRuntimeBridge = {
  platform: string;
  notifications: DesktopNotificationBridge;
  sharing: DesktopShareBridge;
};

declare global {
  interface Window {
    zuamDesktop?: DesktopRuntimeBridge;
  }
}

export function createDesktopRuntimeBridge(input: DesktopRuntimeBridge): DesktopRuntimeBridge {
  return {
    platform: input.platform,
    notifications: input.notifications,
    sharing: input.sharing
  };
}

export function getDesktopRuntimeBridge(): DesktopRuntimeBridge | null {
  return window.zuamDesktop ?? null;
}

export function getDesktopRuntimePlatform(): string {
  return getDesktopRuntimeBridge()?.platform ?? (typeof navigator !== "undefined" ? navigator.platform : "web");
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
    platform: getDesktopRuntimePlatform()
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
  return getDesktopRuntimeBridge()?.notifications ?? null;
}

export function getDesktopShareBridge(): DesktopShareBridge | null {
  return getDesktopRuntimeBridge()?.sharing ?? null;
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

export async function exportProgressShareCard(
  payload: ProgressShareCardPayload
): Promise<ProgressShareCardExportResult> {
  const bridge = getDesktopShareBridge();
  if (bridge) {
    return bridge.exportProgressCard(payload);
  }

  if (typeof document === "undefined" || typeof URL === "undefined") {
    return { saved: false, reason: "unsupported" };
  }

  const html = renderProgressShareCardHtml(payload);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = buildProgressShareCardFileName(payload.userName);
  anchor.click();
  URL.revokeObjectURL(objectUrl);

  return { saved: true };
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

function buildProgressShareCardFileName(userName: string) {
  const sanitized = userName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${sanitized || "zuam"}-progress-card.html`;
}

function renderProgressShareCardHtml(payload: ProgressShareCardPayload) {
  const cosmetics = payload.equippedCosmetics.length > 0 ? payload.equippedCosmetics.join(", ") : "No cosmetics equipped";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Zuam Progress Share Card</title>
    <style>
      body {
        margin: 0;
        font-family: Inter, system-ui, sans-serif;
        background: #f2e9dd;
        color: #2f241d;
      }
      .card {
        width: 560px;
        margin: 48px auto;
        padding: 32px;
        border-radius: 28px;
        background: linear-gradient(180deg, #fff8ef 0%, #f6eadc 100%);
        box-shadow: 0 18px 44px rgba(82, 57, 35, 0.14);
      }
      .kicker {
        font-size: 12px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #8f6f57;
      }
      h1 {
        margin: 8px 0 6px;
        font-size: 36px;
      }
      .meta {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
        margin: 24px 0;
      }
      .chip {
        padding: 14px 16px;
        border-radius: 18px;
        background: rgba(91, 106, 240, 0.08);
      }
      .chip strong {
        display: block;
        font-size: 22px;
      }
      .footer {
        margin-top: 20px;
        color: #705949;
      }
    </style>
  </head>
  <body>
    <main class="card">
      <div class="kicker">Zuam private share card</div>
      <h1>${escapeHtml(payload.userName)} · Level ${payload.level}</h1>
      <p>${escapeHtml(payload.shareMessage)}</p>
      <div class="meta">
        <div class="chip"><strong>${payload.totalXp}</strong><span>Total XP</span></div>
        <div class="chip"><strong>${payload.nextLevelXp}</strong><span>Next level target</span></div>
        <div class="chip"><strong>${payload.weeklyActiveDays}</strong><span>Active days</span></div>
      </div>
      <p><strong>Archetype:</strong> ${escapeHtml(payload.archetype)}</p>
      <p><strong>Equipped:</strong> ${escapeHtml(cosmetics)}</p>
      <p class="footer">Private export only. No public Zuam profile URL is generated in this phase.</p>
    </main>
  </body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
