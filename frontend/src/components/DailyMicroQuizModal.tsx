"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Timer,
  CheckCircle2,
  XCircle,
  Flame,
  Award,
  ChevronRight,
  BookOpen,
  Ticket,
  Droplet,
  Trophy,
  Sparkles,
  AlertCircle,
  ArrowRight,
  Play,
  Check
} from "lucide-react";
import { DailyQuizPackage, QuizQuestionItem, QuizSubmissionResponse, ExchangeHolyWaterResponse, QuizStartResponse, API_BASE } from "@/lib/types";
import MathText from "@/components/MathText";

interface DailyMicroQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  initialBlock?: string;
  onQuizCompleted?: (result: QuizSubmissionResponse) => void;
}

interface StepFeedback {
  answered: boolean;
  selectedOption: string | null;
  isCorrect: boolean;
  correctAnswer: string;
  microExplanation: string;
  growthMindsetTip?: string | null;
}

export default function DailyMicroQuizModal({
  isOpen,
  onClose,
  studentId,
  onQuizCompleted,
}: DailyMicroQuizModalProps) {
  // Navigation phase: "select_subjects" | "playing"
  const [sessionPhase, setSessionPhase] = useState<"select_subjects" | "playing">("select_subjects");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [quizPackage, setQuizPackage] = useState<DailyQuizPackage | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sequential quiz state
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, { option: string; timeSpent: number }>>({});
  const [stepFeedbacks, setStepFeedbacks] = useState<Record<string, StepFeedback>>({});

  // Countdown timer for question
  const [timeLeft, setTimeLeft] = useState<number>(45);
  // Post-answer 5-second auto transition countdown
  const [transitionCountdown, setTransitionCountdown] = useState<number | null>(null);

  // Exchange state
  const [isExchanging, setIsExchanging] = useState<boolean>(false);
  const [exchangeMsg, setExchangeMsg] = useState<string | null>(null);

  // Final submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<QuizSubmissionResponse | null>(null);

  // Preview package (load inventory, streak, tickets info, student target subjects)
  const fetchPreviewPackage = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/api/quiz/daily/${studentId}`);
      if (!res.ok) {
        throw new Error("Không thể tải thông tin trắc nghiệm hôm nay.");
      }
      const data: DailyQuizPackage = await res.json();
      setQuizPackage(data);
      // Mặc định chọn trước các môn học mà học sinh đã chọn ở hồ sơ
      if (data.student_target_subjects && data.student_target_subjects.length > 0) {
        setSelectedSubjects(data.student_target_subjects);
      } else {
        setSelectedSubjects(["Toán học"]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (isOpen) {
      setSessionPhase("select_subjects");
      setSubmissionResult(null);
      setAnswers({});
      setStepFeedbacks({});
      setCurrentIndex(0);
      setTransitionCountdown(null);
      fetchPreviewPackage();
    }
  }, [isOpen, fetchPreviewPackage]);

  // Toggle subject selection
  const toggleSubject = (sub: string) => {
    setSelectedSubjects((prev) => {
      if (prev.includes(sub)) {
        if (prev.length === 1) {
          // Keep at least 1 subject
          return prev;
        }
        return prev.filter((s) => s !== sub);
      } else {
        return [...prev, sub];
      }
    });
  };

  // Action: Student confirms selected subjects and starts quiz -> Deducts 1 ticket!
  const handleConfirmAndStart = async () => {
    if (!quizPackage || (quizPackage.quiz_tickets || 0) <= 0 || selectedSubjects.length === 0) return;
    try {
      setIsStarting(true);
      setError(null);
      const res = await fetch(`${API_BASE}/api/quiz/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          selected_subjects: selectedSubjects,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || "Không thể bắt đầu làm bài.");
      }

      const startData: QuizStartResponse = await res.json();
      setQuizPackage({
        ...startData.package,
        quiz_tickets: startData.quiz_tickets_remaining,
      });

      // Reset state for new quiz session
      setCurrentIndex(0);
      setAnswers({});
      setStepFeedbacks({});
      setSubmissionResult(null);
      setTransitionCountdown(null);
      setTimeLeft(startData.package.questions[0]?.time_limit_seconds || 45);

      // Transition to active test
      setSessionPhase("playing");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bắt đầu làm bài thất bại");
    } finally {
      setIsStarting(false);
    }
  };

  const questions = quizPackage?.questions || [];
  const currentQuestion: QuizQuestionItem | undefined = questions[currentIndex];
  const totalQuestions = questions.length;
  const currentFeedback = currentQuestion ? stepFeedbacks[currentQuestion.id] : undefined;

  // Initialize/reset timer whenever currentIndex moves to a new active question
  useEffect(() => {
    if (sessionPhase === "playing" && currentQuestion && !submissionResult && !currentFeedback?.answered) {
      setTimeLeft(currentQuestion.time_limit_seconds || 45);
      setTransitionCountdown(null);
    }
  }, [sessionPhase, currentIndex, currentQuestion, submissionResult, currentFeedback?.answered]);

  // Active question timer countdown
  useEffect(() => {
    if (!isOpen || sessionPhase !== "playing" || submissionResult || loading || !currentQuestion) return;
    if (currentFeedback?.answered) return;
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, sessionPhase, submissionResult, loading, timeLeft, currentQuestion, currentFeedback?.answered]);

  const handleAnswerTimeout = useCallback(() => {
    if (!currentQuestion) return;
    const q = currentQuestion;
    const timeSpent = q.time_limit_seconds || 45;

    setAnswers((prev) => ({
      ...prev,
      [q.id]: { option: "", timeSpent },
    }));

    setStepFeedbacks((prev) => ({
      ...prev,
      [q.id]: {
        answered: true,
        selectedOption: null,
        isCorrect: false,
        correctAnswer: q.correct_answer || "A",
        microExplanation: q.micro_explanation || "Đã hết thời gian suy nghĩ cho câu hỏi này.",
        growthMindsetTip: q.growth_mindset_tip,
      },
    }));

    setTransitionCountdown(5);
  }, [currentQuestion]);

  // Handle timeout (timeLeft == 0) -> auto mark timeout/incorrect and reveal explanation
  useEffect(() => {
    if (sessionPhase === "playing" && timeLeft === 0 && currentQuestion && !currentFeedback?.answered && !submissionResult && !loading) {
      handleAnswerTimeout();
    }
  }, [sessionPhase, timeLeft, currentQuestion, currentFeedback?.answered, submissionResult, loading, handleAnswerTimeout]);

  // Student selects an option (A, B, C, D)
  const handleSelectOption = (optKey: string) => {
    if (!currentQuestion || currentFeedback?.answered || submissionResult) return;
    const q = currentQuestion;
    const timeSpent = Math.max(1, (q.time_limit_seconds || 45) - timeLeft);

    const isCorrect = optKey.trim().toUpperCase() === (q.correct_answer || "").trim().toUpperCase();

    setAnswers((prev) => ({
      ...prev,
      [q.id]: { option: optKey, timeSpent },
    }));

    setStepFeedbacks((prev) => ({
      ...prev,
      [q.id]: {
        answered: true,
        selectedOption: optKey,
        isCorrect,
        correctAnswer: q.correct_answer || "",
        microExplanation: q.micro_explanation || "Giải thích vi mô đáp án chuẩn.",
        growthMindsetTip: q.growth_mindset_tip,
      },
    }));

    // Trigger 5-second countdown to next question
    setTransitionCountdown(5);
  };

  const triggerFinalSubmit = useCallback(async () => {
    if (!quizPackage || isSubmitting) return;

    // Build payload
    const formattedAnswers = quizPackage.questions.map((q) => {
      const recorded = answers[q.id];
      return {
        question_id: q.id,
        selected_answer: recorded?.option ?? "",
        time_spent_seconds: recorded?.timeSpent || 45,
      };
    });

    try {
      setIsSubmitting(true);
      const res = await fetch(`${API_BASE}/api/quiz/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          block: quizPackage.block,
          answers: formattedAnswers,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || "Không thể nộp kết quả trắc nghiệm.");
      }

      const result: QuizSubmissionResponse = await res.json();
      setSubmissionResult(result);
      if (onQuizCompleted) {
        onQuizCompleted(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nộp bài thất bại");
    } finally {
      setIsSubmitting(false);
    }
  }, [quizPackage, isSubmitting, answers, studentId, onQuizCompleted]);

  const handleMoveToNextOrSubmit = useCallback(() => {
    setTransitionCountdown(null);
    if (!quizPackage) return;
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      triggerFinalSubmit();
    }
  }, [quizPackage, currentIndex, totalQuestions, triggerFinalSubmit]);

  // Transition countdown timer (5s -> 0)
  useEffect(() => {
    if (transitionCountdown === null) return;
    if (transitionCountdown <= 0) {
      handleMoveToNextOrSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTransitionCountdown((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [transitionCountdown, handleMoveToNextOrSubmit]);

  // Exchange Holy Water for 5 Quiz Tickets
  const handleExchangeHolyWater = async () => {
    try {
      setIsExchanging(true);
      setExchangeMsg(null);
      const res = await fetch(`${API_BASE}/api/quiz/exchange-holy-water?student_id=${studentId}`, {
        method: "POST",
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || "Không thể đổi Nước Thánh.");
      }
      const data: ExchangeHolyWaterResponse = await res.json();
      setExchangeMsg("Đã đổi thành công 1 Nước Thánh lấy 5 Vé Quiz!");
      setQuizPackage((prev) =>
        prev
          ? {
              ...prev,
              quiz_tickets: data.quiz_tickets,
              holy_water: data.holy_water_remaining,
              can_start_quiz: data.quiz_tickets > 0,
            }
          : null
      );
    } catch (err) {
      setExchangeMsg(err instanceof Error ? err.message : "Đổi thất bại");
    } finally {
      setIsExchanging(false);
    }
  };

  if (!isOpen) return null;

  const ticketsCount = quizPackage?.quiz_tickets !== undefined ? quizPackage.quiz_tickets : 1;
  const hasNoTickets = ticketsCount <= 0;
  const targetCount = quizPackage?.target_question_count || 3;
  const bloomStage = quizPackage?.current_bloom_stage || "Nhận biết";

  // List of all subjects in system
  const allAvailableSubjects = quizPackage?.available_subjects && quizPackage.available_subjects.length > 0
    ? quizPackage.available_subjects
    : [
        "Toán học", "Ngữ văn", "Tiếng Anh", "Vật lí", "Hóa học",
        "Sinh học", "Lịch sử", "Địa lí", "Tin học", "GDKT & PL", "Công nghệ"
      ];

  const studentTargetSubs = quizPackage?.student_target_subjects || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-stone-200/80 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-6 py-4 bg-stone-900 text-stone-50 flex items-center justify-between shrink-0 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-xl shadow-inner text-amber-400">
              🎯
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg tracking-tight text-white">
                  Đấu Trường Vi Mô Quiz
                </h3>
                {quizPackage?.is_boss_unlocked && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Flame className="w-3 h-3 text-rose-400" />
                    Boss 30 Ngày
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-400 font-medium flex items-center gap-2">
                <span>Cấp độ: <strong className="text-amber-400">{bloomStage}</strong></span>
                <span>•</span>
                <span>Mục tiêu: <strong>{targetCount} câu</strong></span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ecosystem Sub-bar: Conquest Streak, Tickets, Holy Water */}
        <div className="px-6 py-2.5 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Conquest Streak */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100/70 border border-amber-300/60 text-amber-900 font-bold shadow-xs">
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span>Chuỗi Chinh Phục:</span>
              <span className="font-black text-amber-700">{quizPackage?.conquest_streak || 0}</span>
            </div>

            {/* Quiz Tickets */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border font-bold shadow-xs transition-colors ${
              ticketsCount > 0
                ? "bg-emerald-50 border-emerald-300/70 text-emerald-900"
                : "bg-rose-50 border-rose-300 text-rose-800"
            }`}>
              <Ticket className="w-3.5 h-3.5 text-emerald-600" />
              <span>Vé Quiz:</span>
              <span className="font-black">{ticketsCount}</span>
            </div>

            {/* Holy Water */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-50 border border-sky-300/70 text-sky-900 font-bold shadow-xs">
              <Droplet className="w-3.5 h-3.5 text-sky-600" />
              <span>Nước Thánh:</span>
              <span className="font-black text-sky-700">{quizPackage?.holy_water || 0}</span>
            </div>
          </div>

          {sessionPhase === "playing" && (
            <div className="px-2.5 py-1 rounded-lg bg-stone-900 text-white font-bold text-xs flex items-center gap-1.5">
              <span>Đang luyện: {selectedSubjects.join(", ")}</span>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading && (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-stone-500">
                Đang nạp thông tin môn học và ngân hàng câu hỏi...
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium text-center space-y-2">
              <div className="flex items-center justify-center gap-1.5 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>{error}</span>
              </div>
              <button
                onClick={fetchPreviewPackage}
                className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 text-[11px]"
              >
                Tải lại
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PHASE 1: CHỌN MÔN HỌC MUỐN LUYỆN TẬP / CẢI THIỆN                          */}
          {/* ========================================================================= */}
          {!loading && !error && sessionPhase === "select_subjects" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Introduction Banner */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                <h4 className="text-sm font-black text-stone-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Chọn Môn Học Bạn Muốn Luyện Tập Hôm Nay
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Đề thi sẽ được tạo riêng từ <strong>chính các môn bạn chọn</strong>:
                </p>
                <ul className="text-[11px] text-stone-500 space-y-0.5 list-disc pl-4 pt-1">
                  <li><strong>Chọn 1 môn:</strong> Toàn bộ {targetCount} câu sẽ thuộc môn đó.</li>
                  <li><strong>Chọn 2 môn:</strong> Chắc chắn mỗi môn có ít nhất 1 câu, câu còn lại ngẫu nhiên.</li>
                  <li><strong>Chọn từ 3 môn trở lên:</strong> Câu hỏi chia đều ngẫu nhiên trong các môn đã chọn.</li>
                </ul>
              </div>

              {/* Group 1: Môn học trong mục tiêu cải thiện của học sinh */}
              {studentTargetSubs.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                      <span>⭐ Môn mục tiêu trong hồ sơ của bạn:</span>
                    </label>
                    <span className="text-[10px] text-stone-400 font-medium">Bấm để bật / tắt</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {studentTargetSubs.map((sub) => {
                      const isSelected = selectedSubjects.includes(sub);
                      return (
                        <button
                          type="button"
                          key={sub}
                          onClick={() => toggleSubject(sub)}
                          className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-2 select-none ${
                            isSelected
                              ? "border-amber-500 bg-amber-50 text-amber-950 font-bold shadow-xs ring-2 ring-amber-500/20"
                              : "border-stone-200 bg-white hover:bg-stone-50 text-stone-700"
                          }`}
                        >
                          <span className="text-xs">{sub}</span>
                          <span className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? "bg-amber-600 text-white" : "border border-stone-300 text-transparent"
                          }`}>
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Group 2: Các môn học khác nếu học sinh muốn rèn thêm */}
              {allAvailableSubjects.filter((s) => !studentTargetSubs.includes(s)).length > 0 && (
                <div className="space-y-2.5">
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                    Hoặc chọn thêm các môn học khác:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {allAvailableSubjects
                      .filter((s) => !studentTargetSubs.includes(s))
                      .map((sub) => {
                        const isSelected = selectedSubjects.includes(sub);
                        return (
                          <button
                            type="button"
                            key={sub}
                            onClick={() => toggleSubject(sub)}
                            className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between gap-1.5 select-none ${
                              isSelected
                                ? "border-amber-500 bg-amber-50 text-amber-950 font-bold shadow-xs"
                                : "border-stone-200 bg-white hover:bg-stone-50 text-stone-600"
                            }`}
                          >
                            <span className="truncate">{sub}</span>
                            <span className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 ${
                              isSelected ? "bg-amber-600 text-white" : "border border-stone-300 text-transparent"
                            }`}>
                              <Check className="w-3 h-3" />
                            </span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Ticket Notice or Holy Water Exchange */}
              {hasNoTickets && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-800">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Bạn đã dùng hết Vé Quiz hôm nay!</span>
                  </div>
                  <p className="text-[11px] text-rose-700 leading-relaxed">
                    Mỗi ngày bạn được tự động nạp 1 vé miễn phí (có thể tích lũy dồn ngày), hoặc nhận thêm vé thưởng khi cây đạt các mốc ngày 3, 7, 14, 21, 30.
                  </p>

                  {(quizPackage?.holy_water || 0) > 0 ? (
                    <div className="p-3 bg-white rounded-xl border border-sky-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-sky-900 flex items-center gap-1">
                          <Droplet className="w-3.5 h-3.5 text-sky-600" />
                          Có {quizPackage?.holy_water} bình Nước Thánh
                        </span>
                        <span className="text-[11px] text-sky-700 font-semibold">1 Nước Thánh = 5 Vé</span>
                      </div>
                      <button
                        type="button"
                        disabled={isExchanging}
                        onClick={handleExchangeHolyWater}
                        className="w-full py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                      >
                        {isExchanging ? "Đang đổi..." : "Đổi 1 Nước Thánh lấy 5 Vé Quiz"}
                      </button>
                      {exchangeMsg && (
                        <p className="text-[11px] text-center text-sky-800 font-medium">{exchangeMsg}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-[10px] text-stone-500 italic">
                      💡 Mẹo: Duy trì chuỗi 30 ngày kỷ luật để nhận Nước Thánh đổi 5 vé bất kỳ lúc nào!
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* PHASE 2: TRẢ LỜI CÂU HỎI TUẦN TỰ (FIXED TIMER + 5S FEEDBACK DELAY)        */}
          {/* ========================================================================= */}
          {!loading && !error && sessionPhase === "playing" && !submissionResult && currentQuestion && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Read-only Progress Pills & Timer */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 gap-2">
                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                  {questions.map((q, idx) => {
                    const isDone = !!stepFeedbacks[q.id]?.answered;
                    const isCurrent = idx === currentIndex;
                    const fb = stepFeedbacks[q.id];

                    return (
                      <div
                        key={q.id}
                        className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 select-none transition-all ${
                          isCurrent
                            ? "bg-amber-500 text-white shadow-xs ring-2 ring-amber-500/20"
                            : isDone
                            ? fb?.isCorrect
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                              : "bg-rose-50 text-rose-800 border border-rose-300"
                            : "bg-stone-100 text-stone-400"
                        }`}
                        title={isCurrent ? "Câu đang làm" : isDone ? "Đã hoàn thành" : "Chưa tới lượt"}
                      >
                        <span>Câu {idx + 1}</span>
                        {isDone && (
                          fb?.isCorrect ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          )
                        )}
                        {!isDone && q.slot_type === "BOSS_30D" && (
                          <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {!currentFeedback?.answered ? (
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition-colors ${
                      timeLeft <= 10
                        ? "bg-rose-100 text-rose-700 animate-pulse border border-rose-300"
                        : "bg-stone-100 text-stone-700 border border-stone-200"
                    }`}
                  >
                    <Timer className="w-3.5 h-3.5 text-stone-500" />
                    <span>{timeLeft}s</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Tự chuyển sau {transitionCountdown !== null ? transitionCountdown : 0}s...
                    </span>
                    <button
                      type="button"
                      onClick={handleMoveToNextOrSubmit}
                      className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                    >
                      {currentIndex < totalQuestions - 1 ? "Qua ngay" : "Nộp ngay"}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Question metadata */}
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-800 font-bold text-[11px] border border-stone-200">
                    {currentQuestion.subject}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] border ${
                      currentQuestion.slot_type === "BOSS_30D"
                        ? "bg-rose-100 text-rose-800 border-rose-300"
                        : currentQuestion.bloom_level.includes("Vận dụng")
                        ? "bg-purple-50 text-purple-800 border-purple-200"
                        : currentQuestion.bloom_level.includes("Thông hiểu")
                        ? "bg-blue-50 text-blue-800 border-blue-200"
                        : "bg-emerald-50 text-emerald-800 border-emerald-200"
                    }`}
                  >
                    {currentQuestion.bloom_level}
                  </span>
                  <span className="text-[10px] text-stone-400 italic">
                    Nguồn: {currentQuestion.source}
                  </span>
                </div>

                {/* Question text */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200/90 text-stone-900 font-medium text-sm leading-relaxed whitespace-pre-wrap shadow-2xs">
                  <MathText content={currentQuestion.question_text} />
                </div>
              </div>

              {/* Options A, B, C, D */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(currentQuestion.options).map(([key, val]) => {
                  const isSelected = answers[currentQuestion.id]?.option === key;
                  const isAnswered = !!currentFeedback?.answered;
                  const isThisCorrect = key.trim().toUpperCase() === (currentFeedback?.correctAnswer || "").trim().toUpperCase();

                  let buttonStyle = "border-stone-200 hover:border-amber-300 hover:bg-stone-50/50 bg-white text-stone-800";
                  let badgeStyle = "bg-stone-100 text-stone-600";

                  if (isAnswered) {
                    if (isThisCorrect) {
                      buttonStyle = "border-emerald-500 bg-emerald-50/70 text-emerald-950 font-semibold ring-2 ring-emerald-500/30";
                      badgeStyle = "bg-emerald-600 text-white";
                    } else if (isSelected && !currentFeedback?.isCorrect) {
                      buttonStyle = "border-rose-500 bg-rose-50/70 text-rose-950 font-semibold ring-2 ring-rose-500/30";
                      badgeStyle = "bg-rose-600 text-white";
                    } else {
                      buttonStyle = "border-stone-200 bg-stone-50/50 text-stone-400 opacity-60";
                    }
                  }

                  return (
                    <button
                      type="button"
                      key={key}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(key)}
                      className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${buttonStyle}`}
                    >
                      <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-colors ${badgeStyle}`}>
                        {key}
                      </span>
                      <span className="text-xs sm:text-sm pt-0.5 leading-relaxed flex-1">
                        <MathText content={val} />
                      </span>
                      {isAnswered && isThisCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 self-center" />
                      )}
                      {isAnswered && isSelected && !currentFeedback?.isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0 self-center" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Instant Micro-Explanation Box */}
              {currentFeedback?.answered && (
                <div
                  className={`p-4 rounded-2xl border text-xs space-y-2 animate-in fade-in slide-in-from-top-2 duration-200 ${
                    currentFeedback.isCorrect
                      ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                      : "bg-rose-50/80 border-rose-200 text-rose-950"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5">
                      {currentFeedback.isCorrect ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Chính xác! Đáp án đúng: {currentFeedback.correctAnswer}</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-rose-600" />
                          <span>
                            {currentFeedback.selectedOption
                              ? `Chưa đúng (Bạn chọn ${currentFeedback.selectedOption}). Đáp án đúng: ${currentFeedback.correctAnswer}`
                              : `Hết giờ! Đáp án đúng: ${currentFeedback.correctAnswer}`}
                          </span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="leading-relaxed opacity-95 text-stone-800">
                    <MathText content={currentFeedback.microExplanation} />
                  </div>

                  {currentFeedback.growthMindsetTip && (
                    <div className="font-medium text-[11px] text-amber-900 bg-amber-100/60 p-2 rounded-xl border border-amber-200/50">
                      💡 Mẹo tư duy: <MathText content={currentFeedback.growthMindsetTip} />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* PHASE 3: MÀN HÌNH TỔNG KẾT KẾT QUẢ                                       */}
          {/* ========================================================================= */}
          {!loading && submissionResult && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Score & Banner: Phân hóa rõ rệt giữa Thành công tuyệt đối (100%) và Chưa đạt (Chia buồn/Khích lệ) */}
              {submissionResult.conquest_streak_incremented ? (
                /* MÀN HÌNH CHIẾN THẮNG TUYỆT ĐỐI: CHÍNH XÁC 100% */
                <div className="p-5 rounded-3xl bg-stone-900 text-white text-center space-y-2 border border-amber-500/30 shadow-lg animate-in zoom-in-95 duration-200">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Tuyệt Đối! Hoàn thành trọn vẹn phiên trắc nghiệm</span>
                  </div>
                  <h4 className="text-3xl font-black text-white tracking-tight">
                    {submissionResult.correct_answers} / {submissionResult.total_questions} Đúng
                    <span className="text-base text-emerald-400 font-bold ml-2">
                      (100% Hoàn Hảo)
                    </span>
                  </h4>
                  <div className="flex items-center justify-center gap-4 text-xs font-semibold pt-1">
                    <span className="text-amber-400 flex items-center gap-1 font-black">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      +1 Chuỗi Chinh Phục (Hiện có: {submissionResult.conquest_streak})
                    </span>
                    <span className="text-sky-300 flex items-center gap-1">
                      <Droplet className="w-4 h-4 text-sky-400" />
                      +{submissionResult.water_drop_earned} Giọt Nước Vườn Hoa
                    </span>
                  </div>
                  {submissionResult.is_boss_conquered && (
                    <p className="text-xs font-black text-rose-400 animate-bounce pt-1">
                      🔥 CHIẾN THẦN: Bạn đã hạ gục câu hỏi Boss Đề thi thật!
                    </p>
                  )}
                </div>
              ) : (
                /* MÀN HÌNH CHIA BUỒN & ĐỘNG VIÊN: CHƯA ĐẠT 100% (KHÔNG TĂNG CHUỖI) */
                <div className="p-5 rounded-3xl bg-stone-900 text-white text-center space-y-2.5 border border-stone-800 shadow-lg">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-xs">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>Chưa đạt độ chính xác tuyệt đối</span>
                  </div>
                  <h4 className="text-3xl font-black text-stone-100 tracking-tight">
                    {submissionResult.correct_answers} / {submissionResult.total_questions} Đúng
                    <span className="text-base text-stone-400 font-normal ml-2">
                      ({submissionResult.score_percentage}%)
                    </span>
                  </h4>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs pt-1">
                    <span className="text-stone-400 flex items-center gap-1.5 bg-stone-800/80 px-3 py-1 rounded-full border border-stone-700/60">
                      <Trophy className="w-3.5 h-3.5 text-stone-500" />
                      <span>Chuỗi Chinh Phục giữ nguyên: <strong>{submissionResult.conquest_streak}</strong></span>
                    </span>
                    <span className="text-sky-300 flex items-center gap-1 bg-sky-950/40 px-3 py-1 rounded-full border border-sky-800/50">
                      <Droplet className="w-3.5 h-3.5 text-sky-400" />
                      +{submissionResult.water_drop_earned} Giọt Nước khích lệ
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed max-w-md mx-auto pt-1 font-medium">
                    💡 Để tăng Chuỗi Chinh Phục, bạn cần trả lời đúng <strong>tất cả {submissionResult.total_questions}/{submissionResult.total_questions} câu</strong>. Hãy xem kỹ phần giải thích vi mô bên dưới để không lặp lại lỗi sai nhé!
                  </p>
                </div>
              )}
              {/* AI Mentor Growth Mindset */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  AI Mentor Đồng Hành:
                </p>
                <p className="text-xs text-stone-700 leading-relaxed italic">
                  &ldquo;{submissionResult.ai_mentor_encouragement}&rdquo;
                </p>
              </div>

              {/* Detailed review of each question */}
              <div className="space-y-3">
                <h5 className="font-bold text-xs text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                  Xem lại toàn bộ giải thích vi mô
                </h5>
                <div className="space-y-3">
                  {submissionResult.results.map((res, i) => (
                    <div
                      key={res.question_id}
                      className={`p-4 rounded-2xl border text-xs space-y-2 ${
                        res.is_correct
                          ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                          : "bg-rose-50/70 border-rose-200 text-rose-950"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">
                          Câu {i + 1}: Bạn chọn {res.selected_answer} • Đáp án đúng: {res.correct_answer}
                        </span>
                        {res.is_correct ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Đúng
                          </span>
                        ) : (
                          <span className="text-rose-700 font-bold flex items-center gap-1">
                            <XCircle className="w-4 h-4 text-rose-600" /> Cần chú ý
                          </span>
                        )}
                      </div>
                      <div className="leading-relaxed opacity-95 text-stone-800">
                        <MathText content={res.micro_explanation} />
                      </div>
                      {res.growth_mindset_tip && (
                        <div className="font-medium text-[11px] text-amber-900 bg-amber-100/60 p-2 rounded-xl">
                          💡 Mẹo: <MathText content={res.growth_mindset_tip} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer: CHỈ 1 NÚT DUY NHẤT Ở MỖI BƯỚC */}
        <div className="px-6 py-4 border-t border-stone-200 bg-stone-50/60 flex items-center justify-between shrink-0">
          {sessionPhase === "select_subjects" ? (
            <div className="w-full flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-stone-800">
                  Đã chọn: <span className="text-amber-700">{selectedSubjects.join(", ")}</span>
                </span>
                <p className="text-[11px] text-stone-500">
                  {selectedSubjects.length === 1 && `Toàn bộ ${targetCount} câu sẽ thuộc môn ${selectedSubjects[0]}`}
                  {selectedSubjects.length === 2 && `Mỗi môn chắc chắn có 1 câu, câu thứ 3 ngẫu nhiên`}
                  {selectedSubjects.length >= 3 && `${targetCount} câu chia đều ngẫu nhiên trong ${selectedSubjects.length} môn đã chọn`}
                </p>
              </div>

              {/* NÚT DUY NHẤT ĐỂ XÁC NHẬN VÀ TRỪ VÉ */}
              <button
                type="button"
                disabled={hasNoTickets || isStarting || selectedSubjects.length === 0}
                onClick={handleConfirmAndStart}
                className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 shrink-0"
              >
                {isStarting ? (
                  "Đang cấp phát đề..."
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>Xác Nhận & Bắt Đầu (1 Vé)</span>
                  </>
                )}
              </button>
            </div>
          ) : !submissionResult ? (
            <div className="w-full flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-stone-500 hover:text-stone-800 text-xs font-semibold"
              >
                Tạm dừng
              </button>

              <div className="flex items-center gap-2">
                {currentFeedback?.answered && (
                  <button
                    type="button"
                    onClick={handleMoveToNextOrSubmit}
                    className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <span>{currentIndex < totalQuestions - 1 ? "Câu tiếp theo" : "Hoàn thành & Nộp bài"}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Đóng & Trở về Khu Vườn 🌻
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
