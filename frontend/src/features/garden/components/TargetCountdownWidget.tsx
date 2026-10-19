import React, { useMemo } from "react";
import { Calendar, Flag, Sparkles, Clock } from "lucide-react";
import { Card } from "@/shared/components/ui/card";

interface Props {
  targetDate?: string | null;
  goal?: string;
  subjects?: string[];
}

export default function TargetCountdownWidget({ targetDate, goal, subjects = [] }: Props) {
  const countdown = useMemo(() => {
    if (!targetDate) return null;
    const target = new Date(targetDate);
    target.setHours(23, 59, 59, 999);
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();

    if (diffMs <= 0) {
      return { days: 0, hours: 0, isExpired: true };
    }
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { days, hours, isExpired: false };
  }, [targetDate]);

  if (!targetDate && !goal) return null;

  const formattedDate = targetDate
    ? new Date(targetDate).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      })
    : "Chưa đặt";

  return (
    <Card className="p-4 border-amber-200/80 bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-stone-50 rounded-2xl shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wide">
          <Flag className="w-4 h-4 text-amber-600" />
          <span>Mục tiêu cá nhân</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium">
          <Calendar className="w-3.5 h-3.5 text-stone-400" />
          <span>Hạn chót: {formattedDate}</span>
        </div>
      </div>

      {goal && (
        <p className="text-xs text-stone-800 font-medium leading-relaxed bg-white/70 p-2.5 rounded-xl border border-amber-100">
          "{goal}"
        </p>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-amber-100/80">
        <div className="flex items-center gap-1 text-[11px] text-stone-500 truncate max-w-[170px]">
          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="truncate">
            {subjects.length > 0 ? `Môn: ${subjects.join(", ")}` : "Đồng hành mỗi ngày"}
          </span>
        </div>

        {countdown ? (
          <div className="flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
            {countdown.isExpired ? (
              <span className="text-xs font-bold text-amber-700">Đã đến hạn chót</span>
            ) : (
              <div className="flex items-baseline gap-1 text-amber-800">
                <span className="text-sm font-black tracking-tight">{countdown.days}</span>
                <span className="text-[10px] font-semibold">ngày</span>
                <span className="text-xs font-bold ml-1">{countdown.hours}</span>
                <span className="text-[10px] font-semibold">giờ</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[11px] text-amber-700 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Đang nỗ lực</span>
          </div>
        )}
      </div>
    </Card>
  );
}
