"use server";

import { revalidatePath } from "next/cache";
import { requireFamilyAuth } from "@/lib/auth-guard";
import { handleActionError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import {
  saveDashboardSchema,
  savePropertyDashboardSchema,
} from "@/schemas/dashboard.schema";
import type { SaveDashboardInput, SavePropertyDashboardInput } from "@/schemas/dashboard.schema";
import {
  createDefaultFamilyLayout,
  createDefaultPropertyLayout,
} from "@/config/default-layouts";
import type { ActionResult } from "@/types/api";
import type { DashboardLayoutData } from "@/types/dashboard";

export async function getFamilyDashboard(): Promise<
  ActionResult<DashboardLayoutData>
> {
  try {
    const session = await requireFamilyAuth();

    const layout = await prisma.dashboardLayout.findUnique({
      where: {
        familyId_userId: {
          familyId: session.user.familyId,
          userId: session.user.id,
        },
      },
    });

    if (!layout) {
      return { success: true, data: createDefaultFamilyLayout() };
    }

    return {
      success: true,
      data: {
        widgets: layout.widgets as unknown as DashboardLayoutData["widgets"],
        gridLayout: layout.gridLayout as unknown as DashboardLayoutData["gridLayout"],
      },
    };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function saveFamilyDashboard(
  input: SaveDashboardInput,
): Promise<ActionResult<DashboardLayoutData>> {
  try {
    const session = await requireFamilyAuth();
    const validated = saveDashboardSchema.parse(input);

    const layout = await prisma.dashboardLayout.upsert({
      where: {
        familyId_userId: {
          familyId: session.user.familyId,
          userId: session.user.id,
        },
      },
      create: {
        familyId: session.user.familyId,
        userId: session.user.id,
        widgets: validated.widgets as unknown as Prisma.InputJsonValue,
        gridLayout: validated.gridLayout as unknown as Prisma.InputJsonValue,
      },
      update: {
        widgets: validated.widgets as unknown as Prisma.InputJsonValue,
        gridLayout: validated.gridLayout as unknown as Prisma.InputJsonValue,
      },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      data: {
        widgets: layout.widgets as unknown as DashboardLayoutData["widgets"],
        gridLayout: layout.gridLayout as unknown as DashboardLayoutData["gridLayout"],
      },
    };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getPropertyDashboard(
  propertyId: string,
): Promise<ActionResult<DashboardLayoutData>> {
  try {
    const session = await requireFamilyAuth();

    const layout = await prisma.dashboardLayout.findUnique({
      where: {
        familyId_propertyId: {
          familyId: session.user.familyId,
          propertyId,
        },
      },
    });

    if (!layout) {
      return { success: true, data: createDefaultPropertyLayout() };
    }

    return {
      success: true,
      data: {
        widgets: layout.widgets as unknown as DashboardLayoutData["widgets"],
        gridLayout: layout.gridLayout as unknown as DashboardLayoutData["gridLayout"],
      },
    };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function savePropertyDashboard(
  input: SavePropertyDashboardInput,
): Promise<ActionResult<DashboardLayoutData>> {
  try {
    const session = await requireFamilyAuth();
    const validated = savePropertyDashboardSchema.parse(input);

    const layout = await prisma.dashboardLayout.upsert({
      where: {
        familyId_propertyId: {
          familyId: session.user.familyId,
          propertyId: validated.propertyId,
        },
      },
      create: {
        familyId: session.user.familyId,
        propertyId: validated.propertyId,
        widgets: validated.widgets as unknown as Prisma.InputJsonValue,
        gridLayout: validated.gridLayout as unknown as Prisma.InputJsonValue,
      },
      update: {
        widgets: validated.widgets as unknown as Prisma.InputJsonValue,
        gridLayout: validated.gridLayout as unknown as Prisma.InputJsonValue,
      },
    });

    revalidatePath(`/properties/${validated.propertyId}`);

    return {
      success: true,
      data: {
        widgets: layout.widgets as unknown as DashboardLayoutData["widgets"],
        gridLayout: layout.gridLayout as unknown as DashboardLayoutData["gridLayout"],
      },
    };
  } catch (error) {
    return handleActionError(error);
  }
}
