import React, { useState } from "react";
import { Send, Loader2, Sparkles, User, Lightbulb, BookOpen } from "lucide-react";
import { API_BASE, authFetch } from "@/shared/api/auth-client";
import MathText from "@/shared/components/MathText";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card } from "@/shared/components/ui/card";

const SUBJECTS = ["Toán học", "Vật lí", "Hóa học", "Sinh học", "Tin học", "Ngữ văn", "Tiếng Anh"];

interface Props {
  studentId: string;
  subject?: string;
  onClose: () => void;
}

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export default function SocraticTutorModal({ studentId, subject = "Toán học", onClose }: Props) {
  const [currentSubject, setCurrentSubject] = useState(subject);
  const [mode, setMode] = useState<"socratic" | "solver">("socratic");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Chào bạn! Mình là Trợ Lý Hoa Hướng Dương môn ${subject}. Bạn đang gặp bài toán hay khúc mắc nào? Hãy gõ vào đây để mình đồng hành nhé!`
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput("");
    setLoading(true);

    try {
      const res = await authFetch(`${API_BASE}/api/socratic/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          subject: currentSubject,
          mode,
          message: userMsg.content,
          history: nextHistory.map((m) => ({ role: m.role, content: m.content }))
        })
      });
      const data = await res.json();
      if (res.ok && data.response) {
        const fullReply = data.question_prompt && mode === "socratic"
          ? `${data.response}\n\n*${data.question_prompt}*`
          : data.response;
        setMessages((prev) => [...prev, { role: "assistant", content: fullReply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.detail || "Trợ lý đang gặp chút gián đoạn mạng. Hãy thử gửi lại nhé!"
          }
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng!"
        }
      ]);
    }
    setLoading(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl flex flex-col h-[680px] p-6">
        <DialogHeader className="pb-2 border-b border-border">
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
              {mode === "solver" ? (
                <BookOpen className="w-5 h-5 text-indigo-500" />
              ) : (
                <Lightbulb className="w-5 h-5 text-amber-500" />
              )}
              <span>{mode === "solver" ? "Giải Chi Tiết" : "Gợi Mở Socratic"}</span>
            </DialogTitle>
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              <select
                value={currentSubject}
                onChange={(e) => {
                  const newSub = e.target.value;
                  setCurrentSubject(newSub);
                  setMessages([
                    {
                      role: "assistant",
                      content: `Đã đổi sang môn ${newSub}! Bạn có câu hỏi hay bài tập nào về môn ${newSub} không?`
                    }
                  ]);
                }}
                className="h-7 text-xs px-2 py-0.5 rounded-lg border border-border bg-background text-foreground font-medium cursor-pointer"
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <Button
                type="button"
                variant={mode === "socratic" ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs px-2.5 rounded-lg"
                onClick={() => setMode("socratic")}
              >
                Gợi mở
              </Button>
              <Button
                type="button"
                variant={mode === "solver" ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs px-2.5 rounded-lg"
                onClick={() => setMode("solver")}
              >
                Giải bài
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-1">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 mt-1">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}
              <Card
                className={`max-w-[85%] p-3.5 text-xs leading-relaxed ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground border-transparent"
                    : "bg-muted/60 text-foreground border-border"
                }`}
              >
                <MathText content={m.content} />
              </Card>
              {m.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground italic pl-9">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>
                {mode === "solver"
                  ? "Trợ lý đang phân tích đề và lập lời giải..."
                  : "Trợ lý đang suy nghĩ câu hỏi gợi mở..."}
              </span>
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="pt-2 flex gap-2 border-t border-border"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Mô tả khúc mắc hoặc câu trả lời của bạn..."
            className="flex-1"
          />
          <Button type="submit" disabled={loading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
