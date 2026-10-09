"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";

export default function QuizRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Điều hướng mượt mà sang giao diện làm bài Quiz trong khu vườn
    router.replace("/garden?openQuiz=true");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4 text-center">
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 mb-4 animate-bounce">
        <Sparkles className="w-8 h-8 text-amber-500" />
      </div>
      <h1 className="text-base font-bold text-stone-900 mb-2">Đang mở Trắc Nghiệm Vi Mô Hướng Dương</h1>
      <p className="text-xs text-stone-500 max-w-sm mb-6">
        Hệ thống đang chuẩn bị phòng luyện tập và tải bộ câu hỏi cá nhân hóa dành cho bạn...
      </p>
      <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-100/70 px-3 py-1.5 rounded-full font-medium">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>Đang kết nối vào phòng thi</span>
      </div>
    </div>
  );
}
