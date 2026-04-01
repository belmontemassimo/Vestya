import { z } from "zod";
import {
  FinancialCategory,
  RecordType,
  PaymentStatus,
} from "@prisma/client";

export const createSpendingSchema = z.object({
  propertyId: z.string().optional(),
  category: z.nativeEnum(FinancialCategory),
  amount: z.coerce.number().positive("Amount must be positive"),
  currency: z.string().min(1).max(3).default("EUR"),
  recordType: z.nativeEnum(RecordType),
  paymentStatus: z.nativeEnum(PaymentStatus).default(PaymentStatus.PENDING),
  paidToContact: z.string().optional(),
  date: z.coerce.date(),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
});

export const updateSpendingSchema = z.object({
  id: z.string(),
  propertyId: z.string().optional(),
  category: z.nativeEnum(FinancialCategory),
  amount: z.coerce.number().positive("Amount must be positive"),
  currency: z.string().min(1).max(3).default("EUR"),
  recordType: z.nativeEnum(RecordType),
  paymentStatus: z.nativeEnum(PaymentStatus).default(PaymentStatus.PENDING),
  paidToContact: z.string().optional(),
  date: z.coerce.date(),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateSpendingInput = z.infer<typeof createSpendingSchema>;
export type UpdateSpendingInput = z.infer<typeof updateSpendingSchema>;
