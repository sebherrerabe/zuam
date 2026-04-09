import { contextBridge, ipcRenderer } from "electron";

import {
  DESKTOP_NOTIFICATION_CHANNELS,
  readBrowserNotificationState,
  requestBrowserNotificationPermission,
  type DesktopNotificationDeliveryResult,
  type DesktopNotificationRequest,
  type DesktopNotificationState
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

contextBridge.exposeInMainWorld("zuamDesktop", {
  platform: process.platform,
  notifications: createNotificationBridge()
});
