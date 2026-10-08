"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  Flame,
  AlertTriangle,
  Coffee,
  Headphones,
  Droplets,
  SlidersHorizontal
} from "lucide-react";
import { PlannedTask, API_BASE } from "@/lib/types";

export type FocusStage = "focus" | "short_break" | "long_break";
export type AmbientSoundType = "none" | "zen_bell" | "rain" | "waves" | "wind";

export interface FocusTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId?: string;
  associatedTask?: PlannedTask | null;
  onTaskCompleted?: (task: PlannedTask) => void;
  onRewardClaimed?: (earned: number) => void;
}

// Cấu hình mặc định các chế độ Pomodoro
const POMODORO_PRESETS = [
  { id: "classic", name: "Pomodoro Chuẩn", focus: 25, shortBreak: 5, longBreak: 15, tag: "25m / 5m" },
  { id: "deep", name: "Chuyên Sâu (50/10)", focus: 50, shortBreak: 10, longBreak: 20, tag: "50m / 10m" },
  { id: "micro", name: "Vi Mô Nhanh (15/3)", focus: 15, shortBreak: 3, longBreak: 10, tag: "15m / 3m" },
  { id: "ultrafast", name: "Khởi Động 5 Phút", focus: 5, shortBreak: 2, longBreak: 5, tag: "5m / 2m" },
];

