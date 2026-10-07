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
    if (savedToken) {
      setToken(savedToken);
      fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Invalid session");
        })
        .then((userData) => {
          setUser(userData);
          if (userData.student_id) {
            localStorage.setItem("sunflower_student_id", userData.student_id);
          }
        })
        .catch(() => {
          localStorage.removeItem("sunflower_auth_token");
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
    if (newUser.student_id) {
      localStorage.setItem("sunflower_student_id", newUser.student_id);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("sunflower_auth_token");
      localStorage.removeItem("sunflower_student_id");
      localStorage.removeItem("current_student_id");
      sessionStorage.clear();
      // Chuyển hướng người dùng về trang đăng nhập
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
