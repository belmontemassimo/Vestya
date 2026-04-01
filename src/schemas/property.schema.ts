import { z } from "zod";
import { PropertyType, PropertyStatus } from "@prisma/client";

export const createPropertySchema = z.object({
  name: z
    .string()
    .min(1, "Property name is required")
    .max(255, "Property name must be at most 255 characters"),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
  propertyType: z.nativeEnum(PropertyType),
  notes: z.string().optional(),
});

export const updatePropertySchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(1, "Property name is required")
    .max(255, "Property name must be at most 255 characters"),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
  propertyType: z.nativeEnum(PropertyType),
  status: z.nativeEnum(PropertyStatus),
  notes: z.string().optional(),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
