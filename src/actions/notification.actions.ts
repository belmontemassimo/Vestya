"use server";

import { revalidatePath } from "next/cache";
import { requireFamilyAuth } from "@/lib/auth-guard";
import { handleActionError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/types/api";
import type { Notification } from "@prisma/client";

export async function getNotifications(): Promise<
  ActionResult<Notification[]>
> {
  try {
    const session = await requireFamilyAuth();

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
        familyId: session.user.familyId,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return { success: true, data: notifications };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function markNotificationRead(
  id: string,
): Promise<ActionResult<Notification>> {
  try {
    const session = await requireFamilyAuth();

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: session.user.id,
        familyId: session.user.familyId,
      },
    });

    if (!notification) {
      return { success: false, error: "Notification not found." };
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    revalidatePath("/");
    return { success: true, data: updated };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function markAllNotificationsRead(): Promise<
  ActionResult<{ count: number }>
> {
  try {
    const session = await requireFamilyAuth();

    const result = await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        familyId: session.user.familyId,
        read: false,
      },
      data: { read: true },
    });

    revalidatePath("/");
    return { success: true, data: { count: result.count } };
  } catch (error) {
    return handleActionError(error);
  }
}
