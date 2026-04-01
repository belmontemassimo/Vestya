import { z } from "zod";
import { TaskCategory, TaskPriority, TaskStatus } from "@prisma/client";

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Task title is required")
    .max(255, "Task title must be at most 255 characters"),
  description: z.string().optional(),
  propertyId: z.string().optional(),
  category: z.nativeEnum(TaskCategory),
  priority: z.nativeEnum(TaskPriority),
  assignedTo: z.string().optional(),
  assignedContact: z.string().optional(),
  dueAt: z.coerce.date().optional(),
  estimatedCost: z.coerce.number().min(0).optional(),
  actualCost: z.coerce.number().min(0).optional(),
});

export const updateTaskSchema = z.object({
  id: z.string(),
  title: z
    .string()
    .min(1, "Task title is required")
    .max(255, "Task title must be at most 255 characters"),
  description: z.string().optional(),
  propertyId: z.string().optional(),
  category: z.nativeEnum(TaskCategory),
  priority: z.nativeEnum(TaskPriority),
  status: z.nativeEnum(TaskStatus),
  assignedTo: z.string().optional(),
  assignedContact: z.string().optional(),
  dueAt: z.coerce.date().optional(),
  estimatedCost: z.coerce.number().min(0).optional(),
  actualCost: z.coerce.number().min(0).optional(),
  completedAt: z.coerce.date().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
