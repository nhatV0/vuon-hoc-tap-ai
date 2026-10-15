import React from "react";
import { User, Phone, Sparkles } from "lucide-react";

export default function AppFooter() {
  return (
    <footer className="mt-16 border-t border-stone-200/80 bg-white/60 backdrop-blur-md py-6 px-4">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600">
        <div className="flex items-center gap-2 font-medium">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="font-semibold text-stone-800">Trang web trợ lý học tập</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-[12px]">
          <div className="flex items-center gap-1.5 text-stone-700">
            <User className="w-3.5 h-3.5 text-stone-500" />
            <span>Thầy: <strong className="font-bold text-stone-900">Võ Minh Nhật</strong></span>
          </div>

          <div className="hidden sm:inline text-stone-300">•</div>

          <a
            href="tel:0944540402"
            className="flex items-center gap-1.5 text-stone-700 hover:text-amber-700 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-stone-500" />
            <span>SĐT: <strong className="font-bold text-stone-900">0944540402</strong></span>
          </a>
        </div>
      </div>
    </footer>
  );
}
