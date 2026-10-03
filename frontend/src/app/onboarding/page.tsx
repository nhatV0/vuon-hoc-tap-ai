"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, CheckCircle2 } from "lucide-react";
import { API_BASE, Student } from "@/lib/types";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    grade: "10",
    target_subject: "Toán học",
    weakness: "",
    long_term_goal: "",
    timeframe: "3 tháng",
    learning_style: "visual"
  });

  const [generatedStudent, setGeneratedStudent] = useState<Student | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const res = await fetch(`${API_BASE}/api/onboarding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Không thể tạo lộ trình");
      }

      const data = await res.json();
      setGeneratedStudent(data);
      localStorage.setItem("sunflower_student_id", data.id);
      setStep(3); // Bước xem kết quả
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi tạo lộ trình. Vui lòng thử lại!");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 text-stone-800 pb-20">
      {/* Header */}
      <header className="border-b border-cream-200 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại Vườn Hoa
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xl">🌻</span>
            <span className="font-semibold text-sm text-stone-800">Khảo Sát Cá Nhân Hóa Lộ Trình</span>
          </div>

          <div className="text-xs font-medium text-stone-400">
            Bước {step}/3
          </div>
        </div>
      </header>

      {/* Main Form Body */}
      <main className="max-w-2xl mx-auto px-4 mt-8">
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-cream-200 p-6 md:p-8 shadow-xs space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                <span>🌱</span> Thông Tin Cơ Bản Của Bạn
              </h2>
              <p className="text-xs text-stone-500">
                Hãy cho Trợ lý Hoa Hướng Dương biết một chút thông tin để chúng mình đồng hành nhé!
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Họ và tên của bạn:
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Ví dụ: Trần Minh Khang"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-200 bg-cream-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sunflower-warm text-sm text-stone-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Khối lớp hiện tại:
                  </label>
                  <select
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-cream-200 bg-cream-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sunflower-warm text-sm text-stone-800"
                  >
                    <option value="10">Lớp 10</option>
                    <option value="11">Lớp 11</option>
                    <option value="12">Lớp 12</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Môn học cần tập trung:
                  </label>
                  <select
                    name="target_subject"
                    value={formData.target_subject}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-cream-200 bg-cream-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sunflower-warm text-sm text-stone-800"
                  >
                    <option value="Toán học">Toán học</option>
                    <option value="Vật lý">Vật lý</option>
                    <option value="Hóa học">Hóa học</option>
                    <option value="Sinh học">Sinh học</option>
                    <option value="Ngữ văn">Ngữ văn</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                    <option value="Lịch sử - Địa lý">Lịch sử - Địa lý</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Phong cách học tập bạn cảm thấy tiếp thu tốt nhất:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: "visual", label: "Hình ảnh & Sơ đồ tư duy" },
                    { id: "auditory", label: "Nghe giảng & Thảo luận" },
                    { id: "reading", label: "Đọc sách & Viết tay" },
                    { id: "kinesthetic", label: "Thực hành bài tập thực tế" },
                  ].map((style) => (
                    <button
                      type="button"
                      key={style.id}
                      onClick={() => setFormData({ ...formData, learning_style: style.id })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        formData.learning_style === style.id
                          ? "border-sunflower-warm bg-sunflower-50 text-amber-900 font-semibold"
                          : "border-cream-200 bg-cream-50/50 text-stone-600 hover:border-cream-300"
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                disabled={!formData.name.trim()}
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-xl bg-sunflower-warm text-white font-medium hover:bg-amber-600 transition-all text-xs shadow-xs disabled:opacity-50"
              >
                Tiếp tục sang Mục Tiêu →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-cream-200 p-6 md:p-8 shadow-xs space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                <span>🎯</span> Mục Tiêu & Điểm Cần Cải Thiện
              </h2>
              <p className="text-xs text-stone-500">
                Hãy chia sẻ thật lòng, ở đây không có sự phán xét hay áp lực nào cả.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Khó khăn / Điểm yếu hiện tại ở môn {formData.target_subject}:
                </label>
                <textarea
                  rows={3}
                  name="weakness"
                  placeholder="Ví dụ: Chưa nắm chắc công thức hình học không gian, thường bị rối khi làm bài toán thực tế..."
                  value={formData.weakness}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-200 bg-cream-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sunflower-warm text-sm text-stone-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Mục tiêu lớn mong muốn đạt được (Long-term Goal):
                </label>
                <input
                  type="text"
                  name="long_term_goal"
                  placeholder="Ví dụ: Đạt điểm 8.0+ học kỳ này hoặc tự tin làm hết phần vận dụng cơ bản"
                  value={formData.long_term_goal}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-200 bg-cream-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sunflower-warm text-sm text-stone-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Thời hạn dự kiến hoàn thành:
                </label>
                <select
                  name="timeframe"
                  value={formData.timeframe}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-200 bg-cream-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sunflower-warm text-sm text-stone-800"
                >
                  <option value="1 tháng">1 tháng (Cải thiện cấp tốc)</option>
                  <option value="3 tháng">3 tháng (Học kỳ)</option>
                  <option value="6 tháng">6 tháng (Ôn thi bứt phá)</option>
                  <option value="1 năm">1 năm (Dài hạn cả năm học)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl text-stone-600 hover:text-stone-900 text-xs font-medium"
              >
                ← Quay lại
              </button>

              <button
                type="submit"
                disabled={isGenerating || !formData.weakness.trim() || !formData.long_term_goal.trim()}
                className="px-6 py-2.5 rounded-xl bg-sunflower-warm text-white font-medium hover:bg-amber-600 transition-all text-xs flex items-center gap-2 shadow-xs disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    AI Đang Thiết Kế Lộ Trình...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Tạo Lộ Trình Với Trợ Lý
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {step === 3 && generatedStudent && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-cream-200 p-6 md:p-8 shadow-xs space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 rounded-full bg-sunflower-100 text-sunflower-warm mb-1">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-stone-800">
                  Lộ Trình Học Tập Của {generatedStudent.name} Đã Sẵn Sàng!
                </h2>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  Được thiết kế riêng theo phương pháp sư phạm vi mô (Micro-learning) giúp giảm áp lực và nuôi dưỡng niềm vui học tập.
                </p>
              </div>

              {/* Thông điệp khích lệ */}
              <div className="p-4 rounded-xl bg-sunflower-50/70 border border-sunflower-200 text-xs text-stone-700 italic leading-relaxed">
                &ldquo;{generatedStudent.roadmap?.encouraging_message}&rdquo;
              </div>

              {/* 3 Milestones */}
              <div className="space-y-3">
                <h3 className="font-semibold text-stone-800 text-sm">3 Chặng Mốc Mục Tiêu</h3>
                <div className="space-y-3">
                  {generatedStudent.roadmap?.milestones.map((m) => (
                    <div key={m.stage} className="p-4 rounded-xl border border-cream-200 bg-cream-50/40">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-bold text-xs text-stone-800">{m.title}</span>
                        <span className="text-[10px] text-sunflower-700 bg-sunflower-100 px-2 py-0.5 rounded font-medium">
                          {m.duration}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 mb-2">{m.goal}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {m.key_actions.map((act, idx) => (
                          <span key={idx} className="text-[10px] bg-white border border-cream-200 px-2 py-0.5 rounded text-stone-600">
                            • {act}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Quay lại khu vườn */}
              <div className="pt-2 flex justify-center">
                <button
                  onClick={() => router.push("/")}
                  className="px-8 py-3 rounded-xl bg-sunflower-warm text-white font-medium hover:bg-amber-600 transition-all text-sm flex items-center gap-2 shadow-sm"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Bắt Đầu Chăm Sóc Khu Vườn Của Bạn
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
