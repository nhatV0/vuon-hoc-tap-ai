import React from "react";
import { BookOpen, Check } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";

interface Props {
  subjects: string[];
  selectedSubject: string;
  onSelectSubject: (subject: string) => void;
  isLoading?: boolean;
}

export default function DailyQuizSubjectSelector({
  subjects,
  selectedSubject,
  onSelectSubject,
  isLoading
}: Props) {
  return (
    <div className="space-y-2 mb-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-amber-600" />
          <span>Môn học mục tiêu hôm nay:</span>
        </label>
        <span className="text-[11px] text-stone-500 font-medium">11 môn GDPT 2018</span>
      </div>
      <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 bg-stone-50/80 rounded-xl border border-stone-200/80">
        {subjects.map((sub) => {
          const isSelected = sub === selectedSubject;
          return (
            <button
              key={sub}
              type="button"
              disabled={isLoading}
              onClick={() => onSelectSubject(sub)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                isSelected
                  ? "bg-amber-500 text-white shadow-xs font-semibold"
                  : "bg-white text-stone-600 border border-stone-200/90 hover:border-amber-300 hover:bg-amber-50/50"
              }`}
            >
              {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
              <span>{sub}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
