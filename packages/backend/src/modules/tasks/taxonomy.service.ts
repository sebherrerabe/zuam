import { BadRequestException, Injectable } from "@nestjs/common";

import { TasksDao } from "./dao";
import {
  explainTaskQuery,
  savedFilterInputSchema,
  smartListToPredicate,
  taskQueryInputSchema,
  tagInputSchema,
  updateSavedFilterInputSchema,
  updateTagInputSchema,
  buildSidebarCounts,
  defaultTaskQueryGroupBy,
  defaultTaskQuerySortBy,
  groupTasks,
  recommendFocusTask,
  resolveTaskQuery,
  sortTasks
} from "./query";
import { TaskTaxonomyDao } from "./taxonomy.dao";
import type {
  FocusQueueRecommendation,
  SavedFilterRecord,
  SidebarCountRow,
  SmartListKey,
  TagRecord,
  TaskQueryAst,
  TaskViewQueryResult
} from "./types";

@Injectable()
export class TaskTaxonomyService {
  constructor(
    private readonly taxonomyDao: TaskTaxonomyDao,
    private readonly tasksDao: TasksDao
  ) {}

  listTags(userId: string): TagRecord[] {
    return this.taxonomyDao.listTags(userId);
  }

  createTag(userId: string, input: unknown) {
    const parsed = tagInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException("Invalid tag payload");
    }

    return this.taxonomyDao.createTag(userId, parsed.data);
  }

  updateTag(userId: string, id: string, input: unknown) {
    const parsed = updateTagInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException("Invalid tag payload");
    }

    const current = this.taxonomyDao.getTagById(userId, id);
    const updated = this.taxonomyDao.updateTag(userId, id, parsed.data);

    if (updated.slug !== current.slug) {
      this.rewriteTaskTagSlug(userId, current.slug, updated.slug);
    }

    return updated;
  }

  deleteTag(userId: string, id: string) {
    const deleted = this.taxonomyDao.deleteTag(userId, id);
    this.removeTaskTagSlug(userId, deleted.slug);
    return deleted;
  }

  listSavedFilters(userId: string): SavedFilterRecord[] {
    return this.taxonomyDao.listSavedFilters(userId);
  }

  createSavedFilter(userId: string, input: unknown) {
    const parsed = savedFilterInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException("Invalid saved filter payload");
    }

    return this.taxonomyDao.createSavedFilter(userId, parsed.data);
  }

  updateSavedFilter(userId: string, id: string, input: unknown) {
    const parsed = updateSavedFilterInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException("Invalid saved filter payload");
    }

    return this.taxonomyDao.updateSavedFilter(userId, id, parsed.data);
  }

  deleteSavedFilter(userId: string, id: string) {
    return this.taxonomyDao.deleteSavedFilter(userId, id);
  }

  executeSavedFilter(userId: string, id: string): TaskViewQueryResult {
    return this.queryTasks(userId, { savedFilterId: id });
  }

  queryTasks(userId: string, input: unknown): TaskViewQueryResult {
    const parsed = taskQueryInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException("Invalid query payload");
    }

    const allTasks = this.tasksDao.list(userId);
    const query = this.resolveQuery(userId, parsed.data);
    const groupBy = parsed.data.groupBy ?? defaultTaskQueryGroupBy(parsed.data.view);
    const sortBy = parsed.data.sortBy ?? defaultTaskQuerySortBy(parsed.data.view);

    const evaluated = allTasks
      .map((task) => ({
        task,
        evaluation: resolveTaskQuery(task, query)
      }))
      .filter(({ evaluation }) => evaluation.matched);

    const sorted = sortTasks(
      evaluated.map(({ task }) => task),
      sortBy
    );
    const reasonsByTaskId = Object.fromEntries(
      evaluated.map(({ task, evaluation }) => [task.id, evaluation.reasons])
    );
    const predicateLabel = explainTaskQuery(query);

    return {
      items: sorted,
      explanation: `Matched ${sorted.length} task(s) for ${predicateLabel}`,
      predicate: {
        key: query.kind,
        label: predicateLabel,
        description: predicateLabel
      },
      reasonsByTaskId,
      groupBy,
      sortBy,
      groups: groupBy === "none" ? [{ key: "all", label: "All tasks", items: sorted }] : groupTasks(sorted, groupBy),
      totalCount: sorted.length
    };
  }

  sidebarCounts(userId: string): SidebarCountRow[] {
    const tasks = this.tasksDao.list(userId);
    const tags = this.taxonomyDao.listTags(userId).map((tag) => ({
      slug: tag.slug,
      name: tag.name
    }));
    const savedFilters = this.taxonomyDao.listSavedFilters(userId);
    return buildSidebarCounts(tasks, tags, savedFilters);
  }

  querySmartList(userId: string, smartList: SmartListKey): TaskViewQueryResult {
    return this.queryTasks(userId, { smartList });
  }

  focusQueueRecommendation(userId: string, input: unknown = {}): FocusQueueRecommendation {
    const parsed = taskQueryInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException("Invalid focus queue payload");
    }

    const filtered = this.queryTasks(userId, {
      ...parsed.data,
      view: "focusQueue",
      groupBy: "none",
      sortBy: "priority"
    });
    const recommendation = recommendFocusTask(filtered.items);
    return recommendation;
  }

  private resolveQuery(userId: string, input: {
    listId?: string;
    smartList?: SmartListKey;
    savedFilterId?: string;
    filter?: TaskQueryAst;
  }) {
    let query: TaskQueryAst | null = null;

    if (input.savedFilterId) {
      query = this.taxonomyDao.getSavedFilterById(userId, input.savedFilterId).query;
    } else if (input.smartList) {
      query = smartListToPredicate(input.smartList);
    } else if (input.filter) {
      query = input.filter;
    }

    if (input.listId) {
      const listConstraint: TaskQueryAst = { kind: "list", listIds: [input.listId] };
      query = query
        ? { kind: "and", clauses: [listConstraint, query] }
        : listConstraint;
    }

    if (!query) {
      query = { kind: "and", clauses: [{ kind: "status", statuses: ["active"] }] };
    }

    return query;
  }

  private rewriteTaskTagSlug(userId: string, previousSlug: string, nextSlug: string) {
    for (const task of this.tasksDao.list(userId)) {
      if (task.isDeleted || !task.tagSlugs.includes(previousSlug)) {
        continue;
      }

      const tagSlugs = task.tagSlugs.map((slug) => (slug === previousSlug ? nextSlug : slug));
      this.tasksDao.update(userId, task.id, { tagSlugs });
    }
  }

  private removeTaskTagSlug(userId: string, slug: string) {
    for (const task of this.tasksDao.list(userId)) {
      if (task.isDeleted || !task.tagSlugs.includes(slug)) {
        continue;
      }

      this.tasksDao.update(userId, task.id, {
        tagSlugs: task.tagSlugs.filter((taskSlug) => taskSlug !== slug)
      });
    }
  }
}
