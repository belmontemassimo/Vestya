import { beforeEach, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";

const DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  "postgresql://vestya_test:vestya_test_password@localhost:5433/vestya_test";

export const testPrisma = new PrismaClient({
  datasources: { db: { url: DATABASE_URL } },
});

const TABLES_TO_TRUNCATE = [
  "activity_logs",
  "notifications",
  "reminders",
  "occupancy_records",
  "financial_records",
  "document_links",
  "documents",
  "events",
  "task_comments",
  "tasks",
  "property_contacts",
  "contacts",
  "properties",
  "family_invitations",
  "family_memberships",
  "families",
  "authenticators",
  "sessions",
  "accounts",
  "verification_tokens",
  "users",
] as const;

async function truncateAll(): Promise<void> {
  for (const table of TABLES_TO_TRUNCATE) {
    await testPrisma.$executeRawUnsafe(
      `TRUNCATE TABLE "${table}" CASCADE`,
    );
  }
}

beforeEach(async () => {
  await truncateAll();
});

afterAll(async () => {
  await testPrisma.$disconnect();
});
