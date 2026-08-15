import { DataSource } from "typeorm";

import { RoleEntity } from "../../../modules/roles/entities/role.entity";

export const ROLE_IDS = {
  ADMIN: "10000000-0000-4000-8000-000000000001",
  SUPERVISOR: "10000000-0000-4000-8000-000000000002",
  SUPPORT_AGENT: "10000000-0000-4000-8000-000000000003",
} as const;

export async function seedRoles(dataSource: DataSource): Promise<void> {
  const repository = dataSource.getRepository(RoleEntity);

  const roles = [
    {
      id: ROLE_IDS.ADMIN,
      code: "ADMIN",
      name: "Administrator",
      description: "Full operational and administrative access.",
    },
    {
      id: ROLE_IDS.SUPERVISOR,
      code: "SUPERVISOR",
      name: "Supervisor",
      description:
        "Operational leader with access to metrics, reassignment and internal comments.",
    },
    {
      id: ROLE_IDS.SUPPORT_AGENT,
      code: "SUPPORT_AGENT",
      name: "Support Agent",
      description:
        "Support operator responsible for managing assigned tickets.",
    },
  ];

  await repository.upsert(roles, ["id"]);

  console.log("  ✓ Roles seeded");
}