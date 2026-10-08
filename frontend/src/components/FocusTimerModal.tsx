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
  Clock,
  AlertTriangle
} from "lucide-react";
import { PlannedTask } from "@/lib/types";

export interface FocusTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  associatedTask?: PlannedTask | null;
  onTaskCompleted?: (task: PlannedTask) => void;
}

// Quick presets in minutes
const PRESET_DURATIONS = [
  { label: "5 phút", minutes: 5, tag: "Vi mô nhanh" },
  { label: "10 phút", minutes: 10, tag: "Tiêu chuẩn" },
  { label: "15 phút", minutes: 15, tag: "Chuyên sâu" },
  { label: "25 phút", minutes: 25, tag: "Pomodoro" },
];

export default function FocusTimerModal({
  isOpen,
  onClose,
  associatedTask,
  onTaskCompleted,
}: FocusTimerModalProps) {
  // Duration state in seconds
  const defaultMinutes = associatedTask?.duration_minutes && associatedTask.duration_minutes > 0
    ? associatedTask.duration_minutes
    : 5;

  const [totalSeconds, setTotalSeconds] = useState<number>(defaultMinutes * 60);
  const [secondsLeft, setSecondsLeft] = useState<number>(defaultMinutes * 60);
  const [customInputMinutes, setCustomInputMinutes] = useState<string>("");
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);

  // Flow states
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [confirmExit, setConfirmExit] = useState<boolean>(false);

  // Danh sách video nền tập trung (Sunflower & Lotus)
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

  // Synchronize when associatedTask changes or modal opens
  useEffect(() => {
    if (isOpen) {
      const minutes = associatedTask?.duration_minutes && associatedTask.duration_minutes > 0
        ? associatedTask.duration_minutes
        : 5;
      const initialSeconds = minutes * 60;
      setTotalSeconds(initialSeconds);
      setSecondsLeft(initialSeconds);
      setIsRunning(false);
      setIsPaused(false);
      setIsCompleted(false);
      setConfirmExit(false);
      setShowCustomInput(false);
    }
  }, [isOpen, associatedTask]);

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

    // Auto-request fullscreen for deep immersion
    try {
      if (!document.fullscreenElement && containerRef.current?.requestFullscreen) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch {
      // Graceful fallback if blocked by browser security
    }

    // Ensure video is playing
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  // Pause Focus Session
  const handlePause = () => {
    setIsPaused(true);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  // Resume Focus Session
  const handleResume = () => {
    setIsPaused(false);
  };

  // Reset Session
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

  // Select preset duration
  const handleSelectPreset = (minutes: number) => {
    if (isRunning) return;
    const s = minutes * 60;
    setTotalSeconds(s);
    setSecondsLeft(s);
    setShowCustomInput(false);
  };

  // Apply custom minutes
  const handleApplyCustomMinutes = () => {
    const parsed = parseInt(customInputMinutes, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 180) {
      const s = parsed * 60;
      setTotalSeconds(s);
      setSecondsLeft(s);
      setShowCustomInput(false);
      setCustomInputMinutes("");
    }
  };

  // Exit & clean up
  const handleSafeExit = async () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch {
      // Ignored
    }
    setIsFullscreen(false);
    setIsRunning(false);
    setIsPaused(false);
    setConfirmExit(false);
    onClose();
  };

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
            setIsRunning(false);
            setIsCompleted(true);
            playCompletionChime();
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
  }, [isRunning, isPaused, playCompletionChime]);

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

      {/* 2. TOP BAR: COUNTDOWN TIMER DISPLAY (GÓC TRÊN) & CONTROLS */}
      <header className="relative z-10 w-full px-4 sm:px-8 py-5 flex items-start justify-between">
        {/* Góc trên bên trái: Bộ đếm ngược Liquid Glass sắc nét */}
        {/* Góc trên bên trái: Bộ đếm ngược Liquid Glass sắc nét & Cụm điều khiển Tạm dừng / Reset */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <div className="group relative flex items-center gap-3.5 px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl bg-black/50 hover:bg-black/65 backdrop-blur-xl border border-white/20 text-white shadow-2xl transition-all">
            {/* Pulsing focus dot / indicator */}
            <div className="relative flex items-center justify-center">
              <span
                className={`w-3 h-3 rounded-full ${
                  isRunning && !isPaused
                    ? "bg-amber-400 animate-ping opacity-75"
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
                    ? "bg-amber-400"
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
                <span className="font-mono text-2xl sm:text-4xl font-extrabold tracking-tight tabular-nums drop-shadow-md text-amber-200">
                  {timeFormatted}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-amber-100/70">
                  {isCompleted
                    ? "Hoàn tất"
                    : isPaused
                    ? "Đang tạm dừng"
                    : isRunning
                    ? "Đang tập trung"
                    : "Sẵn sàng"}
                </span>
              </div>

              {/* Progress bar micro line */}
              <div className="w-full bg-white/20 h-1 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* If task is attached */}
            {associatedTask && (
              <div className="hidden md:flex flex-col border-l border-white/20 pl-3.5 max-w-[260px]">
                <span className="text-[10px] uppercase font-bold text-amber-300/80 tracking-wide">
                  Nhiệm vụ vi mô
                </span>
                <span className="text-xs font-medium text-white/90 truncate">
                  {associatedTask.title}
                </span>
              </div>
            )}
          </div>

          {/* Cụm nút Tạm dừng và Reset đặt ngay trên góc cạnh thời gian */}
          {(isRunning || isPaused) && !isCompleted && (
            <div className="flex items-center gap-1.5 p-1 sm:p-1.5 rounded-2xl bg-black/50 hover:bg-black/65 backdrop-blur-xl border border-white/20 text-white shadow-2xl transition-all animate-in fade-in zoom-in-95">
              {isPaused ? (
                <button
                  type="button"
                  onClick={handleResume}
                  className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold transition-all active:scale-95 flex items-center gap-1.5 text-xs shadow-md"
                  title="Tiếp tục đếm ngược"
                >
                  <Play className="w-3.5 h-3.5 fill-stone-950" />
                  <span>Tiếp tục</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePause}
                  className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-all active:scale-95 flex items-center gap-1.5 text-xs shadow-md"
                  title="Tạm dừng đếm ngược"
                >
                  <Pause className="w-3.5 h-3.5 fill-white" />
                  <span>Tạm dừng</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleReset}
                className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white border border-white/20 transition-all active:scale-95"
                title="Làm lại từ đầu"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Góc trên bên phải: Các nút tiện ích (Âm thanh, Fullscreen, Video switch, Nút Hủy / Thoát) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Nút chuyển nền video */}
          <button
            type="button"
            onClick={() => {
              setVideoIndex((prev) => (prev + 1) % FOCUS_VIDEOS.length);
            }}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/15 text-white/80 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-lg"
            title={`Đổi cảnh hoa (Hiện tại: ${FOCUS_VIDEOS[videoIndex].label})`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">{FOCUS_VIDEOS[videoIndex].label}</span>
          </button>

          {/* Âm thanh thông báo */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 sm:p-2.5 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/15 text-white/80 hover:text-white transition-all shadow-lg"
            title={soundEnabled ? "Tắt chuông thiền khi hết giờ" : "Bật chuông thiền khi hết giờ"}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-300" />
            ) : (
              <VolumeX className="w-4 h-4 text-stone-400" />
            )}
          </button>

          {/* Fullscreen toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 sm:p-2.5 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/15 text-white/80 hover:text-white transition-all shadow-lg"
            title={isFullscreen ? "Thu nhỏ cửa sổ" : "Mở rộng toàn màn hình"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-amber-200" />
            ) : (
              <Maximize2 className="w-4 h-4 text-amber-200" />
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
            className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 text-red-200 hover:text-white backdrop-blur-md text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg group active:scale-95"
            title="Dừng và thoát chế độ tập trung"
          >
            <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
            <span className="hidden sm:inline">Thoát</span>
          </button>
        </div>
      </header>

      {/* 3. CENTER STAGE: BẢNG ĐIỀU KHIỂN & TRẢI NGHIỆM TẬP TRUNG */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4">
        {/* TRƯỜNG HỢP A: KHI ĐÃ HOÀN TẤT THỜI GIAN ĐẾM NGƯỢC */}
        {isCompleted ? (
          <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-black/60 backdrop-blur-2xl border border-amber-300/30 text-center text-white shadow-2xl animate-in zoom-in-95 duration-400 space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-stone-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-400/30 animate-bounce">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-amber-200">
                Xuất sắc! Phiên tập trung hoàn tất
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Bạn đã duy trì sự tập trung trọn vẹn trong {Math.round(totalSeconds / 60)} phút vừa qua.
                Bông hoa hướng dương đã hấp thụ đủ năng lượng hôm nay!
              </p>
            </div>

            {associatedTask && (
              <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 text-left flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                  <Flame className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-amber-300/80 font-bold uppercase">Hoàn thành nhiệm vụ</p>
                  <p className="text-xs font-semibold text-white truncate">{associatedTask.title}</p>
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              {associatedTask && onTaskCompleted && (
                <button
                  type="button"
                  onClick={() => {
                    onTaskCompleted(associatedTask);
                    handleSafeExit();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-stone-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  <span>Xác nhận hoàn thành & Trở về</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleSafeExit}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl ${
                  associatedTask && onTaskCompleted
                    ? "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                    : "bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold"
                } text-xs sm:text-sm active:scale-95 transition-all`}
              >
                Trở về khu vườn
              </button>
            </div>
          </div>
        ) : !isRunning && !isPaused ? (
          /* TRƯỜNG HỢP B: CHUẨN BỊ BẮT ĐẦU (CHỌN THỜI LƯỢNG & NHIỆM VỤ) */
          <div className="max-w-lg w-full p-6 sm:p-8 rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/20 text-white shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
            {/* Header info */}
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Không Gian Tập Trung Sâu</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {associatedTask ? associatedTask.title : "Hẹn Giờ Tập Trung"}
              </h2>
              <p className="text-xs text-stone-300 max-w-sm mx-auto leading-relaxed">
                Tạm gác lại mọi xao nhãng. Hòa mình cùng cánh đồng hoa hướng dương và hoàn thành mục tiêu học tập.
              </p>
            </div>

            {/* Duration presets */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-amber-200/80">
                Chọn thời lượng phiên:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {PRESET_DURATIONS.map((preset) => {
                  const isSelected = totalSeconds === preset.minutes * 60 && !showCustomInput;
                  return (
                    <button
                      key={preset.minutes}
                      type="button"
                      onClick={() => handleSelectPreset(preset.minutes)}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                        isSelected
                          ? "bg-gradient-to-b from-amber-400/30 to-amber-500/20 border-amber-400 text-white shadow-lg shadow-amber-400/10 ring-2 ring-amber-400/30"
                          : "bg-white/5 hover:bg-white/10 border-white/15 text-stone-300 hover:text-white"
                      }`}
                    >
                      <span className="text-sm font-extrabold">{preset.label}</span>
                      <span className="text-[10px] text-amber-200/70">{preset.tag}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tùy chỉnh phút */}
              <div className="pt-1.5 flex items-center justify-between text-xs">
                {!showCustomInput ? (
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(true)}
                    className="text-[11px] text-amber-300 hover:text-amber-200 font-semibold underline underline-offset-4 flex items-center gap-1"
                  >
                    <Clock className="w-3 h-3" />
                    <span>Nhập số phút tùy chỉnh...</span>
                  </button>
                ) : (
                  <div className="w-full flex items-center gap-2 animate-in fade-in">
                    <input
                      type="number"
                      min="1"
                      max="180"
                      placeholder="Số phút (VD: 20)"
                      value={customInputMinutes}
                      onChange={(e) => setCustomInputMinutes(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleApplyCustomMinutes();
                      }}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-stone-400 text-xs focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCustomMinutes}
                      className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs"
                    >
                      Áp dụng
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCustomInput(false)}
                      className="px-2 py-1.5 text-stone-400 hover:text-white text-xs"
                    >
                      Hủy
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Nút Khởi động to rõ */}
            <button
              type="button"
              onClick={handleStart}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-black text-sm sm:text-base shadow-xl shadow-amber-500/25 active:scale-98 transition-all flex items-center justify-center gap-2.5"
            >
              <Play className="w-5 h-5 fill-stone-950" />
              <span>BẮT ĐẦU TẬP TRUNG TOÀN MÀN HÌNH</span>
            </button>
          </div>
        ) : (
          /* TRƯỜNG HỢP C: ĐANG CHẠY HOẶC TẠM DỪNG (Toàn bộ hoa hướng dương thoáng đãng, không bị nút che) */
          <div className="flex flex-col items-center justify-center pointer-events-none">
            {/* Nếu đang tạm dừng, hiển thị thông báo nhẹ dịu */}
            {isPaused && (
              <div className="px-4 py-2 rounded-2xl bg-black/60 backdrop-blur-md border border-amber-400/40 text-amber-200 text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-xl">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Phiên tập trung đang tạm dừng (Nhấn &ldquo;Tiếp tục&rdquo; ở góc trên)</span>
              </div>
            )}
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
