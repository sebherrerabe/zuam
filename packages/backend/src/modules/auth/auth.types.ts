export type GoogleProfile = {
  subject: string;
  email: string;
  name: string;
  avatarUrl: string | null;
};

export type AuthUser = {
  id: string;
  googleSubject: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type InviteToken = {
  id: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
  validatedAt: Date | null;
  usedAt: Date | null;
  usedByUserId: string | null;
};

export type SessionRecord = {
  id: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
  refreshTokenHash: string;
  revokedAt: Date | null;
  expiresAt: Date;
  inviteRequired: boolean;
};

export type AuthSessionPayload = {
  user: AuthUser;
  isNewUser: boolean;
  inviteRequired: boolean;
  cookies: string[];
  session: {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  };
};

export type SessionUpdateEvent = {
  userId: string;
  authenticated: boolean;
  inviteRequired: boolean;
};

