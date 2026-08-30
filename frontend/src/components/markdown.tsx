"use client";

import { CheckmarkCircle02Icon, Copy01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { FC, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CodeBlockProps = {
  language?: string;
  children: string;
};

const CodeBlock: FC<CodeBlockProps> = ({ language, children }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (copied) return;
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="group/code border-border bg-card relative my-3 overflow-hidden rounded-xl border shadow-xs">
      <div className="border-border/70 bg-muted/60 text-muted-foreground flex items-center justify-between border-b px-4 py-1.5 font-mono text-xs">
        <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
          {language || "code"}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={handleCopy}
          className="text-muted-foreground hover:text-foreground h-6 gap-1 px-2 text-xs"
        >
          <HugeiconsIcon icon={copied ? CheckmarkCircle02Icon : Copy01Icon} strokeWidth={2} data-icon="inline-start" />
          <span>{copied ? "Copied" : "Copy"}</span>
        </Button>
      </div>
      <div className="overflow-x-auto p-4">
        <pre className="text-foreground font-mono text-sm leading-relaxed">
          <code>{children}</code>
        </pre>
      </div>
    </div>
  );
};

type Props = {
  content: string;
  className?: string;
};

const Markdown: FC<Props> = ({ content, className }) => {
  return (
    <div className={cn("text-foreground text-sm", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre: ({ children }) => <>{children}</>,
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const codeString = String(children).replace(/\n$/, "");
            const isMultiline = String(children).includes("\n") || Boolean(match);

            if (isMultiline) {
              return <CodeBlock language={match ? match[1] : undefined}>{codeString}</CodeBlock>;
            }

            return (
              <code
                className="border-border/60 bg-muted text-foreground rounded-md border px-1.5 py-0.5 font-mono text-xs font-medium"
                {...props}
              >
                {children}
              </code>
            );
          },
          h1: ({ children }) => (
            <h1 className="text-foreground mt-6 mb-3 text-2xl font-bold tracking-tight first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-foreground mt-5 mb-2.5 text-xl font-semibold tracking-tight first:mt-0">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-foreground mt-4 mb-2 text-lg font-semibold tracking-tight first:mt-0">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-foreground mt-3 mb-1.5 text-base font-semibold tracking-tight first:mt-0">
              {children}
            </h4>
          ),
          p: ({ children }) => <p className="text-foreground/90 mb-3 leading-relaxed last:mb-0">{children}</p>,
          ul: ({ children }) => (
            <ul className="text-foreground/90 my-3 list-disc space-y-1.5 pl-6 leading-relaxed">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="text-foreground/90 my-3 list-decimal space-y-1.5 pl-6 leading-relaxed">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-primary/60 bg-muted/20 text-muted-foreground my-3 rounded-r-md border-l-2 py-1.5 pl-4 italic">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="border-border my-4 w-full overflow-x-auto rounded-xl border">
              <table className="w-full text-left text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="border-border bg-muted/60 text-muted-foreground border-b text-xs font-semibold tracking-wider uppercase">
              {children}
            </thead>
          ),
          tbody: ({ children }) => <tbody className="divide-border/60 bg-card/40 divide-y">{children}</tbody>,
          tr: ({ children }) => <tr className="hover:bg-muted/30 transition-colors">{children}</tr>,
          th: ({ children }) => <th className="text-foreground px-4 py-3 font-semibold">{children}</th>,
          td: ({ children }) => <td className="text-foreground/90 px-4 py-2.5">{children}</td>,
          a: ({ href, children, ...props }) => {
            const isExternal = href?.startsWith("http") || href?.startsWith("//");
            return (
              <a
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="text-primary decoration-primary/40 hover:decoration-primary font-medium underline underline-offset-4 transition-colors"
                {...props}
              >
                {children}
              </a>
            );
          },
          hr: () => <hr className="border-border my-6" />,
          strong: ({ children }) => <strong className="text-foreground font-semibold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default Markdown;
