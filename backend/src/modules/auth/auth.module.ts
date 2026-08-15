// src/modules/auth/auth.module.ts

import { Module } from "@nestjs/common";

import { ConfigModule, ConfigService } from "@nestjs/config";

import {
  JwtModule,
} from "@nestjs/jwt";

import {
  PassportModule,
} from "@nestjs/passport";

import { UsersModule } from "../users/users.module";
import { PermissionsModule } from "../permissions/permissions.module";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

import { JwtStrategy } from "./strategies/jwt.strategy";

import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { PermissionsGuard } from "./guards/permissions.guard";

@Module({
  imports: [
    ConfigModule,

    PassportModule,

    JwtModule.registerAsync({
      imports: [
        ConfigModule,
      ],

      inject: [
        ConfigService,
      ],

      useFactory: (
        configService: ConfigService,
      ) => ({
        secret:
          configService.getOrThrow<string>(
            "JWT_SECRET",
          ),

        signOptions: {
          expiresIn: Number(
            configService.get<string>(
              "JWT_EXPIRES_IN_SECONDS",
            ) ?? 3600,
          ),
        },
      }),
    }),

    UsersModule,

    PermissionsModule,
  ],

  controllers: [
    AuthController,
  ],

  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    PermissionsGuard,
  ],

  exports: [
    AuthService,
    JwtAuthGuard,
    PermissionsGuard,
  ],
})
export class AuthModule {}