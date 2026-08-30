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

export type ToolCall = {
  id: string;
  name: string;
  args: Record<string, unknown> | string;
  output: unknown;
};

export type ToolResult = {
  tool_call_id: string;
  name: string;
  output: unknown;
};

export type UIMessage = {
  id: string;
  isStreaming?: boolean;
  createdAt: string;
} & (UserContent | AssistantContent | ToolContent);

export type UserContent = {
  role: "user";
  text: string;
};

export type AssistantContent = {
  role: "assistant";
  text: string;
  tool_calls: ToolCall[];
};

export type ToolContent = {
  role: "tool";
  tool_result: ToolResult;
};
