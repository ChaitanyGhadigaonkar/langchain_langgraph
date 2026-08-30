"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { SendMessageFormData } from "@/app/schema";
import ChatInput from "@/components/chat-input";
import ChatMessage from "@/components/chat-message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchConversation, sendMessage } from "@/services/conversations";
import { ToolCall, UIMessage } from "@/types/conversation";

const ChatPage = () => {
  const { id } = useParams<{ id: string }>();

  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("initialMessage")) {
      return false;
    }
    return true;
  });
  const [messages, setMessages] = useState<UIMessage[]>(() => {
    if (typeof window !== "undefined") {
      const initialMessage = sessionStorage.getItem("initialMessage");
      if (initialMessage) {
        sessionStorage.removeItem("initialMessage");
        return [
          {
            id: `user-${Date.now()}`,
            role: "user",
            text: initialMessage,
            createdAt: new Date().toISOString(),
          },
        ];
      }
    }
    return [];
  });

  const hasInitializedRef = useRef<string | null>(null);

  const streamResponse = useCallback(
    async (promptText: string) => {
      setIsStreaming(true);
      const assistantId = `assistant-${Date.now()}`;
      let fullText = "";

      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          text: "",
          tool_calls: [],
          isStreaming: true,
          createdAt: new Date().toISOString(),
        },
      ]);

      try {
        const reader = await sendMessage({ conversationId: id, message: promptText });
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;

            try {
              const parsed = JSON.parse(trimmed.slice(6));
              const eventKind = parsed.event;

              if (eventKind === "on_chat_model_stream") {
                if (parsed.content) {
                  const chunkText =
                    typeof parsed.content === "string"
                      ? parsed.content
                      : Array.isArray(parsed.content)
                        ? parsed.content
                            .map((b: unknown) =>
                              typeof b === "string"
                                ? b
                                : typeof b === "object" && b !== null && "text" in b
                                  ? (b as { text: string }).text
                                  : ""
                            )
                            .join("")
                        : String(parsed.content);

                  fullText += chunkText;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantId && msg.role === "assistant" ? { ...msg, text: fullText } : msg
                    )
                  );
                }
              } else if (eventKind === "on_tool_start") {
                setMessages((prev) =>
                  prev.map((msg) => {
                    if (msg.id !== assistantId || msg.role !== "assistant") return msg;
                    const toolCalls = msg.tool_calls || [];
                    return {
                      ...msg,
                      tool_calls: [
                        ...toolCalls,
                        {
                          id: `tool-${Date.now()}`,
                          name: parsed.name,
                          args: parsed.input,
                          output: undefined,
                        },
                      ],
                    };
                  })
                );
              } else if (eventKind === "on_tool_end") {
                setMessages((prev) =>
                  prev.map((msg) => {
                    if (msg.id !== assistantId || msg.role !== "assistant") return msg;
                    const toolCalls = msg.tool_calls || [];
                    const updated = toolCalls.map((tc) =>
                      tc.name === parsed.name ? { ...tc, output: parsed.output } : tc
                    );
                    return {
                      ...msg,
                      tool_calls: updated,
                    };
                  })
                );
              }
            } catch (err) {
              console.error("[SSE Parse Error]", err, trimmed);
            }
          }
        }

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId && msg.role === "assistant" ? { ...msg, text: fullText, isStreaming: false } : msg
          )
        );
      } catch (error) {
        console.error("[SSE Error]", error);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId && msg.role === "assistant"
              ? {
                  ...msg,
                  text:
                    fullText +
                    (fullText
                      ? "\n\n*[Response interrupted]*"
                      : "Sorry, an error occurred while processing your request. Please try again."),
                  isStreaming: false,
                }
              : msg
          )
        );
      } finally {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId && msg.role === "assistant"
              ? { ...msg, text: fullText || msg.text, isStreaming: false }
              : msg
          )
        );
        setIsStreaming(false);
      }
    },
    [id]
  );

  useEffect(() => {
    if (hasInitializedRef.current === id) return;
    hasInitializedRef.current = id;

    const firstMsg = messages[0];
    if (messages.length === 1 && firstMsg?.role === "user") {
      const initialText = firstMsg.text;
      void Promise.resolve().then(() => streamResponse(initialText));
    } else {
      fetchConversation(id)
        .then(({ messages: dbMessages }) => {
          const parsed: UIMessage[] = dbMessages.map((m) => {
            if (m.role === "user") {
              const content = m.content as { text?: string };
              return {
                id: m.id,
                role: "user",
                text: content?.text || "",
                createdAt: m.created_at,
              };
            }
            if (m.role === "assistant") {
              const content = m.content as {
                text?: string;
                tool_calls?: ToolCall[];
              };
              return {
                id: m.id,
                role: "assistant",
                text: content?.text || "",
                tool_calls: content?.tool_calls || [],
                createdAt: m.created_at,
              };
            }
            const content = m.content as {
              tool_call_id?: string;
              name?: string;
              output?: unknown;
            };
            return {
              id: m.id,
              role: "tool",
              tool_result: {
                tool_call_id: content?.tool_call_id || "",
                name: content?.name || "",
                output: content?.output,
              },
              createdAt: m.created_at,
            };
          });
          setMessages(parsed);
        })
        .catch((error) => {
          console.error("Failed to fetch conversation", error);
        })
        .finally(() => {
          setIsLoadingHistory(false);
        });
    }
  }, [id, messages, streamResponse]);

  const handleSendMessage = async (data: SendMessageFormData) => {
    if (!data.message.trim() || isStreaming) return;

    const userMsg: UIMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: data.message,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    await streamResponse(data.message);
  };

  return (
    <div className="relative flex h-full w-full flex-1 overflow-auto pt-14">
      <MessageScrollerProvider>
        <MessageScroller>
          <MessageScrollerViewport>
            <MessageScrollerContent className="relative mx-auto w-full max-w-6xl px-2 pt-2 md:px-30">
              {isLoadingHistory && messages.length === 0 && (
                <div className="flex flex-col gap-4 py-8">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-8 rounded-full" />
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-72" />
                    </div>
                  </div>
                </div>
              )}
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </MessageScrollerContent>
            <MessageScrollerButton className="data-[direction=end]:bottom-20" />
          </MessageScrollerViewport>
        </MessageScroller>
      </MessageScrollerProvider>
      <ChatInput onSubmit={handleSendMessage} disabled={isStreaming} />
    </div>
  );
};

export default ChatPage;
