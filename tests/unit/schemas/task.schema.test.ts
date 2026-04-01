import { describe, it, expect } from "vitest";
import { createTaskSchema, updateTaskSchema } from "@/schemas/task.schema";

describe("task schemas", () => {
  describe("createTaskSchema", () => {
    it("accepts valid data with required fields", () => {
      const result = createTaskSchema.safeParse({
        title: "Fix leaking faucet",
        category: "REPAIR",
        priority: "HIGH",
      });
      expect(result.success).toBe(true);
    });

    it("accepts valid data with all optional fields", () => {
      const result = createTaskSchema.safeParse({
        title: "Annual pool opening",
        description: "Uncover, clean, check chemicals",
        propertyId: "clx123abc",
        category: "SEASONAL",
        priority: "MEDIUM",
        assignedTo: "clxuser123",
        assignedContact: "clxcontact123",
        dueAt: "2026-05-01",
        estimatedCost: 400,
        actualCost: 0,
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty title", () => {
      const result = createTaskSchema.safeParse({
        title: "",
        category: "REPAIR",
        priority: "HIGH",
      });
      expect(result.success).toBe(false);
    });

    it("rejects title longer than 255 characters", () => {
      const result = createTaskSchema.safeParse({
        title: "A".repeat(256),
        category: "REPAIR",
        priority: "HIGH",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid category", () => {
      const result = createTaskSchema.safeParse({
        title: "Test Task",
        category: "INVALID_CATEGORY",
        priority: "HIGH",
      });
      expect(result.success).toBe(false);
    });

    it("accepts all valid categories", () => {
      const validCategories = [
        "MAINTENANCE",
        "REPAIR",
        "INSPECTION",
        "CLEANING",
        "RENOVATION",
        "ADMINISTRATIVE",
        "FINANCIAL",
        "INSURANCE",
        "LEGAL",
        "SEASONAL",
        "EMERGENCY",
        "OTHER",
      ];
      for (const category of validCategories) {
        const result = createTaskSchema.safeParse({
          title: "Test",
          category,
          priority: "LOW",
        });
        expect(result.success).toBe(true);
      }
    });

    it("rejects invalid priority", () => {
      const result = createTaskSchema.safeParse({
        title: "Test Task",
        category: "REPAIR",
        priority: "CRITICAL",
      });
      expect(result.success).toBe(false);
    });

    it("accepts all valid priorities", () => {
      const validPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];
      for (const priority of validPriorities) {
        const result = createTaskSchema.safeParse({
          title: "Test",
          category: "OTHER",
          priority,
        });
        expect(result.success).toBe(true);
      }
    });

    it("rejects negative estimated cost", () => {
      const result = createTaskSchema.safeParse({
        title: "Test Task",
        category: "REPAIR",
        priority: "LOW",
        estimatedCost: -50,
      });
      expect(result.success).toBe(false);
    });

    it("coerces date string to Date for dueAt", () => {
      const result = createTaskSchema.safeParse({
        title: "Test Task",
        category: "REPAIR",
        priority: "LOW",
        dueAt: "2026-05-01",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.dueAt).toBeInstanceOf(Date);
      }
    });

    it("coerces string number to number for estimatedCost", () => {
      const result = createTaskSchema.safeParse({
        title: "Test Task",
        category: "REPAIR",
        priority: "LOW",
        estimatedCost: "150",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.estimatedCost).toBe(150);
      }
    });
  });

  describe("updateTaskSchema", () => {
    it("accepts valid update data", () => {
      const result = updateTaskSchema.safeParse({
        id: "clx123abc",
        title: "Updated title",
        category: "REPAIR",
        priority: "HIGH",
        status: "IN_PROGRESS",
      });
      expect(result.success).toBe(true);
    });

    it("requires id field", () => {
      const result = updateTaskSchema.safeParse({
        title: "Updated title",
        category: "REPAIR",
        priority: "HIGH",
        status: "IN_PROGRESS",
      });
      expect(result.success).toBe(false);
    });

    it("requires status field", () => {
      const result = updateTaskSchema.safeParse({
        id: "clx123abc",
        title: "Updated title",
        category: "REPAIR",
        priority: "HIGH",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid status", () => {
      const result = updateTaskSchema.safeParse({
        id: "clx123abc",
        title: "Test",
        category: "REPAIR",
        priority: "HIGH",
        status: "ARCHIVED",
      });
      expect(result.success).toBe(false);
    });

    it("accepts all valid statuses", () => {
      const validStatuses = [
        "TODO",
        "IN_PROGRESS",
        "WAITING",
        "DONE",
        "CANCELLED",
      ];
      for (const status of validStatuses) {
        const result = updateTaskSchema.safeParse({
          id: "clx123abc",
          title: "Test",
          category: "OTHER",
          priority: "LOW",
          status,
        });
        expect(result.success).toBe(true);
      }
    });

    it("accepts optional completedAt date", () => {
      const result = updateTaskSchema.safeParse({
        id: "clx123abc",
        title: "Test",
        category: "OTHER",
        priority: "LOW",
        status: "DONE",
        completedAt: "2026-04-01",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.completedAt).toBeInstanceOf(Date);
      }
    });
  });
});
