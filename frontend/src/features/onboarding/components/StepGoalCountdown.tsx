import React from "react";
import { Calendar, Flag, Sparkles, Loader2, ArrowLeft } from "lucide-react";
import { Textarea } from "@/shared/components/ui/textarea";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";

interface Props {
  goal: string;
  setGoal: (v: string) => void;
  targetDate: string;
  setTargetDate: (v: string) => void;
  loading: boolean;
  onBack: () => void;
  onSubmit: () => void;
}

export default function StepGoalCountdown({
  goal,
  setGoal,
  targetDate,
  setTargetDate,
  loading,
  onBack,
  onSubmit
}: Props) {
  // Preset dates helper: next month, 3 months, or national exam end of June
  const currentYear = new Date().getFullYear();
  const examDate = `${currentYear}-06-26`;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-stone-900 mb-1">Mục tiêu & Hạn chót đếm ngược</h2>
        <p className="text-xs text-stone-500">
          Xác định đích đến cá nhân. Màn hình chính sẽ hiển thị bộ đếm ngược nhắc nhở mỗi ngày.
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
          <Flag className="w-3.5 h-3.5 text-amber-600" />
          <span>Mục tiêu cá nhân</span>
        </label>
        <Textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Ví dụ: Đạt 8.5+ môn Toán, đỗ Đại học Bách Khoa, nâng điểm trung bình..."
          rows={3}
          className="text-xs leading-relaxed"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-amber-600" />
          <span>Ngày mục tiêu hoàn thành (Target Date)</span>
        </label>
        <Input
          type="date"
          value={targetDate}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => setTargetDate(e.target.value)}
          className="text-xs h-9 cursor-pointer"
        />
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <span className="text-[11px] text-stone-400">Gợi ý nhanh:</span>
          <button
            type="button"
            onClick={() => setTargetDate(examDate)}
            className="text-[11px] px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors"
          >
            Kỳ thi TN THPT ({currentYear})
          </button>
          <button
            type="button"
            onClick={() => {
              const d = new Date();
              d.setDate(d.getDate() + 30);
              setTargetDate(d.toISOString().split("T")[0]);
            }}
            className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-stone-700 hover:bg-stone-200 transition-colors"
          >
            30 ngày tới
          </button>
          <button
            type="button"
            onClick={() => {
              const d = new Date();
              d.setDate(d.getDate() + 90);
              setTargetDate(d.toISOString().split("T")[0]);
            }}
            className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-stone-700 hover:bg-stone-200 transition-colors"
          >
            90 ngày tới
          </button>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onBack} className="h-9 text-xs">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Quay lại</span>
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={loading || !goal.trim() || !targetDate}
          className="flex-1 h-9 text-xs"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          <span>Bắt đầu Hành trình Học tập</span>
        </Button>
      </div>
    </div>
  );
}
