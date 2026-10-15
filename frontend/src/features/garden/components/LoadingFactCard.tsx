import React, { useState, useEffect } from "react";
import { Loader2, Sparkles, Lightbulb } from "lucide-react";
import factsDataRaw from "@/shared/data/socratic.facts.json";
import MathText from "@/shared/components/MathText";

const factsData = factsDataRaw as Record<string, string[]>;

interface Props {
  subject: string;
  message?: string;
}

export default function LoadingFactCard({ subject, message = "Đang kết nối AI..." }: Props) {
  const [fact, setFact] = useState<string>("");

  useEffect(() => {
    const list = factsData[subject] || factsData["Toán học"] || [];
    if (list.length > 0) {
      const randomItem = list[Math.floor(Math.random() * list.length)];
      setFact(randomItem);
    }

    // Switch fact every 8 seconds so students have ample time to read
    const timer = setInterval(() => {
      if (list.length > 0) {
        const next = list[Math.floor(Math.random() * list.length)];
        setFact(next);
      }
    }, 8000);
    return () => clearInterval(timer);
  }, [subject]);

  return (
    <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-50/95 via-white to-amber-100/60 border border-amber-300/80 shadow-md space-y-4 animate-in fade-in-50 duration-500">
      <div className="flex items-center justify-between text-sm font-bold text-amber-950 border-b border-amber-200/70 pb-3">
        <div className="flex items-center gap-2.5">
          <Loader2 className="w-5 h-5 text-amber-600 animate-spin shrink-0" />
          <span className="text-sm font-extrabold text-amber-900">{message}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-100/90 px-3 py-1 rounded-full font-bold shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Ghi nhớ nhanh môn {subject}</span>
        </div>
      </div>

      {fact && (
        <div className="flex items-start gap-3.5 text-sm sm:text-base text-stone-800 leading-relaxed bg-white/90 p-4 sm:p-5 rounded-2xl border border-amber-200/60 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div className="flex-1 font-semibold text-stone-900 leading-relaxed">
            <MathText content={fact} />
          </div>
        </div>
      )}
      <p className="text-[11px] text-center text-amber-700/80 italic">
        Hệ thống đang chuẩn bị trọn bộ 10 câu hỏi phản biện để bạn luyện tập mượt mà nhất...
      </p>
    </div>
  );
}
