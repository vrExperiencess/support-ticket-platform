// src/modules/permissions/permissions.service.ts

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { RolePermissionEntity } from "../roles/entities/role-permission.entity";

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(RolePermissionEntity)
    private readonly rolePermissionRepository: Repository<RolePermissionEntity>,
  ) {}

  async getPermissionCodesByRoleId(
    roleId: string,
  ): Promise<string[]> {
    const rolePermissions =
      await this.rolePermissionRepository.find({
        where: {
          roleId,
        },

        relations: {
          permission: true,
        },
      });

    return rolePermissions
      .map(
        (rolePermission) =>
          rolePermission.permission.code,
      )
      .sort();
  }
}