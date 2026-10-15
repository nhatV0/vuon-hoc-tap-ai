import { useState, useRef, useCallback, useEffect } from "react";
import { API_BASE, authFetch } from "@/shared/api/auth-client";
import { FocusStage, POMODORO_PRESETS } from "./timerConstants";

export function useFocusTimerLogic(
  studentId: string,
  onSuccess: (drops: number) => void,
  onClose: () => void,
  playCompletionChime: () => void,
  stopAmbientSound: () => void
) {
  const [currentStage, setCurrentStage] = useState<FocusStage>("focus");
  const [completedCycles, setCompletedCycles] = useState<number>(0);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("classic");
  const [focusMinutes, setFocusMinutes] = useState<number>(25);
  const [shortBreakMinutes, setShortBreakMinutes] = useState<number>(5);
  const [longBreakMinutes, setLongBreakMinutes] = useState<number>(15);
  const [totalSeconds, setTotalSeconds] = useState<number>(25 * 60);
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [rewardClaimed, setRewardClaimed] = useState<boolean>(false);
  const [waterDropsEarned, setWaterDropsEarned] = useState<number>(0);
  const [confirmExit, setConfirmExit] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const toggleFullscreen = useCallback(async () => {
    if (typeof document === "undefined") return;
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
          setIsFullscreen(true);
        }
      } else if (document.exitFullscreen) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {}
  }, []);

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
    setIsCompleted(false);
    if (videoRef.current) videoRef.current.play().catch(() => {});
  };

  const handlePause = () => {
    setIsPaused(true);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const handleReset = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setSecondsLeft(totalSeconds);
    setIsRunning(false);
    setIsPaused(false);
    setIsCompleted(false);
  };

  const switchPomodoroStage = useCallback((nextStage: FocusStage) => {
    const duration = nextStage === "short_break" ? shortBreakMinutes : nextStage === "long_break" ? longBreakMinutes : focusMinutes;
    setCurrentStage(nextStage);
    setTotalSeconds(duration * 60);
    setSecondsLeft(duration * 60);
    setIsRunning(false);
    setIsPaused(false);
    setIsCompleted(false);
  }, [focusMinutes, shortBreakMinutes, longBreakMinutes]);

  const handleCycleFinished = useCallback(async () => {
    playCompletionChime();
    setIsRunning(false);
    setIsCompleted(true);
    if (currentStage === "focus") {
      setCompletedCycles((c) => c + 1);
      try {
        const res = await authFetch(`${API_BASE}/api/garden/${encodeURIComponent(studentId)}/pomodoro-reward`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ duration_minutes: focusMinutes })
        });
        if (res.ok) {
          const data = await res.json();
          const earned = data.water_drops_earned || (focusMinutes >= 25 ? 2 : 1);
          setWaterDropsEarned(earned);
          setRewardClaimed(true);
          onSuccess(earned);
        }
      } catch {}
    }
  }, [currentStage, studentId, focusMinutes, playCompletionChime, onSuccess]);

  useEffect(() => {
    if (isRunning && !isPaused) {
      timerIntervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current);
              timerIntervalRef.current = null;
            }
            handleCycleFinished();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [isRunning, isPaused, handleCycleFinished]);

  const handleApplyPreset = (presetId: string) => {
    const p = POMODORO_PRESETS.find((item) => item.id === presetId);
    if (!p || isRunning) return;
    setSelectedPresetId(presetId);
    setFocusMinutes(p.focus);
    setShortBreakMinutes(p.shortBreak);
    setLongBreakMinutes(p.longBreak);
    const newDuration = currentStage === "focus" ? p.focus : currentStage === "short_break" ? p.shortBreak : p.longBreak;
    setTotalSeconds(newDuration * 60);
    setSecondsLeft(newDuration * 60);
  };

  const handleSafeExit = async () => {
    stopAmbientSound();
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    try {
      if (document.fullscreenElement && document.exitFullscreen) await document.exitFullscreen();
    } catch {}
    setIsFullscreen(false);
    setIsRunning(false);
    setIsPaused(false);
    setConfirmExit(false);
    onClose();
  };

  return {
    currentStage, completedCycles, selectedPresetId,
    focusMinutes, setFocusMinutes,
    shortBreakMinutes, setShortBreakMinutes,
    longBreakMinutes, setLongBreakMinutes,
    totalSeconds, setTotalSeconds,
    secondsLeft, setSecondsLeft,
    isRunning, isPaused, isCompleted,
    isFullscreen, rewardClaimed, waterDropsEarned, confirmExit, setConfirmExit,
    containerRef, videoRef,
    toggleFullscreen, handleStart, handlePause, handleResume: () => setIsPaused(false),
    handleReset, switchPomodoroStage, handleApplyPreset, handleSafeExit
  };
}
