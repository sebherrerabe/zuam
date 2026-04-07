import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("zuamDesktop", {
  platform: process.platform
});
