import { create } from "zustand";

export type ShellView = "today" | "next7Days" | "inbox";

type ShellState = {
  activeView: ShellView;
  selectedTaskId: string | null;
  setActiveView: (view: ShellView) => void;
  setSelectedTaskId: (taskId: string | null) => void;
};

export const useShellStore = create<ShellState>((set) => ({
  activeView: "today",
  selectedTaskId: null,
  setActiveView: (activeView) => set({ activeView }),
  setSelectedTaskId: (selectedTaskId) => set({ selectedTaskId })
}));
