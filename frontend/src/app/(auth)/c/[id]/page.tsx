"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { SendMessageFormData } from "@/app/schema";
import ChatInput from "@/components/chat-input";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Message, MessageAvatar, MessageContent } from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { cn } from "@/lib/utils";
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
    <div className="relative flex h-full w-full flex-1 overflow-auto pt-14">
      <MessageScrollerProvider>
        <MessageScroller>
          <MessageScrollerViewport>
            <MessageScrollerContent className="relative mx-auto w-full max-w-6xl px-2 pt-2 md:px-30">
              {new Array(40).fill(0).map((message, index) => (
                <MessageScrollerItem
                  key={index}
                  messageId={message.toString()}
                  scrollAnchor={true}
                  className={`${index === new Array(40).length - 1 ? "pb-20" : ""}`}
                >
                  <Message align={index % 2 ? "end" : "start"}>
                    <MessageContent>
                      <Bubble variant="muted">
                        <BubbleContent>The install failure is coming from the workspace package.</BubbleContent>
                      </Bubble>
                    </MessageContent>
                  </Message>
                </MessageScrollerItem>
              ))}
            </MessageScrollerContent>
            <MessageScrollerButton className="data-[direction=end]:bottom-20" />
          </MessageScrollerViewport>
        </MessageScroller>
      </MessageScrollerProvider>
      <ChatInput onSubmit={handleSendMessage} />
    </div>
  );
};

export default ChatPage;
