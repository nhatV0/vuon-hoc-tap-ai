import React, { useState } from "react";
import MathText from "@/shared/components/MathText";
import { Badge } from "@/shared/components/ui/badge";
import { ChevronDown, ChevronUp, MessageSquareText, Lightbulb, CheckCircle2, Flag } from "lucide-react";
import QuestionReportModal from "./QuestionReportModal";

export interface EssayQuestionItem {
  id: string;
  subject: string;
  topic_hint: string;
  question_text: string;
  sample_answer: string;
  key_points: string[];
}

interface Props {
  question: EssayQuestionItem;
  index: number;
}

export default function EssayDebateListItem({ question, index }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs hover:border-amber-300 transition-all space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-xs text-stone-900">#{index + 1}</span>
          <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-800 border-amber-200 font-semibold">
            Tự luận phản biện
          </Badge>
          <Badge variant="outline" className="text-[10px] bg-stone-50 text-stone-600 border-stone-200">
            {question.topic_hint}
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
            <span>{expanded ? "Thu gọn đáp án mẫu" : "Xem đáp án mẫu & luận điểm"}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div className="text-xs font-semibold text-stone-900 leading-relaxed flex items-start gap-2">
        <MessageSquareText className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <MathText content={question.question_text} />
      </div>

      {expanded && (
        <div className="pt-2 border-t border-dashed border-stone-200 space-y-3 animate-in fade-in duration-200">
          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-1.5 text-xs">
            <div className="font-bold text-emerald-950 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Đáp án mẫu chuẩn định hướng sư phạm:</span>
            </div>
            <div className="text-emerald-900 leading-relaxed text-[11px]">
              <MathText content={question.sample_answer} />
            </div>
          </div>

          {question.key_points && question.key_points.length > 0 && (
            <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl space-y-1.5 text-xs">
              <div className="font-bold text-amber-950 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                <span>Các luận cứ & từ khóa cốt lõi cần nêu:</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-[11px] text-amber-900">
                {question.key_points.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {reportOpen && (
        <QuestionReportModal
          questionId={question.id}
          questionType="essay"
          subject={question.subject}
          questionText={question.question_text}
          isOpen={reportOpen}
          onClose={() => setReportOpen(false)}
        />
      )}
    </div>
  );
}
