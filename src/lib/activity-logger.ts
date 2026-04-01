import { prisma } from "@/lib/prisma";

interface LogActivityParams {
  familyId: string;
  userId: string;
  entityType: string;
  entityId: string;
  action: string;
  metadata?: Record<string, unknown>;
}

export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        familyId: params.familyId,
        userId: params.userId,
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        metadata: (params.metadata ?? {}) as any,
      },
    });
  } catch (error) {
    console.error("[Activity Logger] Failed to log activity:", error);
  }
}
