import React from "react";
import {
  Flame,
  Coffee,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";
import { AmbientSoundType, FocusStage } from "./timerConstants";
import TimerTopControls from "./TimerTopControls";
interface Props {
  timeFormatted: string;
  progressPercent: number;
  currentStage: FocusStage;
  isRunning: boolean;
  isPaused: boolean;
  isCompleted: boolean;
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
  onSwitchStage: (stage: FocusStage) => void;
  onResume: () => void;
  onPause: () => void;
  onReset: () => void;
  onExitClick: () => void;
}

export default function TimerTopBar({
  timeFormatted,
  progressPercent,
  currentStage,
  isRunning,
  isPaused,
  isCompleted,
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
  onSwitchStage,
  onResume,
  onPause,
  onReset,
  onExitClick
}: Props) {
  return (
    <header className="relative z-10 w-full px-4 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        <div className="group relative flex items-center gap-3 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-black/60 hover:bg-black/75 backdrop-blur-xl border border-white/20 text-white shadow-2xl transition-all">
          <div className="relative flex items-center justify-center">
            <span className={`w-3 h-3 rounded-full ${isRunning && !isPaused ? (currentStage === "focus" ? "bg-amber-400 animate-ping opacity-75" : "bg-emerald-400 animate-ping opacity-75") : isPaused ? "bg-amber-500" : isCompleted ? "bg-emerald-400" : "bg-white/40"}`} />
            <span className={`absolute w-2.5 h-2.5 rounded-full ${isRunning && !isPaused ? (currentStage === "focus" ? "bg-amber-400" : "bg-emerald-400") : isPaused ? "bg-amber-500" : isCompleted ? "bg-emerald-400" : "bg-white/70"}`} />
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums drop-shadow-md text-amber-200">
                {timeFormatted}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-amber-100/80">
                {isCompleted ? "Hoàn tất" : isPaused ? "Tạm dừng" : isRunning ? (currentStage === "focus" ? "Đang tập trung" : currentStage === "short_break" ? "Nghỉ giải lao" : "Nghỉ dài phục hồi") : (currentStage === "focus" ? "Sẵn sàng" : "Giờ giải lao")}
              </span>
            </div>

            <div className="w-full bg-white/20 h-1 rounded-full mt-1 overflow-hidden">
              <div
                className={`h-full ${
                  currentStage === "focus"
                    ? "bg-gradient-to-r from-amber-400 to-yellow-300"
                    : "bg-gradient-to-r from-emerald-400 to-teal-300"
                } transition-all duration-1000 ease-linear rounded-full`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center p-1 rounded-2xl bg-black/50 backdrop-blur-xl border border-white/15 text-xs">
          <button
            type="button"
            onClick={() => onSwitchStage("focus")}
            className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 transition-all ${
              currentStage === "focus"
                ? "bg-amber-400 text-stone-950 shadow-md font-extrabold"
                : "text-stone-300 hover:text-white"
            }`}
          >
            <Flame className="w-3 h-3" />
            <span>Tập trung</span>
          </button>
          <button
            type="button"
            onClick={() => onSwitchStage("short_break")}
            className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 transition-all ${
              currentStage === "short_break"
                ? "bg-emerald-400 text-stone-950 shadow-md font-extrabold"
                : "text-stone-300 hover:text-white"
            }`}
          >
            <Coffee className="w-3 h-3" />
            <span>Nghỉ ngắn</span>
          </button>
          <button
            type="button"
            onClick={() => onSwitchStage("long_break")}
            className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 transition-all ${
              currentStage === "long_break"
                ? "bg-teal-400 text-stone-950 shadow-md font-extrabold"
                : "text-stone-300 hover:text-white"
            }`}
          >
            <Coffee className="w-3 h-3" />
            <span>Nghỉ dài</span>
          </button>
        </div>

        {(isRunning || isPaused) && !isCompleted && (
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/50 hover:bg-black/65 backdrop-blur-xl border border-white/20 text-white shadow-2xl transition-all">
            {isPaused ? (
              <button
                type="button"
                onClick={onResume}
                className="px-2.5 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold transition-all active:scale-95 flex items-center gap-1 text-xs shadow-md"
              >
                <Play className="w-3.5 h-3.5 fill-stone-950" />
                <span>Tiếp tục</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onPause}
                className="px-2.5 py-1 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-all active:scale-95 flex items-center gap-1 text-xs shadow-md"
              >
                <Pause className="w-3.5 h-3.5 fill-white" />
                <span>Tạm dừng</span>
              </button>
            )}

            <button
              type="button"
              onClick={onReset}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white border border-white/20 transition-all active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <TimerTopControls
        ambientSound={ambientSound}
        setAmbientSound={setAmbientSound}
        showSettingsDrawer={showSettingsDrawer}
        setShowSettingsDrawer={setShowSettingsDrawer}
        videoLabel={videoLabel}
        onNextVideo={onNextVideo}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        isFullscreen={isFullscreen}
        onToggleFullscreen={onToggleFullscreen}
        onExitClick={onExitClick}
      />
    </header>
  );
}
