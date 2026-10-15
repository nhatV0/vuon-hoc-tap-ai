import { useEffect, useRef, useCallback } from "react";
import { AUDIO_PATHS, AmbientSoundType, FocusStage } from "./timerConstants";

export function useTimerAudio(
  soundEnabled: boolean,
  currentStage: FocusStage,
  selectedChime: "zen" | "chime",
  ambientSound: AmbientSoundType,
  ambientVolume: number,
  isRunning: boolean,
  isPaused: boolean
) {
  const ambientAudioElementRef = useRef<HTMLAudioElement | null>(null);

  const playCompletionChime = useCallback(() => {
    if (!soundEnabled || typeof window === "undefined") return;
    const chimeFile = currentStage === "focus"
      ? (selectedChime === "zen" ? AUDIO_PATHS.chimes.zen : AUDIO_PATHS.chimes.chime)
      : AUDIO_PATHS.chimes.break;
    const audio = new Audio(chimeFile);
    audio.volume = 0.85;
    audio.play().catch(() => {});
  }, [soundEnabled, currentStage, selectedChime]);

  const stopAmbientSound = useCallback(() => {
    if (ambientAudioElementRef.current) {
      ambientAudioElementRef.current.pause();
      ambientAudioElementRef.current.currentTime = 0;
      ambientAudioElementRef.current = null;
    }
  }, []);

  const startAmbientSound = useCallback((type: AmbientSoundType) => {
    stopAmbientSound();
    if (type === "none" || typeof window === "undefined") return;
    const filePath = AUDIO_PATHS.ambient[type as keyof typeof AUDIO_PATHS.ambient];
    if (filePath) {
      const audio = new Audio(filePath);
      audio.loop = true;
      audio.volume = ambientVolume;
      audio.play().then(() => {
        ambientAudioElementRef.current = audio;
      }).catch(() => {});
    }
  }, [stopAmbientSound, ambientVolume]);

  useEffect(() => {
    if (ambientAudioElementRef.current) {
      ambientAudioElementRef.current.volume = ambientVolume;
    }
  }, [ambientVolume]);

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

  return { playCompletionChime, stopAmbientSound, startAmbientSound };
}
