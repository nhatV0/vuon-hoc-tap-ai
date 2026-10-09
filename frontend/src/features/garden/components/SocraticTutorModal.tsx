import React, { useState } from "react";
import { Send, Loader2, Sparkles, User, Lightbulb } from "lucide-react";
import { API_BASE } from "@/shared/api/auth-client";
import MathText from "@/shared/components/MathText";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";

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
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Chào bạn! Mình là Trợ Lý Hoa Hướng Dương. Bạn đang gặp bài toán hay khúc mắc nào ở môn ${subject}? Hãy gõ vào đây, mình sẽ đồng hành và khơi gợi từng bước để bạn tự chinh phục nhé!`
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
      const res = await fetch(`${API_BASE}/api/socratic/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          subject,
          message: userMsg.content,
          history: nextHistory.map((m) => ({ role: m.role, content: m.content }))
        })
      });
      const data = await res.json();
      if (res.ok && data.response) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
      }
    } catch {}
    setLoading(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg flex flex-col h-[600px] p-6">
        <DialogHeader className="pb-2 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-sm">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <span>Gia Sư Khơi Gợi Socratic</span>
            </DialogTitle>
            <Badge variant="default">{subject}</Badge>
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
              <span>Trợ lý đang suy nghĩ câu hỏi gợi mở...</span>
            </div>
          )}
        </div>

        <div className="pt-2 flex gap-2 border-t border-border">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Mô tả khúc mắc hoặc câu trả lời của bạn..."
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={loading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
