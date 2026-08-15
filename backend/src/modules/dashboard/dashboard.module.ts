// src/modules/dashboard/dashboard.module.ts

import {
  Module,
} from "@nestjs/common";

import {
  TypeOrmModule,
} from "@nestjs/typeorm";

import {
  TicketEntity,
} from "../tickets/entities/ticket.entity";

import {
  DashboardWidgetEntity,
} from "./entities/dashboard-widget.entity";

import {
  RoleDashboardWidgetEntity,
} from "./entities/role-dashboard-widget.entity";

import {
  DashboardController,
} from "./dashboard.controller";

import {
  DashboardService,
} from "./dashboard.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DashboardWidgetEntity,
      RoleDashboardWidgetEntity,
      TicketEntity,
    ]),
  ],

  controllers: [
    DashboardController,
  ],

  providers: [
    DashboardService,
  ],

  exports: [
    DashboardService,
  ],
})
export class DashboardModule {}