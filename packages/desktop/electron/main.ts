import path from "node:path";
import { writeFile } from "node:fs/promises";

import { BrowserWindow, Notification as ElectronNotification, app, dialog, ipcMain } from "electron";

import {
  DESKTOP_NOTIFICATION_CHANNELS,
  DESKTOP_SHARE_CHANNELS,
  normalizeDesktopNotificationRequest,
  type DesktopNotificationDeliveryResult,
  type ProgressShareCardExportResult,
  type ProgressShareCardPayload
} from "../src/lib/electron/desktop-notification-bridge";

ipcMain.handle(
  DESKTOP_NOTIFICATION_CHANNELS.show,
  (_event, input: unknown): DesktopNotificationDeliveryResult => {
    const request = normalizeDesktopNotificationRequest(input);
    if (!request) {
      return { delivered: false, reason: "invalid-payload" };
    }

    if (!ElectronNotification.isSupported()) {
      return { delivered: false, reason: "unsupported" };
    }

    new ElectronNotification({
      title: request.title,
      body: request.body,
      silent: request.silent ?? false
    }).show();

    return { delivered: true };
  }
);

ipcMain.handle(
  DESKTOP_SHARE_CHANNELS.exportProgressCard,
  async (_event, payload: ProgressShareCardPayload): Promise<ProgressShareCardExportResult> => {
    const window = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0];
    if (!window) {
      return { saved: false, reason: "no-window" };
    }

    const defaultPath = path.join(
      app.getPath("documents"),
      `${payload.userName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "zuam"}-progress-card.html`
    );

    const result = await dialog.showSaveDialog(window, {
      title: "Export Zuam progress card",
      defaultPath,
      filters: [{ name: "HTML", extensions: ["html"] }]
    });

    if (result.canceled || !result.filePath) {
      return { saved: false, reason: "cancelled" };
    }

    await writeFile(result.filePath, renderProgressShareCardHtml(payload), "utf8");
    return { saved: true, path: result.filePath };
  }
);

function createMainWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1120,
    minHeight: 720,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;

  if (devServerUrl) {
    void window.loadURL(devServerUrl);
    return;
  }

  void window.loadFile(path.join(__dirname, "../dist/client/index.html"));
}

app.whenReady().then(() => {
  createMainWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

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
