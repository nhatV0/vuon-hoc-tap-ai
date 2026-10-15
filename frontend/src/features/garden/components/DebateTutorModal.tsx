import React, { useState, useEffect } from "react";
import { MessageSquareText } from "lucide-react";
import { API_BASE, authFetch } from "@/shared/api/auth-client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import DebateTopicSelector, { SyllabusChapter } from "./DebateTopicSelector";
import DebateChatView, { DebateMessage } from "./DebateChatView";

const SUBJECTS = [
  "Toán học", "Vật lí", "Hóa học", "Sinh học", "Tin học",
  "Ngữ văn", "Tiếng Anh", "Lịch sử", "Địa lí", "GDKT & PL"
];

interface Props {
  studentId: string;
  subject?: string;
  onClose: () => void;
}

export default function DebateTutorModal({ studentId, subject = "Toán học", onClose }: Props) {
  const [currentSubject, setCurrentSubject] = useState(subject);
  const [chapters, setChapters] = useState<SyllabusChapter[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [step, setStep] = useState<"select_topic" | "chat">("select_topic");
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSyllabus(currentSubject);
  }, [currentSubject]);

  const fetchSyllabus = async (sub: string) => {
    try {
      const res = await authFetch(`${API_BASE}/api/socratic/syllabus?subject=${encodeURIComponent(sub)}`);
      const data = await res.json();
      if (res.ok && data.syllabus && data.syllabus[sub]) {
        setChapters(data.syllabus[sub]);
        setSelectedIds(data.syllabus[sub].slice(0, 2).map((c: SyllabusChapter) => c.id));
      }
    } catch {
      // Fallback
    }
  };

  const handleStartDebate = async () => {
    if (selectedIds.length === 0) return;
    setLoading(true);
    setStep("chat");
    const chosenTitles = chapters.filter((c) => selectedIds.includes(c.id)).map((c) => c.title);

    try {
      const res = await authFetch(`${API_BASE}/api/socratic/debate/generate-question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          subject: currentSubject,
          selected_chapters: chosenTitles
        })
      });
      const data = await res.json();
      const q = data.question || "Theo bạn, phát biểu nào sau đây là hoàn toàn chuẩn xác?";
      setCurrentQuestion(q);
      setMessages([
        {
          id: `q_${Date.now()}`,
          role: "assistant",
          content: `**Câu hỏi Tranh Luận nhanh môn ${currentSubject}:**\n\n${q}\n\n*Gợi ý góc nhìn:* ${data.counter_argument || "Hãy phân tích dựa trên bản chất định nghĩa."}`
        }
      ]);
    } catch {
      setMessages([
        {
          id: `q_${Date.now()}`,
          role: "assistant",
          content: "Không thể kết nối đến máy chủ để tạo câu hỏi. Hãy thử lại nhé!"
        }
      ]);
    }
    setLoading(false);
  };

  const handleSendAnswer = async () => {
    if (!input.trim() || loading) return;
    const studentAns = input.trim();
    setInput("");
    const userMsgId = `u_${Date.now()}`;
    const chosenTitles = chapters.filter((c) => selectedIds.includes(c.id)).map((c) => c.title);

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: "user", content: studentAns }
    ]);
    setLoading(true);

    try {
      const res = await authFetch(`${API_BASE}/api/socratic/debate/evaluate-answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          subject: currentSubject,
          selected_chapters: chosenTitles,
          question: currentQuestion,
          student_answer: studentAns
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: `a_${Date.now()}`,
            role: "assistant",
            content: data.feedback,
            verdict: data.verdict,
            feedback: data.feedback,
            debatePoint: data.debate_point
          }
        ]);
        if (data.next_challenge) {
          setCurrentQuestion(data.next_challenge);
          setMessages((prev) => [
            ...prev,
            {
              id: `q_next_${Date.now()}`,
              role: "assistant",
              content: `**Thử thách tranh luận tiếp theo:**\n\n${data.next_challenge}`
            }
          ]);
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: "assistant",
          content: "Gặp sự cố khi kiểm tra câu trả lời. Vui lòng gửi lại nhé!"
        }
      ]);
    }
    setLoading(false);
  };

  const selectedTitlesText = chapters
    .filter((c) => selectedIds.includes(c.id))
    .map((c) => c.title)
    .join(", ");

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl flex flex-col h-[700px] p-6">
        <DialogHeader className="pb-3 border-b border-border">
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            <MessageSquareText className="w-5 h-5 text-amber-500" />
            <span>Gia Sư Tranh Luận Phản Biện ({currentSubject})</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden pt-2">
          {step === "select_topic" ? (
            <DebateTopicSelector
              subjects={SUBJECTS}
              currentSubject={currentSubject}
              onSelectSubject={setCurrentSubject}
              chapters={chapters}
              selectedChapterIds={selectedIds}
              onToggleChapter={(id) => {
                setSelectedIds((prev) =>
                  prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
                );
              }}
              onSelectAll={() => setSelectedIds(chapters.map((c) => c.id))}
              onClearAll={() => setSelectedIds([])}
              onStartDebate={handleStartDebate}
              loading={loading}
            />
          ) : (
            <DebateChatView
              messages={messages}
              input={input}
              setInput={setInput}
              loading={loading}
              onSend={handleSendAnswer}
              onNewQuestion={handleStartDebate}
              onBackToTopics={() => setStep("select_topic")}
              selectedTopicsText={selectedTitlesText || currentSubject}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
