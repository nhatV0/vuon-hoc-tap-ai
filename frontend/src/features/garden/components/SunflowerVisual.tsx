import React, { useMemo } from "react";
import { FlowerState } from "@/shared/types";
import { Sun, Sparkles, Droplets, Heart } from "lucide-react";

export type DisplayMode = "3d_motion" | "aura_effect" | "vector_svg";

interface SunflowerVisualProps {
  state: FlowerState;
  consecutiveDays: number;
  species?: string;
  displayMode?: DisplayMode;
  onWater?: () => void;
}

export default function SunflowerVisual({
  state,
  consecutiveDays,
  species = "sunflower",
  displayMode = "3d_motion"
}: SunflowerVisualProps) {
  const getLevel = (streak: number) => {
    if (streak >= 30) return 8;
    if (streak >= 21) return 7;
    if (streak >= 14) return 6;
    if (streak >= 7) return 5;
    if (streak >= 3) return 3;
    return 1;
  };

  const level = getLevel(consecutiveDays);

  const auraAsset = useMemo(() => {
    if (species === "lotus") {
      return `/assets/flower/lotus/lotus_aura_lvl${level}_gold.png`;
    }
    return `/assets/flower/Sunflower/sunflower_aura_lvl${level}_gold.png`;
  }, [species, level]);

  const motionVideo = useMemo(() => {
    if (state === "heo_kho") {
      return "/assets/flower/Sunflower/sunflower_wilting_motion.mp4";
    }
    if (consecutiveDays <= 1) {
      return "/assets/flower/seed_motion.mp4";
    }
    if (consecutiveDays <= 3) {
      return "/assets/flower/sprout_motion.mp4";
    }
    return "/assets/flower/Sunflower/sunflower_bloom_motion.mp4";
  }, [state, consecutiveDays]);

  return (
    <div className="relative w-full h-80 sm:h-96 flex flex-col items-center justify-center overflow-hidden rounded-3xl bg-radial from-amber-50/50 via-white to-stone-50 border border-stone-200/80 shadow-xs">
      {displayMode === "3d_motion" ? (
        <video
          key={motionVideo}
          src={motionVideo}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-contain pointer-events-none"
        />
      ) : displayMode === "aura_effect" ? (
        <div className="relative flex items-center justify-center w-full h-full">
          <img
            src={auraAsset}
            alt="Flower Aura"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
            className="w-64 h-64 object-contain animate-pulse"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 mb-4 animate-bounce">
            <Sun className="w-16 h-16" />
          </div>
          <span className="text-sm font-bold text-stone-800">Cây hoa Hướng Dương đang phát triển khỏe mạnh</span>
        </div>
      )}

      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-stone-200 shadow-xs flex items-center gap-1.5 text-xs font-bold text-amber-700">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span>Chuỗi {consecutiveDays} ngày</span>
      </div>
    </div>
  );
}
