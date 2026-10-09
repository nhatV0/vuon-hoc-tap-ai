import React from "react";
import MathText from "@/shared/components/MathText";
import { Button } from "@/shared/components/ui/button";

interface Props {
  twinQuestion: any;
  twinSelected: string | null;
  twinSubmitted: boolean;
  onSelect: (key: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export default function TwinChallengeView({
  twinQuestion,
  twinSelected,
  twinSubmitted,
  onSelect,
  onSubmit,
  onBack
}: Props) {
  const isCorrect = twinSelected === twinQuestion.correct_answer;

  return (
    <div className="space-y-4 py-2">
      <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs space-y-1">
        <span className="font-bold text-amber-900 block">Rào cản nhận thức đã soi sáng:</span>
        <p className="text-stone-600">{twinQuestion.cognitive_barrier}</p>
      </div>
      <div className="text-sm font-semibold text-foreground leading-relaxed">
        <MathText content={twinQuestion.question_text} />
      </div>
      <div className="space-y-2">
        {Object.entries(twinQuestion.options || {}).map(([key, val]: any) => (
          <button
            key={key}
            disabled={twinSubmitted}
            onClick={() => onSelect(key)}
            className={`w-full p-3 text-left rounded-xl border text-xs font-medium flex items-center gap-2 transition-colors ${
              twinSubmitted
                ? key === twinQuestion.correct_answer
                  ? "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold"
                  : twinSelected === key
                  ? "bg-rose-50 border-rose-300 text-rose-950"
                  : "bg-stone-50 border-stone-200 opacity-50"
                : twinSelected === key
                ? "bg-amber-50 border-amber-500 text-amber-900 ring-1 ring-amber-500"
                : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-stone-200 flex items-center justify-center font-bold text-[10px]">
              {key}
            </span>
            <MathText content={val} />
          </button>
        ))}
      </div>

      {twinSubmitted ? (
        <div className="space-y-3 pt-2">
          <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
            isCorrect ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-rose-50 border-rose-200 text-rose-900"
          }`}>
            <p className="font-bold mb-1">
              {isCorrect ? "Chúc mừng! Bạn đã gỡ điểm thành công (+1 Giọt nước)" : "Chưa chính xác, hãy đọc giải thích nhé:"}
            </p>
            <p>{twinQuestion.micro_explanation}</p>
          </div>
          <Button onClick={onBack} className="w-full">
            Quay lại kết quả bài làm
          </Button>
        </div>
      ) : (
        <Button onClick={onSubmit} disabled={!twinSelected} className="w-full">
          Kiểm tra câu sinh đôi
        </Button>
      )}
    </div>
  );
}
