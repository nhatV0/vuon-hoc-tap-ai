"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, CheckCircle2, ChevronRight, Check } from "lucide-react";
import { API_BASE, Student, DiagnosticQuestion } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

const SUBJECT_OPTIONS = [
  { id: "Toán học", icon: "📐", desc: "Đại số & Hình học" },
  { id: "Hóa học", icon: "🧪", desc: "Hữu cơ & Vô cơ" },
  { id: "Vật lý", icon: "⚡", desc: "Cơ, Nhiệt, Điện, Quang" },
  { id: "Ngữ văn", icon: "📖", desc: "Nghị luận & Tác phẩm" },
  { id: "Tiếng Anh", icon: "🌐", desc: "Ngữ pháp & Từ vựng" },
  { id: "Sinh học", icon: "🌿", desc: "Di truyền & Sinh thái" },
];

const EMOTION_LEVELS = [
  {
    level: 1,
    title: "Rất tệ / Rất ghét",
    emoji: "😫",
    badge: "Quá tải",
    color: "border-rose-400 bg-rose-50/70 text-rose-950",
    desc: "Cảm thấy ngột ngạt, sợ hãi và chỉ muốn trốn tránh môn học này.",
  },
  {
    level: 2,
    title: "Khá chán nản",
    emoji: "😞",
    badge: "Mất động lực",
    color: "border-orange-400 bg-orange-50/70 text-orange-950",
    desc: "Mất phương hướng, làm bài tập hay bị nản lòng và dễ bỏ cuộc.",
  },
  {
    level: 3,
    title: "Hơi lo âu",
    emoji: "😟",
    badge: "Chưa tự tin",
    color: "border-amber-300 bg-amber-50/60 text-amber-950",
    desc: "Kiến thức còn mơ hồ, lúng túng khi gặp các dạng bài mới.",
  },
  {
    level: 4,
    title: "Bình thường",
    emoji: "😐",
    badge: "Trung lập",
    color: "border-stone-300 bg-stone-50 text-stone-900",
    desc: "Học vì nhiệm vụ, chưa thấy hứng thú nhưng cũng không quá ghét.",
  },
  {
    level: 5,
    title: "Khá ổn",
    emoji: "🙂",
    badge: "Sẵn sàng",
    color: "border-emerald-300 bg-emerald-50/60 text-emerald-950",
    desc: "Tương đối hiểu bài, có thể tự giải các bài cơ bản và muốn tiến bộ.",
  },
  {
    level: 6,
    title: "Hứng thú",
    emoji: "😃",
    badge: "Tích cực",
    color: "border-teal-400 bg-teal-50/70 text-teal-950",
    desc: "Cảm thấy vui mỗi khi tìm ra lời giải, tự tin nâng cao điểm số.",
  },
  {
    level: 7,
    title: "Rất thích / Đam mê",
    emoji: "🤩",
    badge: "Chinh phục đỉnh cao",
    color: "border-amber-500 bg-amber-50 text-amber-950 ring-1 ring-amber-500",
    desc: "Tràn đầy nhiệt huyết, muốn giải các bài toán vận dụng cao và thi HSG.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Form State: Hỗ trợ Đa Lựa Chọn Môn Học và Thang Đo Cảm Xúc 7 Mức
  const [name, setName] = useState<string>(user?.name || "");
  const [grade, setGrade] = useState<string>("10");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(["Toán học"]);
  const [emotionScale, setEmotionScale] = useState<number>(4);
  const [learningStyle] = useState<string>("visual");
  const [targetGoal, setTargetGoal] = useState<string>("");
  const [timeframe, setTimeframe] = useState<string>("3 tháng");

  // Dynamic diagnostics loaded based on selected subjects
  const [diagnosticQuestions, setDiagnosticQuestions] = useState<DiagnosticQuestion[]>([]);
  const [diagnosticAnswers, setDiagnosticAnswers] = useState<Record<string, string>>({});
  const [loadingDiagnostics, setLoadingDiagnostics] = useState<boolean>(false);

  const [generatedStudent, setGeneratedStudent] = useState<Student | null>(null);

  // Toggle chọn nhiều môn học
  const toggleSubject = (subjId: string) => {
    setSelectedSubjects((prev) => {
      if (prev.includes(subjId)) {
        if (prev.length === 1) return prev; // Phải giữ lại ít nhất 1 môn
        return prev.filter((s) => s !== subjId);
      } else {
        return [...prev, subjId];
      }
    });
  };

  // Load câu hỏi chẩn đoán chuyên sâu theo danh sách môn đã chọn
  useEffect(() => {
    setLoadingDiagnostics(true);
    const fetchPromises = selectedSubjects.map((s) =>
      fetch(`${API_BASE}/api/diagnostics/${encodeURIComponent(s)}?grade=${grade}`)
        .then((r) => r.json())
        .catch(() => [])
    );

    Promise.all(fetchPromises)
      .then((results: DiagnosticQuestion[][]) => {
        const flattened = results.flat();
        setDiagnosticQuestions(flattened);
        const initialAnswers: Record<string, string> = {};
        flattened.forEach((q) => {
          if (q.options.length > 0) initialAnswers[q.id] = q.options[0].id;
        });
        setDiagnosticAnswers(initialAnswers);
      })
      .finally(() => setLoadingDiagnostics(false));
  }, [selectedSubjects, grade]);

  const handleSelectDiagnostic = (qId: string, optId: string) => {
    setDiagnosticAnswers((prev) => ({ ...prev, [qId]: optId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      // Tự động phân tích các rào cản nhận thức đã chọn
      const blockerLabels: string[] = [];
      diagnosticQuestions.forEach((q) => {
        const ansId = diagnosticAnswers[q.id];
        const opt = q.options.find((o) => o.id === ansId);
        if (opt) blockerLabels.push(`${q.subject || selectedSubjects[0]}: ${opt.label}`);
      });

      const resolvedWeakness = blockerLabels.length > 0
        ? blockerLabels.join("; ")
        : `Kiến thức môn ${selectedSubjects.join(", ")}`;

      const resolvedGoal = targetGoal.trim()
        ? targetGoal.trim()
        : `Đạt kết quả 8.0+ môn ${selectedSubjects.join(", ")} với tâm lý thoải mái`;

      const payload = {
        user_id: user?.id || null,
        name: name.trim() || user?.name || "Bạn học nhỏ",
        grade: grade,
        target_subject: selectedSubjects[0],
        target_subjects: selectedSubjects,
        emotion_scale: emotionScale,
        weakness: resolvedWeakness,
        long_term_goal: resolvedGoal,
        timeframe: timeframe,
        learning_style: learningStyle,
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
      setStep(4); // Sang bước kết quả
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi tạo lộ trình. Vui lòng thử lại!");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-800 pb-16 selection:bg-amber-100">
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

          <span className="text-xs font-bold tracking-wide text-stone-700">
            Khảo Sát Cá Nhân Hóa • Bước {step}/4
          </span>

          <div className="flex gap-1">
            {[1, 2, 3, 4].map((s) => (
              <span
                key={s}
                className={`w-4 h-1 rounded-full transition-colors ${
                  s <= step ? "bg-amber-500" : "bg-stone-200"
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto px-4 mt-8">
        {/* BƯỚC 1: CHỌN NHIỀU MÔN HỌC & THÔNG TIN CƠ BẢN */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 shadow-xs space-y-6">
            <div>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Bước 1 / 4 • Chọn Môn Học
              </span>
              <h2 className="text-base font-bold text-stone-900 tracking-tight mt-1.5">
                Bạn Cần Trợ Lý Đồng Hành Ở Những Môn Nào?
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Có thể chọn nhiều môn cùng lúc. Lộ trình sẽ phân bổ đều các nhiệm vụ vi mô cho từng môn.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Tên bạn
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Hoàng Minh"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Khối lớp
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="10">Lớp 10</option>
                    <option value="11">Lớp 11</option>
                    <option value="12">Lớp 12</option>
                  </select>
                </div>
              </div>

              {/* Danh sách Chọn Nhiều Môn Học */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-2">
                  Danh sách môn học (Bấm để chọn / bỏ chọn):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {SUBJECT_OPTIONS.map((sub) => {
                    const isChecked = selectedSubjects.includes(sub.id);
                    return (
                      <button
                        type="button"
                        key={sub.id}
                        onClick={() => toggleSubject(sub.id)}
                        className={`p-3 rounded-xl border text-left transition-all relative ${
                          isChecked
                            ? "border-amber-500 bg-amber-50/70 text-amber-950 font-semibold shadow-xs"
                            : "border-stone-200 hover:border-stone-300 text-stone-600 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-base">{sub.icon}</span>
                          {isChecked && (
                            <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-bold mt-1.5">{sub.id}</div>
                        <div className="text-[10px] text-stone-400 font-normal mt-0.5">
                          {sub.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs"
              >
                Tiếp tục: Đo lường cảm xúc ({selectedSubjects.length} môn đã chọn)
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* BƯỚC 2: THƯỚC ĐO CẢM XÚC 7 CẤP ĐỘ LIKERT (1: Rất ghét/Rất tệ -> 7: Rất thích/Rất tốt) */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 shadow-xs space-y-6">
            <div>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Bước 2 / 4 • Trắc Nghiệm Cảm Xúc 7 Cấp Độ
              </span>
              <h2 className="text-base font-bold text-stone-900 tracking-tight mt-1.5">
                Cảm Xúc Hiện Tại Của Bạn Đối Với Các Môn Học Này?
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Thang đo 7 mức độ giúp Trợ lý biết nên giảm tải tâm lý (nếu bạn ghét/sợ) hay tăng tốc bài tập nâng cao (nếu bạn thích).
              </p>
            </div>

            {/* Slider hoặc Danh Sách 7 Lựa Chọn Trực Quan */}
            <div className="space-y-2.5">
              {EMOTION_LEVELS.map((emo) => {
                const isSelected = emotionScale === emo.level;
                return (
                  <button
                    type="button"
                    key={emo.level}
                    onClick={() => setEmotionScale(emo.level)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? `${emo.color} font-semibold shadow-xs`
                        : "border-stone-200 hover:border-stone-300 bg-white text-stone-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl shrink-0">{emo.emoji}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold">
                            Mức {emo.level}: {emo.title}
                          </span>
                          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full border border-current opacity-80">
                            {emo.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5 font-normal">
                          {emo.desc}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? "border-amber-600 bg-amber-500" : "border-stone-300"
                        }`}
                      >
                        {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-medium text-stone-500 hover:text-stone-800"
              >
                ← Quay lại
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs"
              >
                Tiếp tục: Chẩn đoán rào cản nhận thức
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* BƯỚC 3: CHẨN ĐOÁN RÀO CẢN NHẬN THỨC THEO TỪNG MÔN */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 shadow-xs space-y-6">
            <div>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Bước 3 / 4 • Rào Cản Nhận Thức & Mục Tiêu
              </span>
              <h2 className="text-base font-bold text-stone-900 tracking-tight mt-1.5">
                Xác Định Rào Cản & Đích Đến
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Được cá nhân hóa dựa trên môn {selectedSubjects.join(", ")} và cảm xúc mức {emotionScale}/7 của bạn.
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
                    <div className="flex items-center gap-2">
                      {q.subject && (
                        <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                          {q.subject}
                        </span>
                      )}
                      <label className="block text-xs font-semibold text-stone-800">
                        {idx + 1}. {q.question}
                      </label>
                    </div>

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
                      placeholder="Ví dụ: 8.5+ điểm học kỳ này"
                      value={targetGoal}
                      onChange={(e) => setTargetGoal(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Thời hạn
                    </label>
                    <select
                      value={timeframe}
                      onChange={(e) => setTimeframe(e.target.value)}
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
                onClick={() => setStep(2)}
                className="px-4 py-2 text-xs font-medium text-stone-500 hover:text-stone-800"
              >
                ← Quay lại
              </button>

              <button
                type="submit"
                disabled={isGenerating}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang thiết kế lộ trình riêng biệt...
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

        {/* BƯỚC 4: KẾT QUẢ LỘ TRÌNH CÁ NHÂN HÓA SÂU */}
        {step === 4 && generatedStudent && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 shadow-xs space-y-6">
            <div className="text-center space-y-1">
              <div className="inline-flex p-2.5 rounded-full bg-amber-100 text-amber-600 mb-1">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-stone-900">
                Lộ Trình Của {generatedStudent.name} Đã Được Cá Nhân Hóa!
              </h2>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="text-[11px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                  Môn: {generatedStudent.target_subjects?.join(", ") || generatedStudent.target_subject}
                </span>
                <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                  Tâm trạng: Mức {generatedStudent.emotion_scale}/7
                </span>
              </div>
            </div>

            {/* Thông điệp khích lệ */}
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-stone-700 leading-relaxed italic">
              &ldquo;{generatedStudent.roadmap?.encouraging_message}&rdquo;
            </div>

            {/* 3 Milestones */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-stone-800">3 Chặng Mốc Mục Tiêu</h3>
              {generatedStudent.roadmap?.milestones.map((m) => (
                <div key={m.stage} className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/40 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-stone-800">{m.title}</span>
                    <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
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
                Xem Kế Hoạch 7 Ngày Đã Gieo Sẵn
              </button>
              <button
                onClick={() => router.push("/garden")}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Vào Khu Vườn Của Bạn
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
