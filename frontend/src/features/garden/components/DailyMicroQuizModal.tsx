import React, { useState, useEffect } from "react";
import { Award, Loader2 } from "lucide-react";
import { API_BASE } from "@/shared/api/auth-client";
import MathText from "@/shared/components/MathText";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";

interface Question {
  id: string;
  question_text: string;
  options: Record<string, string>;
  correct_answer?: string;
  micro_explanation?: string;
}

interface DailyMicroQuizModalProps {
  studentId: string;
  onClose: () => void;
}

export default function DailyMicroQuizModal({ studentId, onClose }: DailyMicroQuizModalProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      const data = await res.json();
      setResult(data);
      setSubmitted(true);
    } catch {}
    setLoading(false);
  };

  const currentQ = questions[currentIndex];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xs font-bold text-muted-foreground uppercase">
            Trắc Nghiệm Vi Mô (3 Câu/Ngày)
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-12 flex justify-center text-primary">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : submitted && result ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center">
              <Award className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <div className="font-extrabold text-stone-900 text-lg">
                Đúng {result.correct_answers} / {result.total_questions} câu
              </div>
              <p className="text-xs text-stone-600 mt-1">{result.feedback}</p>
            </div>
            <Button onClick={onClose} className="w-full">
              Hoàn thành phiên
            </Button>
          </div>
        ) : currentQ ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Câu {currentIndex + 1} / {questions.length}</span>
            </div>
            <div className="text-sm font-semibold text-foreground leading-relaxed">
              <MathText content={currentQ.question_text} />
            </div>

            <div className="space-y-2">
              {Object.entries(currentQ.options || {}).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => handleSelect(currentQ.id, key)}
                  className={`w-full p-3 text-left rounded-xl border text-xs font-medium flex items-center gap-2 transition-colors ${
                    selectedAnswers[currentQ.id] === key
                      ? "bg-amber-50 border-amber-500 text-amber-900 ring-1 ring-amber-500"
                      : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-stone-200 flex items-center justify-center font-bold text-[10px]">
                    {key}
                  </span>
                  <MathText content={val} />
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => prev - 1)}
              >
                Câu trước
              </Button>
              {currentIndex < questions.length - 1 ? (
                <Button size="sm" onClick={() => setCurrentIndex((prev) => prev + 1)}>
                  Câu tiếp
                </Button>
              ) : (
                <Button variant="accent" size="sm" onClick={handleSubmit}>
                  Nộp bài
                </Button>
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
