import React from "react";
import { CheckCircle2, XCircle, ArrowRight, MessageSquare } from "lucide-react";
import MathText from "@/shared/components/MathText";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";

export interface EvaluationData {
  is_correct: boolean;
  verdict: "chính_xác" | "chưa_chính_xác";
  correct_option: string;
  explanation: string;
  feedback: string;
  debate_rebuttal: string;
}

interface Props {
  studentAnswer: string;
  evaluation: EvaluationData;
  questionIndex: number;
  totalQuestions: number;
  onNextQuestion: () => void;
  loading: boolean;
}

export default function DebateAnswerFeedback({
  studentAnswer,
  evaluation,
  questionIndex,
  totalQuestions,
  onNextQuestion,
  loading
}: Props) {
  const isCorrect = evaluation.is_correct;

  return (
    <div className="space-y-4 animate-in fade-in-50 duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isCorrect ? (
            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1 px-3 py-1 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Ghi nhận: CHÍNH XÁC</span>
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1 px-3 py-1 text-xs">
              <XCircle className="w-3.5 h-3.5" />
              <span>Ghi nhận: CHƯA CHÍNH XÁC</span>
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground font-medium">
          Đáp án chuẩn: <strong className="text-foreground">{evaluation.correct_option}</strong>
        </span>
      </div>

      <Card className="p-3.5 bg-muted/20 border-border text-xs space-y-2 rounded-xl">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Câu trả lời của bạn:</span>
          <span className="font-semibold text-foreground px-2 py-0.5 rounded bg-muted">
            {studentAnswer}
          </span>
        </div>
      </Card>

      <Card className="p-4 border text-xs space-y-3 bg-card rounded-xl">
        <div>
          <h4 className="font-semibold text-foreground flex items-center gap-1.5 mb-1 text-xs">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span>Giải thích khoa học & Phản biện:</span>
          </h4>
          <div className="text-muted-foreground leading-relaxed pl-5">
            <MathText content={evaluation.explanation} />
          </div>
        </div>

        {evaluation.feedback && (
          <p className="text-[11px] text-stone-600 italic border-t border-border pt-2 pl-5">
            {evaluation.feedback}
          </p>
        )}
      </Card>

      <div className="pt-2 flex justify-end">
        <Button
          type="button"
          onClick={onNextQuestion}
          disabled={loading}
          className="gap-2 text-xs h-9 px-5 rounded-xl"
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
