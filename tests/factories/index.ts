import { PrismaClient, type FamilyRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const DEFAULT_PASSWORD = "TestPassword1!";

interface CreateUserOverrides {
  name?: string;
  email?: string;
  password?: string;
}

export async function createTestUser(
  prisma: PrismaClient,
  overrides: CreateUserOverrides = {},
): Promise<{ id: string; name: string; email: string }> {
  const passwordHash = await bcrypt.hash(
    overrides.password ?? DEFAULT_PASSWORD,
    4,
  );
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);

  const user = await prisma.user.create({
    data: {
      name: overrides.name ?? `Test User ${random}`,
      email: overrides.email ?? `test-${timestamp}-${random}@hestia.dev`,
      passwordHash,
    },
  });

  return { id: user.id, name: user.name ?? "", email: user.email };
}

export async function createTestFamily(
  prisma: PrismaClient,
  ownerId: string,
  name = "Test Family",
): Promise<{ id: string; name: string; slug: string }> {
  const random = Math.random().toString(36).slice(2, 8);

  const family = await prisma.family.create({
    data: {
      name,
      slug: `test-${random}`,
      createdBy: ownerId,
    },
  });

  await prisma.familyMembership.create({
    data: {
      familyId: family.id,
      userId: ownerId,
      role: "OWNER",
    },
  });

  return { id: family.id, name: family.name, slug: family.slug };
}

export async function createTestMembership(
  prisma: PrismaClient,
  userId: string,
  familyId: string,
  role: FamilyRole,
): Promise<{ id: string }> {
  const membership = await prisma.familyMembership.create({
    data: { familyId, userId, role },
  });
  return { id: membership.id };
}

interface CreatePropertyOverrides {
  name?: string;
  propertyType?: "HOUSE" | "APARTMENT" | "CONDO" | "VILLA" | "CABIN" | "LAND" | "COMMERCIAL" | "OTHER";
  city?: string;
  country?: string;
  notes?: string;
}

export async function createTestProperty(
  prisma: PrismaClient,
  familyId: string,
  overrides: CreatePropertyOverrides = {},
): Promise<{ id: string; name: string }> {
  const property = await prisma.property.create({
    data: {
      familyId,
      name: overrides.name ?? "Test Property",
      propertyType: overrides.propertyType ?? "HOUSE",
      city: overrides.city ?? "Paris",
      country: overrides.country ?? "France",
      notes: overrides.notes,
    },
  });
  return { id: property.id, name: property.name };
}

interface CreateTaskOverrides {
  title?: string;
  category?: "MAINTENANCE" | "REPAIR" | "INSPECTION" | "CLEANING" | "RENOVATION" | "ADMINISTRATIVE" | "FINANCIAL" | "INSURANCE" | "LEGAL" | "SEASONAL" | "EMERGENCY" | "OTHER";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status?: "TODO" | "IN_PROGRESS" | "WAITING" | "DONE" | "CANCELLED";
  propertyId?: string;
  description?: string;
}

export async function createTestTask(
  prisma: PrismaClient,
  familyId: string,
  createdBy: string,
  overrides: CreateTaskOverrides = {},
): Promise<{ id: string; title: string }> {
  const task = await prisma.task.create({
    data: {
      familyId,
      createdBy,
      title: overrides.title ?? "Test Task",
      category: overrides.category ?? "OTHER",
      priority: overrides.priority ?? "MEDIUM",
      status: overrides.status ?? "TODO",
      propertyId: overrides.propertyId,
      description: overrides.description,
    },
  });
  return { id: task.id, title: task.title };
}

interface CreateContactOverrides {
  name?: string;
  category?: string;
  company?: string;
  phones?: string[];
  emails?: string[];
}

export async function createTestContact(
  prisma: PrismaClient,
  familyId: string,
  overrides: CreateContactOverrides = {},
): Promise<{ id: string; name: string }> {
  const contact = await prisma.contact.create({
    data: {
      familyId,
      name: overrides.name ?? "Test Contact",
      category: (overrides.category as "OTHER") ?? "OTHER",
      company: overrides.company,
      phones: overrides.phones ?? [],
      emails: overrides.emails ?? [],
    },
  });
  return { id: contact.id, name: contact.name };
}

export interface FullScenario {
  owner: { id: string; name: string; email: string };
  admin: { id: string; name: string; email: string };
  member: { id: string; name: string; email: string };
  viewer: { id: string; name: string; email: string };
  outsider: { id: string; name: string; email: string };
  family: { id: string; name: string; slug: string };
  otherFamily: { id: string; name: string; slug: string };
  property: { id: string; name: string };
}

export async function createFullScenario(
  prisma: PrismaClient,
): Promise<FullScenario> {
  const owner = await createTestUser(prisma, {
    name: "Owner User",
    email: "owner@test.dev",
  });
  const admin = await createTestUser(prisma, {
    name: "Admin User",
    email: "admin@test.dev",
  });
  const member = await createTestUser(prisma, {
    name: "Member User",
    email: "member@test.dev",
  });
  const viewer = await createTestUser(prisma, {
    name: "Viewer User",
    email: "viewer@test.dev",
  });
  const outsider = await createTestUser(prisma, {
    name: "Outsider User",
    email: "outsider@test.dev",
  });

  const family = await createTestFamily(prisma, owner.id, "Main Family");

  await createTestMembership(prisma, admin.id, family.id, "ADMIN");
  await createTestMembership(prisma, member.id, family.id, "MEMBER");
  await createTestMembership(prisma, viewer.id, family.id, "VIEWER");

  const otherFamily = await createTestFamily(
    prisma,
    outsider.id,
    "Other Family",
  );

  const property = await createTestProperty(prisma, family.id, {
    name: "Main Property",
  });

  return {
    owner,
    admin,
    member,
    viewer,
    outsider,
    family,
    otherFamily,
    property,
  };
}
