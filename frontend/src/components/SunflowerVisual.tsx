"use client";

import React, { useState, useEffect, useRef } from "react";
import { FlowerState } from "@/lib/types";
import { Sparkles, Film, Image as ImageIcon, Droplets } from "lucide-react";

export type DisplayMode = "3d_motion" | "3d_static";

export interface AuraLevelInfo {
  level: number;
  minStreak: number;
  name: string;
  colorName: string;
  auraTag: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  glowColor: string;
  imageSrc: string;
  videoSrc: string;
  meaning: string;
}

// 8 CẤP ĐỘ HÀO QUANG THEO MỐC NGÀY CHUẨN:
// 30 ngày (Bậc 1), 50 ngày (Bậc 2), 100 ngày (Bậc 3), 200 ngày (Bậc 4),
// 300 ngày (Bậc 5), 450 ngày (Bậc 6), 700 ngày (Bậc 7), 900 ngày (Tối thượng).
export const AURA_LEVELS: AuraLevelInfo[] = [
  {
    level: 1,
    minStreak: 30,
    name: "Cây Bậc 1 • Hào Quang Bạch Ngọc",
    colorName: "Trắng tinh khiết",
    auraTag: "lvl1_white",
    badgeBg: "bg-slate-50",
    badgeBorder: "border-slate-300",
    badgeText: "text-slate-800",
    glowColor: "rgba(255, 255, 255, 0.75)",
    imageSrc: "/assets/flower/sunflower_aura_lvl1_white.png",
    videoSrc: "/assets/flower/sunflower_aura_lvl1_white.mp4",
    meaning: "30 ngày kiên định! Một tháng trọn vẹn vượt thoát quán tính, tâm trí thanh tịnh rạng rỡ."
  },
  {
    level: 2,
    minStreak: 50,
    name: "Cây Bậc 2 • Hào Quang Lam Ngọc",
    colorName: "Xanh lam trí tuệ",
    auraTag: "lvl2_blue",
    badgeBg: "bg-blue-50",
    badgeBorder: "border-blue-300",
    badgeText: "text-blue-800",
    glowColor: "rgba(59, 130, 246, 0.65)",
    imageSrc: "/assets/flower/sunflower_aura_lvl2_blue.png",
    videoSrc: "/assets/flower/sunflower_aura_lvl2_blue.mp4",
    meaning: "50 ngày! Trí tuệ tĩnh lặng và sự kiên nhẫn bền bỉ, phong độ học tập vững vàng."
  },
  {
    level: 3,
    minStreak: 100,
    name: "Cây Bậc 3 • Hào Quang Thủy Triều",
    colorName: "Xanh ngọc biển mát lành",
    auraTag: "lvl3_aqua",
    badgeBg: "bg-cyan-50",
    badgeBorder: "border-cyan-300",
    badgeText: "text-cyan-800",
    glowColor: "rgba(6, 182, 212, 0.65)",
    imageSrc: "/assets/flower/sunflower_aura_lvl3_aqua.png",
    videoSrc: "/assets/flower/sunflower_aura_lvl3_aqua.mp4",
    meaning: "100 ngày kỷ lục! Dòng chảy kiến thức thông suốt như dòng sông lớn, xua tan áp lực."
  },
  {
    level: 4,
    minStreak: 200,
    name: "Cây Bậc 4 • Hào Quang Tinh Vân Tím",
    colorName: "Tím huyền bí",
    auraTag: "lvl4_purple",
    badgeBg: "bg-purple-50",
    badgeBorder: "border-purple-300",
    badgeText: "text-purple-800",
    glowColor: "rgba(168, 85, 247, 0.7)",
    imageSrc: "/assets/flower/sunflower_aura_lvl4_purple.png",
    videoSrc: "/assets/flower/sunflower_aura_lvl4_purple.mp4",
    meaning: "200 ngày phi thường! Thói quen tự học tự giác đã trở thành một phần bản sắc không thể tách rời."
  },
  {
    level: 5,
    minStreak: 300,
    name: "Cây Bậc 5 • Hào Quang Hồng Ngọc Lửa",
    colorName: "Đỏ rực lửa",
    auraTag: "lvl5_red",
    badgeBg: "bg-rose-50",
    badgeBorder: "border-rose-300",
    badgeText: "text-rose-800",
    glowColor: "rgba(244, 63, 94, 0.7)",
    imageSrc: "/assets/flower/sunflower_aura_lvl5_red.png",
    videoSrc: "/assets/flower/sunflower_aura_lvl5_red.mp4",
    meaning: "300 ngày kiên cường! Ngọn lửa đam mê và ý chí học tập bất khả chiến bại."
  },
  {
    level: 6,
    minStreak: 450,
    name: "Cây Bậc 6 • Hào Quang Kim Thái Dương",
    colorName: "Vàng kim chói lọi",
    auraTag: "lvl6_gold",
    badgeBg: "bg-amber-50",
    badgeBorder: "border-amber-300",
    badgeText: "text-amber-900",
    glowColor: "rgba(245, 158, 11, 0.8)",
    imageSrc: "/assets/flower/sunflower_aura_lvl6_gold.png",
    videoSrc: "/assets/flower/sunflower_aura_lvl6_gold.mp4",
    meaning: "450 ngày uy nghiêm! Vầng thái dương rực rỡ soi sáng con đường chinh phục ước mơ học vấn."
  },
  {
    level: 7,
    minStreak: 700,
    name: "Cây Bậc 7 • Hào Quang Cực Quang Ngũ Sắc",
    colorName: "Cực quang ngũ sắc",
    auraTag: "lvl7_rainbow",
    badgeBg: "bg-gradient-to-r from-pink-50 via-amber-50 to-emerald-50",
    badgeBorder: "border-indigo-300",
    badgeText: "text-indigo-900",
    glowColor: "rgba(129, 140, 248, 0.85)",
    imageSrc: "/assets/flower/sunflower_aura_lvl7_rainbow.png",
    videoSrc: "/assets/flower/sunflower_aura_lvl7_rainbow.mp4",
    meaning: "700 ngày! Kiệt tác của sự nhẫn nại và vẻ đẹp chuyển mình kỳ diệu của lòng kiên định."
  },
  {
    level: 8,
    minStreak: 900,
    name: "Cây Tối Thượng • Hào Quang Thiên Giới",
    colorName: "Kim cương thiêng liêng",
    auraTag: "lvl8_divine",
    badgeBg: "bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-200",
    badgeBorder: "border-amber-400",
    badgeText: "text-amber-950 font-black",
    glowColor: "rgba(251, 191, 36, 0.95)",
    imageSrc: "/assets/flower/sunflower_aura_lvl8_divine.png",
    videoSrc: "/assets/flower/sunflower_aura_lvl8_divine.mp4",
    meaning: "900 ngày huyền thoại! Cảnh giới tối thượng, ánh sáng kim cương khai sáng mọi thử thách tri thức."
  }
];

