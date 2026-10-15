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

    const placeholders: Array<{ key: string; html: string }> = [];
    const savePlaceholder = (html: string) => {
      const key = `@@@MATH_TOKEN_${placeholders.length}@@@`;
      placeholders.push({ key, html });
      return key;
    };

    // 1. Process block math $$...$$ first
    let text = content.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
      try {
        const rendered = katex.renderToString(math.trim(), { throwOnError: false, displayMode: true });
        return savePlaceholder(`<div class="my-2.5 overflow-x-auto py-1">${rendered}</div>`);
      } catch {
        return math;
      }
    });

    // 2. Process inline math $...$
    text = text.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
      try {
        const rendered = katex.renderToString(math.trim(), { throwOnError: false, displayMode: false });
        return savePlaceholder(rendered);
      } catch {
        return math;
      }
    });

    // 3. Process inline code `...`
    text = text.replace(/`([^`\n]+)`/g, (_, code) => {
      const escaped = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return savePlaceholder(`<code class="px-1 py-0.5 rounded bg-muted font-mono text-[11px] text-amber-800">${escaped}</code>`);
    });

    // 4. Escape remaining raw HTML tags (e.g. <b>, <strong>, <a>, <div>) so they display literally
    text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // 5. Render Headings: ### Header -> <h3>
    text = text.replace(/^### (.*$)/gim, '<h3 class="text-sm font-bold text-amber-900 dark:text-amber-300 mt-3 mb-1 border-b border-amber-200/50 pb-0.5">$1</h3>');
    text = text.replace(/^## (.*$)/gim, '<h2 class="text-base font-bold text-amber-950 dark:text-amber-200 mt-4 mb-1.5 border-b border-border pb-1">$1</h2>');

    // 6. Bold & Italic
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

    // 7. Horizontal separator & Lists
    text = text.replace(/---/g, '<hr class="my-2.5 border-border" />');
    text = text.replace(/^[*-] (.*$)/gim, '<li class="ml-4 list-disc text-xs leading-relaxed my-0.5">$1</li>');

    // 8. Line breaks
    text = text.replace(/\n\n/g, '<div class="h-2"></div>');
    text = text.replace(/\n/g, '<br />');

    // 9. Restore placeholders
    for (const { key, html } of placeholders) {
      text = text.replace(key, html);
    }

    return text;
  }, [content]);

  return (
    <div
      className={`prose prose-sm max-w-none text-xs leading-relaxed break-words ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  );
}
