"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, API_BASE } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("sunflower_auth_token");
    const savedUserStr = localStorage.getItem("sunflower_user_data");
    if (savedToken) {
      setToken(savedToken);
      if (savedUserStr) {
        try {
          const cachedUser = JSON.parse(savedUserStr);
          setUser(cachedUser);
        } catch {
          // ignore json parse error
        }
      }
      fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Invalid session");
        })
        .then((userData) => {
          setUser(userData);
          localStorage.setItem("sunflower_user_data", JSON.stringify(userData));
          if (userData.student_id) {
            localStorage.setItem("sunflower_student_id", userData.student_id);
          }
        })
        .catch(() => {
          // Nếu token là demo-token hoặc server offline, giữ phiên đăng nhập từ localStorage
          if (savedToken.startsWith("demo-token-") && savedUserStr) {
            try {
              setUser(JSON.parse(savedUserStr));
              return;
            } catch {}
          }
          localStorage.removeItem("sunflower_auth_token");
          localStorage.removeItem("sunflower_user_data");
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);
  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("sunflower_auth_token", newToken);
    localStorage.setItem("sunflower_user_data", JSON.stringify(newUser));
    if (newUser.student_id) {
      localStorage.setItem("sunflower_student_id", newUser.student_id);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("sunflower_auth_token");
      localStorage.removeItem("sunflower_user_data");
      localStorage.removeItem("sunflower_student_id");
      localStorage.removeItem("current_student_id");
      sessionStorage.clear();
      window.location.href = "/auth";
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
