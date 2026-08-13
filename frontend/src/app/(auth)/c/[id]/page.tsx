"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { SendMessageFormData } from "@/app/schema";
import ChatInput from "@/components/chat-input";
import { fetchConversation, sendMessage } from "@/services/conversations";

const ChatPage = () => {
  const { id } = useParams<{ id: string }>();
  const [isStreaming, setIsStreaming] = useState(false);

  const streamResponse = useCallback(
    async (message: string) => {
      setIsStreaming(true);
      try {
        const reader = await sendMessage({ conversationId: id, message });
        const decoder = new TextDecoder();
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });

          // Parse SSE lines — each event is "data: {...}\n\n"
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const parsed = JSON.parse(line.slice(6));
                console.log("[SSE Event]", parsed.event, parsed);
              } catch {
                console.log("[SSE Raw]", line);
              }
            }
          }
        }
        console.log("[SSE] Stream complete");
      } catch (error) {
        console.error("[SSE] Error:", error);
      } finally {
        setIsStreaming(false);
      }
    },
    [id]
  );

  useEffect(() => {
    (async () => {
      const initialMessage = sessionStorage.getItem("initialMessage");
      if (initialMessage) {
        sessionStorage.removeItem("initialMessage");
        console.log("[SSE] Sending initial message:", initialMessage);
        streamResponse(initialMessage);
      } else {
        fetchConversation(id)
          .then(({ conversation, messages }) => {
            console.log("[History] Conversation:", conversation);
            console.log("[History] Messages:", messages);
          })
          .catch((error) => {
            console.error("[History] Error fetching conversation:", error);
          });
      }
    })();
  }, [id, streamResponse]);

  const handleSendMessage = async (data: SendMessageFormData) => {
    console.log("[SSE] Sending message:", data.message);
    await streamResponse(data.message);
  };

  return (
    <div className="flex h-full flex-1 flex-col justify-between px-4 md:items-center md:px-30">
      <div>
        conversation Id: {id}
        {isStreaming && <span> (streaming...)</span>}
      </div>
      <ChatInput onSubmit={handleSendMessage} />
    </div>
  );
};

export default ChatPage;
