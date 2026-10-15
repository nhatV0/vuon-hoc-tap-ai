import React, { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { AmbientSoundType, getFocusVideos } from "./timerConstants";
import { useTimerAudio } from "./useTimerAudio";
import { useFocusTimerLogic } from "./useFocusTimerLogic";
import TimerTopBar from "./TimerTopBar";
import TimerSettingsDrawer from "./TimerSettingsDrawer";
import TimerCompletionCard from "./TimerCompletionCard";
import TimerSetupCard from "./TimerSetupCard";
import TimerConfirmExitModal from "./TimerConfirmExitModal";

export interface FocusTimerModalProps {
  studentId: string;
  species?: string;
  onSuccess: (drops: number) => void;
  onClose: () => void;
}

export default function FocusTimerModal({
  studentId,
  species = "sunflower",
  onSuccess,
  onClose
}: FocusTimerModalProps) {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [ambientSound, setAmbientSound] = useState<AmbientSoundType>("none");
  const [ambientVolume, setAmbientVolume] = useState<number>(0.5);
  const [selectedChime, setSelectedChime] = useState<"zen" | "chime">("zen");
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);

  const isLotus = species === "lotus";
  const focusVideos = getFocusVideos(isLotus);
  const [videoIndex, setVideoIndex] = useState<number>(0);
  const selectedVideo = focusVideos[videoIndex % focusVideos.length].path;
  const [currentStage, setCurrentStage] = useState<any>("focus");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const { playCompletionChime, stopAmbientSound } = useTimerAudio(
    soundEnabled,
    currentStage,
    selectedChime,
    ambientSound,
    ambientVolume,
    isRunning,
    isPaused
  );

  const timer = useFocusTimerLogic(studentId, onSuccess, onClose, playCompletionChime, stopAmbientSound);

  // Keep audio hook in sync with timer
  useEffect(() => {
    setCurrentStage(timer.currentStage);
    setIsRunning(timer.isRunning);
    setIsPaused(timer.isPaused);
  }, [timer.currentStage, timer.isRunning, timer.isPaused]);
  const mins = Math.floor(timer.secondsLeft / 60);
  const secs = timer.secondsLeft % 60;
  const timeFormatted = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  const progressPercent = timer.totalSeconds > 0
    ? Math.min(100, Math.max(0, ((timer.totalSeconds - timer.secondsLeft) / timer.totalSeconds) * 100))
    : 0;

  return (
    <div
      ref={timer.containerRef}
      className="fixed inset-0 z-[120] w-screen h-screen overflow-hidden bg-stone-950 flex flex-col justify-between select-none animate-in fade-in duration-300"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <video
          ref={timer.videoRef}
          src={selectedVideo}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover transition-opacity duration-1000 brightness-105 contrast-100"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/35 via-transparent to-stone-950/40" />
      </div>

      <TimerTopBar
        timeFormatted={timeFormatted}
        progressPercent={progressPercent}
        currentStage={timer.currentStage}
        isRunning={timer.isRunning}
        isPaused={timer.isPaused}
        isCompleted={timer.isCompleted}
        ambientSound={ambientSound}
        setAmbientSound={setAmbientSound}
        showSettingsDrawer={showSettingsDrawer}
        setShowSettingsDrawer={setShowSettingsDrawer}
        videoLabel={focusVideos[videoIndex % focusVideos.length].label}
        onNextVideo={() => setVideoIndex((prev) => (prev + 1) % focusVideos.length)}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        isFullscreen={timer.isFullscreen}
        onToggleFullscreen={timer.toggleFullscreen}
        onSwitchStage={timer.switchPomodoroStage}
        onResume={timer.handleResume}
        onPause={timer.handlePause}
        onReset={timer.handleReset}
        onExitClick={() => {
          if (timer.isRunning && !timer.isCompleted) timer.setConfirmExit(true);
          else timer.handleSafeExit();
        }}
      />

      <main className="relative z-10 flex-1 flex items-center justify-center px-4">
        {timer.isCompleted ? (
          <TimerCompletionCard
            currentStage={timer.currentStage}
            totalSeconds={timer.totalSeconds}
            completedCycles={timer.completedCycles}
            rewardClaimed={timer.rewardClaimed}
            waterDropsEarned={timer.waterDropsEarned}
            focusMinutes={timer.focusMinutes}
            shortBreakMinutes={timer.shortBreakMinutes}
            longBreakMinutes={timer.longBreakMinutes}
            onSwitchStage={timer.switchPomodoroStage}
            onExit={timer.handleSafeExit}
          />
        ) : !timer.isRunning && !timer.isPaused ? (
          <TimerSetupCard
            currentStage={timer.currentStage}
            completedCycles={timer.completedCycles}
            selectedPresetId={timer.selectedPresetId}
            focusMinutes={timer.focusMinutes}
            shortBreakMinutes={timer.shortBreakMinutes}
            longBreakMinutes={timer.longBreakMinutes}
            isLotus={isLotus}
            onApplyPreset={timer.handleApplyPreset}
            onStart={timer.handleStart}
          />
        ) : (
          <div className="flex flex-col items-center justify-center pointer-events-none">
            {timer.isPaused && (
              <div className="px-4 py-2 rounded-2xl bg-black/60 backdrop-blur-md border border-amber-400/40 text-amber-200 text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-xl">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Phiên Pomodoro đang tạm dừng (Nhấn &ldquo;Tiếp tục&rdquo; ở góc trên)</span>
              </div>
            )}
          </div>
        )}

        {showSettingsDrawer && (
          <TimerSettingsDrawer
            focusMinutes={timer.focusMinutes}
            setFocusMinutes={timer.setFocusMinutes}
            shortBreakMinutes={timer.shortBreakMinutes}
            setShortBreakMinutes={timer.setShortBreakMinutes}
            longBreakMinutes={timer.longBreakMinutes}
            setLongBreakMinutes={timer.setLongBreakMinutes}
            ambientVolume={ambientVolume}
            setAmbientVolume={setAmbientVolume}
            selectedChime={selectedChime}
            setSelectedChime={setSelectedChime}
            currentStage={timer.currentStage}
            setTotalSeconds={timer.setTotalSeconds}
            setSecondsLeft={timer.setSecondsLeft}
            onClose={() => setShowSettingsDrawer(false)}
          />
        )}
      </main>

      <footer className="relative z-10 w-full px-6 py-4 text-center">
        <p className="text-[11px] sm:text-xs text-white/60 italic drop-shadow-sm">
          &ldquo;
          {isLotus
            ? "Hoa sen vươn lên từ nước bùn tĩnh lặng, nở đóa hồng ngọc thanh tao giữa đời."
            : "Hoa hướng dương chỉ nở rộ khi kiên nhẫn đón nhận từng tia nắng ấm áp."}
          &rdquo;
        </p>
      </footer>

      {timer.confirmExit && (
        <TimerConfirmExitModal
          onCancel={() => timer.setConfirmExit(false)}
          onConfirm={timer.handleSafeExit}
        />
      )}
    </div>
  );
}
