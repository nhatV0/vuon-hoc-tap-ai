import React from "react";
import { Button } from "@/shared/components/ui/button";
import { Sparkles, Award as AwardIcon } from "lucide-react";

interface Props {
  result: any;
  onGenerateTwin: (detail: any) => void;
  onClose: () => void;
}

export default function QuizResultView({ result, onGenerateTwin, onClose }: Props) {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center">
        <AwardIcon className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <div className="font-extrabold text-stone-900 text-lg">
          Đúng {result.correct_answers} / {result.total_questions} câu
        </div>
        <p className="text-xs text-stone-600 mt-1">{result.feedback}</p>
      </div>

      <div className="space-y-2.5">
        {(result.details || []).map((dt: any, idx: number) => (
          <div key={idx} className="p-3 bg-muted/40 rounded-xl border border-border flex items-center justify-between gap-2">
            <div className="text-xs">
              <span className="font-bold">Câu {idx + 1}: </span>
              <span className={dt.is_correct ? "text-emerald-600 font-semibold" : "text-rose-600 font-semibold"}>
                {dt.is_correct ? "Chính xác" : `Chọn ${dt.selected_answer} (Đúng: ${dt.correct_answer})`}
              </span>
            </div>
            {!dt.is_correct && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onGenerateTwin(dt)}
                className="text-[11px] h-7 px-2.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 mr-1" />
                <span>Câu sinh đôi</span>
              </Button>
            )}
          </div>
        ))}
      </div>

      <Button onClick={onClose} className="w-full">
        Hoàn thành phiên
      </Button>
    </div>
  );
}
