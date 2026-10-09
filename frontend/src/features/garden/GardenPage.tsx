import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Droplets, Calendar, Award, BookOpen, Clock, RefreshCw, Sun, LogOut } from "lucide-react";
import { API_BASE } from "@/shared/api/auth-client";
import { useAuth } from "@/shared/context/AuthContext";
import { Student, GardenStatus } from "@/shared/types";
import SunflowerVisual from "./components/SunflowerVisual";
import DailyCheckinModal from "./components/DailyCheckinModal";
import FocusTimerModal from "./components/FocusTimerModal";
import DailyMicroQuizModal from "./components/DailyMicroQuizModal";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";

export default function GardenPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [garden, setGarden] = useState<GardenStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const [showCheckin, setShowCheckin] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  const studentId = user?.student_id || localStorage.getItem("sunflower_student_id") || "hs_default";

  const fetchData = useCallback(async () => {
    try {
      const [resSt, resGd] = await Promise.all([
        fetch(`${API_BASE}/api/student/${studentId}`),
        fetch(`${API_BASE}/api/garden/${studentId}`)
      ]);
      if (resSt.ok) setStudent(await resSt.json());
      if (resGd.ok) setGarden(await resGd.json());
    } catch {}
    setLoading(false);
  }, [studentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleWater = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/garden/${studentId}/water`, { method: "POST" });
      if (res.ok) {
        fetchData();
      }
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-12">
      <header className="border-b border-border/60 bg-white/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-500" />
            <span className="font-bold text-sm text-stone-900">Khu Vườn Cảm Xúc</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/planning" className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900">
              Kế hoạch học tập
            </Link>
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

      <main className="max-w-5xl mx-auto px-4 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <SunflowerVisual
              state={garden?.current_state || "tich_cuc"}
              consecutiveDays={garden?.consecutive_days || 1}
            />
            {garden?.story_message && (
              <Card className="p-4 border-border text-xs text-stone-600 leading-relaxed shadow-xs">
                {garden.story_message}
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card className="p-6 border-border shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500 uppercase">Tài nguyên khu vườn</span>
                <button onClick={fetchData} className="text-stone-400 hover:text-stone-600">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 text-center">
                  <Droplets className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                  <div className="text-lg font-extrabold text-stone-900">{garden?.water_drops || 1}</div>
                  <div className="text-[10px] text-stone-500">Giọt nước</div>
                </div>
                <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-200/80 text-center">
                  <Calendar className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
                  <div className="text-lg font-extrabold text-stone-900">{garden?.consecutive_days || 1}</div>
                  <div className="text-[10px] text-stone-500">Ngày chuỗi</div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Button onClick={handleWater} className="w-full">
                  <Droplets className="w-4 h-4 fill-current mr-2" />
                  <span>Tưới nước cho cây</span>
                </Button>
                <Button variant="accent" onClick={() => setShowCheckin(true)} className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Điểm danh cảm xúc</span>
                </Button>
                <Button variant="outline" onClick={() => setShowTimer(true)} className="w-full">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Đồng hồ tập trung</span>
                </Button>
                <Button variant="outline" onClick={() => setShowQuiz(true)} className="w-full">
                  <BookOpen className="w-4 h-4 mr-2" />
                  <span>Làm 3 câu trắc nghiệm</span>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {showCheckin && (
        <DailyCheckinModal
          studentId={studentId}
          onSuccess={fetchData}
          onClose={() => setShowCheckin(false)}
        />
      )}
      {showTimer && (
        <FocusTimerModal
          studentId={studentId}
          onSuccess={() => {
            fetchData();
            setShowTimer(false);
          }}
          onClose={() => setShowTimer(false)}
        />
      )}
      {showQuiz && (
        <DailyMicroQuizModal
          studentId={studentId}
          onClose={() => setShowQuiz(false)}
        />
      )}
    </div>
  );
}
