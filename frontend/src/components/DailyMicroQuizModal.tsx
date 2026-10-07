"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Timer,
  CheckCircle2,
  XCircle,
  Lock,
  Flame,
  Award,
  ChevronRight,
  BookOpen,
  SendHorizontal
} from "lucide-react";
import { DailyQuizPackage, QuizQuestionItem, QuizSubmissionResponse } from "@/lib/types";
import MathText from "@/components/MathText";
interface DailyMicroQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  initialBlock?: string;
  onQuizCompleted?: (result: QuizSubmissionResponse) => void;
}

const API_BASE = "http://localhost:8000";

const BLOCK_LABELS: Record<string, string> = {
  A00: "Khối A00 (Toán - Lí - Hóa)",
  D01: "Khối D01 (Toán - Văn - Anh)",
  B00: "Khối B00 (Toán - Hóa - Sinh)",
  C00: "Khối C00 (Văn - Sử - Địa)",
  A01: "Khối A01 (Toán - Lí - Anh)",
};

export default function DailyMicroQuizModal({
  isOpen,
  onClose,
  studentId,
  initialBlock = "A00",
  onQuizCompleted,
}: DailyMicroQuizModalProps) {
  const [selectedBlock, setSelectedBlock] = useState<string>(initialBlock);
  const [quizPackage, setQuizPackage] = useState<DailyQuizPackage | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Active question index: 0, 1, 2
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<QuizSubmissionResponse | null>(null);

  // Countdown timer for active question
  const [timeLeft, setTimeLeft] = useState<number>(45);

  const fetchPackage = useCallback(async (blockToFetch: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/api/quiz/daily/${studentId}?block=${blockToFetch}`);
      if (!res.ok) {
        throw new Error("Không thể tải bộ câu hỏi trắc nghiệm hôm nay.");
      }
      const data: DailyQuizPackage = await res.json();
      setQuizPackage(data);
      setCurrentIndex(0);
      setAnswers({});
      setSubmissionResult(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (isOpen) {
      fetchPackage(selectedBlock);
    }
  }, [isOpen, selectedBlock, fetchPackage]);

  const currentQuestion: QuizQuestionItem | undefined = quizPackage?.questions[currentIndex];

  // Reset timer on question change
  useEffect(() => {
    if (currentQuestion && !submissionResult) {
      setTimeLeft(currentQuestion.time_limit_seconds || 45);
    }
  }, [currentIndex, currentQuestion, submissionResult]);

  // Countdown interval
  useEffect(() => {
    if (!isOpen || submissionResult || loading || !currentQuestion) return;
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, submissionResult, loading, timeLeft, currentQuestion]);

  if (!isOpen) return null;

  const handleSelectOption = (optKey: string) => {
    if (!currentQuestion || submissionResult) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optKey,
    }));
  };

  const handleNext = () => {
    if (!quizPackage) return;
    if (currentIndex < quizPackage.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSubmit = async () => {
    if (!quizPackage || isSubmitting) return;

    // Check if answered all
    const formattedAnswers = quizPackage.questions.map((q) => ({
      question_id: q.id,
      selected_answer: answers[q.id] || "A",
      time_spent_seconds: q.time_limit_seconds - timeLeft,
    }));

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
        throw new Error("Không thể nộp kết quả trắc nghiệm.");
      }

      const result: QuizSubmissionResponse = await res.json();
      setSubmissionResult(result);
      if (onQuizCompleted) {
        onQuizCompleted(result);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Nộp bài thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const allAnswered = quizPackage
    ? quizPackage.questions.every((q) => !!answers[q.id])
    : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-xl shadow-inner">
              🎯
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg tracking-tight">
                  Bộ 3 Câu Trắc Nghiệm Mỗi Ngày
                </h3>
                {quizPackage?.is_boss_unlocked && (
                  <span className="px-2 py-0.5 rounded-full bg-red-600/80 text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                    <Flame className="w-3 h-3 fill-amber-300" />
                    Boss 30 Ngày
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-100 font-medium">
                100% Trắc nghiệm nhanh vi mô (3 - 5 phút) • Thử thách bẫy & phản xạ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Khối thi Selector Tab */}
        <div className="px-6 py-2.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-stone-500 uppercase">Khối thi:</span>
            {(["A00", "D01", "B00", "C00", "A01"] as const).map((blk) => (
              <button
                type="button"
                key={blk}
                onClick={() => setSelectedBlock(blk)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedBlock === blk
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-100"
                }`}
              >
                {blk}
              </button>
            ))}
          </div>

          {quizPackage && (
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-600 shrink-0">
              <span className="flex items-center gap-1 text-orange-600 font-bold">
                <Flame className="w-3.5 h-3.5 fill-orange-500" />
                Streak: {quizPackage.streak_days} ngày
              </span>
              {!quizPackage.is_boss_unlocked && (
                <span className="text-[11px] text-stone-400 flex items-center gap-0.5">
                  <Lock className="w-3 h-3" />
                  Mở Boss khi đạt 30 ngày
                </span>
              )}
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading && (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-stone-500">
                Đang nạp 3 câu trắc nghiệm cho {BLOCK_LABELS[selectedBlock]}...
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium text-center">
              {error}
            </div>
          )}

          {!loading && !error && quizPackage && !submissionResult && currentQuestion && (
            <div className="space-y-6">
              {/* Stepper + Timer Bar */}
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  {quizPackage.questions.map((q, idx) => {
                    const isDone = !!answers[q.id];
                    const isCurrent = idx === currentIndex;
                    return (
                      <button
                        type="button"
                        key={q.id}
                        onClick={() => setCurrentIndex(idx)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          isCurrent
                            ? "bg-amber-500 text-white shadow-xs"
                            : isDone
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-stone-100 text-stone-500"
                        }`}
                      >
                        <span>Câu {idx + 1}</span>
                        {q.slot_type === "BOSS_30D" && <Flame className="w-3 h-3 fill-amber-300" />}
                        {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>

                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black ${
                  timeLeft <= 10 ? "bg-red-50 text-red-600 animate-pulse" : "bg-stone-100 text-stone-700"
                }`}>
                  <Timer className="w-3.5 h-3.5" />
                  <span>{timeLeft}s</span>
                </div>
              </div>

              {/* Chi tiết Câu hỏi hiện tại */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-700 font-bold text-[11px]">
                    {currentQuestion.subject}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] ${
                    currentQuestion.slot_type === "BOSS_30D"
                      ? "bg-red-100 text-red-800"
                      : currentQuestion.slot_type === "TRAP_2"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    {currentQuestion.bloom_level}
                  </span>
                  <span className="text-[10px] text-stone-400 italic">
                    Nguồn: {currentQuestion.source}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 text-stone-900 font-medium text-sm leading-relaxed whitespace-pre-wrap">
                  <MathText content={currentQuestion.question_text} />
                </div>
              </div>

              {/* Các phương án A, B, C, D */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(currentQuestion.options).map(([key, val]) => {
                  const isSelected = answers[currentQuestion.id] === key;
                  return (
                    <button
                      type="button"
                      key={key}
                      onClick={() => handleSelectOption(key)}
                      className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                        isSelected
                          ? "border-amber-500 bg-amber-50 text-amber-950 font-semibold shadow-xs ring-2 ring-amber-500/20"
                          : "border-stone-200 hover:border-amber-300 hover:bg-stone-50/50 bg-white text-stone-800"
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-colors ${
                        isSelected
                          ? "bg-amber-500 text-white"
                          : "bg-stone-100 text-stone-600"
                      }`}>
                        {key}
                      </span>
                      <span className="text-xs sm:text-sm pt-0.5 leading-relaxed">
                        <MathText content={val} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Màn hình kết quả sau khi nộp */}
          {!loading && submissionResult && (
            <div className="space-y-6">
              {/* Score Banner */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Hoàn thành phiên trắc nghiệm hằng ngày!</span>
                </div>
                <h4 className="text-3xl font-black text-stone-900 tracking-tight">
                  {submissionResult.correct_answers} / {submissionResult.total_questions} Đúng
                  <span className="text-base text-stone-500 font-normal ml-2">
                    ({submissionResult.score_percentage}%)
                  </span>
                </h4>
                <p className="text-xs text-amber-800 font-medium">
                  + {submissionResult.water_drop_earned} Giọt Nước Tri Thức 💧 đã được thêm vào Khu Vườn!
                </p>
                {submissionResult.is_boss_conquered && (
                  <p className="text-xs font-black text-red-600 animate-bounce">
                    🔥 CHIẾN THẦN 30 NGÀY: Bạn đã đánh bại câu hỏi Boss Đề thi thật!
                  </p>
                )}
              </div>

              {/* Lời nhắn Growth Mindset */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  AI Mentor Đồng Hành:
                </p>
                <p className="text-xs text-stone-700 leading-relaxed italic">
                  &ldquo;{submissionResult.ai_mentor_encouragement}&rdquo;
                </p>
              </div>

              {/* Giải thích vi mô từng câu */}
              <div className="space-y-3">
                <h5 className="font-bold text-xs text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                  Giải Thích Vi Mô & Bẫy Cần Tránh
                </h5>
                <div className="space-y-3">
                  {submissionResult.results.map((res, i) => (
                    <div
                      key={res.question_id}
                      className={`p-4 rounded-2xl border text-xs space-y-2 ${
                        res.is_correct
                          ? "bg-emerald-50/60 border-emerald-200 text-emerald-950"
                          : "bg-red-50/60 border-red-200 text-red-950"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">
                          Câu {i + 1}: Bạn chọn {res.selected_answer} • Đáp án đúng: {res.correct_answer}
                        </span>
                        {res.is_correct ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Đúng
                          </span>
                        ) : (
                          <span className="text-red-600 font-bold flex items-center gap-1">
                            <XCircle className="w-4 h-4" /> Cần chú ý
                          </span>
                        )}
                      </div>
                      <div className="leading-relaxed opacity-90">
                        <MathText content={res.micro_explanation} />
                      </div>
                      {res.growth_mindset_tip && (
                        <div className="font-medium text-[11px] text-amber-800 bg-amber-100/50 p-2 rounded-xl">
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

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-stone-200 bg-stone-50/50 flex items-center justify-between shrink-0">
          {!submissionResult ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-stone-500 hover:text-stone-800 text-xs font-semibold"
              >
                Để sau
              </button>

              <div className="flex items-center gap-2">
                {quizPackage && currentIndex < quizPackage.questions.length - 1 && (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold text-xs flex items-center gap-1 transition-colors"
                  >
                    Câu tiếp theo
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  disabled={isSubmitting || !allAnswered}
                  onClick={handleSubmit}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all"
                >
                  {isSubmitting ? (
                    "Đang chấm điểm..."
                  ) : (
                    <>
                      <SendHorizontal className="w-3.5 h-3.5" />
                      Nộp Bài Trắc Nghiệm ({Object.keys(answers).length}/3)
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors"
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
