import { describe, it, expect } from "vitest";
import {
  createPropertySchema,
  updatePropertySchema,
} from "@/schemas/property.schema";

describe("property schemas", () => {
  describe("createPropertySchema", () => {
    it("accepts valid data with required fields only", () => {
      const result = createPropertySchema.safeParse({
        name: "Mountain Chalet",
        propertyType: "CABIN",
      });
      expect(result.success).toBe(true);
    });

    it("accepts valid data with all optional fields", () => {
      const result = createPropertySchema.safeParse({
        name: "Mountain Chalet",
        propertyType: "CABIN",
        addressLine1: "42 Route des Alpes",
        addressLine2: "Apt 3B",
        city: "Chamonix",
        region: "Haute-Savoie",
        postalCode: "74400",
        country: "France",
        timezone: "Europe/Paris",
        notes: "Great property with mountain views",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty name", () => {
      const result = createPropertySchema.safeParse({
        name: "",
        propertyType: "HOUSE",
      });
      expect(result.success).toBe(false);
    });

    it("rejects name longer than 255 characters", () => {
      const result = createPropertySchema.safeParse({
        name: "A".repeat(256),
        propertyType: "HOUSE",
      });
      expect(result.success).toBe(false);
    });

    it("accepts name exactly 255 characters", () => {
      const result = createPropertySchema.safeParse({
        name: "A".repeat(255),
        propertyType: "HOUSE",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid property type", () => {
      const result = createPropertySchema.safeParse({
        name: "Test Property",
        propertyType: "SPACESHIP",
      });
      expect(result.success).toBe(false);
    });

    it("accepts all valid property types", () => {
      const validTypes = [
        "HOUSE",
        "APARTMENT",
        "CONDO",
        "VILLA",
        "CABIN",
        "LAND",
        "COMMERCIAL",
        "OTHER",
      ];
      for (const propertyType of validTypes) {
        const result = createPropertySchema.safeParse({
          name: "Test",
          propertyType,
        });
        expect(result.success).toBe(true);
      }
    });

    it("rejects missing name", () => {
      const result = createPropertySchema.safeParse({
        propertyType: "HOUSE",
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing property type", () => {
      const result = createPropertySchema.safeParse({
        name: "Test Property",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("updatePropertySchema", () => {
    it("accepts valid update data with id", () => {
      const result = updatePropertySchema.safeParse({
        id: "clx123abc",
        name: "Updated Chalet",
        propertyType: "CABIN",
        status: "ACTIVE",
      });
      expect(result.success).toBe(true);
    });

    it("requires id field", () => {
      const result = updatePropertySchema.safeParse({
        name: "Updated Chalet",
        propertyType: "CABIN",
        status: "ACTIVE",
      });
      expect(result.success).toBe(false);
    });

    it("requires status field", () => {
      const result = updatePropertySchema.safeParse({
        id: "clx123abc",
        name: "Updated Chalet",
        propertyType: "CABIN",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid status", () => {
      const result = updatePropertySchema.safeParse({
        id: "clx123abc",
        name: "Updated Chalet",
        propertyType: "CABIN",
        status: "DEMOLISHED",
      });
      expect(result.success).toBe(false);
    });

    it("accepts all valid status values", () => {
      const validStatuses = [
        "ACTIVE",
        "INACTIVE",
        "FOR_SALE",
        "FOR_RENT",
        "UNDER_RENOVATION",
        "ARCHIVED",
      ];
      for (const status of validStatuses) {
        const result = updatePropertySchema.safeParse({
          id: "clx123abc",
          name: "Test",
          propertyType: "HOUSE",
          status,
        });
        expect(result.success).toBe(true);
      }
    });
  });
});
