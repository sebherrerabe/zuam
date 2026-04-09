import { contextBridge, ipcRenderer } from "electron";

import {
  DESKTOP_NOTIFICATION_CHANNELS,
  DESKTOP_SHARE_CHANNELS,
  createDesktopRuntimeBridge,
  readBrowserNotificationState,
  requestBrowserNotificationPermission,
  type DesktopNotificationDeliveryResult,
  type DesktopNotificationRequest,
  type DesktopNotificationState,
  type ProgressShareCardExportResult,
  type ProgressShareCardPayload
} from "../src/lib/electron/desktop-notification-bridge";

function createNotificationBridge() {
  return {
    getState: async (): Promise<DesktopNotificationState> => readBrowserNotificationState(),
    requestPermission: async (): Promise<DesktopNotificationState> => requestBrowserNotificationPermission(),
    show: async (request: DesktopNotificationRequest): Promise<DesktopNotificationDeliveryResult> => {
      const state = readBrowserNotificationState();
      if (!state.supported) {
        return { delivered: false, reason: "unsupported" };
      }

      if (state.permission !== "granted") {
        return { delivered: false, reason: state.permission };
      }

      return ipcRenderer.invoke(DESKTOP_NOTIFICATION_CHANNELS.show, request) as Promise<DesktopNotificationDeliveryResult>;
    }
  };
}

function createShareBridge() {
  return {
    exportProgressCard: async (
      payload: ProgressShareCardPayload
    ): Promise<ProgressShareCardExportResult> =>
      ipcRenderer.invoke(DESKTOP_SHARE_CHANNELS.exportProgressCard, payload) as Promise<ProgressShareCardExportResult>
  };
}

contextBridge.exposeInMainWorld("zuamDesktop", {
  ...createDesktopRuntimeBridge({
    platform: process.platform,
    notifications: createNotificationBridge(),
    sharing: createShareBridge()
  })
});
