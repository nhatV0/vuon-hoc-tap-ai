"use client";

import React, { useState, useEffect, useRef } from "react";
import { FlowerState } from "@/lib/types";
import { Sparkles, Film, Image as ImageIcon, Code2, Droplets } from "lucide-react";

export type DisplayMode = "3d_motion" | "3d_static" | "svg_vector";

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

export const AURA_LEVELS: AuraLevelInfo[] = [
  {
    level: 1,
    minStreak: 3,
    name: "Hào Quang Bạch Ngọc",
    colorName: "Trắng tinh khiết",
    auraTag: "lvl1_white",
    badgeBg: "bg-slate-50",
    badgeBorder: "border-slate-300",
    badgeText: "text-slate-800",
    glowColor: "rgba(255, 255, 255, 0.75)",
    imageSrc: "/assets/flower/sunflower_aura_lvl1_white.png",
    videoSrc: "/assets/flower/sunflower_aura_lvl1_white.mp4",
    meaning: "Khởi đầu thanh khiết, tâm trí trong trẻo và định hình nhịp điệu tự học."
  },
  {
    level: 2,
    minStreak: 7,
    name: "Hào Quang Lam Ngọc",
    colorName: "Xanh lam trí tuệ",
    auraTag: "lvl2_blue",
    badgeBg: "bg-blue-50",
    badgeBorder: "border-blue-300",
    badgeText: "text-blue-800",
    glowColor: "rgba(59, 130, 246, 0.65)",
    imageSrc: "/assets/flower/sunflower_aura_lvl2_blue.png",
    videoSrc: "/assets/flower/sunflower_aura_lvl2_blue.mp4",
    meaning: "7 ngày kiên trì! Khí chất điềm tĩnh, tĩnh lặng và sự kiên nhẫn bừng sáng."
  },
  {
    level: 3,
    minStreak: 14,
    name: "Hào Quang Thủy Triều",
    colorName: "Xanh ngọc biển mát lành",
    auraTag: "lvl3_aqua",
    badgeBg: "bg-cyan-50",
    badgeBorder: "border-cyan-300",
    badgeText: "text-cyan-800",
    glowColor: "rgba(6, 182, 212, 0.65)",
    imageSrc: "/assets/flower/sunflower_aura_lvl3_aqua.png",
    videoSrc: "/assets/flower/sunflower_aura_lvl3_aqua.mp4",
    meaning: "14 ngày kiên định! Dòng chảy kiến thức thông suốt, cuốn trôi mọi mệt mỏi."
  },
  {
    level: 4,
    minStreak: 21,
    name: "Hào Quang Tinh Vân Tím",
    colorName: "Tím huyền bí",
    auraTag: "lvl4_purple",
    badgeBg: "bg-purple-50",
    badgeBorder: "border-purple-300",
    badgeText: "text-purple-800",
    glowColor: "rgba(168, 85, 247, 0.7)",
    imageSrc: "/assets/flower/sunflower_aura_lvl4_purple.png",
    videoSrc: "/assets/flower/sunflower_aura_lvl4_purple.mp4",
    meaning: "21 ngày thoát khỏi trọng lực lười biếng! Thói quen tích cực đã khắc sâu vào bản sắc."
  },
  {
    level: 5,
    minStreak: 30,
    name: "Hào Quang Hồng Ngọc Lửa",
    colorName: "Đỏ rực lửa",
    auraTag: "lvl5_red",
    badgeBg: "bg-rose-50",
    badgeBorder: "border-rose-300",
    badgeText: "text-rose-800",
    glowColor: "rgba(244, 63, 94, 0.7)",
    imageSrc: "/assets/flower/sunflower_aura_lvl5_red.png",
    videoSrc: "/assets/flower/sunflower_aura_lvl5_red.mp4",
    meaning: "30 ngày bản lĩnh! Lòng quả cảm và ngọn lửa đam mê học tập bất khả chiến bại."
  },
  {
    level: 6,
    minStreak: 50,
    name: "Hào Quang Kim Thái Dương",
    colorName: "Vàng kim chói lọi",
    auraTag: "lvl6_gold",
    badgeBg: "bg-amber-50",
    badgeBorder: "border-amber-300",
    badgeText: "text-amber-900",
    glowColor: "rgba(245, 158, 11, 0.8)",
    imageSrc: "/assets/flower/sunflower_aura_lvl6_gold.png",
    videoSrc: "/assets/flower/sunflower_aura_lvl6_gold.mp4",
    meaning: "50 ngày phi thường! Rực rỡ như vầng thái dương ban trưa, uy nghiêm đỉnh cao."
  },
  {
    level: 7,
    minStreak: 100,
    name: "Hào Quang Cầu Vồng Cực Quang",
    colorName: "Ngũ sắc huyền ảo",
    auraTag: "lvl7_rainbow",
    badgeBg: "bg-gradient-to-r from-pink-50 via-amber-50 to-emerald-50",
    badgeBorder: "border-indigo-300",
    badgeText: "text-indigo-900",
    glowColor: "rgba(129, 140, 248, 0.85)",
    imageSrc: "/assets/flower/sunflower_aura_lvl7_rainbow.png",
    videoSrc: "/assets/flower/sunflower_aura_lvl7_rainbow.mp4",
    meaning: "100 ngày kỷ lục! Sự hài hòa mỹ mãn của mọi cung bậc cảm xúc và ý chí thép."
  },
  {
    level: 8,
    minStreak: 150,
    name: "Hào Quang Thiên Giới Tối Thượng",
    colorName: "Kim cương thiêng liêng",
    auraTag: "lvl8_divine",
    badgeBg: "bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-200",
    badgeBorder: "border-amber-400",
    badgeText: "text-amber-950 font-black",
    glowColor: "rgba(251, 191, 36, 0.95)",
    imageSrc: "/assets/flower/sunflower_aura_lvl8_divine.png",
    videoSrc: "/assets/flower/sunflower_aura_lvl8_divine.mp4",
    meaning: ">150 ngày huyền thoại! Cảnh giới tối thượng, ánh sáng kim cương khai sáng tâm trí."
  }
];

