// src/modules/permissions/permissions.module.ts

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { PermissionEntity } from "./entities/permission.entity";
import { RolePermissionEntity } from "../roles/entities/role-permission.entity";

import { PermissionsService } from "./permissions.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PermissionEntity,
      RolePermissionEntity,
    ]),
  ],

  providers: [
    PermissionsService,
  ],

  exports: [
    PermissionsService,
  ],
})
export class PermissionsModule {}