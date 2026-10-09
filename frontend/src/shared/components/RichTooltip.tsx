import React, { useState } from "react";
import { Info } from "lucide-react";

interface RichTooltipProps {
  content: string;
  children?: React.ReactNode;
}

export default function RichTooltip({ content, children }: RichTooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <span
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="cursor-pointer inline-flex items-center text-stone-400 hover:text-stone-600"
      >
        {children || <Info className="w-4 h-4 ml-1" />}
      </span>
      {visible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 bg-stone-900 text-stone-100 text-xs rounded-xl shadow-xl z-50 pointer-events-none transition-all">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-900" />
        </div>
      )}
    </div>
  );
}
