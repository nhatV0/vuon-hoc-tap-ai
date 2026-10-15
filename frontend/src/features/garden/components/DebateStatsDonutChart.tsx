import React, { useState } from "react";
import { MessageSquareText, BookOpen, CheckCircle2, CheckCircle, HelpCircle } from "lucide-react";

interface StatItem {
  total: number;
  exact_correct: number;
  partial_correct: number;
  incorrect: number;
}

interface Props {
  debateStats?: StatItem;
  quizStats?: StatItem;
}

export default function DebateStatsDonutChart({ debateStats, quizStats }: Props) {
  const [mode, setMode] = useState<"debate" | "quiz">("debate");

  const stats = mode === "debate" ? debateStats : quizStats;
  const total = stats?.total || 0, exact = stats?.exact_correct || 0;
  const partial = stats?.partial_correct || 0, incorrect = stats?.incorrect || 0;
  const effectiveCorrect = exact + partial;

  const rate = total > 0 ? Math.round((effectiveCorrect / total) * 100) : 0;

  // SVG Donut calculation
  const size = 110;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Slices: exact, partial, incorrect
  const exactStroke = total > 0 ? (exact / total) * circumference : 0;
  const partialStroke = total > 0 ? (partial / total) * circumference : 0;
  const incorrectStroke = total > 0 ? (incorrect / total) * circumference : 0;
  const exactOffset = 0, partialOffset = -exactStroke, incorrectOffset = -(exactStroke + partialStroke);
  return (
    <div className="pt-4 border-t border-border/70 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
          {mode === "debate" ? (
            <MessageSquareText className="w-3.5 h-3.5 text-amber-500" />
          ) : (
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
          )}
          <span>Thống kê luyện tập</span>
        </span>

        {/* Toggle Switch Button */}
        <div className="flex items-center p-0.5 rounded-lg bg-stone-100 border border-stone-200/80 text-[10px]">
          <button
            type="button"
            onClick={() => setMode("debate")}
            className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
              mode === "debate"
                ? "bg-white text-amber-700 shadow-xs"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            Tự luận
          </button>
          <button
            type="button"
            onClick={() => setMode("quiz")}
            className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
              mode === "quiz"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            Trắc nghiệm
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 py-1">
        {/* SVG Donut Chart */}
        <div className="relative w-[110px] h-[110px] flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
            {/* Background ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              className="text-stone-100"
              strokeWidth={strokeWidth}
              stroke="currentColor"
              fill="transparent"
            />

            {total === 0 ? (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                className="text-stone-200"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                stroke="currentColor"
                fill="transparent"
              />
            ) : (
              <>
                {/* Incorrect slice */}
                {incorrect > 0 && (
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    className="text-stone-300"
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${incorrectStroke} ${circumference}`}
                    strokeDashoffset={incorrectOffset}
                    stroke="currentColor"
                    fill="transparent"
                  />
                )}
                {/* Partial slice */}
                {partial > 0 && (
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    className="text-amber-400"
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${partialStroke} ${circumference}`}
                    strokeDashoffset={partialOffset}
                    stroke="currentColor"
                    fill="transparent"
                  />
                )}
                {/* Exact slice */}
                {exact > 0 && (
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    className="text-emerald-500"
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${exactStroke} ${circumference}`}
                    strokeDashoffset={exactOffset}
                    stroke="currentColor"
                    fill="transparent"
                  />
                )}
              </>
            )}
          </svg>

          {/* Center Rate Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-black text-stone-900 tracking-tight leading-none">
              {rate}%
            </span>
            <span className="text-[9px] font-bold text-stone-500 uppercase mt-0.5">
              Tỉ lệ đạt
            </span>
          </div>
        </div>

        {/* Legend / Metrics */}
        <div className="space-y-1.5 flex-1 min-w-0 text-xs">
          <div className="flex items-center justify-between text-stone-800">
            <span className="text-stone-500 text-[11px]">Tổng số câu:</span>
            <strong className="font-extrabold text-stone-900">{total} câu</strong>
          </div>

          <div className="flex items-center justify-between text-emerald-700">
            <span className="flex items-center gap-1 text-[11px]">
              <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
              <span>Chính xác:</span>
            </span>
            <strong className="font-bold">{exact}</strong>
          </div>

          {mode === "debate" && (
            <div className="flex items-center justify-between text-amber-700">
              <span className="flex items-center gap-1 text-[11px]">
                <CheckCircle className="w-3 h-3 text-amber-500 shrink-0" />
                <span>Đúng 1 phần:</span>
              </span>
              <strong className="font-bold">{partial}</strong>
            </div>
          )}
          {incorrect > 0 && (
            <div className="flex items-center justify-between text-stone-500">
              <span className="flex items-center gap-1 text-[11px]">
                <HelpCircle className="w-3 h-3 text-stone-400 shrink-0" />
                <span>Cần cố gắng:</span>
              </span>
              <strong className="font-semibold text-stone-600">{incorrect}</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
