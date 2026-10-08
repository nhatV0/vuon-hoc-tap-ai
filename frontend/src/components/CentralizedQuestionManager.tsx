"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  SendHorizontal,
  BarChart2,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  CheckCircle2
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

const BLOOM_LEVELS = [
  "Nhận biết (45s)",
  "Thông hiểu (60s)",
  "Vận dụng (75s)",
  "Vận dụng cao 8+ (90s)"
];

const ITEMS_PER_PAGE = 8;

export default function CentralizedQuestionManager({
  user,
  quizStats,
  onStatsRefresh
}: CentralizedQuestionManagerProps) {
  const [groupedQuestions, setGroupedQuestions] = useState<SubjectQuestionGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSubjectTab, setSelectedSubjectTab] = useState<string>("ALL");
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestionAdmin | null>(null);

  // Expanded question IDs (chỉ hiện câu hỏi, bấm vào mới bung đáp án)
  const [expandedQuestionIds, setExpandedQuestionIds] = useState<Set<string>>(new Set());

  // Search & Filter & Pagination states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState<number>(1);

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
    bloom_level: "Nhận biết (45s)",
    lock_condition: "MOTUDO",
    time_limit_seconds: 45,
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

  // Tự động điều chỉnh time_limit_seconds theo mức Bloom
  const handleBloomLevelChange = (level: string) => {
    let seconds = 60;
    if (level.includes("45s") || level.includes("Nhận biết")) seconds = 45;
    else if (level.includes("60s") || level.includes("Thông hiểu")) seconds = 60;
    else if (level.includes("75s") || level.includes("Vận dụng")) seconds = 75;
    else if (level.includes("90s") || level.includes("Vận dụng cao")) seconds = 90;

    setForm((prev) => ({
      ...prev,
      bloom_level: level,
      time_limit_seconds: seconds
    }));
  };

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
        bloom_level: "Nhận biết (45s)",
        lock_condition: "MOTUDO",
        time_limit_seconds: 45,
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
          bloom_level: editingQuestion.bloom_level,
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

  const toggleExpand = (qId: string) => {
    setExpandedQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  // Lọc và phân trang câu hỏi để tránh tràn trang khi số lượng câu hỏi tăng cao
  const filteredQuestions = useMemo(() => {
    const list: (QuizQuestionAdmin & { subjectGroup: string })[] = [];
    groupedQuestions.forEach((grp) => {
      if (selectedSubjectTab === "ALL" || grp.subject === selectedSubjectTab) {
        grp.questions.forEach((q) => {
          const matchQuery =
            !searchQuery.trim() ||
            q.question_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.id.toLowerCase().includes(searchQuery.toLowerCase());

          const matchLevel =
            selectedLevelFilter === "ALL" ||
            q.bloom_level.toLowerCase().includes(selectedLevelFilter.toLowerCase());

          if (matchQuery && matchLevel) {
            list.push({ ...q, subjectGroup: grp.subject });
          }
        });
      }
    });
    return list;
  }, [groupedQuestions, selectedSubjectTab, searchQuery, selectedLevelFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE));
  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredQuestions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredQuestions, currentPage]);

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
        {/* KHỐI 1: FORM NẠP CÂU HỎI MỚI (ĐẦY ĐỦ 4 PHÂN LOẠI BLOOM) */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
                    {["Toán học", "Vật lí", "Hóa học", "Sinh học", "Ngữ văn", "Tiếng Anh", "Lịch sử", "Địa lí", "Tin học", "GDKT & PL", "Công nghệ"].map(sub => (
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

              {/* PHÂN LOẠI DẠNG CÂU HỎI (BLOOM) */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">Phân Loại Dạng Câu *</label>
                <select
                  value={form.bloom_level}
                  onChange={(e) => handleBloomLevelChange(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-amber-300 bg-amber-50/40 font-bold text-amber-950"
                  required
                >
                  {BLOOM_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Điều Kiện Mở Khóa</label>
                <select
                  value={form.lock_condition}
                  onChange={(e) => setForm({ ...form, lock_condition: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-white font-medium"
                >
                  <option value="MOTUDO">Tự do cho học sinh</option>
                  <option value="YEUCAUSTREAK30NGAY">Khóa 30 Ngày (Boss 8.5+)</option>
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

      {/* KHỐI 3: MỤC CÂU HỎI ĐÃ TẠO (DẠNG ACCORDION TINH GỌN, CHỈ HIỆN ĐÁP ÁN KHI ẤN VÀO, CÓ TÌM KIẾM & PHÂN TRANG) */}
      <div className="bg-white rounded-3xl border border-cream-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-3 border-b border-cream-200 gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
              📚
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-900">
                Mục Câu Hỏi Đã Tạo (Kho Lưu Trữ Tập Trung)
              </h3>
              <p className="text-[11px] text-stone-500">
                Giao diện tinh gọn: Bấm vào câu hỏi để mở rộng phương án • Tìm kiếm & phân trang thông minh
              </p>
            </div>
          </div>

          {/* Thanh Filter Môn Học */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 max-w-full">
            <button
              onClick={() => {
                setSelectedSubjectTab("ALL");
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedSubjectTab === "ALL"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "bg-cream-100 text-stone-600 hover:bg-cream-200"
              }`}
            >
              Tất Cả ({groupedQuestions.reduce((acc, g) => acc + g.total_count, 0)})
            </button>
            {groupedQuestions.map((grp) => (
              <button
                key={grp.subject}
                onClick={() => {
                  setSelectedSubjectTab(grp.subject);
                  setCurrentPage(1);
                }}
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

        {/* Thanh Công Cụ Tìm Kiếm & Lọc Dạng Câu */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-cream-50/60 p-3 rounded-2xl border border-cream-200">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
            <input
              type="text"
              placeholder="Tìm theo nội dung, nguồn đề..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Filter className="w-3.5 h-3.5 text-stone-500 shrink-0" />
            <span className="text-[11px] font-bold text-stone-500">Mức độ:</span>
            <select
              value={selectedLevelFilter}
              onChange={(e) => {
                setSelectedLevelFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1 text-xs rounded-xl border border-stone-200 bg-white font-medium"
            >
              <option value="ALL">Tất cả mức độ</option>
              <option value="Nhận biết">Nhận biết</option>
              <option value="Thông hiểu">Thông hiểu</option>
              <option value="Vận dụng">Vận dụng</option>
              <option value="Vận dụng cao">Vận dụng cao 8+</option>
            </select>
          </div>
        </div>

        {/* Danh Sách Câu Hỏi Dạng Thu Gọn (Click để xem đáp án) */}
        {loading ? (
          <div className="py-12 text-center text-xs text-stone-400">
            Đang tải dữ liệu ngân hàng câu hỏi...
          </div>
        ) : paginatedQuestions.length === 0 ? (
          <div className="py-12 text-center text-xs text-stone-400 italic">
            Không tìm thấy câu hỏi nào phù hợp với bộ lọc.
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedQuestions.map((q, idx) => {
              const isExpanded = expandedQuestionIds.has(q.id);
              const canManage = user?.role === "admin" || (q.creator_id && q.creator_id === user?.id);
              const overallIdx = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;

              return (
                <div
                  key={q.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isExpanded
                      ? "bg-white border-amber-300 shadow-sm"
                      : "bg-cream-50/40 border-cream-200 hover:bg-white hover:border-amber-200"
                  }`}
                >
                  {/* Header Row: Câu hỏi (click để đóng/mở) */}
                  <div
                    onClick={() => toggleExpand(q.id)}
                    className="p-4 cursor-pointer flex items-start justify-between gap-3 select-none"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[11px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                          #{overallIdx} • {q.subjectGroup} • {q.block}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                          q.bloom_level.includes("cao")
                            ? "bg-rose-100 text-rose-800"
                            : q.bloom_level.includes("Vận dụng")
                            ? "bg-orange-100 text-orange-800"
                            : q.bloom_level.includes("Thông hiểu")
                            ? "bg-blue-100 text-blue-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {q.bloom_level}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          Nguồn: {q.source}
                        </span>
                      </div>

                      {/* Nội dung câu hỏi gọn gàng */}
                      <div className="text-xs font-semibold text-stone-900 leading-relaxed pt-1">
                        <MathText content={q.question_text} />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-1" onClick={(e) => e.stopPropagation()}>
                      {/* Nút Sửa / Xóa */}
                      {canManage && (
                        <div className="flex items-center gap-1">
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
                        </div>
                      )}

                      {/* Nút Chevron bung mở */}
                      <button
                        onClick={() => toggleExpand(q.id)}
                        className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
                        title={isExpanded ? "Thu gọn đáp án" : "Xem các đáp án"}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-amber-700" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* VÙNG ĐÁP ÁN: CHỈ HIỂN THỊ KHI BẤM VÀO */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-cream-100 bg-cream-50/30 space-y-3 animate-in fade-in duration-150 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Object.entries(q.options || {}).map(([key, val]) => {
                          const isCorrect = q.correct_answer === key;
                          return (
                            <div
                              key={key}
                              className={`p-2 rounded-xl border flex items-start gap-2 transition-all ${
                                isCorrect
                                  ? "bg-emerald-50 border-emerald-300 font-bold text-emerald-950 shadow-2xs"
                                  : "bg-white border-stone-200 text-stone-700"
                              }`}
                            >
                              <span className={`w-5 h-5 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 ${
                                isCorrect ? "bg-emerald-600 text-white" : "bg-stone-100 text-stone-600"
                              }`}>
                                {key}
                              </span>
                              <div className="flex-1 pt-0.5 leading-relaxed">
                                <MathText content={val} />
                              </div>
                              {isCorrect && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Giải thích vi mô */}
                      {q.micro_explanation && (
                        <div className="p-2.5 rounded-xl bg-white border border-cream-200 text-[11px] text-stone-700 leading-relaxed">
                          <strong className="text-amber-900">💡 Giải thích vi mô:</strong>{" "}
                          <MathText content={q.micro_explanation} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* PHÂN TRANG (PAGINATION) ĐỂ TRÁNH TRANG QUÁ DÀI */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-cream-200 text-xs text-stone-600">
            <span className="text-[11px]">
              Hiển thị {((currentPage - 1) * ITEMS_PER_PAGE) + 1} -{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredQuestions.length)} trên tổng{" "}
              <strong>{filteredQuestions.length}</strong> câu
            </span>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 font-semibold"
              >
                Trước
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                <button
                  key={pNum}
                  onClick={() => setCurrentPage(pNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    currentPage === pNum
                      ? "bg-amber-500 text-white shadow-xs"
                      : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  {pNum}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 font-semibold"
              >
                Sau
              </button>
            </div>
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

              <div>
                <label className="block font-bold text-stone-700 mb-1">Phân loại dạng câu</label>
                <select
                  value={editingQuestion.bloom_level}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, bloom_level: e.target.value })}
                  className="w-full p-2 rounded-xl border border-stone-200 bg-white"
                >
                  {BLOOM_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
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
