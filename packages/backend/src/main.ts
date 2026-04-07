import "reflect-metadata";

import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";
import { loadBackendEnv } from "./config/env";

async function bootstrap() {
  const env = loadBackendEnv();
  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log"]
  });

  await app.listen(env.PORT);
}

void bootstrap();
