"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, Users, HeartPulse, RefreshCw } from "lucide-react";
import { TeacherDashboardData, StudentAlertItem, API_BASE } from "@/lib/types";

export default function TeacherDashboardPage() {
  const [data, setData] = useState<TeacherDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterMode, setFilterMode] = useState<"all" | "alert">("alert");
  const [selectedStudent, setSelectedStudent] = useState<StudentAlertItem | null>(null);

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
  }, []);

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
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 mt-6 space-y-6">
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
      </main>
    </div>
  );
}
