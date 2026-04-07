import { randomUUID, createHash } from "node:crypto";

import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";

import type { AuthUser, InviteToken, SessionRecord } from "./auth.types";

@Injectable()
export class InMemoryAuthDao {
  private readonly usersByGoogleSubject = new Map<string, AuthUser>();
  private readonly usersById = new Map<string, AuthUser>();
  private readonly invitesByToken = new Map<string, InviteToken>();
  private readonly sessionsByRefreshToken = new Map<string, SessionRecord>();

  createOrGetUser(profile: {
    subject: string;
    email: string;
    name: string;
    avatarUrl: string | null;
  }): { user: AuthUser; isNewUser: boolean } {
    const existing = this.usersByGoogleSubject.get(profile.subject);

    if (existing) {
      const updated: AuthUser = {
        ...existing,
        email: profile.email,
        name: profile.name,
        avatarUrl: profile.avatarUrl,
        updatedAt: new Date()
      };

      this.usersByGoogleSubject.set(profile.subject, updated);
      this.usersById.set(updated.id, updated);

      return { user: updated, isNewUser: false };
    }

    const now = new Date();
    const user: AuthUser = {
      id: `user_${randomUUID()}`,
      googleSubject: profile.subject,
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.avatarUrl,
      createdAt: now,
      updatedAt: now
    };

    this.usersByGoogleSubject.set(profile.subject, user);
    this.usersById.set(user.id, user);

    return { user, isNewUser: true };
  }

  findUserByGoogleSubject(subject: string): AuthUser | null {
    return this.usersByGoogleSubject.get(subject) ?? null;
  }

  findUserById(userId: string): AuthUser | null {
    return this.usersById.get(userId) ?? null;
  }

  seedInvite(token: string, expiresAt = new Date(Date.now() + 60 * 60 * 1000)): InviteToken {
    const invite: InviteToken = {
      id: `invite_${randomUUID()}`,
      token,
      createdAt: new Date(),
      expiresAt,
      validatedAt: null,
      usedAt: null,
      usedByUserId: null
    };

    this.invitesByToken.set(token, invite);
    return invite;
  }

  validateInvite(token: string): InviteToken {
    const invite = this.invitesByToken.get(token);

    if (!invite) {
      throw new NotFoundException({ message: "Invite token not found" });
    }

    if (invite.expiresAt.getTime() <= Date.now()) {
      throw new ConflictException({ message: "Invite token expired" });
    }

    if (invite.usedAt) {
      throw new ConflictException({ message: "Invite token already used" });
    }

    if (invite.validatedAt) {
      throw new ConflictException({ message: "Invite token already validated" });
    }

    const validated: InviteToken = {
      ...invite,
      validatedAt: new Date()
    };

    this.invitesByToken.set(token, validated);
    return validated;
  }

  claimValidatedInvite(token: string, userId: string): InviteToken {
    const invite = this.invitesByToken.get(token);

    if (!invite) {
      throw new NotFoundException({ message: "Invite token not found" });
    }

    if (invite.expiresAt.getTime() <= Date.now()) {
      throw new ConflictException({ message: "Invite token expired" });
    }

    if (!invite.validatedAt) {
      throw new ConflictException({ message: "Invite token must be validated first" });
    }

    if (invite.usedAt) {
      throw new ConflictException({ message: "Invite token already used" });
    }

    const claimed: InviteToken = {
      ...invite,
      usedAt: new Date(),
      usedByUserId: userId
    };

    this.invitesByToken.set(token, claimed);
    return claimed;
  }

  createSession(userId: string, inviteRequired: boolean): SessionRecord {
    const accessToken = `access_${randomUUID()}`;
    const refreshToken = `refresh_${randomUUID()}`;
    const session: SessionRecord = {
      id: `session_${randomUUID()}`,
      userId,
      accessToken,
      refreshToken,
      refreshTokenHash: this.hash(refreshToken),
      revokedAt: null,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      inviteRequired
    };

    this.sessionsByRefreshToken.set(refreshToken, session);
    return session;
  }

  rotateSession(refreshToken: string): SessionRecord {
    const session = this.sessionsByRefreshToken.get(refreshToken);

    if (!session) {
      throw new NotFoundException({ message: "Session not found" });
    }

    if (session.revokedAt) {
      throw new ConflictException({ message: "Session revoked" });
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      throw new ConflictException({ message: "Session expired" });
    }

    const rotated: SessionRecord = {
      ...session,
      accessToken: `access_${randomUUID()}`,
      refreshToken: `refresh_${randomUUID()}`,
      refreshTokenHash: "",
      revokedAt: null,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
    };

    rotated.refreshTokenHash = this.hash(rotated.refreshToken);
    this.sessionsByRefreshToken.delete(refreshToken);
    this.sessionsByRefreshToken.set(rotated.refreshToken, rotated);
    return rotated;
  }

  revokeSession(refreshToken: string): SessionRecord {
    const session = this.sessionsByRefreshToken.get(refreshToken);

    if (!session) {
      throw new NotFoundException({ message: "Session not found" });
    }

    const revoked: SessionRecord = {
      ...session,
      revokedAt: new Date()
    };

    this.sessionsByRefreshToken.set(refreshToken, revoked);
    return revoked;
  }

  private hash(value: string): string {
    return createHash("sha256").update(value).digest("hex");
  }
}
