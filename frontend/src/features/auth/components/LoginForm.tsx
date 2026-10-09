import React, { useState } from "react";
import { LogIn, Loader2 } from "lucide-react";
import { API_BASE } from "@/shared/api/auth-client";
import { useAuth } from "@/shared/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Đăng nhập thất bại");
      login(data.token, data.user);
      if (data.user.role === "teacher" || data.user.role === "admin") {
        navigate("/teacher");
      } else if (!data.user.student_id) {
        navigate("/onboarding");
      } else {
        localStorage.setItem("sunflower_student_id", data.user.student_id);
        navigate("/garden");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
          {error}
        </div>
      )}
      <div>
        <label className="block text-xs font-semibold text-stone-700 mb-1.5">Email hoặc Tài khoản</label>
        <Input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="admin hoặc email@school.edu.vn"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-stone-700 mb-1.5">Mật khẩu</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <LogIn className="w-4 h-4 mr-2" />}
        <span>Đăng nhập</span>
      </Button>
    </form>
  );
}
