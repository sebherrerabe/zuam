import { taskStatusOptions, type TaskListSummary, type TaskSummary } from "@zuam/shared/tasks";

export function buildDemoTask(): TaskSummary {
  return {
    id: "task-demo",
    title: "Scaffold the mobile shell",
    status: taskStatusOptions[0]
  };
}

export function buildDemoList(): TaskListSummary {
  return {
    id: "list-inbox",
    name: "Inbox"
  };
}
