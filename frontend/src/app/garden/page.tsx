"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Sparkles,
  Calendar,
  CheckCircle2,
  Droplets,
  ListTodo,
  Flame,
  Mail,
  Archive,
  PenLine,
  Check,
  ChevronDown,
  RotateCcw,
  Clock,
  LogOut,
  Eye,
  Film,
  Image as ImageIcon
} from "lucide-react";
import SunflowerVisual, { DisplayMode, getStreakBadgeStyle } from "@/components/SunflowerVisual";
import FlowerShowcaseModal from "@/components/FlowerShowcaseModal";
import DailyCheckinModal from "@/components/DailyCheckinModal";
import UserProfileModal from "@/components/UserProfileModal";
import TimeCapsuleVaultModal from "@/components/TimeCapsuleVaultModal";
import DailyMicroQuizModal from "@/components/DailyMicroQuizModal";
import { Student, GardenStatus, API_BASE, PlannedTask } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

interface AnimatedTaskItem extends PlannedTask {
  animState?: "idle" | "striked" | "sliding" | "hidden";
}
export default function StudentGardenDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [garden, setGarden] = useState<GardenStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [showCheckinModal, setShowCheckinModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showCapsuleVault, setShowCapsuleVault] = useState<boolean>(false);
  const [capsuleVaultMode, setCapsuleVaultMode] = useState<"list" | "compose">("list");
  const [showQuizModal, setShowQuizModal] = useState<boolean>(false);
  const [showFlowerShowcase, setShowFlowerShowcase] = useState<boolean>(false);
  const [gardenDisplayMode, setGardenDisplayMode] = useState<DisplayMode>("3d_motion");

  // Notification toast
  const [waterToast, setWaterToast] = useState<string | null>(null);

  // Tasks checklist state
  const [tasks, setTasks] = useState<AnimatedTaskItem[]>([]);
  const [tasksLoading, setTasksLoading] = useState<boolean>(true);
  const [showCompletedAccordion, setShowCompletedAccordion] = useState<boolean>(false);

  // Time capsules count for prompt card
  const [capsuleCount, setCapsuleCount] = useState<number>(0);

  const fetchStudentData = useCallback(async () => {
    try {
      // Nếu là Giáo viên hoặc Quản trị viên, tự động chuyển về /teacher
      if (user?.role === "teacher" || user?.role === "admin") {
        router.replace("/teacher");
        return;
      }

      const storedStudentId = typeof window !== "undefined" 
        ? (localStorage.getItem("sunflower_student_id") || localStorage.getItem("current_student_id"))
        : null;

      // Ưu tiên lấy student_id gắn liền với user đã đăng nhập
      const effectiveId = user?.student_id || storedStudentId;
      if (!effectiveId) {
        // Chưa có hồ sơ học sinh -> chuyển hướng sang Onboarding
        router.push("/onboarding");
        return;
      }
      const res = await fetch(`${API_BASE}/api/student/${effectiveId}`);
      if (!res.ok) {
        router.push("/onboarding");
        return;
      }

      const studentData: Student = await res.json();
      setStudent(studentData);

        const [gRes, planRes, capRes] = await Promise.all([
          fetch(`${API_BASE}/api/garden/${studentData.id}`),
          fetch(`${API_BASE}/api/planning/${studentData.id}`),
          fetch(`${API_BASE}/api/capsule/${studentData.id}`),
        ]);

        if (gRes.ok) {
          const gData = await gRes.json();
          setGarden(gData);
        }

        if (capRes.ok) {
          const capData = await capRes.json();
          setCapsuleCount(Array.isArray(capData) ? capData.length : 0);
        }

        if (planRes.ok) {
          const planData = await planRes.json();
          let loadedTasks: PlannedTask[] = [];
          if (planData.tasks_by_day) {
            const todayTasks = planData.tasks_by_day[1] || planData.tasks_by_day[0] || [];
            if (todayTasks.length > 0) {
              loadedTasks = todayTasks;
            } else {
              const allDays = Object.values(planData.tasks_by_day) as PlannedTask[][];
              loadedTasks = allDays.flat().slice(0, 5);
            }
          }

          if (loadedTasks.length === 0 && studentData.roadmap?.initial_daily_tasks) {
            loadedTasks = studentData.roadmap.initial_daily_tasks.map((t, idx) => ({
              id: t.id || idx + 1,
              student_id: studentData.id,
              title: t.title,
              duration_minutes: t.duration_minutes || 10,
              subject: t.subject || studentData.target_subject,
              category: t.category || "Học tập",
              tip: t.tip,
              is_completed: false,
              day_offset: 1,
              created_at: new Date().toISOString(),
            }));
          }

          setTasks(loadedTasks.map((t) => ({ ...t, animState: "idle" })));
        } else if (studentData.roadmap?.initial_daily_tasks) {
          setTasks(
            studentData.roadmap.initial_daily_tasks.map((t, idx) => ({
              id: t.id || idx + 1,
              student_id: studentData.id,
              title: t.title,
              duration_minutes: t.duration_minutes || 10,
              subject: t.subject || studentData.target_subject,
              category: t.category || "Học tập",
              tip: t.tip,
              is_completed: false,
              day_offset: 1,
              created_at: new Date().toISOString(),
              animState: "idle",
            }))
          );
        }
    } catch (err) {
      console.error("Failed to fetch student data:", err);
    } finally {
      setLoading(false);
      setTasksLoading(false);
    }
  }, [user, router]);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  const handleRestoreStreak = async () => {
    if (!student) return;
    try {
      const res = await fetch(`${API_BASE}/api/garden/${student.id}/restore-streak`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        setWaterToast(`🌟 ${data.message}`);
        setTimeout(() => setWaterToast(null), 4000);
        await fetchStudentData();
      } else {
        const errData = await res.json();
        alert(errData.detail || "Không thể khôi phục chuỗi.");
      }
    } catch (err) {
      console.error("Failed to restore streak:", err);
    }
  };

  const handleCheckinSuccess = async () => {
    setShowCheckinModal(false);
    await fetchStudentData();
  };
  // Interactive Task Completion with 3-stage animation:
  // 1. striked (0ms): line-through text-stone-400 decoration-amber-500
  // 2. sliding (350ms): translate-x, fade out, scale down
  // 3. hidden (650ms): height collapses to 0, marked completed
  const handleToggleTask = async (task: AnimatedTaskItem) => {
    const nextCompleted = !task.is_completed;

    if (nextCompleted) {
      // Step 1: Strike-through immediately
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, animState: "striked" } : t))
      );

      // Step 2: Slide & fade out after 350ms
      setTimeout(() => {
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, animState: "sliding" } : t))
        );
      }, 350);

      // Step 3: Collapse and mark completed after 650ms
      setTimeout(() => {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id
              ? { ...t, is_completed: true, animState: "hidden" }
              : t
          )
        );
      }, 650);
    } else {
      // Uncheck task
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? { ...t, is_completed: false, animState: "idle" }
            : t
        )
      );
    }

    // Call background API
    try {
      await fetch(`${API_BASE}/api/planning/task/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_completed: nextCompleted }),
      });
    } catch (err) {
      console.error("Failed to update task status in background:", err);
    }
  };

  const activeTasks = useMemo(() => {
    return tasks.filter((t) => !t.is_completed || t.animState !== "hidden");
  }, [tasks]);

  const completedTasks = useMemo(() => {
    return tasks.filter((t) => t.is_completed && t.animState === "hidden");
  }, [tasks]);

  const streakDays = garden?.consecutive_days ?? 1;
  const initialLetter = (student?.name || user?.name || "H").trim().charAt(0).toUpperCase();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="text-4xl animate-bounce">🌻</span>
          <p className="text-xs font-semibold text-stone-500">Đang chăm sóc không gian học tập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-800 pb-20 select-none antialiased">
      {/* 1. TOP BAR SIÊU TINH GỌN */}
      <header className="border-b border-stone-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Trái: Logo & Tên ứng dụng */}
          <div className="flex items-center gap-2">
            <span className="text-xl">🌻</span>
            <span className="font-extrabold text-sm text-stone-900 tracking-tight">
              Sunflower
            </span>
          </div>

          {/* Giữa: Badge Ngọn Lửa Streak Đổi Màu Theo Mốc Sinh Trưởng & Hào Quang (Màu xám khi 0 ngày hoặc mất chuỗi) */}
          {(() => {
            const isWilting = garden?.current_state === "thieu_nuoc";
            const badgeStyle = getStreakBadgeStyle(streakDays, isWilting);
            return (
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border shadow-xs transition-all ${badgeStyle.bg} ${badgeStyle.border} ${badgeStyle.text}`}
              >
                <Flame
                  className={`w-4 h-4 transition-all ${badgeStyle.flameFill} ${badgeStyle.flameText}`}
                />
                <span className="text-xs font-extrabold tracking-tight">
                  {badgeStyle.label}
                </span>
              </div>
            );
          })()}
          {/* Phải: Nút Điểm Danh 3 Phút + Avatar Hồ Sơ */}
          {/* Phải: Nút Điểm Danh 3 Phút + Quiz + Avatar Hồ Sơ + Nút Đăng Xuất */}
          <div className="flex items-center gap-2">
            {/* Nút Điểm danh: Phản ánh trạng thái đã điểm danh hôm nay, sẵn sàng điểm danh hoặc chưa xong việc */}
            {garden?.has_checked_in_today ? (
              <div
                className="px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs"
                title="Hôm nay bạn đã thắp sáng chuỗi rồi! Hãy quay lại sau 0h AM ngày mai."
              >
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                <span className="hidden sm:inline">Đã điểm danh</span> (Hôm nay)
              </div>
            ) : (
              <button
                onClick={() => {
                  if (activeTasks.length > 0) {
                    alert(`Bạn còn ${activeTasks.length} nhiệm vụ chưa xong! Hãy hoàn thành toàn bộ nhiệm vụ bên dưới để được điểm danh và cộng chuỗi nhé.`);
                    return;
                  }
                  setShowCheckinModal(true);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 ${
                  activeTasks.length === 0 && tasks.length > 0
                    ? "bg-amber-500 hover:bg-amber-600 text-white animate-pulse"
                    : "bg-stone-200 text-stone-500 hover:bg-stone-300"
                }`}
                title={activeTasks.length > 0 ? `Còn ${activeTasks.length} việc chưa hoàn thành` : "Sẵn sàng điểm danh"}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Điểm danh</span>
                {activeTasks.length > 0 ? ` (${activeTasks.length} việc)` : " (Sẵn sàng)"}
              </button>
            )}

            {/* Nút Kích hoạt Bộ 3 Câu Trắc Nghiệm Nhanh */}
            <button
              onClick={() => setShowQuizModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-xs transition-colors"
              title="Làm 3 câu trắc nghiệm vi mô hôm nay"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Quiz (3p)</span>
            </button>

            {/* Avatar Người Dùng Kích Hoạt Pop-up Hồ Sơ */}
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-1.5 p-1 pl-1.5 pr-2 rounded-full border border-stone-200 bg-white hover:border-amber-400 hover:bg-amber-50/40 transition-all shadow-xs group"
              title="Mở Hồ Sơ & Bảng Phong Thần"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {initialLetter}
              </div>
              <span className="text-xs font-bold text-stone-700 group-hover:text-stone-900 hidden sm:inline max-w-[80px] truncate">
                {student?.name?.split(" ").slice(-1)[0] || "Hồ sơ"}
              </span>
            </button>

            {/* Nút Đăng Xuất Trực Tiếp */}
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  localStorage.removeItem("sunflower_auth_token");
                  localStorage.removeItem("sunflower_student_id");
                  localStorage.removeItem("current_student_id");
                  sessionStorage.clear();
                  window.location.href = "/auth";
                }
              }}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-rose-50 hover:border-rose-200 text-stone-500 hover:text-rose-600 font-semibold text-xs transition-colors flex items-center gap-1"
              title="Đăng xuất khỏi tài khoản"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Thoát</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE TẬP TRUNG */}
      <main className="max-w-3xl mx-auto px-4 mt-6 space-y-6">
        {/* BANNER HOA HƯỚNG DƯƠNG 3D TRUNG TÂM & NỔI BẬT */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/90 shadow-sm relative overflow-hidden flex flex-col items-center text-center space-y-4">
          {/* 1. Huy hiệu Streak Mốc Màu */}
          <div>
            {(() => {
              const isWilting = garden?.current_state === "thieu_nuoc";
              const badgeStyle = getStreakBadgeStyle(streakDays, isWilting);
              return (
                <div
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-2xs ${badgeStyle.bg} ${badgeStyle.border} ${badgeStyle.text}`}
                >
                  <Flame className={`w-3.5 h-3.5 ${badgeStyle.flameFill} ${badgeStyle.flameText}`} />
                  <span>Hôm Nay: {badgeStyle.label}</span>
                </div>
              );
            })()}
          </div>

          {/* 2. CHẬU HOA HƯỚNG DƯƠNG 3D VÀO CHÍNH GIỮA, PHÓNG TO RÕ RÀNG */}
          <div className="relative flex flex-col items-center justify-center my-2">
            <SunflowerVisual
              state={garden?.current_state || "tich_cuc"}
              streak={streakDays}
              waterDrops={garden?.water_drops ?? 0}
              size="lg"
              displayMode={gardenDisplayMode}
              onModeChange={setGardenDisplayMode}
            />

            {/* CÔNG TẮC CHUYỂN CHẾ ĐỘ HIỂN THỊ (3D MOTION / ẢNH HD) */}
            <div className="mt-3 flex items-center p-1 rounded-2xl bg-stone-100/90 border border-stone-200/90 shadow-2xs text-[11px]">
              <button
                type="button"
                onClick={() => setGardenDisplayMode("3d_motion")}
                className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                  gardenDisplayMode === "3d_motion"
                    ? "bg-white text-amber-700 shadow-2xs"
                    : "text-stone-500 hover:text-stone-800"
                }`}
                title="Chế độ Hoạt ảnh 3D: Cây hoa thở nhẹ và chuyển động mượt mà 60fps"
              >
                <Film className="w-3.5 h-3.5 text-amber-500" />
                <span>3D Motion</span>
              </button>

              <button
                type="button"
                onClick={() => setGardenDisplayMode("3d_static")}
                className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                  gardenDisplayMode === "3d_static"
                    ? "bg-white text-amber-700 shadow-2xs"
                    : "text-stone-500 hover:text-stone-800"
                }`}
                title="Chế độ Ảnh 3D HD: Hình ảnh tĩnh độ phân giải cao tách nền sắc nét"
              >
                <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                <span>Ảnh 3D HD</span>
              </button>
            </div>

            <div className="mt-2">
              <button
                type="button"
                onClick={() => setShowFlowerShowcase(true)}
                className="px-3.5 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                title="Xem phòng trưng bày: Chiêm ngưỡng đầy đủ 5 mốc sinh trưởng và 8 cấp độ hào quang tỏa sáng rực rỡ"
              >
                <Eye className="w-3.5 h-3.5 text-amber-600" />
                <span>Phòng Trưng Bày Hào Quang</span>
              </button>
            </div>
          </div>

          {/* 3. Lời chào và Thông điệp truyền cảm hứng */}
          <div className="space-y-1.5 max-w-lg">
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
              Chào {student?.name || "bạn học"}, giữ vững ngọn lửa nhé!
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 italic leading-relaxed">
              &ldquo;{garden?.story_message || "Chỉ cần 5 phút hôm nay để giữ cho chuỗi không bị đứt đoạn."}&rdquo;
            </p>
          </div>

          {/* 4. Các nút hành động chính (Nước thánh, Kế hoạch 7 ngày) */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1 text-xs">
            {/* NÚT NƯỚC THÁNH (LƯỢT KHÔI PHỤC CHUỖI) */}
            <button
              onClick={handleRestoreStreak}
              disabled={!garden?.can_restore_streak}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 ${
                garden?.can_restore_streak
                  ? "bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white animate-pulse"
                  : "bg-sky-50 text-sky-800 border border-sky-200 opacity-90 hover:bg-sky-100"
              }`}
              title={
                garden?.can_restore_streak
                  ? `Nhấn để dùng 1 bình Nước Thánh khôi phục về chuỗi ${garden.saved_streak_before_break} ngày đã mất!`
                  : `Nước Thánh (Vé khôi phục chuỗi): Bạn hiện có ${garden?.grace_passes_available ?? 1} bình. Tặng 1 bình khi bắt đầu và mỗi 30 ngày kiên trì.`
              }
            >
              <Droplets className="w-4 h-4 fill-sky-500 text-sky-500" />
              <span>
                Nước Thánh ({garden?.grace_passes_available ?? 1})
                {garden?.can_restore_streak ? ` • Khôi phục ${garden.saved_streak_before_break}d` : ""}
              </span>
            </button>

            <Link
              href="/planning"
              className="px-4 py-2 rounded-xl text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Mở bảng lộ trình 7 ngày: Lên kế hoạch chi tiết các bước học tập vi mô"
            >
              <ListTodo className="w-4 h-4 text-stone-500" />
              <span>Kế hoạch 7 ngày</span>
            </Link>
          </div>

          {waterToast && (
            <p className="text-xs text-emerald-600 font-medium animate-in fade-in">
              ✨ {waterToast}
            </p>
          )}
        </div>
        {/* 3. BẢNG NHIỆM VỤ HÔM NAY (NẾU ĐÃ HOÀN THÀNH ĐIỂM DANH THÌ ẨN KHUNG NHIỆM VỤ) */}
        {!garden?.has_checked_in_today ? (
          <section className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-6 shadow-sm space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold text-stone-900">
                    Nhiệm Vụ Hôm Nay
                  </h2>
                  <p className="text-[11px] text-stone-500">
                    Hoàn thành toàn bộ mục tiêu vi mô để mở khóa quyền điểm danh và thắp sáng chuỗi
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-stone-100 text-stone-600">
                {completedTasks.length} / {tasks.length} Đã xong
              </span>
            </div>

            {/* Danh sách nhiệm vụ đang làm */}
            {tasksLoading ? (
              <div className="py-8 text-center text-xs text-stone-400 flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 animate-spin text-amber-500" />
                <span>Đang tải các bước vi mô...</span>
              </div>
            ) : activeTasks.length === 0 ? (
              <div className="py-8 px-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 text-center flex flex-col items-center gap-2.5 animate-in fade-in">
                <span className="text-3xl">🎉</span>
                <h3 className="text-sm font-bold text-emerald-900">
                  Xuất sắc! Bạn đã hoàn thành 100% nhiệm vụ hôm nay
                </h3>
                <p className="text-xs text-emerald-800/80 max-w-sm leading-relaxed">
                  Tất cả nhiệm vụ vi mô đã xong! Giờ bạn đã mở khóa quyền điểm danh để cộng chuỗi Streak hôm nay.
                </p>
                <button
                  type="button"
                  onClick={() => setShowCheckinModal(true)}
                  className="mt-1 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  title="Nhấn để bắt đầu 3 phút điểm danh và thắp sáng ngọn lửa ngày mới"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Tiến Hành Điểm Danh Ngay (3 phút)</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {activeTasks.map((t) => {
                  const isStriked = t.animState === "striked";
                  const isSliding = t.animState === "sliding";

                  return (
                    <div
                      key={t.id}
                      className={`p-3.5 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-3 ${
                        isSliding
                          ? "opacity-0 -translate-x-4 scale-95 duration-400 bg-amber-50/40 border-amber-200"
                          : isStriked
                          ? "bg-amber-50/60 border-amber-300 shadow-xs"
                          : "bg-stone-50/50 hover:bg-stone-50 border-stone-200 hover:border-amber-300"
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleToggleTask(t)}
                          className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                            t.is_completed || isStriked
                              ? "bg-amber-500 border-amber-500 text-white"
                              : "border-stone-300 bg-white hover:border-amber-400"
                          }`}
                          title={t.is_completed ? "Đánh dấu chưa hoàn thành" : "Đánh dấu đã hoàn thành nhiệm vụ này"}
                        >
                          {(t.is_completed || isStriked) && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-xs font-semibold text-stone-900 transition-all line-clamp-2 ${
                              isStriked ? "line-through text-stone-400 decoration-amber-500" : ""
                            }`}
                          >
                            {t.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-stone-400">
                            {t.subject && <span className="font-medium text-stone-600">{t.subject}</span>}
                            <span>•</span>
                            <span>{t.duration_minutes} phút</span>
                            {t.tip && (
                              <>
                                <span>•</span>
                                <span className="text-stone-500 italic truncate max-w-[200px]">{t.tip}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 shrink-0">
                        Vi mô
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Accordion nhiệm vụ đã xong */}
            {completedTasks.length > 0 && (
              <div className="pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowCompletedAccordion(!showCompletedAccordion)}
                  className="w-full flex items-center justify-between text-xs text-stone-500 hover:text-stone-800 font-medium py-1"
                  title="Bấm để xem lại hoặc làm lại các nhiệm vụ đã tích hoàn thành"
                >
                  <span>Xem lại {completedTasks.length} nhiệm vụ đã xong hôm nay</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      showCompletedAccordion ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showCompletedAccordion && (
                  <div className="space-y-2 mt-3 animate-in fade-in">
                    {completedTasks.map((t) => (
                      <div
                        key={t.id}
                        className="p-3 rounded-xl bg-stone-50/70 border border-stone-200/60 flex items-center justify-between gap-3 opacity-75"
                      >
                        <span className="text-xs text-stone-500 line-through truncate flex-1">
                          {t.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleTask(t)}
                          className="text-[10px] text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1 hover:underline"
                          title="Hoàn tác để làm lại nhiệm vụ này"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Làm lại
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        ) : (
          /* THÔNG BÁO HOÀN TẤT ĐIỂM DANH HÔM NAY (ẨN BẢNG NHIỆM VỤ ĐỂ KHÔNG GÂY RỐI MẮT) */
          <section className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-3xl border border-emerald-200 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center text-xl shrink-0 shadow-xs">
                ✨
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-emerald-950">
                  Nhiệm vụ & Điểm danh hôm nay đã hoàn tất!
                </h3>
                <p className="text-xs text-emerald-800/85 mt-0.5 leading-relaxed">
                  Bạn đã thắp sáng chuỗi Ngày {streakDays} thành công. Khung nhiệm vụ đã được ẩn đi để bạn nghỉ ngơi thư thái. Hẹn gặp lại bạn sau 0h AM ngày mai!
                </p>
              </div>
            </div>

            <Link
              href="/planning"
              className="px-4 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-900 font-bold text-xs hover:bg-emerald-50 shadow-2xs transition-colors shrink-0"
              title="Xem trước kế hoạch học tập của các ngày tiếp theo"
            >
              Xem Kế Hoạch Ngày Mai
            </Link>
          </section>
        )}

        {/* 4. KHUNG GỢI Ý VIẾT TÂM THƯ GỬI TƯƠNG LAI (TIME CAPSULE PROMPT CARD) */}
        <section className="p-5 sm:p-6 rounded-3xl bg-gradient-to-tr from-amber-50 via-stone-50 to-amber-100/40 border border-amber-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0 shadow-xs">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-extrabold text-stone-900">
                    Tâm Thư Gửi Tương Lai
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900">
                    Mỏ neo cảm xúc
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-0.5 leading-relaxed max-w-lg">
                  Hôm nay bạn có muốn gửi một lá thư nhắn nhủ bản thân trong tương lai không? Mỗi lá thư được phong ấn thời gian thực và mở ra đúng mốc Ngày 21.
                </p>
              </div>
            </div>

            {/* Các nút hành động */}
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
              <button
                onClick={() => {
                  setCapsuleVaultMode("compose");
                  setShowCapsuleVault(true);
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
              >
                <PenLine className="w-3.5 h-3.5" />
                Viết tâm thư ngay ✍️
              </button>

              <button
                onClick={() => {
                  setCapsuleVaultMode("list");
                  setShowCapsuleVault(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Archive className="w-3.5 h-3.5 text-stone-500" />
                Kho Lưu Trữ ({capsuleCount})
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* POP-UP 1: HỒ SƠ NGƯỜI DÙNG & BẢNG PHONG THẦN */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        student={student}
        garden={garden}
        onOpenCapsuleVault={(mode) => {
          setCapsuleVaultMode(mode || "list");
          setShowCapsuleVault(true);
        }}
      />

      {/* POP-UP 2: KHO LƯU TRỮ TÂM THƯ THỜI GIAN THỰC */}
      <TimeCapsuleVaultModal
        isOpen={showCapsuleVault}
        onClose={() => setShowCapsuleVault(false)}
        studentId={student?.id || "hs_demo123"}
        currentStreak={streakDays}
        initialMode={capsuleVaultMode}
        onCapsuleCreated={fetchStudentData}
      />

      {/* POP-UP 3: ĐIỂM DANH 4 TRẠM 3 PHÚT */}
      {showCheckinModal && student && (
        <DailyCheckinModal
          studentId={student.id}
          studentName={student.name}
          targetSubject={student.target_subject}
          onCheckinSuccess={handleCheckinSuccess}
          onClose={() => setShowCheckinModal(false)}
        />
      )}

      {/* POP-UP 4: BỘ 3 CÂU TRẮC NGHIỆM ĐỘNG HẰNG NGÀY (plan-Quest.txt) */}
      {showQuizModal && student && (
        <DailyMicroQuizModal
          isOpen={showQuizModal}
          onClose={() => setShowQuizModal(false)}
          studentId={student.id}
          onQuizCompleted={fetchStudentData}
        />
      )}

      {/* POP-UP 5: PHÒNG TRƯNG BÀY HOA 3D & 8 CẤP ĐỘ HÀO QUANG */}
      <FlowerShowcaseModal
        isOpen={showFlowerShowcase}
        onClose={() => setShowFlowerShowcase(false)}
        currentState={garden?.current_state || "tich_cuc"}
        currentStreak={streakDays}
        waterDrops={garden?.water_drops ?? 0}
        studentName={student?.name}
        gracePassesAvailable={garden?.grace_passes_available ?? 1}
        savedStreakBeforeBreak={garden?.saved_streak_before_break ?? 0}
        canRestoreStreak={garden?.can_restore_streak ?? false}
        onRestoreStreak={handleRestoreStreak}
      />
    </div>
  );
}
