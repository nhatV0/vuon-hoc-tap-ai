import React from "react";
import { Calendar, Clock } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface CountdownPillProps {
  daysLeft: number;
  targetExamName?: string;
  className?: string;
}

export const CountdownPill: React.FC<CountdownPillProps> = ({
  daysLeft,
  targetExamName = "Kỳ thi Tốt nghiệp THPT",
  className,
}) => {
  const isUrgent = daysLeft <= 30;
  const isApproaching = daysLeft > 30 && daysLeft <= 90;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border text-xs font-medium shadow-xs transition-colors",
        isUrgent
          ? "bg-rose-50 border-rose-200 text-rose-900"
          : isApproaching
          ? "bg-amber-50 border-amber-200 text-amber-900"
          : "bg-stone-50 border-stone-200 text-stone-800",
        className
      )}
    >
      <div className="flex items-center gap-1">
        {isUrgent ? (
          <Clock className="w-3.5 h-3.5 text-rose-600 animate-pulse" aria-hidden="true" />
        ) : (
          <Calendar className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
        )}
        <span className="font-semibold text-stone-900">{targetExamName}:</span>
      </div>
      <div className="flex items-baseline gap-0.5">
        <span className={cn("font-bold text-sm", isUrgent ? "text-rose-700" : "text-amber-700")}>
          {Math.max(0, daysLeft)}
        </span>
        <span className="text-[11px] text-stone-600">ngày</span>
      </div>
    </div>
  );
};
