import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sun, LogOut, ArrowLeft } from "lucide-react";
import { API_BASE, authFetch } from "@/shared/api/auth-client";
import { useAuth } from "@/shared/context/AuthContext";
import { Student } from "@/shared/types";
import { Button } from "@/shared/components/ui/button";
import StudentProfileHeader from "./components/StudentProfileHeader";
import GrowthStatsOverview from "./components/GrowthStatsOverview";
import LeaderboardHallOfFame, { LeaderboardStudent } from "./components/LeaderboardHallOfFame";
import { FALLBACK_LEADERBOARD_STUDENTS } from "@/shared/data/fallback-leaderboard";
import AppFooter from "@/shared/components/AppFooter";

export default function AccountPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const studentId = user?.student_id || localStorage.getItem("sunflower_student_id") || "hs_default";

  const [student, setStudent] = useState<Student | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardStudent[]>(FALLBACK_LEADERBOARD_STUDENTS);
  const [gardenStreak, setGardenStreak] = useState(1);
  const [inventory, setInventory] = useState({
    water_drops: 1,
    holy_water: 0,
    freeze_shields_available: 1
  });

  const fetchData = useCallback(async () => {
    try {
      const [resSt, resLd, resGd, resInv] = await Promise.all([
        authFetch(`${API_BASE}/api/student/${studentId}`),
        authFetch(`${API_BASE}/api/student/leaderboard/top`),
        authFetch(`${API_BASE}/api/garden/${studentId}`),
        authFetch(`${API_BASE}/api/inventory/${studentId}`)
      ]);

      if (resSt.ok) setStudent(await resSt.json());
      if (resLd.ok) {
        const ldData = await resLd.json();
        if (Array.isArray(ldData) && ldData.length > 0) {
          setLeaderboard(ldData);
        }
      }
      if (resGd.ok) {
        const gd = await resGd.json();
        setGardenStreak(gd.consecutive_days || 1);
        if (gd.water_drops !== undefined) {
          setInventory((prev) => ({ ...prev, water_drops: gd.water_drops }));
        }
      }
      if (resInv.ok) {
        const inv = await resInv.json();
        setInventory((prev) => ({
          ...prev,
          holy_water: inv.holy_water || 0,
          freeze_shields_available: inv.freeze_shields_available || 1
        }));
      }
    } catch {}
  }, [studentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-16">
      <header className="border-b border-border/60 bg-white/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/garden">
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-stone-600">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Về Khu vườn</span>
              </Button>
            </Link>
            <div className="flex items-center gap-1.5 border-l border-border pl-3">
              <Sun className="w-4 h-4 text-amber-500" />
              <span className="font-bold text-xs text-stone-900">Tài Khoản & Thành Tích</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/planning" className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900">
              Kế hoạch
            </Link>
            <Button variant="ghost" size="icon" onClick={() => { logout(); navigate("/auth"); }}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
        <StudentProfileHeader student={student} email={user?.email} userName={user?.name} />

        <GrowthStatsOverview
          streak={gardenStreak}
          freezeShields={inventory.freeze_shields_available}
          totalCheckins={gardenStreak}
        />

        <div className="w-full">
          <LeaderboardHallOfFame students={leaderboard} currentStudentId={studentId} />
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
