import { NestFactory } from "@nestjs/core";
import { DataSource } from "typeorm";

import { AppModule } from "../../../app.module";

import { seedRoles } from "./roles.seed";
import { seedPermissions } from "./permissions.seed";
import { seedUsers } from "./users.seed";
import { seedClients } from "./clients.seed";
import { seedDashboard } from "./dashboard.seed";
import { seedTickets } from "./tickets.seed";

async function bootstrap(): Promise<void> {
  console.log("");
  console.log("========================================");
  console.log(" Support Ticket Platform - Database Seed");
  console.log("========================================");
  console.log("");

  const app = await NestFactory.createApplicationContext(
    AppModule,
    {
      logger: ["error", "warn"],
    },
  );

  try {
    const dataSource = app.get(DataSource);

    if (!dataSource.isInitialized) {
      throw new Error("Database connection is not initialized.");
    }

    console.log("🌱 Starting database seed...");
    console.log("");

    await seedRoles(dataSource);

    await seedPermissions(dataSource);

    await seedUsers(dataSource);

    await seedClients(dataSource);

    await seedDashboard(dataSource);

    await seedTickets(dataSource);

    console.log("");
    console.log("✅ Database seeded successfully.");
    console.log("");

    console.log("Demo credentials:");
    console.log("");

    console.log("Administrator");
    console.log("  admin@support.local");
    console.log("  Admin123!");
    console.log("");

    console.log("Supervisor");
    console.log("  supervisor@support.local");
    console.log("  Supervisor123!");
    console.log("");

    console.log("Support Agent 1");
    console.log("  agent1@support.local");
    console.log("  Agent123!");
    console.log("");

    console.log("Support Agent 2");
    console.log("  agent2@support.local");
    console.log("  Agent123!");
    console.log("");
  } catch (error) {
    console.error("");
    console.error("❌ Database seed failed.");
    console.error(error);

    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

void bootstrap();