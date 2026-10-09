import React, { useState } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import StepGradeSubject from "./components/StepGradeSubject";
import StepEmotionScale from "./components/StepEmotionScale";
import StepGoalWeakness from "./components/StepGoalWeakness";
import { API_BASE } from "@/shared/api/auth-client";
import { useAuth } from "@/shared/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/shared/components/ui/progress";
import { Card, CardContent } from "@/shared/components/ui/card";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState(user?.name || "");
  const [grade, setGrade] = useState("12");
  const [targetSubject, setTargetSubject] = useState("Toán học");
  const [emotionScale, setEmotionScale] = useState(4);
  const [weakness, setWeakness] = useState("Khó nhớ công thức và hay bị nhầm dấu khi tính toán");
  const [goal, setGoal] = useState("Đạt 8.5+ điểm trong kỳ thi tốt nghiệp THPT và vào trường đại học mơ ước");

  const handleComplete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/onboarding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.id || null,
          name: name.trim() || "Bạn học nhỏ",
          grade,
          target_subject: targetSubject,
          target_subjects: [targetSubject],
          emotion_scale: emotionScale,
          weakness,
          long_term_goal: goal,
          timeframe: "3 tháng tới"
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
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-bold text-stone-500 mb-2">
            <span>BƯỚC {step} / 3</span>
            <span>{step === 1 ? "Môn học & Khối lớp" : step === 2 ? "Thang đo Cảm xúc" : "Mục tiêu & Trở ngại"}</span>
          </div>
          <Progress value={(step / 3) * 100} />
        </div>

        <Card className="border border-border/80 shadow-sm p-2 sm:p-4">
          <CardContent className="pt-4">
            {step === 1 && (
              <StepGradeSubject
                name={name}
                setName={setName}
                grade={grade}
                setGrade={setGrade}
                targetSubject={targetSubject}
                setTargetSubject={setTargetSubject}
                onNext={() => setStep(2)}
              />
            )}
            {step === 2 && (
              <StepEmotionScale
                emotionScale={emotionScale}
                setEmotionScale={setEmotionScale}
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
              />
            )}
            {step === 3 && (
              <StepGoalWeakness
                weakness={weakness}
                setWeakness={setWeakness}
                goal={goal}
                setGoal={setGoal}
                loading={loading}
                onBack={() => setStep(2)}
                onSubmit={handleComplete}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
