export type FocusStage = "focus" | "short_break" | "long_break";
export type AmbientSoundType = "none" | "rain" | "waves" | "wind" | "stream" | "fire";

export const AUDIO_PATHS = {
  chimes: {
    zen: "/assets/audio/timer/bell_zen.mp3",
    chime: "/assets/audio/timer/bell_chime.mp3",
    break: "/assets/audio/timer/bell_break.mp3",
  },
  ambient: {
    rain: "/assets/audio/timer/ambient_rain.mp3",
    waves: "/assets/audio/timer/ambient_waves.mp3",
    wind: "/assets/audio/timer/ambient_wind.mp3",
    stream: "/assets/audio/timer/ambient_stream.mp3",
    fire: "/assets/audio/timer/ambient_fire.mp3",
  }
};

export const POMODORO_PRESETS = [
  { id: "classic", name: "Pomodoro Chuẩn", focus: 25, shortBreak: 5, longBreak: 15, tag: "25m / 5m" },
  { id: "deep", name: "Chuyên Sâu (50/10)", focus: 50, shortBreak: 10, longBreak: 20, tag: "50m / 10m" },
  { id: "micro", name: "Vi Mô Nhanh (15/3)", focus: 15, shortBreak: 3, longBreak: 10, tag: "15m / 3m" },
  { id: "ultrafast", name: "Khởi Động 5 Phút", focus: 5, shortBreak: 2, longBreak: 5, tag: "5m / 2m" },
];

export function getFocusVideos(isLotus: boolean) {
  return isLotus
    ? [
        { label: "Hoa Sen Nở Rộ", path: "/assets/flower/lotus/lotus_bloom_motion.mp4" },
        { label: "Hoa Sen Lam Ngọc Trí Tuệ", path: "/assets/flower/lotus/lotus_aura_lvl2_blue.mp4" },
        { label: "Hoa Sen Bạch Ngọc Tĩnh Lặng", path: "/assets/flower/lotus/lotus_aura_lvl1_white.mp4" },
        { label: "Hoa Sen Kim Thái Dương", path: "/assets/flower/lotus/lotus_aura_lvl6_gold.mp4" },
      ]
    : [
        { label: "Hoa Hướng Dương Nở Rộ", path: "/assets/flower/Sunflower/sunflower_bloom_motion.mp4" },
        { label: "Hoa Hướng Dương Kim Thái Dương", path: "/assets/flower/Sunflower/sunflower_aura_lvl6_gold.mp4" },
        { label: "Hoa Hướng Dương Bạch Ngọc", path: "/assets/flower/Sunflower/sunflower_aura_lvl1_white.mp4" },
        { label: "Hoa Hướng Dương Cực Quang", path: "/assets/flower/Sunflower/sunflower_aura_lvl7_rainbow.mp4" },
      ];
}
