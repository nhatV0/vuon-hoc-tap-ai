"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Calendar, Target, CheckCircle2, Droplets, HeartHandshake, UserCheck } from "lucide-react";
import SunflowerVisual from "@/components/SunflowerVisual";
import DailyCheckinModal from "@/components/DailyCheckinModal";
import { Student, GardenStatus, API_BASE } from "@/lib/types";

export default function StudentGardenDashboard() {
  const [student, setStudent] = useState<Student | null>(null);
  const [garden, setGarden] = useState<GardenStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCheckinModal, setShowCheckinModal] = useState<boolean>(false);
  const [isWatering, setIsWatering] = useState<boolean>(false);
  const [waterToast, setWaterToast] = useState<string | null>(null);

  // Lấy student_id từ localStorage hoặc tải học sinh mẫu
  useEffect(() => {
    const fetchCurrentStudent = async () => {
      try {
        let sid = localStorage.getItem("sunflower_student_id");
        
        // Nếu chưa có học sinh trong localStorage, tự động onboard hoặc lấy học sinh mặc định
        if (!sid) {
          const res = await fetch(`${API_BASE}/api/onboarding`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: "Nguyễn Mai Anh",
              grade: "11",
              target_subject: "Hóa học",
              weakness: "Phương trình phản ứng hữu cơ và este hóa",
              long_term_goal: "Đạt 9.0 điểm tổng kết và tự tin thi Học sinh giỏi",
              timeframe: "3 tháng",
              learning_style: "visual"
            }),
          });
          const newStudent = await res.json();
          sid = newStudent.id;
          if (sid) {
            localStorage.setItem("sunflower_student_id", sid);
          }
        }

        if (sid) {
          const [sRes, gRes] = await Promise.all([
            fetch(`${API_BASE}/api/student/${sid}`),
            fetch(`${API_BASE}/api/garden/${sid}`)
          ]);

          if (sRes.ok) {
            const sData = await sRes.json();
            setStudent(sData);
          }
          if (gRes.ok) {
            const gData = await gRes.json();
            setGarden(gData);
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu học sinh:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentStudent();
  }, []);

  const handleWaterClick = async () => {
    if (!student || !garden || garden.water_drops <= 0 || isWatering) return;

    setIsWatering(true);
    try {
      const res = await fetch(`${API_BASE}/api/garden/${student.id}/water`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setGarden((prev) => prev ? {
          ...prev,
          current_state: data.new_state,
          water_drops: data.water_drops
        } : null);
        setWaterToast(data.message);
        setTimeout(() => setWaterToast(null), 4000);
      } else {
        alert(data.message);
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
      if (gRes.ok) {
        const gData = await gRes.json();
        setGarden(gData);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sunflower-warm border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-stone-600">Đang chuẩn bị khu vườn hoa hướng dương...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 text-stone-800 pb-16">
      {/* Top Navigation */}
      <header className="border-b border-cream-200 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl select-none">🌻</span>
            <div>
              <h1 className="font-bold text-stone-800 text-base leading-none">Trợ Lý Hoa Hướng Dương</h1>
              <span className="text-[11px] text-stone-400">Khu vườn cảm xúc & Học tập cá nhân</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/onboarding"
              className="px-3 py-1.5 rounded-lg border border-cream-200 bg-cream-50 text-stone-700 hover:bg-cream-100 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-sunflower-warm" />
              Tạo Lộ Trình Mới
            </Link>
            <Link
              href="/teacher"
              className="px-3 py-1.5 rounded-lg border border-cream-200 bg-white text-stone-700 hover:bg-cream-50 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-sage-600" />
              Dành Cho Giáo Viên
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 mt-6">
        {/* Banner chào mừng & Thông điệp chữa lành */}
        {student && (
          <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-sunflower-100/60 via-cream-100 to-sage-100/60 border border-sunflower-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-sunflower-warm text-white">
                  Lớp {student.grade}
                </span>
                <h2 className="text-lg font-bold text-stone-800">
                  Chào buổi sáng, {student.name}!
                </h2>
              </div>
              <p className="text-xs text-stone-600 max-w-2xl leading-relaxed">
                Mục tiêu hiện tại: <span className="font-semibold text-stone-800">{student.long_term_goal}</span> (Thời hạn {student.timeframe}) • Môn học: <span className="font-semibold text-stone-800">{student.target_subject}</span>
              </p>
            </div>

            <button
              onClick={() => setShowCheckinModal(true)}
              className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-sunflower-warm text-white font-medium hover:bg-amber-600 transition-all text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              <Calendar className="w-4 h-4" />
              Điểm Danh Cảm Xúc Hôm Nay
            </button>
          </div>
        )}

        {/* Lưới 2 Cột: Bên trái Khu Vườn Cây Hoa, Bên phải Lộ Trình & Nhiệm Vụ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* CỘT TRÁI: KHU VƯỜN CẢM XÚC (Gamification) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-cream-200 p-6 shadow-xs flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-2">
                <h3 className="font-semibold text-stone-800 text-sm flex items-center gap-1.5">
                  <span className="text-lg">🌿</span> Chậu Cây Của Bạn
                </h3>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-sky-50 border border-sky-200 rounded-full text-xs font-semibold text-sky-700">
                  <Droplets className="w-3.5 h-3.5 fill-sky-500 text-sky-500" />
                  <span>{garden?.water_drops ?? 0} giọt nước</span>
                </div>
              </div>

              {/* Đồ họa Hoa Hướng Dương Sinh Động */}
              {garden && (
                <SunflowerVisual
                  state={garden.current_state}
                  streak={garden.consecutive_days}
                  waterDrops={garden.water_drops}
                  isWatering={isWatering}
                />
              )}

              {/* Toast thông báo tưới nước */}
              {waterToast && (
                <div className="mt-2 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg animate-fadeIn text-center">
                  {waterToast}
                </div>
              )}

              {/* Nút hành động tưới nước */}
              <div className="mt-4 w-full flex flex-col gap-2">
                <button
                  onClick={handleWaterClick}
                  disabled={!garden || garden.water_drops <= 0 || isWatering}
                  className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-medium text-xs transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  <Droplets className="w-4 h-4 fill-white" />
                  {isWatering ? "Đang tưới nước mát..." : "Tưới Nước Cho Cây (-1 giọt)"}
                </button>
                <p className="text-[11px] text-stone-400 text-center">
                  * Mỗi lần điểm danh trắc nghiệm hằng ngày sẽ nhận được 1 giọt nước.
                </p>
              </div>

              {/* Thẻ Thông Điệp Chữa Lành Tương Ứng Trạng Thái Cây */}
              {garden && (
                <div className="mt-5 p-4 rounded-xl bg-cream-50 border border-cream-200 w-full">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 mb-1.5">
                    <HeartHandshake className="w-4 h-4 text-sunflower-warm" />
                    <span>Gửi gắm từ khu vườn</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed italic">
                    &ldquo;{garden.story_message}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* CỘT PHẢI: LỘ TRÌNH HỌC TẬP (AI ROADMAP & DAILY MICRO-TASKS) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 5 Nhiệm vụ hằng ngày 5-10 phút */}
            <div className="bg-white rounded-2xl border border-cream-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-stone-800 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  5 Nhiệm Vụ Nhỏ Hôm Nay (5 - 10 Phút)
                </h3>
                <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                  Nhẹ nhàng • Không áp lực
                </span>
              </div>

              <div className="space-y-2.5">
                {student?.roadmap?.initial_daily_tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-xl border border-cream-200 hover:border-sunflower-300 bg-cream-50/50 transition-all flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-sunflower-100 text-sunflower-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {task.id}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-stone-800">{task.title}</h4>
                        <span className="text-[10px] text-stone-400 font-medium">{task.duration_minutes} phút</span>
                      </div>
                      {task.tip && (
                        <p className="text-[11px] text-stone-500 italic">💡 Gợi ý: {task.tip}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3 Chặng Mốc Mục Tiêu (Milestones Timeline) */}
            <div className="bg-white rounded-2xl border border-cream-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-stone-800 text-sm flex items-center gap-2">
                  <Target className="w-4 h-4 text-sunflower-warm" />
                  Lộ Trình 3 Chặng Bứt Phá Mục Tiêu
                </h3>
              </div>

              <div className="space-y-4">
                {student?.roadmap?.milestones.map((m) => (
                  <div
                    key={m.stage}
                    className="relative pl-6 pb-4 border-l-2 border-sunflower-200 last:border-transparent last:pb-0"
                  >
                    {/* Chấm tròn mốc */}
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-sunflower-warm border-2 border-white shadow-xs flex items-center justify-center">
                      <span className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-800">{m.title}</span>
                        <span className="text-[10px] text-sunflower-700 bg-sunflower-50 px-2 py-0.5 rounded border border-sunflower-200">
                          {m.duration}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600">{m.goal}</p>

                      <div className="pt-2 flex flex-wrap gap-1.5">
                        {m.key_actions.map((act, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-stone-100 text-stone-600 px-2.5 py-1 rounded-md"
                          >
                            • {act}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Check-in trắc nghiệm */}
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
