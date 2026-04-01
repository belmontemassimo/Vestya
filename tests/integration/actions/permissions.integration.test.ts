import { describe, it, expect, vi, beforeEach } from "vitest";
import { testPrisma } from "../../setup/integration.setup";
import { createFullScenario, type FullScenario } from "../../factories/index";

// We test permission logic at the unit level (permissions.test.ts).
// Here we test the server actions' integration with the auth guard.
// Since server actions call requireFamilyAuth() which depends on Next.js auth(),
// we mock the auth-guard module to simulate different roles.

let scenario: FullScenario;

// Mock next/cache (revalidatePath is called by actions)
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

// Mock the activity logger to avoid DB side-effect complexity
vi.mock("@/lib/activity-logger", () => ({
  logActivity: vi.fn().mockResolvedValue(undefined),
}));

// We need to dynamically set the session for each test, so we use a mutable ref
const sessionRef: { current: ReturnType<typeof createSession> | null } = {
  current: null,
};

function createSession(
  userId: string,
  familyId: string,
  familyRole: string,
  name = "Test User",
  email = "test@hestia.dev",
) {
  return {
    user: {
      id: userId,
      familyId,
      familyRole,
      familyName: "Test Family",
      name,
      email,
      image: null,
    },
  };
}

vi.mock("@/lib/auth-guard", () => ({
  requireAuth: vi.fn(() => {
    if (!sessionRef.current) throw new Error("No session configured");
    return Promise.resolve(sessionRef.current);
  }),
  requireFamilyAuth: vi.fn(() => {
    if (!sessionRef.current) throw new Error("No session configured");
    return Promise.resolve(sessionRef.current);
  }),
}));

// Mock prisma to use our test instance
vi.mock("@/lib/prisma", () => ({
  prisma: testPrisma,
}));

describe("Permission integration tests", () => {
  beforeEach(async () => {
    scenario = await createFullScenario(testPrisma);
  });

  describe("Property actions with role-based access", () => {
    it("OWNER can create a property", async () => {
      sessionRef.current = createSession(
        scenario.owner.id,
        scenario.family.id,
        "OWNER",
      );

      const { createProperty } = await import(
        "@/actions/property.actions"
      );
      const result = await createProperty({
        name: "New Property",
        propertyType: "VILLA",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("New Property");
      }
    });

    it("ADMIN can create a property", async () => {
      sessionRef.current = createSession(
        scenario.admin.id,
        scenario.family.id,
        "ADMIN",
      );

      const { createProperty } = await import(
        "@/actions/property.actions"
      );
      const result = await createProperty({
        name: "Admin Property",
        propertyType: "APARTMENT",
      });

      expect(result.success).toBe(true);
    });

    it("VIEWER cannot create a property", async () => {
      sessionRef.current = createSession(
        scenario.viewer.id,
        scenario.family.id,
        "VIEWER",
      );

      const { createProperty } = await import(
        "@/actions/property.actions"
      );
      const result = await createProperty({
        name: "Should Fail",
        propertyType: "HOUSE",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("permission");
      }
    });

    it("MEMBER cannot create a property", async () => {
      sessionRef.current = createSession(
        scenario.member.id,
        scenario.family.id,
        "MEMBER",
      );

      const { createProperty } = await import(
        "@/actions/property.actions"
      );
      const result = await createProperty({
        name: "Should Fail",
        propertyType: "HOUSE",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("permission");
      }
    });

    it("VIEWER cannot delete a property", async () => {
      sessionRef.current = createSession(
        scenario.viewer.id,
        scenario.family.id,
        "VIEWER",
      );

      const { deleteProperty } = await import(
        "@/actions/property.actions"
      );
      const result = await deleteProperty(scenario.property.id);

      expect(result.success).toBe(false);
    });

    it("VIEWER can read properties", async () => {
      sessionRef.current = createSession(
        scenario.viewer.id,
        scenario.family.id,
        "VIEWER",
      );

      const { getProperties } = await import(
        "@/actions/property.actions"
      );
      const result = await getProperties();

      expect(result.success).toBe(true);
    });
  });

  describe("Task actions with role-based access", () => {
    it("VIEWER cannot create a task", async () => {
      sessionRef.current = createSession(
        scenario.viewer.id,
        scenario.family.id,
        "VIEWER",
      );

      const { createTask } = await import("@/actions/task.actions");
      const result = await createTask({
        title: "Should Fail",
        category: "OTHER",
        priority: "LOW",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("permission");
      }
    });

    it("MEMBER can create a task", async () => {
      sessionRef.current = createSession(
        scenario.member.id,
        scenario.family.id,
        "MEMBER",
      );

      const { createTask } = await import("@/actions/task.actions");
      const result = await createTask({
        title: "Member Task",
        category: "MAINTENANCE",
        priority: "HIGH",
      });

      expect(result.success).toBe(true);
    });

    it("VIEWER cannot delete a task", async () => {
      // First create a task as owner
      sessionRef.current = createSession(
        scenario.owner.id,
        scenario.family.id,
        "OWNER",
      );

      const { createTask, deleteTask } = await import(
        "@/actions/task.actions"
      );
      const createResult = await createTask({
        title: "Task to Delete",
        category: "OTHER",
        priority: "LOW",
      });

      expect(createResult.success).toBe(true);

      // Switch to viewer and try to delete
      sessionRef.current = createSession(
        scenario.viewer.id,
        scenario.family.id,
        "VIEWER",
      );

      const taskId = createResult.success
        ? createResult.data.id
        : "nonexistent";
      const deleteResult = await deleteTask(taskId);

      expect(deleteResult.success).toBe(false);
    });

    it("MEMBER cannot delete a task", async () => {
      sessionRef.current = createSession(
        scenario.owner.id,
        scenario.family.id,
        "OWNER",
      );

      const { createTask, deleteTask } = await import(
        "@/actions/task.actions"
      );
      const createResult = await createTask({
        title: "Task to Attempt Delete",
        category: "OTHER",
        priority: "LOW",
      });

      expect(createResult.success).toBe(true);

      sessionRef.current = createSession(
        scenario.member.id,
        scenario.family.id,
        "MEMBER",
      );

      const taskId = createResult.success
        ? createResult.data.id
        : "nonexistent";
      const deleteResult = await deleteTask(taskId);

      expect(deleteResult.success).toBe(false);
    });
  });

  describe("Cross-family isolation", () => {
    it("user from Family A cannot read Family B properties", async () => {
      // Outsider belongs to otherFamily, not scenario.family
      sessionRef.current = createSession(
        scenario.outsider.id,
        scenario.otherFamily.id,
        "OWNER",
      );

      const { getProperties } = await import(
        "@/actions/property.actions"
      );
      const result = await getProperties();

      // Should succeed but return zero items from Family A
      expect(result.success).toBe(true);
      if (result.success) {
        const propertyNames = result.data.items.map(
          (p: { name: string }) => p.name,
        );
        expect(propertyNames).not.toContain("Main Property");
      }
    });

    it("user from Family A cannot delete Family B property", async () => {
      sessionRef.current = createSession(
        scenario.outsider.id,
        scenario.otherFamily.id,
        "OWNER",
      );

      const { deleteProperty } = await import(
        "@/actions/property.actions"
      );

      // Try to delete a property from scenario.family
      const result = await deleteProperty(scenario.property.id);

      // Should fail because the property doesn't belong to otherFamily
      expect(result.success).toBe(false);
    });
  });
});
