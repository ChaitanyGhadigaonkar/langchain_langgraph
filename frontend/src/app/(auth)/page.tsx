"use client";

import { useRouter } from "next/navigation";

import { createConversationAction } from "@/app/actions";
import { SendMessageFormData } from "@/app/schema";
import ChatInput from "@/components/chat-input";

const HomePage = () => {
  const router = useRouter();

  const handleCreateConversation = async (data: SendMessageFormData) => {
    try {
      const createdConversation = await createConversationAction();
      sessionStorage.setItem("initialMessage", data.message);
      router.push(`/c/${createdConversation.id}`);
      router.refresh();
    } catch (error) {
      console.log((error as unknown as Error).message);
    }
  };

  return (
    <div className="relative flex h-full w-full flex-1 overflow-auto pt-14">
      <ChatInput onSubmit={handleCreateConversation} />
    </div>
  );
};

export default HomePage;
