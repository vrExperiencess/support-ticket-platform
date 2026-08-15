import { DataSource, In } from "typeorm";

import { PermissionEntity } from "../../../modules/permissions/entities/permission.entity";
import { RolePermissionEntity } from "../../../modules/roles/entities/role-permission.entity";

import { ROLE_IDS } from "./roles.seed";

export const PERMISSION_IDS = {
  TICKETS_READ: "20000000-0000-4000-8000-000000000001",
  TICKETS_READ_ALL: "20000000-0000-4000-8000-000000000002",

  TICKETS_CREATE: "20000000-0000-4000-8000-000000000003",

  TICKETS_UPDATE_ANY: "20000000-0000-4000-8000-000000000004",
  TICKETS_UPDATE_ASSIGNED: "20000000-0000-4000-8000-000000000005",

  TICKETS_ASSIGN: "20000000-0000-4000-8000-000000000006",
  TICKETS_REASSIGN: "20000000-0000-4000-8000-000000000007",

  TICKETS_COMMENT: "20000000-0000-4000-8000-000000000008",
  TICKETS_COMMENT_INTERNAL: "20000000-0000-4000-8000-000000000009",

  TICKETS_STATUS_CHANGE_ASSIGNED:
    "20000000-0000-4000-8000-00000000000a",

  TICKETS_CLOSE: "20000000-0000-4000-8000-00000000000b",
  TICKETS_REOPEN: "20000000-0000-4000-8000-00000000000c",

  USERS_READ: "20000000-0000-4000-8000-00000000000d",
  CLIENTS_READ: "20000000-0000-4000-8000-00000000000e",

  METRICS_READ: "20000000-0000-4000-8000-00000000000f",
  TICKETS_OVERDUE_READ: "20000000-0000-4000-8000-000000000010",

  TICKETS_STATUS_CHANGE_ANY:
  "20000000-0000-4000-8000-000000000011",

  TICKETS_DELETE:
  "20000000-0000-4000-8000-000000000012",
} as const;

