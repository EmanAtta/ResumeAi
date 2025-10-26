import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllChats,
  getChatById,
  createChat,
  sendMessage,
  CreateChatPayload,
  SendMessagePayload,
  ChatResponse,
  MessagesResponse
} from "./_services";

// Hook to fetch all chats
export const useChats = () => {
  return useQuery<ChatResponse, Error>({
    queryKey: ['chats'],
    queryFn: getAllChats,
    staleTime: 1000 * 60, // 1 minute
  });
};

// Hook to fetch messages for a specific chat
export const useChatMessages = (chatId: string) => {
  return useQuery<MessagesResponse, Error>({
    queryKey: ['chat', chatId],
    queryFn: () => getChatById(chatId),
    enabled: !!chatId, // Only run if chatId exists
    staleTime: 1000 * 30, // 30 seconds
  });
};

// Hook to create a new chat
export const useCreateChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateChatPayload) => createChat(payload),
    onSuccess: () => {
      // Invalidate and refetch chats
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
};

// Hook to send a message
export const useSendMessage = (chatId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendMessagePayload) => sendMessage(chatId, { ...payload, conversationId: chatId }),
    onSuccess: () => {
      // Invalidate and refetch messages for this chat and the chat list
      queryClient.invalidateQueries({ queryKey: ['chat', chatId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
};
