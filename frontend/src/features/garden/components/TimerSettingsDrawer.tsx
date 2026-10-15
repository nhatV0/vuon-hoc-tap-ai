import React from "react";
import { SlidersHorizontal } from "lucide-react";
import { AUDIO_PATHS, FocusStage } from "./timerConstants";

interface Props {
  focusMinutes: number;
  setFocusMinutes: (val: number) => void;
  shortBreakMinutes: number;
  setShortBreakMinutes: (val: number) => void;
  longBreakMinutes: number;
  setLongBreakMinutes: (val: number) => void;
  ambientVolume: number;
  setAmbientVolume: (val: number) => void;
  selectedChime: "zen" | "chime";
  setSelectedChime: (val: "zen" | "chime") => void;
  currentStage: FocusStage;
  setTotalSeconds: (val: number) => void;
  setSecondsLeft: (val: number) => void;
  onClose: () => void;
}

export default function TimerSettingsDrawer({
  focusMinutes,
  setFocusMinutes,
  shortBreakMinutes,
  setShortBreakMinutes,
  longBreakMinutes,
  setLongBreakMinutes,
  ambientVolume,
  setAmbientVolume,
  selectedChime,
  setSelectedChime,
  currentStage,
  setTotalSeconds,
  setSecondsLeft,
  onClose
}: Props) {
  return (
    <div className="absolute inset-0 z-40 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="max-w-sm w-full p-6 rounded-3xl bg-stone-900 border border-stone-700 text-white space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-800 pb-2">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Tùy chỉnh thời lượng Pomodoro</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center text-xs"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-stone-300 mb-1 font-semibold">Thời gian tập trung (phút):</label>
            <input
              type="number"
              min="1"
              max="180"
              value={focusMinutes}
              onChange={(e) => {
                const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                setFocusMinutes(val);
                if (currentStage === "focus") {
                  setTotalSeconds(val * 60);
                  setSecondsLeft(val * 60);
                }
              }}
              className="w-full p-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-stone-300 mb-1 font-semibold">Thời gian nghỉ ngắn (phút):</label>
            <input
              type="number"
              min="1"
              max="60"
              value={shortBreakMinutes}
              onChange={(e) => {
                const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                setShortBreakMinutes(val);
                if (currentStage === "short_break") {
                  setTotalSeconds(val * 60);
                  setSecondsLeft(val * 60);
                }
              }}
              className="w-full p-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-stone-300 mb-1 font-semibold">Thời gian nghỉ dài sau 4 chu kỳ (phút):</label>
            <input
              type="number"
              min="1"
              max="90"
              value={longBreakMinutes}
              onChange={(e) => {
                const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                setLongBreakMinutes(val);
                if (currentStage === "long_break") {
                  setTotalSeconds(val * 60);
                  setSecondsLeft(val * 60);
                }
              }}
              className="w-full p-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white font-bold"
            />
          </div>

          <div className="pt-1 border-t border-stone-800">
            <div className="flex justify-between items-center mb-1">
              <label className="text-stone-300 font-semibold">Âm lượng White Noise:</label>
              <span className="text-amber-400 font-bold">{Math.round(ambientVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={ambientVolume}
              onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-stone-300 mb-1 font-semibold">Âm chuông kết thúc:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedChime("zen");
                  const a = new Audio(AUDIO_PATHS.chimes.zen);
                  a.volume = 0.8;
                  a.play().catch(() => {});
                }}
                className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                  selectedChime === "zen"
                    ? "bg-amber-400 text-stone-950 border-amber-300"
                    : "bg-stone-800 text-stone-300 border-stone-700 hover:text-white"
                }`}
              >
                Chuông Thiền Zen
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedChime("chime");
                  const a = new Audio(AUDIO_PATHS.chimes.chime);
                  a.volume = 0.8;
                  a.play().catch(() => {});
                }}
                className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                  selectedChime === "chime"
                    ? "bg-amber-400 text-stone-950 border-amber-300"
                    : "bg-stone-800 text-stone-300 border-stone-700 hover:text-white"
                }`}
              >
                Chuông Gió Ngân
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs shadow-md transition-all"
        >
          Lưu cài đặt
        </button>
      </div>
    </div>
  );
}
