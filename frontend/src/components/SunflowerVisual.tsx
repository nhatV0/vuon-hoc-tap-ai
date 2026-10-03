"use client";

import React from "react";
import { FlowerState } from "@/lib/types";

interface SunflowerVisualProps {
  state: FlowerState;
  streak: number;
  waterDrops: number;
  isWatering?: boolean;
}

export default function SunflowerVisual({ state, streak, isWatering }: SunflowerVisualProps) {
  // Trạng thái cánh hoa và thân cây theo máy trạng thái
  const isGlowing = state === "cham_hoc";
  const isWilting = state === "thieu_nuoc";
  const isWinter = state === "heo_kho";

  return (
    <div className="relative flex flex-col items-center justify-center p-6 select-none">
      {/* Hiệu ứng Hào quang khi đạt danh hiệu Hoa Chăm Học (streak >= 7) */}
      {isGlowing && (
        <div className="absolute w-72 h-72 rounded-full bg-sunflower-300/30 blur-2xl animate-pulse-glow pointer-events-none -top-4" />
      )}

      {/* Hiệu ứng Giọt nước tưới rơi xuống */}
      {isWatering && (
        <div className="absolute top-10 flex gap-4 pointer-events-none z-20">
          <div className="w-4 h-6 bg-sky-400 rounded-full animate-drop-fall shadow-md" style={{ animationDelay: '0ms' }} />
          <div className="w-5 h-7 bg-sky-500 rounded-full animate-drop-fall shadow-md" style={{ animationDelay: '150ms' }} />
          <div className="w-4 h-6 bg-sky-400 rounded-full animate-drop-fall shadow-md" style={{ animationDelay: '300ms' }} />
        </div>
      )}

      {/* Đồ họa SVG Vector Hoa Hướng Dương Chữa Lành */}
      <div className={`relative transition-all duration-700 ${isWilting ? 'rotate-6 scale-95 opacity-85' : 'animate-sway'}`}>
        <svg
          width="260"
          height="320"
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

          {/* CHẬU CÂY ĐẤT NUNG GỐM SỨ */}
          <g id="flower-pot">
            {/* Vành chậu */}
            <rect x="80" y="240" width="100" height="16" rx="6" fill="#EA580C" opacity="0.9" />
            {/* Thân chậu hình thang */}
            <path
              d="M90 256 L98 308 C99 313 103 316 108 316 L152 316 C157 316 161 313 162 308 L170 256 Z"
              fill="url(#potGrad)"
            />
            {/* Đất mùn hữu cơ */}
            <ellipse cx="130" cy="245" rx="42" ry="7" fill="#451A03" opacity="0.85" />
          </g>

          {/* TRƯỜNG HỢP: MÙA ĐÔNG VÀ HẠT MẦM MỚI (heo_kho) */}
          {isWinter ? (
            <g id="winter-seed">
              {/* Lớp tuyết êm đềm */}
              <ellipse cx="130" cy="244" rx="38" ry="5" fill="#E5E7EB" opacity="0.9" />
              {/* Hạt mầm nhỏ hy vọng nhú xanh non */}
              <path
                d="M130 242 C127 232 122 226 120 224 C128 223 134 227 130 242 Z"
                fill="#4A7C59"
              />
              <path
                d="M130 242 C133 232 138 226 140 224 C132 223 126 227 130 242 Z"
                fill="#75A077"
              />
              <circle cx="130" cy="216" r="3" fill="#FACC15" className="animate-ping" opacity="0.75" />
            </g>
          ) : (
            <>
              {/* THÂN CÂY UỐN LƯỢN NGHỆ THUẬT */}
              <path
                d={
                  isWilting
                    ? "M130 245 C128 200 115 170 120 120"
                    : "M130 245 C129 190 132 160 130 110"
                }
                stroke="url(#stemGrad)"
                strokeWidth="10"
                strokeLinecap="round"
              />

              {/* LÁ CÂY TRÁI */}
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
              {/* LÁ CÂY PHẢI */}
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

              {/* BÔNG HOA HƯỚNG DƯƠNG */}
              <g
                id="flower-head"
                transform={isWilting ? "translate(120, 115) rotate(15)" : "translate(130, 105)"}
              >
                {/* 12 Cánh hoa xòe tròn tỏa nắng */}
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

                {/* Nhụy hoa tròn ấm áp */}
                <circle cx="0" cy="0" r="30" fill="url(#centerGrad)" stroke="#B45309" strokeWidth="2" />

                {/* Hạt hoa xoắn ốc Fibonacci cách điệu */}
                {[-14, -7, 0, 7, 14].map((x) =>
                  [-14, -7, 0, 7, 14].map((y) => {
                    const dist = Math.sqrt(x * x + y * y);
                    if (dist > 24) return null;
                    return (
                      <circle
                        key={`${x}-${y}`}
                        cx={x}
                        cy={y}
                        r="1.6"
                        fill="#F59E0B"
                        opacity={isGlowing ? "0.9" : "0.55"}
                      />
                    );
                  })
                )}

                {/* Nụ cười vui tươi của Bông hoa Mentor */}
                <path
                  d={
                    isWilting
                      ? "M-10 6 Q0 0 10 6"
                      : "M-12 2 Q0 16 12 2"
                  }
                  stroke="#FDE047"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Đôi mắt tinh anh */}
                <circle cx="-9" cy="-5" r="2.5" fill="#FDE047" />
                <circle cx="9" cy="-5" r="2.5" fill="#FDE047" />
              </g>
            </>
          )}
        </svg>
      </div>

      {/* Huy hiệu danh hiệu trạng thái hoa */}
      <div className="mt-2 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-sm backdrop-blur-md border transition-all duration-300">
          {state === "cham_hoc" && (
            <span className="bg-amber-100 text-amber-900 border-amber-300 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              ✨ Hoa Chăm Học • Streak {streak} ngày rực rỡ
            </span>
          )}
          {state === "tich_cuc" && (
            <span className="bg-emerald-50 text-emerald-800 border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              🌱 Hoa Tích Cực • Đón nắng mỗi ngày ({streak} ngày)
            </span>
          )}
          {state === "thieu_nuoc" && (
            <span className="bg-sky-50 text-sky-800 border-sky-200 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              💧 Hoa Thiếu Nước • Cần một chút quan tâm
            </span>
          )}
          {state === "heo_kho" && (
            <span className="bg-stone-100 text-stone-700 border-stone-300 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              ❄️ Mầm Non Tái Sinh • Khởi đầu mới không áp lực
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
