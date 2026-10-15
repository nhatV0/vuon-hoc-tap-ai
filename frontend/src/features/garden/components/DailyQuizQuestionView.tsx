import React from "react";
import MathText from "@/shared/components/MathText";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";

interface Question {
  id: string;
  subject: string;
  bloom_level?: string;
  source?: string;
  question_text: string;
  options: Record<string, string>;
  micro_explanation?: string;
  growth_mindset_tip?: string;
}

interface Props {
  questions: Question[];
  currentIndex: number;
  selectedAnswers: Record<string, string>;
  onSelectAnswer: (qId: string, optKey: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export default function DailyQuizQuestionView({
  questions,
  currentIndex,
  selectedAnswers,
  onSelectAnswer,
  onPrev,
  onNext,
  onSubmit,
  isSubmitting
}: Props) {
  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-stone-100 pb-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-800 border-amber-200">
            {currentQ.subject}
          </Badge>
          {currentQ.bloom_level && (
            <span className="text-[11px] text-stone-500 font-medium">{currentQ.bloom_level}</span>
          )}
        </div>
        <span className="font-semibold text-stone-700">
          Câu {currentIndex + 1} / {questions.length}
        </span>
      </div>

      <div className="text-sm font-semibold text-foreground leading-relaxed bg-white p-3.5 rounded-2xl border border-stone-200/70 shadow-xs">
        <MathText content={currentQ.question_text} />
      </div>

      <div className="space-y-2">
        {Object.entries(currentQ.options || {}).map(([key, val]) => {
          const isSelected = selectedAnswers[currentQ.id] === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectAnswer(currentQ.id, key)}
              className={`w-full p-3 text-left rounded-xl border text-xs font-medium flex items-center gap-2.5 transition-all ${
                isSelected
                  ? "bg-amber-50/90 border-amber-500 text-amber-950 ring-1 ring-amber-500 shadow-xs"
                  : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 transition-colors ${
                  isSelected ? "bg-amber-500 text-white" : "bg-stone-100 text-stone-600"
                }`}
              >
                {key}
              </span>
              <div className="leading-snug">
                <MathText content={val} />
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-stone-100">
        <Button
          variant="ghost"
          size="sm"
          disabled={currentIndex === 0 || isSubmitting}
          onClick={onPrev}
        >
          Câu trước
        </Button>
        {currentIndex < questions.length - 1 ? (
          <Button
            size="sm"
            onClick={onNext}
            disabled={!selectedAnswers[currentQ.id]}
          >
            Câu tiếp
          </Button>
        ) : (
          <Button
            variant="accent"
            size="sm"
            disabled={!selectedAnswers[currentQ.id] || isSubmitting}
            onClick={onSubmit}
          >
            {isSubmitting ? "Đang nộp..." : "Nộp bài"}
          </Button>
        )}
      </div>
    </div>
  );
}
