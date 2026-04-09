import type { TaskGroupBy, TaskSortBy } from "@zuam/shared";
import { create } from "zustand";

export type ShellView =
  | "today"
  | "next7days"
  | "assigned"
  | "inbox"
  | "list"
  | "tag"
  | "savedFilter"
  | "focusQueue"
  | "insights"
  | "progression";
export type ShellPresentation = "list" | "kanban" | "matrix" | "calendar";

type ShellState = {
  activeView: ShellView;
  activeListId: string | null;
  activeTagSlug: string | null;
  activeSavedFilterId: string | null;
  activePresentation: ShellPresentation;
  groupBy: TaskGroupBy;
  sortBy: TaskSortBy;
  selectedTaskId: string | null;
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  quickCaptureOpen: boolean;
  setActiveView: (view: ShellView) => void;
  setActiveListId: (listId: string | null) => void;
  setActiveTagSlug: (tagSlug: string | null) => void;
  setActiveSavedFilterId: (savedFilterId: string | null) => void;
  setActivePresentation: (presentation: ShellPresentation) => void;
  setGroupBy: (groupBy: TaskGroupBy) => void;
  setSortBy: (sortBy: TaskSortBy) => void;
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
  activeTagSlug: null,
  activeSavedFilterId: null,
  activePresentation: "list",
  groupBy: "section",
  sortBy: "manual",
  selectedTaskId: null,
  sidebarCollapsed: false,
  commandPaletteOpen: false,
  quickCaptureOpen: false,
  setActiveView: (activeView) => set({ activeView }),
  setActiveListId: (activeListId) => set({ activeListId }),
  setActiveTagSlug: (activeTagSlug) => set({ activeTagSlug }),
  setActiveSavedFilterId: (activeSavedFilterId) => set({ activeSavedFilterId }),
  setActivePresentation: (activePresentation) => set({ activePresentation }),
  setGroupBy: (groupBy) => set({ groupBy }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSelectedTaskId: (selectedTaskId) => set({ selectedTaskId }),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),
  openQuickCapture: () => set({ quickCaptureOpen: true, commandPaletteOpen: false }),
  closeQuickCapture: () => set({ quickCaptureOpen: false })
}));
