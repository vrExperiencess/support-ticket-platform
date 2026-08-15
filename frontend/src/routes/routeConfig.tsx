import type {
  LucideIcon,
} from "lucide-react";

import {
  //BarChart3,
  CircleUserRound,
  LayoutDashboard,
  PlusCircle,
  Ticket,
  Users,
} from "lucide-react";

export interface NavigationRoute {
  id: string;
  path: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  permission?: string;
  end?: boolean;
}

export const navigationRoutes:
  NavigationRoute[] = [
  {
    id: "dashboard",
    path: "/",
    label: "Dashboard",
    description:
      "Operational overview",
    icon: LayoutDashboard,
    end: true,
  },

  {
    id: "tickets",
    path: "/tickets",
    label: "Tickets",
    description:
      "Support requests",
    icon: Ticket,
    permission:
      "tickets.read",
  },

  {
    id: "ticket-create",
    path: "/tickets/new",
    label: "Create ticket",
    description:
      "New support request",
    icon: PlusCircle,
    permission:
      "tickets.create",
  },

  // {
  //   id: "metrics",
  //   path: "/metrics",
  //   label: "Metrics",
  //   description:
  //     "Operational indicators",
  //   icon: BarChart3,
  //   permission:
  //     "metrics.read",
  // },

  {
    id: "users",
    path: "/users",
    label: "Users",
    description:
      "System users",
    icon: Users,
    permission:
      "users.read",
  },

  {
    id: "profile",
    path: "/profile",
    label: "My profile",
    description:
      "Account information",
    icon: CircleUserRound,
  },
];