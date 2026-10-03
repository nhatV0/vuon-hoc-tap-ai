"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";
import { API_BASE, Student, DiagnosticQuestion } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || "",
    grade: "10",
    target_subject: "Toán học",
    weakness: "",
    long_term_goal: "",
    timeframe: "3 tháng",
    learning_style: "visual",
  });

  // Diagnostic questions fetched dynamically based on target_subject
  const [diagnosticQuestions, setDiagnosticQuestions] = useState<DiagnosticQuestion[]>([]);
  const [diagnosticAnswers, setDiagnosticAnswers] = useState<Record<string, string>>({});
  const [loadingDiagnostics, setLoadingDiagnostics] = useState<boolean>(false);

  const [generatedStudent, setGeneratedStudent] = useState<Student | null>(null);

  // Fetch dynamic diagnostic questions on subject change
  useEffect(() => {
    setLoadingDiagnostics(true);
    fetch(`${API_BASE}/api/diagnostics/${encodeURIComponent(formData.target_subject)}?grade=${formData.grade}`)
      .then((res) => res.json())
      .then((data: DiagnosticQuestion[]) => {
        setDiagnosticQuestions(data);
        // Pre-fill answers with first options if empty
        const initialAnswers: Record<string, string> = {};
        data.forEach((q) => {
          if (q.options.length > 0) {
            initialAnswers[q.id] = q.options[0].id;
          }
        });
        setDiagnosticAnswers(initialAnswers);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingDiagnostics(false));
  }, [formData.target_subject, formData.grade]);

  const handleSelectDiagnostic = (qId: string, optId: string) => {
    setDiagnosticAnswers((prev) => ({ ...prev, [qId]: optId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      // Tự động suy luận weakness và goal từ câu trả lời chẩn đoán nếu học sinh không muốn gõ nhiều chữ
      let resolvedWeakness = formData.weakness.trim();
      if (!resolvedWeakness) {
        const blockerQuestion = diagnosticQuestions.find((q) => q.category === "blocker");
        const selectedOptId = blockerQuestion ? diagnosticAnswers[blockerQuestion.id] : null;
        const selectedOpt = blockerQuestion?.options.find((o) => o.id === selectedOptId);
        resolvedWeakness = selectedOpt ? selectedOpt.label : `Phần kiến thức trọng tâm môn ${formData.target_subject}`;
      }

      let resolvedGoal = formData.long_term_goal.trim();
      if (!resolvedGoal) {
        resolvedGoal = `Đạt điểm 8.0+ môn ${formData.target_subject} và học tập tự tin`;
      }

      const payload = {
        user_id: user?.id || null,
        name: formData.name || user?.name || "Bạn học nhỏ",
        grade: formData.grade,
        target_subject: formData.target_subject,
        weakness: resolvedWeakness,
        long_term_goal: resolvedGoal,
        timeframe: formData.timeframe,
        learning_style: formData.learning_style,
        diagnostic_answers: diagnosticAnswers,
      };

      const res = await fetch(`${API_BASE}/api/onboarding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Lỗi tạo lộ trình");
      const data = await res.json();
      setGeneratedStudent(data);
      localStorage.setItem("sunflower_student_id", data.id);
      setStep(3);
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi tạo lộ trình. Vui lòng thử lại!");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-800 pb-16">
      {/* Top Bar */}
      <header className="border-b border-stone-200/70 bg-white/70 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Vườn hoa
          </Link>

          <span className="text-xs font-semibold tracking-wide text-stone-700">
            Khảo Sát Cá Nhân Hóa • Bước {step}/3
          </span>

          <div className="flex gap-1">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`w-5 h-1 rounded-full ${s <= step ? "bg-amber-500" : "bg-stone-200"}`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 mt-8">
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-stone-900 tracking-tight">
                Môn Học & Nhịp Độ Bạn Muốn Cải Thiện
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Chọn môn học để hệ thống tải bộ câu hỏi chẩn đoán riêng biệt.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Họ và tên của bạn
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Hoàng Minh"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs text-stone-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Khối lớp
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="10">Lớp 10</option>
                    <option value="11">Lớp 11</option>
                    <option value="12">Lớp 12</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Môn cần chú trọng
                  </label>
                  <select
                    value={formData.target_subject}
                    onChange={(e) => setFormData({ ...formData, target_subject: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="Toán học">Toán học</option>
                    <option value="Hóa học">Hóa học</option>
                    <option value="Ngữ văn">Ngữ văn</option>
                    <option value="Vật lý">Vật lý</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                    <option value="Sinh học">Sinh học</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Phong cách học tập tiếp thu tốt nhất
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: "visual", label: "Sơ đồ & Hình ảnh", sub: "Dễ nhớ qua mindmap" },
                    { id: "reading", label: "Đọc & Ghi chép", sub: "Tự tóm tắt sổ tay" },
                    { id: "auditory", label: "Nghe giảng & Hỏi đáp", sub: "Trao đổi cùng bạn bè" },
                    { id: "kinesthetic", label: "Thực hành bài tập", sub: "Làm bài tập cụ thể" },
                  ].map((style) => (
                    <button
                      type="button"
                      key={style.id}
                      onClick={() => setFormData({ ...formData, learning_style: style.id })}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        formData.learning_style === style.id
                          ? "border-amber-500 bg-amber-50/60 font-semibold text-amber-900"
                          : "border-stone-200 hover:border-stone-300 text-stone-600 bg-white"
                      }`}
                    >
                      <div className="text-xs">{style.label}</div>
                      <div className="text-[10px] text-stone-400 font-normal">{style.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs"
              >
                Chẩn đoán chuyên sâu môn {formData.target_subject}
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-stone-900 tracking-tight">
                Chẩn Đoán Nhận Thức: Môn {formData.target_subject}
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Chỉ cần bấm chọn nhanh tình huống đúng với bạn nhất.
              </p>
            </div>

            {loadingDiagnostics ? (
              <div className="py-8 flex justify-center items-center gap-2 text-xs text-stone-400">
                <span className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                Đang cá nhân hóa bộ câu hỏi...
              </div>
            ) : (
              <div className="space-y-5">
                {diagnosticQuestions.map((q, idx) => (
                  <div key={q.id} className="space-y-2">
                    <label className="block text-xs font-semibold text-stone-800">
                      {idx + 1}. {q.question}
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {q.options.map((opt) => {
                        const isSelected = diagnosticAnswers[q.id] === opt.id;
                        return (
                          <button
                            type="button"
                            key={opt.id}
                            onClick={() => handleSelectDiagnostic(q.id, opt.id)}
                            className={`p-3 rounded-xl border text-left transition-all ${
                              isSelected
                                ? "border-amber-500 bg-amber-50/70 text-amber-950 font-medium shadow-xs"
                                : "border-stone-200 hover:border-stone-300 text-stone-600 bg-white"
                            }`}
                          >
                            <div className="text-xs font-semibold">{opt.label}</div>
                            {opt.subtext && (
                              <div className="text-[11px] text-stone-400 mt-0.5">{opt.subtext}</div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Mục tiêu điểm số mong muốn
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: 8.5+ điểm thi kỳ 1"
                      value={formData.long_term_goal}
                      onChange={(e) => setFormData({ ...formData, long_term_goal: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Thời hạn
                    </label>
                    <select
                      value={formData.timeframe}
                      onChange={(e) => setFormData({ ...formData, timeframe: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="1 tháng">1 tháng (Cải thiện nhanh)</option>
                      <option value="3 tháng">3 tháng (Học kỳ)</option>
                      <option value="6 tháng">6 tháng (Bứt phá)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-medium text-stone-500 hover:text-stone-800"
              >
                ← Quay lại
              </button>

              <button
                type="submit"
                disabled={isGenerating}
                className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang tạo lộ trình vi mô...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Tạo Lộ Trình & Khu Vườn
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {step === 3 && generatedStudent && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 shadow-xs space-y-6">
            <div className="text-center space-y-1">
              <div className="inline-flex p-2.5 rounded-full bg-amber-100 text-amber-600 mb-1">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-stone-900">
                Lộ Trình Của {generatedStudent.name} Đã Sẵn Sàng
              </h2>
              <p className="text-xs text-stone-400">
                Môn {generatedStudent.target_subject} • Mục tiêu: {generatedStudent.long_term_goal}
              </p>
            </div>

            {/* 3 Milestones */}
            <div className="space-y-2.5">
              {generatedStudent.roadmap?.milestones.map((m) => (
                <div key={m.stage} className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-stone-800">{m.title}</span>
                    <span className="text-[10px] font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded">
                      {m.duration}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600">{m.goal}</p>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => router.push("/planning")}
                className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors"
              >
                Xem Kế Hoạch 7 Ngày (Planning)
              </button>
              <button
                onClick={() => router.push("/garden")}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Vào Khu Vườn Cảm Xúc
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
