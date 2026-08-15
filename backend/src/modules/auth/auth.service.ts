// src/modules/auth/auth.service.ts

import {
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

import * as bcrypt from "bcryptjs";

import { UsersService } from "../users/users.service";
import { PermissionsService } from "../permissions/permissions.service";

import { UserEntity } from "../users/entities/user.entity";

import { LoginDto } from "./dto/login.dto";

import { AuthenticatedUser } from "./interfaces/authenticated-user.interface";
import { JwtPayload } from "./interfaces/jwt-payload.interface";

export interface LoginResponse {
  accessToken: string;

  tokenType: "Bearer";

  expiresIn: number;

  user: AuthenticatedUser;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,

    private readonly permissionsService: PermissionsService,

    private readonly jwtService: JwtService,

    private readonly configService: ConfigService,
  ) {}

  async login(
    loginDto: LoginDto,
  ): Promise<LoginResponse> {
    const user =
      await this.usersService.findByEmailWithRole(
        loginDto.email,
      );

    if (!user || !user.isActive) {
      throw new UnauthorizedException(
        "Invalid email or password.",
      );
    }

    const passwordMatches = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException(
        "Invalid email or password.",
      );
    }

    const authenticatedUser =
      await this.mapAuthenticatedUser(user);

    const payload: JwtPayload = {
      sub: user.id,
    };

    const accessToken =
      await this.jwtService.signAsync(payload);

    const expiresIn = Number(
      this.configService.get<string>(
        "JWT_EXPIRES_IN_SECONDS",
      ) ?? 3600,
    );

    return {
      accessToken,

      tokenType: "Bearer",

      expiresIn,

      user: authenticatedUser,
    };
  }

  async getAuthenticatedUser(
    userId: string,
  ): Promise<AuthenticatedUser> {
    const user =
      await this.usersService.findByIdWithRole(
        userId,
      );

    if (!user || !user.isActive) {
      throw new UnauthorizedException(
        "User is no longer available.",
      );
    }

    return this.mapAuthenticatedUser(user);
  }

  private async mapAuthenticatedUser(
    user: UserEntity,
  ): Promise<AuthenticatedUser> {
    if (!user.role) {
      throw new UnauthorizedException(
        "User does not have an assigned role.",
      );
    }

    const permissions =
      await this.permissionsService.getPermissionCodesByRoleId(
        user.roleId,
      );

    return {
      id: user.id,

      name: user.name,

      email: user.email,

      role: {
        id: user.role.id,
        code: user.role.code,
        name: user.role.name,
      },

      permissions,
    };
  }
}