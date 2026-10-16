import React, { useState, useEffect } from "react";
import { Loader2, BookOpen } from "lucide-react";
import { API_BASE } from "@/shared/api/auth-client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import QuizSubjectSelectScreen from "./QuizSubjectSelectScreen";
import SingleQuestionPracticeView, { SingleQuizQuestion } from "./SingleQuestionPracticeView";
import { getClientQuestionsBySubject } from "@/shared/data/quiz.client-questions";

interface Props {
  studentId: string;
  onClose: () => void;
  onTwinSuccess?: () => void;
}

export default function DailyMicroQuizModal({ studentId, onClose, onTwinSuccess }: Props) {
  const [stage, setStage] = useState<"select_subject" | "quiz">("select_subject");
  const [questions, setQuestions] = useState<SingleQuizQuestion[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([
    "Toán học", "Vật lí", "Hóa học", "Sinh học", "Tin học",
    "Ngữ văn", "Tiếng Anh", "Lịch sử", "Địa lí", "GDKT & PL", "Công nghệ"
  ]);
  const [selectedSubject, setSelectedSubject] = useState<string>("Toán học");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchQuestionsForSubject = async (sub: string) => {
    setLoading(true);
    // Instantly hydrate with client-side randomized questions for the exact chosen subject
    const localRandomized = getClientQuestionsBySubject(sub);
    if (localRandomized.length > 0) {
      setQuestions(localRandomized);
    }
    const token = localStorage.getItem("sunflower_token");
    try {
      const res = await fetch(`${API_BASE}/api/quiz/daily/${studentId}?subject=${encodeURIComponent(sub)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.questions) && data.questions.length > 0) {
        // Ensure all questions belong strictly to the chosen subject
        const strictlySubjectQuestions = data.questions.filter((q: any) => q.subject === sub);
        if (strictlySubjectQuestions.length > 0) {
          setQuestions(strictlySubjectQuestions);
        }
      }
      if (data.available_subjects && data.available_subjects.length > 0) {
        setAvailableSubjects(data.available_subjects);
      }
    } catch {} finally {
      setCurrentIndex(0);
      setSelectedOption(null);
      setShowExplanation(false);
      setStage("quiz");
      setLoading(false);
    }
  };

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
      fetchQuestionsForSubject(selectedSubject);
    }
  };

  const currentQ = questions[currentIndex];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="pb-2 border-b border-border">
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span>Luyện Tập Trắc Nghiệm ({selectedSubject || "Chọn môn"})</span>
          </DialogTitle>
        </DialogHeader>

        {stage === "select_subject" ? (
          <QuizSubjectSelectScreen
            subjects={availableSubjects}
            selectedSubject={selectedSubject}
            onSelectSubject={setSelectedSubject}
            onStartQuiz={() => fetchQuestionsForSubject(selectedSubject)}
            loading={loading}
          />
        ) : (
          <div>
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
                onChangeSubject={() => setStage("select_subject")}
                questionNumber={currentIndex + 1}
              />
            ) : (
              <div className="text-center py-8 space-y-3">
                <p className="text-xs text-muted-foreground">
                  Chưa có câu hỏi cho môn học này.
                </p>
                <button
                  type="button"
                  onClick={() => setStage("select_subject")}
                  className="text-xs text-amber-700 font-bold hover:underline"
                >
                  Chọn môn học khác
                </button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
