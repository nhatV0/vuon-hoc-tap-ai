import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Droplets, Calendar, BookOpen, Clock, RefreshCw, Sun, LogOut, User, Trophy } from "lucide-react";
import { API_BASE, authFetch } from "@/shared/api/auth-client";
import { useAuth } from "@/shared/context/AuthContext";
import { Student, GardenStatus } from "@/shared/types";
import SunflowerVisual from "./components/SunflowerVisual";
import FocusTimerModal from "./components/FocusTimerModal";
import DailyMicroQuizModal from "./components/DailyMicroQuizModal";
import DebateTutorModal from "./components/DebateTutorModal";
import AiToolsOverview from "./components/AiToolsOverview";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import AppFooter from "@/shared/components/AppFooter";
import DebateStatsDonutChart from "./components/DebateStatsDonutChart";
import TargetCountdownWidget from "./components/TargetCountdownWidget";
export default function GardenPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [garden, setGarden] = useState<GardenStatus | null>(null);

  const [showTimer, setShowTimer] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showDebate, setShowDebate] = useState(false);

  const studentId = user?.student_id || localStorage.getItem("sunflower_student_id") || "hs_default";

  const fetchData = useCallback(async () => {
    try {
      const [resSt, resGd] = await Promise.all([
        authFetch(`${API_BASE}/api/student/${studentId}`),
        authFetch(`${API_BASE}/api/garden/${studentId}`)
      ]);
      if (resSt.ok) setStudent(await resSt.json());
      if (resGd.ok) setGarden(await resGd.json());
    } catch {}
  }, [studentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


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
              Kế hoạch
            </Link>
            <Link to="/account" className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100/80 rounded-lg transition-colors">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Thành tích</span>
            </Link>
            <Link to="/account" className="p-1.5 text-stone-600 hover:text-stone-900 rounded-lg" title="Tài khoản cá nhân">
              <User className="w-4 h-4" />
            </Link>
            <Button variant="ghost" size="icon" onClick={() => { logout(); navigate("/auth"); }}>
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
            <AiToolsOverview
              onOpenDebate={() => setShowDebate(true)}
              onOpenQuiz={() => setShowQuiz(true)}
            />
          </div>

          <div className="space-y-4">
            <TargetCountdownWidget
              targetDate={student?.target_date}
              goal={student?.long_term_goal}
              subjects={student?.target_subjects}
            />
            <Card className="p-6 border-border shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500 uppercase">Tài nguyên khu vườn</span>
                <button onClick={fetchData} className="text-stone-400 hover:text-stone-600">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-5 bg-gradient-to-br from-indigo-50/80 to-blue-50/50 rounded-2xl border border-indigo-200/80 text-center space-y-1 shadow-xs">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-2">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="text-3xl font-black text-stone-900 tracking-tight">
                  {garden?.consecutive_days || 1}
                </div>
                <div className="text-xs font-semibold text-indigo-900/80 uppercase tracking-wider">
                  Ngày Chuỗi Bền Bỉ
                </div>
                <p className="text-[11px] text-muted-foreground pt-0.5">Tự động điểm danh mỗi ngày bạn đăng nhập</p>
              </div>

              <div className="pt-2">
                <Button variant="outline" onClick={() => setShowTimer(true)} className="w-full">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Đồng hồ tập trung</span>
                </Button>
              </div>

              <DebateStatsDonutChart
                debateStats={student?.debate_stats}
                quizStats={student?.quiz_stats}
              />
            </Card>
          </div>
        </div>
      </main>

      <AppFooter />
      {showTimer && (
        <FocusTimerModal
          studentId={studentId}
          species={student?.selected_flower || "sunflower"}
          onSuccess={() => { fetchData(); setShowTimer(false); }}
          onClose={() => setShowTimer(false)}
        />
      )}
      {showQuiz && <DailyMicroQuizModal studentId={studentId} onTwinSuccess={fetchData} onClose={() => setShowQuiz(false)} />}
      {showDebate && <DebateTutorModal studentId={studentId} subject={student?.target_subject || "Toán học"} onClose={() => setShowDebate(false)} />}
    </div>
  );
}
