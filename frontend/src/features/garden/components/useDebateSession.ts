import { useState, useCallback } from "react";
import { API_BASE, authFetch } from "@/shared/api/auth-client";
import { SyllabusChapter } from "./DebateTopicSelector";
import { DebateOption } from "./DebateQuestionCard";
import { EvaluationData } from "./DebateAnswerFeedback";
import { QuestionHistoryItem } from "./DebateSessionSummary";

export function useDebateSession(studentId: string, currentSubject: string) {
  const [chapters, setChapters] = useState<SyllabusChapter[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [stage, setStage] = useState<"topics" | "question" | "feedback" | "summary">("topics");
  const [questionIndex, setQuestionIndex] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentOptions, setCurrentOptions] = useState<DebateOption[]>([]);
  const [currentCorrectOption, setCurrentCorrectOption] = useState("B");
  const [topicHint, setTopicHint] = useState("");
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const [lastStudentAnswer, setLastStudentAnswer] = useState("");
  const [currentEvaluation, setCurrentEvaluation] = useState<EvaluationData | null>(null);
  const [history, setHistory] = useState<QuestionHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSyllabus = useCallback(async (sub: string) => {
    try {
      const res = await authFetch(`${API_BASE}/api/socratic/syllabus?subject=${encodeURIComponent(sub)}`);
      const data = await res.json();
      if (res.ok && data.syllabus && data.syllabus[sub]) {
        setChapters(data.syllabus[sub]);
        setSelectedIds(data.syllabus[sub].slice(0, 2).map((c: SyllabusChapter) => c.id));
      }
    } catch {}
  }, []);

  const loadQuestion = async (index: number, priorQuestions: string[]) => {
    setLoading(true);
    const chosenTitles = chapters.filter((c) => selectedIds.includes(c.id)).map((c) => c.title);
    try {
      const res = await authFetch(`${API_BASE}/api/socratic/debate/generate-question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          subject: currentSubject,
          selected_chapters: chosenTitles,
          question_index: index,
          previous_questions: priorQuestions
        })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentQuestion(data.question);
        setCurrentOptions(data.options || []);
        setCurrentCorrectOption(data.correct_option || "B");
        setTopicHint(data.topic_hint || "");
        setAskedQuestions((prev) => [...prev, data.question]);
        setStage("question");
      }
    } catch {}
    setLoading(false);
  };

  const startSession = () => {
    if (selectedIds.length === 0) return;
    setQuestionIndex(1);
    setAskedQuestions([]);
    setHistory([]);
    loadQuestion(1, []);
  };

  const submitAnswer = async (ans: string) => {
    if (!ans.trim() || loading) return;
    setLastStudentAnswer(ans);
    setLoading(true);
    const chosenTitles = chapters.filter((c) => selectedIds.includes(c.id)).map((c) => c.title);
    try {
      const res = await authFetch(`${API_BASE}/api/socratic/debate/evaluate-answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          subject: currentSubject,
          selected_chapters: chosenTitles,
          question: currentQuestion,
          options: currentOptions,
          correct_option: currentCorrectOption,
          student_answer: ans
        })
      });
      const data = await res.json();
      if (res.ok) {
        const evalData: EvaluationData = {
          is_correct: data.is_correct,
          verdict: data.verdict,
          correct_option: data.correct_option || currentCorrectOption,
          explanation: data.explanation,
          feedback: data.feedback,
          debate_rebuttal: data.debate_rebuttal
        };
        setCurrentEvaluation(evalData);
        setHistory((prev) => [
          ...prev,
          {
            questionNumber: questionIndex,
            question: currentQuestion,
            studentAnswer: ans,
            correctOption: evalData.correct_option,
            isCorrect: evalData.is_correct,
            explanation: evalData.explanation
          }
        ]);
        setStage("feedback");
      }
    } catch {}
    setLoading(false);
  };

  const nextQuestion = () => {
    if (questionIndex >= 10) {
      setStage("summary");
    } else {
      const nextIdx = questionIndex + 1;
      setQuestionIndex(nextIdx);
      loadQuestion(nextIdx, askedQuestions);
    }
  };

  return {
    chapters,
    selectedIds,
    setSelectedIds,
    stage,
    setStage,
    questionIndex,
    currentQuestion,
    currentOptions,
    topicHint,
    lastStudentAnswer,
    currentEvaluation,
    history,
    loading,
    fetchSyllabus,
    startSession,
    submitAnswer,
    nextQuestion
  };
}
