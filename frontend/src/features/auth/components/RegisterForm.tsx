import React, { useState } from "react";
import { UserPlus, Loader2 } from "lucide-react";
import { API_BASE } from "@/shared/api/auth-client";
import { useAuth } from "@/shared/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";

export default function RegisterForm() {
  const [name, setName] = useState("");
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
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "student" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Đăng ký thất bại");
      login(data.token, data.user);
      navigate("/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng ký thất bại");
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
        <label className="block text-xs font-semibold text-stone-700 mb-1.5">Họ và tên học sinh</label>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Nguyễn Văn An"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-stone-700 mb-1.5">Email</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="an.nguyen@example.com"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-stone-700 mb-1.5">Mật khẩu (tối thiểu 6 ký tự)</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          placeholder="••••••••"
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
        <span>Tạo tài khoản học sinh</span>
      </Button>
    </form>
  );
}
