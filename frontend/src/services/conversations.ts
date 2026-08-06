import { axiosClient } from "@/lib/api";
import { Conversation, CreateConversationOutput, GetConversationsOutput } from "@/types/conversation";

export async function fetchConversations(): Promise<Conversation[]> {
  const { data } = await axiosClient.get<GetConversationsOutput>("/c/");
  return data.conversations;
}

export async function createConversation(): Promise<Conversation> {
  const { data } = await axiosClient.post<CreateConversationOutput>("/c/");
  return data.conversation;
}
