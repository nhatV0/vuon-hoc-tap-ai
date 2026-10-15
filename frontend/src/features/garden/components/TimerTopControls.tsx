import React from "react";
import { Headphones, SlidersHorizontal, Sparkles, Volume2, VolumeX, Maximize2, Minimize2, X } from "lucide-react";
import { AmbientSoundType } from "./timerConstants";

interface Props {
  ambientSound: AmbientSoundType;
  setAmbientSound: (v: AmbientSoundType) => void;
  showSettingsDrawer: boolean;
  setShowSettingsDrawer: (v: boolean) => void;
  videoLabel: string;
  onNextVideo: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onExitClick: () => void;
}

export default function TimerTopControls({
  ambientSound,
  setAmbientSound,
  showSettingsDrawer,
  setShowSettingsDrawer,
  videoLabel,
  onNextVideo,
  soundEnabled,
  setSoundEnabled,
  isFullscreen,
  onToggleFullscreen,
  onExitClick
}: Props) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center p-0.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/15 text-xs text-stone-300">
        <Headphones className="w-3.5 h-3.5 ml-2 mr-1 text-amber-300" />
        <select
          value={ambientSound}
          onChange={(e) => setAmbientSound(e.target.value as AmbientSoundType)}
          className="bg-transparent text-white text-[11px] font-semibold pr-2 py-1 outline-none cursor-pointer"
        >
          <option value="none" className="bg-stone-900 text-white">Yên lặng</option>
          <option value="rain" className="bg-stone-900 text-white">Mưa rào êm</option>
          <option value="waves" className="bg-stone-900 text-white">Sóng biển dịu</option>
          <option value="wind" className="bg-stone-900 text-white">Gió đồi hoa</option>
          <option value="stream" className="bg-stone-900 text-white">Suối róc rách</option>
          <option value="fire" className="bg-stone-900 text-white">Lửa củi tí tách</option>
        </select>
      </div>

      <button
        type="button"
        onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
        className={`p-2 rounded-xl backdrop-blur-md border text-xs font-medium flex items-center gap-1 transition-all shadow-lg ${
          showSettingsDrawer
            ? "bg-amber-400 text-stone-950 border-amber-300 shadow-amber-400/20"
            : "bg-black/40 hover:bg-black/60 border-white/15 text-white/80 hover:text-white"
        }`}
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Chu kỳ</span>
      </button>

      <button
        type="button"
        onClick={onNextVideo}
        className="p-2 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/15 text-white/80 hover:text-white text-xs font-medium flex items-center gap-1 transition-all shadow-lg"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        <span className="hidden md:inline">{videoLabel}</span>
      </button>

      <button
        type="button"
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="p-2 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/15 text-white/80 hover:text-white transition-all shadow-lg"
      >
        {soundEnabled ? (
          <Volume2 className="w-3.5 h-3.5 text-amber-300" />
        ) : (
          <VolumeX className="w-3.5 h-3.5 text-stone-400" />
        )}
      </button>

      <button
        type="button"
        onClick={onToggleFullscreen}
        className="p-2 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/15 text-white/80 hover:text-white transition-all shadow-lg"
      >
        {isFullscreen ? (
          <Minimize2 className="w-3.5 h-3.5 text-amber-200" />
        ) : (
          <Maximize2 className="w-3.5 h-3.5 text-amber-200" />
        )}
      </button>

      <button
        type="button"
        onClick={onExitClick}
        className="p-2 sm:px-3 sm:py-2 rounded-xl bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 text-red-200 hover:text-white backdrop-blur-md text-xs font-bold flex items-center gap-1 transition-all shadow-lg group active:scale-95"
      >
        <X className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-200" />
        <span className="hidden sm:inline">Thoát</span>
      </button>
    </div>
  );
}
