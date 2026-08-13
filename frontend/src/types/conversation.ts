import { Output } from "./base";

export type Conversation = {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  role: string;
  content: Record<string, unknown>;
  parent_id: string | null;
  created_at: string;
};

export type GetConversationsOutput = Output<{
  conversations: Conversation[];
}>;

export type CreateConversationOutput = Output<{
  conversation: Conversation;
}>;

export type GetConversationOutput = Output<{
  conversation: Conversation;
  messages: Message[];
}>;
