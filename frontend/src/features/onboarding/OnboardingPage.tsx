import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { API_BASE, authFetch } from "@/shared/api/auth-client";
import StepBasicAcademic from "./components/StepBasicAcademic";
import StepGoalCountdown from "./components/StepGoalCountdown";
import { useAuth } from "@/shared/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/shared/components/ui/progress";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState(user?.name || "");
  const [grade, setGrade] = useState("12");
  const [targetSubjects, setTargetSubjects] = useState<string[]>(["Toán học"]);
  const [goal, setGoal] = useState("Đạt điểm 8.5+ trong kỳ thi sắp tới và nâng cao tư duy giải bài");

  // Default target date: 90 days from today
  const defaultDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 90);
    return d.toISOString().split("T")[0];
  })();
  const [targetDate, setTargetDate] = useState(defaultDate);

  const handleComplete = async () => {
    setLoading(true);
    try {
      const primarySubject = targetSubjects[0] || "Toán học";
      const res = await authFetch(`${API_BASE}/api/onboarding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.id || null,
          name: name.trim() || "Bạn học nhỏ",
          grade,
          target_subject: primarySubject,
          target_subjects: targetSubjects,
          emotion_scale: 4,
          weakness: "Cần rèn luyện phương pháp làm bài và phản xạ đề",
          long_term_goal: goal.trim(),
          target_date: targetDate,
          timeframe: `Mục tiêu đến ${targetDate}`
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Khởi tạo lộ trình thất bại");
      localStorage.setItem("sunflower_student_id", data.id);
      navigate("/garden");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center py-12 px-4 sm:px-6">
      <div className="max-w-xl mx-auto w-full">
        <div className="mb-6">
          <div className="flex justify-between items-center text-xs font-semibold text-stone-500 mb-2">
            <span>Thiết lập hồ sơ học tập cá nhân</span>
            <span>Bước {step}/2</span>
          </div>
          <Progress value={step === 1 ? 50 : 100} className="h-1.5" />
        </div>

        <Card className="border border-border/80 shadow-xs p-3 sm:p-5">
          <CardContent className="p-0">
            {step === 1 && (
              <div className="space-y-4">
                <StepBasicAcademic
                  name={name}
                  setName={setName}
                  grade={grade}
                  setGrade={setGrade}
                  targetSubjects={targetSubjects}
                  setTargetSubjects={setTargetSubjects}
                />
                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full h-9 text-xs"
                >
                  <span>Tiếp tục đến Mục tiêu</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <StepGoalCountdown
                goal={goal}
                setGoal={setGoal}
                targetDate={targetDate}
                setTargetDate={setTargetDate}
                loading={loading}
                onBack={() => setStep(1)}
                onSubmit={handleComplete}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
