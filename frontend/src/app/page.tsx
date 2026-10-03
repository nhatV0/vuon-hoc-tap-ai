"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Calendar,
  CheckCircle2,
  Droplets,
  UserCheck,
  ListTodo,
  LogIn,
  LogOut,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import SunflowerVisual from "@/components/SunflowerVisual";
import DailyCheckinModal from "@/components/DailyCheckinModal";
import { Student, GardenStatus, API_BASE } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

export default function StudentGardenDashboard() {
  const { user, logout } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [garden, setGarden] = useState<GardenStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCheckinModal, setShowCheckinModal] = useState<boolean>(false);
  const [isWatering, setIsWatering] = useState<boolean>(false);
  const [waterToast, setWaterToast] = useState<string | null>(null);

  const fetchStudentData = async () => {
    try {
      let sid = localStorage.getItem("sunflower_student_id");

      if (!sid) {
        const res = await fetch(`${API_BASE}/api/onboarding`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: user?.name || "Nguyễn Mai Anh",
            grade: "11",
            target_subject: "Hóa học",
            weakness: "Phương trình hữu cơ",
            long_term_goal: "Đạt 9.0 điểm kỳ 1",
            timeframe: "3 tháng",
            learning_style: "visual",
          }),
        });
        const newStudent = await res.json();
        sid = newStudent.id;
        if (sid) localStorage.setItem("sunflower_student_id", sid);
      }

      if (sid) {
        const [sRes, gRes] = await Promise.all([
          fetch(`${API_BASE}/api/student/${sid}`),
          fetch(`${API_BASE}/api/garden/${sid}`),
        ]);

        if (sRes.ok) setStudent(await sRes.json());
        if (gRes.ok) setGarden(await gRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [user]);

  const handleWaterClick = async () => {
    if (!student || !garden || garden.water_drops <= 0 || isWatering) return;
    setIsWatering(true);
    try {
      const res = await fetch(`${API_BASE}/api/garden/${student.id}/water`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setGarden((prev) =>
          prev
            ? { ...prev, current_state: data.new_state, water_drops: data.water_drops }
            : null
        );
        setWaterToast(data.message);
        setTimeout(() => setWaterToast(null), 3500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsWatering(false), 1200);
    }
  };

  const handleCheckinSuccess = async () => {
    if (!student) return;
    try {
      const gRes = await fetch(`${API_BASE}/api/garden/${student.id}`);
      if (gRes.ok) setGarden(await gRes.json());
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
          <span className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          Đang tải khu vườn...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-800 pb-16 select-none">
      {/* Minimalist Top Bar */}
      <header className="border-b border-stone-200/70 bg-white/70 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌻</span>
            <span className="font-bold text-xs text-stone-900 tracking-tight">
              Hoa Hướng Dương
            </span>
          </div>

          <nav className="flex items-center gap-2 text-xs">
            <Link
              href="/planning"
              className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-medium flex items-center gap-1.5 transition-colors"
            >
              <ListTodo className="w-3.5 h-3.5 text-stone-500" />
              Kế Hoạch 7 Ngày
            </Link>

            <Link
              href="/onboarding"
              className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-medium flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Chẩn Đoán Mới
            </Link>

            <Link
              href="/teacher"
              className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 font-medium flex items-center gap-1.5 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              Giáo Viên
            </Link>

            {user ? (
              <button
                onClick={logout}
                title="Đăng xuất"
                className="p-1.5 rounded-lg border border-stone-200 hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            ) : (
              <Link
                href="/auth"
                className="px-3 py-1.5 rounded-lg bg-stone-900 text-white font-medium flex items-center gap-1.5 hover:bg-stone-800 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                Đăng Nhập
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Main Container Bento Layout */}
      <main className="max-w-5xl mx-auto px-4 mt-6 space-y-5">
        {/* Compact Welcome & Mood Action Strip */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-900">
                {student?.name || "Bạn học"}
              </span>
              <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                Lớp {student?.grade} • {student?.target_subject}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Mục tiêu: <span className="text-stone-800 font-medium">{student?.long_term_goal}</span>
            </p>
          </div>

          <button
            onClick={() => setShowCheckinModal(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5" />
            Điểm Danh Cảm Xúc (5 Phút)
          </button>
        </div>

        {/* 2-Column Bento Box */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* CỘT TRÁI: KHU VƯỜN & HOA HƯỚNG DƯƠNG */}
          <div className="md:col-span-5 bg-white rounded-2xl border border-stone-200 p-5 flex flex-col items-center shadow-xs">
            <div className="w-full flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700">Chậu Cây Học Tập</span>
              <div className="flex items-center gap-1 text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full">
                <Droplets className="w-3.5 h-3.5 fill-sky-500 text-sky-500" />
                <span>{garden?.water_drops ?? 0} giọt</span>
              </div>
            </div>

            {/* Sunflower Vector Visual */}
            {garden && (
              <SunflowerVisual
                state={garden.current_state}
                streak={garden.consecutive_days}
                waterDrops={garden.water_drops}
                isWatering={isWatering}
              />
            )}

            {waterToast && (
              <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg text-center mt-1">
                {waterToast}
              </div>
            )}

            <button
              onClick={handleWaterClick}
              disabled={!garden || garden.water_drops <= 0 || isWatering}
              className="w-full mt-3 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white font-semibold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <Droplets className="w-3.5 h-3.5 fill-white" />
              Tưới Nước (-1 giọt)
            </button>

            {/* Subtle Healing Note */}
            {garden && (
              <div className="mt-4 p-3 bg-stone-50 border border-stone-200 rounded-xl w-full text-xs text-stone-600 leading-relaxed italic">
                &ldquo;{garden.story_message}&rdquo;
              </div>
            )}
          </div>

          {/* CỘT PHẢI: NHIỆM VỤ VI MÔ & TIẾN TRÌNH */}
          <div className="md:col-span-7 space-y-4">
            {/* Quick Task List */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-bold text-stone-900">
                    5 Nhiệm Vụ Hôm Nay (5 - 10 Phút)
                  </h3>
                </div>

                <Link
                  href="/planning"
                  className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-0.5"
                >
                  Xem kế hoạch 7 ngày
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-2">
                {student?.roadmap?.initial_daily_tasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl border border-stone-200 bg-stone-50/50 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-stone-200/80 text-stone-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {task.id}
                      </span>
                      <span className="font-medium text-stone-800">{task.title}</span>
                    </div>
                    <span className="text-[10px] text-stone-400 font-semibold shrink-0">
                      {task.duration_minutes}m
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3 Milestones Timeline */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold text-stone-900">
                  Lộ Trình 3 Chặng Mốc
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {student?.roadmap?.milestones.map((m) => (
                  <div
                    key={m.stage}
                    className="p-3 rounded-xl border border-stone-200 bg-stone-50/30 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-stone-800">
                        Chặng {m.stage}
                      </span>
                      <span className="text-[9px] font-semibold text-amber-800 bg-amber-100/70 px-1.5 py-0.2 rounded">
                        {m.duration}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                      {m.goal}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Checkin Dialog */}
      {showCheckinModal && student && (
        <DailyCheckinModal
          studentId={student.id}
          studentName={student.name}
          targetSubject={student.target_subject}
          onCheckinSuccess={handleCheckinSuccess}
          onClose={() => setShowCheckinModal(false)}
        />
      )}
    </div>
  );
}
