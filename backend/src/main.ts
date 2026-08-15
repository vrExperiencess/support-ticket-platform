// src/main.ts

import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app =
    await NestFactory.create(
      AppModule,
    );

  app.setGlobalPrefix("api");

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,

      forbidNonWhitelisted: true,

      transform: true,
    }),
  );

  const allowedOrigins = (
    process.env.FRONTEND_URL ??
    "http://localhost:5173"
  )
    .split(",")
    .map((origin) =>
      origin.trim(),
    )
    .filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
  });

  const port =
    Number(
      process.env.PORT,
    ) || 3000;

  await app.listen(
    port,
    "0.0.0.0",
  );

  console.log(
    `Support Ticket API running on port ${port}`,
  );
}

void bootstrap();