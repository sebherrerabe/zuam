import path from "node:path";

import { BrowserWindow, Notification as ElectronNotification, app, ipcMain } from "electron";

import {
  DESKTOP_NOTIFICATION_CHANNELS,
  normalizeDesktopNotificationRequest,
  type DesktopNotificationDeliveryResult
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
