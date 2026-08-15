import { DataSource } from "typeorm";
import * as bcrypt from "bcryptjs";

import { UserEntity } from "../../../modules/users/entities/user.entity";

import { ROLE_IDS } from "./roles.seed";

export const USER_IDS = {
  ADMIN: "30000000-0000-4000-8000-000000000001",
  SUPERVISOR: "30000000-0000-4000-8000-000000000002",
  AGENT_1: "30000000-0000-4000-8000-000000000003",
  AGENT_2: "30000000-0000-4000-8000-000000000004",
} as const;

export const DEMO_CREDENTIALS = {
  admin: {
    email: "admin@support.local",
    password: "Admin123!",
  },

  supervisor: {
    email: "supervisor@support.local",
    password: "Supervisor123!",
  },

  agent1: {
    email: "agent1@support.local",
    password: "Agent123!",
  },

  agent2: {
    email: "agent2@support.local",
    password: "Agent123!",
  },
} as const;

export async function seedUsers(
  dataSource: DataSource,
): Promise<void> {
  const repository = dataSource.getRepository(UserEntity);

  const [
    adminPassword,
    supervisorPassword,
    agent1Password,
    agent2Password,
  ] = await Promise.all([
    bcrypt.hash(DEMO_CREDENTIALS.admin.password, 10),
    bcrypt.hash(DEMO_CREDENTIALS.supervisor.password, 10),
    bcrypt.hash(DEMO_CREDENTIALS.agent1.password, 10),
    bcrypt.hash(DEMO_CREDENTIALS.agent2.password, 10),
  ]);

  const users = [
    {
      id: USER_IDS.ADMIN,
      roleId: ROLE_IDS.ADMIN,
      name: "Juan Admin",
      email: DEMO_CREDENTIALS.admin.email,
      passwordHash: adminPassword,
      isActive: true,
    },
    {
      id: USER_IDS.SUPERVISOR,
      roleId: ROLE_IDS.SUPERVISOR,
      name: "Laura Supervisor",
      email: DEMO_CREDENTIALS.supervisor.email,
      passwordHash: supervisorPassword,
      isActive: true,
    },
    {
      id: USER_IDS.AGENT_1,
      roleId: ROLE_IDS.SUPPORT_AGENT,
      name: "Carlos Agent",
      email: DEMO_CREDENTIALS.agent1.email,
      passwordHash: agent1Password,
      isActive: true,
    },
    {
      id: USER_IDS.AGENT_2,
      roleId: ROLE_IDS.SUPPORT_AGENT,
      name: "Andrea Agent",
      email: DEMO_CREDENTIALS.agent2.email,
      passwordHash: agent2Password,
      isActive: true,
    },
  ];

  await repository.upsert(users, ["id"]);

  console.log("  ✓ Demo users seeded");
}