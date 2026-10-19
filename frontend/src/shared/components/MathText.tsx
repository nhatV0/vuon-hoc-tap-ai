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

    const cjkMap: Record<string, string> = {
      "圆形": "hình tròn", "圆": "hình tròn", "矩形": "hình chữ nhật",
      "三角形": "hình tam giác", "椭圆": "hình elip", "球": "hình cầu",
      "柱": "hình trụ", "函数": "hàm số", "导数": "đạo hàm",
      "积分": "tích phân", "方程": "phương trình", "定理": "định lý",
      "假设": "giả sử", "证明": "chứng minh", "定义": "định nghĩa",
      "结论": "kết luận", "正确": "chính xác", "错误": "sai"
    };
    let sanitized = content;
    for (const [cjk, viet] of Object.entries(cjkMap)) {
      sanitized = sanitized.split(cjk).join(` ${viet} `);
    }
    sanitized = sanitized.replace(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g, "");
    sanitized = sanitized.replace(/[ \t]{2,}/g, " ");

    const placeholders: Array<{ key: string; html: string }> = [];
    const savePlaceholder = (html: string) => {
      const key = `@@@MATH_TOKEN_${placeholders.length}@@@`;
      placeholders.push({ key, html });
      return key;
    };

    // Normalize all LaTeX delimiters: \\( ... \\), \( ... \), \\[ ... \\], \[ ... \]
    let normalized = sanitized
      .replace(/\\\\?\[([\s\S]*?)\\\\?\]/g, (_, math) => `$$${math.trim()}$$`)
      .replace(/\\\\?\(([\s\S]*?)\\\\?\)/g, (_, math) => `$${math.trim()}$`);

    // Clean up unbalanced brackets or trailing escaped closing parens e.g. \\)
    normalized = normalized.replace(/\\\\?\)/g, "").replace(/\\\\?\(/g, "");

    // 1. Process block math $$...$$ first
    let text = normalized.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
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
