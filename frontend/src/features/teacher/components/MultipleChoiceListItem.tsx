import React, { useState } from "react";
import MathText from "@/shared/components/MathText";
import { Badge } from "@/shared/components/ui/badge";
import { ChevronDown, ChevronUp, CheckCircle2, HelpCircle, Flag } from "lucide-react";
import { QuestionItem } from "./TeacherQuestionCard";
import QuestionReportModal from "./QuestionReportModal";
interface Props {
  question: QuestionItem;
  index: number;
}

export default function MultipleChoiceListItem({ question, index }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs hover:border-amber-300 transition-all space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-xs text-stone-900">#{index + 1}</span>
          <Badge variant="outline" className="text-[10px] bg-stone-50 text-stone-600 border-stone-200">
            {question.id}
          </Badge>
          <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-800 border-amber-200 font-semibold">
            {question.bloom_level}
          </Badge>
          <Badge variant="outline" className="text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200">
            {question.subject}
          </Badge>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            className="flex items-center gap-1 text-[11px] font-medium text-stone-500 hover:text-rose-600 bg-stone-50 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors border border-stone-200"
            title="Báo cáo câu hỏi bị lỗi hoặc trừu tượng"
          >
            <Flag className="w-3 h-3 text-rose-500" />
            <span>Báo lỗi</span>
          </button>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100/80 px-2.5 py-1 rounded-lg transition-colors border border-amber-200/60"
          >
            <span>{expanded ? "Thu gọn đáp án" : "Xem đáp án & giải thích"}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div className="text-xs font-medium text-stone-900 leading-relaxed">
        <MathText content={question.question_text} />
      </div>

      {expanded && (
        <div className="pt-2 border-t border-dashed border-stone-200 space-y-3 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(question.options || {}).map(([key, text]) => {
              const isCorrect = key === question.correct_answer;
              return (
                <div
                  key={key}
                  className={`p-2.5 rounded-xl text-[11px] flex items-start gap-2 border transition-colors ${
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
        </div>
      )}

      {reportOpen && (
        <QuestionReportModal
          questionId={question.id}
          questionType="mcq"
          subject={question.subject}
          questionText={question.question_text}
          isOpen={reportOpen}
          onClose={() => setReportOpen(false)}
        />
      )}
    </div>
  );
}
