"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  X,
  Award,
  ShieldCheck,
  Flame,
  Droplets,
  Sparkles,
  Lock,
  Mail,
  UserCheck,
  LogOut,
  GraduationCap,
  CheckCircle2
} from "lucide-react";
import {
  Student,
  GardenStatus,
  BadgeItem,
  MilestoneRewardItem,
  API_BASE
} from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { formatVietnameseDateTime } from "./TimeCapsuleVaultModal";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  garden: GardenStatus | null;
  onOpenCapsuleVault: (mode?: "list" | "compose") => void;
}

export default function UserProfileModal({
  isOpen,
  onClose,
  student,
  garden,
  onOpenCapsuleVault,
}: UserProfileModalProps) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "hall_of_fame" | "capsules">("overview");
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneRewardItem | null>(null);
  const [loadingBadges, setLoadingBadges] = useState<boolean>(false);

  const streakDays = garden?.consecutive_days ?? 1;
  const progressPercent = Math.min(100, Math.round((streakDays / 21) * 100));

  const fetchBadges = useCallback(async () => {
    if (!student?.id) return;
    setLoadingBadges(true);
    try {
      const res = await fetch(`${API_BASE}/api/badges/${student.id}`);
      if (res.ok) {
        const data = await res.json();
        setBadges(data);
      }
    } catch (err) {
      console.error("Failed to load badges:", err);
    } finally {
      setLoadingBadges(false);
    }
  }, [student?.id]);

  useEffect(() => {
    if (isOpen) {
      fetchBadges();
      setSelectedMilestone(null);
    }
  }, [isOpen, fetchBadges]);

  if (!isOpen) return null;

  const flowerStateLabels: Record<string, { label: string; bg: string; text: string }> = {
    cham_hoc: { label: "Hoa Chăm Học (Đầy Đủ Nước)", bg: "bg-emerald-100", text: "text-emerald-800" },
    tich_cuc: { label: "Hoa Tích Cực (Ổn Định)", bg: "bg-amber-100", text: "text-amber-800" },
    thieu_nuoc: { label: "Hoa Thiếu Nước (Cần Điểm Danh)", bg: "bg-rose-100", text: "text-rose-800" },
    heo_kho: { label: "Hoa Héo Khô (Cần Chăm Sóc)", bg: "bg-stone-200", text: "text-stone-700" },
  };

  const currentFlowerInfo = flowerStateLabels[garden?.current_state || "tich_cuc"] || flowerStateLabels.tich_cuc;
  const initialLetter = (student?.name || user?.name || "H").trim().charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] border border-stone-200/80 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Top Header Card */}
        <div className="p-6 border-b border-stone-200/80 bg-white/90">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-white flex items-center justify-center font-bold text-xl shadow-md border-2 border-white">
                {initialLetter}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-stone-900">
                    {student?.name || user?.name || "Học Sinh Sunflower"}
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${currentFlowerInfo.bg} ${currentFlowerInfo.text}`}>
                    {currentFlowerInfo.label}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-2">
                  <span>{user?.email || "hocsinh@sunflower.edu.vn"}</span>
                  <span>&bull;</span>
                  <span>Lớp {student?.grade || "10"}</span>
                  <span>&bull;</span>
                  <span className="font-semibold text-amber-700">{student?.target_subject || "Môn mục tiêu"}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              title="Đóng modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab navigation */}
          <div className="flex items-center gap-1.5 mt-5 pt-3 border-t border-stone-100 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === "overview"
                  ? "bg-stone-900 text-white shadow-xs"
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Tổng Quan & Động Lực
            </button>

            <button
              onClick={() => setActiveTab("hall_of_fame")}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === "hall_of_fame"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              Bảng Phong Thần ({garden?.unlocked_badges_count ?? 0})
            </button>

            <button
              onClick={() => setActiveTab("capsules")}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === "capsules"
                  ? "bg-amber-800 text-white shadow-xs"
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              Hộp Thư Thời Gian
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: TỔNG QUAN & ĐỘNG LỰC */}
          {activeTab === "overview" && (
            <div className="space-y-5">
              {/* Stat Chips Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
                  <div className="flex items-center gap-1.5 text-amber-600 mb-1">
                    <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Chuỗi Kỷ Luật</span>
                  </div>
                  <p className="text-xl font-extrabold text-stone-900">{streakDays} <span className="text-xs font-medium text-stone-500">Ngày</span></p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
                  <div className="flex items-center gap-1.5 text-sky-600 mb-1">
                    <Droplets className="w-4 h-4 fill-sky-500 text-sky-500" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Giọt Nước</span>
                  </div>
                  <p className="text-xl font-extrabold text-stone-900">{garden?.water_drops ?? 0} <span className="text-xs font-medium text-stone-500">Giọt</span></p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
                  <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Khiên Hộ Mệnh</span>
                  </div>
                  <p className="text-xl font-extrabold text-stone-900">{garden?.shields_available ?? 1} <span className="text-xs font-medium text-stone-500">Chiếc</span></p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
                  <div className="flex items-center gap-1.5 text-indigo-600 mb-1">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Vé Khôi Phục</span>
                  </div>
                  <p className="text-xl font-extrabold text-stone-900">{garden?.grace_passes_available ?? 1} <span className="text-xs font-medium text-stone-500">Lượt</span></p>
                </div>
              </div>

              {/* Widget Khiên Hộ Mệnh & Khôi Phục Chuỗi */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 border border-sky-200 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-xs leading-relaxed space-y-1">
                  <p className="font-bold text-sky-950">
                    Quy tắc Bảo toàn & Khôi phục Chuỗi
                  </p>
                  <p className="text-sky-900/90">
                    • <strong>Dưới 21 ngày:</strong> Quên điểm danh sẽ được <em>cộng dồn tiếp tục</em> để đảm bảo bạn đạt mốc 21 ngày Cây Lớn Rực Rỡ.
                  </p>
                  <p className="text-sky-900/90">
                    • <strong>Từ 21 ngày trở đi:</strong> Quên điểm danh cây sẽ chuyển sang trạng thái <em>Cây Héo</em>. Bạn có sẵn <strong>{garden?.grace_passes_available ?? 1} vé khôi phục chuỗi</strong> (nhận thêm 1 lượt mỗi mốc 30 ngày) để hồi sinh chuỗi ban đầu bất cứ lúc nào!
                  </p>
                </div>
              </div>

              {/* Tiến trình 21 Ngày Vượt Trọng Lực Thu Gọn */}
              <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                      Hành Trình 21 Ngày Vượt Trọng Lực
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-amber-700">{progressPercent}%</span>
                </div>

                <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* 6 mốc nhận quà */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
                  {(garden?.journey_milestones || []).map((m) => {
                    const isPassed = streakDays >= m.day;
                    return (
                      <button
                        key={m.day}
                        onClick={() => setSelectedMilestone(m)}
                        className={`p-2 rounded-xl text-center border transition-all ${
                          isPassed
                            ? "bg-amber-50/80 border-amber-300 text-amber-900 font-bold"
                            : "bg-stone-50 border-stone-200 text-stone-400"
                        }`}
                      >
                        <span className="text-[10px] block font-semibold">Ngày {m.day}</span>
                        <span className="text-xs">{isPassed ? "👑" : "🔒"}</span>
                      </button>
                    );
                  })}
                </div>

                {selectedMilestone && (
                  <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 text-xs space-y-1 animate-in fade-in">
                    <div className="flex items-center justify-between font-bold text-amber-950">
                      <span>Mốc Ngày {selectedMilestone.day}: {selectedMilestone.title}</span>
                      <button
                        onClick={() => setSelectedMilestone(null)}
                        className="text-stone-400 hover:text-stone-600 text-[11px]"
                      >
                        Đóng
                      </button>
                    </div>
                    <p className="text-stone-600">{selectedMilestone.reward_text}</p>
                    <p className="text-amber-800 italic pt-1">&ldquo;{selectedMilestone.quote}&rdquo;</p>
                  </div>
                )}
              </div>

              {/* Thông tin hồ sơ học tập */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2 text-xs">
                <h4 className="font-bold text-stone-800 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-stone-500" />
                  Mục Tiêu & Phong Cách Học Tập
                </h4>
                <div className="grid grid-cols-2 gap-2 text-stone-600 pt-1">
                  <div>
                    <span className="text-stone-400 block text-[10px]">Môn trọng tâm:</span>
                    <span className="font-semibold text-stone-800">{student?.target_subject || "Toán"}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Mục tiêu dài hạn:</span>
                    <span className="font-semibold text-stone-800 truncate block">{student?.long_term_goal || "Đỗ Đại Học NV1"}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Khó khăn thường gặp:</span>
                    <span className="font-semibold text-stone-800 truncate block">{student?.weakness || "Hay trì hoãn"}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Phong cách học:</span>
                    <span className="font-semibold text-stone-800">{student?.learning_style || "Thị giác (Visual)"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BẢNG PHONG THẦN (HALL OF FAME) */}
          {activeTab === "hall_of_fame" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-stone-900">Danh Hiệu & Bảng Phong Thần</h4>
                  <p className="text-xs text-stone-500">Mở khóa qua việc duy trì chuỗi kỷ luật & tích cực điểm danh</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  {badges.filter((b) => b.unlocked).length} / {badges.length} Đã mở
                </span>
              </div>

              {loadingBadges ? (
                <div className="py-12 text-center text-xs text-stone-400">Đang tra cứu danh hiệu...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {badges.map((b) => {
                    return (
                      <div
                        key={b.id}
                        className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                          b.unlocked
                            ? "bg-white border-amber-300 shadow-xs"
                            : "bg-stone-50/70 border-stone-200 opacity-60"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                          b.unlocked ? "bg-amber-100 border border-amber-200" : "bg-stone-200 grayscale"
                        }`}>
                          {b.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h5 className="font-bold text-xs text-stone-900 truncate">{b.title}</h5>
                            {b.unlocked ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5 leading-snug">
                            {b.description}
                          </p>
                          <div className="mt-1.5 flex items-center gap-1.5 text-[10px]">
                            {b.unlocked ? (
                              <span className="text-emerald-700 font-semibold">Đã đạt thành tựu</span>
                            ) : (
                              <span className="text-stone-400 font-medium">Cần Streak {b.required_streak} ngày</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: HỘP THƯ THỜI GIAN */}
          {activeTab === "capsules" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-amber-700" />
                    Kho Cất Giữ Tâm Thư Thời Gian
                  </h4>
                  <p className="text-xs text-amber-900/80 leading-relaxed">
                    Nơi cất giữ những bức thư phong ấn bạn viết cho phiên bản tương lai. Tất cả đều được niêm phong thời gian thực.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenCapsuleVault("compose");
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
                >
                  Soạn Thư Mới ✍️
                </button>
              </div>

              {/* Bức thư đang hoạt động gần nhất */}
              {garden?.active_capsule ? (
                <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-900">{garden.active_capsule.title}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      Mở ngày {garden.active_capsule.target_unlock_day}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 font-mono">
                    Ghi nhận: {formatVietnameseDateTime(garden.active_capsule.created_at)}
                  </p>
                  <p className="text-xs text-stone-400 italic">
                    (Nội dung đang được niêm phong an toàn)
                  </p>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-stone-400">
                  Chưa có lá thư nào được viết.
                </div>
              )}

              <button
                onClick={() => {
                  onClose();
                  onOpenCapsuleVault("list");
                }}
                className="w-full py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                Mở Toàn Bộ Kho Lưu Trữ Tâm Thư 📜
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-stone-200/80 bg-white/90 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <Link
              href="/teacher"
              onClick={onClose}
              className="text-stone-500 hover:text-emerald-700 font-medium flex items-center gap-1 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              Giao diện Giáo Viên
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-rose-50 text-stone-600 hover:text-rose-600 font-medium flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Đăng Xuất
              </button>
            ) : (
              <Link
                href="/auth"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl bg-stone-900 text-white font-medium hover:bg-stone-800 transition-colors"
              >
                Đăng Nhập
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
