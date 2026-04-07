import { Module } from "@nestjs/common";

import { AuthController } from "./auth.controller";
import { InMemoryAuthDao } from "./auth.dao";
import { AuthEventBus, AuthService } from "./auth.service";
import { GoogleAuthProviderStub } from "./auth.provider";

@Module({
  controllers: [AuthController],
  providers: [InMemoryAuthDao, GoogleAuthProviderStub, AuthEventBus, AuthService],
  exports: [AuthService, InMemoryAuthDao, GoogleAuthProviderStub, AuthEventBus]
})
export class AuthModule {}

