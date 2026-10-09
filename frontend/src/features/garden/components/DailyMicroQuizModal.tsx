import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { API_BASE } from "@/shared/api/auth-client";
import MathText from "@/shared/components/MathText";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import TwinChallengeView from "./TwinChallengeView";
import QuizResultView from "./QuizResultView";

interface Question {
  id: string;
  question_text: string;
  options: Record<string, string>;
  correct_answer?: string;
  micro_explanation?: string;
}

interface Props {
  studentId: string;
  onClose: () => void;
  onTwinSuccess?: () => void;
}

export default function DailyMicroQuizModal({ studentId, onClose, onTwinSuccess }: Props) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [twinQuestion, setTwinQuestion] = useState<any>(null);
  const [twinSelected, setTwinSelected] = useState<string | null>(null);
  const [twinSubmitted, setTwinSubmitted] = useState(false);
  const [twinLoading, setTwinLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/quiz/daily/${studentId}`)
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data.questions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [studentId]);

  const handleSelect = (qId: string, optKey: string) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optKey }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        student_id: studentId,
        block: "A00",
        answers: Object.entries(selectedAnswers).map(([qId, ans]) => ({
          question_id: qId,
          selected_answer: ans
        }))
      };
      const res = await fetch(`${API_BASE}/api/quiz/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      setResult(await res.json());
      setSubmitted(true);
    } catch {}
    setLoading(false);
  };

  const handleGenerateTwin = async (detail: any) => {
    setTwinLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/quiz/twin-challenge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          question_id: detail.question_id,
          selected_wrong_answer: detail.selected_answer,
          subject: "Toán học"
        })
      });
      const data = await res.json();
      if (res.ok) {
        setTwinQuestion(data);
        setTwinSelected(null);
        setTwinSubmitted(false);
      }
    } catch {}
    setTwinLoading(false);
  };

  const handleTwinSubmit = async () => {
    if (!twinSelected || !twinQuestion) return;
    setTwinSubmitted(true);
    if (twinSelected === twinQuestion.correct_answer) {
      if (onTwinSuccess) onTwinSuccess();
      fetch(`${API_BASE}/api/garden/${studentId}/water`, { method: "POST" }).catch(() => {});
    }
  };

  const currentQ = questions[currentIndex];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xs font-bold text-muted-foreground uppercase flex items-center justify-between">
            <span>Trắc Nghiệm Vi Mô (3 Câu/Ngày)</span>
            {twinQuestion && <Badge variant="default">Thử thách sinh đôi gỡ điểm</Badge>}
          </DialogTitle>
        </DialogHeader>

        {loading || twinLoading ? (
          <div className="py-12 flex justify-center text-primary"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : twinQuestion ? (
          <TwinChallengeView
            twinQuestion={twinQuestion}
            twinSelected={twinSelected}
            twinSubmitted={twinSubmitted}
            onSelect={setTwinSelected}
            onSubmit={handleTwinSubmit}
            onBack={() => setTwinQuestion(null)}
          />
        ) : submitted && result ? (
          <QuizResultView result={result} onGenerateTwin={handleGenerateTwin} onClose={onClose} />
        ) : currentQ ? (
          <div className="space-y-4">
            <div className="text-xs text-muted-foreground">Câu {currentIndex + 1} / {questions.length}</div>
            <div className="text-sm font-semibold text-foreground"><MathText content={currentQ.question_text} /></div>
            <div className="space-y-2">
              {Object.entries(currentQ.options || {}).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => handleSelect(currentQ.id, key)}
                  className={`w-full p-3 text-left rounded-xl border text-xs font-medium flex items-center gap-2 transition-colors ${
                    selectedAnswers[currentQ.id] === key ? "bg-amber-50 border-amber-500 text-amber-900 ring-1 ring-amber-500" : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-stone-200 flex items-center justify-center font-bold text-[10px]">{key}</span>
                  <MathText content={val} />
                </button>
              ))}
            </div>
            <div className="flex justify-between items-center pt-2">
              <Button variant="ghost" size="sm" disabled={currentIndex === 0} onClick={() => setCurrentIndex((p) => p - 1)}>Câu trước</Button>
              {currentIndex < questions.length - 1 ? (
                <Button size="sm" onClick={() => setCurrentIndex((p) => p + 1)}>Câu tiếp</Button>
              ) : (
                <Button variant="accent" size="sm" onClick={handleSubmit}>Nộp bài</Button>
              )}
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-8">Không có câu hỏi cho hôm nay.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
