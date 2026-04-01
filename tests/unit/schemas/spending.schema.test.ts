import { describe, it, expect } from "vitest";
import {
  createSpendingSchema,
  updateSpendingSchema,
} from "@/schemas/spending.schema";

describe("spending schemas", () => {
  describe("createSpendingSchema", () => {
    it("accepts valid data with required fields", () => {
      const result = createSpendingSchema.safeParse({
        category: "INSURANCE",
        amount: 1200,
        recordType: "EXPENSE",
        date: "2026-01-15",
      });
      expect(result.success).toBe(true);
    });

    it("accepts valid data with all optional fields", () => {
      const result = createSpendingSchema.safeParse({
        propertyId: "clx123abc",
        category: "MAINTENANCE",
        amount: 250,
        currency: "USD",
        recordType: "EXPENSE",
        paymentStatus: "PAID",
        paidToContact: "clxcontact123",
        date: "2026-02-20",
        paymentMethod: "Bank Transfer",
        notes: "Emergency pipe repair",
      });
      expect(result.success).toBe(true);
    });

    it("rejects negative amount", () => {
      const result = createSpendingSchema.safeParse({
        category: "INSURANCE",
        amount: -500,
        recordType: "EXPENSE",
        date: "2026-01-15",
      });
      expect(result.success).toBe(false);
    });

    it("rejects zero amount", () => {
      const result = createSpendingSchema.safeParse({
        category: "INSURANCE",
        amount: 0,
        recordType: "EXPENSE",
        date: "2026-01-15",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid category", () => {
      const result = createSpendingSchema.safeParse({
        category: "GROCERY",
        amount: 100,
        recordType: "EXPENSE",
        date: "2026-01-15",
      });
      expect(result.success).toBe(false);
    });

    it("accepts all valid financial categories", () => {
      const validCategories = [
        "MORTGAGE",
        "INSURANCE",
        "TAX",
        "UTILITY",
        "MAINTENANCE",
        "REPAIR",
        "RENOVATION",
        "RENT_INCOME",
        "MANAGEMENT_FEE",
        "HOA_FEE",
        "FURNISHING",
        "LEGAL",
        "SALARY",
        "OTHER",
      ];
      for (const category of validCategories) {
        const result = createSpendingSchema.safeParse({
          category,
          amount: 100,
          recordType: "EXPENSE",
          date: "2026-01-15",
        });
        expect(result.success).toBe(true);
      }
    });

    it("rejects invalid record type", () => {
      const result = createSpendingSchema.safeParse({
        category: "INSURANCE",
        amount: 100,
        recordType: "TRANSFER",
        date: "2026-01-15",
      });
      expect(result.success).toBe(false);
    });

    it("accepts EXPENSE and INCOME record types", () => {
      for (const recordType of ["EXPENSE", "INCOME"]) {
        const result = createSpendingSchema.safeParse({
          category: "OTHER",
          amount: 100,
          recordType,
          date: "2026-01-15",
        });
        expect(result.success).toBe(true);
      }
    });

    it("rejects invalid payment status", () => {
      const result = createSpendingSchema.safeParse({
        category: "INSURANCE",
        amount: 100,
        recordType: "EXPENSE",
        paymentStatus: "PROCESSING",
        date: "2026-01-15",
      });
      expect(result.success).toBe(false);
    });

    it("accepts all valid payment statuses", () => {
      const validStatuses = [
        "PENDING",
        "PAID",
        "OVERDUE",
        "CANCELLED",
        "REFUNDED",
      ];
      for (const paymentStatus of validStatuses) {
        const result = createSpendingSchema.safeParse({
          category: "OTHER",
          amount: 100,
          recordType: "EXPENSE",
          paymentStatus,
          date: "2026-01-15",
        });
        expect(result.success).toBe(true);
      }
    });

    it("defaults currency to EUR when not provided", () => {
      const result = createSpendingSchema.safeParse({
        category: "INSURANCE",
        amount: 1200,
        recordType: "EXPENSE",
        date: "2026-01-15",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currency).toBe("EUR");
      }
    });

    it("defaults payment status to PENDING when not provided", () => {
      const result = createSpendingSchema.safeParse({
        category: "INSURANCE",
        amount: 1200,
        recordType: "EXPENSE",
        date: "2026-01-15",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.paymentStatus).toBe("PENDING");
      }
    });

    it("coerces date string to Date", () => {
      const result = createSpendingSchema.safeParse({
        category: "INSURANCE",
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
        category: "INSURANCE",
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
        category: "INSURANCE",
        amount: 1500,
        recordType: "EXPENSE",
        date: "2026-01-15",
      });
      expect(result.success).toBe(true);
    });

    it("requires id field", () => {
      const result = updateSpendingSchema.safeParse({
        category: "INSURANCE",
        amount: 1500,
        recordType: "EXPENSE",
        date: "2026-01-15",
      });
      expect(result.success).toBe(false);
    });

    it("rejects negative amount on update", () => {
      const result = updateSpendingSchema.safeParse({
        id: "clx123abc",
        category: "INSURANCE",
        amount: -100,
        recordType: "EXPENSE",
        date: "2026-01-15",
      });
      expect(result.success).toBe(false);
    });
  });
});
