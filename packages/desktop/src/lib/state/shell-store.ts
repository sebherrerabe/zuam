import { create } from "zustand";

export type ShellView =
  | "today"
  | "next7days"
  | "assigned"
  | "inbox"
  | "list"
  | "kanban"
  | "matrix"
  | "calendar"
  | "focusQueue";

type ShellState = {
  activeView: ShellView;
  activeListId: string | null;
  selectedTaskId: string | null;
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  quickCaptureOpen: boolean;
  setActiveView: (view: ShellView) => void;
  setActiveListId: (listId: string | null) => void;
  setSelectedTaskId: (taskId: string | null) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  openQuickCapture: () => void;
  closeQuickCapture: () => void;
};

export const useShellStore = create<ShellState>((set) => ({
  activeView: "today",
  activeListId: null,
  selectedTaskId: null,
  sidebarCollapsed: false,
  commandPaletteOpen: false,
  quickCaptureOpen: false,
  setActiveView: (activeView) => set({ activeView }),
  setActiveListId: (activeListId) => set({ activeListId }),
  setSelectedTaskId: (selectedTaskId) => set({ selectedTaskId }),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),
  openQuickCapture: () => set({ quickCaptureOpen: true, commandPaletteOpen: false }),
  closeQuickCapture: () => set({ quickCaptureOpen: false })
}));
