import React from "react";
import MathText from "@/shared/components/MathText";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { CheckCircle2, XCircle, ArrowRight, HelpCircle, Lightbulb } from "lucide-react";

export interface SingleQuizQuestion {
  id: string;
  block?: string;
  subject: string;
  bloom_level?: string;
  source?: string;
  question_text: string;
  options: Record<string, string>;
  correct_answer: string;
  micro_explanation?: string;
  growth_mindset_tip?: string;
}

interface Props {
  question: SingleQuizQuestion;
  selectedOption: string | null;
  onSelectOption: (key: string) => void;
  showExplanation: boolean;
  onNextQuestion: () => void;
  onChangeSubject?: () => void;
  questionNumber: number;
}

export default function SingleQuestionPracticeView({
  question,
  selectedOption,
  onSelectOption,
  showExplanation,
  onNextQuestion,
  onChangeSubject,
  questionNumber
}: Props) {
  const isCorrect = selectedOption === question.correct_answer;

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between text-xs border-b border-stone-100 pb-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-800 border-amber-200 font-bold">
            {question.subject}
          </Badge>
          {question.bloom_level && (
            <span className="text-[11px] text-stone-500 font-medium">{question.bloom_level}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onChangeSubject && (
            <button
              type="button"
              onClick={onChangeSubject}
              className="text-[11px] font-medium text-amber-700 hover:underline"
            >
              Đổi môn
            </button>
          )}
          <span className="font-semibold text-stone-600">Câu #{questionNumber}</span>
        </div>
      </div>

      <div className="text-sm font-semibold text-foreground leading-relaxed bg-white p-4 rounded-2xl border border-stone-200/70 shadow-xs">
        <MathText content={question.question_text} />
      </div>

      <div className="space-y-2">
        {Object.entries(question.options || {}).map(([key, val]) => {
          const isThisSelected = selectedOption === key;
          const isThisRightAnswer = key === question.correct_answer;

          let btnClass = "bg-white border-stone-200 text-stone-700 hover:bg-stone-50";
          let badgeClass = "bg-stone-100 text-stone-600";

          if (showExplanation) {
            if (isThisRightAnswer) {
              btnClass = "bg-emerald-50/90 border-emerald-400 text-emerald-950 font-bold ring-1 ring-emerald-500 shadow-xs";
              badgeClass = "bg-emerald-600 text-white";
            } else if (isThisSelected) {
              btnClass = "bg-rose-50/90 border-rose-400 text-rose-950 font-bold ring-1 ring-rose-500 shadow-xs";
              badgeClass = "bg-rose-600 text-white";
            } else {
              btnClass = "bg-stone-50/40 border-stone-100 text-stone-400 opacity-60";
            }
          } else if (isThisSelected) {
            btnClass = "bg-amber-50 border-amber-500 text-amber-950 ring-1 ring-amber-500 shadow-xs";
            badgeClass = "bg-amber-500 text-white";
          }

          return (
            <button
              key={key}
              type="button"
              disabled={showExplanation}
              onClick={() => onSelectOption(key)}
              className={`w-full p-3 text-left rounded-xl border text-xs font-medium flex items-center justify-between gap-2.5 transition-all ${btnClass}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${badgeClass}`}>
                  {key}
                </span>
                <div className="leading-snug">
                  <MathText content={val} />
                </div>
              </div>
              {showExplanation && isThisRightAnswer && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              {showExplanation && isThisSelected && !isThisRightAnswer && (
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {showExplanation && (
        <div className="space-y-3 pt-2 animate-in fade-in duration-300">
          <div className={`p-3.5 rounded-2xl border text-xs space-y-2 ${isCorrect ? "bg-emerald-50/60 border-emerald-200" : "bg-rose-50/60 border-rose-200"}`}>
            <div className="flex items-center gap-1.5 font-bold">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-900">Chính xác! Bạn đã chọn đáp án {question.correct_answer}</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span className="text-rose-900">Chưa chính xác! Đáp án đúng là {question.correct_answer}</span>
                </>
              )}
            </div>

            {question.micro_explanation && (
              <div className="pt-1.5 border-t border-stone-200/50 space-y-1">
                <div className="font-semibold text-stone-800 flex items-center gap-1 text-[11px]">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Giải thích bản chất tại sao Đúng/Sai:</span>
                </div>
                <div className="text-stone-700 leading-relaxed pl-4 text-[11px]">
                  <MathText content={question.micro_explanation} />
                </div>
              </div>
            )}

            {question.growth_mindset_tip && (
              <div className="pt-1 text-[11px] text-emerald-800 flex items-start gap-1">
                <Lightbulb className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                <span>{question.growth_mindset_tip}</span>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-1">
            <Button
              type="button"
              onClick={onNextQuestion}
              className="gap-1.5 text-xs h-9 px-5 rounded-xl font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
            >
              <span>Làm câu tiếp theo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
