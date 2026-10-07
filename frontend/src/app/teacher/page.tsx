"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, Users, HeartPulse, RefreshCw, Sparkles, BarChart2, SendHorizontal } from "lucide-react";
import { TeacherDashboardData, StudentAlertItem, TeacherQuizStatsItem, API_BASE } from "@/lib/types";

export default function TeacherDashboardPage() {
  const [data, setData] = useState<TeacherDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterMode, setFilterMode] = useState<"all" | "alert">("alert");
  const [activeTab, setActiveTab] = useState<"students" | "quiz_injector">("students");
  const [selectedStudent, setSelectedStudent] = useState<StudentAlertItem | null>(null);

  // Quiz injector form state
  const [quizStats, setQuizStats] = useState<TeacherQuizStatsItem[]>([]);
  const [isInjecting, setIsInjecting] = useState<boolean>(false);
  const [injectSuccess, setInjectSuccess] = useState<string | null>(null);
  const [injectForm, setInjectForm] = useState({
    block: "A00",
    subject: "Toán học",
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

  const fetchQuizStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/quiz/teacher/stats`);
      if (res.ok) {
        const json = await res.json();
        setQuizStats(json);
      }
    } catch (err) {
      console.error("Failed to load quiz stats:", err);
    }
  };
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/teacher/dashboard`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchQuizStats();
  }, []);

  const handleInjectQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!injectForm.question_text || !injectForm.optA || !injectForm.optB) {
      alert("Vui lòng nhập nội dung câu hỏi và các phương án trả lời!");
      return;
    }

    try {
      setIsInjecting(true);
      setInjectSuccess(null);
      const res = await fetch(`${API_BASE}/api/quiz/inject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          block: injectForm.block,
          subject: injectForm.subject,
          source: injectForm.source,
          bloom_level: injectForm.bloom_level,
          lock_condition: injectForm.lock_condition,
          time_limit_seconds: injectForm.time_limit_seconds,
          question_text: injectForm.question_text,
          options: {
            A: injectForm.optA,
            B: injectForm.optB,
            C: injectForm.optC || "",
            D: injectForm.optD || "",
          },
          correct_answer: injectForm.correct_answer,
          micro_explanation: injectForm.micro_explanation,
          growth_mindset_tip: injectForm.growth_mindset_tip,
          teacher_id: "GV_ADMIN",
        }),
      });

      if (!res.ok) {
        throw new Error("Không thể nạp câu hỏi mới.");
      }

      setInjectSuccess("🎉 Đã nạp thành công câu hỏi vào Slot Trống! Câu hỏi sẽ xuất hiện ngay trong phiên Quiz tối nay của học sinh.");
      setInjectForm({
        block: "A00",
        subject: "Toán học",
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
      fetchQuizStats();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setIsInjecting(false);
    }
  };

  const displayedStudents = filterMode === "alert"
    ? data?.students_needing_attention || []
    : data?.all_students || [];

  return (
    <div className="min-h-screen bg-cream-50 text-stone-800 pb-20">
      {/* Top Header */}
      <header className="border-b border-cream-200 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Về Khu Vườn Học Sinh
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xl">👩‍🏫</span>
            <span className="font-bold text-sm text-stone-800">Bảng Giám Sát Tâm Lý & Tiến Độ Học Đường</span>
          </div>

          <button
            onClick={fetchDashboardData}
            className="p-2 rounded-lg border border-cream-200 bg-white hover:bg-cream-50 text-stone-600 text-xs flex items-center gap-1.5 transition-colors"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Làm Mới
          </button>
        </div>

        <div className="max-w-6xl mx-auto px-4 flex items-center gap-2 border-t border-cream-100">
          <button
            onClick={() => setActiveTab("students")}
            className={`px-4 py-2.5 font-bold text-xs flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "students"
                ? "border-amber-600 text-amber-900 bg-amber-50/50"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            <Users className="w-4 h-4" />
            Giám Sát Tâm Lý ({data?.total_students || 0} học sinh)
          </button>
          <button
            onClick={() => setActiveTab("quiz_injector")}
            className={`px-4 py-2.5 font-bold text-xs flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "quiz_injector"
                ? "border-amber-600 text-amber-900 bg-amber-50/50"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            <Sparkles className="w-4 h-4 text-orange-500" />
            Nạp Đề Mới & Slot Trống Động (Quiz Injector)
          </button>
        </div>
      </header>
      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 mt-6 space-y-6">
        {activeTab === "students" ? (
          <>
            {/* Banner Tổng Quan Sức Khỏe Tinh Thần Lớp Học */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-cream-200 p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sunflower-100 text-sunflower-warm flex items-center justify-center text-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-stone-400 font-medium">Tổng Số Học Sinh</p>
              <h3 className="text-2xl font-bold text-stone-800">{data?.total_students ?? 0}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center text-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-rose-500 font-medium">Học Sinh Cần Quan Tâm</p>
              <h3 className="text-2xl font-bold text-rose-600">{data?.alert_students_count ?? 0}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-emerald-600 font-medium">Trạng Thái Tích Cực / Nở Hoa</p>
              <h3 className="text-2xl font-bold text-emerald-700">{data?.healthy_students_count ?? 0}</h3>
            </div>
          </div>
        </div>

        {/* Bảng Danh Sách Học Sinh Kèm Bộ Lọc */}
        <div className="bg-white rounded-2xl border border-cream-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-cream-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-stone-800 text-sm">Danh Sách Học Sinh Theo Dõi</h3>
              <p className="text-xs text-stone-400">Phát hiện sớm các dấu hiệu căng thẳng hoặc bỏ bê học tập</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterMode("alert")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  filterMode === "alert"
                    ? "bg-rose-50 text-rose-700 border border-rose-200 font-semibold"
                    : "bg-cream-50 text-stone-600 hover:bg-cream-100 border border-cream-200"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Cần quan tâm ({data?.alert_students_count ?? 0})
              </button>
              <button
                onClick={() => setFilterMode("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterMode === "all"
                    ? "bg-sunflower-50 text-sunflower-800 border border-sunflower-300 font-semibold"
                    : "bg-cream-50 text-stone-600 hover:bg-cream-100 border border-cream-200"
                }`}
              >
                Tất cả ({data?.total_students ?? 0})
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50/70 text-stone-500 border-b border-cream-200 font-medium">
                <tr>
                  <th className="py-3 px-4">Họ và tên</th>
                  <th className="py-3 px-4">Lớp & Môn</th>
                  <th className="py-3 px-4">Trạng thái hoa</th>
                  <th className="py-3 px-4">Streak</th>
                  <th className="py-3 px-4">Lần cuối check-in</th>
                  <th className="py-3 px-4">Tín hiệu đánh giá</th>
                  <th className="py-3 px-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {displayedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-stone-400">
                      Không có học sinh nào trong nhóm này.
                    </td>
                  </tr>
                ) : (
                  displayedStudents.map((s) => (
                    <tr key={s.student_id} className="hover:bg-cream-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-stone-800">
                        {s.student_name}
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">
                        Lớp {s.grade} • {s.target_subject}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          s.current_state === "cham_hoc" ? "bg-amber-100 text-amber-800 border border-amber-300" :
                          s.current_state === "tich_cuc" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                          s.current_state === "thieu_nuoc" ? "bg-sky-100 text-sky-800 border border-sky-300" :
                          "bg-stone-200 text-stone-700 border border-stone-300"
                        }`}>
                          {s.current_state === "cham_hoc" && "🌻 Chăm học"}
                          {s.current_state === "tich_cuc" && "🌱 Tích cực"}
                          {s.current_state === "thieu_nuoc" && "💧 Thiếu nước"}
                          {s.current_state === "heo_kho" && "❄️ Héo khô"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-stone-700">
                        {s.consecutive_days} ngày
                      </td>
                      <td className="py-3.5 px-4 text-stone-500">
                        {s.days_since_last_checkin === 0 ? "Hôm nay" : `${s.days_since_last_checkin} ngày trước`}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium ${
                          s.severity === "high" ? "bg-rose-50 text-rose-700 border border-rose-200 font-semibold" :
                          s.severity === "medium" ? "bg-amber-50 text-amber-800 border border-amber-200" :
                          "bg-cream-100 text-stone-600"
                        }`}>
                          {s.alert_reason}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedStudent(s)}
                          className="px-3 py-1 rounded-lg border border-cream-200 hover:border-sunflower-warm bg-white text-stone-700 hover:text-amber-900 text-xs font-medium transition-colors"
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </>
        ) : (
          /* TAB 2: NẠP ĐỀ THI VÀO SLOT TRỐNG ĐỘNG */
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Nạp Câu Hỏi */}
              <div className="lg:col-span-2 bg-white rounded-3xl border border-cream-200 p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-cream-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                      ⚡
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-stone-900">
                        Nạp Đề Mới Vào Slot Trống Chờ (Dynamic Injector)
                      </h3>
                      <p className="text-[11px] text-stone-500">
                        Phân phối ngay vào bài làm trắc nghiệm 3 câu mỗi tối lúc 21h30
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] uppercase">
                    Quy Trình 60s
                  </span>
                </div>

                {injectSuccess && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold leading-relaxed">
                    {injectSuccess}
                  </div>
                )}

                <form onSubmit={handleInjectQuizSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Khối Áp Dụng</label>
                      <select
                        value={injectForm.block}
                        onChange={(e) => setInjectForm({ ...injectForm, block: e.target.value })}
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
                      <input
                        type="text"
                        value={injectForm.subject}
                        onChange={(e) => setInjectForm({ ...injectForm, subject: e.target.value })}
                        placeholder="Ví dụ: Toán học / Tiếng Anh"
                        className="w-full p-2.5 rounded-xl border border-stone-200 bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Điều Kiện Mở Khóa</label>
                      <select
                        value={injectForm.lock_condition}
                        onChange={(e) => setInjectForm({ ...injectForm, lock_condition: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-stone-200 bg-white font-medium"
                      >
                        <option value="MOTUDO">Xuất hiện cho toàn bộ học sinh</option>
                        <option value="YEUCAUSTREAK30NGAY">Chỉ dành cho Streak &ge; 30 ngày (Boss)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Nguồn Đề Thi / Trích Dẫn</label>
                    <input
                      type="text"
                      value={injectForm.source}
                      onChange={(e) => setInjectForm({ ...injectForm, source: e.target.value })}
                      placeholder="Ví dụ: Đề Tốt nghiệp THPT Chính thức 2026 - Mã đề 101 - Câu 38"
                      className="w-full p-2.5 rounded-xl border border-stone-200 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Nội Dung Câu Hỏi Trắc Nghiệm</label>
                    <textarea
                      rows={3}
                      value={injectForm.question_text}
                      onChange={(e) => setInjectForm({ ...injectForm, question_text: e.target.value })}
                      placeholder="Gõ hoặc dán nội dung câu hỏi mới vào đây..."
                      className="w-full p-3 rounded-2xl border border-stone-200 bg-white resize-none"
                      required
                    />
                  </div>

                  {/* 4 Phương án */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-stone-600 mb-1">Phương Án A</label>
                      <input
                        type="text"
                        value={injectForm.optA}
                        onChange={(e) => setInjectForm({ ...injectForm, optA: e.target.value })}
                        placeholder="Nội dung đáp án A"
                        className="w-full p-2 rounded-xl border border-stone-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-stone-600 mb-1">Phương Án B</label>
                      <input
                        type="text"
                        value={injectForm.optB}
                        onChange={(e) => setInjectForm({ ...injectForm, optB: e.target.value })}
                        placeholder="Nội dung đáp án B"
                        className="w-full p-2 rounded-xl border border-stone-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-stone-600 mb-1">Phương Án C</label>
                      <input
                        type="text"
                        value={injectForm.optC}
                        onChange={(e) => setInjectForm({ ...injectForm, optC: e.target.value })}
                        placeholder="Nội dung đáp án C"
                        className="w-full p-2 rounded-xl border border-stone-200"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-stone-600 mb-1">Phương Án D</label>
                      <input
                        type="text"
                        value={injectForm.optD}
                        onChange={(e) => setInjectForm({ ...injectForm, optD: e.target.value })}
                        placeholder="Nội dung đáp án D"
                        className="w-full p-2 rounded-xl border border-stone-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Đáp Án Đúng</label>
                      <select
                        value={injectForm.correct_answer}
                        onChange={(e) => setInjectForm({ ...injectForm, correct_answer: e.target.value })}
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
                        value={injectForm.micro_explanation}
                        onChange={(e) => setInjectForm({ ...injectForm, micro_explanation: e.target.value })}
                        placeholder="Chỉ rõ bẫy và tư duy giải nhanh..."
                        className="w-full p-2.5 rounded-xl border border-stone-200 bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isInjecting}
                      className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
                    >
                      <SendHorizontal className="w-4 h-4" />
                      {isInjecting ? "Đang Nạp Đề..." : "Nạp Đề Vào Slot Trống Ngay"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Bảng Thống Kê Điểm Nghẽn Câu Hỏi */}
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
                        <p className="text-stone-700 font-medium line-clamp-2">
                          {st.question_text}
                        </p>
                        <p className="text-[10px] text-stone-400">
                          {st.total_attempts} lượt làm • {st.wrong_count} lần mắc bẫy
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>


      {/* Modal Chi Tiết Học Sinh & Gợi Ý Giáo Viên Hỗ Trợ */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-cream-200 p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-stone-800">{selectedStudent.student_name}</h3>
                <p className="text-xs text-stone-500">Lớp {selectedStudent.grade} • Môn: {selectedStudent.target_subject}</p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="w-7 h-7 rounded-full bg-cream-100 text-stone-400 hover:text-stone-700 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-cream-50 border border-cream-200 space-y-1">
                <p className="font-semibold text-stone-700">Tình trạng ghi nhận:</p>
                <p className="text-rose-600 font-medium">{selectedStudent.alert_reason}</p>
                {selectedStudent.latest_reflection && (
                  <p className="text-stone-600 italic">&ldquo;Suy ngẫm gần nhất: {selectedStudent.latest_reflection}&rdquo;</p>
                )}
              </div>

              <div className="p-3 rounded-xl bg-sunflower-50/70 border border-sunflower-200 space-y-1">
                <p className="font-semibold text-sunflower-900">Gợi ý tâm lý học đường dành cho thầy cô:</p>
                <p className="text-stone-700 leading-relaxed">
                  Hãy chủ động gặp riêng em trong giờ giải lao 5 phút với thái độ lắng nghe, không chất vấn: 
                  &ldquo;Thầy/cô thấy dạo này em có vẻ mệt mỏi, môn {selectedStudent.target_subject} có phần nào làm em thấy quá tải không? Chúng ta có thể cùng chia nhỏ bài tập ra nhé!&rdquo;
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-xl bg-sunflower-warm text-white font-medium hover:bg-amber-600 text-xs transition-colors"
              >
                Đã ghi nhận hỗ trợ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
