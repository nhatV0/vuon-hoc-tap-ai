"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  Sprout,
  CheckCircle2,
  Lock,
  RotateCcw,
  ShieldCheck
} from "lucide-react";
import SunflowerVisual, {
  DisplayMode,
  FlowerSpecies,
  getAuraLevelsForSpecies,
  getGrowthStagesForSpecies,
  getAuraLevelByStreak,
  getNextAuraLevel,
  FLOWER_SPECIES_CONFIG
} from "@/components/SunflowerVisual";
import { FlowerState } from "@/lib/types";

interface FlowerShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentState: FlowerState;
  currentStreak: number;
  waterDrops: number;
  species?: FlowerSpecies;
  studentName?: string;
  gracePassesAvailable?: number;
  savedStreakBeforeBreak?: number;
  canRestoreStreak?: boolean;
  onRestoreStreak?: () => Promise<void>;
}
export default function FlowerShowcaseModal({
  isOpen,
  onClose,
  currentState,
  currentStreak,
  waterDrops,
  species = "sunflower",
  studentName = "Học sinh",
  gracePassesAvailable = 1,
  savedStreakBeforeBreak = 0,
  canRestoreStreak = false,
  onRestoreStreak
}: FlowerShowcaseModalProps) {
  const [displayMode, setDisplayMode] = useState<DisplayMode>("3d_motion");
  const [selectedAuraLevel, setSelectedAuraLevel] = useState<number | null>(null);
  const [selectedGrowthStage, setSelectedGrowthStage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"aura" | "growth">("aura");
  const [restoring, setRestoring] = useState<boolean>(false);

  if (!isOpen) return null;

  // CHỈ HIỂN THỊ CÂY HOA MÀ HỌC SINH ĐÃ CHỌN
  const activeSpecies = species;

  const speciesConfig = FLOWER_SPECIES_CONFIG[activeSpecies];
  const speciesAuras = getAuraLevelsForSpecies(activeSpecies);
  const speciesStages = getGrowthStagesForSpecies(activeSpecies);

  const currentAura = getAuraLevelByStreak(currentStreak, activeSpecies);
  const nextAura = getNextAuraLevel(currentStreak, activeSpecies);

  const activeViewingAura = selectedAuraLevel
    ? speciesAuras.find((a) => a.level === selectedAuraLevel)
    : currentAura;

  const daysToNext = nextAura ? Math.max(0, nextAura.minStreak - currentStreak) : 0;
  const progressPercent = nextAura
    ? Math.min(100, Math.round((currentStreak / nextAura.minStreak) * 100))
    : 100;

  const handleRestoreClick = async () => {
    if (!onRestoreStreak || restoring) return;
    setRestoring(true);
    try {
      await onRestoreStreak();
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#FAF8F5] border border-amber-200/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* HEADER MODAL */}
        <div className="px-5 py-4 bg-white/90 border-b border-stone-200/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-600 animate-spin" style={{ animationDuration: "10s" }} />
            </div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
                  {speciesConfig.symbol} {speciesConfig.name}: 5 Mốc Vòng Đời & 8 Bậc Hào Quang
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  Chuỗi {currentStreak} ngày
                </span>
              </div>
              <p className="text-xs text-stone-500">
                {speciesConfig.tagline} • Cây hoa đồng hành của {studentName}
              </p>
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
          {/* CỘT TRÁI: VIEWPORT HOA 3D NỔI BẬT TỈ LỆ 1:1 TO RÕ RÀNG */}
          <div className="lg:col-span-6 flex flex-col items-center justify-start bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-6 shadow-xs relative">
            {/* Huy hiệu loài hoa học sinh đã chọn & Nút Trở về nếu đang xem trước */}
            <div className="w-full flex items-center justify-between gap-2 mb-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-stone-100 border border-stone-200 text-xs font-bold text-stone-800 shadow-2xs">
                <span className="text-sm">{speciesConfig.symbol}</span>
                <span>{speciesConfig.name}</span>
                <span className="text-[10px] text-stone-400 font-normal">| {speciesConfig.matureName}</span>
              </div>

              {(selectedAuraLevel || selectedGrowthStage) && (
                <button
                  onClick={() => {
                    setSelectedAuraLevel(null);
                    setSelectedGrowthStage(null);
                  }}
                  className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors shrink-0"
                >
                  Trở về hoa hiện tại
                </button>
              )}
            </div>

            {/* Màn hình hoa trực quan tỉ lệ 1:1 to rõ */}
            <div className="w-full flex items-center justify-center my-1">
              <SunflowerVisual
                state={currentState}
                streak={currentStreak}
                waterDrops={waterDrops}
                species={activeSpecies}
                size="md"
                displayMode={displayMode}
                previewAuraLevel={selectedAuraLevel}
                previewGrowthStage={selectedGrowthStage}
                interactiveControls={true}
                onModeChange={setDisplayMode}
              />
            </div>

            {/* Card thông điệp ý nghĩa */}
            <div className="w-full mt-3 text-center px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs text-stone-700">
              <p className="font-semibold text-stone-900 mb-0.5">
                {activeViewingAura
                  ? activeViewingAura.name
                  : selectedGrowthStage && speciesStages[selectedGrowthStage]
                  ? speciesStages[selectedGrowthStage].name
                  : currentStreak >= 21
                  ? speciesConfig.matureName
                  : "Mầm Xanh Vươn Lên (Dưới 21 ngày cộng dồn)"}
              </p>
              <p className="text-[11px] text-stone-600 leading-relaxed italic">
                &ldquo;
                {activeViewingAura
                  ? activeViewingAura.meaning
                  : selectedGrowthStage && speciesStages[selectedGrowthStage]
                  ? speciesStages[selectedGrowthStage].description
                  : currentStreak < 21
                  ? "Dưới 21 ngày, nếu lỡ quên điểm danh ngày nào, chuỗi của bạn sẽ được cộng dồn tiếp tục để đảm bảo bạn đạt mốc 21 ngày thoát khỏi lực cản trì hoãn!"
                  : speciesConfig.bloomDesc}
                &rdquo;
              </p>
            </div>
            {/* KHỐI KHÔI PHỤC CHUỖI (NẾU CÓ CƠ CHẾ CẦN KHÔI PHỤC HOẶC HIỂN THỊ LƯỢT CÒN LẠI) */}
            <div className="w-full mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 border border-sky-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-sky-950">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  <span>Vé Khôi Phục Chuỗi</span>
                </div>
                <span className="font-extrabold px-2 py-0.5 rounded-full bg-sky-200/80 text-sky-900 text-[11px]">
                  {gracePassesAvailable} Lượt khả dụng
                </span>
              </div>
              <p className="text-[11px] text-sky-800 leading-relaxed">
                Vừa trồng bạn có sẵn <strong>1 lượt khôi phục chuỗi</strong>. Mỗi 30 ngày kiên trì bạn sẽ nhận thêm 1 lượt mới.
                {canRestoreStreak && (
                  <span className="block mt-1 font-semibold text-rose-700">
                    ⚠️ Chuỗi cũ của bạn là {savedStreakBeforeBreak} ngày. Bạn có thể khôi phục lại ngay bây giờ!
                  </span>
                )}
              </p>
              {canRestoreStreak && (
                <button
                  type="button"
                  disabled={restoring}
                  onClick={handleRestoreClick}
                  className="w-full py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors active:scale-98 disabled:opacity-50"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${restoring ? "animate-spin" : ""}`} />
                  <span>Khôi Phục Về Chuỗi {savedStreakBeforeBreak} Ngày Ngay</span>
                </button>
              )}
            </div>

            {/* Thanh tiến độ đến cấp kế tiếp */}
            {nextAura && (
              <div className="w-full mt-3 p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-900">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    Cấp tiếp theo: {nextAura.name} ({nextAura.minStreak} ngày)
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
                <span>8 Cấp Hào Quang (30d - 900d)</span>
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
                <span>5 Mốc Sinh Trưởng (0d - 21d)</span>
              </button>
            </div>

            {/* TAB 1: 8 CẤP ĐỘ HÀO QUANG (30, 50, 100, 200, 300, 450, 700, 900 ngày) */}
            {activeTab === "aura" && (
              <div className="space-y-2.5 animate-in fade-in">
                <div className="text-[11px] text-stone-500 px-1 flex items-center justify-between">
                  <span>Nhấn vào từng cấp để xem trước hoa 3D tỏa sáng:</span>
                  <span className="font-bold text-amber-700">Mốc 30 → 900 ngày</span>
                </div>

                <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                  {speciesAuras.map((aura) => {
                    const isUnlocked = currentStreak >= aura.minStreak;
                    const isSelected = selectedAuraLevel === aura.level;
                    const isCurrent = currentAura?.level === aura.level;
                    return (
                      <div
                        key={aura.level}
                        onClick={() => {
                          setSelectedAuraLevel(aura.level);
                          setSelectedGrowthStage(null);
                        }}
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
                                {aura.name}
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

            {/* TAB 2: 5 MỐC VÒNG ĐỜI SINH TRƯỞNG (0, 3, 7, 14, 21 ngày) */}
            {activeTab === "growth" && (
              <div className="space-y-2.5 animate-in fade-in">
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
                  💡 <strong>Quy tắc cộng dồn dưới 21 ngày:</strong> Trong 21 ngày đầu tiên, bạn sẽ không bị mất chuỗi nếu quên điểm danh. Tất cả ngày thực hiện sẽ được cộng dồn tích lũy để bạn vững vàng đạt cột mốc Cây Lớn Rực Rỡ!
                </div>

                <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
                  {[
                    speciesStages.seed,
                    speciesStages.sowing,
                    speciesStages.sprout,
                    speciesStages.seedling,
                    speciesStages.bloom,
                    speciesStages.wilting
                  ].map((stg) => {
                    const isSelected = selectedGrowthStage === stg.stageKey;
                    const isReached = currentStreak >= stg.minStreak;

                    return (
                      <div
                        key={stg.stageKey}
                        onClick={() => {
                          setSelectedGrowthStage(stg.stageKey);
                          setSelectedAuraLevel(null);
                        }}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? "bg-white border-emerald-500 ring-2 ring-emerald-300 shadow-md"
                            : isReached
                            ? "bg-white border-stone-200 hover:border-emerald-300"
                            : "bg-stone-100/80 border-stone-200/80 opacity-75 hover:opacity-100 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">
                            <Sprout className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-stone-900">{stg.name}</h4>
                            <p className="text-[11px] text-stone-600 line-clamp-1">
                              {stg.description}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {isReached ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              Đạt mốc
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-stone-500 bg-stone-200/80 px-2 py-0.5 rounded-full">
                              {stg.minStreak} ngày
                            </span>
                          )}
                        </div>
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
            🌱 Hệ thống chuẩn: Dưới 21 ngày cộng dồn • Trên 21 ngày rèn đúc bản sắc • Nhận 1 lượt khôi phục chuỗi mỗi 30 ngày.
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
