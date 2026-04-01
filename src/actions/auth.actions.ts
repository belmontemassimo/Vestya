"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { handleActionError } from "@/lib/errors";
import { registerSchema } from "@/schemas/auth.schema";
import type { ActionResult } from "@/types/api";

const SALT_ROUNDS = 12;

export async function registerUser(
  input: unknown,
): Promise<ActionResult<{ id: string; email: string }>> {
  try {
    const parsed = registerSchema.parse(input);

    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.email },
    });

    if (existingUser) {
      return {
        success: false,
        error: "An account with this email already exists.",
        fieldErrors: { email: ["An account with this email already exists."] },
      };
    }

    const passwordHash = await bcrypt.hash(parsed.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name: parsed.name,
        email: parsed.email,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
      },
    });

    return { success: true, data: user };
  } catch (error) {
    return handleActionError(error);
  }
}
