import { invoke } from "@tauri-apps/api/core";
import { Track } from "../../types/track";

export const tauriApi = {
  playFile: (path: string) => invoke<Track>("play_file", { path }),
  pause: () => invoke("pause"),
  resume: () => invoke("resume"),
  stop: () => invoke("stop"),
  getPosition: () => invoke<number>("get_position"),
  getDuration: () => invoke<number>("get_duration"),
  seek: (pos: number) => invoke("seek", { pos }),
  setVolume: (volume: number) => invoke("set_volume", { volume }),

  loadLibrary: () => invoke<Track[]>("load_library"),
  scanMusicFolder: (path: string) =>
    invoke<Track[]>("scan_music_folder", { path }),
};
