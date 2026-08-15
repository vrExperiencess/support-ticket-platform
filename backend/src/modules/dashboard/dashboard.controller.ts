// src/modules/dashboard/dashboard.controller.ts

import {
  Controller,
  Get,
  UseGuards,
} from "@nestjs/common";

import type {
  AuthenticatedUser,
} from "../auth/interfaces/authenticated-user.interface";

import {
  CurrentUser,
} from "../auth/decorators/current-user.decorator";

import {
  JwtAuthGuard,
} from "../auth/guards/jwt-auth.guard";

import {
  DashboardResponseDto,
} from "./dto/dashboard-response.dto";

import {
  DashboardService,
} from "./dashboard.service";

@Controller("dashboard")
@UseGuards(
  JwtAuthGuard,
)
export class DashboardController {
  constructor(
    private readonly dashboardService:
      DashboardService,
  ) {}

  /**
   * Cada usuario obtiene únicamente los widgets
   * habilitados para su rol y autorizados por permisos.
   */
  @Get()
  getDashboard(
    @CurrentUser()
    user: AuthenticatedUser,
  ): Promise<DashboardResponseDto> {
    return this.dashboardService.getDashboard(
      user,
    );
  }
}