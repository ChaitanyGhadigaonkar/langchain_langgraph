import { axiosClient } from "@/lib/api";
import { Conversation, CreateConversationOutput, GetConversationOutput, GetConversationsOutput, Message } from "@/types/conversation";

export async function fetchConversations(): Promise<Conversation[]> {
  const { data } = await axiosClient.get<GetConversationsOutput>("/c/");
  return data.conversations;
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
  const { data } = await axiosClient.post(`/c/${conversationId}/messages`, {
    text: message,
  }, {
    headers: {
      Accept: "text/event-stream",
    },
    responseType: "stream",
    adapter: "fetch",
  });

  return data.getReader();
}
