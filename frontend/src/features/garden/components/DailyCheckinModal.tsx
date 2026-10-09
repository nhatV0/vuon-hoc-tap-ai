import React, { useState } from "react";
import { BatteryCharging, HeartHandshake, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { API_BASE } from "@/shared/api/auth-client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";

interface DailyCheckinModalProps {
  studentId: string;
  onSuccess: () => void;
  onClose: () => void;
}

export default function DailyCheckinModal({ studentId, onSuccess, onClose }: DailyCheckinModalProps) {
  const [energyLevel, setEnergyLevel] = useState(70);
  const [mood, setMood] = useState<"happy" | "neutral" | "stressed" | "tired">("happy");
  const [reflection, setReflection] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          completion_rate: 80,
          energy_level: energyLevel,
          mood,
          action_reflection: reflection,
          confidence_stars: 4
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Checkin thất bại");
      setFeedback(data.ai_feedback);
      onSuccess();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-amber-500" />
            <span>Điểm danh cảm xúc & Năng lượng</span>
          </DialogTitle>
        </DialogHeader>

        {feedback ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-stone-900 text-base">Lời nhắn từ Trợ lý Hướng Dương</h3>
            <p className="text-xs text-stone-600 leading-relaxed bg-amber-50/70 p-4 rounded-2xl border border-amber-200/60">
              {feedback}
            </p>
            <Button onClick={onClose} className="w-full">
              Trở về Khu Vườn
            </Button>
          </div>
        ) : (
          <div className="space-y-5 pt-2">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">Mức năng lượng hôm nay</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { level: 100, label: "100%", desc: "Tràn đầy" },
                  { level: 70, label: "70%", desc: "Ổn định" },
                  { level: 40, label: "40%", desc: "Hơi đuối" },
                  { level: 15, label: "15%", desc: "Cạn kiệt" }
                ].map((item) => (
                  <button
                    key={item.level}
                    onClick={() => setEnergyLevel(item.level)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      energyLevel === item.level
                        ? "bg-amber-50 border-amber-500 text-amber-900 ring-1 ring-amber-500"
                        : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                    }`}
                  >
                    <div className="font-bold text-sm">{item.label}</div>
                    <div className="text-[10px] text-stone-400">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">Trạng thái cảm xúc</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "happy", label: "Vui vẻ / Tích cực" },
                  { id: "neutral", label: "Bình thường / Cân bằng" },
                  { id: "stressed", label: "Căng thẳng / Áp lực" },
                  { id: "tired", label: "Mệt mỏi / Cần nghỉ ngơi" }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMood(m.id as any)}
                    className={`p-2.5 text-left rounded-xl border text-xs font-medium transition-colors ${
                      mood === m.id
                        ? "bg-amber-50 border-amber-500 text-amber-900"
                        : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Điều bạn đã làm tốt hôm nay</label>
              <Textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                rows={2}
                placeholder="Hoàn thành 1 bài tập, đọc xong trang lý thuyết..."
              />
            </div>

            <Button onClick={handleSubmit} disabled={loading} className="w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
              <span>Lưu Check-in & Nhận Giọt Nước</span>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
