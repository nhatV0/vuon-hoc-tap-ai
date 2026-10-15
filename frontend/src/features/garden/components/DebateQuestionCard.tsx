import React from "react";
import { Send, MessageSquareQuote } from "lucide-react";
import MathText from "@/shared/components/MathText";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";

interface Props {
  questionIndex: number;
  totalQuestions: number;
  question: string;
  input: string;
  setInput: (val: string) => void;
  onSubmitAnswer: () => void;
  loading: boolean;
  topicHint?: string;
}

export default function DebateQuestionCard({
  questionIndex,
  totalQuestions,
  question,
  input,
  setInput,
  onSubmitAnswer,
  loading,
  topicHint
}: Props) {
  return (
    <div className="space-y-4 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-xs px-2.5 py-0.5 font-semibold text-primary">
          Câu tự luận phản biện {questionIndex}/{totalQuestions}
        </Badge>
        {topicHint && (
          <span className="text-[11px] text-muted-foreground truncate max-w-[280px]">
            {topicHint}
          </span>
        )}
      </div>

      <Card className="p-4 bg-muted/30 border-border text-xs leading-relaxed font-medium">
        <div className="flex items-start gap-2.5">
          <MessageSquareQuote className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div className="flex-1">
            <MathText content={question} />
          </div>
        </div>
      </Card>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmitAnswer();
        }}
        className="space-y-3 pt-2 border-t border-border mt-auto"
      >
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Câu trả lời tự luận ngắn của bạn:
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Gõ ngắn gọn lập luận, nguyên nhân hoặc câu trả lời phản biện của bạn..."
            disabled={loading}
            rows={3}
            className="w-full text-xs p-3 rounded-xl border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-primary/20 leading-relaxed resize-none"
            autoFocus
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            Nhấn Gửi để AI kiểm tra đúng/sai và phân tích luận điểm.
          </span>
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            className="h-9 px-4 text-xs gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Gửi câu trả lời</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
