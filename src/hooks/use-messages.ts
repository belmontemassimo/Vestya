"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMessages, sendMessage } from "@/actions/message.actions";

export function useMessages() {
  const queryClient = useQueryClient();

  const messagesQuery = useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      const result = await getMessages();
      return result.success ? result.data : [];
    },
    refetchInterval: 5000,
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const result = await sendMessage({ content });
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });

  return {
    messages: messagesQuery.data ?? [],
    isLoading: messagesQuery.isLoading,
    sendMessage: sendMutation.mutate,
    isSending: sendMutation.isPending,
  };
}