export function getAuraLevelByStreak(streak: number): AuraLevelInfo | null {
  if (streak < 30) return null;
  for (let i = AURA_LEVELS.length - 1; i >= 0; i--) {
    if (streak >= AURA_LEVELS[i].minStreak) {
      return AURA_LEVELS[i];
    }
  }
  return null;
}

export function getNextAuraLevel(streak: number): AuraLevelInfo | null {
  for (let i = 0; i < AURA_LEVELS.length; i++) {
    if (streak < AURA_LEVELS[i].minStreak) {
      return AURA_LEVELS[i];
    }
  }
  return null;
}

export interface FlowerGrowthStage {
  stageKey: "seed" | "sowing" | "sprout" | "seedling" | "bloom" | "wilting";
  minStreak: number;
  name: string;
  imageSrc: string;
  videoSrc: string;
  description: string;
}

// 5 MỐC SINH TRƯỞNG CHUẨN:
// 0 ngày là hạt, 3 ngày là gieo, 7 ngày nảy mầm, 14 ngày lên cây con, 21 ngày cây lớn
export const GROWTH_STAGES: Record<string, FlowerGrowthStage> = {
  seed: {
    stageKey: "seed",
    minStreak: 0,
    name: "0 Ngày • Hạt Giống Thần Kỳ",
    imageSrc: "/assets/flower/seed.png",
    videoSrc: "/assets/flower/seed_motion.mp4",
    description: "Hạt mầm hy vọng tích lũy năng lượng tinh khôi trước khi nảy chồi."
  },
  sowing: {
    stageKey: "sowing",
    minStreak: 3,
    name: "3 Ngày • Gieo Vào Chậu Đất",
    imageSrc: "/assets/flower/sowing.png",
    videoSrc: "/assets/flower/sowing_motion.mp4",
    description: "Hạt mầm được đặt nhẹ nhàng vào đất ẩm tơi xốp, đón tia nắng đầu tiên."
  },
  sprout: {
    stageKey: "sprout",
    minStreak: 7,
    name: "7 Ngày • Nảy Mầm Vươn Lên",
    imageSrc: "/assets/flower/sprout.png",
    videoSrc: "/assets/flower/sprout_motion.mp4",
    description: "Hai lá mầm xinh xắn tách lớp đất vươn lên đón ánh sáng mặt trời."
  },
  seedling: {
    stageKey: "seedling",
    minStreak: 14,
    name: "14 Ngày • Lên Cây Con",
    imageSrc: "/assets/flower/seedling.png",
    videoSrc: "/assets/flower/seedling_motion.mp4",
    description: "Thân cây mảnh mai xanh biếc đầy sức sống, lá non đung đưa theo nhịp thở."
  },
  bloom: {
    stageKey: "bloom",
    minStreak: 21,
    name: "21 Ngày • Cây Lớn Rực Rỡ",
    imageSrc: "/assets/flower/bloom.png",
    videoSrc: "/assets/flower/bloom_motion.mp4",
    description: "Bông hoa hướng dương nở trọn vẹn với nụ cười ấm áp, thoát khỏi trọng lực trì hoãn!"
  },
  wilting: {
    stageKey: "wilting",
    minStreak: 21,
    name: "Cây Héo Cần Chăm Sóc",
    imageSrc: "/assets/flower/wilting.png",
    videoSrc: "/assets/flower/wilting_motion.mp4",
    description: "Cây hoa rủ đầu buồn ngủ khi gián đoạn chuỗi, chờ đón nước yêu thương hoặc lượt khôi phục chuỗi."
  }
};

