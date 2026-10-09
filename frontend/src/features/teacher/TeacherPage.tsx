import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, Users, BookOpen, AlertTriangle, LogOut, Sun } from "lucide-react";
import { API_BASE } from "@/shared/api/auth-client";
import { useAuth } from "@/shared/context/AuthContext";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";

export default function TeacherPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/teacher/dashboard`)
      .then((res) => res.json())
      .then((data) => {
        setDashboard(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-12">
      <header className="border-b border-border/60 bg-white/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-500" />
            <span className="font-bold text-sm text-stone-900">Cổng Giáo Viên & Quản Trị Học Đường</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-stone-500">{user?.name} ({user?.role})</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                logout();
                navigate("/auth");
              }}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 border-border shadow-xs">
            <Users className="w-5 h-5 text-indigo-500 mb-2" />
            <div className="text-2xl font-extrabold text-foreground">{dashboard?.total_students || 0}</div>
            <div className="text-xs text-muted-foreground">Tổng số học sinh</div>
          </Card>
          <Card className="p-5 border-border shadow-xs">
            <AlertTriangle className="w-5 h-5 text-rose-500 mb-2" />
            <div className="text-2xl font-extrabold text-foreground">{dashboard?.high_risk_count || 0}</div>
            <div className="text-xs text-muted-foreground">Học sinh cần trợ giúp tâm lý</div>
          </Card>
          <Card className="p-5 border-border shadow-xs">
            <BookOpen className="w-5 h-5 text-amber-500 mb-2" />
            <div className="text-2xl font-extrabold text-foreground">GDPT 2018</div>
            <div className="text-xs text-muted-foreground">Chuẩn hóa chương trình 10-11-12</div>
          </Card>
        </div>

        <Card className="p-6 border-border shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <h2 className="text-sm font-bold text-foreground">Danh Sách Học Sinh Có Dấu Hiệu Quá Tải / Vắng Mặt Kéo Dài</h2>
          </div>

          <div className="space-y-3">
            {dashboard?.alerts?.length > 0 ? (
              dashboard.alerts.map((alert: any) => (
                <div key={alert.student_id} className="p-4 rounded-2xl border border-rose-100 bg-rose-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-stone-900">
                      {alert.student_name} – Lớp {alert.classroom} ({alert.grade})
                    </div>
                    <div className="text-[11px] text-rose-700 mt-0.5 font-medium">Lý do: {alert.reason}</div>
                    <div className="text-[11px] text-stone-500 mt-1">Gợi ý: {alert.suggested_action}</div>
                  </div>
                  <Button variant="destructive" size="sm" className="self-start sm:self-center">
                    Gửi Lời Động Viên
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground py-6 text-center">Tất cả học sinh đều đang duy trì nhịp độ ổn định.</p>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
