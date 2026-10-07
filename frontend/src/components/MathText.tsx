"use client";

import React, { useMemo } from "react";
import katex from "katex";

interface MathTextProps {
  content: string;
  className?: string;
}

export default function MathText({ content, className = "" }: MathTextProps) {
  // Phân tích văn bản và render công thức Toán học KaTeX ($...$ hoặc $$...$$)
  const renderedElements = useMemo(() => {
    if (!content) return null;

    // Tách chuỗi theo cả $$...$$ (khối) và $...$ (inline)
    const regex = /(\$\$[\s\S]+?\$\$|\$[^\$]+?\$)/g;
    const parts = content.split(regex);

    return parts.map((part, index) => {
      if (part.startsWith("$$") && part.endsWith("$$")) {
        const math = part.slice(2, -2).trim();
        try {
          const html = katex.renderToString(math, {
            displayMode: true,
            throwOnError: false,
          });
          return (
            <span
              key={index}
              dangerouslySetInnerHTML={{ __html: html }}
              className="inline-block my-1"
            />
          );
        } catch {
          return <span key={index}>{part}</span>;
        }
      } else if (part.startsWith("$") && part.endsWith("$")) {
        const math = part.slice(1, -1).trim();
        try {
          const html = katex.renderToString(math, {
            displayMode: false,
            throwOnError: false,
          });
          return (
            <span
              key={index}
              dangerouslySetInnerHTML={{ __html: html }}
              className="inline-block px-0.5"
            />
          );
        } catch {
          return <span key={index}>{part}</span>;
        }
      } else {
        // Tự động nhận diện nếu toàn bộ chuỗi hoặc phần chuỗi là một biểu thức toán học (ví dụ: y' = 3^x, x -> 0, \Delta...)
        const isPureMathExpression = /^([a-zA-Z0-9\s'=+\-*/()[\],._^\\{}|<>:]+)$/.test(part) &&
          (/[=+\-*/^\\_]|\\cdot|\\frac|\\ln|\\log|\\int|\\Delta|\\alpha|\\beta|\\pi/.test(part));

        if (isPureMathExpression) {
          try {
            const html = katex.renderToString(part.trim(), {
              displayMode: false,
              throwOnError: false,
            });
            return (
              <span
                key={index}
                dangerouslySetInnerHTML={{ __html: html }}
                className="inline-block px-0.5"
              />
            );
          } catch {
            return <span key={index}>{part}</span>;
          }
        }

        return <span key={index}>{part}</span>;
      }
    });
  }, [content]);

  return <span className={className}>{renderedElements}</span>;
}
