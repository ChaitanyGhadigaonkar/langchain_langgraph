"use client";

import { AiSearch02Icon, ArrowDown01Icon, ArrowRight01Icon, Database01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import React, { FC, useState } from "react";

import { cn } from "@/lib/utils";

type ToolStatusProps = {
  name: string;
  args?: Record<string, unknown> | string;
  output?: unknown;
  isRunning?: boolean;
};

const ToolStatus: FC<ToolStatusProps> = ({ name, args, output, isRunning = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getToolDisplayName = (toolName: string) => {
    if (toolName.toLowerCase().includes("retriever") || toolName.toLowerCase().includes("search")) {
      return "Knowledge Base Retrieval";
    }
    return toolName;
  };

  const hasDetails = Boolean(args || output);

  return (
    <div className="my-2 max-w-xl text-xs">
      <button
        type="button"
        disabled={!hasDetails}
        onClick={() => hasDetails && setIsOpen((prev) => !prev)}
        className={cn(
          "border-border/70 bg-muted/50 text-muted-foreground flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono transition-colors select-none",
          hasDetails && "hover:border-border hover:bg-muted hover:text-foreground cursor-pointer",
          isRunning && "border-primary/40 bg-primary/5 text-primary animate-pulse"
        )}
      >
        <HugeiconsIcon
          icon={name.toLowerCase().includes("retriever") ? Database01Icon : AiSearch02Icon}
          strokeWidth={2}
          className={cn("size-3.5", isRunning && "animate-spin")}
        />
        <span className="font-sans font-medium">
          {isRunning
            ? `Searching with ${getToolDisplayName(name)}...`
            : `Retrieved context via ${getToolDisplayName(name)}`}
        </span>
        {hasDetails && (
          <HugeiconsIcon
            icon={isOpen ? ArrowDown01Icon : ArrowRight01Icon}
            strokeWidth={2}
            className="text-muted-foreground size-3"
          />
        )}
      </button>

      {isOpen && hasDetails && (
        <div className="border-border/70 bg-card mt-2 overflow-hidden rounded-lg border p-3 font-mono text-xs shadow-xs">
          {args && (
            <div className="mb-2">
              <span className="text-muted-foreground font-semibold">Input:</span>
              <pre className="bg-muted/60 text-foreground mt-1 overflow-x-auto rounded p-2">
                {typeof args === "string" ? args : JSON.stringify(args, null, 2)}
              </pre>
            </div>
          )}
          {output !== undefined && (
            <div>
              <span className="text-muted-foreground font-semibold">Output:</span>
              <pre className="bg-muted/60 text-foreground mt-1 max-h-48 overflow-y-auto rounded p-2">
                {typeof output === "string" ? output : JSON.stringify(output, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ToolStatus;
