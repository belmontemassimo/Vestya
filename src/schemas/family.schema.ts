import { z } from "zod";
import { FamilyRole } from "@prisma/client";

const INVITABLE_ROLES = [
  FamilyRole.ADMIN,
  FamilyRole.MEMBER,
  FamilyRole.VIEWER,
] as const;

export const createFamilySchema = z.object({
  name: z
    .string()
    .min(2, "Family name must be at least 2 characters")
    .max(100, "Family name must be at most 100 characters"),
});

export const updateFamilySchema = z.object({
  name: z
    .string()
    .min(2, "Family name must be at least 2 characters")
    .max(100, "Family name must be at most 100 characters"),
});

export const inviteMemberSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(
    INVITABLE_ROLES.map((r) => r as string) as [string, ...string[]],
    { message: "Role must be ADMIN, MEMBER, or VIEWER" },
  ) as z.ZodType<(typeof INVITABLE_ROLES)[number]>,
});

export type CreateFamilyInput = z.infer<typeof createFamilySchema>;
export type UpdateFamilyInput = z.infer<typeof updateFamilySchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
