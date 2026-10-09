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
    return content.replace(/\$(.*?)\$/g, (_, math) => {
      try {
        return katex.renderToString(math, { throwOnError: false, displayMode: false });
      } catch {
        return math;
      }
    });
  }, [content]);

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  );
}
