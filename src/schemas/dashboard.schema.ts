import { z } from "zod";

const widgetInstanceSchema = z.object({
  id: z.string(),
  type: z.string(),
  config: z.record(z.string(), z.unknown()).default({}),
});

const gridLayoutItemSchema = z.object({
  i: z.string(),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  minW: z.number().optional(),
  minH: z.number().optional(),
});

export const saveDashboardSchema = z.object({
  widgets: z.array(widgetInstanceSchema),
  gridLayout: z.array(gridLayoutItemSchema),
});

export const savePropertyDashboardSchema = saveDashboardSchema.extend({
  propertyId: z.string(),
});

export type SaveDashboardInput = z.infer<typeof saveDashboardSchema>;
export type SavePropertyDashboardInput = z.infer<typeof savePropertyDashboardSchema>;
