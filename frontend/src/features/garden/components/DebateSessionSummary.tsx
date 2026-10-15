import React from "react";
import { Trophy, CheckCircle2, XCircle, AlertCircle, RotateCcw, BookOpen } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";

export interface QuestionHistoryItem {
  questionNumber: number;
  question: string;
  studentAnswer: string;
  verdict: "chính_xác" | "chưa_chính_xác" | "bán_phần";
  isCorrect: boolean;
  explanation: string;
}

interface Props {
  subject: string;
  selectedTopicsText: string;
  history: QuestionHistoryItem[];
  onRestart: () => void;
  onSelectNewTopics: () => void;
}

export default function DebateSessionSummary({
  subject,
  selectedTopicsText,
  history,
  onRestart,
  onSelectNewTopics
}: Props) {
  const correctCount = history.filter((h) => h.isCorrect).length;
  const total = history.length;
  const scorePercent = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="text-center p-4 bg-muted/30 rounded-2xl border border-border space-y-2">
        <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
          <Trophy className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-bold text-foreground">
          Hoàn Thành Đợt Phản Biện Tự Luận 10 Câu ({subject})
        </h3>
        <p className="text-[11px] text-muted-foreground truncate max-w-md mx-auto">
          Chủ đề: {selectedTopicsText}
        </p>
        <div className="flex items-center justify-center gap-3 pt-1">
          <Badge variant="outline" className="text-xs px-3 py-1 font-bold">
            Kết quả: {correctCount}/{total} Đạt ({scorePercent}%)
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[300px]">
        {history.map((item) => (
          <Card key={item.questionNumber} className="p-3 border text-xs space-y-1.5 rounded-xl">
            <div className="flex items-start justify-between gap-2">
              <span className="font-semibold text-foreground">
                Câu {item.questionNumber}: {item.question.slice(0, 90)}...
              </span>
              {item.verdict === "chính_xác" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              ) : item.verdict === "bán_phần" ? (
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              )}
            </div>
            <div className="text-[11px] text-muted-foreground">
              <span>Đã trả lời: <strong className="text-foreground">{item.studentAnswer}</strong></span>
            </div>
          </Card>
        ))}
      </div>

      <div className="pt-2 border-t border-border flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onSelectNewTopics}
          className="gap-1.5 text-xs h-9 rounded-xl"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Chọn chủ đề khác</span>
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={onRestart}
          className="gap-1.5 text-xs h-9 rounded-xl"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Làm tiếp 10 câu mới</span>
        </Button>
      </div>
    </div>
  );
}
