"use client";

import { useRouter } from "next/navigation";

import { createConversationAction } from "@/app/actions";
import { SendMessageFormData } from "@/app/schema";
import ChatInput from "@/components/chat-input";

const HomePage = () => {
  const router = useRouter();

  const handleCreateConversation = async (_data: SendMessageFormData) => {
    try {
      const createdConversation = await createConversationAction();
      router.push(`/c/${createdConversation.id}`);
      router.refresh();
    } catch (error) {
      console.log((error as unknown as Error).message);
    }
  };

  return (
    <div className="flex h-full items-end px-4 md:items-center md:px-30">
      <ChatInput onSubmit={handleCreateConversation} />
    </div>
  );
};

export default HomePage;
