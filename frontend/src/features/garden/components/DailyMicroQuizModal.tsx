import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { API_BASE } from "@/shared/api/auth-client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Badge } from "@/shared/components/ui/badge";
import TwinChallengeView from "./TwinChallengeView";
import QuizResultView from "./QuizResultView";
import DailyQuizSubjectSelector from "./DailyQuizSubjectSelector";
import DailyQuizQuestionView from "./DailyQuizQuestionView";

interface Props {
  studentId: string;
  onClose: () => void;
  onTwinSuccess?: () => void;
}

export default function DailyMicroQuizModal({ studentId, onClose, onTwinSuccess }: Props) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [twinQuestion, setTwinQuestion] = useState<any>(null);
  const [twinSelected, setTwinSelected] = useState<string | null>(null);
  const [twinSubmitted, setTwinSubmitted] = useState(false);
  const [twinLoading, setTwinLoading] = useState(false);

  const loadQuiz = (subject?: string) => {
    setLoading(true);
    const query = subject ? `?subject=${encodeURIComponent(subject)}` : "";
    const token = localStorage.getItem("sunflower_token");
    fetch(`${API_BASE}/api/quiz/daily/${studentId}${query}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data.questions || []);
        if (data.available_subjects) setAvailableSubjects(data.available_subjects);
        if (data.selected_subject) setSelectedSubject(data.selected_subject);
        setCurrentIndex(0);
        setSelectedAnswers({});
        setSubmitted(false);
        setResult(null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadQuiz();
  }, [studentId]);

  const handleSelectAnswer = (qId: string, optKey: string) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optKey }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("sunflower_token");
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
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      setResult(await res.json());
      setSubmitted(true);
    } catch {}
    setSubmitting(false);
  };

  const handleGenerateTwin = async (detail: any) => {
    setTwinLoading(true);
    try {
      const token = localStorage.getItem("sunflower_token");
      const res = await fetch(`${API_BASE}/api/quiz/twin-challenge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          student_id: studentId,
          question_id: detail.question_id,
          selected_wrong_answer: detail.selected_answer,
          subject: selectedSubject || "Toán học"
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

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xs font-bold text-muted-foreground uppercase flex items-center justify-between">
            <span>Trắc Nghiệm Vi Mô (3 Câu Phản Xạ)</span>
            {twinQuestion && <Badge variant="default">Thử thách sinh đôi</Badge>}
          </DialogTitle>
        </DialogHeader>

        {twinLoading ? (
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
        ) : (
          <div>
            {!loading && availableSubjects.length > 0 && (
              <DailyQuizSubjectSelector
                subjects={availableSubjects}
                selectedSubject={selectedSubject}
                onSelectSubject={(sub) => {
                  setSelectedSubject(sub);
                  loadQuiz(sub);
                }}
                isLoading={loading || submitting}
              />
            )}

            {loading ? (
              <div className="py-12 flex justify-center text-primary"><Loader2 className="w-6 h-6 animate-spin" /></div>
            ) : questions.length > 0 ? (
              <DailyQuizQuestionView
                questions={questions}
                currentIndex={currentIndex}
                selectedAnswers={selectedAnswers}
                onSelectAnswer={handleSelectAnswer}
                onPrev={() => setCurrentIndex((p) => Math.max(0, p - 1))}
                onNext={() => setCurrentIndex((p) => Math.min(questions.length - 1, p + 1))}
                onSubmit={handleSubmit}
                isSubmitting={submitting}
              />
            ) : (
              <p className="text-xs text-muted-foreground text-center py-8">
                Chưa có câu hỏi cho môn học này.
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
