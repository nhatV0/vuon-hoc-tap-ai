"use client";

import React, { ReactNode } from "react";

interface RichTooltipProps {
  content: string;
  subtext?: string;
  position?: "top" | "bottom";
  children: ReactNode;
  className?: string;
}

export default function RichTooltip({
  content,
  subtext,
  position = "top",
  children,
  className = ""
}: RichTooltipProps) {
  const positionClasses =
    position === "top"
      ? "bottom-full mb-2 left-1/2 -translate-x-1/2"
      : "top-full mt-2 left-1/2 -translate-x-1/2";

  const arrowClasses =
    position === "top"
      ? "top-full left-1/2 -translate-x-1/2 border-t-stone-900 border-x-transparent border-b-transparent"
      : "bottom-full left-1/2 -translate-x-1/2 border-b-stone-900 border-x-transparent border-t-transparent";

  return (
    <div className={`relative inline-flex items-center group/tooltip ${className}`}>
      {children}
      <div
        className={`absolute ${positionClasses} pointer-events-none z-50 opacity-0 group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0 ${
          position === "top" ? "translate-y-1" : "-translate-y-1"
        } transition-all duration-200 ease-out flex flex-col items-center w-max max-w-[240px] text-center drop-shadow-xl`}
      >
        <div className="bg-stone-900/95 backdrop-blur-md text-white text-[11px] font-medium px-3 py-1.5 rounded-xl border border-stone-700/60 shadow-2xl space-y-0.5">
          <p className="font-bold text-amber-300 leading-tight tracking-wide">{content}</p>
          {subtext && <p className="text-[10px] text-stone-300/90 leading-tight">{subtext}</p>}
        </div>
        {/* Mũi tên tam giác tinh tế */}
        <div className={`w-0 h-0 border-4 ${arrowClasses}`} />
      </div>
    </div>
  );
}
