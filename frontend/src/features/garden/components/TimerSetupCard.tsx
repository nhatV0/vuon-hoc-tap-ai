import React from "react";
import { Sparkles, Flame, Droplets, Play } from "lucide-react";
import { POMODORO_PRESETS, FocusStage } from "./timerConstants";

interface Props {
  currentStage: FocusStage;
  completedCycles: number;
  selectedPresetId: string;
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  isLotus: boolean;
  onApplyPreset: (id: string) => void;
  onStart: () => void;
}

export default function TimerSetupCard({
  currentStage,
  completedCycles,
  selectedPresetId,
  focusMinutes,
  shortBreakMinutes,
  longBreakMinutes,
  isLotus,
  onApplyPreset,
  onStart
}: Props) {
  return (
    <div className="max-w-lg w-full p-6 sm:p-8 rounded-3xl bg-black/65 backdrop-blur-2xl border border-white/20 text-white shadow-2xl space-y-5 animate-in zoom-in-95 duration-300">
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Không Gian Tập Trung Sâu Pomodoro</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Hẹn Giờ Tập Trung
        </h2>
        <p className="text-xs text-stone-300 max-w-sm mx-auto leading-relaxed">
          {currentStage === "focus"
            ? isLotus
              ? "Bình tâm tĩnh lặng cùng đóa hoa sen thanh tao để học sâu không xao nhãng."
              : "Hòa mình cùng cánh đồng hoa hướng dương để học sâu không xao nhãng."
            : "Thư giãn đôi mắt và hít thở nhẹ nhàng để chuẩn bị cho chu kỳ học tiếp theo."}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-amber-200/80">
          <span>Chọn chu kỳ tập trung:</span>
          <span>{completedCycles > 0 ? `Đã xong: ${completedCycles} chu kỳ` : "Chưa bắt đầu"}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {POMODORO_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onApplyPreset(preset.id)}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${
                  isSelected
                    ? "bg-gradient-to-b from-amber-400/30 to-amber-500/20 border-amber-400 text-white shadow-lg shadow-amber-400/10 ring-2 ring-amber-400/30"
                    : "bg-white/5 hover:bg-white/10 border-white/15 text-stone-300 hover:text-white"
                }`}
              >
                <span className="text-xs font-extrabold">{preset.name}</span>
                <span className="text-[10px] text-amber-200/70">{preset.tag}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-400" />
          <span className="text-stone-300">
            Tập trung <strong>{focusMinutes}m</strong> → Nghỉ <strong>{shortBreakMinutes}m</strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-sky-300 font-bold">
          <Droplets className="w-3.5 h-3.5 fill-sky-300" />
          <span>Thưởng +{focusMinutes >= 25 ? 2 : 1} giọt nước</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onStart}
        className={`w-full py-3.5 px-6 rounded-2xl ${
          currentStage === "focus"
            ? "bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-stone-950"
            : "bg-gradient-to-r from-emerald-400 to-teal-400 text-stone-950"
        } font-black text-sm sm:text-base shadow-xl shadow-amber-500/25 active:scale-98 transition-all flex items-center justify-center gap-2.5`}
      >
        <Play className="w-5 h-5 fill-stone-950" />
        <span>
          {currentStage === "focus"
            ? `BẮT ĐẦU TẬP TRUNG (${focusMinutes} PHÚT)`
            : `BẮT ĐẦU NGHỈ NGƠI (${currentStage === "short_break" ? shortBreakMinutes : longBreakMinutes} PHÚT)`}
        </span>
      </button>
    </div>
  );
}
