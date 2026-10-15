import React, { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface MathTextProps {
  content: string;
  className?: string;
}

export default function MathText({ content, className = "" }: MathTextProps) {
  const renderedContent = useMemo(() => {
    if (!content) return "";

    // 1. Process block math $$...$$ first
    let text = content.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
      try {
        return `<div class="my-2.5 overflow-x-auto py-1">${katex.renderToString(math.trim(), { throwOnError: false, displayMode: true })}</div>`;
      } catch {
        return math;
      }
    });

    // 2. Process inline math $...$
    text = text.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
      try {
        return katex.renderToString(math.trim(), { throwOnError: false, displayMode: false });
      } catch {
        return math;
      }
    });

    // 3. Catch raw LaTeX commands not wrapped in $ (e.g. \text{...}, \sum, \rightarrow, \overset)
    text = text.replace(/(\\[a-zA-Z]+(?:\{[^{}]*\}|_[a-zA-Z0-9{}]+|\^[a-zA-Z0-9{}]+|\s+)+)/g, (match) => {
      try {
        return katex.renderToString(match.trim(), { throwOnError: false, displayMode: false });
      } catch {
        return match;
      }
    });

    // 4. Render Headings: ### Header -> <h3>
    text = text.replace(/^### (.*$)/gim, '<h3 class="text-sm font-bold text-amber-900 dark:text-amber-300 mt-3 mb-1 border-b border-amber-200/50 pb-0.5">$1</h3>');
    text = text.replace(/^## (.*$)/gim, '<h2 class="text-base font-bold text-amber-950 dark:text-amber-200 mt-4 mb-1.5 border-b border-border pb-1">$1</h2>');

    // 5. Bold & Italic
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

    // 6. Horizontal separator ---
    text = text.replace(/---/g, '<hr class="my-2.5 border-border" />');

    // 7. Bullet lists: * or -
    text = text.replace(/^[*-] (.*$)/gim, '<li class="ml-4 list-disc text-xs leading-relaxed my-0.5">$1</li>');

    // 8. Line breaks
    text = text.replace(/\n\n/g, '<div class="h-2"></div>');
    text = text.replace(/\n/g, '<br />');

    return text;
  }, [content]);

  return (
    <div
      className={`prose prose-sm max-w-none text-xs leading-relaxed break-words ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  );
}
