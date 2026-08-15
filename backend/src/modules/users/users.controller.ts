import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";

import type {
  AuthenticatedUser,
} from "../auth/interfaces/authenticated-user.interface";

import {
  CurrentUser,
} from "../auth/decorators/current-user.decorator";

import {
  Permissions,
} from "../auth/decorators/permissions.decorator";

import {
  JwtAuthGuard,
} from "../auth/guards/jwt-auth.guard";

import {
  PermissionsGuard,
} from "../auth/guards/permissions.guard";

import {
  CreateUserDto,
} from "./dto/create-user.dto";

import {
  UpdateUserDto,
} from "./dto/update-user.dto";

import {
  UserFilterDto,
} from "./dto/user-filter.dto";

import {
  PaginatedUsersResponseDto,
  RoleOptionResponseDto,
  UserDetailResponseDto,
} from "./dto/user-response.dto";

import {
  UsersService,
} from "./users.service";

@Controller("users")
@UseGuards(
  JwtAuthGuard,
  PermissionsGuard,
)
export class UsersController {
  constructor(
    private readonly usersService:
      UsersService,
  ) {}

  /*
   * IMPORTANTE:
   *
   * La ruta estática catalogs/roles debe aparecer
   * antes de :id para mantener el controller claro.
   */

  @Get("catalogs/roles")
  @Permissions(
    "users.read",
  )
  getRoles(): Promise<RoleOptionResponseDto[]> {
    return this.usersService.getRoleOptions();
  }

  @Get()
  @Permissions(
    "users.read",
  )
  findAll(
    @Query()
    filters:
      UserFilterDto,
  ): Promise<PaginatedUsersResponseDto> {
    return this.usersService.findAll(
      filters,
    );
  }

  @Get(":id")
  @Permissions(
    "users.read",
  )
  findOne(
    @Param(
      "id",
      new ParseUUIDPipe({
        version:
          "4",
      }),
    )
    id: string,
  ): Promise<UserDetailResponseDto> {
    return this.usersService.findOneForManagement(
      id,
    );
  }

  @Post()
  @Permissions(
    "users.create",
  )
  create(
    @Body()
    dto:
      CreateUserDto,
  ): Promise<UserDetailResponseDto> {
    return this.usersService.create(
      dto,
    );
  }

  @Patch(":id")
  @Permissions(
    "users.update",
  )
  update(
    @Param(
      "id",
      new ParseUUIDPipe({
        version:
          "4",
      }),
    )
    id: string,

    @Body()
    dto:
      UpdateUserDto,

    @CurrentUser()
    currentUser:
      AuthenticatedUser,
  ): Promise<UserDetailResponseDto> {
    return this.usersService.update(
      id,
      dto,
      currentUser,
    );
  }
}