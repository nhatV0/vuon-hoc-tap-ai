import React, { useState, useEffect } from "react";
import { Loader2, Sparkles, BookOpen } from "lucide-react";
import { API_BASE } from "@/shared/api/auth-client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import DailyQuizSubjectSelector from "./DailyQuizSubjectSelector";
import SingleQuestionPracticeView, { SingleQuizQuestion } from "./SingleQuestionPracticeView";

interface Props {
  studentId: string;
  onClose: () => void;
  onTwinSuccess?: () => void;
}

export default function DailyMicroQuizModal({ studentId, onClose, onTwinSuccess }: Props) {
  const [questions, setQuestions] = useState<SingleQuizQuestion[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(true);

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
        setSelectedOption(null);
        setShowExplanation(false);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadQuiz();
  }, [studentId]);

  const handleSelectOption = (key: string) => {
    if (showExplanation) return;
    setSelectedOption(key);
    setShowExplanation(true);

    const currentQ = questions[currentIndex];
    const isCorrect = key === currentQ?.correct_answer;

    // Record single attempt in background
    const token = localStorage.getItem("sunflower_token");
    fetch(`${API_BASE}/api/quiz/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        student_id: studentId,
        block: currentQ?.block || "A00",
        answers: [{ question_id: currentQ?.id, selected_answer: key }]
      })
    }).catch(() => {});

    if (isCorrect) {
      if (onTwinSuccess) onTwinSuccess();
      fetch(`${API_BASE}/api/garden/${studentId}/water`, { method: "POST" }).catch(() => {});
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      loadQuiz(selectedSubject);
    }
  };

  const currentQ = questions[currentIndex];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="pb-2 border-b border-border">
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span>Luyện Tập Trắc Nghiệm Từng Câu</span>
          </DialogTitle>
        </DialogHeader>

        <div>
          {!loading && availableSubjects.length > 0 && (
            <DailyQuizSubjectSelector
              subjects={availableSubjects}
              selectedSubject={selectedSubject}
              onSelectSubject={(sub) => {
                setSelectedSubject(sub);
                loadQuiz(sub);
              }}
              isLoading={loading}
            />
          )}

          {loading ? (
            <div className="py-12 flex justify-center text-primary">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            </div>
          ) : currentQ ? (
            <SingleQuestionPracticeView
              question={currentQ}
              selectedOption={selectedOption}
              onSelectOption={handleSelectOption}
              showExplanation={showExplanation}
              onNextQuestion={handleNextQuestion}
              questionNumber={currentIndex + 1}
            />
          ) : (
            <p className="text-xs text-muted-foreground text-center py-8">
              Chưa có câu hỏi cho môn học này.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