export function getAuraLevelByStreak(streak: number): AuraLevelInfo | null {
  if (streak < 3) return null;
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
  name: string;
  imageSrc: string;
  videoSrc: string;
  description: string;
}

export const GROWTH_STAGES: Record<string, FlowerGrowthStage> = {
  seed: {
    stageKey: "seed",
    name: "Hạt giống thần kỳ",
    imageSrc: "/assets/flower/seed.png",
    videoSrc: "/assets/flower/seed_motion.mp4",
    description: "Hạt mầm hy vọng tích lũy năng lượng tinh khôi trước khi nảy chồi."
  },
  sowing: {
    stageKey: "sowing",
    name: "Gieo hạt vào chậu",
    imageSrc: "/assets/flower/sowing.png",
    videoSrc: "/assets/flower/sowing_motion.mp4",
    description: "Hạt mầm được đặt nhẹ nhàng vào đất ẩm tơi xốp, đón tia nắng đầu tiên."
  },
  sprout: {
    stageKey: "sprout",
    name: "Mầm non nhú nở",
    imageSrc: "/assets/flower/sprout.png",
    videoSrc: "/assets/flower/sprout_motion.mp4",
    description: "Hai lá mầm xinh xắn tách lớp đất vươn lên đón ánh sáng mặt trời."
  },
  seedling: {
    stageKey: "seedling",
    name: "Cây con xanh tươi",
    imageSrc: "/assets/flower/seedling.png",
    videoSrc: "/assets/flower/seedling_motion.mp4",
    description: "Thân cây mảnh mai đầy sức sống, lá non đung đưa theo nhịp thở."
  },
  bloom: {
    stageKey: "bloom",
    name: "Hoa rực rỡ đón nắng",
    imageSrc: "/assets/flower/bloom.png",
    videoSrc: "/assets/flower/bloom_motion.mp4",
    description: "Bông hoa hướng dương nở trọn vẹn với nụ cười ấm áp yêu đời."
  },
  wilting: {
    stageKey: "wilting",
    name: "Hoa rủ nhẹ cần tưới",
    imageSrc: "/assets/flower/wilting.png",
    videoSrc: "/assets/flower/wilting_motion.mp4",
    description: "Cây hoa rủ đầu buồn ngủ, chờ đón những giọt nước yêu thương để bừng tỉnh."
  }
};

