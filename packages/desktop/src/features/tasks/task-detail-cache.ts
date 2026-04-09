import type { TaskDetailModel, TaskDetailSaveState } from "./task-detail-data";

const draftTaskDetails = new Map<string, TaskDetailModel>();
const saveStateByTaskId = new Map<string, TaskDetailSaveState>();

export function resetTaskDetailCache() {
  draftTaskDetails.clear();
  saveStateByTaskId.clear();
}

export function readTaskDetailDraft(taskId: string): TaskDetailModel | null {
  const draft = draftTaskDetails.get(taskId);
  return draft ? structuredClone(draft) : null;
}

export function writeTaskDetailDraft(taskId: string, nextDraft: TaskDetailModel) {
  draftTaskDetails.set(taskId, structuredClone(nextDraft));
}

export function clearTaskDetailDraft(taskId: string) {
  draftTaskDetails.delete(taskId);
  saveStateByTaskId.delete(taskId);
}

export function readTaskDetailSaveState(taskId: string): TaskDetailSaveState {
  return saveStateByTaskId.get(taskId) ?? "idle";
}

export function writeTaskDetailSaveState(taskId: string, saveState: TaskDetailSaveState) {
  saveStateByTaskId.set(taskId, saveState);
}
