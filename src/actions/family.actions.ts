"use server";

import { revalidatePath } from "next/cache";
import { requireAuth, requireFamilyAuth } from "@/lib/auth-guard";
import { checkPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity-logger";
import { handleActionError } from "@/lib/errors";
import { slugify } from "@/lib/utils";
import { sendEmail, buildInvitationEmail } from "@/lib/email";
import {
  createFamilySchema,
  updateFamilySchema,
  inviteMemberSchema,
} from "@/schemas/family.schema";
import type { ActionResult } from "@/types/api";
import type { Family, FamilyMembership, FamilyRole } from "@prisma/client";

const INVITATION_EXPIRY_DAYS = 7;

export async function createFamily(
  input: unknown,
): Promise<ActionResult<Family>> {
  try {
    const session = await requireAuth();
    const parsed = createFamilySchema.parse(input);

    const existingMembership = await prisma.familyMembership.findFirst({
      where: { userId: session.user.id, status: "ACTIVE" },
    });

    if (existingMembership) {
      return {
        success: false,
        error: "You already belong to a family. Leave your current family first.",
      };
    }

    const baseSlug = slugify(parsed.name);
    let slug = baseSlug;
    let counter = 0;
    let slugExists = true;

    while (slugExists) {
      const existing = await prisma.family.findUnique({ where: { slug } });
      if (!existing) {
        slugExists = false;
      } else {
        counter += 1;
        slug = `${baseSlug}-${counter}`;
      }
    }

    const family = await prisma.family.create({
      data: {
        name: parsed.name,
        slug,
        createdBy: session.user.id,
        memberships: {
          create: {
            userId: session.user.id,
            role: "OWNER",
            status: "ACTIVE",
          },
        },
      },
    });

    await logActivity({
      familyId: family.id,
      userId: session.user.id,
      entityType: "family",
      entityId: family.id,
      action: "created",
      metadata: { name: family.name },
    });

    revalidatePath("/");
    return { success: true, data: family };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateFamily(
  input: unknown,
): Promise<ActionResult<Family>> {
  try {
    const session = await requireFamilyAuth();
    checkPermission(session.user.familyRole, "family:update");

    const parsed = updateFamilySchema.parse(input);

    const family = await prisma.family.update({
      where: { id: session.user.familyId },
      data: { name: parsed.name },
    });

    await logActivity({
      familyId: session.user.familyId,
      userId: session.user.id,
      entityType: "family",
      entityId: family.id,
      action: "updated",
      metadata: { name: parsed.name },
    });

    revalidatePath("/");
    return { success: true, data: family };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function inviteMember(
  input: unknown,
): Promise<ActionResult<{ email: string }>> {
  try {
    const session = await requireFamilyAuth();
    checkPermission(session.user.familyRole, "member:invite");

    const parsed = inviteMemberSchema.parse(input);

    const existingMembership = await prisma.familyMembership.findFirst({
      where: {
        familyId: session.user.familyId,
        user: { email: parsed.email },
        status: "ACTIVE",
      },
    });

    if (existingMembership) {
      return {
        success: false,
        error: "This user is already a member of your family.",
      };
    }

    const existingInvitation = await prisma.familyInvitation.findFirst({
      where: {
        familyId: session.user.familyId,
        email: parsed.email,
        status: "PENDING",
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvitation) {
      return {
        success: false,
        error: "An active invitation already exists for this email.",
      };
    }

    // Generate a short, readable invite code (6 uppercase alphanumeric)
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);

    await prisma.familyInvitation.create({
      data: {
        familyId: session.user.familyId,
        email: parsed.email,
        role: parsed.role as FamilyRole,
        token: code,
        invitedBy: session.user.id,
        expiresAt,
      },
    });

    const { subject, html } = buildInvitationEmail(
      session.user.familyName,
      session.user.name ?? "A family member",
      code,
    );
    await sendEmail({ to: parsed.email, subject, html });

    await logActivity({
      familyId: session.user.familyId,
      userId: session.user.id,
      entityType: "invitation",
      entityId: parsed.email,
      action: "sent",
      metadata: { email: parsed.email, role: parsed.role },
    });

    revalidatePath("/");
    return { success: true, data: { email: parsed.email } };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function acceptInvitation(
  token: string,
  userId: string,
): Promise<ActionResult<FamilyMembership>> {
  try {
    // Accept both uppercase and lowercase input
    const invitation = await prisma.familyInvitation.findUnique({
      where: { token: token.trim().toUpperCase() },
    });

    if (!invitation) {
      return { success: false, error: "Invitation not found." };
    }

    if (invitation.status !== "PENDING") {
      return {
        success: false,
        error: `This invitation has already been ${invitation.status.toLowerCase()}.`,
      };
    }

    if (invitation.expiresAt < new Date()) {
      await prisma.familyInvitation.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" },
      });
      return { success: false, error: "This invitation has expired." };
    }

    const existingMembership = await prisma.familyMembership.findFirst({
      where: {
        familyId: invitation.familyId,
        userId,
        status: "ACTIVE",
      },
    });

    if (existingMembership) {
      return {
        success: false,
        error: "You are already a member of this family.",
      };
    }

    const [membership] = await prisma.$transaction([
      prisma.familyMembership.create({
        data: {
          familyId: invitation.familyId,
          userId,
          role: invitation.role,
          status: "ACTIVE",
        },
      }),
      prisma.familyInvitation.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED" },
      }),
    ]);

    await logActivity({
      familyId: invitation.familyId,
      userId,
      entityType: "membership",
      entityId: membership.id,
      action: "joined",
      metadata: { role: invitation.role, viaInvitation: invitation.id },
    });

    revalidatePath("/");
    return { success: true, data: membership };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function removeMember(
  membershipId: string,
): Promise<ActionResult<{ removed: true }>> {
  try {
    const session = await requireFamilyAuth();
    checkPermission(session.user.familyRole, "member:remove");

    const membership = await prisma.familyMembership.findFirst({
      where: {
        id: membershipId,
        familyId: session.user.familyId,
      },
    });

    if (!membership) {
      return { success: false, error: "Membership not found." };
    }

    if (membership.role === "OWNER") {
      const ownerCount = await prisma.familyMembership.count({
        where: {
          familyId: session.user.familyId,
          role: "OWNER",
          status: "ACTIVE",
        },
      });

      if (ownerCount <= 1) {
        return {
          success: false,
          error: "Cannot remove the last owner. Transfer ownership first.",
        };
      }
    }

    await prisma.familyMembership.delete({
      where: { id: membershipId },
    });

    await logActivity({
      familyId: session.user.familyId,
      userId: session.user.id,
      entityType: "membership",
      entityId: membershipId,
      action: "removed",
      metadata: { removedUserId: membership.userId },
    });

    revalidatePath("/");
    return { success: true, data: { removed: true } };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateMemberRole(
  membershipId: string,
  role: FamilyRole,
): Promise<ActionResult<FamilyMembership>> {
  try {
    const session = await requireFamilyAuth();
    checkPermission(session.user.familyRole, "member:changeRole");

    const membership = await prisma.familyMembership.findFirst({
      where: {
        id: membershipId,
        familyId: session.user.familyId,
      },
    });

    if (!membership) {
      return { success: false, error: "Membership not found." };
    }

    if (membership.userId === session.user.id) {
      return {
        success: false,
        error: "You cannot change your own role.",
      };
    }

    const updated = await prisma.familyMembership.update({
      where: { id: membershipId },
      data: { role },
    });

    await logActivity({
      familyId: session.user.familyId,
      userId: session.user.id,
      entityType: "membership",
      entityId: membershipId,
      action: "role_changed",
      metadata: {
        targetUserId: membership.userId,
        oldRole: membership.role,
        newRole: role,
      },
    });

    revalidatePath("/");
    return { success: true, data: updated };
  } catch (error) {
    return handleActionError(error);
  }
}
