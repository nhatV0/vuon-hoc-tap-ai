import React, { useState, useEffect } from "react";
import { Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { API_BASE } from "@/shared/api/auth-client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";

interface FocusTimerModalProps {
  studentId: string;
  onSuccess: (drops: number) => void;
  onClose: () => void;
}

export default function FocusTimerModal({ studentId, onSuccess, onClose }: FocusTimerModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && secondsLeft > 0) {
      timer = setInterval(() => setSecondsLeft((prev) => prev - 1), 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      handleFinish();
    }
    return () => clearInterval(timer);
  }, [isRunning, secondsLeft]);

  const handleFinish = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/garden/${studentId}/pomodoro-reward`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration_minutes: 25 })
      });
      const data = await res.json();
      if (res.ok) {
        onSuccess(data.earned_drops || 2);
      }
    } catch {}
  };

  const formatTime = (total: number) => {
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader>
          <DialogTitle className="text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Đồng hồ Tập trung Pomodoro
          </DialogTitle>
        </DialogHeader>

        <div className="my-6">
          <div className="text-5xl font-mono font-extrabold text-stone-900 tracking-tight">
            {formatTime(secondsLeft)}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Duy trì 25 phút tập trung để thưởng 2 giọt nước</p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button
            onClick={() => setIsRunning(!isRunning)}
            className="flex-1"
          >
            <Play className="w-4 h-4 fill-current mr-2" />
            <span>{isRunning ? "Tạm dừng" : "Bắt đầu"}</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setIsRunning(false);
              setSecondsLeft(25 * 60);
            }}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
