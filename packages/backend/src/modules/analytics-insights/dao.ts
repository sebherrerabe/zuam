import { Injectable } from "@nestjs/common";
import type {
  FocusSessionCompletionFact,
  TaskCompletionFact
} from "@zuam/shared";

import { FocusSessionsDao } from "../focus-sessions/dao";
import { TasksDao } from "../tasks/dao";

@Injectable()
export class AnalyticsInsightsDao {
  constructor(
    private readonly tasksDao: TasksDao,
    private readonly focusSessionsDao: FocusSessionsDao
  ) {}

  listTaskCompletionFacts(userId: string): TaskCompletionFact[] {
    return this.tasksDao
      .list(userId)
      .filter((task) => task.completed && Boolean(task.completedAt))
      .map((task) => {
        const completedAt = task.completedAt ?? new Date().toISOString();
        const completedDate = completedAt.slice(0, 10);
        const overdueAtCompletion =
          Boolean(task.dueDate) &&
          task.dueDate !== null &&
          task.dueDate.slice(0, 10) < completedDate;

        return {
          taskId: task.id,
          title: task.title,
          completedAt,
          completedDate,
          priority: task.priority,
          resistance: task.resistance,
          energyLevel: task.energyLevel,
          dueDate: task.dueDate,
          overdueAtCompletion,
          listId: task.listId,
          sectionId: task.sectionId,
          parentTaskId: task.parentTaskId
        };
      })
      .sort((left, right) => left.completedAt.localeCompare(right.completedAt));
  }

  listFocusSessionCompletionFacts(userId: string): FocusSessionCompletionFact[] {
    return this.focusSessionsDao
      .listSessions(userId)
      .filter((session) => session.state === "completed" && Boolean(session.endedAt))
      .map((session) => ({
        sessionId: session.id,
        taskId: session.taskId,
        taskTitle: this.tasksDao.getById(userId, session.taskId).title,
        endedAt: session.endedAt ?? new Date().toISOString(),
        completedDate: (session.endedAt ?? new Date().toISOString()).slice(0, 10),
        loggedMinutes: session.loggedMinutes,
        workMinutes: session.workMinutes,
        breakMinutes: session.breakMinutes,
        extraMinutes: session.extraMinutes
      }))
      .sort((left, right) => left.endedAt.localeCompare(right.endedAt));
  }
}
