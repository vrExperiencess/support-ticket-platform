// src/services/dashboard.service.ts

import {
  apiRequest,
} from "./apiClient";

import type {
  DashboardResponse,
} from "../features/dashboard/dashboard.types";

export const dashboardService = {
  getDashboard() {
    return apiRequest<DashboardResponse>(
      "/dashboard",
    );
  },
};