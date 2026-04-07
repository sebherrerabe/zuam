import { BadRequestException, NotFoundException, UnauthorizedException } from "@nestjs/common";

export function nowIso() {
  return new Date().toISOString();
}

export function newId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function ensureUserId(userId: string | undefined): string {
  const normalizedUserId = userId?.trim();

  if (!normalizedUserId) {
    throw new UnauthorizedException("Missing authenticated user context");
  }

  return normalizedUserId;
}

export function badRequest(message: string): never {
  throw new BadRequestException(message);
}

export function notFound(entity: string, id: string): never {
  throw new NotFoundException(`${entity} ${id} was not found`);
}

export function sortByOrder<T extends { sortOrder: number; createdAt: string; id: string }>(items: T[]) {
  return [...items].sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }

    if (left.createdAt !== right.createdAt) {
      return left.createdAt.localeCompare(right.createdAt);
    }

    return left.id.localeCompare(right.id);
  });
}

export function maxSortOrder<T extends { sortOrder: number }>(items: T[]) {
  return items.reduce((max, item) => Math.max(max, item.sortOrder), -1);
}
