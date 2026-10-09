"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Mail, User as UserIcon, CheckCircle2, AlertCircle } from "lucide-react";
import { API_BASE, User } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { DEMO_ACCOUNTS } from "@/lib/demo-data";

export default function AuthPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [role] = useState<"student">("student");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const payload = isRegister
        ? { email, password, name, role }
        : { email, password };

      let data: { token: string; user: User } | null = null;
      try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          data = await res.json();
        } else {
          const errJson = await res.json().catch(() => null);
          throw new Error(errJson?.detail || "Đăng nhập/Đăng ký không thành công");
        }
      } catch {
        // Nếu Backend chưa online trên internet (chế độ độc lập / di động / demo)
        // Kiểm tra danh sách tài khoản mẫu hoặc hỗ trợ tự động tạo phiên đăng nhập
        const normalizedEmail = email.trim().toLowerCase();
        const matchedDemo = DEMO_ACCOUNTS.find(
          (acc) => acc.email.toLowerCase() === normalizedEmail
        );

        if (!isRegister && matchedDemo) {
          data = {
            token: `demo-token-${matchedDemo.role}-${Date.now()}`,
            user: {
              id: matchedDemo.student_id || `demo-user-${matchedDemo.role}`,
              email: matchedDemo.email,
              name: matchedDemo.name,
              role: matchedDemo.role,
              created_at: new Date().toISOString(),
              student_id: matchedDemo.student_id || null,
            },
          };
        } else if (!isRegister) {
          // Cho phép đăng nhập linh hoạt trong chế độ độc lập nếu nhập tài khoản bất kỳ
          data = {
            token: `demo-token-student-${Date.now()}`,
            user: {
              id: "demo-student-01",
              email: email.trim(),
              name: email.split("@")[0] || "Học Sinh Trải Nghiệm",
              role: "student",
              created_at: new Date().toISOString(),
              student_id: "demo-student-01",
            },
          };
        } else {
          // Đăng ký mới trong chế độ độc lập: Khởi tạo hoàn toàn mới ở ĐIỂM XUẤT PHÁT (Ngày 0 - Hạt mầm)
          const newStudentId = `student-${Date.now()}`;
          data = {
            token: `demo-token-student-${Date.now()}`,
            user: {
              id: `user-${Date.now()}`,
              email: email.trim(),
              name: name.trim() || "Học Sinh Mới",
              role: "student",
              created_at: new Date().toISOString(),
              student_id: newStudentId,
            },
          };

          if (typeof window !== "undefined") {
            // 1. Hồ sơ học sinh mới ở điểm bắt đầu
            const initialProfile = {
              id: newStudentId,
              name: name.trim() || "Học Sinh Mới",
              grade: "10",
              target_subject: "Toán học",
              target_subjects: ["Toán học"],
              weakness: "Đại số & Hình học cơ bản",
              long_term_goal: "Đạt 8+ điểm và tự tin học tập mỗi ngày",
              timeframe: "3 tháng",
              learning_style: "Trực quan",
              selected_flower: "sunflower",
              flower_state: "tich_cuc",
              created_at: new Date().toISOString(),
              roadmap: {
                milestones: [
                  {
                    stage: 1,
                    title: "Chặng 1: Gieo Mầm Thói Quen",
                    duration: "Tuần 1 - 2",
                    goal: "Tập trung 15 phút học mỗi ngày và hoàn thành điểm danh",
                    key_actions: ["Làm 3 bài tập vi mô", "Điểm danh hàng ngày", "Nuôi dưỡng mầm xanh"]
                  },
                  {
                    stage: 2,
                    title: "Chặng 2: Nảy Mầm Vững Chắc",
                    duration: "Tuần 3 - 4",
                    goal: "Chinh phục các dạng bài hay nhầm lẫn và tăng sự tự tin",
                    key_actions: ["Ôn lại lý thuyết cốt lõi", "Luyện tập phản xạ", "Tích lũy vé Quiz"]
                  },
                  {
                    stage: 3,
                    title: "Chặng 3: Bứt Phá Thoát Trọng Lực",
                    duration: "3 tháng",
                    goal: "Đạt 8+ điểm và làm chủ hoàn toàn phương pháp tự học",
                    key_actions: ["Luyện đề tổng hợp", "Duy trì chuỗi kỷ luật", "Mở khóa tâm thư ngày 21"]
                  }
                ],
                initial_daily_tasks: [
                  {
                    id: 1,
                    title: "Khởi động: Đọc lại 1 công thức then chốt",
                    duration_minutes: 10,
                    subject: "Toán học",
                    category: "Khởi động",
                    tip: "Đọc chậm và ghi lại ra nháp để nhớ sâu hơn."
                  },
                  {
                    id: 2,
                    title: "Luyện tập: Tự giải 2 bài tập cơ bản",
                    duration_minutes: 15,
                    subject: "Toán học",
                    category: "Thực hành",
                    tip: "Làm cẩn thận từng bước, không cần vội."
                  },
                  {
                    id: 3,
                    title: "Điểm danh 3 phút & Ghi nhận nỗ lực ngày đầu",
                    duration_minutes: 5,
                    subject: "Toán học",
                    category: "Phản chiếu",
                    tip: "Điểm danh để thắp sáng ngọn lửa chuỗi Ngày 1!"
                  }
                ],
                encouraging_message: `Chào mừng ${name.trim() || "bạn"} đến với Khu Vườn Cảm Xúc! Hôm nay là Ngày 0 (Hạt mầm), hãy hoàn thành nhiệm vụ và điểm danh để vươn mầm đầu tiên nhé!`
              }
            };

            // 2. Chậu hoa ở ĐIỂM BẮT ĐẦU: 0 Ngày Streak, 1 giọt nước ban đầu, CHƯA ĐIỂM DANH HÔM NAY
            const initialGarden = {
              student_id: newStudentId,
              student_name: name.trim() || "Học Sinh Mới",
              selected_flower: "sunflower",
              current_state: "tich_cuc",
              consecutive_days: 0, // Điểm xuất phát: 0 ngày
              water_drops: 1, // 1 giọt nước khởi đầu
              last_checkin_date: new Date(Date.now() - 86400000).toISOString(), // Ngày hôm qua để hôm nay sẵn sàng điểm danh
              story_message: `Hạt mầm của ${name.trim() || "bạn"} đang ấp ủ trong đất ấm. Hãy hoàn thành nhiệm vụ và điểm danh để nảy mầm đầu tiên!`,
              can_restore_streak: false,
              has_checked_in_today: false, // CHƯA ĐIỂM DANH HÔM NAY -> Nút điểm danh sẵn sàng
              unlocked_badges_count: 0,
              shields_available: 1,
              grace_passes_available: 0,
              saved_streak_before_break: 0
            };

            // 3. Kho đồ ở ĐIỂM BẮT ĐẦU: 0 chuỗi chinh phục, 1 vé quiz tân thủ
            const initialInventory = {
              freeze_shields_available: 1,
              grace_passes_available: 0,
              restores_claimed_count: 0,
              saved_streak_before_break: 0,
              total_shields_used: 0,
              quiz_tickets: 1, // 1 vé khởi đầu
              holy_water: 0,
              conquest_streak: 0, // Chuỗi chinh phục 0
              holy_water_claimed_count: 0,
              quiz_stage_milestones_claimed: []
            };

            // Lưu profile học sinh và cập nhật danh sách tất cả học sinh đã đăng ký
            localStorage.setItem(`sunflower_student_profile_${newStudentId}`, JSON.stringify(initialProfile));
            localStorage.setItem(`sunflower_garden_${newStudentId}`, JSON.stringify(initialGarden));
            localStorage.setItem(`sunflower_inventory_${newStudentId}`, JSON.stringify(initialInventory));
            localStorage.setItem("sunflower_student_id", newStudentId);
            localStorage.setItem("current_student_id", newStudentId);

            // Lưu vào danh mục học sinh toàn hệ thống để Admin và Giáo viên nhìn thấy ngay
            try {
              const registeredListStr = localStorage.getItem("sunflower_all_registered_students");
              const registeredList = registeredListStr ? JSON.parse(registeredListStr) : [];
              registeredList.unshift({
                student_id: newStudentId,
                student_name: name.trim() || "Học Sinh Mới",
                username: email.trim(),
                grade: "10",
                classroom: "10A1",
                target_subject: "Toán học",
                emotion_scale: 4,
                current_state: "tich_cuc",
                consecutive_days: 0,
                days_since_last_checkin: 0,
                alert_reason: "Học sinh mới đăng ký - Ngày 0 Hạt mầm",
                needs_attention: false,
                initial_password: password.trim() || "123456"
              });
              localStorage.setItem("sunflower_all_registered_students", JSON.stringify(registeredList));
            } catch {}
          }
        }
      }
      if (!data) {
        throw new Error("Không thể khởi tạo phiên đăng nhập.");
      }

      login(data.token, data.user);

      const normalizedRole = String(data.user.role).toLowerCase();
      if (normalizedRole === "teacher" || normalizedRole === "admin") {
        if (typeof window !== "undefined") {
          localStorage.removeItem("sunflower_student_id");
          localStorage.removeItem("current_student_id");
        }
        router.replace("/teacher");
      } else if (!data.user.student_id) {
        router.push("/onboarding");
      } else {
        router.push("/garden");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Đã xảy ra lỗi kết nối");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center items-center px-4 pt-8 pb-48 sm:py-12 select-none overflow-y-auto">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-xs font-medium text-stone-500 hover:text-stone-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Trang Chủ Vườn Hoa
      </Link>

      <div className="w-full max-w-sm bg-white rounded-2xl border border-stone-200/80 p-8 shadow-xs">
        <div className="text-center mb-6">
          <span className="text-3xl inline-block mb-2">🌻</span>
          <h2 className="text-lg font-bold text-stone-900 tracking-tight">
            {isRegister ? "Tạo Tài Khoản Mới" : "Đăng Nhập"}
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            {isRegister ? "Bắt đầu hành trình học tập an vui" : "Chào mừng bạn trở lại với khu vườn"}
          </p>
        </div>

        {isRegister && (
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl mb-5 text-[11px] text-amber-900 leading-relaxed text-center font-medium">
            🌱 Đăng ký tài khoản dành riêng cho <strong>Học Sinh</strong>. Tài khoản Giáo Viên do Quản Trị Viên (Admin) phân bổ theo lớp học.
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Họ và Tên
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Minh Khang"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs text-stone-800"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              {isRegister ? "Email" : "Tài Khoản / Email"}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
              <input
                type={isRegister ? "email" : "text"}
                required
                placeholder={isRegister ? "tenban@email.com" : "Email hoặc tên tài khoản"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs text-stone-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="Tối thiểu 6 ký tự"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs text-stone-800"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                {isRegister ? "Đăng Ký Tài Khoản" : "Đăng Nhập"}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-stone-100 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMsg(null);
            }}
            className="text-xs font-medium text-stone-600 hover:text-amber-700 transition-colors"
          >
            {isRegister
              ? "Đã có tài khoản? Đăng nhập ngay"
              : "Chưa có tài khoản? Đăng ký miễn phí"}
          </button>
        </div>

        {/* Nút đăng nhập nhanh để kiểm tra trực tiếp trên điện thoại */}
        {!isRegister && (
          <div className="mt-6 pt-5 border-t border-stone-100">
            <p className="text-[11px] font-bold text-stone-500 mb-2.5 text-center uppercase tracking-wider">
              ⚡ Đăng Nhập Nhanh Trải Nghiệm
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail("student@khuvuoncamxuc.app");
                  setPassword("123456");
                }}
                className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 text-[11px] font-semibold text-amber-900 transition-colors text-left flex flex-col"
              >
                <span className="flex items-center gap-1 font-bold">🌻 Học Sinh</span>
                <span className="text-[10px] text-amber-700/80">Mai Thảo Vy</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail("admin@sunflower.edu.vn");
                  setPassword("123456");
                }}
                className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/80 text-[11px] font-semibold text-indigo-900 transition-colors text-left flex flex-col"
              >
                <span className="flex items-center gap-1 font-bold">🧑‍🏫 Giáo Viên</span>
                <span className="text-[10px] text-indigo-700/80">Quản Trị / Báo Cáo</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Khoảng đệm an toàn lớn ở đáy để bàn phím ảo di động không che khuất form khi nhập liệu */}
      <div className="w-full h-36 sm:h-12 pointer-events-none" aria-hidden="true" />
    </div>
  );
}
