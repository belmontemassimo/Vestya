import { z } from "zod";

export const sendMessageSchema = z.object({
  content: z.string().min(1).max(5000),
});

export const getMessagesSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type GetMessagesInput = z.infer<typeof getMessagesSchema>;
