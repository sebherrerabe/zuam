import { Body, Controller, Get, HttpCode, Post, Query } from "@nestjs/common";

import { AuthService } from "./auth.service";

type AuthCallbackQuery = {
  code?: string;
  state?: string;
  error?: string;
  inviteToken?: string;
  returnTo?: string;
};

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("google")
  startGoogle(@Body() body: { returnTo?: string } = {}) {
    return this.authService.startGoogleOAuth(body);
  }

  @Get("google/callback")
  googleCallback(@Query() query: AuthCallbackQuery) {
    return this.authService.completeGoogleCallback(query);
  }

  @Post("validate-invite")
  validateInvite(@Body() body: { token?: string }) {
    return this.authService.validateInvite(body);
  }

  @Post("refresh")
  refresh(@Body() body: { refreshToken?: string }) {
    return this.authService.refresh(body);
  }

  @Post("logout")
  @HttpCode(204)
  logout(@Body() body: { refreshToken?: string }) {
    this.authService.logout(body);
  }
}
