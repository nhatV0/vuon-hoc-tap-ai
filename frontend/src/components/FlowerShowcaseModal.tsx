"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  Flame,
  Sprout,
  CheckCircle2,
  Lock
} from "lucide-react";
import SunflowerVisual, {
  AURA_LEVELS,
  GROWTH_STAGES,
  DisplayMode,
  getAuraLevelByStreak,
  getNextAuraLevel
} from "@/components/SunflowerVisual";
import { FlowerState } from "@/lib/types";

interface FlowerShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentState: FlowerState;
  currentStreak: number;
  waterDrops: number;
  studentName?: string;
}

export default function FlowerShowcaseModal({
  isOpen,
  onClose,
  currentState,
  currentStreak,
  waterDrops,
  studentName = "Học sinh"
}: FlowerShowcaseModalProps) {
  const [displayMode, setDisplayMode] = useState<DisplayMode>("3d_motion");
  const [selectedAuraLevel, setSelectedAuraLevel] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"aura" | "growth">("aura");
  const [selectedGrowthStage, setSelectedGrowthStage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentAura = getAuraLevelByStreak(currentStreak);
  const nextAura = getNextAuraLevel(currentStreak);

  // Xem hào quang nào đang được chọn xem trước (nếu không chọn thì dùng hào quang hiện tại)
  const activeViewingAura = selectedAuraLevel
    ? AURA_LEVELS.find((a) => a.level === selectedAuraLevel)
    : currentAura;

  // Tính số ngày còn lại đến mốc kế tiếp
  const daysToNext = nextAura ? Math.max(0, nextAura.minStreak - currentStreak) : 0;
  const progressPercent = nextAura
    ? Math.min(100, Math.round((currentStreak / nextAura.minStreak) * 100))
    : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#FAF8F5] border border-amber-200/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* HEADER MODAL */}
        <div className="px-5 py-4 bg-white/90 border-b border-stone-200/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-600 animate-spin" style={{ animationDuration: "10s" }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
                  Khu Vườn Hoa 3D & 8 Cấp Hào Quang
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  Chuỗi {currentStreak} ngày
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Không gian nghệ thuật 3D sinh động theo sát hành trình nuôi dưỡng thói quen tự học của {studentName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NỘI DUNG CHÍNH (2 CỘT RESPONSIVE) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* CỘT TRÁI: VIEWPORT HOA 3D NỔI BẬT */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center bg-white rounded-3xl border border-stone-200/90 p-6 shadow-xs relative overflow-hidden">
            <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100/90 backdrop-blur-sm border border-stone-200 text-[11px] font-bold text-stone-700">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>Streak: {currentStreak} Ngày</span>
            </div>

            {selectedAuraLevel && (
              <button
                onClick={() => setSelectedAuraLevel(null)}
                className="absolute top-4 right-4 z-10 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors"
              >
                Trở về hoa của tôi
              </button>
            )}

            {/* Màn hình hoa trực quan */}
            <div className="my-2 flex items-center justify-center">
              <SunflowerVisual
                state={currentState}
                streak={currentStreak}
                waterDrops={waterDrops}
                size="lg"
                displayMode={displayMode}
                previewAuraLevel={selectedAuraLevel}
                interactiveControls={true}
                onModeChange={setDisplayMode}
              />
            </div>

            {/* Thông điệp ý nghĩa mốc hiện tại */}
            <div className="mt-2 text-center max-w-sm px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs text-stone-700">
              <p className="font-semibold text-stone-900 mb-0.5">
                {activeViewingAura ? activeViewingAura.name : "Hoa Hướng Dương Rực Rỡ"}
              </p>
              <p className="text-[11px] text-stone-600 leading-relaxed italic">
                &ldquo;{activeViewingAura ? activeViewingAura.meaning : "Mỗi ngày hoàn thành nhiệm vụ vi mô, hoa sẽ đón nhận thêm ánh nắng và hào quang rực rỡ."}&rdquo;
              </p>
            </div>

            {/* Thanh tiến độ đến cấp kế tiếp */}
            {nextAura && (
              <div className="w-full mt-4 p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-900">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    Cấp tiếp theo: {nextAura.name} (Cấp {nextAura.level})
                  </span>
                  <span>Còn {daysToNext} ngày</span>
                </div>
                <div className="w-full h-2 rounded-full bg-amber-200/80 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-700"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* CỘT PHẢI: BỘ SƯU TẬP 8 CẤP HÀO QUANG & 6 GIAI ĐOẠN SINH TRƯỞNG */}
          <div className="lg:col-span-6 space-y-4">
            {/* TAB SELECTOR */}
            <div className="flex items-center p-1 bg-stone-200/80 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("aura");
                  setSelectedGrowthStage(null);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "aura"
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>8 Cấp Độ Hào Quang Streak</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("growth");
                  setSelectedAuraLevel(null);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "growth"
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                <span>Vòng Đời Sinh Trưởng (6 Chặng)</span>
              </button>
            </div>

            {/* TAB 1: 8 CẤP ĐỘ HÀO QUANG */}
            {activeTab === "aura" && (
              <div className="space-y-2.5 animate-in fade-in">
                <div className="text-[11px] text-stone-500 px-1 flex items-center justify-between">
                  <span>Nhấn vào từng cấp để xem trước hiệu ứng hoa tỏa sáng:</span>
                  <span className="font-bold text-amber-700">Mốc 3 → 150 ngày</span>
                </div>

                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                  {AURA_LEVELS.map((aura) => {
                    const isUnlocked = currentStreak >= aura.minStreak;
                    const isSelected = selectedAuraLevel === aura.level;
                    const isCurrent = currentAura?.level === aura.level;

                    return (
                      <div
                        key={aura.level}
                        onClick={() => setSelectedAuraLevel(aura.level)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? "bg-white border-amber-500 ring-2 ring-amber-400/40 shadow-md"
                            : isCurrent
                            ? "bg-amber-50/60 border-amber-300 shadow-xs"
                            : isUnlocked
                            ? "bg-white/80 border-stone-200 hover:border-amber-300 hover:bg-white"
                            : "bg-stone-100/80 border-stone-200/80 opacity-75 hover:opacity-100 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Avatar icon hào quang */}
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center border font-black text-xs shrink-0 shadow-inner"
                            style={{
                              backgroundColor: aura.glowColor.replace("0.", "0.15"),
                              borderColor: aura.badgeBorder.replace("border-", "")
                            }}
                          >
                            <span className="text-base">
                              {aura.level === 8
                                ? "👑"
                                : aura.level === 7
                                ? "🌈"
                                : aura.level === 6
                                ? "☀️"
                                : aura.level === 5
                                ? "🔥"
                                : aura.level === 4
                                ? "🔮"
                                : aura.level === 3
                                ? "💧"
                                : aura.level === 2
                                ? "💎"
                                : "✨"}
                            </span>
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-stone-900">
                                Cấp {aura.level}: {aura.name}
                              </h4>
                              {isCurrent && (
                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-500 text-white">
                                  Đang sở hữu
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-stone-500 line-clamp-1">
                              {aura.colorName} • Yêu cầu {aura.minStreak} ngày liên tục
                            </p>
                            <p className="text-[10px] text-stone-600 italic mt-0.5 line-clamp-1">
                              {aura.meaning}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-1.5">
                          {isUnlocked ? (
                            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Đã mở
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium text-stone-500 flex items-center gap-1 bg-stone-200/80 px-2 py-0.5 rounded-full">
                              <Lock className="w-3 h-3" /> {aura.minStreak} ngày
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: VÒNG ĐỜI SINH TRƯỞNG */}
            {activeTab === "growth" && (
              <div className="space-y-2.5 animate-in fade-in">
                <p className="text-[11px] text-stone-500 px-1">
                  6 giai đoạn lớn lên từ hạt mầm đến khi bung nở rực rỡ trong chậu gốm pastel:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
                  {Object.values(GROWTH_STAGES).map((stg) => {
                    const isSelected = selectedGrowthStage === stg.stageKey;

                    return (
                      <div
                        key={stg.stageKey}
                        onClick={() => setSelectedGrowthStage(stg.stageKey)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "bg-white border-emerald-500 ring-2 ring-emerald-300 shadow-md"
                            : "bg-white/90 border-stone-200 hover:border-emerald-300 hover:bg-white shadow-xs"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">
                            <Sprout className="w-3.5 h-3.5" />
                          </div>
                          <h4 className="text-xs font-bold text-stone-900">{stg.name}</h4>
                        </div>
                        <p className="text-[11px] text-stone-600 leading-relaxed">
                          {stg.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER MODAL */}
        <div className="px-5 py-3.5 bg-stone-100/90 border-t border-stone-200/80 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-stone-500 italic">
            💡 Gợi ý: Chế độ Hoạt ảnh 3D chạy mượt 60fps với chu kỳ thở lặp vô tận (Seamless Loop).
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-colors shadow-xs"
          >
            Đóng phòng trưng bày
          </button>
        </div>
      </div>
    </div>
  );
}
