import { describe, it, expect } from "vitest";
import {
  createSpendingSchema,
  updateSpendingSchema,
} from "@/schemas/spending.schema";

describe("spending schemas", () => {
  describe("createSpendingSchema", () => {
    it("accepts valid data with required fields", () => {
      const result = createSpendingSchema.safeParse({
        name: "Monthly electricity bill",
        amount: 120,
        recordType: "EXPENSE",
        date: "2026-01-15",
      });
      expect(result.success).toBe(true);
    });

    it("accepts valid data with all optional fields", () => {
      const result = createSpendingSchema.safeParse({
        name: "Emergency pipe repair",
        amount: 250,
        recordType: "EXPENSE",
        date: "2026-02-20",
        propertyId: "clx123abc",
        tags: [{ id: "t1", label: "Maintenance", type: "custom" }],
        notes: "Called plumber for burst pipe",
      });
      expect(result.success).toBe(true);
    });

    it("rejects missing name", () => {
      const result = createSpendingSchema.safeParse({
        amount: 100,
        recordType: "EXPENSE",
        date: "2026-01-15",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty name", () => {
      const result = createSpendingSchema.safeParse({
        name: "",
        amount: 100,
        recordType: "EXPENSE",
        date: "2026-01-15",
      });
      expect(result.success).toBe(false);
    });

    it("rejects negative amount", () => {
      const result = createSpendingSchema.safeParse({
        name: "Test",
        amount: -500,
        recordType: "EXPENSE",
        date: "2026-01-15",
      });
      expect(result.success).toBe(false);
    });

    it("rejects zero amount", () => {
      const result = createSpendingSchema.safeParse({
        name: "Test",
        amount: 0,
        recordType: "EXPENSE",
        date: "2026-01-15",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid record type", () => {
      const result = createSpendingSchema.safeParse({
        name: "Test",
        amount: 100,
        recordType: "TRANSFER",
        date: "2026-01-15",
      });
      expect(result.success).toBe(false);
    });

    it("accepts EXPENSE and INCOME record types", () => {
      for (const recordType of ["EXPENSE", "INCOME"]) {
        const result = createSpendingSchema.safeParse({
          name: "Test",
          amount: 100,
          recordType,
          date: "2026-01-15",
        });
        expect(result.success).toBe(true);
      }
    });

    it("defaults tags to empty array when not provided", () => {
      const result = createSpendingSchema.safeParse({
        name: "Test",
        amount: 100,
        recordType: "EXPENSE",
        date: "2026-01-15",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tags).toEqual([]);
      }
    });

    it("accepts tags array with valid structure", () => {
      const result = createSpendingSchema.safeParse({
        name: "Test",
        amount: 100,
        recordType: "EXPENSE",
        date: "2026-01-15",
        tags: [
          { id: "p1", label: "Chalet", type: "property" },
          { id: "custom-tax", label: "Tax", type: "custom" },
        ],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tags).toHaveLength(2);
      }
    });

    it("coerces date string to Date", () => {
      const result = createSpendingSchema.safeParse({
        name: "Test",
        amount: 1200,
        recordType: "EXPENSE",
        date: "2026-01-15",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.date).toBeInstanceOf(Date);
      }
    });

    it("coerces string amount to number", () => {
      const result = createSpendingSchema.safeParse({
        name: "Test",
        amount: "1200",
        recordType: "EXPENSE",
        date: "2026-01-15",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.amount).toBe(1200);
      }
    });
  });

  describe("updateSpendingSchema", () => {
    it("accepts valid update data with id", () => {
      const result = updateSpendingSchema.safeParse({
        id: "clx123abc",
        name: "Updated bill",
        amount: 1500,
        recordType: "EXPENSE",
        date: "2026-01-15",
      });
      expect(result.success).toBe(true);
    });

    it("requires id field", () => {
      const result = updateSpendingSchema.safeParse({
        name: "Test",
        amount: 1500,
        recordType: "EXPENSE",
        date: "2026-01-15",
      });
      expect(result.success).toBe(false);
    });

    it("rejects negative amount on update", () => {
      const result = updateSpendingSchema.safeParse({
        id: "clx123abc",
        name: "Test",
        amount: -100,
        recordType: "EXPENSE",
        date: "2026-01-15",
      });
      expect(result.success).toBe(false);
    });
  });
});
