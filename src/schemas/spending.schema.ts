import { z } from "zod";
import { RecordType } from "@prisma/client";

export const createSpendingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  recordType: z.nativeEnum(RecordType),
  date: z.coerce.date(),
  propertyId: z.string().optional(),
  tags: z
    .array(z.object({ id: z.string(), label: z.string(), type: z.string() }))
    .default([]),
  notes: z.string().optional(),
});

export type CreateSpendingInput = z.infer<typeof createSpendingSchema>;

export const updateSpendingSchema = createSpendingSchema.extend({
  id: z.string().min(1, "Record ID is required"),
});

export type UpdateSpendingInput = z.infer<typeof updateSpendingSchema>;
