import { describe, it, expect } from "vitest";
import {
  createContactSchema,
  updateContactSchema,
} from "@/schemas/contact.schema";

describe("contact schemas", () => {
  describe("createContactSchema", () => {
    it("accepts valid data with required fields", () => {
      const result = createContactSchema.safeParse({
        name: "Jean-Pierre Martin",
        category: "PLUMBER",
      });
      expect(result.success).toBe(true);
    });

    it("accepts valid data with all optional fields", () => {
      const result = createContactSchema.safeParse({
        name: "Jean-Pierre Martin",
        company: "Plomberie Martin & Fils",
        category: "PLUMBER",
        phones: ["+33 6 12 34 56 78"],
        emails: ["jp.martin@plomberie.fr"],
        whatsapp: "+33612345678",
        address: "10 Rue de la Paix, Paris",
        notes: "Reliable, available weekends",
        tags: ["emergency", "trusted"],
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty name", () => {
      const result = createContactSchema.safeParse({
        name: "",
        category: "PLUMBER",
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing name", () => {
      const result = createContactSchema.safeParse({
        category: "PLUMBER",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid category", () => {
      const result = createContactSchema.safeParse({
        name: "Test Contact",
        category: "ASTRONAUT",
      });
      expect(result.success).toBe(false);
    });

    it("accepts all valid categories", () => {
      const validCategories = [
        "PLUMBER",
        "ELECTRICIAN",
        "GARDENER",
        "CLEANER",
        "HANDYMAN",
        "REAL_ESTATE_AGENT",
        "NOTARY",
        "LAWYER",
        "INSURANCE",
        "PROPERTY_MANAGER",
        "TENANT",
        "NEIGHBOR",
        "CONTRACTOR",
        "ARCHITECT",
        "LOCKSMITH",
        "PEST_CONTROL",
        "HVAC",
        "ROOFER",
        "PAINTER",
        "OTHER",
      ];
      for (const category of validCategories) {
        const result = createContactSchema.safeParse({
          name: "Test",
          category,
        });
        expect(result.success).toBe(true);
      }
    });

    it("handles phones array", () => {
      const result = createContactSchema.safeParse({
        name: "Test Contact",
        category: "OTHER",
        phones: ["+33 6 12 34 56 78", "+33 1 23 45 67 89"],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.phones).toHaveLength(2);
      }
    });

    it("handles emails array with validation", () => {
      const result = createContactSchema.safeParse({
        name: "Test Contact",
        category: "OTHER",
        emails: ["valid@email.com"],
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid email in emails array", () => {
      const result = createContactSchema.safeParse({
        name: "Test Contact",
        category: "OTHER",
        emails: ["not-an-email"],
      });
      expect(result.success).toBe(false);
    });

    it("defaults phones to empty array when not provided", () => {
      const result = createContactSchema.safeParse({
        name: "Test Contact",
        category: "OTHER",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.phones).toEqual([]);
      }
    });

    it("defaults emails to empty array when not provided", () => {
      const result = createContactSchema.safeParse({
        name: "Test Contact",
        category: "OTHER",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.emails).toEqual([]);
      }
    });

    it("defaults tags to empty array when not provided", () => {
      const result = createContactSchema.safeParse({
        name: "Test Contact",
        category: "OTHER",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tags).toEqual([]);
      }
    });
  });

  describe("updateContactSchema", () => {
    it("accepts valid update data with id", () => {
      const result = updateContactSchema.safeParse({
        id: "clx123abc",
        name: "Updated Name",
        category: "ELECTRICIAN",
      });
      expect(result.success).toBe(true);
    });

    it("requires id field", () => {
      const result = updateContactSchema.safeParse({
        name: "Updated Name",
        category: "ELECTRICIAN",
      });
      expect(result.success).toBe(false);
    });

    it("requires name field", () => {
      const result = updateContactSchema.safeParse({
        id: "clx123abc",
        category: "ELECTRICIAN",
      });
      expect(result.success).toBe(false);
    });
  });
});
