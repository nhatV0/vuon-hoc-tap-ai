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
import SunflowerVisual, { DisplayMode } from "@/components/SunflowerVisual";
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

  // Watering action
  const [isWatering, setIsWatering] = useState<boolean>(false);
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

  const handleWaterClick = async () => {
    if (!student || !garden || garden.water_drops <= 0) return;
    setIsWatering(true);
    try {
      const res = await fetch(`${API_BASE}/api/garden/${student.id}/water`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setWaterToast(data.message);
        setTimeout(() => setWaterToast(null), 3500);
        await fetchStudentData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsWatering(false);
    }
  };
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

          {/* Giữa: Badge Ngọn Lửa Streak Tinh Tế */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 shadow-xs">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
            <span className="text-xs font-extrabold text-amber-900">
              {streakDays} Ngày kỷ luật
            </span>
          </div>

          {/* Phải: Nút Điểm Danh 3 Phút + Avatar Hồ Sơ */}
          {/* Phải: Nút Điểm Danh 3 Phút + Quiz + Avatar Hồ Sơ + Nút Đăng Xuất */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCheckinModal(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Điểm danh</span> (3p)
            </button>

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
        {/* BANNER NGỌN LỬA & HOA HƯỚNG DƯƠNG TINH GIẢN */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/90 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            {/* Lời nhắn ngắn & Trạng thái Streak */}
            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100/70 text-amber-900 text-[10px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-amber-600" />
                Hôm Nay: Ngày {streakDays} Vượt Quán Tính
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
                Chào {student?.name || "bạn học"}, giữ vững ngọn lửa nhé!
              </h1>

              <p className="text-xs sm:text-sm text-stone-600 italic leading-relaxed max-w-lg">
                &ldquo;{garden?.story_message || "Chỉ cần 5 phút hôm nay để giữ cho chuỗi không bị đứt đoạn."}&rdquo;
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-xs">
                <button
                  onClick={handleWaterClick}
                  disabled={isWatering || !garden || garden.water_drops <= 0}
                  className="px-3.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
                  title="Tưới nước để giữ hoa tươi tốt"
                >
                  <Droplets className="w-3.5 h-3.5 fill-sky-500 text-sky-500" />
                  <span>Tưới nước ({garden?.water_drops ?? 0})</span>
                </button>
                {garden?.can_restore_streak && (
                  <button
                    type="button"
                    onClick={handleRestoreStreak}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 animate-pulse"
                    title="Khôi phục lại chuỗi ngày học tập ban đầu"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Khôi phục chuỗi ({garden?.saved_streak_before_break} ngày)</span>
                  </button>
                )}

                <Link
                  href="/planning"
                  className="px-3 py-1.5 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 font-medium flex items-center gap-1 transition-colors"
                >
                  <ListTodo className="w-3.5 h-3.5" />
                  Kế hoạch 7 ngày
                </Link>
              </div>

              {waterToast && (
                <p className="text-xs text-emerald-600 font-medium animate-in fade-in">
                  ✨ {waterToast}
                </p>
              )}
            </div>

            {/* Chậu hoa hướng dương 3D tương tác với công tắc chuyển đổi Chế Độ (Display Mode) */}
            <div className="shrink-0 flex flex-col items-center justify-center">
              <div className="relative flex items-center justify-center">
                <SunflowerVisual
                  state={garden?.current_state || "tich_cuc"}
                  streak={streakDays}
                  waterDrops={garden?.water_drops ?? 0}
                  isWatering={isWatering}
                  size="md"
                  displayMode={gardenDisplayMode}
                  onModeChange={setGardenDisplayMode}
                />
              </div>

              {/* CÔNG TẮC CHUYỂN CHẾ ĐỘ HIỂN THỊ (3D MOTION / ẢNH HD) */}
              <div className="mt-2.5 flex items-center p-0.5 rounded-xl bg-stone-100/90 border border-stone-200/90 shadow-2xs text-[10px]">
                <button
                  type="button"
                  onClick={() => setGardenDisplayMode("3d_motion")}
                  className={`px-2.5 py-0.5 rounded-lg font-bold flex items-center gap-1 transition-all ${
                    gardenDisplayMode === "3d_motion"
                      ? "bg-white text-amber-700 shadow-2xs"
                      : "text-stone-500 hover:text-stone-800"
                  }`}
                  title="Chế độ Hoạt ảnh 3D chuyển động mượt mà 60fps"
                >
                  <Film className="w-2.5 h-2.5 text-amber-500" />
                  <span>3D Motion</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGardenDisplayMode("3d_static")}
                  className={`px-2.5 py-0.5 rounded-lg font-bold flex items-center gap-1 transition-all ${
                    gardenDisplayMode === "3d_static"
                      ? "bg-white text-amber-700 shadow-2xs"
                      : "text-stone-500 hover:text-stone-800"
                  }`}
                  title="Chế độ Ảnh 3D tĩnh sắc nét tách nền"
                >
                  <ImageIcon className="w-2.5 h-2.5 text-blue-500" />
                  <span>Ảnh 3D HD</span>
                </button>
              </div>

              <div className="mt-1.5 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowFlowerShowcase(true)}
                  className="px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold flex items-center gap-1 transition-colors shadow-2xs"
                  title="Mở phòng trưng bày 8 cấp hào quang và hoạt ảnh 3D"
                >
                  <Eye className="w-3 h-3 text-amber-600" />
                  <span>Phòng Trưng Bày Hào Quang</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. BẢNG NHIỆM VỤ HÔM NAY (INTERACTIVE CHECKLIST WITH DISMISS ANIMATION) */}
        <section className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-6 shadow-sm space-y-4">
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
                  Hoàn thành từng mục tiêu vi mô (5 - 10 phút) để giải phóng quán tính
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
            <div className="py-8 px-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 text-center flex flex-col items-center gap-2 animate-in fade-in">
              <span className="text-3xl">🎉</span>
              <h3 className="text-sm font-bold text-emerald-900">
                Xuất sắc! Bạn đã dọn sạch toàn bộ nhiệm vụ hôm nay
              </h3>
              <p className="text-xs text-emerald-800/80 max-w-sm leading-relaxed">
                Ngọn lửa kỷ luật hôm nay đã được bảo toàn trọn vẹn. Hãy dành chút thời gian tĩnh lặng gửi đôi lời tới bản thân trong tương lai bên dưới nhé!
              </p>
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
                      {/* Checkbox tròn tương tác */}
                      <button
                        type="button"
                        onClick={() => handleToggleTask(t)}
                        className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                          isStriked || isSliding || t.is_completed
                            ? "bg-amber-500 border-amber-600 text-white scale-105"
                            : "border-stone-300 hover:border-amber-500 bg-white"
                        }`}
                        title="Đánh dấu hoàn thành"
                      >
                        {(isStriked || isSliding || t.is_completed) && (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        )}
                      </button>

                      {/* Tiêu đề & Thông tin task */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs sm:text-sm font-semibold text-stone-800 transition-all duration-300 truncate ${
                            isStriked || isSliding
                              ? "line-through text-stone-400 decoration-amber-500 decoration-2"
                              : ""
                          }`}
                        >
                          {t.title}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-stone-400 mt-0.5">
                          {t.subject && (
                            <span className="font-medium text-stone-500">{t.subject}</span>
                          )}
                          <span>&bull;</span>
                          <span>{t.duration_minutes} phút</span>
                          {t.tip && (
                            <>
                              <span>&bull;</span>
                              <span className="text-amber-700/80 italic truncate">{t.tip}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-stone-400 bg-white px-2 py-0.5 rounded-md border border-stone-200 shrink-0">
                      Vi mô
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Accordion xem lại các nhiệm vụ đã hoàn thành */}
          {completedTasks.length > 0 && (
            <div className="pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowCompletedAccordion(!showCompletedAccordion)}
                className="text-xs text-stone-500 hover:text-stone-800 font-semibold flex items-center gap-1.5 transition-colors"
              >
                <span>Xem lại {completedTasks.length} nhiệm vụ đã xong hôm nay</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    showCompletedAccordion ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showCompletedAccordion && (
                <div className="space-y-2 mt-3 animate-in fade-in">
                  {completedTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl border border-stone-200 bg-stone-100/50 flex items-center justify-between gap-3 text-xs opacity-75"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span className="line-through text-stone-500 font-medium">{t.title}</span>
                      </div>
                      <button
                        onClick={() => handleToggleTask(t)}
                        title="Bỏ đánh dấu hoàn thành"
                        className="text-[10px] text-stone-400 hover:text-stone-700 flex items-center gap-1"
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
