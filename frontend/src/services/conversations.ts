import { axiosClient } from "@/lib/api";
import {
  Conversation,
  CreateConversationOutput,
  GetConversationOutput,
  GetConversationsOutput,
  Message,
} from "@/types/conversation";

export async function fetchConversations(): Promise<Conversation[]> {
  try {
    const { data } = await axiosClient.get<GetConversationsOutput>("/c/");
    return data.conversations;
  } catch (error) {
    console.error("[fetchConversations] Failed to load conversations:", error);
    return [];
  }
}

export async function fetchConversation(
  param: string | { conversationId: string }
): Promise<{ conversation: Conversation; messages: Message[] }> {
  const conversationId = typeof param === "string" ? param : param.conversationId;
  const { data } = await axiosClient.get<GetConversationOutput>(`/c/${conversationId}`);
  return { conversation: data.conversation, messages: data.messages };
}

export async function createConversation(): Promise<Conversation> {
  const { data } = await axiosClient.post<CreateConversationOutput>("/c/");
  return data.conversation;
}

export async function sendMessage({ conversationId, message }: { conversationId: string; message: string }) {
  const response = await fetch(`/api/c/${conversationId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      user_id: "6ec0bd7f-11c0-43da-975e-2a8ad9ebae0c",
    },
    body: JSON.stringify({
      text: message,
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error(`Failed to send message: ${response.statusText}`);
  }

  return response.body.getReader();
}
