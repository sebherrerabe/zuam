import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { EventEmitter } from "node:events";

import { GoogleAuthProviderStub } from "./auth.provider";
import { InMemoryAuthDao } from "./auth.dao";
import type { AuthSessionPayload, SessionUpdateEvent } from "./auth.types";

@Injectable()
export class AuthEventBus extends EventEmitter {
  emitSessionUpdated(event: SessionUpdateEvent) {
    this.emit("auth:session-updated", event);
  }
}

@Injectable()
export class AuthService {
  constructor(
    private readonly dao: InMemoryAuthDao,
    private readonly provider: GoogleAuthProviderStub,
    private readonly eventBus: AuthEventBus
  ) {}

  startGoogleOAuth(input: { returnTo?: string } = {}): { authorizationUrl: string } {
    return this.provider.startAuthorization(input.returnTo);
  }

  completeGoogleCallback(input: {
    code?: string;
    state?: string;
    error?: string;
    inviteToken?: string;
    returnTo?: string;
  }): AuthSessionPayload {
    if (input.error) {
      throw new BadRequestException({ message: "Google callback returned an error" });
    }

    const profile = this.provider.exchangeCode(input.code ?? "", input.state, input.error);
    const { user, isNewUser } = this.dao.createOrGetUser(profile);

    let inviteRequired = false;

    if (isNewUser) {
      if (input.inviteToken) {
        this.dao.claimValidatedInvite(input.inviteToken, user.id);
      } else {
        inviteRequired = true;
      }
    }

    const session = this.dao.createSession(user.id, inviteRequired);
    this.eventBus.emitSessionUpdated({
      userId: user.id,
      authenticated: !inviteRequired,
      inviteRequired
    });

    return {
      user,
      isNewUser,
      inviteRequired,
      cookies: [
        `zuam_access=${session.accessToken}; HttpOnly; Path=/; SameSite=Lax`,
        `zuam_refresh=${session.refreshToken}; HttpOnly; Path=/; SameSite=Lax`
      ],
      session: {
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        expiresAt: session.expiresAt
      }
    };
  }

  validateInvite(input: { token?: string }): { valid: true; inviteId: string; expiresAt: Date } {
    const token = input.token?.trim();

    if (!token) {
      throw new BadRequestException({ message: "Invite token is required" });
    }

    const invite = this.dao.validateInvite(token);
    return {
      valid: true,
      inviteId: invite.id,
      expiresAt: invite.expiresAt
    };
  }

  refresh(input: { refreshToken?: string }): AuthSessionPayload {
    const refreshToken = input.refreshToken?.trim();

    if (!refreshToken) {
      throw new UnauthorizedException({ message: "Missing refresh token" });
    }

    const session = this.dao.rotateSession(refreshToken);
    const user = this.dao.findUserById(session.userId);

    if (!user) {
      throw new ConflictException({ message: "Session user not found" });
    }

    this.eventBus.emitSessionUpdated({
      userId: user.id,
      authenticated: !session.inviteRequired,
      inviteRequired: session.inviteRequired
    });

    return {
      user,
      isNewUser: false,
      inviteRequired: session.inviteRequired,
      cookies: [
        `zuam_access=${session.accessToken}; HttpOnly; Path=/; SameSite=Lax`,
        `zuam_refresh=${session.refreshToken}; HttpOnly; Path=/; SameSite=Lax`
      ],
      session: {
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        expiresAt: session.expiresAt
      }
    };
  }

  logout(input: { refreshToken?: string }): void {
    const refreshToken = input.refreshToken?.trim();

    if (!refreshToken) {
      throw new UnauthorizedException({ message: "Missing refresh token" });
    }

    const session = this.dao.revokeSession(refreshToken);
    this.eventBus.emitSessionUpdated({
      userId: session.userId,
      authenticated: false,
      inviteRequired: session.inviteRequired
    });
  }
}
