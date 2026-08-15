import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";

import { RolePermissionEntity } from './entities/role-permission.entity';
import { RoleEntity } from './entities/role.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
        RolePermissionEntity,
        RoleEntity
        ]),
    ],
    exports: [
        TypeOrmModule,
    ],
})

export class RolesModule {}
