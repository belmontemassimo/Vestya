import { z } from "zod";
import { ContactCategory } from "@prisma/client";

export const createContactSchema = z.object({
  name: z.string().min(1, "Contact name is required"),
  company: z.string().optional(),
  category: z.nativeEnum(ContactCategory),
  phones: z.array(z.string()).default([]),
  emails: z.array(z.string().email("Invalid email address")).default([]),
  whatsapp: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export const updateContactSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Contact name is required"),
  company: z.string().optional(),
  category: z.nativeEnum(ContactCategory),
  phones: z.array(z.string()).default([]),
  emails: z.array(z.string().email("Invalid email address")).default([]),
  whatsapp: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