export default function FocusTimerModal({
  isOpen,
  onClose,
  studentId,
  associatedTask,
  onTaskCompleted,
  onRewardClaimed,
}: FocusTimerModalProps) {
  // Pomodoro Stage & Cycle count
  const [currentStage, setCurrentStage] = useState<FocusStage>("focus");
  const [completedCycles, setCompletedCycles] = useState<number>(0);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("classic");

  // Durations (in minutes)
  const [focusMinutes, setFocusMinutes] = useState<number>(25);
  const [shortBreakMinutes, setShortBreakMinutes] = useState<number>(5);
  const [longBreakMinutes, setLongBreakMinutes] = useState<number>(15);

  // Custom configuration modal / drawer
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);

  // Timer seconds left
  const [totalSeconds, setTotalSeconds] = useState<number>(25 * 60);
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);

  // Flow states
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [ambientSound, setAmbientSound] = useState<AmbientSoundType>("none");
  const [confirmExit, setConfirmExit] = useState<boolean>(false);

  // Reward state
  const [rewardClaimed, setRewardClaimed] = useState<boolean>(false);
  const [waterDropsEarned, setWaterDropsEarned] = useState<number>(0);

  // Background video options
  const FOCUS_VIDEOS = [
    { label: "Hoa Hướng Dương Nở", path: "/assets/flower/Sunflower/sunflower_bloom_motion.mp4" },
    { label: "Hoa Hướng Dương Kim Thái Dương", path: "/assets/flower/Sunflower/sunflower_aura_lvl6_gold.mp4" },
    { label: "Hoa Sen Tĩnh Tâm", path: "/assets/flower/lotus/lotus_bloom_motion.mp4" },
    { label: "Hoa Sen Hào Quang Lam Ngọc", path: "/assets/flower/lotus/lotus_aura_lvl2_blue.mp4" },
  ];
  const [videoIndex, setVideoIndex] = useState<number>(0);
  const selectedVideo = FOCUS_VIDEOS[videoIndex].path;

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const ambientAudioCtxRef = useRef<AudioContext | null>(null);
  const ambientNodesRef = useRef<{ source?: AudioNode; gain?: GainNode; cleanup?: () => void } | null>(null);
  // Audio completion chime synthesis via Web Audio API (gentle Tibetan singing bowl / zen bell)
  const playCompletionChime = useCallback(() => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Create warm harmonic bell chord (528Hz Solfeggio Love/Healing + harmonics)
      const freqs = [528, 792, 1056];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const startTime = ctx.currentTime + idx * 0.12;
        const duration = 2.4;

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.25 / (idx + 1), startTime + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch (e) {
      console.warn("Audio chime not supported or muted by browser policy:", e);
    }
  }, [soundEnabled]);

  // Ambient White Noise Synthesis (Rain, Waves, Wind, Zen Bell)
  const stopAmbientSound = useCallback(() => {
    if (ambientNodesRef.current?.cleanup) {
      ambientNodesRef.current.cleanup();
    }
    ambientNodesRef.current = null;
  }, []);

  const startAmbientSound = useCallback((type: AmbientSoundType) => {
    stopAmbientSound();
    if (type === "none" || typeof window === "undefined") return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!ambientAudioCtxRef.current || ambientAudioCtxRef.current.state === "closed") {
        ambientAudioCtxRef.current = new AudioCtx();
      }
      const ctx = ambientAudioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.12, ctx.currentTime);
      masterGain.connect(ctx.destination);

      if (type === "rain") {
        // Pink noise buffer for gentle rainfall
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
          b6 = white * 0.115926;
        }
        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        // Low-pass filter for cozy muffled rain
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1000, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(masterGain);
        whiteNoise.start();

        ambientNodesRef.current = {
          source: whiteNoise,
          gain: masterGain,
          cleanup: () => {
            try { whiteNoise.stop(); whiteNoise.disconnect(); } catch {}
          }
        };
      } else if (type === "waves") {
        // Ocean surf: filtered noise with periodic LFO gain
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * 0.15;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(500, ctx.currentTime);

        const waveGain = ctx.createGain();
        waveGain.gain.setValueAtTime(0.04, ctx.currentTime);

        // LFO for surf wave rhythm (~0.1Hz = 10s wave period)
        const lfo = ctx.createOscillator();
        lfo.type = "sine";
        lfo.frequency.setValueAtTime(0.1, ctx.currentTime);

        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(0.08, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(waveGain.gain);

        noise.connect(filter);
        filter.connect(waveGain);
        waveGain.connect(masterGain);

        noise.start();
        lfo.start();

        ambientNodesRef.current = {
          source: noise,
          gain: masterGain,
          cleanup: () => {
            try { noise.stop(); lfo.stop(); noise.disconnect(); lfo.disconnect(); } catch {}
          }
        };
      } else if (type === "wind") {
        // Gentle mountain breeze
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * 0.1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(320, ctx.currentTime);
        filter.Q.setValueAtTime(1.5, ctx.currentTime);

        noise.connect(filter);
        filter.connect(masterGain);
        noise.start();

        ambientNodesRef.current = {
          source: noise,
          gain: masterGain,
          cleanup: () => {
            try { noise.stop(); noise.disconnect(); } catch {}
          }
        };
      }
    } catch (err) {
      console.warn("Failed to generate ambient sound:", err);
    }
  }, [stopAmbientSound]);

  // Synchronize ambient sound state
  useEffect(() => {
    if (isRunning && !isPaused && soundEnabled) {
      startAmbientSound(ambientSound);
    } else {
      stopAmbientSound();
    }
    return () => {
      stopAmbientSound();
    };
  }, [isRunning, isPaused, soundEnabled, ambientSound, startAmbientSound, stopAmbientSound]);

  // Synchronize when associatedTask changes or modal opens
  useEffect(() => {
    if (isOpen) {
      const initialMinutes = associatedTask?.duration_minutes && associatedTask.duration_minutes > 0
        ? associatedTask.duration_minutes
        : 25;
      setFocusMinutes(initialMinutes);
      setTotalSeconds(initialMinutes * 60);
      setSecondsLeft(initialMinutes * 60);
      setCurrentStage("focus");
      setCompletedCycles(0);
      setIsRunning(false);
      setIsPaused(false);
      setIsCompleted(false);
      setConfirmExit(false);
      setShowSettingsDrawer(false);
      setRewardClaimed(false);
      setWaterDropsEarned(0);
    }
  }, [isOpen, associatedTask]);

  // Handle Fullscreen Toggle
  const toggleFullscreen = useCallback(async () => {
    if (typeof document === "undefined") return;
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
          setIsFullscreen(true);
        } else if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
          setIsFullscreen(true);
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    } catch (err) {
      console.warn("Fullscreen request error:", err);
    }
  }, []);

  // Listen for native escape / fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Start Focus Session
  const handleStart = async () => {
    setIsRunning(true);
    setIsPaused(false);
    setIsCompleted(false);

    try {
      if (!document.fullscreenElement && containerRef.current?.requestFullscreen) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch {}

    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  // Pause / Resume / Reset
  const handlePause = () => {
    setIsPaused(true);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const handleResume = () => {
    setIsPaused(false);
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

  // Chuyển giai đoạn Pomodoro (Focus -> Short Break -> Long Break)
  const switchPomodoroStage = useCallback((nextStage: FocusStage) => {
    let duration = focusMinutes;
    if (nextStage === "short_break") duration = shortBreakMinutes;
    if (nextStage === "long_break") duration = longBreakMinutes;

    setCurrentStage(nextStage);
    setTotalSeconds(duration * 60);
    setSecondsLeft(duration * 60);
    setIsRunning(false);
    setIsPaused(false);
    setIsCompleted(false);
  }, [focusMinutes, shortBreakMinutes, longBreakMinutes]);

  // Xử lý tự động khi kết thúc một chu kỳ Pomodoro
  const handleCycleFinished = useCallback(async () => {
    playCompletionChime();
    setIsRunning(false);
    setIsCompleted(true);

    if (currentStage === "focus") {
      const newCycleCount = completedCycles + 1;
      setCompletedCycles(newCycleCount);

      // Gọi API thưởng giọt nước nếu có studentId
      if (studentId) {
        try {
          const res = await fetch(`${API_BASE}/api/garden/${encodeURIComponent(studentId)}/pomodoro-reward`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              duration_minutes: focusMinutes,
              task_id: associatedTask?.id,
              task_title: associatedTask?.title
            })
          });
          if (res.ok) {
            const data = await res.json();
            setWaterDropsEarned(data.water_drops_earned || 1);
            setRewardClaimed(true);
            onRewardClaimed?.(data.water_drops_earned || 1);
          }
        } catch (err) {
          console.warn("Failed to claim pomodoro reward:", err);
        }
      }
    }
  }, [currentStage, completedCycles, studentId, focusMinutes, associatedTask, playCompletionChime, onRewardClaimed]);

  // Timer Tick
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

  // Lựa chọn preset
  const handleApplyPreset = (presetId: string) => {
    const p = POMODORO_PRESETS.find((item) => item.id === presetId);
    if (!p || isRunning) return;
    setSelectedPresetId(presetId);
    setFocusMinutes(p.focus);
    setShortBreakMinutes(p.shortBreak);
    setLongBreakMinutes(p.longBreak);

    const newDuration = currentStage === "focus"
      ? p.focus
      : currentStage === "short_break"
      ? p.shortBreak
      : p.longBreak;

    setTotalSeconds(newDuration * 60);
    setSecondsLeft(newDuration * 60);
  };

  // Thoát an toàn
  const handleSafeExit = async () => {
    stopAmbientSound();
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch {}
    setIsFullscreen(false);
    setIsRunning(false);
    setIsPaused(false);
    setConfirmExit(false);
    onClose();
  };

  if (!isOpen) return null;

  // Format MM:SS
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeFormatted = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

  // Progress percentage (100% -> 0% remaining, or 0% -> 100% elapsed)
  const progressPercent = totalSeconds > 0 ? Math.min(100, Math.max(0, ((totalSeconds - secondsLeft) / totalSeconds) * 100)) : 0;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[120] w-screen h-screen overflow-hidden bg-stone-950 flex flex-col justify-between select-none animate-in fade-in duration-300"
    >
      {/* 1. BACKGROUND MOTION VIDEO LOOP (Cánh đồng hoa / Hào quang ấm áp) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <video
          ref={videoRef}
          src={selectedVideo}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover transition-opacity duration-1000 brightness-105 contrast-100"
        />
        {/* Lớp phủ điện ảnh nhẹ dịu: giữ độ sáng rực rỡ tự nhiên cho hoa, tạo bóng mờ nhẹ để chữ luôn rõ nét */}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/35 via-transparent to-stone-950/40" />
      </div>

      {/* 2. TOP BAR: COUNTDOWN TIMER DISPLAY, GIAI ĐOẠN POMODORO & CÁC CÔNG CỤ TIỆN ÍCH */}
      <header className="relative z-10 w-full px-4 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
        {/* Góc trên bên trái: Bộ đếm ngược Liquid Glass sắc nét & Cụm điều khiển Tạm dừng / Reset */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <div className="group relative flex items-center gap-3 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-black/60 hover:bg-black/75 backdrop-blur-xl border border-white/20 text-white shadow-2xl transition-all">
            {/* Pulsing focus dot / indicator */}
            <div className="relative flex items-center justify-center">
              <span
                className={`w-3 h-3 rounded-full ${
                  isRunning && !isPaused
                    ? currentStage === "focus"
                      ? "bg-amber-400 animate-ping opacity-75"
                      : "bg-emerald-400 animate-ping opacity-75"
                    : isPaused
                    ? "bg-amber-500"
                    : isCompleted
                    ? "bg-emerald-400"
                    : "bg-white/40"
                }`}
              />
              <span
                className={`absolute w-2.5 h-2.5 rounded-full ${
                  isRunning && !isPaused
                    ? currentStage === "focus"
                      ? "bg-amber-400"
                      : "bg-emerald-400"
                    : isPaused
                    ? "bg-amber-500"
                    : isCompleted
                    ? "bg-emerald-400"
                    : "bg-white/70"
                }`}
              />
            </div>

            {/* Time display */}
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums drop-shadow-md text-amber-200">
                  {timeFormatted}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-amber-100/80">
                  {isCompleted
                    ? "Hoàn tất"
                    : isPaused
                    ? "Tạm dừng"
                    : isRunning
                    ? currentStage === "focus"
                      ? "Đang tập trung"
                      : currentStage === "short_break"
                      ? "Nghỉ giải lao"
                      : "Nghỉ dài phục hồi"
                    : currentStage === "focus"
                    ? "Sẵn sàng"
                    : "Giờ giải lao"}
                </span>
              </div>

              {/* Progress bar micro line */}
              <div className="w-full bg-white/20 h-1 rounded-full mt-1 overflow-hidden">
                <div
                  className={`h-full ${
                    currentStage === "focus"
                      ? "bg-gradient-to-r from-amber-400 to-yellow-300"
                      : "bg-gradient-to-r from-emerald-400 to-teal-300"
                  } transition-all duration-1000 ease-linear rounded-full`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* If task is attached */}
            {associatedTask && (
              <div className="hidden lg:flex flex-col border-l border-white/20 pl-3 max-w-[200px]">
                <span className="text-[9px] uppercase font-bold text-amber-300/80 tracking-wide">
                  Nhiệm vụ
                </span>
                <span className="text-xs font-medium text-white/90 truncate">
                  {associatedTask.title}
                </span>
              </div>
            )}
          </div>

          {/* Giai đoạn Pomodoro (Tabs switch) */}
          <div className="flex items-center p-1 rounded-2xl bg-black/50 backdrop-blur-xl border border-white/15 text-xs">
            <button
              type="button"
              onClick={() => switchPomodoroStage("focus")}
              className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 transition-all ${
                currentStage === "focus"
                  ? "bg-amber-400 text-stone-950 shadow-md font-extrabold"
                  : "text-stone-300 hover:text-white"
              }`}
            >
              <Flame className="w-3 h-3" />
              <span>Tập trung</span>
            </button>
            <button
              type="button"
              onClick={() => switchPomodoroStage("short_break")}
              className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 transition-all ${
                currentStage === "short_break"
                  ? "bg-emerald-400 text-stone-950 shadow-md font-extrabold"
                  : "text-stone-300 hover:text-white"
              }`}
            >
              <Coffee className="w-3 h-3" />
              <span>Nghỉ ngắn</span>
            </button>
            <button
              type="button"
              onClick={() => switchPomodoroStage("long_break")}
              className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 transition-all ${
                currentStage === "long_break"
                  ? "bg-teal-400 text-stone-950 shadow-md font-extrabold"
                  : "text-stone-300 hover:text-white"
              }`}
            >
              <Coffee className="w-3 h-3" />
              <span>Nghỉ dài</span>
            </button>
          </div>

          {/* Cụm nút Tạm dừng và Reset */}
          {(isRunning || isPaused) && !isCompleted && (
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/50 hover:bg-black/65 backdrop-blur-xl border border-white/20 text-white shadow-2xl transition-all">
              {isPaused ? (
                <button
                  type="button"
                  onClick={handleResume}
                  className="px-2.5 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold transition-all active:scale-95 flex items-center gap-1 text-xs shadow-md"
                  title="Tiếp tục đếm ngược"
                >
                  <Play className="w-3.5 h-3.5 fill-stone-950" />
                  <span>Tiếp tục</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePause}
                  className="px-2.5 py-1 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-all active:scale-95 flex items-center gap-1 text-xs shadow-md"
                  title="Tạm dừng đếm ngược"
                >
                  <Pause className="w-3.5 h-3.5 fill-white" />
                  <span>Tạm dừng</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleReset}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white border border-white/20 transition-all active:scale-95"
                title="Làm lại từ đầu"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Góc trên bên phải: Các nút tiện ích (Âm thanh nền White Noise, Đổi Cảnh, Fullscreen, Thoát) */}
        <div className="flex items-center gap-2">
          {/* Âm thanh nền sóng não White Noise */}
          <div className="flex items-center p-0.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/15 text-xs text-stone-300">
            <Headphones className="w-3.5 h-3.5 ml-2 mr-1 text-amber-300" />
            <select
              value={ambientSound}
              onChange={(e) => setAmbientSound(e.target.value as AmbientSoundType)}
              className="bg-transparent text-white text-[11px] font-semibold pr-2 py-1 outline-none cursor-pointer"
              title="Âm thanh nền tăng cường tập trung (White Noise)"
            >
              <option value="none" className="bg-stone-900 text-white">Yên lặng</option>
              <option value="rain" className="bg-stone-900 text-white">Mưa rào êm</option>
              <option value="waves" className="bg-stone-900 text-white">Sóng biển dịu</option>
              <option value="wind" className="bg-stone-900 text-white">Gió đồi hoa</option>
            </select>
          </div>

          {/* Nút cài đặt tùy chỉnh Pomodoro */}
          <button
            type="button"
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            className={`p-2 rounded-xl backdrop-blur-md border text-xs font-medium flex items-center gap-1 transition-all shadow-lg ${
              showSettingsDrawer
                ? "bg-amber-400 text-stone-950 border-amber-300 shadow-amber-400/20"
                : "bg-black/40 hover:bg-black/60 border-white/15 text-white/80 hover:text-white"
            }`}
            title="Tùy chỉnh thời lượng Pomodoro"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Chu kỳ</span>
          </button>

          {/* Nút chuyển nền video */}
          <button
            type="button"
            onClick={() => {
              setVideoIndex((prev) => (prev + 1) % FOCUS_VIDEOS.length);
            }}
            className="p-2 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/15 text-white/80 hover:text-white text-xs font-medium flex items-center gap-1 transition-all shadow-lg"
            title={`Đổi cảnh hoa (Hiện tại: ${FOCUS_VIDEOS[videoIndex].label})`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden md:inline">{FOCUS_VIDEOS[videoIndex].label}</span>
          </button>

          {/* Âm thanh chuông thông báo */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/15 text-white/80 hover:text-white transition-all shadow-lg"
            title={soundEnabled ? "Tắt chuông thiền khi hết giờ" : "Bật chuông thiền khi hết giờ"}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-amber-300" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-stone-400" />
            )}
          </button>

          {/* Fullscreen toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/15 text-white/80 hover:text-white transition-all shadow-lg"
            title={isFullscreen ? "Thu nhỏ cửa sổ" : "Mở rộng toàn màn hình"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5 text-amber-200" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 text-amber-200" />
            )}
          </button>

          {/* Nút Hủy / Thoát an toàn */}
          <button
            type="button"
            onClick={() => {
              if (isRunning && !isCompleted) {
                setConfirmExit(true);
              } else {
                handleSafeExit();
              }
            }}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 text-red-200 hover:text-white backdrop-blur-md text-xs font-bold flex items-center gap-1 transition-all shadow-lg group active:scale-95"
            title="Dừng và thoát chế độ tập trung"
          >
            <X className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-200" />
            <span className="hidden sm:inline">Thoát</span>
          </button>
        </div>
      </header>
      {/* 3. CENTER STAGE: BẢNG ĐIỀU KHIỂN & TRẢI NGHIỆM TẬP TRUNG */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4">
        {/* TRƯỜNG HỢP A: KHI ĐÃ HOÀN TẤT THỜI GIAN ĐẾM NGƯỢC */}
        {isCompleted ? (
          <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-black/65 backdrop-blur-2xl border border-amber-300/30 text-center text-white shadow-2xl animate-in zoom-in-95 duration-400 space-y-4">
            <div className={`w-16 h-16 rounded-full ${
              currentStage === "focus"
                ? "bg-gradient-to-tr from-amber-400 to-yellow-300 text-stone-950"
                : "bg-gradient-to-tr from-emerald-400 to-teal-300 text-stone-950"
            } flex items-center justify-center mx-auto shadow-lg animate-bounce`}>
              {currentStage === "focus" ? (
                <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
              ) : (
                <Coffee className="w-9 h-9 stroke-[2.5]" />
              )}
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-amber-200">
                {currentStage === "focus"
                  ? "Xuất sắc! Hoàn thành phiên tập trung"
                  : "Hết giờ nghỉ! Bạn đã nạp đầy năng lượng"}
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                {currentStage === "focus"
                  ? `Bạn đã duy trì sự tập trung trọn vẹn trong ${Math.round(totalSeconds / 60)} phút vừa qua.`
                  : "Cơ thể và tâm trí đã sẵn sàng để bắt đầu chu kỳ tập trung tiếp theo!"}
              </p>
            </div>

            {/* Thưởng Giọt Nước khi hoàn thành phiên tập trung */}
            {currentStage === "focus" && (
              <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-between text-left">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shrink-0">
                    <Droplets className="w-5 h-5 fill-sky-400" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-300 block">
                      Phần Thưởng Chăm Chỉ
                    </span>
                    <span className="text-xs font-semibold text-white">
                      {rewardClaimed
                        ? `Đã nhận +${waterDropsEarned} giọt nước tưới cây!`
                        : `Hoàn tất chu kỳ Pomodoro thứ ${completedCycles}`}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-sky-400 text-stone-950">
                  +{waterDropsEarned || (focusMinutes >= 25 ? 2 : 1)} Giọt
                </span>
              </div>
            )}

            {associatedTask && (
              <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 text-left flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                  <Flame className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-amber-300/80 font-bold uppercase">Nhiệm vụ vi mô</p>
                  <p className="text-xs font-semibold text-white truncate">{associatedTask.title}</p>
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
              {/* Nút chuyển chu kỳ kế tiếp */}
              {currentStage === "focus" ? (
                <button
                  type="button"
                  onClick={() => {
                    const nextStage = completedCycles % 4 === 0 ? "long_break" : "short_break";
                    switchPomodoroStage(nextStage);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-stone-950 font-extrabold text-xs sm:text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Coffee className="w-4 h-4" />
                  <span>
                    {completedCycles % 4 === 0
                      ? `Nghỉ dài phục hồi (${longBreakMinutes}m)`
                      : `Nghỉ ngắn thư giãn (${shortBreakMinutes}m)`}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => switchPomodoroStage("focus")}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-extrabold text-xs sm:text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Flame className="w-4 h-4" />
                  <span>Bắt đầu tập trung mới ({focusMinutes}m)</span>
                </button>
              )}

              {associatedTask && onTaskCompleted && currentStage === "focus" && (
                <button
                  type="button"
                  onClick={() => {
                    onTaskCompleted(associatedTask);
                    handleSafeExit();
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs sm:text-sm font-semibold active:scale-95 transition-all"
                >
                  Đánh dấu xong nhiệm vụ
                </button>
              )}

              <button
                type="button"
                onClick={handleSafeExit}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white text-xs sm:text-sm active:scale-95 transition-all"
              >
                Trở về khu vườn
              </button>
            </div>
          </div>
        ) : !isRunning && !isPaused ? (
          /* TRƯỜNG HỢP B: CHUẨN BỊ BẮT ĐẦU (CHỌN CHẾ ĐỘ POMODORO & CÀI ĐẶT) */
          <div className="max-w-lg w-full p-6 sm:p-8 rounded-3xl bg-black/65 backdrop-blur-2xl border border-white/20 text-white shadow-2xl space-y-5 animate-in zoom-in-95 duration-300">
            {/* Header info */}
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Không Gian Tập Trung Sâu Pomodoro</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {associatedTask ? associatedTask.title : "Hẹn Giờ Tập Trung"}
              </h2>
              <p className="text-xs text-stone-300 max-w-sm mx-auto leading-relaxed">
                {currentStage === "focus"
                  ? "Hòa mình cùng cánh đồng hoa và chu kỳ Pomodoro để học sâu không xao nhãng."
                  : "Thư giãn đôi mắt và hít thở nhẹ nhàng để chuẩn bị cho chu kỳ học tiếp theo."}
              </p>
            </div>

            {/* Preset selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-amber-200/80">
                <span>Chọn chu kỳ tập trung:</span>
                <span>{completedCycles > 0 ? `Đã xong: ${completedCycles} chu kỳ` : "Chưa bắt đầu"}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {POMODORO_PRESETS.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyPreset(preset.id)}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${
                        isSelected
                          ? "bg-gradient-to-b from-amber-400/30 to-amber-500/20 border-amber-400 text-white shadow-lg shadow-amber-400/10 ring-2 ring-amber-400/30"
                          : "bg-white/5 hover:bg-white/10 border-white/15 text-stone-300 hover:text-white"
                      }`}
                    >
                      <span className="text-xs font-extrabold">{preset.name}</span>
                      <span className="text-[10px] text-amber-200/70">{preset.tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tóm tắt chu kỳ & Thưởng */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span className="text-stone-300">
                  Tập trung <strong>{focusMinutes}m</strong> → Nghỉ <strong>{shortBreakMinutes}m</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sky-300 font-bold">
                <Droplets className="w-3.5 h-3.5 fill-sky-300" />
                <span>Thưởng +{focusMinutes >= 25 ? 2 : 1} giọt nước</span>
              </div>
            </div>

            {/* Nút Khởi động to rõ */}
            <button
              type="button"
              onClick={handleStart}
              className={`w-full py-3.5 px-6 rounded-2xl ${
                currentStage === "focus"
                  ? "bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-stone-950"
                  : "bg-gradient-to-r from-emerald-400 to-teal-400 text-stone-950"
              } font-black text-sm sm:text-base shadow-xl shadow-amber-500/25 active:scale-98 transition-all flex items-center justify-center gap-2.5`}
            >
              <Play className="w-5 h-5 fill-stone-950" />
              <span>
                {currentStage === "focus"
                  ? `BẮT ĐẦU TẬP TRUNG (${focusMinutes} PHÚT)`
                  : `BẮT ĐẦU NGHỈ NGƠI (${currentStage === "short_break" ? shortBreakMinutes : longBreakMinutes} PHÚT)`}
              </span>
            </button>
          </div>
        ) : (
          /* TRƯỜNG HỢP C: ĐANG CHẠY HOẶC TẠM DỪNG (Toàn màn hình thông thoáng) */
          <div className="flex flex-col items-center justify-center pointer-events-none">
            {isPaused && (
              <div className="px-4 py-2 rounded-2xl bg-black/60 backdrop-blur-md border border-amber-400/40 text-amber-200 text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-xl">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Phiên Pomodoro đang tạm dừng (Nhấn &ldquo;Tiếp tục&rdquo; ở góc trên)</span>
              </div>
            )}
          </div>
        )}

        {/* DRAWER / MODAL CÀI ĐẶT THỜI GIAN TÙY BIẾN POMODORO */}
        {showSettingsDrawer && (
          <div className="absolute inset-0 z-40 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
            <div className="max-w-sm w-full p-6 rounded-3xl bg-stone-900 border border-stone-700 text-white space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Tùy chỉnh thời lượng Pomodoro</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSettingsDrawer(false)}
                  className="w-7 h-7 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-stone-300 mb-1 font-semibold">Thời gian tập trung (phút):</label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={focusMinutes}
                    onChange={(e) => {
                      const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                      setFocusMinutes(val);
                      if (currentStage === "focus") {
                        setTotalSeconds(val * 60);
                        setSecondsLeft(val * 60);
                      }
                    }}
                    className="w-full p-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 mb-1 font-semibold">Thời gian nghỉ ngắn (phút):</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={shortBreakMinutes}
                    onChange={(e) => {
                      const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                      setShortBreakMinutes(val);
                      if (currentStage === "short_break") {
                        setTotalSeconds(val * 60);
                        setSecondsLeft(val * 60);
                      }
                    }}
                    className="w-full p-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 mb-1 font-semibold">Thời gian nghỉ dài sau 4 chu kỳ (phút):</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={longBreakMinutes}
                    onChange={(e) => {
                      const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                      setLongBreakMinutes(val);
                      if (currentStage === "long_break") {
                        setTotalSeconds(val * 60);
                        setSecondsLeft(val * 60);
                      }
                    }}
                    className="w-full p-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white font-bold"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowSettingsDrawer(false)}
                className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs shadow-md transition-all"
              >
                Lưu cài đặt
              </button>
            </div>
          </div>
        )}
      </main>
      {/* 4. FOOTER QUOTE / THÔNG ĐIỆP BÌNH YÊN */}
      <footer className="relative z-10 w-full px-6 py-4 text-center">
        <p className="text-[11px] sm:text-xs text-white/60 italic drop-shadow-sm">
          &ldquo;Hoa hướng dương chỉ nở rộ khi kiên nhẫn đón nhận từng tia nắng ấm áp.&rdquo;
        </p>
      </footer>

      {/* MODAL XÁC NHẬN HỦY / THOÁT NẾU ĐANG CHẠY */}
      {confirmExit && (
        <div className="absolute inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="max-w-sm w-full p-6 rounded-3xl bg-stone-900 border border-stone-700 text-white space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">Dừng phiên tập trung?</h3>
              <p className="text-xs text-stone-300">
                Thời gian đếm ngược sẽ bị hủy và tiến độ chưa được lưu. Bạn có chắc chắn muốn thoát?
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setConfirmExit(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors"
              >
                Tiếp tục tập trung
              </button>
              <button
                type="button"
                onClick={handleSafeExit}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-lg"
              >
                Xác nhận thoát
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
