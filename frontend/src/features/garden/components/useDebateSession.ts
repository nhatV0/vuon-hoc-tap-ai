import { useState, useCallback } from "react";
import { API_BASE, authFetch } from "@/shared/api/auth-client";
import { SyllabusChapter } from "./DebateTopicSelector";
import { FALLBACK_SYLLABUS_MAP } from "@/shared/data/socratic.fallback-syllabus";
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
    // Instantly hydrate default syllabus for snappy zero-latency display
    if (FALLBACK_SYLLABUS_MAP[sub]) {
      setChapters(FALLBACK_SYLLABUS_MAP[sub]);
      setSelectedIds(FALLBACK_SYLLABUS_MAP[sub].slice(0, 2).map((c) => c.id));
    }
    try {
      const res = await authFetch(`${API_BASE}/api/socratic/syllabus?subject=${encodeURIComponent(sub)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.syllabus && data.syllabus[sub]) {
          setChapters(data.syllabus[sub]);
          setSelectedIds(data.syllabus[sub].slice(0, 2).map((c: SyllabusChapter) => c.id));
        }
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
      if (res.ok && data.question) {
        setCurrentQuestion(data.question);
        setSampleAnswer(data.sample_answer || "");
        setTopicHint(data.topic_hint || "");
        setAskedQuestions((prev) => {
          if (prev.includes(data.question)) return prev;
          return [...prev, data.question];
        });
        setStage("question");
        setLoading(false);
        return;
      }
    } catch {}
    // Offline / Demo resilient fallback if backend is unreachable
    const focus = chosenTitles[(index - 1) % Math.max(1, chosenTitles.length)] || currentSubject;
    const sampleQ = `Trong chủ đề "${focus}", có ý kiến cho rằng chỉ cần ghi nhớ kết quả thay vì hiểu rõ bản chất cơ chế hay nguyên nhân sâu xa. Quan điểm này đúng hay sai? Vì sao?`;
    setCurrentQuestion(sampleQ);
    setSampleAnswer(`Trong "${focus}", cần nắm vững các nguyên lý bản chất, điều kiện và cơ sở thực nghiệm để giải thích hiện tượng chính xác.`);
    setTopicHint(focus);
    setAskedQuestions((prev) => (prev.includes(sampleQ) ? prev : [...prev, sampleQ]));
    setStage("question");
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
        setLoading(false);
        return;
      }
    } catch {}
    const isOk = ans.trim().length > 15;
    const fallbackEval: EvaluationData = {
      is_correct: isOk,
      verdict: isOk ? "bán_phần" : "chưa_chính_xác",
      sample_answer: sampleAnswer || "Cần nắm chắc lý thuyết để đối chiếu và lập luận chặt chẽ.",
      explanation: isOk ? "Câu trả lời có ý đúng cơ bản, cần nêu thêm dẫn chứng thực nghiệm." : "Cần trình bày rõ hơn nguyên nhân và bản chất quy luật.",
      feedback: isOk ? "Phản biện có căn cứ, hãy đào sâu hơn." : "Hãy đối chiếu lại nội dung SGK.",
      debate_rebuttal: isOk ? "Góc nhìn tốt! Bạn nghĩ sao nếu đặt trong điều kiện biên ngược lại?" : "Hãy xem xét lại tiền đề lý thuyết nhé!"
    };
    setCurrentEvaluation(fallbackEval);
    setHistory((prev) => [
      ...prev,
      {
        questionNumber: questionIndex,
        question: currentQuestion,
        studentAnswer: ans,
        verdict: fallbackEval.verdict,
        isCorrect: fallbackEval.is_correct,
        explanation: fallbackEval.explanation
      }
    ]);
    setStage("feedback");
    setLoading(false);
  };

  const nextQuestion = () => {
    if (questionIndex >= 10) {
      setStage("summary");
    } else {
      const nextIdx = questionIndex + 1;
      setQuestionIndex(nextIdx);
      const updatedHistory = askedQuestions.includes(currentQuestion)
        ? askedQuestions
        : [...askedQuestions, currentQuestion];
      loadQuestion(nextIdx, updatedHistory);
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
