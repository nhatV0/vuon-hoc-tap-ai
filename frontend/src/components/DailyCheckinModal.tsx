"use client";

import React, { useState } from "react";
import { Smile, Meh, AlertCircle, Coffee, CheckCircle2, HeartHandshake } from "lucide-react";
import { MoodType, API_BASE } from "@/lib/types";

interface DailyCheckinModalProps {
  studentId: string;
  studentName: string;
  targetSubject: string;
  onCheckinSuccess: (data: unknown) => void;
  onClose: () => void;
}

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
  const [mood, setMood] = useState<MoodType>("happy");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [aiFeedbackResult, setAiFeedbackResult] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/api/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          completion_rate: completionRate,
          subject_difficulty: subjectDifficulty,
          action_reflection: actionReflection || "Đã cố gắng hoàn thành nhiệm vụ trong ngày",
          mood: mood,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-cream-50 rounded-2xl shadow-xl border border-cream-200 overflow-hidden">
        {/* Header với tông vàng ấm */}
        <div className="bg-gradient-to-r from-sunflower-400/20 to-sage-400/20 p-5 border-b border-cream-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🌻</span>
            <div>
              <h3 className="font-semibold text-stone-800 text-lg">Điểm Danh Cảm Xúc & Tiến Độ 5 Phút</h3>
              <p className="text-xs text-stone-500">Xin chào {studentName} • Môn cần chú trọng: {targetSubject}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-cream-100 hover:bg-cream-200 text-stone-500 flex items-center justify-center transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* Nội dung kết quả AI Feedback sau khi điểm danh */}
        {aiFeedbackResult ? (
          <div className="p-6 space-y-5">
            <div className="bg-sunflower-50/70 border border-sunflower-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sunflower-700 font-medium mb-2.5">
                <HeartHandshake className="w-5 h-5 text-sunflower-500" />
                <span>Thư gửi từ Trợ lý Hoa Hướng Dương</span>
              </div>
              <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-line italic">
                &ldquo;{aiFeedbackResult}&rdquo;
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-sunflower-warm text-white font-medium hover:bg-amber-600 transition-all shadow-sm text-sm"
              >
                Nhận 1 giọt nước & Trở lại khu vườn 💧
              </button>
            </div>
          </div>
        ) : (
          /* Form 3 câu hỏi trắc nghiệm + mood selector */
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Câu hỏi 1: Thanh tiến độ hoàn thành */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <label className="font-medium text-stone-700">
                  1. Hôm nay bạn hoàn thành bao nhiêu % kế hoạch học tập?
                </label>
                <span className="font-bold text-sunflower-600 bg-sunflower-50 px-2.5 py-0.5 rounded-full border border-sunflower-200">
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
                className="w-full h-2 bg-cream-200 rounded-lg appearance-none cursor-pointer accent-sunflower-warm"
              />
              <div className="flex justify-between text-[11px] text-stone-400">
                <span>0% (Cần nghỉ ngơi)</span>
                <span>50% (Đang cố gắng)</span>
                <span>100% (Hoàn thành trọn vẹn)</span>
              </div>
            </div>

            {/* Câu hỏi 2: Trắc nghiệm trở ngại môn học */}
            <div className="space-y-2">
              <label className="block font-medium text-stone-700 text-sm">
                2. Bạn có gặp khó khăn gì ở môn {targetSubject} không?
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  "Hiểu bài tốt, không khó khăn",
                  "Khó nhớ công thức/lý thuyết",
                  "Chưa hiểu phương pháp giải bài",
                  "Thiếu thời gian làm bài tập",
                ].map((opt) => (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => setSubjectDifficulty(opt)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      subjectDifficulty === opt
                        ? "border-sunflower-warm bg-sunflower-50/80 text-amber-900 font-medium shadow-xs"
                        : "border-cream-200 bg-white hover:border-cream-300 text-stone-600"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Câu hỏi 3: Bộ chọn cảm xúc mềm mại */}
            <div className="space-y-2">
              <label className="block font-medium text-stone-700 text-sm">
                3. Trạng thái cảm xúc của bạn lúc này như thế nào?
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { type: "happy", label: "Vui vẻ / Tràn đầy năng lượng", icon: Smile, color: "text-amber-500 bg-amber-50 border-amber-200" },
                  { type: "neutral", label: "Bình thường / Tĩnh lặng", icon: Meh, color: "text-emerald-500 bg-emerald-50 border-emerald-200" },
                  { type: "stressed", label: "Căng thẳng / Lo âu", icon: AlertCircle, color: "text-rose-500 bg-rose-50 border-rose-200" },
                  { type: "tired", label: "Mệt mỏi / Buồn ngủ", icon: Coffee, color: "text-indigo-500 bg-indigo-50 border-indigo-200" },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = mood === m.type;
                  return (
                    <button
                      type="button"
                      key={m.type}
                      onClick={() => setMood(m.type as MoodType)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                        isSelected
                          ? `ring-2 ring-sunflower-warm font-semibold ${m.color}`
                          : "border-cream-200 bg-white hover:border-cream-300 text-stone-600"
                      }`}
                    >
                      <Icon className="w-6 h-6 mb-1" />
                      <span className="text-[11px] leading-tight">{m.label.split(" / ")[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ghi chú suy ngẫm nhỏ */}
            <div className="space-y-1.5">
              <label className="block font-medium text-stone-700 text-xs">
                Lời nhắn riêng cho bản thân hôm nay (Tùy chọn):
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Hôm nay mình đã hiểu bài hơn một chút..."
                value={actionReflection}
                onChange={(e) => setActionReflection(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-cream-200 bg-white focus:outline-none focus:ring-1 focus:ring-sunflower-warm text-stone-700"
              />
            </div>

            {/* Submit CTA */}
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-stone-500 hover:text-stone-700"
              >
                Để sau
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-sunflower-warm text-white font-medium hover:bg-amber-600 transition-all text-xs flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang gửi báo cáo...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Hoàn tất & Lắng nghe Trợ lý
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
