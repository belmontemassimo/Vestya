"use server";

import { revalidatePath } from "next/cache";
import { requireFamilyAuth } from "@/lib/auth-guard";
import { handleActionError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { sendMessageSchema, getMessagesSchema } from "@/schemas/message.schema";
import type { SendMessageInput, GetMessagesInput } from "@/schemas/message.schema";
import type { ActionResult } from "@/types/api";

interface MessageWithUser {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  familyId: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export async function sendMessage(
  input: SendMessageInput,
): Promise<ActionResult<MessageWithUser>> {
  try {
    const session = await requireFamilyAuth();
    const validated = sendMessageSchema.parse(input);

    const message = await prisma.message.create({
      data: {
        familyId: session.user.familyId,
        userId: session.user.id,
        content: validated.content,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    revalidatePath("/messages");
    revalidatePath("/dashboard");

    return { success: true, data: message };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getMessages(
  input?: GetMessagesInput,
): Promise<ActionResult<MessageWithUser[]>> {
  try {
    const session = await requireFamilyAuth();
    const validated = getMessagesSchema.parse(input ?? {});

    const messages = await prisma.message.findMany({
      where: {
        familyId: session.user.familyId,
        ...(validated.cursor ? { id: { lt: validated.cursor } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: validated.limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return { success: true, data: messages };
  } catch (error) {
    return handleActionError(error);
  }
}