export async function seedPermissions(
  dataSource: DataSource,
): Promise<void> {
  const permissionRepository =
    dataSource.getRepository(PermissionEntity);

  const rolePermissionRepository =
    dataSource.getRepository(RolePermissionEntity);

  const permissions = [
    {
      id: PERMISSION_IDS.TICKETS_READ,
      code: "tickets.read",
      description: "Can access ticket information.",
    },
    {
      id: PERMISSION_IDS.TICKETS_READ_ALL,
      code: "tickets.read.all",
      description: "Can access all tickets without agent scope restrictions.",
    },
    {
      id: PERMISSION_IDS.TICKETS_CREATE,
      code: "tickets.create",
      description: "Can create support tickets.",
    },
    {
      id: PERMISSION_IDS.TICKETS_UPDATE_ANY,
      code: "tickets.update.any",
      description: "Can update any ticket.",
    },
    {
      id: PERMISSION_IDS.TICKETS_UPDATE_ASSIGNED,
      code: "tickets.update.assigned",
      description: "Can update tickets assigned to the authenticated user.",
    },
    {
      id: PERMISSION_IDS.TICKETS_ASSIGN,
      code: "tickets.assign",
      description: "Can perform the initial assignment of a ticket.",
    },
    {
      id: PERMISSION_IDS.TICKETS_REASSIGN,
      code: "tickets.reassign",
      description: "Can reassign tickets between support agents.",
    },
    {
      id: PERMISSION_IDS.TICKETS_COMMENT,
      code: "tickets.comment",
      description: "Can add regular ticket comments.",
    },
    {
      id: PERMISSION_IDS.TICKETS_COMMENT_INTERNAL,
      code: "tickets.comment.internal",
      description: "Can add internal operational comments.",
    },
    {
      id: PERMISSION_IDS.TICKETS_STATUS_CHANGE_ASSIGNED,
      code: "tickets.status.change.assigned",
      description: "Can change status of tickets assigned to the user.",
    },
    {
      id: PERMISSION_IDS.TICKETS_CLOSE,
      code: "tickets.close",
      description: "Can close tickets.",
    },
    {
      id: PERMISSION_IDS.TICKETS_REOPEN,
      code: "tickets.reopen",
      description: "Can reopen closed tickets.",
    },
    {
      id: PERMISSION_IDS.USERS_READ,
      code: "users.read",
      description: "Can consult system users.",
    },
    {
      id: PERMISSION_IDS.CLIENTS_READ,
      code: "clients.read",
      description: "Can consult clients.",
    },
    {
      id: PERMISSION_IDS.METRICS_READ,
      code: "metrics.read",
      description: "Can access operational metrics.",
    },
    {
      id: PERMISSION_IDS.TICKETS_OVERDUE_READ,
      code: "tickets.overdue.read",
      description: "Can review overdue and stale tickets.",
    },
    {
        id:PERMISSION_IDS.TICKETS_STATUS_CHANGE_ANY,
        code:"tickets.status.change.any",
        description:"Can change the operational status of any ticket.",
    },
    {
        id:PERMISSION_IDS.TICKETS_DELETE,
        code:"tickets.delete",
        description:"Can soft-delete support tickets.",
    },
  ];

  await permissionRepository.upsert(permissions, ["id"]);

  // Reset only permissions belonging to the demo roles.
  await rolePermissionRepository.delete({
    roleId: In(Object.values(ROLE_IDS)),
  });

  const adminPermissions = [
    PERMISSION_IDS.TICKETS_READ,
    PERMISSION_IDS.TICKETS_READ_ALL,
    PERMISSION_IDS.TICKETS_CREATE,
    PERMISSION_IDS.TICKETS_UPDATE_ANY,
    PERMISSION_IDS.TICKETS_ASSIGN,
    PERMISSION_IDS.TICKETS_REASSIGN,
    PERMISSION_IDS.TICKETS_COMMENT,
    PERMISSION_IDS.TICKETS_COMMENT_INTERNAL,
    PERMISSION_IDS.TICKETS_CLOSE,
    PERMISSION_IDS.TICKETS_REOPEN,
    PERMISSION_IDS.USERS_READ,
    PERMISSION_IDS.CLIENTS_READ,
    PERMISSION_IDS.METRICS_READ,
    PERMISSION_IDS.TICKETS_OVERDUE_READ,
    PERMISSION_IDS.TICKETS_STATUS_CHANGE_ANY,
    PERMISSION_IDS.TICKETS_DELETE,
  ];

  const supervisorPermissions = [
    PERMISSION_IDS.TICKETS_READ,
    PERMISSION_IDS.TICKETS_READ_ALL,
    PERMISSION_IDS.TICKETS_ASSIGN,
    PERMISSION_IDS.TICKETS_REASSIGN,
    PERMISSION_IDS.TICKETS_COMMENT_INTERNAL,
    PERMISSION_IDS.METRICS_READ,
    PERMISSION_IDS.TICKETS_OVERDUE_READ,
  ];

  const agentPermissions = [
    PERMISSION_IDS.TICKETS_READ,
    PERMISSION_IDS.TICKETS_CREATE,
    PERMISSION_IDS.TICKETS_UPDATE_ASSIGNED,
    PERMISSION_IDS.TICKETS_COMMENT,
    PERMISSION_IDS.TICKETS_STATUS_CHANGE_ASSIGNED,
  ];

  const relations = [
    ...adminPermissions.map((permissionId) => ({
      roleId: ROLE_IDS.ADMIN,
      permissionId,
    })),

    ...supervisorPermissions.map((permissionId) => ({
      roleId: ROLE_IDS.SUPERVISOR,
      permissionId,
    })),

    ...agentPermissions.map((permissionId) => ({
      roleId: ROLE_IDS.SUPPORT_AGENT,
      permissionId,
    })),
  ];

  await rolePermissionRepository.save(relations);

  console.log("  ✓ Permissions and role permissions seeded");
}