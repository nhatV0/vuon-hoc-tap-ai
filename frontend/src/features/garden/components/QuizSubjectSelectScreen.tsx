import React from "react";
import { BookOpen, Check, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface Props {
  subjects: string[];
  selectedSubject: string;
  onSelectSubject: (sub: string) => void;
  onStartQuiz: () => void;
  loading: boolean;
}

export default function QuizSubjectSelectScreen({
  subjects,
  selectedSubject,
  onSelectSubject,
  onStartQuiz,
  loading
}: Props) {
  return (
    <div className="space-y-5 py-2 animate-in fade-in duration-200">
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-amber-100/80 text-amber-600 mb-1">
          <BookOpen className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-bold text-stone-900">
          Chọn Môn Học Luyện Tập
        </h3>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          Chọn môn học bạn muốn rèn luyện phản xạ hôm nay. Các câu hỏi sẽ được khóa chặt đúng theo môn học này.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-1 max-h-56 overflow-y-auto">
        {subjects.map((sub) => {
          const isSelected = sub === selectedSubject;
          return (
            <button
              key={sub}
              type="button"
              onClick={() => onSelectSubject(sub)}
              className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between ${
                isSelected
                  ? "bg-amber-500 text-white border-amber-600 shadow-xs ring-2 ring-amber-400/40"
                  : "bg-white text-stone-700 border-stone-200/90 hover:border-amber-300 hover:bg-stone-50"
              }`}
            >
              <span>{sub}</span>
              {isSelected && (
                <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="pt-3 border-t border-stone-100 flex justify-end">
        <Button
          type="button"
          disabled={!selectedSubject || loading}
          onClick={onStartQuiz}
          className="gap-2 text-xs h-10 px-6 rounded-xl font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
        >
          <span>Bắt đầu làm bài ({selectedSubject || "Chưa chọn"})</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
