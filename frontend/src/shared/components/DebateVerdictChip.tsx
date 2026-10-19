import React from "react";
import { CheckCircle2, AlertCircle, HelpCircle, Info } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export type VerdictType = "exact" | "partial" | "misconception" | "neutral";

export interface DebateVerdictChipProps {
  verdict: VerdictType;
  label?: string;
  className?: string;
}

const verdictConfig: Record<
  VerdictType,
  { defaultLabel: string; bgClass: string; textClass: string; borderClass: string; icon: React.ElementType }
> = {
  exact: {
    defaultLabel: "Chính xác tuyệt đối",
    bgClass: "bg-emerald-50",
    textClass: "text-emerald-800",
    borderClass: "border-emerald-200",
    icon: CheckCircle2,
  },
  partial: {
    defaultLabel: "Cần hoàn thiện",
    bgClass: "bg-amber-50",
    textClass: "text-amber-900",
    borderClass: "border-amber-200",
    icon: AlertCircle,
  },
  misconception: {
    defaultLabel: "Lỗ hổng kiến thức",
    bgClass: "bg-rose-50",
    textClass: "text-rose-900",
    borderClass: "border-rose-200",
    icon: HelpCircle,
  },
  neutral: {
    defaultLabel: "Phản hồi học tập",
    bgClass: "bg-stone-100",
    textClass: "text-stone-800",
    borderClass: "border-stone-200",
    icon: Info,
  },
};

export const DebateVerdictChip: React.FC<DebateVerdictChipProps> = ({ verdict, label, className }) => {
  const config = verdictConfig[verdict] || verdictConfig.neutral;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold select-none",
        config.bgClass,
        config.textClass,
        config.borderClass,
        className
      )}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
      <span>{label || config.defaultLabel}</span>
    </span>
  );
};
