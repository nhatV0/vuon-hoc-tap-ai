import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingHeroSection() {
  return (
    <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/90 text-amber-900 text-xs font-semibold shadow-xs border border-amber-200/60 hover:bg-amber-200/80 transition-colors cursor-default">
        <Sparkles className="w-4 h-4 text-amber-600 animate-spin" style={{ animationDuration: "12s" }} />
        <span>Đồng hành cùng học sinh THPT & Giáo viên theo GDPT 2018</span>
      </div>

      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-stone-900 tracking-tight leading-tight">
        Học tập nhẹ nhàng, nuôi dưỡng cảm xúc cùng{" "}
        <span className="bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
          Trợ lý Hướng Dương
        </span>
      </h1>

      <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed font-normal">
        Giải pháp vi mô 5-10 phút giúp tháo gỡ rào cản nhận thức, duy trì chuỗi học tập thấu cảm và chăm sóc sức khỏe tinh thần học đường.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <Link
          to="/onboarding"
          className="w-full sm:w-auto px-7 py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 group"
        >
          <span>Khảo sát Lộ trình 3 Chặng</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
        <Link
          to="/auth"
          className="w-full sm:w-auto px-7 py-3.5 bg-white/90 hover:bg-white border border-stone-200 hover:border-amber-300 text-stone-700 rounded-2xl font-bold text-sm shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
        >
          Cổng Giáo Viên & Quản Trị
        </Link>
      </div>
    </div>
  );
}
