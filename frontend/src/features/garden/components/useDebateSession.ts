import { useState, useCallback } from "react";
import { API_BASE, authFetch } from "@/shared/api/auth-client";
import { SyllabusChapter } from "./DebateTopicSelector";
import { EvaluationData } from "./DebateAnswerFeedback";
import { QuestionHistoryItem } from "./DebateSessionSummary";

export function useDebateSession(studentId: string, currentSubject: string) {
  const [chapters, setChapters] = useState<SyllabusChapter[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [stage, setStage] = useState<"topics" | "question" | "feedback" | "summary">("topics");
  const [questionIndex, setQuestionIndex] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [sampleAnswer, setSampleAnswer] = useState("");
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
        setSampleAnswer(data.sample_answer || "");
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
          sample_answer: sampleAnswer,
          student_answer: ans
        })
      });
      const data = await res.json();
      if (res.ok) {
        const evalData: EvaluationData = {
          is_correct: data.is_correct,
          verdict: data.verdict || (data.is_correct ? "chính_xác" : "chưa_chính_xác"),
          sample_answer: data.sample_answer || sampleAnswer,
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
            verdict: evalData.verdict,
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
