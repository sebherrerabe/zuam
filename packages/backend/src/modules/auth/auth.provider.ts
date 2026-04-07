import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";

import type { GoogleProfile } from "./auth.types";

@Injectable()
export class GoogleAuthProviderStub {
  private configured = true;

  setConfigured(configured: boolean) {
    this.configured = configured;
  }

  startAuthorization(returnTo?: string): { authorizationUrl: string } {
    if (!this.configured) {
      throw new UnauthorizedException({ message: "Google auth is not configured" });
    }

    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", "zuam-dev");
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");

    if (returnTo) {
      url.searchParams.set("state", Buffer.from(JSON.stringify({ returnTo })).toString("base64url"));
    }

    return { authorizationUrl: url.toString() };
  }

  exchangeCode(code: string, state?: string, error?: string): GoogleProfile {
    if (error) {
      throw new BadRequestException({ message: "Google callback returned an error" });
    }

    if (!this.configured) {
      throw new UnauthorizedException({ message: "Google auth is not configured" });
    }

    if (!code) {
      throw new BadRequestException({ message: "Missing OAuth code" });
    }

    if (!state) {
      throw new BadRequestException({ message: "Missing OAuth state" });
    }

    return {
      subject: `subject-${code}`,
      email: `${code}@example.com`,
      name: `User ${code}`,
      avatarUrl: `https://cdn.example.com/avatar/${code}.png`
    };
  }
}
