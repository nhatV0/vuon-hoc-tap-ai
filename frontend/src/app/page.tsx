"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Heart,
  CalendarCheck,
  ShieldCheck,
  UserCheck,
  Smile,
  CheckCircle2,
  Clock,
  Compass,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

// Custom hook for gentle scroll reveal
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

export default function LandingHomePage() {
  const { user } = useAuth();

  // Scroll reveal references for each section
  const heroReveal = useScrollReveal();
  const featuresReveal = useScrollReveal();
  const howItWorksReveal = useScrollReveal();
  const audienceReveal = useScrollReveal();
  const ctaReveal = useScrollReveal();

  return (
    <div className="min-h-[100dvh] bg-[#FAF8F5] text-stone-800 selection:bg-amber-100 selection:text-amber-900 overflow-x-hidden">
      {/* 1. Header Navigation */}
      <header className="border-b border-stone-200/60 bg-white/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl select-none">🌻</span>
            <div className="leading-tight">
              <span className="font-bold text-sm text-stone-900 tracking-tight block">
                Trợ Lý Hoa Hướng Dương
              </span>
              <span className="text-[10px] text-stone-400 font-medium">
                Khu Vườn Cảm Xúc & Học Tập Cá Nhân
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-3">
            {user ? (
              <Link
                href="/garden"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition-all shadow-xs flex items-center gap-1.5"
              >
                <span>Chào, {user.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth"
                  className="px-3.5 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium transition-colors"
                >
                  Đăng Nhập
                </Link>
                <Link
                  href="/onboarding"
                  className="px-4 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-xs"
                >
                  <span>Bắt Đầu</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* 2. Hero Section: Asymmetric Visual + Atmospheric Ambient Glow */}
      <section
        ref={heroReveal.ref}
        className={`max-w-6xl mx-auto px-4 pt-16 md:pt-24 pb-20 transition-all duration-1000 transform ${
          heroReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-[11px] font-semibold text-amber-900">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Trợ lý học đường cá nhân hóa & Thấu cảm tinh thần
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 tracking-tight leading-[1.15]">
              Học tập không áp lực cùng{" "}
              <span className="text-amber-600 underline decoration-amber-300 decoration-wavy decoration-2">
                khu vườn hoa cảm xúc
              </span>
            </h1>

            <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-xl">
              Nền tảng giáo dục đồng hành cùng học sinh phổ thông: chia nhỏ mục tiêu thành từng
              nhiệm vụ vi mô 5–10 phút, lắng nghe cảm xúc hằng ngày và nuôi dưỡng cây hoa học tập
              rực rỡ mà không phán xét.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/onboarding"
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 group"
              >
                <span>Chẩn Đoán & Nhận Lộ Trình</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/auth"
                className="px-5 py-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors"
              >
                Đăng Nhập Tài Khoản
              </Link>
            </div>

            <div className="pt-4 flex items-center gap-6 text-stone-500 text-xs">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Hoàn toàn miễn phí</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Bảo mật tâm lý học sinh</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>5 phút mỗi tối</span>
              </div>
            </div>
          </div>

          {/* Right Hero Graphic: Live Preview Card of the Sunflower Garden */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md bg-white rounded-3xl border border-stone-200/90 p-6 shadow-sm overflow-hidden group">
              <div className="absolute top-0 right-0 w-44 h-44 bg-amber-100/50 rounded-full blur-2xl pointer-events-none" />

              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                  Mô phỏng chậu cây học tập
                </span>
                <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  ✨ Nở hoa chăm học
                </span>
              </div>

              {/* Chậu hoa hướng dương thật bên khung cửa sổ chữa lành */}
              <div className="py-4 flex flex-col items-center justify-center">
                <div className="relative w-full max-w-[260px] aspect-[4/5] rounded-2xl overflow-hidden shadow-md border border-stone-100 group-hover:scale-[1.02] transition-transform duration-500">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent z-10 pointer-events-none" />
                  <img
                    src="/assets/Hoa%20h%C6%B0%E1%BB%9Bng%20d%C6%B0%C6%A1ng.png"
                    alt="Chậu hoa hướng dương bên cửa sổ"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="text-center mt-3.5 space-y-1">
                  <p className="text-xs font-bold text-stone-800">Chăm sóc chậu hoa mỗi ngày</p>
                  <p className="text-[11px] text-stone-500 italic max-w-xs">
                    &ldquo;Khu vườn nở rộ mỗi khi bạn dành 5 phút chăm sóc tương lai.&rdquo;
                  </p>
                </div>
              </div>

              <div className="border-t border-stone-100 pt-3 flex justify-between items-center text-xs">
                <span className="text-stone-400">Tích lũy: 7 giọt nước</span>
                <Link
                  href="/onboarding"
                  className="font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                >
                  Bắt đầu trồng cây
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Capabilities Bento Grid: Tinh gọn, trực quan, không rườm rà */}
      <section
        ref={featuresReveal.ref}
        className={`max-w-6xl mx-auto px-4 py-16 border-t border-stone-200/60 transition-all duration-1000 transform ${
          featuresReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
            Công Dụng & Giải Pháp
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Nuôi dưỡng động lực học tập mỗi ngày
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            Kết hợp khoa học hành vi sư phạm vi mô (Micro-learning) và hỗ trợ tâm lý học đường.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Khảo sát nhận thức */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-3 shadow-xs hover:border-amber-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-stone-900">
              Chẩn Đoán Nhận Thức Phân Nhánh
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Không cần gõ nhiều chữ, hệ thống đo lường chính xác rào cản nhận thức (đọc đề, công
              thức hay áp lực thời gian) theo từng môn học Toán, Hóa, Văn để sinh lộ trình vừa vặn.
            </p>
          </div>

          {/* Card 2: Điểm danh cảm xúc */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-3 shadow-xs hover:border-amber-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Smile className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-stone-900">
              Điểm Danh Cảm Xúc & AI Thấu Cảm
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              3 câu hỏi trắc nghiệm nhanh 5 phút mỗi tối. Trợ lý Hoa Hướng Dương đưa ra lời nhắn
              ấm áp, không trách phạt khi lỡ dở, động viên bắt đầu lại từ một việc nhỏ.
            </p>
          </div>

          {/* Card 3: Gamification Garden */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-3 shadow-xs hover:border-amber-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-stone-900">
              Khu Vườn Hoa & Giọt Nước Chữa Lành
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Chậu cây phản ánh chuỗi ngày học tập: nở rộ khi chăm học, rủ nhẹ nhắc nhở khi vắng
              mặt, và hồi sinh mầm xanh mới khi quay lại. Tưới nước xả stress mỗi ngày.
            </p>
          </div>
        </div>
      </section>

      {/* 4. How It Works: 3 Steps Horizontal Workflow */}
      <section
        ref={howItWorksReveal.ref}
        className={`max-w-6xl mx-auto px-4 py-16 border-t border-stone-200/60 transition-all duration-1000 transform ${
          howItWorksReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
            Cách Thức Hoạt Động
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Chỉ 3 bước đơn giản mỗi ngày
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative p-6 bg-white rounded-2xl border border-stone-200 space-y-2.5 shadow-xs">
            <span className="text-2xl font-black text-amber-500/20 absolute right-4 top-4 font-mono">
              01
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-800 font-bold text-xs flex items-center justify-center">
              1
            </div>
            <h4 className="text-xs font-bold text-stone-900">Chẩn đoán 2 phút</h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              Chọn môn học và bấm chọn rào cản bạn gặp phải để nhận lộ trình 3 chặng mốc rõ ràng.
            </p>
          </div>

          <div className="relative p-6 bg-white rounded-2xl border border-stone-200 space-y-2.5 shadow-xs">
            <span className="text-2xl font-black text-amber-500/20 absolute right-4 top-4 font-mono">
              02
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-800 font-bold text-xs flex items-center justify-center">
              2
            </div>
            <h4 className="text-xs font-bold text-stone-900">Thực hiện nhiệm vụ vi mô</h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              Giải quyết 1–2 nhiệm vụ nhỏ 5–15 phút trong Kế hoạch 7 ngày với đồng hồ tập trung Pomodoro.
            </p>
          </div>

          <div className="relative p-6 bg-white rounded-2xl border border-stone-200 space-y-2.5 shadow-xs">
            <span className="text-2xl font-black text-amber-500/20 absolute right-4 top-4 font-mono">
              03
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-800 font-bold text-xs flex items-center justify-center">
              3
            </div>
            <h4 className="text-xs font-bold text-stone-900">Điểm danh & tưới nước</h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              Đánh giá tâm trạng tối nay, nhận lời khuyên nâng đỡ từ Trợ lý và tưới nước cho hoa nở.
            </p>
          </div>
        </div>
      </section>

      {/* 5. For Students and Teachers: Split Audience Value */}
      <section
        ref={audienceReveal.ref}
        className={`max-w-6xl mx-auto px-4 py-16 border-t border-stone-200/60 transition-all duration-1000 transform ${
          audienceReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Học sinh */}
          <div className="bg-gradient-to-br from-white to-amber-50/40 p-8 rounded-3xl border border-stone-200 space-y-4 shadow-xs">
            <div className="inline-flex p-2 rounded-xl bg-amber-100 text-amber-800">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">Dành Cho Học Sinh THPT</h3>
            <ul className="space-y-2 text-xs text-stone-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Không còn cảm giác hoang mang trước khối lượng bài vở khổng lồ.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Có một người bạn AI lắng nghe và khích lệ mọi lúc, không sợ bị la mắng.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Biến việc học thành trò chơi chăm sóc chậu cây nhỏ xinh xắn.</span>
              </li>
            </ul>
            <div className="pt-2">
              <Link
                href="/onboarding"
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
              >
                Tạo chậu hoa của bạn ngay
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Giáo viên */}
          <div className="bg-gradient-to-br from-white to-emerald-50/40 p-8 rounded-3xl border border-stone-200 space-y-4 shadow-xs">
            <div className="inline-flex p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">Dành Cho Thầy Cô & Nhà Trường</h3>
            <ul className="space-y-2 text-xs text-stone-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Bảng theo dõi tổng quan sức khỏe tinh thần và nhịp độ học tập của cả lớp.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Phát hiện sớm học sinh có nguy cơ stress, quá tải hoặc vắng mặt kéo dài.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Nhận gợi ý tâm lý học đường tinh tế để thầy cô kịp thời trò chuyện hỗ trợ.</span>
              </li>
            </ul>
            <div className="pt-2">
              <Link
                href="/auth"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                Đăng nhập dành cho Giáo viên (TK: admin)
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Call To Action Footer Banner */}
      <section
        ref={ctaReveal.ref}
        className={`max-w-4xl mx-auto px-4 py-16 text-center space-y-6 transition-all duration-1000 transform ${
          ctaReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="p-8 sm:p-12 rounded-3xl bg-stone-900 text-white space-y-4 shadow-md">
          <span className="text-3xl block">🌻</span>
          <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            Sẵn sàng tưới mát cho hành trình học tập hôm nay?
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 max-w-lg mx-auto leading-relaxed">
            Chỉ cần một bước nhỏ 5 phút để gieo xuống hạt mầm bình an và tự tin vươn mình đón ánh mặt trời.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/onboarding"
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors shadow-xs"
            >
              Bắt Đầu Khảo Sát Miễn Phí
            </Link>
            <Link
              href="/auth"
              className="px-5 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs transition-colors"
            >
              Đăng Nhập Tài Khoản
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Minimalist Footer */}
      <footer className="border-t border-stone-200/60 py-8 text-center text-xs text-stone-400">
        <p>🌻 Trợ Lý Hoa Hướng Dương & Khu Vườn Cảm Xúc • Dự Án Nhà Giáo Sáng Tạo AI</p>
      </footer>
    </div>
  );
}
