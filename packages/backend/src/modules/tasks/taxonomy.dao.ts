import { Injectable } from "@nestjs/common";

import { CoreDataStore } from "../core-data-store";
import { badRequest, maxSortOrder, newId, notFound, nowIso, sortByOrder } from "../core-data-utils";
import { normalizeTagSlug } from "./query";
import type { SavedFilterRecord, TagRecord } from "./types";

@Injectable()
export class TaskTaxonomyDao {
  constructor(private readonly store: CoreDataStore) {}

  listTags(userId: string): TagRecord[] {
    return sortByOrder(
      [...this.store.tags.values()].filter((tag) => tag.userId === userId && !tag.isDeleted)
    );
  }

  getTagById(userId: string, id: string): TagRecord {
    const tag = this.store.tags.get(id);
    if (!tag || tag.userId !== userId || tag.isDeleted) {
      notFound("Tag", id);
    }
    return tag;
  }

  createTag(userId: string, input: { slug: string; name: string }): TagRecord {
    const slug = normalizeTagSlug(input.slug);
    this.assertTagSlugAvailable(userId, slug);

    const now = nowIso();
    const tag: TagRecord = {
      id: newId("tag"),
      userId,
      slug,
      name: input.name.trim(),
      sortOrder: maxSortOrder(this.listTags(userId)) + 1,
      isDeleted: false,
      createdAt: now,
      updatedAt: now
    };

    this.store.tags.set(tag.id, tag);
    return tag;
  }

  updateTag(
    userId: string,
    id: string,
    input: Partial<Pick<TagRecord, "slug" | "name" | "sortOrder">>
  ): TagRecord {
    const current = this.getTagById(userId, id);
    const nextSlug = input.slug === undefined ? current.slug : normalizeTagSlug(input.slug);
    if (nextSlug !== current.slug) {
      this.assertTagSlugAvailable(userId, nextSlug, id);
    }

    const updated: TagRecord = {
      ...current,
      slug: nextSlug,
      name: input.name === undefined ? current.name : input.name.trim(),
      sortOrder: input.sortOrder ?? current.sortOrder,
      updatedAt: nowIso()
    };

    this.store.tags.set(id, updated);
    return updated;
  }

  deleteTag(userId: string, id: string): TagRecord {
    const current = this.getTagById(userId, id);
    const deleted: TagRecord = {
      ...current,
      isDeleted: true,
      updatedAt: nowIso()
    };

    this.store.tags.set(id, deleted);
    return deleted;
  }

  listSavedFilters(userId: string): SavedFilterRecord[] {
    return sortByOrder(
      [...this.store.savedFilters.values()].filter((filter) => filter.userId === userId && !filter.isDeleted)
    );
  }

  getSavedFilterById(userId: string, id: string): SavedFilterRecord {
    const filter = this.store.savedFilters.get(id);
    if (!filter || filter.userId !== userId || filter.isDeleted) {
      notFound("Saved filter", id);
    }
    return filter;
  }

  createSavedFilter(
    userId: string,
    input: { name: string; query: SavedFilterRecord["query"]; sortOrder?: number }
  ): SavedFilterRecord {
    const now = nowIso();
    const filter: SavedFilterRecord = {
      id: newId("filter"),
      userId,
      name: input.name.trim(),
      query: input.query,
      sortOrder: input.sortOrder ?? maxSortOrder(this.listSavedFilters(userId)) + 1,
      isDeleted: false,
      createdAt: now,
      updatedAt: now
    };

    this.store.savedFilters.set(filter.id, filter);
    return filter;
  }

  updateSavedFilter(
    userId: string,
    id: string,
    input: Partial<Pick<SavedFilterRecord, "name" | "query" | "sortOrder">>
  ): SavedFilterRecord {
    const current = this.getSavedFilterById(userId, id);
    const updated: SavedFilterRecord = {
      ...current,
      name: input.name === undefined ? current.name : input.name.trim(),
      query: input.query ?? current.query,
      sortOrder: input.sortOrder ?? current.sortOrder,
      updatedAt: nowIso()
    };

    this.store.savedFilters.set(id, updated);
    return updated;
  }

  deleteSavedFilter(userId: string, id: string): SavedFilterRecord {
    const current = this.getSavedFilterById(userId, id);
    const deleted: SavedFilterRecord = {
      ...current,
      isDeleted: true,
      updatedAt: nowIso()
    };

    this.store.savedFilters.set(id, deleted);
    return deleted;
  }

  private assertTagSlugAvailable(userId: string, slug: string, currentTagId?: string) {
    const duplicate = [...this.store.tags.values()].find(
      (tag) => tag.userId === userId && tag.slug === slug && tag.id !== currentTagId
    );

    if (duplicate) {
      badRequest(`Tag slug "${slug}" already exists`);
    }
  }
}
