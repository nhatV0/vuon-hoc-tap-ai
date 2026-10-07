"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  SendHorizontal,
  BarChart2,
  Edit3,
  Trash2
} from "lucide-react";
import {
  SubjectQuestionGroup,
  QuizQuestionAdmin,
  TeacherQuizStatsItem,
  User,
  API_BASE
} from "@/lib/types";
import MathText from "@/components/MathText";

interface CentralizedQuestionManagerProps {
  user: User | null;
  quizStats: TeacherQuizStatsItem[];
  onStatsRefresh: () => void;
}

export default function CentralizedQuestionManager({
  user,
  quizStats,
  onStatsRefresh
}: CentralizedQuestionManagerProps) {
  const [groupedQuestions, setGroupedQuestions] = useState<SubjectQuestionGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSubjectTab, setSelectedSubjectTab] = useState<string>("ALL");
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestionAdmin | null>(null);

  // Form nạp câu hỏi state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const initialSubject = user?.role === "admin"
    ? "Toán học"
    : (user?.assigned_subject && user.assigned_subject !== "ALL" ? user.assigned_subject : "Toán học");

  const [form, setForm] = useState({
    block: "A00",
    subject: initialSubject,
    source: "Đề Tốt nghiệp THPT Mới Nhất 2026 - Mã đề 101",
    bloom_level: "Vận dụng (Mức 8+)",
    lock_condition: "MOTUDO",
    time_limit_seconds: 90,
    question_text: "",
    optA: "",
    optB: "",
    optC: "",
    optD: "",
    correct_answer: "A",
    micro_explanation: "",
    growth_mindset_tip: "",
  });

  const fetchGroupedQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("sunflower_auth_token");
      const res = await fetch(`${API_BASE}/api/quiz/questions/grouped`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        setGroupedQuestions(json);
      }
    } catch (err) {
      console.error("Failed to load grouped questions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroupedQuestions();
  }, [fetchGroupedQuestions]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.question_text || !form.optA || !form.optB) {
      setErrorToast("Vui lòng nhập nội dung câu hỏi và các phương án trả lời!");
      return;
    }

    try {
      setIsSubmitting(true);
      setSuccessToast(null);
      setErrorToast(null);
      const token = localStorage.getItem("sunflower_auth_token");
      const res = await fetch(`${API_BASE}/api/quiz/inject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          block: form.block,
          subject: user?.role === "admin" ? form.subject : (user?.assigned_subject || "Toán học"),
          source: form.source,
          bloom_level: form.bloom_level,
          lock_condition: form.lock_condition,
          time_limit_seconds: form.time_limit_seconds,
          question_text: form.question_text,
          options: {
            A: form.optA,
            B: form.optB,
            C: form.optC || "",
            D: form.optD || "",
          },
          correct_answer: form.correct_answer,
          micro_explanation: form.micro_explanation,
          growth_mindset_tip: form.growth_mindset_tip,
          teacher_id: user?.name || "GV_ADMIN",
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.detail || "Không thể nạp câu hỏi mới.");
      }

      setSuccessToast("🎉 Đã nạp thành công câu hỏi vào kho lưu trữ tập trung!");
      setForm({
        block: "A00",
        subject: initialSubject,
        source: "Đề Tốt nghiệp THPT Mới Nhất 2026 - Mã đề 101",
        bloom_level: "Vận dụng (Mức 8+)",
        lock_condition: "MOTUDO",
        time_limit_seconds: 90,
        question_text: "",
        optA: "",
        optB: "",
        optC: "",
        optD: "",
        correct_answer: "A",
        micro_explanation: "",
        growth_mindset_tip: "",
      });
      fetchGroupedQuestions();
      onStatsRefresh();
    } catch (err: unknown) {
      setErrorToast(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;

    try {
      const token = localStorage.getItem("sunflower_auth_token");
      const res = await fetch(`${API_BASE}/api/quiz/questions/${editingQuestion.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          question_text: editingQuestion.question_text,
          options: editingQuestion.options,
          correct_answer: editingQuestion.correct_answer,
          micro_explanation: editingQuestion.micro_explanation,
          source: editingQuestion.source
        })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.detail || "Không thể cập nhật câu hỏi.");
      }

      alert("Đã cập nhật câu hỏi thành công!");
      setEditingQuestion(null);
      fetchGroupedQuestions();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    }
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa câu hỏi này khỏi kho lưu trữ?")) return;

    try {
      const token = localStorage.getItem("sunflower_auth_token");
      const res = await fetch(`${API_BASE}/api/quiz/questions/${questionId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.detail || "Không thể xóa câu hỏi");
      }

      alert("Đã xóa câu hỏi thành công!");
      fetchGroupedQuestions();
      onStatsRefresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Alert */}
      {successToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between">
          <span>{successToast}</span>
          <button onClick={() => setSuccessToast(null)} className="text-stone-400 hover:text-stone-700">✕</button>
        </div>
      )}
      {errorToast && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center justify-between">
          <span>{errorToast}</span>
          <button onClick={() => setErrorToast(null)} className="text-stone-400 hover:text-stone-700">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KHỐI 1: FORM NẠP CÂU HỎI MỚI */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-cream-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-cream-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                ⚡
              </div>
              <div>
                <h3 className="font-bold text-sm text-stone-900">
                  Nạp Câu Hỏi Trắc Nghiệm Mới
                </h3>
                <p className="text-[11px] text-stone-500">
                  {user?.role === "admin"
                    ? "Quản trị viên có quyền nạp câu hỏi cho tất cả các môn"
                    : `Giáo viên chuyên trách môn ${user?.assigned_subject || "Toán học"} (chỉ tạo môn được gán)`}
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] uppercase">
              Chuẩn Hóa KaTeX
            </span>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Khối Áp Dụng</label>
                <select
                  value={form.block}
                  onChange={(e) => setForm({ ...form, block: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-white font-medium"
                >
                  <option value="A00">A00 (Toán - Lí - Hóa)</option>
                  <option value="D01">D01 (Toán - Văn - Anh)</option>
                  <option value="B00">B00 (Toán - Hóa - Sinh)</option>
                  <option value="C00">C00 (Văn - Sử - Địa)</option>
                  <option value="A01">A01 (Toán - Lí - Anh)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Môn Học</label>
                {user?.role === "admin" ? (
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-white font-bold text-stone-800"
                  >
                    {["Toán học", "Vật lí", "Hóa học", "Sinh học", "Ngữ văn", "Tiếng Anh", "Lịch sử", "Địa lí", "Tin học"].map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    readOnly
                    value={user?.assigned_subject || "Toán học"}
                    className="w-full p-2.5 rounded-xl border border-amber-200 bg-amber-50/50 font-bold text-amber-900 cursor-not-allowed"
                    title="Giáo viên chỉ có thể tạo câu hỏi thuộc môn được phân công"
                  />
                )}
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Điều Kiện Mở Khóa</label>
                <select
                  value={form.lock_condition}
                  onChange={(e) => setForm({ ...form, lock_condition: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-white font-medium"
                >
                  <option value="MOTUDO">Xuất hiện cho toàn bộ học sinh</option>
                  <option value="YEUCAUSTREAK30NGAY">Chỉ mở khi đạt Streak 30 Ngày (Boss)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Nguồn Đề Thi / Trích Dẫn</label>
              <input
                type="text"
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                placeholder="Ví dụ: Đề Tốt nghiệp THPT 2026 - Mã đề 101 - Câu 38"
                className="w-full p-2.5 rounded-xl border border-stone-200 bg-white"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Nội Dung Câu Hỏi (Hỗ trợ công thức $...$)</label>
              <textarea
                rows={3}
                value={form.question_text}
                onChange={(e) => setForm({ ...form, question_text: e.target.value })}
                placeholder="Nhập nội dung câu hỏi... Ví dụ: Đạo hàm của hàm số $y = 3^x$ là:"
                className="w-full p-3 rounded-2xl border border-stone-200 bg-white resize-none"
                required
              />
            </div>

            {/* 4 Phương Án */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-600 mb-1">Phương Án A</label>
                <input
                  type="text"
                  value={form.optA}
                  onChange={(e) => setForm({ ...form, optA: e.target.value })}
                  placeholder="Nội dung đáp án A"
                  className="w-full p-2 rounded-xl border border-stone-200"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-600 mb-1">Phương Án B</label>
                <input
                  type="text"
                  value={form.optB}
                  onChange={(e) => setForm({ ...form, optB: e.target.value })}
                  placeholder="Nội dung đáp án B"
                  className="w-full p-2 rounded-xl border border-stone-200"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-600 mb-1">Phương Án C</label>
                <input
                  type="text"
                  value={form.optC}
                  onChange={(e) => setForm({ ...form, optC: e.target.value })}
                  placeholder="Nội dung đáp án C"
                  className="w-full p-2 rounded-xl border border-stone-200"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-600 mb-1">Phương Án D</label>
                <input
                  type="text"
                  value={form.optD}
                  onChange={(e) => setForm({ ...form, optD: e.target.value })}
                  placeholder="Nội dung đáp án D"
                  className="w-full p-2 rounded-xl border border-stone-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Đáp Án Đúng</label>
                <select
                  value={form.correct_answer}
                  onChange={(e) => setForm({ ...form, correct_answer: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-white font-bold text-amber-900"
                >
                  <option value="A">Đáp án A</option>
                  <option value="B">Đáp án B</option>
                  <option value="C">Đáp án C</option>
                  <option value="D">Đáp án D</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-stone-700 mb-1">Giải Thích Vi Mô (Dưới 3 dòng)</label>
                <input
                  type="text"
                  value={form.micro_explanation}
                  onChange={(e) => setForm({ ...form, micro_explanation: e.target.value })}
                  placeholder="Chỉ rõ bẫy và tư duy giải nhanh..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                <SendHorizontal className="w-4 h-4" />
                {isSubmitting ? "Đang Nạp Câu Hỏi..." : "Nạp Câu Hỏi Ngay"}
              </button>
            </div>
          </form>
        </div>

        {/* KHỐI 2: THỐNG KÊ ĐIỂM NGHẼN BẪY */}
        <div className="bg-white rounded-3xl border border-cream-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-cream-200">
            <BarChart2 className="w-4 h-4 text-amber-600" />
            <h4 className="font-bold text-xs text-stone-900 uppercase tracking-wider">
              Thống Kê Điểm Nghẽn Câu Hỏi
            </h4>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[500px]">
            {quizStats.length === 0 ? (
              <div className="py-12 text-center text-xs text-stone-400">
                Chưa có lượt làm bài nào được ghi nhận.
              </div>
            ) : (
              quizStats.map((st) => (
                <div
                  key={st.question_id}
                  className="p-3.5 rounded-2xl border border-cream-200 bg-cream-50/50 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900">
                      {st.block} • {st.subject}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      st.correct_rate >= 70
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      Tỉ lệ đúng: {st.correct_rate}%
                    </span>
                  </div>
                  <div className="text-stone-700 font-medium line-clamp-2">
                    <MathText content={st.question_text} />
                  </div>
                  <p className="text-[10px] text-stone-400">
                    {st.total_attempts} lượt làm • {st.wrong_count} lần mắc bẫy
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* KHỐI 3: MỤC CÂU HỎI ĐÃ TẠO (KHO LƯU TRỮ TẬP TRUNG, CHIA THEO MÔN HỌC, CẤU TRÚC KATEX) */}
      <div className="bg-white rounded-3xl border border-cream-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-cream-200 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
              📚
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-900">
                Mục Câu Hỏi Đã Tạo (Kho Lưu Trữ Tập Trung)
              </h3>
              <p className="text-[11px] text-stone-500">
                {user?.role === "admin"
                  ? "Admin có toàn quyền Thêm, Sửa, Xóa bất kỳ câu hỏi nào trong hệ thống"
                  : "Giáo viên chỉ có thể Chỉnh sửa hoặc Xóa các câu hỏi do chính mình tạo"}
              </p>
            </div>
          </div>

          {/* Filter Tabs Môn Học */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedSubjectTab("ALL")}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedSubjectTab === "ALL"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "bg-cream-100 text-stone-600 hover:bg-cream-200"
              }`}
            >
              Tất Cả Môn
            </button>
            {groupedQuestions.map((grp) => (
              <button
                key={grp.subject}
                onClick={() => setSelectedSubjectTab(grp.subject)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedSubjectTab === grp.subject
                    ? "bg-amber-500 text-white shadow-xs"
                    : "bg-cream-100 text-stone-600 hover:bg-cream-200"
                }`}
              >
                {grp.subject} ({grp.total_count})
              </button>
            ))}
          </div>
        </div>

        {/* Danh sách câu hỏi */}
        {loading ? (
          <div className="py-12 text-center text-xs text-stone-400">
            Đang tải dữ liệu ngân hàng câu hỏi...
          </div>
        ) : (
          <div className="space-y-6">
            {groupedQuestions
              .filter((grp) => selectedSubjectTab === "ALL" || grp.subject === selectedSubjectTab)
              .map((grp) => (
                <div key={grp.subject} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <h4 className="font-extrabold text-xs text-amber-950 uppercase tracking-wider">
                      Môn: {grp.subject} ({grp.total_count} câu)
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {grp.questions.map((q, idx) => {
                      const canManage = user?.role === "admin" || (q.creator_id && q.creator_id === user?.id);
                      return (
                        <div
                          key={q.id}
                          className="p-4 rounded-2xl border border-cream-200 bg-cream-50/40 hover:bg-white hover:border-amber-300 transition-all space-y-3 text-xs shadow-2xs flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-[11px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                                  #{idx + 1} • {q.block}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold">
                                  {q.bloom_level}
                                </span>
                                <span className="text-[10px] text-stone-400">
                                  {q.creator_role === "ADMIN" ? "Admin" : q.creator_role === "TEACHER" ? "Giáo viên" : "Hệ thống"}
                                </span>
                              </div>

                              {/* Action buttons */}
                              <div className="flex items-center gap-1 shrink-0">
                                {canManage ? (
                                  <>
                                    <button
                                      onClick={() => setEditingQuestion(q)}
                                      className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 transition-colors"
                                      title="Chỉnh sửa câu hỏi"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(q.id)}
                                      className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors"
                                      title="Xóa câu hỏi"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                ) : (
                                  <span className="text-[10px] text-stone-400 italic">Chỉ xem</span>
                                )}
                              </div>
                            </div>

                            {/* Question text with KaTeX */}
                            <div className="font-semibold text-stone-900 leading-relaxed bg-white p-2.5 rounded-xl border border-cream-100">
                              <MathText content={q.question_text} />
                            </div>

                            {/* 4 Options */}
                            <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                              {Object.entries(q.options || {}).map(([key, val]) => (
                                <div
                                  key={key}
                                  className={`p-1.5 rounded-lg border flex items-start gap-1.5 ${
                                    q.correct_answer === key
                                      ? "bg-emerald-50 border-emerald-300 font-bold text-emerald-950"
                                      : "bg-white border-stone-150 text-stone-700"
                                  }`}
                                >
                                  <span className="font-mono font-black shrink-0">{key}.</span>
                                  <span className="truncate"><MathText content={val} /></span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="text-[11px] text-stone-500 pt-2 border-t border-cream-100 flex items-center justify-between">
                            <span>Đáp án đúng: <strong className="text-emerald-700">{q.correct_answer}</strong></span>
                            <span className="text-[10px] text-stone-400 italic truncate max-w-[200px]">Nguồn: {q.source}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* POP-UP CHỈNH SỬA CÂU HỎI */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-cream-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-cream-200">
              <h3 className="font-bold text-sm text-stone-900">
                Chỉnh Sửa Câu Hỏi #{editingQuestion.id}
              </h3>
              <button
                onClick={() => setEditingQuestion(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Nội dung câu hỏi</label>
                <textarea
                  rows={3}
                  value={editingQuestion.question_text}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, question_text: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {["A", "B", "C", "D"].map((key) => (
                  <div key={key}>
                    <label className="block font-semibold text-stone-600 mb-0.5">Phương án {key}</label>
                    <input
                      type="text"
                      value={editingQuestion.options[key] || ""}
                      onChange={(e) => setEditingQuestion({
                        ...editingQuestion,
                        options: { ...editingQuestion.options, [key]: e.target.value }
                      })}
                      className="w-full p-2 rounded-xl border border-stone-200"
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Đáp án đúng</label>
                  <select
                    value={editingQuestion.correct_answer}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, correct_answer: e.target.value })}
                    className="w-full p-2 rounded-xl border border-stone-200 font-bold text-amber-900"
                  >
                    <option value="A">Đáp án A</option>
                    <option value="B">Đáp án B</option>
                    <option value="C">Đáp án C</option>
                    <option value="D">Đáp án D</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Nguồn đề</label>
                  <input
                    type="text"
                    value={editingQuestion.source}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, source: e.target.value })}
                    className="w-full p-2 rounded-xl border border-stone-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Giải thích vi mô</label>
                <input
                  type="text"
                  value={editingQuestion.micro_explanation}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, micro_explanation: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
