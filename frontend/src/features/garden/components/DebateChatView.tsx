import React from "react";
import { Send, Loader2, Sparkles, User, CheckCircle2, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import MathText from "@/shared/components/MathText";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";

export interface DebateMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  verdict?: "chính_xác" | "chưa_chính_xác" | "bán_phần";
  feedback?: string;
  debatePoint?: string;
}

interface Props {
  messages: DebateMessage[];
  input: string;
  setInput: (val: string) => void;
  loading: boolean;
  onSend: () => void;
  onNewQuestion: () => void;
  onBackToTopics: () => void;
  selectedTopicsText: string;
}

export default function DebateChatView({
  messages,
  input,
  setInput,
  loading,
  onSend,
  onNewQuestion,
  onBackToTopics,
  selectedTopicsText
}: Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <Badge variant="outline" className="text-[10px] px-2 py-0.5 truncate max-w-[280px]">
            {selectedTopicsText}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onNewQuestion}
            disabled={loading}
            className="h-7 text-xs px-2 gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Đổi câu hỏi</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBackToTopics}
            className="h-7 text-xs px-2.5 rounded-lg"
          >
            Chọn lại chủ đề
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3.5 py-2 pr-1">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col gap-1.5 ${m.role === "user" ? "items-end" : "items-start"}`}
          >
            <div className={`flex gap-2.5 max-w-[90%] ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              {m.role === "assistant" ? (
                <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <Card
                  className={`p-3.5 text-xs leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground border-transparent"
                      : "bg-muted/60 text-foreground border-border"
                  }`}
                >
                  <MathText content={m.content} />
                </Card>

                {m.verdict && (
                  <Card className="p-3 border text-xs space-y-2 bg-card rounded-xl">
                    <div className="flex items-center gap-2 font-semibold">
                      {m.verdict === "chính_xác" ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="text-emerald-700">Đánh giá: Chính xác</span>
                        </>
                      ) : m.verdict === "chưa_chính_xác" ? (
                        <>
                          <XCircle className="w-4 h-4 text-rose-600" />
                          <span className="text-rose-700">Đánh giá: Chưa chính xác</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          <span className="text-amber-700">Đánh giá: Bán phần</span>
                        </>
                      )}
                    </div>
                    {m.feedback && (
                      <p className="text-muted-foreground text-[11px] leading-relaxed">
                        {m.feedback}
                      </p>
                    )}
                    {m.debatePoint && (
                      <div className="p-2 rounded-lg bg-muted/70 text-[11px] text-foreground border-l-2 border-primary">
                        <span className="font-semibold">Điểm phản biện AI:</span> {m.debatePoint}
                      </div>
                    )}
                  </Card>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground italic pl-9">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>AI đang kiểm tra câu trả lời và chuẩn bị lập luận tranh luận...</span>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
        className="pt-2 flex gap-2 border-t border-border mt-auto"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập câu trả lời hoặc luận điểm phản biện của bạn..."
          className="flex-1 text-xs"
        />
        <Button type="submit" disabled={loading || !input.trim()} className="gap-1.5 text-xs">
          <Send className="w-3.5 h-3.5" />
          <span>Gửi</span>
        </Button>
      </form>
    </div>
  );
}
