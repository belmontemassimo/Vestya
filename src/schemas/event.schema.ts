import { z } from "zod";
import { VisibilityLevel } from "@prisma/client";

export const createEventSchema = z.object({
  title: z.string().min(1, "Event title is required"),
  description: z.string().optional(),
  location: z.string().optional(),
  startAt: z.coerce.date(),
  endAt: z.coerce.date().optional(),
  allDay: z.boolean().default(false),
  propertyId: z.string().optional(),
  linkedContactId: z.string().optional(),
  linkedTaskId: z.string().optional(),
  visibilityLevel: z.nativeEnum(VisibilityLevel).default(VisibilityLevel.FAMILY),
});

export const updateEventSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Event title is required"),
  description: z.string().optional(),
  location: z.string().optional(),
  startAt: z.coerce.date(),
  endAt: z.coerce.date().optional(),
  allDay: z.boolean().default(false),
  propertyId: z.string().optional(),
  linkedContactId: z.string().optional(),
  linkedTaskId: z.string().optional(),
  visibilityLevel: z.nativeEnum(VisibilityLevel).default(VisibilityLevel.FAMILY),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
