"use client";

import React, { useState } from "react";
import { CheckCircle2, HeartHandshake } from "lucide-react";
import { MoodType, API_BASE } from "@/lib/types";

interface DailyCheckinModalProps {
  studentId: string;
  studentName: string;
  targetSubject: string;
  onCheckinSuccess: (data: unknown) => void;
  onClose: () => void;
}

const DAILY_EMOTION_LEVELS = [
  { level: 1, label: "Rất tệ / Kiệt sức", emoji: "😫" },
  { level: 2, label: "Chán nản / Mệt", emoji: "😞" },
  { level: 3, label: "Lo âu / Căng thẳng", emoji: "😟" },
  { level: 4, label: "Bình thường", emoji: "😐" },
  { level: 5, label: "Khá ổn / Nhẹ nhàng", emoji: "🙂" },
  { level: 6, label: "Tích cực / Hứng thú", emoji: "😃" },
  { level: 7, label: "Rất tốt / Tràn đầy năng lượng", emoji: "🤩" },
];

export default function DailyCheckinModal({
  studentId,
  studentName,
  targetSubject,
  onCheckinSuccess,
  onClose,
}: DailyCheckinModalProps) {
  const [completionRate, setCompletionRate] = useState<number>(75);
  const [subjectDifficulty, setSubjectDifficulty] = useState<string>("Không có khó khăn lớn");
  const [actionReflection, setActionReflection] = useState<string>("");
  const [emotionScale, setEmotionScale] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [aiFeedbackResult, setAiFeedbackResult] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Map 7-point emotion to mood enum for backward compatibility
      let moodMapped: MoodType = "happy";
      if (emotionScale <= 2) moodMapped = "tired";
      else if (emotionScale === 3) moodMapped = "stressed";
      else if (emotionScale === 4) moodMapped = "neutral";
      else moodMapped = "happy";

      const res = await fetch(`${API_BASE}/api/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          completion_rate: completionRate,
          subject_difficulty: subjectDifficulty,
          action_reflection: actionReflection || "Đã dành thời gian chăm sóc việc học",
          mood: moodMapped,
          emotion_scale: emotionScale,
        }),
      });

      if (!res.ok) {
        throw new Error("Không thể gửi check-in");
      }

      const data = await res.json();
      setAiFeedbackResult(data.ai_feedback);
      onCheckinSuccess(data);
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi kết nối. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌻</span>
            <div>
              <h3 className="font-bold text-stone-900 text-sm">Điểm Danh Cảm Xúc & Tiến Độ (5 Phút)</h3>
              <p className="text-[11px] text-stone-400">Chào {studentName} • Môn học: {targetSubject}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors text-xs"
          >
            ✕
          </button>
        </div>

        {/* AI Feedback View */}
        {aiFeedbackResult ? (
          <div className="p-6 space-y-5">
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center gap-2 text-amber-800 font-semibold text-xs mb-2">
                <HeartHandshake className="w-4 h-4 text-amber-600" />
                <span>Thư gửi từ Trợ lý Hoa Hướng Dương</span>
              </div>
              <p className="text-stone-700 text-xs leading-relaxed whitespace-pre-line italic">
                &ldquo;{aiFeedbackResult}&rdquo;
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors shadow-xs text-xs"
              >
                Nhận 1 giọt nước & Trở lại khu vườn 💧
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Câu hỏi 1: Tiến độ hoàn thành */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-stone-800">
                  1. Hôm nay bạn hoàn thành bao nhiêu % kế hoạch học tập?
                </label>
                <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  {completionRate}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={completionRate}
                onChange={(e) => setCompletionRate(Number(e.target.value))}
                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-stone-400">
                <span>0% (Cần nghỉ ngơi)</span>
                <span>50% (Đang cố gắng)</span>
                <span>100% (Hoàn thành trọn vẹn)</span>
              </div>
            </div>

            {/* Câu hỏi 2: Thước đo cảm xúc 7 cấp độ Likert */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block font-semibold text-stone-800 text-xs">
                  2. Cảm xúc của bạn hôm nay:
                </label>
                <span className="text-[10px] font-bold text-amber-700">
                  Mức {emotionScale}/7: {DAILY_EMOTION_LEVELS[emotionScale - 1].label}
                </span>
              </div>

              {/* 7 Nút bấm Cảm xúc từ 1 đến 7 */}
              <div className="grid grid-cols-7 gap-1">
                {DAILY_EMOTION_LEVELS.map((emo) => {
                  const isSelected = emotionScale === emo.level;
                  return (
                    <button
                      type="button"
                      key={emo.level}
                      onClick={() => setEmotionScale(emo.level)}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                        isSelected
                          ? "border-amber-500 bg-amber-50 text-amber-950 font-bold shadow-xs scale-105"
                          : "border-stone-200 hover:border-stone-300 bg-white text-stone-600"
                      }`}
                    >
                      <span className="text-xl mb-1">{emo.emoji}</span>
                      <span className="text-[9px]">{emo.level}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Câu hỏi 3: Khó khăn gặp phải */}
            <div className="space-y-1.5">
              <label className="block font-semibold text-stone-800 text-xs">
                3. Bạn có gặp trở ngại nào khi học không?
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {[
                  "Hiểu bài tốt, không trở ngại",
                  "Khó nhớ công thức/lý thuyết",
                  "Chưa hiểu phương pháp giải",
                  "Thiếu thời gian làm bài tập",
                ].map((opt) => (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => setSubjectDifficulty(opt)}
                    className={`p-2 rounded-lg border text-left text-[11px] transition-all ${
                      subjectDifficulty === opt
                        ? "border-amber-500 bg-amber-50 text-amber-950 font-semibold"
                        : "border-stone-200 hover:border-stone-300 text-stone-600 bg-white"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Suy ngẫm ngắn */}
            <div className="space-y-1">
              <label className="block font-semibold text-stone-700 text-[11px]">
                Lời nhắn riêng cho bản thân hôm nay (Tùy chọn):
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Hôm nay mình đã hiểu bài hơn một chút..."
                value={actionReflection}
                onChange={(e) => setActionReflection(e.target.value)}
                className="w-full text-xs px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-700"
              />
            </div>

            {/* Action CTAs */}
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium text-stone-500 hover:text-stone-800"
              >
                Để sau
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Gửi Báo Cáo & Nhận Nước 💧
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