interface SunflowerVisualProps {
  state: FlowerState;
  streak: number;
  waterDrops: number;
  isWatering?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  displayMode?: DisplayMode;
  previewAuraLevel?: number | null;
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
  interactiveControls = false,
  onModeChange,
  className = ""
}: SunflowerVisualProps) {
  const [internalMode, setInternalMode] = useState<DisplayMode>(displayMode);
  const [mediaError, setMediaError] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    setInternalMode(displayMode);
  }, [displayMode]);

  const effectiveMode = mediaError ? "svg_vector" : internalMode;

  // Xác định aura level hiệu lực (nếu có previewAuraLevel thì ưu tiên)
  const realAura = getAuraLevelByStreak(streak);
  const activeAura = previewAuraLevel
    ? AURA_LEVELS.find((a) => a.level === previewAuraLevel) || realAura
    : realAura;

  // Xác định asset tương ứng với state hiện tại
  let currentImage = GROWTH_STAGES.bloom.imageSrc;
  let currentVideo = GROWTH_STAGES.bloom.videoSrc;
  let stageTitle = GROWTH_STAGES.bloom.name;

  if (state === "thieu_nuoc") {
    currentImage = GROWTH_STAGES.wilting.imageSrc;
    currentVideo = GROWTH_STAGES.wilting.videoSrc;
    stageTitle = GROWTH_STAGES.wilting.name;
  } else if (state === "heo_kho") {
    currentImage = GROWTH_STAGES.sprout.imageSrc;
    currentVideo = GROWTH_STAGES.sprout.videoSrc;
    stageTitle = "Mầm Non Tái Sinh";
  } else if (activeAura) {
    currentImage = activeAura.imageSrc;
    currentVideo = activeAura.videoSrc;
    stageTitle = `${activeAura.name} (Cấp ${activeAura.level})`;
  } else if (streak <= 1) {
    currentImage = GROWTH_STAGES.sprout.imageSrc;
    currentVideo = GROWTH_STAGES.sprout.videoSrc;
    stageTitle = GROWTH_STAGES.sprout.name;
  } else if (streak < 3) {
    currentImage = GROWTH_STAGES.seedling.imageSrc;
    currentVideo = GROWTH_STAGES.seedling.videoSrc;
    stageTitle = GROWTH_STAGES.seedling.name;
  }

  // Tự động phát video loop khi đổi nguồn
  useEffect(() => {
    if (effectiveMode === "3d_motion" && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        // Trình duyệt có thể block autoplay nếu chưa tương tác, fallback im lặng
      });
    }
  }, [currentVideo, effectiveMode]);

  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-44 h-44 sm:w-52 sm:h-52",
    lg: "w-64 h-64 sm:w-72 sm:h-72",
    xl: "w-80 h-80 sm:w-96 sm:h-96"
  }[size];

  const handleModeSwitch = (newMode: DisplayMode) => {
    setInternalMode(newMode);
    setMediaError(false);
    onModeChange?.(newMode);
  };

  const isWilting = state === "thieu_nuoc";
  const isWinter = state === "heo_kho";
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

      {/* KHUNG HIỂN THỊ CHÍNH (3D Motion / 3D Static / SVG Vector) */}
      <div className={`relative flex items-center justify-center overflow-hidden rounded-3xl ${sizeClasses}`}>
        {effectiveMode === "3d_motion" && (
          <video
            ref={videoRef}
            src={currentVideo}
            poster={currentImage}
            autoPlay
            loop
            muted
            playsInline
            onError={() => {
              // Nếu video lỗi, chuyển sang ảnh tĩnh
              setInternalMode("3d_static");
            }}
            className="w-full h-full object-contain drop-shadow-md transition-transform duration-500 hover:scale-105"
          />
        )}

        {effectiveMode === "3d_static" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentImage}
            alt={stageTitle}
            onError={() => setMediaError(true)}
            className="w-full h-full object-contain drop-shadow-md transition-transform duration-500 hover:scale-105"
          />
        )}

        {effectiveMode === "svg_vector" && (
          <div className={`relative transition-all duration-700 ${isWilting ? "rotate-6 scale-95 opacity-85" : "animate-sway"}`}>
            <svg
              width="220"
              height="280"
              viewBox="0 0 260 320"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-sm"
            >
              <defs>
                <linearGradient id="petalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={isWinter ? "#D1D5DB" : isWilting ? "#E5C07B" : "#FDE047"} />
                  <stop offset="100%" stopColor={isWinter ? "#9CA3AF" : isWilting ? "#C98A2C" : "#E5A93C"} />
                </linearGradient>
                <linearGradient id="centerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={isWinter ? "#6B7280" : "#5C3A21"} />
                  <stop offset="100%" stopColor={isWinter ? "#4B5563" : "#382212"} />
                </linearGradient>
                <linearGradient id="stemGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={isWinter ? "#9CA3AF" : isWilting ? "#8FA382" : "#528255"} />
                  <stop offset="100%" stopColor={isWinter ? "#6B7280" : isWilting ? "#6D8260" : "#325239"} />
                </linearGradient>
                <linearGradient id="potGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#D97706" />
                  <stop offset="50%" stopColor="#EA580C" />
                  <stop offset="100%" stopColor="#C2410C" />
                </linearGradient>
              </defs>

              {/* Chậu cây */}
              <g id="flower-pot">
                <rect x="80" y="240" width="100" height="16" rx="6" fill="#EA580C" opacity="0.9" />
                <path
                  d="M90 256 L98 308 C99 313 103 316 108 316 L152 316 C157 316 161 313 162 308 L170 256 Z"
                  fill="url(#potGrad)"
                />
                <ellipse cx="130" cy="245" rx="42" ry="7" fill="#451A03" opacity="0.85" />
              </g>

              {isWinter ? (
                <g id="winter-seed">
                  <ellipse cx="130" cy="244" rx="38" ry="5" fill="#E5E7EB" opacity="0.9" />
                  <path d="M130 242 C127 232 122 226 120 224 C128 223 134 227 130 242 Z" fill="#4A7C59" />
                  <path d="M130 242 C133 232 138 226 140 224 C132 223 126 227 130 242 Z" fill="#75A077" />
                  <circle cx="130" cy="216" r="3" fill="#FACC15" className="animate-ping" opacity="0.75" />
                </g>
              ) : (
                <>
                  <path
                    d={isWilting ? "M130 245 C128 200 115 170 120 120" : "M130 245 C129 190 132 160 130 110"}
                    stroke="url(#stemGrad)"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  <path
                    d={
                      isWilting
                        ? "M124 185 C95 195 90 220 102 230 C120 222 122 195 124 185 Z"
                        : "M130 180 C95 160 85 185 100 205 C120 205 128 185 130 180 Z"
                    }
                    fill={isWilting ? "#8FA382" : "#4A7C59"}
                    stroke="#325239"
                    strokeWidth="1.5"
                  />
                  <path
                    d={
                      isWilting
                        ? "M124 165 C150 175 165 200 152 212 C136 202 126 175 124 165 Z"
                        : "M130 160 C165 140 175 165 160 185 C140 185 132 165 130 160 Z"
                    }
                    fill={isWilting ? "#A3B59B" : "#528255"}
                    stroke="#325239"
                    strokeWidth="1.5"
                  />
                  <g id="flower-head" transform={isWilting ? "translate(120, 115) rotate(15)" : "translate(130, 105)"}>
                    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, idx) => (
                      <path
                        key={idx}
                        d="M0 -15 C-12 -38 -12 -58 0 -72 C12 -58 12 -38 0 -15 Z"
                        fill="url(#petalGrad)"
                        stroke="#D97706"
                        strokeWidth="1"
                        transform={`rotate(${deg})`}
                        opacity="0.95"
                      />
                    ))}
                    <circle cx="0" cy="0" r="30" fill="url(#centerGrad)" stroke="#B45309" strokeWidth="2" />
                    <path
                      d={isWilting ? "M-10 6 Q0 0 10 6" : "M-12 2 Q0 16 12 2"}
                      stroke="#FDE047"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <circle cx="-9" cy="-5" r="2.5" fill="#FDE047" />
                    <circle cx="9" cy="-5" r="2.5" fill="#FDE047" />
                  </g>
                </>
              )}
            </svg>
          </div>
        )}
      </div>

      {/* THANH ĐIỀU KHIỂN CHẾ ĐỘ XEM (TÙY CHỌN CHO GIAO DIỆN KHU VƯỜN) */}
      {interactiveControls && (
        <div className="mt-3 flex items-center justify-center gap-1.5 p-1 rounded-2xl bg-stone-100/80 border border-stone-200/80 backdrop-blur-sm shadow-inner text-xs">
          <button
            type="button"
            onClick={() => handleModeSwitch("3d_motion")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-medium transition-all ${
              effectiveMode === "3d_motion"
                ? "bg-white text-amber-700 shadow-sm font-semibold"
                : "text-stone-500 hover:text-stone-800"
            }`}
            title="Xem chuyển động mượt mà lặp vô tận (Motion Loop 60fps)"
          >
            <Film className="w-3.5 h-3.5 text-amber-500" />
            <span>Hoạt ảnh 3D</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeSwitch("3d_static")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-medium transition-all ${
              effectiveMode === "3d_static"
                ? "bg-white text-amber-700 shadow-sm font-semibold"
                : "text-stone-500 hover:text-stone-800"
            }`}
            title="Xem ảnh tĩnh chất lượng cao tách nền"
          >
            <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
            <span>Ảnh 3D HD</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeSwitch("svg_vector")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-medium transition-all ${
              effectiveMode === "svg_vector"
                ? "bg-white text-amber-700 shadow-sm font-semibold"
                : "text-stone-500 hover:text-stone-800"
            }`}
            title="Đồ họa Vector SVG nhẹ nhàng tương tác"
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>SVG Gốc</span>
          </button>
        </div>
      )}

      {/* HUY HIỆU DANH HIỆU TRẠNG THÁI & CẤP ĐỘ HÀO QUANG */}
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
        ) : state === "cham_hoc" ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm bg-amber-50 text-amber-900 border border-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>✨ Hoa Chăm Học • Chuỗi {streak} ngày</span>
          </div>
        ) : state === "tich_cuc" ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span>🌱 Hoa Tích Cực • Đón nắng mỗi ngày ({streak} ngày)</span>
          </div>
        ) : state === "thieu_nuoc" ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm bg-sky-50 text-sky-800 border border-sky-200">
            <Droplets className="w-3.5 h-3.5 text-sky-500" />
            <span>💧 Hoa Thiếu Nước • Cần một chút quan tâm</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm bg-stone-100 text-stone-700 border border-stone-300">
            <span>❄️ Mầm Non Tái Sinh • Khởi đầu mới không áp lực</span>
          </div>
        )}
      </div>
    </div>
  );
}
