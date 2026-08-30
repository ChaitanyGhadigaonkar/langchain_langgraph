import { AiBrain01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { FC } from "react";

import { UIMessage } from "@/types/conversation";

import Markdown from "./markdown";
import ToolStatus from "./tool-status";
import { Bubble, BubbleContent } from "./ui/bubble";
import { Message, MessageAvatar, MessageContent } from "./ui/message";
import { MessageScrollerItem } from "./ui/message-scroller";

type Props = {
  message: UIMessage;
};

const ChatMessage: FC<Props> = ({ message }) => {
  return (
    <MessageScrollerItem key={message.id} messageId={message.id} scrollAnchor={message.role === "user"}>
      {message.role === "user" && (
        <Message align="end">
          <MessageContent className="items-end">
            <Bubble variant="default" align="end">
              <BubbleContent className="text-sm leading-relaxed">
                <Markdown content={message.text} />
              </BubbleContent>
            </Bubble>
          </MessageContent>
        </Message>
      )}
      {message.role === "assistant" && (
        <Message align="start" className="gap-3">
          <MessageAvatar className="bg-primary/10 text-primary size-8 rounded-full">
            <HugeiconsIcon icon={AiBrain01Icon} strokeWidth={2} className="size-4.5" />
          </MessageAvatar>
          <MessageContent className="min-w-0 flex-1">
            {message.tool_calls && message.tool_calls.length > 0 && (
              <div className="flex flex-col gap-1.5 pb-1">
                {message.tool_calls.map((tc, idx) => (
                  <ToolStatus
                    key={tc.id || idx}
                    name={tc.name || "retriever"}
                    args={tc.args}
                    output={tc.output}
                    isRunning={message.isStreaming && !tc.output && !message.text}
                  />
                ))}
              </div>
            )}
            {message.isStreaming && !message.text && (
              <div className="text-muted-foreground flex animate-pulse items-center gap-2.5 py-2 text-xs">
                <HugeiconsIcon icon={AiBrain01Icon} strokeWidth={2} className="text-primary size-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            )}
            {message.text && (
              <Bubble variant="ghost" align="start">
                <BubbleContent className="text-foreground p-0">
                  <Markdown content={message.text} />
                </BubbleContent>
              </Bubble>
            )}
          </MessageContent>
        </Message>
      )}
      {message.role === "tool" && (
        <div className="pl-11">
          <ToolStatus name={message.tool_result?.name || "retriever"} output={message.tool_result?.output} />
        </div>
      )}
    </MessageScrollerItem>
  );
};

export default ChatMessage;
