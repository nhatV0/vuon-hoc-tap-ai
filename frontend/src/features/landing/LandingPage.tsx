import React from "react";
import { Link } from "react-router-dom";
import { Sun } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import LandingHeroSection from "./components/LandingHeroSection";
import LandingFeaturesGrid from "./components/LandingFeaturesGrid";

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-800 relative overflow-hidden selection:bg-amber-100 selection:text-amber-900">
      {/* Ambient background glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute top-1/4 -right-40 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: "3s" }} />
      <div className="absolute -bottom-40 left-1/3 w-[32rem] h-[32rem] bg-indigo-200/25 rounded-full blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

      {/* Floating decorative badges */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/80 backdrop-blur-md border border-amber-200/80 shadow-md text-amber-900 text-xs font-semibold absolute top-36 left-12 animate-float-slow pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        <span>Học tập vi mô 5-10p</span>
      </div>

      <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/80 backdrop-blur-md border border-indigo-200/80 shadow-md text-indigo-900 text-xs font-semibold absolute top-48 right-12 animate-float-slow-reverse pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        <span>Gia Sư Socratic & Visual Scratchpad</span>
      </div>

      <header className="border-b border-stone-200/60 bg-white/75 backdrop-blur-md sticky top-0 z-40 transition-all">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-9 h-9 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-xs group-hover:scale-105 transition-transform duration-300">
              <Sun className="w-5 h-5 group-hover:rotate-45 transition-transform duration-500" />
            </div>
            <div>
              <span className="font-bold text-sm text-stone-900 block group-hover:text-amber-700 transition-colors">
                Trợ Lý Hoa Hướng Dương
              </span>
              <span className="text-[10px] text-stone-400 font-medium">Khu Vườn Cảm Xúc & Học Tập Cá Nhân</span>
            </div>
          </div>
          <nav className="flex items-center gap-3">
            {user ? (
              <Link
                to={user.role === "teacher" || user.role === "admin" ? "/teacher" : "/garden"}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-md transition-all active:scale-95"
              >
                Vào Khu Vườn
              </Link>
            ) : (
              <>
                <Link to="/auth" className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 font-medium transition-colors">
                  Đăng nhập
                </Link>
                <Link
                  to="/auth"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-md transition-all active:scale-95"
                >
                  Bắt đầu ngay
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center relative z-10">
        <LandingHeroSection />
        <LandingFeaturesGrid />
      </main>
    </div>
  );
}
