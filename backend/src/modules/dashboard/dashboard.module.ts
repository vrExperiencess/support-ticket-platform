import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";

import { DashboardWidgetEntity } from './entities/dashboard-widget.entity';
import { RoleDashboardWidgetEntity } from './entities/role-dashboard-widget.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
        DashboardWidgetEntity,
        RoleDashboardWidgetEntity
        ]),
    ],
    exports: [
        TypeOrmModule,
    ],
})

export class DashboardModule {}
