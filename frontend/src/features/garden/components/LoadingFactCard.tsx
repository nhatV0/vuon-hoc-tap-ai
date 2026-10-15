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

    // Periodically switch fact every 4.5 seconds for pleasant visual dynamic
    const timer = setInterval(() => {
      if (list.length > 0) {
        const next = list[Math.floor(Math.random() * list.length)];
        setFact(next);
      }
    }, 4500);

    return () => clearInterval(timer);
  }, [subject]);

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 via-white to-amber-100/40 border border-amber-200/80 shadow-xs space-y-3 animate-in fade-in-50 duration-300">
      <div className="flex items-center justify-between text-xs font-semibold text-amber-900 border-b border-amber-200/50 pb-2">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-amber-600 animate-spin shrink-0" />
          <span>{message}</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full font-medium">
          <Sparkles className="w-3 h-3 text-amber-600" />
          <span>Ghi nhớ nhanh môn {subject}</span>
        </div>
      </div>

      {fact && (
        <div className="flex items-start gap-2.5 text-xs text-stone-700 leading-relaxed bg-white/80 p-3 rounded-xl border border-amber-200/40">
          <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
            <Lightbulb className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 font-medium">
            <MathText content={fact} />
          </div>
        </div>
      )}
    </div>
  );
}
