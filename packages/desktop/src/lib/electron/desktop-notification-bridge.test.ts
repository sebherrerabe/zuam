import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  DESKTOP_NOTIFICATION_CHANNELS,
  getDesktopNotificationState,
  normalizeDesktopNotificationRequest,
  requestDesktopNotificationPermission,
  showDesktopNotification
} from "./desktop-notification-bridge";

type NotificationStub = typeof Notification & {
  permission: NotificationPermission | "unsupported";
  requestPermission: () => Promise<NotificationPermission>;
};

describe("desktop notification bridge", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    delete window.zuamDesktop;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    delete window.zuamDesktop;
  });

  it("normalizes valid notification payloads", () => {
    expect(normalizeDesktopNotificationRequest({ title: "  Task reminder  ", body: "Review plan", silent: true })).toEqual({
      title: "Task reminder",
      body: "Review plan",
      silent: true
    });
    expect(normalizeDesktopNotificationRequest({ title: "   " })).toBeNull();
    expect(normalizeDesktopNotificationRequest(null)).toBeNull();
  });

  it("uses the browser notification API when no bridge is present", async () => {
    const notificationCtor = vi.fn() as unknown as NotificationStub;
    notificationCtor.permission = "default";
    const requestPermission: NotificationStub["requestPermission"] = vi.fn(async () => {
      notificationCtor.permission = "granted";
      return "granted" as NotificationPermission;
    });
    notificationCtor.requestPermission = requestPermission;

    vi.stubGlobal("Notification", notificationCtor);

    const stateBefore = await getDesktopNotificationState();
    expect(stateBefore).toEqual({
      supported: true,
      permission: "default",
      platform: navigator.platform
    });

    const stateAfter = await requestDesktopNotificationPermission();
    expect(stateAfter.permission).toBe("granted");
    expect(notificationCtor.requestPermission).toHaveBeenCalledTimes(1);

    const result = await showDesktopNotification({ title: "Ping", body: "Check the desktop shell" });
    expect(result).toEqual({ delivered: true });
    expect(notificationCtor).toHaveBeenCalledWith("Ping", {
      body: "Check the desktop shell",
      silent: undefined
    });
  });

  it("delegates to the exposed Electron bridge when present", async () => {
    const getState = vi.fn(async () => ({
      supported: true,
      permission: "granted" as const,
      platform: "win32"
    }));
    const requestPermission = vi.fn(async () => ({
      supported: true,
      permission: "granted" as const,
      platform: "win32"
    }));
    const show = vi.fn(async () => ({ delivered: true }));

    window.zuamDesktop = {
      platform: "win32",
      notifications: {
        getState,
        requestPermission,
        show
      }
    };

    await expect(getDesktopNotificationState()).resolves.toEqual({
      supported: true,
      permission: "granted",
      platform: "win32"
    });
    await expect(requestDesktopNotificationPermission()).resolves.toEqual({
      supported: true,
      permission: "granted",
      platform: "win32"
    });
    await expect(showDesktopNotification({ title: "Desktop only" })).resolves.toEqual({ delivered: true });

    expect(show).toHaveBeenCalledWith({ title: "Desktop only" });
  });

  it("exposes the ipc channel constant for the preload/main bridge", () => {
    expect(DESKTOP_NOTIFICATION_CHANNELS.show).toBe("zuam:notifications:show");
  });
});
