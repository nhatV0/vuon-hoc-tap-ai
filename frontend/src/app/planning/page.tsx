"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Circle, Clock, Plus, Trash2, Target, Play, Pause } from "lucide-react";
import { API_BASE, PlanningOverview, PlannedTask } from "@/lib/types";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function PlanningPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<PlanningOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeDay, setActiveDay] = useState<number>(1);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  useEffect(() => {
    if (user?.role === "teacher" || user?.role === "admin") {
      router.replace("/teacher");
    }
  }, [user, router]);
  // New task form state
  const [newTitle, setNewTitle] = useState<string>("");
  const [newDuration, setNewDuration] = useState<number>(15);
  const [newCategory, setNewCategory] = useState<string>("Bài tập");

  // Pomodoro focus timer
  const [activeTimerTask, setActiveTimerTask] = useState<PlannedTask | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  const fetchPlanning = React.useCallback(async () => {
    try {
      let sid = localStorage.getItem("sunflower_student_id");
      if (!sid) {
        // Fallback default student
        const resOnboard = await fetch(`${API_BASE}/api/onboarding`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Học Sinh Mới",
            grade: "10",
            target_subject: "Toán học",
            weakness: "Hình học không gian",
            long_term_goal: "Đạt 8.5+ điểm học kỳ",
            timeframe: "3 tháng"
          }),
        });
        const created = await resOnboard.json();
        sid = created.id;
        if (sid) localStorage.setItem("sunflower_student_id", sid);
      }

      if (sid) {
        const res = await fetch(`${API_BASE}/api/planning/${sid}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlanning();
  }, [fetchPlanning]);

  // Timer interval
  const toggleTaskCompletion = React.useCallback(async (taskId: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`${API_BASE}/api/planning/task/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_completed: !currentStatus }),
      });
      if (res.ok) {
        fetchPlanning();
      }
    } catch (e) {
      console.error(e);
    }
  }, [fetchPlanning]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isTimerRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isTimerRunning && activeTimerTask) {
      setIsTimerRunning(false);
      toggleTaskCompletion(activeTimerTask.id, true);
      alert(`Tuyệt vời! Bạn đã hoàn thành nhiệm vụ: "${activeTimerTask.title}"!`);
      setActiveTimerTask(null);
    }
    return () => {
      clearInterval(interval);
    };
  }, [isTimerRunning, secondsLeft, activeTimerTask, toggleTaskCompletion]);

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm("Bạn có chắc muốn xóa nhiệm vụ này?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/planning/task/${taskId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchPlanning();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const sid = localStorage.getItem("sunflower_student_id");
    if (!sid || !newTitle.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/api/planning/${sid}/task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          duration_minutes: newDuration,
          category: newCategory,
          day_offset: activeDay,
        }),
      });

      if (res.ok) {
        setNewTitle("");
        setShowAddModal(false);
        fetchPlanning();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const startTaskTimer = (task: PlannedTask) => {
    setActiveTimerTask(task);
    setSecondsLeft(task.duration_minutes * 60);
    setIsTimerRunning(true);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
          <span className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          Đang tải kế hoạch học tập...
        </div>
      </div>
    );
  }

  const currentTasks = data?.tasks_by_day[activeDay] || [];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-800 pb-20 select-none">
      {/* Header */}
      <header className="border-b border-stone-200/70 bg-white/70 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Vườn hoa
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-base">📋</span>
            <span className="font-bold text-xs text-stone-800">
              Kế Hoạch Hành Động 7 Ngày • {data?.student_name}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[11px] text-stone-400">Tiến độ:</span>
            <span className="font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              {data?.completion_percentage ?? 0}% ({data?.completed_tasks}/{data?.total_tasks})
            </span>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="max-w-5xl mx-auto px-4 mt-6 space-y-6">
        {/* Active Timer Box if running */}
        {activeTimerTask && (
          <div className="p-4 rounded-2xl bg-stone-900 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-mono font-bold text-sm">
                {formatTimer(secondsLeft)}
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-100">{activeTimerTask.title}</p>
                <p className="text-[11px] text-stone-400">Đang tập trung giải quyết ({activeTimerTask.category})</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-medium flex items-center gap-1"
              >
                {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isTimerRunning ? "Tạm dừng" : "Tiếp tục"}
              </button>
              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setActiveTimerTask(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs text-stone-400"
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        {/* 7-Day Tab Navigator */}
        <div className="bg-white rounded-2xl border border-stone-200 p-2 flex gap-1 overflow-x-auto shadow-xs">
          {[1, 2, 3, 4, 5, 6, 7].map((d) => {
            const count = data?.tasks_by_day[d]?.length || 0;
            const completedInDay = data?.tasks_by_day[d]?.filter((t) => t.is_completed).length || 0;
            const isSelected = activeDay === d;

            return (
              <button
                key={d}
                onClick={() => setActiveDay(d)}
                className={`flex-1 min-w-[90px] py-2.5 px-3 rounded-xl text-left transition-all ${
                  isSelected
                    ? "bg-stone-900 text-white shadow-xs"
                    : "hover:bg-stone-100/70 text-stone-600"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>Ngày {d}</span>
                  {completedInDay === count && count > 0 && (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  )}
                </div>
                <div className={`text-[10px] mt-0.5 ${isSelected ? "text-stone-300" : "text-stone-400"}`}>
                  {completedInDay}/{count} việc
                </div>
              </button>
            );
          })}
        </div>

        {/* Tasks List for Selected Day */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Nhiệm Vụ Ngày {activeDay} • Môn {data?.target_subject}
              </h3>
              <p className="text-xs text-stone-400">
                Hoàn thành từng việc nhỏ 5-15 phút để tích lũy năng lượng đón ánh mặt trời
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm Việc Mới
            </button>
          </div>

          <div className="space-y-2">
            {currentTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-400 border border-dashed border-stone-200 rounded-xl">
                Chưa có nhiệm vụ nào cho ngày {activeDay}. Bấm &ldquo;Thêm Việc Mới&rdquo; để lên kế hoạch nhẹ nhàng!
              </div>
            ) : (
              currentTasks.map((t) => (
                <div
                  key={t.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    t.is_completed
                      ? "bg-stone-50 border-stone-200 text-stone-400"
                      : "bg-white hover:border-amber-300 border-stone-200 text-stone-800"
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => toggleTaskCompletion(t.id, t.is_completed)}
                      className="text-stone-400 hover:text-amber-600 transition-colors"
                    >
                      {t.is_completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                      ) : (
                        <Circle className="w-5 h-5 text-stone-300 hover:text-stone-400" />
                      )}
                    </button>

                    <div>
                      <div className={`text-xs font-semibold ${t.is_completed ? "line-through text-stone-400" : "text-stone-800"}`}>
                        {t.title}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-stone-400">
                        <span className="px-1.5 py-0.2 rounded bg-stone-100 font-medium text-stone-600">
                          {t.category}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />
                          {t.duration_minutes} phút
                        </span>
                        {t.tip && <span className="italic">• {t.tip}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!t.is_completed && (
                      <button
                        onClick={() => startTaskTimer(t)}
                        title="Bấm giờ tập trung Pomodoro"
                        className="p-1.5 rounded-lg border border-stone-200 hover:border-amber-400 text-amber-600 bg-amber-50/50 hover:bg-amber-100 text-xs flex items-center gap-1 transition-colors"
                      >
                        <Play className="w-3 h-3 fill-amber-600" />
                        <span className="text-[10px] font-semibold">Tập trung</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteTask(t.id)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3 Milestones Snapshot */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold text-stone-800">
              3 Chặng Mốc Hướng Đến Mục Tiêu Lớn ({data?.long_term_goal})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {data?.milestones.map((m) => (
              <div key={m.stage} className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/40 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-stone-800">{m.title}</span>
                  <span className="text-[10px] font-semibold text-amber-800 bg-amber-100/70 px-1.5 py-0.2 rounded">
                    {m.duration}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">{m.goal}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Modal Thêm Nhiệm Vụ Mới */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/30 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200 p-6 shadow-lg space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-stone-900">
                Thêm Nhiệm Vụ Cho Ngày {activeDay}
              </h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-6 h-6 rounded-full bg-stone-100 text-stone-400 hover:text-stone-700 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nội dung nhiệm vụ nhỏ
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Ôn lại 2 bài tập hình học cơ bản..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Thời lượng (phút)
                  </label>
                  <select
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value={5}>5 phút (Cực nhanh)</option>
                    <option value={10}>10 phút (Vi mô)</option>
                    <option value={15}>15 phút (Chuẩn)</option>
                    <option value={25}>25 phút (Pomodoro)</option>
                    <option value={45}>45 phút (Sâu)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Phân loại
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="Lý thuyết">Lý thuyết</option>
                    <option value="Bài tập">Bài tập</option>
                    <option value="Ôn luyện">Ôn luyện</option>
                    <option value="Nghỉ ngơi">Nghỉ ngơi / Thư giãn</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-500"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors"
                >
                  Lưu Nhiệm Vụ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
