import React from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  onCancel: () => void;
  onConfirm: () => void;
}

export default function TimerConfirmExitModal({ onCancel, onConfirm }: Props) {
  return (
    <div className="absolute inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="max-w-sm w-full p-6 rounded-3xl bg-stone-900 border border-stone-700 text-white space-y-4 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-base font-bold text-white">Dừng phiên tập trung?</h3>
          <p className="text-xs text-stone-300">
            Thời gian đếm ngược sẽ bị hủy và tiến độ chưa được lưu. Bạn có chắc chắn muốn thoát?
          </p>
        </div>
        <div className="flex items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors"
          >
            Tiếp tục tập trung
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-lg"
          >
            Xác nhận thoát
          </button>
        </div>
      </div>
    </div>
  );
}
