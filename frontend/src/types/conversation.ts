import { Output } from "./base";

export type Conversation = {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
};

export type GetConversationsOutput = Output<{
  conversations: Conversation[];
}>;

export type CreateConversationOutput = Output<{
  conversation: Conversation;
}>;
