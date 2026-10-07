"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertTriangle,
  Users,
  HeartPulse,
  RefreshCw,
  Sparkles,
  LogOut,
  ShieldCheck,
  UserPlus,
  Trash2,
  Edit3
} from "lucide-react";
import {
  TeacherDashboardData,
  StudentAlertItem,
  TeacherQuizStatsItem,
  AdminOverviewData,
  API_BASE
} from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import CentralizedQuestionManager from "@/components/CentralizedQuestionManager";

export default function TeacherDashboardPage() {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();
  const [data, setData] = useState<TeacherDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterMode, setFilterMode] = useState<"all" | "alert">("alert");
  const [activeTab, setActiveTab] = useState<"students" | "quiz_injector" | "admin_panel">("students");
  const [selectedStudent, setSelectedStudent] = useState<StudentAlertItem | null>(null);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("ALL");

  // Admin Panel states
  const [adminData, setAdminData] = useState<AdminOverviewData | null>(null);
  const [newTeacherForm, setNewTeacherForm] = useState({
    name: "",
    email: "",
    password: "password123",
    assigned_classes: "12A1",
  });
  const [newStudentForm, setNewStudentForm] = useState({
    name: "",
    grade: "12",
    classroom: "12A1",
    target_subject: "Toán học",
  });
  const [newClassForm, setNewClassForm] = useState({ id: "", name: "", grade: "12" });
  const [adminMsg, setAdminMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [quizStats, setQuizStats] = useState<TeacherQuizStatsItem[]>([]);
  const fetchDashboardData = useCallback(async (classFilter: string = "ALL") => {
    setLoading(true);
    try {
      const token = localStorage.getItem("sunflower_auth_token");
      const url =
        classFilter === "ALL"
          ? `${API_BASE}/api/teacher/dashboard`
          : `${API_BASE}/api/teacher/dashboard?classroom=${classFilter}`;
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchQuizStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/quiz/teacher/stats`);
      if (res.ok) {
        const json = await res.json();
        setQuizStats(json);
      }
    } catch (err) {
      console.error("Failed to load quiz stats:", err);
    }
  }, []);

  const fetchAdminData = useCallback(async () => {
    if (user?.role !== "admin") return;
    try {
      const token = localStorage.getItem("sunflower_auth_token");
      const res = await fetch(`${API_BASE}/api/admin/overview`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        setAdminData(json);
      }
    } catch (err) {
      console.error(err);
    }
  }, [user?.role]);

  useEffect(() => {
    if (!authLoading) {
      if (!user || (user.role !== "teacher" && user.role !== "admin")) {
        router.push("/auth");
        return;
      }
      fetchDashboardData(selectedClassFilter);
      fetchQuizStats();
      if (user.role === "admin") {
        fetchAdminData();
      }
    }
  }, [authLoading, user, router, selectedClassFilter, fetchDashboardData, fetchQuizStats, fetchAdminData]);
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
            Về Trang Chủ
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xl">{user?.role === "admin" ? "🛡️" : "👩‍🏫"}</span>
            <span className="font-bold text-sm text-stone-800">
              {user?.role === "admin"
                ? "Hệ Thống Quản Trị Phân Lớp & Điều Hành Học Đường"
                : "Bảng Giám Sát Học Sinh Theo Lớp Phụ Trách"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchDashboardData(selectedClassFilter);
                if (user?.role === "admin") fetchAdminData();
              }}
              className="p-2 rounded-lg border border-cream-200 bg-white hover:bg-cream-50 text-stone-600 text-xs flex items-center gap-1.5 transition-colors"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Làm Mới
            </button>

            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Đăng xuất khỏi hệ thống"
            >
              <LogOut className="w-3.5 h-3.5" />
              Đăng Xuất
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between border-t border-cream-100 overflow-x-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("students")}
              className={`px-4 py-2.5 font-bold text-xs flex items-center gap-2 border-b-2 transition-all shrink-0 ${
                activeTab === "students"
                  ? "border-amber-600 text-amber-900 bg-amber-50/50"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              <Users className="w-4 h-4" />
              Học Sinh Theo Lớp ({data?.total_students || 0})
            </button>
            <button
              onClick={() => setActiveTab("quiz_injector")}
              className={`px-4 py-2.5 font-bold text-xs flex items-center gap-2 border-b-2 transition-all shrink-0 ${
                activeTab === "quiz_injector"
                  ? "border-amber-600 text-amber-900 bg-amber-50/50"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              <Sparkles className="w-4 h-4 text-orange-500" />
              Nạp & Quản Lý Câu Hỏi
            </button>
            {user?.role === "admin" && (
              <button
                onClick={() => {
                  setActiveTab("admin_panel");
                  fetchAdminData();
                }}
                className={`px-4 py-2.5 font-bold text-xs flex items-center gap-2 border-b-2 transition-all shrink-0 ${
                  activeTab === "admin_panel"
                    ? "border-amber-600 text-amber-900 bg-amber-50/50"
                    : "border-transparent text-purple-700 hover:text-purple-900"
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                Quản Trị Admin (Thêm/Xóa GV, HS & Phân Lớp)
              </button>
            )}
          </div>

          {/* Lọc Lớp Học */}
          {activeTab === "students" && (
            <div className="flex items-center gap-2 py-1.5 shrink-0">
              <span className="text-[11px] font-bold text-stone-500">Lớp:</span>
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-cream-200 bg-white font-semibold text-stone-700"
              >
                <option value="ALL">Tất cả lớp phụ trách</option>
                {user?.assigned_classes?.filter(c => c !== "ALL").map(c => (
                  <option key={c} value={c}>Lớp {c}</option>
                ))}
                {user?.role === "admin" && (adminData?.classes_list || ["12A1", "12A2", "12A3", "11B1", "11B2", "10C1"]).map(c => (
                  <option key={c} value={c}>Lớp {c}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 mt-6 space-y-6">
        {activeTab === "students" ? (
          <>
            {/* Banner Thống kê */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-cream-200 p-5 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-sunflower-100 text-sunflower-warm flex items-center justify-center text-xl">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-stone-400 font-medium">Tổng Học Sinh Theo Dõi</p>
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

            {/* Bảng Danh Sách Học Sinh */}
            <div className="bg-white rounded-2xl border border-cream-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-cream-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-stone-800 text-sm">Danh Sách Học Sinh Phụ Trách</h3>
                  <p className="text-xs text-stone-400">
                    Phát hiện sớm các dấu hiệu căng thẳng hoặc tụt dốc động lực
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFilterMode("alert")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      filterMode === "alert"
                        ? "bg-rose-500 text-white"
                        : "bg-cream-100 text-stone-600 hover:bg-cream-200"
                    }`}
                  >
                    Cần Chú Ý ({data?.alert_students_count ?? 0})
                  </button>
                  <button
                    onClick={() => setFilterMode("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      filterMode === "all"
                        ? "bg-stone-800 text-white"
                        : "bg-cream-100 text-stone-600 hover:bg-cream-200"
                    }`}
                  >
                    Tất Cả ({data?.total_students ?? 0})
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-700">
                  <thead className="bg-cream-50/60 border-b border-cream-200 text-stone-500 font-medium">
                    <tr>
                      <th className="py-3 px-4">Họ và Tên</th>
                      <th className="py-3 px-4">Lớp</th>
                      <th className="py-3 px-4">Môn Mục Tiêu</th>
                      <th className="py-3 px-4">Trạng Thái Hoa</th>
                      <th className="py-3 px-4">Streak</th>
                      <th className="py-3 px-4">Lần Điểm Danh Cuối</th>
                      <th className="py-3 px-4">Chẩn Đoán Tâm Lý</th>
                      <th className="py-3 px-4 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-100 font-normal">
                    {displayedStudents.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-stone-400 italic">
                          Không có học sinh nào trong danh mục này.
                        </td>
                      </tr>
                    ) : (
                      displayedStudents.map((s) => (
                        <tr key={s.student_id} className="hover:bg-cream-50/50 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-stone-800">
                            {s.student_name}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-amber-900">
                            Lớp {s.classroom || "12A1"}
                          </td>
                          <td className="py-3.5 px-4">{s.target_subject}</td>
                          <td className="py-3.5 px-4">
                            <span className="capitalize">{s.current_state.replace("_", " ")}</span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-amber-600">
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
                              className="px-3 py-1 rounded-lg border border-cream-200 hover:border-amber-400 bg-white text-stone-700 hover:text-amber-900 text-xs font-medium transition-colors"
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
        ) : activeTab === "quiz_injector" ? (
          /* TAB 2: NẠP & QUẢN LÝ CÂU HỎI THEO MÔN (KHO LƯU TRỮ TẬP TRUNG) */
          <CentralizedQuestionManager
            user={user}
            quizStats={quizStats}
            onStatsRefresh={fetchQuizStats}
          />
        ) : (
          /* TAB 3: ADMIN PANEL (QUẢN TRỊ VIÊN: THÊM/XÓA GIÁO VIÊN & HỌC SINH, PHÂN LỚP) */
          <div className="space-y-6 animate-in fade-in duration-200">
            {adminMsg && (
              <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between ${
                adminMsg.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-900" : "bg-rose-50 border border-rose-200 text-rose-800"
              }`}>
                <span>{adminMsg.text}</span>
                <button onClick={() => setAdminMsg(null)} className="text-stone-400 hover:text-stone-700">✕</button>
              </div>
            )}

            {/* Thống kê Quản trị */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-cream-200 p-4 shadow-xs">
                <p className="text-[11px] font-bold text-stone-400 uppercase">Tổng Giáo Viên</p>
                <h4 className="text-2xl font-black text-purple-700 mt-1">{adminData?.total_teachers ?? 0}</h4>
              </div>
              <div className="bg-white rounded-2xl border border-cream-200 p-4 shadow-xs">
                <p className="text-[11px] font-bold text-stone-400 uppercase">Tổng Học Sinh</p>
                <h4 className="text-2xl font-black text-amber-600 mt-1">{adminData?.total_students ?? 0}</h4>
              </div>
              <div className="bg-white rounded-2xl border border-cream-200 p-4 shadow-xs">
                <p className="text-[11px] font-bold text-stone-400 uppercase">Tổng Số Lớp Học</p>
                <h4 className="text-2xl font-black text-emerald-600 mt-1">{adminData?.total_classes ?? 0}</h4>
              </div>
              <div className="bg-white rounded-2xl border border-cream-200 p-4 shadow-xs">
                <p className="text-[11px] font-bold text-stone-400 uppercase">Danh Mục Lớp Hiện Có</p>
                <p className="text-xs font-bold text-stone-700 mt-1 truncate">
                  {adminData?.classes_list.join(", ") || "Chưa có"}
                </p>
              </div>
            </div>

            {/* KHỐI QUẢN LÝ LỚP HỌC (ADMIN THÊM LỚP MỚI) */}
            <div className="bg-white rounded-3xl border border-cream-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-cream-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                    🏫
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-stone-900">Quản Lý Danh Mục Lớp Học</h3>
                    <p className="text-[11px] text-stone-500">Admin tạo lớp học mới để phân bổ cho Giáo viên & Học sinh</p>
                  </div>
                </div>
              </div>

              {/* Form Thêm Lớp Mới */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newClassForm.id.trim()) return;
                  try {
                    const token = localStorage.getItem("sunflower_auth_token");
                    const res = await fetch(`${API_BASE}/api/admin/classrooms`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                      },
                      body: JSON.stringify({
                        id: newClassForm.id.trim().toUpperCase(),
                        name: newClassForm.name.trim() || `Lớp ${newClassForm.id.trim().toUpperCase()}`,
                        grade: newClassForm.grade
                      })
                    });
                    const json = await res.json();
                    if (!res.ok) throw new Error(json.detail || "Không thể thêm lớp học");
                    setAdminMsg({ text: `🎉 Đã thêm lớp học mới: ${newClassForm.id.toUpperCase()}`, type: "success" });
                    setNewClassForm({ id: "", name: "", grade: "12" });
                    fetchAdminData();
                  } catch (err: unknown) {
                    setAdminMsg({ text: err instanceof Error ? err.message : "Đã có lỗi xảy ra", type: "error" });
                  }
                }}
                className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex flex-wrap items-center gap-3 text-xs"
              >
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-[11px] font-bold text-emerald-950 mb-1">Mã Lớp Học *</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 12A4, 11B3, 10A1..."
                    value={newClassForm.id}
                    onChange={(e) => setNewClassForm({ ...newClassForm, id: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-white font-bold text-emerald-900"
                    required
                  />
                </div>

                <div className="flex-1 min-w-[160px]">
                  <label className="block text-[11px] font-bold text-emerald-950 mb-1">Tên Hiển Thị (Tùy chọn)</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Lớp 12A4 Chuyên Tin"
                    value={newClassForm.name}
                    onChange={(e) => setNewClassForm({ ...newClassForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-white"
                  />
                </div>

                <div className="w-[100px]">
                  <label className="block text-[11px] font-bold text-emerald-950 mb-1">Khối Lớp</label>
                  <select
                    value={newClassForm.grade}
                    onChange={(e) => setNewClassForm({ ...newClassForm, grade: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-white font-semibold"
                  >
                    <option value="12">Khối 12</option>
                    <option value="11">Khối 11</option>
                    <option value="10">Khối 10</option>
                  </select>
                </div>

                <div className="self-end pt-1">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
                  >
                    + Thêm Lớp Mới
                  </button>
                </div>
              </form>

              {/* Danh sách lớp hiện tại */}
              <div className="flex flex-wrap gap-2 pt-2">
                {adminData?.classes_list.map((cName) => (
                  <div
                    key={cName}
                    className="px-3.5 py-1.5 rounded-xl bg-cream-50 border border-cream-200 text-xs font-bold text-stone-800 flex items-center gap-2 shadow-2xs"
                  >
                    <span>Lớp {cName}</span>
                    <button
                      onClick={async () => {
                        if (!confirm(`Bạn có chắc chắn muốn xóa lớp ${cName}?`)) return;
                        try {
                          const token = localStorage.getItem("sunflower_auth_token");
                          const res = await fetch(`${API_BASE}/api/admin/classrooms/${cName}`, {
                            method: "DELETE",
                            headers: { Authorization: `Bearer ${token}` }
                          });
                          const json = await res.json();
                          if (!res.ok) throw new Error(json.detail || "Không thể xóa lớp");
                          setAdminMsg({ text: `Đã xóa lớp ${cName}`, type: "success" });
                          fetchAdminData();
                        } catch (err: unknown) {
                          setAdminMsg({ text: err instanceof Error ? err.message : "Đã có lỗi xảy ra", type: "error" });
                        }
                      }}
                      className="text-stone-300 hover:text-rose-600 transition-colors"
                      title="Xóa lớp học"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CỘT 1: QUẢN LÝ GIÁO VIÊN & PHÂN LỚP */}
              <div className="bg-white rounded-3xl border border-cream-200 p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-cream-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                      👩‍🏫
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-stone-900">Danh Sách Giáo Viên & Lớp Phụ Trách</h3>
                      <p className="text-[11px] text-stone-500">Giáo viên chỉ xem được học sinh thuộc lớp được gán</p>
                    </div>
                  </div>
                </div>

                {/* Form Thêm Giáo Viên */}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      const token = localStorage.getItem("sunflower_auth_token");
                      const classesArr = newTeacherForm.assigned_classes
                        .split(",")
                        .map(c => c.trim().toUpperCase())
                        .filter(Boolean);

                      const res = await fetch(`${API_BASE}/api/admin/teachers`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({
                          name: newTeacherForm.name,
                          email: newTeacherForm.email,
                          password: newTeacherForm.password,
                          assigned_classes: classesArr.length > 0 ? classesArr : ["12A1"]
                        })
                      });
                      const json = await res.json();
                      if (!res.ok) throw new Error(json.detail || "Không thể tạo tài khoản giáo viên");
                      setAdminMsg({ text: `🎉 Đã thêm giáo viên ${newTeacherForm.name} thành công!`, type: "success" });
                      setNewTeacherForm({ name: "", email: "", password: "password123", assigned_classes: "12A1" });
                      fetchAdminData();
                    } catch (err: unknown) {
                      setAdminMsg({ text: err instanceof Error ? err.message : "Đã có lỗi xảy ra", type: "error" });
                    }
                  }}
                  className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-3 text-xs"
                >
                  <p className="font-bold text-purple-950 flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-purple-600" />
                    Thêm Mới Giáo Viên & Phân Lớp (Admin)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      placeholder="Họ tên Giáo viên"
                      value={newTeacherForm.name}
                      onChange={(e) => setNewTeacherForm({ ...newTeacherForm, name: e.target.value })}
                      className="p-2 rounded-xl border border-stone-200 bg-white"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Tài khoản / Email (ví dụ: gv_toan)"
                      value={newTeacherForm.email}
                      onChange={(e) => setNewTeacherForm({ ...newTeacherForm, email: e.target.value })}
                      className="p-2 rounded-xl border border-stone-200 bg-white"
                      required
                    />
                    <input
                      type="password"
                      placeholder="Mật khẩu khởi tạo"
                      value={newTeacherForm.password}
                      onChange={(e) => setNewTeacherForm({ ...newTeacherForm, password: e.target.value })}
                      className="p-2 rounded-xl border border-stone-200 bg-white"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Lớp phân công (cách nhau dấu phẩy: 12A1, 12A2)"
                      value={newTeacherForm.assigned_classes}
                      onChange={(e) => setNewTeacherForm({ ...newTeacherForm, assigned_classes: e.target.value })}
                      className="p-2 rounded-xl border border-stone-200 bg-white font-bold text-purple-900"
                      required
                    />
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors shadow-xs"
                    >
                      Thêm Giáo Viên Mới
                    </button>
                  </div>
                </form>

                {/* Danh sách giáo viên hiện tại */}
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto">
                  {adminData?.teachers.map((t) => (
                    <div key={t.id} className="p-3.5 rounded-2xl border border-cream-200 bg-cream-50/50 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-stone-900">{t.name}</p>
                          <span className="text-[10px] text-stone-400 font-mono bg-white px-2 py-0.5 rounded-md border border-cream-200">
                            {t.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] text-stone-500">Lớp phụ trách:</span>
                          <span className="font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                            {t.assigned_classes.join(", ") || "Chưa gán"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={async () => {
                            const newClasses = prompt(`Nhập danh sách lớp mới cho giáo viên ${t.name} (cách nhau dấu phẩy):`, t.assigned_classes.join(", "));
                            if (newClasses === null) return;
                            try {
                              const token = localStorage.getItem("sunflower_auth_token");
                              const arr = newClasses.split(",").map(c => c.trim().toUpperCase()).filter(Boolean);
                              const res = await fetch(`${API_BASE}/api/admin/teachers/${t.id}`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                body: JSON.stringify({ assigned_classes: arr })
                              });
                              if (!res.ok) throw new Error("Không thể cập nhật lớp");
                              setAdminMsg({ text: `Đã phân công lại lớp cho ${t.name}: ${arr.join(", ")}`, type: "success" });
                              fetchAdminData();
                            } catch (err: unknown) {
                              setAdminMsg({ text: err instanceof Error ? err.message : "Đã có lỗi xảy ra", type: "error" });
                            }
                          }}
                          className="p-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 text-stone-600 transition-colors"
                          title="Phân lại lớp"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-stone-600" />
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm(`Bạn có chắc chắn muốn xóa tài khoản giáo viên ${t.name}?`)) return;
                            try {
                              const token = localStorage.getItem("sunflower_auth_token");
                              const res = await fetch(`${API_BASE}/api/admin/teachers/${t.id}`, {
                                method: "DELETE",
                                headers: { Authorization: `Bearer ${token}` }
                              });
                              if (!res.ok) throw new Error("Không thể xóa");
                              setAdminMsg({ text: `Đã xóa giáo viên ${t.name}`, type: "success" });
                              fetchAdminData();
                            } catch (err: unknown) {
                              setAdminMsg({ text: err instanceof Error ? err.message : "Đã có lỗi xảy ra", type: "error" });
                            }
                          }}
                          className="p-2 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors"
                          title="Xóa giáo viên"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CỘT 2: QUẢN LÝ HỌC SINH & PHÂN LỚP */}
              <div className="bg-white rounded-3xl border border-cream-200 p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-cream-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                      🎓
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-stone-900">Danh Sách Học Sinh & Phân Lớp</h3>
                      <p className="text-[11px] text-stone-500">Admin có quyền thêm, đổi lớp hoặc xóa học sinh</p>
                    </div>
                  </div>
                </div>

                {/* Form Thêm Học Sinh */}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      const token = localStorage.getItem("sunflower_auth_token");
                      const res = await fetch(`${API_BASE}/api/admin/students`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({
                          name: newStudentForm.name,
                          grade: newStudentForm.grade,
                          classroom: newStudentForm.classroom.trim().toUpperCase(),
                          target_subject: newStudentForm.target_subject
                        })
                      });
                      const json = await res.json();
                      if (!res.ok) throw new Error(json.detail || "Không thể thêm học sinh");
                      setAdminMsg({ text: `🎉 Đã thêm học sinh ${newStudentForm.name} vào lớp ${newStudentForm.classroom}!`, type: "success" });
                      setNewStudentForm({ name: "", grade: "12", classroom: "12A1", target_subject: "Toán học" });
                      fetchAdminData();
                      fetchDashboardData(selectedClassFilter);
                    } catch (err: unknown) {
                      setAdminMsg({ text: err instanceof Error ? err.message : "Đã có lỗi xảy ra", type: "error" });
                    }
                  }}
                  className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-3 text-xs"
                >
                  <p className="font-bold text-amber-950 flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-amber-600" />
                    Thêm Học Sinh Trực Tiếp (Admin)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      placeholder="Họ tên Học sinh"
                      value={newStudentForm.name}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, name: e.target.value })}
                      className="p-2 rounded-xl border border-stone-200 bg-white"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Lớp phân bổ (ví dụ: 12A1)"
                      value={newStudentForm.classroom}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, classroom: e.target.value })}
                      className="p-2 rounded-xl border border-stone-200 bg-white font-bold text-amber-900"
                      required
                    />
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors shadow-xs"
                    >
                      Thêm Học Sinh Vào Lớp
                    </button>
                  </div>
                </form>

                {/* Danh sách học sinh và nút chuyển lớp / xóa */}
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto">
                  {adminData?.students.map((s) => (
                    <div key={s.student_id} className="p-3.5 rounded-2xl border border-cream-200 bg-cream-50/50 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-stone-900">{s.student_name}</p>
                          <span className="font-bold text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded-md border border-amber-200">
                            Lớp {s.classroom || "12A1"}
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-500 mt-0.5">
                          Môn: {s.target_subject} • Streak: {s.consecutive_days} ngày
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={async () => {
                            const newClass = prompt(`Chuyển học sinh ${s.student_name} sang lớp:`, s.classroom || "12A1");
                            if (!newClass) return;
                            try {
                              const token = localStorage.getItem("sunflower_auth_token");
                              const res = await fetch(`${API_BASE}/api/admin/students/${s.student_id}/classroom`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                body: JSON.stringify({ classroom: newClass.trim().toUpperCase() })
                              });
                              if (!res.ok) throw new Error("Không thể chuyển lớp");
                              setAdminMsg({ text: `Đã chuyển ${s.student_name} sang lớp ${newClass.toUpperCase()}`, type: "success" });
                              fetchAdminData();
                              fetchDashboardData(selectedClassFilter);
                            } catch (err: unknown) {
                              setAdminMsg({ text: err instanceof Error ? err.message : "Đã có lỗi xảy ra", type: "error" });
                            }
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                          title="Đổi lớp học"
                        >
                          <Edit3 className="w-3 h-3" />
                          Đổi Lớp
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm(`Bạn có chắc chắn muốn xóa học sinh ${s.student_name}?`)) return;
                            try {
                              const token = localStorage.getItem("sunflower_auth_token");
                              const res = await fetch(`${API_BASE}/api/admin/students/${s.student_id}`, {
                                method: "DELETE",
                                headers: { Authorization: `Bearer ${token}` }
                              });
                              if (!res.ok) throw new Error("Không thể xóa");
                              setAdminMsg({ text: `Đã xóa học sinh ${s.student_name}`, type: "success" });
                              fetchAdminData();
                              fetchDashboardData(selectedClassFilter);
                            } catch (err: unknown) {
                              setAdminMsg({ text: err instanceof Error ? err.message : "Đã có lỗi xảy ra", type: "error" });
                            }
                          }}
                          className="p-2 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors"
                          title="Xóa học sinh"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
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
                <p className="text-xs text-stone-500">
                  Lớp {selectedStudent.classroom || selectedStudent.grade} • Môn: {selectedStudent.target_subject}
                </p>
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
                  <p className="text-stone-600 italic">
                    &ldquo;Suy ngẫm gần nhất: {selectedStudent.latest_reflection}&rdquo;
                  </p>
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
