import React from "react";
import { CheckCircle2, XCircle, AlertCircle, ArrowRight, MessageSquare, BookOpen } from "lucide-react";
import MathText from "@/shared/components/MathText";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";

export interface EvaluationData {
  is_correct: boolean;
  verdict: "chính_xác" | "chưa_chính_xác" | "bán_phần";
  sample_answer: string;
  explanation: string;
  feedback: string;
  debate_rebuttal: string;
}

interface Props {
  questionText?: string;
  studentAnswer: string;
  evaluation: EvaluationData;
  questionIndex: number;
  totalQuestions: number;
  onNextQuestion: () => void;
  loading: boolean;
}
export default function DebateAnswerFeedback({
  questionText,
  studentAnswer,
  evaluation,
  questionIndex,
  totalQuestions,
  onNextQuestion,
  loading
}: Props) {
  const verdict = evaluation.verdict;

  return (
    <div className="space-y-4 pb-4 animate-in fade-in-50 duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {verdict === "chính_xác" ? (
            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1 px-3 py-1 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Ghi nhận: CHÍNH XÁC</span>
            </Badge>
          ) : verdict === "bán_phần" ? (
            <Badge className="bg-amber-500 hover:bg-amber-600 text-white gap-1 px-3 py-1 text-xs">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Ghi nhận: ĐÚNG MỘT PHẦN</span>
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1 px-3 py-1 text-xs">
              <XCircle className="w-3.5 h-3.5" />
              <span>Ghi nhận: CHƯA CHÍNH XÁC</span>
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground font-medium">
          Câu {questionIndex}/{totalQuestions}
        </span>
      </div>

      {questionText && (
        <Card className="p-3 bg-muted/40 border-border text-xs leading-relaxed font-medium">
          <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
            Câu hỏi:
          </span>
          <MathText content={questionText} />
        </Card>
      )}
      <Card className="p-3 bg-muted/20 border-border text-xs space-y-1 rounded-xl">
        <span className="text-[11px] text-muted-foreground block">Câu trả lời của bạn:</span>
        <div className="font-medium text-foreground leading-relaxed pl-1">
          <MathText content={studentAnswer} />
        </div>
      </Card>

      <Card className="p-4 border text-xs space-y-3 bg-card rounded-xl">
        <div>
          <h4 className="font-semibold text-foreground flex items-center gap-1.5 mb-1 text-xs">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span>Phân tích đúng/sai & Giải thích:</span>
          </h4>
          <div className="text-muted-foreground leading-relaxed pl-5">
            <MathText content={evaluation.explanation} />
          </div>
        </div>

        {evaluation.sample_answer && (
          <div className="border-t border-border pt-2.5">
            <h5 className="font-semibold text-foreground flex items-center gap-1.5 mb-1 text-[11px]">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ý chính / Đáp án chuẩn:</span>
            </h5>
            <div className="text-stone-700 leading-relaxed pl-5 text-[11px]">
              <MathText content={evaluation.sample_answer} />
            </div>
          </div>
        )}
      </Card>

      <div className="pt-3 pb-2 sticky bottom-0 bg-card/95 backdrop-blur-xs flex justify-end border-t border-border/40">
        <Button
          type="button"
          onClick={onNextQuestion}
          disabled={loading}
          className="gap-2 text-xs h-10 px-6 rounded-xl font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
        >
          <span>
            {questionIndex >= totalQuestions ? "Xem tổng kết 10 câu" : "Chuyển câu tiếp theo"}
          </span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
