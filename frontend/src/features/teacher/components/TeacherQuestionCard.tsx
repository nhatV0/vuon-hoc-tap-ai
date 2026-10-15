import React from "react";
import MathText from "@/shared/components/MathText";
import { Badge } from "@/shared/components/ui/badge";
import { CheckCircle2, HelpCircle, Lightbulb } from "lucide-react";

export interface QuestionItem {
  id: string;
  block: string;
  subject: string;
  bloom_level: string;
  question_text: string;
  options: Record<string, string>;
  correct_answer: string;
  micro_explanation?: string;
  growth_mindset_tip?: string;
}

interface Props {
  question: QuestionItem;
  index: number;
}

export default function TeacherQuestionCard({ question, index }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs space-y-3 hover:border-amber-300 transition-all">
      <div className="flex items-center justify-between text-xs border-b border-stone-100 pb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-stone-800">#{index + 1}</span>
          <Badge variant="outline" className="text-[10px] bg-stone-50 text-stone-600 border-stone-200">
            {question.id}
          </Badge>
          <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-800 border-amber-200 font-semibold">
            {question.bloom_level}
          </Badge>
        </div>
        <span className="text-[11px] text-stone-400 font-medium">Khối {question.block}</span>
      </div>

      <div className="text-xs font-medium text-stone-900 leading-relaxed">
        <MathText content={question.question_text} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
        {Object.entries(question.options || {}).map(([key, text]) => {
          const isCorrect = key === question.correct_answer;
          return (
            <div
              key={key}
              className={`p-2 rounded-xl text-[11px] flex items-start gap-2 border transition-colors ${
                isCorrect
                  ? "bg-emerald-50/90 border-emerald-300 text-emerald-950 font-medium ring-1 ring-emerald-400/40"
                  : "bg-stone-50/60 border-stone-200 text-stone-700"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5 ${
                  isCorrect ? "bg-emerald-600 text-white" : "bg-stone-200 text-stone-600"
                }`}
              >
                {key}
              </span>
              <div className="leading-snug">
                <MathText content={text} />
              </div>
            </div>
          );
        })}
      </div>

      {question.micro_explanation && (
        <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-2.5 text-[11px] space-y-1">
          <div className="font-semibold text-amber-900 flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-amber-700" />
            <span>Giải thích vi mô sư phạm:</span>
          </div>
          <div className="text-amber-950 leading-relaxed">
            <MathText content={question.micro_explanation} />
          </div>
        </div>
      )}

      {question.growth_mindset_tip && (
        <div className="bg-emerald-50/50 border border-emerald-100/80 rounded-xl p-2 text-[11px] text-emerald-900 flex items-start gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
          <span className="italic">{question.growth_mindset_tip}</span>
        </div>
      )}
    </div>
  );
}
