import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, Sun, HeartHandshake, ShieldCheck, UserCheck } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-800">
      <header className="border-b border-stone-200/60 bg-white/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-stone-900 block">Trợ Lý Hoa Hướng Dương</span>
              <span className="text-[10px] text-stone-400 font-medium">Khu Vườn Cảm Xúc & Học Tập Cá Nhân</span>
            </div>
          </div>
          <nav className="flex items-center gap-3">
            {user ? (
              <Link
                to={user.role === "teacher" || user.role === "admin" ? "/teacher" : "/garden"}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Vào Khu Vườn
              </Link>
            ) : (
              <>
                <Link to="/auth" className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 font-medium">
                  Đăng nhập
                </Link>
                <Link
                  to="/auth"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Bắt đầu ngay
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100/80 text-amber-800 text-xs font-semibold mb-6">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Đồng hành cùng học sinh THPT & Giáo viên theo GDPT 2018</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight mb-6">
          Học tập nhẹ nhàng, nuôi dưỡng cảm xúc cùng Trợ lý Hướng Dương
        </h1>
        <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Giải pháp vi mô 5-10 phút giúp tháo gỡ rào cản nhận thức, duy trì chuỗi học tập thấu cảm và chăm sóc sức khỏe tinh thần học đường.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/onboarding"
            className="w-full sm:w-auto px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span>Khảo sát Lộ trình 3 Chặng</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/auth"
            className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 rounded-2xl font-bold text-sm shadow-xs transition-all"
          >
            Cổng Giáo Viên & Quản Trị
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20 text-left">
          <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 mb-4">
              <Sun className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-900 mb-2">Lộ trình Vi Mô 5-10p</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Thiết kế theo thang đo cảm xúc 7 cấp độ và rào cản nhận thức môn học, không tạo áp lực điểm số.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-900 mb-2">Check-in Thấu Cảm</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Lắng nghe năng lượng, khó khăn hằng ngày. AI phản hồi ấm áp, nâng đỡ tinh thần và ghi nhận nỗ lực.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-900 mb-2">Khu Vườn Bền Bỉ</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Cây hoa tiến hóa theo chuỗi streak, nhận khiên bảo vệ, bình nước thánh và mở khóa câu hỏi Boss.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
