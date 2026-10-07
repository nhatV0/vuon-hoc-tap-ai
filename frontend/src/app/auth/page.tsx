"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Mail, User as UserIcon, CheckCircle2, AlertCircle } from "lucide-react";
import { API_BASE } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

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

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Đăng nhập/Đăng ký không thành công");
      }

      login(data.token, data.user);

      if (data.user.role === "teacher" || data.user.role === "admin") {
        router.push("/teacher");
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
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center items-center px-4 py-12 select-none">
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
                placeholder={isRegister ? "tenban@email.com" : "admin hoặc email học sinh"}
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
      </div>
    </div>
  );
}
