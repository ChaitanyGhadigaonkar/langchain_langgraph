"use client";

import { useParams } from "next/navigation";

import { SendMessageFormData } from "@/app/schema";
import ChatInput from "@/components/chat-input";

const ChatPage = () => {
  const { id } = useParams<{ id: string }>();

  const handleCreateConversation = async (_data: SendMessageFormData) => {};
  return (
    <div className="flex h-full flex-1 flex-col justify-between px-4 md:items-center md:px-30">
      <div>
        conversation Id:
        {id}
      </div>
      <ChatInput onSubmit={handleCreateConversation} />
    </div>
  );
};

export default ChatPage;
