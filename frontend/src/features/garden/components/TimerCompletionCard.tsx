import React from "react";
import { CheckCircle2, Coffee, Droplets, Flame } from "lucide-react";
import { FocusStage } from "./timerConstants";

interface Props {
  currentStage: FocusStage;
  totalSeconds: number;
  completedCycles: number;
  rewardClaimed: boolean;
  waterDropsEarned: number;
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  onSwitchStage: (stage: FocusStage) => void;
  onExit: () => void;
}

export default function TimerCompletionCard({
  currentStage,
  totalSeconds,
  completedCycles,
  rewardClaimed,
  waterDropsEarned,
  focusMinutes,
  shortBreakMinutes,
  longBreakMinutes,
  onSwitchStage,
  onExit
}: Props) {
  return (
    <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-black/65 backdrop-blur-2xl border border-amber-300/30 text-center text-white shadow-2xl animate-in zoom-in-95 duration-400 space-y-4">
      <div className={`w-16 h-16 rounded-full ${
        currentStage === "focus"
          ? "bg-gradient-to-tr from-amber-400 to-yellow-300 text-stone-950"
          : "bg-gradient-to-tr from-emerald-400 to-teal-300 text-stone-950"
      } flex items-center justify-center mx-auto shadow-lg animate-bounce`}>
        {currentStage === "focus" ? (
          <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
        ) : (
          <Coffee className="w-9 h-9 stroke-[2.5]" />
        )}
      </div>

      <div className="space-y-1.5">
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-amber-200">
          {currentStage === "focus"
            ? "Xuất sắc! Hoàn thành phiên tập trung"
            : "Hết giờ nghỉ! Bạn đã nạp đầy năng lượng"}
        </h2>
        <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
          {currentStage === "focus"
            ? `Bạn đã duy trì sự tập trung trọn vẹn trong ${Math.round(totalSeconds / 60)} phút vừa qua.`
            : "Cơ thể và tâm trí đã sẵn sàng để bắt đầu chu kỳ tập trung tiếp theo!"}
        </p>
      </div>

      {currentStage === "focus" && (
        <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-between text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shrink-0">
              <Droplets className="w-5 h-5 fill-sky-400" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-300 block">
                Phần Thưởng Chăm Chỉ
              </span>
              <span className="text-xs font-semibold text-white">
                {rewardClaimed
                  ? `Đã nhận +${waterDropsEarned} giọt nước tưới cây!`
                  : `Hoàn tất chu kỳ Pomodoro thứ ${completedCycles}`}
              </span>
            </div>
          </div>
          <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-sky-400 text-stone-950">
            +{waterDropsEarned || (focusMinutes >= 25 ? 2 : 1)} Giọt
          </span>
        </div>
      )}

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
        {currentStage === "focus" ? (
          <button
            type="button"
            onClick={() => {
              const nextStage = completedCycles % 4 === 0 ? "long_break" : "short_break";
              onSwitchStage(nextStage);
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-stone-950 font-extrabold text-xs sm:text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Coffee className="w-4 h-4" />
            <span>
              {completedCycles % 4 === 0
                ? `Nghỉ dài phục hồi (${longBreakMinutes}m)`
                : `Nghỉ ngắn thư giãn (${shortBreakMinutes}m)`}
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSwitchStage("focus")}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-extrabold text-xs sm:text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Flame className="w-4 h-4" />
            <span>Bắt đầu tập trung mới ({focusMinutes}m)</span>
          </button>
        )}

        <button
          type="button"
          onClick={onExit}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white text-xs sm:text-sm active:scale-95 transition-all"
        >
          Trở về khu vườn
        </button>
      </div>
    </div>
  );
}
