import type { TaskDetailModel, TaskDetailSaveState } from "./task-detail-data";

import { cloneTaskDetailModel, getTaskDetailModel } from "./task-detail-data";

const persistedTaskDetails = new Map<string, TaskDetailModel>();
const draftTaskDetails = new Map<string, TaskDetailModel>();
const saveStateByTaskId = new Map<string, TaskDetailSaveState>();

function seedTask(taskId: string) {
  if (!persistedTaskDetails.has(taskId)) {
    const model = getTaskDetailModel(taskId);
    persistedTaskDetails.set(taskId, model);
    draftTaskDetails.set(taskId, cloneTaskDetailModel(model));
    saveStateByTaskId.set(taskId, "idle");
  }
}

export function resetTaskDetailCache() {
  persistedTaskDetails.clear();
  draftTaskDetails.clear();
  saveStateByTaskId.clear();
}

export function readTaskDetail(taskId: string): TaskDetailModel {
  seedTask(taskId);
  return cloneTaskDetailModel(persistedTaskDetails.get(taskId) ?? getTaskDetailModel(taskId));
}

export function readTaskDetailDraft(taskId: string): TaskDetailModel {
  seedTask(taskId);
  return cloneTaskDetailModel(draftTaskDetails.get(taskId) ?? readTaskDetail(taskId));
}

export function writeTaskDetailDraft(taskId: string, nextDraft: TaskDetailModel) {
  seedTask(taskId);
  draftTaskDetails.set(taskId, cloneTaskDetailModel(nextDraft));
}

export function commitTaskDetailDraft(taskId: string, draft: TaskDetailModel) {
  seedTask(taskId);
  const committed = cloneTaskDetailModel(draft);
  persistedTaskDetails.set(taskId, committed);
  draftTaskDetails.set(taskId, cloneTaskDetailModel(committed));
  saveStateByTaskId.set(taskId, "saved");
  return cloneTaskDetailModel(committed);
}

export function readTaskDetailSaveState(taskId: string): TaskDetailSaveState {
  seedTask(taskId);
  return saveStateByTaskId.get(taskId) ?? "idle";
}

export function writeTaskDetailSaveState(taskId: string, saveState: TaskDetailSaveState) {
  seedTask(taskId);
  saveStateByTaskId.set(taskId, saveState);
}
