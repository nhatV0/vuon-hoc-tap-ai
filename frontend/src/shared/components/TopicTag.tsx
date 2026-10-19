import React from "react";
import { BookOpen, Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface TopicTagProps {
  id: string;
  name: string;
  count?: number;
  isSelected?: boolean;
  subjectColor?: string;
  onToggle?: (id: string) => void;
  className?: string;
}

export const TopicTag: React.FC<TopicTagProps> = ({
  id,
  name,
  count,
  isSelected = false,
  onToggle,
  className,
}) => {
  return (
    <button
      type="button"
      onClick={() => onToggle?.(id)}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all select-none cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500",
        isSelected
          ? "bg-amber-100/90 border-amber-300 text-amber-950 font-semibold shadow-xs"
          : "bg-stone-50/80 border-stone-200/80 text-stone-700 hover:bg-stone-100 hover:border-stone-300",
        className
      )}
      aria-pressed={isSelected}
    >
      {isSelected ? (
        <Check className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" aria-hidden="true" />
      ) : (
        <BookOpen className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" aria-hidden="true" />
      )}
      <span>{name}</span>
      {typeof count === "number" && (
        <span
          className={cn(
            "ml-0.5 px-1.5 py-0.2 rounded-full text-[10px]",
            isSelected ? "bg-amber-200 text-amber-900" : "bg-stone-200 text-stone-600"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
};
