import React from "react";
import { Send, HelpCircle } from "lucide-react";
import MathText from "@/shared/components/MathText";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";

export interface DebateOption {
  key: string;
  text: string;
}

interface Props {
  questionIndex: number;
  totalQuestions: number;
  question: string;
  options: DebateOption[];
  input: string;
  setInput: (val: string) => void;
  onSelectOption: (key: string) => void;
  onSubmitAnswer: () => void;
  loading: boolean;
  topicHint?: string;
}

export default function DebateQuestionCard({
  questionIndex,
  totalQuestions,
  question,
  options,
  input,
  setInput,
  onSelectOption,
  onSubmitAnswer,
  loading,
  topicHint
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-xs px-2.5 py-0.5 font-semibold text-primary">
          Câu hỏi {questionIndex}/{totalQuestions}
        </Badge>
        {topicHint && (
          <span className="text-[11px] text-muted-foreground truncate max-w-[280px]">
            {topicHint}
          </span>
        )}
      </div>

      <Card className="p-4 bg-muted/30 border-border text-xs leading-relaxed font-medium">
        <MathText content={question} />
      </Card>

      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground px-1">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Nhìn các lựa chọn bên dưới và gõ nhanh (hoặc bấm chọn):</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {options.map((opt) => {
            const isSelected = input.trim().toUpperCase() === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                disabled={loading}
                onClick={() => onSelectOption(opt.key)}
                className={`p-3 text-left border rounded-xl transition-all cursor-pointer flex items-start gap-2.5 ${
                  isSelected
                    ? "border-primary bg-primary/10 ring-1 ring-primary"
                    : "border-border hover:border-primary/50 bg-card"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}
                >
                  {opt.key}
                </span>
                <div className="text-xs text-foreground leading-relaxed pt-0.5">
                  <MathText content={opt.text} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmitAnswer();
        }}
        className="flex gap-2 pt-2 border-t border-border"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Gõ nhanh A, B, C, D hoặc nhập luận điểm của bạn..."
          disabled={loading}
          className="flex-1 text-xs h-9"
          autoFocus
        />
        <Button
          type="submit"
          disabled={loading || !input.trim()}
          className="h-9 px-4 text-xs gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Gửi câu trả lời</span>
        </Button>
      </form>
    </div>
  );
}