export function getGrowthStageByStreak(streak: number): FlowerGrowthStage {
  if (streak < 3) return GROWTH_STAGES.seed;
  if (streak < 7) return GROWTH_STAGES.sowing;
  if (streak < 14) return GROWTH_STAGES.sprout;
  if (streak < 21) return GROWTH_STAGES.seedling;
  return GROWTH_STAGES.bloom;
}

interface SunflowerVisualProps {
  state: FlowerState;
  streak: number;
  waterDrops: number;
  isWatering?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  displayMode?: DisplayMode;
  previewAuraLevel?: number | null;
  previewGrowthStage?: string | null;
  interactiveControls?: boolean;
  onModeChange?: (mode: DisplayMode) => void;
  className?: string;
}

export default function SunflowerVisual({
  state,
  streak,
  isWatering,
  size = "md",
  displayMode = "3d_motion",
  previewAuraLevel = null,
  previewGrowthStage = null,
  interactiveControls = false,
  onModeChange,
  className = ""
}: SunflowerVisualProps) {
  const [internalMode, setInternalMode] = useState<DisplayMode>(displayMode);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    setInternalMode(displayMode);
  }, [displayMode]);

  // Xác định aura level hiệu lực (nếu có previewAuraLevel thì ưu tiên)
  const realAura = getAuraLevelByStreak(streak);
  const activeAura = previewAuraLevel
    ? AURA_LEVELS.find((a) => a.level === previewAuraLevel) || realAura
    : realAura;

  // Xác định asset theo mốc ngày:
  // 0 ngày: seed, 3 ngày: sowing, 7 ngày: sprout, 14 ngày: seedling, 21 ngày: bloom
  // >= 30 ngày: aura levels tương ứng
  // Nếu state === "thieu_nuoc": wilting (chỉ xảy ra khi streak >= 21)
  const currentGrowth = getGrowthStageByStreak(streak);

  let currentImage = currentGrowth.imageSrc;
  let currentVideo = currentGrowth.videoSrc;
  let stageTitle = currentGrowth.name;

  if (previewGrowthStage && GROWTH_STAGES[previewGrowthStage]) {
    const pStg = GROWTH_STAGES[previewGrowthStage];
    currentImage = pStg.imageSrc;
    currentVideo = pStg.videoSrc;
    stageTitle = pStg.name;
  } else if (state === "thieu_nuoc" && streak >= 21) {
    currentImage = GROWTH_STAGES.wilting.imageSrc;
    currentVideo = GROWTH_STAGES.wilting.videoSrc;
    stageTitle = GROWTH_STAGES.wilting.name;
  } else if (activeAura) {
    currentImage = activeAura.imageSrc;
    currentVideo = activeAura.videoSrc;
    stageTitle = `${activeAura.name} (${activeAura.minStreak}+ ngày)`;
  }

  // Tự động phát video loop khi đổi nguồn
  useEffect(() => {
    if (internalMode === "3d_motion" && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [currentVideo, internalMode]);

  // Kích thước chuẩn tỉ lệ 1:1 vuông vức, phóng to hoa để hiển thị rõ nét và choáng ngợp
  const sizeClasses = {
    sm: "w-28 h-28 aspect-square",
    md: "w-60 h-60 sm:w-68 sm:h-68 aspect-square",
    lg: "w-72 h-72 sm:w-84 sm:h-84 aspect-square",
    xl: "w-88 h-88 sm:w-96 sm:h-96 aspect-square"
  }[size];
  const handleModeSwitch = (newMode: DisplayMode) => {
    setInternalMode(newMode);
    onModeChange?.(newMode);
  };

  const isWilting = state === "thieu_nuoc";
  const isGlowing = state === "cham_hoc" || !!activeAura;

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* Vòng hào quang phát sáng phía sau */}
      {isGlowing && (
        <div
          className="absolute rounded-full blur-3xl opacity-60 animate-pulse pointer-events-none transition-all duration-700"
          style={{
            backgroundColor: activeAura ? activeAura.glowColor : "rgba(250, 204, 21, 0.4)",
            width: size === "sm" ? "120px" : size === "md" ? "240px" : "320px",
            height: size === "sm" ? "120px" : size === "md" ? "240px" : "320px",
            top: "5%"
          }}
        />
      )}

      {/* Hiệu ứng Giọt nước tưới rơi xuống */}
      {isWatering && (
        <div className="absolute top-4 flex gap-4 pointer-events-none z-30 animate-bounce">
          <div className="w-4 h-6 bg-sky-400 rounded-full animate-drop-fall shadow-lg" style={{ animationDelay: "0ms" }} />
          <div className="w-5 h-7 bg-sky-500 rounded-full animate-drop-fall shadow-lg" style={{ animationDelay: "150ms" }} />
          <div className="w-4 h-6 bg-sky-400 rounded-full animate-drop-fall shadow-lg" style={{ animationDelay: "300ms" }} />
        </div>
      )}

      {/* KHUNG HIỂN THỊ CHÍNH (TỈ LỆ 1:1 VUÔNG VỨC, HOA TO RÕ, ĐẦY ĐỦ CHI TIẾT) */}
      <div className={`relative flex items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-b from-stone-50/60 to-amber-50/40 border border-stone-200/60 shadow-inner ${sizeClasses}`}>
        {internalMode === "3d_motion" ? (
          <video
            ref={videoRef}
            src={currentVideo}
            poster={currentImage}
            autoPlay
            loop
            muted
            playsInline
            onError={() => {
              setInternalMode("3d_static");
            }}
            className="w-full h-full object-cover aspect-square drop-shadow-md scale-125 transition-transform duration-500 hover:scale-130"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentImage}
            alt={stageTitle}
            className="w-full h-full object-cover aspect-square drop-shadow-md scale-125 transition-transform duration-500 hover:scale-130"
          />
        )}
      </div>
      {/* THANH ĐIỀU KHIỂN CHẾ ĐỘ XEM (CHỈ GIỮ 3D MOTION & ẢNH HD) */}
      {interactiveControls && (
        <div className="mt-3 flex items-center justify-center gap-1.5 p-1 rounded-2xl bg-stone-100/80 border border-stone-200/80 backdrop-blur-sm shadow-inner text-xs">
          <button
            type="button"
            onClick={() => handleModeSwitch("3d_motion")}
            className={`flex items-center gap-1 px-3 py-1 rounded-xl font-medium transition-all ${
              internalMode === "3d_motion"
                ? "bg-white text-amber-700 shadow-sm font-semibold"
                : "text-stone-500 hover:text-stone-800"
            }`}
            title="Xem hoạt ảnh 3D chuyển động mượt mà 60fps"
          >
            <Film className="w-3.5 h-3.5 text-amber-500" />
            <span>Hoạt ảnh 3D</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeSwitch("3d_static")}
            className={`flex items-center gap-1 px-3 py-1 rounded-xl font-medium transition-all ${
              internalMode === "3d_static"
                ? "bg-white text-amber-700 shadow-sm font-semibold"
                : "text-stone-500 hover:text-stone-800"
            }`}
            title="Xem ảnh tĩnh 3D sắc nét tách nền"
          >
            <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
            <span>Ảnh 3D HD</span>
          </button>
        </div>
      )}

      {/* HUY HIỆU DANH HIỆU TRẠNG THÁI THEO MỐC */}
      <div className="mt-2.5 flex flex-col items-center max-w-xs text-center">
        {activeAura ? (
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border transition-all ${activeAura.badgeBg} ${activeAura.badgeBorder} ${activeAura.badgeText}`}
          >
            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "6s" }} />
            <span>
              {activeAura.name} • Cấp {activeAura.level} ({activeAura.minStreak}+ ngày)
            </span>
          </div>
        ) : isWilting ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm bg-sky-50 text-sky-800 border border-sky-200">
            <Droplets className="w-3.5 h-3.5 text-sky-500" />
            <span>💧 Cây Héo Cần Khôi Phục • Đứt chuỗi sau 21 ngày</span>
          </div>
        ) : streak >= 21 ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm bg-amber-50 text-amber-900 border border-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>🌻 Cây Lớn Rực Rỡ • Chuỗi {streak} ngày</span>
          </div>
        ) : streak >= 14 ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span>🌿 Cây Con Xanh Tươi • Chuỗi {streak} ngày</span>
          </div>
        ) : streak >= 7 ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm bg-lime-50 text-lime-800 border border-lime-300">
            <span>🌱 Mầm Xanh Vươn Lên • Chuỗi {streak} ngày</span>
          </div>
        ) : streak >= 3 ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm bg-amber-50/70 text-amber-800 border border-amber-200">
            <span>🪴 Gieo Vào Chậu • Chuỗi {streak} ngày</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm bg-stone-100 text-stone-700 border border-stone-300">
            <span>🌰 Hạt Giống Thần Kỳ • {streak} ngày (Cộng dồn)</span>
          </div>
        )}
      </div>
    </div>
  );
}
