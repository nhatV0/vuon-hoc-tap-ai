import React from "react";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";

interface Props {
  weakness: string;
  setWeakness: (v: string) => void;
  goal: string;
  setGoal: (v: string) => void;
  loading: boolean;
  onBack: () => void;
  onSubmit: () => void;
}

export default function StepGoalWeakness({
  weakness,
  setWeakness,
  goal,
  setGoal,
  loading,
  onBack,
  onSubmit
}: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-stone-900 mb-1">Mục tiêu & Trở ngại</h2>
        <p className="text-xs text-stone-500">Giúp trợ lý AI cá nhân hóa lời động viên và nhiệm vụ vi mô.</p>
      </div>
      <div>
        <label className="block text-xs font-semibold text-stone-700 mb-1.5">Khó khăn hiện tại lớn nhất</label>
        <Textarea
          value={weakness}
          onChange={(e) => setWeakness(e.target.value)}
          rows={2}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-stone-700 mb-1.5">Mục tiêu dài hạn</label>
        <Textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          rows={2}
        />
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Quay lại</span>
        </Button>
        <Button onClick={onSubmit} disabled={loading} className="flex-1">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
          <span>Tạo Lộ Trình Vi Mô</span>
        </Button>
      </div>
    </div>
  );
}
