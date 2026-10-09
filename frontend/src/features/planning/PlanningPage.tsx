import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Circle, Clock } from "lucide-react";
import { API_BASE } from "@/shared/api/auth-client";
import { useAuth } from "@/shared/context/AuthContext";
import { PlannedTask, Milestone } from "@/shared/types";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";

export default function PlanningPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<PlannedTask[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  const studentId = user?.student_id || localStorage.getItem("sunflower_student_id") || "hs_default";

  useEffect(() => {
    fetch(`${API_BASE}/api/planning/${studentId}`)
      .then((res) => res.json())
      .then((data) => {
        const allTasks: PlannedTask[] = [];
        if (data.tasks_by_day) {
          Object.values(data.tasks_by_day).forEach((list: any) => {
            if (Array.isArray(list)) allTasks.push(...list);
          });
        }
        setTasks(allTasks);
        setMilestones(data.milestones || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [studentId]);

  const toggleTask = async (taskId: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`${API_BASE}/api/planning/task/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_completed: !currentStatus })
      });
      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, is_completed: !currentStatus } : t))
        );
      }
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-12">
      <header className="border-b border-border/60 bg-white/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/garden" className="flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900">
            <ArrowLeft className="w-4 h-4" />
            <span>Khu Vườn</span>
          </Link>
          <span className="font-bold text-sm text-stone-900">Kế Hoạch & Lộ Trình 3 Chặng</span>
          <div className="w-8" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-8 space-y-8">
        <div>
          <h2 className="text-base font-bold text-stone-900 mb-4">Lộ trình 3 Chặng Cá Nhân Hóa</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {milestones.map((m) => (
              <Card key={m.stage} className="p-5 border-border shadow-xs space-y-2">
                <Badge variant="default">
                  Chặng {m.stage} ({m.duration})
                </Badge>
                <h3 className="font-bold text-xs text-foreground pt-1">{m.title}</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{m.goal}</p>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-base font-bold text-stone-900 mb-4">Nhiệm Vụ Vi Mô 5 - 10 Phút Hằng Ngày</h2>
          <div className="space-y-3">
            {tasks.map((task) => (
              <Card
                key={task.id}
                onClick={() => toggleTask(task.id, task.is_completed)}
                className={`p-4 border transition-all cursor-pointer flex items-center justify-between ${
                  task.is_completed
                    ? "bg-muted/40 border-border opacity-60"
                    : "border-border shadow-xs hover:border-primary"
                }`}
              >
                <div className="flex items-center gap-3">
                  {task.is_completed ? (
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-stone-300 shrink-0" />
                  )}
                  <div>
                    <div className={`text-xs font-semibold ${task.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {task.title}
                    </div>
                    {task.tip && <div className="text-[10px] text-muted-foreground mt-0.5">{task.tip}</div>}
                  </div>
                </div>
                <Badge variant="outline" className="flex items-center gap-1 font-normal">
                  <Clock className="w-3 h-3" />
                  <span>{task.duration_minutes}p</span>
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
