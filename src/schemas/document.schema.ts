import { z } from "zod";
import { VisibilityLevel } from "@prisma/client";

export const uploadDocumentSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  mimeType: z.string().min(1, "MIME type is required"),
  sizeBytes: z.coerce.number().int().positive("File size must be positive"),
  propertyId: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      type: z.string(),
    }),
  ).default([]),
  visibilityLevel: z.nativeEnum(VisibilityLevel).default(VisibilityLevel.FAMILY),
  expiryDate: z.coerce.date().optional(),
});

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;

export const updateDocumentSchema = z.object({
  id: z.string().min(1, "Document ID is required"),
  fileName: z.string().min(1, "File name is required").optional(),
  notes: z.string().optional(),
  tags: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      type: z.string(),
    }),
  ).optional(),
  visibilityLevel: z.nativeEnum(VisibilityLevel).optional(),
});

export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
